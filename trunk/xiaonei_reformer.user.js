// ==UserScript==
// @name           校内人人网改造器 Xiaonei Reformer
// @namespace      Xiaonei_reformer
// @include        http://renren.com/*
// @include        http://*.renren.com/*
// @include        https://renren.com/*
// @include        https://*.renren.com/*
// @description    为人人网（renren.com，原校内网xiaonei.com）清理广告、新鲜事、各种烦人的通告，删除页面模板，恢复旧的深蓝色主题，增加更多功能。。。
// @version        2.3.6.20100504
// @miniver        263
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

// 运行环境 1:firefox 2:chrome/chromium extension -1:unknown
const UNKNOWN=-1,FIREFOX=1,CHROME=2;
// 运行环境
var agent=UNKNOWN;
if(!window.chrome && GM_getValue) {
	agent=FIREFOX;
} else if(window.chrome && chrome.extension) {
	agent=CHROME;
};

function XNR(o) {
	if(!(this instanceof XNR)) {
		return o?new XNR(arguments):null;
	};
	// 包含的DOM节点
	this.domNodes=new Array();
	for(var i=0;i<o.length;i++) {
		var selector=o[i];
		if(typeof selector=="string") {
			// CSS选择语句
			this.domNodes=this.domNodes.concat(Array.prototype.slice.call(document.querySelectorAll(selector)));
		} else if(selector.nodeType) {
			// DOM节点
			this.domNodes=this.domNodes.concat(Array(selector));
		} else if(selector instanceof XNR) {
			// XNR对象
			this.domNodes=this.domNodes.concat(o.domNodes);
		} else {
			// 其他的东西，有可能是NodeList，全部包在Array里
			this.domNodes=this.domNodes.concat(Array.prototype.slice.call(selector));
		}
	}
	return this;
};
XNR.prototype={
	// 脚本版本，主要供更新用，对应header中的@version和@miniver
	version:"2.3.6.20100504",
	miniver:263,

	// 选项列表
	options:{
		cleanup:{
			category:"清理页面",
			detail:{
				removeAds:{
					text:"清除各类广告",
					value:true,
					fn0:removeAds,
				},
				removeStarReminder:{
					text:"去除升级星级用户提示",
					value:true,
					fn1:removeStarReminder,
				},
				removeMusicPlayer:{
					text:"去除VIP页面和日志中的音乐播放器",
					value:false,
					fn1:removeMusicPlayer,
				},
				removePageTheme:{
					text:"去除页面主题模板",
					value:false,
					fn0:removePageTheme,
				},
				removeFloatBox:{
					text:"去除页面飘浮物",
					value:false,
					fn1:removeFloatBox,
				},
				removeBlogTheme:{
					text:"去除日志信纸",
					value:false,
					fn0:removeBlogTheme,
					page:"blog\\.renren\\.com",
				},
				removeBlogLinks:{
					text:"去除日志中整段链接",
					value:false,
					fn1:removeBlogLinks,
					page:"blog\\.renren\\.com",
				},
				removeXntBar:{
					text:"去除页面底部校内通栏",
					value:false,
					fn1:removeXntBar,
				},
				removePageTopNotice:{
					text:"去除首页顶部通知",
					value:false,
					fn1:removePageTopNotice,
					page:"/[Hh]ome.do",
				},
				removeNewStar:{
					text:"去除首页发布框下的活动标签",
					value:false,
					fn1:removeActivityLabel,
					page:"/[Hh]ome.do",
				},
				removeNewStar:{
					text:"去除人气之星/新人栏",
					value:false,
					fn1:removeNewStar,
					page:"/[Hh]ome.do",
				},
				removeFriendGuide:{
					text:"去除寻找/邀请朋友栏",
					value:false,
					fn1:removeFriendGuide,
					page:"/[Hh]ome\\.do|/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeRenRenPoint:{
					text:"去除等级栏",
					value:false,
					fn1:removeRenRenPoint,
					page:"/[Hh]ome\\.do|/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeActivityNotice:{
					text:"去除活动通知栏",
					value:false,
					fn1:removeActivityNotice,
					page:"/[Hh]ome\\.do",
				},
				removeVipExpireNotice:{
					text:"去除VIP过期提醒",
					value:false,
					fn1:removeVipExpireNotice,
					page:"/[Hh]ome\\.do",
				},
				removeRenRenSurvey:{
					text:"去除首页右侧人人网调查栏",
					value:false,
					fn1:removeRenRenSurvey,
					page:"/[Hh]ome\\.do",
				},
				removeCommonPage:{
					text:"去除首页右侧公共主页推荐栏",
					value:false,
					fn1:removeCommonPage,
					page:"/[Hh]ome\\.do",
				},
				removeCommendation:{
					text:"去除首页右侧人人网推荐/礼物栏",
					value:false,
					fn1:removeCommendation,
					page:"/[Hh]ome\\.do",
				},
				removeMayKnow:{
					text:"去除首页右侧好友推荐栏",
					value:false,
					fn1:removeMayKnow,
					page:"/[Hh]ome\\.do",
				},
				removeSponsorsWidget:{
					text:"去除首页右侧赞助商内容栏",
					value:true,
					fn1:removeSponsorsWidget,
					page:"/[Hh]ome\\.do",
				},
				removeWebFunction:{
					text:"去除首页右侧站内功能栏",
					value:false,
					fn1:removeWebFunction,
					page:"/[Hh]ome\\.do",
				},
				removePaintReminder:{
					text:"去除个人主页右上角装扮主页提示",
					value:true,
					fn1:removePaintReminder,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeLeftAlbum:{
					text:"去除个人主页左侧相册栏",
					value:false,
					fn1:removeLeftAlbum,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeLeftBlog:{
					text:"去除个人主页左侧日志栏",
					value:false,
					fn1:removeLeftBlog,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeLeftShare:{
					text:"去除个人主页左侧分享栏",
					value:false,
					fn1:removeLeftShare,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeLeftGift:{
					text:"去除个人主页左侧礼物栏",
					value:false,
					fn1:removeLeftGift,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeRightSpecialFriends:{
					text:"去除个人主页右侧特别好友栏",
					value:false,
					fn1:removeRightSpecialFriends,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeRightFootprint:{
					text:"去除个人主页右侧最近来访栏",
					value:false,
					fn1:removeRightFootprint,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeRightFriends:{
					text:"去除个人主页右侧好友栏",
					value:false,
					fn1:removeRightFriends,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeRightMutualFriends:{
					text:"去除个人主页右侧共同好友栏",
					value:false,
					fn1:removeRightMutualFriends,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
			},
		},
		hideRequest:{
			category:"清理请求",
			detail:{
				GROUP1:{
					text:"屏蔽以下类型的请求",
					columns:2,
					fn1:hideRequest,
					page:"/[Hh]ome\\.do",
					list:{
						removeAppRequest:{
							text:"应用请求",
							value:false,
							argus1:[["l-app"]],
						},
						removeEventRequest:{
							text:"活动邀请",
							value:false,
							argus1:[["l-event"]],
						},
						removeNoticeRequest:{
							text:"通知",
							value:false,
							argus1:[["l-request"]],
						},
						removePollRequest:{
							text:"投票邀请",
							value:false,
							argus1:[["l-poll"]],
						},
						removeGameRequest:{
							text:"游戏邀请",
							value:false,
							argus1:[["l-game"],["l-restaurants"],["l-paopaoyu"]],
						},
						removePokeRequest:{
							text:"招呼",
							value:false,
							argus1:[["l-poke"]],
						},
						removeFriendRequest:{
							text:"好友申请",
							value:false,
							argus1:[["l-friend"]],
						},
						removeRecommendRequest:{
							text:"好友推荐",
							value:false,
							argus1:[["l-recommend"]],
						},
						removeTagRequest:{
							text:"圈人",
							value:false,
							argus1:[["l-tag"]],
						},
					},
				},
			}
		},
		sweepFeeds:{
			category:"处理新鲜事",
			detail:{
				GROUP1:{
					text:"屏蔽以下类型的新鲜事",
					columns:4,
					fn1:removeFeeds,
					page:"/[Hh]ome\\.do|/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
					list:{
						removeBlogFeed:{
							text:"日志",
							value:false,
							argus1:[["@markFeedAsRead","blog"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","blog"]]}],
						},
						removePollFeed:{
							text:"投票",
							value:false,
							argus1:[["@markFeedAsRead","poll"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","poll"]]}],
						},
						removeAppFeed:{
							text:"应用",
							value:false,
							argus1:[["@markFeedAsRead","app"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","app"]]}],
						},
						removeStatusFeed:{
							text:"状态",
							value:false,
							argus1:[["@markFeedAsRead","status"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","status"]]}],
						},
						removeGiftFeed:{
							text:"礼物",
							value:false,
							argus1:[["@markFeedAsRead","gift"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","gift"]]}],
						},
						removeImageFeed:{
							text:"照片",
							value:false,
							argus1:[["@markFeedAsRead","photo"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","photo"]]}],
						},
						removeImageTagFeed:{
							text:"圈人",
							value:false,
							argus1:[["@markFeedAsRead","tag"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","tag"]]}],
						},
						removeProfileFeed:{
							text:"头像",
							value:false,
							argus1:[["@markFeedAsRead","profile"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","profile"]]}],
						},
						removeShareFeed:{
							text:"分享",
							value:false,
							argus1:[["@markFeedAsRead","share"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","share"]]}],
						},
						removeFilmFeed:{
							text:"电影",
							value:false,
							argus1:[["@markFeedAsRead","movie"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","movie"]]}],
						},
						removeMusicFeed:{
							text:"音乐",
							value:false,
							argus1:[["@markFeedAsRead","music"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","music"]]}],
						},
						removeConnectFeed:{
							text:"连接",
							value:false,
							argus1:[["@markFeedAsRead","connect"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","connect"]]}],
						},
						removeVipFeed:{
							text:"VIP相关",
							value:false,
							argus1:[["@markFeedAsRead","vip"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","vip"]]}],
						},
						removeGroupFeed:{
							text:"品牌专区",
							value:false,
							argus1:[["@markFeedAsRead","group"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","group"]]}],
						},
						removePublicPageFeed:{
							text:"公共主页",
							value:false,
							argus1:[["@markFeedAsRead","page"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","page"]]}],
						},
						removeContactFeed:{
							text:"保持联络",
							value:false,
							argus1:[["@markFeedAsRead","contact"]],
							trigger:[{target:"ul#feedHome",evt:"DOMNodeInserted",fn:removeFeeds,argus:[["@markFeedAsRead","contact"]]}],

						},
					},
				},
				markFeedAsRead:{
					text:"将屏蔽的新鲜事设为已读",
					value:false,
				},
				loadMoreFeeds:{
					text:"默认显示@@页新鲜事",
					type:"checktext",
					value:false,
					ctrl:{option:"loadFeedPage",value:2,verify:"^[2-9]$",failInfo:"新鲜事页数只能为2~9",style:"width:15px;"},
					fn3:loadMoreFeeds,
					argus3:[["@loadFeedPage"]],
					page:"/[Hh]ome\\.do",
				},
				hideFeedContent:{
					text:"隐藏新鲜事具体内容",
					value:false,
					fn2:hideFeedContent,
					page:"/[Hh]ome\\.do|/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeStatusFeedLink:{
					text:"去除状态新鲜事的链接",
					value:false,
					fn2:removeStatusFeedLink,
					page:"/[Hh]ome\\.do|/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				flodStatusComment:{
					text:"默认收起新鲜事回复",
					value:false,
					fn3:flodFeedComment,
					page:"/[Hh]ome\\.do|/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=|/page\\.renren\\.com",
				},
				autoRefreshFeeds:{
					text:"自动提醒新鲜事更新，每隔@@秒",
					type:"checktext",
					value:true,
					ctrl:{option:"checkFeedInterval",value:60,verify:"^[3-9][0-9]$|^[1-9][0-9]{2,}$",failInfo:"为防止占用太多资源，新鲜事检查间隔时间至少为30秒。",style:"width:30px;"},
					fn3:autoRefreshFeeds,
					argus3:[["@checkFeedInterval",{"blog":"@removeBlogFeed","poll":"@removePollFeed","app":"@removeAppFeed","status":"@removeStatusFeed","gift":"@removeGiftFeed","photo":"@removeImageFeed","tag":"@removeImageTagFeed","profile":"@removeProfileFeed","share":"@removeShareFeed","movie":"@removeFilmFeed","music":"@removeMusicFeed","connect":"@removeConnectFeed","vip":"@removeVipFeed","group":"@removeGroupFeed","page":"@removePublicPageFeed","contact":"@removeContactFeed"}]],
				},
				autoReloadFeeds:{
					text:"自动更新首页新鲜事列表，每隔@@秒",
					warn:"更新时会导致正在回复的内容遗失，请慎重启用",
					type:"checktext",
					value:false,
					ctrl:{option:"reloadFeedInterval",value:60,verify:"^[6-9][0-9]$|^[1-9][0-9]{2,}$",failInfo:"为防止占用太多资源，更新新鲜事列表间隔时间至少为60秒。",style:"width:30px;"},
					fn3:autoReloadFeeds,
					argus3:[["@reloadFeedInterval"]],
					page:"/[Hh]ome\\.do",
				},
			},
		},
		sweepNavBar:{
			category:"改造导航栏",
			detail:{
				GROUP1:{
					text:"去除以下链接",
					columns:3,
					fn1:removeNavBarItem,
					list:{
						removeNavPaint:{
							text:"装扮",
							value:false,
							argus1:[["i.renren.com/shop"]],
						},
						removeNavApp:{
							text:"应用",
							value:false,
							argus1:[["app.renren.com"]],
						},
						removeNavGame:{
							text:"游戏",
							value:false,
							argus1:[["game.renren.com"]],
						},
						removeNavVIP:{
							text:"升级VIP",
							value:false,
							argus1:[["i.renren.com/pay"]],
						},
						removeNavVIPCenter:{
							text:"VIP中心",
							value:false,
							argus1:[["i.renren.com/index"]],
						},
						removeNavPay:{
							text:"充值",
							value:false,
							argus1:[["pay.renren.com"]],
						},
						removeNavInvite:{
							text:"邀请",
							value:false,
							argus1:[["invite.renren.com"]],
						},
					},
				},
				widenNavBar:{
					text:"加宽导航栏",
					value:false,
					fn2:widenNavBar,
				},
				addNavBarItem:{
					text:"增加导航栏项目",
					type:"checkedit",
					value:false,
					info:"导航栏上新增项的内容。每两行表示一项，第一行为名称，第二行为地址。",
					ctrl:{option:"navExtraContent",value:"论坛\nhttp://club.renren.com/",style:"width:280px;height:80px;overflow:auto;word-wrap:normal"},
					fn2:addNavBarItem,
					argus2:[["@navExtraContent"]],
				},
			},
		},
		reform:{
			category:"改造界面",
			detail:{
				recoverOriginalTheme:{
					text:"使用早期的深蓝色主题（不影响有模板的页面）",
					value:false,
					fn0:recoverOriginalTheme,
				},
				recoverBigDeleteBtn:{
					text:"使用大号新鲜事删除按钮",
					value:false,
					fn2:$patchCSS,
					argus2:[["ul.richlist.feeds li a.delete{background:url(\"http://xnimg.cn/imgpro/home/home_icon.png\") no-repeat scroll -115px 0 transparent;height:18px;width:18px}ul.richlist.feeds li a.delete:hover{background:url(\"http://xnimg.cn/imgpro/home/home_icon.png\") no-repeat scroll -133px 0 transparent;height:18px;width:18px}"]],
					page:"/[Hh]ome\\.do|/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				removeFontRestriction:{
					text:"去除页面的字体限制",
					value:false,
					info:"使页面字体采用浏览器的设定",
					fn1:removeFontRestriction,
				},
				limitHeadAmount:{
					text:"限制头像列表中头像数量最多@@个",
					type:"checktext",
					value:false,
					ctrl:{option:"headAmount",value:12,verify:"^[0-9]{1,2}$",failInfo:"请在头像最大数量处输入1～2位整数",style:"width:30px;"},
					fn1:limitHeadAmount,
					argus1:[["@headAmount"]],
				},
				disableOrangeName:{
					text:"不显示他人的橙名",
					info:"要禁止自己的橙名显示，请到隐私设置页面",
					value:false,
					fn2:disableOrangeName,
					argus2:[["@recoverOriginalTheme"]],
				},
				moveMessageBoardToBottom:{
					text:"将个人主页留言版移动至新鲜事下方",
					value:false,
					fn1:moveMessageBoardToBottom,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				GROUP1:{
					text:"修正界面错误",
					columns:1,
					fn2:$patchCSS,
					list:{
						fixClubContent:{
							text:"修正论坛帖子排版错误",
							value:false,
							info:"如果您将浏览器字体的最小大小设成大于12，可能会出现论坛的帖子正文偏右的错误。如果您遇到这个问题，请启用此功能。",
							argus2:[["#articlehome #comments .content,#articlehome #comments .signature{float:left;clear:both}"]],
							page:"club\\.renren\\.com",
						},
						fixNavItem:{
							text:"修正导航栏项目高度",
							value:false,
							info:"如果您将浏览器字体的最小大小设成大于12，可能会出现导航栏上的项目高度过大的错误。如果您遇到这个问题，请启用此功能。",
							argus2:[[".navigation .menu-title a{max-height:35px}"]],
						},
					}
				}
			},
		},
		enhancement:{
			category:"辅助功能",
			detail:{
				addExtraEmotions:{
					text:"增加额外的表情项",
					value:true,
					fn2:addExtraEmotions,
					page:"/www\\.renren\\.com|/renren\\.com|/status\\.renren\\.com",
				},
				addFloorCounter:{
					text:"为评论增加楼层计数",
					value:true,
					fn2:addFloorCounter,
					page:"blog\\.renren\\.com|photo\\.renren\\.com",
				},
				addBlogLinkProtocolsSupport:{
					text:"允许在日志中添加HTTPS/FTP协议的链接",
					value:true,
					fn2:addBlogLinkProtocolsSupport,
					page:"blog\\.renren\\.com/NewEntry\\.do|blog\\.renren\\.com/.*/editBlog",
				},
				showImagesInOnePage:{
					text:"相册所有图片在一页中显示",
					value:false,
					fn3:showImagesInOnePage,
					page:"photo\\.renren\\.com/getalbum|photo\\.renren\\.com/.*/album-[0-9]+|page\\.renren\\.com/.*/album|photo\\.renren\\.com/photo/ap/",
				},
				hideImageTagOnMouseOver:{
					text:"当鼠标在照片上时隐藏圈人框",
					value:false,
					info:"仍然可以在照片右侧的被圈人列表中看到圈人情况",
					fn3:hideImageTagOnMouseOver,
					page:"photo\\.renren\\.com",
				},
				showImageOnMouseOver:{
					text:"在鼠标经过图片时显示大图",
					value:true,
					info:"要在鼠标移动时保持大图显示，按住Shift/Alt/Ctrl键不放",
					fn3:showImageOnMouseOver,
				},
				useWhisper:{
					text:"默认使用悄悄话",
					value:false,
					fn3:useWhisper,
				},
				removeFriendRestriction:{
					text:"去除特别好友修改限制",
					info:"允许非星级用户修改特别好友",
					value:true,
					fn2:removeFriendRestriction,
					page:"friend\\.renren\\.com",
				},
				removeNicknameRestriction:{
					text:"去除昵称修改限制",
					info:"允许非星级用户修改个人信息中的昵称",
					value:true,
					fn3:removeNicknameRestriction,
					page:"/[Pp]rofile\\.do|renren\\.com/$|/renren\\.com/\\?|/www\\.renren\\.com/\\?|/[a-zA-Z0-9_]{5,}\\.renren\\.com/\\?id=",
				},
				showLoginInfo:{
					text:"登录时提示登录信息",
					value:false,
					fn3:showLoginInfo,
					argus3:[["@lastSid"]],
				},
				lastSid:{
					text:"最近一次登录时的SessionID",
					type:"hidden",
					value:"",
				},
				enableStealthMenu:{
					text:"启用快速通道功能",
					info:"鼠标经过人名链接时，显示对方相册/日志/留言板等的链接，不会在对方的最近来访中留下记录",
					value:false,
					fn3:enableStealthMenu,
				},
				enableYoukuFullscreen:{
					text:"允许全屏观看优酷视频分享",
					value:true,
					fn1:enableYoukuFullscreen,
					page:"/share\\.renren\\.com/|blog\\.renren\\.com/",
				},
				addDownloadAlbumLink:{
					text:"在相册中添加“下载当前页图片”链接",
					info:"如果想下载整个相册的内容，请配合“相册所有图片在一页中显示”功能使用",
					value:true,
					fn3:addDownloadAlbumLink,
					argus3:[["@showImageLinkOnly"]],
					page:"photo\\.renren\\.com/getalbum|photo\\.renren\\.com/.*/album-[0-9]+|page\\.renren\\.com/.*/album|photo\\.renren\\.com/photo/ap/",
				},
				showImageLinkOnly:{
					text:"仅生成图片链接",
					type:"subcheck",
					value:false,
				},
			}
		},
		update:{
			category:"自动更新",
			detail:{
				checkUpdate:{
					text:"自动检查脚本更新（24小时内最多检查一次）",
					value:true,
					fn3:checkUpdate,
					argus3:[[false,"@checkLink","@pageLink","@scriptLink","@lastUpdate"]],
					agent:FIREFOX,
				},
				lastUpdate:{
					text:"最后一次检查更新时间：@@",
					type:"label",
					value:"未知",
					agent:FIREFOX,
				},
				manualCheck:{
					text:"立刻检查",
					type:"button",
					value:true,
					trigger:[{target:".xnr_op input#manualCheck",evt:"click",fn:checkUpdate,argus:[[true,"@checkLink","@pageLink","@scriptLink","@lastUpdate"]]}],
					agent:FIREFOX,
				},
				checkLink:{
					text:"检查更新地址：@@",
					type:"text",
					value:"http://userscripts.org/scripts/source/45836.meta.js",
					style:"width:270px;",
					verify:"[A-Za-z]+://[^/]+\.[^/]+/.*",
					failInfo:"请输入正确的检查更新地址",
					agent:FIREFOX,
				},
				pageLink:{
					text:"脚本主页地址：@@",
					type:"text",
					value:"http://userscripts.org/scripts/show/45836",
					style:"width:270px;",
					verify:"[A-Za-z]+://[^/]+\.[^/]+/.*",
					failInfo:"请输入正确的脚本主页地址",
					agent:FIREFOX,
				},
				scriptLink:{
					text:"脚本下载地址：@@",
					type:"text",
					value:"http://userscripts.org/scripts/source/45836.user.js",
					style:"width:270px;",
					verify:"[A-Za-z]+://[^/]+\.[^/]+/.*",
					failInfo:"请输入正确的脚本下载地址",
					agent:FIREFOX,
				},
				updatedNotify:{
					text:"自动升级后提示",
					value:true,
					fn3:updatedNotify,
					argus3:[["@lastVersion"]],
					agent:CHROME,
				},
				lastVersion:{
					type:"hidden",
					value:0,
					agent:CHROME,
				},
			}
		},
	},
	// 遍历对象的DOM节点，参数为一回调函数，function(index,elem){}，返回false中止遍历;
	each:function(func) {
		if(typeof func == "function") {
			for(var i in this.domNodes) {
				if(func(i,this.domNodes[i])===false) {
					break;
				}
			}
		}
		return this;
	},
	// 删除对象所有的DOM节点
	remove:function() {
		this.each(function(index,elem) {
			try {
				elem.parentNode.removeChild(elem);
			} catch(err) {
			}
		});
		return null;
	},
	// 删除对象所有DOM节点，如果删除后父节点无其他子节点，一并删除
	purge:function() {
		this.each(function(index,elem) {
			try {
				var p=elem.parentNode;
				p.removeChild(elem);
				while (p.childElementCount==0) {
					var q=p.parentNode;
					q.removeChild(p);
					p=q;
				}
			} catch(err) {
			}
		});
		return null;
	},
	// 隐藏对象所有的DOM节点
	hide:function() {
		this.each(function(index,elem) {
			try {
				elem.style.display="none";
			} catch(err) {
			}
		});
		return this;
	},
	// 显示对象所有的DOM节点
	show:function() {
		this.each(function(index,elem) {
			try {
				elem.style.display=null;
				elem.style.visibility=null;
			} catch(err) {
			}
		});
		return this;
	},
	// 转换对象所有节点为另一类型节点
	switchTo:function(o) {
		if(typeof o == "string") {
			o=document.createElement(o);
		} else if(o instanceof XNR) {
			o=o.get();
		}
		if(o.nodeType) {
			var xnr=this;
			this.each(function(index,elem) {
				var newNode=o.cloneNode(false);
				while(elem.childNodes.length>0) {
					newNode.appendChild(elem.childNodes[0]);
				}
				elem.parentNode.replaceChild(newNode,elem);
				xnr.domNodes[index]=newNode;
			});
		}
		return this;

	},
	// 获取对象中的DOM节点数量
	size:function() {
		return this.domNodes.length;
	},
	// 获取对象中的DOM节点，默认获取第一个
	get:function(index) {
		try {
			index=index || 0;
			return this.domNodes[index];
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的第一个子节点(经XNR对象包装)
	first:function() {
		try {
			return XNR(this.get().firstElementChild);
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的最后一个子节点(经XNR对象包装)
	last:function() {
		try {
			return XNR(this.get().lastElementChild);
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的某个子节点(经XNR对象包装)
	child:function(index) {
		try {
			index=index || 0;
			return XNR(this.get().children[index]);
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的子节点数
	heirs:function() {
		try {
			return this.get().childElementCount;
		} catch(err) {
			return 0;
		}
	},
	// 获取对象第一个DOM节点的父节点(经XNR对象包装)
	parent:function() {
		try {
			return XNR(this.get().parentNode);
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的上一个相邻节点(经XNR对象包装)
	previous:function() {
		try {
			return XNR(this.get().previousElementSibling);
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的下一个相邻节点(经XNR对象包装)
	next:function() {
		try {
			return XNR(this.get().nextElementSibling);
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
			if(o instanceof XNR) {
				o.each(function(index,elem) {
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
			if(o instanceof XNR) {
				o.each(function(index,elem) {
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
				if(o instanceof XNR) {
					var insertPlace=node.firstElementChild;
					o.each(function(index,elem) {
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
		if(o instanceof XNR) {
			o.append(this);
		} else if(o.nodeType==1) {
			XNR(o).append(this);
		}
		return this;
	},
	// 作为子节点插入到对象
	insertTo:function(o,pos) {
		if(o instanceof XNR) {
			o.insert(this,pos);
		} else if(o.nodeType==1) {
			XNR(o).insert(this,pos);
		}
		return this;
	},
	// 作为第一子节点添加到对象
	prependTo:function(o) {
		if(o instanceof XNR) {
			o.prepend(this);
		} else if(o.nodeType==1) {
			XNR(o).prepend(this);
		}
		return this;
	},
	// 查找符合条件的子节点
	find:function(str) {
		var res=new Array();
		this.each(function(index,elem) {
			res=res.concat(Array.prototype.slice.call(elem.querySelectorAll(str)))
		});
		return XNR(res);
	},
	// 过滤出有符合条件子节点的节点
	// o可以为字符串，作为CSS选择器。也可为函数，function(elem)，返回false或等价物时滤除
	filter:function(o) {
		var res=new Array();
		if(typeof o=="string") {
			this.each(function(index,elem) {
				if(elem.querySelector(o)) {
					res.push(elem);
				}
			});
		} else if(typeof o=="function") {
			this.each(function(index,elem) {
				if(o(elem)) {
					res.push(elem);
				}
			});
		}
		this.domNodes=res;
		return this;
	},
	// 设置/读取属性，设置方法：o为{name1:value1,name2:value2}形式或o为name,v为value，读取方法：o为name,v留空
	attr:function(o,v) {
		switch(typeof o) {
			case "object":
				for(var n in o) {
					this.each(function(index,elem) {
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
					this.each(function(index,elem) {
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
					this.each(function(index,elem) {
						elem[n]=o[n];
					});
				};
				return this;
			case "string":
				if(v!=null) {
					this.each(function(index,elem) {
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
					this.each(function(index,elem) {
						try {
							elem.style[n]=o[n];
						} catch (err) {
						}
					});
				};
				return this;
			case "string":
				if(v!=null) {
					this.each(function(index,elem) {
						try {
							elem.style[o]=v;
						} catch (err) {
						}
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
		this.each(function(index,elem) {
			var xnr=$(elem);
			var c=xnr.attr("class");
			if(!c.match(new RegExp("\\b"+str+"\\b"))) {
				xnr.attr("class",c+" "+str);
			}
		});
	},
	// 去除一个类
	removeClass:function(str) {
		this.each(function(index,elem) {
			var xnr=$(elem);
			var c=xnr.attr("class");
			if(c.match(new RegExp("\\b"+str+"\\b"))) {
				xnr.attr("class",c.replace(new RegExp("\\b"+str+"\\b"),"").replace(/^ +| +$/g,""));
			}
		});
	},
	// 获取/设置文本内容
	text:function(txt) {
		if(txt) {
			this.each(function(index,elem) {
				try {
					elem.textContent=txt;
				} catch(err) {
					try {
						elem.innerText=txt;
					} catch(err) {
					}
				}
			});
			return this;
		} else {
			var res;
			try {
				res=this.get().textContent;
			} catch(err) {
				try {
					res=this.get().innerText;
				} catch(err) {
				}
			}
			return res || "";
		}
	},
	// 获取/设置内部HTML代码
	inner:function(html) {
		if(html) {
			this.each(function(index,elem) {
				try {
					elem.innerHTML=html;
				} catch(err) {
				}
			});
			return this;
		} else {
			try {
				return this.get().innerHTML;
			} catch(err) {
				return "";
			}
		}
	},
	// 添加监听事件
	listen:function(evt,func) {
		this.each(function(index,elem) {
			elem.addEventListener(evt,func,false);
		});
		return this;
	},
	// 执行自身事件
	invoke:function(evt) {
		this.each(function(index,elem) {
			try {
				var e=elem.getAttribute(evt);
				if(!e) {
					return;
				}
				if(e.toLowerCase().indexOf("javascript:")!=0) {
					e="javascript:"+e;
				}
				location.href=e;
			} catch(err) {
				$error("invoke",err);
			}
		});
		return this;
	},
	// 复制所有DOM节点到新对象
	clone:function(evt) {
		var domNodes=[];
		this.each(function(index,elem) {
			domNodes.push(elem.cloneNode(true));
		});
		return XNR(domNodes);
	}
};
/*
 * 输出错误信息
 * func:发生异常的函数名
 * err:异常对象
 */
function $error(func,err) {
	if(func && err && console && console.log) {
		console.log("在 "+func+"() 中发生了一个错误。\n错误名称："+err.name+"\n错误信息："+err.message);
	}
};
/*
 * 保存选项，当页面刷新时内存中的数据才会更新，切记
 */
function $save(name,value) {
	if(agent==FIREFOX) {
		GM_setValue(name,value);
	} else if(agent==CHROME) {
		chrome.extension.sendRequest({action:"set",name:name,data:value});
	}
};
/*
 * 取代JSON.parse。JSON.parse在chromium中有问题，不能很好处理undefined
 */
function $parse(str) {
	if(str==null || JSON.stringify(str)=="\"undefined\"") {
		return {};
	} else if(str=="") {
		return "";
	} else {
		return JSON.parse(str) || {};
	}
};
/*
 * 创建一个DOM节点，以XNR对象包装
 */
function $node(name,content) {
	try {
		if(!name) {
			return XNR(document.createTextNode(content));
		} else if(typeof name == "object") {
			if(name instanceof XNR) {
				name=name.get().tagName;
			} else if(name.tagName) {
				name=name.tagName;
			} else {
				return null;
			}
		} else if(typeof name != "string") {
			return null;
		}
		var node=document.createElement(name);
		if(content) {
			if(typeof content=="string") {
				try {
					node.innerHTML=content;
				} catch(err) {
					var textNode=document.createTextNode(content);
					node.appendChild(textNode);
				}
			} else if(content instanceof XNR) {
				content.each(function(index,elem) {
					node.appendChild(elem);
				});
			} else if(content.nodeType) {
				node.appendChild(content);
			}
		}
		return XNR(node);
	} catch(err) {
		$error("$node",err);
	}
};
// 修改CSS
function $patchCSS(css) {
	$node("style",css).attr("type","text/css").appendTo($("head"));
};
// 读取/写入cookie
function $cookie(name,value) {
	try {
		if(value==null) {
			// 读取
			var cookies=document.cookie.split(';');
			name=escape(name);
			for(var i=0;i<cookies.length;i++) {
				var c=cookies[i].replace(/^ +/g,"");
				if(c.indexOf(name+"=")==0) {
					return unescape(c.substring(name.length+1,c.length));
				}
			}
		} else {
			// 写入
			document.cookie=escape(name)+"="+escape(value)+";domain=.renren.com";
		}
	} catch (err) {
		$error("$cookie",err);
	}
	return "";
};
// 发送HTTP GET请求
function $get(url,func,userData) {
	try {
		if(agent==FIREFOX) {
			GM_xmlhttpRequest({method:"GET",url:url,onload:function(o){if(o.status==200){func(url,o.responseText,userData);}}});
		} else if(agent==CHROME) {
			chrome.extension.sendRequest({action:"httpGet",url:url},function(response) {
				func(url,response.data,userData);
			});
		}
	} catch(err) {
		$error("$get",err);
	}
};
// 弹出窗口
function $popup(id,title,content,geometry,stayTime,popSpeed) {
	if(!$._popup) {
		$._popup={};
	}
	if($._popup[id]) {
		$._popup[id].remove();
	}
	const timeout=50;
	var node=$node("div").style({position:"fixed",backgroundColor:"#F0F5F8",border:"1px solid #B8D4E8",zIndex:100000,overflow:"hidden"});
	// geometry 按照标准的X表示法，宽x高+x+y，高是自动计算，忽略输入值。默认200x0+5-5
	var geo=/^(\d+)x\d+([+-]?)(\d*)([+-]?)(\d*)$/.exec(geometry);
	if(!geo) {
		geo=["","200","+","5","-","5"];
	}
	node.style("width",(geo[1]=="0"?"auto":geo[1]+"px")).style((geo[2] || "+")=="+"?"left":"right",(geo[3] || "0")+"px").style((geo[4] || "-")=="+"?"top":"bottom",(geo[5] || "0")+"px");

	$node("div",(title || "提示")+'<a style="float:right;font-size:x-small;color:white;cursor:pointer" class="x">关闭</a>').style({background:"#526EA6",color:"white",fontWeight:"bold",fontSize:"normal",padding:"3px"}).appendTo(node);
	$node("div",content).style("margin","5px").appendTo(node);
	node.appendTo(document.body);
	var maxHeight=parseInt(node.prop("clientHeight"));
	node.style("height","0px");
	// 展开
	setTimeout(function unflod(){
		try {
			var h=parseInt(node.style("height"));
			if(h<maxHeight) {
				var diff=maxHeight-h;
				node.style("height",(h+(diff>popSpeed?popSpeed:diff))+"px");
				setTimeout(unflod,timeout);
			} else {
				if(stayTime>0) {
					setTimeout(flod,stayTime*1000);
					node.find("a.x").text("关闭("+stayTime+")");
					var timer=setInterval(function() {
						if(!node || stayTime<=0) {
							clearInterval(timer);
						} else {
							stayTime--;
							node.find("a.x").text("关闭("+stayTime+")");
						}
					},1000);
				}
			}
		} catch(err) {
		}
	},timeout);
	node.find("a.x").listen("click",function(){
		node.remove();
		node=$._popup[id]=null;
	});
	$._popup[id]=node;
	return node;
	// 收起
	function flod() {
		try {
			var h=parseInt(node.style("height"));
			if(h<=0) {
				node.remove();
				node=$._popup[id]=null;
			} else {
				node.style("height",(h>popSpeed?h-popSpeed:0)+"px");
				setTimeout(flod,timeout);
			}
		} catch(err) {
		}
	}
};

// 为Date类型增加格式化文本方法
Date.prototype.format=function(fmt) {
    var o = {
        "M+": this.getMonth()+1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours()%12==0?12:this.getHours()%12, //小时，12小时制
        "H+": this.getHours(), //小时,24小时制
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth()+3)/3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    var week = {
        "0": "\u65e5",
        "1": "\u4e00",
        "2": "\u4e8c",
        "3": "\u4e09",
        "4": "\u56db",
        "5": "\u4e94",
        "6": "\u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1,(this.getFullYear() + "").substring(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1,((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f": "\u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substring(("" + o[k]).length)));
        }
    }
    return fmt;
};
// 为String对象增加contains方法
String.prototype.contains=function(str) {
	return this.indexOf(str)!=-1;
};
// 图片缓存
var imgCache;

var $=XNR;

//清除广告
function removeAds() {
	$(".ad-bar", ".banner", ".adimgr", ".blank-holder", ".blank-bar", ".renrenAdPanel", ".side-item.template", ".rrdesk").remove();
	$("#sd_ad", "#showAD", "#huge-ad", "#rrtvcSearchTip", "#top-ads", "#bottom-ads", "#main-ads", "#n-cAD").remove();
	// 混迹于新鲜事中的广告
	$("ul#feedHome > li").filter("a.dark[href^='http://post.renren.com/click.do?']").remove(); // 新鲜事2010.03改版后是否还有效？
	$("ul#feedHome > li").filter("a[href^='http://edm.renren.com/link.do?']").remove();
	// 人人桌面
	$("ul#feedHome > li").filter("a[href^='http://im.renren.com/'][href*='.exe']").remove();
};

//删除成为星级用户提示
function removeStarReminder() {
	$("#tobestar","#realheadbulletin","#noStarNotice","#nostar","#home_nostar").remove();
};

//删除音乐播放器，包括紫豆音乐播放器和帖子里的附加音乐
function removeMusicPlayer() {
	$("#zidou_music","#ZDMusicPlayer",".mplayer","embed[src*='player.swf']","embed[src*='Player.swf']").remove();
};

//删除页面主题模板
function removePageTheme() {
	//删除节日模板
	$("head link[rel='stylesheet'][href*='/csspro/themes/'][href*='.css']").remove();
	// 删除首页特定事件模板
	$("#hometpl_style").remove();
	//删除紫豆模板
	$("head style").each(function(index,elem) {
		var xhr=$(elem);
		if(xhr.text().indexOf("url(http://i.static.renren.com")!=-1) {
			xhr.remove();
			return false;
		}
	});
	// 删除紫豆导航栏
	$("head link[rel='stylesheet'][href*='zidou_nav.css']").remove();
	// 删除个人域名栏
	$("#domain_wrapper").remove();
	// 修复Logo
	var logo=$("img[src*='viplogo-renren.png']").attr({height:null,width:null});
	if(logo.size()>0) {
		logo.attr("src",logo.attr("src").replace("viplogo-renren.png","logo-renren.png"));
	}
	// 删除公共主页模板
	$("#themeLink").remove();
};

// 删除页面漂浮物（VIP）
function removeFloatBox() {
	$("#floatBox").remove();
}

// 删除日志信纸
function removeBlogTheme() {
	$("head style").each(function(index,elem) {
		var xhr=$(elem);
		if(xhr.text().indexOf(".text-article")!=-1) {
			xhr.remove();
			return false;
		}
	});
};

// 删除日志中整段的链接
function removeBlogLinks() {
	$("#blogContent a").each(function(index,elem) {
		var o=$(elem);
		// 链接到其他日志，放过好了
		if(elem.href.match("blog.renren.com")) {
			return;
		}
		// 只处理链接到个人主页或外部链接中非ASCII文字大于20个的。
		if(elem.href.match("/[Pp]rofile.do") || elem.href.match("/[a-zA-Z0-9_]{5,}\\.renren.com/\\?") || elem.href.match(/renren.com\/[a-z0-9]+$/) || o.text().match(/[\u0100-\uffff]{20,}/)) {
			o.switchTo("span");
		}
	});
};

//移除校内通栏
function removeXntBar() {
	$("#wpiroot","#imengine").remove();
};

//移除页面顶部通知
function removePageTopNotice() {
	$(".notice-holder","#notice_system").remove();
};

//移除状态发布框下的活动标签
function removeActivityLabel() {
	$(".status-publisher div.footer").remove();
};

//移除VIP过期提醒
function removeVipExpireNotice() {
	$("#vipExpireTooltip").remove();
};

//移除人气之星/新人栏
function removeNewStar() {
	$(".star-new").remove();
};

//移除装扮主页提示
function removePaintReminder() {
	$(".enter-paints","#paintself","#paintother").remove();
};

//移除个人主页左侧相册框
function removeLeftAlbum() {
	$(".col-left #album").purge();
};

//移除个人主页左侧日志栏
function removeLeftBlog() {
	$(".col-left #blog").purge();
};

//移除个人主页左侧分享框
function removeLeftShare() {
	$(".col-left #share").purge();
};

//去除个人主页左侧礼物框
function removeLeftGift() {
	$(".col-left #gift").purge();
};

//移除个人主页右侧特别好友框
function removeRightSpecialFriends() {
	$(".col-right #spFriends").purge();
};

//移除个人主页右侧最近来访框
function removeRightFootprint() {
	$(".col-right #visitors").purge();
};

//移除个人主页右侧好友框
function removeRightFriends() {
	$(".col-right #friends").purge();
};

//移除个人主页右侧共同好友框
function removeRightMutualFriends() {
	$(".col-right #cmFriends").purge();
};

//移除人人网等级栏
function removeRenRenPoint() {
	$("#sidebar .user-data","#userPoint").remove();
};

//移除活动通知栏
function removeActivityNotice() {
	$("#activity-notice").remove();
};

//移除人人网调查
function removeRenRenSurvey() {
	$(".side-item.sales-poll").remove();
};

//移除边栏：公共主页推荐
function removeCommonPage() {
	$(".side-item.commend-page").remove();
};

//移除边栏：寻找/邀请朋友
function removeFriendGuide() {
	$(".side-item.contact-fri",".guide-find-friend",".inviteguys").remove();
};

//移除边栏：推荐/礼物
function removeCommendation() {
	$(".side-item.selected").remove();
};

//移除边栏：可能认识他们
function removeMayKnow() {
	$(".side-item.pymk").remove();
};

// 移除赞助商内容
function removeSponsorsWidget() {
	$("#sponsorsWidget").remove();
};

// 移除站内功能
function removeWebFunction() {
	$("div.side-item").filter(".web-function").remove();
};

//隐藏请求
function hideRequest(reqClass) {
	try {
		$(".side-item.newrequests li img."+reqClass).parent().remove();
	} catch(err) {
	}
	// 如果请求框没有项目了，删掉
	if($(".side-item.newrequests ul.icon").heirs()==0) {
		$(".side-item.newrequests").remove();
	}
};

// 判断新鲜事类型，feed为li经XNR包装，可以指定判断是否为某一类型
function getFeedType(feed,feedType) {
	var types={
		// 标题文本，标题HTML，有无content，footerHTML
		"blog":		["^发表日志"],
		"poll":		[null,"<a [^>]*href=\"http://abc.renren.com/"],
		"app":		[null,"<a [^>]*href=\"http://apps?.renren.com/"],
		"status":	["^:",null,false],	// 如果是纯表情状态，:后面的空格会被去除
		"gift":		["^收到","<a [^>]*href=\"http://gift.renren.com/"],
		"photo":	["^上传了\\d+张照片至|^的照片|美化了一张照片$|^:",null,true],
		"tag":		["照片中被圈出来了$"],
		"profile":	["^修改了头像"],
		"share":	["^分享"],
		"movie":	[null,"<a [^>]*href=\"http://movie.xiaonei.com/|<a [^>]*href=\"http://movie.renren.com/"],
		"music":	["^上传了音乐"],
		"connect":	[null,null,null,"<a [^>]*href=\"http://www.connect.renren.com/"],
		"vip":		["^更换了主页模板皮肤|^成为了人人网.*VIP会员特权|^开启了人人网VIP个性域名"],
		"group":	[null,"<a [^>]*href=\"http://group.renren.com/"],
		"page":		[null,"<a [^>]*href=\"http://page.renren.com/"],
		"contact":	["^你和.*和好朋友保持联络$"],
	};

	var feedFooter=feed.find(".details .legend");
	var feedHasContent=(feed.find("div.content").size()>0);
	var feedTitle=feed.find("h3");
	// 删除所有链接子节点，只留下文本节点
	var feedTitleText=feedTitle.clone();
	feedTitleText.find("a:not(.text)").remove();

	if(feedType) {
		var feedText=types[feedType][0];
		var feedHTML=types[feedType][1];
		var feedContent=types[feedType][2];
		var feedFooterHTML=types[feedType][3];
		if ((!feedText || new RegExp(feedText).test(feedTitleText.text().replace(/^[ \t]+|[ \t]+$/g,""))) && (!feedHTML || new RegExp(feedHTML).test(feedTitle.inner())) && (feedContent==null || feedHasContent==feedContent) && (!feedFooterHTML || new RegExp(feedFooterHTML).test(feedFooter.inner()))) {
			return feedType;
		}
	} else {
		for(i in types) {
			var feedText=types[i][0];
			var feedHTML=types[i][1];
			var feedContent=types[i][2];
			var feedFooterHTML=types[i][3];
			if ((!feedText || new RegExp(feedText).test(feedTitleText.text().replace(/^[ \t]+|[ \t]+$/g,""))) && (!feedHTML || new RegExp(feedHTML).test(feedTitle.inner())) && (feedContent==null || feedHasContent==feedContent) && (!feedFooterHTML || new RegExp(feedFooterHTML).test(feedFooter.inner()))) {
				return i;
			}
		}
	}
	return "";
}

//隐藏新鲜事或标记为已读
function removeFeeds(markFeedAsRead,feedType) {
	var feeds=$("ul#feedHome > li").filter(function(elem) {
		return getFeedType($(elem),feedType);
	});
	feeds.each(function(index,elem) {
		if(markFeedAsRead) {
			//为防止javascript被禁用导致执行onclick出错，先将其隐藏
			$(elem).hide().find("a.delete").invoke("onclick");
		} else {
			$(elem).remove();
		}
	});
};

// 默认加载更多页新鲜事
function loadMoreFeeds(pages) {
	// 先改造load函数，原来的load最后有个window.scrollTo会使页面滚动
	// 只要当前页数比预定页数少，就不断加载下一页
	var func="window.XN.page.home.feedFilter.oldLoad=window.XN.page.home.feedFilter.load;window.XN.page.home.feedFilter.load=function(a,b){var oldScrollTo=window.scrollTo;window.scrollTo=function(){};window.XN.page.home.feedFilter.oldLoad(a,b);window.scrollTo=oldScrollTo;};function loadMoreFeeds(){if(window.XN.page.home.feedFilter.currentPage<"+(pages-1)+"){if(!window.XN.page.home.feedFilter.loading){XN.Page.home.feedFilter.loadMore()};setTimeout(loadMoreFeeds,1000);}else{window.XN.page.home.feedFilter.load=window.XN.page.home.feedFilter.oldLoad;window.XN.page.home.feedFilter.oldLoad=null}};loadMoreFeeds();";
	if(agent==FIREFOX) {
		location.href="javascript:"+func;
	} else {
		$node("script").text(func).appendTo(document.body);
	}
};

//删除导航栏上的项目
function removeNavBarItem(link) {
	if(link) {
		var nav=$("div.nav-body .menu-title a[href*='"+link+"']");
		if(nav.size()>0) {
			nav.parent().parent().remove();
		}
	}
};

//在导航栏上增加项目
function addNavBarItem(content) {
	if(!content) {
		return;
	}
	var nav=$("div.nav-main");
	if(nav.size()==0) {
		return;
	}
	var items=content.split("\n");
	for(var i=0;i<items.length;i+=2) {
		$node("div",'<div class="menu-title"><a href="'+items[i+1]+'" target="_blank">'+items[i]+'</a></div>').attr("class","menu").appendTo(nav);
	}
	//防止被自作主张改动链接
	location.href="javascript:(function(){var e=document.body.querySelectorAll('.nav-main .menu-title > a');for(var i in e){e[i]._ad_rd=true;}})();";
};

//加宽导航栏
function widenNavBar() {
	$patchCSS(".navigation-wrapper,.navigation{width:auto} .navigation .nav-body{width:auto;float:none}");
};

//恢复早期深蓝色主题
function recoverOriginalTheme() {
	// 开始检测有无模板存在
	// 紫豆导航栏
	if($("head > link[ref='stylesheet'][herf*='zidou_nav.css']").size()>0) {
		return;
	}
	// 公共主页模板
	if($("#themeLink:not([href*='sid=-1'])").size()>0) {
		return;
	}
	// 紫豆模板
	var theme=false;
	$("head style").each(function(index,elem) {
		if($(elem).text().indexOf("url(http://i.static.renren.com")!=-1) {
			theme=true;
			return false;
		}
	});
	if(theme) {
		return;
	}

	var FCOLOR="#3B5998";	//Facebook的深蓝色
	var XCOLOR="#3B5888";	//校内原来的深蓝色
	var BCOLOR="#5C75AA";	//原来的菜单背景色
	var SCOLOR="#EBF3F7";	//原来的应用栏&回复背景色
	var css="";
	// 默认的链接色
	css+="a:link,a:visited{color:"+XCOLOR+"}";

	// 分类Tab的文字颜色
	css+=".profile .profile-tabs-circle a,.page-tabs .tabpanel a,.page-tabs .tabpanel a:hover,.page-tabs .tabpanel a:visited,.stabs a:not(.current):hover span{color:"+XCOLOR+"}";
	// 公共主页分类Tab选中项背景色
	if(location.host=="page.renren.com") {
		css+=".stabs a.current span,.stabs a.current:hover span{background-color:"+BCOLOR+"}";
	}
	// 上传照片页分类Tab颜色
	css+="#self-nav .selected a{background-color:"+BCOLOR+"}#self-nav .selected a:hover{background-color:"+BCOLOR+"}#self-nav li a{color:"+XCOLOR+"}";
	
	// 导航栏背景色
	css+=".navigation,.navigation .nav-body,.vip-header-new{background:"+FCOLOR+"}";
	// 导航栏项目鼠标移过时的背景色
	css+=".navigation .menu-title a:hover{background-color:"+BCOLOR+"}";
	// 导航栏设置下拉菜单项目的背景色
	css+=".menu-dropdown-border > div:not(.app-actions) a:hover{background-color:"+BCOLOR+" !important}";

	// 首页左侧应用栏的背景色，回复的背景色
	if(location.pathname=="/Home.do") {
		css+=".statuscmtitem,.panel.bookmarks,.user-data{background-color:"+SCOLOR+"}";
	}

	// 主页上头像下方操作栏
	css+=".profile-actions a:hover{background-color:"+BCOLOR+"}";

	// 首页的发布按钮
	css+=".publisher .status-publisher input.submit{background-color:"+FCOLOR+"}";

	// 提交按钮的背景色
	css+=".input-button,.input-submit,.inputsubmit,.subbutton{background-color:"+XCOLOR+"}";

	// 分页项的鼠标移过时的背景色
	css+=".pagerpro li a:hover,#pager a:hover,.page:not(.panel) a:hover{background-color:"+BCOLOR+"}";

	// 弹出框提交按钮背景色
	if($("head > link[href*='/csspro/base/layout.css']").size()>0) {
		// layout.css中有 background-color:#005EAC !important;
		css+="td.pop_content .dialog_buttons input{background-color:"+XCOLOR+" !important}";
	} else {
		css+="td.pop_content .dialog_buttons input{background-color:"+XCOLOR+"}";
	}
	// 弹出框消息的背景色
	css+="td.pop_content h2{background-color:"+BCOLOR+"}";
	// 弹出框链接的颜色
	css+="td.pop_content .dialog_body a,td.pop_content .dialog_body a:visited{color:"+BCOLOR+"}";

	// 分享框的鼠标移过时背景色
	css+=".share-actions a.share:hover{background-color:"+BCOLOR+"}";

	// 论坛导航栏的背景色
	if(location.host=="club.renren.com") {
		css+="#clubheader #navigation,#clubheader #utility{background-color:"+XCOLOR+"}";
	}

	// 用户请求中心按钮
	css+="ul.figureslist.requests button{background-color:"+XCOLOR+" !important}";

	// 好友列表中的链接背景色
	if(location.host=="friend.renren.com") {
		css+="#friendpage ul.actions a:hover{background-color:"+BCOLOR+"}";
	}

	// 校内通栏上的提醒链接颜色
	css+=".m-chat-window.notifications .chat-conv .notifyitem .notifybody a{color:"+XCOLOR+" !important}";

	// 热门分享
	if(location.host=="share.renren.com") {
		css+="ul.share-hot-list li h3 a,ul.share-hot-list li h3 a:hover{color:"+XCOLOR+"}";
	}

	// 客服中心
	if(location.host=="support.renren.com") {
		css+=".gbcontainer h3{color:"+XCOLOR+" !important}";
		css+=".inputbutton.gbing{background-color:"+FCOLOR+"}";
	}
	$patchCSS(css);
};

//将相册内的所有相片在一页中全部显示
//压力测试：http://photo.renren.com/photo/242786354/album-236660334
function showImagesInOnePage() {
	if($("#single-column table.photoList").size()>0) {
		var baseURL="http://page.renren.com/photo/album";
		var album=$("#single-column");
		var items=$(".pager-top>span");
		// images/page
		var ipp=album.find(".photoPan").size();
	} else { 
		var baseURL="http://photo.renren.com"+location.pathname;
		var album=$("div.photo-list");
		var items=$(".number-photo");
		// images/page
		var ipp=album.first().heirs();
	}
	if(album.size()==0) {
		return;
	}
	if(items.size()==0) {
		return;
	}
	// 获取相册信息
	var ownerId,albumId;
	$("head script:not([src])").each(function(index,elem) {
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
	items.text("共"+photoAmount+"张");
	// 总页数
	var maxPage=(photoAmount-1)/ipp;
	// 当前页数
	var curPage=/[?&]curpage=([0-9]+)/i.exec(location.href);
	if(curPage==null) {
		curPage=0;
	} else {
		curPage=parseInt(curPage[1]);
	}
	album.first().attr("page",curPage);
	for(var i=0;i<=maxPage;i++) {
		if(i==curPage) {
			continue;
		}
		$get(baseURL+"?id="+albumId+"&owner="+ownerId+"&curpage="+i,function(url,res,page) {
			try {
				if($("#single-column table.photoList").size()>0) {
					var photoList=/(<table .*?class="photoList".*?>[\d\D]+?<\/table>)/.exec(res)[1];
				} else {
					var photoList=/<div .*? class="photo-list clearfix".*?>([\d\D]+?)<\/div>/.exec(res)[1];
				}
				var pos;
				if(page>parseInt(album.last().attr("page"))) {
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
				album.insert($node("div",photoList).first().attr("page",page),pos);
			} catch (err) {
				$error("showImagesInOnePage::$get",err);
			}
		},i);
	}
	$("ol.pagerpro").remove();
};

//当鼠标在照片上隐藏圈人框
function hideImageTagOnMouseOver() {
	$("#photoContainer").attr({"onmouseover":"document.getElementsByClassName('tagshowcon')[0].style.visibility='hidden'","onmouseout":"document.getElementsByClassName('tagshowcon')[0].style.visibility=null"});
};

//去除页面字体限制
function removeFontRestriction() {
	$patchCSS("*{font-family:none !important}");
};

//限制头像列表中的头像数量
function limitHeadAmount(amount) {
	if(amount==0) {
		return;
	}
	$("ul.people-list","ul.users").each(function(index,elem) {
		var list=$(elem);
		while(list.heirs()>amount) {
			$(elem).child(amount).remove();
		}
	});
};

// 不显示橙名
function disableOrangeName(theme) {
	if(theme) {
		// TODO:颜色常量
		$patchCSS(".lively-user, a.lively-user:link, a.lively-user:visited{color:#3B5888}");
	} else {
		$patchCSS(".lively-user, a.lively-user:link, a.lively-user:visited{color:#005EAC}");
	}
	// 非链接的文字不是蓝色
	$(".lively-user").removeClass("lively-user");
	
};

// 将留言版移动至新鲜事下方
function moveMessageBoardToBottom() {
	$(".talk-box").append($(".talk-box>.box"));
};

//隐藏新鲜事内容
function hideFeedContent() {
	$patchCSS("ul.richlist.feeds li div.content{display:none;}");
};

// 去除状态新鲜事链接
function removeStatusFeedLink() {
	$("#feedHome h3>a.text").switchTo("span");
};

//收起新鲜事回复
function flodFeedComment() {
	var code="";
	// feedView是公共主页的
	$("#feedHome","#feedView").find(".details .legend a[id*='reply']").each(function(index,elem) {
		var a=$(elem);
		if(a.heirs()==0) {
			if(agent==FIREFOX) {
				// Firefox only...
				a.invoke("onclick");
			} else {
				// Chrome ... I hate U
				code+="setTimeout(function(){"+a.attr("onclick")+"},"+(index*150+66)+");"
			}
		}
	});
	if(code) {
		setTimeout(function(){$node("script").text(code).appendTo(document.body)},50);
	}
	// 修改loadJSON方法，loadJSON原方法最后会调用show强制显示
	location.href="javascript:(function(){if(!XN.app.status)return;var code=XN.app.status.replyEditor.prototype.loadJSON.toString().replace(/function *\\(json\\) *{/,'').replace(/}$/,'').replace(/this.show\\([^\\)]*\\)/,'this.hide()');XN.app.status.replyEditor.prototype.loadJSON=new Function('json',code);})()";
};

//增加更多状态表情
function addExtraEmotions() {
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
	//	{e:"(v)",		t:"花儿",			s:"/imgpro/icons/statusface/9.gif"},
		{e:"(花)",		t:"花儿",			s:"/imgpro/icons/statusface/9.gif"},
		{e:"(38)",		t:"校内女人",		s:"/imgpro/icons/statusface/10.gif"},
	//	{e:"8-|",		t:"书呆子",			s:"/imgpro/icons/statusface/13.gif"},
		{e:"(书呆子)",	t:"书呆子",			s:"/imgpro/icons/statusface/13.gif"},
	//	{e:"|-)",		t:"困",				s:"/imgpro/icons/statusface/14.gif"},
		{e:"(困)",		t:"困",				s:"/imgpro/icons/statusface/14.gif"},
		{e:"(害羞)",	t:"害羞",			s:"/imgpro/icons/statusface/15.gif"},
		{e:"(大笑)",	t:"大笑",			s:"/imgpro/icons/statusface/16.gif"},
	//	{e:":d",		t:"大笑",			s:"/imgpro/icons/statusface/16.gif"},
		{e:"(口罩)",	t:"防流感",			s:"/imgpro/icons/statusface/17.gif"},
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
		{e:"(淘气)",	t:"淘气",			s:"/imgpro/emotions/tie/16.gif"},
		{e:"(吐)",		t:"呕吐",			s:"/imgpro/emotions/tie/19.gif"},
		{e:"(吻)",		t:"吻",				s:"/imgpro/emotions/tie/20.gif"},
		{e:"(晕)",		t:"晕",				s:"/imgpro/emotions/tie/21.gif"},
		{e:"(住嘴)",	t:"住嘴",			s:"/imgpro/emotions/tie/23.gif"},
		{e:"(s)",		t:"大兵",			s:"/imgpro/icons/statusface/soldier.gif"},
		{e:"(NBA)",		t:"篮球",			s:"/imgpro/icons/statusface/basketball4.gif"},
		{e:"(蜜蜂)",	t:"小蜜蜂",			s:"/imgpro/icons/statusface/bee.gif"},
	//	{e:"(bee)",		t:"小蜜蜂",			s:"/imgpro/icons/statusface/bee.gif"},
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
		{e:"(bl)",		t:"冰露",			s:"/imgpro/icons/statusface/ice.gif"},
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
		{e:"(hh)",		t:"圣诞花环",		s:"/imgpro/icons/statusface/garland.gif"},
		{e:"(stick)",	t:"拐杖糖",			s:"/imgpro/icons/statusface/stick.gif"},
		{e:"(socks)",	t:"圣诞袜",			s:"/imgpro/icons/statusface/stocking.gif"},
		{e:"(元旦)",	t:"元旦快乐",		s:"/imgpro/icons/statusface/gantan.gif"},
	//	{e:"(虎年)",	t:"虎年",			s:"/imgpro/icons/statusface/tiger.gif"},
		{e:"(tiger)",	t:"虎年",			s:"/imgpro/icons/statusface/tiger.gif"},
		{e:"(ny)",		t:"布老虎",			s:"/imgpro/icons/statusface/tiger2.gif"},
		{e:"(boy)",		t:"男孩",			s:"/imgpro/icons/statusface/boy.gif"},
		{e:"(girl)",	t:"女孩",			s:"/imgpro/icons/statusface/girl.gif"},
		{e:"(earth)",	t:"地球",			s:"/imgpro/icons/statusface/wwf-earth.gif"},
		{e:"(earth1)",	t:"地球",			s:"/imgpro/icons/statusface/earth.gif"},
		{e:"(ty)",		t:"汤圆",			s:"/imgpro/icons/statusface/tang-yuan.gif"},
		{e:"(dl)",		t:"灯笼",			s:"/imgpro/icons/statusface/lantern.gif"},
		{e:"(nrj)",		t:"女人节",			s:"/imgpro/icons/statusface/lipstick.gif"},
		{e:"(zsj)",		t:"植树节",			s:"/imgpro/icons/statusface/trees.gif"},
		{e:"(zg)",		t:"整蛊作战",		s:"/imgpro/icons/statusface/tomato.png"},
		{e:"(rainy)",	t:"雨",				s:"/imgpro/icons/statusface/rainy.gif"},
	//	{e:"(rain)",	t:"雨",				s:"/imgpro/icons/statusface/rainy.gif"},
		{e:"(abao)",	t:"功夫熊猫",		s:"/imgpro/icons/statusface/panda.gif"},
		{e:"(jq)",		t:"坚强",			s:"/imgpro/icons/statusface/quake.gif"},
		{e:"(smlq)",	t:"萨马兰奇",		s:"/imgpro/icons/statusface/samaranch2.gif"},
		{e:"(read)",	t:"读书日",			s:"/imgpro/icons/statusface/reading.gif"},
		{e:"(ct)",		t:"锄头",			s:"/imgpro/icons/statusface/chutou.gif"},
		{e:"(^)",		t:"蛋糕",			s:"/imgpro/icons/3years.gif"},
		{e:"(h)",		t:"小草",			s:"/imgpro/icons/philips.jpg"},
		{e:"(r)",		t:"火箭",			s:"/imgpro/icons/ico_rocket.gif"},
		{e:"(w)",		t:"宇航员",			s:"/imgpro/icons/ico_spacewalker.gif"},
		{e:"(LG)",		t:"LG棒棒糖",		s:"/imgpro/activity/lg-lolipop/faceicon_2.gif"},
		{e:"(i)",		t:"电灯泡",			s:"/img/ems/bulb.gif"},
		{e:"(lz)",		t:"蜡烛",			s:"/img/ems/candle.gif"},
		{e:"(gsilk)",	t:"绿丝带",			s:"/img/ems/gsilk.gif"},
		{e:"(yeah)",	t:"哦耶",			s:"/img/ems/yeah.gif"},
		{e:"(good)",	t:"牛",				s:"/img/ems/good.gif"},
		{e:"(f)",		t:"拳头",			s:"/img/ems/fist.gif"},
	//	{e:"(l)",		t:"爱",				s:"/img/ems/love.gif"}, 与:a相同
		{e:"(t)",		t:"火炬",			s:"/img/ems/torch.gif"},
	];
	//日志/照片回复表情列表，直接与序号/URL对应
	emlist1=["不","谄笑","吃饭","调皮","尴尬","汗","惊恐","囧-窘迫","可爱","酷","流口水","猫猫笑","色","生病","叹气","淘气","舔","偷笑","吐","吻","晕","猪猪头","住嘴","大笑","害羞","惊呆","口罩","哭","困","难过","生气","书呆子","微笑"];

	//状态页(status.renren.com)的表情列表
	var list=$("#status_emotions");
	if(list.size()>0) {
		//已经有的表情列表
		var curlist=[];
		list.find("img").each(function(index,elem) {
			curlist[elem.getAttribute("emotion")]=elem;
		});
		for(var i in emlist) {
			var el=emlist[i];
			//不在已有列表中
			if(!curlist[el.e]) {
				var node=$node("li").append($node("a").attr("href","#nogo").append($node("img").attr({title:el.t,alt:el.t,emotion:el.e,src:"http://xnimg.cn"+el.s,rsrc:"http://xnimg.cn"+el.s})));
				list.append(node);
			} 
		}
	}


	//首页的状态表情列表
	var list=$("#publisher_emotion > ul");
	if(list.size()>0) {
		//已经有的表情列表
		var curlist=[];
		list.find("img").each(function(index,elem) {
			curlist[elem.getAttribute("emotion")]=elem;
		});
		for (var i in emlist) {
			var el=emlist[i];
			//不在已有列表中
			if(!curlist[el.e]) {
				var node=$node("li").append($node("a").attr("href","#nogo").append($node("img").attr({title:el.t,alt:el.t,emotion:el.e,src:"http://xnimg.cn"+el.s,rsrc:"http://xnimg.cn"+el.s})));
				list.append(node);
			}
		}
	}
	//处理回复表情
	$("#dropmenuHolder").listen('DOMNodeInserted',function(evt) {
		try {
			if(evt.target.className!="emotion") {
				return;
			}
			var list=$(evt.target);
			//已经有的表情列表
			var curlist=[];
			list.find('img').each(function(index,elem) {
				curlist[elem.getAttribute("emotion")]=elem;
			});
			if(list.inner().indexOf("/icons/statusface/")==-1) {
				// 日志/照片回复列表
				for(var i=1;i<=emlist1.length;i++) {
					if(!curlist["("+emlist1[i-1]+")"]) {
						var node=$node("li",'<a onfocus="this.blur();" href="#nogo"><img src="http://xnimg.cn/imgpro/emotions/tie/'+i+'.gif" title="'+emlist1[i-1]+'" alt="'+emlist1[i-1]+'" emotion="('+emlist1[i-1]+')"/></a>');
						list.append(node);
					}
				}
			} else {
				// 状态回复列表
				for (var i in emlist) {
					var el=emlist[i];
					if(!curlist[el.e]) {
						var node=$node("li").append($node("a").attr("href","#nogo").append($node("img").attr({title:el.t,alt:el.t,emotion:el.e,src:"http://xnimg.cn"+el.s,rsrc:"http://xnimg.cn"+el.s})));
						list.append(node);
					}
				}
			}
		} catch (err) {
			$error("addExtraEmotions::listen",err);
		}
	});
};

//在日志、相册中增加楼层计数
function addFloorCounter() {
	addCounter();
	$("div.replies").listen("DOMNodeInserted",addCounter);
	
	function addCounter(evt) {
		try {
			if(evt && !/^replies/.test(evt.target.className)) {
				return;
			}
			var replyAmount;	//回复总数
			if(location.host=="blog.renren.com") {
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
			var shownReplies=$("dl.replies > dd[id^='talk']");

			//显示的回复的开始楼层
			var replyStartFloor=replyAmount-shownReplies.size();
			if(shownReplies.size()==0 || replyStartFloor<0) {
				//没有回复或出错
				return;
			}
			shownReplies.each(function(index,elem) {
				var info=$(elem).find(".info");
				if(info.first().attr("class")!="fc") {
					info.prepend($node("span",(replyStartFloor+parseInt(index)+1)+"楼 ").attr("class","fc").style("color","grey"));
				} else {
					//添加过了，不再继续
					return false;
				}
			});
			//隐藏“显示较早之前的评论”,防止重复点击
			//Chrome不支持DOMAttrModified事件。。https://bugs.webkit.org/show_bug.cgi?id=8191
			$("#tempLoading").listen("DOMAttrModified",function(evt) {
				if($("#tempLoading").style("visibility")=="hidden") {
					$("#showMoreComments").show();
				} else {
					$("#showMoreComments").hide();
				}
			});
		} catch(err) {
			$error("addCounter",err);
		}
	};
};

// 允许在日志中插入HTTPS/FTP协议的链接
function addBlogLinkProtocolsSupport() {
	location.href='javascript:(function(){var f=window.tinyMCE.editors.editor.plugins.xnLink.update.toString().replace("/^http:/","/^https?:|^ftp:/").replace(/function \\(\\) *{/,"").replace(/}$/,"");window.tinyMCE.editors.editor.plugins.xnLink.update=new Function(f);})()';
};

//在鼠标移过时显示照片大图
function showImageOnMouseOver() {
	//显示大图DIV
	var showViewer=function(mouseX,src) {
		try {
			var viewer=$('#xnr_viewer');
			if(viewer.size()==0) {
				return;
			}
			viewer.style("overflowY","auto");
			if(mouseX!=null && viewer.style("display")=="none") {
				if(mouseX>document.body.clientWidth/2) {
					viewer.style({left:"2px",right:""});
				} else {
					viewer.style({left:"",right:"2px"});
				}
				viewer.style({display:"block",postion:"fixed"});
			}
			var image=viewer.find('#xnr_image');
			if(!src) {
				image.attr("src","http://s.xnimg.cn/imgpro/bg/bg_line_loading.gif");
			} else if(src=="error") {
				image.attr("src","data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/2wBDASstLTw1PHZBQXb4pYyl+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj/wAARCACMAMgDASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAEDBAIFBv/EADMQAAICAQIEAwcDBAMBAAAAAAECAAMRBDESIUFRBRNhFCIyQnGBkSMzoUNSYnIVU8HR/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEB/9oADAMBAAIRAxEAPwDzYiICIiAiTGD2gREnEYJBODgbmBEScEgkA4G5kQESSpABIODse8iAiJPCQoYg4OxgREnhbAODg7HEiAiSFJBIBIG57SICIkgE7An6QIiIgIiICIiAiIgIiIG3Ru6aXUGtuFsoM9uZm5CzohF9jKAeOxWAAP0Inn6Zimj1DLjIZDz59TNFF3mqOK/is7cRQr9OhgV+e92l1YaxnQcPDxb44pxpVD6PUhnCDKcz95K2vbptUbCCwCjIA/u9JFDCnQu7oHFjgBW64gdVpQmnur9qTLlcHB6faZrK662XFosU78I2/M0ae2m7UJWdLWAxweZ/+zI4AdgNswPR4NNZRpU/WCu7BeYzuN5VYy6bT1hK62JZwS6AnkZ1jhu0NPVcMfucyL6rLtPUakZvffOB6wObhWuvJPl1qFBwUyuw6CabLKhTWpegbsM0nGD2GJRcSniYPvjAXPAOfwibH822kur3qSx+XHLHYnb1gU+6tFBW9MEOvwEhgTz5TJpK1882Mc1U+8T37TRpiU8PFpU8aMRX6k4EyVO9LsnlI7E44WXPOBrrfTPVqnxd7wBbJHfpMdvs/D+iLQ2fnIxieiLa6VFNyUrZZuAgwvbMx6l7E4qrNPShPVUx+DAupLLo6+AqvuuxJUHOJYwWu/U3sp4BWq4XluBK9P7+iwvMqrJ2yWIwJ0tr261qMMamGHXGMcgCf4gZdVXTXXU1QcFxxYY55TNNXiGRqeHhwqKFX1EywEREBERAREQEREC6jU2adXWsgceMnHPlO/b9V/2/wJmiBpfW32VPW7BlbG42lVlrWIitjhQYAEriB3VYarVsUAlTkZkByLA+ATnODtOYgaV1tiu1nChdjniK8x9JT5tnAqcR4VzgTiIFhutNnmcbB8YyDgyXvd6RWxyA3Fk7yqIF9Ortq2IYAYCtzEV6q2oPwYDOcl8c/wAyiIEkkkknJPUy0aq0UmokMhGAGGcfSUxAse53rRCfdTYAY+87OruNbqW+P4mxzPpmURAte+x6UqY5VNs7yqIgIiICIiAiIgIiICIndSeZYFJwOsDlVZjhQSewE6et0+NGX6jE9jTulSBawFE0m1WXBAIO4MzVj5wAscAEnsJrq8N1FmCVCD/IyzU1rpr+Kg8PENu0qzY/MFjLSNa+Drj3rjn0WSfB0xyub8TJi5TyLD7ztb9So5O+PzIR23g9nyWqfqMSizw7Up/T4h/iczSniVq/EFb+Jpr8Rqb4gVi6R4jKyHDKVPYjE5n0vFTenPgdex5zLd4Zp7BlM1n05iWkeJE13+H3U5Iw6jqsySoREQEREBERAREQEREBERAS2rIyRKpbQ4V/e2O8DQlpHeWi/HWR5XLIwZwyYmWh28ywHfAxAdi5GTgdJCDnIUe+31gUaj90ysHG07v/AHmlcrLsWuOufrznQtB+JceolUSjSjHOa25+m801a61OTniHrvPNmlSXrBO/eTcVo1Gta4YXKjrPPO5mgCZzuYw1EREqEREBERAREQETUmlzvNNekHaB5wRjsJ2tDnpPWTSAdJcunUdIHjrpHMsXQMe89gVqOk6wBtA82rSWIMKxA7Sw6R2+IzfiMQPHasV2FB0M5OBZylt/77/7GUE+/MtNtWkS2sOdzO/YElui56cfUzRiaZYvYEnP/Hp2E34jEDzj4cvYSi+gUEJ957GJ5/iH7q/6/wDsmrjBiWNoGHecge+BPbIjDXgnRuJWdO46T6E1qegnDUKekqPnijDcSMYnuPpQekzvox2geVE2vpOwlLadhtAoidFGG4iB7yUjtLgoEnaTAREmBTdqFqOMEt2lB1jnZVE1PUlnxDJ7ys6OvuwgUe1W9x+J0ursG6qR6S0aOvu35h6K6kLLWXPaBgtbidm2ycyhlYsSAfsJfYrlieHGTnG06rXhXBmWl2lvNVXCU653mgatOqtMkSo2jVVnfI+0kaio/NMMSkegLazs6/mYfECDYpBzy6TiV27yaKf6o6T0F1hOMgTEFQ7jJl9FNDA8ZYducivRyv8AcI5dxMwqqHMWv+ZPlr0tMVI0cu4kEA7kSjyxy/W/iR5bdLV/EVY7esHkCCZRZT6SxW8qz9RwQR0lzLkS4zrzbKfSJsdIlGiJyrTqBMmcyYEyZzJzAmTOYgdTk1od1U/aMxmByaKj8gnJ01Z6EfeW5jMCg6ROjMJydGej/wATTmMwMZ0lndZw+ktPQH6Gb8xmB5Z0lo+UzpNLcefDj74npZkZkhWHyLB8p+xnJrcbhx9p6GYzEWvNOQfi/iQSx2fM9Izkoh3UfiIVj05QMRdgk44czbOPJqzngHKSzYlRy8ThmiBwry1XmJSc4likwNgcTrImVWM7UmBfJlXEROgeUDuJyDJgTEiIExIiBMSIgTEiIE5jMiDAmRIJxOSxzA7kFgJUSZwWMC0vK2eVkmcEmB0zRKSekQP/2Q%3D%3D");
			} else {
				image.attr({src:src,onload:"if(parseInt(this.height)>parseInt(window.innerHeight)-10)this.parentNode.style.overflowY='scroll'"});	// 如果不设为scroll会出现横向滚动条
				viewer.style({maxHeight:(parseInt(window.innerHeight)-10)+"px",maxWidth:(parseInt(window.innerWidth)-20)+"px"});	// 边距2，边框宽度3
			}
		} catch (err) {
			$error("showViewer",err);
		}
	};
	//获取一般图片的大图并显示出来
	var getImage=function(pageURL,imgId) {
		$get(pageURL,function(url,html) {
			try {
				if(html.search("<body id=\"errorPage\">")!=-1) {
					imageCache(imgId,"error");
					showViewer(null,"error");
					return;
				}
				var src=/var photo *= *({.*});?/.exec(html);
				if(src) {
					src=JSON.parse(src[1]);
					if(src.photo && src.photo.large) {
						imageCache(imgId,src.photo.large);
						if($("#xnr_image").attr("orig")==imgId) {
							showViewer(null,src.photo.large);
						}
						return;
					}
				}
				// 公共主页相册
				var src=/XN.PAGE.albumPhoto.init\((.*?)\);/.exec(html);
				if(src) {
					src=JSON.parse("["+src[1].replace(/'.*?'/g,"0")+"]")[10];
					if(src && src.photo && src.photo.large) {
						imageCache(imgId,src.photo.large);
						if($("#xnr_image").attr("orig")==imgId) {
							showViewer(null,src.photo.large);
						}
					}
					return;
				}
				if($("#xnr_image").attr("orig")==imgId) {
					imageCache(imgId,"error");
					showViewer(null,"error");
				}
			} catch(err) {
				$error("getImage::$get",err);
			}
		});
	};
	//获取相册中某一张图片的大图并显示出来
	var getAlbumImage=function(album,pageN,imgId,imgDate) {
		$get(album+(album.indexOf("?")==-1?"?":"&")+"curpage="+pageN,function(url,html) {
			try {
				if(html.indexOf("<body id=\"errorPage\">")!=-1 || html.indexOf("<body id=\"error404Page\"")!=-1) {
					imageCache(imgId,"error");
					showViewer(null,"error");
					return;
				}
				// 搜索ID匹配的图片
				var res=null;
				while(res=new RegExp("<a .*?href=\"(.*?)\".*?>[^<]*?<img (.*?src=\"http://.+?"+imgId+"\"[^>]*?)>","ig").exec(html)) {
					if(res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
						res=res[1];
						break;
					}
				}
				// 当ID不匹配且为搜索小头像时，搜索时间标记匹配的图片
				if(!res && imgDate) {
					while(res=RegExp("<a .*?href=\"(.*?)\".*?>[^<]*?<img (src=\"http://.*?/"+imgDate+"/.*?\"[^>]*?)>","ig").exec(html)) {
						if(res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
							res=res[1];
							break;
						}
					}
					// 还没有的话，只限定日期试试。误差较大，但愿能准确匹配
					if(!res) {
						while(res=RegExp("<a .*?href=\"(.*?)\".*?>[^<]*?<img (src=\"http://.*?/"+/[0-9]{8}/.exec(imgDate)+"/.*?\".*?)>","ig").exec(html)) {
							if(res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
								res=res[1];
								break;
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
					getImage(res,imgId);
				} else {
					// 没找到，看看下一页有没有
					var all=/共([0-9]+)张/.exec(html);
					if(all && html.indexOf("-"+all[1]+"张")==-1) {
						// 还没有到最后一页
						getAlbumImage(album,pageN+1,imgId,imgDate);
					} else {
						// 实在找不到了，不管了
						imageCache(imgId,"error");
						showViewer(null,"error");
						return;
					}
				}
			} catch(err) {
				$error("getAlbumImage::$get",err);
			}
		});
	};
	//获取日志中图片的大图并显示出来
	var getBlogImage=function(pageURL,imgId) {
		$get(pageURL,function(url,html) {
			try {
				if(html.search("<body id=\"errorPage\">")!=-1) {
					imageCache(imgId,"error");
					showViewer(null,"error");
					return;
				}
				var src=new RegExp("<img .*?src=\"(.*?"+imgId+")\".*?>").exec(html);
				if(src) {
					src=src[1];
					imageCache(imgId,src);
					if($("#xnr_image").attr("orig")==imgId) {
						showViewer(null,src);
					}
				} else {
					imageCache(imgId,"error");
					showViewer(null,"error");
				}
			} catch(err) {
				$error("getBlogImage::$get",err);
			}
		});
	};
	// 读取/设置图片缓存
	var imageCache=function(imgId,src) {
		try {
			if(imgId.indexOf("/")!=-1) {
				imgId=imgId.substring(imgId.lastIndexOf("/")+1);
			}
			if(src) {
				// 设置
				if(src!="error" && src.indexOf("a.gif")==-1) {
					imgCache[imgId]={src:src,life:100};
					localStorage.setItem("xnr_cache",JSON.stringify(imgCache));
				}
			} else {
				if(imgCache[imgId]) {
					if(imgCache[imgId].src.indexOf("a.gif")==-1) {
						imgCache[imgId].life=100;
						return imgCache[imgId].src;
					}
				}
				return "";
			}
		} catch (err) {
			$error("imageCache",err);
			return "";
		}
	};
	//正式开始
	$("body").listen('mouseover', function(evt) {
		try {
			if(evt.shiftKey || evt.ctrlKey || evt.altKey) {
				return;
			}
			// 如果图片显示框还没有创建，则先创建它
			if($("#xnr_viewer").size()==0) {
				$node("div").attr("id","xnr_viewer").style({border:"3px double rgb(102,102,102)",display:"none",backgroundColor:"rgb(246,246,246)",top:"2px",zIndex:"199999",right:"2px",position:"fixed",overflowX:"auto"}).append($node("img").attr("id","xnr_image")).appendTo(document.body);
			}
			var t = evt.target;
			var imgId,cache,pageURL;
			var str,imgSrc="",imgDate=null;
			switch(t.tagName) {
				case "IMG":
				//将地址放到style中的图片
					if(t.src.contains("xnimg.cn/a.gif") && t.style.backgroundImage.contains("url(")) {
						imgSrc=t.style.backgroundImage.replace(/^url\("|"\);?$/g,"");
					} else {
						imgSrc=t.src;
					}
					break;
				case "SPAN":;	// 同DIV
				case "DIV":
					if(t.style.backgroundImage.contains("url(")) {
						imgSrc=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
					}
					break;
				case "A":
					if(t.style && t.style.backgroundImage.contains("url(")) {
						imgSrc=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
						pageURL=t.href;
					}
					break;
			}
			if(imgSrc!="" && !imgSrc.match(/\/large|_large|large_|\/photos\/0\/0\/|\/page_pic\/|\/homeAd\//)) {
				// 不能为大图和公共主页封面图
				imgId=imgSrc.substring(imgSrc.lastIndexOf("_"));
				//一种非常古老的图片（http://fm071.img.renren.com/pic001/20070201/2002/H[0-9]+[A-Z]+.jpg），改imgId
				if(imgSrc.match(/http:\/\/.*?\.img\.renren\.com\/pic\d+\/\d{8}\/\d+\/H.*?\.jpg/)) {
					imgId=imgSrc.substring(imgSrc.lastIndexOf("/H")+2);
				}

				$("#xnr_image").attr("orig",imgId);

				cache=imageCache(imgId);
				if(cache) {	//已经在缓存里了
					showViewer(evt.pageX,cache);
					return;
				}
					
				if(!pageURL && t.parentNode.tagName=="A") {
					if($(t.parentNode).attr("href").match(/^#|^javascript:/)) {
						return;
					}
					pageURL=t.parentNode.href;
				} else if (!pageURL && t.parentNode.tagName=="I" && t.parentNode.parentNode.tagName=="A") {
					pageURL=t.parentNode.parentNode.href;
				//} else if (t.className=="avatar") {
				//	pageURL="http://photo.renren.com/getalbumprofile.do?owner="+$cookie("id");
				}

				if(!pageURL) {
					return;
				}

				// 电影海报
				if(imgSrc.contains("movie.img.xiaonei.com/upload/movie/cover/")) {
					cache=imgSrc.replace("/cover/","/bigcover/");
					imageCache(imgId,cache);
					showViewer(evt.pageX,cache);
					return;
				}

				// 没有附加码，也不属于一般头像，也不是非常古老的头像（http://head.xiaonei.com/photos/20070201/1111/head[0-9]+.jpg），直接改URL
				if(imgSrc.contains('head_') && !imgSrc.match(/head_.+_/) && !imgSrc.contains("http://hd")) {
					cache=imgSrc.replace("head_","large_");
					imageCache(imgId,cache);
					showViewer(evt.pageX,cache);
					return;
				}

				// 公共主页相册封面图
				if(pageURL.match(/page\.renren\.com\/.*\/album\//)) {
					// 不能限定日期，日期仅用于判断头像
					//imgDate=/\/(\d{8})\//.exec(imgSrc)[1];
					showViewer(evt.pageX);
					getAlbumImage(pageURL,0,imgId,imgDate);
					return;
				}

				// 公共主页上其他公共主页的链接
				if(pageURL.match(/page\.renren\.com\/[^/]+$/)) {
					//imgDate=/\/(\d{8})\//.exec(imgSrc)[1];
					showViewer(evt.pageX);
					getAlbumImage("http://page.renren.com/photo/album?owner="+/page\.renren\.com\/([^/?&]+)/.exec(pageURL)[1]+"&h=1",0,imgId,imgDate);
					return;
				}

				// 非常古老的头像（http://head.xiaonei.com/photos/20070201/1111/head[0-9]+.jpg），其head后的[0-9]+可能有变，以时间为准
				if(imgSrc.match(/head\.xiaonei\.com\/photos\/[0-9]{8}\/[0-9]+\/head[0-9]+\./)) {
					imgDate=/photos\/([0-9]{8}\/[0-9]+)/.exec(imgSrc)[1];
				}

				// 小头像
				if((imgSrc.contains("tiny_") || (imgSrc.contains("tiny") && !imgSrc.contains("_"))) && !pageURL.contains("album") && !pageURL.contains("page.renren.com")) {
					imgDate=/\/([0-9]{8}\/[0-9]+)\//.exec(imgSrc)[1];
					pageURL="http://photo.renren.com/getalbumprofile.do?owner="+/id=(\d+)/.exec(pageURL)[1];
				} else if(pageURL.contains("/profile.do?")) {
					// 头像图片（新鲜事中）
					pageURL="http://photo.renren.com/getalbumprofile.do?owner="+/id=(\d+)/.exec(pageURL)[1];
				}

				// 相册封面图片或头像图片
				if(pageURL.contains("getalbum.do") || pageURL.contains("getalbumprofile.do") || pageURL.contains("/photo/album?") || pageURL.match(/photo\.renren\.com\/photo\/[0-9]+\/album-[0-9]+/)) {
					showViewer(evt.pageX);
					getAlbumImage(pageURL,0,imgId,imgDate);
					return;
				}

				// 日志中的图片
				if(pageURL.contains("blog.renren.com/GetEntry.do?")) {
					showViewer(evt.pageX);
					getBlogImage(pageURL,imgId);
					return;
				}
					
				// 一般图片或被圈相片或公共主页上的图片
				if(pageURL.contains("getphoto.do") || pageURL.contains("gettagphoto.do") || pageURL.match(/photo\.renren\.com\/photo\/[0-9]+\/photo-[0-9]+/) || pageURL.match(/page\.renren\.com\/.*\/photo\//) || pageURL.contains("photo.renren.com/photo/sp/")) {
					showViewer(evt.pageX);
					getImage(pageURL,imgId);
					return;
				}
			} else {
				if(t.id=="xnr_viewer" || t.id=="xnr_image") {
					return;
				}
				$('#xnr_viewer').style("display","none").find("#xnr_image").attr({src:"",orig:""});
			}
		} catch(err) {
			$error("showImageOnMouseOver::onmouseover",err);
		}
	});
};

//选中“悄悄话”选框
function useWhisper() {
	var chk=$('#whisper');
	if(chk.size()>0 && chk.prop("checked")==false) {
		chk.prop("checked",true).invoke("onclick");
	}
};

//去除只有星级用户才能修改特别好友的限制
function removeFriendRestriction() {
	location.href="javascript:(function(){try{window.user.star=true;window.user.vip=true;}catch(e){}})()";
};

//去除只有星级用户才能修改昵称的限制
function removeNicknameRestriction() {
	$("#feedInfoAjaxDiv").listen("DOMNodeInserted",function(evt) {
		location.href="javascript:(function(){try{window.XN.page.ProfileEdit.basicInfo.checkNkName=function(){}}catch(e){}})()";
		var input=$("#nkname");
		if(input.size()>0) {
			input.attr({readonly:null});
			input.parent().find("span.hint.gray").remove();
		}
	});
};

// 显示上一次登录信息
function showLoginInfo(lastSid) {
	var sid=$cookie("xnsid");
	if(!sid || sid==lastSid) {
		return;
	}
	$save("lastSid",sid);
	$get("http://safe.renren.com/ajax.do?type=logInfo",function(url,data) {
		data=data.replace(/<(\/?)a[^>]*>/g,"<$1span>").replace("<dt>当前登录信息</dt>","");
		data+="<div><a style='float:right;padding:5px' href='http://safe.renren.com/alarm.do' target='_blank'>更多信息<a></div>";
		$popup("login","登录信息",data,"0x0-5-5",15,5);
	});
};

// 快速通道功能
function enableStealthMenu() {
	var myid=$cookie("id");
	// 如果未登录，仍然显示菜单。实际只有公开资料一项可用
	$("body").listen('mouseover', function(evt) {
		try {
			var t=evt.target;
			if(t.id=="stealthMenu" || t.parentNode.id=="stealthMenu") {
				return;
			}
			// bypass the BUG：http://code.google.com/p/chromium/issues/detail?id=39978
			// 当Firefox限制了最小字体>=14时也会出现相似问题
			if($._stealth) {
				var rect=$._stealth.getBoundingClientRect();
				if(evt.clientX>=rect.left && evt.clientX<=rect.right && evt.clientY>=rect.top && evt.clientY<=rect.bottom) {
					return;
				}
			}
			$("#stealthMenu").remove();
			$._stealth=null;
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
			if(myid==id) {
				return;
			}
			var rect=t.getBoundingClientRect();
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
			// absolute在放大页面的情况下会出现文字被错误截断导致宽度极小的问题
			var node=$node("div",html).attr("id","stealthMenu").style({position:"absolute",left:parseInt(rect.left+window.scrollX)+"px",top:parseInt(rect.bottom+window.scrollY)+"px",backgroundColor:"#EEEEEE",opacity:0.88,padding:"5px",border:"1px solid #5C75AA",zIndex:99999}).appendTo(document.body);
			$._stealth=t;
		} catch(err) {
			$error("enableStealth::mouseover",err);
		}
	});
};

// 全屏观看优酷
function enableYoukuFullscreen() {
	if($("#sharevideo img.videoimg").size()>0) {
		$("#sharevideo").listen("DOMNodeInserted",reloadYoukuVideo);
	} else {
		reloadYoukuVideo();
	};
	function reloadYoukuVideo(evt) {
		if(evt) {
			$("#sharevideo").get().removeEventListener("DOMNodeInserted",reloadYoukuVideo,false);
		}
		$("embed[src*='youku.com']").each(function(index,elem) {
			elem.src=elem.src.replace(/(http:\/\/player\.youku\.com[^"]*)(\/v.swf)/,"$1&winType=interior$2");
			elem.src=elem.src.replace(/(http:\/\/static\.youku\.com[^"]*)/,'$1&winType=interior');
			$(elem).attr("flashvars","winType=interior").switchTo(elem);
		});
	}
};

// 在相册中添加生成下载页链接
// 压力测试：http://photo.renren.com/photo/242786354/album-236660334
function addDownloadAlbumLink(linkOnly) {
	var downLink=$node("a").attr({"style":'background-image:none;padding-left:10px',"href":'#nogo'}).text("下载当前页图片");
	if($(".function-nav.photolist-pager ul.nav-btn").size()>0) {
		$(".function-nav.photolist-pager ul.nav-btn").append($node("li").attr("class","pipe").text("|")).append($node("li").append(downLink));
	} else {
		$(".pager-bottom").prepend(downLink);
	}
	downLink.listen("click",function(evt) {
		if(downLink.text().match("处理中")) {
			if(confirm("要中止吗？")) {
				finish();
			}
			return;
		}
		$._albumImages=[];
		var links=$(".photo-list span.img a, table.photoList td.photoPan>a");
		var totalImage=links.size();
		if(totalImage==0) {
			return;
		}
		var cur=0;
		links.attr("down","down")
		downLink.text("处理中...(0/"+totalImage+")");
		links.each(function(index,elem) {
			if(!downLink.text().match("处理中")) {
				return false;
			}
			$get(elem.href,function(url,html,target) {
				if(!downLink.text().match("处理中")) {
					return;
				}
				try {
					if(html.search("<body id=\"errorPage\">")!=-1) {
						return;
					}
					var src=/var photo *= *({.*});?/.exec(html);
					if(src) {
						src=JSON.parse(src[1]);
						if(src.photo && src.photo.large) {
							$._albumImages.push((!linkOnly?"<img src=\""+src.photo.large+"\" style=\"display:none\"/>":"")+"<a href=\""+src.photo.large+"\">"+src.photo.large+"</a>");
							$(target).attr({down:null});
							return;
						}
					}
					// 公共主页相册
					var src=/XN.PAGE.albumPhoto.init\((.*?)\);/.exec(html);
					if(src) {
						src=JSON.parse("["+src[1].replace(/'.*?'/g,"0")+"]")[10];
						if(src && src.photo && src.photo.large) {
							$._albumImages.push((!linkOnly?"<img src=\""+src.photo.large+"\" style=\"display:none\"/>":"")+"<a href=\""+src.photo.large+"\">"+src.photo.large+"</a>");
							$(target).attr({down:null});
							return;
						}
					}
				} catch(err) {
					$error("addDownloadAlbumLink::$get",err);
				} finally {
					cur++;
					if(cur==totalImage) {
						if(downLink.text().match("处理中")) {
							finish();
						}
					} else {
						downLink.text("处理中...("+cur+"/"+totalImage+")");
					}
				}
			},elem);
		});
		function finish() {
			if($._albumImages.length>0) {
				var data="";
				var failedImages=$(".photo-list span.img a[down],table.photoList td.photoPan>a[down]");
				if(failedImages.size()>0) {
					var failedImagesList=[];
					failedImages.each(function(index,elem) {
						if(linkOnly) {
							failedImagesList.push("<span>"+elem.href+"</span>");
						} else {
							failedImagesList.push("<a href=\""+elem.href+"\">"+elem.href+"</a>");
						}
					});
					data="未能取得以下页面的图片地址：<br/>"+failedImagesList.join("<br/>")+"<br/><br/>";
				}
				if(linkOnly) {
					data+="使用下载工具"+(agent==FIREFOX?"（推荐使用Flashgot或Downthemall扩展）":"")+"下载本页全部链接即可得到";
				} else {
					data+="完整保存本页面即可在与页面文件同名的文件夹下得到";
				}
				data+=(failedImages.size()>0?"其余的":"下列")+$._albumImages.length+"张图片<br/>"+$._albumImages.join("<br/>");
				var title=$(".ablum-Information .Information h1").text();
				if(agent==FIREFOX) {
					window.open("javascript:'<meta content=\"text/html; charset=UTF-8\" http-equiv=\"Content-Type\"><title>"+title+"</title>"+data+"'");
				} else if(agent==CHROME) {
					chrome.extension.sendRequest({action:"dlAlbum",data:data,title:title});
				}
			}
			$._albumImages=null;
			downLink.text("下载当前页图片");
			$(".photo-list span.img a,table.photoList td.photoPan>a").attr({down:null})
		};
	});
};

//自动检查新鲜事更新
function autoRefreshFeeds(interval,feedFilter) {
	if(!$cookie("id")) {
		return;
	}
	if(location.hostname=="www.renren.com" && location.pathname.match("/[Hh]ome.do")) {
		// 记录下最新更新的一条
		if($("#feedHome").heirs()>0) {
			localStorage.setItem("xnr_feed",$("#feedHome > li").get().id);
		}
	}
	setInterval(function() {
		// 应该用post，不过get也行
		$get("http://www.renren.com/feedretrieve.do?p=0",function(url,html) {
			try {
				var r=html.split("##@L#");
				if(r.length<4 && !/^\d+$/.test(r[1])) {
					//回复结构变了
					$("#xnr_feed").remove();
					return;
				}
				// 获取新鲜事列表
				var feedList=$node("ul").style("display","none").inner(r[0].replace(/onload=".*?"/g,"").replace(/<script.*?<\/script>/g,"").replace(/src="http:\/\/s\.xnimg\.cn\/a\.gif"/g,"").replace(/lala=/g,"src="));
				// 滤除被屏蔽的新鲜事类型
				for(var i=feedList.heirs()-1;i>=0;i--) {
					var feedType=getFeedType(feedList.child(i));
					if(feedType && feedFilter[feedType]) {
						feedList.child(i).remove();
					}
				}
				if(feedList.heirs()==0) {
					return;
				}
				// 已读的最新新鲜事ID
				var feedId=localStorage.getItem("xnr_feed");
				if(feedId=="") {
					// 如果为空，则认为所有新鲜事都读了。。。
					feedId=feedList.first().attr("id");
					localStorage.setItem("xnr_feed",feedId);
				}
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
					localStorage.setItem("xnr_feed",feedList.first().attr("id"));
				}

				var tips=$("#wpiroot div.m-chat-button-notifications div.chat-conv");
				// 有校内通栏的情况
				if(tips.size()>0) {
					//添加提醒
					var node=tips.first();
					if(node.text().indexOf('无新提醒')!=-1) {
						node.attr("class","notifyitem hide");
					}
					node=null;

					for(var i=feedCount-1;i>=0;i--) {
						var feed=$node("div").attr("class","notifyitem");
						var feedInfo=feedList.child(i);
						//图标
						var icon=feedInfo.find("a.avatar img").attr("lala") || feedInfo.find("a.avatar img").attr("src");
						$node("div","<img src='"+icon+"' style='height:16px;width:16px;float:left' />").appendTo(feed);
						//关闭按钮
						$node("div").attr("class","close").listen("click",function(evt) {
							var obj=$(evt.target).parent();
							var pnode=obj.parent();
							obj.remove();
							if(pnode.heirs()==1) {
								pnode.first().attr("class","notifyitem");
							}
						}).appendTo(feed);
						//内容
						$node("div","新鲜事："+feedInfo.child(1).inner()).attr("class","notifybody").appendTo(feed);
						feed.attr("onmouseover","this.className=\"notifyitem hover\";").attr("onmouseout","this.className=\"notifyitem\";").prependTo(tips);
					}
					//增加提醒计数
					var count=$("#wpiroot .m-chat-msgcount");
					if(count.size()>0) {
						count.inner((parseInt(count.text())+feedCount).toString()).attr("class","m-chat-msgcount");
					}
					return;
				}
				// 无校内通栏，或结构有变
				var feed=$("#xnr_feed");
				if(feed.size()==0) {
					feed=$node("div").attr({style:"position:fixed;bottom:10px;right:20px;width:200px;z-index:100000;padding:5px;background-color:#E5E5E5;opacity:0.85;border:#000000 double 3px;-moz-border-radius:5px;",id:"xnr_feed"}).append($node("div","<span style='color:red;'>您有新的新鲜事</span><a style='float:right;' onclick='document.body.removeChild(document.getElementById(\"xnr_feed\"));'>关闭</a>")).append($node("div").style({maxHeight:"100px",width:"100%",overflowY:"auto"}).append($node("ul"))).appendTo(document.body);
				}
				feed=feed.find("ul");
				if(feed.heirs()>0) {
					feed.last().style("borderBottom","1px solid");
				}
				for(var i=0;i<feedCount;i++) {
					feed.append($node("li",feedList.child(i).child(1).inner().replace(/^ +| +$/,"")).attr("style","padding-top:5px;padding-bottom:5px;border-bottom:1px solid"));
				}
				feed.last().style("borderBottom","");
			} catch(err) {
				$error("autoRefreshFeeds::$get",err);
			}
		});
	},interval*1000);
};

// 在首页时刷新新鲜事列表
function autoReloadFeeds(interval) {
	$node("script",'setInterval(function(){XN.page.home.feedFilter.load(XN.page.home.feedFilter.currentFeed)},'+interval*1000+')').appendTo(document.body);
};

//检查更新
function checkUpdate(manualCheck,checkLink,pageLink,scriptLink,last) {
	//last="2000-1-1";
	var today=new Date();
	if(!last) {
		last=today;
	} else {
		last=new Date(last);
	}
	//一天只检查一次
	if(!manualCheck && (today-last)<3600000*24) {
		return;
	}
	if(manualCheck) {
		$("#manualCheck").attr({disabled:"disabled",value:"检查中..."});
	}
	$get(checkLink,function(url,html) {
		try {
			var miniver=(/@miniver[ \t]+(\d+)/.exec(html) || ["","0"])[1];
			var ver=(/@version[ \t]+([0-9\.]+)/.exec(html) || ["","未知"])[1];
			if(parseInt(miniver)>XNR.prototype.miniver) {
				var pop=$popup("update",null,'<div style="color:black"><div>人人网改造器已有新版本：<br/>'+ver+' ('+miniver+')</div><div class="links" style="padding-top:5px;padding-bottom:5px;float:right"><a target="_blank" href="'+scriptLink+'">安装</a><b> </b><a target="_blank" href="'+pageLink+'">去看看</a></div></div>',null,30,5);
				pop.find(".links a").listen("click",function() {
					pop.remove();
				});
			} else if(manualCheck) {
				// 手动点击检查更新按钮时要弹出提示
				alert("最新版本为："+ver+" ("+miniver+")\n当前版本为："+XNR.prototype.version+" ("+XNR.prototype.miniver+")\n\n无须更新");
			}
			if(manualCheck) {
				$("#manualCheck").attr({disabled:null,value:"立即检查"});
			}
			$save("lastUpdate",today.toString());
			$("body>div.xnr_op #lastUpdate").text(today.format("yyyy-MM-dd HH:mm:ss"));
		} catch(err) {
			$error("checkUpdate::$get",err);
		}
	});
};

// 自动升级后提示。用于Chrome
function updatedNotify(lastVer) {
	if(lastVer==0) {
		// 首次运行。。？
		$save("lastVersion",XNR.prototype.miniver);
	} else if(lastVer<XNR.prototype.miniver) {
		setTimeout(function() {
			$popup("updated",null,'<div style="color:black">人人网改造器已经更新到:<br/>'+XNR.prototype.version+' ('+XNR.prototype.miniver+')</div><div><a href="http://code.google.com/p/xiaonei-reformer/source/browse/trunk/Release.txt" style="padding-top:5px;padding-bottom:5px;float:right" target="_blank">查看更新内容</a></div>',null,15,5);
		},0);
		$save("lastVersion",XNR.prototype.miniver);
	}
};

(function() {
	try {
		// 不在内容可以编辑的frame中运行，也不在body无id无class的frame中运行
		if (self != window.top && (document.designMode=="on" || (!document.body.id && !document.body.className) || document.body.className=="pages")) {
			return;
		}
		// 各种选项
		var options=new Object;
		// 各个功能的执行函数。分四个优先级
		var funcs=new Array(new Object,new Object,new Object,new Object);
		// 各个功能的事件触发器
		var triggers=new Array;
		// 生成的选项代码
		var detailHTML="";
		var categoryHTML="";
		// 解析选项函数
		var parseDetail=function(o,p) {
			try {
				// 功能计数，用于GROUPx中换行
				var index=-1;
				for(var op in o) {
					// 不支持当前浏览器
					if(o[op].agent && (o[op].agent & agent)==0){
						continue;
					}
					index++;
					// 处理GROUPx
					if(op.match(/^GROUP[0-9]*$/)) {
						if(o[op].text!=null) {
							detailHTML+="<div>"+o[op].text+"<br/>";
						}
						detailHTML+="<table><tbody>";
						parseDetail(o[op].list,o[op]);
						detailHTML+="</tbody></table></div>";
						continue;
					}
					// 对应的选项名和值
					if(o[op].value!=null) {
						options[op]=o[op].value;
					}
					if(o[op].ctrl) {
						options[o[op].ctrl.option]=o[op].ctrl.value;
					}

					// 是否限制了页面
					if((!o[op].page || location.href.match(o[op].page)) || (!o[op].page && (!p || !p.page || location.href.match(p.page)))) {
						// 对应的函数
						for(var i=0;i<4;i++) {
							if(o[op]["fn"+i]) {
								(funcs[i])[op]={fn:o[op]["fn"+i],argus:o[op]["argus"+i]};
							} else if (p && p["fn"+i]) {
								// 继承父项目（GROUP）的函数
								(funcs[i])[op]={fn:p["fn"+i],argus:o[op]["argus"+i]};
							}
						}
						// 有事件触发器
						if(o[op].trigger) {
							for(var i in o[op].trigger) {
								triggers.push([op,o[op].trigger[i]]);
							}
						}
					}
					// 有父项目，为GROUP中的
					if(p) {
						if(index%p.columns==0) {
							detailHTML+="<tr>"
						}
						detailHTML+="<td>";
						// 继承父项目的属性
						o[op].style+=p.style || "";
						o[op].type=o[op].type || p.type;
					}
					switch(o[op].type || "checkbox") {
						case "checkbox":
							detailHTML+="<div><input style=\""+o[op].style+"\" type=\"checkbox\" title=\""+(o[op].info || "")+"\" id=\""+op+"\"/><label title=\""+(o[op].info || "")+"\" for=\""+op+"\">"+o[op].text+"</label></div>";
							break;
						case "checktext":
							detailHTML+="<div><input style=\""+o[op].style+"\" type=\"checkbox\" title=\""+(o[op].info || "")+"\" id=\""+op+"\" onclick=\"document.getElementById('"+o[op].ctrl.option+"').disabled=(this.checked?null:'disabled')\"/><label title=\""+(o[op].info || "")+"\" for=\""+op+"\">";
							detailHTML+=o[op].text.replace("@@","</label>&nbsp;<input type=\"input\" title=\""+(o[op].info || "")+"\" id=\""+o[op].ctrl.option+"\" style=\""+(o[op].ctrl.style || "")+"\" verify=\""+(o[op].ctrl.verify || "")+"\" failInfo=\""+(o[op].ctrl.failInfo || "")+"\"/>&nbsp;<label title=\""+(o[op].info || "")+"\" for=\""+op+"\">");
							detailHTML+="</label>";
							if(o[op].warn) {
								detailHTML+=" <input type=\"image\" title=\""+o[op].warn+"\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1ElEQVQ4y2NgoCVYz8BgsJyBwYQszUCNsv8ZGP6D8FIGBlWSDYBphmGSNC9jYNAGabqUkvL/cmYm2IAlDAympNsOA6S4YjUDgxVI8dX8fLj+6+XlYAPWsbB4kGQ7hMtAvCvWsrN7gxRdq6jAMOBWSwvYgE1sbJFE+x3FBUiuaGBgYMKp+Xpz839c4P7UqWA1QJfmomgGmYgR8thcgOSKmQwMrBi23+js/E8IPJ47FyNAudBTHbEY7gJjBgbdDgaG7k4GhqmEcDcDw2Qg7ogA5hWq5FgAlMwfVWL5pDoAAAAASUVORK5CYII%3D\"/>";
							}
							detailHTML+="</div>";
							break;
						case "text":
							detailHTML+="<div>";
							detailHTML+=o[op].text.replace("@@","&nbsp;<input type=\"input\" title=\""+(o[op].info || "")+"\" id=\""+op+"\" style=\""+(o[op].style || "")+"\" verify=\""+(o[op].verify || "")+"\" failInfo=\""+(o[op].failInfo || "")+"\"/>&nbsp;");
							detailHTML+="</div>";
							break;
						case "checkedit":
							detailHTML+="<div><input style=\""+o[op].style+"\" type=\"checkbox\" title=\""+(o[op].info || "")+"\" id=\""+op+"\" onclick=\"document.getElementById('"+o[op].ctrl.option+"').disabled=(this.checked?null:'disabled')\"/><label title=\""+(o[op].info || "")+"\" for=\""+op+"\">"+o[op].text+"</label></div>";
							detailHTML+="<div><textarea id=\""+o[op].ctrl.option+"\" title=\""+(o[op].info || "")+"\" style=\""+(o[op].ctrl.style || "")+";resize:none\"></textarea></div>";
							break;
						case "label":
							detailHTML+="<div title=\""+(o[op].info || "")+"\">"+o[op].text.replace("@@","<span style=\""+o[op].style+"\" title=\""+(o[op].info || "")+"\" id=\""+op+"\"></span>")+"</div>";
							break;
						case "button":
							detailHTML+="<div title=\""+(o[op].info || "")+"\"><input type=\"button\" info=\""+(o[op].info || "")+"\" id=\""+op+"\" value=\""+o[op].text+"\"/></div>";
							break;
						case "subcheck":
							detailHTML+="<div style=\"padding-left:16px;display:table-cell\"><input style=\""+o[op].style+"\" type=\"checkbox\" title=\""+(o[op].info || "")+"\" id=\""+op+"\"/><label title=\""+(o[op].info || "")+"\" for=\""+op+"\">"+o[op].text+"</label></div>";
							break;
					}
					if(p) {
						detailHTML+="</td>";
						if((index+1)%p.columns==0) {
							detailHTML+="</tr>"
						}
					}
				}
			} catch(err) {
				$error("parseDetail",err);
			}
		};
		// 解析功能函数参数
		var parseArguments=function(o) {
			for(var i in o) {
				var arg=o[i];
				switch(typeof arg) {
					case "string":
						if(/^@/.test(arg)) {
							// 以@开头的是选项的值
							o[i]=options[arg.substring(1)];
						}
						break;
					case "object":
						parseArguments(arg);
						break;
				}
			}
		};
		// 执行各项功能函数
		var exec=function() {
			for(var i=0;i<4;i++) {
				var fns=funcs[i];
				for(var fn in fns) {
					try {
						if(!(options[fn]===true)) {
							continue;
						}
						var argus=fns[fn].argus;
						if(argus) {
							for(var t=0;t<argus.length;t++) {
								parseArguments(argus[t]);
								(fns[fn].fn)(argus[t][0],argus[t][1],argus[t][2],argus[t][3],argus[t][4]);
							}
						} else {
							(fns[fn].fn)();
						}
					} catch(err) {
						$error(fn,err);
					}
				}
			}
		};
		var createTriggers=function() {
			var existTrigger=[];
			for(var i in triggers) {
				if(!(options[triggers[i][0]]===true)) {
					continue;
				}
				var trigger=triggers[i][1];
				if(trigger.argus) {
					for(var c in trigger.argus) {
						for(var j=0;j<trigger.argus[c].length;j++) {
							// @@的是event对象
							// 以@开头的是选项的值
							if(/^@/.test(trigger.argus[c][j]) && "@@"!=trigger.argus[c][j]) {
								trigger.argus[c][j]=options[trigger.argus[c][j].substring(1)];
							}
						}
					}
				}
				// 设置对应触发器序号
				var target=$(trigger.target);
				var index=target.attr("tidx") || "";
				index+=i+",";
				target.attr("tidx",index);
				// 对于同一对象的同一事件，只建立一个listener
				if(!existTrigger[trigger.target+trigger.evt]) {
					existTrigger[trigger.target+trigger.evt]=true;
					target.listen(trigger.evt,function(evt) {
						var tidx;
						switch(evt.type) {
							case "click":
								tidx=evt.target.getAttribute("tidx");
								break;
							case "DOMNodeInserted":
								tidx=evt.relatedNode.getAttribute("tidx");
								break;
						}
						if(!tidx) {
							return;
						}
						tidx=tidx.substring(0,tidx.length-1).split(",");
						for(var i in tidx) {
							var t=triggers[parseInt(tidx[i])][1];
							if(t.evt==evt.type) {
								var argus=t.argus;
								if(argus) {
									for(var j in argus) {
										for(var k in argus[j]) {
											if(argus[j][k]=="@@") {
												argus[j][k]=evt;
											}
										}
										(t.fn)(argus[j][0],argus[j][1],argus[j][2],argus[j][3],argus[j][4]);
									}
								} else {
									t.fn();
								}
							}
						}
					});
				}
			}
		};
		// 创建选项菜单
		var buildMenu=function() {
			var nav=$(".nav-body .nav-other");
			if(nav.size()!=1) {
				return;
			}

			var menu=$node("div").attr("class","xnr_op").style("display","none");
			var html="";
			// 选项菜单的样式
			html+='<style type="text/css">.xnr_op{width:500px;left:50%;margin-left:-225px;position:fixed;z-index:200000;color:black}.xnr_op *{padding:0;margin:0;border-collapse:collapse}.xnr_op>table{width:100%}.xnr_op .tl{border-top-left-radius:8px;-moz-border-radius-topleft:8px}.xnr_op .tr{border-top-right-radius:8px;-moz-border-radius-topright:8px}.xnr_op .bl{border-bottom-left-radius:8px;-moz-border-radius-bottomleft:8px}.xnr_op .br{border-bottom-right-radius:8px;-moz-border-radius-bottomright:8px}.xnr_op .border{height:10px;overflow:hidden;width:10px;background-color:black;opacity:0.5}.xnr_op .title {padding:4px;display:block;background:#3B5998;color:white;text-align:center;font-size:12px}.xnr_op .btns{background:#F0F5F8;text-align:right}.xnr_op .btns>input{border-style:solid;border-width:1px;padding:2px 15px;margin:3px;font-size:13px}.xnr_op .ok{background:#5C75AA;color:white;border-color:#B8D4E8 #124680 #124680 #B8D4E8}.xnr_op .cancel{background:#F0F0F0;border-color:#FFFFFF #848484 #848484 #FFFFFF}.xnr_op .c{background:#FFFFF4}.xnr_op .options>table{height:280px;border-spacing:0}.xnr_op .c td{vertical-align:top}.xnr_op .category{width:119px;min-width:119px;border-right:1px solid #5C75AA}.xnr_op li{list-style-type:none}.xnr_op .pages{width:360px}.xnr_op .category li{cursor:pointer;height:30px;overflow:hidden}.xnr_op .category li:hover{background:#ffffcc;color:black}.xnr_op li.even{background:#EEEEEE}.xnr_op li.selected{background:#748AC4;color:white}.xnr_op .category span{left:10px;position:relative;font-size:14px;line-height:30px}.xnr_op .pages>div{overflow:auto;height:280px;padding:10px}.xnr_op .pages>div>*{margin-bottom:5px;width:100%;table-layout:fixed}.xnr_op .pages>div>div>table{width:100%;table-layout:fixed;margin-left:5px}.xnr_op .pages tr{line-height:20px}.xnr_op label{color:black;font-weight:normal}.xnr_op .pages .default{text-align:center}.xnr_op .pages .default table{height:95%}.xnr_op .pages .default td{vertical-align:middle}.xnr_op .pages .default td>*{padding:5px}</style>';
			html+='<table><tbody><tr><td class="border tl"></td><td class="border" style="width:430px"></td><td class="border tr"></td></tr><tr><td class="border"></td><td class="c"><div class="title">改造选项</div><div class="options"><table><tbody><tr><td class="category"><ul>';
			html+=categoryHTML;
			html+='</ul></td><td class="pages"><div class="default"><table><tbody><tr><td><h1>人人网改造器</h1><p><b class="ver"></b></p><p><b>Copyright © 2008-2010</b></p><p><a href="mailto:xnreformer@gmail.com">xnreformer@gmail.com</a></p><p><a href="http://xiaonei-reformer.googlecode.com/" target="_blank">项目主页</a></p></td></tr></tbody></table></div>';
			html+=detailHTML;
			html+='</td></tr></tbody></table></div><div class="btns"><input type="button" value="确定" class="ok"/><input type="button" value="取消" class="cancel"/></div></td><td class="border"></td></tr><tr><td class="border bl"></td><td class="border"></td><td class="border br"></td></tr></tbody></table>';
			menu.inner(html).appendTo(document.body);
			// 设置选项的值
			for(var option in options) {
				var ctrl=menu.find("#"+option);
				switch(ctrl.prop("tagName")) {
					case "SPAN":
						var d=new Date(options[option]);
						if(!isNaN(d)) {
							// 时间格式
							ctrl.text(d.format("yyyy-MM-dd HH:mm:ss"));
						} else {
							ctrl.text(options[option]);
						}
						break;
					case "INPUT":
						switch(ctrl.prop("type")) {
							case "checkbox":
								ctrl.prop("checked",options[option]);
								break;
							case "button":
								break;
							default:
								ctrl.prop("value",options[option]);
								// 如果是单纯的INPUT，将会将它自己设为可用
								ctrl.prop("disabled",options[ctrl.parent().first().attr("id")]?null:"disabled");
								break;
						}
						break;
					case "TEXTAREA":
						ctrl.prop("value",options[option]);
						ctrl.prop("disabled",options[ctrl.parent().previous().first().attr("id")]?null:"disabled");
						break;
				}
			}
			// 点击分类切换事件
			menu.find(".category ul").listen("click",function(evt) {
				var t=evt.target;
				if(t.tagName=="LI") {
					t=t.firstElementChild;
				}
				$(".xnr_op .pages>div").hide();
				$(".xnr_op .pages>div."+t.id).show();
				$(".xnr_op .category li.selected").removeClass("selected");
				$(t).parent().addClass("selected");
			});
			menu.find(".ver").text(XNR.prototype.version+" ("+XNR.prototype.miniver+")");
			menu.find("input.ok").listen("click",function() {
				var checkPass=true;
				// 开始验证
				$("body>.xnr_op *[verify]:not([disabled])").each(function(index,elem) {
					if(!elem.value.match(elem.getAttribute("verify"))) {
						var page=$(elem);
						while(page.parent().prop("className")!="pages") {
							page=page.parent();
						}
						// 切换到有错的项
						$(".xnr_op .pages>div").hide();
						$(".xnr_op .pages>div."+page.attr("class")).show();
						$(".xnr_op .category li.selected").removeClass("selected");
						$(".xnr_op .category #"+page.attr("class")).parent().addClass("selected");
						alert(elem.getAttribute("failInfo"));
						elem.focus();
						checkPass=false;
						return false;
					}
				});
				if(!checkPass) {
					return;
				}
				var content=$("body>.xnr_op td.pages");
				for(var option in options) {
					var ctrl=content.find("#"+option);
					if(ctrl.prop("disabled")) {
						continue;
					}
					switch(ctrl.prop("tagName")+(ctrl.attr("type") || "")) {
						case "INPUTcheckbox":
							$save(option,ctrl.prop("checked"));
							break;
						case "INPUTinput":
							$save(option,ctrl.prop("value"));
							break;
						case "TEXTAREA":
							$save(option,ctrl.prop("value"));
							break;
					}
				}
				$("body>.xnr_op").hide();
				location.reload();
			});
			menu.find("input.cancel").listen("click",function() {
				$("body>.xnr_op").hide();
			});

			nav.prepend($node("div","<div class=\"menu-title\"><a onclick=\"return false\" href=\"#nogo\">改造</a></div>").attr("class","menu"));
			nav.first().find("a").listen("click",function(evt) {
				try {
					var menu=$("body>.xnr_op");
					menu.show();
					menu.style("top",parseInt(window.innerHeight-menu.prop("offsetHeight"))/2+"px");
				} catch (err) {
					$error("menu:show",err);
				}
			});
		};

		// 建立图片缓存
		imgCache=$parse(localStorage.getItem("xnr_cache"));
		for(var id in imgCache) {
			if(imgCache[id].life<=0) {
				delete imgCache[id];
			} else {
				imgCache[id].life--;
			}
		};
		// 清除新鲜事ID
		localStorage.setItem("xnr_feed",null);
		// 解析选项，生成选项列表、执行函数列表和选项菜单
		var i=0;
		for(var category in XNR.prototype.options) {
			if(((XNR.prototype.options[category].agent || agent)& agent)!=agent) {
				continue;
			}
			i++;
			categoryHTML+="<li class=\""+["even","odd"][i%2]+"\"><span id=\""+category+"\">"+XNR.prototype.options[category].category+"</span></li>";
			detailHTML+="<div class=\""+category+"\" style=\"display:none\">";
			parseDetail(XNR.prototype.options[category].detail);
			detailHTML+="</div>";
		}
		//先获取已经保存的选项再执行
		if(agent==FIREFOX) {
			//Firefox
			for(var option in options) {
				options[option]=GM_getValue(option,options[option]);
			}
			exec();
			buildMenu();
			createTriggers();
		} else if(agent==CHROME) {
			//Chrome/Chromium 插件
			chrome.extension.sendRequest({action:"get"}, function(response) {
				for(var i in response.data) {
					options[i]=response.data[i];
				}
				exec();
				setTimeout(function(){buildMenu();createTriggers();},200);
			});
		}
	} catch(err) {
		$error("init",err);
		return;
	}
})();
