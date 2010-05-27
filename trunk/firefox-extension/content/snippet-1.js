function loader(evt) {
	var docWindow=content;
	if(evt) {
		docWindow=evt.target.defaultView.window;
		if(docWindow==docWindow.parent) {
			return;
		}
	}
	if(!docWindow.location.href.match("https?://.*\\.renren\\.com|https?://renren\\.com")) {
		return;
	}

