chrome.extension.onRequest.addListener(
function(request, sender, sendResponse) {
	switch(request.action) {
		case "save":
			localStorage.setItem("xnr_options",request.data);
			break;
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
			break;
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
			break;
		case "album":
			chrome.tabs.create({url:chrome.extension.getURL("album.html")+"#"+encodeURIComponent(JSON.stringify(request.data))});
			break;
	}
});
