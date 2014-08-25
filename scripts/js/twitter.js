#!/usr/bin/node

var Twitter = require('ntwitter'),
	Q 		= require('q'),
	util 	= require("./util");

var params = {
	screen_name: 'outoftheyards',
	count: 10
};

util.readYAML('data/config/pass/twitter.yml')
	.then(function(config) {
		return Q.fcall(function() { return new Twitter(config); });
	})
	.then(function(twitter) {
		return Q.ninvoke(twitter, 'verifyCredentials')
			.then(function() {
				return Q.ninvoke(twitter, 'getUserTimeline', params);				
			})
			.then(function(timeline) {
				console.log(timeline);
			});
	})
	.done();
