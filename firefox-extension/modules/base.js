var EXPORTED_SYMBOLS = ["importMethods"];

Components.utils.import("resource://xiaonei-reformer/common.js");

const opts = "extensions.xiaonei_reformer.xnr_options";

function XNR_save (data) {
	var str = Instances.supportString();
	str.data = data;
	Services.prefs.setComplexValue(opts, Components.interfaces.nsISupportsString, str);
}

function XNR_load () {
	return Services.prefs.getComplexValue(opts, Components.interfaces.nsISupportsString).data;
}

function XNR_get (scope, url, func, data, method) {
	var httpReq = Instances.xmlHttpRequest();
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
	var mainWindow = Services.wm.getMostRecentWindow("navigator:browser");
	mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab("chrome://xiaonei-reformer/content/album.html#"+encodeURIComponent(JSON.stringify(data)));
}

function importMethods (scope) {
	scope.importFunction(XNR_save);
	scope.importFunction(XNR_load);
	scope.importFunction(XNR_get);
	scope.importFunction(XNR_album);
	if (!scope.console) {
		scope.console = {
			log: function (msg) {
				Services.console.logStringMessage(msg);
			}
		};
	}
}

