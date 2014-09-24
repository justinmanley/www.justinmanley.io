#!/usr/bin/node

var Q 				= require('q'),
	_ 				= require('lodash'),
	util 			= require('./util'),
	configure		= require('./config');

Q.longStackSupport = true;

var secretFile = 'config/secret.yml',
	configFile = 'config/feeds.yml';

module.exports = function(callback) {
	configure(secretFile, configFile)
		.then(fetchSources)
		.then(function(feeds) { return _.flatten(feeds); })
		.then(writeOutput)
		.then(function(result) {
			if (callback) { callback(result); }
			return result;
		}) 
		.done();
}

function fetchSources() {
	/* Require the corresponding transformer for each feed in the configuration. */
	var feeds = _.map(_.keys(this.config.src), function(src) {
		return { name: src, generate: require('./generators/' + src) }; 
	});

	/* Retrieve raw content and generate arrays of HTML snippets. */
	return Q.all(_.map(feeds, function(feed) {
		console.log('Extracting content from ' + feed.name + '...');
		return feed.generate(this.config.src[feed.name]); 
	}))
}

function writeOutput(feed) {
	/* Serialize arrays of HTML snippets into HTML strings and write to files. */
	return Q.all(writers = _.map(this.config.dest, function(destination, type) {
		var content = require('./htmlbuilders/' + type).serializeFeed.call(this, feed);

		console.log('Writing ' + destination + '...');
		return util.writeFile(destination, content);
	}, this));
}