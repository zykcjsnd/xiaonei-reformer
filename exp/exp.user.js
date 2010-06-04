// ==UserScript==
// @name           校内人人网改造器 Xiaonei Reformer Exp
// @namespace      Xiaonei_reformer_exp
// @include        http://renren.com/*
// @include        http://*.renren.com/*
// @include        https://renren.com/*
// @include        https://*.renren.com/*
// @description    为人人网（renren.com，原校内网xiaonei.com）清理广告、新鲜事、各种烦人的通告，删除页面模板，恢复旧的深蓝色主题，增加更多功能。。。
// @version        3.0.0.20100604
// @miniver        300
// @author         xz
// ==/UserScript==
//
// Copyright (C) 2008-2010 Xu Zhen
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
//

(function(_contentWindow){

// 主要是为了Firefox扩展。需要覆盖window。为了减少修改也把document覆盖了
var window=_contentWindow;
var document=_contentWindow.document;

if (window.self != window.top) {
	if(document.designMode=="on") {
		// 不在内容可以编辑的frame中运行
		return;
	} else if(document.body && !document.body.id && !document.body.className) {
		// 也不在body没有标记的frame中运行
		return;
	} else if(document.location.href.toLowerCase().indexOf("ajaxproxy")>0) {
		// 也不在ajaxproxy.html中运行
		return;
	}
}

// 基本参数
var XNR={};

// 版本，对应@version和@miniver，用于升级相关功能
XNR.version="3.0.0.20100604";
XNR.miniver=300;

// 存储空间，用于保存全局性变量
XNR.storage={};

// 当前用户ID
XNR.userId=$cookie("id","0");

// 当前页面
XNR.url=document.location.href;

// 调试模式
XNR.debug=false;

// 选项
XNR.options={};

// 当前运行环境（浏览器）
const UNKNOWN=0,USERSCRIPT=1,FIREFOX=2,CHROME=4;
XNR.agent=UNKNOWN;
if(window.chrome) {
	XNR.agent=CHROME;
} else if (typeof GM_setValue=="function") {
	XNR.agent=USERSCRIPT;
} else if (typeof Components=="object") {
	XNR.agent=FIREFOX;
}

// 页面工具的简写
var $=PageKit;

/* 以下开始所有功能 */

// 清除广告
function removeAds(evt) {
	if(!evt) {
		var ads=".ad-bar, .banner, .adimgr, .blank-bar, .renrenAdPanel, .side-item.template, .rrdesk, .video:not([style]), #sd_ad, #showAD, #huge-ad, #rrtvcSearchTip, #top-ads, #bottom-ads, #main-ads, #n-cAD, #webpager-ad-panel";
		$ban(ads);
		$wait(1,function() {
			// .blank-holder在游戏大厅game.renren.com不能删
			$(".blank-holder").remove(true);
		});
	}
	$wait(1,function() {
		// 混迹于新鲜事中的广告
		$("ul#feedHome > li").filter("a[href^='http://edm.renren.com/link.do?']").remove();
		// 人人桌面
		$("ul#feedHome > li").filter("a[href^='http://im.renren.com/'][href*='.exe']").remove();
	});
};

// 去除页面模板
function removePageTheme() {
	const themes=["head link[rel='stylesheet'][href*='/csspro/themes/'][href*='.css']", //节日模板
				"#hometpl_style",	// 首页模板
				"head link[rel='stylesheet'][href*='zidou_nav.css']",	// 紫豆导航栏
				"#domain_wrapper",	// 个人域名提示栏
				"#themeLink"];		// 公共主页模板
	$(themes.join(",")).remove();
	// 删除紫豆模板
	$("head style").each(function(elem) {
		var theme=$(elem);
		if(theme.text().indexOf("url(http://i.static.renren.com")!=-1) {
			theme.remove();
			return true;
		}
	});
	// 修复Logo
	var logo=$("img[src*='viplogo-renren.png']").attr({height:null,width:null});
	if(logo.size()>0) {
		logo.attr("src",logo.attr("src").replace("viplogo-renren.png","logo-renren.png"));
	}
};

// 去除升级星级用户提醒
function removeStarReminder() {
	const target="#tobestar, #realheadbulletin, #noStarNotice, #nostar, #home_nostar";
	$ban(target);
};

// 删除音乐播放器，包括紫豆音乐播放器和日志里的附加音乐
function removeMusicPlayer() {
	const target="#zidou_music, #ZDMusicPlayer, .mplayer, embed[src*='player.swf'] , embed[src*='Player.swf'], div.mod.music";
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

// 去除日志信纸
function removeBlogTheme() {
	$("head style").each(function(elem) {
		var s=$(elem);
		if(s.text().indexOf(".text-article")!=-1) {
			s.remove();
			return true;
		}
	});
};

// 删除日志中整段的链接
function removeBlogLinks() {
	$("#blogContent a,#shareBody a").each(function(elem) {
		var o=$(elem);
		// 链接到其他日志，放过好了
		if($page("blog",elem.href)) {
			return;
		}
		// 只处理链接到个人主页或外部链接中非ASCII文字大于20个的。
		if($page("profile",elem.href) || o.text().match(/[\u0100-\uffff]{20,}/)) {
			o.switchTo("span");
		}
	});
};

// 移除底部工具栏
function removeBottomBar() {
	const target="#bottombar, #imengine";
	$ban(target);
};

// 去除右下角系统通知
function removeSysNotification() {
	const target="#system-notification-box";
	$ban(target);
};

// 去除首页部件
function removeHomeGadgets(gadgetOpt) {
	const gadgets={
		"topNotice":".notice-holder, #notice_system",		// 顶部通知
		"levelBar":".user-data",	// 个人等级
		"footprint":"#footPrint",	// 最近来访
		"newFriends":".side-item.pymk",	// 好友推荐
		"sponsors":"#sponsorsWidget",	// 赞助商内容
		"publicPage":".side-item.commend-page",	// 公共主页推荐
		"publicPageAdmin":"#pageAdmin",	// 公共主页管理
		"birthday":"#homeBirthdayPart",	// 好友生日
		"survey":".side-item.sales-poll",	// 人人网调查
		"newStar":".star-new"	// 人气之星/新人
	};
	const filters={
		"webFunction":{t:".side-item",f:".web-function"},	// 站内功能
	};

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
		"levelBar":"#userPoint.mod",
		"album":"#album.mod",
		"blog":"#blog.mod",
		"share":"#share.mod",
		"gift":"#gift.mod",
		"fav":"#kuAi.mod",
		"specialFriends":"#spFriends.mod",
		"mutualFriends":"#cmFriends.mod",
		"visitors":"#visitors.mod",
		"pages":"#pages.mod",
		"friends":"#friends.mod",
		"theme":".enter-paints,#paintother,#paintself"
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
};

// 隐藏请求
function hideRequest(req) {
	const table={
		"appRequest":"l-app",
		"nodifyRequest":"l-request",
		"pokeRequest":"l-poke",
		"recommendRequest":"l-recommend",
		"friendRequest":"l-friend",
		"tagRequest":"l-tag",
		"otherRequest":"iOther"
	};
	var box=$(".side-item.newrequests ul.icon");
	if(box.empty()) {
		return;
	}
	for(var r in req) {
		if(req[r] && table[r]) {
			box.find("li img."+table[r]).superior().purge();
		}
	}
};

// 自动拒绝请求
function rejectRequest(req) {
	// 好友申请
	if(req["friendRequest"]) {
		$get("http://www.renren.com/delallguestrequest.do?id="+XNR.userId);
	}

	// 招呼
	if(req["pokeRequest"]) {
		$get("http://www.renren.com/delallpoke.do");
	}

	// 没有其他选项被启用，退出。
	if(req["appRequest"]==false && req["tagRequest"]==false && req["recommendRequest"]==false) {
		return;
	}

	$get("http://req.renren.com/request/requestList.do",function(html) {
		if(html==null) {
			return;
		}
		// 应用请求
		if(req["appRequest"]) {
			// 一般应用
			var command;
			while(command=/ignoreAllAppRequest\((\d+),(\d+),(\d+),'(.*?)'\)/g.exec(html)) {
				$get("http://req.renren.com/request/ignoreAllAppRequest.do?post="+encodeURIComponent(JSON.stringify({"type":command[1],"id":command[2],"appId":command[3],"name":command[4]})));
			}

			// 人人餐厅
			while(command=/ignoreSpecialRequest\(101002,(\d+),(\d+),\d+,'.*?','.*?','.*?'\)/g.exec(html)) {
				$get("http://app.renren.com/request/ignoreAppRequest.do?rid="+command[1]+"&appId="+command[2]+"&type=101002");
			}
		}
		// 圈人请求
		if(req["tagRequest"]) {
			var command;
			while(command=/refusePhotoRequest\((\d+),\d+,'.*?',\d+,\d+\)/g.exec(html)) {
				$get("http://photo.renren.com/refuseptrequest.do?id="+command[1]);
			}
		}
		// 好友推荐
		if(req["recommendRequest"]) {
			var command;
			while(command=/rejectRecommend\((\d+),'.*?',\d+\)/g.exec(html)) {
				$get("http://friend.renren.com/RejectRecFriend.do?id="+command[1]);
			}
		}
	});
};

// 自动屏蔽应用通知
function blockAppNotification() {
	$get("http://msg.renren.com/notify/notifications.do",function(html) {
		var blocked=[];
		var command;
		while(command=/showDialog\(this,(\d+)\)/.exec(html)) {
			if(!blocked[command[1]]) {
				$get("http://msg.renren.com/notify/notifications.do?action=block&app_id="+command[1]);
				blocked[command[1]]=true;
			}
		}
	});
};

// 隐藏特定新鲜事类型
function hideFeeds(evt,feeds,mark) {
	$("ul#feedHome > li").filter(function(elem) {
		var type=$feedType($(elem));
		return (type!="" && feeds[type]==true);
	}).each(function(elem) {
		if(mark) {
			try {
				var id=elem.id.match("[0-9]+")[0];
				$get("http://www.renren.com/readNews.do?t=s&i="+id);
			} catch(err) {
				$error("hideFeeds::get",err);
			}
			$(elem).remove();
		} else {
			$(elem).hide();
		}
	});
};

// 加载更多页新鲜事
function loadMoreFeeds(pages) {
	// 先修改load函数，原来的load最后有个window.scrollTo会使页面滚动
	// 只要当前页数比预定页数少，就不断加载下一页
	var code="var count=0;function dontscroll(){if((window.XN.page.home.feedFilter.oldLoad=window.XN.page.home.feedFilter.load)==null){throw 'x'};window.XN.page.home.feedFilter.load=function(a,b){var oldScrollTo=window.scrollTo;window.scrollTo=function(){};window.XN.page.home.feedFilter.oldLoad(a,b);window.scrollTo=oldScrollTo;}};function loadMoreFeeds(){if(window.XN.page.home.feedFilter.currentPage<"+(parseInt(pages)-1)+"){if(!window.XN.page.home.feedFilter.loading){XN.Page.home.feedFilter.loadMore()};setTimeout(arguments.callee,1000);}else{window.XN.page.home.feedFilter.load=window.XN.page.home.feedFilter.oldLoad;window.XN.page.home.feedFilter.oldLoad=null}};(function(){try{dontscroll();loadMoreFeeds()}catch(e){if(count<5){count++;setTimeout(arguments.callee,500)}}})()";
	$script(code);
};

// 禁止在窗口滚动到底部时自动加载下一页新鲜事
function disableAutoLoadFeeds() {
	var code="var count=0;(function(){if(window.feedLoads==null && count<5){count++;setTimeout(arguments.callee,500)}else{window.feedLoads=2}})();";
	$script(code);
};

// 隐藏新鲜事具体内容
function hideFeedContent() {
	$patchCSS("ul.richlist.feeds li div.content{display:none;}");
};

// 去除状态新鲜事上的链接
function removeStatusFeedLink() {
	$("#feedHome h3>a.text").switchTo("span");
};

// 在新鲜事中标记在线好友
function markOnlineFriend(evt) {
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
		$("#feedHome li h3").each(function(elem) {
			$(elem).find("a[href*='profile.do?']").each(function(link) {
				var id=/id=([0-9]+)/.exec(link.href)[1];
				if(id && list[id]) {
					if($(link).superior().find("img.on-line[mark='"+id+"']").empty()) {
						// 还没标记过
						elem.insertBefore($node("img").attr({"class":"on-line",height:"12",width:"13",onclick:"javascript:talkto("+id+",'"+list[id]+"');return false;",title:"点此和"+list[id]+"聊天",src:"http://xnimg.cn/imgpro/icons/online_1.gif?ver=$revxxx$",style:"vertical-align:baseline;cursor:pointer","mark":id}).get(),link);
					}
				}
			});
		});
	}
};

// 收起新鲜事回复
function flodFeedComment() {
	// 先隐藏起来
	var p=$patchCSS("#feedHome .details>.replies{display:none}");
	// 修改loadJSON方法，loadJSON原方法最后会调用show强制显示
	var code="var count=0;(function(){try{var code=XN.app.status.replyEditor.prototype.loadJSON.toString().replace(/function *\\(json\\) *{/,'').replace(/}$/,'').replace(/this.show\\([^\\)]*\\)/,'this.hide()')}catch(e){count++;if(count<5){setTimeout(arguments.callee,500)};return};XN.app.status.replyEditor.prototype.loadJSON=new Function('json',code)})()";
	$script(code);
	$wait(1,function() {
		var list=[];
		// feedView是公共主页的
		$("#feedHome,#feedView").find(".details .legend a[id^='reply']").each(function(elem) {
			list.push(elem.id.match("[0-9]+$")[0]);
		});
		if(list.length>0) {
			var code="try{var list="+JSON.stringify(list)+";for(var i=0;i<list.length;i++){getReplyEditor(list[i],'f').hide()}}catch(e){}";
			$script(code);
		}
		p.remove();
	});
};

// 自动检查提醒新鲜事更新
function autoCheckFeeds(interval,feedFilter) {
	// 在bottombar上建立一个新的接收区域
	if(!$("#webpager #notification-panel").empty()) {
		var root=$node("div").attr("class","popupwindow notify-panel").appendTo($("#webpager #notification-panel"));
		var Btn=$node("div").attr("class","panelbarbutton").appendTo(root);
		$node("img").attr({"class":"icon",height:"16",width:"16",src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA4klEQVQ4y61TsQrCQAztp9lCO3dz82N0cXFydXIWP0LE3Q/QxVEoR0Fpz15P3sGlSWlpix6EvOSSl9ccDYJ/nNnyZBfro53iqRmJ3fnmbHW42O31PiomEgBcwHjhUEwE881eSPNxG7fv4UlBXddkxhiLw+Oq+ogYXnwCCjxR13SOfT0pAODMuATmk31sjXI5rXW3AhT1Teb4VWipQClFCvj0tiqPxQ7SNHWMY3cAjHr0iVcY2gHPP7J3oyAMQ5sX2eQdoM8RxHFsn3kp3rlvB1xVkiTN/wA2b1EUCevKieZfzxcMt3dNdxsqQQAAAABJRU5ErkJggg%3D%3D",alt:"新鲜事",title:"新鲜事"}).appendTo(Btn);
		$node("div").attr({id:"feed_toread_tip","class":"buttontooltip",style:"display:none"}).append($node("strong").attr("id","feed_toread_num").text("0")).appendTo(Btn);
		var list=$node("article").attr("class","window").code('<header><h4>新的新鲜事</h4><menu><command title="最小化" label="最小化" class="minimize"></command></menu></header><section><p style="padding:5px;">没有新的新鲜事</p></section>').appendTo(root);
		Btn.hook("click",function(evt) {
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
		list.find("command").hook("click",function(evt) {
			list.hide();
			root.removeClass("actived");
		});
	}

	// 如果是在首页则记录下当前最新一条新鲜事的ID
	if($page("home")) {
		if($("#feedHome").heirs()>0) {
			$alloc("xnr_feed").id=$("#feedHome > li").get().id;
		}
	}

	// 定时检查
	setInterval(function() {
		// 应该用post，不过get也行
		$get("http://www.renren.com/feedretrieve.do?p=0",function(html) {
			if(html==null) {
				return;
			}
			var r=html.split("##@L#");
			if(r.length<4 || !/^\d+$/.test(r[1])) {
				// 回复结构变了
				$error("autoCheckFeeds",{name:"网站改版",message:"获取新鲜事的页面结构发生变化"});
				return;
			}
			try {
				// 获取新鲜事列表
				var feedList=$node("ul").code(r[0].replace(/onload=".*?"/g,"").replace(/<script.*?<\/script>/g,"").replace(/src="http:\/\/s\.xnimg\.cn\/a\.gif"/g,"").replace(/lala=/g,"src="));
				// 滤除被屏蔽的新鲜事类型
				for(var i=feedList.heirs()-1;i>=0;i--) {
					var feedType=$feedType(feedList.child(i));
					if(feedType && feedFilter[feedType]) {
						feedList.child(i).remove();
					}
				}
				// 滤除部分广告
				feedList.find("li").filter("a[href^='http://edm.renren.com/link.do?']").remove();
				// 人人桌面
				feedList.find("li").filter("a[href^='http://im.renren.com/'][href*='.exe']").remove();

				if(feedList.heirs()==0) {
					return;
				}
				// 已读的最新新鲜事ID
				var feedId=$alloc("xnr_feed").id;
				if(!feedId) {
					// 如果为空，则认为所有新鲜事都读了。。。
					feedId=feedList.child(0).attr("id");
					$alloc("xnr_feed").id=feedId;
				}

				console.log(feedId);

				var feedCount=0;
				// 判断有哪些新鲜事还没有读过
				for(var i=0;i<feedList.heirs();i++) {
					if(feedList.child(i).attr("id")==feedId) {
						feedCount=i;
						break;
					}
				}
				if(feedCount<=0) {
					return;
				} else {
					$alloc("xnr_feed").id=feedList.child(0).attr("id");
				}

				// 很好，可以直接加到工具栏中
				if(!$("#webpager #feed_toread_tip").empty()) {
					var root=$("#webpager #notification-panel .popupwindow.notify-panel").filter("#feed_toread_tip");
					var section=root.find(".window>section");
					if(section.child(0).prop("tagName")=="P") {
						section.child(0).remove();
						$node("div").attr("class","notification").appendTo(section);
					}
					var alist=section.child(0);

					for(var i=feedCount-1;i>=0;i--) {
						var feedInfo=feedList.child(i);
						var article=$node("article").attr("class","iconpanel").prependTo(alist);
						// 图标
						var icon=feedInfo.find("a.avatar img").attr("src");
						var header=$node("header").code("<img class='icon' height='16' width='16' src='"+icon+"'/><menu><command class='delete' closebtn='true' title='删除'/></menu>").appendTo(article);
						// 删除按钮事件
						header.find(".delete").hook("click",function(evt) {
							var obj=$(evt.target).superior(3).remove();
							if(alist.heirs()==0) {
								$node("p").style("padding","5px").text("没有新的新鲜事").appendTo(alist);
							}
						});
						// 内容
						var content=$node("section").code("<p>"+feedInfo.find("h3").code()+"</p>").appendTo(article);
						content.find("img").style("position","absolute");
					}
					// 计数
					$("#feed_toread_num").text(feedCount+parseInt($("#feed_toread_num").text()));
					$("#feed_toread_tip").show();
				} else {
					// 底部工具栏靠不住，自己建立一个窗口
					var root=$("#xnr_newfeeds");
					if(root.empty()) {
						root=$node("div").attr({style:"position:fixed;bottom:10px;right:10px;width:250px;z-index:100000;background:#EBF3F7;border:#3B5888 solid 1px;",id:"xnr_newfeeds"}).append($node("div").style({padding:"3px",background:"#3B5998"}).code("<span style='color:white;font-weight:bold'>您有新的新鲜事</span><a style='float:right;cursor:pointer;color:white' onclick='document.body.removeChild(document.getElementById(\"xnr_newfeeds\"));'>关闭</a>")).append($node("div").attr("style","max-height:200px;padding-left:5px;padding-right:5px;overflow-y:auto").append($node("ul"))).appendTo(document.body);
					}
					var feedInfo=feedList.child(i);
					// 图标
					var icon=feedInfo.find("a.avatar img").attr("src");
					var list=root.find("ul");
					if(list.heirs()>0) {
						list.child(-1).style("borderBottom","1px solid #AAAAAA");
					}
					for(var i=0;i<feedCount;i++) {
						list.append($node("li").code("<img height='16' width='16' src='"+icon+"' style='float:left'/><div style='padding-left:20px'>"+feedInfo.find("h3").code().replace(/^ +| +$/,"")+"</div>").attr("style","padding-top:5px;padding-bottom:5px;border-bottom:1px solid #AAAAAA;"));
					}
					list.child(-1).style("borderBottom","");
				}
			} catch(err) {
				$error("autoCheckFeeds",err);
			}
		});
	},parseInt(interval)*1000);
};

// 定时刷新新鲜事列表
function autoReloadFeeds(interval) {
	const code='setInterval(function(){XN.page.home.feedFilter.load(XN.page.home.feedFilter.currentFeed)},'+parseInt(interval)*1000+')';
	$script(code);
};

// 去除导航栏项目
function removeNavItems(navLinks) {
	const links={
		"theme":"i.renren.com/shop",
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
			style+="div.nav-body .menu .menu-title a[href*='"+links[l]+"'],";
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
	$patchCSS(".navigation-wrapper,.navigation{width:auto} .navigation .nav-body{width:auto;float:none}");
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
	for(var i=0;i<items.length;i+=2) {
		$node("div").code('<div class="menu-title"><a href="'+items[i+1]+'" target="_blank">'+items[i]+'</a></div>').attr("class","menu").appendTo(nav);
	}
	//防止被自作主张改动链接
	$script("try{var e=document.body.querySelectorAll('.nav-main .menu-title > a');for(var i in e){e[i]._ad_rd=true;}}catch(ex){}");
};

// 恢复深蓝主题
function recoverOriginalTheme(ignoreTheme) {
	var FCOLOR="#3B5998";	//Facebook的深蓝色
	var XCOLOR="#3B5888";	//校内原来的深蓝色
	var BCOLOR="#5C75AA";	//原来的菜单背景色
	var SCOLOR="#EBF3F7";	//原来的应用栏&回复背景色

	// stage0预先打补丁。stage1修正
	var prepatch=$patchCSS("a,a:link,a:visited,a:hover{color:"+FCOLOR+"}.navigation .nav-body{background-color:"+XCOLOR+"}.user-data,.panel.bookmarks,.statuscmtitem,.new-user{background-color:"+SCOLOR+"}");
	$wait(1,function() {
		if(!ignoreTheme) {
			// 开始检测有无模板存在
			var theme=false;
			// 紫豆导航栏
			if(!$("head > link[ref='stylesheet'][herf*='zidou_nav.css']").empty()) {
				theme=true;
			} else if(!$("#themeLink:not([href*='sid=-1'])").empty()) {
				// 公共主页模板
				theme=true;
			} else if(!$("#hometpl_style").empty() && $("#hometpl_style").text().indexOf("{")!=-1) {
				// 首页模板 。。。
				theme=true;
			} else {
				// 紫豆模板
				$("head style").each(function(elem) {
					if($(elem).text().indexOf("url(http://i.static.renren.com")!=-1) {
						theme=true;
						return true;
					}
				});
			}
			if(theme) {
				prepatch.remove();
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
				".user-data,.panel.bookmarks,.statuscmtitem{background-color:"+SCOLOR+"}",
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
				".navigation .menu-title a:hover{background-color:"+BCOLOR+"}",
				".menu-dropdown .menu-item li.show-more a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .menu-item a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .optionmenu li a:hover{background-color:"+FCOLOR+"}",
				"ol.pageclip li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li a:hover{background-color:"+FCOLOR+"}",
				".pagerpro li.current a, .pagerpro li.current a:hover{color:"+FCOLOR+"}",
				"#pages-jump a{color:"+FCOLOR+"}",
				"#pop-login h1{background-color:"+FCOLOR+"}",
				".newpop .share_popup .toggle_tabs li a{color:"+FCOLOR+"}",
			],
			"news-feeds.css":[
				"ul.richlist.feeds li div.details a.share:hover{color:"+FCOLOR+"}",
			],
			"profilepro.css":[
				".imgbtn-1{background-color:"+FCOLOR+"}",
			],
			"profile-skin.css":[
				".tabs-holder .tabpanel a:visited,.tabs-holder .tabpanel a{color:"+FCOLOR+"}",
				".super-menu li a:hover{background-color:"+FCOLOR+"}",
				".filter li.c a{background-color:"+BCOLOR+"}",
			],
			"msg.css":[
				".page-titletabs a.add-msg{background-color:"+FCOLOR+"}",
				".inputbutton,.inputsubmit,.subbutton,.canbutton,.button-group button{background-color:"+FCOLOR+"}",
				".messages .next_message:hover,.messages .previous_message:hover{background-color:"+FCOLOR+"}",
			],
			"dialogpro.css":[
				"ul.square_bullets{color:"+FCOLOR+"}",
				"td.pop_content h2{background-color:"+XCOLOR+"}",
			],
			"page.css":[
				".page-tabs .tabpanel a,.page-tabs .tabpanel a:visited{color:"+FCOLOR+"}",
				".page-tabs .tabpanel li.select a,.page-tabs .tabpanel li.addtab a:hover{color:"+FCOLOR+"}",
				".stabs a,.stabs a:hover,.stabs a:visited{color:"+FCOLOR+"}",
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
			"appspro.css":[
				".sub-nav ul.main li.son-nav a.pre-select,.sub-nav ul.main li.son-nav a:hover.pre-select,.sub-nav ul.main li.allselect a{background-color:"+FCOLOR+"}",
				".sub-nav li ul.sub li a{color:"+FCOLOR+"}",
				".sub-nav ul.main li a.select,.sub-nav li ul.sub li a.select,.sub-nav li ul.sub li a.select:hover{background-color:"+FCOLOR+"}",
				".sub-nav li ul.sub li a.select,.sub-nav li ul.sub li a.select:hover{background-color:"+FCOLOR+"}",
				".sub-nav,.user-data,.panel.bookmarks,.section h2,.tab-switch{background-color:"+SCOLOR+"}",
			],
			"albumpro.css":[
				".photo-comments #side-column ul.actions .rotate-left a:hover,.photo-comments #side-column ul.actions .rotate-right a:hover{background-color:"+FCOLOR+"}",
				".share a:hover{background-color:"+FCOLOR+"}",
				"h3.upload-step-1 .pick-more{color:"+FCOLOR+"}",
				".pager-top a.current, .pager-top a.current:hover{color:"+FCOLOR+"}",
				".pager-top a:hover{background-color:"+BCOLOR+"}",
				"a.act-btn{background-color:"+FCOLOR+"}",
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
			"login-unbuffered.css":[
				"a,a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"a.action:hover,a.share:hover,a.mini-share:hover{background-color:"+FCOLOR+"}",
				".input-button,.input-submit{background-color:"+FCOLOR+"}",
				".navigation{background-color:"+XCOLOR+"}",
				".navigation .menu-title a:hover{background-color:"+BCOLOR+"}",
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
			],
			"blog.css":[
				"a.button{color:white;background-color:"+FCOLOR+"}",
				".page-titletabs .act-btn a{background-color:"+FCOLOR+"}",
			],
			"global-std.min.css":[
				"a:link,a:visited,a:hover{color:"+FCOLOR+"}",
				"button,input[type=button]{background-color:"+FCOLOR+"}",
				"td.pop_content .dialog_body a,td.pop_content .dialog_body a:visited{color:"+FCOLOR+"}",
				"td.pop_content .dialog_buttons input{background-color:"+FCOLOR+" !important}",
				".navigation{background-color:"+XCOLOR+"}",
				".menu-dropdown .menu-item li.show-more a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .menu-item a:hover{background-color:"+FCOLOR+"}",
				".menu-dropdown .search-menu li a:hover,.menu-dropdown .optionmenu li a:hover{background-color:"+FCOLOR+"}",
			],
		};
		var style="";
		for(var f in files) {
			if(!$("head link[rel='stylesheet'][href*='"+f+"']").empty()) {
				style+=files[f].join("");
			}
		}
		if(style) {
			$patchCSS(style);
		}
		prepatch.remove();
	});
};

// 使用大号新鲜事删除按钮
function recoverBigDeleteBtn() {
	$patchCSS("ul.richlist.feeds li a.delete{background:url(\"http://xnimg.cn/imgpro/home/home_icon.png\") no-repeat scroll -115px 0 transparent;height:18px;width:18px}ul.richlist.feeds li a.delete:hover{background:url(\"http://xnimg.cn/imgpro/home/home_icon.png\") no-repeat scroll -133px 0 transparent;height:18px;width:18px}");
};

// 去除页面字体限制
function removeFontRestriction() {
	$patchCSS("*{font-family:none !important}");
};

// 限制头像列表中的头像最大数量
function limitHeadList(amountString) {
	var amount=parseInt(amountString);
	if(amount==0) {
		return;
	}
	$("ul.people-list").each(function(elem) {
		var list=$(elem);
		while(list.heirs()>amount) {
			list.child(amount).remove();
		}
	});
};

// 将留言板移动到新鲜事下方
function moveMessageBoardToBottom() {
	$(".talk-box").append($(".talk-box>.box"));
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

// 增加更多表情
function addExtraEmotions() {
	// 状态表情列表
	var emlist={
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
		":a":		{t:"爱",			s:"/imgpro/icons/statusface/8.gif"},
	//	"(v)":		{t:"花儿",			s:"/imgpro/icons/statusface/9.gif"},
		"(花)":		{t:"花儿",			s:"/imgpro/icons/statusface/9.gif"},
		"(38)":		{t:"校内女人",		s:"/imgpro/icons/statusface/10.gif"},
	//	"8-|":		{t:"书呆子",		s:"/imgpro/icons/statusface/13.gif"},
		"(书呆子)":	{t:"书呆子",		s:"/imgpro/icons/statusface/13.gif"},
	//	"|-)":		{t:"困",			s:"/imgpro/icons/statusface/14.gif"},
		"(困)":		{t:"困",			s:"/imgpro/icons/statusface/14.gif"},
		"(害羞)":	{t:"害羞",			s:"/imgpro/icons/statusface/15.gif"},
		"(大笑)":	{t:"大笑",			s:"/imgpro/icons/statusface/16.gif"},
	//	":d":		{t:"大笑",			s:"/imgpro/icons/statusface/16.gif"},
		"(口罩)":	{t:"防流感",		s:"/imgpro/icons/statusface/17.gif"},
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
		"(淘气)":	{t:"淘气",			s:"/imgpro/emotions/tie/16.gif"},
		"(吐)":		{t:"呕吐",			s:"/imgpro/emotions/tie/19.gif"},
		"(吻)":		{t:"吻",			s:"/imgpro/emotions/tie/20.gif"},
		"(晕)":		{t:"晕",			s:"/imgpro/emotions/tie/21.gif"},
		"(住嘴)":	{t:"住嘴",			s:"/imgpro/emotions/tie/23.gif"},
		"(s)":		{t:"大兵",			s:"/imgpro/icons/statusface/soldier.gif"},
		"(NBA)":	{t:"篮球",			s:"/imgpro/icons/statusface/basketball4.gif"},
		"(蜜蜂)":	{t:"小蜜蜂",		s:"/imgpro/icons/statusface/bee.gif"},
	//	"(bee)":	{t:"小蜜蜂",		s:"/imgpro/icons/statusface/bee.gif"},
		"(fl)":		{t:"花仙子",		s:"/imgpro/icons/statusface/hanago.gif"},
		"(zz)":		{t:"粽子",			s:"/imgpro/icons/statusface/zongzi.gif"},
		"(cap)":	{t:"学位帽",		s:"/imgpro/icons/statusface/mortarboard.gif"},
		"(dad)":	{t:"父亲节",		s:"/imgpro/icons/statusface/love-father.gif"},
		"(ice)":	{t:"冰棍儿",		s:"/imgpro/icons/statusface/ice-cream.gif"},
		"(mj)":		{t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj.gif"},
		"(mj2)":	{t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj2.gif"},
		"(mj3)":	{t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj3.gif"},
		"(eclipse)":{t:"日全食",		s:"/imgpro/icons/statusface/eclipse.gif"},
		"(ta)":		{t:"博派",			s:"/imgpro/icons/statusface/Transformers-Autobot.gif"},
		"(td)":		{t:"狂派",			s:"/imgpro/icons/statusface/Transformers-Decepticon.gif"},
		"(qx)":		{t:"七夕",			s:"/imgpro/icons/statusface/qixi.gif"},
		"(qx2)":	{t:"七夕",			s:"/imgpro/icons/statusface/qixi2.gif"},
		"(bl)":		{t:"冰露",			s:"/imgpro/icons/statusface/ice.gif"},
		"(gs)":		{t:"园丁",			s:"/imgpro/icons/statusface/growing-sapling.gif"},
		"(gq1)":	{t:"国庆六十周年",	s:"/imgpro/icons/statusface/national-day-60-firework.gif"},
		"(gq2)":	{t:"国庆快乐",		s:"/imgpro/icons/statusface/national-day-balloon.gif"},
		"(gq3)":	{t:"我爱中国",		s:"/imgpro/icons/statusface/national-day-i-love-zh.gif"},
		"(hp)":		{t:"杰克灯",		s:"/imgpro/icons/statusface/halloween-pumpkin.gif"},
		"(hg)":		{t:"小鬼",			s:"/imgpro/icons/statusface/halloween-ghost.gif"},
		"(qxs)":	{t:"悼念钱学森",	s:"/imgpro/icons/statusface/qianxuesen.gif"},
		"(yt)":		{t:"光棍油条",		s:"/imgpro/icons/statusface/youtiao.gif"},
		"(bz)":		{t:"光棍包子",		s:"/imgpro/icons/statusface/baozi.gif"},
		"(wr)":		{t:"枯萎玫瑰",		s:"/imgpro/icons/statusface/wilt-rose.gif"},
		"(bh)":		{t:"破碎的心",		s:"/imgpro/icons/statusface/broken-heart.gif"},
		"(4)":		{t:"4周年",			s:"/imgpro/icons/statusface/4-years.gif"},
		"(cake)":	{t:"周年蛋糕",		s:"/imgpro/icons/statusface/4-birthday.gif"},
		"(hh)":		{t:"圣诞花环",		s:"/imgpro/icons/statusface/garland.gif"},
		"(stick)":	{t:"拐杖糖",		s:"/imgpro/icons/statusface/stick.gif"},
		"(socks)":	{t:"圣诞袜",		s:"/imgpro/icons/statusface/stocking.gif"},
		"(元旦)":	{t:"元旦快乐",		s:"/imgpro/icons/statusface/gantan.gif"},
	//	"(虎年)":	{t:"虎年",			s:"/imgpro/icons/statusface/tiger.gif"},
		"(tiger)":	{t:"虎年",			s:"/imgpro/icons/statusface/tiger.gif"},
		"(ny)":		{t:"布老虎",		s:"/imgpro/icons/statusface/tiger2.gif"},
		"(boy)":	{t:"男孩",			s:"/imgpro/icons/statusface/boy.gif"},
		"(girl)":	{t:"女孩",			s:"/imgpro/icons/statusface/girl.gif"},
		"(earth)":	{t:"地球",			s:"/imgpro/icons/statusface/wwf-earth.gif"},
		"(earth1)":	{t:"地球",			s:"/imgpro/icons/statusface/earth.gif"},
		"(hjr)":	{t:"世界环境日",	s:"/imgpro/icons/statusface/earthday.gif"},
		"(ty)":		{t:"汤圆",			s:"/imgpro/icons/statusface/tang-yuan.gif"},
		"(dl)":		{t:"灯笼",			s:"/imgpro/icons/statusface/lantern.gif"},
		"(nrj)":	{t:"女人节",		s:"/imgpro/icons/statusface/lipstick.gif"},
		"(zsj)":	{t:"植树节",		s:"/imgpro/icons/statusface/trees.gif"},
		"(zg)":		{t:"整蛊作战",		s:"/imgpro/icons/statusface/tomato.png"},
		"(rainy)":	{t:"雨",			s:"/imgpro/icons/statusface/rainy.gif"},
	//	"(rain)":	{t:"雨",			s:"/imgpro/icons/statusface/rainy.gif"},
		"(abao)":	{t:"功夫熊猫",		s:"/imgpro/icons/statusface/panda.gif"},
		"(jq)":		{t:"坚强",			s:"/imgpro/icons/statusface/quake.gif"},
		"(smlq)":	{t:"萨马兰奇",		s:"/imgpro/icons/statusface/samaranch2.gif"},
		"(read)":	{t:"读书日",		s:"/imgpro/icons/statusface/reading.gif"},
		"(ct)":		{t:"锄头",			s:"/imgpro/icons/statusface/chutou.gif"},
		"(jz)":		{t:"捐建小学",		s:"/imgpro/icons/statusface/grass.gif"},
		"(bbt)":	{t:"棒棒糖",		s:"/imgpro/icons/statusface/bbt.gif"},
		"(xr)":		{t:"儿时回忆",		s:"/imgpro/icons/statusface/sm.gif"},
		"(^)":		{t:"蛋糕",			s:"/imgpro/icons/3years.gif"},
		"(h)":		{t:"小草",			s:"/imgpro/icons/philips.jpg"},
		"(r)":		{t:"火箭",			s:"/imgpro/icons/ico_rocket.gif"},
		"(w)":		{t:"宇航员",		s:"/imgpro/icons/ico_spacewalker.gif"},
		"(LG)":		{t:"LG棒棒糖",		s:"/imgpro/activity/lg-lolipop/faceicon_2.gif"},
		"(i)":		{t:"电灯泡",		s:"/img/ems/bulb.gif"},
		"(yeah)":	{t:"哦耶",			s:"/img/ems/yeah.gif"},
		"(good)":	{t:"牛",			s:"/img/ems/good.gif"},
		"(f)":		{t:"拳头",			s:"/img/ems/fist.gif"},
	//	"(l)":		{t:"爱",			s:"/img/ems/love.gif"}, 与:a相同
		"(t)":		{t:"火炬",			s:"/img/ems/torch.gif"}
	};
	// 日志/照片回复表情列表，直接与序号/URL对应
	emlist1={
		"(不)":1,
		"(谄笑)":2,
		"(吃饭)":3,
		"(调皮)":4,
		"(尴尬)":5,
		"(汗)":6,
		"(惊恐)":7,
		"(囧)":8,
		"(可爱)":9,
		"(酷)":10,
		"(流口水)":11,
		"(猫猫笑)":12,
		"(色)":13,
		"(生病)":14,
		"(叹气)":15,
		"(淘气)":16,
		"(舔)":17,
		"(偷笑)":18,
		"(吐)":19,
		"(吻)":20,
		"(晕)":21,
		"(猪猪头)":22,
		"(住嘴)":23,
		"(大笑)":24,
		"(害羞)":25,
		"(惊讶)":26,
		"(口罩)":27,
		"(哭)":28,
		"(困)":29,
		"(难过)":30,
		"(生气)":31,
		"(书呆子)":32,
		"(微笑)":33
	};

	// 状态页(status.renren.com)的表情列表
	var list=$("#status_emotions");
	if(!list.empty()) {
		// 已经有的表情列表
		var curlist=[];
		list.find("img").each(function(elem) {
			curlist[elem.getAttribute("emotion")]=elem;
		});
		for(var e in emlist) {
			var el=emlist[e];
			// 不在已有列表中
			if(!curlist[e]) {
				$node("li").append($node("a").attr("href","#nogo").append($node("img").attr({title:el.t,alt:el.t,emotion:e,src:"http://xnimg.cn"+el.s,rsrc:"http://xnimg.cn"+el.s}))).appendTo(list);
			} 
		}
	}

	// 首页的状态表情列表
	var list=$("#publisher_emotion > ul");
	if(!list.empty()) {
		// 已经有的表情列表
		var curlist=[];
		list.find("img").each(function(elem) {
			curlist[elem.getAttribute("emotion")]=elem;
		});
		for (var e in emlist) {
			var el=emlist[e];
			// 不在已有列表中
			if(!curlist[e]) {
				$node("li").append($node("a").attr("href","#nogo").append($node("img").attr({title:el.t,alt:el.t,emotion:e,src:"http://xnimg.cn"+el.s,rsrc:"http://xnimg.cn"+el.s}))).appendTo(list);
			}
		}
	}

	// 新鲜事回复表情
	if($("#home").empty()) {
		// 不在首页，需要处理状态表情
		var code="var count=0;(function(){if(!XN.app.status.emoJsonForNewsFeedStatus){if(count<10){setTimeout(arguments.callee,500)};count++;return}var list=JSON.parse('"+JSON.stringify(emlist)+"');var curList=JSON.parse(XN.app.status.emoJsonForNewsFeedStatus).ubbList;for(var i=0;i<curList.length;i++){var em=curList[i];if(list[em.ubb]){delete list[em.ubb]}};for(var e in list){var em=list[e];curList.push({alt:'('+em.t+')',id:0,src:em.s,position:1000,ubb:e,img:'<img src=\"http://xnimg.cn'+em.s+'\" alr=\"'+em.t+'\"'})};XN.app.status.emoJsonForNewsFeedStatus='{ubbList:'+JSON.stringify(curList)+'}'})()";
		$script(code);
	};
	// 处理照片/日志表情
	var code="var count=0;(function(){if(!XN.app.status.emoJsonForNewsFeedCommon){if(count<10){setTimeout(arguments.callee,500)};count++;return};var list=JSON.parse('"+JSON.stringify(emlist1)+"');var curList=JSON.parse(XN.app.status.emoJsonForNewsFeedCommon).ubbList;for(var i=0;i<curList.length;i++){var em=curList[i];if(em.types==0)continue;if(list[em.ubb]){delete list[em.ubb]}};for(var e in list){curList.push({alt:e.substring(1,e.length-1),id:0,kind:0,position:1000,size:1,src:'/imgpro/emotions/tie/'+list[e]+'.gif',types:9,ubb:e,img:'<img src=\"http://xnimg.cn/imgpro/emotions/tie/'+list[e]+'.gif\" alt=\"'+e.substring(1,e.length-1)+'\"/>'})};XN.app.status.emoJsonForNewsFeedCommon='{ubbList:'+JSON.stringify(curList)+'}'})()";
	$script(code);
};

// 在日志、相册中增加楼层计数
function addFloorCounter(evt) {
	if(evt && !/^replies/.test(evt.target.className)) {
		return;
	}
	var replyAmount;	//回复总数
	if($page("blog")) {
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
	if(shownReplies.size()==0 || replyStartFloor<0) {
		//没有回复或出错
		return;
	}
	shownReplies.each(function(elem,index) {
		var info=$(elem).find(".info");
		if(info.child(0).attr("class")!="fc") {
			$node("span").text((replyStartFloor+parseInt(index)+1)+"楼 ").attr("class","fc").style("color","grey").prependTo(info);
		} else {
			//添加过了，不再继续
			return true;
		}
	});

	// 点击显示更多评论后隐藏其链接，防止重复点击
	if(!$allocated("show-all-id")) {
		$alloc("show-all-id");
		$("#show-all-id").hook("DOMNodeInserted",function(evt) {
			$("#showMoreComments").hide();
			$dealloc("show-all-id");
		}).hook("DOMNodeRemoved",function(evt) {
			$("#showMoreComments").show();
		});
	}
};

// 允许在日志中添加HTTPS/FTP协议的链接
function addBlogLinkProtocolsSupport() {
	const code='var f=window.tinyMCE.editors.editor.plugins.xnLink.update.toString().replace("/^http:/","/^https?:|^ftp:/").replace(/function \\(\\) *{/,"").replace(/}$/,"");window.tinyMCE.editors.editor.plugins.xnLink.update=new Function(f);';
	$script(code);
};

// 阻止点击跟踪
function preventClickTracking() {
	const code="var count=0;(function(){if(!XN||!XN.json||!XN.json.build){if(count<10){setTimeout(arguments.callee,500)};count++;return};XN.json.oldBuildFunc=XN.json.build;XN.json.build=function(a,b,c){if(typeof a=='object'&&b==null&&c==null){if(!(a.ID===undefined)&&!(a.R===undefined)&&!(a.T===undefined)&&!(a.X===undefined)&&!(a.Y===undefined)){if(decodeURIComponent(a.R)==location.href){throw 'click-tracking prevented';return;}}}return XN.json.oldBuildFunc(a,b,c)}})()";
	$script(code);
};

// 将相册中所有照片放在一页中显示
// 压力测试：http://photo.renren.com/photo/242786354/album-236660334
function showImagesInOnePage() {
	if(!$("#single-column table.photoList").empty()) {
		// 公共主页相册
		var baseURL="http://page.renren.com/photo/album";
		var album=$("#single-column");
		var items=$(".pager-top>span");
		// images/page
		var ipp=album.find(".photoPan").size();
	} else { 
		var baseURL="http://photo.renren.com"+document.location.pathname;
		var album=$("div.photo-list");
		var items=$(".number-photo");
		// images/page
		var ipp=album.child(0).heirs();
	}
	if(album.empty() || items.empty()) {
		return;
	}
	// 获取相册信息
	var ownerId,albumId;
	$("head script:not([src])").each(function(elem) {
		var text=$(elem).text();
		if(text.match("albumId:[0-9]+,")) {
			albumId=/albumId:([0-9]+),/.exec(text)[1];
			ownerId=/ownerId:([0-9]+),/.exec(text)[1];
			return false;
		}
	});
	if(!ownerId) {
		return;
	}
	// 照片总数
	var photoAmount=parseInt(/共 *([0-9]+) *张/.exec(items.text())[1]);
	// 留下原始文字，防止后面出错
	var origText=items.text();
	items.text("共"+photoAmount+"张");
	// 总页数
	var maxPage=(photoAmount-1)/ipp;
	// 当前页数
	var curPage=/[?&]curpage=([0-9]+)/i.exec(XNR.url);
	if(curPage==null) {
		curPage=0;
	} else {
		curPage=parseInt(curPage[1]);
	}
	album.child(0).attr("page",curPage);
	for(var i=0;i<=maxPage;i++) {
		if(i==curPage) {
			continue;
		}
		$get(baseURL+"?id="+albumId+"&owner="+ownerId+"&curpage="+i,function(res,url,page) {
			if(!res) {
				$("ol.pagerpro").show();
				items.text(origText);
				return;
			}
			try {
				if($("#single-column table.photoList").size()>0) {
					var photoList=/(<table .*?class="photoList".*?>[\d\D]+?<\/table>)/.exec(res)[1];
				} else {
					var photoList=/<div .*? class="photo-list clearfix".*?>([\d\D]+?)<\/div>/.exec(res)[1];
				}
				var pos;
				if(page>parseInt(album.child(-1).attr("page"))) {
					pos=album.heirs();
				} else {
					// 二分查找法确定插入位置low
					var low=0,high=album.heirs()-1;
					while(low<=high) {
						mid=parseInt((low+high)/2);
						if(page>parseInt(album.child(mid).attr("page"))) {
							low=mid+1;
						} else {
							high=mid-1;
						}
					}
					pos=low;
				}
				album.insert($node("div").code(photoList).child(0).attr("page",page),pos);
			} catch (err) {
				$error("showImagesInOnePage::$get",err);
			}
		},i);
	}
	$("ol.pagerpro").hide();
};

// 在相册中添加生成下载页链接
// 压力测试：http://photo.renren.com/photo/242786354/album-236660334
function addDownloadAlbumLink(linkOnly) {
	var downLink=$node("a").attr({"style":'background-image:none;padding-left:10px',"href":'#nogo'}).text("下载当前页图片");
	if(!$(".function-nav.photolist-pager ul.nav-btn").empty()) {
		$(".function-nav.photolist-pager ul.nav-btn").append($node("li").attr("class","pipe").text("|")).append($node("li").append(downLink));
	} else {
		$(".pager-bottom").prepend(downLink);
	}
	downLink.hook("click",function(evt) {
		if(downLink.text().match("分析中")) {
			if(confirm("要中止吗？")) {
				finish();
			}
			return;
		}
		$alloc("download_album").images=[];
		var links=$(".photo-list span.img a, table.photoList td.photoPan>a");
		var totalImage=links.size();
		if(totalImage==0) {
			return;
		}
		var cur=0;
		links.attr("down","down")
		downLink.text("分析中...(0/"+totalImage+")");
		links.each(function(elem) {
			if(!downLink.text().match("分析中")) {
				return false;
			}
			$get(elem.href,function(html,url,target) {
				if(html==null) {
					return;
				}
				if(!downLink.text().match("分析中")) {
					return;
				}
				var imageSrc="";
				try {
					if(html.search("<body id=\"errorPage\">")!=-1) {
						return;
					}
					var src=/var photo *= *({.*});?/.exec(html);
					if(src) {
						src=JSON.parse(src[1]);
						if(src.photo && src.photo.large) {
							imageSrc=src.photo.large;
							return;
						}
					}
					// 公共主页相册
					var src=/XN.PAGE.albumPhoto.init\((.*?)\);/.exec(html);
					if(src) {
						src=JSON.parse("["+src[1].replace(/'.*?'/g,"0")+"]")[10];
						if(src && src.photo && src.photo.large) {
							imageSrc=src.photo.large;
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
				} catch(err) {
					$error("addDownloadAlbumLink::$get",err);
				} finally {
					if(imageSrc) {
						if(linkOnly) {
							$alloc("download_album").images.push("<a href=\""+imageSrc+"\">"+imageSrc+"</a>");
						} else {
							$alloc("download_album").images.push("<img src=\""+imageSrc+"\"/>");
						}
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
				}
			},elem);
		});
		function finish() {
			if($alloc("download_album").images.length>0) {
				var data="来源："+XNR.url+"<br/><br/>";
				var failedImages=$(".photo-list span.img a[down],table.photoList td.photoPan>a[down]");
				if(failedImages.size()>0) {
					var failedImagesList=[];
					failedImages.each(function(elem) {
						if(linkOnly) {
							failedImagesList.push("<span>"+elem.href+"</span>");
						} else {
							failedImagesList.push("<a href=\""+elem.href+"\">"+elem.href+"</a>");
						}
					});
					data+="未能取得以下页面的图片：<br/>"+failedImagesList.join("<br/>")+"<br/><br/>";
				}
				if(linkOnly) {
					data+="使用下载工具"+(XNR.agent==FIREFOX?"（推荐使用Flashgot或Downthemall扩展）":"")+"下载本页全部链接即可得到";
				} else {
					data+="完整保存本页面（最好等待本页图片全部显示完毕后再保存）即可在与页面文件同名的文件夹下得到";
				}
				data+=(failedImages.size()>0?"其余的":"下列")+$alloc("download_album").images.length+"张图片<br/>"+$alloc("download_album").images.join(linkOnly?"<br/>":"");
				var title=$(".ablum-Information .Information h1").text();
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

				if(XNR.agent==USERSCRIPT) {
					var url="javascript:'<meta content=\"text/html;charset=UTF-8\" http-equiv=\"Content-Type\"><title>"+title+"</title><style>img{height:128px;width:128px;border:1px solid #000000;margin:1px}</style>"+data+"'";
					window.open(url);
				} else if(XNR.agent==FIREFOX) {
					gBrowser.selectedTab=gBrowser.addTab("chrome://xiaonei-reformer/content/album.html#d&"+escape(data)+"&t&"+escape(title)+"&");
				} else if(XNR.agent==CHROME) {
					chrome.extension.sendRequest({action:"album",data:data,title:title});
				}
			}
			$dealloc("download_album");
			downLink.text("下载当前页图片");
			$(".photo-list span.img a,table.photoList td.photoPan>a").attr({down:null})
		};
	});
};

// 当鼠标在照片上时隐藏圈人框
function hideImageTagOnMouseOver() {
	$("#photoContainer").attr({"onmouseover":"document.querySelector('.tagshowcon').style.visibility='hidden'","onmouseout":"document.querySelector('.tagshowcon').style.visibility=null"});
};

// 选中“悄悄话”选框
function useWhisper() {
	var chk=$('#whisper');
	if(!chk.empty() && chk.prop("checked")==false) {
		$script(chk.prop("checked",true).attr("onclick"));
	}
};

// 去除只有星级用户才能修改特别好友的限制
function removeBestFriendRestriction() {
	// user.vip改了也没用，非VIP还是最多6个
	const code="window.user.star=true";
	$script(code);
};

// 允许修改昵称
function removeNicknameRestriction() {
	var code="window.XN.page.ProfileEdit.basicInfo.checkNkName=function(){}";
	$script(code);
	var input=$("#nkname");
	if(input.empty()) {
		if($("#basicInfo_form>p>#name").empty()) {
			return;
		}
		var holder=$(".status-holder");
		try {
			var nkname=holder.get().childNodes[holder.find("h1.username").index()+1].textContent;
			nkname=nkname.replace(/\n/g,"").replace(/^[ \t]+|[ \t]+$/,"").replace(/^\(/,"").replace(/\)$/,"");
		} catch(err) {
			var nkname="";
		}
		$node("p").code('<label for="nkname"><span>昵称:\n</span>\t</label><input type="text" class="input-text" id="nkname" value="" tabindex="1" maxlength="12" name="name"/>').insertTo($("#basicInfo_form"),$("#basicInfo_form>p").filter("#name").index()+1);
		$("#nkname").value(nkname);
	} else if(input.attr("readonly")) {
		input.attr({readonly:null});
		input.superior().find("span.hint.gray").remove();
	} else {
		return;
	}
	$("#feedInfoAjaxDiv").unhook("DOMNodeInserted",arguments.callee);
};

// 显示上一次登录信息
function showLoginInfo(lastSid) {
	var sid=$cookie("xnsid");
	if(!sid || sid==lastSid) {
		return;
	}
	$save("lastSid",sid);
	$get("http://safe.renren.com/ajax.do?type=logInfo",function(data) {
		if(data==null) {
			return;
		}
		data=data.replace(/<(\/?)a[^>]*>/g,"<$1span>").replace("<dt>当前登录信息</dt>","");
		data+="<div><a style='float:right;padding:5px' href='http://safe.renren.com/alarm.do' target='_blank'>更多信息<a></div>";
		$popup("登录信息",data,"0x0-5-5",15,5);
	});
};

// 快速通道菜单
function enableShortcutMenu(evt) {
	var t=evt.target;
	if(t.id=="stealthMenu" || t.parentNode.id=="stealthMenu") {
		return;
	}
	// bypass the BUG：http://code.google.com/p/chromium/issues/detail?id=39978
	// 当Firefox限制了最小字体>=14时也会出现相似问题
	if($allocated("shortcut_menu")) {
		var rect=$alloc("shortcut_menu").menu.getBoundingClientRect();
		if(evt.clientX>=rect.left && evt.clientX<=rect.right && evt.clientY>=rect.top && evt.clientY<=rect.bottom) {
			return;
		}
	}
	$("#stealthMenu").remove();
	$dealloc("shortcut_menu");
	if(t.tagName=="SPAN" && t.childElementCount==0 && !t.nextSibling && !t.previousSibling && t.parentNode.tagName=="A") {
		t=t.parentNode;
	}
	if(t.tagName!="A" || !/\/profile\.do/.test(t.href)) {
		return;
	}
	if(t.id || /#|&v=/.test(t.href) || t.style.backgroundImage) {
		return;
	}
	var text=$(t).text().replace(/[ \t\n\r]/g,"");
	if(text=="" || text.length>=15) {	// 名字长度<=12
		return;
	}
	var id=/[&?]id=([0-9]+)/.exec(t.href)[1];
	if(XNR.userId==id) {
		return;
	}
	var pages={
		"Ta的相册":"http://photo.renren.com/getalbumlist.do?id=@@",
		"圈Ta的照片":"http://photo.renren.com/someonetagphoto.do?id=@@", // http://photo.renren.com/photo/@@/relatives/hasTags
		"Ta的日志":"http://blog.renren.com/GetBlog.do?id=@@",	// http://blog.renren.com/blog/@@/friends
		"与Ta相关的日志":"http://blog.renren.com/SomeoneRelativeBlog.do?id=@@", // http://blog.renren.com/blog/@@/friendsRelatives
		"Ta的分享":"http://share.renren.com/share/ShareList.do?id=@@",
		"Ta的留言板":"http://gossip.renren.com/getgossiplist.do?id=@@",
		"Ta的好友":"http://friend.renren.com/GetFriendList.do?id=@@",
		"Ta的状态":"http://status.renren.com/status/@@",
		"Ta的礼物":"http://gift.renren.com/show/box/otherbox?userId=@@",
		"Ta的游戏徽章":"http://game.renren.com/medal?uid=@@",
		"Ta的公共主页":"http://page.renren.com/home/friendspages/view?uid=@@",
		"Ta的公开资料":"http://browse.renren.com/searchEx.do?ajax=1&q=@@",
	};
	var html="";
	for(var i in pages) {
		html+="<a target='_blank' href='";
		html+=pages[i].replace("@@",id);
		html+="'>"+i+"</a><br/>"
	}
	var rect=t.getBoundingClientRect();
	// absolute在放大页面的情况下会出现文字被错误截断导致宽度极小的问题
	var node=$node("div").code(html).attr("id","stealthMenu").style({position:"absolute",left:parseInt(rect.left+window.scrollX)+"px",top:parseInt(rect.bottom+window.scrollY)+"px",backgroundColor:"#EBF3F7",opacity:0.88,padding:"5px",border:"1px solid #5C75AA",zIndex:99999}).appendTo(document.body);
	$alloc("shortcut_menu").menu=t;
};

// 允许优酷全屏播放
function enableYoukuFullscreen() {
	if(!$("#sharevideo img.videoimg").empty()) {
		$("#sharevideo").hook("DOMNodeInserted",arguments.callee);
		return;
	} else {
		$("#sharevideo").unhook("DOMNodeInserted",arguments.callee);
	}
	$("embed[src*='youku.com']").each(function(elem) {
		elem.src=elem.src.replace(/(http:\/\/player\.youku\.com[^"]*)(\/v.swf)/,"$1&winType=interior$2");
		elem.src=elem.src.replace(/(http:\/\/static\.youku\.com[^"]*)/,'$1&winType=interior');
		$(elem).attr("flashvars","winType=interior").switchTo(elem);
	});
};

// 检查更新
function checkUpdate(manualCheck,checkLink,scriptLink,lastCheck) {
	//lastCheck="2000-1-1";
	var today=new Date();
	if(lastCheck) {
		lastCheck=new Date(lastCheck);
	} else {
		lastCheck=today;
	}
	//一天只检查一次
	if(!manualCheck && (today-lastCheck)<3600000*24) {
		return;
	}
	if(manualCheck) {
		$(".xnr_op #manualCheck").attr({disabled:"disabled",value:"检查中..."});
	}
	$get(checkLink,function(html) {
		try {
			var miniver=(/@miniver[ \t]+(\d+)/.exec(html) || ["","0"])[1];
			var ver=(/@version[ \t]+([0-9\.]+)/.exec(html) || ["","未知"])[1];
			if(parseInt(miniver)>XNR.miniver) {
				var pop=$popup(null,'<div style="color:black"><div>人人网改造器已有新版本：<br/>'+ver+' ('+miniver+')</div><div class="links" style="padding-top:5px;padding-bottom:5px;float:right"><a target="_blank" href="'+scriptLink+'">安装</a></div></div>',null,30,5);
				pop.find(".links a").hook("click",function() {
					pop.remove();
				});
			} else if(manualCheck) {
				// 手动点击检查更新按钮时要弹出提示
				alert("最新版本为："+ver+" ("+miniver+")\n当前版本为："+XNR.version+" ("+XNR.miniver+")\n\n无须更新");
			}

			$(".xnr_op #lastUpdate").text($formatDate(today));
			$save("lastUpdate",today.toString());

			if(manualCheck) {
				$(".xnr_op #manualCheck").attr({disabled:null,value:"立即检查"});
			}
		} catch(err) {
			$error("checkUpdate::$get",err);
		}
	});
};

// 升级后提示
function updatedNotify(notify,lastVersion) {
	if(notify) {
		var lastVer=parseInt(lastVersion);
		// 首次运行。。？
		if(lastVer>0 && lastVer<XNR.miniver) {
			$popup(null,'<div style="color:black">人人网改造器已经更新到:<br/>'+XNR.version+' ('+XNR.miniver+')</div><div><a href="http://code.google.com/p/xiaonei-reformer/source/browse/trunk/Release.txt" style="padding-top:5px;padding-bottom:5px;float:right" target="_blank">查看更新内容</a></div>',null,20,5);
		}
	}
	$save("lastVersion",XNR.miniver);
};



// 生成诊断信息
function diagnose() {
	var str="";
	str+="运行环境："+navigator.userAgent+"\n";
	str+="当前页面："+XNR.url+"\n";
	str+="程序版本："+XNR.version+"("+XNR.miniver+") - "+XNR.agent+"\n";
	str+="功能："+JSON.stringify(XNR.options)+"\n\n\n";
	$("div.xnr_op #diagnosisInfo").value(str);
};

/* 所有功能完毕 */


// 主执行函数。
function main(savedOptions) {
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
	//     [String]type:类型，支持如下类型："check"（<input type="checkbox"/>）,"edit"（<textarea/>）,"button"（<input type="button"/>）,"input"（<input/>）,"label"（<span/>）,"hidden"（不生成实际控件）,"warn"（<input type="image"/>）,"info"（<input type="image"/>）。默认为check
	//     [Any]value:默认值。type为hidden或readonly为真时可以没有value
	//     [Object]verify:{验证规则:失败信息,...}。验证规则为正则字串。可选
	//     [String]style:样式。可选
	//     [Boolean]readonly:控件只读。可选
	//     [String]format:值格式。显示时会自动转换。目前只支持"date"。
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
	//     [String]type:类型，支持如下类型："check"（<input type="checkbox"/>）,"edit"（<textarea/>）,"button"（<input type="button"/>）,"input"（<input/>）,"label"（<span/>）,"hidden"（不生成实际控件）。默认为check
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
						trigger:{"ul#feedHome":"DOMNodeInserted"},
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
					}],
				}],
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
				text:"##去除音乐播放器",
				ctrl:[{
					id:"removeMusicPlayer",
					value:false,
					fn:[{
						name:removeMusicPlayer,
						stage:0,
						fire:true,
					}],
				}],
			},{
				text:"##去除页面飘浮物",
				ctrl:[{
					id:"removeFloatObject",
					value:false,
					fn:[{
						name:removeFloatObject,
						stage:0,
						fire:true,
					}],
				}],
				page:"profile",
			},{
				text:"##去除页面自定义鼠标指针",
				ctrl:[{
					id:"removeMouseCursor",
					value:false,
					fn:[{
						name:removeMouseCursor,
						stage:0,
						fire:true,
					}],
				}],
				page:"profile",
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
				page:"blog",
			},{
				text:"##去除底部工具栏",
				ctrl:[{
					id:"removeBottomBar",
					value:false,
					fn:[{
						name:removeBottomBar,
						stage:0,
						fire:true,
					}],
				}]
			},{
				text:"##去除右下角系统通知",
				ctrl:[{
					id:"removeSysNotification",
					value:false,
					fn:[{
						name:removeSysNotification,
						stage:0,
						fire:true,
					}]
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
						id:"levelBar",
						text:"##个人等级栏",
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
						id:"sponsors",
						text:"##赞助商内容",
						value:false,
					},{
						id:"publicPage",
						text:"##公共主页推荐",
						value:false,
					},{
						id:"publicPageAdmin",
						text:"##公共主页管理",
						value:false,
					},{
						id:"birthday",
						text:"##好友生日",
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
						id:"newStar",
						text:"##人气之星/新人栏",
						value:false,
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
				ctrl:[
					{
						id:"levelBar",
						text:"##等级栏",
						value:false,
					},{
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
						id:"specialFriends",
						text:"##特别好友",
						value:false,
					},{
						id:"mutualFriends",
						text:"##共同好友",
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
						name:hideRequest,
						stage:1,
						args:["@hideRequestGroup"]
					}],
				}],
				login:true,
				page:"home",
			},{
				id:"hideRequestGroup",
				text:"隐藏首页上以下类型的请求",
				column:3,
				ctrl:[
					{
						id:"appRequest",
						text:"##应用请求",
						value:false,
					},{
						id:"nodifyRequest",
						text:"##通知",
						value:false,
					},{
						id:"pokeRequest",
						text:"##招呼",
						value:false,
					},{
						id:"recommendRequest",
						text:"##好友推荐",
						value:false,
					},{
						id:"friendRequest",
						text:"##好友申请",
						value:false,
					},{
						id:"tagRequest",
						text:"##圈人",
						value:false,
					},{
						id:"otherRequest",
						text:"##其他请求",
						value:false,
					},
				],
			},{
				text:"##",
				ctrl:[{
					type:"hidden",
					fn:[{
						name:rejectRequest,
						stage:0,
						args:["@rejectRequestGroup"]
					}],
				}],
				login:true,
			},{
				id:"rejectRequestGroup",
				text:"自动拒绝以下类型的请求",
				info:"由于是在后台进行拒绝，首页上可能仍然会显示有请求待处理",
				column:3,
				ctrl:[
					{
						id:"appRequest",
						text:"##应用请求",
						value:false,
					},{
						id:"recommendRequest",
						text:"##好友推荐",
						value:false,
					},{
						id:"friendRequest",
						text:"##好友申请",
						value:false,
					},{
						id:"tagRequest",
						text:"##圈人",
						value:false,
					},{
						id:"pokeRequest",
						text:"##招呼",
						value:false,
					}
				]
			},{
				text:"##自动屏蔽应用通知##",
				ctrl:[
					{
						id:"blockAppNotification",
						value:false,
						fn:[{
							name:blockAppNotification,
							stage:0,
							fire:true
						}],
					},{
						type:"info",
						value:"在“站内信”->“通知”处可以解除屏蔽",
					}
				],
				login:true,
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
						args:[null,"@feedGroup","@markFeedAsRead"],
						trigger:{"ul#feedHome":"DOMNodeInserted"},
					}],
				}],
				login:true,
				page:"home,profile"
			},{
				id:"feedGroup",
				text:"隐藏以下类型的新鲜事",
				column:4,
				ctrl:[
					{
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
						id:"image",
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
						id:"share",
						text:"##分享",
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
						text:"##连接",
						value:false
					},{
						id:"friend",
						text:"##交友",
						value:false
					},{
						id:"vip",
						text:"##VIP相关",
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
					}
				]
			},{
				text:"##将隐藏的新鲜事设为已读",
				ctrl:[{
					id:"markFeedAsRead",
					value:false
				}],
			},{
				text:"##默认显示##页新鲜事",
				ctrl:[
					{
						id:"loadMoreFeeds",
						value:false,
						fn:[{
							name:loadMoreFeeds,
							stage:2,
							fire:true,
							args:["@loadFeedPage"]
						}]
					},{
						id:"loadFeedPage",
						type:"input",
						value:"2",
						style:"width:15px;margin-left:3px;margin-right:3px",
						verify:{"^[2-9]$":"新鲜事页数只能为2~9"}
					}
				],
				master:0,
				login:true,
				page:"home"
			},{
				text:"##窗口滚动到底部时不加载下一页新鲜事",
				ctrl:[{
					id:"disableAutoLoadFeeds",
					value:false,
					fn:[{
						name:disableAutoLoadFeeds,
						stage:1,
						fire:true
					}]
				}],
				login:true,
				page:"home"
			},{
				text:"##隐藏新鲜事具体内容",
				ctrl:[{
					id:"hideFeedContent",
					value:false,
					fn:[{
						name:hideFeedContent,
						stage:0,
						fire:true
					}]
				}],
				login:true,
				page:"home,profile"
			},{
				text:"##去除状态新鲜事上的链接",
				ctrl:[{
					id:"removeStatusFeedLink",
					value:false,
					fn:[{
						name:removeStatusFeedLink,
						stage:1,
						fire:true
					}]
				}],
				login:true,
				page:"home"
			},{
				text:"##在新鲜事中标记在线好友",
				ctrl:[{
					id:"markOnlineFriend",
					value:false,
					fn:[{
						name:markOnlineFriend,
						stage:1,
						fire:true,
						trigger:{"ul#feedHome":"DOMNodeInserted"}
					}]
				}],
				login:true,
				page:"home"
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
				page:"home,profile,pages"
			},{
				text:"##自动检查并提醒新的新鲜事，每隔##秒检查一次",
				ctrl:[
					{
						id:"autoCheckFeeds",
						value:false,
						fn:[{
							name:autoCheckFeeds,
							stage:3,
							fire:true,
							args:["@checkFeedInterval","@feedGroup"]
						}]
					},{
						id:"checkFeedInterval",
						type:"input",
						value:"120",
						verify:{"^[3-9][0-9]$|^[1-9][0-9]{2,}$":"检查新鲜事间隔时间不得小于30秒"},
						style:"width:30px;margin-left:3px;margin-right:3px"
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
						style:"width:30px;margin-left:3px;margin-right:3px"
					},{
						type:"warn",
						value:"刷新时会导致正在回复的内容遗失，请慎重启用"
					}
				],
				master:0,
				login:true,
				page:"home"
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
				text:"##增加导航栏项目####",
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
						value:"每两行描述一项。第一行为显示的名称，第二行为对应的链接地址"
					},{
						id:"navItemsContent",
						type:"edit",
						style:"width:99%;height:80px;overflow:auto;word-wrap:normal;margin-top:5px",
						value:"论坛\nhttp://club.renren.com/\n校园频道\nhttp://school.renren.com/"
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
						args:["@removePageTheme"]
					}],
				},{
					type:"info",
					value:"使用早期的类Facebook配色。在有模板的页面不会修改其配色",
				}]
			},{
				text:"##使用大号新鲜事删除按钮",
				ctrl:[{
					id:"recoverBigDeleteBtn",
					value:false,
					fn:[{
						name:recoverBigDeleteBtn,
						stage:0,
						fire:true,
					}],
				}],
				login:true,
				page:"home,profile"
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
							args:["@headsAmount"]
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
				text:"##将个人主页上留言板移至新鲜事下方",
				ctrl:[{
					id:"moveMessageBoardToBottom",
					value:false,
					fn:[{
						name:moveMessageBoardToBottom,
						stage:1,
						fire:true
					}]
				}],
				login:true,
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
							fire:true
						}]
					},{
						type:"info",
						value:"如果您将浏览器字体的最小大小设成大于12，可能会出现论坛的栏目导航栏和帖子正文偏右的错误。如果您遇到这个问题，请启用此功能。",
					}
				],
				page:"club"
			}
		],
		"辅助功能":[
			{
				text:"##增加额外的表情项",
				ctrl:[{
					id:"addExtraEmotions",
					value:true,
					fn:[{
						name:addExtraEmotions,
						stage:2,
						fire:true
					}],
				}],
				page:"home,profile,status",
				login:true
			},{
				text:"##为评论增加楼层计数##",
				ctrl:[
					{
						id:"addFloorCounter",
						value:false,
						fn:[{
							name:addFloorCounter,
							stage:2,
							trigger:{"div.replies":"DOMNodeInserted"},
							fire:true
						}]
					},{
						type:"info",
						value:"当有悄悄话存在时，人人网显示的评论数和实际能看到的评论数量会有差异，这会导致脚本的计数出现偏差"
					}
				],
				login:true,
				page:"blog,photo"
			},{
				text:"##允许在日志中添加HTTPS/FTP协议的链接",
				ctrl:[{
					id:"addBlogLinkProtocolsSupport",
					value:true,
					fn:[{
						name:addBlogLinkProtocolsSupport,
						stage:3,
						fire:true
					}]
				}],
				login:true,
				page:"blog"
			},{
				text:"##阻止点击跟踪####",
				ctrl:[
					{
						id:"preventClickTracking",
						value:false,
						fn:[{
							name:preventClickTracking,
							stage:2,
							fire:true
						}]
					},{
						type:"info",
						value:"可能是出于收集分析用户行为的目的，当你在人人网的绝大多数页面点击鼠标时，会在后台向网站发送你的ID/点击的位置/所在页面等相关信息。这个可以在Chrome开发者工具中的Resources项或者Firefox的Firebug扩展的Net项中看到，具体表现为向dj.renren.com发送了一个名为click的图像请求。如果你不想让网站搜集这些信息，可以启用本功能。启用本功能后每一次点击将会引发一次异常。"
					},{
						type:"warn",
						value:"启用本功能有极小的潜在可能性导致一些网站功能失效。如果遇到这种问题，请报告作者"
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
				login:true,
				page:"album"
			},{
				text:"##允许下载相册图片##  ##仅生成图片链接",
				ctrl:[
					{
						id:"addDownloadAlbumLink",
						value:true,
						fn:[{
							name:addDownloadAlbumLink,
							stage:2,
							fire:true,
							args:["@showImageLinkOnly"]
						}]
					},{
						type:"info",
						value:"在相册图片列表下方会生成一个”下载当前页图片“链接。如果点击链接后进度长期卡住，再点击一次链接选择中止，可以下载其他已分析完毕的图片。"+(XNR.agent==USERSCRIPT?"请注意允许弹出窗口，即将浏览器设置about:config中的browser.popups.showPopupBlocker设为true。":"")+"如果想下载整个相册的内容，请配合“相册所有图片在一页中显示”功能使用。",
					},{
						id:"showImageLinkOnly",
						value:false,
					}
				],
				master:0,
				login:true,
				page:"album"
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
				text:"##允许修改个人昵称##",
				ctrl:[
					{
						id:"removeNicknameRestriction",
						value:false,
						fn:[{
							name:removeNicknameRestriction,
							stage:3,
							fire:"trigger",
							trigger:{"#feedInfoAjaxDiv":"DOMNodeInserted"}
						}]
					},{
						type:"info",
						value:"启用本功能后，在“设置”->“资料编辑”->“基本信息”中编辑昵称"
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
				text:"##启用快速通道菜单##",
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
					}
				]
			},{
				text:"##允许全屏观看优酷视频分享",
				ctrl:[{
					id:"enableYoukuFullscreen",
					value:true,
					fn:[{
						name:enableYoukuFullscreen,
						stage:1,
						fire:true
					}]
				}],
				page:"share,blog",
			}
		],
		"自动更新":[
			{
				text:"##自动检查脚本更新##",
				ctrl:[
					{
						id:"checkUpdate",
						value:true,
						fn:[{
							name:checkUpdate,
							stage:2,
							fire:true,
							args:[null,"@checkLink","@scriptLink","@lastUpdate"]
						}]
					},{
						type:"info",
						value:"24小时内最多检查一次"
					}
				],
				agent:USERSCRIPT
			},{
				text:"最后一次检查更新时间：##",		// 最后一次更新时间
				ctrl:[{
					id:"lastUpdate",
					type:"label",
					value:"",
					format:"date"
				}],
				agent:USERSCRIPT
			},{
				text:"##",
				ctrl:[{
					id:"manualCheck",
					type:"button",
					value:"立即检查",
					fn:[{
						name:checkUpdate,
						fire:"click",
						args:[null,"@checkLink","@scriptLink","@lastUpdate"]
					}]
				}],
				agent:USERSCRIPT
			},{
				text:"检查更新地址：##",
				ctrl:[{
					id:"checkLink",
					type:"input",
					value:"http://userscripts.org/scripts/source/45836.meta.js",
					style:"width:330px",
					verify:{"[A-Za-z]+://[^/]+\.[^/]+/.*":"请输入正确的检查更新地址"}
				}],
				agent:USERSCRIPT
			},{
				text:"脚本下载地址：##",
				ctrl:[{
					id:"scriptLink",
					type:"input",
					value:"http://userscripts.org/scripts/source/45836.user.js",
					style:"width:330px;",
					verify:{"[A-Za-z]+://[^/]+\.[^/]+/.*":"请输入正确的脚本下载地址"},
				}],
				agent:USERSCRIPT
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
					type:"hidden"
				}]
			}
		],
		"诊断信息":[
			{
				text:"##如果您遇到功能出错，请在报告问题时附带上出错页面中的以下信息：##",
				ctrl:[
					{
						type:"hidden",
						fn:[{
							name:diagnose,
							stage:1,
						}],
					},{
						id:"diagnosisInfo",
						type:"edit",
						style:"width:99%;height:230px;margin-top:5px",
						readonly:true,
					}
				],
			}
		]
	};
	// 信息和警告图片
	const infoImage="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuUlEQVQ4y2NgoDbQ9upiiK5eznD17sv/yDi2ajlYDi9wSZ+NoREdu2bNxa7ZJnkWXHPepH1YMUzeNnU6prPRNaMDdEOU3boRBoSWLWXApxmbIRHlyxAG4LIdFx+mHqcByBifNwgagE0zWQbgig24AWFogUgIgxNW7QpEIIKiBJsr8DlfxXMSalpwTpuJPyFN2ItIjXlzsKdGx9h2gknZLqYFf37gktJmCM2dhGFQaE4/A6eYKtUzLwMAfM0C2p5qSS4AAAAASUVORK5CYII%3D";
	const warnImage="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1ElEQVQ4y2NgoCVYz8BgsJyBwYQszUCNsv8ZGP6D8FIGBlWSDYBphmGSNC9jYNAGabqUkvL/cmYm2IAlDAympNsOA6S4YjUDgxVI8dX8fLj+6+XlYAPWsbB4kGQ7hMtAvCvWsrN7gxRdq6jAMOBWSwvYgE1sbJFE+x3FBUiuaGBgYMKp+Xpz839c4P7UqWA1QJfmomgGmYgR8thcgOSKmQwMrBi23+js/E8IPJ47FyNAudBTHbEY7gJjBgbdDgaG7k4GhqmEcDcDw2Qg7ogA5hWq5FgAlMwfVWL5pDoAAAAASUVORK5CYII%3D";
	// 显示tooltip，替代title
	const showTooltip=function(evt) {
		var tip=$alloc("optionsMenu_tooltip");
		var rect=evt.target.getBoundingClientRect();
		tip.w=$node("div").style({maxWidth:"300px",background:"#FFFFBF",border:"1px solid #CFCF3D",position:"fixed",zIndex:"200001",padding:"6px 8px 6px 8px",fontSize:"13px",left:(rect.right+3)+"px","top":(rect.bottom+3)+"px"});
		$node("span").text(evt.target.getAttribute("tooltip")).appendTo(tip.w);
		tip.w.appendTo(document.documentElement)
	};
	const hideTooltip=function(evt) {
		$alloc("optionsMenu_tooltip").w.remove();
		$dealloc("optionsMenu_tooltip");
	};
	// 函数执行队列。对应4个优先级，每一个优先级数组中的函数对象为{name:函数,args:函数参数,[trigger:{CSS选择器:事件名,...}]}
	var fnQueue=[[],[],[],[]];
	// 本地触发器队列
	var localTriggers=[];

	var categoryHTML="";
	var categoryPages=[];
	// 解析选项
	for(var category in optionMenu) {
		// 添加分类
		categoryHTML+="<li><span>"+category+"</span></li>";
		var page=$node("div");
		for(var iFunc=0;iFunc<optionMenu[category].length;iFunc++) {
			var o=optionMenu[category][iFunc];
			// 不适用于当前浏览器
			if(o.agent && (o.agent & XNR.agent)==0) {
				continue;
			}
			// 不执行函数，仅生成选项
			var noexec=false;
			// 检查执行功能页面限制
			if(o.page) {
				var p=o.page.split(",");
				noexec=true;
				for(var iPage=0;iPage<p.length;iPage++) {
					// 不适用于当前页面
					if($page(p[iPage])==true) {
						noexec=false;
						break;
					}
				}
			}
			// 检查登录限制
			if(o.login && XNR.userId=="0") {
				noexec=true;
			}
			// 放在一块中
			var block=$node("div");
			if(!o.id) {
				// 功能
				var text=o.text.split("##");
				for(var iText=0;iText<text.length;iText++) {
					// 文本节点
					if(text[iText]) {
						// 寻找前一个check作为关联目标
						var forCheck="";
						for(var iCtrl=iText-1;iCtrl>=0;iCtrl--) {
							if(!o.ctrl[iCtrl].type || o.ctrl[iCtrl].type=="check") {
								forCheck=o.ctrl[iCtrl].id;
								break;
							}
						}
						$node("label").attr("for",forCheck).text(text[iText]).appendTo(block);
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
							node=$node("input").attr("type","checkbox");
							break;
						case "hidden":
							break;
						case "input":
							node=$node("input");
							break;
						case "edit":
							node=$node("textarea");
							break;
						case "button":
							node=$node("input").attr("type","button");
							break;
						case "label":
							node=$node("span");
							break;
						case "info":
							node=$node("input").attr({type:"image",src:infoImage,tooltip:control.value,tabIndex:-1});
							node.hook("mouseover",showTooltip).hook("mouseout",hideTooltip);
							control.value=null;
							break;
						case "warn":
							node=$node("input").attr({type:"image",src:warnImage,tooltip:control.value,tabIndex:-1});
							node.hook("mouseover",showTooltip).hook("mouseout",hideTooltip);
							control.value=null;
							break;
					}
					if(node) {
						if(control.value!=null) {
							switch(control.format) {
								case "date":
									node.value($formatDate(control.value));
									break;
								default:
									node.value(control.value);
									break;
							}
						}
						if(control.id) {
							node.attr("id",control.id);
						}
						if(control.style) {
							node.attr("style",control.style);
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
						node.appendTo(block);
					}
					if(control.value!=null) {
						XNR.options[control.id]=control.value;
					}

					// 相关函数
					if(!noexec && control.fn) {
						for(var iFn=0;iFn<control.fn.length;iFn++) {
							var fn=control.fn[iFn];
							// 没有设置参数的话，设置一个空的参数集，方便后面处理
							if(!fn.args) {
								fn.args=[];
							}
							if(fn.fire==null || (typeof fn.fire=="boolean" && node.value()==fn.fire)) {
								// 符合要求，放入执行序列
								fnQueue[fn.stage].push({name:fn.name,args:fn.args});
							} else if(fn.fire==="trigger" && node.value()) {
								// 只在trigger指定的事件触发时执行
							} else if(typeof fn.fire=="string" && fn.fire!="trigger") {
								// 参数中可能有本地参数@xxxx，需要转换。
								localTriggers.push({fn:fn,target:node});
							} else {
								continue;
							}
							// 其他节点触发事件
							if(fn.trigger) {
								// 只有等到DOM建立后页面节点才能保证可访问。所以优先级最小为1
								fnQueue[(fn.stage==0?1:fn.stage)].push({name:fn.name,args:fn.args,trigger:fn.trigger});
							}
						}
					}
				}
			} else {
				// 选项组
				if(o.text) {
					var node=$node("div").text(o.text).appendTo(block);
					if(o.info) {
						$node("input").attr({type:"image",src:infoImage,tooltip:o.info,tabIndex:-1}).hook("mouseover",showTooltip).hook("mouseout",hideTooltip).appendTo(node);
					}
					if(o.warn) {
						$node("input").attr({type:"image",src:warnImage,tooltip:o.info,tabIndex:-1}).hook("mouseover",showTooltip).hook("mouseout",hideTooltip).appendTo(node);
					}
				}
				var group={};
				var table=$node("tbody").appendTo($node("table").attr("class","group").appendTo(block));
				for(var i=0;i<o.ctrl.length;) {
					var tr=$node("tr").appendTo(table);
					for(var j=0;j<o.column;j++,i++) {
						var item=o.ctrl[i];
						var td=$node("td").appendTo(tr);
						if(i<o.ctrl.length) {
							// 如果控件值已保存，用保存的值替代默认值
							if(o.id && savedOptions[o.id]!=null && savedOptions[o.id][item.id]!=null) {
								item.value=savedOptions[o.id][item.id];
							}
							var text=item.text.split("##");
							if(text[0]) {
								$node("label").attr("for",o.id+"_"+item.id).text(text[0]).appendTo(td);
							}
							// 生成控件节点
							var node=null;
							switch(item.type || "check") {
								case "check":
									node=$node("input").attr("type","checkbox");
									break;
								case "hidden":
									break;
								case "input":
									node=$node("input");
									break;
								case "edit":
									node=$node("textarea");
									break;
								case "button":
									node=$node("input").attr("type","button");
									break;
								case "label":
									node=$node("span");
									break;
							}
							if(node) {
								node.value(item.value);
								node.attr({id:o.id+"_"+item.id,style:(item.style || "")});
								node.appendTo(td);
								// 输入验证
								if(item.verify) {
									node.attr("verify",JSON.stringify(control.verify));
								}
							}
							if(item.value!=null) {
								group[item.id]=item.value;
							}
							if(text[1]) {
								$node("label").attr("for",o.id+"_"+item.id).text(text[1]).appendTo(td);
							}
						}
					}
				}
				XNR.options[o.id]=group;
			}
			// 为主控件（仅明确指定的）添加值切换相应事件
			if(o.master!=null) {
				// block下只有一层，滤掉所有的label就是所有控件，选出对应序号的即可
				var target=block.find("*:not(label)").pick(o.master);
				// 做个标记，用在点击选项菜单取消按钮重置选项时
				target.attr("master","true");
				$master(target);
				// 主控件值改变只可能checkbox/input/textarea三种。click和keyup足够应付
				target.hook("click,keyup",function(evt) {
					$master($(evt.target));
				});
			}

			if(block.heirs()!=0) {
				page.append(block);
			}
		}
		// 将生成的页面div放入optionPages数组，方便后面加入到菜单
		categoryPages.push(page.style("display","none").get());
	}

	// 检查执行队列中的参数，如果是@开头就替换成对应选项值
	for(var iStage=0;iStage<4;iStage++) {
		for(var i=0;i<fnQueue[iStage].length;i++) {
			var fn=fnQueue[iStage][i];
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

	// 执行优先级为0的函数
	for(var i=0;i<fnQueue[0].length;i++) {
		var fn=fnQueue[0][i];
		try {
			fn.name.apply(null,fn.args);
		} catch(err) {
			$error(fn.name,err);
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
			t.target.hook(func.fire,function(evt) {
				func.args[0]=evt;
				func.name.apply(null,func.args);
			});
		})(fn);
	}
	

	// 生成选项菜单
	var menuHTML='<style type="text/css">.xnr_op{width:500px;position:fixed;z-index:200000;color:black;blackground:black;font-size:12px}.xnr_op *{padding:0;margin:0;border-collapse:collapse}.xnr_op a{color:#3B5990}.xnr_op table{width:100%;table-layout:fixed}.xnr_op .tl{border-top-left-radius:8px;-moz-border-radius-topleft:8px}.xnr_op .tr{border-top-right-radius:8px;-moz-border-radius-topright:8px}.xnr_op .bl{border-bottom-left-radius:8px;-moz-border-radius-bottomleft:8px}.xnr_op .br{border-bottom-right-radius:8px;-moz-border-radius-bottomright:8px}.xnr_op .border{height:10px;overflow:hidden;width:10px;background-color:black;opacity:0.5}.xnr_op .m{width:100%}.xnr_op .title {padding:4px;display:block;background:#3B5998;color:white;text-align:center;font-size:12px;-moz-user-select:none;-khtml-user-select:none;cursor:default}.xnr_op .btns{background:#F0F5F8;text-align:right}.xnr_op .btns>input{border-style:solid;border-width:1px;padding:2px 15px;margin:3px;font-size:13px}.xnr_op .ok{background:#5C75AA;color:white;border-color:#B8D4E8 #124680 #124680 #B8D4E8}.xnr_op .cancel{background:#F0F0F0;border-color:#FFFFFF #848484 #848484 #FFFFFF}.xnr_op>table table{background:#FFFFF4}.xnr_op .options>table{height:280px;border-spacing:0}.xnr_op .c td{vertical-align:top}.xnr_op .category{width:119px;min-width:119px;border-right:1px solid #5C75AA}.xnr_op li{list-style-type:none}.xnr_op .category li{cursor:pointer;height:30px;overflow:hidden}.xnr_op li:hover{background:#ffffcc;color:black}.xnr_op li:nth-child(2n){background:#EEEEEE}.xnr_op li.selected{background:#748AC4;color:white}.xnr_op .category span{left:10px;position:relative;font-size:14px;line-height:30px}.xnr_op .pages>div{overflow:auto;height:280px;padding:10px}.xnr_op .pages>div>div{min-height:18px}.xnr_op .pages>div>*{margin-bottom:5px;width:100%}.xnr_op table.group{margin-left:5px;margin-top:3px}.xnr_op .pages tr{line-height:20px}.xnr_op input[type="checkbox"]{margin-right:4px}.xnr_op label{color:black;font-weight:normal;cursor:pointer}.xnr_op label[for=""]{cursor:default}.xnr_op input[type="image"]{margin-left:2px;margin-right:2px}.xnr_op textarea{resize:none}.xnr_op .pages .default{text-align:center}.xnr_op .pages .default table{height:95%}.xnr_op .pages .default td{vertical-align:middle}.xnr_op .pages .default td>*{padding:5px}</style>';
	menuHTML+='<table><tbody><tr><td class="border tl"></td><td class="border m"></td><td class="border tr"></td></tr><tr><td class="border"></td><td class="c m"><div class="title">改造选项</div><div class="options"><table><tbody><tr><td class="category"><ul>'+categoryHTML+'</ul></td><td class="pages"><div class="default"><table><tbody><tr><td><h1>人人网改造器</h1><p><b>'+XNR.version+' ('+XNR.miniver+')</b></p><p><b>Copyright © 2008-2010</b></p><p><a href="mailto:xnreformer@gmail.com">xnreformer@gmail.com</a></p><p><a href="http://xiaonei-reformer.googlecode.com/" target="_blank">项目主页</a></p></td></tr></tbody></table></div></td></tr></tbody></table></div><div class="btns"><input type="button" value="确定" class="ok"/><input type="button" value="取消" class="cancel"/></div></td><td class="border"></td></tr><tr><td class="border bl"></td><td class="border m"></td><td class="border br"></td></tr></tbody></table>';

	var menu=$node("div").attr("class","xnr_op").style("display","none").code(menuHTML).appendTo(document.documentElement);
	menu.find("td.pages").append($(categoryPages));

	// 点击分类切换事件
	menu.find(".category ul").hook("click",function(evt) {
		var t=$(evt.target);
		if(t.prop("tagName")=="SPAN") {
			t=t.superior();
		}
		menu.find(".pages>div").hide();
		menu.find(".pages>div").pick(t.index()+1).show();
		menu.find(".category li.selected").removeClass("selected");
		t.addClass("selected");
	});

	// 点击取消按钮事件
	menu.find(".cancel").hook("click",function(evt) {
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
						c.value(group[item]);
					}
				}
			} else { 
				var c=menu.find("#"+op);
				if(c.empty()) {
					continue;
				} else {
					switch(c.attr("fmt")) {
						case "date":
							c.value($formatDate(XNR.options[op]));
							break;
						default:
							c.value(XNR.options[op]);
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
	menu.find(".ok").hook("click",function(evt) {
		// 先进行验证
		var pass=true;
		menu.find("*[verify]:not([disabled])").each(function(elem) {
			var node=$(elem);
			var rules=JSON.parse(node.attr("verify"));
			for(var rule in rules) {
				if(!node.value().match(new RegExp(rule))) {
					// 转到对应的页面
					var page=node;
					while(page.superior().prop("className")!="pages") {
						page=page.superior();
					}
					var index=page.index()
					menu.find(".pages>div").hide().pick(index).show();
					menu.find(".category li").removeClass("selected").pick(index-1).addClass("selected");

					alert(rules[rule]);
					elem.focus();
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
					if(c.empty()) {
						continue;
					} else {
						var newValue=c.value();
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
				if(c.empty()) {
					continue;
				} else {
					var newValue=c.value();
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
	menu.find("div.title").hook("mousedown",function(evt) {
		// 只准左键拖
		if(evt.button!=0) {
			return;
		}
		window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
		var move=$alloc("drag_optionMenu");
		var menuRect=menu.get().getBoundingClientRect();
		move.x=evt.clientX-menuRect.left;
		move.y=evt.clientY-menuRect.top;
		evt.target.style.cursor="move";
	}).hook("mouseup",function(evt) {
		if($allocated("drag_optionMenu")) {
			$dealloc("drag_optionMenu");
			window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
			evt.target.style.cursor=null;
		}
	});
	$(document.documentElement).hook("mousemove",function(evt) {
		if($allocated("drag_optionMenu")) {
			var move=$alloc("drag_optionMenu");
			menu.style({left:(evt.clientX-move.x)+"px",top:(evt.clientY-move.y)+"px"});
		}
	});

	// 菜单在导航栏上的入口
	var entry=$node("div").attr("class","menu").append($node("div").attr("class","menu-title").append($node("a").attr({href:"#nogo",onclick:"return false"}).text("改造")));
	entry.find("a").hook("click",function() {
		menu.show().style({"top":parseInt(window.innerHeight-menu.prop("offsetHeight"))/2+"px","left":parseInt(window.innerWidth-menu.prop("offsetWidth"))/2+"px"});
	});

	// 执行剩下三个优先级的函数
	for(var p=1;p<=3;p++) {
		$wait(p,function (stage) {
			if(stage==2) {
				// 添加菜单入口项在页面DOM构建完毕后执行
				entry.prependTo($(".nav-body .nav-other"));
			}

			for(var i=0;i<fnQueue[stage].length;i++) {
				var fn=fnQueue[stage][i];
				if(fn.trigger) {
					// 触发器
					for(var t in fn.trigger) {
						// 将fn包在一个匿名函数中确保事件触发时能得到对应的fn
						(function(func) {
							$(t).hook(func.trigger[t],function(evt) {	
								try {
									func.args[0]=evt;
									func.name.apply(null,func.args);
								} catch(err) {
									$error(func.name,err);
								}
							});
						})(fn);
					}
				} else {
					// 一般功能
					try {
						fn.name.apply(null,fn.args);
					} catch(err) {
						$error(fn.name,err);
					}
				}
			}
		});
	}
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
 * 创建一个DOM节点
 * 参数
 *   [String]tag:节点的tagName，如果为空，则创建纯文本节点
 * 返回值
 *   [PageKit]节点对象
 */
function $node(name) {
	if(!name) {
		return PageKit(document.createTextNode(""));
	} else {
		return PageKit(document.createElement(name));
	}
};

/*
 * 判断URL是否属于某一类页面 TODO:完善页面类别
 * 参数
 *   [String]category:页面类别，可能的值参考函数内pages常量
 *   [String]url:默认为当前页面地址
 * 返回值
 *   [Boolean]:属于返回true，否则false。如果category非法，返回true。
 */
function $page(category,url) {
	const pages={
		home:"/[hH]ome\\.do",	// 首页
		profile:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren.com/\\?id=|renren.com/[a-zA-Z0-9_]{4,20}$", // 个人主页，最后一个是个人网址。http://safe.renren.com/personalLink.do
		blog:"/blog\\.renren\\.com/",	// 日志
		club:"/club\\.renren\\.com/",	// 论坛
		pages:"/page\\.renren\\.com/",	// 公共主页
		status:"/status\\.renren\\.com/",	// 状态
		photo:"/photo\\.renren\\.com/",	// 照片
		album:"photo\\.renren\\.com/getalbum|photo\\.renren\\.com/.*/album-[0-9]+|page\\.renren\\.com/.*/album|photo\\.renren\\.com/photo/ap/",	// 相册
		friend:"friend\\.renren\\.com/",	// 好友
		share:"share\\.renren\\.com/"	// 分享
	};
	if(!url) {
		url=XNR.url;
	}
	// 把锚点去掉
	url=url.replace(/#[\s\S]*$/,"");

	return pages[category]==null || url.match(pages[category])!=null;
};

/*
 * 申请一个全局对象
 * 参数
 *   [String]name:对象名称，可以为空。如果同名对象已经被分配，则返回那个对象
 * 返回值
 *   [Object]:对象
 */
function $alloc(name) {
	if(!name) {
		do {
			name="r"+Math.random();
		} while(!XNR.storage[name]);
	}
	if(XNR.storage[name]) {
		return XNR.storage[name];
	} else {
 		XNR.storage[name]=new Object();
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
	return XNR.storage[name]!=null;
};


/*
 * 解除全局对象分配
 * 参数
 *   [String]name:对象名称
 * 返回值
 *   无
 */
function $dealloc(name) {
	XNR.storage[name]=null;
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
	var node=$node("div").style({position:"fixed",backgroundColor:"#F0F5F8",border:"1px solid #B8D4E8",zIndex:100000,overflow:"hidden"});

	var geo=/^(\d+)x\d+([+-]?)(\d*)([+-]?)(\d*)$/.exec(geometry);
	if(!geo) {
		geo=["","200","+","5","-","5"];
	}
	node.style("width",(geo[1]=="0"?"auto":geo[1]+"px")).style((geo[2] || "+")=="+"?"left":"right",(geo[3] || "0")+"px").style((geo[4] || "-")=="+"?"top":"bottom",(geo[5] || "0")+"px");
	var closeLink=$node("a").style({cssFloat:"right",fontSize:"x-small",color:"white",cursor:"pointer"}).text("关闭").hook("click",function() {
		node.remove();
	});
	node.append($node("div").text((title || "提示")).append(closeLink).style({background:"#526EA6",color:"white",fontWeight:"bold",fontSize:"normal",padding:"3px"}));
	node.append($node("div").style("margin","5px").code(content)).appendTo(document.body);

	var maxHeight=parseInt(node.prop("clientHeight"));
	node.style("height","0px");
	// 展开
	setTimeout(function () {
		try {
			var h=parseInt(node.style("height"));
			if(h<maxHeight) {
				var diff=maxHeight-h;
				node.style("height",(h+(diff>popSpeed?popSpeed:diff))+"px");
				setTimeout(arguments.callee,timeout);
			} else {
				// 收起
				setTimeout(function () {
					try {
						var h=parseInt(node.style("height"));
						if(h<=0) {
							node.remove();
						} else {
							node.style("height",(h>popSpeed?h-popSpeed:0)+"px");
							setTimeout(arguments.callee,timeout);
						}
					} catch(err) {
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
		} catch(err) {
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
	 * Firefox 3.6.3/3.7a5pre：loading -> interactive -> completed
	 * Chromium 6.0.411.0 (47760)：loading -> loaded -> completed
	 * Opera 10.54：interactive -> interactive/completed -> completed
	 * 目前不支持Opera。
	 */
	var curStage=2;
	if(document.readyState=="loading") {
		curStage=0;
	} else if(document.readyState=="completed") {
		curStage=3;
	} else if(stage==1 || stage==2) {
		curStage=stage;
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
 * 返回值
 *   无
 */
function $script(code) {
	if(!code){
		return;
	}
	// 让脚本以匿名函数方式执行
	if(!/^\(function/.test(code)) {
		code="(function(){try{"+code+"}catch(ex){}})();";
	}
	if(XNR.agent==CHROME) {
		// 如果chrome用location方法，会发生各种各样奇怪的事。比如innerHTML失灵
		$node("script").text(code).appendTo(document.documentElement);
	} else {
		document.location.href="javascript:"+code;
	}
};

/*
 * 改变页面样式
 * 参数
 *   [String]style:CSS语句
 * 返回值
 *   [PageKit]:创建的style节点
 */
function $patchCSS(style) {
	return $node("style").attr("type","text/css").text(style).appendTo(document.documentElement);
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
	XNR.options[name]=value;
	var opts=JSON.stringify(XNR.options);
	switch(XNR.agent) {
		case USERSCRIPT:
			GM_setValue("xnr_options",opts);
			break;
		case FIREFOX:
			Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).setCharPref("extensions.xiaonei_reformer.xnr_options",escape(opts));
			break;
		case CHROME:
			chrome.extension.sendRequest({action:"save",data:opts});
			break;
	}
};

/*
 * 发送GET请求。支持跨域。Chrome跨域还需要在manifest.json配置权限。
 * 参数
 *   [String]url:页面地址
 *   [Function]func:回调函数。function(pageText,url,data){}。如果发生错误，pageText为null
 *   [Any]userData:额外的用户数据。可选。
 * 返回值
 *   无
 */
function $get(url,func,userData) {
	switch(XNR.agent) {
		case FIREFOX:
			var httpReq= new XMLHttpRequest();
			if(func!=null) {
				httpReq.onload=function() {
					func((httpReq.status==200?httpReq.responseText:null),url,userData);
				};
				httpReq.onerror=function() {
					func(null,url,userData);
				};
			}
		    httpReq.open("GET",url,true);
			httpReq.send();
			break;
		case USERSCRIPT:
			if(func!=null) {
				GM_xmlhttpRequest({method:"GET",url:url,onload:function(o) {
					func((o.status==200?o.responseText:null),url,userData);
				},onerror:function(o) {
					func(null,url,userData);
				}});
			} else {
				GM_xmlhttpRequest({method:"GET",url:url});
			}
			break;
		case CHROME:
			if(func==null) {
				chrome.extension.sendRequest({action:"get",url:url});
			} else {
				chrome.extension.sendRequest({action:"get",url:url},function(response) {
					func(response.data,url,userData);
				});
			}
			break;
	} 
};

/*
 * 记录错误信息
 * 参数
 *   [String/Function]func:发生错误的函数(名)
 *   [Error]error:异常对象
 * 返回值
 *   无
 */
function $error(func,error) {
	if(typeof func=="function") {
		func=/function (.*?)\(/.exec(func.toString())[1];
	}
	if(typeof error=="object" && error.name && error.message) {
		var msg="在 "+func+"() 中发生了一个错误。\n错误名称："+error.name+"\n错误信息："+error.message;
		if(XNR.agent!=USERSCRIPT) {
			msg="人人网改造器："+msg;
		}
		if(XNR.agent==FIREFOX) {
			Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(msg);
		} else {
			console.log(msg);
		}
		//TODO : 调试信息到选项菜单
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
	if(!master.value()) {
		// 写"*:not(#"+id+")"也可以。但为防止master忘了设置ID。。。
		p.find("*:not([id='"+master.attr("id")+"'])").prop("disabled",true);
		// warn和info不禁用
		p.find("input[type='image']").prop("disabled",false);
	} else {
		p.find("*").prop("disabled",false);
	}
};

/*
 * 判断新鲜事类型，feed为li经XNR包装
 * 参数
 *   [Node]feed:新鲜事li节点
 * 返回值
 *   [String]:新鲜事类型文本。无符合的返回""
 */
function $feedType(feed) {
	var types={
		// 标题文本，标题HTML，有无content，footerHTML
		"share":	["^分享"],
		"status":	["^:",null,false],	// 如果是纯表情状态，:后面的空格会被去除
		"blog":		["^发表日志"],
		"photo":	["^上传了\\d+张照片至|^的照片|美化了一张照片$|^:",null,true],
		"contact":	["^你和.*和好朋友保持联络$"],
		"profile":	["^修改了头像"],
		"app":		[null,"<a [^>]*href=\"http://apps?.renren.com/"],
		"gift":		["^收到","<a [^>]*href=\"http://gift.renren.com/"],
		"tag":		["照片中被圈出来了$"],
		"movie":	[null,"<a [^>]*href=\"http://movie.xiaonei.com/|<a [^>]*href=\"http://movie.renren.com/"],
		"connect":	[null,null,null,"<a [^>]*href=\"http://www.connect.renren.com/"],
		"friend":	["^和[\\s\\S]+成为了好友。|^、[\\s\\S]+和[\\s\\S]+成为了好友。"],
		"page":		[null,"<a [^>]*href=\"http://page.renren.com/"],
		"vip":		["^更换了主页模板皮肤|^更换了主页装扮|^成为了人人网[\\d\\D]*VIP会员特权|^收到好友赠送的[\\d\\D]*VIP会员特权|^开启了人人网VIP个性域名"],
		"music":	["^上传了音乐"],
		"poll":		[null,"<a [^>]*href=\"http://abc.renren.com/"],
		"group":	[null,"<a [^>]*href=\"http://group.renren.com/"],
		"levelup":	["^等级升至"],
	};

	var feedTitle=feed.find("h3");
	// 删除所有链接子节点，只留下文本节点
	var feedTitleText=feedTitle.clone();
	feedTitleText.find("a:not(.text)").remove();

	for(i in types) {
		var type=types[i];
		var feedText=type[0];
		var feedHTML=type[1];
		var feedContent=type[2];
		var feedFooterHTML=type[3];
		if ((!feedText || new RegExp(feedText).test(feedTitleText.text().replace(/^[ \t\n\r]+|[ \t\n\r]+$/g,""))) && (!feedHTML || new RegExp(feedHTML).test(feedTitle.code())) && (feedContent==null || feed.find("div.content").empty()!=feedContent) && (!feedFooterHTML || new RegExp(feedFooterHTML).test(feed.find(".details .legend").code()))) {
			return i;
		}
	}
	return "";
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
		d=new Date(d);
	}
	if(isNaN(d.getYear())) {
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

/* 基本辅助函数完 */


/*
 * PageKit，用于处理DOM节点
 */
function PageKit(o) {
	if(!(this instanceof PageKit)) {
		return o?new PageKit(arguments):null;
	};
	return this.init(o);
};
PageKit.prototype={
	// 初始化
	init: function(o) {
		// 包含的DOM节点
		this.nodes=[];
		for(var i=0;i<o.length;i++) {
			var selector=o[i];
			if(typeof selector=="string") {
				// CSS选择语句
				this.nodes=this.nodes.concat(Array.prototype.slice.call(document.querySelectorAll(selector)));
			} else if(selector.nodeType) {
				// DOM节点
				this.nodes=this.nodes.concat(Array(selector));
			} else if(selector instanceof PageKit) {
				// PageKit对象
				this.nodes=this.nodes.concat(o.nodes);
			} else {
				// 其他的东西，有可能是NodeList，全部包在Array里
				this.nodes=this.nodes.concat(Array.prototype.slice.call(selector));
			}
		}
		return this;
	},
	// 遍历对象的DOM节点，参数为一回调函数，function(elem,index){}，当有返回非undefined/null值时终止遍历;
	each:function(func) {
		if(typeof func == "function") {
			for(var i=0;i<this.nodes.length;i++) {
				try {
					if(!(func(this.nodes[i],i)==null)) {
						break;
					}
				} catch(err) {
					$error("PageKit::each",err);
				}
			}
		}
		return this;
	},
	// 获取对象中的DOM节点，如果index为-1取最后一个，默认为第一个
	get:function(index) {
		try {
			if(index==null) {
				index=0;
			} else if(index==-1) {
				index=this.nodes.length-1;
			}
			return this.nodes[index];
		} catch(err) {
			return null;
		}
	},
	// 获取对象中某一个DOM节点，经PageKit包装，如果index为-1取最后一个，默认为第一个
	pick:function(index) {
		return PageKit(this.get(index));
	},
	// 删除对象所有的DOM节点。如果safe为true，只有当其无子节点时才删除
	remove:function(safe) {
		this.each(function(elem) {
			if(!safe || elem.childElementCount==0) {
				elem.parentNode.removeChild(elem);
			}
		});
		this.nodes=[];
		return this;
	},
	// 删除对象所有DOM节点。如果safe为true，只有当其无子节点时才删除，如果删除后父节点无其他子节点，一并删除
	purge:function(safe) {
		this.each(function(elem) {
			if(!safe || elem.childElementCount==0) {
				var p=elem.parentNode;
				p.removeChild(elem);
				while (p.childElementCount==0) {
					var q=p.parentNode;
					q.removeChild(p);
					p=q;
				}
			}
		});
		this.nodes=[];
		return this;
	},
	// 隐藏对象所有的DOM节点
	hide:function() {
		this.each(function(elem) {
			elem.style.display="none";
		});
		return this;
	},
	// 显示对象所有的DOM节点
	show:function() {
		this.each(function(elem) {
			elem.style.display=null;
			elem.style.visibility=null;
		});
		return this;
	},
	// 转换对象所有节点为另一类型节点
	switchTo:function(o) {
		if(typeof o == "string") {
			o=document.createElement(o);
		} else if(o instanceof PageKit) {
			o=o.get();
		}
		if(o.nodeType) {
			var xnr=this;
			this.each(function(elem,index) {
				var newNode=o.cloneNode(false);
				while(elem.childNodes.length>0) {
					newNode.appendChild(elem.childNodes[0]);
				}
				elem.parentNode.replaceChild(newNode,elem);
				xnr.nodes[index]=newNode;
			});
		}
		return this;
	},
	// 获取对象中的DOM节点数量
	size:function() {
		return this.nodes.length;
	},
	// 获取对象中的DOM节点数量是否为空
	empty:function() {
		return this.nodes.length==0;
	},
	// 获取对象某个DOM节点的子节点数
	heirs:function(index) {
		try {
			return this.get(index).childElementCount;
		} catch(err) {
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
		} catch(err) {
			return 0;
		}
	},
	// 获取对象第一个DOM节点的某个子节点，index为-1时取最后一个。经PageKit包装
	child:function(index) {
		try {
			var node=this.get();
			return $(node.children[index!=-1?index:node.childElementCount-1]);
		} catch(err) {
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
			for(;level>0;level--) {
				s=s.parentNode;
			}
			return PageKit(s);
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的上一个相邻节点(经PageKit对象包装)
	previous:function() {
		try {
			return PageKit(this.get().previousElementSibling);
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的下一个相邻节点(经PageKit对象包装)
	next:function() {
		try {
			return PageKit(this.get().nextElementSibling);
		} catch(err) {
			return null;
		}
	},
	// 追加子节点
	append:function(o) {
		var node=this.get();
		if(!node) {
			return this;
		} else if(node.nodeType==1) {
			if(o instanceof PageKit) {
				o.each(function(elem) {
					node.appendChild(elem);
				});
			} else if(o.nodeType==1){
				node.appendChild(o);
			} else if(typeof o=="string") {
				node.innerHTML+=o;
			}
		}
		return this;
	},
	// 插入子节点到对象的pos位置
	insert:function(o,pos) {
		var node=this.get();
		var xhr=this;
		if(!node) {
			return this;
		} else if(node.nodeType==1) {
			if(pos<0) {
				pos=0;
			} else if (pos>node.childElementCount) {
				pos=node.childElementCount;
			}
			if(o instanceof PageKit) {
				o.each(function(elem) {
					xhr.insert(elem,pos);
					pos++;
				});
			} else if(o.nodeType==1){
				if(pos==node.childElementCount) {
					//在最后
					node.appendChild(o);
				} else {
					// 在pos之前
					node.insertBefore(o,node.children[pos]);
				}
			} else if(typeof o=="string") {
				xhr.insert($($node("div",o).get().children),pos);
			}
		}
		return this;
	},
	// 添加第一子节点
	prepend:function(o) {
		var node=this.get();
		if(!node) {
			return this;
		} else if(node.nodeType==1) {
			if(node.firstElementChild) {
				if(o instanceof PageKit) {
					var insertPlace=node.firstElementChild;
					o.each(function(elem) {
						node.insertBefore(elem,insertPlace);
					});
				} else if(o.nodeType==1){
					node.insertBefore(o,node.firstElementChild);
				} else if(typeof o=="string") {
					node.innerHTML=o+node.innerHTML;
				}
			} else {
				this.append(o);
			}
		}
		return this;
	},
	// 作为子节点追加到对象
	appendTo:function(o) {
		if(o instanceof PageKit) {
			o.append(this);
		} else if(o.nodeType==1) {
			PageKit(o).append(this);
		}
		return this;
	},
	// 作为子节点插入到对象
	insertTo:function(o,pos) {
		if(o instanceof PageKit) {
			o.insert(this,pos);
		} else if(o.nodeType==1) {
			PageKit(o).insert(this,pos);
		}
		return this;
	},
	// 作为第一子节点添加到对象
	prependTo:function(o) {
		if(o instanceof PageKit) {
			o.prepend(this);
		} else if(o.nodeType==1) {
			PageKit(o).prepend(this);
		}
		return this;
	},
	// 查找符合条件的子节点
	find:function(str) {
		var res=new Array();
		this.each(function(elem) {
			res=res.concat(Array.prototype.slice.call(elem.querySelectorAll(str)))
		});
		return PageKit(res);
	},
	// 过滤出有符合条件子节点的节点
	// o可以为字符串，作为CSS选择器。也可为函数，function(elem)，返回false或等价物时滤除
	filter:function(o) {
		if(!o) {
			return this;
		}
		var res=new Array();
		if(typeof o=="string") {
			this.each(function(elem) {
				if(elem.querySelector(o)) {
					res.push(elem);
				}
			});
		} else if(typeof o=="function") {
			this.each(function(elem) {
				if(o(elem)) {
					res.push(elem);
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
					this.each(function(elem) {
						if(o[n]!=null) {
							elem.setAttribute(n,o[n]);
						} else {
							elem.removeAttribute(n);
						}
					});
				};
				return this;
			case "string":
				if(v!=null) {
					this.each(function(elem) {
						elem.setAttribute(o,v);
					});
					return this;
				} else {
					try {
						return this.get().getAttribute(o);
					} catch(err) {
						return null;
					}
				}
		}
		return this;
	},
	// 设置/读取DOM属性，方法同attr。
	prop:function(o,v) {
		switch(typeof o) {
			case "object":
				for(var n in o) {
					this.each(function(elem) {
						elem[n]=o[n];
					});
				};
				return this;
			case "string":
				if(v!=null) {
					this.each(function(elem) {
						elem[o]=v;
					});
					return this;
				} else {
					try {
						return this.get()[o];
					} catch(err) {
						return null;
					}
				}
		}
		return this;
	},
	// 设置/读取CSS属性，设置方法：o为{name1:value1,name2:value2}形式或o为name,v为value，读取方法：o为name,v留空
	style:function(o,v) {
		switch(typeof o) {
			case "object":
				for(var n in o) {
					this.each(function(elem) {
						elem.style[n]=o[n];
					});
				};
				return this;
			case "string":
				if(v!=null) {
					this.each(function(elem) {
						elem.style[o]=v;
					});
					return this;
				} else {
					try {
						return this.get().style[o];
					} catch (err) {
						return null;
					}
				}
		}
		return this;
	},
	// 增加一个类
	addClass: function(str) {
		this.each(function(elem) {
			var xnr=$(elem);
			var c=xnr.attr("class");
			if(!c) {
				xnr.attr("class",str);
			} else if(!c.match(new RegExp("\\b"+str+"\\b"))) {
				xnr.attr("class",c+" "+str);
			}
		});
		return this;
	},
	// 去除一个类
	removeClass:function(str) {
		this.each(function(elem) {
			var xnr=$(elem);
			var c=xnr.attr("class");
			if(c && c.match(new RegExp("\\b"+str+"\\b"))) {
				xnr.attr("class",c.replace(new RegExp("\\b"+str+"\\b"),"").replace(/^ +| +$/g,""));
			}
		});
		return this;
	},
	// 获取/设置文本内容
	text:function(txt) {
		if(txt!=null) {
			this.each(function(elem) {
				elem.textContent=txt.toString();
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
	code:function(html) {
		if(html!=null) {
			this.each(function(elem) {
				elem.innerHTML=html;
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
	value:function(v) {
		if(v!=null) {
			// 设置
			this.each(function(elem) {
				switch(elem.tagName) {
					case "INPUT":
						switch(($(elem).attr("type") || "").toLowerCase()) {
							case "checkbox":
								elem.checked=v;
								break;
							default:
								elem.value=v;
								break;
						}
						break;
					case "TEXTAREA":
						elem.value=v;
						break;
					default:
						$(elem).text(v);
						break;
				}
			});
		} else {
			// 读取
			var elem=this.get();
			switch(elem.tagName) {
				case "INPUT":
					switch(($(elem).attr("type") || "").toLowerCase()) {
						case "checkbox":
							return elem.checked;
						default:
							return elem.value;
					}
				case "TEXTAREA":
					return elem.value;
				default:
					return $(elem).text();
			}
		}
	},
	// 添加事件监听函数。可以有多个事件。由逗号分隔
	hook:function(evt,func) {
		var e=evt.split(",");
		this.each(function(elem) {
			for(var i=0;i<e.length;i++) {
				elem.addEventListener(e[i],func,false);
			}
		});
		return this;
	},
	// 解除事件监听
	unhook:function(evt,func) {
		var e=evt.split(",");
		this.each(function(elem) {
			for(var i=0;i<e.length;i++) {
				elem.removeEventListener(e[i],func,false);
			}
		});
		return this;
	},
	// 复制所有DOM节点到新对象
	clone:function(evt) {
		var nodes=[];
		this.each(function(elem) {
			nodes.push(elem.cloneNode(true));
		});
		return PageKit(nodes);
	}
};

// 终于可以正式开始了，先获取保存的选项。
switch(XNR.agent) {
	case USERSCRIPT:
		main(JSON.parse(GM_getValue("xnr_options","{}")));
		break;
	case CHROME:
		chrome.extension.sendRequest({action:"load"}, function(response) {
			main(response.options);
		});
		break;
	case FIREFOX:
		try {
			main(JSON.parse(unescape(Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getCharPref("extensions.xiaonei_reformer.xnr_options"))));
		} catch(err) {
			main({});
		}
		break;
	default:
		throw "unsupported browser";
};

// docWindow是Firefox扩展中的
})(typeof docWindow=="undefined"?window:docWindow);
