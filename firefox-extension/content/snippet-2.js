
}

var myListener={
	onLocationChange: function(aBrowser, aProgress, aRequest, aURI) {
		if(aBrowser.contentDocument.readyState=="loading") {
			loader(aBrowser.contentWindow,true);
		}
	},
	onProgressChange: function(aBrowser, aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {},
	onStateChange: function(aBrowser, aWebProgress, aRequest, aFlag, aStatus) {},  
	onStatusChange: function(aBrowser, aWebProgress, aRequest, aStatus, aMessage) {},
	onSecurityChange: function(aBrowser, aWebProgress, aRequest, aState) {},
	onRefreshAttempted: function(aBrowser, aWebProgress, aRefreshURI, aMillis,aSameURI) {
		// must return true. if not, the refresh action will be blocked
		return true;
	},
	onLinkIconAvailable: function(aBrowser) {}
};

window.addEventListener("load",function() {
	gBrowser.addTabsProgressListener(myListener);
	gBrowser.addEventListener("DOMContentLoaded",loader,true);
},false);

window.addEventListener("unload",function() {
	gBrowser.removeEventListener("DOMContentLoaded",loader,true);
	gBrowser.removeTabsProgressListener(myListener);
},false);

