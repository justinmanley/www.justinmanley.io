// event.js

var moment 			= require('moment'),
	_ 				= require('lodash'),
	interleave		= require('../interleave'),
	util 			= require('../util');

module.exports = {

	serializeFeed: function(feed) {
		var randomizedFeed = interleave(feed, this._config);

		return _.chain(randomizedFeed)
			.first(10)
			.foldl(function(feedString, item) {
				return feedString + item.event;
			}, '')
			.value();
	},

	serializeItem: function(item) {
		var niceTime 	= moment(item.timestamp).format(util.TIME_FORMAT),
			verb 		= item.verb ? item.verb : 'published'

		this._event.ele('div', { class: 'content-src-icon' }).text('');

		this._event.ele('time', { class: 'time', datetime: item.timestamp })
			.text(niceTime);

		this._event.ele('div', { class: 'title' })
			.ele('a', { href: item.srcLink })
				.text(item.username)
				.up()
			.ele('span')
				.text(' ' + verb + ' ')
				.up()
			.ele('a', { href: item.link })
				.text(item.title);
	}

}