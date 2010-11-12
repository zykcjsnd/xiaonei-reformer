var myListener={
	onLocationChange: function(aBrowser, aProgress, aRequest, aURI) {
		if(checkLocation(aBrowser.contentWindow.location.href)) {
			if(aBrowser.contentDocument.readyState == "loading") {
				(function() {
					if(aBrowser.contentDocument.documentElement !== null) {
						injectScript(aBrowser.contentWindow);
					} else {
						// since 3.7a5pre
						setTimeout(arguments.callee, 50);
					}
				})();
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

window.addEventListener("load", function() {
	gBrowser.addTabsProgressListener(myListener);
	gBrowser.addEventListener("DOMContentLoaded", onframeLoaded, true);
}, false);

window.addEventListener("unload", function() {
	gBrowser.removeEventListener("DOMContentLoaded", onframeLoaded, true);
	gBrowser.removeTabsProgressListener(myListener);
}, false);


function onframeLoaded (evt) {
	var content=evt.target.defaultView.window;
	if(content == content.top || !checkLocation(content.location.href)) {
		return;
	} else {
		injectScript(content);
	}
}

function injectScript (contentWindow) {
	Components.utils.import("resource://xiaonei-reformer/base.js");
	Components.utils.import("resource://xiaonei-reformer/readfile.js");

	var wrapper=new XPCNativeWrapper(contentWindow);
	var sandbox = new Components.utils.Sandbox(wrapper);
	sandbox.window = wrapper;
	sandbox.document = wrapper.document;
	sandbox.__proto__ = wrapper;

	importMethods(sandbox);

	// can't use mozIJSSubScriptLoader due to https://bugzilla.mozilla.org/show_bug.cgi?id=377498
	var script=getUrlContents("chrome://xiaonei-reformer/content/xiaonei_reformer.user.js");

	Components.utils.evalInSandbox(script, sandbox);
}

function checkLocation(url) {
	const whitelist="^https?://.*\\.renren\\.com/|^https?://renren\\.com/";
	const blacklist="^http://wpi\\.renren\\.com/|ajaxproxy";
	return url.match(whitelist) && !url.match(blacklist);
}

