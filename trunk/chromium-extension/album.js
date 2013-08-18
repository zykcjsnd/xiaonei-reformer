var album = null;

var downloadPool;

function $(id) {
	if (id[0] == "#") {
		return document.getElementById(id.substring(1));
	} else {
		return document.createElement(id);
	}
};

function showPhotos() {
	if (album == null) {
		$("#loading").textContent = "数据传输出错！";
		return;
	}
	$("#source").textContent = album.title || album.ref;
	$("#source").href = album.ref;
	if (album.unknown.length > 0) {
		$("#unknown").style.display = "block";
		$("#ucount").textContent = album.unknown.length;
		var ulist = $("#ulist");
		for (var i = 0; i < album.unknown.length; i++) {
			if (album.type) {
				var o = $("span");
				o.textContent = album.unknown[i];
			} else {
				var o = $("a");
				o.href = o.textContent = album.unknown[i];
			}
			ulist.appendChild(o);
			ulist.appendChild($("br"));
		}
	}
	$(album.type ? "#gallerytitle" : "#linktitle").style.display = "none";
	if (album.data.length > 0) {
		var list = $("#list");
		$("#count").textContent = album.data.length;
		for (var i = 0; i < album.data.length; i++) {
			var img = album.data[i];
			if (album.type) {
				var o = $("a");
				o.href = img.src;
				o.setAttribute("index", img.i);
				o.title = img.title;
				o.textContent = img.src;
				list.appendChild(o);
				list.appendChild($("br"));
			} else {
				var o = $("img");
				o.setAttribute("height", "128");
				o.setAttribute("width", "128");
				o.setAttribute("index", img.i);
				o.src = img.src;
				o.title = img.title;
				list.appendChild(o);
			}
		}
	}
	if (album.title) {
		document.title = "下载" + album.title;
	}
	if (chrome.downloads) {
		$("#apititle").style.display = "block";
	}
	$("#loading").style.display = "none";
	$("#loaded").style.display = "block";
};

function buildTable(data) {
	var tbody = $("#tbody");
	for (var i = 0; i < data.length; i++) {
		var img = data[i];
		var tr = $("tr");

		var td = $("td");
		td.textContent = img.i;
		tr.appendChild(td);

		var td = $("td");
		var a = $("a");
		a.textContent = a.title = img.title || img.src;
		a.target = "_blank";
		a.href = img.src;
		td.appendChild(a);
		tr.appendChild(td);

		var td = $("td");
		var p = $("progress");
		p.setAttribute("value", "0");
		p.setAttribute("max", "1");
		p.textContent = "0.0%";
		td.appendChild(p);
		tr.appendChild(td);

		var td = $("td");
		td.textContent = "等待下载";
		tr.appendChild(td);

		tbody.appendChild(tr);
	}
};

function switchLink() {
	var links = document.querySelectorAll("a[title]");
	for (var i = 0; i < links.length; i++) {
		var l = links[i];
		if (!l.title) {
			continue;
		}
		if (l.textContent != l.title) {
			l.textContent = l.title;
		} else {
			l.textContent = l.href;
		}
	}
};

function switchIndex(add) {
	var max = album.data.length+album.unknown.length;
	var links = document.querySelectorAll("*[index]");
	for (var i = 0; i < links.length; i++) {
		if (add) {
			links[i].title = seq(parseInt(links[i].getAttribute("index")), max) + (links[i].title ? " " + links[i].title : "");
		} else {
			links[i].title = links[i].title.replace(/^[0-9]+( |$)/, "");
		}
	}
};

function seq(n, max) {
	var i = 0;
	for (; max > 0; max = Math.floor(max / 10)) {
		i++;
	}
	n = "00000" + n;
	return n.substring(n.length - i, n.length);
};

function fixFilename(filename, ext) {
	var newName = filename.replace(/&amp;/g, "&").replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'")
			.replace(/[\t\n\r]/g, " ");
	// 替换不合法的字符
	// chrome对下载文件名的限制都是和windows一样的。在Mac上验证过
	newName = newName.replace(/\//g, "／").replace(/\\/g, "＼").replace(/:/g, "：")
		.replace(/\*/g, "＊").replace(/\?/g, "？").replace(/"/g, "“")
		.replace(/</g, "〈").replace(/>/g, "〉").replace(/\|/g, "｜");
	// chrome能够自动截短过长的文件名
	return newName + ext;
};

function download() {
	if (album.data.length == 0) {
		return;
	}
	downloadPool = {};
	var max = album.data.length + album.unknown.length;
	var images = album.data;

	for(var i = 0; i < images.length; i++) {
		(function(index) {
			var image = images[index];
			var url = image.src;
			var ext = (url.match(/\.[^\/]+$/) || [".jpg"])[0];
			var filename = seq(image.i, max) + (image.title ? "_" + image.title : "" );
			try {
				chrome.downloads.download({
					"url": url,
					"filename": fixFilename(filename, ext),
					"saveAs": false
				}, function(dId) {
					downloadPool[dId] = index;
				});
			} catch(ex) {
				setStatus(index, "下载出错");
			}
		})(i);
	}
};

function setStatus(index, text, url) {
	var tr = $("#tbody").children[index];
	if (tr == null) {
		return;
	}
	if (url == null) {
		tr.children[3].textContent = text;
	} else {
		var a = $("a");
		a.textContent = text;
		a.href = url;
		a.target = "_blank";
		tr.children[3].innerHTML = "";
		tr.children[3].appendChild(a);
	}
};

function setProgress(index, current, max) {
	var tr = $("#tbody").children[index];
	if (tr == null) {
		return;
	}
	if (current == null) {
		current = 0;
	}
	if (max == null) {
		max = 1;
	}
	var p = tr.children[2].firstElementChild;
	p.setAttribute("value", current);
	p.setAttribute("max", max);
	p.textContent = (Math.floor(current / max * 1000) / 10) + '%';
};

function exp() {
	$("#linktitle").style.display = "none";
	$("#gallerytitle").style.display = "none";
	$("#switchIndex").parentNode.style.display = "none";
	$("#list").style.display = "none";
	$("#exp").style.display = "none";
	$("#expWrapper").style.display = "";
	$("#wrapper").style.display = "";
	buildTable(album.data);
};

document.addEventListener("DOMContentLoaded", function() {
	$("#switchLink").addEventListener("click", switchLink, false);
	$("#switchIndex").addEventListener("click", function(event) {
		switchIndex(event.target.checked);
	}, false);
	$("#udetail").addEventListener("click", function() {
		var ulist = $("#ulist");
		if (ulist.style.display == "none") {
			ulist.style.display = "";
			$("#udetail").textContent = "收起";
		} else {
			ulist.style.display = "none";
			$("#udetail").textContent = "详情";
		}
	}, false);
	$("#download").addEventListener("click", download, false);
	$("#exp").addEventListener("click", exp, false);

	if (/LBBROWSER/.test(navigator.appVersion)) {
		$("#lbwarning").style.display = "";
	}

	var v = 0;
	try {
		v = parseInt(/Chrome\/(\d+)/.exec(navigator.appVersion)[1], 10);
	} catch(ex) {
	}
	if (v < 23) {
		$("#needTabs").style.display = "";
	}
}, false);

function msgListener(message, sender, sendResponse) {
	if (message.type != "initAlbum") {
		return;
	}
	album = message.album;
	showPhotos();
	if (chrome.runtime && chrome.runtime.onMessage) {
		chrome.runtime.onMessage.removeListener(msgListener);
	} else {
		chrome.extension.onMessage.removeListener(msgListener);
	}
};

// Chrome 2x+
if (chrome.runtime && chrome.runtime.onMessage) {
	chrome.runtime.onMessage.addListener(msgListener);
} else {
	chrome.extension.onMessage.addListener(msgListener);
}

if (chrome.downloads) {
	chrome.downloads.onChanged.addListener(function(downloadDelta) {
		var dId = downloadDelta.id;
		if (!(dId in downloadPool)) {
			return;
		}
		chrome.downloads.search({ id: dId }, function (results) {
			if (results.length != 1) {
				return;
			}
			var downloadItem = results[0];
			var dId = downloadItem.id;
			var index = downloadPool[dId];

			if (downloadItem.error) {
				setStatus(index, "下载出错");
			} else if (downloadItem.paused) {
				setStatus(index, "下载暂停");
			} else {
				switch (downloadItem.state) {
					case "in_progress":
						setStatus(index, "正在下载");
						break;
					case "interrupted":
						setStatus(index, "下载出错");
						break;
					case "complete":
						setStatus(index, "下载完毕");
						break;
				}
			}
			setProgress(index, downloadItem.bytesReceived, downloadItem.totalBytes);
		});
	}); 
}
