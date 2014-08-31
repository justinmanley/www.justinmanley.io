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

Q.all([
		util.readYAML('data/config/feedConfig.yml'),
		util.readYAML('data/config/importance.yml')
	])
	.then(function(configurations) {
		var config = initConfig(configurations),
			dest = configurations[0].dest,
			feeds;

		/* Require the corresponding transformer for each feed in the configuration. */
		feeds = _.map(_.keys(config), function(src) { 
			return { name: src, generate: require('./' + src) }; 
		});

		return Q.all(_.map(feeds, function(feed) { 
				return feed.generate(config[feed.name]); 
			})
		)
		.then(function(feeds) { return _.flatten(feeds); })
		.then(function(feed) {
			return interleave(feed)
				.then(function(randomizedFeed) {
					var writers = [
						util.writeFile(dest.feed, feedToHTML(randomizedFeed)),
						util.writeFile(dest.article, articleToHTML(feed))
					];

					return Q.all(writers);
				})
		})
		.done();
	})
	.done();

/* Merge configuration files. */
function initConfig(configurations) {
	var config = {};

	_.each(configurations[0].src, function(url, name) {
		config[name] = {
			url: url,
			importance: configurations[1][name],
			name: name
		};
	});

	return config;
}