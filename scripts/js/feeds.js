#!/usr/bin/node

var Q 			= require('q'),
	_ 			= require('lodash'),
	util 		= require('./util'),
	interleave 	= require('./interleave');

Q.longStackSupport = true;

function feedToHTML(feed) {
	return _.chain(feed)
		.first(10)
		.foldl(function(feedString, event) {
			return feedString + event.html;
		}, '')
		.value();
}

/* Gets the most recent article from the feed. */
function articleToHTML(feed) {
	return _.chain(feed)
		.filter(function(event) { return event.article })
		.first()
		.value()
		.article;
}

util.readYAML('data/config/feedConfig.yml')
	.then(function(config) {
		var feeds = _.map(_.keys(config.src), function(src) { 
				return { name: src, generate: require('./' + src) }; 
			});

		return Q.all(_.map(feeds, function(feed) { 
				return feed.generate(config.src[feed.name], feed.name); 
			}))
			.then(interleave)
			.then(function(events) {
				var writers = [
					util.writeFile(config.dest.feed, feedToHTML(events)),
					util.writeFile(config.dest.article, articleToHTML(events))
				];

				return Q.all(writers);
			})
			.done();
	})
	.done();