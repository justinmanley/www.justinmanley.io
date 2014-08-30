var Twitter 	= require('ntwitter'),
	Q 			= require('q'),
	_ 			= require('lodash'),
	util 		= require('./util')
	xmlbuilder 	= require('xmlbuilder');

var params = {
	screen_name: 'outoftheyards',
	count: 10
};

function generateFeed(tweets) {
	var root = xmlbuilder.create('root', { headless: true });

	return _.map(tweets, function(tweet) {
		var event = root.ele('div', { class: 'event twitter-event' });

		event.raw(tweet.html);

		return {
			html: event.toString({ pretty: true })
		};
	});
}

module.exports = {
	feed: function() {
		return util.readYAML('data/config/pass/twitter.yml')
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
			});
	}
}
