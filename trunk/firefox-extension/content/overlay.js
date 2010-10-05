var myListener={
	onLocationChange: function(aBrowser, aProgress, aRequest, aURI) {
		if(aBrowser.contentDocument.readyState=="loading") {
			loadScript(aBrowser.contentWindow,true);
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
		if(contentWindow==contentWindow.parent) {
			// only run in frame
			return;
		}
	}
	if(!contentWindow.location.href.match("^https?://.*\\.renren\\.com/|^https?://renren\\.com/")) {
		return;
	}
	if(contentWindow.location.href.match("^http://wpi\\.renren\\.com/|ajaxproxy")) {
		return;
	}

	// can't use mozIJSSubScriptLoader due to https://bugzilla.mozilla.org/show_bug.cgi?id=377498
	var script=getUrlContents('chrome://xiaonei-reformer/content/xiaonei_reformer.user.js');

	var sandbox=new Components.utils.Sandbox(contentWindow);
	sandbox.window=contentWindow;
	sandbox.document=contentWindow.document;
	sandbox.__proto__=contentWindow;

	sandbox.importFunction(function(name,value) {
		const op="extensions.xiaonei_reformer.xnr_options";
		switch(name) {
			case "save":
				Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).setCharPref(op,value);
				break;
			case "load":
				return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getCharPref(op);
			case "log":
				Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(value);
				break;
			case "get":
				var httpReq= new window.XMLHttpRequest();
				if(value.func!=null) {
					httpReq.onload=function() {
						value.func((httpReq.status==200?httpReq.responseText:null),value.url,value.data);
					};
					httpReq.onerror=function() {
						value.func(null,value.url,value.data);
					};
				}
			    httpReq.open(value.method,value.url,true);
				httpReq.send();
				break;
			case "album":
				gBrowser.selectedTab=gBrowser.addTab("chrome://xiaonei-reformer/content/album.html#"+escape(JSON.stringify(value)));
				break;
		}
	},"extServices");

	Components.utils.evalInSandbox(script,sandbox);
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
