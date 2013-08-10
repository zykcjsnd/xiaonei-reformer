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
	if (album.dlapi) {
		$("#apititle").style.display = "block";
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
			links[i].title = seq(parseInt(links[i].getAttribute("index")), max) + " " + links[i].title;
		} else {
			links[i].title = links[i].title.replace(/^[0-9]+ /, "");
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
	alert("本功能仍然处于实验阶段，所以有如下缺陷\n  * 图片只能下载到默认的下载文件夹中");
	var max = album.data.length + album.unknown.length;
	var images = album.data;
	for (var i = 0; i < images.length; i++) {
		var image = images[i];
		var url = image.src;
		var ext = (url.match(/\.[^\/]+$/) || [".jpg"])[0];
		var filename = seq(image.i, max) + (image.title ? "_" + image.title : "" );
		sogouExplorer.downloads.download({
			"url": url,
			"filename": fixFilename(filename, ext),
			"saveAs": false
		});
	}
};

document.addEventListener("DOMContentLoaded", function() {
	$("#switchLink").addEventListener("click", switchLink);
	$("#switchIndex").addEventListener("click", function(event) {
		switchIndex(event.target.checked);
	});
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
	$("#download").addEventListener("click", download);

	var t = location.hash.substring(1);
	sogouExplorer.extension.sendMessage({action:"albumInit", t:t}, function(response) {
		album = response.album;
		os = response.os;
		showPhotos();
	});
});
