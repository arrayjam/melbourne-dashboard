require "nokogiri"
require "open-uri"
require "json"

url = "http://www.melbournewater.com.au/waterdata/waterstorages/Pages/water-storages.aspx#TodayUse"
selector = ".TSM_SCADA_panellevel .lvl-perc span"
filename = "water_storage.json"
filepath = File.join(File.dirname(__FILE__), "..", "public", "data", filename)

open(url) do |f|
  html = Nokogiri::HTML(f.read)
  level = html.at_css(selector).text.to_f
  json = JSON.generate({name: "Water Level", value: level})
  File.open(filepath, 'w') { |file| file.write(json) }
end

