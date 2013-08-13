var permissions = {
	"Downloads": {
		permissions: ['downloads'],
		origins: [ "http://*.rrimg.com/", "http://*.xnimg.cn/", "http://*.rrfmn.com/", "http://*.xnpic.com/" ]
	}
};

function $(id) {
	return document.getElementById(id);
};


function checkPermission(t) {
	chrome.permissions.contains(permissions[t], function(result) {
		$("grant" + t).disabled = result;
		$("revoke" + t).disabled = !result;
	});
};

function onButtonClick(event) {
	var id = event.target.id;
	var p = /[A-Z].*$/.exec(id)[0];
	chrome.permissions[(id[0] == "g" ? "request" : "remove")](permissions[p], function(result) {
		checkPermission(p);
	});
};

function initPermission(t) {
	checkPermission(t);
	$("grant" + t).addEventListener("click", onButtonClick, false);
	$("revoke" + t).addEventListener("click", onButtonClick, false);
}

document.addEventListener("DOMContentLoaded", function() {
	initPermission("Downloads");
});
