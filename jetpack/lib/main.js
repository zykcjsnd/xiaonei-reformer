const pagemod = require("page-mod").PageMod;
const utils = require("utils");
const self = require("self");

pagemod({
	include: "*.renren.com",
	contentScriptFile: self.data.url("xiaonei_reformer.user.js"),
	contentScriptWhen: "start",
	onAttach: function(worker) {
		worker.port.on('album', function(data) {
			utils.XNR_album(data);
		})
		worker.port.on("save", function(data) {
			utils.XNR_save(data);
		});
		worker.port.on('get', function(data) {
			try {
				utils.XNR_get(data.method, data.url, function(response) {
					var text = (response.status==200 ? response.text : null);
					worker.port.emit("response", {reqId:data.reqId, data:text});
				});
			} catch(ex) {
				worker.port.emit("response", {reqId:data.reqId, data:null});
			}
		});
		worker.port.on('log', function(data) {
			utils.XNR_log(data);
		});
		worker.port.on('load', function(data) {
			var opts = utils.XNR_load(data);
			worker.port.emit("response", {reqId:data.reqId, data:opts});
		});
	}
});
