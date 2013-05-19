#! /usr/bin/ruby -Ku
require 'json'
require 'net/http'
require 'uri'

def gfetch(url, cookie)
	header = {
		"Accept" => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		"Accept-Encoding" => 'gzip, deflate',
		"Content-Type" => 'application/x-www-form-urlencoded',
		"Accept-Language" => 'zh-cn,zh;q=0.5',
		"Referer" => 'http://shell.renren.com/ajaxproxy.htm',
		"DNT" => '1',
		"Connection" => 'keep-alive',
		"User-Agent" => 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:11.0) Gecko/20100101 Firefox/11.0'
	}
	if (cookie != nil)
		header["Cookie"] = cookie
	end
	uri = URI.parse(url)
	http = Net::HTTP.new(uri.host, uri.port)
	res = http.get(uri.path, header)
	if (res["content-encoding"] == "gzip")
		res.body = Zlib::GzipReader.new(StringIO.new(res.body.to_s())).read()
	end
	return res;
end

def getEmo()
	url = 'http://shell.renren.com/ubb/doingubb?t=' + Random.rand().to_s()
	cookie = IO.read(File.dirname(__FILE__)+"/cookies")
	#res = gfetch(url, cookie)
	res = gfetch(url, nil)
	if (res.code == '302')
        raise 'Redirect to ' + res["location"]
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

