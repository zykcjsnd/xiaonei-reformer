var EXPORTED_SYMBOLS = ["Services", "Instances"];

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const Ci = Components.interfaces;
const Cc = Components.classes;

const cPref = Cc["@mozilla.org/preferences-service;1"];
const cSupportString = Cc["@mozilla.org/supports-string;1"];
const cUnicodeConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"];
const cXHR = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"];

var Services = {};

XPCOMUtils.defineLazyServiceGetter(Services, "io", "@mozilla.org/network/io-service;1", "nsIIOService2");
XPCOMUtils.defineLazyServiceGetter(Services, "instream", "@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream"); 
XPCOMUtils.defineLazyServiceGetter(Services, "console", "@mozilla.org/consoleservice;1", "nsIConsoleService");
XPCOMUtils.defineLazyServiceGetter(Services, "wm", "@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
XPCOMUtils.defineLazyGetter(Services, "prefs", function () {
	return cPref.getService(Ci.nsIPrefService).QueryInterface(Ci.nsIPrefBranch2);
});

var Instances = {
	supportString: function () {
		return cSupportString.createInstance(Ci.nsISupportsString);
	},
	unicodeConverter: function () {
		return cUnicodeConverter.createInstance(Ci.nsIScriptableUnicodeConverter);
	},
	xmlHttpRequest: function () {
		return cXHR.createInstance(Ci.nsIXMLHttpRequest);
	}
};

