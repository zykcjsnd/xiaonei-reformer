// ==UserScript==
// @name           校内人人网改造器 Xiaonei Reformer
// @namespace      Xiaonei_reformer
// @include        http://renren.com/*
// @include        http://*.renren.com/*
// @include        https://renren.com/*
// @include        https://*.renren.com/*
// @description    为人人网（renren.com，原校内网xiaonei.com）清理广告、新鲜事、各种烦人的通告，删除页面模板，恢复旧的深蓝色主题，增加更多功能。。。
// @version1.9.99.20100125
// @version        1.9.99.20100127
// @miniver        205
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
	version:"1.9.99.20100127",
	miniver:205,
	/*
	 * 选项列表 TODO：待加listener属性
	 * 每一项存在如下可能的参数：
	 * text:文字描述
	 * type:类型。有项目分组group，复选框checkbox，标签label，文本框text，文本区域edit，默认为checkbox。
	 * columns:显示的列数。仅当type为group时有效。
	 * list:包含的项目。仅当type为group时有效
	 * info:鼠标悬停提示。
	 * value:默认值。
	 * fnX:X为0~3，代表优先级，0最高。功能对应的函数。
	 * argusX:fnX的参数列表。按以下格式[[参数1-1,参数1-2,...],[参数2-1,参数2-2],...]，表示执行多次fnX以及每次的参数，
	 * 每次的参数不超过4个，如果参数是其他选项的值，使用"@选项名"。
	 * style:控件样式
	 * check:验证规则
	 * fail:验证失败时弹出的信息
	 */
	options:{
		cleanup:{
			category:"清理页面",
			detail:{
				removeAds:{
					text:"清除各类广告",
					value:true,
					fn0:removeAds
				},
				removeStarReminder:{
					text:"去除升级星级用户提示",
					value:true,
					fn1:removeStarReminder
				},
				removeMusicPlayer:{
					text:"去除VIP页面和日志中的音乐播放器",
					value:false,
					fn1:removeMusicPlayer
				},
				removePageTheme:{
					text:"去除页面主题模板",
					value:false,
					fn0:removePageTheme
				},
				removeBlogTheme:{
					text:"去除日志信纸",
					value:false,
					fn0:removeBlogTheme
				},
				removeXntBar:{
					text:"去除页面底部校内通栏",
					value:false,
					fn1:removeXntBar
				},
				removePageTopNotice:{
					text:"去除首页顶部通知",
					value:true,
					fn1:removePageTopNotice
				},
				removePageTopNotice:{
					text:"去除首页顶部通知",
					value:true,
					fn1:removePageTopNotice
				},
				removeNewStar:{
					text:"去除首页发布框下的活动标签",
					value:false,
					fn1:removeActivityLabel
				},
				removeRenRenSurvey:{
					text:"去除首页右边栏：人人网调查",
					value:true,
					fn1:removeRenRenSurvey
				},
				removeCommonPage:{
					text:"去除首页右边栏：公共主页推荐",
					value:false,
					fn1:removeCommonPage
				},
				removeFriendGuide:{
					text:"去除首页右边栏：寻找/邀请朋友",
					value:false,
					fn1:removeFriendGuide
				},
				removeCommendation:{
					text:"去除首页右边栏：推荐/礼物",
					value:false,
					fn1:removeCommendation
				},
				removePaintReminder:{
					text:"去除个人主页右上角装扮主页提示",
					value:true,
					fn1:removePaintReminder
				},
			},
		},
		hideRequest:{
			category:"清理请求",
			detail:{
				removeAppRequest:{
					text:"隐藏应用请求提示",
					value:false,
					fn1:hideRequest,
					argus1:[["l-app"]],
				},
				removeEventRequest:{
					text:"隐藏活动邀请提示",
					value:false,
					fn1:hideRequest,
					argus1:[["l-event"]],
				},
				removeNoticeRequest:{
					text:"隐藏通知提示",
					value:false,
					fn1:hideRequest,
					argus1:[["l-request"]],
				},
				removePollRequest:{
					text:"隐藏投票邀请提示",
					value:false,
					fn1:hideRequest,
					argus1:[["l-poll"]],
				},
				removeGameRequest:{
					text:"隐藏游戏邀请提示",
					value:false,
					fn1:hideRequest,
					argus1:[["l-game"],["l-restaurants"]],
				},
			},
		},
		sweepFeeds:{
			category:"清理新鲜事",
			detail:{
				GROUP1:{
					text:"屏蔽以下类型的新鲜事",
					columns:5,
					fn1:removeFeeds,
					list:{
						removeBlogFeed:{
							text:"日志",
							value:false,
							argus1:[["@markFeedAsRead","iBlog"]]
						},
						removePollFeed:{
							text:"投票",
							value:false,
							argus1:[["@markFeedAsRead","iPoll"]]
						},
						removeAppFeed:{
							text:"应用",
							value:false,
							argus1:[["@markFeedAsRead","iApp"],["@markFeedAsRead","iSanguo"],["@markFeedAsRead","iMyj"]]
						},
						removeActFeed:{
							text:"活动",
							value:false,
							argus1:[["@markFeedAsRead","iActs"]]
						},
						removeStatusFeed:{
							text:"状态",
							value:false,
							argus1:[["@markFeedAsRead","iStatus"]]
						},
						removeGiftFeed:{
							text:"礼物",
							value:false,
							argus1:[["@markFeedAsRead","iGift"]]
						},
						removeFriendFeed:{
							text:"交友",
							value:false,
							argus1:[["@markFeedAsRead","iFriend"]]
						},
						removeImageFeed:{
							text:"照片",
							value:false,
							argus1:[["@markFeedAsRead","iPhoto","相册"]]
						},
						removeImageTagFeed:{
							text:"圈人",
							value:false,
							argus1:[["@markFeedAsRead","iPhoto","圈人"]]
						},
						removeProfileFeed:{
							text:"头像",
							value:false,
							argus1:[["@markFeedAsRead","iProfile"]]
						},
						removeCommentFeed:{
							text:"评论",
							value:false,
							argus1:[["@markFeedAsRead","iPost"]]
						},
						removeClassFeed:{
							text:"班级",
							value:false,
							argus1:[["@markFeedAsRead","iClass"]]
						},
						removeShareFeed:{
							text:"分享",
							value:false,
							argus1:[["@markFeedAsRead","iShare"]]
						},
						removeVipFeed:{
							text:"VIP",
							value:false,
							argus1:[["@markFeedAsRead","iVip"]]
						},
						removeFilmFeed:{
							text:"影评",
							value:false,
							argus1:[["@markFeedAsRead","iFilm"]]
						},
					},
				},
				markFeedAsRead:{
					text:"将屏蔽的新鲜事设为已读",
					value:false,
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
					ctrl:{option:"navExtraContent",value:"论坛\nhttp://club.renren.com/",style:"width:280px;height:80px"},
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
					value:true,
					fn0:recoverOriginalTheme,
				},
				recoverBigDeleteBtn:{
					text:"使用大号新鲜事删除按钮",
					value:false,
					fn2:$patchCSS,
					argus2:[["ul.richlist.feeds li a.delete{background:url(\"http://xnimg.cn/imgpro/home/home_icon.png\") no-repeat scroll -115px 0 transparent;height:18px;width:18px}ul.richlist.feeds li a.delete:hover{background:url(\"http://xnimg.cn/imgpro/home/home_icon.png\") no-repeat scroll -133px 0 transparent;height:18px;width:18px}"]],
				},
				showImagesInOnePage:{
					text:"相册所有图片在一页中显示",
					value:false,
					fn3:showImagesInOnePage,
				},
				removeFontRestriction:{
					text:"去除页面的字体限制",
					value:true,
					fn2:removeFontRestriction,
				},
				limitHeadAmount:{
					text:"限制头像列表中头像数量最多@@个",
					type:"checktext",
					value:false,
					info:"限制头像列表中头像显示最大数量，不会影响到共同好友列表",
					ctrl:{option:"headAmount",value:12,verify:"^[0-9]{1,2}$",failInfo:"请在头像最大数量处输入1～2位整数",style:"width:30px;"},
					fn1:limitHeadAmount,
					argus1:[["@headAmount"]],
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
						},
						fixPeopleList:{
							text:"修正头像列表排版错误",
							value:false,
							info:"如果您将浏览器字体的最小大小设成大于12，首页的“最近来访”列表可能会出现头像错位的问题。如果您遇到这个问题，请启用此功能。",
							argus2:[[".profile .extra-column .people-list li.online span img{margin-right:0px}.profile .extra-column .people-list li span.olname a{max-width:42px}"]],
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
			category:"功能增强",
			detail:{
				hideFeedContent:{
					text:"隐藏新鲜事具体内容",
					value:false,
					fn2:hideFeedContent,
				},
				flodStatusComment:{
					text:"收起新鲜事回复",
					value:true,
					fn3:flodStatusComment,
				},
				addExtraEmotions:{
					text:"增加额外的表情项",
					value:true,
					fn2:addExtraEmotions,
				},
				addFloorCounter:{
					text:"为评论增加楼层计数",
					value:true,
					fn2:addFloorCounter,
				},
				showImageOnMouseOver:{
					text:"在鼠标经过图片时显示大图",
					value:true,
					fn3:showImageOnMouseOver,
				},
				useWhisper:{
					text:"默认使用悄悄话",
					value:false,
					fn3:useWhisper,
				},
				showMatualFriends:{
					text:"显示共同好友",
					value:false,
					fn3:showMatualFriends,
				},
				removeFriendRestriction:{
					text:"去除特别好友修改限制",
					info:"允许非星级用户修改特别好友",
					value:true,
					fn2:removeFriendRestriction,
				},
				removeNicknameRestriction:{
					text:"去除昵称修改限制",
					info:"允许非星级用户修改个人信息中的昵称",
					value:true,
					fn3:removeNicknameRestriction,
				},
				autoRefreshFeeds:{
					text:"自动检查新鲜事更新，每隔@@秒",
					type:"checktext",
					value:true,
					ctrl:{option:"checkFeedInterval",value:30,verify:"^[3-9][0-9]$|^[1-9][0-9]{2,}$",failInfo:"为防止占用太多资源，新鲜事检查间隔时间至少为30秒。",style:"width:30px;"},
					
					fn3:autoRefreshFeeds,
					argus3:[["@checkFeedInterval"]],
				},
			}
		},
		update:{
			category:"自动更新",
			detail:{
				checkUpdate:{
					text:"自动检查脚本更新",
					value:true,
					fn3:checkUpdate,
					argus3:[["@checkLink","@pageLink","@scriptLink","@lastUpdate"]],
				},
				lastUpdate:{
					text:"最后一次检查更新时间：@@",
					type:"label",
					value:"未知",
				},
				checkLink:{
					text:"检查更新地址：@@",
					type:"text",
					value:"http://userscripts.org/scripts/source/45836.meta.js",
					style:"width:275px;",
				},
				pageLink:{
					text:"脚本主页地址：@@",
					type:"text",
					value:"http://userscripts.org/scripts/show/45836",
					style:"width:275px;",
				},
				scriptLink:{
					text:"脚本下载地址：@@",
					type:"text",
					value:"http://userscripts.org/scripts/source/45836.user.js",
					style:"width:275px;",
				},
			}
		},
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
				$error("invoke",err);
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
 * 保存到选项，当页面刷新时才真正写入
 */
function $save(name,value) {
	var toSave=$parse(localStorage.getItem("xnr_save"));
	toSave[name]=value;
	localStorage.setItem("xnr_save",JSON.stringify(toSave));
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
		// Firefox
		GM_xmlhttpRequest({method:"GET",url:url,onload:function(o){if(o.status==200){func(url,o.responseText,userData);}}});
	} catch(err) {
		try {
			// Chrome/Chromium
			chrome.extension.sendRequest({action:"httpGet",url:url,userData:userData,data:true},function(response) {
				func(url,response.data,userData);
			});
		} catch(err) {
			$error("$get",err);
		}
	}
};
// 图片缓存
var imgCache;

var $=XNR;

//清除广告
function removeAds() {
	$(".ad-bar", ".banner", ".adimgr", ".blank-holder", ".blank-bar", ".renrenAdPanel", ".side-item.template", ".rrdesk").remove();
	$("#sd_ad", "#showAD", "#huge-ad", "#rrtvcSearchTip", "#top-ads", "#bottom-ads", "#main-ads", "#n-cAD").remove();
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

//移除状态发布框下的活动标签
function removeActivityLabel() {
	$(".status-publisher div.footer").remove();
};

//移除人气之星/新人栏
function removeNewStar() {
	$(".star-new").remove();
};

//移除装扮主页提示
function removePaintReminder() {
	$(".enter-paints","#paintself","#paintother").remove();
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

//隐藏请求
function hideRequest(reqClass) {
	try {
		$(".side-item.requests li img."+reqClass).parent().remove();
	} catch(err) {
	}
	// 如果请求框没有项目了，删掉
	if($(".side-item.requests ul.icon").heirs()==0) {
		$(".side-item.requests").remove();
	}
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
	$("div.navigation.clearfix",".vip-header-new").each(function(index,elem) {
		var bc=document.defaultView.getComputedStyle(elem,null).backgroundColor;
		if(bc=="rgb(0, 94, 172)" || bc=="transparent") {
			css+=".navigation,.vip-header-new{background:"+FCOLOR+"}";
		}
	});
	// 导航栏项目鼠标移过时的背景色
	css+=".navigation .menu-title a:hover{background-color:"+BCOLOR+"}";
	// 导航栏设置下拉菜单项目的背景色
	css+=".menu-dropdown-border > div:not(.app-actions) a:hover{background-color:"+BCOLOR+" !important}";

	// 首页左侧应用栏的背景色，回复的背景色
	css+=".statuscmtitem,.panel.bookmarks{background-color:"+SCOLOR+"}";

	// 主页上头像下方操作栏
	css+=".profile-actions a:hover{background-color:"+BCOLOR+"}";

	// 提交按钮的背景色
	css+=".input-button,.input-submit,.inputsubmit,.subbutton{background-color:"+XCOLOR+"}";

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

	// 校内通栏上的提醒链接颜色
	css+=".m-chat-window.notifications .chat-conv .notifyitem .notifybody a{color:"+XCOLOR+" !important}";
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
				} else {
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
				if (((imgSrc.match(/[^_]head_/) || imgSrc.match(/[bhp]_head_/) || imgSrc.match(/[bhp]_main_/) || imgSrc.match(/[^_]main_/) || ((imgSrc.match(/head\d+\./) || imgSrc.match(/\/H[^\/]*\.jpg/) || imgSrc.indexOf("head.xiaonei.com/photos/")!=-1) && imgSrc.indexOf('_')==-1)) && (t.parentNode.tagName=="A" || (t.parentNode.tagName=="I" && t.parentNode.parentNode.tagName=="A"))) || imgSrc.indexOf('tiny_')!=-1 || imgSrc.match(/tiny\d+\./)) {
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

					//日志中的图片
					if(pageURL.indexOf("blog.renren.com/GetEntry.do?")!=-1) {
						showViewer(evt.pageX);
						getBlogImage(pageURL,imgId);
						return;
					}

					//一般图片或被圈相片或公共主页上的图片
					if(pageURL.indexOf("getphoto.do")!=-1 || pageURL.indexOf("gettagphoto.do")!=-1 || pageURL.indexOf("page.renren.com/photo/photo?")!=-1 || pageURL.match(/photo\.renren\.com\/photo\/[0-9]+\/photo-[0-9]+/)) {
						showViewer(evt.pageX);
						getImage(pageURL,imgId);
						return;
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
	//载入自己的好友列表
	$get('http://photo.renren.com/gettagfriends.do',function(url,html) {
		try {
			var myfriends=[];
			var friends=$parse(html).friends_ajax;
			for(var i in friends) {
				myfriends[friends[i].id]=1;
			}
			$node('div','<h4 class="box-header"><span id="mfSpan">共同好友 (载入中...)</span>&nbsp;<a class="count" id="mfCount" style="text-decoration:none;">(0)</a></h4><div class="box-body" style="max-height:210px;overflow-y:auto;padding-left:0pt;"><div class="clearfix"><ul class="people-list" id="mfList"></ul></div></div>').attr({id:"mfBox",class:"profile-friends box"}).appendTo(sidebar);
			loadFriends(0,fid,myfriends,0);
		} catch(err) {
			$error("showMutualFriends::$get",err);
		}
	});

	//获取fid的好友
	function loadFriends(page,fid,mfriends,mfcount) {
		$get("http://friend.renren.com/GetFriendList.do?curpage="+page+"&id="+fid,function(url,html) {
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
		});
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

//自动检查新鲜事更新
function autoRefreshFeeds(interval) {
	if(!$cookie("id")) {
		return;
	}
	if(location.hostname=="www.renren.com" && location.pathname.toLowerCase()=="/home.do") {
		// 记录下最新更新的时间
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
				var feedList=$node("ul").style("display","none").inner(r[0].replace(/onload=".*?"/,"").replace(/<script.*?<\/script>/,""));
				if(feedList.heirs()==0) {
					return;
				}
				// 已读的最新新鲜事ID
				var feedId=localStorage.getItem("xnr_feed");
				if(feedId=="") {
					// 如果为空，则认为所有新鲜事都读了。。。
					feedId=feedList.firstChild().attr("id");
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
					localStorage.setItem("xnr_feed",feedList.firstChild().attr("id"));
				}

				var tips=$("#wpiroot div.m-chat-button-notifications div.chat-conv");
				// 有校内通栏的情况
				if(tips.size()>0) {
					//添加提醒
					var node=tips.firstChild();
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
								pnode.firstChild().attr("class","notifyitem");
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
					feed.lastChild().style("borderBottom","1px solid");
				}
				for(var i=0;i<feedCount;i++) {
					feed.append($node("li",feedList.child(i).child(1).inner().replace(/^ +| +$/,"")).attr("style","padding-top:5px;padding-bottom:5px;border-bottom:1px solid"));
				}
				feed.lastChild().style("borderBottom","");
			} catch(err) {
				$error("autoRefreshFeeds::$get",err);
			}
		});
	},interval*1000);
};

//检查更新 TODO 手动更新
function checkUpdate(checkLink,pageLink,scriptLink,last,manually) {
	//last="2000-1-1";
	var today=new Date();
	if(!last) {
		last=today;
	} else {
		last=new Date(last);
	}
	//一天只检查一次
	if(!manually && (today-last)<3600000*24) {
		return;
	}
	if(manually) {
		$("#updateNow").attr({disabled:"disabled",value:"检查中..."});
	}
	$get(checkLink,function(url,html) {
		try {
			var ver=/@miniver[ \t]*(\d+)/.exec(html) || ["","0"];
			if(parseInt(ver[1])>XNR.prototype.miniver) {
				$node("div",'<div><font color=crimson>校内网改造器已有新版本：'+/@version[ \t]*([0-9\.]+)/.exec(html)[1]+'</font><a target="_blank" href="'+scriptLink+'"> 安装</a><a target="_blank" href="'+pageLink+'"> 去看看</a><a onclick="return false"> 以后再说</a></div>').attr({id:"updateNotify",style:"bottom:2px;position:fixed;z-index:100000;background-color:rgb(246,246,246)"}).appendTo(document.body);
				$("#updateNotify a").listen("click",function() {
					$save("lastUpdate",today.toString());
					$("#updateNotify").remove();
				});
			} else {
				$save("lastUpdate",today.toString());
				if(manually==true) {
					alert("没有找到更新版本");
				}
			}
			if(manually) {
				$("#updateNow").attr({disabled:null,value:"立即检查"});
			}
		} catch(err) {
			$error("checkUpdate::$get",err);
		}
	});
};

(function() {
	try {
		// 不在内容可以编辑的frame中运行，也不在body无id无class的frame中运行
		if (self != window.top && (document.designMode=="on" || (!document.body.id && !document.body.className))) {
			return;
		}
		// 运行环境 1:firefox 2:chrome/chromium extension -1:unknown
		const UNKNOWN=-1,FIREFOX=1,CHROME=2;
		var env=UNKNOWN;
		if(!window.chrome && GM_getValue) {
			env=FIREFOX;
		} else if(window.chrome && chrome.extension) {
			env=CHROME;
		};
		// 各种选项
		var options=new Object;
		// 各个功能的执行函数。分四个优先级
		var funcs=new Array(new Object,new Object,new Object,new Object);
		// 生成的选项代码
		var detailHTML="";
		var categoryHTML="";
		// 解析选项函数
		var parseDetail=function(o,p) {
			try {
				var index=-1;
				for(var op in o) {
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
					// 对应的函数
					for(var i=0;i<4;i++) {
						if(o[op]["fn"+i]) {
							(funcs[i])[op]={fn:o[op]["fn"+i],argus:o[op]["argus"+i]};
						} else if (p && p["fn"+i]) {
							// 继承父项目（GROUP）的函数
							(funcs[i])[op]={fn:p["fn"+i],argus:o[op]["argus"+i]};
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
							detailHTML+="<div><input style=\""+o[op].style+"\" type=\"checkbox\" title=\""+(o[op].info || "")+"\" id=\""+op+"\"/><label title=\""+(o[op].info || "")+"\" for=\""+op+"\">";
							detailHTML+=o[op].text.replace("@@","</label>&nbsp;<input type=\"input\" title=\""+(o[op].info || "")+"\" id=\""+o[op].ctrl.option+"\" style=\""+(o[op].ctrl.style || "")+"\" verify=\""+(o[op].ctrl.verify || "")+"\" failInfo=\""+(o[op].ctrl.failInfo || "")+"\"/>&nbsp;<label title=\""+(o[op].info || "")+"\" for=\""+op+"\">");
							detailHTML+="</label></div>";
							break;
						case "text":
							detailHTML+="<div>";
							detailHTML+=o[op].text.replace("@@","&nbsp;<input type=\"input\" title=\""+(o[op].info || "")+"\" id=\""+op+"\" style=\""+(o[op].style || "")+"\" verify=\""+(o[op].verify || "")+"\" failInfo=\""+(o[op].failInfo || "")+"\"/>&nbsp;");
							detailHTML+="</div>";
							break;
						case "checkedit":
							detailHTML+="<div><input style=\""+o[op].style+"\" type=\"checkbox\" title=\""+(o[op].info || "")+"\" id=\""+op+"\"/><label title=\""+(o[op].info || "")+"\" for=\""+op+"\">"+o[op].text+"</label></div>";
							detailHTML+="<div><textarea id=\""+o[op].ctrl.option+"\" title=\""+(o[op].info || "")+"\" style=\""+(o[op].ctrl.style || "")+"\"></textarea></div>";
							break;
						case "label":
							detailHTML+="<div style=\""+o[op].style+"\" title=\""+(o[op].info || "")+"\">"+o[op].text.replace("@@","<span style=\""+o[op].style+"\" title=\""+(o[op].info || "")+"\">"+o[op].value+"</span>")+"</div>";
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
							for(var t in argus) {
								for(var j=0;j<4;j++) {
									// 以@开头的是选项的值
									if(/^@/.test(argus[t][j])) {
										argus[t][j]=options[argus[t][j].substring(1)];
									}
								}
								(fns[fn].fn)(argus[t][0],argus[t][1],argus[t][2],argus[t][3]);
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
		// 创建选项菜单
		var buildMenu=function() {
			var menu=$node("div").attr("class","xnr_op").style("display","none");
			var html="";
			// 选项菜单的样式
			html+='<style type="text/css">.xnr_op{width:450px;left:50%;margin-left:-225px;position:fixed;z-index:200000;color:black}.xnr_op .options>table{height:280px;border-spacing:0}.xnr_op *{padding:0;margin:0}.xnr_op .tl{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAS0lEQVR42o3OoQ0AIAxEUZYi7NEluggewwy1dMNyBgIJCSe+uTxxKSKuRKQgRRV1ZGicIKOG/NVGa/jB9oPrkzNQWVhZ2FloLBwMnD51rC95s060AAAAAElFTkSuQmCC)}.xnr_op .m{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAAG0lEQVQ4jWMICgraQClmGDVk1JBRQ0YNCdoAAHYawHDC5WlcAAAAAElFTkSuQmCC)}.xnr_op .tr{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAARElEQVR42o3KoREAIAwEMJbi2KNLdBE8pjPUlg3Lo8BwvIhLEZEAB4MOCi0zy23H+TCg/uNR2TjYuDU2Khs7G42NzsZYRf6sL6b2F1EAAAAASUVORK5CYII%3D)}.xnr_op .bl{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQ0lEQVQY02MICgpaD8QbCGEGILGMWIVTiFXYQqzCdGIVmhOl8P///yDF/cQqNCVKIZLifoIKkTSYQz3YAg06UDivBwBLtawvNrYbVAAAAABJRU5ErkJggg%3D%3D)}.xnr_op .br{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQ0lEQVQYlY3KoRUAIAhFUZbyuMdbgkXoFmaw6oaYyP5w2zXgCo6Jcasx1RhqdDVOJa6qMiWOX1ydOh5gAwkE4MDs0B5TPqwv1+d6zQAAAABJRU5ErkJggg%3D%3D)}.xnr_op .border{height:10px;overflow:hidden;width:10px;}.xnr_op .title {padding:4px;display:block;background:#3B5998;color:white;text-align:center;font-size:12px}.xnr_op .btns{background:#F0F5F8;text-align:right}.xnr_op .btns>input{border-style:solid;border-width:1px;padding:2px 15px;margin:3px;font-size:13px}.xnr_op .ok{background:#5C75AA;color:white;border-color:#B8D4E8 #124680 #124680 #B8D4E8}.xnr_op .cancel{background:#F0F0F0;border-color:#FFFFFF #848484 #848484 #FFFFFF}.xnr_op .c{background:#FFFFF4}.xnr_op .c>h2{background:#5C75AA;font-size:14px;color:white}.xnr_op .c td{vertical-align:top}.xnr_op .category{width:120px;border-right:1px solid #5C75AA}.xnr_op li{list-style-type:none}.xnr_op .pages{width:310px}.xnr_op .category li{cursor:pointer;height:30px;line-height:30px}.xnr_op .category li:hover{background:#ffffcc;color:black}.xnr_op li.even{background:#EEEEEE}.xnr_op li.selected{background:#748AC4;color:white}.xnr_op .category span{padding-left:10px;font-size:14px}.xnr_op .pages>div{overflow:auto;height:280px;padding:10px}.xnr_op .pages>div>*{margin-bottom:5px;width:100%;table-layout:fixed}.xnr_op .pages>div>div>table{width:100%;table-layout:fixed;margin-left:5px}.xnr_op .pages tr{line-height:20px}.xnr_op label{color:black;font-weight:normal}.xnr_op .pages .default{text-align:center}.xnr_op .pages .default table{height:95%}.xnr_op .pages .default td{vertical-align:middle}.xnr_op .pages .default td>*{padding:5px}</style>';
			html+='<table><tbody><tr><td class="border tl"></td><td class="border m" style="width:430px"></td><td class="border tr"></td></tr><tr><td class="border m"></td><td class="c"><div class="title">改造选项</div><div class="options"><table><tbody><tr><td class="category"><ul>';
			html+=categoryHTML;
			html+='</ul></td><td class="pages"><div class="default"><table><tbody><tr><td><h1>校内网改造器</h1><p><b class="ver"></b></p><p><b>2008-2010</b></p><p><a href="mailto:xnreformer@gmail.com">xnreformer@gmail.com</a></p></td></tr></tbody></table></div>';
			html+=detailHTML;
			html+='</td></tr></tbody></table></div><div class="btns"><input type="button" value="确定" class="ok"/><input type="button" value="取消" class="cancel"/></div></td><td class="border m"></td></tr><tr><td class="border bl"></td><td class="border m"></td><td class="border br"></td></tr></tbody></table>';
			menu.inner(html).appendTo(document.body);
			// 设置选项的值
			for(var option in options) {
				if((typeof options[option])=="boolean") {
					menu.find("#"+option).prop("checked",options[option]);
				} else {
					menu.find("#"+option).prop("value",options[option]);
				}
			}
			// 点击分类切换事件
			menu.find(".category ul").listen("click",function(evt) {
				var t=evt.target;
				if(t.tagName=="LI") {
					t=t.firstChild;
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
				$("body>.xnr_op *[verify]").each(function(index,elem) {
					if(!elem.value.match(elem.getAttribute("verify"))) {
						var page=$(elem);
						while(page.parent().prop("className")!="pages") {
							page=page.parent();
						}
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
			var nav=$(".nav-body .nav-other");
			if(nav.size()==1) {
				nav.prepend($node("div","<div class=\"menu-title\"><a onclick=\"return false\">改造</a></div>").attr("class","menu"));
				nav.firstChild().find("a").listen("click",function(evt) {
					try {
						var menu=$("body>.xnr_op");
						menu.show();
						menu.style("top",parseInt(window.innerHeight-menu.prop("offsetHeight"))/2+"px");
					} catch (err) {
						$error("menu:show",err);
					}
				});
			}
		};
		// 保存运行时更改的值。
		var save=function() {
			var data=$parse(localStorage.getItem("xnr_save"));
			// 先更新内存中的数据
			for(var option in data) {
				options[option]=data[option];
			}
			try {
				if(env==FIREFOX) {
					for(var option in data) {
						GM_setValue(option,data[option]);
					}
				} else if(env==CHROME) {
					chrome.extension.sendRequest({action:"set",data:options});
				}
			} catch(err) {
				$error("save",err);
			}
			localStorage.setItem("xnr_save",null);
		};

		// 建立图片缓存
		imgCache=$parse(localStorage.getItem("xnr_cache"));
		for(id in imgCache) {
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
			i++;
			categoryHTML+="<li class=\""+["even","odd"][i%2]+"\"><span id=\""+category+"\">"+XNR.prototype.options[category].category+"</span></li>";
			detailHTML+="<div class=\""+category+"\" style=\"display:none\">";
			parseDetail(XNR.prototype.options[category].detail);
			detailHTML+="</div>";
		}
		//获取已经保存的选项
		if(env==FIREFOX) {
			//Firefox
			for(var option in options) {
				options[option]=GM_getValue(option,options[option]);
			}
			save();
			exec();
			buildMenu();
		} else if(env==CHROME) {
			//Chrome/Chromium 插件
			chrome.extension.sendRequest({action:"get"}, function(response) {
				for(var i in response.data) {
					options[i]=response.data[i];
				}
				save();
				exec();
				setTimeout(buildMenu,0);
			});
		}
	} catch(err) {
		$error("init",err);
		return;
	}
})();
