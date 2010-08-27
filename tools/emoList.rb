#! /usr/bin/ruby -Ku
require 'json'
require 'net/http'
require 'uri'

def getEmo()
	url = URI.parse('http://status.renren.com/getdoingubblist.do')
	res = Net::HTTP.start(url.host, url.port) {|http|
		http.get(url.path)
	}
	return res.body
end

begin
	emoList = JSON.parse(getEmo())["ubbList"]
rescue JSON::ParserError
	emoList = JSON.parse(getEmo())["ubbList"]
end

filename = File.dirname(__FILE__)+"/EMOTIONS"

begin
	file = File.open(filename,"r")
	a = JSON.parse(file.gets())
	file.close()
rescue Errno::ENOENT
	a = Hash.new()
end

emoList.each() {|emo|
	a[emo["ubb"]]={"s" => emo["src"], "t" => emo["alt"]}
}

file = File.open(filename,"w")
file.puts(JSON.generate(a))
file.close()
