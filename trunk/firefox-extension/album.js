var album = null;

var downCount;

function $(id) {
	if (id[0] == "#") {
		return document.getElementById(id.substring(1));
	} else {
		return document.createElement(id);
	}
}

function showPhotos() {
	if (album == null) {
		$("#loading").textContent = "数据传输出错！";
		return;
	}
	$("#source").textContent = album.ref;
	if (album.unknown.length > 0) {
		$("#unknown").style.display = "block";
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
		document.title = album.title;
	}
	$("#loading").style.display = "none";
	$("#loaded").style.display = "block";
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
			links[i].title = idx(parseInt(links[i].getAttribute("index")), max) + " " + links[i].title;
		} else {
			links[i].title = links[i].title.replace(/^[0-9]+ /, "");
		}
	}
};

function idx(n, max) {
	var i = 0;
	for (; max > 0; max = Math.floor(max / 10)) {
		i++;
	}
	n = "00000" + n;
	return n.substring(n.length - i, n.length);
};

function fixFilename(filename) {
	return filename.replace(/\//g, "／").replace(/\\/g, "＼").replace(/:/g, "：")
			.replace(/\*/g, "＊").replace(/\?/g, "？").replace(/"/g, "“")
			.replace(/</g, "〈").replace(/>/g, "〉").replace(/\|/g, "｜");
}

function download() {
	var max = album.data.length + album.unknown.length;
	var images = album.data;
	for (var i = 0; i < images.length; i++) {
		var image = images[i];
		var url = image.src;
		var ext = (url.match(/\.[^\/]+$/) || [".jpg"])[0];
		var filename = idx(image.i, max) + (image.title ? " " + image.title : "" ) + ext;
		image.filename = fixFilename(filename);
	}
	album.dirname = fixFilename(album.title);
	downCount = 0;
	var p = $("#allPercent");
	p.setAttribute("max", album.data.length);
	p.setAttribute("value", 0);
	p.textContent = "0 %";
	$("#progress").style.display = "";
	$("#downloading").textContent = "准备下载……";
	window.postMessage({ type:"download", "album":album }, "*");
}

document.addEventListener("DOMContentLoaded", function() {
	$("#switchLink").addEventListener("click", switchLink);
	$("#switchIndex").addEventListener("click", function(event) {
		switchIndex(event.target.checked);
	});
	$("#download").addEventListener("click", download);
});

window.addEventListener("message", function(message) {
	var data = message.data;
	if (!data) {
		return;
	}
	switch(data.type) {
		case "init":
			album = data.album;
			showPhotos();
			break;
		case "download":
			// do nothing
			break;
		case "start":
			$("#downloading").textContent = "正在下载：" + data.filename;
			break;
		case "progress":
			var p = $("#curPercent");
			p.setAttribute("value", data.value);
			p.setAttribute("max", data.max);
			p.textContent = Math.floor(data.value / data.max * 100) + ' %';
			break;
		case "end":
			var p = $("#allPercent");
			p.setAttribute("value", ++downCount);
			var max = album.data.length;
			p.textContent = Math.floor(downCount / max * 100) + ' %';
			if (downCount >= max) {
				$("#progress").style.display = "none";
			}
			break;
	}
}, false);
