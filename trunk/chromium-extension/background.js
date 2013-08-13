var extId = null;

if (chrome.runtime) {
	extId = chrome.runtime.id;
} else {
	extId = /([^\/]+)\/a$/.exec(chrome.extension.getURL("a"))[1];
}

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
			chrome.tabs.create({url:chrome.extension.getURL("album.html")}, function(tab) {
				var tabId = tab.id;
				// 据 http://code.google.com/p/chromium/issues/detail?id=137404以及实际实验结果，
				// v23+都不需要tabs权限即可操作。v21确认不行。v22未测试，但从发布时间上看应该也不行
				chrome.tabs.onUpdated.addListener(function (tid, changeInfo, tab) {
					if (tid != tabId || changeInfo.status != "complete") {
						return;
					}
					chrome.tabs.onUpdated.removeListener(arguments.callee);
					chrome.tabs.sendMessage(tid, { type:"initAlbum", "album":request.data });
				});
			});
			return;
	}
});


if (chrome.downloads && chrome.downloads.onDeterminingFilename) {
	chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
		// FIXME: 29还没把新标签页下载的当成是来自扩展？
		if (downloadItem.byExtensionId == extId) {
			suggest({
				filename: downloadItem.filename,
				conflict_action: 'overwrite'
			});
		}
	});
}
