var util 			= require('../util'),
	moment 			= require('moment'),
	generateHTML	= require('../htmlbuilders/htmlbuilder');

function getContent(item) {
	return {
		timestamp: 	moment(item.updated[0]).format(),
		tags: 		readTags(item),
		event: 		this._event.raw(item.content[0]._)
	};
}

function readTags(item) {
	var eventType = /:([a-zA-Z]*)Event\/\d*$/,
		result = eventType.exec(item.id);

	return result ? [result[1].toLowerCase()] : [];
}

module.exports = function(config) {
	return util.get(config.url)
		.then(util.parseXML)
		.then(function(data) {
			return generateHTML(data.feed.entry, config.name, getContent);
		});		
}
