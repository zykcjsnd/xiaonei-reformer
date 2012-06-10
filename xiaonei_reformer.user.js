// ==UserScript==
// @name           校内人人网改造器 Xiaonei Reformer
// @namespace      Xiaonei_reformer
// @include        http://renren.com/*
// @include        http://*.renren.com/*
// @exclude        http://*.renren.com/ajaxproxy*
// @exclude        http://wpi.renren.com/*
// @description    为人人网（renren.com，原校内网xiaonei.com）清理广告、新鲜事、各种烦人的通告，删除页面模板，恢复早期的深蓝色主题，增加更多功能……
// @version        3.3.4.484
// @miniver        484
// @author         xz
// @homepage       http://xiaonei-reformer.googlecode.com
// @run-at         document-end
// ==/UserScript==
//
// Copyright (C) 2008-2012 Xu Zhen
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
///

(function(){

if (window.self != window.top) {
	if(document.designMode=="on") {
		// 不在内容可以编辑的frame中运行
		return;
	} else if(document.location.href.match(/proxy|ime.htm/i)) {
		// 也不在ajaxproxy.html和ime.htm中运行
		return;
	}
}

// 基本参数
var XNR={};

// 版本，对应@version和@miniver，用于升级相关功能
XNR.version="3.3.4.484";
XNR.miniver=484;

// 存储空间，用于保存全局性变量
XNR.storage={};

// 当前用户ID
XNR.userId=$cookie("id","0");

// 当前页面
XNR.url=document.location.href;

// 选项
XNR.options={};

// 当前运行环境（浏览器）
const UNKNOWN=0,USERSCRIPT=1,FIREFOX=2,CHROME=4,SAFARI=8,OPERA_UJS=16,OPERA_EXT=32,SOGOU=128;
const GECKO=1,WEBKIT=2,PRESTO=4;
XNR.agent=UNKNOWN;
XNR.acore=UNKNOWN;
if (typeof GM_getResourceURL=="function") {
	XNR.agent=USERSCRIPT;
	XNR.acore=GECKO;
} else if(window.chrome) {
	XNR.agent=CHROME;
	XNR.acore=WEBKIT;
} else if (typeof sogouExplorer=="object" && sogouExplorer.extension) {
	XNR.agent=SOGOU;
	XNR.acore=WEBKIT;
} else if (window.safari) {
	XNR.agent=SAFARI;
	XNR.acore=WEBKIT;
} else if (window.opera) {
	// 没有window.opera.extension
	if(opera.extension) {
		XNR.agent=OPERA_EXT;
	} else {
		XNR.agent=OPERA_UJS;
	}
	XNR.acore=PRESTO;
} else if (typeof XNR_save=="function") {
	XNR.agent=FIREFOX;
	XNR.acore=GECKO;
}

// 针对Opera的特殊处理
if(XNR.acore==PRESTO) {
	// 判断当前阶段，document.readyState靠不住
	XNR.loadStage=0;
	window.addEventListener("load",function() {
		window.removeEventListener("load",arguments.callee,true);
		XNR.loadStage=3;
	},true);
	document.addEventListener("DOMContentLoaded",function() {
		document.removeEventListener("DOMContentLoaded",arguments.callee,true);
		XNR.loadStage=1;
	},true);

	if(XNR.agent==OPERA_EXT) {
		// opera扩展使用单一的消息接收函数
		XNR.msgHandlers={};
		XNR.oexSendRequest=function(msg,handler) {
			do {
				var reqId=parseInt(Math.random()*100000);
			} while(XNR.msgHandlers[reqId]!=null);
			XNR.msgHandlers[reqId]=handler;
			msg.reqId=reqId;
			opera.extension.postMessage(JSON.stringify(msg));
		};
		opera.extension.onmessage=function(event) {
			var response=JSON.parse(event.data);
			if(XNR.msgHandlers[response.reqId]) {
				XNR.msgHandlers[response.reqId].call(window,response.data);
				delete XNR.msgHandlers[response.reqId];
			}
		};
	} else {
		// opera用户JS的存储空间，需要在第一次执行时留个引用
		XNR.scriptStorage=window.opera.scriptStorage;
	}
}

// 页面工具的简写
var $=PageKit;

/* 以下开始所有功能 */

// 清除广告
function removeAds() {
	var ads=".ad-bar, .banner, .wide-banner, .adimgr, .blank-bar, .renrenAdPanel, .side-item.template, .rrdesk, .login-page .with-video .video, .login-page .side-column .video, .ad-box-border, .ad-box, .ad, .share-ads, .advert-con, .kfc-side, .imAdv, .kfc-banner, #sd_ad, #showAD, #huge-ad, #rrtvcSearchTip, #top-ads, #bottom-ads, #main-ads, #n-cAD, #webpager-ad-panel, #ad, #jebe_con_load, #partyLink, #hd_kama, #pro-clent-ad, .pro-clent-ad, .buddy-clent-ad, .box-body #flashcontent, div[id^='ad100'], .share-success-more>p>a>img[width='280'], img[src*='/adimgs/'], img[src*='adclick'], .sec.promotion, iframe[src*='adsupport.renren.com']";
	$ban(ads);
	$script("const ad_js_version=null",true);
	$wait(1,function() {
		$script("window.XN.jebe=1");
		// .blank-holder在游戏大厅game.renren.com不能删
		$(".blank-holder").remove(true);
		// 其他的横幅广告。如2010-06的 kfc-banner
		$("div[class$='-banner']").filter("a[target='_blank']>img").filter({childElementCount:1}).remove();
		$script("window.load_jebe_ads=function(){}");
		// 个人主页上的边栏广告
		var t=$(".col-right>.extra-side>div").eq(0);
		if (/收起/.test(t.find("a[href='#nogo']").text())) {
			t.remove();
		}
	});
};

// 去除页面模板
function removePageTheme() {
	const themes=[
		"head link[rel='stylesheet'][href*='/csspro/themes/'][href*='.css']", //节日模板
	//	"head link[rel='stylesheet'][href*='zidou_nav.css']",	// 紫豆导航栏
		"#domain_wrapper",	// 个人域名提示栏
		"#themeLink"	// 公共主页模板
	];
	$(themes.join(",")).remove();

	// 去除首页模板（直接去除会导致首页换肤功能出错）
	$("#hometpl_style style").text("");

	// 删除紫豆模板
	$("#diyStyleId").remove();
	$("head style").each(function() {
		var theme=$(this);
		if(theme.text().indexOf("url(http://i.static.renren.com")!=-1) {
			theme.remove();
			// 不修改紫豆导航栏样式，增加边距
			$patchCSS(".menu-bar{margin-bottom:10px}");
			return true;
		}
	});
	// 恢复原始模板
	if($page("profile") && !$page("pages") && !$page("lover")) {
		var skin=$("head>link[href*='profile-skin.css'],head>link[href*='home-all-min.css']");
		if(skin.empty()) {
			$("@link").attr({type:"text/css",rel:"stylesheet",href:"http://s.xnimg.cn/csspro/apps/profile-skin.css"}).addTo($("head"));
		}
	}
	// 修复Logo
	var bgImage = $(".menu-bar").curCSS("background-image");
	if (bgImage == null || bgImage == "none") {
		var logo = $("img[src*='viplogo-renren.png']");
		if (logo.size()) {
			logo.attr({
				height: null,
				width: null,
				src: logo.attr("src").replace("viplogo-renren.png", "logo-renren.png"),
			});
		}
	}
};
function removeHomeTheme() {
	// 特定节日模板
	var sa = $(".skin-action, #closeHomeSkin");
	if(sa.exist()) {
		if(/关闭/.test(sa.text())) {
			sa.trigger("click");
		}
		$patchCSS("a.skin-action, #closeHomeSkin, #useHomeSkin{display:none}");
	}
	// 状态输入框皮肤
	var sa = $("a[title='关闭皮肤']");
	if (sa.exist()) {
		sa.trigger("click");
	}
};

// 去除升级星级用户提醒
function removeStarReminder() {
	const target="#tobestar, #realheadbulletin, #noStarNotice, #nostar, #home_nostar";
	$ban(target);
};

// 去除页面漂浮物
function removeFloatObject() {
	const target="#floatBox";
	$ban(target);
};

// 去除页面自定义鼠标指针
function removeMouseCursor() {
	$patchCSS("#opi{cursor:auto !important}");
};

// 去除VIP页面入场动画
function removeEnterCartoon() {
	// 动画最上层div的z-index为1000001
	const target="#mask,#preveiwSwf,body>div[style*='1000001']";
	$ban(target);
	// 样式会将body的高度设为100%，overflow设成hidden
	var p = $patchCSS("html,body{height:auto;overflow:auto}");
	$wait(1, function(){
		var l = $("link[href*='cartoon.']");
		if (l.exist()) {
			l.remove();
		}
		p.remove();
	});
};

// 去除日志信纸
function removeBlogTheme() {
	$("head style").each(function() {
		var s=$(this);
		if(s.text().indexOf(".text-article")!=-1) {
			s.remove();
			return true;
		}
	});
	$(".blog-wrap").removeClass("blog-wrap");
};

// 删除日志中整段的链接
function removeBlogLinks() {
	$("#blogContent a, #shareBody a").each(function() {
		var o=$(this);
		// 链接到其他日志
		if($page("blog",this.href) || $page("page_blog",this.href)) {
			if(o.text().length>70) {
				o.tag("span");
			}
			return;
		}
		// 只处理链接到个人主页/公共主页或外部链接中非ASCII文字大于20个的。
		if($page("profile",this.href) || $page("page_home",this.href) || o.text().match(/[\u0100-\uffff]{20,}/)) {
			o.tag("span");
		}
	});
};

// 删除日志里的附加音乐
function removeBlogMusicPlayer() {
	const target="embed[src*='player.swf'], embed[src*='Player.swf']";
	$ban(target);
};

// 删除公共主页上音乐播放器
function removePagesMusicPlayer() {
	const target="div.mod.music, #ZDMusicPlayer";
	$ban(target);
};


// 隐藏底部工具栏
function removeBottomBar() {
	const target="#bottombar, #imengine";
	$patchCSS(target+"{display:none !important}");
};


function removeHomeGadgets(gadgetOpt) {
	const gadgets={
		"topNotice":".notice-holder, #notice_system",		// 顶部通知
		"footprint":"#footPrint",	// 最近来访
		"recommendApp":".site-menu-apps.recommend",	// 推荐应用，v5版主页
		"recommendGift":"#recommendGift",	// 推荐礼物
		"newFriends":"#recommendFriends,#pymk_home,#pymk_home_2,.pymk.pymk-home,.find-friend-box,#myknowfriend_user",	// 好友推荐，后面2个是新注册用户页面上的
		"schoolBeauty":"#schoolBeautyBox,#xiaoTaoHua",	// 校花校草
		"sponsors":"#sponsorsWidget,.wide-sponsors",	// 赞助商内容
		"birthday":"#homeBirthdayPart",	// 好友生日
		"survey":".side-item.sales-poll",	// 人人网调查
		"friendPhoto":"#friendPhoto",	// 朋友的照片
		"newStar":".star-new,#highSchoolStar",	// 人气之星
		"contact":".side-item.get-touch",	// 联系朋友
		"groups":".site-menu-minigroups, #site-menu-nav>.minigroups",	// 我的群
	};
	const filters={
		"webFunction":{t:".side-item",f:".web-function"},	// 站内功能
		"publicPageAdmin":{t:".site-menu-apps",f:".site-menu-apps-admins"},	// 主页管理
		"recommendApp":{t:".site-menu-apps",f:".site-menu-apps-recommend"},	// 推荐应用
	};

	if(!$allocated("home_gadgets")) {
		var patch=""
		for(var g in gadgets) {
			if(!gadgetOpt[g]) {
				continue;
			}
			patch+=gadgets[g]+",";
		}
		if(patch) {
			$ban(patch.substring(0,patch.length-1));
		}
		$alloc("home_gadgets");
	}

	if(gadgetOpt["appList"]) {
		$patchCSS("#site-menu-apps-nav{display:none}"); // 应用列表
		$patchCSS(".site-menu-nav-box>.site-menu-apps:not(.recommend){display:none}"); // 应用列表，v5主页
	}

	$wait(1,function() {
		for(var g in filters) {
			if(gadgetOpt[g]) {
				$(filters[g].t).filter(filters[g].f).remove();
			}
		}
	});
};

// 去除个人主页组件
function removeProfileGadgets(gadgetOpt) {
	const gadgets={
		"album":"#album.mod, #latestPhotos",
		"blog":"#blog.mod",
		"share":"#share.mod",
		"gift":"#gift.mod",
		"fav":"#kuAi.mod",
		"lover":"#lover-space-div.mod",
		"specialFriends":"#spFriends.mod",
		"mutualFriends":"#cmFriends.mod",	// 当无共同好友时显示最近玩过的应用
		"visitors":"#visitors.mod",
		"pages":"#pages.mod",
		"friends":"#friends.mod",
		"theme":"li.dressup,#dressup",
		"invitation":".guide-find-friend,p.inviteguys",
		"introduceFriends":"#commend-friends",
		"musicPlayer":"#zidou_music,#ZDMusicPlayer",
		"activity": "#gift-act.mod"
	};
	var patch="";
	for(var g in gadgetOpt) {
		if(!gadgetOpt[g]) {
			continue;
		}
		patch+=gadgets[g]+",";
	}
	if(patch) {
		$ban(patch.substring(0,patch.length-1));
	}
	if (gadgetOpt["activity"]) {
		$wait(1,function(){
			var t=$(".col-right>.extra-side>div").eq(0);
			t.find("a[href='#nogo']").each(function(){
				if (/退出活动/.test(this.textContent)) {
					t.remove();
					return false;
				}
			});
		});
	}
};

// 隐藏请求
function hideRequest(req) {
	var rule = "";
	if (req["appRequest"]) {
		rule += "#appsItem_26{display:none !important}";
	}

	if (req["friendRequest"] && req["recommendRequest"]) {
		rule += ".side-item.message-box .friend-new sup{display:none !important}, .message-box dt.friend-new{background-position:12px -28px}";
	}

	if (req["notifyRequest"] && req["pokeRequest"] && req["loverRequest"] && req["xiaozuRequest"]) {
		rule += ".side-item.message-box .desire-new sup{display:none !important}, .message-box dt.desire-new{background-position:12px -98px}";
	}

	if (req["addbookRequest"] && req["tagRequest"]) {
		rule += ".side-item.message-box .remind-new sup{display:none !important}, .message-box dt.remind-new{background-position:12px -170px}";
	}

	if (rule) {
		$patchCSS(rule);
	}
};
// 自动拒绝请求
function rejectRequest(req,blockApp,igNotification,igReminder) {
	// 应用请求
	if(req["appRequest"]==true || blockApp==true) {
		$get("http://app.renren.com/app/appRequestList",function(html) {
			if(html==null) {
				return;
			}
			// 一般应用
			var command;
			var regexpr=/ignore_all_request\((\d+),(\d+),'(.*?)'\)/g;
			var links=[];
			while(command=regexpr.exec(html)) {
				if(blockApp==true) {
					// 屏蔽同时会清空当前的请求队列
					links.push("http://app.renren.com/req/blockAppRequest/block?action=block&type="+command[1]+"&appId="+command[2]);
				} else {
					links.push("http://app.renren.com/request/ignoreAppRequest.do?type="+command[1]+"&appId="+command[2]);
				}
			}
			var executer = function() {
				if(links.length>0) {
					var link=links.shift();
					$get(link,executer,null,"POST");
				}
			}
			executer();
		});
	}

	if(igNotification) {
		// http://req.renren.com/notify/nt
		$get("http://notify.renren.com/rmessage/rmessage-rmall.html?view=16&bigtype=3", null, null, "POST");
	}

	if(igReminder) {
		$get("http://notify.renren.com/rmessage/get?getbybigtype=1&bigtype=1&limit=20&begin=1&view=16&rand="+Math.random(), function(html) {
			try {
				var nl=JSON.parse(html);
			} catch(ex) {
				return;
			}
			var links=[];
			for (var i=0;i<nl.length;i++) {
				var link=nl[i].rmessagecallback;
				if (link) {
					links.push(link);
				}
			}
			var executer = function() {
				if(links.length>0) {
					var link=links.shift();
					$get(link,executer,null,"POST");
				}
			}
			executer();
		});
	}

	if(req["tagRequest"] || req["recommendRequest"] || req["loverRequest"] || req["xiaozuRequest"] || req["addbookRequest"] || req["friendRequest"] || req["pageRequest"]) {
		$get("http://req.renren.com/xmc/gmc", function(html) {
			var links=[];
			// 好友申请
			if(req["friendRequest"]) {
				var command;
				var regexpr = /friend_refuse:(\d+)/g;
				while (command = regexpr.exec(html)) {
					links.push("http://friend.renren.com/rejguereq.do?id=" + command[1]);
				}
			}
	
			// 圈人请求
			if(req["tagRequest"]) {
				var command;
				var regexpr = /tagPhoto_refuse:(\d+)/g;
				while (command = regexpr.exec(html)) {
					links.push("http://photo.renren.com/refuseptrequest.do?id=" + command[1]);
				}
			}
			// 好友推荐
			if(req["recommendRequest"]) {
				var command;
				var regexpr = /tuijian_refuse:(\d+),\S+?,(\d+)/g;
				while (command = regexpr.exec(html)) {
					links.push("http://friend.renren.com/j_f_deny_rcd?r=" + command[1] + "&s=" + command[2]);
				}
			}
			// 情侣请求，尚无全部拒绝功能
			if(req["loverRequest"]) {
				var command;
				var regexpr = /lover_ignore:.*?id=(\d+)/g;
				while (command = regexpr.exec(html)) {
					links.push("http://lover.renren.com/love/request/accept?id=" + command[1]);
				}
			}
			// 小组邀请
			if(req["xiaozuRequest"]) {
				var command;
				var regexpr = /xiaozu-i_refuse:.*?\/(\d+)\//g;
				while (command = regexpr.exec(html)) {
					links.push("http://xiaozu.renren.com/xiaozu/" + command[1] + "/invite/refuse");
				}
			}
			// 通讯录请求
			if(req["addbookRequest"]) {
				var command;
				var regexpr = /addr_refuse:(\d+)/g;
				while (command = regexpr.exec(html)) {
					links.push("http://www.renren.com/address/ignorecard?id=" + command[1]);
				}
			}
			// 公共主页邀请
			if(req["pageRequest"]) {
				var command;
				var regexpr = /pageInvite_refuse:(\d+),(\d+)/g;
				while (command = regexpr.exec(html)) {
					links.push("http://page.renren.com/apply/ignore?rid=" + command[1] + "&pid=" + command[2]);
				}
			}
			var executer = function() {
				if(links.length>0) {
					var link=links.shift();
					$get(link,executer,null,"POST");
				}
			}
			executer();
		});
	}
};

// 允许批量处理请求
function batchProcessRequest() {
	// 好友申请
	addLink("friend", "接受", "好友申请", "http://friend.renren.com/ApplyGuestRequest.do?friendId=${0}", /\d+/);
	// 全部拒绝已失效？
	// $get("http://friend.renren.com/delallguestrequest.do?id=" + XNR.userId, null, null, "POST");
	addLink("friend", "拒绝", "好友申请", "http://friend.renren.com/rejguereq.do?id=${0}", /\d+/);
	
	// 好友推荐
	addLink("tuijian", "接受", "好友推荐", "http://friend.renren.com/ajax_request_friend.do?from=req.renren.com/xmc/gmc&codeFlag=0&code=&why=&id=${1}&matchmaker=${2}", /:(\d+),[^,]+,[^,]+,(\d+)/);
	addLink("tuijian", "忽略", "好友推荐", "http://friend.renren.com/j_f_deny_rcd?r=${1}&s=${2}", /:(\d+),[^,]+,[^,]+,(\d+)/);

	// 圈人请求
	addLink("tagPhoto", "接受", "圈人请求", "http://photo.renren.com/acceptptrequest.do?id=${0}", /\d+/);
	addLink("tagPhoto", "拒绝", "圈人请求", "http://photo.renren.com/refuseptrequest.do?id=${0}", /\d+/);

	// 通讯录请求
	addLink("addr", "接受", "交换名片请求", "http://www.renren.com/address/acceptcard?id=${0}", /\d+/);
	addLink("addr", "拒绝", "交换名片请求", "http://www.renren.com/address/ignorecard?id=${0}", /\d+/);

	// 小组邀请
	addLink("xiaozu-i", "接受", "小组邀请", "http://xiaozu.renren.com/xiaozu/${1}/add", /\/(\d+)\//);
	addLink("xiaozu-i", "忽略", "小组邀请", "http://xiaozu.renren.com/xiaozu/${1}/invite/refuse", /\/(\d+)\//);

	// 应用请求
	addLink("appmessage", "接受", "应用请求", "http://app.renren.com/request/handleRequest.do?rid=${1}&appId=${2}&type=${3}", /:(\d+),(\d+),(\d+)/);
	addLink("appmessage", "拒绝", "应用请求", "http://app.renren.com/request/ignoreAppRequest.do?rid=${1}&appId=${2}&type=${3}", /:(\d+),(\d+),(\d+)/);

	// 公共主页邀请
	addLink("pageInvite", "接受", "应用请求", "http://page.renren.com/apply/accept?rid=${1}&pid=${2}", /:(\d+),[^,]+,(\d+)/);
	addLink("pageInvite", "拒绝", "应用请求", "http://page.renren.com/apply/ignore?rid=${1}&pid=${2}", /:(\d+),[^,]+,(\d+)/);

	function addLink(id, action, type, link, regexpr) {
		var header = $("#requests_" + id + "_header");
		if (header.size() != 1) {
			return;
		}
		var a = $("@a").attr({"href":"javascript:;", "style":"margin-left:10px"});
		a.text("全部" + action).addTo(header).bind("click", function() {
			if (!window.confirm("确实要" + action + "所有列出的" + type + "吗？")) {
				return;
			}
			var links=[];
			$("#requests_" + id + "_list button[click^='" + id + "_accept:']").each(function() {
				var param = regexpr.exec($(this).attr("click"));
				if (param) {
					var ilink = link;
					for (var i = 0; i < param.length; i++) {
						ilink = ilink.replace("${" + i + "}", param[i])
					}
					links.push(ilink);
				}
			});
			var total = links.length;
			var box = $("@div").css({zIndex:"999999", width:"100%", height:"100%", position:"fixed", background:"rgba(0,0,0,0.8)", color:"#fff", left:0, top:0, textAlign:"center", verticalAlign:"middle", lineHeight:document.documentElement.clientHeight+"px"}).addTo(document);
			if (total > 0) {
				var executer = function() {
					if (links.length > 0) {
						box.text("处理中，请稍候..."+parseInt((total-links.length)*100/total)+"%");
						var link = links.shift();
						$get(link,executer,null,"POST");
					} else {
						box.text("已经" + action + "了所有" + type + "，将刷新页面……");
						window.location.reload();
					}
				};
				executer();
			}
		});
	}
};

// 忽略通知。实际只隐藏，其他工作在rejectRequest中完成
function ignoreReminder() {
	$patchCSS("#navMessage .remind i, #bubbleRemind{display:none !important}");
}

// 忽略提醒。实际只隐藏，其他工作在rejectRequest中完成
function ignoreNotification() {
	$patchCSS("#navMessage .notice i, #bubbleNotice{display:none !important}");
}


// 隐藏特定类型/标题新鲜事
function hideFeeds(evt,feeds,mark,badTitles,badIds,goodIds,hideOld,hideDays) {
	if(evt && evt.target.tagName!="ARTICLE") {
		return;
	}
	if(hideOld) {
		// 先算出截止时间，减少重复计算量
		hideDays=parseInt(hideDays);
		var deadline=new Date(new Date()-hideDays*86400000);
		var curMonth=new Date().getMonth()+1;
		var d={m:deadline.getMonth()+1,d:deadline.getDate()};
	}
	if(badIds && (feeds.share==false || feeds.status==false)) {
		var bidFilter="a[href*='profile.do?id="+badIds.split("|").join("'],a[href*='profile.do?id=")+"']," + "a[href*='page.renren.com/"+badIds.split("|").join("'],a[href*='page.renren.com/")+"']";
	}
	if(goodIds) {
		var gidFilter="a[href*='profile.do?id="+goodIds.split("|").join("'],a[href*='profile.do?id=")+"']";
	}
	(evt?$(evt.target):$("div.feed-list>article")).filter(function(elem) {
		var feed=$(elem);
		var fh3=feed.find("h3");
		var fshareTitle=feed.find(".content").find(".title,.video-title,.blog-title,.link-title").text();
		var fstatus=feed.find(".content .original-stauts");
		if(goodIds && fh3.find(gidFilter).exist()) {
			return false;
		}
		if(badTitles) {
			if(fh3.text().replace(/\s/g,"").match(badTitles)) {
				return true;
			}
			if(fshareTitle && fshareTitle.replace(/\s/g,"").match(badTitles)) {
				return true;
			}
			if(fstatus.exist() && fstatus.text().replace(/\s/g,"").match(badTitles)) {
				return true;
			}
		}
		if(hideOld) {
			var time=feed.find(".duration").text();
			if(/([0-9]+)天前/.test(time) && parseInt(RegExp.$1)>=hideDays) {
				return true;
			} else if(/([0-9]{1,2})-([0-9]{1,2})\s+[0-9]{1,2}:[0-9]{1,2}/.test(time)) {
				var t={m:parseInt(RegExp.$1),d:parseInt(RegExp.$2)};
				if(t.m<=curMonth) {
					// 今年的
					if(d.m<=curMonth) {
						// 截止日期是今年的
						if(t.m<d.m || (t.m==d.m && t.d<=d.d)) {
							return true;
						}
					}
					// 截止日期是去年的就不用管
				} else {
					// 去年的？
					if(d.m<=curMonth) {
						// 截止日期是今年的
						return true;
					} else {
						// 截止日期也是去年的
						if(t.m<d.m || (t.m==d.m && t.d<=d.d)) {
							return true;
						}
					}
				}
			}
		}
		var type=$feedType(feed);
		return (type!="" && feeds[type]==true) || (type.match("^share|status") && badIds && fh3.find(bidFilter).exist())
	}).each(function() {
		if(mark) {
			try {
				var id=this.id.match("[0-9]+")[0];
				$get("http://www.renren.com/readNews.do?t=s&i="+id);
			} catch(ex) {
				$error("hideFeeds::get",ex);
			}
			// 发送请求后只隐藏不删除。因为添加到页面后有一句eval_inner_JS()，如果在此之前删除的话会导致异常
		}
		$(this).hide();
	});
};

// 首页默认显示特别关注
function showAttentionFeeds() {
	var code = 'var c=0;setTimeout(function(){var t=document.getElementById("feedTabAttention");if(!t){if(t<10){setTimeout(arguments.callee,200);c++}return}var e=document.createEvent("Events");e.initEvent("click",true,true);t.dispatchEvent(e)},100)';
	$script(code);
};

// 加载更多页新鲜事
function loadMoreFeeds(pages) {
	const code="(function(){"+
		"var nf=window.newsfeed,ahm=window.asyncHTMLManager;"+
		"if(!nf||!nf.data||nf.data.length==0||nf.data.loading||!ahm||ahm.rendering){"+
			"setTimeout(arguments.callee,200);"+
			"return"+
		"}"+
		// 只要还有多的新鲜事且当前页数比预定页数少，就不断加载下一页
		"if(nf.olen!=nf.data.length&&nf.data.length/(nf.itemsPerPage||20)<"+pages+"){"+
			"nf.olen=nf.data.length;"+
			"nf.append();"+
			"setTimeout(arguments.callee,1000)"+
		"}"+
	"})()";
	$script(code);
};

// 禁止在窗口滚动到底部时自动加载下一页新鲜事
function disableAutoLoadFeeds() {
	// 也可劫持newsfeed.append/addEvent，移除事件函数，但并无太大效率提升
	var code="(function(){"+
		"try{"+
			"window.newsfeed.autoLoad=0"+
		"}catch(ex){"+
			"setTimeout(arguments.callee,200)"+
		"}"+
	"})()";
	$script(code);
};

// 不显示新鲜事发布方式
function hideFeedSource() {
	$patchCSS(".feed-list .details .legend span.from{display:none}");
}

// 在新鲜事中标记在线好友
function markOnlineFriend(evt) {
	if(evt && evt.target.tagName!="ARTICLE") {
		return;
	}

	if($allocated("onlineFriends")) {
		mark($alloc("onlineFriends").list);
		return;
	}
	$get("http://wpi.renren.com/getonlinefriends.do",function(html) {
		if(!html) {
			return;
		}
		var online=JSON.parse(html).friends;
		if(!online) {
			return;
		}
		var onlineFriends={};
		for(var i=0;i<online.length;i++) {
			onlineFriends[online[i].id]=online[i].name;
		}
		$alloc("onlineFriends").list=onlineFriends;
		mark(onlineFriends);
	});

	function mark(list) {
		(evt?$(evt.target):$(".feed-list>article")).each(function() {
			$(this).find("h3>a[href*='profile.do?']").each(function() {
				var id=/id=([0-9]+)/.exec(this.href)[1];
				if(id && list[id]) {
					if($(this).superior().find("img.on-line[mark='"+id+"']").empty()) {
						// 还没标记过
						$("@img").attr({"class":"on-line",height:"12",width:"13",onclick:"javascript:talkto("+id+",'"+list[id]+"');return false;",title:"点此和"+list[id]+"聊天",src:"http://xnimg.cn/imgpro/icons/online_1.gif?ver=$revxxx$",style:"vertical-align:baseline;cursor:pointer","mark":id}).move("before",this);
					}
				}
			});
		});
	}
};

// 收起新鲜事回复
function flodFeedComment() {
	// 先隐藏起来
	var p=$patchCSS(".feed-list .details>.replies{display:none}");
	// 修改loadJSON方法，loadJSON原方法最后会调用show强制显示
	var code="var count=0;"+
	"(function(){"+
		"try{"+
			"var c=['','4Qun','4Zhan'];"+
			"for(var i=0;i<c.length;i++){"+
				"var p=window.XN.app.status['replyEditor'+c[i]].prototype;"+
				"var code=p.loadJSON.toString().replace(/function *\\(json\\) *{/,'').replace(/}$/,'').replace(/this.show\\([^\\)]*\\)/,'this.hide()');"+
				"p.loadJSON=new Function('json',code)"+
			"}"+
		"}catch(e){"+
			"count++;"+
			"if(count<5)"+
				"setTimeout(arguments.callee,500);"+
		"}"+
	"})()";
	$script(code);
	$wait(1,function() {
		var list=[];
		$(".feed-list").find(".details .legend a[id^='reply']").each(function() {
			list.push(this.id.match("[0-9]+$")[0]);
		});
		if(list.length>0) {
			// hide()中会执行this._inputHelper.focus()，导致页面往下滚动，故hide前先将其无效化
			var code="try{var list="+JSON.stringify(list)+";var uf=function(){};for(var i=0;i<list.length;i++){var e=getReplyEditor(list[i],'f');var t=e.getEl('input');var f=t.focus;t.focus=uf;e.hide();t.focus=f}}catch(e){}";
			$script(code);
		}
		p.remove();
	});
};

// 展开新鲜事回复时强制重载
function refreshFeedReply() {
	const code="var count=0;"+
	"(function(){"+
		"try{"+
			"var f=XN.app.status.replyEditor.prototype;"+
			"if(f.showO)"+
				"return;"+
			"f.showO=f.show;"+
			"f.show=function(mode){"+
				"var id=this.getID('show_more_link');"+
				"if(!$(id)){"+
					"var c=document.createElement('div');"+
					"c.id=id;"+
					"c.className='statuscmtitem showmorereply';"+
					"$(this.getID('replyList')).appendChild(c)"+
				"}"+
				"this.loadFromJSON=true;"+
				"this._hasLoadAll=false;"+
				//"this._replyCount=0;"+  如果是 显示XX条中的最新YY条 这种，会导致数量错误，对楼层计数功能有影响
				"this.showO(mode)"+
			"}"+
		"}catch(ex){"+
			"count++;"+
			"if(count<10)"+
				"setTimeout(arguments.callee,200)"+
		"}"+
	"})()";
	$script(code);
};

// 总是显示新鲜事控制按钮
function showFeedToolbar() {
	$patchCSS(".feed-toolbar{visibility:visible !important}");
};

// 自动检查提醒新鲜事更新
function autoCheckFeeds(feedFilter,badTitles,badIds,goodIds,checkReply) {
	// 每隔90秒检查一次
	const interval=90;

	// 在bottombar上建立一个新的接收区域
	if($("#bottombar").exist()) {
		(function() {
			if($("#webpager #setting-panel").empty()) {
				// 底部工具栏尚未建立完毕，继续等待
				setTimeout(arguments.callee,1000);
				return;
			}
			var root=$("@div").attr("class","popupwindow notify-panel").addTo($("@div").attr({"class":"panel",id:"feed-panel"}).move("before",$("#webpager #setting-panel")));
			var Btn=$("@div").attr("class","panelbarbutton").addTo(root);
			$("@img").attr({"class":"icon",height:"16",width:"16",src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA4klEQVQ4y61TsQrCQAztp9lCO3dz82N0cXFydXIWP0LE3Q/QxVEoR0Fpz15P3sGlSWlpix6EvOSSl9ccDYJ/nNnyZBfro53iqRmJ3fnmbHW42O31PiomEgBcwHjhUEwE881eSPNxG7fv4UlBXddkxhiLw+Oq+ogYXnwCCjxR13SOfT0pAODMuATmk31sjXI5rXW3AhT1Teb4VWipQClFCvj0tiqPxQ7SNHWMY3cAjHr0iVcY2gHPP7J3oyAMQ5sX2eQdoM8RxHFsn3kp3rlvB1xVkiTN/wA2b1EUCevKieZfzxcMt3dNdxsqQQAAAABJRU5ErkJggg%3D%3D",alt:"新鲜事",title:"新鲜事"}).addTo(Btn);
			$("@div").attr({id:"feed_toread_tip","class":"buttontooltip",style:"display:none"}).add($("@strong").attr("id","feed_toread_num").text("0")).addTo(Btn);
			var list=$("@article").attr("class","window").css({right:"-84px",width:"280px"}).html('<header><h4>新的新鲜事</h4><menu><command title="最小化" label="最小化" class="minimize"></command></menu></header><section><p style="padding:5px;">没有新的新鲜事</p><div class="notification" style="display:none"></div></section>').addTo(root);
			Btn.bind("click",function(evt) {
				var root=$("#webpager #feed-panel .notify-panel");
				var list=$("#webpager #feed-panel .window");
				if(root.attr("class").indexOf("actived")!=-1) {
					list.hide();
					root.removeClass("actived");
				} else {
					list.show();
					root.addClass("actived");
				}
				root.find("#feed_toread_tip").hide();
				root.find("#feed_toread_num").text("0");
			});
			list.find("command").bind("click",function(evt) {
				$("#webpager #feed-panel .window").hide();
				$("#webpager #feed-panel .notify-panel").removeClass("actived");
				// 清空计数
				$("#feed_toread_num").text("0");
				$("#feed_toread_tip").hide();
			});
			list.find(".notification").bind("DOMNodeRemoved",function(evt) {
				var node=$(evt.relatedNode);
				if(node.heirs()<=1) {
					// 事件触发时节点还没有删掉
					node.hide();
					node.sibling(-1).show();
				}
				// 清空计数
				$("#feed_toread_num").text("0");
				$("#feed_toread_tip").hide();
			});
		})();
	}

	(function(fTime) {
		// 应该用post，不过get也行
		$get("http://www.renren.com/feedretrieve2.do?p=0",function(html,url,firstTime) {
			if(html==null) {
				return;
			}
			if(url.indexOf("feedretrieve2")>0) {
				var r=html.split("##@L#");
				if(r.length<4 || !/^\d+$/.test(r[1])) {
					// 回复结构变了
					$error("autoCheckFeeds","获取新鲜事的页面结构发生变化");
					return;
				}
				r=r[0];
			} else {
				var r=html;
			}
			try {
				// 获取新鲜事列表
				var feedList=$("@ul").html(r.replace(/onload=".*?"/g,"").replace(/<script.*?<\/script>/g,"").replace(/src="http:\/\/s\.xnimg\.cn\/a\.gif"/g,"").replace(/lala=/g,"src="));
				if(badIds && feedFilter.share==false && feedFilter.status==false) {
					var bidFilter="a[href*='profile.do?id="+badIds.split("|").join("'],a[href*='profile.do?id=")+"'],"+"a[href*='page.renren.com/"+badIds.split("|").join("'],a[href*='page.renren.com/")+"']";
				}
				if(goodIds) {
					var gidFilter="a[href*='profile.do?id="+goodIds.split("|").join("'],a[href*='profile.do?id=")+"']";
				}
				// 滤除新鲜事
				for(var i=feedList.heirs()-1;i>=0;i--) {
					var feed=feedList.child(i);
					var fh3=feed.find("h3");
					var fshareTitle=feed.find(".content").find(".title,.video-title,.blog-title").text();
					var fstatus=feed.find(".content .original-stauts");
					if(goodIds && fh3.find(gidFilter).exist()) {
						// 在白名单上
						continue;
					}
					if(badTitles) {
						if(fh3.text().replace(/\s/g,"").match(badTitles)) {
							// 按标题滤除
							feed.remove();
							continue;
						}
						if(fshareTitle && fshareTitle.replace(/\s/g,"").match(badTitles)) {
							//  分享的标题
							feed.remove();
							continue;
						}
						if(fstatus.exist() && fstatus.text().replace(/\s/g,"").match(badTitles)) {
							// 转发的状态也算做标题
							feed.remove();
							continue;
						}
					}
					// 按类型滤除
					var feedType=$feedType(feed);
					if(feedType && feedFilter[feedType]) {
						feed.remove();
					} else if(feedType.match("^share") && badIds && fh3.find(bidFilter).exist()) {
						feed.remove();
					}
				}

				if(feedList.heirs()==0) {
					return;
				}

				// 整理新鲜事内容
				var feedArray=[];
				var similarFeedArray=[];
				for(var i=0;i<feedList.heirs();i++) {
					var feedInfo=feedList.child(i);

					var id=feedInfo.attr("id");
					var icon=feedInfo.find(".newsfeed-user>a>img").attr("src");
					var feedText=feedInfo.find("h3").html().replace(/^\s+|\s+$/,"");
					var publisher=feedInfo.find("h3>a").eq().attr("href");
					var lastReply=0;
					var lastReplyTime="";
					var oldFeeds=$alloc("xnr_feed");

					// 被隐藏的相似新鲜事
					var simIds=feedInfo.find(".similar-feed a[data-similar-feeds]").attr("data-similar-feeds");
					if(simIds) {
						simIds=simIds.split(",");
						for(var j=0;j<simIds.length;j++) {
							var sid=simIds[j];
							if(sid && oldFeeds[sid]==null) {
								similarFeedArray.push(sid+",");
							}
						}
					}

					// 自己发布的
					if(publisher.indexOf("profile.do?id="+XNR.userId+"&")>0) {
						continue;
					}
					// 如果是公共主页的新鲜事，也忽略其回复
					if(checkReply && $feedType(feedInfo)!="page") {
						var replyText=feedInfo.find("script[status='1']").text();
						if(replyText) {
							var replyList=/"replyList":(\[[\S\s]+?\]),/.exec(replyText);
							if(replyList) {
								try {
									// 里面有一处"type":'0'之类的，会导致parse出错
									replyList=JSON.parse(replyList[1].replace(/"type":'(\d+)',/g,'"type":0,'));
								} catch(ex) {
									replyList=[];
								}
								if(replyList.length>0) {
									var reply=replyList[replyList.length-1];
									if(reply.id && reply.ubname && reply.ubid && reply.replyContent) {
										lastReply=reply.id;
										lastReplyTime=reply.replyTime;
										// 看作是回复者的新鲜事，用回复者头像替换
										icon=reply.replyer_tinyurl;
										// 修改新鲜事内容
										feedText="<a href='http://renren.com/profile.do?id="+reply.ubid+"'>"+reply.ubname+"</a> ："+reply.replyContent+" @ "+feedText;
									} else {
										$error("autoCheckFeeds","回复列表结构发生变化");
									}
								}
							}
						}
					}
					// 按时间滤除非interval期间内的新鲜事
					var time=feedInfo.find(".duration").text().replace(/\s/g,"");
					if(time!="刚刚更新" && !time.match(/^[12]分钟前/)) {
						if(!checkReply || !lastReplyTime) {
							continue;
						} else {
							time=/(\d+)-(\d+)-(\d+) (\d+):(\d+)/.exec(lastReplyTime);
							if(time) {
								var time1=new Date();
								var time2=new Date();
								time1.setYear(parseInt(time[1]));
								time1.setMonth(parseInt(time[2]));
								time1.setDate(parseInt(time[3]));
								time1.setHours(parseInt(time[4]));
								time1.setMinutes(parseInt(time[5]));
								// 由于有可能系统的时区和系统时间不一致。所以当回复日期在4小时前才认为是过时的
								if(time1.getTime()-time2.getTime()>14400000) {
									continue;
								}
							} else {
								$error("autoCheckFeeds","回复时间格式发生变化");
								continue;
							}
						}
					}

					if(firstTime!==true) {
						// 排除已有，如果 lastReply=0 & oldFeeds[id]>0，feed系统出错？
						if(oldFeeds[id]!=null && (lastReply==oldFeeds[id] || (lastReply==0 && oldFeeds[id]!=0))) {
							continue;
						}
						feedArray.push({id:id,icon:icon,text:feedText});
					}
					oldFeeds[id]=lastReply;
				}

				// 处理相似新鲜事
				var similarIds=similarFeedArray.join("");
				if(similarIds) {
					$get("http://www.renren.com/retrievefeedid.do?id="+similarIds+"&isNewHome=true",arguments.callee,firstTime);
				}

				if(firstTime===true || feedArray.length==0) {
					return;
				}

				// 很好，可以直接加到工具栏中
				if($("#webpager #feed_toread_tip").exist()) {
					var root=$("#webpager #feed-panel .window>section>.notification");
					root.sibling(-1).hide();
					root.show();
					for(var i=feedArray.length-1;i>=0;i--) {
						var feedInfo=feedArray[i];
						var article=$("@article").attr("class","iconpanel").attr("id",feedInfo.id).addTo(root,0);
						var header=$("@header").html("<img class='icon' height='16' width='16' src='"+feedInfo.icon+"'/><menu><command class='delete' closebtn='true' title='删除' onclick='var n=this.parentNode.parentNode.parentNode;n.parentNode.removeChild(n);'/></menu>").addTo(article);
						// 内容
						$("@section").add($("@p").html(feedInfo.text)).addTo(article);
					}
					// 计数
					$("#feed_toread_num").text(feedArray.length+parseInt($("#feed_toread_num").text()));
					$("#feed_toread_tip").show();
				} else {
					// 底部工具栏靠不住，自己建立一个窗口
					var root=$("#xnr_newfeeds");
					if(root.empty()) {
						root=$("@div").attr({style:"position:fixed;bottom:10px;right:10px;width:250px;z-index:100000;background:#EBF3F7;border:#3B5888 solid 1px;",id:"xnr_newfeeds"}).add($("@div").css({padding:"3px",background:"#3B5998"}).html("<span style='color:white;font-weight:bold'>您有新的新鲜事</span><a style='float:right;cursor:pointer;color:white' onclick='document.body.removeChild(document.getElementById(\"xnr_newfeeds\"));'>关闭</a>")).add($("@div").attr("style","max-height:200px;padding-left:5px;padding-right:5px;overflow-y:auto").add($("@ul").attr("style","margin:0px;padding:0px;list-style-type:none"))).addTo(document.body);
					}

					var list=root.find("ul");
					if(list.heirs()>0) {
						list.child(-1).css("borderBottom","1px solid #AAAAAA");
					}

					for(var i=feedArray.length-1;i>=0;i--) {
						var feedInfo=feedArray[i];
						// 内容
						$("@li").attr({style:"padding-top:5px;padding-bottom:5px;border-bottom:1px solid #AAAAAA;",id:feedInfo.id}).add($("@img").attr({width:"16px",height:"16px",src:feedInfo.icon,style:"float:left"})).add($("@div").css("paddingLeft","20px").html(feedInfo.text)).addTo(list);
					}
					list.child(-1).css("borderBottom","");
				}
			} catch(ex) {
				$error("autoCheckFeeds",ex);
			}
		},fTime);
		// 定时检查
		setTimeout(arguments.callee,parseInt(interval)*1000);
	})(true);
};

// 定时刷新新鲜事列表
function autoReloadFeeds(interval) {
	const code='setInterval(window.newsfeed.reload,'+parseInt(interval)*1000+')';
	$script(code);
};

// 去除导航栏项目
function removeNavItems(navLinks) {
	const links={
		"theme":"i.renren.com/shop|tpl_free.action",
		"app":"app.renren.com",
		"game":"game.renren.com",
		"vip":"i.renren.com/pay",
		"vipCenter":"i.renren.com/index",
		"pay":"pay.renren.com",
		"invite":"invite.renren.com"
	};
	var style="";
	for(var l in navLinks) {
		if(navLinks[l]) {
			if(l=="theme") {
				style+="div.nav-body .menu .menu-title a[href*='i.renren.com/shop'],div.nav-body .menu .menu-title a[href*='tpl_free.action'],";
			} else {
				style+="div.nav-body .menu .menu-title a[href*='"+links[l]+"'],";
			}
		}
	}
	if(style) {
		style=style.substring(0,style.length-1);
		$patchCSS(style+"{display:none !important}");
		$wait(1,function() {
			style=style.replace(/div.nav-body .menu /g,"");
			$("div.nav-body .menu").filter(style).remove();
		});
	}
};

// 加宽导航栏
function widenNavBar() {
	$patchCSS(".navigation-wrapper,.navigation{width:auto} .navigation .nav-body{width:auto;float:none} .site-nav .nav-drop-menu-holder{width:auto}");
	$wait(1,function() {
		$("#navBar").move("before",$("body.layout_home3cols #container, body.layout_3cols #container"));
	});
};

// 使用旧式风格导航栏
function useOldStyleNav() {
	var css=".navigation-new .nav-main .menu-title a{font-weight:normal;padding:0 7px}.navigation-new .nav-main .drop-menu-btn{visibility:hidden !important;width:"+(XNR.acore==PRESTO?"1":"0")+"px;margin:0}.navigation-new .nav-other .account-action .menu-title a{background:none;padding:0 5px} .site-nav .nav-drop-menu-profile{left:202px}";
	$patchCSS(css);
	$wait(1,function() {
		$(".navigation-new .nav-main .menu-title a").filter(".drop-menu-btn[id]").bind("mouseover",function(evt) {
			if(evt.target.tagName=="A") {
				var newEvt=document.createEvent('MouseEvents');
				newEvt.initMouseEvent("mouseover",true,true,window,0,evt.screenX,evt.screenY,evt.clientX,evt.clientY,evt.altKey,evt.ctrlKey,evt.shiftKey,evt.metaKey,0,evt.target);
				evt.target.firstElementChild.dispatchEvent(newEvt);
			}
		}, true).bind("mouseout",function(evt) {
			if(evt.target.tagName=="A" && evt.relatedTarget!=evt.target.firstElementChild) {
				var newEvt=document.createEvent('MouseEvents');
				newEvt.initMouseEvent("mouseout",true,true,window,0,evt.screenX,evt.screenY,evt.clientX,evt.clientY,evt.altKey,evt.ctrlKey,evt.shiftKey,evt.metaKey,0,evt.target);
				evt.target.firstElementChild.dispatchEvent(newEvt);
			}
		}, true);
	});
};

// 导航栏上增加退出按钮
function addNavLogout() {
	var nav=$("#accountMenu");
	if(nav.empty()) {
		return;
	}
	$("@div").attr("class","menu last").html('<div class="menu-title"><a href="http://www.renren.com/Logout.do">退出</a></div>').move("after",nav);
};

// 浮动导航栏
function useFloatingNav() {
	var nav=$("#container>#header,body>#navBar,#header>#navBar,#container>#navBar").eq();
	if (nav.empty()) {
		return;
	}
	// 将导航栏复制一份放在原来的位置，防止排版出错
	var fake=nav.clone().css("visibility","hidden").attr("fake","").move("after",nav);
	// z-index应小于XN.ui.dialog的半透明背景的2000
	nav.attr("style","position:fixed;top:0;z-index:1999;margin:0 auto;padding-bottom:0 !important");
	if(nav.attr("id")=="navBar") {
		nav.css("width","100%");
	}
	// 部分页面（如 http://pay.renren.com/index.do）下会如此
	if(nav.curCSS("width")!=fake.curCSS("width")) {
		nav.attr("style",null);
		fake.remove();
		return;
	}
	// 下拉菜单是绝对定位的，需要处理
	const code="var s=XN.ui.fixPositionElement.prototype;"+
		"if(s.show_o){"+
			"return"+
		"}"+
		"s.show_o=s.show;"+
		"s.show=function(){"+
			"XN.ui.fixPositionElement.prototype.show_o.apply(this,arguments);"+
			"var m=this.frame;"+
			"var t=this.alignWith;"+
			"if(m && m.className==='menu-dropdown' && t){"+
				"if(/^menu$|^menu | menu$/.test(t.className)){"+
					"t=t.children[0]"+
				"}else{"+
					"while(!/\\bmenu-title\\b/.test(t.className)){"+
						"t=t.parentNode;"+
						"if(!t){"+
							"return"+
						"}"+
					"}"+
				"}"+
				"m.style.position='fixed';"+
				"var r=t.getBoundingClientRect();"+
				"m.style.top=parseInt(r.bottom)+'px';"+	// opera的定位会出错，必须有这句
				"m.style.left=parseInt(this.alignType=='3-2'?r.right-m.offsetWidth:r.left)+'px'"+
			"}"+
		"}";
	$script(code);
};

// 增加导航栏项目
function addNavItems(content) {
	if(!content) {
		return;
	}
	var nav=$("div.nav-main");
	if(nav.empty()) {
		return;
	}
	var items=content.split("\n");
	for(var i=0;i<items.length-1;i+=2) {
		$("@div").html('<div class="menu-title"><a href="'+items[i+1]+'" target="_blank">'+items[i]+'<span class="drop-menu-btn"></span></a></div>').attr("class","menu").addTo(nav);
	}
	//防止被自作主张改动链接
	$script("try{var e=document.body.querySelectorAll('.nav-main .menu-title>a');for(var i=0;i<e.length;i++){e[i]._ad_rd=true}}catch(ex){}");
};

// 恢复深蓝主题
function recoverOriginalTheme(evt,ignoreTheme) {
	if(evt && evt.target.tagName!="LINK") {
		return;
	}
	
	var FCOLOR="#3B5998";	//Facebook的深蓝色，#005EAC, #548BC6
	var XCOLOR="#3B5888";	//校内原来的深蓝色
	var BCOLOR="#5C75AA";	//原来的菜单背景色，#3777BC, #3175BD
	var SCOLOR="#EBF3F7";	//原来的应用栏&回复背景色，#F3FAFF

	if(!evt) {
		// stage0预先打补丁。stage1修正
		var prepatch=$patchCSS("a,a:link,a:visited,a:hover{color:"+FCOLOR+"}.navigation .nav-body{background-color:"+XCOLOR+"}.input-button,.input-submit{background-color:"+XCOLOR+"}.user-data,.panel.bookmarks,.statuscmtitem,.new-user{background-color:"+SCOLOR+"}");
	}
	$wait(1,function() {
		if(!ignoreTheme) {
			// 开始检测有无模板存在
			var theme=false;
			if($("#themeLink:not([href*='sid=-1'])").exist()) {
				// 公共主页模板
				theme=true;
			} else if($("#hometpl_style").exist() && $("#hometpl_style").text().indexOf("{")!=-1) {
				// 首页模板 。。。
				theme=true;
			} else {
				// 紫豆模板
				$("head style").each(function() {
					if($(this).text().indexOf("url(http://i.static.renren.com")!=-1) {
						theme=true;
						return true;
					}
				});
			}
			if(theme) {
				if(!evt) {
					prepatch.remove();
				}
				return;
			}
		}

		var css="";
	
		const files={
			"home-all.css":[
				"a,a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				".navigation .nav-body{background-color:"+XCOLOR+"}",
				".navigation .menu-title a:hover{background-color:"+BCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".pop_content .dialog_body a,.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				".pop_content h2{background-color:"+XCOLOR+"}",
				"ul.square_bullets{color:"+FCOLOR+"}",
				".menu-dropdown .menu-item li.show-more a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .menu-item a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .optionmenu li a:hover{background-color:"+FCOLOR+"}",
				".m-chat .chatnote a,.m-chat .chatnote em{color:"+FCOLOR+"}",
				".publisher .status-publisher input.submit{background-color:"+FCOLOR+"}",
				"ul.richlist.feeds li .details a.share:hover{color:"+FCOLOR+"}",
				".app-box .common-app h1 .open{color:"+FCOLOR+"}",
				".user-data,.panel.bookmarks,.statuscmtitem,.mincmt-diggers,.friend-birthday-window .bless-msg{background-color:"+SCOLOR+"}",
				".home .home-sidebar .pymk .comefrom{background-color:"+SCOLOR+"}",
			],
			"home-frame-all-min.css":[
				"a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"button, input[type=button]{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_body a,td.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				"td.pop_content h2{background-color:"+FCOLOR+"}",
				"ul.square_bullets{color:"+FCOLOR+"}",
				".navigation{background-color:"+XCOLOR+"}",
				".navigation .menu-title a:hover,.navigation .menu-title a.hover{background-color:"+BCOLOR+"}",
				".menu-dropdown .menu-item li.show-more a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .menu-item a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .optionmenu li a:hover{background-color:"+FCOLOR+"}",
				".site-menu-nav .nav-item li.selected,.site-menu-nav .nav-item .item-title.selected{background-color:"+BCOLOR+"}",
				"a.skin-action,a.skin-action:hover{color:white;background-color:"+FCOLOR+"}",
				"#accountDropDownMenu a.logout:hover{background-color:"+FCOLOR+"}",
				".site-menu-apps .apps-item .item-title.selected, .site-menu-apps .apps-item .item-title.selected:hover{background-color:"+BCOLOR+"}",
				".site-menu-nav .nav-item li.selected, .site-menu-apps .apps-item li.selected{background-color:"+BCOLOR+"}",
				"#appsMenuPro .menu-apps-side{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item a:hover{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item em{background-color:"+SCOLOR+"}",
				"#appsMenuPro .my-fav-apps{background-color:"+SCOLOR+"}",
			],
			"home-frame2-all-min.css":[
				"a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"button, input[type=button]{background-color:"+FCOLOR+"}",
				"a.action:hover{background-color:"+FCOLOR+"}",
				"a.share:hover,a.mini-share:hover{background-color:"+FCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".inputbutton, .inputsubmit, .subbutton, .canbutton, .button-group button{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_body a,td.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				"ul.square_bullets{color:"+FCOLOR+"}",
				".site-nav{background-color:"+FCOLOR+";background-image:none}",
				".search-Result li.m-autosug-hover{background-color:"+FCOLOR+"}",
				"#accountsPager li a:hover{background-color:"+FCOLOR+"}",
				"#switchAccountPopup .pagerpro li.current a, .pagerpro li.current a:hover{color:"+FCOLOR+"}",
				"#appsMenuPro .my-fav-apps .app-item em:hover{background-color:"+FCOLOR+"}",
				"#appsMenuPro .other-apps .app-item em:hover{background-color:"+FCOLOR+"}",
				"#appsMenuPro .menu-apps-side a.add-app-btn{background-color:"+FCOLOR+"}",
				".group-info .mail .mail-link{background-color:"+FCOLOR+"}",
				".group-info .btn-save{background-color:"+FCOLOR+"}",
				".global-publisher-share input.inlineinput{color:"+FCOLOR+"}",
				".global-publisher-selector .global-publisher-photo-trigger{color:"+FCOLOR+"}",
				".global-publisher-module .submit{background-color:"+FCOLOR+"}",
				".global-publisher-module .comment-module .submit{background-color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a, .pagerpro li.current a:hover{color:"+FCOLOR+"}",
				".s-sort li a:hover{color:"+FCOLOR+"}",
				"#navMessage .on{background-color:"+BCOLOR+"}",
				"td.pop_content h2{background-color:"+BCOLOR+"}",
				".site-nav .menu-title a:hover{background-color:"+BCOLOR+"}",
				"#appsMenuPro .my-fav-apps{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item a:hover{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item em{background-color:"+SCOLOR+"}",
				"#appsMenuPro .menu-apps-side{background-color:"+SCOLOR+"}",
				"#appsMenuPro .my-fav-apps{background-color:"+SCOLOR+"}",
			],
			"home-all-min.css":[
				".publisher-share input.inlineinput{color:"+FCOLOR+"}",
				".publisher-selector .publisher-photo-trigger{color:"+FCOLOR+"}",
				".publisher-module .status-inputer .submit{background-color:"+FCOLOR+"}",
				".publisher-module .comment-module .submit{background-color:"+FCOLOR+"}",
				".a-feed .details a.share:hover{color:"+FCOLOR+"}",
				".a-feed .feed-dropmenu menu li a:hover{background-color:"+FCOLOR+"}",
				".feed-module .feed-tools a:link,.feed-module .feed-tools a:visited{color:"+FCOLOR+"}",
				".feed-module .category-filter label{color:"+FCOLOR+"}",
				".input-button,.input-submit{background-color:"+FCOLOR+"}",
				".pop_content .dialog_body a,.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"ul.square_bullets{color:"+FCOLOR+"}",
				".m-chat .chatnote a,.m-chat .chatnote em{color:"+FCOLOR+"}",
				".publisher .status-publisher input.submit{background-color:"+FCOLOR+"}",
				".status-inputer .submit{background-color:"+FCOLOR+"}",
				"#newUserGuide div.users span.button button span{color:"+FCOLOR+"}",
				".app-box .common-app h1 .open{color:"+FCOLOR+"}",
				".like .favors,.reply .col-center .favors{color:"+FCOLOR+"}",
				".like-video .terminal .video-title,.like-video .combox_share dl.replies dt.digged{color:"+FCOLOR+"}",
				"#closePublisherSkin:hover,#dressPublisherSkin:hover{background-color:"+FCOLOR+"}",
				".feed-module a:link, .feed-module a:hover, .feed-module a:visited{color:"+FCOLOR+"}",
				".feed-module .category-filter menu a:hover,.news-feed-types a.news-feed-type:hover{background-color:"+BCOLOR+"}",
				".feed-module .feed-header-new .types label{color:"+FCOLOR+"}",
				".feed-module .feed-header-new label.s, .feed-module .feed-header-new .category-filter:hover label.s, .feed-module .feed-header-new .category-filter_hover label.s, .feed-module .feed-header-new .feed-attention:hover label.s, .feed-module .feed-header-new .feed-attention_hover label.s{color:#333333}",
				".feed-module .feed-header-new .category-filter:hover .text, .feed-module .feed-header-new .category-filter_hover .text, .feed-module .feed-header-new .feed-attention:hover .text, .feed-module .feed-header-new .feed-attention_hover .text{color:"+FCOLOR+"}",
				".message-box dt{color:"+FCOLOR+"}",
				".message-box ul li.brand-new{background-color:#EFEDFF}",
				".message-box div.handle button, .message-box div.handle a.accept{background-color:"+FCOLOR+"}",
				".guide-tags li a.act{background-color:"+FCOLOR+"}",
				".rr-dialog .guide-tags li a.act{background-color:"+FCOLOR+"}",
				".rr-dialog .dialog-title{background-color:"+FCOLOR+"}",
				".rr-dialog .guide-btn{background-color:"+FCOLOR+"}",
				".xz-dialog .dialog-title{background-color:"+FCOLOR+"}",
				".xz-dialog .guide-btn{background-color:"+FCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".a-feed .card-privacy{background-color:"+SCOLOR+"}",
				".mincmt-diggers{background-color:"+SCOLOR+"}",
				".pymk .comefrom{background-color:"+SCOLOR+"}",
				".panel.bookmarks{background-color:"+SCOLOR+"}",
				".user-data{background-color:"+SCOLOR+"}",
				".statuscmtitem{background-color:"+SCOLOR+"}",
			],
			"webpager-std-min.css":[
				".webpager ul.icon a:hover .tooltip{background-color:"+FCOLOR+"}",
				".app-list dl.apps dd a:hover span.del-handle:hover{background-color:"+FCOLOR+"}",
			],
			"layout.css":[
				"a,a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"a.share:hover,a.mini-share:hover,a.action:hover{background-color:"+FCOLOR+"}",
				".input-button,.input-submit{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				"td.pop_content h2{background-color:"+XCOLOR+"}",
				"ul.square_bullets{color:"+FCOLOR+"}",
				".navigation{background-color:"+XCOLOR+"}",
				".navigation .menu-title a:hover,.navigation .menu-title a.hover{background-color:"+BCOLOR+"}",
				".search-Result li.m-autosug-hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .menu-item li.show-more a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .menu-item a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .optionmenu li a:hover{background-color:"+FCOLOR+"}",
				"ol.pageclip li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a, .pagerpro li.current a:hover{color:"+FCOLOR+"}",
				"#pages-jump a{color:"+FCOLOR+"}",
				"#pop-login h1{background-color:"+FCOLOR+"}",
				".newpop .share_popup .toggle_tabs li a{color:"+FCOLOR+"}",
				"#accountDropDownMenu a.logout:hover{background-color:"+FCOLOR+"}",
				"#appsMenuPro .menu-apps-side{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item a:hover{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item em{background-color:"+SCOLOR+"}",
				"#appsMenuPro .my-fav-apps{background-color:"+SCOLOR+"}",
			],
			"news-feeds.css":[
				"ul.richlist.feeds li div.details a.share:hover{color:"+FCOLOR+"}",
			],
			"profilepro.css":[
				".imgbtn-1{background-color:"+FCOLOR+"}",
				".latest-photos .footer .more, .latest-photos .footer .loading, .latest-photos .footer .nomore{background-color:"+SCOLOR+"}",
			],
			"profile-skin.css":[
				".tabs-holder .tabpanel a:visited,.tabs-holder .tabpanel a{color:"+FCOLOR+"}",
				".super-menu li a:hover{background-color:"+FCOLOR+"}",
				".filter li.c a{background-color:"+BCOLOR+"}",
				".tabs-holder .tabpanel a{color:"+FCOLOR+"}",
			],
			"oldprofile-all-min.css":[
				".imgbtn-1{background-color:"+FCOLOR+"}",
				".user-info .link{color:"+FCOLOR+"}",
				"#starPK .fans-list .item .details .name{color:"+FCOLOR+" !important}",
				".latest-photos .footer .more, .latest-photos .footer .loading, .latest-photos .footer .nomore, .latest-photos .footer .hasmore{background-color:"+SCOLOR+"}"
			],
			"msg.css":[
				".page-titletabs a.add-msg{background-color:"+FCOLOR+"}",
				".inputbutton,.inputsubmit,.subbutton,.canbutton,.button-group button{background-color:"+FCOLOR+"}",
				".messages .next_message:hover,.messages .previous_message:hover{background-color:"+FCOLOR+"}",
				".message_rows .new_message{background-color:"+SCOLOR+"}",
			],
			"dialogpro.css":[
				"ul.square_bullets{color:"+FCOLOR+"}",
				"td.pop_content h2{background-color:"+XCOLOR+"}",
			],
			"page.css":[
				".page-tabs .tabpanel a,.page-tabs .tabpanel a:visited{color:"+FCOLOR+"}",
				".page-tabs .tabpanel li.select a,.page-tabs .tabpanel li.addtab a:hover{color:"+FCOLOR+"}",
				".stabs a,.stabs a:hover,.stabs a:visited{color:"+FCOLOR+"}",
				".stabs a.current span,.stabs a.current span:hover{background-color:"+FCOLOR+"}",
				"form.editDesc input{color:"+FCOLOR+"}",
				".theme-panel a,.theme-panel a:link,.theme-panel a:hover,.theme-panel a:visited{color:"+FCOLOR+"}",
				".thmc-action .del:hover{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_body .ordertabs a.s{background-color:"+FCOLOR+" !important}",
				".info-item .photoes ul li .name{color:"+FCOLOR+"}",
				"body.profile #header a.follow{color:"+FCOLOR+"}",
				"body.profile ul.tabs.sub-nav li a{color:"+FCOLOR+"}",
				"ul.comments footer details li a:hover{color:"+FCOLOR+"}",
				"header.user .follow{color:"+FCOLOR+"}",
				"p.leave-msg a{background-color:"+FCOLOR+"}",
			],
			"page-albumpro.css":[
				".photo-comments #side-column ul.actions .rotate-left a:hover{background-color:"+FCOLOR+"}",
				".photo-comments #side-column ul.actions .rotate-right a:hover{background-color:"+FCOLOR+"}",
				".share a:hover{background-color:"+FCOLOR+"}",
				"h3.upload-step-1 .pick-more{color:"+FCOLOR+"}",
				".pager-top a:hover{background-color:"+FCOLOR+"}",
				".pager-top a.current, .pager-top a.current:hover{color:"+FCOLOR+"}",
				".pager-comment a:hover{background-color:"+FCOLOR+"}",
				".pager-comment a.current, .pager-comment a.current:hover{color:"+FCOLOR+"}",
			],
			"appspro.css":[
				".sub-nav ul.main li.son-nav a.pre-select,.sub-nav ul.main li.son-nav a:hover.pre-select,.sub-nav ul.main li.allselect a{background-color:"+FCOLOR+"}",
				".sub-nav li ul.sub li a{color:"+FCOLOR+"}",
				".sub-nav ul.main li a.select,.sub-nav li ul.sub li a.select,.sub-nav li ul.sub li a.select:hover{background-color:"+FCOLOR+"}",
				".sub-nav li ul.sub li a.select,.sub-nav li ul.sub li a.select:hover{background-color:"+FCOLOR+"}",
				".sub-nav,.user-data,.panel.bookmarks,.section h2,.tab-switch{background-color:"+SCOLOR+"}",
			],
			"albumpro.css":[
				".album .function-nav .page-control em{color:"+FCOLOR+"}",
				".preview-photo .gallery .thumbnail:hover, .preview-photo .gallery .ghover .thumbnail, .preview-photo .gallery .this .thumbnail{background-color:"+FCOLOR+"}",
				".ghover .turna, .ghover .turnb{color:"+FCOLOR+" !important}",
				".album .public-albumlist-hot li h2{color:"+FCOLOR+"}",
				"#self-nav li a{color:"+FCOLOR+"}",
				"#self-nav .selected a,#self-nav .selected a:hover{background-color:"+FCOLOR+"}",
				".pager-top a.current, .pager-top a.current:hover{color:"+FCOLOR+"}",
				".statuscmtitem{background-color:"+SCOLOR+"}",
			],
			"subscription.css":[
				".ss-menu li.cur a{background-color:"+XCOLOR+"}",
				".subs-search p .subbutton{background-color:"+FCOLOR+"}",
				".subs-commend li .detail .add a{background-color:"+FCOLOR+"}",
			],
			"replies.css":[
				".replies a.reply-report:hover{color:"+FCOLOR+"}",
			],
			"homepro.css":[
				".new-user{background-color:"+SCOLOR+"}",
				".home-nav .c a,.home-nav .c a:hover{background-color:"+FCOLOR+"}",
	
			],
			"login-all.css":[
				"a,a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"a.action:hover,a.share:hover,a.mini-share:hover{background-color:"+FCOLOR+"}",
				".input-button,.input-submit{background-color:"+FCOLOR+"}",
				".navigation{background-color:"+XCOLOR+"}",
				".navigation .menu-title a:hover{background-color:"+BCOLOR+"}",
				".open-search.hover .description .find-friends{color:"+FCOLOR+"}",
			],
			"login-all-min.css":[
				"a,a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"a.action:hover,a.share:hover,a.mini-share:hover{background-color:"+FCOLOR+"}",
				".input-button,.input-submit{background-color:"+FCOLOR+"}",
				".navigation{background-color:"+XCOLOR+"}",
				".navigation .menu-title a:hover{background-color:"+BCOLOR+"}",
				".open-search.hover .description .find-friends{color:"+FCOLOR+"}",
				".msn-login-panel .content p span{color:"+FCOLOR+"}",
				".extra-guide .portal:hover{color:"+FCOLOR+"}",
				".rrdesk.hover h5 a,.rrdesk.hover a{color:"+FCOLOR+" !important}",
				"td.pop_content .dialog_body a, td.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				"ul.square_bullets{color:"+FCOLOR+"}",
			],
			"login-unbuffered.css":[
				"a,a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"a.action:hover,a.share:hover,a.mini-share:hover{background-color:"+FCOLOR+"}",
				".input-button,.input-submit{background-color:"+FCOLOR+"}",
				".navigation{background-color:"+XCOLOR+"}",
				".navigation .menu-title a:hover{background-color:"+BCOLOR+"}",
			],
			"unbuffered-all-min.css":[
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".open-search.hover .description .find-friends{color:"+FCOLOR+"}",
				"a,a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				".msn-login-panel .content p span{color:"+FCOLOR+"}",
				".extra-guide .portal:hover{color:"+FCOLOR+"}",
				".navigation{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_body a, td.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				".rrdesk.hover h5 a, .rrdesk.hover a, .rrdesk a.deskbtn{color:"+FCOLOR+" !important}",
				"ul.square_bullets{color:"+FCOLOR+"}",
				".nav-other .menu-title a:hover{background-color:"+BCOLOR+"}",
				"td.pop_content h2{background-color:"+BCOLOR+"}",
			],
			"club.css":[
				"a,a:hover{color:"+FCOLOR+"}",
			],
			"header.css":[
				"#navigation ul ul a{color:"+FCOLOR+"}",
				"#self-nav li a{color:"+FCOLOR+"}",
				"#self-nav .selected a,#self-nav .selected a:hover{background-color:"+FCOLOR+"}",
				"#clubheader #navigation{background-color:"+XCOLOR+"}",
				"#utility{background-color:"+XCOLOR+"}",
			],
			"base.css":[
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".inputbutton,.inputsubmit,.subbutton,.canbutton,.button-group button{background-color:"+FCOLOR+"}",
				"#self-nav .selected a{background-color:"+FCOLOR+"}",
				"#self-nav li a {color:"+FCOLOR+"}",
			],
			"searchpro.css":[
				".input-filter .subbutton{background-color:"+FCOLOR+"}",
				".condition-show,#filterForm{background-color:"+SCOLOR+"}",
				".search-main-new .list li{color:"+FCOLOR+"}",
			],
			"blog.css":[
				"a.button{color:white;background-color:"+FCOLOR+"}",
				".page-titletabs .act-btn a{background-color:"+FCOLOR+"}",
			],
			"global-all-min.css":[
				"a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"button, input[type='button']{background-color:"+FCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_body a, td.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				"ul.square_bullets{color:"+FCOLOR+"}",
				".navigation{background-color:"+FCOLOR+"}",
				".search-Result li.m-autosug-hover{background-color:"+FCOLOR+"}",
				".navigation-new #global_inbox_link:hover span.msg-count{color:"+FCOLOR+" !important}",
				".navigation-new #global_inbox_link:hover span.count{color:"+FCOLOR+" !important}",
				"#accountsPager li a:hover{background-color:"+FCOLOR+"}",
				"#switchAccountPopup .pagerpro li.current a, .pagerpro li.current a:hover{background-color:"+FCOLOR+"}",
				"#appsMenuPro .my-fav-apps .app-item em:hover{background-color:"+FCOLOR+"}",
				"#appsMenuPro .other-apps .app-item em:hover{background-color:"+FCOLOR+"}",
				"#appsMenuPro .menu-apps-side a.add-app-btn{background-color:"+FCOLOR+"}",
				".site-menu-nav-box .nav-item-count{color:"+FCOLOR+" !important}",
				".group-info .mail .mail-link{color:"+FCOLOR+"}",
				".group-info .btn-save{background-color:"+FCOLOR+"}",
				".site-menu-nav .nav-item .create-zhan a:link, .site-menu-nav .nav-item .create-zhan a:visited{color:"+FCOLOR+"}",
				".site-menu-nav .nav-item .create-zhan a:hover{color:"+FCOLOR+"}",
				".navigation .menu-title a:hover, .navigation .menu-title a.hover{background-color:"+BCOLOR+"}",
				"td.pop_content h2{background-color:"+BCOLOR+"}",
				"#appsMenuPro .my-fav-apps{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item a:hover{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item em{background-color:"+SCOLOR+"}",
				"#appsMenuPro .menu-apps-side{background-color:"+SCOLOR+"}",
			],
			"global2-all-min.css":[
				"a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"button, input[type=button]{background-color:"+FCOLOR+"}",
				"a.action:hover{background-color:"+FCOLOR+"}",
				"a.share:hover,a.mini-share:hover{background-color:"+FCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".inputbutton, .inputsubmit, .subbutton, .canbutton, .button-group button{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_body a,td.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				"ul.square_bullets{color:"+FCOLOR+"}",
				".site-nav{background-color:"+FCOLOR+";background-image:none}",
				".search-Result li.m-autosug-hover{background-color:"+FCOLOR+"}",
				"#accountsPager li a:hover{background-color:"+FCOLOR+"}",
				"#switchAccountPopup .pagerpro li.current a, .pagerpro li.current a:hover{color:"+FCOLOR+"}",
				"#appsMenuPro .my-fav-apps .app-item em:hover{background-color:"+FCOLOR+"}",
				"#appsMenuPro .other-apps .app-item em:hover{background-color:"+FCOLOR+"}",
				"#appsMenuPro .menu-apps-side a.add-app-btn{background-color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a, .pagerpro li.current a:hover{color:"+FCOLOR+"}",
				"#navMessage .on{background-color:"+BCOLOR+"}",
				"td.pop_content h2{background-color:"+BCOLOR+"}",
				".site-nav .menu-title a:hover{background-color:"+BCOLOR+"}",
				"#appsMenuPro .my-fav-apps{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item a:hover{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item em{background-color:"+SCOLOR+"}",
				"#appsMenuPro .menu-apps-side{background-color:"+SCOLOR+"}",
			],
			"global-std-min.css":[
				"a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"button,input[type=button]{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_body a,td.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				"td.pop_content h2{background-color:"+FCOLOR+"}",
				".navigation{background-color:"+XCOLOR+"}",
				".navigation .menu-title a:hover,.navigation .menu-title a.hover{background-color:"+BCOLOR+"}",
				".menu-dropdown .menu-item li.show-more a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .menu-item a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .search-menu li a:hover,.menu-dropdown .optionmenu li a:hover{background-color:"+FCOLOR+"}",
				".navigation .menu-title a:hover{background-color:"+BCOLOR+"}",
				"#appsMenuPro .menu-apps-side{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item a:hover{background-color:"+SCOLOR+"}",
				"#appsMenuPro .app-item em{background-color:"+SCOLOR+"}",
				"#appsMenuPro .my-fav-apps{background-color:"+SCOLOR+"}",
			],
			"requests-all-min.css":[
				".request div.btns button{background-color:"+FCOLOR+"}",
				".requests-show-more{background-color:"+SCOLOR+"}",
			],
			"share.css":[
				"ul.share-hot-list li div.legend a{color:"+FCOLOR+"}",
				"ul.share-hot-list li h3 a,ul.share-hot-list li h3 a:hover{color:"+FCOLOR+"}",
				".hot-photo .photo-main,.hot-photo .photo-sub{background-color:"+SCOLOR+"}",
			],
			"guide-new":[	//guide-new-gameX.X.css，新注册用户
				".find-friend-box .users .friend-selector li .name label{color:"+FCOLOR+"}",
				".myRR-box-body dl{background-color:"+SCOLOR+"}",
				".search-friend .title,.guide-tabs-content .title,#mayknow_user .title,.myRR .title,.guide-game h2,.guide-game .slide p,.add-stars h3,.web-invite{background-color:"+SCOLOR+"}",
				".find-friend-box .toolbar .more a:hover,.find-friend-box .legend .desc a:hover,.find-friend-box .show-more a:hover{background-color:"+SCOLOR+"}",
			],
			"guide-all-min.css":[
				"a.action:hover{background-color:"+FCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".pop_content .dialog_body a, .pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				".publisher .status-publisher input.submit{background-color:"+FCOLOR+"}",
				"#newUserGuide div.users span.button button span{color:"+FCOLOR+"}",
				"ul.richlist.feeds li .details a.share:hover{color:"+FCOLOR+"}",
				".app-box .common-app h1 .open{color:"+FCOLOR+"}",
				".statuscmtitem{background-color:"+SCOLOR+"}",
				".a-feed .card-privacy{background-color:"+SCOLOR+"}",
				".mincmt-diggers{background-color:"+SCOLOR+"}",
				".home .home-sidebar .pymk .comefrom{background-color:"+SCOLOR+"}",
				".panel.bookmarks{background-color:"+SCOLOR+"}",
				".user-data{background-color:"+SCOLOR+"}",
				".message-box ul li.brand-new{background-color:#F0F5F8}",
				".message-box .box-footer{background-color:#EFEDFF}",
				".message-box dt{color:"+FCOLOR+"}",
				".message-box div.handle button, .message-box div.handle a.accept{background-color:"+FCOLOR+"}",
			],
			"list-all-min.css":[
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a:hover{color:"+FCOLOR+"}",
				".share a:hover{background-color:"+FCOLOR+"}",
				"ul.share-hot-list li.share div.figure a:hover{background-color:"+FCOLOR+"}",
				"ul.share-hot-list li h3 a,ul.share-hot-list li h3 a:hover{color:"+FCOLOR+"}",
				"ul.share-hot-list li div.legend a,ul.share-hot-list li div.legend a:hover{color:"+FCOLOR+"}",
				"#summary-wrap .share-vote-item a{color:"+FCOLOR+"}",
				".share-lists .music-list li a span{color:"+FCOLOR+"}",
				".share-lists .link-list .del a:hover{background-color:"+FCOLOR+"}",
				".share-lists .music-list .del a:hover{background-color:"+FCOLOR+" !important}",
				".input-button,.input-submit{background-color:"+FCOLOR+"}",
				"a.share:hover{background-color:"+FCOLOR+"}",
			],
			"status-all-min.css":[
				".pagerpro li.current a:hover{color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a,.pagerpro li.current a:hover{color:"+FCOLOR+"}",
				".input-button,.input-submit{background-color:"+FCOLOR+"}",
				"a{color:"+FCOLOR+"}",
				".catalog-list li.selected{background-color:"+FCOLOR+"}",
			],
			"hotinfo.css":[
				".iwanttojoin span{background-color:"+FCOLOR+"}"
			],
			"hot-all-min.css":[
				".hot-photo .photo-main,.hot-photo .photo-sub{background-color:"+SCOLOR+"}",
				"a.share:hover{background-color:"+FCOLOR+"}",
			],
			"zidou_nav.css":[
				".navigation .nav-main .menu-title a:hover,.navigation .menu-title a:hover{background-color:transparent;color:"+FCOLOR+"}",
				".navigation .nav-main .menu-title a,.navigation #searchMenu .menu-title a,.navigation .nav-other .menu-title a,.navigation .nav-main .menu-title a.searchcolor{color:"+FCOLOR+"}",
			],
			"blog-async.css":[
				"a.sbutton{color:#333333}",
				"a.share:hover{background-color:"+FCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a,.pagerpro li.current a:hover{color:"+FCOLOR+"}",
				"#pages-jump a{color:"+FCOLOR+"}",
				"a.button{background-color:"+FCOLOR+"}",
				"#self-nav li a{color:"+FCOLOR+"}",
				"#self-nav .selected a{background-color:"+FCOLOR+"}",
				"#entry h3{color:"+FCOLOR+"}",
				"#super-input .sinput-list-action a:hover{background-color:"+FCOLOR+"}",
				".share a:hover{background-color:"+FCOLOR+"}",
				"#mycomment h3{color:"+FCOLOR+"}",
				"#blogs .author ul a:hover{background-color:"+FCOLOR+"}",
				".message h3{background-color:"+FCOLOR+"}",
				".opLink{color:"+FCOLOR+"}",
				".blog-side-body .user-info .user-detail p.total strong{color:"+FCOLOR+"}",
				".page-titletabs .act-btn a{background-color:"+FCOLOR+"}",
			],
			"album-activity.css":[
				"a.button{color:white;background-color:"+FCOLOR+"}",
				".side-action .gallery .thumbnail:hover, .side-action .gallery .ghover .thumbnail, .side-action .gallery .this .thumbnail{background-color:"+FCOLOR+"}",
				".ghover .turna, .ghover .turnb{color:"+FCOLOR+" !important}",
				".acts-list .tabs-item a.selected, .acts-list .tabs-item a.selected:hover{background-color:"+FCOLOR+"}",
			],
			"main.css":[
				"body{color:"+FCOLOR+"}",
				"a{color:"+FCOLOR+"}",
				".dl_list dd li.on a,.dl_list dd li.on a:hover{background-color:"+FCOLOR+"}",
				".pager ul li,.pager ul li a,.pager ul li.current a,.pager ul li.current a:hover{color:"+FCOLOR+"}",
				"input.join,input.joingray{background-color:"+FCOLOR+"}",
			],
			"music-home.":[	// music-home.[0-9]+.css 人人爱听
				".music-operation label{color:"+FCOLOR+"}",
				".single-ranking .separater{color:"+FCOLOR+"}",
				".song-wrapper .share:hover,.album-wrapper .share:hover{background-color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a,.pagerpro li.current a:hover{color:"+FCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".new-album .tabs,.song-list tr.selected,.statuscmtitem{background-color:"+SCOLOR+"}",
			],
			"music-box.":[	// music-box.[0-9]+.css 人人爱听
				".song-list .search,.music-box .reply-list ul,.music-box .reply-editor,.music-box .filter-list a:hover{background-color:"+SCOLOR+"}",
			],
			"job.css":[
				".page-tabs .tabpanel a,.page-tabs .tabpanel a:visited{color:"+FCOLOR+"}",
				".page-tabs .tabpanel li.addtab a:hover{color:"+FCOLOR+"}",
				".resume-preview .qzhx-header{background-color:"+FCOLOR+"}",
				".pjb-sidenav .nav-list li.selected a{background-color:"+FCOLOR+" !important}",
				".qzhx-edit .confirm input{background-color:"+FCOLOR+" !important}",
				".home-nav .c a,.home-nav .c a:hover{background-color:"+FCOLOR+"}",
				".home-nav .exp a,.home-nav .exp a:hover{background-color:"+FCOLOR+"}",
				".home-nav .exp .type-list a,.home-nav .exp .type-list a:hover{color:"+FCOLOR+"}",
				"#mycomment h3{color:"+FCOLOR+"}",
			],
			"group-all-min.css":[
				".phony_link{color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a, .pagerpro li.current a:hover{color:"+FCOLOR+"}",
				"a.share:hover{background-color:"+FCOLOR+"}",
				".input-submit{background-color:"+FCOLOR+"}",
			],
			"radio.":[	// radio.[0-9]+.css 人人电台
				"a{color:"+FCOLOR+"}",
				".music-operation label{color:"+FCOLOR+"}",
				".pagerpro a:hover{background-color:"+FCOLOR+"}",
				".pagerpro .current a,.pagerpro .current a:hover{color:"+FCOLOR+"}",
				"td.pop_content h2{background-color:"+BCOLOR+"}",
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
			],
			"love-home.css":[
				"a:link,a:visited,.mod a,.page-status a{color:"+FCOLOR+"}",
				".richlist h3 a{color:"+FCOLOR+"}",
			],
			"rr-connect.css":[
				"a{color:"+FCOLOR+"}",
				".button-blue{background-color:"+FCOLOR+"}",
				".header{background-color:"+XCOLOR+"}",
				"td.xn_pop_content h2{background-color:"+XCOLOR+"}",
			],
			"talk.css":[
				".super-menu li a:hover{background-color:"+FCOLOR+"}",
			],
			"pay-min.css":[
				"a:link, a:visited{color:"+FCOLOR+"}",
				".renren{background-color:"+XCOLOR+"}",
				".user-info .user-name{color:"+FCOLOR+"}",
				".button{background-color:"+FCOLOR+"}",
				".paging a:hover{background-color:"+FCOLOR+"}",
				".record-table .trade-code, .record-table .recipient{color:"+FCOLOR+"}",
				".task-list li .draw{background-color:"+FCOLOR+"}",
				".topUserInfo .userInfo strong{color:"+FCOLOR+"}",
				".pay-list2 li.current a{background-color:"+XCOLOR+"}",
			],
			"full_nav.css":[
				".navigation{background-color:"+XCOLOR+"}",
				".navigation .nav-main .menu-title a, .navigation #searchMenu .menu-title a, .navigation .nav-other .menu-title a{color:"+FCOLOR+"}",
				".navigation .nav-main .menu-title a:hover, .navigation .menu-title a:hover{background-color:transparent;color:"+FCOLOR+"}",
				".navigation .nav-main .menu-title a.searchcolor{color:"+FCOLOR+"}",
				"#footer a{color:"+FCOLOR+"}",
			],
			"friends.css":[
				".friends-main .friends-sidebar ul.CategoryList .select span.sub a.select,.friends-main .friends-sidebar ul.CategoryList .select span.sub a{color:"+FCOLOR+"}",
				"div.bobBox input.button{background-color:"+FCOLOR+" !important}",
				".friends-main .friends-listbox .Fast-seekfriend .show-more a:hover{background-color:"+SCOLOR+"}"
			],
			"search-new.css":[
				".input-filter,.sidebar,.condition-show,.no-result-box h4{background-color:"+SCOLOR+"}",
				".sidebar li.selected,.sidebar li.selected a:hover{background-color:"+FCOLOR+"}",
				".input-filter .subbutton{background-color:"+FCOLOR+"}",
			],
			"school-selector.css":[
				"#univlist_provinces td.activetab a{background-color:"+FCOLOR+"}",
				"#univlist_univs li a:hover{background-color:"+FCOLOR+"}",
				"#searchlist_school li a:hover{background-color:"+FCOLOR+"}",
				"li.active a, li.active a{background-color:"+FCOLOR+"}",
				"#popup-unis li a:hover, #popup-unis-hs li a:hover{background-color:"+FCOLOR+"}",
			],
			"privacy-all-min.css":[
				".tabs-holder .tabpanel a,.tabs-holder .tabpanel a:visited{color:"+FCOLOR+"}",
				".user-info .link{color:"+FCOLOR+"}",
				".input-button{background-color:"+FCOLOR+"}",
				".gallery-footer, .gallery-footer .more, .gallery-footer .nomore{background-color:"+SCOLOR+"}",
			],
			"nav-vip.css":[
				".navigation .nav-main .menu-title a, .navigation #searchMenu .menu-title a, .navigation .nav-other .menu-title a{color:"+FCOLOR+"}",
				".navigation .nav-main .menu-title a:hover, .navigation .menu-title a:hover{color:"+FCOLOR+";background-color:transparent}",
				".navigation .nav-main .menu-title a.searchcolor{color:"+FCOLOR+"}",
			],
			"badoo.css":[
				".latest-photos .footer .hasmore, .latest-photos .footer .more{background-color:"+SCOLOR+"}",
				"button, input[type='button']{background-color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a, .pagerpro li.current a:hover{color:"+FCOLOR+"}",
				".fpagerpro li a:hover{background-color:"+FCOLOR+"}",
				".fpagerpro li.current a, .fpagerpro li.current a:hover{color:"+FCOLOR+"}",
				".mk-content .mk-document .addFriend{background-color:"+FCOLOR+"}",
				".righttips b, .wrongtips b{color:"+FCOLOR+"}",
				".box-body .bd-mineditor .editorSubmit .bd-submit{background-color:"+FCOLOR+"}",
				".bd-talk-box .detail-talk-box .badoo-toolbar .libar menu li a:hover{background-color:"+FCOLOR+"}",
				".body-talk-box .bd-mineditor .editorSubmit .bd-submit{background-color:"+FCOLOR+"}",
				".gallery .thumbnail:hover, .gallery .ghover .thumbnail, .gallery .this .thumbnail{background-color:"+FCOLOR+"}",
				".right-content .syncHeadPhoto{background-color:"+FCOLOR+"}",
				".guideContent .completeBasic a.commitBasic{background-color:"+FCOLOR+"}",
				".dialog_content .guideContent .guideUpload .uploadBtn{background-color:"+FCOLOR+"}",
			],
			"makefriends.css":[
				".mk-friends .search-form .submitbtn{background-color:"+FCOLOR+"}",
				".mk-friends .search-form{background-color:"+SCOLOR+"}",
				".newMessAlert{background-color:"+SCOLOR+"}",
			],
			"photo-all-min.css":[
				".input-button, .input-submit{background-color:"+FCOLOR+"}",
				".reply-adding .reply-nav .replyAll input.input-button{background-color:"+FCOLOR+"}",
				".submit-btn{background-color:"+FCOLOR+"}",
				".statuscmtitem{background-color:"+SCOLOR+"}",
				".mincmt-diggers{background-color:"+SCOLOR+"}",
				".comments-box .mincmt-body dl.replies dd{background-color:"+SCOLOR+"}",
				".s-sort li a:hover{background-color:"+FCOLOR+"}",
			],
			"footprint.css":[
				".dropmenu-holder .foot_action a{color:"+FCOLOR+"}",
				".dropmenu-holder .foot_action a.hover{background-color:"+FCOLOR+" !important}",
				".footwall li.hover{background-color:"+SCOLOR+"}",
			],
		};
		var style="";
		for(var f in files) {
			if($("link[rel*='stylesheet'][href*='"+f+"']").exist()) {
				style+=files[f].join("");
			}
		}
		if(style) {
			if($allocated("blueTheme")) {
				$alloc("blueTheme").text(style);
			} else {
				$alloc("blueTheme",$patchCSS(style));
			}
		}
		if(!evt) {
			prepatch.remove();
		}
	});

	// 谷歌人人小工具
	if(XNR.url.indexOf("http://www.connect.renren.com/igadget/renren/index.html")==0) {
		$patchCSS("a,a:link,a:visited,a:hover,.font1,.box .textArea .textNow,.box .tabMenu a,.box .pageBox a{color:"+FCOLOR+"}.box .item ul li.over .btn{background-color:"+FCOLOR+"}.box .head{background-color:"+XCOLOR+"}");
	}
};

// 去除页面字体限制
function removeFontRestriction() {
	$patchCSS("*{font-family:none !important}");
};

// 限制头像列表中的头像最大数量
function limitHeadList(evt,amountString) {
	if(evt && evt.target.className!="col-right") {
		return;
	}
	var amount=parseInt(amountString);
	if(amount==0) {
		return;
	}
	$("ul.people-list").each(function() {
		var list=$(this);
		while(list.heirs()>amount) {
			list.child(amount).remove();
		}
	});
};

// 修正导航栏项目高度
function fixNavItemHeight() {
	$patchCSS(".navigation .menu-title a{max-height:35px}");
};

// 修正论坛排版错误
function fixClubTypesetting() {
	// 帖子正文
	$patchCSS(".content{overflow:visible}");
	// 子导航栏
	$patchCSS("#sub-nav{overflow:visible}#sub-nav>ul{clear:both}");
};

// 自定义页面样式
function customizePageStyle(style) {
	$patchCSS(style);
};

// 调整页面布局
function customizePageLayout(layouts) {
	var layout=layouts.split("\n");
	for(var i=0;i<layout.length;i++) {
		var line=layout[i];
		if(line.length<4) {
			// 最短为a<<b
			continue;
		}
		var type=1;
		var t=line.split("<<<");
		if(t.length!=2) {
			type=2;
			t=line.split(">>>");
			if(t.length!=2) {
				type=3;
				t=line.split("<<");
				if(t.length!=2) {
					type=4;
					t=line.split(">>");
					if(t.length!=2) {
						continue;
					}
				}
			}
		}
		try {
			var a=$(t[0]);
			if(a.empty()) {
				continue;
			}
			var b=$(t[1]);
			if(b.empty()) {
				continue;
			}
		} catch(ex) {
			continue;
		}
		switch(type) {
			case 1:
				b.add(a,0);
				break;
			case 2:
				b.add(a);
				break;
			case 3:
				a.move("before",b);
				break;
			case 4:
				a.move("after",b);
				break;
		}
	}
};

// 增加更多表情
function addExtraEmotions(nEmo,bEmo,eEmo,fEmo,sfEmo,aEmo,odEmo) {
	var allEmo = {};

	// 状态表情列表
	var emList={
	//	":)":		{t:"开心",			s:"/imgpro/icons/statusface/1.gif"},
		"(微笑)":	{t:"微笑",			s:"/imgpro/icons/statusface/1.gif"},
		"@_@":		{t:"嘴唇",			s:"/imgpro/icons/statusface/2.gif"},
	//	"(k)":		{t:"嘴唇",			s:"/imgpro/icons/statusface/2.gif"},
		"(哭)":		{t:"哭",			s:"/imgpro/icons/statusface/3.gif"},
	//	":-O":		{t:"惊讶",			s:"/imgpro/icons/statusface/4.gif"},
		"(惊讶)":	{t:"惊讶",			s:"/imgpro/icons/statusface/4.gif"},
	//	":@":		{t:"生气",			s:"/imgpro/icons/statusface/5.gif"},
		"(生气)":	{t:"生气",			s:"/imgpro/icons/statusface/5.gif"},
	//	":(":		{t:"难过",			s:"/imgpro/icons/statusface/6.gif"},
		"(难过)":	{t:"难过",			s:"/imgpro/icons/statusface/6.gif"},
	//	":-p":		{t:"吐舌头",		s:"/imgpro/icons/statusface/7.gif"},
		"(l)":		{t:"爱",			s:"/imgpro/icons/statusface/8.gif"},
	//	"(v)":		{t:"花儿",			s:"/imgpro/icons/statusface/9.gif"},
		"(花)":		{t:"花儿",			s:"/imgpro/icons/statusface/9.gif"},
		"(ns)":		{t:"女生节",		s:"/imgpro/icons/statusface/10.gif"},
	//	"8-|":		{t:"书呆子",		s:"/imgpro/icons/statusface/13.gif"},
		"(书呆子)":	{t:"书呆子",		s:"/imgpro/icons/statusface/13.gif"},
	//	"|-)":		{t:"困",			s:"/imgpro/icons/statusface/14.gif"},
		"(困)":		{t:"困",			s:"/imgpro/icons/statusface/14.gif"},
		"(害羞)":	{t:"害羞",			s:"/imgpro/icons/statusface/15.gif"},
		"(大笑)":	{t:"大笑",			s:"/imgpro/icons/statusface/16.gif"},
	//	":d":		{t:"大笑",			s:"/imgpro/icons/statusface/16.gif"},
		"(口罩)":	{t:"防流感",		s:"/imgpro/icons/statusface/17.gif"},
		"(不)":		{t:"不",			s:"/imgpro/emotions/tie/1.gif"},
	//	"(奸笑)":	{t:"奸笑",			s:"/imgpro/emotions/tie/2.gif"},
		"(谄笑)":	{t:"谄笑",			s:"/imgpro/emotions/tie/2.gif"},
		"(吃饭)":	{t:"吃饭",			s:"/imgpro/emotions/tie/3.gif"},
	//	":-p":		{t:"吐舌头",		s:"/imgpro/emotions/tie/4.gif"},
		"(调皮)":	{t:"调皮",			s:"/imgpro/emotions/tie/4.gif"},
		"(尴尬)":	{t:"尴尬",			s:"/imgpro/emotions/tie/5.gif"},
		"(汗)":		{t:"汗",			s:"/imgpro/emotions/tie/6.gif"},
		"(惊恐)":	{t:"惊恐",			s:"/imgpro/emotions/tie/7.gif"},
		"(囧)":		{t:"囧-窘迫",		s:"/imgpro/emotions/tie/8.gif"},
		"(可爱)":	{t:"可爱",			s:"/imgpro/emotions/tie/9.gif"},
		"(酷)":		{t:"酷",			s:"/imgpro/emotions/tie/10.gif"},
		"(流口水)":	{t:"流口水",		s:"/imgpro/emotions/tie/11.gif"},
		"(猫猫笑)":	{t:"猫猫笑",		s:"/imgpro/emotions/tie/12.gif"},
		"(色)":		{t:"色迷迷",		s:"/imgpro/emotions/tie/13.gif"},
	//	"(病)":		{t:"生病",			s:"/imgpro/emotions/tie/14.gif"},
		"(生病)":	{t:"生病",			s:"/imgpro/emotions/tie/14.gif"},
		"(叹气)":	{t:"叹气",			s:"/imgpro/emotions/tie/15.gif"},
		"(淘气)":	{t:"淘气",			s:"/imgpro/emotions/tie/16.gif"},
		"(舔)":		{t:"舔",			s:"/imgpro/emotions/tie/17.gif"},
		"(偷笑)":	{t:"偷笑",			s:"/imgpro/emotions/tie/18.gif"},
		"(吐)":		{t:"呕吐",			s:"/imgpro/emotions/tie/19.gif"},
		"(吻)":		{t:"吻",			s:"/imgpro/emotions/tie/20.gif"},
		"(晕)":		{t:"晕",			s:"/imgpro/emotions/tie/21.gif"},
		"(住嘴)":	{t:"住嘴",			s:"/imgpro/emotions/tie/23.gif"},
		"(kb)":		{t:"抠鼻",			s:"/imgpro/icons/statusface/kbz2.gif"},
		"(sx)":		{t:"烧香",			s:"/imgpro/icons/statusface/shaoxiang.gif"},
		"(zmy)":	{t:"织毛衣",		s:"/imgpro/icons/statusface/zhimaoyi.gif"},
		"(jh)":		{t:"秋菊",			s:"/imgpro/icons/statusface/chrysanthemum.gif"},
		"(ju)":		{t:"人人聚焦",		s:"/imgpro/icons/statusface/jj.gif"},
		"(cold)":	{t:"降温",			s:"/imgpro/icons/statusface/cold.gif"},
		"(bw)":		{t:"暖暖被窝",		s:"/imgpro/icons/statusface/sleep.gif"},
		"(mb)":		{t:"膜拜",			s:"/imgpro/icons/statusface/guibai.gif"},
		"(tucao)":	{t:"吐槽",			s:"/imgpro/icons/statusface/tuc.gif"},
		"(s)":		{t:"大兵",			s:"/imgpro/icons/statusface/soldier.gif"},
		"(NBA)":	{t:"篮球",			s:"/imgpro/icons/statusface/basketball4.gif"},
		"(蜜蜂)":	{t:"小蜜蜂",		s:"/imgpro/icons/statusface/bee.gif"},
	//	"(bee)":	{t:"小蜜蜂",		s:"/imgpro/icons/statusface/bee.gif"},
		"(fl)":		{t:"花仙子",		s:"/imgpro/icons/statusface/hanago.gif"},
		"(cap)":	{t:"学位帽",		s:"/imgpro/icons/statusface/mortarboard.gif"},
		"(ice)":	{t:"冰棍儿",		s:"/imgpro/icons/statusface/ice-cream.gif"},
		"(gs)":		{t:"园丁",			s:"/imgpro/icons/statusface/growing-sapling.gif"},
		"(ga)":		{t:"园丁",			s:"/imgpro/icons/statusface/gardener.gif"},
		"(yt)":		{t:"光棍油条",		s:"/imgpro/icons/statusface/youtiao.gif"},
		"(bz)":		{t:"光棍包子",		s:"/imgpro/icons/statusface/baozi.gif"},
		"(wr)":		{t:"枯萎玫瑰",		s:"/imgpro/icons/statusface/wilt-rose.gif"},
		"(bh)":		{t:"破碎的心",		s:"/imgpro/icons/statusface/broken-heart.gif"},
		"(4)":		{t:"4周年",			s:"/imgpro/icons/statusface/4-years.gif"},
		"(cake)":	{t:"周年蛋糕",		s:"/imgpro/icons/statusface/4-birthday.gif"},
		"(ty)":		{t:"汤圆",			s:"/imgpro/icons/statusface/tang-yuan.gif"},
		"(read)":	{t:"读书日",		s:"/imgpro/icons/statusface/reading.gif"},
		"(ct)":		{t:"锄头",			s:"/imgpro/icons/statusface/chutou.gif"},
		"(bbt)":	{t:"棒棒糖",		s:"/imgpro/icons/statusface/bbt.gif"},
		"(bbg)":	{t:"棒棒糖",		s:"/imgpro/icons/statusface/bbg.gif"},
		"(bbl)":	{t:"棒棒糖",		s:"/imgpro/icons/statusface/bbl.gif"},
		"(xr)":		{t:"儿时回忆",		s:"/imgpro/icons/statusface/sm.gif"},
		"(mo)":		{t:"默哀",			s:"/imgpro/icons/statusface/lazhu.gif"},
		"(hot)":	{t:"烈日",			s:"/imgpro/icons/statusface/hot.gif"},
		"(feng)":	{t:"风扇",			s:"/imgpro/icons/statusface/fan.gif"},
		"(bb)":		{t:"便便",			s:"/imgpro/icons/statusface/shit.gif"},
		"(mg)":		{t:"七彩玫瑰",		s:"/imgpro/icons/statusface/rose.gif"},
		"(hzd)":	{t:"划重点",		s:"/imgpro/icons/statusface/huazhongdian.gif"},
		"(dm)":		{t:"点名",			s:"/imgpro/icons/statusface/dianming.gif"},
		"(hcn)":	{t:"花痴男",		s:"/imgpro/icons/statusface/hcn.gif"},
		"(hcv)":	{t:"花痴女",		s:"/imgpro/icons/statusface/hcnv.gif"},
		"(tic)":	{t:"车票",			s:"/imgpro/icons/statusface/ticket.gif"},
		"(tra)":	{t:"车头",			s:"/imgpro/icons/statusface/train.gif"},
		"(trb)":	{t:"车厢",			s:"/imgpro/icons/statusface/trainbox.gif"},
		"(bon)":	{t:"年终奖",		s:"/imgpro/icons/statusface/award.gif"},
		"(pt)":		{t:"派对，干杯",	s:"/imgpro/icons/statusface/partycup.gif"},
		"(三行情书)":{t:"三行情书",		s:"/imgpro/icons/statusface/xin.gif"},
		"(knx)":	{t:"康乃馨",		s:"/imgpro/icons/statusface/carnation.gif"},
		"(520)":	{t:"520",			s:"/imgpro/icons/statusface/heart.gif"},
		"(bby)":	{t:"小男孩",		s:"/imgpro/icons/statusface/boy2011.gif"},
		"(bgi)":	{t:"小女孩",		s:"/imgpro/icons/statusface/girl2011.gif"},
		"(bal)":	{t:"气球",			s:"/imgpro/icons/statusface/balloon.gif"},
		"(jy)":		{t:"加油",			s:"/imgpro/icons/statusface/2011gaokao.gif"},
		"(jt1)":	{t:"家庭空间",		s:"/imgpro/icons/statusface/jt1.gif"},
		"(jt2)":	{t:"家庭空间",		s:"/imgpro/icons/statusface/jt2.gif"},
		"(yb)":		{t:"元宝",			s:"/imgpro/icons/statusface/yuanbao.gif"},
		"(xx)":		{t:"星星",			s:"/imgpro/icons/statusface/xx.gif"},
		"(nz)":		{t:"奶嘴",			s:"/imgpro/icons/statusface/nz.gif"},
		"(哨子)":	{t:"哨子",			s:"/imgpro/icons/new-statusface/shaozi.gif"},
		"(fb)":		{t:"足球",			s:"/imgpro/icons/new-statusface/football.gif"},
		"(rc)":		{t:"红牌",			s:"/imgpro/icons/new-statusface/redCard.gif"},
		"(yc)":		{t:"黄牌",			s:"/imgpro/icons/new-statusface/yellowCard.gif"},
		"(^)":		{t:"蛋糕",			s:"/imgpro/icons/3years.gif"},
		"(r)":		{t:"火箭",			s:"/imgpro/icons/ico_rocket.gif"},
		"(w)":		{t:"宇航员",		s:"/imgpro/icons/ico_spacewalker.gif"},
		"(i)":		{t:"电灯泡",		s:"/img/ems/bulb.gif"},
		"(yeah)":	{t:"哦耶",			s:"/img/ems/yeah.gif"},
		"(good)":	{t:"牛",			s:"/img/ems/good.gif"},
		"(ng)":		{t:"否",			s:"/imgpro/icons/statusface/nogood.gif"},
		"(zy)":		{t:"最右",			s:"/imgpro/icons/statusface/zy.gif"},
		"(f)":		{t:"拳头",			s:"/img/ems/fist.gif"}
	};
	var nEmList={
		"(earth)":	{t:"地球",			s:"/imgpro/icons/statusface/wwf-earth.gif"},
		"(earth1)":	{t:"地球",			s:"/imgpro/icons/statusface/earth.gif"},
		"(rainy)":	{t:"雨",			s:"/imgpro/icons/statusface/rainy.gif"},
	//	"(rain)":	{t:"雨",			s:"/imgpro/icons/statusface/rainy.gif"},
		"(by)":		{t:"下雨",			s:"/imgpro/icons/statusface/rain.gif"},
		"(ly)":		{t:"落叶",			s:"/imgpro/icons/statusface/autumn-leaves.gif"},
		"(dx)":		{t:"雪人",			s:"/imgpro/icons/statusface/snowman.gif"},
		"(sn)":		{t:"雪花",			s:"/imgpro/icons/statusface/snow.gif"},
		"(fz)":		{t:"风筝",			s:"/imgpro/icons/statusface/kite.gif"},
		"(lt)":		{t:"柳枝",			s:"/imgpro/icons/statusface/willow.gif"},
		"(bs)":		{t:"秋高气爽",		s:"/imgpro/icons/statusface/bluesky.gif"},
		"(fog)":	{t:"大雾",			s:"/imgpro/icons/statusface/dawu.gif"},
		"(h)":		{t:"小草",			s:"/imgpro/icons/philips.jpg"},
	};
	var bEmList={
		"(gl)":		{t:"给力",			s:"/imgpro/icons/statusface/geili.gif"},
		"(bgl)":	{t:"不给力",		s:"/imgpro/icons/statusface/bugeili.gif"},
		"(ugl)":	{t:"不给力",		s:"/imgpro/icons/statusface/ungelivable.gif"},
		"(yl)":		{t:"鸭梨",			s:"/imgpro/icons/statusface/yali.gif"},
		"(dli)":	{t:"冻梨",			s:"/imgpro/icons/statusface/dl.gif"},
	//	"(hold)":	{t:"Hold住",		s:"/imgpro/icons/statusface/hold.gif"},
		"(hold1)":	{t:"Hold住",		s:"/imgpro/icons/statusface/holdzhu.gif"},
		"(sbq)":	{t:"伤不起",		s:"/imgpro/icons/statusface/shangbuqi.gif"},
		"(ymy)":	{t:"有木有",		s:"/imgpro/icons/statusface/youmuyou.gif"},
		"(th)":		{t:"惊叹号",		s:"/imgpro/icons/statusface/exclamation.gif"},
		"(cb)":		{t:"蟹蟹",			s:"/imgpro/icons/statusface/crab.gif"},
		"(see)":	{t:"看海",			s:"/imgpro/icons/statusface/seesea.gif"},
	};
	var eEmList={
		"(gq)":		{t:"国庆快乐",		s:"/imgpro/icons/statusface/nationalday2010.gif"},
		"(gq2)":	{t:"国庆快乐",		s:"/imgpro/icons/statusface/national-day-balloon.gif"},
		"(gq3)":	{t:"我爱中国",		s:"/imgpro/icons/statusface/national-day-i-love-zh.gif"},
		"(元旦)":	{t:"元旦快乐",		s:"/imgpro/icons/statusface/gantan.gif"},
		"(dl)":		{t:"灯笼",			s:"/imgpro/icons/statusface/lantern.gif"},
		"(va)":		{t:"情人节",		s:"/imgpro/icons/statusface/qixi.gif"},
		"(qx)":		{t:"七夕",			s:"/imgpro/icons/statusface/qixi11.gif"},
		"(qx2)":	{t:"七夕",			s:"/imgpro/icons/statusface/qixi2.gif"},
		"(yrj)":	{t:"愚人节",		s:"/imgpro/icons/statusface/yrj.gif"},
		"(wy)":		{t:"劳动节",		s:"/imgpro/icons/statusface/wuyi.gif"},
		"(laodong)":{t:"五一",			s:"/imgpro/icons/statusface/5.1.gif"},
		"(cy1)":	{t:"重阳节",		s:"/imgpro/icons/statusface/09double9-3.gif"},
		"(cy2)":	{t:"登高",			s:"/imgpro/icons/statusface/09double9.gif"},
		"(cy3)":	{t:"饮菊酒",		s:"/imgpro/icons/statusface/09double9-2.gif"},
		"(dad)":	{t:"父亲节",		s:"/imgpro/icons/statusface/love-father.gif"},
		"(safe)":	{t:"感恩母亲",		s:"/imgpro/icons/statusface/safeguard.gif"},
		"(mom)":	{t:"母亲节",		s:"/imgpro/icons/statusface/ilovemom.gif"},
		"(ngd)":	{t:"南瓜灯",		s:"/imgpro/icons/statusface/pumpkin.gif"},
		"(xg)":		{t:"小鬼",			s:"/imgpro/icons/statusface/ghost.gif"},
		"(hh)":		{t:"圣诞花环",		s:"/imgpro/icons/statusface/garland.gif"},
		"(stick)":	{t:"拐杖糖",		s:"/imgpro/icons/statusface/stick.gif"},
		"(socks)":	{t:"圣诞袜",		s:"/imgpro/icons/statusface/stocking.gif"},
		"(xmas)":	{t:"圣诞老人",		s:"/imgpro/icons/statusface/xmas-man.gif"},
		"(ring)":	{t:"圣诞铃铛",		s:"/imgpro/icons/statusface/xmas-ring.gif"},
		"(tree)":	{t:"圣诞树",		s:"/imgpro/icons/statusface/xmas-tree.gif"},
		"(tk)":		{t:"火鸡",			s:"/imgpro/icons/statusface/turkey.gif"},
		"(nrj)":	{t:"女人节",		s:"/imgpro/icons/statusface/lipstick.gif"},
		"(zsj)":	{t:"植树节",		s:"/imgpro/icons/statusface/trees.gif"},
		"(rs)":		{t:"玫瑰花",		s:"/imgpro/icons/statusface/rose0314.gif"},
		"(315)":	{t:"消费者权益保护日",s:"/imgpro/icons/statusface/20110315.gif"},
		"(yb1)":	{t:"月饼",			s:"/imgpro/icons/statusface/mooncake.gif"},
		"(zz)":		{t:"粽子",			s:"/imgpro/icons/statusface/zongzi.gif"},
		"(lot)":	{t:"龙头",			s:"/imgpro/icons/statusface/dwj_longtou.gif"},
		"(huc)":	{t:"划船",			s:"/imgpro/icons/statusface/dwj_huachuan.gif"},
		"(dag)":	{t:"打鼓",			s:"/imgpro/icons/statusface/dwj_dagu.gif"},
		"(low)":	{t:"龙尾",			s:"/imgpro/icons/statusface/dwj_longwei.gif"},
		"(hjr)":	{t:"世界环境日",	s:"/imgpro/icons/statusface/earthday.gif"},
		"(eh)":		{t:"地球一小时",	s:"/imgpro/icons/statusface/onehour2011.gif"},
	//	"(虎年)":	{t:"虎年",			s:"/imgpro/icons/statusface/tiger.gif"},
		"(tiger)":	{t:"虎年",			s:"/imgpro/icons/statusface/tiger.gif"},
		"(ra1)":	{t:"拜年兔",		s:"/imgpro/icons/statusface/rabbit.gif"},
		"(ra2)":	{t:"拜年兔",		s:"/imgpro/icons/statusface/rabbit2.gif"},
		"(fu)":		{t:"福",			s:"/imgpro/icons/statusface/fu.gif"},
		"(boy)":	{t:"男孩",			s:"/imgpro/icons/statusface/boy.gif"},
		"(girl)":	{t:"女孩",			s:"/imgpro/icons/statusface/girl.gif"},
		"(eclipse)":{t:"日全食",		s:"/imgpro/icons/statusface/eclipse.gif"},
		"(gk)":		{t:"高考",			s:"/imgpro/icons/statusface/gaokao.gif"},
		"(gk3)":	{t:"高考",			s:"/imgpro/icons/statusface/gk.gif"},
		"(pass)":	{t:"CET必过",		s:"/imgpro/icons/statusface/cet46.gif"},
		"(qgz)":	{t:"人人求工作",	s:"/imgpro/icons/statusface/offer.gif"},
		"(南非)":	{t:"南非",			s:"/imgpro/icons/new-statusface/nanfei.gif"},
		"(kxl)":	{t:"开学啦",		s:"/imgpro/icons/statusface/kaixuela-wide.gif",w:true},
		"(jz)":		{t:"捐建小学",		s:"/imgpro/icons/statusface/grass.gif"},
		"(nasa)":	{t:"NASA",			s:"/imgpro/icons/statusface/nasa.gif"},
		"(hz)":		{t:"传递爱心",		s:"/imgpro/icons/statusface/cdax.gif"},
		"(jq)":		{t:"坚强",			s:"/imgpro/icons/statusface/quake.gif"},
		"(rr)":		{t:"红丝带",		s:"/imgpro/icons/statusface/red-ribbon.gif"},
		"(hsd)":	{t:"红丝带",		s:"/imgpro/icons/statusface/hsd.gif"},
		"(ny)":		{t:"新年好",		s:"/imgpro/icons/statusface/2011.gif"},
		"(lb)":		{t:"腊八粥",		s:"/imgpro/icons/statusface/laba.gif"},
		"(long1)":	{t:"龙1",			s:"/imgpro/icons/statusface/long1.gif"},
		"(long2)":	{t:"龙2",			s:"/imgpro/icons/statusface/long2.gif"},
		"(long3)":	{t:"龙3",			s:"/imgpro/icons/statusface/long3.gif"},
		"(long4)":	{t:"龙4",			s:"/imgpro/icons/statusface/long4.gif"},
		"(long5)":	{t:"龙5",			s:"/imgpro/icons/statusface/long5.gif"},
		"(long6)":	{t:"龙6",			s:"/imgpro/icons/statusface/long6.gif"},
		"(vdlove)":	{t:"爱就大声说",	s:"/imgpro/icons/statusface/vdlove.gif"},
		"(t)":		{t:"火炬",			s:"/img/ems/torch.gif"}
	};
	var fEmList={
		"(mj)":		{t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj.gif"},
		"(mj2)":	{t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj2.gif"},
		"(mj3)":	{t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj3.gif"},
		"(qxs)":	{t:"悼念钱学森",	s:"/imgpro/icons/statusface/qianxuesen.gif"},
		"(raul)":	{t:"劳尔",			s:"/imgpro/icons/statusface/laoer.gif"},
		"(smlq)":	{t:"萨马兰奇",		s:"/imgpro/icons/statusface/samaranch2.gif"},
		"(kz)":		{t:"孔子",			s:"/imgpro/icons/statusface/kz.gif"},
		"(ta)":		{t:"博派",			s:"/imgpro/icons/statusface/Transformers-Autobot.gif"},
		"(td)":		{t:"狂派",			s:"/imgpro/icons/statusface/Transformers-Decepticon.gif"},
		"(jobs)":	{t:"乔布斯",		s:"/imgpro/icons/statusface/jobs.gif"},
	};
	var sfEmList={
		"(shafa1)":		{t:"抢沙发1",		s:"/imgpro/icons/statusface/rrdesk/red.gif"},
		"(shafa2)":		{t:"抢沙发2",		s:"/imgpro/icons/statusface/rrdesk/8qiangsf.gif"},
		"(shafa3)":		{t:"抢沙发3",		s:"/imgpro/icons/statusface/rrdesk/coffee.gif"},
	//	"(shafa4)":		{t:"抢沙发4",		s:"/imgpro/icons/statusface/rrdesk/coffee.gif"},
		"(shafa5)":		{t:"抢沙发5",		s:"/imgpro/icons/statusface/rrdesk/pink.gif"},
	//	"(shafa6)":		{t:"抢沙发6",		s:"/imgpro/icons/statusface/rrdesk/red.gif"},
	//	"(shafa7)":		{t:"抢沙发7",		s:"/imgpro/icons/statusface/rrdesk/pink.gif"},
		"(shafa8)":		{t:"抢沙发8",		s:"/imgpro/icons/statusface/rrdesk/yinghua.gif"},
		"(shafa9)":		{t:"抢沙发9",		s:"/imgpro/icons/statusface/rrdesk/black.gif"},
		"(shafa10)":	{t:"抢沙发10",		s:"/imgpro/icons/statusface/rrdesk/long.gif"},
	//	"(shafa11)":	{t:"抢沙发11",		s:"/imgpro/icons/statusface/rrdesk/black.gif"},
	//	"(shafa12)":	{t:"抢沙发12",		s:"/imgpro/icons/statusface/rrdesk/8qiangsf.gif"},
	//	"(shafa13)":	{t:"抢沙发13",		s:"/imgpro/icons/statusface/rrdesk/8qiangsf.gif"},
	//	"(shafa14)":	{t:"抢沙发14",		s:"/imgpro/icons/statusface/rrdesk/8qiangsf.gif"},
	//	"(shafa15)":	{t:"抢沙发15",		s:"/imgpro/icons/statusface/rrdesk/black.gif"},
	//	"(shafa16)":	{t:"抢沙发16",		s:"/imgpro/icons/statusface/rrdesk/8qiangsf.gif"},
	};

	var aEmList={
		"(bl)":		{t:"冰露",			s:"/imgpro/icons/statusface/ice.gif"},
		"(qt)":		{t:"蜻蜓",			s:"/imgpro/icons/statusface/qingt.gif"},
		"(zg)":		{t:"整蛊作战",		s:"/imgpro/icons/statusface/tomato.png"},
		"(abao)":	{t:"功夫熊猫",		s:"/imgpro/icons/statusface/panda.gif"},
		"(nuomi)":	{t:"糯米",			s:"/imgpro/icons/new-statusface/nuomi2.gif"},
	//	"(草莓)":	{t:"愉悦一刻 ",		s:"/imgpro/icons/statusface/mzy.gif"},
		"(愉悦一刻)":{t:"果粒奶优,愉悦一刻",s:"/imgpro/icons/statusface/mzynew.gif"},
		"(LG)":		{t:"LG棒棒糖",		s:"/imgpro/activity/lg-lolipop/faceicon_2.gif"},
		"(crm)":	{t:"Google Chrome",	s:"/imgpro/icons/statusface/chrome.gif"},
		"(360)":	{t:"360极速浏览器",	s:"/imgpro/icons/statusface/360chrome.gif"},
		"(fes)":	{t:"枫树浏览器",	s:"/imgpro/icons/statusface/chromeplus.gif"},
		"(camay)":	{t:"卡玫尔七夕",	s:"/imgpro/icons/statusface/camay.gif"},
		"(xrk)":	{t:"向日葵",		s:"/imgpro/icons/statusface/taiyang.gif"},
		"(wd)":		{t:"豌豆射手",		s:"/imgpro/icons/statusface/wandou.gif"},
		"(dou)":	{t:"豌豆",			s:"/imgpro/icons/statusface/dou.gif"},
		"(jqg)":	{t:"小坚果",		s:"/imgpro/icons/statusface/hetao.gif"},
		"(jsh)":	{t:"僵尸",			s:"/imgpro/icons/statusface/jiangshi.gif"},
	//	"(wd1)":	{t:"豌豆",			s:"/imgpro/icons/statusface/wandou1.gif"},	和(dou)图片相同
	//	"(js)":		{t:"僵尸",			s:"/imgpro/icons/statusface/jiangshi1.gif"},	和(jsh)图片相同
	};
	// 下面是内容过时的表情，不列出
	var odEmList={
		"(gq1)":	{t:"国庆六十周年",	s:"/imgpro/icons/statusface/national-day-60-firework.gif"},
		"(2011)":	{t:"2011",			s:"/imgpro/icons/statusface/2011g.gif"},
		"(five)":	{t:"人人网5周年",	s:"/imgpro/icons/statusface/5years.gif"},
		"(six)":	{t:"人人网6周年",	s:"/imgpro/icons/statusface/six.gif"},
		"(jd)":		{t:"建党90周年",	s:"/imgpro/icons/statusface/party90.gif"},
	};

	for(var e in emList) {
		allEmo[e]={ kind:0, alt:emList[e].t, src:emList[e].s, wide:emList[e].w };
	}
	if(nEmo) {
		for(var e in nEmList) {
			allEmo[e]={ kind:0, alt:nEmList[e].t, src:nEmList[e].s, wide:nEmList[e].w };
		}
	}
	if(eEmo) {
		for(var e in eEmList) {
			allEmo[e]={ kind:0, alt:eEmList[e].t, src:eEmList[e].s, wide:eEmList[e].w };
		}
	}
	if(fEmo) {
		for(var e in fEmList) {
			allEmo[e]={ kind:0, alt:fEmList[e].t, src:fEmList[e].s, wide:fEmList[e].w };
		}
	}
	if(aEmo) {
		for(var e in aEmList) {
			allEmo[e]={ kind:0, alt:aEmList[e].t, src:aEmList[e].s, wide:aEmList[e].w };
		}
	}
	if(sfEmo) {
		for(var e in sfEmList) {
			allEmo[e]={ kind:0, alt:sfEmList[e].t, src:sfEmList[e].s, wide:sfEmList[e].w };
		}
	}
	if(odEmo) {
		for(var e in odEmList) {
			allEmo[e]={ kind:0, alt:odEmList[e].t, src:odEmList[e].s, wide:odEmList[e].w };
		}
	}


	// 状态页(status.renren.com)的表情列表，活动页面中似乎也是这个
	var list=$("#status_emotions");
	if(list.exist()) {
		// 已经有的表情列表
		var curlist=[];
		list.find("img").each(function() {
			curlist[this.getAttribute("emotion")]=1;
		});
		for(var e in allEmo) {
			var el=allEmo[e];
			// 不在已有列表中
			if(!curlist[e] && !el.types) {
				$("@li").attr(el.w?{"class":"wider"}:{}).add($("@a").attr("href","#nogo").add($("@img").attr({title:el.alt,alt:el.alt,emotion:e,src:"http://xnimg.cn"+el.src,rsrc:"http://xnimg.cn"+el.src}))).addTo(list);
			} 
		}
		$patchCSS(".publisher-new .emotion li.wider{width:50px}.publisher-new .emotion li.wider a{width:46px}.publisher-new .emotion img{margin:0;vertical-align:baseline}");
	}

	// 阿狸表情，共51
	var alEmo = ["", "啊啊啊", "安慰", "抱抱", "暴怒", "不要啊", "嘲弄", "吃饭啦", "出走", "大汗", "感动", "好囧", "好冷", "好温暖", "喝茶", "开心", "抠鼻孔", "狂汗", "狂笑", "困了晚安", "你好强", "赖皮", "捏脸", "怒", "爬过", "飘过", "潜水啦", "闪人", "送花给你", "送你礼物", "委屈哭", "我不说话", "喜欢你", "吓唬你", "笑喷了", "旋转", "疑问", "隐身", "郁闷", "抓狂", "转圈哭", "装可爱", "嘘嘘", "晚安", "耍帅", "你伤害了我", "贱扭扭", "寒", "顶顶顶", "大惊", "不耐烦", "不公平"];
	// 囧囧熊表情，共20
	var jjEmo = ["", "被雷到", "打酱油", "得意的笑", "顶", "灌水", "激光", "泪奔", "楼上的", "楼下的", "楼主", "如题", "撒泼", "沙发", "生气", "胜利", "受惊", "刷屏", "吐", "捂嘴偷笑", "阴险"];

	for (var i = 1; i < alEmo.length; i++) {
		allEmo["[al"+(i<10?"0"+i:i)+"]"] = { kind:1, types:2, alt:alEmo[i], src:"/imgpro/emotions/ali/"+i+".gif"};
	}
	for (var i = 1; i < jjEmo.length; i++) {
		allEmo["[jj"+(i<10?"0"+i:i)+"]"] = { kind:2, types:2, alt:jjEmo[i], src:"/imgpro/emotions/jiongjiong/"+i+".gif"};
	}

	// 其他异步加载的状态表情列表
	// 由于im.js和xn.ui.emoticons.js中都会创建XN.ui.emotions，劫持$extend要简单点。
	var code="(function(){"+
		"if(!window.$extend) {"+
			"setTimeout(arguments.callee,1000);"+
			"return"+
		"}"+
		"if(window.$o_extend) {"+
			"return"+
		"}"+
		"window.$o_extend=window.$extend;"+
		"window.$extend=function(obj,attrs){"+
			"var r=$o_extend.apply(this, arguments);"+
			"if (window.XN && XN.ui && XN.ui.emotions && obj===XN.ui.emotions.prototype){"+
				"obj.o_formatData=obj.formatData;"+
				"obj.formatData=function(data){"+
					"var list=JSON.parse('"+JSON.stringify(allEmo)+"');"+
					"for (var i=0;i<data.length;i++) {"+
						"delete list[data[i].ubb];"+
					"}"+
					"var f=(data[data.length-1].kind!=0);"+		// 发布状态处没有阿狸和囧囧熊表情
					"for (var e in list) {"+
						"var em=list[e];"+
						"em.ubb=e;"+
						"if(em.kind!=0){em.img='<img src=\"http://a.xnimg.cn/'+em.src+'\" alt=\"'+em.alt+'\"/>'}"+
						"if(f||em.kind==0){data.push(em)}"+
					"}"+
					"return XN.ui.emotions.prototype.o_formatData.apply(this,arguments);"+
				"};"+
			"}"+
			"return r;"+
		"}"+
	"})()";
	$script(code);
};

// 在日志、相册中增加楼层计数
function addFloorCounter(evt) {
	if (evt && (evt.target.className == "fc" || evt.target.nodeType == 3)) {
		// 不能是Text Node
		return;
	}
	if($page("pages") && !$page("page_home")) {
		// 公共主页，除了公共主页首页。因为首页的处理和个人主页/首页相同
		if(XNR.url.match("/fdoing/\\d+")) {
			if (evt) {
				return;
			}
			// 状态
			var page=/curpage=(\d+)/.exec(XNR.url);
			var start=0;
			if(page) {
				start=parseInt(page[1])*100;
			}
			$("dl#comment_list>dd>.info").each(function(index) {
				if ($(this).find("span.fc").empty()) {
					$(this).add($("@span").addClass("fc").text((index+1+start)+"楼"),0);
				}
			});
		} else if(XNR.url.match("/photo/\\d+|/album/\\d+")) {
			// 图片
			if(evt) {
				if($("#pageBar").exist()) {
					if(evt.relatedNode.id!="pageBar" || $(evt.relatedNode).find("a.current").empty()) {
						return;
					}
				} else if(!/^replies/.test(evt.target.className)) {
					return;
				}
			}
			if($("#commContainer>dl.replies>dd>.info").empty()) {
				return;
			}
			if($("#commContainer>dl.replies[fl]").exist()) {
				return;
			} else {
				$("#commContainer>dl.replies").attr("fl","");
			}
			var page=$("#pageBar>a.current").text() || "1";
			var start=(parseInt(page)-1)*30;
			$("#commContainer>dl.replies>dd>.info").each(function(index) {
				if ($(this).find("span.fc").empty()) {
					$(this).add($("@span").addClass("fc").text((index+1+start)+"楼 "),0);
				} else {
					return true;
				}
			});
		} else if(XNR.url.match("/note/\\d+")) {
			// 日志
			if (evt) {
				return;
			}
			var page=/curpage=(\d+)/.exec(XNR.url);
			var start=0;
			if(page) {
				start=parseInt(page[1])*100;
			}
			$("ol#commentlist>li>.comment>.info").each(function(index) {
				if ($(this).find("span.fc").empty()) {
					$(this).add($("@span").addClass("fc").css("float","left").text((index+1+start)+"楼"),0);
				} else {
					return true;
				}
			});
		} else if(XNR.url.match("/page\\.renren\\.com/[^/]+/share")) {
			// 分享
			var mark = function() {
				var share = $(this);
				if (!/(\d+)条/.exec(share.find("#postcmtlink").text())) {
					return;
				}
				var replyAmount = parseInt(RegExp.$1);
				var replies = share.find("dl.replies>dd>.info");
				var start = replyAmount - replies.size() + 1;
				replies.each(function(index) {
					if ($(this).find("span.fc").empty()) {
						$(this).add($("@span").addClass("fc").css({"float":"left","margin-right":"3px"}).text((index+start)+"楼"),0);
					} else {
						return true;
					}
				});
			};
			if (evt) {
				if (/commContainer/.test(evt.target.id)) {
					mark.call(evt.target.parentNode.parentNode.parentNode.parentNode);
				} else if (/replies/.test(evt.target.className)) {
					mark.call(evt.target.parentNode.parentNode.parentNode.parentNode.parentNode);
				} else {
					mark.call(evt.relatedNode);
				}
			} else {
				$("div.share-body").each(mark);
			}
		}
	} else if($page("feed") || $page("profile") || $page("page_home")) {
		// 首页/个人主页/公共主页首页新鲜事的回复
		var mark = function() {
			var share = $(this);
			var replies = share.find("div.statuscmtitem > .replybody");
			var moreReply = share.find(".showmorereply");
			if (moreReply.empty()) {
				var hidden = false;
				var replyAmount = replies.size();
				var start = 1;
			} else {
				var hidden = (share.find(".showmorereply").css("display") != "none");
				var info = share.find(".showmorereply").text().replace(/\s/g, "");
				if (!info || /加载中/.exec(info) || "显示全部回复"==info) {
					return;
				}
				if (/还有(\d+)条/.exec(info)) {
					if (hidden) {
						var replyAmount = parseInt(RegExp.$1) + 2;
						if (replies.size() == 2) {
							var start = 1;
						} else {
							var start = replyAmount - replies.size() + 1;
						}
					} else {
						var replyAmount = replies.size();
						var start = 1;
					}
				} else if (/显示(\d+)条中的最新(\d+)条/.exec(info)) {
					var replyAmount = parseInt(RegExp.$1);
					var start = replyAmount - parseInt(RegExp.$2) + 1;
				} else if (/显示最新(\d+)条/.exec(info)) {
					// 准确数目不明？
					var start = 1;
					if (hidden) {
						var replyAmount = parseInt(RegExp.$1);
					} else {
						var replyAmount = replies.size();
					}
				} else {
					var replyAmount = replies.size();
					var start = 1;
				}
			}
			if (start <= 0) {
				// 人人网抽风了
				start = 1;
			}
			if (hidden && replies.size() == 2) {
				// 中间的被隐藏了，只有首尾两条
				replies.each(function(index) {
					if ($(this).find("span.fc").empty()) {
						$(this).add($("@span").addClass("fc").css({"float":"left","margin-right":"3px"}).text((index?replyAmount:start)+"楼"),0);
					} else {
						return true;
					}
				});
			} else {
				replies.each(function(index) {
					var fc = $(this).find("span.fc");
					if (fc.empty()) {
						$(this).add($("@span").addClass("fc").css({"float":"left","margin-right":"3px"}).text((index+start)+"楼"),0);
					} else {
						// 有些浏览器上是分段添加的。。
						fc.text((index+start)+"楼");
					}
				});
			}
		};
		if (evt) {
			if (/statuscmtitem/.test(evt.target.className)) {
				if (/more/.test(evt.target.className)) {
					return;
				} else {
					mark.call(evt.target.parentNode);
				}
			} else if(/a-feed/.test(evt.target.className)) {
				mark.call(evt.target);
			} else {
				var afeeds = $(evt.relatedNode).find("article.a-feed");
				if (afeeds.empty()) {
					mark.call(evt.relatedNode);
				} else {
					afeeds.each(function() {
						mark.call(this);
					});
				}
			}
		} else {
			$("div.replies").each(mark);
		}
	} else if($page("share")) {
		// 分享
		var mark = function() {
			var share = $(this);
			if (!/(\d+)条/.exec(share.find("#postcmtlink").text())) {
				return;
			}
			var replyAmount = parseInt(RegExp.$1);
			var replies = share.find("dl.replies>dd>.info");
			var start = replyAmount - replies.size() + 1;
			replies.each(function(index) {
				if ($(this).find("span.fc").empty()) {
					$(this).add($("@span").addClass("fc").css({"float":"left","margin-right":"3px"}).text((index+start)+"楼"),0);
				} else {
					return true;
				}
			});
		};
		if (evt) {
			if (/commContainer/.test(evt.target.id)) {
				mark.call(evt.target.parentNode.parentNode.parentNode.parentNode);
			} else if (/replies/.test(evt.target.className)) {
				mark.call(evt.target.parentNode.parentNode.parentNode.parentNode.parentNode);
			} else {
				mark.call(evt.relatedNode);
			}
		} else {
			$("div.share-body").each(mark);
		}
	} else {
		// 日志或相册
		if(evt && !/^replies/.test(evt.target.className)) {
			return;
		}
		var replyAmount;	//回复总数
		if($page("blog")) {
			if($("p.stat-article").empty()) {
				return;
			}
			replyAmount=parseInt(/评论\((\d+)\)/.exec($("p.stat-article").text())[1]);
		} else {
			replyAmount=parseInt($("#allComCount").text());
			if(isNaN(replyAmount)) {
				replyAmount=parseInt($("#commentCount").text());
				if(isNaN(replyAmount)) {
					return;
				}
			}
		}
		//已显示的回复
		var shownReplies=$("dl.replies>dd[id^='talk']");
	
		//显示的回复的开始楼层
		var replyStartFloor=replyAmount-shownReplies.size();
		if(shownReplies.empty() || replyStartFloor<0) {
			//没有回复或出错
			return;
		}
		shownReplies.each(function(index) {
			var info=$(this).find(".info");
			if(info.find("span.fc").empty()) {
				$("@span").text((replyStartFloor+parseInt(index)+1)+"楼 ").attr("class","fc").css("color","grey").addTo(info,0);
			} else {
				//添加过了，不再继续
				return true;
			}
		});
	
		// 点击显示更多评论后隐藏其链接，防止重复点击
		if(!$allocated("show-all-id")) {
			$alloc("show-all-id");
			$("#show-all-id").bind("DOMNodeInserted",function(evt) {
				$("#showMoreComments").hide();
				$dealloc("show-all-id");
			}).bind("DOMNodeRemoved",function(evt) {
				$("#showMoreComments").show();
			});
		}
	}
};

// 允许在分享的全站评论中回复
function allowReplyToAllPeople(evt) {
	if(evt && !/^replies/.test(evt.target.className)) {
		return;
	}
	var replies = $("#allCmtsList dl.replies > dd");
	if (replies.empty()) {
		return;
	}
	var sid = parseInt($("#shareId").val());
	if (isNaN(sid)) {
		return;
	}
	replies.each(function() {
		if ($(this).find(".reply > a[cmd*='reply']").exist()) {
			return;
		}
		var o = $(this).find("a.avatar");
		if (o.exist()) {
			var oname = o.attr("title")
		} else {
			o = $(this).find(".info > a[href*='profile.do']");
			var oname = o.text();
		}
		var oid = /id=(\d+)/.exec(o.attr("href"))[1];
		if (oid == XNR.userId) {
			return;
		}
		var cid = /\d+$/.exec(this.id)[0];
		var cmd = {
			t: "reply",
			sid: sid,
			oid: oid,
			cid: cid,
			oname: oname
		};
		var a = $("@a").addTo($(this).find(".reply"));
		a.attr("cmd", JSON.stringify(cmd));
		a.attr("href", "javascript:void(0);");
		a.text("回复");
	});
	if (!evt) {
		// 处理postParams
		var code = "if(XN.array._toQueryString){return}" +
		"XN.array._toQueryString=XN.array.toQueryString;" +
		"XN.array.toQueryString=function(a){" +
			"if(a.repetNo){"+
				"delete a.all" +
			"}"+
			"return XN.array._toQueryString.apply(this, arguments)"+
		"}";
		$script(code);
	}
}

// 允许在日志中添加HTTPS/FTP协议的链接
function extendBlogLinkSupport() {
	const code='var f=window.tinyMCE.editors.editor.plugins.xnLink.update.toString().replace("/^http:/","/^https?:|^ftp:/").replace(/function\\s*\\S*?\\(\\)\\s*{/,"").replace(/}$/,"");window.tinyMCE.editors.editor.plugins.xnLink.update=new Function(f);';
	$script(code);
};

// 在编辑日志时添加直接编辑HTML代码按钮
function addBlogHTMLEditor() {
	var zhan = false;
	if ($page("zhan")) {
		zhan = true;
	} else if(!XNR.url.match(/\/editBlog\b|\/editDraft\b|\/addBlog\b|\/NewEntry\.do|\/new$|\/edit$/i)) {
		return;
	}
	
	var last=$("#editor_toolbar1 td.mceToolbarEndButton");
	if(last.empty()) {
		setTimeout(arguments.callee, 500);
		return;
	}
	
	if ($("#editor_toolbar1 .mce_changeMode").empty()) {
		// 普通模式需要设置下按钮样式
		const css="#editor_editcode{background-position:0 -196px; padding:2px; background-image:url(http://a.xnimg.cn/imgpro/editor/editor.gif); height:24px}#editor_editcode:hover{background-position:0 0}";
		$patchCSS(css);
	} else {
		// 高级模式，要放到第二行
		if ($("#editor_toolbar2").exist()) {
			last = $("#editor_toolbar2 td.mceToolbarEndButton");
		}
		// 加宽点，否则HTML显示不全
		$patchCSS("#editor_editcode .mce_code{width:20px}");
	}

	$("@td").css("position","relative").add($("@span").addClass("mceSeparator")).move("before",last);
	$("@td").css("position","relative").html('<a title="编辑HTML" onclick="return false;" onmousedown="return false;" class="mceButton mceButtonEnabled" href="javascript:;" id="editor_editcode"><span class="mceIcon mce_code"></span></a>').move("before",last);

	if (zhan) {
		// 处理所有分隔符，腾出空间
		$("#editor_toolbar1 .mceSeparator").css({"width":"1px","margin":"0"});
		$("#editor_fullscreen").css("padding","3px 2px 1px");
	}

	$("#editor_editcode").bind("click",function() {
		// 由于跨域，无法使用内置的编辑器，必须自己创建一个编辑框
		// tinyMCE.execInstanceCommand("editor","mceCodeEditor",false)
		if (!zhan) {
			var code='var dlg=new XN.ui.dialog({modal:true});'+
        		'dlg.hide();'+
				'dlg.setWidth("auto");'+
				'dlg.setHeight("auto");'+
				'dlg.header.setContent("编辑HTML代码");'+
				'dlg.body.setContent("<textarea style=\'width:600px;height:280px\'></textarea>");'+
				'dlg.addButton({text:"\u786e\u5b9a", onclick:function(){'+
					'tinyMCE.activeEditor.setContent(dlg.frame.querySelector("textarea").value);'+
				'}});'+
				'dlg.addButton({text:"\u53d6\u6d88"});'+
				'dlg.getButton("\u53d6\u6d88").addClass("gray");'+
				'dlg.frame.querySelector("table").style.display = "block";'+	// 不加此句webkit显示会乱掉
				'dlg.show();'+
				'var editor = tinyMCE.activeEditor;'+
				'var pos = XN.form.getRichEditorPos(editor);'+
				'dlg.moveTo(pos.x, pos.y-120);'+
				'var textarea = dlg.frame.querySelector("textarea");'+
				'textarea.value = editor.getContent();'+
				'textarea.focus();';
		} else {
			var code='var dlg=jQuery.confirmDialog({width:640});'+
        		'dlg.hide();'+
        		'dlg.getHeader().find("h3").text("编辑HTML代码");'+
				'dlg.getBody().html("<textarea style=\'width:600px;height:280px\'></textarea>");'+
				'dlg.getButton("confirm").click(function(){'+
					'tinyMCE.activeEditor.setContent(dlg.getBody().find("textarea").val());'+
				'});'+
				'dlg.show();'+
				'dlg.getBody().find("textarea").val(tinyMCE.activeEditor.getContent()).focus();';
		}
		$script(code);
	});
};

// 阻止统计信息
function preventTracking0() {
	var code="const COMSCORE=null";
	$script(code,true);
	// 阻止得到/失去焦点时发送信息
	var code="window.statisFocusEventAdded=true;window.statisBlurEventAdded=true";
	$script(code);
	// 阻止滚动到底部时发送信息
	var code="window.statisBottomEventAdded=true";
	$script(code);
};

// 阻止统计信息
function preventTracking2() {
	// 阻止点击鼠标时发送信息
	var code="var count=0;"+
	"(function(){"+
		"try{"+
			"XN.app.statsMaster.init=function(){};"+
			"XN.app.statsMaster.destroy()"+
		"}catch(ex){"+
			"if(count<10)"+
				"setTimeout(arguments.callee,500);"+
			"count++"+
		"}"+
	"})()";
	$script(code);

	// 阻止得到/失去焦点时与滚动底部时发送信息
	var checkCode = "var f = arguments.callee.caller;" +
	"if (f) {" +
		"var fs = f.toString();" +
		"var e;" +
		"if (fs.indexOf('unfocus?J=') > 0) {" +
			"e = 'blur'" +
		"} else if (fs.indexOf('focus?J=') > 0) {" +
			"e = 'focus'" +
		"} else if (fs.indexOf('scrollbottom?J=') > 0) {" +
			"e = 'scrollbottom'" +
		"}" +
		"if (e) {" +
			"if (e == 'scrollbottom') {" +
				"XN.events.delEvent(e, f);" +
			"} else {" +
				"XN.event.delEvent(window, e, f);" +
			"}" +
			"throw e + ' tracking disabled'" +
		"}" +
	"}";
	// safari的getter中arguments.callee.caller为null
	if (XNR.agent != SAFARI) {
		code = "if (XN.env.__defineGetter__) {" +
			"XN.env.__defineGetter__('domain', function() {" +
				checkCode +
				"return 'renren.com'" +
			"});" +
		"}";
	} else {
		code = "if (Math._random) {" +
			"return" +
		"}" +
		"Math._random = Math.random;" +
		"Math.random = function() {" +
			checkCode + 
			"return Math._random.apply(this, arguments)"
		"}";
	}
	$script(code);
};

// 将相册中所有照片放在一页中显示
// 压力测试：http://photo.renren.com/photo/242786354/album-236660334
function showImagesInOnePage() {
	if($("#single-column table.photoList").exist()) {
		// 公共主页相册
		var baseURL="http://page.renren.com/@@/album/##?curpage=%%";
		var album=$("#single-column");
		var items=$(".pager-top>span");
		var pagerInfo=$("div.pager-top");
	} else if(XNR.url.indexOf("/photo/ap/")!=-1) {
		// 外链相册
		var baseURL="http://photo.renren.com"+document.location.pathname+"?curpage=%%";
		var album=$("div.photo-list");
		var items=$(".number-photo");
		var pagerInfo=$("div.pager-nav");
	} else if($(".all-photos>.photo-list").exist()) {
		// 线上活动相册
		var baseURL="http://event.renren.com"+document.location.pathname+"?curpage=%%";
		var album=$("div.photo-list");
		var items=$();	// 没有总数
		var pagerInfo=$("div.pagertop");
	} else if ($(".share-photo-main>.photo-list").exist()) {
		// 从分享相册新鲜事的相册封面照片进入的
		var baseURL="http://share.renren.com"+document.location.pathname+"?curpage=%%";
		var album=$("div.photo-list");
		var items=$(".number-photo");
		var pagerInfo=$("div.pager-top");
	} else if($(".group-home>.album-list").exist()){
		// 小组相册
		var baseURL="http://xiaozu.renren.com"+document.location.pathname+"?curpage=%%";
		var album=$("@div").move("before",$("ul.album-list")).add($("ul.album-list"));
		var items=$(".group-home>.pagerbox>span");
		var pagerInfo=$("#pageTopPanel");
	} else {
		var baseURL="http://photo.renren.com/getalbum.do?id=##&owner=@@&curpage=%%&t=**";
		var album=$("div.photo-list");
		var album2=$("div.story-pic");
		var items=$(".number-photo");
		var pagerInfo=$("div.pager-top");
	}

	if(album.empty()) {
		return;
	}
	// 获取相册信息
	if(baseURL.indexOf("##")>0 || baseURL.indexOf("@@")>0) {
		var ownerId,albumId;
		$("head script:not([src])").each(function() {
			var text=$(this).text();
			if(text.match("albumId:[0-9]+,")) {
				albumId=/albumId:([0-9]+),/.exec(text)[1];
				ownerId=/ownerId:([0-9]+),/.exec(text)[1];
				return false;
			} else if(text.match("XN\\.page\\.data\\s*=\\s*{[^}]*id:[0-9]+")) {
				albumId=/album\/([0-9]+)/.exec(XNR.url)[1];
				ownerId=/XN\.page\.data\s*=\s*{[^}]*id:([0-9]+)/.exec(text)[1];
				return false;
			}
		});
		if(baseURL.indexOf("@@")>0 && !ownerId) {
			return;
		}
		baseURL=baseURL.replace("@@",ownerId).replace("##",albumId);
	}
	// 加密相册密码
	if(new RegExp("[?&]t=([0-9a-z]{32})").test(XNR.url)) {
		baseURL=baseURL.replace("**",RegExp.$1);
	} else {
		baseURL=baseURL.replace("&t=**","");
	}

	var pager=$pager(pagerInfo);
	// 当前页数
	var curPage=pager.current;
	// 总页数
	var maxPage=pager.last;

	// 原始文字，防止后面出错
	var origText="";
	items.each(function() {
		for(var i=0;i<this.childNodes.length;i++) {
			// TextNode
			if(this.childNodes[i].nodeType==3) {
				var photoAmount=this.childNodes[i].nodeValue.match(/共\s*[0-9]+\s*[张个]/);
				if(photoAmount) {
					origText=this.childNodes[i].nodeValue;
					this.childNodes[i].nodeValue=photoAmount;
					break;
				}
			}
		}
	});

	album.child(0).attr("page",curPage);

	if(typeof album2!="undefined") {
		$("@div").add(album2.find(".story-pic-list")).addTo(album2);
	}

	for(var i=0;i<=maxPage;i++) {
		if(i==curPage) {
			continue;
		}
		$get(baseURL.replace("%%",i),function(res,url,page) {
			if(!res) {
				$("ol.pagerpro").show();
				items.each(function() {
					for(var i=0;i<this.childNodes.length;i++) {
						// TextNode
						if(this.childNodes[i].nodeType==3 && /共\s*[0-9]+\s*张/.test(this.childNodes[i].nodeValue)) {
							this.childNodes[i].nodeValue=origText;
							break;
						}
					}
				});
				return;
			}
			try {
				if($("#single-column table.photoList").exist()) {
					var photoList=/(<table\s[^>]*?class="photoList"[^>]*?>[\s\S]+?<\/table>)/.exec(res)[1];
				} else if(XNR.url.indexOf("/photo/ap/")!=-1) {
					var photoList=/<div\s[^>]*?class="photo-list [^"]*clearfix"[^>]*?>([\s\S]+?)<\/div>/.exec(res)[1];
				} else if($(".all-photos>.photo-list").exist()) {
					var photoList=/<div\s[^>]*?class="photo-list"[^>]*?>\s*(<ul>[\s\S]+?<\/ul>)/.exec(res)[1];
				} else if($(".share-photo-main>.photo-list").exist()) {
					var photoList=/<div\s[^>]*?class="photo-list [^"]*clearfix"[^>]*?>\s*(<ul>[\S\s]+?<\/ul>)/.exec(res)[1];
				} else if($(".group-home>div>.album-list").exist()) {
					var photoList=/(<ul\s[^>]*?class="album-list [^"]*clearfix">[\s\S]+?<\/ul>)/.exec(res)[1];
				} else {
					var photoList=/<div\s[^>]*?class="photo-list [^"]*clearfix"[^>]*?>([\s\S]+?)<\/div>/.exec(res)[1];
					var storyList=/<!--start storyList mode-->\s*<div\s[^>]*?class="story-pic [^"]*clearfix"[^>]*?>([\s\S]+?)<\/div>\s*<!--story mode end-->/.exec(res)[1];
				}
				var pos;
				if(page>parseInt(album.child(-1).attr("page"))) {
					pos=album.heirs();
				} else {
					// 二分查找法确定插入位置low
					var low=0,high=album.heirs()-1;
					while(low<=high) {
						var mid=parseInt((low+high)/2);
						if(page>parseInt(album.child(mid).attr("page"))) {
							low=mid+1;
						} else {
							high=mid-1;
						}
					}
					pos=low;
				}
				album.add($("@div").html(photoList).child(0).attr("page",page),pos);
				if(typeof album2!="undefined" && album2.exist()) {
					album2.add($("@div").html(storyList),pos);
				}
			} catch (ex) {
				$error("showImagesInOnePage::$get",ex);
			}
		},i);
	}
	$("ol.pagerpro").hide();
};

// 在相册中添加生成下载页链接
// 压力测试：http://photo.renren.com/photo/242786354/album-236660334
function addDownloadAlbumLink(linkOnly,repMode) {
	if($(".photo-list,table.photoList,ul.album-list").empty()) {
		return;
	}
	var downLink=$("@a").attr({"style":'background-image:none;padding-left:10px;padding-right:10px',"href":'javascript:;'}).text("下载当前页图片");
	if($(".function-nav.bottom-operate ul.nav-btn").exist()) {
		$(".function-nav.bottom-operate ul.nav-btn").eq(-1).add($("@li").attr("class","pipe").text("|")).add($("@li").add(downLink));
	} else if($(".function-nav.photolist-pager").exist()) {
		// 外链相册
		$("@div").add(downLink).move("before",$(".function-nav.photolist-pager"));
	} else if($(".share-operations").exist()) {
		// 从分享相册新鲜事中的相册封面图片进入
		$(".share-operations").add($("@span").attr("class","pipe").text("|")).add(downLink);
	} else if($("table.photoList").exist()) {
		// 公共主页相册
		var ap=$("table.photoList").superior();
		if(ap.child(-1).tag()=="DIV" && ap.find("div>p>span").exist()) {
			ap.find("div>p>span").superior().add(downLink);
		} else {
			ap.add(downLink.attr("style",null));
		}
	} else if($(".group-home ul.album-list").exist()) {
		// 小组相册
		downLink.move("before",$(".group-home>.pagerbox").eq(-1));
	} else if($(".pager-bottom,.pagerbottom").exist()) {
		$(".pager-bottom,.pagerbottom").add(downLink.css("lineHeight","22px"),0);
	} else {
		return;
	}
	downLink.bind("click",function(evt) {
		if(downLink.text().match("分析中")) {
			if(window.confirm("要中止吗？")) {
				finish();
			}
			return;
		}
		$alloc("download_album",[]);
		var mode=$(".review-mode");
		if ($(".review-mode").exist()) {
			// 有评论模式，是一般相册
			// 目前是异步加载新的页数，所以当成是所有图片已经在一页中显示了
			if (/photo\/(\d+)\/album-(\d+)/.test(XNR.url)) {
				downLink.text("分析中...");
				var ownerId = RegExp.$1;
				var albumId = RegExp.$2;
				// FIXME 随便指定个1000应该没问题吧
				$get("http://photo.renren.com/photo/"+ownerId+"/album-"+albumId+"/bypage/ajax?curPage=0&pagenum=1000", function(html) {
					if (!html) {
						finish();
						return;
					}
					if(!downLink.text().match("分析中")) {
						return;
					}

					try {
						var list = JSON.parse(html).photoList;
					} catch(ex) {
						finish();
						$error("addDownloadAlbumLink::$get", "相册内容解析失败");
						return;
					}
					var pool=$alloc("download_album");
					var amount=list.length;
					var cur=0;
					for (var i = 0; i < amount; i++) {
						var photo = list[i];
						var largeImg = photo.largeUrl;
						if (/xlarge_|original_|\/p_/.test(largeImg)) {
							// 文件名以p_开头的，是通过普通上传方式上传，没有特大图（？）
							pool.push({i:i,src:largeImg,title:photo.title});
							cur++;
							downLink.text("分析中...("+cur+"/"+amount+")");
						} else if (photo.photoId) {
							// largeUrl中记录的不是特大图，是否存在特大图需要进一步检查
							photo.idx = i;
							$get("http://photo.renren.com/photo/"+ownerId+"/photo-"+photo.photoId+"/large?xtype=album", function(html,url,photo) {
								if (/src="([^"]+?(xlarge|original)_[^"]+)"/.test(html)) {
									photo.largeUrl = RegExp.$1;
								}
								pool.push({i:photo.idx,src:photo.largeUrl,title:photo.title});
								cur++;
								downLink.text("分析中...("+cur+"/"+amount+")");
								if (amount == cur) {
									finish();
								}
							},photo);
						} else {
							// 格式变了，等用户来报告吧
							cur--;
						}
					}
					if (amount == cur) {
						finish();
					}
				});
				return;
			}
		}

		// 普通模式
		links=$(".photo-list span.img a, table.photoList td.photoPan>a, .photo-list>ul>li>a.cover, ul.album-list>li>a.photo-box");
		var totalImage=links.size();
		if(totalImage==0) {
			return;
		}
		var cur=0;
		links.attr("down","down");
		downLink.text("分析中...(0/"+totalImage+")");
		var hrefs=[];
		links.each(function() {
			hrefs.push({t:this,l:this.href});
		});

		var a=hrefs.shift();
		$get(a.l,function(html,url,target) {
			var imageSrc="";
			var imageTitle="";
			try {
				if(html==null) {
					return;
				}
				if(!downLink.text().match("分析中")) {
					return;
				}

				if(html.search("<body id=\"errorPage\">")!=-1) {
					return;
				}
				var src=/var photo *= *({.*});?/.exec(html);
				if(src) {
					src=JSON.parse(src[1]);
					if(src.photo && src.photo.large) {
						imageSrc=src.photo.large;
						imageTitle=src.photo.title;
						return;
					}
				}
				// 公共主页相册
				var src=/XN.PAGE.albumPhoto.init\((.*?)\);/i.exec(html);
				if(src) {
					src=JSON.parse("["+src[1].replace(/'.*?'/g,"0").replace(",photo:",',"photo":')+"]")[10];
					if(src && src.photo && src.photo.large) {
						imageSrc=src.photo.large;
						imageTitle=src.photo.title;
						return;
					}
				}
				// 其他的照片 ？？？
				var src=/<img[^>]+id="photo".*?>/.exec(html);
				if(src) {
					src=/src=\"(.*?)\"/.exec(src);
					if(src && src[1] && src[1].indexOf("/a.gif")==-1) {
						imageSrc=src[1];
						return;
					}
				}
			} catch(ex) {
				$error("addDownloadAlbumLink::$get",ex);
			} finally {
				if(imageSrc) {
					if(imageSrc.indexOf("/large_")>0 && /\/2012\d{4}\//.test(imageSrc)) {
						imageSrc=imageSrc.replace("large_", "original_");
					}
					$alloc("download_album").push({i:totalImage-hrefs.length,src:imageSrc,title:(imageTitle || ($(target).find("img").attr("alt") || ""))});
						$(target).attr({down:null});
				}
				cur++;
				if(cur==totalImage) {
					if(downLink.text().match("分析中")) {
						finish();
					}
				} else {
					downLink.text("分析中...("+cur+"/"+totalImage+")");
				}
				if (hrefs.length>0 && downLink.text().match("分析中")) {
					var a=hrefs.shift();
					$get(a.l, arguments.callee, a.t);
				}
			}
		},a.t);

		function finish() {
			try {
				downLink.text("下载当前页图片");
				if($alloc("download_album").length==0) {
					alert("无法获取任何图片的地址");
				} else {
					var failedImages=$(".photo-list span.img a[down],table.photoList td.photoPan>a[down],.photo-list>ul>li>a.cover[down]");
					var failedImagesList=[];
					if(failedImages.exist()) {
						failedImages.each(function() {
							failedImagesList.push(this.href);
						});
					}
					var titleNode=$(".ablum-infor>h1").clone();
					titleNode.find("span.num").remove();
					var title=titleNode.text();
					if(!title) {
						// 旧式相册
						title=$(".ablum-Information .Information h1").text();
					}
					if(!title) {
						// 分享相册
						title=$(".photo-title .Information h1").text();
					}
					if(!title) {
						// 外链相册
						var t=$(".album-meta .detail>.name").clone();
						t.find("strong").remove();
						title=t.text().replace(/^ - /,"");
					}
					if(!title) {
						// 公共主页
						title=$(".compatible>#content>.pager-top>span>h3").text();
					}
					if(!title) {
						// 线上活动相册
						title=$(".page-title>h3").text();
					}
	
					// 相册数据
					var album={
						ref:XNR.url,					// 来源
						title:title,					// 相册名
						data:$alloc("download_album"),	// 已分析出的图片数据
						unknown:failedImagesList,		// 失败/未知的数据
						type:linkOnly					// 只显示链接
					};
					if(repMode || XNR.agent==USERSCRIPT || XNR.agent==OPERA_UJS || XNR.agent==OPERA_EXT) {
						var html="<head><meta content=\"text/html;charset=UTF-8\" http-equiv=\"Content-Type\"><title>"+album.title.replace("\\","\\\\").replace("'","\\'")+"</title><style>img{height:128px;width:128px;border:1px solid #000000;margin:1px}</style><script>function switchLink(){var links=document.querySelectorAll(\"a[title]:not([title=\\'\\'])\");for(var i=0;i<links.length;i++){if(links[i].textContent!=links[i].title){links[i].textContent=links[i].title}else{links[i].textContent=links[i].href}}};function switchIndex(add,max){var links=document.querySelectorAll(\"*[index]\");for(var i=0;i<links.length;i++){if(add){links[i].title=idx(parseInt(links[i].getAttribute(\"index\"))+1,max)+\" \"+links[i].title}else{links[i].title=links[i].title.replace(/^[0-9]+ /,\"\")}}};function idx(n,max){var i=0;for(;max>0;max=parseInt(max/10)){i++}n=\"00000\"+n;return n.substring(n.length-i,n.length)}</script></head><body>";
						html+="<p><a target=\"_blank\" href=\"http://code.google.com/p/xiaonei-reformer/wiki/DownloadAlbum\">下载指南</a>";
						html+="</p><p>来源："+album.ref+"</p>";
						if(album.unknown.length>0) {
							html+="<p>未能取得以下地址的图片：</p>";
							if(album.type) {
								for(var i=0;i<album.unknown.length;i++) {
									html+="<span>"+album.unknown[i]+"</span><br/>";
								}
							} else {
								for(var i=0;i<album.unknown.length;i++) {
									html+="<a href=\""+album.unknown[i]+"\">"+album.unknown[i]+"</a><br/>";
								}
							}
							html+="<p/>";
						}
						if(album.type) {
							if(album.data.length>0) {
								html+="<p>图片数量："+album.data.length+"</p>";
								html+="<p>使用下载工具软件下载本页面全部链接即可得到下列图片</p>";
								html+="<p><input type=\"button\" onclick=\"switchLink()\" value=\"切换链接描述\"/></p>";
								html+="<p><input type=\"checkbox\" onclick=\"switchIndex(this.checked,"+album.data.length+")\">在描述前添加图片序号</input></p>";
							}
							for(var i=0;i<album.data.length;i++) {
								var img=album.data[i];
								html+="<a href=\""+img.src+"\" index=\""+img.i+"\" title=\""+img.title.replace(/'/g,"\\'")+"\">"+img.src+"</a><br/>"
							}
						} else {
							if(album.data.length>0) {
								html+="<p>图片数量："+album.data.length+"</p>";
								if (XNR.agent==OPERA_EXT || XNR.agent==OPERA_UJS) {
									if (repMode) {
										html+="<p>尊敬的Opera用户，请在下列图片上逐个点鼠标右键手动保存。如果是在使用11.00之前的Opera，可尝试完整保存本页面，在与页面同名文件夹下得到下列图片</p>";
									} else {
										html+="<p>尊敬的Opera用户，请在下列图片上逐个点鼠标右键手动保存。这是Opera本身的限制，如果您有什么好的方法可以实现一次性保存全部图片，欢迎来信赐教</p>";
									}
								} else {
									html+="<p>完整保存本页面（建议在图片全部显示完毕后再保存）即可在与页面同名文件夹下得到下列图片</p>";
								}
								html+="<p><input type=\"checkbox\" onclick=\"switchIndex(this.checked,"+album.data.length+")\">在描述前添加图片序号</input></p>";
							}
							for(var i=0;i<album.data.length;i++) {
								var img=album.data[i];
								html+="<img height=\"128\" width=\"128\" src=\""+img.src+"\" index=\""+img.i+"\" title=\""+img.title.replace(/'/g,"\\'")+"\"/>"
							}
						}
						html+="</body>";
						if(repMode) {
							// script通过innerHtml不会被执行
							document.documentElement.innerHTML=html.replace(/<script>[\s\S]*<\/script>/,"");
							$("@script").text(/<script>([\s\S]*)<\/script>/.exec(html)[1]).addTo(document);
						} else {
							if(XNR.agent==OPERA_EXT) {
								XNR.oexSendRequest({action:"album",data:html});
							} else {
								window.open("javascript:'"+html+"'");
							}
						}
					} else if(XNR.agent==FIREFOX) {
						XNR_album(album);
					} else if(XNR.agent==CHROME) {
						chrome.extension.sendRequest({action:"album",data:album});
					} else if(XNR.agent==SOGOU) {
						sogouExplorer.extension.sendRequest({action:"album",data:album});
					} else if(XNR.agent==SAFARI) {
						safari.self.tab.dispatchMessage("xnr_album",album);
					}
				}
				$dealloc("download_album");
				$(".photo-list span.img a,table.photoList td.photoPan>a").attr({down:null});
			} catch(ex) {
				$error("addDownloadAlbumLink::finish",ex);
			}
		};
	});
};

// 当鼠标在照片上时隐藏圈人框
function hideImageTagOnMouseOver() {
	$("#photoContainer").attr({"onmouseover":"var o=document.querySelector('.tagshowcon');if(o)o.style.visibility='hidden'","onmouseout":"var o=document.querySelector('.tagshowcon');if(o)o.style.visibility=null"});
};

// 显示大图的初始化工作
function initFullSizeImage() {
	// 建立图片缓存
	var storage=window.localStorage.getItem("xnr_image_cache");
	if(!storage) {
		storage="{}";
	}
	var cache=JSON.parse(storage);
	for(var id in cache) {
		if(cache[id].life<=0) {
			delete cache[id];
		} else {
			cache[id].life--;
		}
	};
	$alloc("image_cache",cache);
};

// 当鼠标在图片上时显示大图
function showFullSizeImage(evt,autoShrink,indirect) {
	try {
		if(evt.shiftKey || evt.ctrlKey || evt.altKey || evt.metaKey) {
			return;
		}
		if(evt.relatedTarget==null) {
			// 点击放大镜图标后，图标被删除，relatedTarget为空
			return;
		}
		if($allocated("image_magnifier")) {
			$alloc("image_magnifier").remove();
			$dealloc("image_magnifier");
		}
		var t=evt.target;	// 经过的对象
		var thumbnail;		// 缩略图的地址
		var image;			// 原始图像地址
		var imageDate=null;	// 图像日期。仅用于小头像的辅助查找
		var pageURL;		// 对应页面
		var imgId;			// 图像ID
		switch(t.tagName) {
			case "IMG":
				if(t.src.indexOf("xnimg.cn/a.gif")!=-1) {
					if(t.style.backgroundImage.indexOf("url(")!=-1) {
						thumbnail=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
					}
				} else if(t.src.indexOf("/default-pic.png")!=-1) {
					thumbnail=null;
				} else {
					thumbnail=t.src;
				}
				break;
			case "SPAN":;	// 同DIV
			case "DIV":
				if(t.style.backgroundImage.indexOf("url(")!=-1) {
					thumbnail=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
				}
				break;
			case "A":
				if(t.style.backgroundImage.indexOf("url(")!=-1) {
					thumbnail=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
					pageURL=t.href;
				} else if(t.className === "picture" && t.children.length === 1 && t.firstElementChild.tagName == "IMG") {
					t=t.firstElementChild;
					thumbnail=t.src;
				}
				break;
		}
		if(!thumbnail || thumbnail.match("/large|_large|large_|original_|/photos/0/0/|/page_pic/|/homeAd/|/[sa]\\.xnimg\\.cn/|app\\.xnimg\\.cn|/L[^/]+$")) {
			if(/large|original/.test(thumbnail) && t.tagName=="IMG" && (t.naturalWidth > t.width || t.naturalHeight > t.height)) {
				// 已经是大图了，只是被限制了大小
				imgId=thumbnail.substring(thumbnail.lastIndexOf("_"));
				_showViewer(evt.pageX,thumbnail,imgId,autoShrink,true);
			} else {
				// 大图/默认空白头像/公共主页图像/网站自身图片
				if($allocated("image_viewer")) {
					if(t!=$alloc("image_viewer").viewer && t!=$alloc("image_viewer").image) {
						// 不是在显示的图像上
						$alloc("image_viewer").viewer.css("display","none");
						// 仅仅将src设成""会有一些2B浏览器去读取当前页面。可能是造成出现浏览满100人警告的原因
						$alloc("image_viewer").image.attr({src:null,lid:""});
					}
				}
			}
			return;
		}
		imgId=thumbnail.substring(thumbnail.lastIndexOf("_"));

		// 大图信息已经放在某个属性上
		var largeData = t.getAttribute("data-large");
		if (largeData) {
			_showViewer(evt.pageX,largeData,imgId,autoShrink,true);
			return;
		}
		largeData = t.getAttribute("data-src");
		if (largeData && /large|original/.test(largeData)) {
			_showViewer(evt.pageX,largeData,imgId,autoShrink,true);
			return;
		}
		largeData = t.getAttribute("data-photo");
		if (largeData && /large:'([^']+)'/.exec(largeData)) {
			_showViewer(evt.pageX,RegExp.$1,imgId,autoShrink,true);
			return;
		}
		largeData = t.getAttribute("largesrc");
		if (largeData) {
			_showViewer(evt.pageX,largeData,imgId,autoShrink,true);
			return;
		}


		// 早期的图片（http://fm071.img.renren.com/pic001/20070201/2002/H[0-9]+[A-Z]+.jpg），改imgId
		if(thumbnail.match(/http:\/\/.*?\.img\.renren\.com\/pic\d+\/\d{8}\/\d+\/H.*?\.jpg/)) {
			imgId=thumbnail.substring(thumbnail.lastIndexOf("/H")+2);
		}

		// 是否已得到图像地址
		image=_imageCache(imgId);
		if(image) {
			_showViewer(evt.pageX,image,imgId,autoShrink,true);
			return;
		}
	
		if(!pageURL) {
			if(t.parentNode.tagName=="A") {
				// 链接包图片
				if(!t.parentNode.href.match(/^#|^javascript:/)) {
					pageURL=t.parentNode.href;
				}
			} else if(t.parentNode.parentNode.tagName=="A") {
				pageURL=t.parentNode.parentNode.href
			}
			
			// 还没找到对应页面。。。算了
			if(!pageURL) {
				return;
			}
		}
	
		// 电影海报
		if(thumbnail.indexOf("/upload/movie/cover/")!=-1) {
			image=thumbnail.replace("/cover/","/bigcover/");
			_imageCache(imgId,image);
			_showViewer(evt.pageX,image,imgId,autoShrink,true);
			return;
		}

		// 早期没有附加码的头像，可以直接改URL
		if(thumbnail.indexOf('head_')!=-1 && !thumbnail.match(/head_.+_/) && thumbnail.indexOf("http://hd")==-1) {
			image=thumbnail.replace("head_","large_");
			_imageCache(imgId,image);
			_showViewer(evt.pageX,image,imgId,autoShrink,true);
			return;
		}

		// 相册中的图片，可能在评论模式/故事模式中有大图链接
		if($page("album") && $page("photo",pageURL)) {
			var storyImg=$(".review-mode .pic img[data-src*='large_'][data-src*='"+imgId+"'],.review-mode .pic img[data-src*='original_'][data-src*='"+imgId+"']");
			if(storyImg.empty()) {
				var storyImg=$(".review-mode .pic img[src*='large_'][src*='"+imgId+"'],.review-mode .pic img[src*='original_'][src*='"+imgId+"']");
				if(storyImg.empty()) {
					storyImg=$(".story-pic .story-pic-list .photo-img img[lazy-src*='large_'][lazy-src*='"+imgId+"'],.story-pic .story-pic-list .photo-img img[lazy-src*='original_'][lazy-src*='"+imgId+"']");
					if(storyImg.empty()) {
						storyImg=$(".story-pic .story-pic-list .photo-img img[src*='large_'][src*='"+imgId+"'],.story-pic .story-pic-list .photo-img img[src*='original_'][src*='"+imgId+"']");
					}
				}
			}
			if(storyImg.exist()) {
				image=storyImg.attr("data-src") || storyImg.attr("lazy-src") || storyImg.attr("src");
				_imageCache(imgId,image);
				_showViewer(evt.pageX,image,imgId,autoShrink,true);
				return;
			}
		}

		// 公共主页相册封面图
		if(pageURL.match("page\\.renren\\.com/\\.*/album/")) {
			_loadImage("album",false,autoShrink,evt,imgId,pageURL);
			return;
		}

		// 公共主页头像
		if(thumbnail.match("tiny_|head_") && /\/page\.renren\.com\/([0-9]{9})\?/.test(pageURL)) {
			pageURL="http://page.renren.com/"+RegExp.$1+"/album?head";
			imageDate=/\/([0-9]{8}\/[0-9]+)\//.exec(thumbnail)[1];
			_loadImage("album",false,autoShrink,evt,imgId,pageURL,imageDate);
			return;
		}

		// 日志新鲜事中的图片
		if(pageURL.indexOf("blog.renren.com/GetEntry.do?")!=-1) {
			_loadImage("blog",indirect,autoShrink,evt,imgId,pageURL);
			return;
		} else if(pageURL.match("page\\.renren\\.com/\\d+/note/\\d+")) {
			_loadImage("blog",false,autoShrink,evt,imgId,pageURL);
			return;
		}

		// 线上活动图片
		if(pageURL.match(/event\.renren\.com\/event\/\d+\/\d+\/photo/)) {
			_loadImage("image",false,autoShrink,evt,imgId,pageURL);
			return;
		}

		// 小组相册图片
		if(pageURL.match(/xiaozu\.renren\.com\/xiaozu\/\d+\/album\/\d+\/photo\/\d+$/)) {
			_loadImage("image",false,autoShrink,evt,imgId,pageURL);
			return;
		}

		// 小组相册封面
		if(pageURL.match(/xiaozu\.renren\.com\/xiaozu\/\d+\/album\/\d+$/)) {
			imageDate=/\/([0-9]{8}\/[0-9]+)\//.exec(thumbnail)[1];
			_loadImage("album",false,autoShrink,evt,imgId,pageURL,imageDate);
			return;
		}

		// 小组头像
		if(pageURL.match(/xiaozu\.renren\.com\/xiaozu\/\d+$|xiaozu\.renren\.com\/xiaozu\/\d+\?/)) {
			_loadImage("xiaozu",false,autoShrink,evt,imgId,pageURL);
			return;
		}

		// 人人小站图片
		if(pageURL.match(/\/zhan\.renren\.com\//)) {
			_loadImage("xiaozhan",false,autoShrink,evt,imgId,pageURL);
			return;
		}

		// 非常古老的头像（http://head.xiaonei.com/photos/20070201/1111/head[0-9]+.jpg），其head后的[0-9]+可能有变，以时间为准
		if(thumbnail.match(/head\.xiaonei\.com\/photos\/[0-9]{8}\/[0-9]+\/head[0-9]+\./)) {
			imageDate=/photos\/([0-9]{8}\/[0-9]+)/.exec(thumbnail)[1];
		}

		if((thumbnail.indexOf("tiny_")!=-1 || (thumbnail.indexOf("tiny")!=-1 && thumbnail.indexOf("_")==-1)) && pageURL.indexOf("album")==-1 && pageURL.indexOf("page.renren.com")==-1) {
			// 小头像
			if(thumbnail.match("head\\.xiaonei\\.com/photos/[0-9]{1,7}/[0-9]{1,7}/tiny[0-9]+\\.jpg")) {
				// 非常早期的图像 http://head.xiaonei.com/photos/1/123/tiny11111.jpg
				imageDate=/photos\/[0-9]{1,7}\/[0-9]{1,7}\/tiny/.exec(thumbnail)[1];
			} else {
				try {
					imageDate=/\/([0-9]{8}\/[0-9]+)\//.exec(thumbnail)[1];
				} catch(ex) {
				}
			}
			// 公共主页目前还在600xxxxxx阶段，以后可能会更多
			if(/profile\.do\?id=600\d{6}/.test(pageURL)) {
				// 公共主页头像相册
				pageURL="http://page.renren.com/"+/id=(\d+)/.exec(pageURL)[1]+"/album?head";
			} else {
				// 一般头像相册
				pageURL="http://photo.renren.com/getalbumprofile.do?owner="+/id=(\d+)/.exec(pageURL)[1];
			}
		} else if(pageURL.indexOf("/profile.do?")!=-1) {
			// 直接链接到对方页面的头像图片
			pageURL="http://photo.renren.com/getalbumprofile.do?owner="+/id=(\d+)/.exec(pageURL)[1];
		}

		if($page("share",pageURL)) {
			// 分享相册新鲜事的相册封面，或从分享相册新鲜事中的相册封面图片进入
			// 这里暂不区分是相册还是图片，统一视作相册
			_loadImage("album",false,autoShrink,evt,imgId,pageURL,imageDate);
			return;
		}

		// 相册封面图片或头像图片
		if($page("album",pageURL)) {
			if(pageURL.match("page\\.renren\\.com") || pageURL.match("/photo/ap/")) {
				// 公共主页相册和外链地址相册不会记入最近来访。2010/07/01测试
				_loadImage("album",false,autoShrink,evt,imgId,pageURL,imageDate);
			} else {
				_loadImage("album",indirect,autoShrink,evt,imgId,pageURL,imageDate);
			}
			return;
		}
		
		// 一般图片或被圈相片或公共主页上的图片
		if($page("photo",pageURL) && pageURL.match("getphoto\\.do|gettagphoto\\.do|/photo\\.renren\\.com/photo/[0-9]+/photo-[0-9]+|/page\\.renren\\.com/.*/photo/|photo\\.renren\\.com/photo/sp/|lover\\.renren\\.com/photo/")) {
			// 早期图片 http://fm100.img.xiaonei.com/pic001/20070707/11/12/13/H[0-9A-Z]+.jpg
			if(thumbnail.match("\\.img\\.xiaonei\\.com/pic[0-9]{3}/[0-9]{8}/[0-9]{2}/[0-9]{2}/[0-9]{2}/H[0-9A-Z]{9}\\.jpg")) {
				imgId=imgId.replace(/H([0-9A-Z]{9}\.jpg)$/,"L$1");
			}
			if(pageURL.match("page.renren.com") || pageURL.match("/photo/sp/")) {
				// 公共主页相册和外链地址相册不会记入最近来访。2010/07/01测试
				_loadImage("image",false,autoShrink,evt,imgId,pageURL);
			} else {
				_loadImage("image",indirect,autoShrink,evt,imgId,pageURL);
			}
			return;
		}
	} catch(ex) {
		$error("showFullSizeImage",ex);
	}
	
	// 读取/设置图片缓存
	function _imageCache(imgId,src) {
		if(imgId.indexOf("/")!=-1) {
			imgId=imgId.substring(imgId.lastIndexOf("/")+1);
		}
		var cache=$alloc("image_cache");
		if(src) {
			// 设置
			if(src!="error" && src.indexOf("a.gif")==-1) {
				cache[imgId]={src:src,life:100};
				window.localStorage.setItem("xnr_image_cache",JSON.stringify(cache));
			}
		} else {
			if(cache[imgId]) {
				cache[imgId].life=100;
				window.localStorage.setItem("xnr_image_cache",JSON.stringify(cache));
				return cache[imgId].src;
			}
			return "";
		}
	};
	// 读取原图
	function _loadImage(type,indirect,autoShrink,evt,imgId,pageURL,imageDate) {
		if(!indirect) {
			_showViewer(evt.pageX,null,imgId,autoShrink);
			switch(type) {
				case "image":
					_getImage(pageURL,imgId,autoShrink);
					break;
				case "album":
					_getAlbumImage(pageURL,0,imgId,imageDate,autoShrink);
					break;
				case "blog":
					_getBlogImage(pageURL,imgId,autoShrink);
					break;
				case "xiaozu":
					_getXiaozuImage(pageURL,imgId,autoShrink);
					break;
				case "xiaozhan":
					_getXiaozhanImage(pageURL,imgId,autoShrink);
			}
		} else {
			var node=_showMagnifier(evt.target);
			node.bind("click",function() {
				$alloc("image_magnifier").remove();
				$dealloc("image_magnifier");
				_loadImage(type,false,autoShrink,evt,imgId,pageURL,imageDate);
			});
		}
	};
	// 显示放大镜图标
	function _showMagnifier(target) {
		var node=$("@img").attr({style:"z-index:199999;position:absolute;opacity:0.7",height:22,width:22}).attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAw1BMVEUxlJ9TVVJWWFVZW1hhYmBPe7JRfbR4endVf7dVg7Rfg7Zah7ljh7qChIFki7iJi4iKjImWm52cnpt4qNSho6CCrNOmqKWFrtaIstqJs9uSttiUuNqXvN6ZvuC3uraevtuzvMSgwN29v7ylxeK6wsqtxOOvxuW9xc2pyebAxsi1yeKvy+O3yuS7yt61zd+zzua7zujKz9G90erG0uDF1enO1t/O2ujZ3uHY4enZ4urc4uTi6Ord6ffh6fLp6+jl7fbp8frKBh0+AAAAAXRSTlMAQObYZgAAAQtJREFUGNN10O1ygjAQBdBoS0wjkoC2tAQECioWFD+ItqYQ3v+pZCggztj7J5mTnZ3dAFCH1AH3IXrIheChfvdAPbF1GXO3wqM95SpEaZrEL1DlnRNPzcsSH1IsZa56bR9dwHI8zg6VYwmF3hSHG1zWmkRIok34V064m+J0t0vjKPCR7fKGhZXESRwtF4HvMMsUHfvR8itaBIHPzGnH3J0qH8y2mfVuKq9+22R1VHJo1YG/8LhqJjQEyiGyHcdBKEfCaJcMNSklCgJUHVrYrUnPGsZJFYy1c++z6Lr4PmXZ6adYk9nb882N/aUoLntjAsj88+ZgQiklo+oyHJG+dxn87/Onhz57xGAwBFen2iHevJ8kLwAAAABJRU5ErkJggg%3D%3D").attr({onmouseover:"this.style.opacity=1",onmouseout:"this.style.opacity=0.7"});
		var t=$(target);
		if(target.parentNode.tagName!="I" && target.parentNode.className!="avatar" && target.parentNode.className!="clipImageBig") {
			var rect=t.rect(true);
		} else {
			// 高度与宽度不一致的头像
			var rect1=$(target.parentNode).rect(true);
			var rect2=t.rect(true);
			if(rect1.height>rect2.height) {
				var rect=rect2;
			} else {
				var rect=rect1;
			}
		}
		var tpp=$(target.parentNode.parentNode);
		if (target.parentNode.tagName=="A" && tpp.find(".myphoto-info").size()==1) {
			// 新相册图片，下方有描述栏/操作按钮，会挡住放大镜。将放大镜置于右上角
			node.css({left:parseInt(rect.right-22)+"px",top:parseInt(rect.top)+"px"});
		} else {
			node.css({left:parseInt(rect.right-22)+"px",top:parseInt(rect.bottom-22)+"px"});
		}
		node.addTo(document);
		$alloc("image_magnifier",node);
		return node;
	};
	// 显示图片框
	// 显示过程主要分两个阶段：开始载入和载入完毕/失败
	// 开始载入阶段src为null，mouseX、imgId不得为空
	// 载入完毕/失败阶段src不得为空。imgId不为空。mouseX可空
	// 如果是由缓存读取图片地址或直接变换URL，则无第一阶段，需将force设为真
	function _showViewer(mouseX,src,imgId,shrink,force) {
		// 失败时的图片
		const errorImage="data:image/jpeg;base64,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%3D%3D";
		// 如果图片显示框还没有创建，则先创建它
		if(!$allocated("image_viewer")) {
			if (!shrink) {
				$alloc("image_viewer").viewer=$("@div").attr("style","border:3px double #666666;display:none;background:#F6F6F6;top:2px;z-index:199999;right:2px;position:fixed;overflow-x:auto").addTo(document);
				$alloc("image_viewer").image=$("@img").attr("onload","this.parentNode.style.overflowY=(parseInt(this.height)>parseInt(window.innerHeight)-10?'scroll':'auto');this.title=''").attr("onerror","this.src='"+errorImage+"';this.title=''").addTo($alloc("image_viewer").viewer);
			} else {
				$alloc("image_viewer").viewer=$("@div").attr("style","border:3px double #666666;display:none;background:#F6F6F6;top:2px;z-index:199999;right:2px;position:fixed").addTo(document);
				$alloc("image_viewer").image=$("@img").addTo($alloc("image_viewer").viewer);
			}
		}
		if(force) {
			$alloc("image_viewer").image.attr("lid",imgId);
		}
		// 延时一点点，防止鼠标在页面上快速划过时也显示图片，对浏览造成困扰
		setTimeout(function() {
			var viewer=$alloc("image_viewer").viewer;
			var image=$alloc("image_viewer").image;
			if(!src) {
				// 显示加载中图片
				image.attr("src","http://s.xnimg.cn/imgpro/bg/bg_line_loading.gif");
				image.attr("title", "");
				image.attr("lid",imgId);
			} else if(src=="error") {
				if(!imgId || imgId==image.attr("lid")) {
					image.attr("src",errorImage);
				} else {
					return;
				}
			} else {
				if(imgId==image.attr("lid")) {
					(shrink?image:viewer).css({maxHeight:(parseInt(window.innerHeight)-10)+"px",maxWidth:(parseInt(window.innerWidth)-20)+"px"});	// 边距2，边框宽度3
					image.attr("title", "图片下载显示中...");
					image.attr("src",src);
				} else {
					return;
				}
			}
	
			// 确定显示位置
			if(mouseX!=null && viewer.css("display")=="none") {
				if(mouseX>document.body.clientWidth/2) {
					viewer.css({left:"2px",right:""});
				} else {
					viewer.css({left:"",right:"2px"});
				}
				viewer.css({display:"block",postion:"fixed"});
			}
		}, 200);
	};

	// 获取相册中某一张图片的大图并显示出来
	function _getAlbumImage(album,pageN,imgId,imgDate,autoShrink) {
		var url = album+(album.indexOf("?")==-1?"?":"&")+"curpage="+pageN;
		var analyzer = function(html, url) {
			if(!html || html.indexOf("\"errorPage\"")!=-1 || html.indexOf("\"error404Page\"")!=-1) {
				_showViewer(null,"error",imgId,autoShrink);
				return;
			}
			$dealloc("last_album_html_cache");
			$alloc("last_album_html_cache", {"url":url, "data":html});
			try {
				// 搜索ID匹配的大图。可能是一般相册的故事模式，也可能是未能区分分享相册/照片的情况
				var res=null;
				var regexpr=new RegExp("<a\\s[^>]*?href=\"(.*?)\"[^>]*?>[^<]*?<img\\s([^>]*?src=\"http://[^\"]+?large_.*?"+imgId+"\"[^>]*?)>","ig");
				while(res=regexpr.exec(html)) {
					if(res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
						res=/src="(.*?)"/.exec(res[2])[1];
						// 直接显示
						_imageCache(imgId,res);
						_showViewer(null,res,imgId,autoShrink);
						return;
					}
				}

				// 搜索ID匹配的图片
				res=null;
				regexpr=new RegExp("<a\\s[^>]*?href=\"(.*?)\"[^>]*?>[^<]*?<img\\s([^>]*?src=\"http://[^\"]+?"+imgId+"\"[^>]*?)>","ig");
				while(res=regexpr.exec(html)) {
					if(!res[2].match("\"http://[^\"]+tiny_") && res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
						res=res[1];
						break;
					}
				}
				if (!res) {
					// 换background-image模式搜索
					regexpr=new RegExp("<a\\s[^>]*?href=\"(.*?)\"[^>]*?>[^<]*?<img\\s([^>]*?style=\"background-image:\\s+url\\(&quot;http://[^\"]+?main_.*?"+imgId+"\"[^>]*?)>","ig");
					while(res=regexpr.exec(html)) {
						if(res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
							res=res[1];
							break;
						}
					}
				}

				// 当ID不匹配且为搜索小头像时，搜索时间标记匹配的图片
				if(!res && imgDate) {
					regexpr=new RegExp("<a\\s[^>]*?href=\"(.*?)\"[^>]*?>[^<]*?<img\\s([^>]*?src=\"http://[^\"]+?/"+imgDate+"/.*?\"[^>]*?)>","ig");
					while(res=regexpr.exec(html)) {
						if(!res[2].match("\"http://[^\"]+tiny_") && res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
							res=res[1];
							break;
						}
					}
					if (!res) {
						// 换background-image模式搜索
						regexpr=new RegExp("<a\\s[^>]*?href=\"(.*?)\"[^>]*?>[^<]*?<img\\s([^>]*?style=\"background-image:\\s+url\\(&quot;http://[^\"]+?/"+imgDate+"/.*?\"[^>]*?)>","ig");
						while(res=regexpr.exec(html)) {
							if(!res[2].match("\"http://[^\"]+tiny_") && res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
								res=res[1];
								break;
							}
						}
					}

					// 还没有的话，只限定日期试试。误差较大，但愿能准确匹配
					if(!res) {
						regexpr=new RegExp("<a\\s[^>]*?href=\"(.*?)\"[^>]*?>[^<]*?<img\\s([^>]*?src=\"http://.*?/"+/[0-9]{8}/.exec(imgDate)+"/.*?\"[^>]*?)>","ig");
						while(res=regexpr.exec(html)) {
							if(!res[2].match("\"http://[^\"]+tiny_") && res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
								res=res[1];
								break;
							}
						}
						if (!res) {
							// 换background-image模式搜索
							regexpr=new RegExp("<a\\s[^>]*?href=\"(.*?)\"[^>]*?>[^<]*?<img\\s([^>]*?style=\"background-image:\\s+url\\(&quot;http://.*?/"+/[0-9]{8}/.exec(imgDate)+"/.*?\"[^>]*?)>","ig");
							while(res=regexpr.exec(html)) {
								if(!res[2].match("\"http://[^\"]+tiny_") && res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
									res=res[1];
									break;
								}
							}
						}
					}
				}
				if(res) {
					if(res.search(/^[a-zA-Z]+:\/\//)==-1) {
						// 使用相对路径
						if(res.charAt(0)!='/') {
							res=album.substring(0,album.lastIndexOf("/"))+"/"+res;
						} else {
							res=album.substring(0,album.indexOf("/",album.indexOf("/")+2))+res;
						}
					}
					_getImage(res,imgId,autoShrink);
				} else {
					// 没找到，看看下一页有没有
					var all=/共([0-9]+)张/.exec(html);
					if(all && html.indexOf("-"+all[1]+"张")==-1) {
						// 还没有到最后一页
						_getAlbumImage(album,pageN+1,imgId,imgDate,autoShrink);
					} else {
						// 实在找不到了，不管了
						_showViewer(null,"error",imgId,autoShrink);
						return;
					}
				}
			} catch(ex) {
				$error("_getAlbumImage",ex);
			}
		};
		if (url == $alloc("last_album_html").url) {
			analyzer($alloc("last_album_html").data, url);
		} else {
			$get(url, analyzer);
		}
	};

	// 获取一般图片的大图并显示出来
	function _getImage(pageURL,imgId,autoShrink) {
		$get(pageURL,function(html) {
			if(!html || html.indexOf("\"errorPage\"")!=-1) {
				_showViewer(null,"error",imgId,autoShrink);
				return;
			}
			try {
				// 一般相册
				var src=/photosJson *= *({.*});?/.exec(html);
				if(src) {
					src=JSON.parse(src[1]);
					if(src.currentPhoto && src.currentPhoto.large) {
						_imageCache(imgId,src.currentPhoto.large);
						_showViewer(null,src.currentPhoto.large,imgId,autoShrink);
						return;
					}
				}
				// 分享的一般相册
				var src=/var photo *= *({.*});?/.exec(html);
				if(src) {
					src=JSON.parse(src[1]);
					if(src.photo && src.photo.large) {
						_imageCache(imgId,src.photo.large);
						_showViewer(null,src.photo.large,imgId,autoShrink);
						return;
					}
				}
				// 公共主页/线上活动相册
				var src=/XN.PAGE.albumPhoto.init\((.*?)\);/i.exec(html);
				if(src) {
					src=JSON.parse("["+src[1].replace(/'.*?'/g,"0").replace(",photo:",',"photo":')+"]")[10];
					if(src && src.photo && src.photo.large) {
						_imageCache(imgId,src.photo.large);
						_showViewer(null,src.photo.large,imgId,autoShrink);
						return;
					}
				}
				// 其他照片，如圈人的 http://photo.renren.com/gettagphoto.do?id=XXXX
				var src=/<img[^>]+id="photo".*?>/.exec(html);
				if(src) {
					src=/src=\"(.*?)\"/.exec(src);
					if(src && src[1] && src[1].indexOf("/a.gif")==-1) {
						_imageCache(imgId,src[1]);
						_showViewer(null,src[1],imgId,autoShrink);
						return;
					}
				}
				_showViewer(null,"error",imgId,autoShrink);
			} catch(ex) {
				$error("_getImage",ex);
			}
		});
	};
	//获取日志中图片的大图并显示出来
	function _getBlogImage(pageURL,imgId,autoShrink) {
		var analyzer = function(html, url) {
			try {
				if(!html || html.search("<body id=\"errorPage\">")!=-1) {
					_showViewer(null,"error",imgId,autoShrink);
					return;
				}
				$dealloc("last_blog_html");
				$alloc("last_blog_html", {"url":url, "data":html});

				var src=new RegExp("<img [^>]*?src=\"(.*?"+imgId+")\".*?>").exec(html);
				if(src) {
					src=src[1];
					_imageCache(imgId,src);
					_showViewer(null,src,imgId,autoShrink);
				} else {
					showViewer(null,"error",imgId);
				}
			} catch(ex) {
				$error("_getBlogImage",ex);
			}
		};
		if (pageURL == $alloc("last_blog_html").url) {
			analyzer($alloc("last_blog_html").data, pageURL);
		} else {
			$get(pageURL, analyzer);
		}
	};
	//获取小组头像图片并显示出来
	function _getXiaozuImage(pageURL,imgId,autoShrink) {
		$get(pageURL,function(html) {
			try {
				if(!html || html.search("<body id=\"errorPage\">")!=-1) {
					_showViewer(null,"error",imgId,autoShrink);
					return;
				}
				var src=new RegExp("<div class=\"group-photo\">\\s*<img [^>]*?url\\((.*?)\\).*?>").exec(html);
				if(src && src[1].indexOf(imgId) >= 0) {
					src=src[1];
					_imageCache(imgId,src);
					_showViewer(null,src,imgId,autoShrink);
				} else {
					_showViewer(null,"error",imgId,autoShrink);
				}
			} catch(ex) {
				$error("_getXiaozuImage",ex);
			}
		});
	};
	//获取人人小站上传图片并显示出来
	function _getXiaozhanImage(pageURL,imgId,autoShrink) {
		var analyzer = function(html, url) {
			try {
				if(!html || html.search("<body id=\"errorPage\">")!=-1) {
					_showViewer(null,"error",imgId,autoShrink);
					return;
				}
				$dealloc("last_xiaozhan_html");
				$alloc("last_xiaozhan_html", {"url":url, "data":html});

				// 头像
				var src=new RegExp("head:'([^']+" + imgId +  "[^']*)'").exec(html);
				if (src) {
					src = src[1];
				} else {
					src = null;
				}
				if (!src) {
					// 一般图片
					var regex = new RegExp("<img [^>]*?src=\"([^\"]*?" + imgId + "[^\"]*?)\"[^>]*?>", "ig");
					var hsrc = null;
					while(src=regex.exec(html)) {
						src = src[1];
						if (/large_|original_/.test(src)) {
							break;
						} else if (/h_main_/.test(src)) {
							hsrc = src;
						}
					}
					if (!src && hsrc) {
						src = hsrc;
					}
				}
				if(src) {
					_imageCache(imgId,src);
					_showViewer(null,src,imgId,autoShrink);
				} else {
					_showViewer(null,"error",imgId,autoShrink);
				}
			} catch(ex) {
				$error("_getXiaozhanImage",ex);
			}
		};
		if (pageURL == $alloc("last_xiaozhan_html").url) {
			analyzer($alloc("last_xiaozhan_html").data, pageURL);
		} else {
			$get(pageURL, analyzer);
		}
	};

};

// 清除大图地址缓存
function cleanFullSizeImageCache() {
	$dealloc("image_cache");
	$dealloc("last_xiaozhan_html");
	$dealloc("last_blog_html");
	$dealloc("last_album_html");
	window.localStorage.setItem("xnr_image_cache","{}");
	window.alert("缓存已经清空");
};

// 选中“悄悄话”选框
function useWhisper() {
	var chk=$('#whisper');
	if(chk.exist() && chk.prop("checked")==false) {
		$script(chk.prop("checked",true).attr("onclick"));
	}
};

// 隐藏橙名
function hideOrangeName() {
	// 设置主页皮肤后，样式被应用到.full-page-holder a
	var a=$(".full-page-holder a:not([class]):not([id]):not([style]):not([stats]):not([href^='javascript:'])");
	if (a.empty()) {
		var a=$("@a").attr("href", "#").addTo(document.body);
		var color=a.curCSS("color");
		a.remove();
	} else {
		var color=a.curCSS("color");
	}
	$patchCSS(".lively-user, a.lively-user:link, a.lively-user:visited{color:"+color+"}");
};

// 去除只有星级用户才能修改特别好友的限制
function removeBestFriendRestriction() {
	// user.vip改了也没用，非VIP还是最多6个
	const code="window.user.star=true";
	$script(code);
};

// 允许修改昵称
function removeNicknameRestriction() {
	try {
		if($("#feedInfoAjaxDiv").empty()) {
			return;
		}
		var input=$("#nkname");
		if(input.empty()) {
			if($("#basicInfo_form>p>#name").empty()) {
				return;
			}
			var holder=$(".status-holder");
			try {
				var nkname=holder.get().childNodes[holder.find("h1.username").index()+1].textContent;
				nkname=nkname.replace(/\n/g,"").replace(/^[ \t]+|[ \t]+$/,"").replace(/^\(/,"").replace(/\)$/,"");
			} catch(ex) {
				var nkname="";
			}
			$("@p").html('<label for="nkname"><span>昵称:\n</span>\t</label><input type="text" class="input-text" id="nkname" value="" tabindex="1" maxlength="12" name="name"/>').move("after",$("#basicInfo_form>p").filter("#name"));
			$("#nkname").val(nkname);
		} else if(input.attr("readonly")) {
			input.attr({readonly:null});
			input.superior().find("span.hint.gray").remove();
		} else {
			return;
		}
		const code="window.XN.page.ProfileEdit.basicInfo.checkNkName=function(){}";
		$script(code);
	} catch(ex) {
		$error("removeNicknameRestriction",ex);
	}
};

// 显示上一次登录信息
function showLoginInfo(lastHash) {
	var sid=$cookie("xnsid");
	if(!sid) {
		return;
	}
	var hash=370840187;
	for(var i=0;i<sid.length;i++) {
		var y=(hash*sid.charCodeAt(i))&(-1);
		hash=(y<<6)+(y>>>26);
	}
	hash=Math.abs(hash);
	if(hash==parseInt(lastHash,16)) {
		return;
	}
	$save("lastSid",hash.toString(16));
	$get("http://safe.renren.com/alarm/alarmIndex/info/",function(data) {
		if(data==null) {
			$error("showLoginInfo","地址改变？");
			return;
		}
		if(data.indexOf('</html>')>0) {
			$error("showLoginInfo","跨域失败？内容改变？");
			return;
		}
		data=data.replace(/<(\/?)a[^>]*>/g,"<$1span>").replace("<dt>当前登录信息</dt>","");
		data+="<div><a style='float:right;padding:5px' href='http://safe.renren.com/alarm/alarmIndex' target='_blank'>更多信息<a></div>";
		$popup("登录信息",data,"0x0-5-5",15,5);
	});
};

// 快速通道菜单
function enableShortcutMenu(evt) {
	try {
		var t=evt.target;
		if($allocated("shortcut_menu")) {
			var menu=$alloc("shortcut_menu");
			var menuNode=menu.m.get();
			if(t==menuNode || (menuNode.compareDocumentPosition(t) & 16)) {
				return;
			}
			// BUG：http://code.google.com/p/chromium/issues/detail?id=39978
			// 当Firefox限制了最小字体>=14时也会出现相似问题
			var rect=menu.t.getBoundingClientRect();
			if(evt.clientX>=rect.left && evt.clientX<=rect.right && evt.clientY>=rect.top && evt.clientY<=rect.bottom) {
				return;
			}
			menu.m.remove();
			$dealloc("shortcut_menu");
		}
		if(t.tagName=="SPAN" && t.childElementCount==0 && !t.nextElementSibling && !t.previousElementSibling && t.parentNode.tagName=="A") {
			t=t.parentNode;
		}
		if(t.tagName!="A" || (!/\/profile\.do\?/.test(t.href) && !/\/\/www\.renren\.com\/g\//.test(t.href) && !/\/www\.renren\.com\/\d+$|\/www\.renren\.com\/\d+[?#]/.test(t.href))) {
			return;
		}
		if(t.id || /#|&v=/.test(t.href) || t.style.backgroundImage) {
			return;
		}
		var text=$(t).text().replace(/[ \t\n\r]/g,"");
		if(text=="" || text.length>=15) {	// 名字长度<=12,可能前面有@
			return;
		}
		if(/\/\/www\.renren\.com\/g\//.test(t.href)) {
			var id=/\/g\/([0-9]+)/.exec(t.href)[1];
			if (parseInt(id) >= 600000000) {
				// 公共主页/情侣空间
				return;
			}
		} else if (/\/www\.renren\.com\/\d+/.test(t.href)) {
			var id=/([0-9]+)/.exec(t.href)[1];
		} else {
			var id=/[&?]id=([0-9]+)/.exec(t.href)[1];
		}
		if(XNR.userId==id) {
			return;
		}
		var pages={
			"Ta的新鲜事":"http://www.renren.com/moreminifeed.do?p=0&u=@@",
			"Ta的相册":"http://photo.renren.com/getalbumlist.do?id=@@",
			"Ta的头像相册":"http://photo.renren.com/getalbumprofile.do?owner=@@",
			"Ta的日志":"http://blog.renren.com/blog/0/friendsNews?friend=@@",	// &__view=async-html",
			// 没有上面这个好用
			// "Ta的日志":"http://blog.renren.com/GetBlog.do?id=@@",	// http://blog.renren.com/blog/@@/friends
			"Ta的公开资料":"http://browse.renren.com/searchEx.do?ajax=1&q=@@",
			"Ta的状态":"http://status.renren.com/status/@@",
			"Ta的行踪":"http://places.renren.com/web/lbsApp?pt=7&userId=@@",	// &__view=async-html",
			"Ta的好友":"http://friend.renren.com/GetFriendList.do?id=@@",
		};
		var morePages={
			// 已失效
			//"圈Ta的照片":"http://photo.renren.com/someonetagphoto.do?id=@@", // http://photo.renren.com/photo/@@/relatives/hasTags
			"Ta的大头贴相册":"http://i.renren.com/hp/home?uid=@@",
			"与Ta相关的日志":"http://blog.renren.com/SomeoneRelativeBlog.do?id=@@", // http://blog.renren.com/blog/@@/friendsRelatives
			"Ta的分享":"http://share.renren.com/share/ShareList.do?id=@@",
			"Ta的留言板":"http://gossip.renren.com/getgossiplist.do?id=@@",
			"Ta的礼物":"http://gift.renren.com/show/box/otherbox?userId=@@",
			"Ta的游戏徽章":"http://game.renren.com/medal?uid=@@",
			"Ta的公共主页":"http://page.renren.com/home/friendspages/view?uid=@@",
			"Ta的情侣空间ID":"http://page.renren.com/getLoverSpace?uid=@@",
			"Ta的名片资料":"http://friend.renren.com/showcard?friendID=@@",
			"Ta的联系方式":"http://friend.renren.com/getprofilecontact/@@",
		};
		var html="<ul>";
		for(var i in pages) {
			html+="<li><a target='_blank' href='";
			html+=pages[i].replace("@@",id);
			html+="'>"+i+"</a></li>"
		}
		html+="<li><a style='float:right;font-size:x-small' href='javascript:' onclick='var me=this.parentNode;for(var p=me;p;p=p.nextElementSibling){p.style.display=null};me.style.display=\"none\";return false'/>Ta的更多</a></li>";
		for(var i in morePages) {
			html+="<li style='display:none'><a target='_blank' href='";
			html+=morePages[i].replace("@@",id);
			html+="'>"+i+"</a></li>"
		}
		html+="</ul>";
		var rect=t.getBoundingClientRect();
		var menu=$alloc("shortcut_menu");
		menu.t=t;
		// absolute在放大页面的情况下会出现文字被错误截断导致宽度极小的问题
		menu.m=$("@div").html(html).css({position:"absolute",left:parseInt(rect.left+window.scrollX)+"px",top:parseInt(rect.bottom+window.scrollY)+"px",backgroundColor:"#EBF3F7",opacity:0.88,padding:"5px 8px",border:"1px solid #5C75AA",zIndex:999987}).addTo(document.body);
	} catch(ex) {
		$error("enableShortcutMenu",ex);
	}
};

// 提升搜索结果上限到200页
function expandSearchResult() {
	$("@a").text("扩展到200页").attr({style:"float:left;padding:3px",onclick:"XN.app.search._bottomPager.setPageCount(200)",href:"#nogo"}).addTo($("#bottomPagerHolder"),0);
};

// 搜索分享
function searchShare() {
	if($(".j-share-list, .share-hot-list, .blog-content .blog-home, .status-list").empty()) {
		return;
	}
	var searchBar=$("@div").css({padding:"3px",marginBottom:"10px"});
	var toolbar = $("#content .toolbar");
	if (toolbar.exist()) {
		searchBar.move("before",toolbar);
	} else {
		searchBar.move("before",$(".j-share-list, .share-hot-list, .blog-home, .status-list"));
	}
	$("@input").attr({type:"text","class":"input-text"}).attr("style","width:200px;min-height:17px;margin-right:5px").addTo(searchBar).bind("keypress",function(evt) {
		// 按下回车键触发搜索按钮点击事件
		if(evt.keyCode==13) {
			var cevt=document.createEvent("MouseEvents");
			cevt.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
			evt.target.nextElementSibling.dispatchEvent(cevt);
		}
	});
	var targetSel, titleSel, contentSel, containerSel, pagerSel;
	if ($page("share")) {
		if ($(".share-hot-list").exist()) {
			containerSel = ".share-hot-list";
			targetSel = ".share-hot-list>li.share";
			titleSel = "h3";
			contentSel = ".content";
			pagerSel = ".pager-top";
		} else {
			containerSel = ".j-share-list";
			targetSel = "#content .share-itembox";
			titleSel = ".share-body>h3";
			contentSel = ".share-content";
			pagerSel = ".pager-top";
		}
	} else if ($page("blog")) {
		containerSel = ".blog-home";
		targetSel = ".blog-home>.list-box,.blog-home>.list-blog";
		titleSel = ".title-article>strong";
		contentSel = ".text-article";
		pagerSel = ".pager-top";
	} else if ($page("status")) {
		containerSel = ".status-list";
		targetSel = ".status-list>li";
		titleSel = "h3";
		contentSel = ".content";
		pagerSel = null;
	}
	$("@input").attr({type:"button","class":"input-button"}).attr("style","min-height:25px;margin-right:10px").val("搜索").addTo(searchBar).bind("click",function(evt) {
		try {
			var button=evt.target;
			if(button.value.indexOf("%")!=-1) {
				// 正在查找中
				return;
			}
			var text=button.previousElementSibling.value;
			if(!text || !text.replace(/^ +/,"")) {
				var i=0;
				$(targetSel).each(function() {
					if(i<20) {
						$(this).show();
					} else {
						$(this).hide();
					}
					i++;
				});
				$(".pager-top,.pager-bottom,#pager_buttom").show();
				return;
			}
			// 转换成小写，查找时不分大小写
			var keywords=text.toLowerCase().split(/ +/);
			var pager, status_shower = null;
			if (pagerSel) {
				pager=$pager($(pagerSel));
			} else {
				status_shower=JSON.parse($evalInPage('var d=document.createElement("div");d.id="windots";var s=window.status_shower;d.textContent=JSON.stringify({pager:{_currentPage:s.pager._currentPage, _pageCount:s.pager._pageCount}, url:s.url, curShow:s.curShow, curRead:s.curRead});document.body.appendChild(d);',"#windots"));
				pager = {current:status_shower.pager._currentPage,last:status_shower.pager._pageCount};
				if (pager.current>0) {
					pager.current--;
				}
				if (pager.last>0) {
					pager.last--;
				}
			}
			var curpage=pager.current;
			var lastpage=pager.last;
			var cache=false;
			if($("#content[cache]").empty()) {
				if(lastpage<50) {
					// 当页数小于50时（1000项），启用缓存模式，将所有搜索到的项目加入到页面
					cache=true;
				} else if(lastpage<100) {
					if(window.confirm("是否启用搜索缓存？能加快再次搜索时的速度，但会占用较多内存")) {
						cache=true;
					}
				} else {
					if(!window.confirm("项目太多，估计会卡上一阵子。要继续吗？")) {
						return;
					}
				}
			}
			button.value="0%";
			$(".pager-top,.pager-bottom,#pager_buttom").hide();
			$(targetSel).each(function() {
				if (checkElement(this, keywords)) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
			if(lastpage<=0 || $("#content[cache]").exist()) {
				// 需要搜索的已经全部放在页面上了
				button.value="搜索";
				return;
			}
			if(cache) {
				$("#content").attr("cache","");
			}

			var link;
			if (status_shower === null) {
				link=$(pagerSel).find("ol.pagerpro li:not(.current) a").prop("href").replace(/curpage=[0-9]+/,"").replace(/#.*$/,"");
				if(link.indexOf("?")==-1) {
					link+="?";
				}
				link+="&__view=async-html";
			} else {
				switch (status_shower.curShow) {
					case "showMine":
						link=status_shower.url.someOne+"?userId="+XNR.userId;
						break;
					case "showAFriend":
						link=status_shower.url.someOne+"?userId="+status_shower.curRead;
						break;
					case "showFriends":
						link=status_shower.url.allFriend+"?";
						break;
					case "showHotWord":
						// 不管
						break;
				}
			}
			if (!link) {
				// 热门状态，直接从缓存读
				$script("var s=window.status_shower;s.showHotRange(0, s.hotsCache[s.curHot].doingArray.length-1)");
				$(".status-list>li").each(function() {
					var s = $(this);
					if (checkElement(s, keywords)) {
						s.show();
					} else {
						s.hide();
					}
				});
				button.value="搜索";
				return;
			}
			var progress=1;
			$get(link+"&curpage=0",function(data, url, i) {
				try {
					if (!data || i==curpage) {
						return;
					}
					var body;
					if(status_shower == null) {
						body=$("@div").html(/<body[\S\s]+<\/body>/.exec(data));
					} else {
						var h=$evalInPage('var d=document.createElement("div");d.id="loadedstatus";var obj='+data+';d.textContent=window.status_shower.buildPanel(obj);document.body.appendChild(d);', "#loadedstatus");
						body=$("@div").add($("@ul").attr("class","status-list").html(h));
					}
					var container = $(containerSel);
					body.find(targetSel).each(function() {
						if(cache) {
							var s=$(this);
						} else {
							var s=$("#"+this.id);
							if(s.empty()) {
								s=$(this);
							}
						}
						var f=false;
						if (checkElement(s, keywords)) {
							if(!cache) {
								// 当cache为true时，s是从data中获取的，必然可见
								s.show();
							}
							f=true;
						} else if(cache) {
							s.hide();
						}
						if(f || cache) {
							s.addTo(container);
						}
					});
					body.find("body").remove();
					body=null;
					// 将翻页移动到最下面
					$("#content .pager-bottom,.share-home .pager-bottom").addTo($(containerSel));
				} catch(ex) {
					$error("searchShare::get",ex);
				} finally {
					progress++;
					if(progress>lastpage) {
						button.value="搜索";
					} else {
						button.value=parseInt(progress*100/(lastpage+1))+"%";
						i++;
						$get(link+"&curpage="+i,arguments.callee,i);
					}
				}
			}, 0);
		} catch(ex) {
			$error("searchShare::click",ex);
		}
	});
	$("@span").text("多个关键词请用半角空格隔开").addTo(searchBar);

	function checkElement(elem, keywords) {
		var s=$(elem);
		var content=s.find(contentSel).text().toLowerCase();
		content+=s.find(titleSel).text().toLowerCase();
		content+=s.find(".timestamp, .legend .duration").text();
		for(var i=0;i<keywords.length;i++) {
			if(content.indexOf(keywords[i])==-1) {
				break;
			}
		}
		return (i==keywords.length);
	}
};

// 清空分享
function delAllShares() {
	if(!XNR.url.match("//share/share/collection|//share/share/"+XNR.userId)) {
		return;
	}
	$("@a").text("清空列出的分享").attr("href", "#nogo").addTo($("@div").css({padding:"5px","text-align":"center",cursor:"pointer"}).move("before",$(".j-share-list"))).bind("click",function() {
		if($(".share-itembox").empty()) {
			return;
		}
		if(!window.confirm("确实要删除所有在这里显示的分享？")) {
			return;
		}
		var ids=[];
		$(".share-itembox").each(function() {
			if($(this).css("display")!="none") {
				var id=this.id.match("\\d+");
				if(id) {
					ids.push(id);
				}
			}
		});
		var total = ids.length;
		var box = $("@div").css({zIndex:"999999", width:"100%", height:"100%", position:"fixed", background:"rgba(0,0,0,0.8)", color:"#fff", left:0, top:0, textAlign:"center", verticalAlign:"middle", lineHeight:document.documentElement.clientHeight+"px"}).addTo(document);
		if (total > 0) {
			var deleter = function() {
				if (ids.length > 0) {
					box.text("处理中，请稍候..."+parseInt((total-ids.length)*100/total)+"%");
					var id = ids.shift();
					$get("http://share.renren.com/share/EditShare.do?action=del&sid="+id+"&type="+XNR.userId,deleter,null,"POST");
				} else {
					box.text("处理完毕，将刷新页面...");
					window.location.reload();
				}
			};
			deleter();
		}
	});
};

// 禁止显示名片
function removeNameCard() {
	const code="window.NameCard=null";
	$script(code);
	// 去除当前所有链接的namecard属性，防止产生异常
	$("a[namecard]").attr({namecard:null});
};

// 提示图片主说明
function showPhotoAuthorComment() {
	var uid=$("input[name='owner']").val();
	var pid=$("input#sourceid").val();
	if(!uid || !pid) {
		return;
	}

	const SRC_LABEL="showPhotoAuthorComment_src";
	if($allocated(SRC_LABEL)) {
		var ppid=$alloc(SRC_LABEL).id;
		if(ppid==pid) {
			return;
		}
	}
	$alloc(SRC_LABEL).id=pid;
	$("#ownerComment").remove();

	var po=$alloc(SRC_LABEL)["o"+pid];
	if(po!=null) {
		if(typeof po=="object") {
			po.clone().move("after",$("#photoTitle"));
		}
		return;
	}

	var url="http://photo.renren.com/photo/0/photo-0/comment?photo="+pid+"&owner="+uid+"&page=";
	$get(url+"0",function(html) {
		try {
			if(!html) {
				return;
			}
			var o=JSON.parse(html);
			if(o.hasMore==false) {
				$alloc(SRC_LABEL)["o"+pid]=0;
				return;
			}

			// 每页30条
			$get(url+parseInt(o.commentCount/30),function(html) {
				try {
					if(!html) {
						return;
					}
					var o=JSON.parse(html);
					var c=o.comments[o.comments.length-1];
					if(c.author!=uid) {
						// 不是上传者的留言
						$alloc(SRC_LABEL)["o"+pid]=0;
						return;
					}
					if(c.body.match("^回复.+：.+")) {
						// 是回复别人的，有可能别人的话已经被删了。这种情况不大可能是图片说明（是吗？）
						$alloc(SRC_LABEL)["o"+pid]=0;
						return;
					}
					var hp="http://www.renren.com/profile.do?id="+c.author;
					var dl=$("@div").attr({style:"background:#F0F5F8;width:600px;min-height:50px;padding:6px",id:"ownerComment"});
					var dd=$("@dd").addTo(dl);
					$("@a").attr("href",hp).add($("@img").attr({style:"float:left",height:"50",width:"50",src:c.headUrl})).addTo(dd);
					$("@div").attr("style","line-height:1.4em;margin-left:58px").add($("@a").attr("href",hp).text(c.name)).addTo(dd);
					$("@p").attr("style","margin:0 0 0 58px").html(c.body).addTo(dd);
					$alloc(SRC_LABEL)["o"+pid]=dl.clone();
					if($alloc(SRC_LABEL).id==pid) {
						dl.move("after",$("#photoTitle"));
					}
				} catch(ex) {
					$error("showPhotoAuthorComment",ex);
				}
			});
		} catch(ex) {
			$error("showPhotoAuthorComment",ex);
		}
	});
};

// 显示歌曲文件地址
function showMusicFileLink() {
	var paramStr=$("#player param[name='flashvars']").attr("value");
	if(!paramStr) {
		$error("showMusicFileLink","无法获取播放内容，重试中...");
		setTimeout(arguments.callee,100);
		return;
	}
	var paramList=paramStr.split("&");
	var src,name;
	for(var i=0;i<paramList.length;i++) {
		var param=paramList[i];
		if(param.match("^name=")) {
			name=param.substring(5);
		} else if(param.match("^src=")) {
			src=param.substring(4);
		}
		if(name && src) {
			break;
		}
	}
	if(!src) {
		$error("showMusicFileLink","无法分析播放参数");
		return;
	}
	if(name.length>10) {
		name=name.substring(0,10)+"...";
	}
	if($("a#tabDownload").empty()) {
		$("#tab ul.clearfix").add($("@li").add($("@a").attr({"id":"tabDownload","target":"_black"}).text("下载 "+name)));
	}
	$("a#tabDownload").attr("href",src);

	var code="var m=window.musicComment;"+
		"if(m.oa){"+
			"return;"+
		"};"+
		"m.oa=m.buildCommentListAsync;"+
		"m.buildCommentListAsync=function(mid){"+
			"new XN.net.xmlhttp({url:'http://music.renren.com/musicbox/song/'+mid,method:'get',onSuccess:function(r){"+
				"if(r.responseText){"+
					"var rp=XN.json.parse(r.responseText);"+
					"var t=document.getElementById('tabDownload');"+
					"t.setAttribute('href',rp.src);"+
					"if(rp.name.length>10){"+
						"rp.name=rp.name.substring(0,10)+'...'"+
					"}"+
					"t.textContent='下载 '+rp.name;"+
				"}"+
			"}});"+
			"this.oa(mid);"+
		"};";
	$script(code);
};

// 清空留言板
function delAllNotes() {
	$("@a").text("清空列出的留言").addTo($("@div").css({padding:"5px","text-align":"center",cursor:"pointer"}).move("before",$("#talk"))).bind("click",function() {
		if($("#talk .comment").empty()) {
			return;
		}
		if(!window.confirm("确实要删除所有在这里显示的留言？")) {
			return;
		}
		var ids=[];
		$("#talk .comment").each(function() {
			var id=this.id.match("\\d+");
			if(!id) {
				return;
			}
			var cmd=/delComment\('.*?','(.*?)','.*?',\d+\)/.exec($(this).find("a[onclick^='delComment']").attr("onclick"));
			ids.push({"id":id,"owner":(cmd?cmd[1]:XNR.userId)});
		});
		var total = ids.length;
		var box = $("@div").css({zIndex:"999999", width:"100%", height:"100%", position:"fixed", background:"rgba(0,0,0,0.8)", color:"#fff", left:0, top:0, textAlign:"center", verticalAlign:"middle", lineHeight:document.documentElement.clientHeight+"px"}).addTo(document);
		if (total > 0) {
			var deleter = function() {
				if (ids.length > 0) {
					box.text("处理中，请稍候..."+parseInt((total-ids.length)*100/total)+"%");
					var ido = ids.shift();
					$get("http://gossip.renren.com/delgossip.do?age=recent&id="+ido.id+"&owner="+ido.owner,deleter,null,"POST");
				} else {
					box.text("处理完毕，将刷新页面...");
					window.location.reload();
				}
			};
			deleter();
		}
	});
};

// 清空状态
function delAllStatus() {
	if(!XNR.url.match("\\?id="+XNR.userId)) {
		return;
	}
	$("@a").text("清空列出的状态").addTo($("@div").css({padding:"5px","text-align":"center",cursor:"pointer"}).addTo($("ul.status-list"),0)).bind("click",function() {
		if($("ul.status-list li a[onclick*='delMyDoing(']").empty()) {
			return;
		}
		if(!window.confirm("确实要删除所有在这里显示的状态？")) {
			return;
		}
		var ids=[];
		$("ul.status-list li a[onclick*='delMyDoing(']").each(function() {
			var cmd=/delMyDoing\(.*?,'(\d+)'\)/.exec($(this).attr("onclick"));
			if (cmd) {
				ids.push(cmd[1]);
			}
		});
		var total = ids.length;
		var box = $("@div").css({zIndex:"999999", width:"100%", height:"100%", position:"fixed", background:"rgba(0,0,0,0.8)", color:"#fff", left:0, top:0, textAlign:"center", verticalAlign:"middle", lineHeight:document.documentElement.clientHeight+"px"}).addTo(document);
		if (total > 0) {
			var deleter = function() {
				if (ids.length > 0) {
					box.text("处理中，请稍候..."+parseInt((total-ids.length)*100/total)+"%");
					var id = ids.shift();
					$get("http://status.renren.com/doing/deleteDoing.do?id="+id,deleter,null,"POST");
				} else {
					box.text("处理完毕，将刷新页面...");
					window.location.reload();
				}
			};
			deleter();
		}
	});
};

// 解除超级拖拽功能的封印。FIXME：中二了
function repaireSuperDrag() {
	const code='document.body.addEventListener("dragover",function(e){if(e.dataTransfer.types.indexOf("Files")==-1){e.stopPropagation()}},true)';
	$script(code);
}

// 检查更新
function checkUpdate(evt,checkLink,updateLink,lastCheck) {
	var today=new Date().getTime();
	lastCheck=new Date(lastCheck).getTime();
	if(isNaN(lastCheck)) {
		// 数据出错？
		lastCheck=0;
	}
	//一天只检查一次
	if(!evt && (today-lastCheck)<86400000) {
		return;
	}
	if(evt) {
		$(evt.target).attr({disabled:"disabled",value:"检查中..."});
	}
	$get(checkLink,function(html) {
		if(!html) {
			// 手动点击检查更新按钮时要弹出提示
			if(evt) {
				window.alert("无法检测最新版本");
				$(evt.target).attr({disabled:null,value:"立即检查"});
			}
			$save("lastUpdate",today);
			return;
		}
		try {
			var miniver=(/@miniver[ \t]+(\d+)/.exec(html) || ["","0"])[1];
			var ver=(/@version[ \t]+([0-9\.]+)/.exec(html) || ["","未知"])[1];
			if(parseInt(miniver)>XNR.miniver) {
				var pop=$popup(null,'<div style="color:black"><div>人人网改造器已有新版本：<br/>'+ver+'</div><div class="links" style="padding-top:5px;padding-bottom:5px;float:right"><a target="_blank" href="'+updateLink+'">安装</a></div></div>',null,30,5);
				pop.find(".links a").bind("click",function() {
					pop.remove();
				});
			} else if(evt) {
				// 手动点击检查更新按钮时要弹出提示
				window.alert("最新发布版："+ver+"\n当前使用版："+XNR.version+"\n\n无需更新");
			}

			$(".xnr_op #lastUpdate").text($formatDate(today));
			$save("lastUpdate",today);

			if(evt) {
				$(evt.target).attr({disabled:null,value:"立即检查"});
			}
		} catch(ex) {
			$error("checkUpdate::$get",ex);
		}
	});
};

// 升级后提示，必定执行
function updatedNotify(notify,lastVersion) {
	var lastVer=parseInt(lastVersion);
	// 如果第一次执行（实际判断为版本小于368，以提醒用户），显示选项设置提示
	if(lastVer<368) {
		var rect=$(".menu.xnr_opt").rect(true);
		if(rect) {
			$("@div").attr("id","xnr_optip").html('<div style="border-color:transparent transparent red transparent;border-style:solid;width:0;height:0;top:'+parseInt(rect.bottom-14)+'px;border-width:8px;left:'+parseInt((rect.left+rect.right)/2-8)+'px;position:absolute;z-index:100000"></div><div style="background:red;-moz-border-radius:3px;border-radius:3px;top:'+parseInt(rect.bottom+2)+'px;padding:5px 10px;left:'+parseInt(rect.right-118)+'px;color:white;font-weight:bold;position:absolute;min-width:104px;-moz-box-shadow:2px 2px 5px #292929;-webkit-box-shadow:2px 2px 5px #292929;box-shadow:2px 2px 5px #292929;z-index:99999;text-align:center;-moz-user-select:none;-khtml-user-select:none;cursor:default">点击这里进行设置</div>').addTo($("body")).bind("click",function() {
				$("#xnr_optip").remove();
			});
		}
	}
	if(notify) {
		// 0为首次运行。。？
		if(lastVer>0 && lastVer<XNR.miniver) {
			$popup(null,'<div style="color:black">人人网改造器已经更新到 '+XNR.version+'</div><div><a href="http://code.google.com/p/xiaonei-reformer/source/browse/trunk/Release.txt" style="padding-top:5px;padding-bottom:5px;float:right" target="_blank">查看更新内容</a></div>',null,20,5);
		}
	}
	$save("lastVersion",XNR.miniver);
};

// 生成诊断信息
function diagnose() {
	var str="";
	str+="运行环境："+window.navigator.userAgent+"\n";
	str+="当前页面："+XNR.url+"\n";
	str+="程序版本："+XNR.version+" - "+XNR.agent+"\n";
	str+="功能设置："+JSON.stringify(XNR.options)+"\n\n";
	$("div.xnr_op #diagnosisInfo").val(str);
};

// 设置参数
function setParam() {
	try {
		var name=$(".xnr_op #paramName").val();
		var value=$(".xnr_op #paramValue").val();
		if(!name) {
			throw 0;
		}
		$save(name,JSON.parse(value));
	} catch(ex) {
		window.alert("参数错误！");
	}
};

// 导入设置
function importConfig() {
	try {
		var value=JSON.parse($(".xnr_op #configuration").val().replace(/\n/g,""));
		if(typeof value!="object") {
			throw 0;
		}
		XNR.options=value;
		$save();
		document.location.reload();
	} catch(ex) {
		window.alert("选项数据错误！");
	}
};

// 导出设置
function exportConfig() {
	$(".xnr_op #configuration").val(JSON.stringify(XNR.options));
};

// 发送请求
function sendReq() {
	var method=$(".xnr_op input#req_m").val();
	var url=$(".xnr_op input#req_u").val();
	if(!method || !url) {
		window.alert("请求参数错误！");
		return;
	}
	$get(url,function (html) {
		if(!html) {
			window.alert("发送请求失败！");
			return;
		}
		if(window.confirm("解析回应数据？")) {
			document.documentElement.textContent=html;
		}
		$debug(html,0);
	},null,method.toUpperCase());
};

/* 所有功能完毕 */

// 主执行函数。
function main(savedOptions) {
	// 检查选项中是否设置了禁用页面隐藏项
	if(savedOptions.blacklist) {
		if(document.location.hostname!="renren.com") {
			try {
				if(new RegExp(savedOptions.blacklist).test(document.location.hostname)) {
					return;
				}
			} catch(ex) {
				$error("main","blacklist设置错误！");
			}
		}
	}

	// 选项菜单，定义选项菜单中各个项目
	// 基本格式：
	// {
	//	 类别名称1:[
	//	   {
	//	     // 交互区域1
	//	     参数1:...,
	//	     参数2:...,
	//	   },
	//	   {
	//	     // 交互区域2
	//	     ...
	//	   },
	//	   ...
	//	 ],
	//	 类别名称2:[
	//	   ...
	//	 ],
	//	 ...
	// }
	// 其中，交互区域分为两类，第一种是具体的功能，格式为：
	// {
	//   [String]text:文字+HTML控件描述。例："##选项 数量：##"，表示前后各有一个HTML控件。
	//   [Array]ctrl:如果text中存在控件描述，在这里具体定义。
	//   [Number]agent:执行环境限制。可选。为XNR.agent可定义值的组合
	//   [Boolean]login:用户登录后才执行。可选
	//   [String]page:适用页面。页面名参考$page()，多个名称之间用逗号分隔
	//   [Number]master:主控件序号。当主控件的值为假时，其余控件将被禁用。主控件的type只能为check/edit/input。可选
	// }
	// 功能中ctrl的格式是：
	// [
	//   {
	//     [String]id:控件ID。type为hidden/warn/info时无需id
	//     [String]type:类型，支持如下类型："check"（<input type="checkbox"/>）,"subcheck"（<div/><input type="checkbox"/>）,"edit"（<textarea/>）,"button"（<input type="button"/>）,"input"（<input/>）,"label"（<span/>）,"hidden"（不生成实际控件）,"warn"（<span class="warn"/>）,"info"（<span class="warn"/>）,"br"（<div/>）, "link"（<a/>）。默认为check
	//     [Any]value:默认值。type为hidden或readonly为真时可以没有value
	//     [Object]verify:{验证规则:失败信息,...}。验证规则为正则字串。可选
	//     [Object]attr:{属性名:属性值,...}。属性。可选
	//     [String]style:样式。可选
	//     [Boolean]readonly:控件只读。可选
	//     [String]format:值格式。显示时会自动转换。目前只支持"date"。注意：一旦设置了format，点击保存按钮时将*不会*保存控件的值，故仅将其用于label类型控件
	//     [Array]fn:处理函数。可选
	//   },
	//   {
	//   	控件2描述...
	//   },
	//   ...
	// ]
	// 功能中fn的格式是：
	// [
	//   {
	//     [Function]name:函数名。
	//     [String/Boolean]fire:函数执行条件。如果为string，则为控件的某一个事件。如果为特殊的"trigger"，则只在trigger触发时执行。否则是控件的期望值。可选。未指定事件为初始化后立即执行。
	//     [Number]stage:执行时机/优先级（0～3）。参考$wait()。
	//     [Object]trigger:设定其他控件的触发事件。{CSS选择器:事件名,...}。可选。如果stage为0，则trigger的执行时机为1，否则与stage相同。
	//     [Array]args:函数参数列表。如果参数为另一控件值/选项组，名称前加@。如果指定了trigger，请将第一个参数设置为null，在事件触发时将用事件对象替代第一个参数
	//     [Boolean]once:设置是否仅执行一次。对触发器无效。如果未指定功能的page，也默认只执行一次。目前仅对在首页动态载入中调用的功能有意义。
	//   },
	//   {
	//   	函数2描述...
	//   },
	//   ...
	// ]
	//
	//
	// 第二种是选项组，为被多个功能共用的选项集合，格式为：
	// {
	//   [String]id:选项组id。
	//   [String]text:文字描述。可选。文字后将换行列出各选项。
	//   [String]info:帮助信息。可选。
	//   [String]warn:警告信息。可选。
	//   [Array]ctrl:各选项描述。
	//   [Number]column:列数
	// }
	// 选项组中ctrl的格式是
	// [
	//   {
	//     [String]id:控件ID。type为hidden时没有id
	//     [String]text:文字+HTML控件描述。例："##选项"。仅能有一个##
	//     [String]type:类型，支持如下类型："check"（<input type="checkbox"/>）,"edit"（<textarea/>）,"button"（<button/>）,"input"（<input/>）,"label"（<span/>）,"hidden"（不生成实际控件）。默认为check
	//     [Any]value:默认值。
	//     [Object]verify:{验证规则:失败信息,...}。验证规则为正则字串。可选
	//     [String]style:样式。可选
	//   },
	//   {
	//   	控件2描述...
	//   },
	//   ...
	// ]

	var optionMenu={
		"清理页面":[
			{
				text:"##清除各类广告",
				ctrl:[{
					id:"removeAds",
					value:true,
					fn:[{
						name:removeAds,
						stage:0,
						fire:true,
					}],
				}],
			},{
				text:"##去除页面主题模板",
				ctrl:[{
					id:"removePageTheme",
					value:false,
					fn:[{
						name:removePageTheme,
						stage:1,
						fire:true,
						once:true
					},{
						name:removeHomeTheme,
						stage:1,
						fire:true,
					}],
				}],
				page:"home,*",
			},{
				text:"##去除升级星级用户提示",
				ctrl:[{
					id:"removeStarReminder",
					value:true,
					fn:[{
						name:removeStarReminder,
						stage:0,
						fire:true,
					}],
				}],
			},{
				text:"##去除VIP主页飘浮物",
				ctrl:[{
					id:"removeFloatObject",
					value:false,
					fn:[{
						name:removeFloatObject,
						stage:0,
						fire:true,
						once:true,
					}],
				}],
				page:"profile",
			},{
				text:"##去除VIP主页自定义鼠标指针",
				ctrl:[{
					id:"removeMouseCursor",
					value:false,
					fn:[{
						name:removeMouseCursor,
						stage:0,
						fire:true,
						once:true,
					}],
				}],
				page:"profile",
			},{
				text:"##去除VIP主页入场动画",
				ctrl:[{
					id:"removeEnterCartoon",
					value:false,
					fn:[{
						name:removeEnterCartoon,
						stage:0,
						fire:true,
						once:true
					}]
				}],
				page:"profile"
			},{
				text:"##去除日志信纸",
				ctrl:[{
					id:"removeBlogTheme",
					value:false,
					fn:[{
						name:removeBlogTheme,
						stage:1,
						fire:true,
					}],
				}],
				page:"blog",
			},{
				text:"##去除日志中整段链接",
				ctrl:[{
					id:"removeBlogLinks",
					value:false,
					fn:[{
						name:removeBlogLinks,
						stage:1,
						fire:true,
					}],
				}],
				page:"blog,page_blog",
			},{
				text:"##去除日志中音乐播放器",
				ctrl:[{
					id:"removeBlogMusicPlayer",
					value:false,
					fn:[{
						name:removeBlogMusicPlayer,
						stage:0,
						fire:true,
					}],
				}],
				page:"blog"
			},{
				text:"##去除公共主页上音乐播放器",
				ctrl:[{
					id:"removePagesMusicPlayer",
					value:false,
					fn:[{
						name:removePagesMusicPlayer,
						stage:0,
						fire:true,
					}],
				}],
				page:"pages"
			},{
				text:"##隐藏底部好友在线列表##",
				ctrl:[{
					id:"removeBottomBar",
					value:false,
					fn:[{
						name:removeBottomBar,
						stage:0,
						fire:true,
					}],
				},{
					type:"warn",
					value:"启用此功能并不会使你不出现在别人的在线好友列表，并且还会导致你无法看到别人对你发起的在线对话"
				}]
			},{
				text:"##",
				ctrl:[{
					type:"hidden",
					fn:[{
						name:removeHomeGadgets,
						stage:0,
						args:["@homeGadgets"]
					}],
				}],
				page:"home"
			},{
				id:"homeGadgets",
				text:"去除首页上以下部件",
				column:2,
				ctrl:[
					{
						id:"topNotice",
						text:"##顶部通知栏",
						value:false,
					},{
						id:"appList",
						text:"##应用列表",
						value:false,
					},{
						id:"recommendApp",
						text:"##应用推荐",
						value:false,
					},{
						id:"recommendGift",
						text:"##礼物推荐",
						value:false,
					},{
						id:"footprint",
						text:"##最近来访",
						value:false,
					},{
						id:"newFriends",
						text:"##好友推荐",
						value:false,
					},{
						id:"schoolBeauty",
						text:"##校花校草",
						value:false
					},{
						id:"sponsors",
						text:"##赞助商内容",
						value:false,
					},{
						id:"publicPageAdmin",
						text:"##我的管理",
						value:false,
					},{
						id:"groups",
						text:"##我的群",
						value:false,
					},{
						id:"birthday",
						text:"##好友生日/节日提醒",
						value:false,
					},{
						id:"webFunction",
						text:"##站内功能",
						value:false,
					},{
						id:"survey",
						text:"##人人网调查",
						value:false,
					},{
						id:"friendPhoto",
						text:"##朋友的照片",
						value:false,
					},{
						id:"newStar",
						text:"##人气之星",
						value:false,
					},{
						id:"contact",
						text:"##联系朋友",
						value:false
					}
				],
			},{
				text:"##",
				ctrl:[{
					type:"hidden",
					fn:[{
						name:removeProfileGadgets,
						stage:0,
						args:["@profileGadgets"]
					}],
				}],
				page:"profile"
			},{
				id:"profileGadgets",
				text:"去除个人主页上以下部件",
				column:2,
				ctrl:[{
						id:"album",
						text:"##相册",
						value:false,
					},{
						id:"blog",
						text:"##日志",
						value:false,
					},{
						id:"share",
						text:"##分享",
						value:false,
					},{
						id:"gift",
						text:"##礼物",
						value:false,
					},{
						id:"fav",
						text:"##酷爱",
						value:false,
					},{
						id:"theme",
						text:"##装扮主页",
						value:false,
					},{
						id:"introduceFriends",
						text:"##介绍朋友",
						value:false,
					},{
						id:"activity",
						text:"##活动广告",
						value:false,
					},{
						id:"lover",
						text:"##情侣空间",
						value:false,
					},{
						id:"specialFriends",
						text:"##特别好友",
						value:false,
					},{
						id:"mutualFriends",
						text:"##共同好友/最近应用",
						value:false,
					},{
						id:"visitors",
						text:"##最近来访",
						value:false,
					},{
						id:"pages",
						text:"##关注的公共主页",
						value:false
					},{
						id:"friends",
						text:"##好友",
						value:false,
					},{
						id:"invitation",
						text:"##邀请朋友",
						value:false,
					},{
						id:"musicPlayer",
						text:"##音乐播放器",
						value:false
					}
				]
			}
		],
		"处理请求":[
			{
				text:"##",
				ctrl:[{
					type:"hidden",
					fn:[{
						name:rejectRequest,
						stage:0,
						args:["@rejectRequestGroup","@blockAppRequest","@ignoreNotification","@ignoreReminder"],
						once:true
					},{
						name:hideRequest,
						stage:1,
						args:["@rejectRequestGroup"],
						once:true
					}],
				}],
				page:"home",
				login:true,
			},{
				id:"rejectRequestGroup",
				text:"自动拒绝以下类型的请求",
				column:3,
				ctrl:[
					{
						id:"appRequest",
						text:"##应用邀请",
						value:false,
					},{
						id:"friendRequest",
						text:"##好友申请",
						value:false,
					},{
						id:"recommendRequest",
						text:"##好友推荐",
						value:false,
					},{
						id:"tagRequest",
						text:"##圈人",
						value:false,
					},{
						id:"pokeRequest",
						text:"##招呼",
						value:false,
					},{
						id:"notifyRequest",
						text:"##通知",
						value:false,
					},{
						id:"loverRequest",
						text:"##情侣请求",
						value:false
					},{
						id:"addbookRequest",
						text:"##通讯录请求",
						value:false
					},{
						id:"xiaozuRequest",
						text:"##小组邀请",
						value:false
					},{
						id:"pageRequest",
						text:"##公共主页邀请",
						value:false
					}
				]
			},{
				text:"##自动将发来邀请的应用列入屏蔽名单##",
				ctrl:[
					{
						id:"blockAppRequest",
						value:false,
					},{
						type:"info",
						value:"在http://app.renren.com/app/appRequestList/blockList可以解除屏蔽"
					}
				],
			},{
				text:"##允许批量处理请求",
				ctrl:[
					{
						id:"batchProcessRequest",
						value:true,
						fn:[{
							name:batchProcessRequest,
							stage:2,
							fire:true
						}]
					}
				],
				page:"request",
				login:true,
			},{
				text:"##忽略所有通知",
				ctrl:[{
					id:"ignoreNotification",
					value:false,
					fn:[{
						name:ignoreNotification,
						stage:0,
						fire:true
					}]
				}],
			},{
				text:"##忽略所有留言/回复/站内信提醒",
				ctrl:[{
					id:"ignoreReminder",
					value:false,
					fn:[{
						name:ignoreReminder,
						stage:0,
						fire:true
					}]
				}],
			}
		],
		"处理新鲜事":[
			{
				text:"##",
				ctrl:[{
					type:"hidden",
					fn:[{
						name:hideFeeds,
						stage:1,
						args:[null,"@feedGroup","@markFeedAsRead","@forbiddenFeedTitle","@forbiddenFeedId","@trustedFeedId","@hideOldFeeds","@oldFeedDays"],
						trigger:{"div.feed-list":"DOMNodeInserted"},
					}],
				}],
				login:true,
				page:"feed,profile"
			},{
				id:"feedGroup",
				text:"隐藏以下类型的新鲜事",
				column:4,
				ctrl:[
					{
						id:"ads",
						text:"##广告",
						value:true
					},{
						id:"blog",
						text:"##日志",
						value:false
					},{
						id:"poll",
						text:"##投票",
						value:false
					},{
						id:"app",
						text:"##应用",
						value:false
					},{
						id:"status",
						text:"##状态",
						value:false
					},{
						id:"gift",
						text:"##礼物",
						value:false
					},{
						id:"photo",
						text:"##照片",
						value:false
					},{
						id:"tag",
						text:"##圈人",
						value:false
					},{
						id:"profile",
						text:"##头像",
						value:false
					},{
						id:"share_blog",
						text:"##日志分享",
						value:false
					},{
						id:"share_photo",
						text:"##图片分享",
						value:false
					},{
						id:"share_video",
						text:"##视频分享",
						value:false
					},{
						id:"share_other",
						text:"##其他分享",
						value:false
					},{
						id:"film",
						text:"##电影",
						value:false
					},{
						id:"music",
						text:"##音乐",
						value:false
					},{
						id:"connect",
						text:"##连接网站",
						value:false
					},{
						id:"friend",
						text:"##交友",
						value:false
					},{
						id:"xiaozu",
						text:"##小组",
						value:false
					},{
						id:"xiaozhan",
						text:"##小站",
						value:false
					},{
						id:"forum",
						text:"##论坛",
						value:false
					},{
						id:"like",
						text:"##喜欢",
						value:false
					},{
						id:"pos",
						text:"##报到",
						value:false
					},{
						id:"comment",
						text:"##评论",
						value:false
					},{
						id:"vip",
						text:"##VIP相关",
						value:false
					},{
						id:"club",
						text:"##俱乐部",
						value:false
					},{
						id:"group",
						text:"##品牌专区",
						value:false
					},{
						id:"page",
						text:"##公共主页",
						value:false
					},{
						id:"contact",
						text:"##保持联络",
						value:false
					},{
						id:"levelup",
						text:"##等级提升",
						value:false
					},{
						id:"event",
						text:"##线上活动",
						value:false
					},{
						id:"lover",
						text:"##情侣空间",
						value:false
					},{
						id:"newbie",
						text:"##新人注册",
						value:false
					}
				]
			},{
				text:"隐藏标题中含有以下内容的新鲜事######",
				ctrl:[
					{
						type:"info",
						value:"也会检查转发的状态内容。忽略内容中的空格。多个关键字用|分隔。如“星座|教程”，即可屏蔽所有标题包含星座或教程的新鲜事。可以用于屏蔽某些人的分享，比如“张三分享”即可将所有张三的分享新鲜事屏蔽。实际上是正则表达式，如果你不懂正则表达式，就尽量不要使用特殊符号"
					},{
						type:"br"
					},{
						id:"forbiddenFeedTitle",
						value:"",
						type:"input",
						style:"margin-left:5px;width:310px"
					}
				],
				page:"feed,profile"
			},{
				text:"隐藏与以下ID有关的分享/转发######",
				ctrl:[
					{
						type:"info",
						value:"包括分享/转发者和内容来源者。ID是对方个人主页地址中id=后面的数字，或者是公共主页地址上的6开头的9位数字。多个ID用|分隔。如果要屏蔽某人全部的新鲜事，请使用网站自身的忽略名单功能"
					},{
						type:"br"
					},{
						id:"forbiddenFeedId",
						value:"",
						type:"input",
						style:"margin-left:5px;width:310px",
						verify:{"^$|^([0-9]+\\|)*[0-9]+$":"格式错误！请检查ID是否正确，是否采用|分隔以及是否有多余的空格"}
					}
				],
				page:"feed,profile"
			},{
				text:"永不隐藏来自以下ID的新鲜事######",
				ctrl:[
					{
						type:"info",
						value:"ID是对方个人主页地址中id=后面的数字。多个ID用|分隔。"
					},{
						type:"br"
					},{
						id:"trustedFeedId",
						value:"",
						type:"input",
						style:"margin-left:5px;width:310px",
						verify:{"^$|^([0-9]+\\|)*[0-9]+$":"格式错误！请检查ID是否正确，是否采用|分隔以及是否有多余的空格"}
					}
				],
				page:"feed,profile"

			},{
				text:"##隐藏##天前的新鲜事",
				ctrl:[
					{
						id:"hideOldFeeds",
						value:false,
					},{
						id:"oldFeedDays",
						type:"input",
						value:"7",
						style:"width:20px;margin:0 3px",
						verify:{"^[1-9][0-9]*$":"请在新鲜事天数处输入大于0的数字！"}
					}
				],
				master:0
			},{
				text:"##将隐藏的新鲜事设为已读",
				ctrl:[{
					id:"markFeedAsRead",
					value:false
				}]
			},{
				text:"##首页默认显示特别关注",
				ctrl:[{
					id:"showAttentionFeeds",
					value:false,
					fn:[{
						name:showAttentionFeeds,
						stage:1,
						fire:true,
						once:true
					}]
				}],
				page:"feed"
			},{
				text:"##默认显示##页新鲜事##",
				ctrl:[
					{
						id:"loadMoreFeeds",
						value:false,
						fn:[{
							name:loadMoreFeeds,
							stage:2,
							fire:true,
							args:["@loadFeedPage"],
							once:true
						}]
					},{
						id:"loadFeedPage",
						type:"input",
						value:"2",
						style:"width:15px;margin-left:3px;margin-right:3px",
						verify:{"^[2-9]$":"新鲜事页数只能为2~9"}
					},{
						type:"warn",
						value:"进入首页时会很卡"
					}
				],
				master:0,
				login:true,
				page:"feed"
			},{
				text:"##页面滚动到底部时不加载下一页新鲜事",
				ctrl:[{
					id:"disableAutoLoadFeeds",
					value:false,
					fn:[{
						name:disableAutoLoadFeeds,
						stage:1,
						fire:true,
					}]
				}],
				login:true,
				page:"feed"
			},{
				text:"##不显示新鲜事发布方式",
				ctrl:[{
					id:"hideFeedSource",
					value:false,
					fn:[{
						name:hideFeedSource,
						stage:0,
						fire:true,
					}]
				}],
				login:true,
				page:"feed",
			},{
				text:"##在新鲜事中标记在线好友",
				ctrl:[{
					id:"markOnlineFriend",
					value:false,
					fn:[{
						name:markOnlineFriend,
						stage:1,
						fire:true,
						trigger:{".feed-list":"DOMNodeInserted"}
					}]
				}],
				login:true,
				page:"feed,profile"
			},{
				text:"##默认收起新鲜事回复",
				ctrl:[{
					id:"flodFeedComment",
					value:false,
					fn:[{
						name:flodFeedComment,
						stage:0,
						fire:true
					}]
				}],
				page:"feed,profile,pages"
			},{
				text:"##展开新鲜事回复时获取最新回复",
				ctrl:[{
					id:"refreshFeedReply",
					value:false,
					fn:[{
						name:refreshFeedReply,
						stage:2,
						fire:true
					}]
				}],
				page:"feed,profile,status,pages"
			},{
				text:"##总是显示新鲜事控制按钮",
				ctrl:[{
					id:"showFeedToolbar",
					value:false,
					fn:[{
						name:showFeedToolbar,
						stage:0,
						fire:true,
						once:true
					}]
				}],
				page:"feed,profile"
			},{
				text:"##自动检查并提醒新的新鲜事##在有新的回复时也进行提醒##",
				ctrl:[
					{
						id:"autoCheckFeeds",
						value:false,
						fn:[{
							name:autoCheckFeeds,
							stage:3,
							fire:true,
							args:["@feedGroup","@forbiddenFeedTitle","@forbiddenFeedId","@trustedFeedId","@checkFeedReply"]
						}]
					},{
						id:"checkFeedReply",
						type:"subcheck",
						value:false
					},{
						type:"info",
						value:"如果一件新鲜事有多条新回复，只会提醒最后一条"
					}
				],
				master:0,
				login:true,
			},{
				text:"##定时刷新首页新鲜事列表，每隔##秒##",
				ctrl:[
					{
						id:"autoReloadFeeds",
						value:false,
						fn:[{
							name:autoReloadFeeds,
							stage:3,
							fire:true,
							args:["@reloadFeedInterval"],
						}]
					},{
						id:"reloadFeedInterval",
						type:"input",
						value:"180",
						verify:{"^[6-9][0-9]$|^[1-9][0-9]{2,}$":"刷新新鲜事列表间隔时间不得小于60秒"},
						style:"width:30px;margin:0 3px"
					},{
						type:"warn",
						value:"刷新时会导致正在回复的内容遗失，请慎重启用"
					}
				],
				master:0,
				login:true,
			}
		],
		"改造导航栏":[
			{
				text:"##",
				ctrl:[{
					type:"hidden",
					fn:[{
						name:removeNavItems,
						stage:0,
						args:["@navLinks"]
					}],
				}],
			},{
				id:"navLinks",
				text:"去除以下链接",
				column:3,
				ctrl:[
					{
						id:"theme",
						text:"##装扮",
						value:false
					},{
						id:"app",
						text:"##应用",
						value:false
					},{
						id:"game",
						text:"##游戏",
						value:false
					},{
						id:"vip",
						text:"##升级VIP",
						value:false
					},{
						id:"vipCenter",
						text:"##VIP中心",
						value:false
					},{
						id:"pay",
						text:"##充值",
						value:false
					},{
						id:"invite",
						text:"##邀请",
						value:false
					}
				]
			},{
				text:"##加宽导航栏",
				ctrl:[{
					id:"widenNavBar",
					value:false,
					fn:[{
						name:widenNavBar,
						stage:0,
						fire:true,
					}],
				}]
			},{
				text:"##使用旧式风格",
				ctrl:[{
					id:"useOldStyleNav",
					value:false,
					fn:[{
						name:useOldStyleNav,
						stage:0,
						fire:true
					}],
				}]
			},{
				text:"##保留退出按钮",
				ctrl:[{
					id:"addNavLogout",
					value:false,
					fn:[{
						name:addNavLogout,
						stage:1,
						fire:true
					}],
				}]
			},{
				text:"##使用浮动方式",
				ctrl:[{
					id:"useFloatingNav",
					value:false,
					fn:[{
						name:useFloatingNav,
						stage:1,
						fire:true
					}]
				}]
			},{
				text:"##增加导航栏项目######",
				ctrl:[
					{
						id:"addNavItems",
						value:false,
						fn:[{
							name:addNavItems,
							stage:2,
							args:["@navItemsContent"],
							fire:true
						}],
					},{
						type:"info",
						value:"每两行描述一项。第一行为显示的名称，第二行为对应的链接地址。链接地址请用包含协议名的完整形式，如http://g.cn，不要仅填写g.cn"
					},{
						type:"br"
					},{
						id:"navItemsContent",
						type:"edit",
						style:"width:99%;height:80px;overflow:auto;word-wrap:normal;margin-top:5px",
						attr:{wrap:"off"},
						value:"论坛\nhttp://club.renren.com/\n情侣空间\nhttp://lover.renren.com/dispatch\n"
					}
				],
				master:0
			}
		],
		"改造界面":[
			{
				text:"##使用深蓝色主题##",
				ctrl:[{
					id:"recoverOriginalTheme",
					value:false,
					fn:[{
						name:recoverOriginalTheme,
						stage:0,
						fire:true,
						args:[null,"@removePageTheme"],
						trigger:{"head":"DOMNodeInserted"}
					}],
				},{
					type:"info",
					value:"使用早期的类Facebook配色。在有模板的页面不会修改其配色",
				}]
			},{
				text:"##去除页面字体限制##",
				ctrl:[
					{
						id:"removeFontRestriction",
						value:false,
						fn:[{
							name:removeFontRestriction,
							stage:0,
							fire:true
						}]
					},{
						type:"info",
						value:"使用浏览器本身设定的字体而非网站限制使用的字体"
					}
				]
			},{
				text:"##限制个人主页上头像列表中的头像数量最多为##个",
				ctrl:[
					{
						id:"limitHeadList",
						value:false,
						fn:[{
							name:limitHeadList,
							stage:1,
							fire:true,
							args:[null,"@headsAmount"],
							trigger:{"#ajaxContainer":"DOMNodeInserted"}
						}]
					},{
						id:"headsAmount",
						value:"12",
						type:"input",
						style:"width:30px;margin-left:3px;margin-right:3px",
						verify:{"^[0-9]{1,2}$":"请在头像最大数量处输入1～2位正整数"}
					}
				],
				master:0,
				page:"profile"
			},{
				text:"##修正导航栏项目高度##",
				agent:FIREFOX | USERSCRIPT,
				ctrl:[
					{
						id:"fixNavItemHeight",
						value:false,
						fn:[{
							name:fixNavItemHeight,
							stage:0,
							fire:true
						}]
					},{
						type:"info",
						value:"如果您将浏览器字体的最小大小设成大于12，可能会出现导航栏上的项目高度过大的错误。如果您遇到这个问题，请启用此功能。"
					}
				]
			},{
				text:"##修正论坛排版错误##",
				agent:FIREFOX | USERSCRIPT,
				ctrl:[
					{
						id:"fixClubTypesetting",
						value:false,
						fn:[{
							name:fixClubTypesetting,
							stage:0,
							fire:true,
						}]
					},{
						type:"info",
						value:"如果您将浏览器字体的最小大小设成大于12，可能会出现论坛的栏目导航栏和帖子正文偏右的错误。如果您遇到这个问题，请启用此功能。",
					}
				],
				page:"forum"
			},{
				text:"##自定义页面样式######",
				ctrl:[
					{
						id:"customizePageStyle",
						value:false,
						fn:[{
							name:customizePageStyle,
							stage:0,
							fire:true,
							args:["@myPageStyle"]
						}]
					},{
						type:"link",
						value:"更多示例",
						attr:{
							href:"http://code.google.com/p/xiaonei-reformer/wiki/Styles",
							target:"_blank"
						},
						style:"margin-left:10px"
					},{
						type:"br"
					},{
						id:"myPageStyle",
						type:"edit",
						value:"/* 例子:浅灰->白渐变背景 */\nbody{background:-moz-linear-gradient(left,lightgray,white);background:-o-linear-gradient(left,lightgray,white);background:-webkit-gradient(linear,left center,right center,from(lightgray),to(white))}",
						attr:{wrap:"off"},
						style:"width:99%;height:110px;margin-top:5px;"
					}
				],
				master:0
			},{
				text:"##调整页面布局########",
				ctrl:[
					{
						id:"customizePageLayout",
						value:false,
						fn:[{
							name:customizePageLayout,
							stage:1,
							fire:true,
							args:["@myPageLayout"]
						}]
					},{
						type:"info",
						value:"每行一条调整规则，语法如下：\n 将A放置到B之前：A<<B\n 将A放置到B之后：A>>B\n 将A作为B的第一个子节点：A<<<B\n 将A作为B最后一个子节点：A>>>B\n以上A、B皆为CSS选择器。不合规则的行将被忽略"
					},{
						type:"link",
						value:"更多示例",
						attr:{
							href:"http://code.google.com/p/xiaonei-reformer/wiki/Layout",
							target:"_blank"
						},
						style:"margin-left:10px"
					},{
						type:"br"
					},{
						id:"myPageLayout",
						type:"edit",
						attr:{wrap:"off"},
						value:"例子：将个人主页上留言板移至新鲜事下方\nbody#profile .talk-box>.box>>>body#profile .talk-box",
						style:"width:99%;height:110px;margin-top:5px;"
					}
				],
				master:0
			}
		],
		"辅助功能":[
			{
				text:"##启用隐藏表情项##包括自然风光表情##包括网络流行语表情##包括节日事件表情##包括人物表情##包括抢沙发表情##包括商业广告表情##包括过期事件表情",
				ctrl:[
					{
						id:"addExtraEmotions",
						value:true,
						fn:[{
							name:addExtraEmotions,
							stage:2,
							args:["@natureEmo","@bwEmo","@eventEmo","@figureEmo","@sfEmo","@advEmo","@odEmo"],
							fire:true
						}],
					},{
						type:"subcheck",
						id:"natureEmo",
						value:false
					},{
						type:"subcheck",
						id:"bwEmo",
						value:true
					},{
						type:"subcheck",
						id:"eventEmo",
						value:false
					},{
						type:"subcheck",
						id:"figureEmo",
						value:false
					},{
						type:"subcheck",
						id:"sfEmo",
						value:false
					},{
						type:"subcheck",
						id:"advEmo",
						value:false
					},{
						type:"subcheck",
						id:"odEmo",
						value:false
					}
				],
				master:0,
				page:"feed,profile,status,act,blog,photo,album,share,pages,xiaozu",
				login:true
			},{
				text:"##为评论增加楼层计数##",
				ctrl:[{
					id:"addFloorCounter",
					value:false,
					fn:[{
						name:addFloorCounter,
						stage:2,
						trigger:{"div.replies,div.boxcont,div#feedView,div#newsfeed-module-box>.feed-module>.feed-list":"DOMNodeInserted"},
						fire:true
					}]
				},{
					type:"info",
					value:"当有悄悄话存在时，人人网显示的评论数和实际能看到的评论数量会有差异，这会导致计数出现偏差"
				}],
				page:"blog,photo,pages,feed,profile,share"
			},{
				text:"##允许在日志中添加HTTPS/FTP协议的链接",
				ctrl:[{
					id:"extendBlogLinkSupport",
					value:true,
					fn:[{
						name:extendBlogLinkSupport,
						stage:3,
						fire:true
					}]
				}],
				login:true,
				page:"blog"
			},{
				text:"##允许直接编辑日志HTML代码",
				ctrl:[{
					id:"addBlogHTMLEditor",
					value:false,
					fn:[{
						name:addBlogHTMLEditor,
						stage:2,
						fire:true
					}]
				}],
				login:true,
				page:"blog,lover_blog,page_blog,zhan"
			},{
				text:"##禁止跟踪统计##",
				ctrl:[
					{
						id:"preventTracking",
						value:true,
						fn:[
							{
								name:preventTracking0,
								stage:0,
								fire:true
							},{
								name:preventTracking2,
								stage:2,
								fire:true
							}
						]
					},{
						type:"info",
						value:"在访问人人网的绝大多数页面时，会自动向人人网和第三方网站发送包含你浏览习惯的信息。这些信息可能会被用在统计分析用户行为方面。如果你不想让其获取这些信息，可以启用本功能。"
					}
				]
			},{
				text:"##相册所有图片在一页中显示",
				ctrl:[{
					id:"showImagesInOnePage",
					value:false,
					fn:[{
						name:showImagesInOnePage,
						stage:1,
						fire:true
					}]
				}],
				page:"album,share,xiaozu"
			},{
				text:"##允许下载相册图片####仅生成图片链接##替换模式##",
				ctrl:[
					{
						id:"addDownloadAlbumLink",
						value:true,
						fn:[{
							name:addDownloadAlbumLink,
							stage:2,
							fire:true,
							args:["@showImageLinkOnly","@repMode"]
						}]
					},{
						type:"info",
						value:"在相册图片列表下方会生成一个”下载当前页图片“链接。如果点击链接后进度长期卡住，再点击一次链接选择中止，可以下载其他已分析完毕的图片。"+(XNR.agent==USERSCRIPT?"分析完毕后会弹出一个窗口，其可能会被浏览器拦截，在浏览器状态栏或地址栏右侧的弹出窗口拦截图标上点左键让其显示即可。":"")+"如果想下载整个相册的内容，请配合“相册所有图片在一页中显示”功能使用。",
					},{
						type:"subcheck",
						id:"showImageLinkOnly",
						value:false,
					},{
						type:"subcheck",
						id:"repMode",
						value:false,
					},{
						type:"info",
						value:"直接替换当前页面内容，不打开新标签页",
					}
				],
				master:0,
				page:"album,share,xiaozu"
			},{
				text:"##当鼠标在照片上时隐藏圈人框##",
				ctrl:[
					{
						id:"hideImageTagOnMouseOver",
						value:false,
						fn:[{
							name:hideImageTagOnMouseOver,
							stage:2,
							fire:true
						}]
					},{
						type:"info",
						value:"仍然可以在照片右侧的被圈人员列表中看到圈人情况"
					}
				],
				page:"photo"
			},{
				text:"##在鼠标经过图片时显示大图########自动缩小尺寸过大的图片##使用保护模式##",
				ctrl:[
					{
						id:"showFullSizeImage",
						value:false,
						fn:[
							{
								name:initFullSizeImage,
								stage:1,
								fire:true
							},{
								name:showFullSizeImage,
								stage:2,
								fire:"trigger",
								args:[null,"@autoShrink","@leakConfirmation"],
								trigger:{"body":"mouseover"}
							}
					 	]
					},{
						type:"info",
						value:"要在鼠标移动时保持大图显示，按住PC键盘的Shift/Alt/Ctrl/Meta或Mac键盘的Shift/Option/Ctrl/Command键不放"
					},{
						type:"warn",
						value:"会记入对方最近来访名单中。如想防止误访问，请启用“使用保护模式”",
					},{
						type:"button",
						value:"清除地址缓存",
						fn:[{
							name:cleanFullSizeImageCache,
							fire:"click"
						}],
						style:"margin-left:5px"
					},{
						type:"subcheck",
						id:"autoShrink",
						value:false
					},{
						type:"subcheck",
						id:"leakConfirmation",
						value:true,
					},{
						type:"info",
						value:"在鼠标经过会可能被记入最近来访的图片时，会在图片右下角显示一个放大镜图标，点击后才会显示原大图片"
					}
				],
				master:0
			},{
				text:"##默认使用悄悄话",
				ctrl:[{
					id:"useWhisper",
					value:false,
					fn:[{
						name:useWhisper,
						stage:3,
						fire:true
					}]
				}],
				login:true
			},{
				text:"##不显示橙名##",
				ctrl:[
					{
						id:"hideOrangeName",
						value:false,
						fn:[{
							name:hideOrangeName,
							stage:1,
							fire:true,
						}]
					},{
						type:"info",
						value:"要想让别人看不到自己的橙名，请到导航栏上“帐号”->“帐户设置”->“隐私设置”->“橙名显示”中进行设置"
					}
				]
			},{
				text:"##允许非星级用户修改特别好友",
				ctrl:[{
		 			id:"removeBestFriendRestriction",
					value:true,
					fn:[{
						name:removeBestFriendRestriction,
						stage:1,
						fire:true
					}]
				}],
				page:"friend",
				login:true
			},{
				text:"##允许非星级用户修改个人昵称##",
				ctrl:[
					{
						id:"removeNicknameRestriction",
						value:false,
						fn:[{
							name:removeNicknameRestriction,
							stage:2,
							fire:"trigger",
							trigger:{"#ajaxContainer":"DOMNodeInserted"}
						}]
					},{
						type:"info",
						value:"启用本功能后，在个人主页“资料”->“资料编辑”->“基本信息”中编辑昵称"
					}
				],
				page:"profile",
				login:true
			},{
				text:"##登录时提示登录信息##",
				ctrl:[
					{
						id:"showLoginInfo",
						value:false,
						fn:[{
							name:showLoginInfo,
							stage:1,
							fire:true,
							args:["@lastSid"]
						}]
					},{
						id:"lastSid",
						value:"0",
						type:"hidden"
					}
				],
				login:true
			},{
				text:"##启用快速通道菜单####",
				ctrl:[
					{
						id:"enableShortcutMenu",
						value:false,
						fn:[{
							name:enableShortcutMenu,
							stage:2,
							fire:"trigger",
							trigger:{"body":"mouseover"}
						}]
					},{
						type:"info",
						value:"鼠标经过人名链接时，显示对方相册/日志/留言板等的链接"
					},{
						type:"warn",
						value:"访问对方具体的相册/日志时会在对方最近来访中留下记录"
					}
				]
			},{
				text:"##允许提升搜索结果上限到200页##",
				ctrl:[
					{
						id:"expandSearchResult",
						value:false,
						fn:[{
							name:expandSearchResult,
							stage:2,
							fire:true
						}]
					},{
						type:"info",
						value:"在搜索结果页面下方的翻页区域左侧。目前无法提升到更多页数"
					}
				],
				page:"searchEx",
			},{
				text:"##增加搜索分享/日志/状态功能##",
				ctrl:[
					{
						id:"searchShare",
						value:true,
						fn:[{
							name:searchShare,
							stage:2,
							fire:true
						}]
					},{
						type:"info",
						value:"可以根据标题/内容预览/发布时间中出现的文字搜索，支持多个关键词"
					}
				],
				page:"share,blog,status"
			},{
				text:"##增加批量清理分享功能",
				ctrl:[{
					id:"delAllShares",
					value:false,
					fn:[{
						name:delAllShares,
						stage:2,
						fire:true
					}]
				}],
				page:"share"
			},{
				text:"##允许直接回复分享的全站评论##",
				ctrl:[{
					id:"allowReplyToAllPeople",
					value:false,
					fn:[{
						name:allowReplyToAllPeople,
						stage:2,
						trigger:{"#allCmtsList":"DOMNodeInserted"},
						fire:true
					}]
				},{
					type:"warn",
					value:"回复的内容会出现在原分享者的分享评论中"
				}],
				login:true,
				page:"blog,share"
			},{
				text:"##禁止鼠标悬停在用户头像/名称时显示名片##",
				ctrl:[{
					id:"removeNameCard",
					value:false,
					fn:[{
						name:removeNameCard,
						stage:2,
						fire:true,
					}]
				}],
				page:"feed,profile",
			},{
				text:"##显示图片上传者的说明性留言##",
				ctrl:[
					{
						id:"showPhotoAuthorComment",
						value:false,
						fn:[{
							name:showPhotoAuthorComment,
							stage:2,
							trigger:(XNR.acore==GECKO?{"input#sourceid":"DOMSubtreeModified"}:{".user-comment":"DOMNodeRemoved"}),
							fire:true
						}]
					},{
						type:"info",
						value:"如果相册中图片的第一个留言是上传者的，有可能是对图片的补充说明。如果留言过多导致没有显示出一楼的话，本功能会将其单独显示出来"
					}
				],
				page:"photo"
			},{
				text:"##在人人爱听播放器中显示音乐下载地址",
				ctrl:[{
					id:"showMusicFileLink",
					value:false,
					fn:[{
						name:showMusicFileLink,
						stage:2,
						fire:true
					}]
				}],
				page:"musicbox"
			},{
				text:"##增加批量清理留言板功能",
				ctrl:[{
					id:"delAllNotes",
					value:false,
					fn:[{
						name:delAllNotes,
						stage:2,
						fire:true
					}]
				}],
				page:"gossip"
			},{
				text:"##增加批量清理状态功能",
				ctrl:[{
					id:"delAllStatus",
					value:false,
					fn:[{
						name:delAllStatus,
						stage:2,
						fire:true
					}]
				}],
				page:"status"
			},{
				text: "##解决浏览器内置的超级拖拽功能失效问题##",
				ctrl:[{
					id:"repaireSuperDrag",
					value:false,
					fn:[{
						name:repaireSuperDrag,
						stage:2,
						fire:true,
						once:true
					}]
				},{
					type:"info",
					value: "人人网首页的拖拽图片上传会使chromeplus、sunchrome等浏览器内建的超级拖拽失效。开启本功能后可以使其重新生效。如果是通过第三方扩展实现的拖拽，没必要启用本功能"
				}],
				agent:CHROME,
				page:"home"
			}
		],
		"自动更新":[
			{
				text:"##自动检查程序更新##",
				ctrl:[
					{
						id:"checkUpdate",
						value:true,
						fn:[{
							name:checkUpdate,
							stage:2,
							fire:true,
							args:[null,"@checkLink","@updateLink","@lastUpdate"]
						}]
					},{
						type:"info",
						value:"24小时内最多检查一次"
					}
				],
				agent:USERSCRIPT | FIREFOX | OPERA_UJS | OPERA_EXT
			},{
				text:"最后一次检查更新时间：##",
				ctrl:[{
					id:"lastUpdate",
					type:"label",
					value:0,
					format:"date"
				}],
				agent:USERSCRIPT | FIREFOX | OPERA_UJS | OPERA_EXT
			},{
				text:"##",
				ctrl:[{
					type:"button",
					value:"立即检查",
					fn:[{
						name:checkUpdate,
						fire:"click",
						args:[null,"@checkLink","@updateLink","@lastUpdate"]
					}],
				}],
				agent:USERSCRIPT | FIREFOX | OPERA_UJS | OPERA_EXT
			},{
				text:"检查更新地址：##",
				ctrl:[{
					id:"checkLink",
					type:"input",
					value:"http://userscripts.org/scripts/source/45836.meta.js",
					style:"width:330px",
					verify:{"[A-Za-z]+://[^/]+\.[^/]+/.*":"请输入正确的检查更新地址"}
				}],
				agent:USERSCRIPT | OPERA_UJS
			},{
				text:"脚本下载地址：##",
				ctrl:[{
					id:"updateLink",
					type:"input",
					value:"http://userscripts.org/scripts/source/45836.user.js",
					style:"width:330px;",
					verify:{"[A-Za-z]+://[^/]+\.[^/]+/.*":"请输入正确的脚本下载地址"},
				}],
				agent:USERSCRIPT
			},{
				text:"检查更新地址：##",
				ctrl:[{
					id:"checkLink",
					type:"input",
					value:"http://xiaonei-reformer.googlecode.com/files/45836.meta.js",
					style:"width:330px",
					verify:{"[A-Za-z]+://[^/]+\.[^/]+/.*":"请输入正确的检查更新地址"}
				}],
				agent:FIREFOX | OPERA_EXT
			},{
				text:"扩展下载地址：##",
				ctrl:[{
					id:"updateLink",
					type:"input",
					value:"http://xiaonei-reformer.googlecode.com/files/xiaonei_reformer-fx.xpi",
					style:"width:330px;",
					verify:{"[A-Za-z]+://[^/]+\.[^/]+/.*":"请输入正确的扩展下载地址"},
				}],
				agent:FIREFOX 
			},{
				text:"脚本下载地址：##",
				ctrl:[{
					id:"updateLink",
					type:"input",
					value:"http://xiaonei-reformer.googlecode.com/files/xiaonei_reformer.min.js",
					style:"width:330px;",
					verify:{"[A-Za-z]+://[^/]+\.[^/]+/.*":"请输入正确的脚本下载地址"},
				}],
				agent:OPERA_UJS
			},{
				text:"扩展下载地址：##",
				ctrl:[{
					id:"updateLink",
					type:"input",
					value:"http://xiaonei-reformer.googlecode.com/files/xiaonei_reformer-opera.oex",
					style:"width:330px;",
					verify:{"[A-Za-z]+://[^/]+\.[^/]+/.*":"请输入正确的扩展下载地址"},
				}],
				agent:OPERA_EXT
			},{
				text:"* 以上地址保存后生效",
				agent:USERSCRIPT | FIREFOX | OPERA_UJS | OPERA_EXT
			},{
				text:"##升级后显示通知",
				ctrl:[{
					id:"updatedNotify",
					value:true,
					fn:[{
						name:updatedNotify,		// 无条件执行，当未选中时不提示
						stage:3,
						args:["@updatedNotify","@lastVersion"]
					}]
				}]
			},{
				text:"##",
				ctrl:[{
					id:"lastVersion",
					type:"hidden",
					value:0
				}]
			}
		],
		"诊断信息":[
			{
				text:"##如果您遇到功能出错，请在报告问题时附带上出错页面中的以下信息：####",
				ctrl:[
					{
						type:"hidden",
						fn:[{
							name:diagnose,
							stage:1,
						}],
					},{
						type:"br"
					},{
						id:"diagnosisInfo",
						type:"edit",
						style:"width:99%;height:230px;margin-top:5px;word-wrap:break-word",
						readonly:true,
					}
				],
			}
		],
		"功能调试":[
			{
				text:"如果您不了解以下功能的用处，请不要使用！",
			},{
				text:"##",
				ctrl:[{
					id:"debuglv",	// 用于设置调试信息输出等级
					type:"hidden",
					value:0
				}]
			},{
				text:"##",		// 用于设置在部分页面不启用，不在界面提供直接修改途径，仅通过下面的参数设置功能设置
				ctrl:[{
					id:"blacklist",
					type:"hidden",
					value:"",
				}]
			},{
				text:"##：## = ##",
				ctrl:[
					{
						type:"button",
						value:"参数设置",
						fn:[{
							name:setParam,
							fire:"click"
						}]
					},{
						id:"paramName",
						type:"input",
						style:"width:70px"
					},{
						id:"paramValue",
						type:"input",
						style:"width:170px"
					}
				]
			},{
				text:"## ##：####",
				ctrl:[
					{
						type:"button",
						value:"导入选项",
						fn:[{
							name:importConfig,
							fire:"click",
						}]
					},{
						type:"button",
						value:"导出选项",
						fn:[{
							name:exportConfig,
							fire:"click",
						}]
					},{
						type:"br",
						style:"height:5px"
					},{
						id:"configuration",
						type:"edit",
						style:"width:99%;height:110px"
					}
				]
			},{
				text:"##：## ##",
				ctrl:[
					{
						type:"button",
						value:"发送请求",
						fn:[{
							name:sendReq,
							fire:"click",
						}]
					},{
						id:"req_m",
						type:"input",
						style:"width:30px",
					},{
						id:"req_u",
						type:"input",
						style:"width:230px",
					}
				]
			}
		]
	};

	// 函数执行队列。
	// {page1:[[],[],[],[]],page2:[[],[],[],[]]...}
	// 对应4个优先级，每一个优先级数组中的函数对象为{name:函数,args:函数参数,[trigger:{CSS选择器:事件名,...}]}
	var fnQueue={"*":[[],[],[],[]]};
	// 本地触发器队列
	var localTriggers=[];

	var categoryHTML="";
	var categoryPages=[];
	// 解析选项
	for(var category in optionMenu) {
		// 添加分类
		categoryHTML+="<li><span>"+category+"</span></li>";
		var page=$("@div").attr("class","p");
		for(var iFunc=0;iFunc<optionMenu[category].length;iFunc++) {
			var o=optionMenu[category][iFunc];
			// 不适用于当前浏览器
			if(o.agent && (o.agent & XNR.agent)==0) {
				continue;
			}
			// 将执行函数
			var exec=true;
			// 检查登录限制
			if(o.login && XNR.userId=="0") {
				exec=false;
			}
			// 放在一块中
			var block=$("@div");
			if(!o.id) {
				// 功能
				var text=o.text.split("##");
				for(var iText=0;iText<text.length;iText++) {
					// 文本节点
					if(text[iText]) {
						if(o.ctrl) {
							// 寻找前一个check/subcheck作为关联目标
							var forCheck="";
							for(var iCtrl=iText-1;iCtrl>=0;iCtrl--) {
								if(o.ctrl[iCtrl].type=="br") {
									break;
								}
								if(!o.ctrl[iCtrl].type || o.ctrl[iCtrl].type=="check" || o.ctrl[iCtrl].type=="subcheck") {
									forCheck=o.ctrl[iCtrl].id;
									break;
								}
							}
						}
						$("@label").attr("for",forCheck).text(text[iText]).addTo(block);
					}
					if(o.ctrl==null) {
						// 纯文本描述
						continue;
					}
					// 控件节点
					var control=o.ctrl[iText];
					// split分割的文本节点总比控件节点多1。
					if(!control) {
						continue;
					}
					// 如果控件值已保存，用保存的值替代默认值
					if(control.id && savedOptions[control.id]!=null && !control.readonly) {
						control.value=savedOptions[control.id];
					}
					// 生成控件节点
					var node=null;
					switch(control.type || "check") {
						case "check":
							node=$("@input").attr("type","checkbox");
							break;
						case "hidden":
							break;
						case "input":
							node=$("@input");
							break;
						case "info":
							node=$("@span").attr({tooltip:control.value,"class":"info"});
							control.value=null;
							break;
						case "warn":
							node=$("@span").attr({tooltip:control.value,"class":"warn"});
							control.value=null;
							break;
						case "br":
							node=$("@div");
							break;
						case "subcheck":
							$("@div").css("height","3px").addTo(block);
							node=$("@input").css("marginLeft","15px").attr("type","checkbox");
							break;
						case "edit":
							node=$("@textarea");
							break;
						case "button":
							node=$("@button");
							break;
						case "label":
							node=$("@span");
							break;
						case "link":
							node=$("@a");
							break;
					}
					if(node) {
						if(control.value!=null) {
							switch(control.format) {
								case "date":
									node.val($formatDate(control.value));
									break;
								default:
									node.val(control.value);
									break;
							}
						}
						if(control.id) {
							node.attr("id",control.id);
						}
						if(control.style) {
							node.attr("style",control.style);
						}
						if(control.attr) {
							node.attr(control.attr);
						}
						if(control.readonly) {
							node.attr("readonly","true");
							control.value=null;
						}
						if(control.format) {
							node.attr("fmt",control.format);
						}
						// 输入验证
						if(control.verify) {
							node.attr("verify",JSON.stringify(control.verify));
						}
						node.addTo(block);
					}
					if(control.value!=null && control.id!=null) {
						XNR.options[control.id]=control.value;
					}

					// 相关函数
					if(exec && control.fn) {
						for(var iFn=0;iFn<control.fn.length;iFn++) {
							var fn=control.fn[iFn];
							// 没有设置参数的话，设置一个空的参数集，方便后面处理
							if(!fn.args) {
								fn.args=[];
							}
							if(fn.fire==null || (typeof fn.fire=="boolean" && node.val()==fn.fire)) {
								// 符合要求，放入对应功能页面执行序列
								if(!o.page) {
									o.page="*";
								}
								var p=o.page.split(",");
								for(var iPage=0;iPage<p.length;iPage++) {
									if(!fnQueue[p[iPage]]) {
										fnQueue[p[iPage]]=[[],[],[],[]];
									}
									fnQueue[p[iPage]][fn.stage].push({name:fn.name,args:fn.args,once:fn.once});
								}
							} else if(fn.fire==="trigger" && node.val()) {
								// 只在trigger指定的事件触发时执行
							} else if(typeof fn.fire=="string" && fn.fire!="trigger") {
								// 参数中可能有本地参数@xxxx，需要转换。
								localTriggers.push({fn:fn,target:node});
							} else {
								continue;
							}
							// 其他节点触发事件
							if(fn.trigger) {
								if(!o.page) {
									o.page="*";
								}
								var p=o.page.split(",");
								for(var iPage=0;iPage<p.length;iPage++) {
									if(!fnQueue[p[iPage]]) {
										fnQueue[p[iPage]]=[[],[],[],[]];
									}
									fnQueue[p[iPage]][fn.stage].push({name:fn.name,args:fn.args,trigger:fn.trigger});
								}
							}
						}
					}
				}
			} else {
				// 选项组
				if(o.text) {
					var node=$("@div").add($("@span").text(o.text)).addTo(block);
					if(o.info) {
						$("@span").attr({tooltip:o.info,"class":"info"}).addTo(node);
					}
					if(o.warn) {
						$("@span").attr({tooltip:o.warn,"class":"warn"}).addTo(node);
					}
				}
				var group={};
				var table=$("@tbody").addTo($("@table").attr("class","group").addTo(block));
				for(var i=0;i<o.ctrl.length;) {
					var tr=$("@tr").addTo(table);
					for(var j=0;j<o.column;j++,i++) {
						var item=o.ctrl[i];
						var td=$("@td").addTo(tr);
						if(i<o.ctrl.length) {
							// 如果控件值已保存，用保存的值替代默认值
							if(o.id && savedOptions[o.id]!=null && savedOptions[o.id][item.id]!=null) {
								item.value=savedOptions[o.id][item.id];
							}
							var text=item.text.split("##");
							if(text[0]) {
								$("@label").attr("for",o.id+"_"+item.id).text(text[0]).addTo(td);
							}
							// 生成控件节点
							var node=null;
							switch(item.type || "check") {
								case "check":
									node=$("@input").attr("type","checkbox");
									break;
								case "hidden":
									break;
								case "input":
									node=$("@input");
									break;
								case "edit":
									node=$("@textarea");
									break;
								case "button":
									node=$("@button");
									break;
								case "label":
									node=$("@span");
									break;
							}
							if(node) {
								node.val(item.value);
								node.attr({id:o.id+"_"+item.id,style:(item.style || "")});
								node.addTo(td);
								// 输入验证
								if(item.verify) {
									node.attr("verify",JSON.stringify(control.verify));
								}
							}
							if(item.value!=null) {
								group[item.id]=item.value;
							}
							if(text[1]) {
								$("@label").attr("for",o.id+"_"+item.id).text(text[1]).addTo(td);
							}
						}
					}
				}
				XNR.options[o.id]=group;
			}
			// 为主控件（仅明确指定的）添加值切换相应事件
			if(o.master!=null) {
				// block下只有一层，滤掉所有的label就是所有控件，选出对应序号的即可
				var target=block.find("*:not(label)").eq(o.master);
				// 做个标记，用在点击选项菜单取消按钮重置选项时
				target.attr("master","true");
				$master(target);
				// 主控件值改变只可能checkbox/input/textarea三种。click和keyup足够应付
				target.bind("click,keyup",function(evt) {
					$master($(evt.target));
				});
			}

			if(block.heirs()!=0) {
				page.add(block);
			}
		}
		// 将生成的页面div放入optionPages数组，方便后面加入到菜单
		categoryPages.push(page.css("display","none").get());
	}

	// 检查执行队列中的参数，如果是@开头就替换成对应选项值
	for(var iPage in fnQueue) {
		for(var iStage=0;iStage<4;iStage++) {
			for(var i=0;i<fnQueue[iPage][iStage].length;i++) {
				var fn=fnQueue[iPage][iStage][i];
				if(!fn.args) {
					continue;
				}
				for(var iArg=0;iArg<fn.args.length;iArg++) {
					if(typeof fn.args[iArg]=="string" && fn.args[iArg].charAt(0)=="@") {
						fn.args[iArg]=XNR.options[fn.args[iArg].substring(1)];
					}
				}
			}
		}
	}

	$debug("#0",1);
	// 执行优先级为0的函数
	for(var iPage in fnQueue) {
		if(iPage=="*" || $page(iPage)) {
			for(var i=0;i<fnQueue[iPage][0].length;i++) {
				var fn=fnQueue[iPage][0][i];
				if(fn.trigger) {
					// 触发器
					for(var t in fn.trigger) {
						// 将fn包在一个匿名函数中确保事件触发时能得到对应的fn
						(function(func) {
							(function() {
								var node=$(t);
								// 对象尚未存在
								if(node.empty()) {
									setTimeout(arguments.callee,500);
									return;
								}
								node.bind(func.trigger[t],function(evt) {	
									try {
										var args=func.args.slice(0);
										args[0]=evt;
										$debug("^~",3,func.name);
										func.name.apply(null,args);
										$debug("$~",3,func.name);
									} catch(ex) {
										$error(func.name,ex);
									}
								});
							})();
						})(fn);
					}
				} else {
					// 一般功能
					$debug("^",1,fn.name);
					try {
						fn.name.apply(null,fn.args);
						fn.name.rf=true;
					} catch(ex) {
						$error(fn.name,ex);
					}
					$debug("$",1,fn.name);
				}
			}
		}
	}

	// 设置本地触发
	for(var i=0;i<localTriggers.length;i++) {
		var t=localTriggers[i];
		var fn=t.fn;
		// fn.args[0]将会被事件对象占用，从1开始检查
		for(var iArg=1;iArg<fn.args.length;iArg++) {
			if(typeof fn.args[iArg]=="string" && fn.args[iArg].charAt(0)=="@") {
				fn.args[iArg]=XNR.options[fn.args[iArg].substring(1)];
			}
		}
		// 将fn包在一个匿名函数中确保事件触发时能得到对应的fn
		(function(func) {
			t.target.bind(func.fire,function(evt) {
				func.args[0]=evt;
				func.name.apply(null,func.args);
			});
		})(fn);
	}

	//  选项对话框及在导航栏上的入口菜单，不在frame中创建
	if (window.self == window.top || window.top.location.host.indexOf("renren.com") < 0) {
		// 支持环境的图标
		var icons_gm='data:image/png;base64,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%3D';
		var icons_fx='data:image/png;base64,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';
		var icons_chrome='data:image/png;base64,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%3D';
		var icons_safari='data:image/png;base64,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%3D';
		var icons_opera='data:image/png;base64,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%3D';
		// 生成选项菜单
		var menuHTML='<style type="text/css">.xnr_op{width:500px;position:fixed;z-index:200000;color:black;font-size:12px;background:rgba(0,0,0,0.5);padding:10px;-moz-border-radius:8px;border-radius:8px}.xnr_op *{padding:0;margin:0;line-height:normal}.xnr_op h1{font-size:18px;font-weight:bold}.xnr_op a{color:#3B5990}.xnr_op table{width:100%;border-collapse:collapse}.xnr_op .title{padding:4px;background:#3B5998;color:white;text-align:center;font-size:12px;-moz-user-select:none;-khtml-user-select:none;cursor:default}.xnr_op .btns{background:#F0F5F8;text-align:right;border-top:1px solid lightgray}.xnr_op .btns>input{border-style:solid;border-width:1px;padding:2px 15px;margin:3px;font-size:13px;cursor:pointer}.xnr_op .ok{background:#5C75AA;color:white;border-color:#B8D4E8 #124680 #124680 #B8D4E8}.xnr_op .ok:active{border-color:#124680 #B8D4E8 #B8D4E8 #124680}.xnr_op .cancel{background:#F0F0F0;border-color:white #848484 #848484 white;color:black}.xnr_op .cancel:active{border-color:#848484 white white #848484}.xnr_op .options{height:300px;background:#FFFFFA;clear:both}.xnr_op .category{width:119px;border-right:1px solid lightgray;overflow-x:hidden;overflow-y:auto;height:300px;float:left}.xnr_op li{list-style-type:none}.xnr_op .category li{cursor:pointer;height:30px;overflow:hidden}.xnr_op .category li:hover{background:#ffffcc;color:black}.xnr_op li:nth-child(2n){background:#EEEEEE}.xnr_op li.selected{background:#748AC4;color:white}.xnr_op .category span{left:10px;position:relative;font-size:14px;line-height:30px}.xnr_op .pages{width:380px;margin-left:120px}.xnr_op .p{overflow:auto;height:280px;padding:10px}.xnr_op .p>div{min-height:19px;padding:2px 0;width:100%}.xnr_op .p>div *{vertical-align:middle}.xnr_op .group{margin-left:5px;margin-top:3px;table-layout:fixed}.xnr_op .group td{padding:2px 0}.xnr_op input[type="checkbox"]{margin-right:4px;cursor:pointer}.xnr_op button{background-color:#EFEFEF;background:-moz-linear-gradient(top,#FDFCFB,#E7E2DB);background:-o-linear-gradient(top,#FDFCFB,#E7E2DB);background:-webkit-gradient(linear,0 0,0 100%,from(#FDFCFB),to(#E7E2DB));color:black;border-color:#877C6C #A99D8C #A99D8C;border-width:1px;border-style:solid;-moz-border-radius:3px;border-radius:3px;font-size:12px;padding:'+(XNR.acore==GECKO?1:3)+'px}.xnr_op button:hover:not([disabled]){background-color:#CCC4B9;background:-moz-linear-gradient(top,#FDFCFB,#CCC4B9);background:-o-linear-gradient(top,#FDFCFB,#CCC4B9);background:-webkit-gradient(linear,0 0,0 100%,from(#FDFCFB),to(#CCC4B9))}.xnr_op button[disabled]{color:grey}.xnr_op button:active:not([disabled]){background:#C1BDB6;background:-moz-linear-gradient(top,#C1BDB6,#CCC4B9);background:-o-linear-gradient(top,#C1BDB6,#CCC4B9);background:-webkit-gradient(linear,0 0,0 100%,from(#C1BDB6),to(#CCC4B9))}.xnr_op label{color:black;font-weight:normal;cursor:pointer}.xnr_op label[for=""]{cursor:default}.xnr_op .p span{cursor:default}.xnr_op span[tooltip]{margin:0 2px;height:16px;width:16px;display:inline-block;cursor:help}.xnr_op span.info{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuUlEQVQ4y2NgoDbQ9upiiK5eznD17sv/yDi2ajlYDi9wSZ+NoREdu2bNxa7ZJnkWXHPepH1YMUzeNnU6prPRNaMDdEOU3boRBoSWLWXApxmbIRHlyxAG4LIdFx+mHqcByBifNwgagE0zWQbgig24AWFogUgIgxNW7QpEIIKiBJsr8DlfxXMSalpwTpuJPyFN2ItIjXlzsKdGx9h2gknZLqYFf37gktJmCM2dhGFQaE4/A6eYKtUzLwMAfM0C2p5qSS4AAAAASUVORK5CYII%3D")}.xnr_op span.warn{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1ElEQVQ4y2NgoCVYz8BgsJyBwYQszUCNsv8ZGP6D8FIGBlWSDYBphmGSNC9jYNAGabqUkvL/cmYm2IAlDAympNsOA6S4YjUDgxVI8dX8fLj+6+XlYAPWsbB4kGQ7hMtAvCvWsrN7gxRdq6jAMOBWSwvYgE1sbJFE+x3FBUiuaGBgYMKp+Xpz839c4P7UqWA1QJfmomgGmYgR8thcgOSKmQwMrBi23+js/E8IPJ47FyNAudBTHbEY7gJjBgbdDgaG7k4GhqmEcDcDw2Qg7ogA5hWq5FgAlMwfVWL5pDoAAAAASUVORK5CYII%3D")}.xnr_op input:not([type]){border-width:1px;border-style:solid;-moz-border-radius:3px;border-radius:3px;padding:1px;border-color:#877C6C #A99D8C #A99D8C}.xnr_op input:not([type]):focus{border-color:#3A6389}.xnr_op textarea{resize:none;-moz-resize:none}.xnr_op .fp{text-align:center;vertical-align:middle;width:400px;height:300px;display:table-cell}.xnr_op .fp>*{padding:5px}.xnr_op .icons>a{margin:8px}.xnr_op .icons img{width:29px}.xnr_op .icons img:hover{-webkit-transform:scale(1.1);-moz-transform:scale(1.1);-o-transform:scale(1.1)}</style>';
		menuHTML+='<div class="title">改造选项</div><div class="options"><div class="category"><ul>'+categoryHTML+'</ul></div><div class="pages"><div class="fp"><h1>人人网改造器 '+XNR.version+'</h1><p><b>Copyright © 2008-2012</b></p><p><a href="mailto:xnreformer@gmail.com">xnreformer@gmail.com</a></p><p><a href="http://xiaonei-reformer.googlecode.com/" target="_blank">项目主页</a></p><p class="icons"><a href="http://userscripts.org/scripts/show/45836" title="GreaseMonkey脚本" target="_blank"><img src="'+icons_gm+'"/></a><a href="https://chrome.google.com/extensions/detail/bafellppfmjodafekndapfceggodmkfc" title="Chrome/Chromium扩展" target="_blank"><img src="'+icons_chrome+'"/></a><a href="https://addons.mozilla.org/firefox/addon/162178" title="Firefox扩展" target="_blank"><img src="'+icons_fx+'"/></a><a href="http://code.google.com/p/xiaonei-reformer/downloads/list" title="Safari扩展" target="_blank"><img src="'+icons_safari+'"/></a><a href="http://code.google.com/p/xiaonei-reformer/downloads/list" title="Opera用户脚本" target="_blank"><img src="'+icons_opera+'"/></a></p></div></div></div><div class="btns"><input type="button" value="确定" class="ok"/><input type="button" value="取消" class="cancel"/></div>';
	
		var menu=$("@div").attr("class","xnr_op").css("display","none").html(menuHTML).addTo(document);
		// 添加类别页，绑定提示信息事件
		menu.find(".pages").add($(categoryPages)).bind("mouseover",function(evt) {
			var t=$(evt.target);
			const tag="optionsMenu_tooltip";
			if($allocated(tag)) {
				$alloc(tag).remove();
				$dealloc(tag);
			}
			if(!t.attr("tooltip")) {
				return;
			}
			evt.stopPropagation();
			var rect=t.rect();
			var tip=$alloc(tag,$("@div").css({maxWidth:"300px",background:"#FFFFBF",border:"1px solid #CFCF3D",position:"fixed",zIndex:"200001",padding:"6px 8px 6px 8px",fontSize:"13px",left:(rect.right+3)+"px","top":(rect.bottom+3)+"px","word-wrap":"break-word"}));
			var text=evt.target.getAttribute("tooltip").split("\n");
			for(var i=0;i<text.length;i++) {
				$("@div").text(text[i]).addTo(tip);
			}
			tip.addTo(document);
		},true);
	
		// 点击分类切换事件
		menu.find(".category ul").bind("click",function(evt) {
			var t=$(evt.target);
			if(t.prop("tagName")=="SPAN") {
				t=t.superior();
			}
			menu.find(".pages>div").hide().eq(t.index()+1).show();
			menu.find(".category li.selected").removeClass("selected");
			t.addClass("selected");
		});
	
		// 点击取消按钮事件
		menu.find(".cancel").bind("click",function(evt) {
			menu.hide();
			// 重置选项
			for(var op in XNR.options) {
				if(typeof XNR.options[op]=="object") {
					// 选项组
					var group=XNR.options[op];
					for(var item in group) {
						var c=menu.find("#"+item);
						if(c.empty()) {
							continue;
						} else {
							c.val(group[item]);
						}
					}
				} else { 
					var c=menu.find("#"+op);
					if(c.empty()) {
						continue;
					} else {
						switch(c.attr("fmt")) {
							case "date":
								c.val($formatDate(XNR.options[op]));
								break;
							default:
								c.val(XNR.options[op]);
								break;
						}
					}
					// 主控件还要重置禁用效果
					if(c.attr("master")) {
						$master(c);
					}
				}
			}
		});
	
		// 点击保存按钮事件
		menu.find(".ok").bind("click",function(evt) {
			// 先进行验证
			var pass=true;
			menu.find("*[verify]:not([disabled])").each(function() {
				var node=$(this);
				var rules=JSON.parse(node.attr("verify"));
				for(var rule in rules) {
					if(!node.val().match(new RegExp(rule))) {
						// 转到对应的页面
						var page=node;
						while(page.superior().prop("className")!="pages") {
							page=page.superior();
						}
						var index=page.index()
						menu.find(".pages>div").hide().eq(index).show();
						menu.find(".category li").removeClass("selected").eq(index-1).addClass("selected");
	
						window.alert(rules[rule]);
						this.focus();
						pass=false;
						return false;
					}
				}
			});
			if(!pass) {
				return;
			}
	
			for(var op in XNR.options) {
				if(typeof XNR.options[op]=="object") {
					// 选项组
					var group=XNR.options[op];
					var changed=false;
					for(var item in group) {
						var c=menu.find("#"+op+"_"+item);
						if(c.empty() || c.prop("disabled")==true) {
							continue;
						} else {
							var newValue=c.val();
							if(group[item]!=newValue) {
								changed=true;
								group[item]=newValue;
							}
						}
					}
					if(changed) {
						$save(op,group);
					}
				} else {
					var c=menu.find("#"+op);
					if(c.empty() || c.prop("disabled")==true || c.attr("fmt")) {
						continue;
					} else {
						var newValue=c.val();
						// 只保存修改了的
						if(XNR.options[op]!=newValue) {
							$save(op,newValue);
						}
					}
				}
			}
			document.location.reload();
		});
	
		// 增加拖动效果。。。（有意思吗？）
		menu.find("div.title").bind("mousedown",function(evt) {
			// 只准左键拖
			if(evt.button!=0) {
				return;
			}
			var move=$alloc("drag_optionMenu");
			var menuRect=menu.rect();
			move.x=evt.clientX-menuRect.left;
			move.y=evt.clientY-menuRect.top;
			evt.target.style.cursor="move";
			$(document).css("-khtml-user-select","none");
		},true).bind("mouseup",function(evt) {
			if($allocated("drag_optionMenu")) {
				$dealloc("drag_optionMenu");
				evt.target.style.cursor=null;
				$(document).css("-khtml-user-select","");
			}
		},true);
		$(document).bind("mousemove",function(evt) {
			if($allocated("drag_optionMenu")) {
				var move=$alloc("drag_optionMenu");
				menu.css({left:(evt.clientX-move.x)+"px",top:(evt.clientY-move.y)+"px"});
			}
		},true);

		var entry=$("@div").attr("class","menu xnr_opt").add($("@div").attr("class","menu-title").add($("@a").attr({href:"javascript:;",onclick:"return false;"}).text("改造")));
		entry.find("a").bind("click",function() {
			menu.show().css({"top":parseInt(window.innerHeight-menu.prop("offsetHeight"))/2+"px","left":parseInt(window.innerWidth-menu.prop("offsetWidth"))/2+"px"});
			// 进行设置的提醒已经没必要了
			$("#xnr_optip").remove();
		});
	}

	// 执行剩下三个优先级的函数
	for(var p=1;p<=3;p++) {
		$wait(p,function (stage) {
			$debug("#"+stage,1);
			if(stage==2) {
				if (window.self == window.top || window.top.location.host.indexOf("renren.com") < 0) {
					// 添加菜单入口项在页面DOM构建完毕后执行
					entry.addTo($(".nav-body .nav-other"),0);
				}
				// 确保css补丁块在页面最后，至少是在body之后
				if($allocated("css_block")) {
					$alloc("css_block").addTo(document);
				} else {
					$alloc("css_block",$("@div").addTo(document));
				}
			}
			for(var iPage in fnQueue) {
				if(iPage!="*" && !$page(iPage)) {
					continue;
				}
				for(var i=0;i<fnQueue[iPage][stage].length;i++) {
					var fn=fnQueue[iPage][stage][i];
					if(fn.trigger) {
						// 触发器
						for(var t in fn.trigger) {
							// 将fn包在一个匿名函数中确保事件触发时能得到对应的fn
							(function(func) {
								(function() {
									var node=$(t);
									// 对象尚未存在
									if(node.empty()) {
										setTimeout(arguments.callee,500);
										return;
									}
									node.bind(func.trigger[t],function(evt) {	
										try {
											var args=func.args.slice(0);
											args[0]=evt;
											$debug("^~",3,func.name);
											func.name.apply(null,args);
											$debug("$~",3,func.name);
										} catch(ex) {
											$error(func.name,ex);
										}
									});
								})();
							})(fn);
						}
					} else {
						// 一般功能
						$debug("^",1,fn.name);
						try {
							fn.name.apply(null,fn.args);
							fn.name.rf=true;
						} catch(ex) {
							$error(fn.name,ex);
						}
						$debug("$",1,fn.name);
					}
				}
			}
		});
	}

	$wait(1,function() {
		var eventId="XNR"+parseInt(parseInt(Math.random()*10000));
		const code="if(window.asyncHTMLManager){"+
			"window.asyncHTMLManager.addEvent('load',function(){"+
				"var evt=document.createEvent('HTMLEvents');"+
				"evt.initEvent('"+eventId+"',true,true);"+
				"document.documentElement.dispatchEvent(evt)"+
			"})"+
		"}";
		$script(code);
		$(document).bind(eventId,function(evt) {
			evt.stopPropagation();
			XNR.url=document.location.href;

			$debug("async @ "+XNR.url,2);

			for(var p=0;p<=3;p++) {
				for(var iPage in fnQueue) {
					if(iPage=="*" || !$page(iPage)) {
						continue;
					}
					for(var i=0;i<fnQueue[iPage][p].length;i++) {
						var fn=fnQueue[iPage][p][i];
						if(fn.trigger) {
							// 触发器
							for(var t in fn.trigger) {
								// 将fn包在一个匿名函数中确保事件触发时能得到对应的fn
								(function(func) {
									$(t).bind(func.trigger[t],function(evt) {	
										try {
											var args=func.args.slice(0);
											args[0]=evt;
											$debug("^=~",3,fn.name);
											func.name.apply(null,args);
											$debug("$=~",3,fn.name);
										} catch(ex) {
											$error(func.name,ex);
										}
									});
								})(fn);
							}
						} else {
							if(fn.once && fn.name.rf) {
								// 已经执行过了
								continue;
							}
							// 一般功能
							$debug("^=",2,fn.name);
							try {
								fn.name.apply(null,fn.args);
								fn.name.rf=true;
							} catch(ex) {
								$error(fn.name,ex);
							}
							$debug("$=",2,fn.name);
						}
					}
				}
			}
		},true);
	});
};

/* 以下是基本辅助函数，所有函数以$开头 */

/*
 * 读取cookie
 * 参数
 *   [String]name:cookie名
 *   [String]def:当name不存在时的返回值，默认为""
 * 返回值
 *   [String]cookie值
 */
function $cookie(name,def) {
	var cookies=document.cookie.split(';');
	name=escape(name);
	for(var i=0;i<cookies.length;i++) {
		var c=cookies[i].replace(/^ +/g,"");
		if(c.indexOf(name+"=")==0) {
			return unescape(c.substring(name.length+1,c.length));
		}
	}
	return def || "";
};

/*
 * 判断URL是否属于某一类页面
 * 参数
 *   [String]category:页面类别，可能的值参考函数内pages常量
 *   [String]url:默认为当前页面地址
 * 返回值
 *   [Boolean]:属于返回true，否则false。如果category非法，返回false。
 */
function $page(category,url) {
	const pages={
		home:"renren\\.com/\\d+$|renren\\.com/\\d+[#?]|/[a-zA-Z0-9\\-]{5,}\\.renren\\.com/|guide\\.renren\\.com/[Gg]uide",	// 首页，后面的是新注册用户的首页
		feed:"renren\\.com/\\d+$|renren\\.com/\\d+[#?]|/guide\\.renren\\.com/[Gg]uide#?$|#/guide",	// 首页新鲜事，后面的是新注册用户的首页
		profile:"renren\\.com/[Pp]rofile|renren\\.com/[^/]+/[Pp]rofile|/[a-zA-Z0-9_\\-]{5,}\\.renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren.com/\\?id=|/[a-zA-Z0-9_]{5,}\\.renren.com/\\?.*&id=|[a-zA-Z0-9_]{5,}\\.renren\\.com/innerProfile|renren\\.com/[a-zA-Z0-9_]{6,20}$", // 个人主页，最后一个是个人网址。http://safe.renren.com/personal/link/
		blog:"/blog\\.renren\\.com/|#//blog/|#!//blog/",	// 日志
		forum:"/club\\.renren\\.com/",	// 论坛
		lover:"/lover\\.renren\\.com/",	// 情侣空间
		lover_blog:"/lover\\.renren\\.com/note/",	// 情侣空间日志
		pages:"/page\\.renren\\.com/",	// 公共主页
		page_home:"/page\\.renren\\.com/[^/]+$|page\\.renren\\.com/[^/]+\\?|/page\\.renren\\.com/[^/]+/index",	// 公共主页首页 FIXME 准确否??
		page_blog:"/page\\.renren\\.com/[^/]+/note/\\d+",	// 公共主页日志
		status:"/status\\.renren\\.com/|#//status/|#!//status/",	// 状态
		photo:"/photo\\.renren\\.com/getphoto\\.do|/photo\\.renren\\.com/gettagphoto\\.do|/photo\\.renren\\.com/photo/sp/|/photo\\.renren\\.com/photo/[0-9]+/photo-|/photo\\.renren\\.com/photo/[0-9]+/[^/]+/photo-|/page\\.renren\\.com/[^/]+/photo/|event\\.renren\\.com/event/[0-9]+/[0-9]+/photo/[0-9]+|lover\\.renren\\.com/photo/",	// 照片
		album:"photo\\.renren\\.com/getalbum|photo\\.renren\\.com/.*/album-[0-9]+|page\\.renren\\.com/.*/album|/photo/album\\?|photo\\.renren\\.com/photo/ap/|event\\.renren\\.com/event/[0-9]+/photos|event\\.renren\\.com/event/[0-9]+/stars|lover\\.renren\\.com/album/",	// 相册
		friend:"/friend\\.renren\\.com/",	// 好友
		share:"/share\\.renren\\.com/|#//share/|#!//share/",	// 分享
		act:"/act\\.renren\\.com/",	// 活动
		request:"/req\\.renren\\.com/",	// 请求
		searchEx:"/browse\\.renren\\.com/searchEx\\.do",	// 搜索结果
		musicbox:"/music\\.renren\\.com/musicbox",	// 人人爱听播放器
		fm:"/music\\.renren\\.com/fm",	// 人人电台
		xiaozu:"/xiaozu\\.renren\\.com/",	// 小组
		gossip:"/gossip\\.renren\\.com/",	// 留言板
		zhan:"/zhan\\.renren\\.com/",	// 小站
	};
	if(!url) {
		url=XNR.url;
	}
	return pages[category]!=null && url.match(pages[category])!=null;
};

/*
 * 申请一个全局对象
 * 参数
 *   [String]name:对象名称，如果同名对象已经被分配，则返回那个对象
 *   [Any]value:预设对象值。可空。仅当同名对象未被分配时有效
 * 返回值
 *   [Object]:对象
 */
function $alloc(name,value) {
	if(XNR.storage[name] != undefined) {
		return XNR.storage[name];
	} else {
		if(value==undefined) {
	 		XNR.storage[name]=new Object();
		} else {
	 		XNR.storage[name]=value;
		}
		return XNR.storage[name];
	}
};

/*
 * 判断是否已经分配了同名对象
 * 参数
 *   [String]name:对象名称，可以为空
 * 返回值
 *   [Boolean]:是否已经分配
 */
function $allocated(name) {
	return XNR.storage[name]!=undefined;
};


/*
 * 解除全局对象分配
 * 参数
 *   [String]name:对象名称
 * 返回值
 *   无
 */
function $dealloc(name) {
	delete XNR.storage[name];
};

/*
 * 弹出提示窗口
 * 参数
 *   [String]title:窗口标题
 *   [String]content:内容，HTML代码
 *   [String]geometry:位置尺寸。标准X表示法，宽x高+x+y，高是自动计算，忽略输入值。默认200x0+5-5
 *   [Number]stayTime:停留时间，以秒计算
 *   [Nember]popSpeed:弹出速度，以像素计算。为每timeout毫秒弹出的高度
 * 返回值
 *   [PageKit]:弹出窗口
 */
function $popup(title,content,geometry,stayTime,popSpeed) {
	const timeout=50;
	var node=$("@div").css({position:"fixed",backgroundColor:"#F0F5F8",border:"1px solid #B8D4E8",zIndex:100000,overflow:"hidden"});

	var geo=/^(\d+)x\d+([+-]?)(\d*)([+-]?)(\d*)$/.exec(geometry);
	if(!geo) {
		geo=["","200","+","5","-","5"];
	}
	node.css("width",(geo[1]=="0"?"auto":geo[1]+"px")).css((geo[2] || "+")=="+"?"left":"right",(geo[3] || "0")+"px").css((geo[4] || "-")=="+"?"top":"bottom",(geo[5] || "0")+"px");
	var closeLink=$("@a").css({cssFloat:"right",fontSize:"x-small",color:"white",cursor:"pointer"}).text("关闭").bind("click",function() {
		node.remove();
	});
	node.add($("@div").text((title || "提示")).add(closeLink).css({background:"#526EA6",color:"white",fontWeight:"bold",fontSize:"normal",padding:"3px"}));
	node.add($("@div").css("margin","5px").html(content)).addTo(document.body);

	var maxHeight=parseInt(node.prop("clientHeight"));
	node.css("height","0px");
	// 展开
	setTimeout(function () {
		try {
			var h=parseInt(node.css("height"));
			if(h<maxHeight) {
				var diff=maxHeight-h;
				node.css("height",(h+(diff>popSpeed?popSpeed:diff))+"px");
				setTimeout(arguments.callee,timeout);
			} else {
				// 收起
				setTimeout(function () {
					try {
						var h=parseInt(node.css("height"));
						if(h<=0) {
							node.remove();
						} else {
							node.css("height",(h>popSpeed?h-popSpeed:0)+"px");
							setTimeout(arguments.callee,timeout);
						}
					} catch(ex) {
					}
				},stayTime*1000);
				closeLink.text("关闭("+stayTime+")");
				var timer=setInterval(function() {
					if(!node || stayTime<=0) {
						clearInterval(timer);
					} else {
						stayTime--;
						closeLink.text("关闭("+stayTime+")");
					}
				},1000);
			}
		} catch(ex) {
		}
	},timeout);
	return node;
};

/*
 * 尽量在特定的时机执行
 * 参数
 *   [Number]stage：目标时机。0：DOM创建前。1&2：DOM创建后（DOMContentLoaded）。3：页面加载完毕后（load）
 *   [Function]func：执行的函数，执行时将被传入优先级作为参数
 * 返回值
 *   无
 */
function $wait(stage,func) {
	/*
	 * 页面加载阶段测试：test3.html
	 * Firefox 3.6.3/3.7a6pre：loading -> interactive -> complete
	 * Chromium 6.0.411.0 (47760)：loading -> loaded -> complete
	 * Safari 5 (7533.16)：loading -> loaded -> complete
	 * Opera 10.54：interactive -> interactive/complete -> complete（对于用户脚本：loading -> complete -> complete，但到达complete后仍然有可能出现interactive）
	 */
	var curStage=3;
	if(XNR.acore==PRESTO) {
		curStage=XNR.loadStage;
		if(curStage==1 && (stage==1 || stage==2)) {
			curStage=stage;
		}
	} else {
		switch(document.readyState) {
			case "loading":
				curStage=0;
				break;
			case "loaded":
			case "interactive":
				if(stage==1 || stage==2) {
					curStage=stage;
				} else {
					curStage=2;
				}
				break;
		}
	}
	if(stage>curStage) {
		// stage>curStage>=0 -> stage>0
		if(stage<3) {
			document.addEventListener("DOMContentLoaded",function() {
				func(stage);
			},false);
		} else {
			window.addEventListener("load",function() {
				func(stage);
			},false);
		}
	} else {
		// 已经错过了/正赶上，立即执行
		func(stage);
	}
};

/*
 * 在浏览器中执行脚本
 * 参数
 *   [String]code:脚本内容
 *   [Boolean]global:不放置于匿名函数
 * 返回值
 *   无
 */
function $script(code,global) {
	if(!code){
		return;
	}
	code="try{"+code+"}catch(ex){};";
	if(!global) {
		// 让脚本以匿名函数方式执行
		code="(function(){"+code+"})();";
	}
	// 如果用location方法，会发生各种各样奇怪的事。比如innerHTML失灵。。。万恶的webkit
	$("@script").text(code).addTo(document).remove();
};

/*
 * 改变页面样式
 * 参数
 *   [String]style:CSS语句
 * 返回值
 *   [PageKit]:创建的style节点
 */
function $patchCSS(style) {
	if($allocated("css_block")) {
		var p=$alloc("css_block");
	} else {
		var p=$alloc("css_block",$("@div").addTo(document));
	}
	// 永远保持在最后
	p.addTo(document);
	return $("@style").attr("type","text/css").text(style).addTo(p);
};

/*
 * 删除对象，并禁止显示
 * 参数
 *   [String]style:CSS选择语句
 * 返回值
 *   无
 */
function $ban(style) {
	$patchCSS(style+"{display:none !important}");
	$wait(1,function() {
		$(style).remove();
	});
};

/*
 * 保存选项。实际是保存XNR.options
 * 参数
 *   [String]name:选项名或选项值集合
 *   [String/Number/Boolean]value:值
 * 返回值
 *   无
 */
function $save(name,value) {
	if(name) {
		// 当name无效时，仅将当前设置保存
		XNR.options[name]=value;
	}
	var opts=JSON.stringify(XNR.options);
	switch(XNR.agent) {
		case USERSCRIPT:
			GM_setValue("xnr_options",opts);
			break;
		case FIREFOX:
			XNR_save(opts);
			break;
		case CHROME:
			chrome.extension.sendRequest({action:"save",data:opts});
			break;
		case SOGOU:
			sogouExplorer.extension.sendRequest({action:"save",data:opts});
			break;
		case SAFARI:
			safari.self.tab.dispatchMessage("xnr_save",opts);
			break;
		case OPERA_UJS:
			XNR.scriptStorage["xnr_options"]=opts;
			break;
		case OPERA_EXT:
			XNR.oexSendRequest({action:"save",data:opts});
	}
};

/*
 * 发送HTTP请求。支持跨域。Chrome/Safari跨域还需要配置权限。
 * 参数
 *   [String]url:页面地址
 *   [Function]func:回调函数。function(pageText,url,data){}。如果发生错误，pageText为null
 *   [Any]userData:额外的用户数据。可选。
 *   [String]method:请求方法。可选，默认为GET。
 * 返回值
 *   无
 */
function $get(url,func,userData,method) {
	if(!method) {
		method="GET";
	}
	if(method=="POST" && url.indexOf("renren.com") > 0) {
		// XN.get_check & XN.get_check_x
		var reqToken = $("input[type='hidden'][name='requestToken']").val();
		var rtk = $("input[type='hidden'][name='_rtk']").val();
		if(rtk && url.indexOf("_rtk=")==-1) {
			url+=(url.indexOf("?")==-1?"?":"&");
			url+="_rtk="+rtk;
		}
		if(reqToken && url.indexOf("requestToken=")==-1) {
			url+="&requestToken="+reqToken;
		}
	}
	switch(XNR.agent) {
		case FIREFOX:
			// 不能直接使用window.XMLHttpRequest，会被noscript阻挡
			XNR_get(window,url,func,userData,method);
			break;
		case USERSCRIPT:
			if(func!=null) {
				GM_xmlhttpRequest({method:method,url:url,onload:function(o) {
					func.call(window,(o.status==200?o.responseText:null),url,userData);
				},onerror:function(o) {
					func.call(window,null,url,userData);
				}});
			} else {
				GM_xmlhttpRequest({method:method,url:url});
			}
			break;
		case CHROME:
			if(func==null) {
				chrome.extension.sendRequest({action:"get",url:url,method:method});
			} else {
				chrome.extension.sendRequest({action:"get",url:url,method:method},function(response) {
					func.call(window,response.data,url,userData);
				});
			}
			break;
		case SOGOU:
			if(func==null) {
				sogouExplorer.extension.sendRequest({action:"get",url:url,method:method});
			} else {
				sogouExplorer.extension.sendRequest({action:"get",url:url,method:method},function(response) {
					func.call(window,response.data,url,userData);
				});
			}
			break;
		case SAFARI:
			// 在safari 5.1.x中，如果请求发送自扩展，无法同时发送对应页面已有的cookie
			// 所以只能尝试使用人人网自己的ajaxproxy跨域机制
			var domain=url.match(".*?://[^/]+")[0];
			if (/renren\.com$/.test(domain)) {
				var requestId="xnr_ajax_"+parseInt(Math.random()*1000000);
				var dataDiv=$("@div").attr({"style":"display:none","id":requestId+"_response","url":url}).addTo(document);
				var code="var count=0;"+
					"(function(){"+
						"if(!window.XN || !XN.net || !XN.net.xmlhttp){"+
							"if(count<20){"+
								"setTimeout(arguments.callee, 300);"+
								"count++;"+
							"}else{"+
								"ajaxagent('null')"+
							"}"+
							"return;"+
						"}"+
						"try{"+
							"new XN.net.xmlhttp({"+
								"url:document.getElementById('"+requestId+"_response').getAttribute('url'),"+
								"method:'"+method+"',"+
								"onSuccess:function(r){"+
									"if(r.readyState==4){"+
										"ajaxagent(r.status==200?r.responseText:'null')"+
									"}"+
								"},"+
								"onError:function(r){"+
									"ajaxagent('null')"+
								"}"+
							"});"+
						"}catch(ex){"+
							"ajaxagent('null')"+
						"}"+
						"function ajaxagent(content){"+
							"document.getElementById('"+requestId+"_response').textContent=content;"+
							"var evt=document.createEvent('HTMLEvents');"+
							"evt.initEvent('"+requestId+"',true,true);"+
							"document.documentElement.dispatchEvent(evt)"+
						"}"+
					"})()";
				$(document).bind(requestId, function(){
					$(document).unbind(requestId, arguments.callee, true);
					var text=dataDiv.text();
					dataDiv.remove();
					if (text==="null"){
						func.call(window,null,url,userData);
					} else {
						func.call(window,text,url,userData);
					}
				},true);
				$script(code);
			} else {
				// 由于发送和接收消息是分离的，随机ID确保联系
				var requestId=Math.random();
				if(func!=null) {
					safari.self.addEventListener("message",function(msg) {
						if(msg.name=="xnr_get_data" && msg.message.id==requestId) {
							safari.self.removeEventListener("message",arguments.callee,false);
							func.call(window,msg.message.data,url,userData);
						}
					},false);
				}
		    	safari.self.tab.dispatchMessage("xnr_get",{id:requestId,url:url,method:method});
			}
			break;
		case OPERA_UJS:
			try {
				var httpReq=new window.opera.XMLHttpRequest();
			} catch(ex) {
				$error("$get","未安装跨域支持脚本，使用非跨域模式");
				var httpReq=new window.XMLHttpRequest();
			}
			if (func!=null) {
				httpReq.onload=function() {
					func.call(window,(httpReq.status==200?httpReq.responseText:null),url,userData);
				};
				httpReq.onerror=function(e) {
					func.call(window,null,url,userData);
				};
			}
			httpReq.open(method,url,true);
			try {
				httpReq.send();
			} catch(ex) {
				$error("$get",ex);
				if (func!=null) {
					func.call(window,null,url,userData);
				}
			}
			break;
		case OPERA_EXT:
			var req={action:"get",url:url,method:method};
			if(func==null) {
				XNR.oexSendRequest(req);
			} else {
				XNR.oexSendRequest(req,function(response) {
					func.call(window,response,url,userData);
				});
			}
			break;
	} 
};

/*
 * 记录错误信息
 * 参数
 *   [String/Function]func:发生错误的函数(名)
 *   [Object/String]error:异常对象或异常信息
 * 返回值
 *   无
 */
function $error(func,error) {
	if(typeof func=="function") {
		func=/function (.*?)\(/.exec(func.toString())[1];
	}
	var msg="";
	if(typeof error=="object") {
		if(error) {
			if(error.name!=null) {
				msg="错误名称："+error.name+"\n";
			}
			if(error.message!=null) {
				msg+="错误信息："+error.message+"\n";
			}
		}
		msg+="\n";
	} else {
		msg=error.toString();
	}
	if(msg) {
		var log = "在 "+func+"() 中发生了一个错误。\n"+msg;
		if(XNR.agent==FIREFOX) {
			XNR_log(log);
		} else if(XNR.agent==USERSCRIPT) {
			GM_log(log);	// Firefox 3.6 has no console.log
		} else {
			console.log(log);
		}
		var board=$(".xnr_op #diagnosisInfo");
		if(board.exist()) {
			board.val(board.val()+msg);
		}
	}
};

/*
 * 输出调试信息
 * 参数
 *   [String]msg:调试信息
 *   [Number]level:信息等级
 *   [Function]func:所在函数,可选
 * 返回值
 *   无
 */
function $debug(msg,level,func) {
	if(XNR.options.debuglv>level) {
		if(typeof func=="function") {
			func=/function (.*?)\(/.exec(func.toString())[1];
		}
		if(func) {
			msg=func+" "+msg;
		}
		msg="["+new Date().getTime()+"]:"+msg;
		if(XNR.agent==FIREFOX) {
			XNR_log(msg);
		} else if(XNR.agent==USERSCRIPT) {
			GM_log(msg);	// Firefox 3.6 has no console.log
		} else {
			console.log(msg);
		}
	}
};

/*
 * 主控件值改变时的连带禁用效果
 * 参数
 *   [PageKit]master:主控件对象
 * 返回值
 *   无
 */
function $master(master) {
	var p=master.superior();
	if(!master.val()) {
		// 写"*:not(#"+id+")"也可以。但为防止master忘了设置ID。。。
		p.find("*:not([id='"+master.attr("id")+"'])").prop("disabled",true);
	} else {
		p.find("*").prop("disabled",false);
	}
};

/*
 * 判断新鲜事类型
 * 参数
 *   [XNR]feed:新鲜事article节点
 * 返回值
 *   [String]:新鲜事类型文本。无符合的返回""
 */
function $feedType(feed) {
	// 不全，待补完
	var stats=feed.find("a[stats]").attr("stats");
	// 有些没有最后的数字，如保持联络。热门型：hotnewsfeed&sfet=3709&fin=15&ff_id=
	if(stats && (/_\d+_(\d+)_\d+$/.test(stats) || /_\d+_(\d+)_$/.test(stats) || /sfet=(\d+)/.test(stats))) {
		var ntype=parseInt(RegExp.$1);
		var mtype=parseInt(ntype/100);
		switch(mtype) {
			case 0:
				// 评论日志/照片:0
				return "comment";
			case 1:
				// 分享好友:101, 分享日志:102, 分享照片:103, 分享相册:104, 分享链接:107, 分享视频:110
				if(ntype==102) {
					return "share_blog";
				} else if(ntype==103 || ntype==104) {
					return "share_photo";
				} else if(ntype==110) {
					return "share_video";
				} else {
					return "share_other";
				}
			case 2:
				// 论坛发帖:204 小组发帖:209 参加小组:210 小组推荐帖子:213 小组发贴:215,216
				if(ntype==204) {
					return "forum";
				} else if(ntype>=209 && ntype<=216) {
					return "xiaozu";
				}
				break;
			case 4:
				// 赞助商活动广告(？):401
				return "ads";
			case 5:
				// 修改头像:501, 状态:502
				if(ntype==501) {
					return "profile";
				} else if(ntype==502) {
					return "status";
				}
				break;
			case 6:
				// 发表日志:601
				return "blog";
			case 7:
				// 上传1张照片:701, 圈人:702, XX的照片（有注释？）/XXX的照片被XXX评论了 :708, 上传多张照片:709
				if(ntype==702) {
					return "tag";
				} else {
					return "photo";
				}
			case 8:
				// 收到礼物:801, 收到活动礼物(?):802
				return "gift";
			case 10:
				// 今日热点投票:1008
				if(ntype==1008) {
					return "poll";
				}
				break;
			case 11:
				// 位置报到:1101
				return "pos";
			case 12:
				// 成为好友:1201
				return "friend";
			case 15:
				// 看过电影:1502
				return "movie";
			case 18:
				// 成为vip:1801, 更换主页装扮:1804, 上传音乐:1805, 更换大头贴:1808
				if(ntype==1805) {
					return "music";
				} else if(ntype==1808) {
					return "profile";
				} else {
					return "vip";
				}
			case 19:
				// 喜欢(照片？):1901
				return "like";
			case 20:
				// 在公共主页留言:2001, 成为公共主页好友:2002, 分享公共主页日志:2003, 分享公共主页图片:2004, 分享公共分享链接:2005, 分享公共分享视频:2006, 公共主页发状态:2008, 分享公共主页相册:2009, 公共主页发日志:2012, 公共主页发照片:2013, 公共主页改头像:2015, 公共主页发回复:2016, 分享公共主页:2017, 开通情侣空间:2023, 情侣空间发状态:2024, 情侣空间发日志:2025, 情侣空间发照片:2026, 公共主页分享日志:2032, 公共主页分享相册:2036, 公共主页上传照片:2038
				if((ntype>=2003 && ntype<=2006) || ntype==2009 || ntype==2017 || ntype==2032 || ntype==2036) {
					if(ntype==2003 || ntype==2032) {
						return "share_blog";
					} else if(ntype==2004 || ntype==2009 || ntype==2036) {
						return "share_photo";
					} else if(ntype==2006) {
						return "share_video";
					} else {
						return "share_other";
					}
				} else if(ntype>=2023 && ntype<=2026) {
					return "lover";
				} else {
					return "page";
				}
			case 22:
				// 加入俱乐部:2202
				return "club";
			case 23:
				// 发起投票:2301, 参加投票:2303
				return "poll";
			case 24:
				// 添加应用:2401
				return "app";
			case 27:
				// 线上活动:2701
				return "event";
			case 28:
				// 等级提升:2801
				return "levelup";
			case 29:
				// XXX的日志被XXX评论了:2901 XXX的照片被XXX评论了:2902 XXX评论了XXX的日志:2907 XXX评论了XXX的照片:2908 XXX回复了XXX（的日志评论）:2910 XXX回复了XXX（的图片评论）:2911
				return "comment";
			case 37:
				// 小站发布状态:3701 小站分享链接:3702 小站分享视频:3703 小站发布图片:3705 关注小站:3707 小站日志:3708 小站分享小站日志 3709
				return "xiaozhan";
			case 50:
				if(ntype==5030) {
					return "share_video";
				}
				break;
			case 80:
				// 团购/品牌调查等等活动或游戏广告:8002，广告:8004，人人网:8005，保持联络:8006，成为好友:8007
				if(ntype==8006) {
					return "contact";
				} else if(ntype==8007) {
					return "friend";
				} else {
					// 其余都是各类商业活动？
					return "ads";
				}
			case 81:
				if(ntype<=8182 || ntype >= 8190) {
					// 正在玩XX游戏:8181, 正在玩XX游戏:8182, 小小战争广告:8190
					return "ads";
				} else if(ntype==8185) {
					// 连接网站:8185
					return "connect";
				}
				break;
			case 83:
				//在活动中送礼 8302
				return "gift";
			case 86:
				// 人人音乐:8601
				return "music";
		}
	} else if(stats==="NF_People") {
		// 同学XX注册了人人。
		return "newbie";
	}
	return "";
};

/*
 * 从翻页控件（div.pager-nav或div.pager-top）中取得当前页与最后页（序号从0开始）
 * 参数
 *   [HTMLDivElement]pager:翻页控件
 * 返回值
 *   [Object]:{current:当前页,last:最后页}
 */
function $pager(pager) {
	var curpage=0;
	var lastpage=0;
	pager=$(pager);
	if(pager.exist() && pager.find("li").exist()) {
		try {
			curpage=parseInt(pager.find("ol.pagerpro li.current a").text())-1;
			// 在线活动相册的总数是放在注释中的
			var p=pager.find("ol.pagerpro").get();
			for(var i=0;i<p.childNodes.length;i++) {
				if(p.childNodes[i].nodeType==8) {
					if(/共条(\d+)/.test(p.childNodes[i].textContent)) {
						lastpage=parseInt(RegExp.$1)-1;
					}
				}
			}
			if(lastpage<=0) {
				p=pager.clone();
				p.find("ol.pagerpro,ul").remove();
				var text=p.text().replace(/\s/g,"");
				var total=parseInt(/共([0-9]+)/.exec(text)[1])-1;
				if(curpage==0) {
					// 如果当前为第一页，则后一个数值要么是每页项目数，要么是项目总数
					var ipp=parseInt(/[0-9]+-([0-9]+)/.exec(text)[1]);
				} else {
					// 否则前curpage个页面一共有f个项目，可以算出每页项目数
					var f=parseInt(/([0-9]+)-[0-9]+/.exec(text)[1])-1;
					var ipp=f/curpage;
				}
				lastpage=parseInt(total/ipp);
			}
		} catch(ex) {
			$error("$pager",ex);
		}
	}
	return {current:curpage,last:lastpage};
};

/*
 * 格式化日期。如果不是Firefox扩展的安全限制，可以直接作为Date的方法。。。
 * 参数
 *   [Date]d:日期对象
 * 返回值
 *   [String]:yyyy-MM-dd HH:mm:ss格式的文本，出错返回“未知”
 */
function $formatDate(d) {
	if(!(d instanceof Date)) {
		if(d===0) {
			return "未知";
		} else {
			d=new Date(d);
		}
	}
	if(isNaN(d.getTime())) {
		return "未知";
	}
	var formats={
		"y+": d.getFullYear(),	// 年
		"M+": d.getMonth()+1,	// 月
		"d+": d.getDate(),		// 日
		"H+": d.getHours(),		// 时
		"m+": d.getMinutes(),	// 分
		"s+": d.getSeconds(),	// 秒
	};
	var fmt="yyyy-MM-dd HH:mm:ss";
    for(var i in formats) {
    	if(new RegExp("("+i+")").test(fmt)) {
			prefix="";
			for(var times=RegExp.$1.length-formats[i].toString().length;times>0;times--) {
				prefix+="0";
			}
	       	fmt=fmt.replace(RegExp.$1,prefix+formats[i]);
		}
	}
	return fmt;
};

function $evalInPage(code, retObj) {
	$script(code);
	var r;
	if (typeof retObj === "string") {
		var t = $(retObj);
		var r = t.text();
		t.remove();
		return r;
	}
}

/* 基本辅助函数完 */


/*
 * PageKit，用于处理DOM节点
 */
function PageKit(o) {
	if(!(this instanceof PageKit)) {
		return new PageKit(arguments);
	}
	return this.init(o);
};
PageKit.prototype={
	// 初始化
	init: function(o) {
		// 包含的DOM节点
		this.nodes=[];
		for(var i=0;i<o.length;i++) {
			var s=o[i];
			if(typeof s=="string") {
				if(s=="") {
					// 创建文本节点
					this.nodes=this.nodes.concat(document.createTextNode(""));
				} else if(s.charAt(0)=="@") {
					// 创建指定标签名的节点
					this.nodes=this.nodes.concat(document.createElement(s.substring(1)));
				} else {
					// CSS选择语句
					this.nodes=this.nodes.concat(Array.prototype.slice.call(document.querySelectorAll(s)));
				}
			} else if(s===document) {
				this.nodes=this.nodes.concat(document.documentElement);
			} else if(s.nodeType || s===window) {
				// DOM节点 或 window
				this.nodes=this.nodes.concat(s);
			} else if(s instanceof PageKit) {
				// 其他PageKit对象
				this.nodes=this.nodes.concat(s.nodes);
			} else {
				// 其他的东西，有可能是NodeList，全部包在Array里
				this.nodes=this.nodes.concat(Array.prototype.slice.call(s));
			}
		}
		return this;
	},
	// 遍历对象的DOM节点，参数为一回调函数，function(index){}，当有返回非undefined/null值时终止遍历;
	each:function(func) {
		if(typeof func == "function") {
			for(var i=0;i<this.nodes.length;i++) {
				try {
					if(func.call(this.nodes[i],i)!=null) {
						break;
					}
				} catch(ex) {
					$error("PageKit::each",ex);
				}
			}
		}
		return this;
	},
	// 获取对象中的DOM节点，如果index为负数取倒数序号，默认为第一个
	get:function(index) {
		try {
			if(index==null) {
				index=0;
			} else if(index<0) {
				index+=this.nodes.length;
			}
			return this.nodes[index];
		} catch(ex) {
			return null;
		}
	},
	// 获取对象中某一个DOM节点，经PageKit包装，如果index为负取倒数序号。默认为第一个
	eq:function(index) {
		return PageKit(this.get(index));
	},
	// 删除对象所有的DOM节点。如果safe为true，只有当其无子节点时才删除
	remove:function(safe) {
		this.each(function() {
			if((!safe || this.childElementCount==0) && this.parentNode!=null) {
				this.parentNode.removeChild(this);
			}
		});
		this.nodes=[];
		return this;
	},
	// 隐藏对象所有的DOM节点
	hide:function() {
		this.each(function() {
			this.style.display="none";
		});
		return this;
	},
	// 显示对象所有的DOM节点
	show:function() {
		this.each(function() {
			this.style.display=null;
			this.style.visibility=null;
		});
		return this;
	},
	// 获取/设置对象节点的TagName。设置时原节点将被废弃
	tag:function(v) {
		if(!v) {
			// 读取
			return this.get().tagName || "";
		} else {
			// 设置
			if(typeof v=="string") {
				v=document.createElement(v);
			} else if(v instanceof PageKit) {
				v=v.get();
			}
			if(v.nodeType) {
				var xnr=this;
				this.each(function(index) {
					var newNode=v.cloneNode(false);
					while(this.childNodes.length>0) {
						newNode.appendChild(this.childNodes[0]);
					}
					this.parentNode.replaceChild(newNode,this);
					xnr.nodes[index]=newNode;
				});
			}
			return this;
		}
	},
	// 获取对象中的DOM节点数量
	size:function() {
		return this.nodes.length;
	},
	// 获取对象中的DOM节点数量是否为空
	empty:function() {
		return this.nodes.length==0;
	},
	// 获取对象中的DOM节点数量是否不为空
	exist:function() {
		return this.nodes.length>0;
	},
	// 获取对象某个DOM节点的子节点数
	heirs:function(index) {
		try {
			return this.get(index).childElementCount;
		} catch(ex) {
			return 0;
		}
	},
	// 获取对象第一个DOM节点在其兄弟节点中的序号，从0开始
	index:function() {
		try {
			var node=this.get().previousElementSibling;
			var c=0;
			for(;node!=null;node=node.previousElementSibling) {
				c++;
			}
			return c;
		} catch(ex) {
			return 0;
		}
	},
	// 获取对象第一个DOM节点的某个子节点，index为负数时取倒数序号。经PageKit包装
	child:function(index) {
		try {
			var node=this.get();
			return PageKit(node.children[index>=0?index:node.childElementCount+index]);
		} catch(ex) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的上级节点(经PageKit对象包装)。通过level指定向上几层
	superior:function(level) {
		try {
			if(!level) {
				level=1;
			}
			if(level<=0) {
				return this;
			}
			var s=this.get();
			if(!s) {
				return PageKit([]);
			}
			for(;level>0;level--) {
				s=s.parentNode;
			}
			return PageKit(s);
		} catch(ex) {
			return null;
		}
	},
	// 获取同级节点，i>0返回向后第i个，i<0返回向前第i个，i=0返回自己
	sibling:function(i) {
		try {
			if(i>0) {
				var p=this.get().nextElementSibling;
				for(;i>1 && p!=null;i--) {
					p=p.nextElementSibling;
				}
				return PageKit(p);
			} else if(i<0) {
				var p=this.get().previousElementSibling;
				for(;i<-1 && p!=null;i++) {
					p=p.previousElementSibling;
				}
				return PageKit(p);
			} else {
				return this;
			}
		} catch(ex) {
			return null;
		}
	},
	// 添加子节点
	add:function(o,pos) {
		var node=this.get();
		if(!node || node.nodeType!=1) {
			return this;
		}
		if(pos==null) {
			pos=-1;	// 默认加到末尾
		}
		if(pos<0 || pos>=node.childElementCount) {
			// 添加到最后
			if(o instanceof PageKit) {
				o.each(function() {
					node.appendChild(this);
				});
			} else if(o.nodeType==1) {
				node.appendChild(o);
			}
		} else {
			// 添加到pos位置
			if(o instanceof PageKit) {
				var p=node.children[pos];
				o.each(function() {
					node.insertBefore(this,p);
				});
			} else if(o.nodeType==1) {
				node.insertBefore(o,node.children[pos]);
			}
		}
		return this;
	},
	// 添加到对象
	addTo:function(o,pos) {
		if(o instanceof PageKit) {
			o.add(this,pos);
		} else if(o===document || o.nodeType==1) {
			PageKit(o).add(this,pos);
		}
		return this;
	},
	// 移动子节点
	move:function(pos,node) {
		if(node instanceof PageKit) {
			node=node.get();
		}
		if(node==null) {
			return this;
		}
		if(pos==="before") {
			// 添加到node之前
			this.each(function() {
				node.parentNode.insertBefore(this,node);
			});
		} else if(pos==="after") {
			// 添加到node之后
			this.each(function() {
				node.parentNode.insertBefore(this,node.nextElementSibling);
			});
		}
		return this;
	},
	// 查找符合条件的子节点
	find:function(str) {
		var res=[];
		this.each(function() {
			res=res.concat(Array.prototype.slice.call(this.querySelectorAll(str)))
		});
		return PageKit(res);
	},
	// 过滤出有符合条件子节点的节点
	// o可以为字符串，作为CSS选择器。也可为判定函数，function(elem)，返回false或等价物时滤除。也可为一Object，表示期望有的属性:值
	filter:function(o) {
		if(!o) {
			return this;
		}
		var res=[];
		if(typeof o=="string") {
			this.each(function() {
				if(this.querySelector(o)) {
					res.push(this);
				}
			});
		} else if(typeof o=="function") {
			this.each(function() {
				if(o(this)) {
					res.push(this);
				}
			});
		} else if(typeof o=="object") {
			this.each(function() {
				var flag=true;
				for(var p in o) {
					if(!(this[p]===o[p])) {
						flag=false;
						break;
					}
				}
				if(flag) {
					res.push(this);
				}
			});
		}
		this.nodes=res;
		return this;
	},
	// 设置/读取属性，设置方法：o为{name1:value1,name2:value2}形式或o为name,v为value，读取方法：o为name,v留空
	attr:function(o,v) {
		switch(typeof o) {
			case "object":
				for(var n in o) {
					this.each(function() {
						if(o[n]!=null) {
							this.setAttribute(n,o[n]);
						} else {
							this.removeAttribute(n);
						}
					});
				};
				return this;
			case "string":
				if(v===undefined) {
					try {
						return this.get().getAttribute(o);
					} catch(ex) {
						return null;
					}
				} else if(v===null) {
					this.each(function() {
						this.removeAttribute(o);
					});
					return this;
				} else {
					this.each(function() {
						this.setAttribute(o,v);
					});
					return this;
				}
		}
		return this;
	},
	// 设置/读取DOM属性，方法同attr。
	prop:function(o,v) {
		switch(typeof o) {
			case "object":
				for(var n in o) {
					this.each(function() {
						this[n]=o[n];
					});
				};
				return this;
			case "string":
				if(v===undefined) {
					try {
						return this.get()[o];
					} catch(ex) {
						return null;
					}
				} else {
					this.each(function() {
						this[o]=v;
					});
					return this;
				}
		}
		return this;
	},
	// 设置/读取CSS属性，设置方法：o为{name1:value1,name2:value2}形式或o为name,v为value，读取方法：o为name,v留空
	css:function(o,v) {
		switch(typeof o) {
			case "object":
				for(var n in o) {
					var nn=n.replace(/-[a-z]/g,function(m){
						return m.substring(1).toUpperCase();
					});
					if(nn=="float") {
						nn="cssFloat";
					}
					this.each(function() {
						this.style[nn]=o[n];
					});
				};
				return this;
			case "string":
				var oo=o.replace(/-[a-z]/g,function(m){
					return m.substring(1).toUpperCase();
				});
				if(oo=="float") {
					oo="cssFloat";
				}
				if(v!=null) {
					this.each(function() {
						this.style[oo]=v;
					});
					return this;
				} else {
					try {
						return this.get().style[oo];
					} catch (ex) {
						return null;
					}
				}
		}
		return this;
	},
	// 读取实际表现出的CSS属性
	curCSS:function(o) {
		try {
			if(typeof o=="string") {
				var o=o.replace(/-[a-z]/g,function(m){
					return m.substring(1).toUpperCase();
				});
				return window.getComputedStyle(this.get(),null)[o];
			}
		} catch(ex) {
		}
		return null;
	},
	// 获取位置，abs为真时获取绝对位置
	rect:function(abs) {
		try {
			var ro=this.get().getBoundingClientRect();
			// ro的属性不能修改，故复制一个r返回
			var r={};
			var list={"left":window.scrollX,"right":window.scrollX,"top":window.scrollY,"bottom":window.scrollY,"width":0,"height":0};
			for(var i in list) {
				r[i]=ro[i];
				if(abs) {
					r[i]+=list[i];
				}
			}
			return r;
		} catch(ex) {
			return null;
		}
	},
	// 增加一个类
	addClass:function(str) {
		this.each(function() {
			var c=this.className;
			if(!c) {
				this.className=str;
			} else if(!c.match(new RegExp("\\b"+str+"\\b"))) {
				this.className+=" "+str;
			}
		});
		return this;
	},
	// 去除一个类
	removeClass:function(str) {
		this.each(function() {
			var c=this.className;
			if(c && c.match(new RegExp("\\b"+str+"\\b"))) {
				this.className=c.replace(new RegExp("\\b"+str+"\\b"),"").replace(/^ +| +$/g,"");
			}
		});
		return this;
	},
	// 获取/设置文本内容
	text:function(txt) {
		if(txt!=null) {
			this.each(function() {
				this.textContent=txt.toString();
			});
			return this;
		} else {
			var elem=this.get();
			if(elem==null) {
				return "";
			} else {
				return elem.textContent || "";
			}
		}
	},
	// 获取/设置内部HTML代码
	html:function(html) {
		if(html!=null) {
			this.each(function() {
				this.innerHTML=html;
			});
			return this;
		} else {
			var elem=this.get();
			if(elem==null) {
				return "";
			} else {
				return elem.innerHTML || "";
			}
		}
	},
	// 获取/设置对象的值。可输入控件为其输入值，其余为其内部文本
	val:function(v) {
		if(v!=null) {
			// 设置
			this.each(function() {
				switch(this.tagName) {
					case "INPUT":
						switch((PageKit(this).attr("type") || "").toLowerCase()) {
							case "checkbox":
								this.checked=v;
								break;
							default:
								this.value=v;
								break;
						}
						break;
					case "TEXTAREA":
						this.value=v;
						break;
					default:
						PageKit(this).text(v);
						break;
				}
			});
			return this;
		} else {
			// 读取
			var elem=this.get();
			if(!elem) {
				return null;
			}
			switch(elem.tagName) {
				case "INPUT":
					switch((PageKit(elem).attr("type") || "").toLowerCase()) {
						case "checkbox":
							return elem.checked;
						default:
							return elem.value;
					}
				case "TEXTAREA":
					return elem.value;
				default:
					return PageKit(elem).text();
			}
		}
	},
	// 添加事件监听函数。可以有多个事件。由逗号分隔
	bind:function(evt,func,capture) {
		var e=evt.split(",");
		this.each(function() {
			for(var i=0;i<e.length;i++) {
				this.addEventListener(e[i],func,!!capture);
			}
		});
		return this;
	},
	// 解除事件监听
	unbind:function(evt,func,capture) {
		var e=evt.split(",");
		this.each(function() {
			for(var i=0;i<e.length;i++) {
				this.removeEventListener(e[i],func,!!capture);
			}
		});
		return this;
	},
	// 复制所有DOM节点到新对象
	clone:function() {
		var nodes=[];
		this.each(function() {
			nodes.push(this.cloneNode(true));
		});
		return PageKit(nodes);
	},
	// 触发事件
	trigger:function(evtName) {
		this.each(function() {
			var e = document.createEvent('Events');
      		e.initEvent(evtName, true, true)
			this.dispatchEvent(e);
		});
		return this;
	}
};

// 终于可以正式开始了，先获取保存的选项。
switch(XNR.agent) {
	case USERSCRIPT:
		try {
			main(JSON.parse(GM_getValue("xnr_options","{}")));
		} catch(ex) {
			main({});
		}
		break;
	case CHROME:
		chrome.extension.sendRequest({action:"load"}, function(response) {
			main(response.options);
		});
		break;
	case SOGOU:
		sogouExplorer.extension.sendRequest({action:"load"}, function(response) {
			main(response.options);
		});
		break;
	case FIREFOX:
		var opts=XNR_load();
		try {
			opts=JSON.parse(opts);
		} catch(ex) {
			try {
				opts=JSON.parse(unescape(opts).replace(/\n/g,"\\u000a"));	//TODO 3.x -> 3.2 升级兼容代码，以后删除
			} catch(ex) {
				opts={};
			}
		}
		main(opts);
		break;
	case SAFARI:
		var reqId=Math.random();
		safari.self.addEventListener("message", function(msg) {
			if(msg.name=="xnr_load_data" && msg.message.id==reqId) {
				safari.self.removeEventListener("message",arguments.callee,false);
				main(msg.message.data);
			}
		},false);
	    safari.self.tab.dispatchMessage("xnr_load",reqId);
		break;
	case OPERA_UJS:
		try {
			main(JSON.parse(window.opera.scriptStorage["xnr_options"]));
		} catch(ex) {
			main({});
		}
		break;
	case OPERA_EXT:
		XNR.oexSendRequest({action:"load"},function(response) {
			try {
				main(JSON.parse(response));
			} catch(ex) {
				main({});
			}
		});
		break;
	default:
		throw "unsupported browser";
};

})();
