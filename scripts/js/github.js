var Q 			= require('q'),
	_ 			= require('lodash'),
	util 		= require('./util'),
	moment 		= require('moment'),
	xmlbuilder 	= require('xmlbuilder');

function generateFeed(items) {
	var root = xmlbuilder.create('root');

	return _.map(items, function(item) {
		var event = root.ele('div', { class: "event github-event"}),
			updated = item.updated[0],
			timestamp = moment(updated).format(util.TIME_FORMAT);

		event.raw(item.content[0]._);

		return {
			timestamp: moment(updated).format(),
			html: event.toString({ pretty: true })
		};
	});
}

module.exports = {
	feed: function(config) {
		return util.get(config.github)
			.then(util.parseXML)
			.then(function(data) {
				return generateFeed(data.feed.entry);
			});		
	}
}