#!/usr/bin/node

var Q 		= require('q'),
	_ 		= require('lodash'),
	util 	= require('./util');

Q.longStackSupport = true;

var feedGenerators = [
		require('./github'),
		require('./outoftheyards'),
		require('./publiclab')
	];

function interleaveFeeds(feeds) {
	return _.chain(feeds)
		.flatten()
		.value();
}

function feed(feed) {
	return _.chain(feed)
		.first(10)
		.foldl(function(feedString, event) {
			return feedString + event.html;
		}, '')
		.value();
}

/* Gets the most recent article from the feed. */
function article(feed) {
	return _.chain(feed)
		.filter(function(event) { return event.article })
		.first()
		.value()
		.article;
}

util.readYAML('data/config/feedConfig.yml')
	.then(function(config) {
		return Q.all(_.map(feedGenerators, function(gen) { return gen.feed(config.src); }))
			.then(interleaveFeeds)
			.then(function(events) {
				var generators = [
					util.writeFile(config.dest.feed, feed(events)),
					util.writeFile(config.dest.article, article(events))
				];

				return Q.all(generators);
			})
			.done();
	})
	.done();