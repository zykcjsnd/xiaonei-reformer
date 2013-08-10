var albums = {};

sogouExplorer.extension.onMessage.addListener(
function (request, sender, sendResponse) {
	switch (request.action) {
		case "save":
			localStorage.setItem("xnr_options", request.data);
			return;
		case "load":
			var options = localStorage.getItem("xnr_options");
			if (options == null) {
				sendResponse({options:{}});
			} else {
				try {
					sendResponse({options:JSON.parse(options)});
				} catch(ex) {
					sendResponse({options:{}});
				}
			}
			return;
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
					sendResponse({data:(httpReq.status == 200 ? httpReq.responseText : null)});
					// BUG: http://ie.sogou.com/bbs/viewthread.php?tid=513537
					//sogouExplorer.tabs.sendRequest(sender.tab.id, {id:request.id, data:(httpReq.status==200?httpReq.responseText:null)});
				}
			};
			httpReq.onerror = function(e) {
				sendResponse({data:null});
				//sogouExplorer.tabs.sendRequest(sender.tab.id, {id:request.id, data:null});
			};
			httpReq.open(request.method,request.url,true);
			//httpReq.setRequestHeader("Cache-Control","no-cache");
			httpReq.send();
			return true;
		case "album":
			// 搜狗的下载API是坏掉的
			if (false && sogouExplorer.downloads) {
				request.data.dlapi = true;
			}
			do {
				var t = Math.floor(Math.random() * 1000000);
			} while(t in albums);
			albums[t] = request.data;
			// 是滴，像chrome那样搞是没用的，这样是必须的
			sogouExplorer.tabs.create({url:sogouExplorer.extension.getURL("album.html") + "#" + t, selected:true});
			return;
		case "albumInit":
			var t = request.t;
			if (t && (t in albums)) {
				var data = albums[t]
				delete albums[t];
				var p = navigator.platform;
				var os;
				if (/Win/i.test(p)) {
					os = "win";
				} else if (/Mac/i.test(p)) {
					os = "mac";
				} else {
					os = p.split(" ")[0].toLowerCase();
				}
				sendResponse({album:data, os:os});
			} else {
				sendResponse(null);
			}
	}
});


if (sogouExplorer.downloads && sogouExplorer.downloads.onDeterminingFilename) {
	sogouExplorer.downloads.onDeterminingFilename.addListener(function(item, suggest) {
		suggest({
			filename: item.filename,
			conflict_action: 'overwrite'
		});
	});
}
