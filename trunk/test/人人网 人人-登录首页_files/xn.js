(function(){
    if ( !window.XN ) XN = {};
	if ( !XN.Browser ) XN.Browser = XN.BORWSER = {};
	XN.Browser.addHomePage = function(url){
		if(!!(window.attachEvent && !window.opera)){
				document.body.style.behavior = 'url(#default#homepage)';
				document.body.setHomePage(url);
			}else{
			  if(window.clipboardData && clipboardData.setData){
		    clipboardData.setData("text", url);
		  }else{
		    alert( '您的浏览器不允许脚本访问剪切板，请手动设置~' );
            return;
		  }
		  alert('网址已经拷贝到剪切板,请您打开浏览器的选项,\n把地址粘到主页选项中即可~');
		}
		return true;		
	};
	XN.Browser.addBookMark = function(url,title){
		var ctrl = (navigator.userAgent.toLowerCase()).indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL';					
		try{
				window.external.addFavorite(url,title || '' + XN.env.siteName + '-因为真实,所以精彩');
		}catch(e){
			try{
				window.sidebar.addPanel(url,title || '' + XN.env.siteName + '-因为真实,所以精彩');
			}catch(e){
				alert('您可以尝试通过快捷键' + ctrl + ' + D 添加书签~');
			}
		}		
	};
})();

function $(s){
	return document.getElementById(s);
}


function isCapsLockOn(e){
	var c = e.keyCode || e.which;
	var s = e.shiftKey;
	if(((c >= 65 && c <= 90) && !s) || ((c >=97 && c <= 122) && s)){
		return true;
	}
	return false;
}

function showMsg(s){
	var el = $('errorMessage');
    if (!el) return; el.style.display =  'block'; el.innerHTML = s; }

function hideMsg(){
	if ( $('errorMessage') ) $('errorMessage').style.display = 'none';
}

function showCapsLockMsg(s){
	var element = $('capsLockMessage');
    if (!element) return;
    if ( element.visible() ) return;
	element.style.display = 'block';
    if ( element._hidetimer )
    {
        clearTimeout(element._hidetimer);
        element._hidetimer = null;
    }
	element._hidetimer = setTimeout(function() {
		element.style.display = 'none';
	}, 3000)
}

function hideCapsLockMsg(){
	if ( $('capsLockMessage') ) $('capsLockMessage').style.display = 'none';
}

if($('loginForm')) $('loginForm').onsubmit = function(){
    $('password').value = XN.string.trim($('password').value);
    $('email').value = XN.string.trim($('email').value);
	function isEmail(str){
		var tmp = '';
		str = str.replace(/^\s+|\s+$/g,"");
		for(var i = 0,j = str.length;i < j;i++){
			var code = str.charCodeAt(i);
			if(code >= 65281 && code <= 65373){
				tmp += String.fromCharCode(code - 65248);
			}else{
				tmp += String.fromCharCode(code);
			}
		}
		tmp = tmp.replace(/·/,'@');
		$('email').value = tmp = tmp.replace(/[。|,|，|、]/g,'.');
		return /^[A-Z_a-z0-9-\.]+@([A-Z_a-z0-9-]+\.)+[a-z0-9A-Z]{2,4}$/.test(tmp);
	}
	if(/^\s*$/.test($('password').value)){
		showMsg('您还没有填写密码');
		$('password').focus();
		return false;
	}

	if(/@/.test($('email').value)){
		if(!isEmail($('email').value)){
			showMsg('E-mail格式错误');
			$('email').focus();
			return false;
		}
	}else{
		if(!/^[\w@_.-]{3,50}$/.test($('email').value)){
			showMsg('帐号格式错误');
			$('email').focus();
			return false;
		}
	}
    try
    {
        var pwd = $('password').value;
        $('password').value = hex_md5(pwd);
        //$('md5').value = 'true';
        if ( XN.browser.IE )
        {
            var input = $element('<input name="enpassword" value="true" type="hidden"/>');
        }
        else
        {
            var input = $element('input');
            input.name = 'enpassword';
            input.value = 'true';
            input.type = 'hidden';
        }
        
        var form = $('password').form;
        $(form).appendChild(input);
    }
    catch(e)
    {
        $('password').value = pwd;
    }
    //return false;
	return true;
}
$('email').onkeypress = function(){hideMsg();};
$('password').onkeypress = function(e) {
        hideMsg();
		if(isCapsLockOn(e || window.event)){
			showCapsLockMsg('大写锁定开启');
		}else{
			hideCapsLockMsg();
		}
	};

$('password').onblur = function(e) {
	hideCapsLockMsg();
}


XN.dom.ready(function()
{
    var em = $( 'email' );

    if ( em.value == '' )
    {
        $( 'email' ).focus();
    }
    else
    {
        $( 'password' ).focus();
    }
});
