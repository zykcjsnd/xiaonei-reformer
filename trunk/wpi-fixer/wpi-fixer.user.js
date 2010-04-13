// Copyright (C) 2010 Xu Zhen
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
	if(location.host=="wpi.renren.com") {
		var ver=/Chrome\/([0-9]+)/i.exec(navigator.userAgent);
		if(ver && parseInt(ver[1])>=5) {
			alert("人人网聊天栏修复器检测到您正在使用 "+ver[1]+".x 版的Google Chrome/Chromium浏览器。目前人人网聊天栏已经可以直接支持您所用的浏览器，无须再使用人人网聊天栏修复器。建议您将其卸载或禁用。");
		} else {
			var script=document.createElement("script");
			script.innerHTML="var nav=new Object;for(i in navigator){nav[i]=navigator[i]};nav.userAgent=nav.userAgent.replace(/Chrome\\/[0-9]+/ig,'Chrome/5');window.navigator=nav;";
			document.documentElement.insertBefore(script);
		}
	}
})();
