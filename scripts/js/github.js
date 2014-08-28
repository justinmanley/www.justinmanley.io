#!/usr/bin/node

var Q 			= require('q'),
	_ 			= require('lodash'),
	util 		= require('./util'),
	moment 		= require('moment');

function generateFeed(items) {
	return _.map(items, function(item) {
		var updated = item.updated[0],
			timestamp = moment(updated).format(util.TIME_FORMAT);

		return {
			timestamp: timestamp,
			html: item.content[0]._
		};
	});
}

module.exports = {
	feed: function() {
		return util.readYAML('data/config/feeds.yml') 
			.then(function(config) {
				return util.get(config.github);
			})
			.then(util.parseXML)
			.then(function(data) {
				return generateFeed(data.feed.entry);
			});		
	}
}