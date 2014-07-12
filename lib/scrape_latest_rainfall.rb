require "nokogiri"
require "open-uri"
require "json"

name = "Rainfall in last hour"

url = "http://www.bom.gov.au/cgi-bin/wrap_fwo.pl?IDV60161.html"
selector = "table:nth-child(9) tr:nth-child(7) td:last-child"
filename = "rainfall.json"
filepath = File.join(File.dirname(__FILE__), "..", "data", filename)

open(url) do |f|
  html = Nokogiri::HTML(f.read)
  rainfall = html.at_css(selector).text.strip.to_f
  json = JSON.generate({name: name, value: rainfall})
  File.open(filepath, 'w') { |file| file.write(json) }
end

