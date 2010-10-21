var EXPORTED_SYMBOLS = ["getUrlContents"];

Components.utils.import("resource://xiaonei-reformer/common.js");

// getUrlContents adapted from Greasemonkey Compiler
// http://www.letitblog.com/code/python/greasemonkey.py.txt
// used under GPL permission
//
function getUrlContents(aUrl) {
	var	ioService = Services.io;
	var	scriptableStream = Services.instream;
	var unicodeConverter = Instances.unicodeConverter;
	unicodeConverter.charset="UTF-8";

	var	channel=ioService.newChannel(aUrl, "UTF-8", null);
	var	input=channel.open();
	scriptableStream.init(input);
	var	str=scriptableStream.read(input.available());
	scriptableStream.close();
	input.close();

	try {
		return unicodeConverter.ConvertToUnicode(str);
	} catch (e) {
		return str;
	}
}

