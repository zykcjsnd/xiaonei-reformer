// ==UserScript==
// @name           校内人人网改造器 Xiaonei Reformer Exp
// @namespace      Xiaonei_reformer
// @include        http://renren.com/*
// @include        http://*.renren.com/*
// @include        https://renren.com/*
// @include        https://*.renren.com/*
// @match          http://renren.com/*
// @match          http://*.renren.com/*
// @match          https://renren.com/*
// @match          https://*.renren.com/*
// @run-at         document-end
// @description    为人人网（renren.com，原校内网xiaonei.com）清理广告、新鲜事、各种烦人的通告，删除页面模板，恢复旧的深蓝色主题，增加更多功能。。。
// @version        2.0.0.20100113
// @version2       200
// @author         xz
// ==/UserScript==

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
	// 脚本版本，供自动更新用，对应header中的@version2
	version:200,
	// 选项列表
	// 每一项存在如下可能的参数：
	// text:文字描述
	// type:类型。有项目分组group，复选框checkbox，标签label，文本框text，文本区域edit，默认为checkbox。
	// columns:显示的列数。仅当type为group时有效。
	// items:包含的项目。仅当type为group时有效
	// info:鼠标悬停提示。
	// value:默认值。
	// fnX:X为0~3，代表优先级，0最高。功能对应的函数。
	// argusX:fnX的参数列表。按以下格式[[参数1-1,参数1-2,...],[参数2-1,参数2-2],...]，表示执行多次fnX以及每次的参数，
	// 每次的参数不超过4个，如果参数是其他选项的值，使用"@选项名"。
	options:{
		cleanup:{
			text:"清理页面",
			type:"group",
			columns:2,
			items:{
				removeAds:{
					text:"清除广告",
					value:true,
					fn0:removeAds},
				removeStarReminder:{
					text:"去除升级为星级用户提示",
					value:true,
					fn1:removeStarReminder},
				removeMusicPlayer:{
					text:"去除音乐播放器",
					value:true,
					fn1:removeMusicPlayer},
				removePageTheme:{
					text:"去除页面主题模板",
					value:true,
					fn0:removePageTheme},
				removeBlogTheme:{
					text:"去除日志信纸",
					value:true,
					fn0:removeBlogTheme},
				removeXntBar:{
					text:"去除校内通栏",
					value:false,
					fn1:removeXntBar},
				removePageTopNotice:{
					text:"去除首页顶部通知",
					value:true,
					fn1:removePageTopNotice},
				removeNewStar:{
					text:"去除人气之星/新人栏",
					value:true,
					fn1:removeNewStar},
				removePaintReminder:{
					text:"去除装扮主页提示",
					value:true,
					fn1:removePaintReminder},
				removeRenRenSurvey:{
					text:"去除边栏：人人网调查",
					value:true,
					fn1:removeRenRenSurvey},
				removeCommonPage:{
					text:"去除边栏：公共主页推荐",
					value:false,
					fn1:removeCommonPage},
				removeFriendGuide:{
					text:"去除边栏：寻找/邀请朋友"},
					value:false,
					fn1:removeFriendGuide,
				removeCommendation:{
					text:"去除边栏：推荐/礼物",
					value:false,
					fn1:removeCommendation},
				limitHeadAmount:{
					text:"限制头像列表中头像数量",
					value:true,
					fn1:limitHeadAmount,
					argus1:[["@headAmount"]]},
			}
		},
		hideRequest:{
			text:"隐藏请求",
			type:"group",
			columns:2,
			items:{
				removeAppRequest:{
					text:"去除应用请求提示",
					value:false},
				removeEventRequest:{
					text:"去除活动邀请提示",
					value:false},
				removeNoticeRequest:{
					text:"去除通知提示",
					value:false},
				removePollRequest:{
					text:"去除投票邀请提示",
					value:false},
				removeGameRequest:{
					text:"去除游戏邀请提示",
					value:false}
			}
		},
		sweepFeeds:{
			text:"清理新鲜事",
			type:"group",
			columns:5,
			items:{
				removeBlogFeed:{
					text:"日志",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iBlog"]]},
				removePollFeed:{
					text:"投票",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iPoll"]]},
				removeAppFeed:{
					text:"应用",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iApp"],["@markFeedAsRead","iSanguo"],["@markFeedAsRead","iMyj"]]},
				removeActFeed:{
					text:"活动",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iActs"]]},
				removeStatusFeed:{
					text:"状态",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iStatus"]]},
				removeGiftFeed:{
					text:"礼物",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iGift"]]},
				removeFriendFeed:{
					text:"交友",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iFriend"]]},
				removeImageFeed:{
					text:"照片",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iPhoto","相册"]]},
				removeImageTagFeed:{
					text:"圈人",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iPhoto","圈人"]]},
				removeProfileFeed:{
					text:"头像",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iProfile"]]},
				removeCommentFeed:{
					text:"评论",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iPost"]]},
				removeClassFeed:{
					text:"班级",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iClass"]]},
				removeShareFeed:{
					text:"分享",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iShare"]]},
				removeVipFeed:{
					text:"VIP",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iVip"]]},
				removeFilmFeed:{
					text:"影评",
					value:false,
					fn1:removeFeeds,
					argus1:[["@markFeedAsRead","iFilm"]]}
			}
		},
		reform:{
			text:"改造界面",
			type:"group",
			columns:1,
			items:{
				addNavBarItem:{
					text:"增加导航栏项目",
					value:true,
					fn2:addNavBarItem,
					argus2:[["@navExtraContent"]]},
				widenNavBar:{
					text:"加宽导航栏",
					value:true,
					fn2:widenNavBar},
				recoverOriginalTheme:{
					text:"使用早期的深蓝色主题（不会处理有模板的页面）",
					value:true,
					fn0:recoverOriginalTheme},
				showImagesInOnePage:{
					text:"相册所有图片在一页中显示",
					value:true,
					fn3:showImagesInOnePage},
				removeFontRestriction:{
					text:"去除页面的字体限制",
					value:false,
					fn2:removeFontRestriction}
			}
		},
		patch:{
			text:"修正界面错误",
			type:"group",
			columns:1,
			items:{
				fixNavHeight:{
					text:"修正导航栏项目位置显示错误",
					value:true,
					info:"在Linux下某些版本的Firefox中，可能会出现导航栏上的项目位置显示偏下的错误。如果您遇到这个问题，请启用此功能。",
					fn2:$patchCSS,
					argus2:[[".navigation .menu-title{line-height:35px}"]]},
				fixClubContent:{
					text:"修正论坛帖子排版错误",
					value:true,
					info:"在Linux下某些版本的Firefox中，可能会出现论坛的帖子正文偏右的错误。如果您遇到这个问题，请启用此功能。",
					fn2:$patchCSS,
					argus2:[["#articlehome .content{overflow:visible}"]]}
			}
		},
		enhancement:{
			text:"功能增强",
			type:"group",
			columns:1,
			items:{
				hideFeedContent:{
					text:"隐藏新鲜事具体内容",
					value:false,
					fn2:hideFeedContent},
				flodStatusComment:{
					text:"收起新鲜事回复",
					value:true,
					fn3:flodStatusComment},
				addExtraEmotions:{
					text:"增加额外的表情项",
					value:true,
					fn2:addExtraEmotions},
				addFloorCounter:{
					text:"为评论增加楼层计数",
					value:true,
					fn2:addFloorCounter},
				showImageOnMouseOver:{
					text:"在鼠标经过图片时显示大图",
					value:true,
					fn3:showImageOnMouseOver},
				useWhisper:{
					text:"默认使用悄悄话",
					value:true,
					fn3:useWhisper},
				showMatualFriends:{
					text:"显示共同好友",
					value:true,
					fn3:showMatualFriends},
				removeFriendRestriction:{
					text:"去除特别好友修改限制",
					info:"允许非星级用户修改特别好友",
					value:true,
					fn2:removeFriendRestriction},
				removeNicknameRestriction:{
					text:"去除昵称修改限制",
					info:"允许非星级用户修改个人信息中的昵称",
					value:true,
					fn3:removeNicknameRestriction}
			}
		},
		misc:{
			text:"其他",
			type:"group",
			columns:1,
			items:{
				markFeedAsRead:{
					text:"把不需要的新鲜事设为已读",
					value:false},
				navExtraContent:{
					text:"导航栏新增项内容",
					type:"edit",
					value:"论坛\nhttp://club.renren.com/"},
				headAmount:{
					info:"限制头像列表中头像显示最大数量，不会影响到共同好友列表",
					type:"input",
					value:12}
			}
		}
	/* TODO:
	//功能增强
	checkUpdate:				{value:true,	fn:checkUpdate,					text:"自动检查脚本更新"},
	autoRefreshFeeds:			{value:true,	fn:autoRefreshFeeds,			text:"自动检查新鲜事更新"},
	lastUpdate:					{value:"",		fn:null,					text:""},
	pageLink:					{value:"http://userscripts.org/scripts/show/45836",	fn:null,	text:""},
	scriptLink:					{value:"http://userscripts.org/scripts/source/45836.user.js",	fn:null,	text:""},
	checkFeedInterval:			{value:60,		fn:null,			text:"新鲜事检查间隔："},
	*/
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
				elem.style.display="block";
			} catch(err) {
			}
		});
		return this;
	},
	// 遍历对象的DOM节点，参数为一回调函数，function(index,elem){}，返回false终止遍历;
	each:function(func) {
		if(typeof func == "function") {
			for(i in this.domNodes) {
				if(func(i,this.domNodes[i])===false) {
					break;
				}
			}
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
	firstChild:function() {
		try {
			return XNR(this.get().firstElementChild);
		} catch(err) {
			return null;
		}
	},
	// 获取对象第一个DOM节点的最后一个子节点(经XNR对象包装)
	lastChild:function() {
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
			return this.get().children.length;
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
			} else if (pos>node.children.length) {
				pos=node.children.length;
			}
			if(o instanceof XNR) {
				o.each(function(index,elem) {
					xhr.insert(elem,pos);
					pos++;
				});
			} else if(o.nodeType==1){
				if(pos==node.children.length) {
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
	filter:function(str) {
		var res=new Array();
		this.each(function(index,elem) {
			if(elem.querySelector(str)) {
				res.push(elem);
			}
		});
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
				for(n in o) {
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
	// 执行一些操作
	doing:function(func) {
		if(typeof func=="function") {
			func(this);
		}
		return this;
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
			}
		});
		return this;
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
 * 读取/设置选项
 * name: 选项名
 * value: 选项值（此值为空表示读取操作，否则为写入）
 * return: 返回选项值
 */
/* TODO useless
function $option(name,value) {
	return true;
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
				// Chrome/Chromium
				chrome.extension.sendRequest({action:"set",name:name,value:value});
			} catch(err) {
				try {
					localStorage.setItem(name,JSON.stringify(value));
				} catch(err) {
					$error("$option",err);
					return null;
				}
			}
		}
		return value;
	}
};
*/
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
		GM_xmlhttpRequest({method:"GET",url:url,onload:function(o){if(o.status==200){func(url,o.responseText,userData);}}});
	} catch(err) {
		try {
			var httpReq= new XMLHttpRequest();
    		httpReq.onreadystatechange=function(evt){if(httpReq.readyState==4 && httpReq.status==200){func(url,httpReq.responseText,userData);}};
		    httpReq.open("GET",url,true);
			//httpReq.setRequestHeader("Cache-Control","no-cache");
    		httpReq.send(null);
		} catch(err) {
			$error("$get",err);
		}
	}
};
// 图片缓存
var imgCache=localStorage.getItem("xnr_cache");
imgCache=imgCache?JSON.parse(imgCache):{};
for(id in imgCache) {
	if(imgCache[id].life<=0) {
		imgCache[id]=undefined;
	} else {
		imgCache[id].life--;
	}
};

var $=XNR;

//清除广告
function removeAds() {
	$(".ad-bar", ".banner", ".adimgr", ".blank-holder", ".blank-bar", ".renrenAdPanel", ".side-item.template").remove();
	$("#sd_ad", "#showAD", "#huge-ad", "#rrtvcSearchTip", "#top-ads", "#bottom-ads", "#main-ads").remove();
	// 混迹于新鲜事中的广告
	$("ul#feedHome > li").filter("a.dark[href^='http://post.renren.com/click.do?']").remove();
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
	// 修复Logo
	var logo=$("img[src*='viplogo-renren.png']").attr({height:null,width:null}).doing(function(xhr) {
		if(xhr.size()>0) {
			xhr.attr("src",xhr.attr("src").replace("viplogo-renren.png","logo-renren.png"));
		}
	});
	// 删除公共主页模板
	$("#themeLink").remove();
};

// 删除日志主题模板
function removeBlogTheme() {
	if(location.host=="blog.renren.com") {
		$("head style").each(function(index,elem) {
			var xhr=$(elem);
			if(xhr.text().indexOf(".text-article")!=-1) {
				xhr.remove();
				return false;
			}
		});
	}
};

//移除校内通栏
function removeXntBar() {
	$("#wpiroot","#imengine").remove();
};

//移除页面顶部通知
function removePageTopNotice() {
	$(".notice-holder","#notice_system").remove();
};

//移除人气之星/新人栏
function removeNewStar() {
	$(".star-new").remove();
};

//移除装扮主页提示
function removePaintReminder() {
	$(".enter-paints").remove();
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
	$(".side-item.contact-fri",".guide-find-friend").remove();
};

//移除边栏：推荐/礼物
function removeCommendation() {
	$(".side-item.selected").remove();
};

//隐藏新鲜事或标记为已读
function removeFeeds(markFeedAsRead,feedClass,feedTag) {
	var feeds=$("ul[id='feedHome'] > li").filter(".details .legend ."+feedClass+(feedTag?"[alt='"+feedTag+"']":""));
	feeds.each(function(index,elem) {
		if(markFeedAsRead) {
			//为防止javascript被禁用导致执行onclick出错，先将其隐藏
			$(elem).hide().find("a.delete").invoke("onclick");
		} else {
			$(elem).remove();
		}
	});
};

//在导航栏上增加项目
function addNavBarItem(content) {
	if(content) {
		var nav=$("div.nav-main");
		var items=content.split("\n");
		for(i=0;i<items.length;i+=2) {
			$node("div",'<div class="menu-title"><a href="'+items[i+1]+'">'+items[i]+'</a></div>').attr("class","menu").appendTo(nav);
		}
	}
};

//加宽导航栏
function widenNavBar() {
	$patchCSS(".navigation-wrapper{width:auto} .navigation{width:auto}");
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
	css+=".stabs a.current span,.stabs a.current:hover span{background-color:"+BCOLOR+"}";
	// 上传照片页分类Tab颜色
	css+="#self-nav .selected a{background-color:"+BCOLOR+"}#self-nav .selected a:hover{background-color:"+BCOLOR+"}#self-nav li a{color:"+XCOLOR+"}";
	// 导航栏背景色
	var nav=$("div.navigation.clearfix").get();
	if(nav) {
		var bc=document.defaultView.getComputedStyle(nav,null).backgroundColor;
		if(bc=="rgb(0, 94, 172)" || bc=="transparent") {
			css+=".navigation{background:"+FCOLOR+"}";
		}
	}
	// 导航栏项目鼠标移过时的背景色
	css+=".navigation .menu-title a:hover{background-color:"+BCOLOR+"}";
	// 导航栏设置下拉菜单项目的背景色
	css+=".menu-dropdown-border > div:not(.app-actions) a:hover{background-color:"+BCOLOR+" !important}";

	// 首页左侧应用栏的背景色，回复的背景色
	css+=".statuscmtitem, .home #sidebar{background-color:"+SCOLOR+"}";

	// 主页上头像下方操作栏
	css+=".profile-actions a:hover{background-color:"+BCOLOR+"}";

	// 提交按钮的背景色
	css+=".input-button,.input-submit,.inputsubmit{background-color:"+XCOLOR+"}";

	// 分页项的鼠标移过时的背景色
	css+=".pagerpro li a:hover,#pager a:hover,.page a:hover{background-color:"+BCOLOR+"}";

	// 弹出框提交按钮背景色
	css+="td.pop_content .dialog_buttons input{background-color:"+XCOLOR+" !important}";
	// 弹出框消息的背景色
	css+="td.pop_content h2{background-color:"+BCOLOR+"}";
	// 弹出框链接的颜色
	css+="td.pop_content .dialog_body a,td.pop_content .dialog_body a:visited{color:"+BCOLOR+"}";

	// 分享框的鼠标移过时背景色
	css+=".share-actions a.share:hover{background-color:"+BCOLOR+"}";

	// 论坛导航栏的背景色
	css+="#clubheader #navigation,#clubheader #utility{background-color:"+XCOLOR+"}";

	// 用户请求中心按钮
	css+="ul.figureslist.requests button{background-color:"+XCOLOR+" !important}";

	// 好友列表中的链接背景色
	css+="#friendpage ul.actions a:hover{background-color:"+BCOLOR+"}";
	$patchCSS(css);
};

//将相册内的所有相片在一页中全部显示
function showImagesInOnePage() {
	if(location.host!="photo.renren.com" || (location.pathname!="/getalbum.do" && location.pathname!="/getalbumprofile.do" && !location.pathname.match(/\/album-[0-9]+/i))) {
		return;
	}
	var baseURL="http://photo.renren.com"+location.pathname;
	var album=$("div.photo-list");
	if(album.size()==0) {
		return;
	}
	var items=$(".number-photo");
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
	var maxPage=((photoAmount-1)/album.firstChild().heirs());
	// 当前页数
	var curPage=/[\?&]curpage=([0-9]+)/i.exec(location.href);
	if(curPage==null) {
		curPage=0;
	} else {
		curPage=parseInt(curPage[1]);
	}
	album.firstChild().attr("page",curPage);
	for(var i=0;i<=maxPage;i++) {
		if(i==curPage) {
			continue;
		}
		$get(baseURL+"?id="+albumId+"&owner="+ownerId+"&curpage="+i,function(url,res,page) {
			try {
				var photoList=/<div .*? class="photo-list clearfix".*?>([\d\D]+?)<\/div>/.exec(res)[1];
				var pos;
				if(page>parseInt(album.lastChild().attr("page"))) {
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
				album.insert($node("div",photoList).firstChild().attr("page",page),pos);
			} catch (err) {
				$error("showImagesInOnePage::$get",err);
			}
		},i);
	}
	$("ol.pagerpro").remove();
};

//去除页面字体限制
function removeFontRestriction() {
	$patchCSS("*{font-family:none !important}");
};

//隐藏新鲜事内容
function hideFeedContent() {
	$patchCSS("ul.richlist.feeds li div.content{display:none;}");
};

//收起新鲜事回复
function flodStatusComment() {
	$("#feedHome .details .legend a[id*='reply']").each(function(index,elem) {
		var a=$(elem);
		if(a.heirs()==0) {
			a.invoke("onclick");
		}
	});
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
		{e:"(hh)",		t:"圣诞花环",		s:"/imgpro/icons/statusface/garland.gif"},
		{e:"(stick)",	t:"拐杖糖",			s:"/imgpro/icons/statusface/stick.gif"},
		{e:"(socks)",	t:"圣诞袜",			s:"/imgpro/icons/statusface/stocking.gif"},
		{e:"(元旦)",	t:"元旦快乐",		s:"/imgpro/icons/statusface/gantan.gif"},
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
		{e:"(LG)",		t:"LG棒棒糖",		s:"/activity/lg-lolipop/faceicon_2.gif"}
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
				var node=$node("li",'<a onfocus="this.blur();" href="#nogo"><img title="'+el.t+'" alt="'+el.t+'" emotion="'+el.e+'" src="http://xnimg.cn'+el.s+'" rsrc="http://xnimg.cn'+el.s+'"/></a>').attr("suck","you");
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
				var node=$node("li",'<a onfocus="this.blur();" href="#nogo"><img emotion="'+el.e+'" alt="'+el.t+'" title="'+el.t+'" src="http://xnimg.cn'+el.s+'" rsrc="http://xnimg.cn'+el.s+'"/></a>');
				list.append(node);
			}
		}
	}
	//处理回复表情
	var holder=$("#dropmenuHolder");
	if(holder.size()>0) {
		holder.listen('DOMAttrModified',function(evt) {
			try {
				if(evt.newValue=="newsfeed-reply-emotions") {
					var list=$(evt.target).firstChild();
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
								var node=$node("li",'<a onfocus="this.blur();" href="#nogo"><img src="http://xnimg.cn'+el.s+'" title="'+el.t+'" alt="'+el.t+'" emotion="'+el.e+'"/></a>');
								list.append(node);
							}
						}
					}
				}
			} catch (err) {
				$error("addExtraEmotions::listen",err);
			}
		});
	}
};

//在日志、相册中增加楼层计数
function addFloorCounter() {
	if(location.host!="blog.renren.com" && location.host!="photo.renren.com") {
		return;
	}
	addFloor();
	$("div.replies").listen("DOMNodeInserted",addFloor);
	
	function addFloor(evt) {
		try {
			if(evt && !/^replies/.test(evt.target.className)) {
				return;
			}
			var replyAmount;	//回复总数
			if(location.host=="blog.renren.com") {
				replyAmount=parseInt(/评论\((\d+)\)/.exec($("p.stat-article").text())[1]);
			} else {
				replyAmount=parseInt($("#commentCount").text());
				if(isNaN(replyAmount)) {
					return;
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
				if(info.firstChild().attr("class")!="fc") {
					info.prepend($node("span",(replyStartFloor+parseInt(index)+1)+"楼 ").attr("class","fc").style("color","grey"));
				} else {
					//添加过了，不再继续
					return false;
				}
			});
			//隐藏“显示较早之前的评论”,防止重复点击
			$("#showMoreComments").listen("click",function(evt){$("#showMoreComments").hide();});
		} catch(err) {
			$error("addFloor",err);
		}
	};
};

//在鼠标移过时显示照片大图
function showImageOnMouseOver() {
	if(!$cookie("id")) {
		// 尚未登录
		return;
	};
	//显示大图DIV
	var showViewer=function(mouseX,src) {
		try {
			var viewer=$('#xnr_viewer');
			if(viewer.size()==0) {
				return;
			}
			if(mouseX!=null && viewer.style("display")=="none") {
				if(mouseX>document.body.clientWidth/2) {
					viewer.style({left:"2px",right:""});
				} else {
					viewer.style({left:"",right:"2px"});
				}
				viewer.style({display:"block",postion:"fixed"});
			}
			if(!src) {
				viewer.find('#xnr_image').attr({alt:"载入图片中...",src:""});
			} else if(src=="error") {
				viewer.find('#xnr_image').attr({alt:"载入图片失败",src:""});
			} else {
				viewer.find('#xnr_image').attr({alt:"显示图片中...",src:src,rsrc:src});
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
				var src=/<img (.*?id="photo" .*?)>/.exec(html);
				if(src) {
					src=(/src="(.*?)"/.exec(src[1]))[1];
					imageCache(imgId,src);
					if($("#xnr_image").attr("orig")==imgId) {
						showViewer(null,src);
					}
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
				while(res=new RegExp("<a .*?href=\"(.*?)\".*?>[^<]*?<img (.*?src=\"http://.+?"+imgId+"\".*?)>","ig").exec(html)) {
					if(res[2].indexOf("type=\"hidden\"")==-1 && res[2].indexOf("class=\"avatar\"")==-1) {
						res=res[1];
						break;
					}
				}
				// 当ID不匹配且为搜索小头像时，搜索时间标记匹配的图片
				if(!res && imgDate) {
					while(res=RegExp("<a .*?href=\"(.*?)\".*?>[^<]*?<img (src=\"http://.*?/"+imgDate+"/.*?\".*?)>","ig").exec(html)) {
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
	// 读取/设置图片缓存
	var imageCache=function(imgId,src) {
		try {
			if(imgId.indexOf("/")!=-1) {
				imgId=imgId.substring(imgId.lastIndexOf("/")+1);
			}
			if(src) {
				// 设置
				if(src!="error") {
					imgCache[imgId]={src:src,life:100};
					localStorage.setItem("xnr_cache",JSON.stringify(imgCache));
				}
			} else {
				if(imgCache[imgId]) {
					imgCache[imgId].life=100;
					return imgCache[imgId].src;
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
				$node("div",'<img id="xnr_image" alt="加载图片中..." src=""/>').attr("id","xnr_viewer").style({border:"3px double rgb(102,102,102)",display:"none",backgroundColor:"rgb(246,246,246)",top:"2px",zIndex:"199999",right:"2px",position:"fixed"}).appendTo(document.body);
			}
			var t = evt.target;
			var imgId,cache,pageURL;
			var str,imgSrc="",imgDate=null;
			switch(t.tagName) {
				case "IMG":
				//将地址放到style中的图片
					if(t.src.indexOf("xnimg.cn/a.gif")!=-1 && t.style.backgroundImage.indexOf("url(")!=-1) {
						imgSrc=t.style.backgroundImage.replace(/^url\("|"\);?$/g,"");
					} else {
						imgSrc=t.src;
					}
					break;
				case "SPAN":;	// 同DIV
				case "DIV":
					if(t.style.backgroundImage.indexOf("url(")!=-1) {
						imgSrc=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
					}
					break;
				case "A":
					if(t.style && t.style.backgroundImage.indexOf("url(")!=-1) {
						imgSrc=t.style.backgroundImage.replace(/^url\("?|"?\);?$/g,"");
						pageURL=t.href;
					}
					break;
			}
			if(imgSrc!="") {
				imgId=imgSrc.substring(imgSrc.lastIndexOf("_"));
				$('#xnr_image').attr("orig",imgId);
				if (((imgSrc.indexOf('head_')!=-1 || imgSrc.indexOf('p_head_')!=-1 || imgSrc.indexOf('p_main_')!=-1 || imgSrc.indexOf('main_')!=-1 || ((imgSrc.match(/head\d+\./) || imgSrc.match(/\/H[^\/]*\.jpg/) || imgSrc.indexOf("head.xiaonei.com/photos/")!=-1) && imgSrc.indexOf('_')==-1)) && (t.parentNode.tagName=="A" || (t.parentNode.tagName=="I" && t.parentNode.parentNode.tagName=="A"))) || imgSrc.indexOf('tiny_')!=-1 || imgSrc.match(/tiny\d+\./)) {
					if(!pageURL && t.parentNode.tagName=="A") {
						pageURL=t.parentNode.href;
						if(pageURL.indexOf("javascript:")!=-1) {
							return;
						}
					} else if (!pageURL && t.parentNode.tagName=="I" && t.parentNode.parentNode.tagName=="A") {
						pageURL=t.parentNode.parentNode.href;
					} else if (t.className=="avatar") {
						pageURL="http://photo.renren.com/getalbumprofile.do?owner="+$cookie("id");
					}
					//一种非常古老的图片（http://fm071.img.renren.com/pic001/20070201/2002/H[0-9]+[A-Z]+.jpg），改imgId
					if(imgSrc.search(/http:\/\/.*?\.img\.renren\.com\/pic\d+\/\d{8}\/\d+\/H.*?\.jpg/)!=-1) {
						imgId=imgSrc.substring(imgSrc.lastIndexOf("/H")+2);
					}

					cache=imageCache(imgId);
					if(cache) {	//已经在缓存里了
						showViewer(evt.pageX,cache);
						return;
					}

					if(!pageURL) {
						return;
					}
					//没有附加码，也不属于一般头像，也不是非常古老的头像（http://head.xiaonei.com/photos/20070201/1111/head[0-9]+.jpg），直接改URL
					if(imgSrc.indexOf('_')!=-1 && imgSrc.indexOf("_",imgSrc.indexOf("head_")+5)==-1 && imgSrc.indexOf("http://hd")==-1) {
						cache=imgSrc.replace("head_","large_");
						imageCache(imgId,cache);
						showViewer(evt.pageX,cache);
						return;
					}

					//非常古老的头像（http://head.xiaonei.com/photos/20070201/1111/head[0-9]+.jpg），其head后的[0-9]+可能有变，以时间为准
					if(imgSrc.indexOf("_")==-1 && imgSrc.match(/head\.xiaonei\.com\/photos\/[0-9]{8}\/[0-9]+\/head[0-9]+/)) {
						imgDate=/photos\/([0-9]{8}\/[0-9]+)/.exec(imgSrc)[1];
					}

					//小头像，包括一种非常古老的（"http://head.xiaonei.com/photos/20070201/1111/tiny[0-9]+.jpg"）
					if((imgSrc.indexOf("tiny_")!=-1 || (imgSrc.indexOf("tiny")!=-1 && imgSrc.indexOf("_")==-1)) && pageURL.indexOf("getalbumprofile.do")==-1) {
						if(imgSrc.indexOf("_")!=-1) {
							imgDate=/[hf][dm]n?\d+\/(.*?)\/[h_]*tiny_/.exec(imgSrc)[1];
						} else {
							imgDate=/photos\/(.*?)\/[h_]*tiny/.exec(imgSrc)[1];
						}
						pageURL="http://photo.renren.com/getalbumprofile.do?owner="+/id=(\d+)/.exec(pageURL)[1];
					}

					//相册封面图片或头像图片
					if(pageURL.indexOf("getalbum.do")!=-1 || pageURL.indexOf("getalbumprofile.do")!=-1 || pageURL.indexOf("/photo/album?")!=-1 || pageURL.match(/photo\.renren\.com\/photo\/[0-9]+\/album-[0-9]+/)) {
						showViewer(evt.pageX);
						getAlbumImage(pageURL,0,imgId,imgDate);
						return;
					}
					//一般图片或被圈相片或公共主页上的图片
					if(pageURL.indexOf("getphoto.do")!=-1 || pageURL.indexOf("gettagphoto.do")!=-1 || pageURL.indexOf("page.renren.com/photo/photo?")!=-1 || pageURL.match(/photo\.renren\.com\/photo\/[0-9]+\/photo-[0-9]+/)) {
						showViewer(evt.pageX);
						getImage(pageURL,imgId);
					}
				}
			}
		} catch(err) {
			$error("showImageOnMouseOver::onmouseover",err);
		}
	}).listen('mouseout',function(evt) {
		try {
			if (!evt.shiftKey && !evt.ctrlKey && !evt.altKey) {
				$('#xnr_viewer').style("display","none").find("#xnr_image").attr({src:"",orig:""});
			}
		} catch(err) {
			$error("showImageOnMouseOver::onmouseout",err);
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

//显示共同好友
function showMatualFriends() {
	if(location.pathname!="/profile.do" || !location.href.match(/[\?&]id=[0-9]+/i)) {
		return;
	}
	//朋友的ID
	var fid=/[\?&]id=([0-9]+)/i.exec(location.href)[1];
	//自己的ID
	var mid=$cookie("id");
	if(fid==mid) {	//在自己页面
		return;
	}
	//侧栏
	var sidebar=$("div.extra-column > .box-holder");
	if(sidebar.size()==0) {
		return;
	}
	var mfdiv=$node('div','<h4 class="box-header"><span id="mfSpan">共同好友 (载入中...)</span>&nbsp;<a class="count" id="mfCount" style="text-decoration:none;">(0)</a></h4><div class="box-body" style="max-height:210px; overflow-y:auto; padding-left:0pt;"><div class="clearfix"><ul class="people-list" id="mfList"></ul></div></div>').attr({id:"mfBox",class:"profile-friends box"}).appendTo(sidebar);
	var myfriends=[];
	//载入自己的好友列表
	$get('http://photo.renren.com/gettagfriends.do',function(url,html) {
		try {
			var friends=JSON.parse(html).friends_ajax;
			for(var i in friends) {
				myfriends[friends[i].id]=1;
			}
			loadFriends(0,fid,myfriends,0);
		} catch(err) {
			$error("showMutualFriends::$get",err);
		}
	});

	//获取fid的好友
	function loadFriends(page,fid,mfriends,mfcount) {
		$get("http://friend.renren.com/GetFriendList.do?curpage="+page+"&id="+fid,function(url,html,mfriends) {
			try {
				var friends=[];
				var friendInfo;
				while(friendInfo=/showRequestFriendDialog\('(\d+)','(.+?)','(.+?)'\)/ig.exec(html)) {
					friends.push({id:friendInfo[1],name:friendInfo[2],img:friendInfo[3]});
				}
				if(friends.length>0) {
					var mflist=$("#mfList");
					var mfcounter=$("#mfCount");
					for(var i in friends) {
						if(mfriends[friends[i].id]!=null) {
							mfriends[friends[i].id]=null;
							mfcount++;
							mfcounter.text("("+mfcount+")");
							mflist.append($node("li","<a title=\"查看"+friends[i].name+"的个人主页\" href=\"http://renren.com/profile.do?id="+friends[i].id+"\" style=\"background-image:url('"+friends[i].img+"')\"></a><span><a href=\"http://renren.com/profile.do?id="+friends[i].id+"\">"+friends[i].name+"</a></span>"));
						}
					}
					loadFriends(page+1,fid,mfriends,mfcount);
				} else {
					$("#mfSpan").text("共同好友");
				}
			} catch(err) {
				$error("loadFriends::$get",err);
			}
		},mfriends);
	};
};

//去除只有星级用户才能修改特别好友的限制
function removeFriendRestriction() {
	if(location.host!="friend.renren.com") {
		return;
	}
	location.href="javascript:(function(){try{window.user.star=true;window.user.vip=true;}catch(e){}})()";
};

//去除只有星级用户才能修改昵称的限制
function removeNicknameRestriction() {
	if(location.pathname!="/profile.do") {
		return;
	}
	$("#feedInfoAjaxDiv").listen("DOMNodeInserted",function(evt) {
		var ctrl=$("#nkname");
		if(ctrl.size()==0 || !ctrl.attr("readonly")) {
			return;
		}
		setTimeout(function() {
			var input=$("#nkname");
			var attrs={class:input.attr("class"),type:input.attr("type"),tabindex:input.attr("tabindex"),maxlength:input.attr("maxlength"),name:input.attr("name")};
			var p=input.parent();
			input.remove();
			p.find("span.hint.gray").remove();
			p.append($node("input").attr(attrs));
		},100);
	});
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

(function() {
	try {
		// 不在内容可以编辑的frame中运行
		if (self != window.top && document.designMode=="on") {
			return;
		}
		// 各种选项
		var options=new Object;
		// 各个功能的执行函数。分四个优先级
		var funcs=new Array(new Object,new Object,new Object,new Object);
		// 解析选项
		var parse=function(o) {
			try {
				for(var op in o) {
					if(o[op].value) {
						options[op]=o[op].value;
					}
					for(var i=0;i<4;i++) {
						if(o[op]["fn"+i] && o[op]["value"]===true) {
							(funcs[i])[op]=o[op]["fn"+i];
							if(o[op]["argus"+i]) {
								(funcs[i])[op+"@"]=o[op]["argus"+i];
							}
						}
					}
					if(o[op].items) {
						parse(o[op].items);
					}
				}
			} catch(err) {
				$error("parse",err);
			}
		};
		// 执行各项功能
		var exec=function() {
			try {
				for(var i=0;i<4;i++) {
					var fns=funcs[i];
					for(var fn in fns) {
						// 以@结尾的是函数参数，跳过
						if(/@$/.test(fn)) {
							continue;
						}
						try {
							var argus=fns[fn+"@"];
							if(argus) {
								for(var t in argus) {
									for(var j=0;j<4;j++) {
										if(/^@/.test(argus[t][j])) {
											argus[t][j]=options[argus[t][j].substring(1)];
										}
									}
									(fns[fn])(argus[t][0],argus[t][1],argus[t][2],argus[t][3]);
								}
							} else {
								(fns[fn])();
							}
						} catch(err) {
							$error(fn,err);
						}
					}
				}
			} catch(err) {
				$error("exec",err);
			}
		};

		parse(XNR.prototype.options);
		//获取已经保存的选项
		try {
			//Firefox
			for(var option in options) {
				var value=GM_getValue(option,options[option]);
				options[option].value=value;
			}
			exec();
		} catch(err) {
			//Chrome/Chromium
			var names="";
			for(var option in options) {
				names+=option+"|";
			}
			names=names.substring(0,names.length-1);
			chrome.extension.sendRequest({action:"getAll", names:names}, function(response) {
				for(var option in response.options) {
					if(response.options[option]!=null) {
						options[option].value=(response.options[option]);
					}
				}
				exec();
			});
		}
	} catch(err) {
		$error("init",err);
		return;
	}
})();
