(function () {

Components.utils.import("resource://xiaonei-reformer/utils.js");

var XNRChrome = {
	obs: null,

	injectScript: function (contentDocument) {

		const whitelist="^https?://.*\\.renren\\.com/|^https?://renren\\.com/";
		const blacklist="^http://wpi\\.renren\\.com/|ajaxproxy";

		var url = contentDocument.baseURI;
		if (!url || !url.match(whitelist) || url.match(blacklist)) {
			return;
		}

		var sandbox = XNRUtils.createSandbox(contentDocument.defaultView);
	
		XNRUtils.loadScript("chrome://xiaonei-reformer/content/xiaonei_reformer.user.js", sandbox);
	}
};

window.addEventListener("load", function () {
	XNRChrome.obs = XNRUtils.createObserver("document-element-inserted", XNRChrome.injectScript);
	XNRChrome.obs.register();
}, false);

window.addEventListener("unload", function () {
	XNRChrome.obs.unregister();
}, false);

})();

