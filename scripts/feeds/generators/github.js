var util 			= require('../util'),
	moment 			= require('moment'),
	_ 				= require('lodash'),
	generateHTML	= require('../htmlbuilders/htmlbuilder')

function getContent(item) {
	var iconClass = 'mega-octicon octicon-mark-github content-src-icon';

	/* Have to include .text('') to force the empty span to render as an open tag and a close tag. */
	this._event.ele('span', { class: iconClass }).text('');
	this._event.raw(item.content[0]._);

	return {
		timestamp: 	moment(item.updated[0]).format(),
		tags: 		readTags(item),
		event: 		this._event.toString({ pretty: true })
	};
}

function readTags(item) {
	var tags = [],
		eventType = /:([a-zA-Z]*)Event\/\d*$/,
		result = eventType.exec(item.id);

	/* Add the event type (issues, watch, gist, pullrequest, etc). */
	if (result) {
		tags.push(result[1].toLowerCase());
	}

	/* Prevent any commits to the www.justinmanley.io repository from showing up on the timeline. */
	if (_.contains(item.content[0]._, 'www.justinmanley.io')) {
		tags.push('www.justinmanley.io');
	}

	return tags;
}

module.exports = function(config) {
	return util.get(config.url)
		.then(util.parseXML)
		.then(function(data) {
			return generateHTML(data.feed.entry, config.name, getContent);
		});		
}
