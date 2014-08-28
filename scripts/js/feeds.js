#!/usr/bin/node

var Q = require('q'),
	_ = require('lodash');

var feedGenerators = [
	require('./github'),
	require('./outoftheyards'),
	require('./publiclab')
];

function interleaveFeeds(feeds) {
	return _.chain(feeds)
		.flatten()
		.map(function(event) { return event.html; })
		.first(10)
		.value();
}

Q.all(_.map(feedGenerators, function(gen) { return gen.feed(); }))
	.then(interleaveFeeds)
	.then(function(feed) {
		_.each(feed, function(event) { console.log(event); });
	})
	.done();