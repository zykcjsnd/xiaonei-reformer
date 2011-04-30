if ("undefined" == typeof(XNRChrome)) {
	var XNRChrome = {};
};

XNRChrome.eventListener = {
	onLocationChange: function (aBrowser, aProgress, aRequest, aURI) {
		if (XNRChrome.checkURL(aBrowser.contentWindow.location.href)) {
			if (aBrowser.contentDocument.readyState == "loading") {
				XNRChrome.injectScript(aBrowser.contentWindow);
			}
		}
	},
	onProgressChange: function (aBrowser, aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {},
	onStateChange: function (aBrowser, aWebProgress, aRequest, aFlag, aStatus) {},  
	onStatusChange: function (aBrowser, aWebProgress, aRequest, aStatus, aMessage) {},
	onSecurityChange: function (aBrowser, aWebProgress, aRequest, aState) {},
	onRefreshAttempted: function (aBrowser, aWebProgress, aRefreshURI, aMillis,aSameURI) {
		// must return true. or the refresh action will be blocked
		return true;
	},
	onLinkIconAvailable: function (aBrowser) {}
};

XNRChrome.onframeLoaded = function (evt) {
	var content = evt.target.defaultView.window;
	if(content == content.top || !XNRChrome.checkURL(content.location.href)) {
		return;
	} else {
		XNRChrome.injectScript(content);
	}
};

XNRChrome.injectScript = function (contentWindow) {
	Components.utils.import("resource://xiaonei-reformer/utils.js");

	var wrapper = new XPCNativeWrapper(contentWindow);
	var sandbox = new Components.utils.Sandbox(wrapper);
	sandbox.window = wrapper;
	sandbox.document = wrapper.document;
	sandbox.__proto__ = wrapper;

	XNRUtils.importMethods(sandbox);

	// can't use mozIJSSubScriptLoader due to https://bugzilla.mozilla.org/show_bug.cgi?id=377498
	var script=XNRUtils.getUrlContents("chrome://xiaonei-reformer/content/xiaonei_reformer.user.js");

	Components.utils.evalInSandbox(script, sandbox);
};

XNRChrome.checkURL = function (url) {
	const whitelist="^https?://.*\\.renren\\.com/|^https?://renren\\.com/";
	const blacklist="^http://wpi\\.renren\\.com/|ajaxproxy";
	return url.match(whitelist) && !url.match(blacklist);
};

window.addEventListener("load", function () {
	gBrowser.addTabsProgressListener(XNRChrome.eventListener);
	gBrowser.addEventListener("DOMContentLoaded", XNRChrome.onframeLoaded, true);
}, false);

window.addEventListener("unload", function () {
	gBrowser.removeEventListener("DOMContentLoaded", XNRChrome.onframeLoaded, true);
	gBrowser.removeTabsProgressListener(XNRChrome.eventListener);
}, false);

