var permissions = {
	"Tabs": {
		permissions: ['tabs']
	},
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

document.addEventListener("DOMContentLoaded", function() {
	checkPermission("Tabs");
	checkPermission("Downloads");
	$("grantTabs").addEventListener("click", onButtonClick, false);
	$("revokeTabs").addEventListener("click", onButtonClick, false);
	$("grantDownloads").addEventListener("click", onButtonClick, false);
	$("revokeDownloads").addEventListener("click", onButtonClick, false);
});
