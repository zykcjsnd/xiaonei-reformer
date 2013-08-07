chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {
	switch (request.action) {
		case "save":
			localStorage.setItem("xnr_options", request.data);
			return;
		case "load":
			var options = localStorage.getItem("xnr_options");
			if (options == null) {
				chrome.storage.sync.get(null, function(data) {
					sendResponse({options:data || {}});
				});
				return true;
			} else {
				try {
					sendResponse({options:JSON.parse(options)});
				} catch(ex) {
					sendResponse({options:{}});
				}
				return;
			}
		case "storage":
			if (request.data) {
				localStorage.setItem(request.pref,request.data);
			} else {
				sendResponse({data:localStorage.getItem(request.pref)});
			}
			return;
		case "get":
			var httpReq = new XMLHttpRequest();
			httpReq.onload = function() {
				if (httpReq.readyState == 4) {
					sendResponse({data:(httpReq.status==200?httpReq.responseText:null)});
				}
			};
			httpReq.onerror = function(e) {
				sendResponse({data:null});
			};
			httpReq.open(request.method,request.url,true);
			//httpReq.setRequestHeader("Cache-Control","no-cache");
			httpReq.send();
			return true;
		case "album":
			if (chrome.downloads) {
				request.data.dlapi = true;
			}
			chrome.tabs.create({url:chrome.extension.getURL("album.html")}, function(tab) {
				var tabId = tab.id;
				chrome.tabs.onUpdated.addListener(function (tid, changeInfo, tab) {
					if (tid == tabId && changeInfo.status == "complete") {
						chrome.tabs.onUpdated.removeListener(arguments.callee);
						chrome.tabs.sendMessage(tid, request.data);
					}
				});
			});
			return;
	}
});


if (chrome.downloads) {
	chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
		suggest({
			filename: item.filename,
			conflict_action: 'overwrite'
		});
	});
}
