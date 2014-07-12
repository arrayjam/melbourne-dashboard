abort "I haven't tested this. This is salvage from what I did in interactive sessions in case it needs to be done again."





require "active_support/core_ext/hash"
require "json"
require "open-uri"


url = "www.eventsvictoria.com/distributionservice/rss.xml"
filename = "events.json"
final_filename = "filtered_events.json"
get_first_n_events = 30
open(url) do |rss|
  feed = RSS::Parser.parse(rss)
  File.open(filename, "w") { |file| file.write(Hash.from_xml(feed.to_s).to_json) }
end

system("cat #{filename} | jq \".rss.channel.item[0:#{get_first_n_events}]\" > #{final_filename}")


