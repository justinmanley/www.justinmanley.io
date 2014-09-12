#!/usr/bin/node

var Q 			= require('q'),
	_ 			= require('lodash'),
	util 		= require('./util'),
	interleave 	= require('./interleave');

Q.longStackSupport = true;

util.readYAML('config/feeds.yml')
	.then(processConfig)
	.then(function(config) {
		/* Require the corresponding transformer for each feed in the configuration. */
		var feeds = _.map(_.keys(config.src), function(src) {
			return { name: src, generate: require('./generators/' + src) }; 
		});

		/* Retrieve raw content and generate arrays of HTML snippets. */
		return Q.all(_.map(feeds, function(feed) {
			return feed.generate(config.src[feed.name]); 
		}))
		.then(function(feeds) { return _.flatten(feeds); })
		.then(function(feed) {
			this._config = config.src;

			/* Serialize arrays of HTML snippets into HTML strings and write to files. */
			var writers = _.map(config.dest, function(destination, type) {
				util.writeFile(
					destination, 
					require('./htmlbuilders/' + type).serializeFeed.call(this, feed)
				);
			}, this);
			return Q.all(writers);
		})
		.done();
	})
	.done();

/* Process configuration file. */
function processConfig(config) {
	_.each(config.src, function(srcConfig, srcName) {
		srcConfig.name = srcName;
	});

	return config;
}