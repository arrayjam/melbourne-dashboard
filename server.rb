require "sinatra"
require "rss"
require "open-uri"
require "json"

get "/" do
    erb :index
end

get "/events" do
  content_type :json
  filename = File.join("data", "filtered_events.json")
  File.open(filename) do |file| return file.read end
end

