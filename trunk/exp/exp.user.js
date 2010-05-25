// ==UserScript==
// @name           校内人人网改造器 Xiaonei Reformer Exp
// @namespace      Xiaonei_reformer_exp
// @include        http://renren.com/*
// @include        http://*.renren.com/*
// @include        https://renren.com/*
// @include        https://*.renren.com/*
// @description    为人人网（renren.com，原校内网xiaonei.com）清理广告、新鲜事、各种烦人的通告，删除页面模板，恢复旧的深蓝色主题，增加更多功能。。。
// @version        3.0.0.20100525
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

(function(){

// 不在内容可以编辑的frame中运行
if (self != top && document.designMode=="on") {
	return;
}

// 页面工具的简写
var $=PageKit;

// 基本参数
var XNR={};

// 版本，对应@version和@miniver，用于升级相关功能
XNR.version="3.0.0.20100525";
XNR.miniver=300;

// 存储空间，用于保存全局性变量
XNR.storage={};

// 当前用户ID
XNR.userId="0";

// 调试模式
XNR.debug=false;

// 选项
XNR.options={};

// 当前运行环境（浏览器）
const UNKNOWN=0,USERSCRIPT=1,FIREFOX=2,CHROME=4;
XNR.agent=UNKNOWN;
if(window.chrome) {
	XNR.agent=CHROME;
} else if (window.jetpack) {
	XNR.agent=FIREFOX;
} else if (typeof GM_setValue=="function") {
	XNR.agent=USERSCRIPT;
}

/* 以下开始所有功能 */

//清除广告
function removeAds(evt) {
	if(!evt) {
		var ads=[".ad-bar", ".banner", ".adimgr", ".blank-bar", ".renrenAdPanel", ".side-item.template", ".rrdesk", ".video:not([style])","#sd_ad", "#showAD", "#huge-ad", "#rrtvcSearchTip", "#top-ads", "#bottom-ads", "#main-ads", "#n-cAD"];
		$patchCSS(ads.join(",")+"{display:none !important}");
		$ready(function() {
			$(ads.join(",")).remove();
			// .blank-holder在游戏大厅game.renren.com不能删
			$(".blank-holder").remove(true);
		});
	}
	$ready(function() {
		// 混迹于新鲜事中的广告
		$("ul#feedHome > li").filter("a[href^='http://edm.renren.com/link.do?']").remove();
		// 人人桌面
		$("ul#feedHome > li").filter("a[href^='http://im.renren.com/'][href*='.exe']").remove();
	});
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
		/*
			var a=[];
			for(;times>0;times--) {
				a.push(this);
			}
			return a.join();
		*/
			var a=""
			for(;times>0;times--) {
				a+=this;
			}
			return a;
		};
	}
	// 为Date类型增加格式化文本方法
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
};

// 主执行函数。
function main(savedOptions) {
	extendPrototype();

	// 选项菜单，定义选项菜单中各个项目
	// 基本格式：
	// {
	//	 类别名称1:[
	//	   {
	//	     // 功能1
	//	     参数1:...,
	//	     参数2:...,
	//	   },
	//	   {
	//	     // 功能2
	//	     ...
	//	   },
	//	   ...
	//	 ],
	//	 类别名称2:[
	//	   ...
	//	 ],
	//	 ...
	// }
	// 其中，功能分为两类，第一种是具体的功能，格式为：
	// 功能名:{
	//   [String]text:文字+HTML控件描述。例："##选项 数量：##"，表示前后各有一个HTML控件。
	//   [Array]ctrl:如果text中存在控件描述，在这里具体定义。
	//   [Number]agent:执行环境限制。可选。为XNR.agnet可定义值的组合
	//   [String]info:辅助性描述信息。可选。TODO
	//   [String]warn:警告信息。可选。TODO
	// }
	// ctrl的格式是：
	// [
	//   {
	//     [String]id:控件ID
	//     [String]type:类型，支持如下类型："check"（<input type="checkbox"/>）,"edit"（<textarea/>）,"button"（<input type="button"/>）,"input"（<input/>）,"label"（<span/>）,"hidden"（不生成实际控件）
	//     [Any]value:默认值
	//     [Object]verify:{验证规则:失败信息}。可选。TODO
	//     [String]style:样式。可选
	//     [Array]fn:处理函数。可选
	//   },
	//   控件名2:{
	//     ...
	//   }
	// ]
	// fn的格式是：
	// [
	//   {
	//     [Function]name:函数名。
	//     [String/Object]fire:函数执行时机。可以为控件的某一个事件。例如"click"。或者是{prop:控件属性,value:期望值}。可选。未指定事件为初始化后立即执行。
	//     [Number]ring:优先级（0～4）。就是ring，不是priority。仅当fire非事件触发才有效。0级在DOM生成前执行，故仅用于预先修改样式或处理页面预定义对象。
	//     [Object]trigger:设定其他控件的触发事件。{CSS选择器:事件名,...}。可选。
	//     [Array]args:函数参数列表。如果参数为另一选项/选项组，名称前加@。参数数量不得多于4个。利用选项组处理过多参数
	//   },
	// ]
	//
	//
	// 第二种是选项组，为被多个功能共用的选项集合，格式为：
	// 选项组名:{
	//   [String]text:文字描述。可选。文字后将换行列出各选项。
	//   [Array]ctrl:各选项描述。格式同前，但忽略fn。
	//   [Number]column:列数
	// }
	//
	var optionMenu={
		"清理页面":[
			{
				text:"##清除各类广告",
				ctrl:[
					{
						id:"removeAds",
						type:"check",
						value:true,
						fn:[
							{
								name:removeAds,
								ring:0,
								fire:{prop:"checked",value:true},
								trigger:{"ul#feedHome":"DOMNodeInserted"},
							}
						],
					}
				],
			},
		],
	};
	// 函数执行队列。对应4个优先级，每一个优先级数组中的函数对象为{name:函数,args:函数参数}
	var fnQueue=[[],[],[],[]];

	var categoryHTML="";
	var categoryPages=[];
	// 解析选项
	for(var category in optionMenu) {
		// 添加分类
		categoryHTML+="<li class=\""+(categoryPages.length%2!=0?"even":"odd")+"\"><span>"+category+"</span></li>";
		var page=$node("div");
		for(iFunc=0;iFunc<optionMenu[category].length;iFunc++) {
			var o=optionMenu[category][iFunc];
			// 不适用于当前浏览器
			if(o.agent && (o.agent & XNR.agent)==0) {
				return;
			}
			if(!o.column) {
				// 功能
				// 放在一块中
				var block=$node("div");
				var text=o.text.split("##");
				for(var iText=0;iText<text.length;iText++) {
					// 文本节点
					if(text[iText]) {
						$node("label").text(text[iText]).appendTo(block);
					}
					// 控件节点
					var control=o.ctrl[iText];
					if(!control) {
						continue;
					}
					// 如果控件值已保存，用保存的值替代默认值
					if(savedOptions[control.id]!=null) {
						control.value=savedOptions[control.id];
					}
					// 生成控件节点
					var node=null;
					switch(control.type) {
						case "check":
							node=$node("input").attr("type","checkbox").prop("checked",control.value);
							break;
						case "hidden":
							break;
						case "input":
							node=$node("input").prop("value",control.value);
							break;
						case "edit":
							node=$node("textarea").prop("value",control.value);
							break;
						case "button":
							node=$node("input").attr("type","button").prop("value",control.value);
							break;
						case "label":
							node=$node("span");
							break;
					}
					if(node) {
						node.attr({id:control.id,style:(control.style || "")});
						node.appendTo(block);
					}
					XNR.options[control.id]=control.value;
					// 相关函数
					if(control.fn) {
						for(var iFn=0;iFn<control.fn.length;iFn++) {
							var fn=control.fn[iFn];
							// 没有设置参数的话，设置一个空的参数集，方便后面处理
							if(!fn.args) {
								fn.args=[];
							}
							if(!fn.fire || (typeof fn.fire=="object" && node.prop(fn.fire.prop)==fn.fire.value)) {
								// 符合要求，放入执行序列
								fnQueue[fn.ring].push({name:fn.name,args:fn.args});
							} else if(typeof fn.fire=="string") {
								node.hook(fn.fire,function(evt) {
									fn.name(evt,fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
								});
							}
							// 其他节点触发事件
							if(fn.trigger) {
								for(var t in fn.trigger) {
									// 只有等到DOM建立后页面节点才能保证可访问。所以优先级视为1。
									fnQueue[1].push({name:function(arg1,arg2,arg3,arg4) {
										$(t).hook(fn.trigger[t],function(evt) {
											fn.name(evt,arg1,arg2,arg3,arg4);
										});
									},args:fn.args});
								}
							}
						}
					}
				}
				page.append(block);

			} else {
				// 选项组
			}
		}
		// 将生成的页面div放入optionPages数组，方便后面加入到菜单
		categoryPages.push(page.style("display","none").get());
	}

	// 执行优先级为0的函数
	for(var i=0;i<fnQueue[0].length;i++) {
		var fn=fnQueue[0][i];
		fn.name(fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
	}
	

	// 生成选项菜单
	var menuHTML='<style type="text/css">.xnr_op{width:500px;left:50%;margin-left:-225px;position:fixed;z-index:200000;color:black;blackground:black}.xnr_op *{padding:0;margin:0;border-collapse:collapse}.xnr_op table{width:100%;table-layout:fixed}.xnr_op .tl{border-top-left-radius:8px;-moz-border-radius-topleft:8px}.xnr_op .tr{border-top-right-radius:8px;-moz-border-radius-topright:8px}.xnr_op .bl{border-bottom-left-radius:8px;-moz-border-radius-bottomleft:8px}.xnr_op .br{border-bottom-right-radius:8px;-moz-border-radius-bottomright:8px}.xnr_op .border{height:10px;overflow:hidden;width:10px;background-color:black;opacity:0.5}.xnr_op .m{width:100%}.xnr_op .title {padding:4px;display:block;background:#3B5998;color:white;text-align:center;font-size:12px}.xnr_op .btns{background:#F0F5F8;text-align:right}.xnr_op .btns>input{border-style:solid;border-width:1px;padding:2px 15px;margin:3px;font-size:13px}.xnr_op .ok{background:#5C75AA;color:white;border-color:#B8D4E8 #124680 #124680 #B8D4E8}.xnr_op .cancel{background:#F0F0F0;border-color:#FFFFFF #848484 #848484 #FFFFFF}.xnr_op>table table{background:#FFFFF4}.xnr_op .options>table{height:280px;border-spacing:0}.xnr_op .c td{vertical-align:top}.xnr_op .category{width:119px;min-width:119px;border-right:1px solid #5C75AA}.xnr_op li{list-style-type:none}.xnr_op .category li{cursor:pointer;height:30px;overflow:hidden}.xnr_op .category li:hover{background:#ffffcc;color:black}.xnr_op li.even{background:#EEEEEE}.xnr_op li.selected{background:#748AC4;color:white}.xnr_op .category span{left:10px;position:relative;font-size:14px;line-height:30px}.xnr_op .pages>div{overflow:auto;height:280px;padding:10px}.xnr_op .pages>div>*{margin-bottom:5px;width:100%}.xnr_op .pages>div>div>table{margin-left:5px}.xnr_op .pages tr{line-height:20px}.xnr_op input[type="checkbox"]{margin-right:4px}.xnr_op label{color:black;font-weight:normal}.xnr_op .pages .default{text-align:center}.xnr_op .pages .default table{height:95%}.xnr_op .pages .default td{vertical-align:middle}.xnr_op .pages .default td>*{padding:5px}</style>';
		menuHTML+='<table><tbody><tr><td class="border tl"></td><td class="border m"></td><td class="border tr"></td></tr><tr><td class="border"></td><td class="c m"><div class="title">改造选项</div><div class="options"><table><tbody><tr><td class="category"><ul>'+categoryHTML+'</ul></td><td class="pages"><div class="default"><table><tbody><tr><td><h1>人人网改造器</h1><p><b>'+XNR.version+' ('+XNR.miniver+')</b></p><p><b>Copyright © 2008-2010</b></p><p><a href="mailto:xnreformer@gmail.com">xnreformer@gmail.com</a></p><p><a href="http://xiaonei-reformer.googlecode.com/" target="_blank">项目主页</a></p></td></tr></tbody></table></div></td></tr></tbody></table></div><div class="btns"><input type="button" value="确定" class="ok"/><input type="button" value="取消" class="cancel"/></div></td><td class="border"></td></tr><tr><td class="border bl"></td><td class="border m"></td><td class="border br"></td></tr></tbody></table>';

	// TODO 去掉top style,增加display:none
	var menu=$node("div").attr("class","xnr_op").code(menuHTML).appendTo(document.documentElement).style("top","2px");
	menu.find("td.pages").append($(categoryPages));

	// 点击分类切换事件
	menu.find(".category ul").hook("click",function(evt) {
		var t=$(evt.target);
		if(t.prop("tagName")=="SPAN") {
			t=t.superior();
		}
		$(".xnr_op .pages>div").hide();
		$(".xnr_op .pages>div").pick(t.index()+1).show();
		$(".xnr_op .category li.selected").removeClass("selected");
		t.addClass("selected");
	});

	// 点击取消按钮事件
	menu.find(".cancel").hook("click",function(evt) {
		// TODO : reset all options
		$(".xnr_op").hide();
	});

	// 剩余的部分在页面DOM构建完毕后再执行
	$ready(function () {
		for(var p=1;p<4;p++) {
			for(var i=0;i<fnQueue[p].length;i++) {
				var fn=fnQueue[p][i];
				fn.name(fn.args[0],fn.args[1],fn.args[2],fn.args[3]);
			}
		}
	});
};

/* 以下是基本辅助函数，所有函数以$开头 */

/*
 * 删除页面节点
 * 参数
 *   [String/Object]selector:CSS选择器，也可以是选项集合
 * 返回值
 *   无
 */
function $removal(selector) {
	if(typeof selector=="object") {
		for(var i in selector) {
			PageKit(selector[i]).remove();
		}
	} else {
		PageKit(selector).remove();
	}
};

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
 *   [String]category:页面类别，可能的值参考函数内pages变量
 *   [String]url:默认为当前页面地址
 * 返回值
 *   [Boolean]:属于返回true，否则false。如果category非法，返回true。
 */
function $page(category,url) {
	var pages={
		home:"renren\\.com/[hH]ome\\.do",	// 首页
		profile:"/[Pp]rofile\\.do|/[a-zA-Z0-9_]{5,}\\.renren.com/\\?id=", // 个人主页
		blog:"blog\\.renren\\.com",	// 日志
	};
	if(!url) {
		url=location.href;
	}
	return !pages[category] || url.match(pages[category]);
};

/*
 * 申请一个全局对象
 * 参数
 *   [String]name:对象名称，可以为空
 *   [Boolean]monopoly:如果相同名称的对象已被申请，则返回空
 * 返回值
 *   [Object]:对象
 */
function $alloc(name,monopoly) {
	if(!name) {
		do {
			name="r"+Math.random();
		} while(!XNR.storage[name]);
	}
	if(storage[name]) {
		if(monopoly) {
			return null;
		} else {
			return XNR.storage[name];
		}
	} else {
 		XNR.storage[name]=new Object();
		return XNR.storage[name];
	}
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
 * 在DOM创建完毕后执行
 * 参数
 *   [Function]func：执行的函数
 * 返回值
 *   无
 */
function $ready(func) {
	/*
	 * 页面加载阶段测试：test3.html
	 * Firefox 3.6.3/3.7a5pre：loading -> interactive -> completed
	 * Chromium 6.0.411.0 (47760)：loading -> loaded -> completed
	 * Opera 10.54：interactive -> completed -> completed
	 */
	if(document.readyState=="loading") {
		document.addEventListener("DOMContentLoaded",func,false);
	} else {
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
			for(var i in this.nodes) {
				if(!(func(this.nodes[i],i)==null)) {
					break;
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
			try {
				if(!safe || elem.childElementCount==0) {
					elem.parentNode.removeChild(elem);
				}
			} catch(err) {
			}
		});
		this.nodes=[];
		return this;
	},
	// 删除对象所有DOM节点，如果删除后父节点无其他子节点，一并删除
	purge:function() {
		this.each(function(elem) {
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
		this.nodes=[];
		return this;
	},
	// 隐藏对象所有的DOM节点
	hide:function() {
		this.each(function(elem) {
			try {
				elem.style.display="none";
			} catch(err) {
			}
		});
		return this;
	},
	// 显示对象所有的DOM节点
	show:function() {
		this.each(function(elem) {
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
						try {
							elem.style[n]=o[n];
						} catch (err) {
						}
					});
				};
				return this;
			case "string":
				if(v!=null) {
					this.each(function(elem) {
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
		this.each(function(elem) {
			var xnr=$(elem);
			var c=xnr.attr("class");
			if(!c.match(new RegExp("\\b"+str+"\\b"))) {
				xnr.attr("class",c+" "+str);
			}
		});
	},
	// 去除一个类
	removeClass:function(str) {
		this.each(function(elem) {
			var xnr=$(elem);
			var c=xnr.attr("class");
			if(c.match(new RegExp("\\b"+str+"\\b"))) {
				xnr.attr("class",c.replace(new RegExp("\\b"+str+"\\b"),"").replace(/^ +| +$/g,""));
			}
		});
	},
	// 获取/设置文本内容
	text:function(txt) {
		if(!(txt==null)) {
			this.each(function(elem) {
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
	code:function(html) {
		if(!(html==null)) {
			this.each(function(elem) {
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
	// 添加事件监听函数
	hook:function(evt,func) {
		this.each(function(elem) {
			elem.addEventListener(evt,func,false);
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
				location.href=e;
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
		break;
	default:
		throw "unsupported browser";
};

})();
