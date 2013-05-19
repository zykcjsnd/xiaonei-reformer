sogouExplorer.extension.onMessage.addListener(
function(request, sender, sendResponse) {
	switch(request.action) {
		case "save":
			localStorage.setItem("xnr_options",request.data);
			return;
		case "load":
			var options=localStorage.getItem("xnr_options");
			if(options==null) {
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
			var httpReq= new XMLHttpRequest();
			httpReq.onload=function() {
				if (httpReq.readyState == 4) {
					sendResponse({data:(httpReq.status==200?httpReq.responseText:null)});
					// BUG: http://ie.sogou.com/bbs/viewthread.php?tid=513537
					//sogouExplorer.tabs.sendRequest(sender.tab.id, {id:request.id, data:(httpReq.status==200?httpReq.responseText:null)});
				}
			};
			httpReq.onerror=function(e) {
				sendResponse({data:null});
				//sogouExplorer.tabs.sendRequest(sender.tab.id, {id:request.id, data:null});
			};
			httpReq.open(request.method,request.url,true);
			//httpReq.setRequestHeader("Cache-Control","no-cache");
			httpReq.send();
			return true;
		case "album":
			sogouExplorer.tabs.create({url:sogouExplorer.extension.getURL("album.html")+"#"+encodeURIComponent(JSON.stringify(request.data))});
			return;
	}
});
