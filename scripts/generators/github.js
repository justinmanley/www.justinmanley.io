var util 			= require('../util'),
	moment 			= require('moment'),
	generateHTML	= require('../htmlbuilders/htmlbuilder')

function getContent(item) {
	var iconClass = 'mega-octicon octicon-mark-github content-src-icon';

	/* Have to include .text('') to force the empty span to render as an open tag and a close tag. */
	this._event.ele('span', { class: iconClass }).text('');
	this._event.raw(item.content[0]._);

	return {
		timestamp: 	moment(item.updated[0]).format(),
		tags: 		readTags(item),
		event: 		this._event.toString({ pretty: true })
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
