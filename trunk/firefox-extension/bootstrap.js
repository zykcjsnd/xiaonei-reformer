"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

const XNRCore = {
	optsPath: "extensions.xiaonei_reformer.xnr_options",
	extPath: null,

	setPref: function (branch, path, data) {
		if (arguments.length === 2) {
			data = path;
			path = branch;
			branch = Services.prefs;
		}
		switch (typeof data) {
			case "string":
				var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
				str.data = String(data);
				branch.setComplexValue(path, Ci.nsISupportsString, str);
				break;
			case "boolean":
				branch.prefs.setBoolPref(path, data);
				break;
			case "number":
				branch.prefs.setIntPref(path, data);
				break;
		}
	},
	
	save: function (data) {
		XNRCore.setPref(XNRCore.optsPath, data);
	},

	load: function () {
		try {
			var opts = Services.prefs.getComplexValue(XNRCore.optsPath, Ci.nsISupportsString).data;
			return opts || "{}";
		} catch(ex) {
			// optsPath not exists
			return "{}";
		}
	},

	request: function (scope, url, func, data, method) {
		var httpReq = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
		if (func != null) {
			httpReq.onload = function() {
				if (httpReq.readyState == 4) {
					func.call(scope, (httpReq.status==200?httpReq.responseText:null), url, data);
				}
			};
			httpReq.onerror=function () {
				func.call(scope, null, url, data);
			};
		}
		httpReq.open(method, url, true);
		httpReq.send(null);
	},

	album: function (data) {
		var mainWindow = Services.wm.getMostRecentWindow("navigator:browser");
		var file = XNRCore.extPath.clone();
		file.append("album.html");
		var albumURL = Services.io.newFileURI(file).spec;
		var newTab = mainWindow.gBrowser.addTab(albumURL);
		var newTabBrowser = mainWindow.gBrowser.getBrowserForTab(newTab);
		newTabBrowser.addEventListener("DOMContentLoaded", function () {
			newTabBrowser.contentWindow.postMessage(data, "*");
		}, true);
		mainWindow.gBrowser.selectedTab = newTab;
	},

	log: function (msg) {
		Services.console.logStringMessage(msg);
	},

	storage: function(name, data) {
		var path = "extensions.xiaonei_reformer." + name;
		if (arguments.length === 2) {
			XNRCore.setPref(path, data);
		} else {
			try {
				return Services.prefs.getComplexValue(path, Ci.nsISupportsString).data || "";
			} catch(ex) {
				return "";
			}
		}
	},

	injectScript: function (contentDocument) {
		const whitelist="^https?://.*\\.renren\\.com/|^https?://renren\\.com/";
		const blacklist="^http://wpi\\.renren\\.com/|ajaxproxy";
	
		var url = contentDocument.baseURI;
		if (!url || !url.match(whitelist) || url.match(blacklist)) {
			return;
		}

		// create a sandbox
		var wrapper = contentDocument.defaultView;
		if (!wrapper.wrappedJSObject) {
			wrapper = new XPCNativeWrapper(contentDocument.defaultView);
		}
		var sandbox = new Cu.Sandbox(wrapper, {
			sandboxName: "xnr-dom-sandbox",
			sandboxPrototype: contentDocument.defaultView,
			wantXrays: true
		});

		sandbox.importFunction(XNRCore.save, "XNR_save");
		sandbox.importFunction(XNRCore.load, "XNR_load");
		sandbox.importFunction(XNRCore.request, "XNR_get");
		sandbox.importFunction(XNRCore.album, "XNR_album");
		sandbox.importFunction(XNRCore.log, "XNR_log");
		sandbox.importFunction(XNRCore.storage, "XNR_storage");

		// load my script
		var file = XNRCore.extPath.clone();
		file.append("xiaonei_reformer.user.js");
		var scriptURL = Services.io.newFileURI(file).spec;
		Services.scriptloader.loadSubScript(scriptURL, sandbox, "utf8");
	}

};


function XNR_observer (callback) {
	this._topic = "document-element-inserted";
	this._callback = callback;
	this.register();
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


var XNRObserver = null;

function startup(data, reason) {
	XNRCore.extPath = data.installPath;
	if (XNRObserver == null) {
		XNRObserver = new XNR_observer(XNRCore.injectScript);
	}
}

function shutdown(data, reason) {
	if (XNRObserver) {
		XNRObserver.unregister();
		XNRObserver = null;
	}
}

function install(data, reason) {
	var syncPath = "services.sync.prefs.sync." + XNRCore.optsPath;
	XNRCore.setPref(Services.prefs.getDefaultBranch(), syncPath, true);
}

function uninstall(data, reason) {
	// do nothing
}
