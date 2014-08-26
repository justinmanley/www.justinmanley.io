#!/usr/bin/node

var Twitter = require('ntwitter'),
	Q 		= require('q'),
	_ 		= require('lodash'),
	util 	= require("./util");

var params = {
	screen_name: 'outoftheyards',
	count: 20
};

function generateFeed(tweets) {
	console.log(tweets);
}

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
				return Q.all(_.map(timeline, function(tweet) {
					var oembedParams = { id: tweet.id_str };
					return Q.ninvoke(twitter, 'getOEmbedStatus', oembedParams);
				}));
			})
			.then(function(embeddedTweets) {
				generateFeed(embeddedTweets);
			})
			.done();
	})
	.done();
