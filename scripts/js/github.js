var Q 				= require('q'),
	_ 				= require('lodash'),
	util 			= require('./util'),
	moment 			= require('moment'),
	xmlbuilder 		= require('xmlbuilder'),
	url 			= require('url'),
	generateFeed	= require('./feed');

function generateEvent(item) {
	var body,
		title,
		verb;

	switch(item.type) {
		case "PushEvent": 
			body = item.payload.commits[0].body;
			verb = " pushed to ";
			break;
		case "PullRequestEvent":
			body = item.payload.pull_request.body;
			verb = " opened pull request ";
			break;
		case "IssueCommentEvent":
			body = item.payload.issue.body;
			break;
		case "IssuesEvent":
			body = item.payload.issue.title;
			verb = " opened issue ";
			break;
		default:
			throw new Error(item.type + "s are not yet supported.");
			break;
	}

	return {
		body: body,
		timestamp: moment(item.created_at).format(),
		title: '',
		tags: readTags(item)
	};
}

function readTags(item) {
	var eventType = /:([a-zA-Z]*)Event$/,
		result = eventType.exec(item.type);

	return result ? [result[1].toLowerCase()] : [];
}

module.exports = function(config) {
	var githubConfig = url.parse(config.url),
		options = _.merge(githubConfig, { headers: { 
			'user-agent': 'justinmanley.com',
			'accept': 'application/vnd.github.v3+json'
		}});

	return util.get(options)
		.then(JSON.parse)
		.then(function(data) {
			return generateFeed(data, config.name, generateEvent);
		});
		// .then(util.parseXML)
		// .then(function(data) {
		// 	// return generateFeed(data.feed.entry, config.name, generateEvent);
		// });		
}
