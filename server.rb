require "sinatra"
require "rss"
require "open-uri"
require "json"
require 'net/http'
require 'digest/hmac'
require 'time'

get "/" do
    erb :index
end

get "/events" do
  content_type :json
  filename = File.join("data", "filtered_events.json")
  File.open(filename) do |file| return file.read end
end

get "/datas" do
  content_type :json
  files = %w(air_quality rainfall water_storage)
  data = {}
  files.each do |name|
    value = JSON.parse(File.open(File.join(File.dirname(__FILE__), "data", "#{name}.json")).read)["value"]
    data[name] = value
  end
  data.to_json
end

get "/trains/:direction/:station" do
  content_type :json
  dev_id = "1000004"
  key = "f4a6c8c4-a8da-11e3-8bed-0263a9d0b8a0"

  base = "http://timetableapi.ptv.vic.gov.au"


  def signature(message, key="f4a6c8c4-a8da-11e3-8bed-0263a9d0b8a0")
    Digest::HMAC.hexdigest(message, key, Digest::SHA1).upcase
  end

  def ptv_request(base, message)
    uri = URI(base + message + "&signature=#{signature(message)}")

    #puts uri
    http = Net::HTTP.new(uri.host, uri.port)
    http.read_timeout = 500
    res = http.get(message + "&signature=#{signature(message)}")
    #puts res.body
    #puts res.code
    JSON.parse(res.body)
  end

  def broad_next_train_departures(dev_id, key, base, stop_id, limit)
    mode = "0"
    stop = stop_id

    ptv_request(base, "/v2/mode/#{mode}/stop/#{stop}/departures/by-destination/limit/#{limit}?devid=#{dev_id}")
  end

  def search_stopname(dev_id, key, base, name)
    name = URI.escape(name)
    stops = ptv_request(base, "/v2/search/#{name}?devid=#{dev_id}")
    return "oh nooooes" if stops.length == 0 # like, do some programming on this plz
    actual_stops = stops.select do |stop|
      stop["type"] == "stop" and stop["result"]["transport_type"] == "train"
    end

    return "oh nooooes" if actual_stops.length == 0 # like, do some programming on this plz
    # Assume it's the first one, need to build UI for selecting exactly right one,
    # simplest to just dump a list into the UI
    chosen_stop = actual_stops[0]
    return {
      name: chosen_stop["result"]["location_name"],
      stop_id: chosen_stop["result"]["stop_id"]
    }
  end

  def healthcheck(dev_id, key, base)
    ptv_request(base, "/v2/healthcheck?timestamp=#{Time.now.utc.iso8601}&devid=#{dev_id}")
  end


  direction = params[:direction]
  station = params[:station]
  flinders_stop_id = 1071

  if direction == "downtown"
    stop = search_stopname(dev_id, key, base, station)
    puts stop
    departures_from_station = broad_next_train_departures(dev_id, key, base, stop[:stop_id], 20).to_h["values"].select do |value|
      value["platform"]["direction"]["direction_id"] == 0
    end

    {from: stop[:name], trains: departures_from_station}.to_json
  elsif direction == "uptown"
    stop = search_stopname(dev_id, key, base, station)
    puts stop

    wanted_line_ids = []
    departures_from_station = broad_next_train_departures(dev_id, key, base, stop[:stop_id], 20).to_h["values"].select do |value|
      wanted_line_ids << value["platform"]["direction"]["line"]["line_id"]
      #value["platform"]["direction"]["direction_id"] == 0
    end
    wanted_line_ids.uniq!
    departures_from_cbd = broad_next_train_departures(dev_id, key, base, flinders_stop_id, 20).to_h["values"].select do |value|
      wanted_line_ids.include? value["platform"]["direction"]["line"]["line_id"]
    end
    {to: stop[:name], trains: departures_from_cbd}.to_json
  end

  #puts healthcheck(dev_id, key, base)

end


