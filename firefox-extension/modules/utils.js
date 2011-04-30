var EXPORTED_SYMBOLS = [ "XNRUtils" ];

Components.utils.import("resource://xiaonei-reformer/common.js");

var XNRUtils = {};

const opts = "extensions.xiaonei_reformer.xnr_options";

function XNR_save (data) {
	var str = XNRCommon.supportString;
	str.data = data;
	XNRCommon.prefs.setComplexValue(opts, Ci.nsISupportsString, str);
}

function XNR_load () {
	return XNRCommon.prefs.getComplexValue(opts, Ci.nsISupportsString).data;
}

function XNR_get (scope, url, func, data, method) {
	var httpReq = XNRCommon.xmlHttpRequest;
	if(func != null) {
		httpReq.onload = function() {
			func.call(scope, (httpReq.status==200?httpReq.responseText:null), url, data);
		};
		httpReq.onerror=function () {
			func.call(scope, null, url, data);
		};
	}
	httpReq.open(method, url, true);
	httpReq.send(null);
}

function XNR_album (data) {
	var mainWindow = XNRCommon.wm.getMostRecentWindow("navigator:browser");
	mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab("chrome://xiaonei-reformer/content/album.html#"+encodeURIComponent(JSON.stringify(data)));
}

XNRUtils.importMethods = function (scope) {
	scope.importFunction(XNR_save);
	scope.importFunction(XNR_load);
	scope.importFunction(XNR_get);
	scope.importFunction(XNR_album);
	if (!scope.console) {
		scope.console = {
			log: function (msg) {
				XNRCommon.console.logStringMessage(msg);
			}
		};
	}
}

// getUrlContents adapted from Greasemonkey Compiler
// http://www.letitblog.com/code/python/greasemonkey.py.txt
// used under GPL permission
//
XNRUtils.getUrlContents = function (aUrl) {
	var	ioService = XNRCommon.io;
	var	scriptableStream = XNRCommon.instream;
	var unicodeConverter = XNRCommon.unicodeConverter;

	unicodeConverter.charset="UTF-8";

	var	channel=ioService.newChannel(aUrl, "UTF-8", null);
	var	input=channel.open();
	scriptableStream.init(input);
	var	str=scriptableStream.read(input.available());
	scriptableStream.close();
	input.close();

	try {
		return unicodeConverter.ConvertToUnicode(str);
	} catch (e) {
		return str;
	}
}

