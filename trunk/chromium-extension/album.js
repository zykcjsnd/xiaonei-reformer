var album;

function $(id) {
	if (id[0]=='#') {
		return document.getElementById(id.substring(1));
	} else {
		return document.createElement(id);
	}
}

function showPhotos() {
	try {
		album=JSON.parse(decodeURIComponent(/#(.*)$/.exec(location.href)[1]));
		$("#source").textContent=album.ref;
		if(album.unknown.length>0) {
			$("#unknown").style.display="block";
			var ulist=$("#ulist");
			for(var i=0;i<album.unknown.length;i++) {
				if(album.type) {
					var o=$("span");
					span.textContent=album.unknown[i];
				} else {
					var o=$("a");
					o.href=o.textContent=album.unknown[i];
				}
				ulist.appendChild(o);
				ulist.appendChild($("br"));
			}
		}
		$(album.type?"#gallerytitle":"#linktitle").style.display="none";
		if(album.data.length>0) {
			var list=$("#list");
			$("#count").textContent=album.data.length;
			for(var i=0;i<album.data.length;i++) {
				var img=album.data[i];
				if (album.type) {
					var o=$("a");
					o.href=img.src;
					o.setAttribute("index", img.i);
					o.title=img.title;
					o.textContent=img.src;
					list.appendChild(o);
					list.appendChild($("br"));
				} else {
					var o=$("img");
					o.setAttribute("height", "128");
					o.setAttribute("width", "128");
					o.setAttribute("index", img.i);
					o.src=img.src;
					o.title=img.title;
					list.appendChild(o);
				}
			}
		}
		if(album.title) {
			document.title=album.title;
		}
		if(album.dlapi) {
			$("#apititle").style.display="block";
		}
		$('#loading').style.display="none";
		$('#loaded').style.display="block";
	} catch(err) {
		$('#loading').textContent="数据传输出错！";
	}
};

function switchLink() {
	var links=document.querySelectorAll("a[title]:not([title=''])");
	for(var i=0;i<links.length;i++) {
		if(links[i].textContent!=links[i].title) {
			links[i].textContent=links[i].title;
		} else {
			links[i].textContent=links[i].href;
		}
	}
};
function switchIndex(add) {
	var max=album.data.length+album.unknown.length;
	var links=document.querySelectorAll("*[index]");
	for(var i=0;i<links.length;i++) {
		if(add) {
			links[i].title=idx(parseInt(links[i].getAttribute("index")),max)+" "+links[i].title;
		} else {
			links[i].title=links[i].title.replace(/^[0-9]+ /,"");
		}
	}
};

function idx(n,max) {
	var i=0;
	for(;max>0;max=Math.floor(max/10)) {
		i++;
	}
	n="00000"+n;
	return n.substring(n.length-i,n.length);
};

function download() {
	alert("本功能仍然处于实验阶段，所以有如下缺陷\n  * 图片只能下载到默认的下载文件夹中");
	var max = album.data.length + album.unknown.length;
	var images = document.querySelectorAll("a[index],img[index]");
	for(var i = 0; i < images.length; i++) {
		var image = images[i];
		var url = image.src || image.href;
		var ext = (url.match(/\.[^\/]+$/) || [".jpg"])[0];
		var filename = (image.title || idx(image.getAttribute("index"), max)) + ext;
		filename = filename.replace(/\//g, "／");
		filename = filename.replace(/\\/g, "＼");
		filename = filename.replace(/:/g, "：");
		filename = filename.replace(/\*/g, "＊");
		filename = filename.replace(/\?/g, "？");
		filename = filename.replace(/"/g, "“");
		filename = filename.replace(/</g, "〈");
		filename = filename.replace(/>/g, "〉");
		filename = filename.replace(/\|/g, "｜");
		chrome.downloads.download({
			"url": url,
			"filename": filename,
			"saveAs": false
		});
	}
}

document.addEventListener("DOMContentLoaded", function() {
	$("#switchLink").addEventListener("click", switchLink);
	$("#switchIndex").addEventListener("click", function(event) {
		switchIndex(event.target.checked)
	});
	$("#download").addEventListener("click", function(event) {
		download();
	});
	showPhotos();
});
