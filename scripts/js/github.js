var Q 				= require('q'),
	_ 				= require('lodash'),
	util 			= require('./util'),
	moment 			= require('moment'),
	xmlbuilder 		= require('xmlbuilder'),
	generateFeed	= require('./feed');

function generateEvent(item) {
	var updated = item.updated[0],
		timestamp = moment(updated).format(util.TIME_FORMAT);

	this.event.raw(item.content[0]._);

	return {
		timestamp: moment(updated).format(),
		tags: readTags(item)
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
			return generateFeed(data.feed.entry, config.name, generateEvent);
		});		
}
