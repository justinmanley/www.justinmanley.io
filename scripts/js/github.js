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
	};
}

module.exports = function(url, feedType) {
	return util.get(url)
		.then(util.parseXML)
		.then(function(data) {
			return generateFeed(data.feed.entry, feedType, generateEvent);
		});		
}
