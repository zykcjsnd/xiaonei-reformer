#! /usr/bin/ruby -Ku
require 'json'
require 'net/http'
require 'uri'

def gfetch(url, cookie)
	header = {
		"Accept" => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		"Referer" => 'http://www.renren.com/',
		"Connection" => 'keep-alive',
		"User-Agent" => 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:10.0) Gecko/20100101 Firefox/11.0'
	}
	if (cookie != nil)
		header["Cookie"] = cookie
	end
	uri = URI.parse(url)
	http = Net::HTTP.new(uri.host, uri.port)
	res = http.get(uri.path, header)
end

def getEmo()
	cookie = IO.read(File.dirname(__FILE__)+"/cookies")
	res = gfetch('http://status.renren.com/getdoingubblist.do', cookie)
	if (res.code == '302')
        raise 'Redirect to ' + res.reponse["location"]
    end
	return res.body
end

begin
	emoList = JSON.parse(getEmo())["ubbList"]
rescue Errno::ENETUNREACH
	exit 1
rescue Errno::ETIMEDOUT
	exit 1
rescue SocketError
	exit 1
rescue JSON::ParserError => e
	p e.message
	p e.backstack
	exit 1
end

filename = File.dirname(__FILE__)+"/EMOTIONS"

begin
	str = IO.read(filename)
	a = JSON.parse(str)
rescue Errno::ENOENT
	a = Hash.new()
end

emoList.each() {|emo|
	a[emo["ubb"]]={"t" => emo["alt"], "s" => emo["src"]}
}

file = File.open(filename,"w")
file.puts(JSON.pretty_generate(a))
file.close()

