chrome.extension.onMessage.addListener(
function(request, sender, sendResponse) {
	switch(request.action) {
		case "save":
			chrome.storage.sync.clear(function() {
				chrome.storage.sync.set(request.data);
			});
			return;
		case "load":
			var options=localStorage.getItem("xnr_options");
			if (options) {
				localStorage.removeItem("xnr_options");
				try {
					options = JSON.parse(options);
				} catch(ex) {
					options = {};
				}
				chrome.storage.sync.set(options);
				sendResponse({options: options});
			} else {
				chrome.storage.sync.get(function(data) {
					sendResponse({options:data || {}});
				});
			}
			return true;
		case "storage":
			if (request.data) {
				localStorage.setItem(request.pref,request.data);
			} else {
				sendResponse({data:localStorage.getItem(request.pref)});
			}
			return;
		case "get":
			var httpReq= new XMLHttpRequest();
			httpReq.onload=function() {
				if (httpReq.readyState == 4) {
					sendResponse({data:(httpReq.status==200?httpReq.responseText:null)});
				}
			};
			httpReq.onerror=function(e) {
				sendResponse({data:null});
			};
			httpReq.open(request.method,request.url,true);
			//httpReq.setRequestHeader("Cache-Control","no-cache");
			httpReq.send();
			return true;
		case "album":
			chrome.tabs.create({url:chrome.extension.getURL("album.html")+"#"+encodeURIComponent(JSON.stringify(request.data))});
			return;
	}
});
