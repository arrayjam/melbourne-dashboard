require "nokogiri"
require "open-uri"
require "json"

name = "Air Quality"

url = "http://apps.epa.vic.gov.au/air/bulletins/aqbhour.asp"
selector = "tr:nth-child(15) td:nth-child(11) font"
filename = "air_quality.json"
filepath = File.join(File.dirname(__FILE__), "..", "data", filename)

open(url) do |f|
  html = Nokogiri::HTML(f.read)
  rainfall = html.at_css(selector).text.strip
  json = JSON.generate({name: name, value: rainfall})
  File.open(filepath, 'w') { |file| file.write(json) }
end

