#!/usr/bin/node

var Q = require('q'),
	_ = require('lodash');

var feedGenerators = [
	require('./github'),
	require('./publiclab'),
	require('./outoftheyards')
];

function interpolateFeeds(feeds) {
	_.each(feeds, function(feed) {
		_.each(feed, function(event) {
			console.log(event.timestamp);
		});
	});
}

Q.all(_.map(feedGenerators, function(gen) { return gen.feed(); }))
	.then(interpolateFeeds);