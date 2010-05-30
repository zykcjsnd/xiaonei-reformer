// ==UserScript==
// @name           校内人人网改造器 Xiaonei Reformer Exp
// @namespace      Xiaonei_reformer_exp
// @include        http://renren.com/*
// @include        http://*.renren.com/*
// @include        https://renren.com/*
// @include        https://*.renren.com/*
// @description    为人人网（renren.com，原校内网xiaonei.com）清理广告、新鲜事、各种烦人的通告，删除页面模板，恢复旧的深蓝色主题，增加更多功能。。。
// @version        3.0.0.20100529
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

(function(_window){

// 主要是为了Firefox扩展。需要覆盖window。为了减少修改也把document覆盖了
var window=_window;
var document=_window.document;

// 不在内容可以编辑的frame中运行
if (window.self != window.top && document.designMode=="on") {
	return;
} else if(document.body && !document.body.id && !document.body.className) {
	return;
}

// 基本参数
var XNR={};

// 版本，对应@version和@miniver，用于升级相关功能
XNR.version="3.0.0.20100529";
XNR.miniver=300;

// 存储空间，用于保存全局性变量
XNR.storage={};

// 当前用户ID
XNR.userId=$cookie("id","0");

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
		if(theme.text().contains("url(http://i.static.renren.com")) {
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
		if(s.text().contains(".text-article")) {
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
		"pollRequest":"l-poll",
		"eventRequest":"l-event",
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
	location.href="javascript:(function(){var e=document.body.querySelectorAll('.nav-main .menu-title > a');for(var i in e){e[i]._ad_rd=true;}})();";
};

// 生成诊断信息
function diagnose() {
	var str="";
	str+="运行环境："+navigator.userAgent+"\n";
	str+="当前页面："+window.location.href+"\n";
	str+="程序版本："+XNR.version+"("+XNR.miniver+") - "+XNR.agent+"\n";
	str+="功能："+JSON.stringify(XNR.options)+"\n\n\n";
	$("div.xnr_op #diagnosisInfo").value(str);
};

/* 所有功能完毕 */

function extendPrototype() {
	// 为String对象增加contains方法。"1234".contains("23")->true
	if(!String.prototype.contains) {
		String.prototype.contains=function(str) {
			return this.indexOf(str)!=-1;
		};
	}
	// 为String对象增加repeat方法。"abc".repeat(3)->"abcabcabc"
	if(!String.prototype.repeat) {
		String.prototype.repeat=function(times) {
		/*
		 * 使用数组连接方法与字符串直接连接方法比较：test1.html
		 * Firefox 3.6.3：数组快20%~30%
		 * Firefox 3.7a5：数组快13%
		 * Chromium 6.0.411.0：字符串快450%
		 * Opera 10.54：字符串快100%
		 */
			var a=""
			for(;times>0;times--) {
				a+=this;
			}
			return a;
		};
	}
	// 为Date对象增加格式化文本方法
	if(!Date.prototype.format) {
		Date.prototype.format=function(fmt) {
    		var o={
				"y+": this.getFullYear(),	// 年
	        	"M+": this.getMonth()+1,	// 月
	    	    "d+": this.getDate(),		// 日
		        "H+": this.getHours(),		// 时
    		    "m+": this.getMinutes(),	// 分
        		"s+": this.getSeconds(),	// 秒
	    	};
    		for(var i in o) {
        		if(new RegExp("("+i+")").test(fmt)) {
	            	fmt=fmt.replace(RegExp.$1,"0".repeat(RegExp.$1.length-o[i].toString().length)+o[i]);
		        }
    		}
	    	return fmt;
		};
	}
	// 为Function对象增加获取函数名称方法
	if(!Function.prototype.getName) {
		Function.prototype.getName=function() {
			return /function (.*?)\(/.exec(this.toString())[1];
		};
	}
};

// 主执行函数。
function main(savedOptions) {
	/* 一些初始化工作 */
	extendPrototype();
	/* 初始化完 */

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
	//   [String]page:适用页面。页面名参考$page()，多个名称之间用逗号分隔
	//   [Number]master:主控件序号。功能中的文字描述将会和主控件关联（<label for=masterID/>），当主控件的值为假时，其余控件将被禁用。如果ctrl数组中只有一项，则自动指定为主控件。可选 TODO:连带禁用
	// }
	// 功能中ctrl的格式是：
	// [
	//   {
	//     [String]id:控件ID。type为hidden/warn/info时无需id
	//     [String]type:类型，支持如下类型："check"（<input type="checkbox"/>）,"edit"（<textarea/>）,"button"（<input type="button"/>）,"input"（<input/>）,"label"（<span/>）,"hidden"（不生成实际控件）,"warn"（<input type="image"/>）,"info"（<input type="image"/>）。默认为check
	//     [Any]value:默认值。type为hidden或readonly为真时没有value
	//     [Object]verify:{验证规则:失败信息,...}。验证规则为正则字串。可选
	//     [String]style:样式。可选
	//     [Boolean]readonly:控件只读。可选
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
	//     [String/Boolean]fire:函数执行条件。如果为string，则为控件的某一个事件。否则是控件的期望值。可选。未指定事件为初始化后立即执行。
	//     [Number]stage:执行时机/优先级（0～3）。参考$wait()。
	//     [Object]trigger:设定其他控件的触发事件。{CSS选择器:事件名,...}。可选。如果stage为0，则trigger的执行时机为1，否则与stage相同。
	//     [Array]args:函数参数列表。如果参数为另一控件值/选项组，名称前加@。参数数量不得多于4个。利用选项组处理过多参数
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
	//   [Array]ctrl:各选项描述。
	//   [Number]column:列数
	// }
	// 选项组中ctrl的格式是
	// [
	//   {
	//     [String]id:控件ID。type为hidden时没有id
	//     [String]text:文字+HTML控件描述。例："##选项"。仅能有一个##
	//     [String]type:类型，支持如下类型："check"（<input type="checkbox"/>）,"edit"（<textarea/>）,"button"（<input type="button"/>）,"input"（<input/>）,"label"（<span/>）,"hidden"（不生成实际控件）。默认为check
	//     [Any]value:默认值。type为hidden时没有value
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
				text:"##去除底部工具栏####",
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
						args:["@requestGroup"]
					}],
				}],
				page:"home",
			},{
				id:"requestGroup",
				text:"隐藏以下类型的请求",
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
						id:"pollRequest",
						text:"##投票邀请",
						value:false,
					},{
						id:"eventRequest",
						text:"##活动邀请",
						value:false,
					},{
						id:"otherRequest",
						text:"##其他请求",
						value:false,
					},
				],
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
				text:"##增加导航栏项目##",
				ctrl:[
					{
						id:"addNavItems",
						value:false,
						fn:[{
							name:addNavItems,
							stage:1,
							args:["@navItemsContent"],
							fire:true
						}],
					},{
						id:"navItemsContent",
						type:"edit",
						style:"width:99%;height:80px;overflow:auto;word-wrap:normal;margin-top:5px",
						value:"论坛\nhttp://club.renren.com/"
					}
				],
				master:0
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
						style:"width:99%;height:230px;margin-top:5px;resize:none",
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
				for(var iPage=0;iPage<p.length;iPage++) {
					// 不适用于当前页面
					if($page(p[iPage])==false) {
						noexec=true;
						break;
					}
				}
			}
			// 放在一块中
			var block=$node("div");
			if(!o.id) {
				// 功能
				var text=o.text.split("##");
				for(var iText=0;iText<text.length;iText++) {
					// 文本节点
					if(text[iText]) {
						var masterID="";
						if(o.master==null && o.ctrl.length==1) {
							o.master=0;
						}
						if(o.master!=null) {
							masterID=o.ctrl[o.master].id;
						}
						$node("label").attr("for",masterID).text(text[iText]).appendTo(block);
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
							control.value=null;
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
							node.value(control.value);
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
							} else if(typeof fn.fire=="string") {
								// 直接添加事件监听
								node.hook(fn.fire,function(evt) {
									try {
										fn.name(evt,fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
									} catch(err) {
										$error(fn.name,err);
									}
								});
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
					$node("div").text(o.text).appendTo(block);
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
									item.value=null;
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
							}
							// 输入验证
							if(item.verify) {
								node.attr("verify",JSON.stringify(control.verify));
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
			for(var iArg=0;iArg<4;iArg++) {
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
			fn.name(fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
		} catch(err) {
			$error(fn.name,err);
		}
	}
	

	// 生成选项菜单
	var menuHTML='<style type="text/css">.xnr_op{width:500px;position:fixed;z-index:200000;color:black;blackground:black;font-size:12px}.xnr_op *{padding:0;margin:0;border-collapse:collapse}.xnr_op a{color:#3B5990}.xnr_op table{width:100%;table-layout:fixed}.xnr_op .tl{border-top-left-radius:8px;-moz-border-radius-topleft:8px}.xnr_op .tr{border-top-right-radius:8px;-moz-border-radius-topright:8px}.xnr_op .bl{border-bottom-left-radius:8px;-moz-border-radius-bottomleft:8px}.xnr_op .br{border-bottom-right-radius:8px;-moz-border-radius-bottomright:8px}.xnr_op .border{height:10px;overflow:hidden;width:10px;background-color:black;opacity:0.5}.xnr_op .m{width:100%}.xnr_op .title {padding:4px;display:block;background:#3B5998;color:white;text-align:center;font-size:12px;-moz-user-select:none;-khtml-user-select:none;cursor:default}.xnr_op .btns{background:#F0F5F8;text-align:right}.xnr_op .btns>input{border-style:solid;border-width:1px;padding:2px 15px;margin:3px;font-size:13px}.xnr_op .ok{background:#5C75AA;color:white;border-color:#B8D4E8 #124680 #124680 #B8D4E8}.xnr_op .cancel{background:#F0F0F0;border-color:#FFFFFF #848484 #848484 #FFFFFF}.xnr_op>table table{background:#FFFFF4}.xnr_op .options>table{height:280px;border-spacing:0}.xnr_op .c td{vertical-align:top}.xnr_op .category{width:119px;min-width:119px;border-right:1px solid #5C75AA}.xnr_op li{list-style-type:none}.xnr_op .category li{cursor:pointer;height:30px;overflow:hidden}.xnr_op li:hover{background:#ffffcc;color:black}.xnr_op li:nth-child(2n){background:#EEEEEE}.xnr_op li.selected{background:#748AC4;color:white}.xnr_op .category span{left:10px;position:relative;font-size:14px;line-height:30px}.xnr_op .pages>div{overflow:auto;height:280px;padding:10px}.xnr_op .pages>div>*{margin-bottom:5px;width:100%}.xnr_op table.group{margin-left:5px;margin-top:3px}.xnr_op .pages tr{line-height:20px}.xnr_op input[type="checkbox"]{margin-right:4px}.xnr_op label{color:black;font-weight:normal;cursor:pointer}.xnr_op label[for=""]{cursor:default}.xnr_op input[type="image"]{margin-left:2px;margin-right:2px}.xnr_op .pages .default{text-align:center}.xnr_op .pages .default table{height:95%}.xnr_op .pages .default td{vertical-align:middle}.xnr_op .pages .default td>*{padding:5px}</style>';
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
					c.value(XNR.options[op]);
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
		window.location.reload();
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

	// 优先级为1&2在页面DOM构建完毕后执行，添加菜单入口项也是
	$wait(1,function () {
		entry.prependTo($(".nav-body .nav-other"));

		for(var p=1;p<3;p++) {
			for(var i=0;i<fnQueue[p].length;i++) {
				var fn=fnQueue[p][i];
				if(fn.trigger) {
					// 触发器
					for(var t in fn.trigger) {
						$(t).hook(fn.trigger[t],function(evt) {
							try {
								fn.name(evt,fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
							} catch(err) {
								$error(fn.name,err);
							}
						});
					}
				} else {
					// 一般功能
					try {
						fn.name(fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
					} catch(err) {
						$error(fn.name,err);
					}
				}
			}
		}
	});
	// 优先级为3在页面加载完毕后执行
	$wait(3,function () {
		for(var i=0;i<fnQueue[3].length;i++) {
			var fn=fnQueue[3][i];
			if(fn.trigger) {
				// 触发器
				for(var t in fn.trigger) {
					$(t).hook(fn.trigger[t],function(evt) {	
						try {
							fn.name(evt,fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
						} catch(err) {
							$error(fn.name,err);
						}
					});
				}
			} else {
				// 一般功能
				try {
					fn.name(fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
				} catch(err) {
					$error(fn.name,err);
				}
			}
		}
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
		profile:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren.com/\\?id=", // 个人主页
		blog:"/blog\\.renren\\.com/",	// 日志
	};
	if(!url) {
		url=window.location.href;
	}
	// 把锚点去掉
	if(url.contains("#")) {
		url=url.replace(/#[\s\S]*$/,"");
	}
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
 *   [Function]func：执行的函数
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
			document.addEventListener("DOMContentLoaded",func,false);
		} else if(stage==3) {
			document.addEventListener("load",func,false);
		}
	} else {
		// 已经错过了/正赶上，立即执行
		func();
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
			httpReq.onload=function() {
				func((httpReq.status==200?httpReq.responseText:null),url,userData);
			};
			httpReq.onerror=function() {
				func(null,url,userData);
			};
		    httpReq.open("GET",url,true);
			httpReq.send();
			break;
		case USERSCRIPT:
			GM_xmlhttpRequest({method:"GET",url:url,onload:function(o) {
				func((o.status==200?o.responseText:null),url,userData);
			},onerror:function(o) {
				func(null,url,userData);
			}});
			break;
		case CHROME:
			chrome.extension.sendRequest({action:"get",url:url},function(response) {
				func(response.data,url,userData);
			});
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
		func=func.getName();
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
	// 获取对象第一个DOM节点的上级节点(经PageKit对象包装)
	superior:function() {
		try {
			return PageKit(this.get().parentNode);
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
				elem.textContent=txt;
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
	// 执行自身事件
	invoke:function(evt) {
		this.each(function(elem) {
			try {
				var e=elem.getAttribute(evt);
				if(!e) {
					return;
				}
				if(e.toLowerCase().indexOf("javascript:")!=0) {
					e="javascript:"+e;
				}
				window.location.href=e;
			} catch(err) {
				$error("invoke",err);
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
