var album = null;
var os = "mac";

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

function seq(n, max) {
	var i = 0;
	for (; max > 0; max = Math.floor(max / 10)) {
		i++;
	}
	n = "00000" + n;
	return n.substring(n.length - i, n.length);
};

function fixFilename(filename, ext, enc, pathBytes) {
	var newName = filename.replace(/&amp;/g, "&").replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'")
			.replace(/[\t\n\r]/g, " ");
	// 替换不合法的字符
	if (os == "win") {
		newName = newName.replace(/\//g, "／").replace(/\\/g, "＼").replace(/:/g, "：")
			.replace(/\*/g, "＊").replace(/\?/g, "？").replace(/"/g, "“")
			.replace(/</g, "〈").replace(/>/g, "〉").replace(/\|/g, "｜");
	} else if (os == "mac") {
		newName = newName.replace(/\//g, "／").replace(/:/g, "：");
	} else {
		newName = newName.replace(/\//g, "／").replace(/ /g, "");
	}
	// 下面是最麻烦的文件名长度限制
	// 不同FileSystem对文件名长度的限制不同，一般来讲不应高于255个单位，windows略高一点
	var maxUnits = 255;
	var unitBytes = 1;
	if (os == "win") {
		maxUnits = 259;		// PATH_MAX = 260，去掉最后的'\0'
		unitBytes = 2;
	} else if (os == "mac") {
		unitBytes = 2;
	}
	if (enc == "auto") {
		// 常见FS里，HFS+、NTFS、VFAT都用的是UTF16/USC-2编码，其他的都没有限制编码
		if (os == "win" || os == "mac") {
			enc = "utf16";
		} else {
			// 一般没人用UTF32的，而一般相册/图片说明应该以中文为主，
			// 故即使是在UTF16的系统上，采用UTF8的算法也应该不会出大问题
			enc = "utf8";
		}
	}
	var restBytes = maxUnits * unitBytes;
	if (enc == "utf16") {
		restBytes -= ext.length * 2;
	} else if (enc == "utf8") {
		restBytes -= ext.length;
	} else {
		restBytes -= ext.length * 4;
	}
	if (pathBytes && os == "win") {
		// windows会算整个路径长度，而不是每一部分的长度
		restBytes -= pathBytes;
		if (restBytes <= 0) {
			return null;
		}
	}
	for (var i = 0; i < newName.length; i++) {
		var charBytes = calcStringBytes(newName.charAt(i), enc);
		if (restBytes >= charBytes) {
			restBytes -= charBytes;
		} else {
			return newName.substring(0, i - 1) + ext;
		}
	}
	return newName + ext;
};

function calcStringBytes(str, enc) {
	var bytes = 0;
	for (var i = 0; i < str.length; i++) {
		var charBytes;
		var charCode = str.charCodeAt(i);
		if (enc == "utf16") {
			if (charCode < 65536) {
				bytes += 2;
			} else {
				bytes += 4;
			}
		} else if (enc == "utf8") {
			if (charCode < 128) {
				bytes += 1;
			} else if (charCode < 2048) {
				bytes += 2;
			} else if (charCode < 65536) {
				bytes += 3;
			} else {
				// 虽然理论上存在5～6字节的...
				bytes += 4;
			}
		} else {
			bytes += 4;
		}
	}
	return bytes;
};

function download(path) {
	if (album.data.length == 0) {
		return;
	}
	var enc = "utf16";
	album.dirname = fixFilename(album.title, "", enc);
	album.path = path;
	var pathBytes = calcStringBytes(album.dirname + album.path + "/", enc);

	var downloader = $("#downloader");

	var max = album.data.length + album.unknown.length;
	var images = album.data;
	for (var i = 0; i < images.length; i++) {
		var image = images[i];
		var url = image.src;
		var ext = (url.match(/\.[^\/]+$/) || [".jpg"])[0];
		var filename = seq(image.i, max) + (image.title ? "_" + image.title : "" );
		image.filename = fixFilename(filename, ext, enc, pathBytes);
		if (image.filename == null) {
			alert("路径过长，无法保存。请重新选择一个目录试试");
			return;
		}
	}
	for (var i = 0; i < album.data.length; i++) {
		var image = images[i];
		setStatus(i, "正在下载");
		if (downloader.download(image.src, path, album.dirname, image.filename)) {
			setProgress(i, 1, 1);
			setStatus(i, "下载完毕");
		} else {
			setStatus(i, "下载出错");
		}
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
	}, false);
	$("#download").addEventListener("click", function() {
		try {
			var dir = $("#downloader").getDir();
		} catch (ex) {
			alert("无法调用相册下载辅助插件，请检查是否正确安装");
			return;
		}
		if (dir) {
			download(dir);
		}
	}, false);
	safari.self.tab.dispatchMessage("xnr_getAlbumInfo", location.hash.substring(1));
});

safari.self.addEventListener("message", function(msg) {
	if (msg.name == "albumInfo") {
		album = msg.message;
		showPhotos();
	}
}, false);

