}

var myListener={
	QueryInterface: function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) || 
				aIID.equals(Components.interfaces.nsISupportsWeakReference) || 
				aIID.equals(Components.interfaces.nsISupports)) {
			return this;
		}
		throw Components.results.NS_NOINTERFACE;
	},
	onLocationChange: function(aProgress, aRequest, aURI) {
		if(content.document.readyState=="loading") {
			loader();
		}
	},
	onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) { },
	onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) { },  
	onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) { },
	onSecurityChange: function(aWebProgress, aRequest, aState) { }
};

window.addEventListener("load",function() {
	gBrowser.addProgressListener(myListener,Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
	gBrowser.addEventListener("DOMContentLoaded",loader,true);
},false);

window.addEventListener("unload",function() {
	gBrowser.removeEventListener("DOMContentLoaded",loader,true);
	gBrowser().removeProgressListener(myListener,Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
},false);

