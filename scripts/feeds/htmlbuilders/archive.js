// archive.js

var moment 	= require('moment'),
	_ 		= require('lodash'),
	util 	= require('../util');

module.exports = {

	serializeFeed: function(feed) {
		return _.chain(feed)
			.filter(function(item){ return item.archive; })
			.sort(util.byDate)
			.foldl(function(feedString, item) {
				return feedString + item.archive;
			}, '')
			.value();
	},

	serializeItem: function(item) {
		this._archive.ele('time', { class: "archive-time", datetime: item.timestamp })
			.text(moment(item.timestamp).format(util.TIME_FORMAT));

		this._archive.ele('a', { href: item.link })
			.ele('div', { class: "archive-title" })
				.text(item.title);
	}
}
