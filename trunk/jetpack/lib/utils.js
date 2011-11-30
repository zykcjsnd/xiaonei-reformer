const tabs = require("tabs");
const self = require("self");
const request = require("request").Request;
const ss = require("simple-storage");

exports.XNR_save = XNR_save;
exports.XNR_load = XNR_load;
exports.XNR_get = XNR_get;
exports.XNR_log = XNR_log;
exports.XNR_album = XNR_album;

function XNR_save (data) {
	ss.storage.options = data;
}

function XNR_load () {
	return ss.storage.options || "{}";
}

function XNR_get (method, url, func) {
	var req = request({
		url: url,
		onComplete: func
	});
	switch(method) {
		case "GET":
			req.get();
			break;
		case "POST":
			req.post();
			break;
	}
}

function XNR_log (msg) {
	console.log(msg);
}

function XNR_album (data) {
	tabs.open({
		url: self.data.url("album.html") + "#" + encodeURIComponent(JSON.stringify(data)),
		inNewWindow: false,
		inBackground: false
	});
}

