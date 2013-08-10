var album = null;
var os = null;

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
			var a = $("a");
			a.href = a.textContent = album.unknown[i];
			ulist.appendChild(a);
			ulist.appendChild($("br"));
		}
	}
	if (album.data.length > 0) {
		buildTable(album.data);
	}
	if (album.title) {
		document.title = "下载 " + album.title;
	}
	$("#loading").style.display = "none";
	$("#loaded").style.display = "";
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
			.replace(/\//g, "／").replace(/\\/g, "＼").replace(/:/g, "：")
			.replace(/\*/g, "＊").replace(/\?/g, "？").replace(/"/g, "“")
			.replace(/</g, "〈").replace(/>/g, "〉").replace(/\|/g, "｜")
			.replace(/[\t\n\r]/g, " ");
	// 下面是最麻烦的文件名长度限制
	// 不同FileSystem对文件名长度的限制不同，一般来讲不应高于255
	var maxLength = 255;
	var restBytes = maxLength;
	var enc = $("#enclist").value;
	if (enc == "auto") {
		// 常见FS里，HFS+和NTFS都用的是UTF16编码，其他的都没有限制编码
		if (os == "win" || os == "mac") {
			enc = "utf16"
		} else {
			// 一般没人用utf32的，而一般相册/图片说明应该以中文为主，
			// 故即使是在UTF16的系统上，采用UTF8的算法也应该不会出大问题
			enc = "utf8"
		}
	}
	if (enc == "utf16") {
		restBytes -= ext.length * 2;
	} else if (enc == "utf8") {
		restBytes -= ext.length;
	} else {
		restBytes -= ext.length * 4;
	}
	for (var i = 0; i < newName.length; i++) {
		var charBytes;
		var charCode = newName.charCodeAt(i);
		if (enc == "utf16") {
			if (charCode < 65536) {
				charBytes = 2;
			} else {
				charBytes = 4;
			}
		} else if (enc == "utf8") {
			if (charCode < 128) {
				charBytes = 1;
			} else if (charCode < 2048) {
				charBytes = 2;
			} else if (charCode < 65536) {
				charBytes = 3;
			} else {
				// 虽然理论上存在5～6字节的...
				charBytes = 4;
			}
		} else {
			charBytes = 4;
		}
		if (restBytes >= charBytes) {
			restBytes -= charBytes;
		} else {
			return newName.substring(0, i - 1) + ext;
		}
	}
	return newName + ext;
};

function download() {
	if (album.data.length == 0) {
		return;
	}
	var max = album.data.length + album.unknown.length;
	var images = album.data;
	for (var i = 0; i < images.length; i++) {
		var image = images[i];
		var url = image.src;
		var ext = (url.match(/\.[^\/]+$/) || [".jpg"])[0];
		var filename = seq(image.i, max) + (image.title ? "_" + image.title : "" );
		image.filename = fixFilename(filename, ext);
	}
	album.dirname = fixFilename(album.title, "");
	window.postMessage({ type:"download", "album":album }, "*");
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

document.addEventListener("DOMContentLoaded", function() {
	$("#udetail").addEventListener("click", function() {
		var ulist = $("#ulist");
		if (ulist.style.display == "none") {
			ulist.style.display = "";
			$("#udetail").textContent = "收起";
		} else {
			ulist.style.display = "none";
			$("#udetail").textContent = "详情";
		}
	});
	$("#adv").addEventListener("click", function() {
		$("#encoding").style.display = "";
		$("#adv").style.display = "none";
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
			os = data.os;
			showPhotos();
			break;
		case "download":
			// do nothing
			break;
		case "start":
			setStatus(data.index, "正在下载");
			break;
		case "progress":
			setProgress(data.index, data.current, data.max);
			break;
		case "end":
			if (data.result == 0) {
				setStatus(data.index, "下载完毕", data.uri);
			} else {
				setStatus(data.index, "下载出错");
			}
			break;
		case "cancel":
			if (data.error) {
				alert(data.error);
			}
			break;
	}
}, false);
