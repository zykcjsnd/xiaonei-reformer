var EXPORTED_SYMBOLS = [ "XNRCommon", "Ci", "Cc" ];

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

const Ci = Components.interfaces;
const Cc = Components.classes;

const cSupportString = Cc["@mozilla.org/supports-string;1"];
const cXHR = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"];

var XNRCommon = {
	get supportString () {
		return cSupportString.createInstance(Ci.nsISupportsString);
	},
	get xmlHttpRequest () {
		return cXHR.createInstance(Ci.nsIXMLHttpRequest);
	},
	console: Services.console,
	wm: Services.wm,
	obs: Services.obs,
	prefs: Services.prefs,
	scriptloader: Services.scriptloader,
};

