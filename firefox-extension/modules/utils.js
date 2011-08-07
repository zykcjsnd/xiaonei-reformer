var EXPORTED_SYMBOLS = [ "XNRUtils" ];

Components.utils.import("resource://gre/modules/Services.jsm");

const Ci = Components.interfaces;
const Cc = Components.classes;
const opts = "extensions.xiaonei_reformer.xnr_options";

function XNR_save (data) {
	var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
	str.data = data;
	Services.prefs.setComplexValue(opts, Ci.nsISupportsString, str);
}

function XNR_load () {
	return Services.prefs.getComplexValue(opts, Ci.nsISupportsString).data;
}

function XNR_get (scope, url, func, data, method) {
	var httpReq = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	if (func != null) {
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
	var mainWindow = Services.wm.getMostRecentWindow("navigator:browser");
	mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab("chrome://xiaonei-reformer/content/album.html#"+encodeURIComponent(JSON.stringify(data)));
}

function XNR_log (msg) {
	Services.console.logStringMessage(msg);
}

function XNR_observer (topic, callback) {
	this._topic = topic;
	this._callback = callback;
}
XNR_observer.prototype = {
	observe: function(subject, topic, data) {
		if (this._topic == topic) {
			this._callback(subject, data);
		}
	},
	register: function() {
		Services.obs.addObserver(this, this._topic, false);
	},
	unregister: function() {
		Services.obs.removeObserver(this, this._topic);
	}
};


var XNRUtils = {};

XNRUtils.createSandbox = function (content) {
	var wrapper = content;
	if (!wrapper.wrappedJSObject) {
		wrapper = new XPCNativeWrapper(content);
	}
	var sandbox = new Components.utils.Sandbox(wrapper);
	sandbox.window = wrapper;
	sandbox.document = wrapper.document;
	sandbox.__proto__ = wrapper;

	sandbox.importFunction(XNR_save);
	sandbox.importFunction(XNR_load);
	sandbox.importFunction(XNR_get);
	sandbox.importFunction(XNR_album);
	sandbox.importFunction(XNR_log);

	return sandbox;
}

XNRUtils.createObserver = function (topic, callback) {
	return new XNR_observer(topic, callback);
}

XNRUtils.loadScript = function (url, targetObj) {
	Services.scriptloader.loadSubScript(url, targetObj, "utf8");
}

