// ==UserScript==
// @name           校内人人网改造器 Xiaonei Reformer
// @namespace      Xiaonei_reformer
// @include        http://renren.com/*
// @include        http://*.renren.com/*
// @include        https://renren.com/*
// @include        https://*.renren.com/*
// @include        http://kaixin.com/*
// @include        http://*.kaixin.com/*
// @include        https://kaixin.com/*
// @include        https://*.kaixin.com/*
// @exclude        http://wpi.renren.com/*
// @exclude        http://*.renren.com/ajax*
// @description    为人人网（renren.com，原校内网xiaonei.com）清理广告、新鲜事、各种烦人的通告，删除页面模板，恢复旧的深蓝色主题，增加更多功能。。。
// @version        1.5.92.20091209
// @author         xz
// ==/UserScript==

//脚本版本，供自动更新用
var version="1.5.92.20091209";

//选项列表，选项名:{value:默认值,fn:对应处理函数,text:选项文本}
var options={
	//清理页面
	removeAds:					{value:true,	fn:removeAds,					text:"清除广告"},
	removeStarReminder:			{value:true,	fn:removeStarReminder,			text:"去除升级为星级用户提示"},
	removeRequests:				{value:true,	fn:removeRequests,				text:""},
	removeAppRequest:			{value:false,	fn:null,						text:"去除应用请求提示"},
	removeEventRequest:			{value:false,	fn:null,						text:"去除活动邀请提示"},
	removeNoticeRequest:		{value:false,	fn:null,						text:"去除通知提示"},	
	removePollRequest:			{value:false,	fn:null,						text:"去除投票邀请提示"},	
	removeGameRequest:			{value:false,	fn:null,						text:"去除游戏邀请提示"},	
	removeMusicPlayer:			{value:true,	fn:removeMusicPlayer,			text:"去除音乐播放器"},	
	removePageTheme:			{value:true,	fn:removePageTheme,				text:"去除页面主题模板"},	
	removeXntBar:				{value:false,	fn:removeXntBar,				text:"去除校内通栏"},	
	removePageTopNotice:		{value:true,	fn:removePageTopNotice,			text:"去除首页顶部通知"},	
	removeNewStar:				{value:true,	fn:removeNewStar,				text:"去除人气之星/新人栏"},
	removePaintReminder:		{value:true,	fn:removePaintReminder,			text:"去除装扮主页提示"},
	removeRenRenSurvey:			{value:true,	fn:removeRenRenSurvey,			text:"去除边栏：人人网调查"},
	removeCommonPage:			{value:false,	fn:removeCommonPage,			text:"去除边栏：公共主页推荐"},
	removeFriendGuide:			{value:false,	fn:removeFriendGuide,			text:"去除边栏：寻找/邀请朋友"},
	removeCommendation:			{value:false,	fn:removeCommendation,			text:"去除边栏：推荐/礼物"},
	//清理新鲜事
	removeFeeds:				{value:true,	fn:removeFeeds,					text:""},
	markFeedAsRead:				{value:false,	fn:null,						text:"设为已读"},
	removeBlogFeed:				{value:false,	fn:null,						text:"日志"},
	removePollFeed:				{value:false,	fn:null,						text:"投票"},
	removeAppFeed:				{value:false,	fn:null,						text:"应用"},
	removeActFeed:				{value:false,	fn:null,						text:"活动"},
	removeStatusFeed:			{value:false,	fn:null,						text:"状态"},
	removeGiftFeed:				{value:false,	fn:null,						text:"礼物"},
	removeFriendFeed:			{value:false,	fn:null,						text:"交友"},
	removeImageFeed:			{value:false,	fn:null,						text:"照片"},
	removeImageTagFeed:			{value:false,	fn:null,						text:"圈人"},
	removeProfileFeed:			{value:false,	fn:null,						text:"头像"},
	removeCommentFeed:			{value:false,	fn:null,						text:"评论"},
	removeClassFeed:			{value:false,	fn:null,						text:"班级"},
	removeShareFeed:			{value:false,	fn:null,						text:"分享"},
	removeVipFeed:				{value:false,	fn:null,						text:"VIP"},
	removeFilmFeed:				{value:false,	fn:null,						text:"影评"},
	//功能增强
	addNavBarItem:				{value:true,	fn:addNavBarItem,				text:"增加导航栏项目"},
	widenNavBar:				{value:true,	fn:widenNavBar,					text:"加宽导航栏"},
	hideFeedContent:			{value:false,	fn:hideFeedContent,				text:"隐藏新鲜事具体内容"},
	flodStatusComment:			{value:true,	fn:flodStatusComment,			text:"收起新鲜事回复"},
	addFloorCounter:			{value:true,	fn:addFloorCounter,				text:"为评论增加楼层计数"},
	addExtraEmotions:			{value:true,	fn:addExtraEmotions,			text:"增加额外的表情项"},
	showImageOnMouseOver:		{value:true,	fn:showImageOnMouseOver,		text:"在鼠标经过图片时显示大图"},
	useWhisper:					{value:false,	fn:useWhisper,					text:"默认使用悄悄话"},
	showImagesInOnePage:		{value:true,	fn:showImagesInOnePage,			text:"相册所有图片在一页中显示"},
	showMatualFriends:			{value:true,	fn:showMatualFriends,			text:"显示共同好友"},
	showMatualFriendsImage:		{value:true,	fn:null,						text:"显示共同好友的头像"},
	checkUpdate:				{value:true,	fn:checkUpdate,					text:"自动检查脚本更新"},
	removeFriendRestriction:	{value:true,	fn:removeFriendRestriction,		text:"去除特别好友修改限制"},
	autoRefreshFeeds:			{value:true,	fn:autoRefreshFeeds,			text:"自动检查新鲜事更新"},
	removeFontRestriction:		{value:false,	fn:removeFontRestriction,		text:"去除页面的字体限制"},
	addVideoOrigPageLink:		{value:false,	fn:addVideoOrigPageLink,		text:"增加视频分享原始页面链接"},
	recoverOriginalTheme:		{value:true,	fn:recoverOriginalTheme,		text:"恢复深蓝色主题（未启用\"去除页面主题模板\"时，在有模板的页面不恢复）"},
	restrictHeadAmount:			{value:true,	fn:restrictHeadAmount,			text:""},
	headAmount:					{value:12,		fn:null,						text:"限制头像列表中头像最多数量，0为不限（不影响共同好友列表）"},
	navExtraContent:			{value:"论坛\nhttp://club.renren.com/",	fn:null,	text:""},
	lastUpdate:					{value:"",		fn:null,					text:""},
	pageLink:					{value:"http://userscripts.org/scripts/show/45836",	fn:null,	text:""},
	scriptLink:					{value:"http://userscripts.org/scripts/source/45836.user.js",	fn:null,	text:""},
	checkFeedInterval:			{value:60,		fn:null,			text:"新鲜事检查间隔："},
};

//大图地址列表
var imgCache=[];

//工具函数
/*
 * 查找特定元素
 * obj: 元素的ID/ClassName/TagName，或XPath
 * root: 查找的根节点
 * return: 符合条件的元素或元素数组
 */
function $(obj,root) {
	if(!obj || typeof obj != "string" || !obj.length) {
		return null;
	}
	try {
		switch(obj[0]) {
			case "#": return (root?root:document).getElementById(obj.substring(1));
			//不使用getElementsByClassName，在firefox中会有遗漏
			case ".": return resultToArray(document.evaluate(".//*[normalize-space(@class)='"+obj.substring(1)+"']",(root?root:document),null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null));
			case "/": return resultToArray(document.evaluate((root?".":"")+obj,(root?root:document),null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null));
			default: return (root?root:document).getElementsByTagName(obj);
		}
	} catch(err) {
		return null;
	}
}
/*
 * 获取特定单一元素
 * obj: 元素的ID/ClassName/TagName，或XPath
 * root: 查找的根节点
 * return: 符合条件的元素，如有多个只返回第一个
 */
function $1(obj,root) {
	if(!obj || typeof obj != "string" || !obj.length) {
		return null;
	}
	try {
		switch(obj[0]) {
			case "#": return (root?root:document).getElementById(obj.substring(1));
			//不使用getElementsByClassName，在firefox中会有遗漏
			case ".": return document.evaluate(".//*[normalize-space(@class)='"+obj.substring(1)+"']",(root?root:document),null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
			case "/": return document.evaluate((root?".":"")+obj,(root?root:document),null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
			default: return $first((root?root:document).getElementsByTagName(obj));
		}
	} catch(err) {
		return null;
	}
}
/*
 * 将XPathResult对象转换为数组
 * xPathResult: 执行document.evaluate返回的对象，必须是XPathResult.xxx_ITERATOR_TYPE
 * return: 转换后的数组
 */
function resultToArray(xPathResult) {
	if(!xPathResult instanceof XPathResult) {
		return null;
	}
	var retArray = new Array();
	var res = xPathResult.iterateNext();
	while(res) {
		retArray.push(res);
		res = xPathResult.iterateNext();
	}
	return retArray;
}
/*
 * 获取首个元素
 * obj: 数组或元素集合，或DOM节点
 * return: 返回第一个元素/子节点。如果obj非数组/DOM节点返回obj本身。
 */
function $first(obj) {
	try {
		if (typeof obj == "object") {
			if(obj.firstElementChild) {
				return obj.firstElementChild;
			} else {
				return obj[0];
			}
		}
		return obj;
	} catch(err) {
		return obj;
	}
}
/*
 * 获取最后一个元素
 * obj: 数组或元素集合，或DOM节点
 * return: 返回最后一个元素/子节点。如果obj非数组/DOM节点返回obj本身。
 */
function $last(obj) {
	try {
		if (typeof obj == "object") {
			if(obj.lastElementChild) {
				return obj.lastElementChild;
			} else {
				return obj[obj.length-1];
			}
		}
		return obj;
	} catch(err) {
		return obj;
	}
}
/*
 * 获取页面节点的父节点
 * node: 页面节点
 * return: 返回node父节点。异常返回null。
 */
function $p(node) {
	try {
		return node.parentNode;
	} catch(err) {
		return null;
	}
}
/*
 * 删除页面元素
 * obj: 要删除的元素/元素数组
 * return: 无
 */
function $remove(obj) {
	if(!obj || typeof obj != "object") {
		return;
	}
	try {
		switch (Object.prototype.toString.call(obj)) {
			case "[object Array]": break;
			case "[object HTMLCollection]": break;	// Firefox
			case "[object NodeList]": break; // Chrome/Chromium
			default: $p(obj).removeChild(obj);return;
		}
		for(i in obj) {
			try {
				$p(obj[i]).removeChild(obj[i]);
			} catch(err) {
			}
		}
	} catch(err) {
		return;
	}
}
/*
 * 隐藏页面元素
 * obj: 要隐藏的元素/元素数组
 * return: 无
 */
function $hide(obj) {
	if(!obj || typeof obj != "object") {
		return;
	}
	try {
		switch (Object.prototype.toString.call(obj)) {
			case "[object Array]": break;
			case "[object HTMLCollection]": break;	// Firefox
			case "[object NodeList]": break; // Chrome/Chromium
			default: obj.style.display="none";return;
		}
		for(i in obj) {
			try {
				obj[i].style.display="none";
			} catch(err) {
			}
		}
	} catch(err) {
		return;
	}
}
/*
 * 读取/设置选项
 * name: 选项名
 * value: 选项值（此值为空表示读取操作，否则为写入）
 * return: 返回选项值
 */
function $option(name,value) {
	if(value==null) {
		// 读取
		return options[name].value;
	} else {
		// 保存
		options[name].value=value;
		try {
			GM_setValue(name,value);
		} catch(err) {
			try {
				localStorage.setItem(name,JSON.stringify(value));
			} catch(err) {
				$error("$option",err);
				return null;
			}
		}
		return value;
	}
}
/*
 * 输出错误信息
 * func: 发生异常的函数名
 * err: Error对象
 * return: 无
 */
function $error(func,err) {
	if(func && err && console && console.log) {
		console.log("在 "+func+"() 中发生了一个错误。\n错误名称："+err.name+"\n错误信息："+err.message);
	}
}
/*
 * 新建节点
 * name: 节点的Tag名，无名则创建文本节点
 * attrs: 节点的属性，{name:nodeName,id:nodeId}
 * content: 节点的内容，可以为文本或其他节点
 * return: 节点对象
 */
function $node(name,attrs,content) {
	try {
		if(!name) {
			return document.createTextNode(content);
		} else if(Object.prototype.toString.call(name).match(/^[object HTML.*Element]$/)) {
			name=name.tagName;
		}
		var node=document.createElement(name);
		if(attrs) {
			for(var attr in attrs) {
				node.setAttribute(attr,attrs[attr]);
			}
		}
		if(content) {
			if(typeof content=="string") {
				try {
					node.innerHTML=content;
				} catch(err) {
					var textNode=document.createTextNode(content);
					node.appendChild(textNode);
				}
			} else if(Object.prototype.toString.call(content).match(/^[object HTML.*Element]$/)) {
				node.appendChild(content);
			}
		}
		return node;
	} catch(err) {
		$error("$node",err);
	}
}
/*
 * 增加新的样式
 * styles: 样式内容
 * root: 新增style节点的父节点，默认依次为head、body
 * return: 无
 */
function $style(styles,root) {
	try {
		var front=true; //添加到root开始处
		var css=$node("style",{type:"text/css"},styles);
		if(!root) {
			root=$1("head");
			if(!root) {
				root=document.body;
			} else {
				front=false;
			}
		} 
		if(!front) { 
			root.appendChild(css);
		} else {
			root.insertBefore(css,root.childNodes[0]);
		}
	} catch(err) {
		$error("$style",err);
	}
}
//点击元素
function $click(e) {
	var evt = document.createEvent('MouseEvents');
	evt.initMouseEvent("click",true,false,window,0,0,0,0,0,false,false,false,false,0,null);
	e.dispatchEvent(evt);
}
//读取指定名称的cookie
function getCookie(name) {
	try {
		var cookies=document.cookie.split(';');
		name=escape(name);
		for(var i=0;i<cookies.length;i++) {
			var c=cookies[i].replace(/^ +/g,"");
			if(c.indexOf(name+"=")==0) {
				return unescape(c.substring(name.length+1,c.length));
			}
		}
	} catch (err) {
		$error("getCookie",err);
	}
	return "";
}
//写入cookie
function setCookie(name,value) {
	try {
		var cookieString=escape(name)+"="+escape(value)+";domain=.renren.com";
		document.cookie=cookieString;
	} catch (err) {
		$error("setCookie",err);
	}
}
// 发送HTTP请求
function sendHttpRequest(req) {
	try {
		GM_xmlhttpRequest(req);
		return;
	} catch(err) {
	}
	try {
		var httpReq= new XMLHttpRequest();
		httpReq.url=req.url;
    	httpReq.onreadystatechange = function(evt){if(httpReq.readyState==4){req.onload(httpReq);}};
	    httpReq.open(req.method, req.url, true);
		//httpReq.setRequestHeader("Cache-Control","no-cache");
    	httpReq.send(null);
	} catch(err) {
		$error("sendHttpRequest",err);
	}
}
//工具函数完

//移除校内通栏
function removeXntBar() {
	$remove($("#wpiroot"));
	$remove($("#imengine"));
}

//移除页面顶部通知
function removePageTopNotice() {
	$remove($(".notice-holder"));
	$remove($("#notice_system"));
}

//移除人气之星/新人栏
function removeNewStar() {
	$remove($(".star-new"));
}

//移除装扮主页提示
function removePaintReminder() {
	$remove($(".enter-paints"));
}

//移除人人网调查
function removeRenRenSurvey() {
	$remove($(".side-item sales-poll"));
}

//移除边栏：公共主页推荐
function removeCommonPage() {
	$remove($(".side-item commend-page"));
}

//移除边栏：寻找/邀请朋友
function removeFriendGuide() {
	$remove($(".side-item contact-fri"));
	$remove($(".guide-find-friend"));
}

//移除边栏：推荐/礼物
function removeCommendation() {
	$remove($(".side-item selected"));
}

//隐藏新鲜事或标记为已读
function removeFeeds(feedClass,feedTag) {
	try {
		if(feedClass) {
			var items=$("//ul[@id='feedHome']//li//div[@class='details']//div[@class='legend']//img[@class='"+feedClass+"'"+(feedTag?" and @alt='"+feedTag+"']":"]"));
			for(var i in items) {
				var item=items[i];
				item=$p($p($p(item)));
				if($option["markFeedAsRead"]) {
					//如果javascript被禁用，则只隐藏
					try {
						var onclick=$last(item).getAttribute("onclick");
						if(onclick.indexOf("javascript:")!=0) {
							onclick="javascript:"+onclick+";";
						}
						window.location.href=onclick;
						//click(item.lastChild);
					} catch(err) {
						$hide(item);
					}
				} else {
					$remove(item);
				}
			}
		} else {
			$option("removeBlogFeed") && removeFeeds("iBlog");
			$option("removeAppFeed") && (removeFeeds("iApp"),removeFeeds("iSanguo"),removeFeeds("iMyj"));
			$option("removeActFeed") && removeFeeds("iActs");
			$option("removePollFeed") && removeFeeds("iPoll");
			$option("removeStatusFeed") && removeFeeds("iStatus");
			$option("removeGiftFeed") && removeFeeds("iGift");
			$option("removeFriendFeed") && removeFeeds("iFriend");
			$option("removeClassFeed") && removeFeeds("iClass");
			$option("removeProfileFeed") && removeFeeds("iProfile");
			$option("removeImageFeed") && removeFeeds("iPhoto","相册");
			$option("removeImageTagFeed") && removeFeeds("iPhoto","圈人");
			$option("removeCommentFeed") && removeFeeds("iPost");
			$option("removeShareFeed") && removeFeeds("iShare");
			$option("removeVipFeed") && removeFeeds("iVip");
			$option("removeFilmFeed") && removeFeeds("iFilm");
		}
	} catch (err) {
		$error("removeFeeds",err);
	}
}

//删除各种请求
function removeRequests(type) {
	try {
		if(type) {
			$remove($p($1("//li//img[starts-with(@class,'"+type+"')]")));
		} else {
			$option("removeAppRequest") && removeRequests("l-app");
			$option("removeEventRequest") && removeRequests("l-event");
			$option("removeNoticeRequest") && removeRequests("l-request");
			$option("removePollRequest") && removeRequests("l-poll");
			$option("removeGameRequest") && removeRequests("l-game");
			//删除空的请求提示框
			var node=$1("//div[@class='side-item requests']//div[@class='side-item-body clearfix']//ul[@class='icon-list']");
			if(node && node.childElementCount==0) {
				$remove($p($p(node)));
			}
		}
	} catch(err) {
		$error("removeRequests",err);
	}
}

//为新鲜事列表增加监听函数，在点击"更多新鲜事"时可以处理新增的项目
function addFeedEventNotifier() {
	try {
		if(!$("#moreFeed")) {
			return;
		}
		var flag=$1("//div[@class='filter-loading']");
		if(!flag) {
			flag=$("#feedLoading");
		}
		if(flag) {
			flag.addEventListener('DOMAttrModified', feedNotifier, false);
		}
	} catch (err) {
		$error("addFeedEventNotifier",err);
	}

	function feedNotifier(evt) {
		try {
			if(evt.attrName!="style" || evt.newValue.indexOf("display: none")==-1) {
				return;
			}
		 	removeFeeds();
			$option("flodStatusComment") && flodStatusComment();
		} catch (e) {
			$error("feedNotifier",e);
		}
	}
}

//清除广告
function removeAds() {
	try {
		var adClasses=["ad-bar", "banner clearfix", "adimgr", "blank-holder", "blank-bar", "renrenAdPanel", "side-item template"];
		for(var i in adClasses) {
			$remove($("."+adClasses[i]));
		}
		var adIds=["sd_ad", "showAD", "huge-ad", "rrtvcSearchTip"];
		for(var i in adIds) {
			$remove($("#"+adIds[i]));
		}
		var items=$("//ul[@id='feedHome']//li//h3//a[@class='dark' and starts-with(@href,'http://post.renren.com/click.do?')]");
		for(var i in items) {
			item=$p($p(items[i]));
			try {
				var onclick=$last(item).getAttribute("onclick");
				if(onclick.indexOf("javascript:")!=0) {
					onclick="javascript:"+onclick;
				}
				window.location.href=onclick+";";
			} catch(e) {
				$remove(item);
			}
		}
		var items=$("//iframe[contains(@src,'gg.renren.com')]");
		for(var i in items) {
			item=items[i];
			if($p(item).className!="blockcont text") {
				$remove(item);
			}
		}
		item=$("#dropmenuHolder");
		if(item) {
			item.addEventListener("DOMNodeInserted",function(evt){$remove($("#pop_share_ads"));}, false);
		}
	} catch(err) {
		$error("removeAds",err);
	}
}

//删除成为星级用户提示
function removeStarReminder() {
	try {
		$remove($("#tobestar"));
		$remove($("#realheadbulletin"));
		$remove($("#noStarNotice"));
		$remove($("#nostar"));
		$remove($("#home_nostar"));
	} catch (err) {
		$error("removeStarReminder",err);
	}
}

//删除音乐播放器，包括紫豆音乐播放器和帖子里的附加音乐
function removeMusicPlayer() {
	try {
		$remove($("#zidou_music"));
		$remove($("#ZDMusicPlayer"));
		$remove($(".mplayer"));
		$remove($("//embed[contains(@src,'player.swf') or contains(@src,'Player.swf')]"));
	} catch (err) {
		$error("removeMusicPlayer",err);
	}
}

//检测有没有模板存在
function hasTemplates()	{
	try {
		var head=$1("head");
		var items=$("style",head);
		for(var i in items) {
			if(items[i].innerHTML && (items[i].innerHTML.indexOf("url(http://i.static.renren.com")!=-1 || items[i].innerHTML.indexOf("/page-profile-styles/")!=-1)) {
				return true;
			}
		}
		items=$("//link[@ref='stylesheet' and (contains(@herf,'zidou_nav.css') or contains(@href,'page-profile-styles'))]",head);
		if(items.length>0) {
			return true;
		}
		if(window.location.host=="group.renren.com") {
			items=$("//div[@class='boxcont']");
	    	for (var i in items) {
				if($p(items[i]).id=="groupSecondary") {
					return true;
				}
			}
		}
		if($1("//link[@type='text/css' and contains(@href,'/themes/') and contains(@href,'.css')]")) {
			return true;
		}
	} catch (err) {
		$error("hasTemplates",err);
	}
	return false;
}

//删除页面主题模板
function removePageTheme() {
	try {
		if(hasTemplates()) {
			//删除紫豆模板
			var themes=$("style",$1("head"));
			for(var i in themes) {
				if(themes[i].innerHTML.indexOf("url(http://i.static.renren.com")!=-1) {
					$remove(themes[i]);	//删除紫豆模板效果
					$remove($1("//link[@rel='stylesheet' and contains(@href,'zidou_nav.css')]"));	//删除紫豆导航栏
					$remove($1("//span[@class='zidou_domain']"));	//删除紫豆个人主页栏
					break;
				}
			}
			//删除公共主页模板
			$remove($("//head//link[@rel='stylesheet and (contains(@href,'zidou_nav.css') or contains(@href,'/page-profile-styles/'))']"));
			themes=$("//head//style");
			for(var i in themes) {
				var item=themes[i];
				if(item.innerHTML.indexOf("/page-profile-styles/")!=-1) {
					$remove(item);
				}
			}
			//删除群组模板
			if(window.location.host!="group.renren.com") {
				var themes=$("//div[@class='boxcont']");
			    for(var i in themes) {
					var e=themes[i];
					if($p(e).id=="groupSecondary") {
						$remove(e);
					}
				}
				//删除群组页面里的iframe
				$remove($("//iframe"));
				//删除部分群组内的赞助商广告（例如汉莎航空置顶地图）
				$remove($("//div[contains(@class,'jqmWindow')]"));
				//删除群组内的特有CSS。（例如苹果学院）
				$remove($("//link[@rel='stylesheet' and contains(@href,'qun-iframe')]"));
				//删除群组内的广告
				$remove($("//a[contains(@href,'adclick')]"));
				//删除群组的浮动的导航栏
				var items=$("//div[@class='nav']");
		    	for(var i in items) {
					var item=items[i];
					if(item.children.length==0) {
						$remove(item);
					}
				}
			}
			//处理特殊页面主题
			$remove($("//link[@type='text/css' and contains(@href,'/themes/') and contains(@href,'.css')]"));
		}
	} catch(err) {
		$error("removePageTheme",err);
	}
}

//恢复原来的颜色
function recoverOriginalTheme() {
	try {
		if(!$option("removePageTheme") && hasTemplates()) {
			return;
		}
		var FCOLOR="#3B5998";	//Facebook的深蓝色
		var XCOLOR="#3B5888";	//校内原来的深蓝色
		var BCOLOR="#5C75AA";	//原来的菜单背景色

		//改变链接的颜色
		$style("a:link,a:visited { color: "+XCOLOR+" } "+
					"a:hover { color: "+XCOLOR+" } "+
					"a { color: "+XCOLOR+" } "+
					".tpl_cancel { color: "+FCOLOR+" !important } "+
					".profile .profile-summary a.action:hover { color: "+FCOLOR+" } "+
					".pagerpro li.current a, .pagerpro li.current a:hover { color: "+FCOLOR+" ; border-bottom-color: "+FCOLOR+" ; border-color: "+FCOLOR+" } "+
					".pager-bottom .pagerpro li.current a, .pager-bottom .pagerpro li.current a:hover { border-top-color: "+FCOLOR+" } "+
					".pager-bottom .pagerpro li a.chn:hover { border-top-color: "+FCOLOR+" } "+
					".app-featured-pro .innerborder strong a { color: "+FCOLOR+" } "+
					".app_content_13462 #app13462_sub-nav-public a { color: "+FCOLOR+" } "+
					".app_content_13462 .index_list h3 a { color: "+FCOLOR+" } "+
					".app_content_13462 .helptext a { color: "+FCOLOR+" } "+
					".app-spread-info a { color: "+FCOLOR+" !important } "+
					"#xyxPage #opi a { color: "+FCOLOR+" } "+
					".xyx_share { color: "+FCOLOR+" } "+
					"#pet_status .ulv1 { color: "+FCOLOR+" } "+
					".app_content_17940 .left_box a { color: "+FCOLOR+" !important } "+
					".app_content_17940 .check_text span { color: "+FCOLOR+" !important } "+
					".app_content_17940 .search_list p span { color: "+FCOLOR+" !important } "+
					".tab-menu li a { color: "+FCOLOR+" !important } "+
					".rank_tab li { color: "+FCOLOR+" } "+
					"td.pop_content .dialog_body a, td.pop_content .dialog_body a:visited { color: "+FCOLOR+" } "+
					".m-chat-window.notifications .chat-conv .notifyitem .notifybody a { color: "+FCOLOR+" !important }"+
					"body.profile ul.tabs.sub-nav li a { color: "+FCOLOR+" }");

		//改变链接的背景色
		$style("a.action:hover{ background-color: "+BCOLOR+" } "+
					"a.share:hover{ background-color: "+FCOLOR+" } "+
					"a.mini-share:hover{ background-color: "+FCOLOR+" ; border-color: "+FCOLOR+" } "+
					"ul.actions a:hover { background: "+BCOLOR+" } "+
					".pagerpro li a:hover { background: "+BCOLOR+" } "+
					".pager-top a:hover { background-color: "+BCOLOR+" } "+
					".page a:hover { background-color: "+BCOLOR+"; color: #FFFFFF; } "+
					".navigation .nav-other .menu .charge a:hover { background-color: "+BCOLOR+" } "+
					".friendsgroup-sidebar .friendsgroup-list li.select a, .friendsgroup-sidebar .friendsgroup-list li.select a:hover { border-color: "+FCOLOR+"; background-color: "+BCOLOR+" } "+
					".messages .previous_message:hover { background-color: "+FCOLOR+"} ");

		/* 改变导航栏的背景色 */
		var e=$1("//div[@class='navigation clearfix']");
		if(e) {
			var bc=document.defaultView.getComputedStyle(e,null).backgroundColor;
			if(bc=="rgb(0, 94, 172)" || bc=="transparent") {
				$style(".navigation { background: "+FCOLOR+"}");
			}
		}
		$style("#clubheader #navigation { background-color: "+BCOLOR+" } "+
					".navigation .menu-title a:hover { background-color: "+BCOLOR+" ; color: #FFFFFF ; background: "+BCOLOR+" } "+
					"#zidou_homepage #navigation a:hover { background-color: "+BCOLOR+" } "+
					"#zidou_header #navigation { background-color: "+FCOLOR+" } "+
					"#utility { background-color: "+FCOLOR+" } "+
					"#dev-site-navigator { background: "+FCOLOR+" ; height: 52px } "+
					"#header #tagline { background: "+FCOLOR+" } "+
					"#clubheader #navigation { background: "+FCOLOR+" } "+
					"td.pop_content h2 { background-color: "+ BCOLOR +" }");


		/* 改变下拉菜单的颜色 */
		$style(".menu-dropdown-border { border:1px solid "+BCOLOR+" } "+
					".menu-dropdown .menu-item li a:hover { background-color: "+BCOLOR+" } "+
					".menu-dropdown .search-menu li a:hover { background-color: "+BCOLOR+" !important } "+
					".menu-dropdown .optionmenu a:hover { background-color: "+BCOLOR+" !important } "+
					".menu-dropdown .menu-item li.show-more a:hover { background-color: "+BCOLOR+" !important } "+
					".super-menu .menu-item { border-color: "+BCOLOR+" } "+
					".super-menu li a:hover { background: "+BCOLOR+" } "+
					"#navBar .beta-bar a, #appMenu .app-actions a, .menu-dropdown .menu-item li a { color: "+BCOLOR+" } ");

		//改变主页应用栏背景色
		$style(".home #sidebar { background-color:#EBF3F7 }");

		//改变回复的背景色
		$style(".statuscmtitem { background-color:#EBF3F7 }");

		//改变搜索栏边框颜色
		$style("#navSearch #search-submit a, #navSearch #search-input #navSearchInput { border-color:#315091 }");

		//改变子导航栏的边框颜色
		$style("#sub-nav .selected a { border-color: #5973A9 }");
		$style(".toggle_tabs li a.selected { border-color: "+FCOLOR+" }");

		//改变弹出式窗口边框颜色
		$style("td.pop_content h2 { border-color: "+FCOLOR+" }");

		//改变按钮的背景色
		$style(".input-button,.input-submit { background-color: "+FCOLOR+" } "+
					"td.pop_content .dialog_buttons input { background-color: "+FCOLOR+" !important } "+
					"#tpl_preview .subbutton { background-color: #EBE6E0 } "+
					".inputbutton, .inputsubmit, .subbutton, .canbutton, .button-group button { background:"+FCOLOR+" } "+
					"#savebutton { background-color:"+FCOLOR+" }"+
					"ul.figureslist.requests button.accept, ul.figureslist.requests button.ignore { background-color:"+FCOLOR+" } "+
					".m-chat-window.notifications .chat-conv .notifyitem.hover .close:hover { background-color:"+FCOLOR+" !important } ");

		//上传照片栏Tab颜色
		$style("#self-nav .selected a { background-color: "+FCOLOR+" }");
		$style("#self-nav .selected a:hover { background-color: "+BCOLOR+" }");
		$style("#self-nav li a { color: "+FCOLOR+" }");

		//个人资料Tab的字体颜色
		$style(".profile .profile-tabs-circle a{ color:"+FCOLOR+" }");

		//群组帖子分类Tab
		$style("#tabs .activetab a:hover,#tabs .activetab a { background-color: "+FCOLOR+" }");
		$style("#tabs .inactivetab a:hover { color:"+FCOLOR+" }");
		$style("#navigation a:hover { background-color:"+FCOLOR+" }");

		//送礼页面Tab
		$style(".sub_tab li a { color:"+FCOLOR+" }");
		$style(".sub_nav .selected a { background-color:"+BCOLOR+" }");

		//投票页面Tab
		$style(".toupiao_tab li.current { background-color:"+BCOLOR+" }");

		//群组菜单颜色
		$style("#mymenu a:hover,#mymore a.ppm:hover { background:"+FCOLOR+" }");

		//校内通栏的在线用户名
		$style(".m-chat-window.buddy-list .chat-conv .buddy-list-item .buddy-list-item-name { color: "+FCOLOR+" }");

		//改变其他的文字颜色
		$style(".gbcontainer h3 { color: "+FCOLOR+" } "+
					".gbcontainer div.gbbook h3 { color: "+FCOLOR+" } "+
					"#records h4 { color: "+FCOLOR+" } "+
					".form-privacy legend { color: "+FCOLOR+" } "+
					"form .notes h4 { color: "+FCOLOR+" } "+
					"form .required h4, form .optional h4 { color: "+FCOLOR+" } "+
					".msn h4 { color: "+FCOLOR+" } "+
					".box h3 .blue { color: "+FCOLOR+" } "+
					".box h3 { color: "+FCOLOR+" } "+
					".blue14zi { color: "+FCOLOR+" } "+
					"#pollPage .poll_main h3 { color: "+FCOLOR+" } "+
					"#helpMenu h3, #reg h3, #other h3, #features h3, #spec h3,#oak h3 { color: "+FCOLOR+" } "+
					"#header #logo { background-color: "+XCOLOR+" } "+
					".page_bar span em { color: "+FCOLOR+" } ");

		//删除背景图片
		$style(".navigation .nav-body { background: transparent } "+
					"#home.home .menu-bar { background: #FFFFFF } "+
					".profile .menu-bar { background-color: #FFFFFF } "+
					".profile .profile-panel { background: #FFFFFF } ");

		//将logo背景置为透明
		$style("#header #logo { background-color: transparent }");

		//改变设置了内嵌style的元素的字体颜色
		/* TODO 改成addEventListener */
		setInterval("var items=document.getElementsByTagName('a'); for (var i=0;i<items.length;i++) { if(items[i].style.color=='rgb(0, 94, 172)') items[i].style.color='"+FCOLOR+"';};",2000);	//因为是有些（校内通栏）是异步载入，所以要重复执行

	} catch (err) {
		$error("classicColor",err);
	}
}

//限制头像列表中的头像数量
function restrictHeadAmount() {
	try {
		var n=$option("headAmount");
		if(n==0) {
			return;
		}
		var items=$("//ul[@class='people-list' or @class='users']");
		for(var i in items) {
			var list=items[i];
			while(list.children.length>n) {
				$remove(list.children[n]);
			}
		}
	} catch (err) {
		$error("restrictHeadAmount",err);
	}
}

//在导航栏上增加项目
function addNavBarItem() {
	try {
		var item=$1("//div[@class='nav-main']");
		if(!item) {
			return;
		}
		var arr=$option("navExtraContent").split("\n");
		for(i=0;i<arr.length-1;i+=2) {
			var name=arr[i];
			var link=arr[i+1];
			var node=$node("div",{class:"menu"},'<div class="menu-title"><a id="global_inbox_link" href="'+link+'">'+name+'</a></div>');
			item.appendChild(node);
		}
	} catch (err) {
		$error("addNavBarMenu",err);
	}
}

//在日志、相册中增加楼层计数
function addFloorCounter() {
	try {
		if(location.host!="blog.renren.com" && (location.host!="photo.renren.com" || location.pathname!="/getphoto.do")) {
			return;
		}
		addFloor();
		var node=$p($p($("#show-all-id")));
		if(!node) {
			return;
		} else {
			node.addEventListener("DOMNodeInserted", addFloor, false);
		}
	} catch(err) {
		$error("addFloorCounter",err);
	}
	
	function addFloor(evt) {
		try {
			if(evt && (!evt.target.className || (location.host=="blog.renren.com" && evt.target.className!="replies with-arrow") || (location.host=="photo.renren.com" && evt.target.className!="replies"))) {
				return;
			}
			var replyAmount;	//回复总数
			var shownReplies;	//显示的回复
			if(location.host=="blog.renren.com") {
				var node=$1("//p[@class='stat-article']");
				replyAmount=parseInt(/评论\((\d+)\)/.exec(node.innerHTML)[1]);
				shownReplies=$("//div[@class='replies']//dl[@class='replies' or @class='replies with-arrow']//dd");
			} else {
				replyAmount=parseInt($("#commentCount").innerHTML);
				shownReplies=$("//div[@class='replies']//dl[@class='replies']//dd");
			}
			//显示的回复的开始楼层
			var replyStartFloor=replyAmount-shownReplies.length;
			if(shownReplies.length==0 || replyStartFloor<0) {
				//没有回复或出错
				return;
			}
			for(var i=0;i<shownReplies.length;i++) {
				var reply=shownReplies[i];
				if(!$1("//div[@class='info']//span[@class='fc']",reply)) {
					var node=$1("//div[@class='info']",reply);
					node.appendChild($node("span",{class:"fc",style:"float:right;color:gray"},(replyStartFloor+i+1)+"楼"));
				} else {
					//添加过了，跳出循环
					break;
				}
			}
			//隐藏“显示较早之前的评论”,防止重复点击
			e=$("#showMoreComments");
			if(e) {
				e.addEventListener("click", function(evt){ $hide($("#showMoreComments")); }, false);
			}
		} catch(err) {
			$error("addFloorCounter",err);
		}
	}
}

//显示/隐藏新鲜事内容
function hideFeedContent() {
	try {
		$style("ul.richlist.feeds li div.content { display:none;}");
	} catch (err) {
		$error("hideFeedContent",err);
	}
}

//收起状态回复
function flodStatusComment() {
	try {
		var items=$("//ul[@id='feedHome']//li//div[@class='details']//div[@class='legend']//a");
		for (var i in items) {
			var item = items[i];
			if(item.innerHTML.indexOf("收起")!=-1) {
				$click(item);
			}
		}
	} catch (err) {
		$error("flodStatusComment",err);
	}
}

//增加更多状态表情
function addExtraEmotions() {
	if(window.location.hostname=="reg.renren.com" || window.location.hostname=="login.renren.com") {
		return;
	}
	//状态表情列表
	var emlist=[
	//	{e:":)",		t:"开心",			s:"/imgpro/icons/statusface/1.gif"},
		{e:"(微笑)",	t:"微笑",			s:"/imgpro/icons/statusface/1.gif"},
		{e:"@_@",		t:"嘴唇",			s:"/imgpro/icons/statusface/2.gif"},
	//	{e:"(k)",		t:"嘴唇",			s:"/imgpro/icons/statusface/2.gif"},
		{e:"(哭)",		t:"哭",				s:"/imgpro/icons/statusface/3.gif"},
	//	{e:":-O",		t:"惊讶",			s:"/imgpro/icons/statusface/4.gif"},
		{e:"(惊讶)",	t:"惊讶",			s:"/imgpro/icons/statusface/4.gif"},
	//	{e:":@",		t:"生气",			s:"/imgpro/icons/statusface/5.gif"},
		{e:"(生气)",	t:"生气",			s:"/imgpro/icons/statusface/5.gif"},
	//	{e:":(",		t:"难过",			s:"/imgpro/icons/statusface/6.gif"},
		{e:"(难过)",	t:"难过",			s:"/imgpro/icons/statusface/6.gif"},
	//	{e:":-p",		t:"吐舌头",			s:"/imgpro/icons/statusface/7.gif"},
		{e:":a",		t:"爱",				s:"/imgpro/icons/statusface/8.gif"},
		{e:"(v)",		t:"花儿",			s:"/imgpro/icons/statusface/9.gif"},
		{e:"(38)",		t:"校内女人",		s:"/imgpro/icons/statusface/10.gif"},
	//	{e:"8-|",		t:"书呆子",			s:"/imgpro/icons/statusface/13.gif"},
		{e:"(书呆子)",	t:"书呆子",			s:"/imgpro/icons/statusface/13.gif"},
	//	{e:"|-)",		t:"困",				s:"/imgpro/icons/statusface/14.gif"},
		{e:"(困)",		t:"困",				s:"/imgpro/icons/statusface/14.gif"},
		{e:"(害羞)",	t:"害羞",			s:"/imgpro/icons/statusface/15.gif"},
		{e:"(大笑)",	t:"大笑",			s:"/imgpro/icons/statusface/16.gif"},
	//	{e:":d",		t:"大笑",			s:"/imgpro/icons/statusface/16.gif"},
	//	{e:"(奸笑)",	t:"奸笑",			s:"/imgpro/emotions/tie/2.gif"},
		{e:"(谄笑)",	t:"谄笑",			s:"/imgpro/emotions/tie/2.gif"},
		{e:"(吃饭)",	t:"吃饭",			s:"/imgpro/emotions/tie/3.gif"},
	//	{e:":-p",		t:"吐舌头",			s:"/imgpro/emotions/tie/4.gif"},
		{e:"(调皮)",	t:"调皮",			s:"/imgpro/emotions/tie/4.gif"},
		{e:"(尴尬)",	t:"尴尬",			s:"/imgpro/emotions/tie/5.gif"},
		{e:"(汗)",		t:"汗",				s:"/imgpro/emotions/tie/6.gif"},
		{e:"(惊恐)",	t:"惊恐",			s:"/imgpro/emotions/tie/7.gif"},
		{e:"(囧)",		t:"囧-窘迫",		s:"/imgpro/emotions/tie/8.gif"},
		{e:"(可爱)",	t:"可爱",			s:"/imgpro/emotions/tie/9.gif"},
		{e:"(酷)",		t:"酷",				s:"/imgpro/emotions/tie/10.gif"},
		{e:"(流口水)",	t:"流口水",			s:"/imgpro/emotions/tie/11.gif"},
		{e:"(猫猫笑)",	t:"猫猫笑",			s:"/imgpro/emotions/tie/12.gif"},
		{e:"(色)",		t:"色迷迷",			s:"/imgpro/emotions/tie/13.gif"},
	//	{e:"(病)",		t:"生病",			s:"/imgpro/emotions/tie/14.gif"},
		{e:"(生病)",	t:"生病",			s:"/imgpro/emotions/tie/14.gif"},
		{e:"(口罩)",	t:"防流感",			s:"/imgpro/emotions/tie/17.gif"},
		{e:"(吐)",		t:"呕吐",			s:"/imgpro/emotions/tie/19.gif"},
		{e:"(晕)",		t:"晕",				s:"/imgpro/emotions/tie/21.gif"},
		{e:"(s)",		t:"大兵",			s:"/imgpro/icons/statusface/soldier.gif"},
		{e:"(NBA)",		t:"篮球",			s:"/imgpro/icons/statusface/basketball4.gif"},
		{e:"(bee)",		t:"小蜜蜂",			s:"/imgpro/icons/statusface/bee.gif"},
		{e:"(fl)",		t:"花仙子",			s:"/imgpro/icons/statusface/hanago.gif"},
		{e:"(zz)",		t:"粽子",			s:"/imgpro/icons/statusface/zongzi.gif"},
		{e:"(cap)",		t:"学位帽",			s:"/imgpro/icons/statusface/mortarboard.gif"},
		{e:"(dad)",		t:"父亲节",			s:"/imgpro/icons/statusface/love-father.gif"},
		{e:"(ice)",		t:"冰棍儿",			s:"/imgpro/icons/statusface/ice-cream.gif"},
		{e:"(mj)",		t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj.gif"},
		{e:"(mj2)",		t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj2.gif"},
		{e:"(mj3)",		t:"迈克尔.杰克逊",	s:"/imgpro/icons/statusface/mj3.gif"},
		{e:"(eclipse)",	t:"日全食",			s:"/imgpro/icons/statusface/eclipse.gif"},
		{e:"(ta)",		t:"博派",			s:"/imgpro/icons/statusface/Transformers-Autobot.gif"},
		{e:"(td)",		t:"狂派",			s:"/imgpro/icons/statusface/Transformers-Decepticon.gif"},
		{e:"(qx)",		t:"七夕",			s:"/imgpro/icons/statusface/qixi.gif"},
		{e:"(qx2)",		t:"七夕",			s:"/imgpro/icons/statusface/qixi2.gif"},
		{e:"(bl)",		t:"教师节",			s:"/imgpro/icons/statusface/blackboard.gif"},
		{e:"(gs)",		t:"园丁",			s:"/imgpro/icons/statusface/growing-sapling.gif"},
		{e:"(gq1)",		t:"国庆六十周年",	s:"/imgpro/icons/statusface/national-day-60-firework.gif"},
		{e:"(gq2)",		t:"国庆快乐",		s:"/imgpro/icons/statusface/national-day-balloon.gif"},
		{e:"(gq3)",		t:"我爱中国",		s:"/imgpro/icons/statusface/national-day-i-love-zh.gif"},
		{e:"(hp)",		t:"杰克灯",			s:"/imgpro/icons/statusface/halloween-pumpkin.gif"},
		{e:"(hg)",		t:"小鬼",			s:"/imgpro/icons/statusface/halloween-ghost.gif"},
		{e:"(qxs)",		t:"悼念钱学森",		s:"/imgpro/icons/statusface/qianxuesen.gif"},
		{e:"(yt)",		t:"光棍油条",		s:"/imgpro/icons/statusface/youtiao.gif"},
		{e:"(bz)",		t:"光棍包子",		s:"/imgpro/icons/statusface/baozi.gif"},
		{e:"(wr)",		t:"枯萎玫瑰",		s:"/imgpro/icons/statusface/wilt-rose.gif"},
		{e:"(bh)",		t:"破碎的心",		s:"/imgpro/icons/statusface/broken-heart.gif"},
		{e:"(4)",		t:"4周年",			s:"/imgpro/icons/statusface/4-years.gif"},
		{e:"(cake)",	t:"周年蛋糕",		s:"/imgpro/icons/statusface/4-birthday.gif"},
		{e:"(^)",		t:"蛋糕",			s:"/imgpro/icons/3years.gif"},
		{e:"(h)",		t:"小草",			s:"/imgpro/icons/philips.jpg"},
		{e:"(r)",		t:"火箭",			s:"/imgpro/icons/ico_rocket.gif"},
		{e:"(w)",		t:"宇航员",			s:"/imgpro/icons/ico_spacewalker.gif"},
		{e:"(earth)",	t:"地球",			s:"/imgpro/icons/statusface/earth.gif"},
		{e:"(i)",		t:"电灯泡",			s:"/img/ems/bulb.gif"},
		{e:"(zg)",		t:"烛光",			s:"/img/ems/candle.gif"},
		{e:"(gsilk)",	t:"绿丝带",			s:"/img/ems/gsilk.gif"},
		{e:"(yeah)",	t:"哦耶",			s:"/img/ems/yeah.gif"},
		{e:"(good)",	t:"牛",				s:"/img/ems/good.gif"},
		{e:"(f)",		t:"拳头",			s:"/img/ems/fist.gif"},
	//	{e:"(l)",		t:"爱",				s:"/img/ems/love.gif"}, 与:a相同
		{e:"(t)",		t:"火炬",			s:"/img/ems/torch.gif"},
	];
	
	//日志/照片回复表情列表，直接与序号/URL对应
	emlist1=["不","谄笑","吃饭","调皮","尴尬","汗","惊恐","囧-窘迫","可爱","酷","流口水","猫猫笑","色","生病","叹气","淘气","舔","偷笑","吐","吻","晕","猪猪头","住嘴","大笑","害羞","惊呆","口罩","哭","困","难过","生气","书呆子","微笑"];

	try {
		//状态页(status.renren.com)的表情列表
		var list=$("#status_emotions");
		if(list) {
			//已经有的表情列表
			var curlist=[];
			var items=$("//li//a//img",list);
			for(var i in items) {
				curlist[items[i].getAttribute("emotion")]=items[i];
			}
			for (var i in emlist) {
				var el=emlist[i];
				//不在已有列表中
				if(!curlist[el.e]) {
					var node=$node("li",null,'<a onfocus="this.blur();" href="#nogo"><img title="'+el.t+'" alt="'+el.t+'" emotion="'+el.e+'" src="http://xnimg.cn'+el.s+'" rsrc="http://xnimg.cn'+el.s+'"/></a>');
					if(el.w) {
						//宽表情，宽度为一般的两倍
						node.style.width="50px";
						$first(node).style.width="46px";
					}
					list.appendChild(node);
				} else if (el.w) {
					//宽表情，宽度为一般的两倍
					$p(curlist[el.e]).style.width="46px";
					$p($p(curlist[el.e])).style.width="50px";
				}
			}
		}

		//首页的状态表情列表
		var list=$first($("#publisher_emotion"));
		if(list) {
			//已经有的表情列表
			var curlist=[];
			var items=$("//li//a//img",list);
			for(var i in items) {
				curlist[items[i].getAttribute("emotion")]=items[i];
			}
			for (var i in emlist) {
				var el=emlist[i];
				//不在已有列表中
				if(!curlist[el.e]) {
					var node=$node("li",null,'<a onfocus="this.blur();" href="#nogo"><img emotion="'+el.e+'" alt="'+el.t+'" title="'+el.t+'" src="http://xnimg.cn'+el.s+'" rsrc="http://xnimg.cn'+el.s+'"/></a>');
					if(el.w) {
						//宽表情，宽度为一般的两倍
						node.style.width="50px";
						$first(node).style.width="46px";
					}
					list.appendChild(node);
				} else if (el.w) {
					//宽表情，宽度为一般的两倍
					$p(curlist[el.e]).style.width="46px";
					$p($p(curlist[el.e])).style.width="50px";
				}
			}
		}
		//处理回复表情
		var holder=$("#dropmenuHolder");
		if(holder) {
			holder.addEventListener('DOMAttrModified', emotionNotifier, false);
		}
	} catch (err) {
		$error("addExtraEmotions",err);
	}

	function emotionNotifier(evt) {
		try {
			if(evt.newValue=="newsfeed-reply-emotions") {
				var list=$first(evt.target);
				var items=$('//li//a//img',list);
				//已经有的表情列表
				var curlist=[];
				for(var i in items) {
					curlist[items[i].getAttribute("emotion")]=items[i];
				}
				if(list.innerHTML.indexOf("/icons/statusface/")==-1) {
					// 日志/照片回复列表
					for(var i=1;i<=emlist1.length;i++) {
						var em="[tie"+(i<10?"0":"")+i+"]";
						if(!curlist[em]) {
							var node=$node("li",null,'<a onfocus="this.blur();" href="#nogo"><img src="http://xnimg.cn/imgpro/emotions/tie/'+i+'.gif" title="'+emlist1[i-1]+'" alt="'+emlist1[i-1]+'" emotion="'+em+'"/></a>');
							list.appendChild(node);
						}
					}
				} else {
					// 状态回复列表
					for (var i in emlist) {
						var el=emlist[i];
						if(!curlist[el.e]) {
							var node=$node("li",null,'<a onfocus="this.blur();" href="#nogo"><img src="http://xnimg.cn'+el.s+'" title="'+el.t+'" alt="'+el.t+'" emotion="'+el.e+'"/></a>');
							if(el.w) {
								//宽表情，宽度为一般的两倍
								node.style.width="50px";
								$first(node).style.width="46px";
							}
							list.appendChild(node);
						} else if (el.w) {
							//宽表情，宽度为一般的两倍
							$p(curlist[el.e]).style.width="46px";
							$p($p(curlist[el.e])).style.width="50px";
						}
					}
				}
			}
		} catch (err) {
			$error("emotionNotifier",err);
		}
	}
}

//加宽导航栏显示
function widenNavBar() {
	try {
		$style(".navigation-wrapper { width: auto } .navigation { width: auto }");
		//导航栏没有搜索框时，将设置菜单向左移
		if($("#navSearch")) {
			return;
		}
		var submenu=$("#optiondropdownMenu");
		if(submenu) {
			submenu.addEventListener("DOMAttrModified",function moveMenu(evt){
				try {
					if(evt.attrName!="style" || evt.newValue.indexOf("-9999px")!=-1) {
						return;
					}
					this.removeEventListener("DOMAttrModified",moveMenu,false);
					this.style.left=(parseInt(this.style.left)-parseInt(document.defaultView.getComputedStyle(this,null).width)+parseInt(document.defaultView.getComputedStyle($("#optionMenuActive").parentNode,null).width))+"px";
					this.addEventListener("DOMAttrModified",moveMenu,false);
				} catch (err) {
					$error("widenNavBar",err);
				}
			},false);
		}
	} catch (err) {
		$error("widenNavBar",err);
	}
}

//在鼠标移过时显示照片大图
function showImageOnMouseOver() {
	//显示大图DIV
	var showLargeImageViewer=function(mouseX) {
		try {
			var viewer=$('#largeImageViewer');
			if(!viewer) {
				return;
			}
			if(mouseX>document.body.clientWidth/2) {
				viewer.style.left="2px";
				viewer.style.right="";
			} else {
				viewer.style.right="2px";
				viewer.style.left="";
			}

			var imgBox=$('#largeImage');
			imgBox.alt="加载图片中...";
			imgBox.src="";
			viewer.style.display="block";
			viewer.style.postion="fixed";
		} catch (err) {
			$error("showLargeImageViewer",err);
		}
	}
	//获取一般图片的大图并显示出来
	var showLargeImage=function(pageURL,imgId) {
		try {
			sendHttpRequest({method: 'GET', url: pageURL, onload: function (responseDetails) {
				if(responseDetails.status!=200) {
					return;
				}
				try {
					var src;
					var i,j;
					if(responseDetails.responseText.search("<body id=\"errorPage\">")!=-1) {
						setImageCache(imgId,"error");
						$('#largeImage').alt="加载图片失败";
						return;
					}
					i=responseDetails.responseText.search(/<img .*?id="photo"/);
					if(i>0) {
						j=responseDetails.responseText.indexOf(">",i);
						src=responseDetails.responseText.substring(i,j);
						i=src.indexOf("src=\"")+5;
						j=src.indexOf("\"",i);
						src=src.substring(i,j);
						setImageCache(imgId,src);
						if($('#largeImage').getAttribute("orig")==imgId) {
							$('#largeImage').rsrc=src;
							$('#largeImage').src=src;
						}
					}
				} catch (e) {
					$error("showLargeImage_onload",e);
				}
			}});
		} catch (e) {
			$error("showLargeImage",e);
		}
	}
	//获取相册中某一张图片的大图并显示出来
	var showLargeImageInAlbum=function(album,pageN,imgId,imgDate) {
		try {
			sendHttpRequest({method: 'GET', url: album+"&curpage="+pageN, onload: function (responseDetails) {
				if(responseDetails.status!=200) {
					return;
				}
				try {
					var i,j;
					var res=responseDetails.responseText;
					if(res.search("<body id=\"errorPage\">")!=-1) {
						setImageCache(imgId,"error");
						$('#largeImage').alt="加载图片失败";
						return;
					}
					// 搜索ID匹配的图片
					i=res.search(RegExp("src=\"http://.*?"+imgId));
					while(i!=-1 && (res.substring(i-60,i).indexOf("type=\"hidden\"")!=-1 || res.substring(i-30,i).indexOf("class=\"avatar\"")!=-1)) {
						res=res.substring(i+10);
						i=res.search(RegExp("src=\"http://.*?"+imgId));
					}
					// 当ID不匹配且为搜索小头像时，搜索时间匹配的图片
					if(i==-1 && imgDate) {
						res=responseDetails.responseText;
						i=res.search(RegExp("src=\"http://.*?/"+imgDate+"/.*?\\.jpg\""));
						while(i!=-1 && (res.substring(i-60,i).indexOf("type=\"hidden\"")!=-1 || res.substring(i-30,i).indexOf("class=\"avatar\"")!=-1)) {
							res=res.substring(i+10);
							i=res.search(RegExp("src=\"http://.*?/"+imgDate+"/.*?\\.jpg\""));
						}
					}
					if(i!=-1) {
						i=res.lastIndexOf(" href=\"",i)+7;
						j=res.indexOf("\"",i);
						res=res.substring(i,j);
						if(res.search(/^[a-zA-Z]+:\/\//)==-1) {
							if(res.charAt(0)!='/') {
								res="/"+res;
							}
							res=album.substring(0,album.lastIndexOf("/"))+res;
						}
						showLargeImage(res,imgId);
					} else {
						i=res.search(/共[0-9]*张/);
						if(i>0) {
							j=res.indexOf("张",i);
							if(res.indexOf("-"+res.substring(i+1,j+1))==-1) {
								showLargeImageInAlbum(album,pageN+1,imgId,imgDate);
							}
						} else {
							setImageCache(imgId,"error");
							$('#largeImage').alt="加载图片失败";
							return;
						}
					}
				} catch (e) {
					$error("showLargeImageInAlbum_onload",e);
				}
			}});
		} catch (e) {
			$error("showLargeImageInAlbum",e);
		}
	}
	//设置图片缓存
	var setImageCache=function(imgId,src) {
		try {
			if(src!="error") {
				var cookie=getCookie("xn_imageCache");
				setCookie("xn_imageCache",cookie+imgId+"|"+src+"|");
			}
			imgCache[imgId]=src;
		} catch (e) {
			$error("setImageCache",e);
		}
	}
	//读取图片缓存
	var getImageCache=function(imgId) {
		try {
			if(imgCache[imgId]) {
				return imgCache[imgId];
			} else {
				var cookie=getCookie("xn_imageCache");
				var cookies=cookie.split('|');
				for(var i=0;i<cookies.length;i+=2) {
					if(cookies[i]==imgId) {
						return cookies[i+1];
					}
				}
			}
			return "";
		} catch (e) {
			$error("getImageCache",e);
		}
	}
	//正式开始
	try {
		if(window.location.hostname=="reg.renren.com" || window.location.hostname=="login.renren.com") {
			return;
		}
		$('#largeImageViewer') && window.addEventListener('mouseover', function(e) {
			try {
				if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
					var t = e.target;
					var imgId,cache,pageURL;
					var str,imgSrc="",imgDate=null;
					if (t.tagName == 'IMG') {
						//将地址放到style中的图片
						if(t.src.indexOf("xnimg.cn/a.gif")!=-1 && t.style.backgroundImage.indexOf("url(")!=-1) {
							imgSrc=t.style.backgroundImage.replace(/^url\("|"\);?$/g,"");
						} else {
							imgSrc=t.src;
						}
					} else if (t.tagName == 'SPAN' || t.tagName == 'DIV') {
						if(t.style.backgroundImage.indexOf("url(")!=-1) {
							imgSrc=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
						}
					} else if (t.tagName == 'CANVAS') {
						var tempId="id"+Math.round(Math.random()*100000);
						t.setAttribute("id",tempId);
						imgSrc=unsafeWindow.document.getElementById(tempId).source;
						t.setAttribute("id","");
					} else if (t.tagName == "A") {
						if(t.style && t.style.backgroundImage.indexOf("url(")!=-1) {
							imgSrc=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
							pageURL=t.href;
						}
					}
					if(imgSrc!="") {
						imgId=imgSrc.substring(imgSrc.lastIndexOf("_"));
						$('#largeImage').setAttribute("orig",imgId);
						if (((imgSrc.indexOf('head_')!=-1 || imgSrc.indexOf('p_head_')!=-1 || imgSrc.indexOf('p_main_')!=-1 || imgSrc.indexOf('main_')!=-1 || ((imgSrc.search(/head\d+\./)!=-1 || imgSrc.search(/\/H[^\/]*\.jpg/)!=-1 || imgSrc.indexOf("head.xiaonei.com/photos/")!=-1) && imgSrc.indexOf('_')==-1)) && t.parentNode.tagName=="A") || imgSrc.indexOf('tiny_')!=-1) {
							if(!pageURL && t.parentNode.tagName=="A") {
								pageURL=t.parentNode.href;
							} else if (t.className=="avatar" && t.parentNode.className=="user-avatar") {
								pageURL="http://photo.renren.com/getalbumprofile.do?owner="+getCookie("id");
							}
							//一种非常古老的图片（http://fm071.img.renren.com/pic001/20070523/2025/H[0-9]+[A-Z]+.jpg），改imgId
							if(imgSrc.search(/http:\/\/.*?\.img\.renren\.com\/pic\d+\/\d{8}\/\d+\/H.*?\.jpg/)!=-1) {
								imgId=imgSrc.substring(imgSrc.lastIndexOf("/H")+2);
							}

							cache=getImageCache(imgId);
							if(cache) {	//已经在缓存里了
								showLargeImageViewer(e.pageX);
								if(cache!="error") {
									$('#largeImage').rsrc=cache;
									$('#largeImage').src=cache;
								} else {
									$('#largeImage').alt="加载图片失败";
								}
								return;
							}

							if(!pageURL) {
								return;
							}
							//没有附加码，也不属于头像，也不是非常古老的头像（http://head.xiaonei.com/photos/20070409/1835/head[0-9]+.jpg），直接改URL
							if(imgSrc.indexOf("_",imgSrc.indexOf("head_")+5)==-1 && imgSrc.indexOf("http://hd")==-1 && imgSrc.indexOf('_')!=-1) {
								cache=imgSrc.replace("head_","large_");
								setImageCache(imgId,cache);
								showLargeImageViewer(e.pageX);
								$('#largeImage').src=cache;
								return;
							}

							//小头像，包括一种非常古老的（"http://head.xiaonei.com/photos/20070409/1835/tiny[0-9]+.jpg"）
							if((imgSrc.indexOf("tiny_")!=-1 || (imgSrc.indexOf("tiny")!=-1 && imgSrc.indexOf("_")==-1)) && pageURL.indexOf("getalbumprofile.do")==-1) {
								if(imgSrc.indexOf("_")!=-1) {
									imgDate=/[hf][dm]n?\d+\/(.*?)\/tiny_/.exec(imgSrc)[1];
								} else {
									imgDate=/photos\/(.*?)\/tiny/.exec(imgSrc)[1];
								}
								pageURL="http://photo.renren.com/getalbumprofile.do?owner="+/id=(\d+)/.exec(pageURL)[1];
							}

							//相册封面图片或头像图片
							if(pageURL.indexOf("getalbum.do")!=-1 || pageURL.indexOf("getalbumprofile.do")!=-1 || pageURL.indexOf("/photo/album?")!=-1 || imgSrc.indexOf("head.xiaonei.com/photos/")!=-1)	{
								showLargeImageViewer(e.pageX);
								showLargeImageInAlbum(pageURL,0,imgId,imgDate);
								return;
							}

							//一般图片或被圈相片或公共主页上的图片
							if(pageURL.indexOf("getphoto.do")!=-1 || pageURL.indexOf("gettagphoto.do")!=-1 || pageURL.indexOf("page.renren.com/photo/photo?")!=-1) {
								showLargeImageViewer(e.pageX);
								showLargeImage(pageURL,imgId);
							}
						}
					}
				}
			} catch (err) {
				$error("onmouseover",err);
			}
		}, false);

		$('#largeImageViewer') && document.addEventListener('mouseout', function(e) {
			try {
				if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
					if (e.target.id != 'largeImage') {
						$('#largeImageViewer').style.display='none';
					}
				}
			} catch (err) {
				$error("onmouseout",err);
			}
		}, false);
	} catch (err) {
		$error("showImageOnMouseOver",err);
	}
}

//建立大图显示DIV
function createImageViewer() {
	try {
		if(window.location.hostname=="reg.renren.com" || window.location.hostname=="login.renren.com") {
			return;
		}
		var viewer=$node("div",{id:"largeImageViewer",style:"border:3px double rgb(102,102,102);display:none;background-color:rgb(246,246,246);top:2px;z-index:199999;right:2px;position:fixed;"},'<img id="largeImage" alt="加载图片中..." src=""/>');
		document.body.appendChild(viewer);
	} catch (err) {
		$error("createImageViewer",err);
	}
}

//将相册内的所有相片在一页中全部显示
function showImagesInOnePage() {
	try {
		if(window.location.host!="photo.renren.com" || (window.location.pathname!="/getalbum.do" && window.location.pathname!="/getalbumprofile.do")) {
			return;
		}
		var baseURL="http://photo.renren.com"+window.location.pathname;
		var album=$1("//div[@class='photo-list clearfix']");
		if(!album) {
			return;
		}
		var items=$1("//li//span[@class='number-photo']");
		if(!items) {
			return;
		}
		var photoAmount=parseInt(/共 *([0-9]+) *张/.exec(items.textContent)[1]);
		var maxPage=((photoAmount-1)/$first(album).children.length);
		for(var i in items.childNodes) {
			if(items.childNodes[i].textContent.search(/共 *[0-9]+ *张/)!=-1) {
				items.childNodes[i].textContent="共"+photoAmount+"张 ";
				break;
			}
		}
		//相册ID
		var id=/[\?&]id=([0-9]+)/i.exec(window.location.href);
		if(id==null) {
			id=/[\?&]id=([0-9]+)/i.exec($1("//li[@class='current']//a"))[1];
		} else {
			id=id[1];
		}
		//相册所有者ID
		var owner=/[\?&]owner=([0-9]+)/i.exec(window.location.href)[1];
		var curPage=/[\?&]curpage=([0-9]+)/i.exec(window.location.href);
		if(curPage==null || curPage[1]==null) {
			curPage=0;
		} else {
			curPage=parseInt(curPage[1]);
		}
		for(var i=0;i<=maxPage;i++) {
			if(i==curPage) {
				continue;
			}
			sendHttpRequest({
		        method: 'GET',
	    	    url: baseURL+"?id="+id+"&owner="+owner+"&curpage="+i,
				onload: function (res) {
					if(res.status!=200) {
						return;
					}
					try {
						var photoList=/<div .*? class="photo-list clearfix".*?>([\d\D]+?)<\/div>/.exec(res.responseText)[1];
						album.innerHTML+=photoList;
					} catch (err) {
						$error("showImagesInOnePage_HttpRequest",err);
					}
				}
			});
		}
		$remove($("//ol[@class='pagerpro']"));
	} catch (err) {
		$error("showImagesInOnePage",err);
	}
}

//显示共同好友
function showMatualFriends() {
	try {
		if((window.location.pathname!="/profile.do" && window.location.pathname!="/") || window.location.href.search(/[\?&]id=[0-9]+/i)==-1) {
			return;
		}
		//朋友的ID
		var fid=/[\?&]id=([0-9]+)/i.exec(window.location.href)[1];
		//自己的ID
		var mid=getCookie("id");
		if(fid==mid) {	//在自己页面
			return;
		}
		//侧栏
		var items=$1("//div[@class='extra-column']//div[@class='box-holder']");
		if(!items) {
			return;
		}
		var mfdiv=$node('div',{id:"mutualFriendsBox",class:"profile-friends box"},'<h4 class="box-header"><span id="mutualFriendsSpan">共同好友 (载入中...)</span>&nbsp;<a class="count" id="mutualFriendsCount" style="text-decoration:none;">(0)</a></h4><div class="box-body" style="max-height:210px; overflow-y:auto; padding-left:0pt;"><div class="clearfix"><ul class="people-list" id="mutualFriendsList"></ul></div></div>');
		items.appendChild(mfdiv);
		var myfriends=[];
		//载入自己的好友列表
		sendHttpRequest({
	        method: 'GET',
	        url: 'http://photo.renren.com/gettagfriends.do',
			onload: function(res) {
				if(res.status!=200) {
					return;
				}
				try {
					var friends=JSON.parse(res.responseText).friends_ajax;
					for(var i in friends) {
						myfriends[friends[i].id]=1;
					}
					loadFriends(0,fid,myfriends,0);
				} catch (e) {
					$error("mutualFriendsList_onload",e);
				}
			}
		});
	} catch (err) {
		$error("showMatualFriends",err);
	}

	//获取fid的好友
	function loadFriends(page,fid,myfriends,mfcount) {
		try {
			sendHttpRequest({
		        method: 'GET',
		        url: "http://friend.renren.com/GetFriendList.do?curpage="+page+"&id="+fid,
				onload: function(res) {
					if(res.status!=200) {
						return;
					}
					try {
						var friends=[];
						var friendInfo;
						while(friendInfo=/doPoke\(event,\'(\d+)\',\'(.+?)\'\)/ig.exec(res.responseText)) {
							friends.push({id:friendInfo[1],name:friendInfo[2],node:null});
						}
						if(friends.length>0) {
							var mflist=$("#mutualFriendsList");
							var mfcounter=$("#mutualFriendsCount");
							for(var i in friends) {
								if(myfriends[friends[i].id]!=null) {
									myfriends[friends[i].id]=null;
									mfcount++;
									mfcounter.innerHTML="("+mfcount+")"
									friends[i].node=document.createElement("li");
									friends[i].node.innerHTML+="<span><a href=\"http://renren.com/profile.do?id="+friends[i].id+"\">"+friends[i].name+"</a></span>";
									mflist.appendChild(friends[i].node);
									if($option("showMatualFriendsImage")) {
										loadFriendTinyImage(friends[i]);
									}
								}
							}
							loadFriends(page+1,fid,myfriends,mfcount);
						} else {
							$("#mutualFriendsSpan").innerHTML="共同好友";
						}
					} catch (err) {
						$error("loadFriends_HttpRequest",err);
					}
				}
			});
		} catch (err) {
			$error("loadFriends",err);
		}
	}

	//加入头像图标
	function loadFriendTinyImage(friendInfo) {
		try {
			sendHttpRequest({
				method: 'GET',
				url: "http://photo.renren.com/getalbumprofile.do?owner="+friendInfo.id,
				onload: function(res) {
					if(res.status!=200) {
						return;
					}
					try {
						var img=/<img .*?src="(http:\/\/h[ea]*d.+\/photos\/.+\/tiny_?.+?)"/i.exec(res.responseText);
						if(img==null) {
							img=/url\("?(http:\/\/h[ea]*d.+\/photos\/.+\/tiny_?.+?)"?\)/i.exec(res.responseText);
							if(img==null) {
								img=/url\("?(http:\/\/h[ea]*d.+\/photos\/.+\/.*_tiny?.+?)"?\)/i.exec(res.responseText);
							}
						}
						if(img!=null) {
							img=img[1];
						} else {
							img="http://head.xiaonei.com/photos/0/0/men_tiny.gif"
						}
						var imageLink=$node("a",{title:"查看"+friendInfo.uname+"的个人主页",href:"http://renren.com/profile.do?id="+friendInfo.id,style:"background-image:url('"+img+"');"});
						friendInfo.node.insertBefore(imageLink,$first(friendInfo.node));
					} catch (err) {
						$error("loadFriendTinyImage_HttpRequest",err);
					}
				}
			});
		} catch (err) {
			$error("loadFriendTinyImage",err);
		}
	}
}

//检查更新
function checkUpdate(manually) {
	try {
		var today=new Date();
		//$option("lastUpdate","1/1/2000");
		if($option("lastUpdate")=="") {
			$option("lastUpdate",today.toString());
		}
		var last=new Date($option("lastUpdate"));
		//一天检查一次
		if(manually || (today-last)/3600000/24>1) {
			var pageLink=$option("pageLink");
			var scriptLink=$option("scriptLink");
			if(manually) {
				setUpdateButtonState(false);
			}
			sendHttpRequest({
		        method: 'GET',
	    	    url: pageLink,
				onload: function(res) {
					if(res.status!=200) {
						setUpdateButtonState(true);
						return;
					}
					try {
						var nv,cv,i;
						var udiv;
						if(nv=/<b>Version:<\/b>.*\n *([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(res.responseText)) {
							cv=version.split(".");
							for(i=0;i<4;i++) {
								if(nv[i+1]>cv[i]) {
									udiv=$node("div",{id:"updateNotify",style:"bottom:0px;position:fixed;z-index:100000;background-color:rgb(246,246,246)"},'<div><font color=crimson>校内网改造器已有新版本：'+nv[1]+'.'+nv[2]+'.'+nv[3]+'.'+nv[4]+'</font> <a id="updateInstall" target="_blank" href="'+scriptLink+'">安装</a> <a id="updateGotoPage" target="_blank" href="'+pageLink+'">去看看</a> <a id="updateLater">以后再说</a></div>');
									document.body.appendChild(udiv);
									$("#updateLater").addEventListener("click",hideUpdateNotify,false);
									$("#updateGotoPage").addEventListener("click",hideUpdateNotify,false);
									$("#updateInstall").addEventListener("click",hideUpdateNotify,false);
									setUpdateButtonState(true);
									return;
								} else if(nv[i+1]<cv[i]) {
									if(manually==true) {
										alert("没有找到更新版本");
									}
									setUpdateButtonState(true);
									return;
								}
							}
						}
						$option("lastUpdate",today.toString());
						if(manually==true) {
							alert("没有找到更新版本");
						}
						setUpdateButtonState(true);
					} catch (err) {
						$error("checkUpdate_onload",err);
					}
				}
			});
		}
	} catch (err) {
		$error("checkUpdate",err);
	}
	//设置立即升级按钮状态
	function setUpdateButtonState(enabled) {
		try {
			var btn=$("#updateNow");
			btn.disabled=!enabled;
			btn.value=enabled?"立即检查":"检查中...";
		} catch (err) {
			$error("setUpdateButtonState",err);
		}
	}

	//隐藏升级提示
	function hideUpdateNotify() {
		try {
			removeElement($("#updateNotify"));
			$option("lastUpdate",today.toString());
		} catch (err) {
			$error("checkUpdate_onclick",err);
		}
	}
}

//选中“悄悄话”选框
function useWhisper() {
	try {
		var chk=$('whisper');
		if(chk && chk.checked==false) {
			$click(chk);
		}
	} catch (err) {
		$error("useWhisper",err);
	}
}

//去除只有星级用户才能添加/修改特别好友的限制
function removeFriendRestriction() {
	try {
		if(window.location.host!="friend.renren.com") {
			return;
		}
		// firefox only:
		// unsafeWindow.user.star=true;
		// unsafeWindow.user.vip=true;
		window.location.href="javascript:(function(){window.user.star=true;window.user.vip=true;})()";
	} catch (err) {
		$error("removeFriendRestriction",err);
	}
}

//自动检查新鲜事更新
function autoRefreshFeeds() {
	try {
		if(window.location.hostname=="reg.renren.com" || window.location.hostname=="login.renren.com") {
			return;
		}
		if(window.location.hostname=="home.renren.com") {
			//在首页增加一段自动更新的代码
			var scriptNode=$node("script",{type:"text/javascript"},"if(window.feedEditor && window.feedEditor.getNewFeeds) setInterval(window.feedEditor.getNewFeeds,"+$option("checkFeedInterval")*1000+");");
			document.body.appendChild(scriptNode);
			setCookie("newestFeed",$1("//li",$("#feedHome")).id);
		} else {
			setInterval(checkNewFeeds,$option("checkFeedInterval")*1000);
		}
	} catch (err) {
		$error("autoRefreshFeeds",err);
	}

	//检查新鲜事
	function checkNewFeeds() {
		try {
			sendHttpRequest({method: "GET", url: "http://renren.com/retrieveNews.do", onload: function (response) {
				if(response.status!=200) {
					return;
				}
				try {
					var r=response.responseText.split("##@L#");
					if(!/^\d+$/.test(r[0])) {
						//回复结构变了
						$remove($("#newFeedsNotify"));
						return;
					}
					var newFeedsCount=parseInt(r[0]);
					if(newFeedsCount<=0) {
						return;
					}

					//修正真正的新新鲜事数
					var newFeeds=$node("ul",{style:"display:none"},r[1].replace(/onload=".*?"/,"").replace("lala=","src="));
					var newestFeedId=getCookie("newestFeed");
					if(newestFeedId!="") {
						var n=newFeedsCount;
						newFeedsCount=0;
						for(var i=0;i<n;i++) {
							if(newestFeedId!=newFeeds.children[i].id) {
								newFeedsCount++;
							} else {
								break;
							}
						}
					}
					newestFeedId=$first(newFeeds).id;
					setCookie("newestFeed",newestFeedId);
					if(newFeedsCount<=0) {
						return;
					}

					var wpibar=$("#wpiroot");
					if(wpibar) {
						//有校内通栏的情况
						var item=$1("//div[@class='m-chat']//div[@class='m-chat-tabbar']//div[@class='m-chat-presence']//div[@class='m-chat-button-notifications m-chat-button-active' or @class='m-chat-button-notifications']",wpibar);
						if(item) {
							//提醒内容
							var tips=$1("//div[@class='m-chat-window notifications hide' or @class='m-chat-window notifications']//div[@class='chat-conv']",item);
							if(tips) {
								//添加提醒
								var node=$first(tips);
								if(node.innerHTML.indexOf('无新提醒')!=-1) {
									node.className="notifyitem hide";
								}
		
								for(var i=newFeedsCount-1;i>=0;i--) {
									var node=$node("div",{class:"notifyitem"});
									//图标
									if(newFeeds.children[i].children[0].children[0].children[0].getAttribute("lala")) {
										node.appendChild($node("div",{class:"notifyico"},"<img src='"+newFeeds.children[i].children[0].children[0].children[0].getAttribute("lala")+"' style='height:16px;width:16px;' />"));
									} else {
										node.appendChild($node("div",{class:"notifyico"},"<img src='"+newFeeds.children[i].children[0].children[0].children[0].src+"' style='height:16px;width:16px;' />"));
									}
									//关闭按钮
									var nodeBody=$node("div",{class:"close"});
									nodeBody.addEventListener("click",closeFeed,false);
									node.appendChild(nodeBody);
									//内容
									node.appendChild($node("div",{class:"notifybody"},"新鲜事："+newFeeds.children[i].children[1].innerHTML));
									node.setAttribute("onmouseover","this.className=\"notifyitem hover\";");
									node.setAttribute("onmouseout","this.className=\"notifyitem\";");
									tips.insertBefore(node,$first(tips));
								}
								//增加提醒计数
								var count=$1("//div[@class='m-chat-msgcount hide' or @class='m-chat-msgcount']",item);
								if(count) {
									count.innerHTML=(parseInt(count.innerHTML)+newFeedsCount).toString();
									count.className="m-chat-msgcount";
								}
								return;
							}
						}
					}
					//无校内通栏，或结构有变
					var feedList=$("#newFeedsList");
					if(!feedList) {
						bar=$node("div",{style:"position:fixed;bottom:10px;right:20px;width:200px;z-index:100000;padding:5px;background-color:#E5E5E5;opacity:0.85;border:#000000 double 3px;-moz-border-radius:5px;",id:"newFeedsNotify"});
						node=$node("div",null,"<span style='color:red;'>您有新的新鲜事</span><a style='float:right;' onclick='document.body.removeChild(document.getElementById(\"newFeedsNotify\"));'>关闭</a>");
						bar.appendChild(node);
						node=$node("div",{style:"max-height:100px;width:100%;overflow-y:auto"});
						feedList=$node("ul",{id:"newFeedsList"});
						node.appendChild(feedList);
						bar.appendChild(node);
						document.body.appendChild(bar);
					}
					if($last(feedList)) {
						$last(feedList).style.borderBottom="1px solid";
					}
					for(i=0;i<newFeedsCount;i++) {
						node=$node("li",{style:"padding-top:5px;padding-bottom:5px;border-bottom:1px solid"},newFeeds.children[i].children[1].innerHTML.replace(/^ +| +$/,""));
						feedList.appendChild(node);
					}
					$last(feedList).style.borderBottom="";
				} catch (err) {
					$error("checkNewFeeds_onload",err);
				}
			}});
		} catch (err) {
			$error("checkNewFeeds",err);
		}
	}

	//关闭新鲜事提醒
	function closeFeed(evt) {
		try {
			var obj=evt.target;
			var pnode=$p($p(obj));
			$remove($p(obj));
			if(pnode.children.length==1) {
				$first(pnode).className="notifyitem";
			}
		} catch (err) {
			$error("closeFeed",err);
		}
	}
}

//去除页面字体限制
function removeFontRestriction() {
	$style("* {font-family:none !important}");
}

//在视频分享增加原始页面链接
function addVideoOrigPageLink() {
	try {
		if(!$("#sharevideo")) {
			return;
		}
		var page="",test="";
		var src=$1("//div[@id='sharevideo']//div//embed").src;
		//优酷
		test=/http:\/\/player\.youku\.com\/player\.php\/sid\/(.*?)=/.exec(src);
		if(test && test.length==2) {
			page="http://v.youku.com/v_show/id_"+test[1]+".html";
		}
		//土豆
		if(page=="") {
			test=/http:\/\/www\.tudou\.com\/v\/(.*)/.exec(src);
			if(test && test.length==2) {
				page="http://www.tudou.com/programs/view/"+test[1];
			}
		}

		if(page!="") {
			var node=$node("span",null,$node("a",{href:page},"原始页面"));
			var p=$("#sharevideo");
			p.insertBefore(node,$first(p));
		}
	} catch (err) {
		$error("addVideoOrigPageLink",err);
	}
}

//在导航栏的设置菜单中增加设置项
function createDropDownMenu() {
	try {
		var list=$1("//div[@class='optionmenu']//ul");
		if(!list) {
			return;
		}
		var menu=$node("li",null,"<a class=\"optionapplication\">改造选项</a>");
		menu.addEventListener("click",showConfigMenu,false);
		list.appendChild(menu);
	} catch (err) {
		$error("createDropDownMenu",err);
	}
}

//创建设置菜单
function createConfigMenu() {
	//点击确定
	var menuOK=function(evt) {
		try {
			var e=$("#headAmount");
			if(!/^[0-9]+$/.test(e.value) || parseInt(e.value)<0) {
				alert("请在头像最大数量处输入一个非负整数！");
				e.focus();
				e.selectionStart=0;
				e.selectionEnd=e.value.length;
				return;
			}
			e=$("#checkFeedInterval");
			if(!/^[0-9]+$/.test(e.value) || parseInt(e.value)<=0) {
				alert("请在更新新鲜事间隔时间处输入一个正整数！");
				e.focus();
				e.selectionStart=0;
				e.selectionEnd=e.value.length;
				return;
			}

			e=$("#headAmount");
			$option("headAmount",parseInt(e.value));
			e=$("#checkFeedInterval");
			$option("checkFeedInterval",parseInt(e.value));
			e=$("#scriptLink");
			$option("scriptLink",e.value);
			e=$("#pageLink");
			$option("pageLink",e.value);
			e=$("#navExtraContent");
			$option("navExtraContent",e.value);

			for (var option in options) {
				var op=$("#"+option);
				if (op) {
					$option(option,(op.type=="checkbox"?op.checked:op.value));
				}
			}
			menuCancel(evt);
			window.location.reload();
		} catch (err) {
			$error("menuOK",err);
		}
	}
	//点击取消
	var menuCancel=function(evt) {
		try {
			$hide($("#configMenu"));
		} catch (err) {
			$error("menuCancel",err);
		}
	}
	//点击显示导航栏新增项目详细
	var navExtraShow=function(evt) {
		try {
			var e=$("#navExtraBox");
			var isHide=(e.style.display=="none");
			e.style.display=isHide?"block":"none";
			$("#navExtraShow").innerHTML=hide?"隐藏":"显示";
		} catch (err) {
			$error("navExtraShow",err);
		}
	}
	//点击立即更新
	var checkUpdateNow=function(evt) {
		try {
			checkUpdate(true);
		} catch (err) {
			$error("checkUpdateNow",err);
		}
	}
	//正式开始
	try {
		var configMenuContent='\
		<style type="text/css">\
			.ul2,.ul5,.ul1{list-style:none;clear:both;}\
			.ul1 li{min-height:20px;} .ul1 li input{min-height:20px;}\
	    	.ul5 li{width:20%;float:left;min-height:20px;} .ul5 li input{min-height:20px;}\
		    .ul2 li{width:50%;float:left;min-height:20px;} .ul2 li input{min-height:20px;}\
			.h{clear:both;padding-top:5px;padding-bottom:2px;min-height:20px;}\
		</style>\
		<table class="pop_dialog_table" style="width: 100%; height: 100%;">\
			<tbody>\
				<tr>\
					<td class="pop_topleft"/>\
					<td class="pop_border"/>\
					<td class="pop_topright"/>\
				</tr>\
				<tr>\
					<td class="pop_border"/>\
					<td class="pop_content"><h2><span style="float:right">'+version+'</span><span>校内人人网改造选项</span></h2>\
						<div class="dialog_content" id="innerBox" style="width: 100%; overflow: auto;">\
							<div class="dialog_body">\
								<h4 class="h">清理页面：</h4>\
								<ul class="ul2">\
									<li><input type="checkbox" id="removeAds" /></li>\
									<li><input type="checkbox" id="removeCommendation" /></li>\
									<li><input type="checkbox" id="removePageTheme" /></li>\
									<li><input type="checkbox" id="removeRenRenSurvey" /></li>\
									<li><input type="checkbox" id="removeStarReminder" /></li>\
									<li><input type="checkbox" id="removeFriendGuide" /></li>\
									<li><input type="checkbox" id="removeCommonPage" /></li>\
									<li><input type="checkbox" id="removePageTopNotice" /></li>\
									<li><input type="checkbox" id="removeAppRequest" /></li>\
									<li><input type="checkbox" id="removeNewStar" /></li>\
									<li><input type="checkbox" id="removeEventRequest" /></li>\
									<li><input type="checkbox" id="removeMusicPlayer" /></li>\
									<li><input type="checkbox" id="removeNoticeRequest" /></li>\
									<li><input type="checkbox" id="removePollRequest" /></li>\
									<li><input type="checkbox" id="removeXntBar" /></li>\
									<li><input type="checkbox" id="removeGameRequest" /></li>\
									<li><input type="checkbox" id="removePaintReminder" /></li>\
								</ul>\
								<div class="h">\
								<h4 style="float:left">清理新鲜事：</h4><input style="clear:right" type="checkbox" id="markFeedAsRead" />设为已读\
								</div>\
								<ul class="ul5">\
									<li><input type="checkbox" id="removeBlogFeed" /></li>\
									<li><input type="checkbox" id="removePollFeed" /></li>\
									<li><input type="checkbox" id="removeAppFeed" /></li>\
									<li><input type="checkbox" id="removeActFeed" /></li>\
									<li><input type="checkbox" id="removeStatusFeed" /></li>\
									<li><input type="checkbox" id="removeGiftFeed" /></li>\
									<li><input type="checkbox" id="removeFriendFeed" /></li>\
									<li><input type="checkbox" id="removeImageFeed" /></li>\
									<li><input type="checkbox" id="removeImageTagFeed" /></li>\
									<li><input type="checkbox" id="removeCommentFeed" /></li>\
									<li><input type="checkbox" id="removeClassFeed" /></li>\
									<li><input type="checkbox" id="removeShareFeed" /></li>\
									<li><input type="checkbox" id="removeVipFeed" /></li>\
									<li><input type="checkbox" id="removeProfileFeed" /></li>\
									<li><input type="checkbox" id="removeFilmFeed" /></li>\
								</ul>\
								<h4 class="h">功能增强：</h4>\
								<div style="width:35%;min-height:20px"><input type="checkbox" id="addNavBarItem" /><a id="navExtraShow" style="cursor:pointer;">显示</a></div>\
								<div id="navExtraBox" style="clear:both;display:none;height:120px">\
									<div style="float:right;height:120px;width:65%">\
										<textarea id="navExtraContent" style="height:90%;width:95%;overflow:scroll;" wrap="off"></textarea>\
									</div>\
									<label style="height:100px;width:35%">说明：<br/>每两行描述一项，其中第一行为说明文字，第二行为页面地址。请注意不要有空行。</label>\
								</div>\
								<ul class="ul2">\
									<li><input type="checkbox" id="widenNavBar" /></li>\
									<li><input type="checkbox" id="hideFeedContent" /></li>\
									<li><input type="checkbox" id="flodStatusComment" /></li>\
									<li><input type="checkbox" id="addExtraEmotions" /></li>\
									<li><input type="checkbox" id="showImageOnMouseOver" /></li>\
									<li><input type="checkbox" id="addFloorCounter" /></li>\
									<li><input type="checkbox" id="showMatualFriends" /></li>\
									<li><input type="checkbox" id="showImagesInOnePage" /></li>\
									<li><input type="checkbox" id="removeFriendRestriction" /></li>\
									<li><input type="checkbox" id="useWhisper" /></li>\
									<li><input type="checkbox" id="addVideoOrigPageLink" /></li>\
									<li><input type="checkbox" id="autoRefreshFeeds" /></li>\
								</ul>\
								<h4 class="h">其他：</h4>\
								<ul class="ul1">\
									<li><input type="checkbox" id="recoverOriginalTheme" /></li>\
									<li><input type="checkbox" id="removeFontRestriction" /></li>\
									<li><input type="checkbox" id="showMatualFriendsImage" /></li>\
									<li><input id="headAmount" style="width:30px ;" /></li>\
									<li><input id="checkFeedInterval" style="width:30px ;" />秒</li>\
								</ul>\
								<h4 class="h">脚本设置：</h4>\
								<ul class="ul1">\
									<li><input type="checkbox" id="checkUpdate" /><input id="updateNow" type="button" value="立即检查"/>\
										<div style="min-height:25px;margin-left:16px">页面地址：<input id="pageLink" style="width:290px ;" /></div>\
										<div style="min-height:25px;margin-left:16px">脚本地址：<input id="scriptLink" style="width:290px ;" /></div>\
									</li>\
								</ul>\
							</div>\
						</div>\
						<div class="dialog_buttons">\
							<input type="button" id="ok" class=" input-submit" value="确定" dialog="1"/>\
							<input type="button" id="cancel" class=" input-submit gray" value="取消" dialog="1"/>\
						</div>\
					</td>\
					<td class="pop_border"/>\
				</tr>\
				<tr>\
					<td class="pop_bottomleft"/>\
					<td class="pop_border"/>\
					<td class="pop_bottomright"/>\
				</tr>\
			</tbody>\
		</table>\
		'

		var menu=$("#configMenu");
		if(menu!=null) {
			return;
		}
		menu=$node("div",{id:"configMenu",style:"width:450px;left:50%;margin-left:-225px;display:none;position:fixed;z-index:200000"},configMenuContent);
		document.body.appendChild(menu);
		for (var option in options) {
			var op=$("#"+option);
			if(op) {
				if(op.type=="checkbox") {
					op.checked=$option(option);
					if(op.nextSibling) {
						$p(op).insertBefore($node(null,null,options[option].text),op.nextSibling);
					} else {
						$p(op).appendChild($node(null,null,options[option].text),op.nextSibling);
					}
				} else {
					op.value=$option(option);
					$p(op).insertBefore($node(null,null,options[option].text),op);
				}
			}
		}
		$("#ok").addEventListener("click",menuOK,false);
		$("#cancel").addEventListener("click",menuCancel,false);
		$("#navExtraShow").addEventListener("click",navExtraShow,false);
		$("#updateNow").addEventListener("click",checkUpdateNow,false);
	} catch (err) {
		$error("createConfigMenu",err);
	}
}

function showConfigMenu() {
	try {
		var menu=$("#configMenu");
		var menuBody=$("#innerBox");
		if(menu && menuBody) {
			menuBody.style.height="";
			menu.style.display="block";
			if(window.innerHeight<menu.offsetHeight) {
				menuBody.style.height=(window.innerHeight<200)?"100px":(window.innerHeight-100)+"px";
			}
			menu.style.top=(window.innerHeight<menu.offsetHeight)?0:(window.innerHeight-menu.offsetHeight)/2+"px";
		}
	} catch (err) {
		$error("showConfigMenu",err);
	}
}

(function (){
	try {
		//不在frame中运行
		if (self != window.top){
			return;
		}
		//获取已经保存的选项
		for(var option in options) {
			var value=null;
			try {
				value=GM_getValue(option,$option(option));
			} catch(err) {
				value=$option(option);
			}
			$option(option,value);
		}
		addFeedEventNotifier();
		createImageViewer();
		//设置大图缓存
		var cookie=getCookie("xn_imageCache");
		var cookies=cookie.split('|');
		for(var i=0;i<cookies.length;i+=2) {
			imgCache[cookies[i]]=cookies[i+1];
		}
		//设置菜单
		createConfigMenu();
		createDropDownMenu();
		try {
			GM_registerMenuCommand("校内人人网改造选项",showConfigMenu);
		} catch(err) {
		}
		//改造
		for(var option in options) {
			if(options[option].value===true && options[option].fn) {
				try {
					options[option].fn.call();
				} catch(err) {
					$error("reform",err);
				}
			}
		}
	} catch (err) {
		$error("exec",err);
		return;
	}
})();

