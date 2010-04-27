/* base functions */
var nU = navigator.userAgent, nA = navigator.appVersion;
var Env = {
	IE: !!(window.attachEvent && !window.opera),
	IE7: nA.indexOf('MSIE 7') != -1,
	IE6: nA.indexOf('MSIE 6') != -1,
	Opera: !!window.opera,
	Safari: nU.indexOf(' AppleWebKit/') != -1, 
	KHTML: (/Konqueror|Safari|KHTML/).test(nU),
	Gecko:  nU.indexOf('Gecko') != -1 && !nU.indexOf('KHTML') != -1
};
nU = nA = null;

function extend(d, s) {
	for (p in s) {
		if (s[p] !== null) d[p] = (typeof(s[p]) == 'object' && !(s[p].nodeType) && !(s[p] instanceof Array)) ? extend({}, s[p]) : s[p];
	}
	return d;
}

var forEach = function(obj, fn) {
	if (!obj) return;
	var isElement = (obj[0] && obj[0].nodeName && obj[0].nodeType == 1) ? true : false;
	if (obj instanceof Array || obj instanceof Function || isElement) {
		for (var i = 0; i < obj.length ; i++) {
			fn.call(obj, obj[i], i);
		}
	} else if (typeof(obj) == 'string' ) {
		for (var i = 0; i < obj.length ; i++) {
			fn.call(obj, obj.charAt(i), i);
		}
	} else if (typeof(obj) == 'object') {
		for (var i in obj) {
			if (typeof Object.prototype[i] == 'undefined' && typeof Element.prototype[i] == 'undefined') {
				fn.call(obj, obj[i], i);
			}
		}
	}
	isElement = null;
};


extend(Function.prototype, {
	bind: function(obj) {
		var fn = this;
		return function() {
			return fn.apply(obj, arguments);
		};
	},
	listen: function(obj) {
		var fn = this;
		return function(event) {
			fn.call(obj, event || window.event);
		};
	}
});

extend(String.prototype, {
	camelCase: function() {
		return this.replace(/-\D/gi, function(match){
			return match.charAt(match.length - 1).toUpperCase();
		});
	},
	trim: function() {
		return this.replace(/^(\s|\r|\n|\r\n)*|(\s|\r|\n|\r\n)*$/g, '');
	},
	tranColor: function() {
		var str = this;
		var regColor = /rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/i;
		while (m = regColor.exec(str)) {
			var s = '#';
			for(i = 1; i <= 3; i++) {
				var _s = (m[i] - 0).toString(16);
				s += (m[i] < 16) ? ('0' + _s) : _s;
			}
			str = str.replace(regColor, s);
		}
		return str;
	}
});

extend(Array.prototype, {
	indexOf: function(obj) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
		return -1;
	},
	has: function(obj) {
		return this.indexOf(obj) !== -1;
	},
	each: function(fn, obj){
		for (var i = 0; i < this.length ; i++) {
			fn.call(obj, this[i], i);
		}
	}
});

if (typeof Array.prototype.push == 'undefined') {
	extend(Array.prototype,{
		push: function(obj) {
			this[this.length] = obj;
		}
	});
}


var Event = {
	target: function(e) {
		return e.target  || e.srcElement;
	},
	stop: function(e) {
		try{
			e.preventDefault();
			e.stopPropagation();
		} catch(er) {
			e.returnValue = false;
			e.cancelBubble = true;
		}
	}
};


var Element = function(el, arg, doc) {
	doc = doc ? doc : document;
	var attributes = arguments[1] || {};
	if (typeof(el) == 'string') {
		el = reg_gel(doc.createElement(el));
		if (attributes.style) {
			el.setStyle(attributes.style);
			attributes.style = null;
		}
		extend(el, attributes);
	}
	return el;
};

Element.prototype = {
	clean: function() {
		for (var i = 0; i < this.childNodes.length; i++) {
			var node = this.childNodes[i];
			if (node.nodeType == 3 && /\s/.test(node.nodeValue)) this.removeChild(node);
		}
		return this;
	},
	addEvent: function(eventName, fn) {
		fn = fn.listen(this);
		var el = this;
		Unload.listeners.push([el, eventName, fn]);
		
		if (this.addEventListener) {
			if (eventName.toLowerCase() == 'onmousewheel') {
				eventName = 'DOMMouseScroll';
			}
			this.addEventListener(eventName, fn, false);
		} else if(this.attachEvent) {
			this.attachEvent('on' + eventName, fn);
		}
		return this;
	},
	addEvents: function(arg) {
		for (var i in arg) {
			this.addEvent(i, arg[i]);
		}
		return this;
	},
	addClass: function(className) {
		if (className && !this.hasClass(className)) {
			this.className += (this.className ? ' ' : '') + className;
		}
		return this;
	},
	hasClass: function(className) {
		return this.allClass().has(className);
	},
	allClass: function() {
		return this.className.trim().split(/\s+/);
	},
	dropClass: function(className) {
		var classes = this.allClass();
		if (className && classes.has(className)) {
			classes.splice(classes.indexOf(className), 1);
		}
		this.className = classes.join(' ');
		return this;
	},
	dropEvent: function(eventName, fn) {
		if (this.removeEventListener) {
			this.removeEventListener(eventName, fn, false);
		} else if (this.detachEvent) {
			this.detachEvent('on' + eventName, fn);
		}
		return this;
	},
	within: function(x, y) {
		var o = this.getOffset(), s = this.getSize();
		return (y >= o[1] && y <=  o[1] + s[1] && x >= o[0] && x <=  o[0] + s[0]);
	},
	getOffset: function(absoluteOffset) {
		var el = this, offset = [0, 0];
		do {
			offset[0] += el.offsetLeft || 0;
			offset[1] += el.offsetTop  || 0;
			el = reg_gel(el.offsetParent);
			if (!absoluteOffset && el) {
				p = el.getStyle('position');
				if (p == 'relative' || p == 'absolute') break;
			}
		} while (el);
		el = null;
		return offset;
	},
	setStyle: function(style) {
		var value;
		for (var name in style) {
			value = style[name];
			
			if (name.toLowerCase().trim() == 'opacity') {
				this.setOpacity(value);
			} else if (value !== '' && !isNaN(value)) {
				value += 'px';
			}
			try{
				this.style[name.camelCase()] = value;
			} catch(e) {}
		}
		return this;
	},
	getStyle: function(style) {
		var cStyle = style.camelCase();
		var value = this.style[cStyle];
		if ((typeof value == 'undefined' || value == '')) {
			if (document.defaultView) {
				value = document.defaultView.getComputedStyle(this, null).getPropertyValue(style);
				if (Env.Opera && (style == 'width' || style == 'height')) {
					value = '';
				}
			} else if (this.currentStyle) {
				value = this.currentStyle[cStyle];
			}
			if (['margin', 'padding'].has(cStyle) && value == '') {
				return [this.getStyle(cStyle + '-top') || 0, this.getStyle(cStyle + '-right') || 0, this.getStyle(cStyle + '-bottom') || 0, this.getStyle(cStyle + '-left') || 0].join(' ');
			}
		}
		if (typeof value == 'undefined') value = '';
		return value.toString().tranColor();
	},
	setOpacity: function(opacity) {
		opacity = parseFloat(opacity);
		if (Env.IE) {
			this.style.filter = (opacity >= 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
		} else {
			this.style.opacity = this.style['MozOpacity'] = opacity;
		}
		return this;
	},
	getSize: function() {
		if (this.style.display.toLowerCase() !== 'none') {
			return [this.offsetWidth, this.offsetHeight];
		}
		var oV = this.style.visibility, oP = this.style.position;
		this.setStyle({visibility: 'hidden', position: 'absolute', display: 'block'});
		var oSize= [this.offsetWidth, this.offsetHeight];
		this.setStyle({visibility: oV, position: oP, display: 'none'});
		return oSize;
	}

};

extend(document, Element.prototype);
extend(document, {
	getScroll: function() {
		return [
			document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset || 0,
			document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset || 0
		];
	}
});


function reg_gel(el, doc) {
	doc = doc ? doc : document;
	if (typeof(el) == 'string') {
		el = doc.getElementById(el);
	}
	if (el && ((el.nodeName && el.nodeType == 1) || el.nodeType == 9)) {
		if (Unload.elements.has(el)) {
			return el;
		}
		if (typeof el.addEvent == 'undefined') {
		
			extend(el, Element.prototype);
		}
		Unload.elements.push(el);
		return el;
	}
	return false;
}

function $s(options, att, doc) {
	this.options = extend({
		tag: '*',
		parent: document,
		nested: true
	}, options || {});
	
	this.att = att || {};
	if (typeof this.att.id !== 'undefined') {
		return reg_gel(this.att.id);
	}
	var tag = this.options.tag ? this.options.tag.toLowerCase() : '*';
	if (!this.options.parent || !this.options.parent.nodeType) {
		this.options.parent = doc ? doc : document;
	}
	var result = [];
	var els = this.options.nested ? this.options.parent.getElementsByTagName(tag) :  this.options.parent.childNodes;
	Outer:
	for (var i =0; i < els.length; i++) {
		if (!this.options.nested && (els[i].nodeName.toLowerCase() !== tag || els[i].nodeType !== 1)) {
			continue;
		}
		for (var att in this.att) {
			var att1 = att;
			att = att.toLowerCase();
			if (att === 'for') {
				att1 = 'htmlFor';
			}
			if (!(att == 'class' && els[i].className.trim().split(/\s+/).has(this.att[att])) && els[i][att1] !== this.att[att]) {
				continue Outer;
			}
		}
		result.push(reg_gel(els[i]));
	}
	return result;
}

var Load = [];
var Unload = {
	events: [],
	elements: [],
	listeners: [],
	functions: [],
	unload: function() {
		var i;
		for (i = 0; i < Unload.functions.length; i++) {
			Unload.functions[i]();
		}
		for (i = 0; i < Unload.listeners.length; i++) {
			var el = Unload.listeners[i][0];
			var eventName = Unload.listeners[i][1];
			var fn = Unload.listeners[i][2];
			if (el.dropEvent) {
				el.dropEvent(eventName, fn);
			}
			Unload.listeners[i][0] = null;
			Unload.listeners[i][2] = null;
		}
		el = null;
		fn = null;
		for (i = 0; i < Unload.elements.length; i++) {
			Unload.elements[i] = null;
		}
		Unload = null;
		for (i = 0; i < Load.length; i++) {
			Load[i] = null;
		}
		Load = null;
	}
};

window.addEvent = Element.prototype.addEvent;
window.addEvent('unload', Unload.unload);

/*
 * Ajax object
 */
var X = function(n) {
	this.options = extend({
		method: 'post',
		url: null,
		vars: {},
		timeOut: 60000,
		evalScripts: false,
		onStart: null,
		onLoad: null,
		onFail: null,
		onTimeout: null
	}, arguments[0] || {});
	this.options.method = this.options.method.toLowerCase();
	
	['Start', 'Load', 'Fail', 'Timeout'].each(function(v, i) {
		if (this.options['on' + v]) this['on' + v] = this.options['on' + v];
	}, this);
	this.reset().setVars(this.options.vars);
	return this;
};
 
X.prototype = {
	reset: function() {
		clearTimeout(this.timer);
		this.loading = false;
		this.data = '';
		this.vars = {};
		return this;
	},
	getXmlHttp: function() {
		if (window.XMLHttpRequest) {
			return new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			var a = ['Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP.1.0', 'Microsoft.XMLHTTP.1', 'Microsoft.XMLHTTP'];
			for (var i = 0; i < a.length; i++) {
				try {
					return new ActiveXObject(a[i]);
				} catch (e) {}
			}
		}
		return false;
	},
	setVars: function(vars) {
		var tempVars = this.vars, t;
		if (vars) {
			forEach(vars, function(v, k) {
				if (v instanceof Array) {
					t = [];
					v.each(function(vv) {
						t.push(encodeURIComponent(vv));
					})
				} else {
					t = encodeURIComponent(v);
				}
				tempVars[encodeURIComponent(k.trim())] = t;
			});
		}
		this.vars = tempVars;
		return this;
	},
	getData: function() {
		var temp = [];
		forEach(this.vars, function(v, k) {
			if (k !== '') {
				if (v instanceof Array) {
					v.each(function(vv) {
						temp.push(k + '=' + vv);
					});
				} else {
					temp.push(k + '=' + v);
				}
			} 
		});
		this.data = temp.join('&');
		return this;
	},
	initProxy: function(rDomain) {
		try{
			document.domain = window.location.hostname.split('.').reverse().slice(0,2).reverse().join('.');
		} catch(e) {}
		
		var proxyUrl = 'http://' + rDomain + '/ajaxproxy.htm';
		if (!this.proxyIFrame) {
			this.proxyIFrame = new Element('IFRAME', {src: 'about:blank', style: {display: 'none'}});
			this.proxyIFrame.addEvent('load', this.proxyIFrameLoaded.bind(this));
			document.body.insertBefore(this.proxyIFrame, document.body.childNodes[0]);
			this.proxyIFrame.src = proxyUrl;
		} else {
			//this.proxyXmlhttp = this.proxyIFrame.contentWindow.getTransport();
			//this.send();
			this.proxyIFrameLoaded();
		}
	},
	proxyIFrameLoaded: function() {
		this.xmlhttp = this.proxyIFrame.contentWindow.getTransport();
		this.send();
	},
	getUrlDomain: function(url) {
        var a = new Element('a');
        a.href = url;
        return a.hostname.toLowerCase();
	},
	send: function(url) {
		if (this.loading) return;
		if (url) this.options.url = url;
		
		
		var wDomain = document.domain.toLowerCase(), rDomain = this.getUrlDomain(url);
		if (wDomain !==  rDomain) {
			if (!this.xmlhttp) {
				this.initProxy(rDomain);
				return;
			} 
		} else {
			if (!this.xmlhttp) this.xmlhttp = this.getXmlHttp();
		}
		
		if (this.xmlhttp) {
			this.loading = true;
			this.onStart();
			var self = this;
			this.xmlhttp.onreadystatechange = function() {
				if (self.xmlhttp.readyState == 4) {
					self.response = self.xmlhttp.responseText;
					if (self.options.evalScripts) self.evalScripts(self.response);
					self.status = self.xmlhttp.status;
					self.reset().onLoad();
					self.xmlhttp.onreadystatechange = function() {};
					self.xmlhttp = null;
					self = null;
				} 
			};
		} else {	
			this.onFail();
			return this;
		}
		
		this.setVars({'rndval': new Date().getTime()}).getData();
		if (this.options.method == 'get') {
			this.xmlhttp.open('get', this.options.url + '?' + this.data, true);
		} else {
			this.xmlhttp.open('post', this.options.url, true);
			this.xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			if (this.xmlhttp.overrideMimeType) this.xmlhttp.setRequestHeader('Connection', 'close');
		}
		this.xmlhttp.send(this.data);
		this.timer = setTimeout(this.onTimeout.bind(this), this.options.timeOut); 
		return this;
	},
	abort: function() {
		if (this.loading) this.xmlhttp.abort();
	},
	evalScripts: function(text) {
		if(scripts = text.match(/<script[^>]*?>[\S\s]*?<\/script>/g)) {
			forEach(scripts, function(script) {
				try{
					eval(script.replace(/^<script[^>]*?>/, '').replace(/<\/script>$/, ''));
				} catch(e) {}
			});
		}
	},
	getJSON: function() {
		if (this.response !== '') {
			try{
				return eval('(' + this.response + ')');
			} catch(e) {};
		}
		return false;
	},
	onStart: function() {},
	onLoad: function() {},
	onFail: function() {},
	onTimeout: function() {}
};





/*
 * Auto Complete object
 */


var AutoComplete = function(el) {
	this.el = reg_gel(el);
	this.el.autocomplete = 'off';
	
	this.options = extend({
		url: null,
		form: null,
		mode: 'request'
	}, arguments[1] || {});
	
	if (this.options.form) this.options.form = reg_gel(this.options.form);

	this.panel = new Element('ul', {'className': 'autocomplete_panel', 'style': {
		'border': '1px solid #ccc',
		'background': '#f5f5f5',
		'padding': '1px',
		'margin': '0',
		'list-style': 'none',
		'position': 'absolute',
		'display': 'none'
	}});
	
	var body = document.body;
	_el  = body.childNodes[0];
	body.insertBefore(this.panel, _el);
	this.el.addEvents({'keydown': this.keydown.bind(this), 'keyup': this.keyup.bind(this), 'blur': this.hidePanelBlur.bind(this)});
	document.addEvent('mousedown', this.hidePanel.bind(this));
	window.addEvent('blur', this.hidePanel.bind(this));
	
	this.items = [];
	this.show = false;
};

AutoComplete.prototype = {
	keydown: function(e) {
		if (e.keyCode == 13) {
			Event.stop(e);
			return false;
		}
	},
	keyup: function(e) {
		if (this.move(e.keyCode, e) === false) {
			this.update();
			Event.stop(e);
		}
	},
	move: function(keyCode, e) {
		if (this.el.value.trim() === '') return;
		if (keyCode == 27) {
			this.hidePanel();
		} else if (keyCode == 38) {
			this._move(-1);
		} else if (keyCode == 13) {
			this[(this.show === true) ? 'hidePanel' : 'showPanel']();
		} else if (keyCode == 40) {
			this._move(1);
		} else {
			return false;
		}
		return true;
	},
	_move: function(direction) {
		var c, l = this.items.length;
		
		if (!this.show) {
			this.panel.style.display = 'block';
			this.show = true;
			return this._move(direction);
		}
		
		if (typeof(this.currentItemIndex) == 'undefined') {
			this.currentItemIndex = -1;
		} 
		c = this.currentItemIndex + direction;
		if (c < -1) c = l - 1;
		
		if (this.items[this.currentItemIndex]) this.items[this.currentItemIndex].setStyle({'background': ''});
		
		if (c < 0 || c >= l ) {
			this.el.value = this.value;
			this.currentItemIndex = -1;
		} else {
			this.el.value = this.items[c].value;
			this.items[c].setStyle({'background': '#d2e3ff'});
			this.currentItemIndex = c;
		}
	},
	update: function() {
		this.value = this.el.value.trim();
		var v = this.value, prefix, mailbox;
		if (v !== '' && /^[^@]+@.+$/i.test(v)) {
			prefix = v.replace(/@.*$/, '');
			
			mailbox = v.replace(/^[^@]+@/, ''); 
			if  (prefix !== '' && /^yah/i.test(mailbox) && ('yahoo.com.cn'.indexOf(mailbox) === 0 || 'yahoo.cn'.indexOf(mailbox) === 0)) {
				
				this.valueItems = [v, [prefix + '@yahoo.com.cn', prefix + '@yahoo.cn', prefix + '@yahoo.com']];
				this.showPanel();
			} else {
				this.hidePanel();
			}
		} else {
			this.hidePanel();
		}
	},
	showPanel: function() {
		if (!this.valueItems) return;
		var p = this.el.getOffset(true), s = this.el.getSize();
		
		items = this.valueItems[1];
		
		this.panel.innerHTML = '';
		var i, l = items.length, item, li, a;
		
		if (l < 1) {
			this.hidePanel();
			return;
		}
		this.items = [];
		this.currentItemIndex = -1;
		
		for (i = 0; i < l; i++) {
			item = items[i];
			li = new Element('li', {style: {
			}});
			a = li.appendChild(new Element('span', {innerHTML: item, style: {
				'line-height': '1.8em',
				'display': 'block',
				'padding': '0 5px',
				'cursor': 'pointer'
				}}));
			a.addEvents({'mouseover': function(){if (this.getStyle('background-color') == '#d2e3ff') return; this.style.backgroundColor = '#fff'}, 'mouseout': function(){if (this.getStyle('background-color') == '#d2e3ff') return; this.style.backgroundColor = ''}});
			a.value = item;
			a.addEvent('click', this.setValue.bind(this));
			this.items.push(a);
			
			this.panel.appendChild(li);
		}
		
		this.show = true;
		this.panel.setStyle({'display': 'block', 'left': p[0], 'top': p[1] + s[1] - 1, 'width': s[0] - 4});
		this.panel.style.zIndex = 500;
	},
	hidePanelBlur: function(e) {
		setTimeout(this.hidePanel.bind(this), 500);
	},
	hidePanel: function(e, forceHide) {
		if (e && !forceHide) {
			var s = document.getScroll();
			if (this.panel.within(e.clientX + s[0], e.clientY + s[1])) {
				return;
			}
		}

		this.show = false;
		if (this.items[this.currentItemIndex]) this.items[this.currentItemIndex].setStyle({'background': ''});
		this.currentItemIndex = -1;
		this.panel.setStyle({'display': 'none'});
		
	},
	setValue: function(e) {
		var el = Event.target(e);
		if (e.nodeName == 'LI') el = el.childNode[0];
		this.el.value = el.value;
		this.hidePanel(null, true);
		this.el.focus();
		Event.stop(e);
	}
};

/* register functions*/

function strlen(str) {
	var len = 0;
	for ( var i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 255) {
			len += 2;
		} else {
			len++;
		}
	}
	return len;
}

function chinese(str) {
	var count = 0;
	for ( var i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 255)
			count++;
	}
	return count;
}

var LoginCheck = function() {
	this.email = reg_gel('email').addEvents({'focus': this.emailFocus.bind(this), 'blur': this.emailBlur.bind(this)});
	this.emailFocus();
	this.emailBlur();

};
LoginCheck.prototype = {
	emailFocus: function() {
		if (this.email.value == '用户邮箱/手机号/用户名') {
			this.email.value = '';
			this.email.style.color = '#333';
		}
	},
	emailBlur: function() {
		if (this.email.value == '') {
			this.email.value = '用户邮箱/手机号/用户名';
			this.email.style.color = '#888';
		}
	}
};
var defaultTip = {
	'regEmail': '请输入正确的邮箱，完成注册',
	'nicknameId': '6-10位字母或数字，推荐用<b style="color:#f00;">QQ</b>号注册',
	'regMobile':'请输入真实的手机号',
	'pwd': '密码必须由6-20个字符组成',
	'name': '请输入<span style="color: red;font-weight: bold">真实中文姓名</span>，方便朋友查找',
	'icode': '请输入验证码'
};

var FORM_AUTH_URL = 'http://reg.renren.com/AjaxRegisterAuth.do';

var RegCheck = function() {
	this.form = reg_gel('regform').addEvent('submit', this.checkForm.bind(this));
	if (reg_gel('regEmail')) reg_gel('regEmail').addEvents({'focus': this.showEmailTip.bind(this), 'blur': this.checkEmail.bind(this)});
	if (reg_gel('regMobile')) reg_gel('regMobile').addEvents({
		'focus': this.showMobileTip.bind(this), 
		'blur': this.checkMobile.bind(this),
		'keyup': this.changeMobilechangeMobile.bind(this)
		});
	if(reg_gel('btn_getcode')) {
		reg_gel('btn_getcode').addEvent('click', this.getCode.bind(this));
		this.changeMobilechangeMobile();
	}
	if(reg_gel('re_getcode'))reg_gel('re_getcode').addEvent('click', this.getCode.bind(this));
	reg_gel('name').addEvents({'focus': this.shownameTip.bind(this), 'blur': this.checkUsername.bind(this)});
	reg_gel('pwd').addEvents({'blur': this.checkPassword.bind(this), 'focus': this.showPassWordTip.bind(this)});
	if(reg_gel('icode'))reg_gel('icode').addEvents({'focus': this.showCodeTip.bind(this), 'blur': this.hideCodeTip.bind(this)});
	if(reg_gel('recommend'))reg_gel('recommend').addEvents({'focus': this.hideRecommendTips.bind(this), 'blur': this.showRecommendTips.bind(this)});
	if(reg_gel('refriend'))reg_gel('refriend').addEvents({'focus': this.hideRefriendTips.bind(this), 'blur': this.showRefriendTips.bind(this)});
		
	var errorDiv = $s({tag: 'div'}, {'class': 'errors_div'});
	if (errorDiv && errorDiv.length > 0) showPop();
	
	for (tip in defaultTip) {
		var t = reg_gel(tip);
		if (t) t.setAttribute('autocomplete', 'off');
	}
	
	if (reg_gel('regEmail')) new AutoComplete('regEmail');
	
	this.useDate = false;
	
	this.defaultShowTip = (typeof defaultShowTip === 'undefined') ? false : true;
	if (this.defaultShowTip) {
		for (tip in defaultTip) {
			this.showRegMessage(tip, defaultTip[tip]);
		}
	}
	
	var genders = document.getElementsByName('gender');
	if (genders && genders.length > 0) {
		for ( var i = 0; i < genders.length; i++) {
			reg_gel(genders[i]).addEvent('click', this.checkGender.bind(this));
		}
	}
	
	if (reg_gel('email')) {
		new LoginCheck();
	}
	if (reg_gel('d_xid')) {
		this.useId = true;
		reg_gel('nicknameId').addEvents({'focus': this.showUserIdTip.bind(this), 'blur': this.checkUserId.bind(this)});
	}
	if (reg_gel('d_mobile')) {
		this.regMobile = true;
		reg_gel('regMobile').addEvents({'focus': this.showMobileTip.bind(this), 'blur': this.checkMobile.bind(this)});
	}
	
	this.regType = 'regEmail';
	
	if (reg_gel('xid_reg_handle')) {
		reg_gel('xid_reg_handle').addEvent('click', this.switchTypeId.bind(this));
	}
	if (reg_gel('regmail_reg_handle')) {
		reg_gel('regmail_reg_handle').addEvent('click', this.switchTypeEmail.bind(this));
	}
	
	if (reg_gel('p_birthday')) {
		this.birthYear = reg_gel(this.form.birth_year).addEvent('change', this.chageDate.bind(this));
		this.birthMonth = reg_gel(this.form.birth_month).addEvent('change', this.chageDate.bind(this));
		this.birthDay = reg_gel(this.form.birth_day).addEvent('change', this.chageDate.bind(this));
		this.chageDate();
	}
};

RegCheck.prototype = {
	switchTypeId: function(e) {
		reg_gel('d_xid').style.display = 'block';
		reg_gel('d_email').style.display = 'none';
		this.regType = 'userId';
		if (reg_gel('accType')) reg_gel('accType').value = '2';
		if (e) Event.stop(e);
	},
	switchTypeEmail: function(e) {
		reg_gel('d_email').style.display = 'block';
		reg_gel('d_xid').style.display = 'none';
		this.regType = 'regEmail';
		if (reg_gel('accType')) reg_gel('accType').value = '1';
		if (e) Event.stop(e);
	},
	chageDate: function() {
		var year = parseInt(this.birthYear.value);
		var month = parseInt(this.birthMonth.value);
		var day = parseInt(this.birthDay.value);
		var monthLength = 30;
		_o = parseFloat(year)/4;

		if ([1, 3, 5,  7, 8, 10, 12].has(month)) {
			monthLength = 31;
		} else if (month == 2) {
			monthLength =  (_o == Math.ceil(_o)) ? 29 : 28;
		}
		this.birthDay.options.length = 0;
		
		this.birthDay.options[0] = new Option('--', '');
		for (var i = 0; i < monthLength; i++) {
			this.birthDay.options[i + 1] = new Option(monthLength - i, monthLength - i);
			if (monthLength - i == day) {
				this.birthDay.options[i + 1].selected = true;
			}
		}
		
		if (this.useId && this.useDate) {
			var cYear = new Date().getFullYear(), uYear;
			if (!isNaN(year)) {
				if (/^17/.test(year)) {
					year = year + 200;
				}
				uYear = cYear - year;
				if (uYear < 18) {
					this.switchTypeId();
				} else {
					this.switchTypeEmail();
				}
			}
		}
		
		if (this.birthYear.value != '' && this.birthMonth.value != '' && this.birthDay.value != '') {
			this.hideRegError('birthday', true);
		}
	},
	showEmailTip: function() {
		if (reg_gel('regEmail').value === '') {
			this.showRegMessage('regEmail', defaultTip['regEmail'], true);
		}
	},
	showUserIdTip: function() {

		if (reg_gel('nicknameId').value === '') {
			this.showRegMessage('nicknameId', defaultTip['nicknameId'], true);
		}
	},
	showMobileTip: function() {
		if (reg_gel('regMobile').value === '') {
			this.showRegMessage('regMobile', defaultTip['regMobile'], true);
		}
	},
	showPassWordTip: function() {
		if (reg_gel('pwd').value === '') {
			this.showRegMessage('pwd', defaultTip['pwd'], true);
		}
	},
	shownameTip: function() {
		if (reg_gel('name').value === '') {
			this.showRegMessage('name', defaultTip['name'], true);
		}
	},
	showCodeTip: function() {
		this.showRegMessage('icode', defaultTip['icode'], true);
	},
	hideCodeTip: function() {
		this.hideRegError('icode');
	},
	checkForm: function(e) {
		var formChecked = true;
		if(reg_gel('regEmail_error_span')){
		if (reg_gel('regEmail_error_span').hasClass('box-error-error') === true  && reg_gel('regEmail').regType === 'regEmail' && formChecked === true && reg_gel('regEmail_error_span').style.display=='block') {
			Event.stop(e);
			return false;
		}
		if (reg_gel('nicknameId_error_span') && formChecked === true  && reg_gel('userId').regType === 'userId' && reg_gel('nicknameId_error_span').style.display=='block' ) {
			Event.stop(e);
			return false;
		}
		if (reg_gel('regMobile_error_span') && formChecked === true && reg_gel('regMobile_error_span').style.display=='block' ) {
			Event.stop(e);
			return false;
		}
		}
		if(reg_gel('name_error_span') && reg_gel('name_error_span').hasClass('box-error-error') === true){
		if (formChecked === true && reg_gel('name_error_span').style.display=='block') {
			Event.stop(e);
			return false;
		}
		}
		if (reg_gel('regEmail') && (reg_gel('regEmail').id === 'regEmail') && this.regType === 'regEmail' && false === this.checkEmail(null, true)) formChecked = false;
		else if (reg_gel('nicknameId') && this.regType === 'userId' && false === this.checkUserId(null, true)) formChecked = false;
		else if (!reg_gel('regEmail') && reg_gel('nicknameId') && false === this.checkUserId(null, true)) formChecked = false;
		else if (reg_gel('regMobile') && false === this.checkMobile(null, true)) formChecked = false;
		else if (false === this.checkPassword(null, true)) formChecked = false;
		else if (false === this.checkUsername(null, true)) formChecked = false;
		else if (false === this.checkGender(null, true)) formChecked = false;
		else if (false === this.checkBirthday(null, true)) formChecked = false;
		else if (reg_gel('icode') && false === this.checkCode(null, true)) formChecked = false;
		if (formChecked === false) {
			Event.stop(e);
			return false;
		}
	},
	checkEmail: function(e, submit) {
		this.hideRegError('regEmail');
		var mailValue = reg_gel('regEmail').value;
		if (!submit && mailValue === ''){
		if(reg_gel('dmmg')) reg_gel('dmmg').style.display = 'none';
		return;
		};
		
		if (mailValue.length > 50) {
			this.showRegError('regEmail', '电子邮箱不能多于50个字符');
			return false;
		} else 
		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (!filter.test(mailValue)) {
			this.showRegError('regEmail', '请输入正确的邮箱，完成注册');
			error = true;
			return false;
		} 
		
		var mailFilter = [/eyou\.com$/i,/yaoyaobuluo\.cn$/i,/love126\.com$/i], k;
		
		if (typeof filterQQ !== 'undefined') {
			mailFilter.push(/qq\.com$/i);
		}
		
		for (k = 0; k < mailFilter.length; k++) {
			if (mailFilter[k].test(mailValue)) {
				this.showRegError('regEmail', '您的邮箱可能收不到激活信');
				return false;
			}
		}
		
		this.checkEmailAjax();
		reg_gel('dmmg').style.display = 'inline';
		return true;
	},
	checkEmailAjax: function() {
		var mailValue = reg_gel('regEmail').value;
		if (!this.x) this.x  = new X();
		this.x.onLoad = this.checkEmailAjaxLoad.bind(this);
		this.x.setVars({
			'authType': 'email',
			'value': mailValue,
			't': (new Date()).getTime()
		});
		this.x.send(FORM_AUTH_URL);
	},
	checkEmailAjaxLoad: function() {
		var rt = this.x.response;
		if (rt != 'OK') {
		if(rt ==''){
		this.hideRegError('regEmail');
		}
		else{
			this.showRegError('regEmail', rt);
			return false;
			}
		}
		else {
			this.hideRegError('regEmail');
			reg_gel('dmmg').style.display = 'inline';
			return true;
		}

	},
	checkUserId: function(e, submit) {
		reg_gel('mg').style.display = 'none';
		this.hideRegError('nicknameId');
		var userId = reg_gel('nicknameId').value;
		if (!submit && userId === '') return;
		if (userId.length > 10) {
			this.showRegError('nicknameId', '帐号不能多于10个字符');
			return false;
		}
		if (!(/^[a-z0-9_]{6,10}$/i.test(userId))) {
			this.showRegError('nicknameId', '6-10位字母或数字，推荐用<b style="color:#f00;">QQ</b>号注册');
			return false;		
		}
//		else if (!(/^[a-z0-9_]{6,20}$/i.test(userId) && /[a-z]+/i.test(userId)) && !reg_gel('birtherror')) {
//			this.showRegError('nicknameId', '6-20位字母及数字，不能为纯数字');
//			return false;
//		} 
		
		this.checkUserIdAjax();
		reg_gel('mg').style.display = 'inline';
		return true;
	},
	checkUserIdAjax: function() {
		var userId = reg_gel('nicknameId').value;
		if (!this.x) this.x  = new X();
		this.x.onLoad = this.checkUserIdAjaxLoad.bind(this);
		this.x.setVars({
			'authType': 'xid',
			'value': userId,
			't': (new Date()).getTime()
		});
		this.x.send(FORM_AUTH_URL);
	},
	checkUserIdAjaxLoad: function() {
		var rt = this.x.response;
		if (rt != 'OK') {
		if(rt ==''){
		this.hideRegError('nicknameId');
		}
		else {
			this.showRegError('nicknameId', rt);
			return false;
			}
		} 
		else {
			this.hideRegError('nicknameId');
			reg_gel('mg').style.display = 'inline';
			return true;
		}
	},
	checkMobile: function(e, submit) {
		reg_gel('rmg').style.display = 'none';
		this.hideRegError('regMobile');
		var regMobile = reg_gel('regMobile').value;
		if (!submit && regMobile === '') return;
		
		if (regMobile.length > 11) {
			this.showRegError('regMobile', '手机号不能多于11个字符');
			return false;
		}
		
		if (!(/^(((13[0-9]{1})|159|(15[0-9]{1})|18|(18[0-9]{1}))+\d{8})$/.test(regMobile))) {
			this.showRegError('regMobile', '请正确填写11位的手机号');
			return false;
		} 
		
		this.checkMobileAjax();
		reg_gel('rmg').style.display = 'inline';
		return true;
		
	},
	checkMobileAjax: function() {
		var regMobile = reg_gel('regMobile').value;
		if (!this.x) this.x  = new X();
		this.x.onLoad = this.checkMobileAjaxLoad.bind(this);
		this.x.setVars({
			'authType': 'email',
			'value': regMobile,
			'stage': '3',
			't': (new Date()).getTime()
		});
		this.x.send(FORM_AUTH_URL);
	},
	checkMobileAjaxLoad: function() {
		var rt = this.x.response;
		if (rt != 'OK') {
			if(rt ==''){
				this.hideRegError('regMobile');
			}
			else{
				this.mobileChecked = false;
				this.showRegError('regMobile', rt);
				return false;
			}
		}
		else {
			this.mobileChecked = true;
			this.hideRegError('regMobile');
			reg_gel('rmg').style.display = 'inline';
			return true;
		};
	},	
	getCode: function(e,submit) {
		if (!this.mobileChecked) return;
		var regMobile = reg_gel('regMobile').value;
		if (!submit && regMobile === '') return;
		if (!submit) this.getCodeAjax();
		return true;
	},
	getCodeAjax: function() {
		var regMobile = reg_gel('regMobile').value;
		if (regMobile === '') {
			return false;
		}
		var url = 'http://reg.renren.com/ajax-mobile-code.do?opt=1&mn='+regMobile;
		this.codeAjax  = new X();
		this.codeAjax.send(url);
		reg_gel('btn_getcode').value = '验证码已经发送';
		reg_gel('btn_getcode').style.background = '#ccc';
		reg_gel('btn_getcode').style.cursor = 'default';
		reg_gel('btn_getcode').disabled = 'disabled';
	},
	changeMobilechangeMobile: function() {
		this.setGetcodebuttonDisabled(/^(1(3|5|8)[0-9]{9})$/.test(reg_gel('regMobile').value.trim()) ? false : true);
	},
	setGetcodebuttonDisabled: function(disabled) {
		if (disabled) {
			reg_gel('btn_getcode').disabled = 'disabled';
			reg_gel('btn_getcode').value = '免费获取验证码';
			reg_gel('btn_getcode').style.background = '#ccc';
			reg_gel('btn_getcode').style.cursor = 'default';
		} else {
			reg_gel('btn_getcode').disabled = '';
			reg_gel('btn_getcode').value = '免费获取验证码';
			reg_gel('btn_getcode').style.background = '#005EAC';
			reg_gel('btn_getcode').style.cursor = 'pointer';
		}
	},
	changeMobile:function(e, submit){
		var regMobile = reg_gel('regMobile').value.trim();
		if (!submit && regMobile === '') return;
		if (!(/^(1(3|5|8)[0-9]{9})$/.test(regMobile))) {
			this.showRegError('regMobile', '请正确填写11位的手机号');
			return false;
		} 	
		
		this.setGetcodebuttonDisabled(true)
	},
	checkUsername: function(e, submit) {
	reg_gel('xmg').style.display = 'none';
		this.hideRegError('name');
		var name =reg_gel('name').value;
		if (!submit && name === '') return;
		if (strlen(name) > 12) { 
			this.showRegError('name', '姓名不能多于6个汉字或者12个字符');
			reg_gel('name_tip').style.display = 'none';
			return false;
		}
		if (chinese(name) < 2) {
		
			this.showRegError('name', '请输入<span style=\"color: red;font-weight: bold\">真实中文姓名</span>');
			reg_gel('name_tip').style.display = 'none';
			return false;
		}
		this.checkUsernameAjax();
		return true;
	},
	checkUsernameAjax: function(e,submit) {
		this.hideRegError('name');
		var nameValue = reg_gel('name').value;
		if (!this.xName) this.xName  = new X();
		this.xName.onLoad = this.checkUsernameAjaxLoad.bind(this);
		this.xName.setVars({
			'authType': 'name',
			'value': nameValue,
			't': (new Date()).getTime()
		});
		this.xName.send(FORM_AUTH_URL);
	},
	checkUsernameAjaxLoad: function() {
		var rt = this.xName.response;
		if (rt != 'OKNAME' && rt != 'OK' ) {
			if(rt ==''){
				this.hideRegError('name');
				reg_gel('xmg').style.display = 'inline';
			}
			else {
				this.showRegError('name', rt);
				return false;
			}
		} else {
			this.hideRegError('name');
			reg_gel('xmg').style.display = 'inline';
			return true;
		}
	},
	checkPassword: function(e, submit) {
		this.hideRegError('pwd');
		var password = reg_gel('pwd').value;
		reg_gel('mmg').style.display = 'none';
		if (!submit && password === '') return;
		password = password.trim();
		if (password === '') {
			this.showRegError('pwd', '请输入密码，不能全部为空格');
			return false;
		}
		if (password.length < 6 || password.length > 20) {
			this.showRegError('pwd', '密码应该在6到20位之间');
			return false;
		}
		if (this.isPwdTooSimple(password) === true) {
			this.showRegError('pwd', '密码过于简单，请修改');
			return false;
		}
		reg_gel('mmg').style.display = 'inline';
		return true;
	},
	checkBirthday: function() {
		if (reg_gel('p_birthday')) {
			this.hideRegError('birthday', true);
			if (this.birthYear.value == '' || this.birthMonth.value == '' || this.birthDay.value == '') {
				if($('birtherror')) {
				this.showRegError('birthday', '请填写真实生日，生日当天有惊喜哦', true);
				}
				else {
				this.showRegError('birthday', '请填写生日', true);
				}
				return false;
			}
		}
		return true;
	},
	checkCode: function() {
		if (!reg_gel('icode')) return true;
		this.hideRegError('icode');
		var code = reg_gel('icode').value;
		if (code === '') {
			this.showRegError('icode', defaultTip['icode']);
			return false;
		}
		return true;
	},
	isPwdTooSimple: function(pwd) {
		var patrn = /^(\w|\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\{|\}|\:|\"|\||\<|\>|\?|\=|\-|\]|\[|\\|\'|\;|\/|\.|\,)\1*$/;
		var num = '12345678909876543210';

		if (pwd.length < 6) {
			return true;
		} else if (patrn.test(pwd) == true) {
			return true;
		} else if (num.indexOf(pwd) != -1) {
			return true;
		} else {
			return false;
		}
	},
	checkGender: function() {
		var genderChecked = false;
		var r = document.getElementsByName('gender');
		for ( var i = 0; i < r.length; i++) {
			if (r[i].checked)
				genderChecked = true;
		}
		if (!genderChecked) {
			this.showRegError('gender', '请选择性别', true);
			return false;
		}
		this.hideRegError('gender', true);
		return true;
	},
	showRegMessage: function(field, message, focus) {
		if (reg_gel(field + '_error_span_i')) {
			reg_gel(field + '_error_span_i').innerHTML = message;
			reg_gel(field + '_error_span').addClass(focus ? 'box-error-focus' : '').dropClass('box-error-error').style.display = 'block';
		}
	},
	showRegError: function(field, message, isPop) {
		reg_gel('gender_error_span').style.display = 'none';
		reg_gel('birthday_error_span').style.display = 'none';
		var errorWrap = reg_gel(field + '_error_span'), nameTip;
		
		if (field === 'name') {
			
			if (!reg_gel('name_tip')) {
				nameTip = new Element('div',{'id':'name_tip', 'innerHTML': '如果系统误判你的姓名，请换个名字先注册，注册后可申请改名', 'style': {'display': 'none', 'clear': 'both', 'color': '#f00'}});
				reg_gel('name_error_span').parentNode.appendChild(nameTip);
				nameTip.style.display = 'none';
			} else {
			}
		}
		
		if (!errorWrap) return;
		if (field == 'regEmail') {
			reg_gel('dmmg').style.display = 'none';
		}
		if (field == 'nicknameId') {
			reg_gel('mg').style.display = 'none';
		}
		if (field == 'regMobile') {
			reg_gel('rmg').style.display = 'none';
		}
		if (field == 'name') {
			reg_gel('xmg').style.display = 'none';
		}
		if (field == 'pwd') {
			reg_gel('mmg').style.display = 'none';
		}
		
		reg_gel(field + '_error_span_i').innerHTML = message;
		errorWrap.dropClass('box-error-focus').addClass('box-error-error').style.display = 'block';
		if (isPop === true) {
			errorWrap.addClass('box-error-pop');
			var p = reg_gel(errorWrap.parentNode);
			if (p.className == 'input_wrap') {
			}
		};
		

	},
	hideRegError: function(field, isPop) {
		var errorWrap = reg_gel(field + '_error_span');
		if (!errorWrap) return;
		errorWrap.dropClass('box-error-focus').dropClass('box-error-error');
		if (!this.defaultShowTip || isPop === true) {
			errorWrap.style.display = 'none';
			if (field === 'name' && reg_gel('name_tip')) {
				reg_gel('name_tip').style.display = 'none';
			}
		} else {
			if (defaultTip[field]) reg_gel(field + '_error_span_i').innerHTML = defaultTip[field];
		}
	},
	hideRecommendTips:function(){
		if (reg_gel('recommend').nodeName == 'INPUT' && reg_gel('recommend').value == '填写真实目的，获取更优服务'){
		reg_gel('recommend').value = '';
		reg_gel('recommend').style.color = '#000';
		}
	},
	showRecommendTips:function(){
		if (reg_gel('recommend').nodeName == 'INPUT' && reg_gel('recommend').value == ''){
		reg_gel('recommend').value = '填写真实目的，获取更优服务';
		reg_gel('recommend').style.color = '#999';
		}	
	},
	hideRefriendTips:function(){
		if (reg_gel('refriend').value == '介绍你来人人网的好友姓名'){
		reg_gel('refriend').value = '';
		reg_gel('refriend').style.color = '#000';
		}
	},
	showRefriendTips:function(){
		if (reg_gel('refriend').value == ''){
		reg_gel('refriend').value = '介绍你来人人网的好友姓名';
		reg_gel('refriend').style.color = '#999';
		}	
	}	
};
 

function refreshCode() {
	var sr = reg_gel('verifyPic').src.split('&')[0] + '&rnd=';
	reg_gel('verifyPic').src = sr + Math.random();
}

function showPop() {
	if (reg_gel('mask_layer')) reg_gel('mask_layer').style.display = reg_gel('reg_layer').style.display = 'block';
}

if ( !window.XN ){
$ = reg_gel;
var XN = {};
XN.DO = XN.Do = {};
var currentConfirm = null;
XN.DO.confirmHide = function(e){
	if (reg_gel('maskLayer')) reg_gel('maskLayer').style.display = 'none';
	if (reg_gel('dialog')) reg_gel('dialog').style.display = 'none';
	Event.stop(e);
};


XN.DO.confirm = function( message,title,callBack,yes,no,X,Y,w,h ) {
	 var html =  ['<table style="width: 100%; height: 100%;" class="pop_dialog_table">',
			'<tbody>',
				'<tr>',
					'<td class="pop_topleft"></td>',
					'<td class="pop_border"></td>',
					'<td class="pop_topright"></td>',
				'</tr>',
				'<tr>',
					'<td class="pop_border"></td>',
					'<td class="pop_content" id="pop_content">',
						'<div  style="position:relative" id="pop_content_box_wrap"><div id="pop_content_box" style="top:0;left:0;z-index:600;width:100%"><h2><span id="ui_dialog_header"></span></h2>',
						'<div class="dialog_content">',
							'<div id="ui_dialog_body" class="dialog_body"></div>',
							'<div id="ui_dialog_footer" class="dialog_buttons"><input value="确定" id="ui_dialog_button_confirm" class="input-submit" type="button" /></div>',
						'</div></div><iframe id="pop_iframe" style="display:none;position:absolute;top:0;left:0;z-index:500;border:0" frameborder="0"></iframe></div>',
					'</td>',
					'<td class="pop_border"></td>',
				'</tr>',
				'<tr>',
					'<td class="pop_bottomleft"></td>',
					'<td class="pop_border"></td>',
					'<td class="pop_bottomright"></td>',
				'</tr>',
				'</tbody>',
			'</table>'
	].join('');

	
	var maskLayer;
	if (reg_gel('maskLayer')) {
		maskLayer = reg_gel('maskLayer');
		maskLayer.style.display = 'block';
	} else {
		maskLayer = new Element('div', {'id': 'maskLayer'});
		document.body.appendChild(maskLayer);
		maskLayer.setStyle({
			'position':'absolute',
			'top':'0',
			'left':'0',
			'right':'0',
			'bottom':'0',
			'height':'100%',
			'width':'100%'
		});
		maskLayer.style.zIndex = 1000;
	}
	
	if (reg_gel('dialog')) {
		var dialog = reg_gel('dialog');
		dialog.style.display = 'block';
	} else {
		dialog = new Element('div', {'id': 'dialog'});
		dialog.innerHTML = html;
		maskLayer.appendChild(dialog);
		
		dialog.style.display = 'block';		
		reg_gel('ui_dialog_button_confirm').addEvent('click', XN.DO.confirmHide);
		dialog.setStyle({
			'width':'400',
			'margin':'0 auto'
		});
	}
	
	reg_gel('ui_dialog_body').innerHTML = message;
	reg_gel('ui_dialog_header').innerHTML = title ? title : '提示';
	
		if (Env.IE6) {
			var s = reg_gel('pop_content_box').getSize();
			reg_gel('pop_content_box_wrap').setStyle({height: s[1]});
			reg_gel('pop_iframe').setStyle({width: s[0], height: s[1], 'display': 'block'});
			reg_gel('pop_content_box').setStyle({'position': 'absolute'});
		}
	
	var layerHeight = dialog.offsetHeight;
	var scrollTop = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset || 0;
	var windowHeight = window.innerHeight || document.documentElement.clientHeight || 0;
	var top = '217px';
	dialog.style.marginTop = top;
};

function load_jebe_ads() {}
}
XN.Browser = {
	addHomePage: function(url) {
		if(!!(window.attachEvent && !window.opera)){
				document.body.style.behavior = 'url(#default#homepage)';
				document.body.setHomePage(url);
			}else{
			  if(window.clipboardData && clipboardData.setData){
		    clipboardData.setData('text', url);
		  }else{
		    alert( '您的浏览器不允许脚本访问剪切板，请手动设置~' );
            return;
		  }
		  alert('网址已经拷贝到剪切板,请您打开浏览器的选项,\n把地址粘到主页选项中即可~');
		}
		return true;		
	},
	addBookMark: function(url, title){
		var ctrl = (navigator.userAgent.toLowerCase()).indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL';	
		try{
				window.external.addFavorite(url, title || document.title ||  XN.env.siteName + ' - 因为真实, 所以精彩');
		}catch(e){
			try{
				window.sidebar.addPanel(title || document.title || XN.env.siteName + ' - 因为真实, 所以精彩', url, '');
			}catch(e){
				alert('您可以尝试通过快捷键' + ctrl + ' + D 添加书签~');
			}
		}		
	}
};

var ajaxGetUserInfo = function(userId) {
	var url = 'http://reg.renren.com/AjaxGetUserProfileInfo.do';
	if (!this.x) this.x  = new X();
	this.x.onLoad = this.setUserInfor.bind(this);
	this.x.setVars({
		'id': userId
	}).send(url);
};

ajaxGetUserInfo.prototype = {
	setUserInfor: function() {
		var ar = this.x.getJSON();
		this.ar = ar;
		if (!ar) return;
		if (this.isTrue(ar['doing'])) reg_gel('profile-doing').innerHTML = ar['doing'];
		this.show('friend', 1, '共有 <b>' + ar['friend_num'] + '个好友</b>');
		this.show('gossip', 2, '收到了 <b>' + ar['gossip_num'] + '条留言</b>');
		this.show('photo', 3, '上传<b>' + ar['photo_num'] + '张照片</b>');
		this.show('blog', 4, '写了<b>' + ar['blog_num'] + '篇日志</b>');
		if (this.isTrue(ar['head_url'])) reg_gel('profile-head_url').src = ar['head_url'];
	},
	show: function(type, num, html) {
		var el  = reg_gel('profile-' + type + '_num');
		this.isTrue(this.ar[type + '_num']) ? (el.addClass('l_' + num).innerHTML = html) : (el.style.display = 'none');
	},
	isTrue: function(obj) {
		return obj != false && typeof obj != 'undefined' && obj != 'undefined' && obj!= 'null';
	}
};

var PageRegPop = function() {
	links = $s({tag: 'a'}, {'class': 'reg_pop'});
	for (var i = 0; i < links.length; i++) {
		links[i].addEvent('click', this.showPop.bind(this));
	}
};

PageRegPop.prototype = {
	showPop: function(e) {
		XN.DO.confirm('请先完善个人资料后加入。');
		Event.stop(e);
	}
};


var QQCheck = function() {
	var checkHandel = reg_gel('model_submit').addEvent('click', this.sendRequest.bind(this));
	reg_gel('diag_frame').src = 'about:blank';
	this.checking = false;
	this.requestCount = 0;
	this.sendMail = false;
	this.checkError = false;
};

QQCheck.prototype = {
	sendRequest: function(e) {
		if (this.checkError === true && e) {
			Event.stop(e);
			return false;
		}
		if (this.checking === true) return;
		var url = 'http://reg.renren.com/regauditwait-qq.do';
		if (!this.x) this.x  = new X();
		this.x.onLoad = this.checkQQLoad.bind(this);
		this.x.setVars({
			'qe': QQMail
		});
		this.x.send(url);
		this.checking = true;
		
		if (this.sendMail === false) {
			var sendMailRequest = new X();
			sendMailRequest.setVars({
				'email':QQMail,
				'action_id':250112
			});
			sendMailRequest.send('http://reg.renren.com/AjaxRegisterLog.do');
			this.sendMail = true;
		}
	},
	checkQQLoad: function() {
		var response = this.x.getJSON();
		var code = response.code, msg = response.msg;
		this.checking = false;
		this.requestCount++;
		if (this.requestCount <100){
			reg_gel('model_wait').style.display='block';			
			if (code === 0) {
				window.location.href='http://www.renren.com';
			} 
//			if (code === 1) {
//				setTimeout(this.sendRequest.bind(this), 3000);
//				}
			if (code === 2 || code === 3) {
				reg_gel('model_wait').style.display='none';
				reg_gel('model_err').style.display='block';
				reg_gel('model_err').innerHTML = "很抱歉，您的帐户没有通过验证。请选择下面的其他方式验证或重新注册！";
				//reg_gel('model_submit').href='javascript:;';
				this.checkError = true;
				reg_gel('model_submit').setStyle({'background-position': '0 -34px','cursor':'default'})
				return;
				}
			else  {
				setTimeout(this.sendRequest.bind(this), 3000);
			}
		}
		else {
			reg_gel('model_wait').style.display='none';
			reg_gel('model_err').style.display='block';
			reg_gel('model_err').innerHTML = "很抱歉，您的帐户没有通过验证。请选择下面的其他方式验证或重新注册!";
			//reg_gel('model_submit').href='javascript:;';
			this.checkError = true;
			reg_gel('model_submit').setStyle({'background-position': '0 -34px','cursor':'default'})
			
			}
	}
};


