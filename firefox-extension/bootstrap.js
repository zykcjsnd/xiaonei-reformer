"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

const XNRCore = {
	optsPath: "extensions.xiaonei_reformer.xnr_options",
	extPath: null,

	constructors: {
		SupportsString: Components.Constructor("@mozilla.org/supports-string;1", "nsISupportsString"),
		XMLHttpRequest: Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1", "nsIXMLHttpRequest"),
		FilePicker: Components.Constructor("@mozilla.org/filepicker;1", "nsIFilePicker"),
		WebBrowserPersist: Components.Constructor("@mozilla.org/embedding/browser/nsWebBrowserPersist;1", "nsIWebBrowserPersist"),
	},

	setPref: function (branch, path, data) {
		if (arguments.length === 2) {
			data = path;
			path = branch;
			branch = Services.prefs;
		}
		switch (typeof data) {
			case "string":
				var str = XNRCore.constructors.SupportsString();
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
		var httpReq = XNRCore.constructors.XMLHttpRequest();
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
			var cWindow = newTabBrowser.contentWindow;
			var system = Services.appinfo.OS;
			if (system == "WINNT") {
				system = "win";
			} else if (system == "Darwin") {
				system = "mac";
			} else {
				system = system.toLowerCase();
			}
			cWindow.postMessage({ "type":"init", "album":data, "os":system }, "*");
			cWindow.addEventListener("message", function(msg) {
				var request = msg.data;
				if (!request || request.type !== "download" || !request.album) {
					return;
				}
				var album = request.album;
				if (!album || !Array.isArray(album.data) || album.data.length == 0) {
					// 参数错误
					cWindow.postMessage({ type:"cancel", error:"\u53C2\u6570\u9519\u8BEF" }, "*");
					return;
				}

				var dir = XNRCore.getDirectory(cWindow);
				if (dir == null) {
					cWindow.postMessage({ type:"cancel" }, "*");
					return;
				}
				var suffix = 1;
				var dir2 = dir.clone();
				dir2.append(album.dirname);
				while (dir2.exists()) {
					dir2 = dir.clone();
					dir2.append(album.dirname + "_" + suffix);
					suffix++;
				}
				dir = dir2;
				// DIRECTORY_TYPE = 1, 0o700 = 448
				try {
					dir.create(1, 448);
				} catch(ex) {
					// 无法在指定位置创建目录
					cWindow.postMessage({ type:"cancel", error:"\u65E0\u6CD5\u5728\u6307\u5B9A\u4F4D\u7F6E\u521B\u5EFA\u76EE\u5F55" }, "*");
				}
				var images = album.data;
				for (var i = 0; i < images.length; i++) {
					var image = images[i];
					var file = dir.clone();
					file.append(image.filename);
					XNRCore.download(cWindow, i, image.src, file);
				}
			}, false);
		}, true);
		mainWindow.gBrowser.selectedTab = newTab;
	},

	getDirectory: function(parentWindow) {
		var fp = XNRCore.constructors.FilePicker();
		var nsIFilePicker = Ci.nsIFilePicker;
		// 选择下载到的位置
		fp.init(parentWindow, "\u9009\u62E9\u4E0B\u8F7D\u5230\u7684\u4F4D\u7F6E", nsIFilePicker.modeGetFolder);
		var res = fp.show();
		if (res != nsIFilePicker.returnCancel) {
			return fp.file;
		} else {
			return null;
		}
	},

	download: function(sourceWindow, idx, url, target) {
		var inPrivateBrowsing = XNRCore.isInPrivateBrowsing(sourceWindow);
		var persist = XNRCore.constructors.WebBrowserPersist();
		var aURI = Services.io.newURI(url, null, null);
		persist.progressListener = {
			onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
				sourceWindow.postMessage({ type:"progress", index:idx, current:aCurTotalProgress, max:aMaxTotalProgress }, "*");
			},
			onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
				if ((aStateFlags & 0x00000001) != 0) {
					//STATE_START
					sourceWindow.postMessage({ type:"start", index:idx }, "*");
				} else if ((aStateFlags & 0x00000010) != 0) {
					// STATE_STOP
					sourceWindow.postMessage({ type:"end", index:idx, result:aStatus, uri:Services.io.newFileURI(target).path }, "*");
				}
			},
			// 没有这些后台可能会抛异常
			onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {},
			onSecurityChange: function(aWebProgress, aRequest, aState) {},
			onLocationChange: function(aWebProgress, aRequest, aLocation, aFlags) {},
		}
		// PERSIST_FLAGS_CLEANUP_ON_FAILURE
		persist.persistFlags |= 8192;
		persist.savePrivacyAwareURI(aURI, null, null, null, "", target, inPrivateBrowsing);
	},

	isInPrivateBrowsing: function(aWindow) {
		try {
			// Firefox 20+
			Cu.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
			return PrivateBrowsingUtils.isWindowPrivate(aWindow);
        } catch(e) {
			// older Firefox
			try {
            	return Cc["@mozilla.org/privatebrowsing;1"].getService(Ci.nsIPrivateBrowsingService).privateBrowsingEnabled;
			} catch(e) {
				Cu.reportError(e);
				return false;
			}
		}
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
