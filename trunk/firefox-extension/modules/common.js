var EXPORTED_SYMBOLS = [ "XNRCommon", "Ci", "Cc" ];

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const Ci = Components.interfaces;
const Cc = Components.classes;

const cPref = Cc["@mozilla.org/preferences-service;1"];
const cSupportString = Cc["@mozilla.org/supports-string;1"];
const cUnicodeConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"];
const cXHR = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"];

var XNRCommon = {
	get supportString () {
		return cSupportString.createInstance(Ci.nsISupportsString);
	},
	get unicodeConverter () {
		return cUnicodeConverter.createInstance(Ci.nsIScriptableUnicodeConverter);
	},
	get xmlHttpRequest () {
		return cXHR.createInstance(Ci.nsIXMLHttpRequest);
	}
};

XPCOMUtils.defineLazyServiceGetter(XNRCommon, "io", "@mozilla.org/network/io-service;1", "nsIIOService2");
XPCOMUtils.defineLazyServiceGetter(XNRCommon, "instream", "@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream"); 
XPCOMUtils.defineLazyServiceGetter(XNRCommon, "console", "@mozilla.org/consoleservice;1", "nsIConsoleService");
XPCOMUtils.defineLazyServiceGetter(XNRCommon, "wm", "@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
XPCOMUtils.defineLazyGetter(XNRCommon, "prefs", function () {
	return cPref.getService(Ci.nsIPrefService).QueryInterface(Ci.nsIPrefBranch2);
});


