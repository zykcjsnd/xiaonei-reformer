var myListener={
	onLocationChange: function(aBrowser, aProgress, aRequest, aURI) {
		if(checkLocation(aBrowser.contentWindow.location.href)) {
			if(aBrowser.contentDocument.readyState=="loading") {
				loadScript(aBrowser.contentWindow,true);
			}
		}
	},
	onProgressChange: function(aBrowser, aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {},
	onStateChange: function(aBrowser, aWebProgress, aRequest, aFlag, aStatus) {},  
	onStatusChange: function(aBrowser, aWebProgress, aRequest, aStatus, aMessage) {},
	onSecurityChange: function(aBrowser, aWebProgress, aRequest, aState) {},
	onRefreshAttempted: function(aBrowser, aWebProgress, aRefreshURI, aMillis,aSameURI) {
		// must return true. or the refresh action will be blocked
		return true;
	},
	onLinkIconAvailable: function(aBrowser) {}
};

window.addEventListener("load",function() {
	gBrowser.addTabsProgressListener(myListener);
	gBrowser.addEventListener("DOMContentLoaded",loadScript,true);
},false);

window.addEventListener("unload",function() {
	gBrowser.removeEventListener("DOMContentLoaded",loadScript,true);
	gBrowser.removeTabsProgressListener(myListener);
},false);


function loadScript(obj,direct) {
	var contentWindow;
	if(direct) {
		contentWindow=obj;
	} else {
		contentWindow=obj.target.defaultView.window;
		if(contentWindow==contentWindow.top) {
			// only run in frame
			return;
		}
		if(!checkLocation(contentWindow.location.href)) {
			return;
		}
	}

	var wrapper=new XPCNativeWrapper(contentWindow);
	var sandbox=new Components.utils.Sandbox(wrapper);
	sandbox.window=wrapper;
	sandbox.document=wrapper.document;
	sandbox.__proto__=wrapper;

	const opt="extensions.xiaonei_reformer.xnr_options";
	sandbox.importFunction(function (data) {
		var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		str.data = data;
		Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).setComplexValue(opt, Components.interfaces.nsISupportsString, str);
	},"XNR_save");

	sandbox.importFunction(function () {
		return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getComplexValue(opt, Components.interfaces.nsISupportsString).data;
	},"XNR_load");

	sandbox.importFunction(function (url, func, data, method) {
		var httpReq = new window.XMLHttpRequest();
		if(func != null) {
			httpReq.onload = function() {
				func.call(sandbox.window, (httpReq.status==200?httpReq.responseText:null), url, data);
			};
			httpReq.onerror=function () {
				func.call(sandbox.window, null, url, data);
			};
		}
		httpReq.open(method, url, true);
		httpReq.send(null);
	},"XNR_get");

	sandbox.importFunction(function (data) {
		gBrowser.selectedTab=gBrowser.addTab("chrome://xiaonei-reformer/content/album.html#"+escape(JSON.stringify(data)));
	},"XNR_album");

	if(!sandbox.console) {
		sandbox.console={
			log: function(msg) {
				Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(msg);
			}
		};
	}

	// can't use mozIJSSubScriptLoader due to https://bugzilla.mozilla.org/show_bug.cgi?id=377498
	var script=getUrlContents('chrome://xiaonei-reformer/content/xiaonei_reformer.user.js');

	if(contentWindow.document.documentElement!=null) {
		Components.utils.evalInSandbox(script,sandbox);
	} else {
		// from 3.7a5pre
		// using sandbox.document instead of contentWindow will cause infinite loop on 4.0b6 
		contentWindow.addEventListener("DOMSubtreeModified",function() {
			contentWindow.removeEventListener("DOMSubtreeModified",arguments.callee,true);
			Components.utils.evalInSandbox(script,sandbox);
		},true);
	}
}

function checkLocation(url) {
	const whitelist="^https?://.*\\.renren\\.com/|^https?://renren\\.com/";
	const blacklist="^http://wpi\\.renren\\.com/|ajaxproxy";
	return url.match(whitelist) && !url.match(blacklist);
}

// getUrlContents adapted from Greasemonkey Compiler
// http://www.letitblog.com/code/python/greasemonkey.py.txt
// used under GPL permission
//
function getUrlContents(aUrl) {
	var	ioService=Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	var	scriptableStream=Components
		.classes["@mozilla.org/scriptableinputstream;1"]
		.getService(Components.interfaces.nsIScriptableInputStream);
	var unicodeConverter=Components
		.classes["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
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

