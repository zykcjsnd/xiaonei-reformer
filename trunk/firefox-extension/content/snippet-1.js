function loader(obj,direct) {
	if(direct) {
		var docWindow=obj
	} else {
		var docWindow=obj.target.defaultView.window;
		if(docWindow==docWindow.parent) {
			return;
		}
	}
	if(!docWindow.location.href.match("https?://.*\\.renren\\.com|https?://renren\\.com")) {
		return;
	}

