var album = null;

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
});

(function() {
	var rt = window.external.mxGetRuntime();
	var tab = rt.create("mx.browser.tabs").getCurrentTab();
	rt.listen("album_for_tab_" + tab.id, function(data) {
		album = data;
		showPhotos();
	});
})();

