function XNR_Observer() {
	this.register();
}
XNR_Observer.prototype = {
	observe: function(subject, topic, data) {
		var url = (data || subject.location).toString();
		const whitelist="^https?://.*\\.renren\\.com($|/)|^https?://renren\\.com($|/)";
		const blacklist="^http://wpi\\.renren\\.com|ajaxproxy";
		if(!url.match(whitelist) || url.match(blacklist)) {
			return;
		}

		(function() {
			if(subject.document.documentElement==null) {
				setTimeout(arguments.callee, 10);
				return;
			}
			Components.utils.import("resource://xiaonei-reformer/base.js");
			Components.utils.import("resource://xiaonei-reformer/readfile.js");

			var wrapper=new XPCNativeWrapper(subject);
			var sandbox = new Components.utils.Sandbox(wrapper);
			sandbox.window = wrapper;
			sandbox.document = wrapper.document;
			sandbox.__proto__ = wrapper;

			importMethods(sandbox);

			// can't use mozIJSSubScriptLoader due to https://bugzilla.mozilla.org/show_bug.cgi?id=377498
			var script=getUrlContents("chrome://xiaonei-reformer/content/xiaonei_reformer.user.js");

			Components.utils.evalInSandbox(script, sandbox);

		})();
	},
	register: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "content-document-global-created", false);
	},
	unregister: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
		observerService.removeObserver(this, "content-document-global-created");
	}
};

var observer;

window.addEventListener("load", function() {
	observer = new XNR_Observer();
}, false);

window.addEventListener("unload", function() {
	observer.unregister();
}, false);

