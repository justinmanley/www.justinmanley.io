var _ 				= require('lodash'),
 	xmlbuilder 		= require('xmlbuilder'),
 	Q 				= require('q'),
 	moment 			= require('moment'),
 	htmlEntities 	= require('html-entities').XmlEntities,
 	util  			= require('./util'),
 	generateFeed 	= require('./feed');

var entity = new htmlEntities();

function generateEvent(item) {
	var time = moment(item.published[0]),
		/* time is an ISO-8601 string, so moment understands it natively. */
		humanReadableTime = time.format(util.TIME_FORMAT),
		summary = item.summary[0]._.replace('[&#8230;]', ' &#8230;')

	this.event.ele('time', { class: 'time' })
		.text(humanReadableTime);


	this.event.ele('div', { class: 'title' })
		.ele('a', { href: 'http://outoftheyards.com' })
			.text('justinmanley')
			.up()
		.ele('span')
			.text(' published ')
			.up()
		.ele('a', { href: item.link[0].$.href })
			.text(entity.decode(item.title[0]._));

	this.event.ele('div', { class: "details" })
		.text(entity.decode(summary));

	return {
		timestamp: time.format(), 
		article: generateArticle(item)
	};
}

function generateArticle(item) {
	var root = xmlbuilder.create('root'),
		article = root.ele('article');

	article.ele('h3', { class: "article-title" })
		.text(item.title[0]._);

	article.ele('div', { class: "article-info" })
		.ele('time', { class: "article-date" })
			.text(moment(item.published[0]).format(util.TIME_FORMAT))
			.up()
		.ele('div', { class: "article-source" })
			.text('Originally published on ')
			.ele('a', { href: item.link[0].$.href })
				.text(' Out of the Yards');

	article.ele('div', { class: "article-body" })
		.raw(entity.decode(item.content[0]._));

	return article.toString({ pretty: true });
}

module.exports = function(config) {
	return util.get(config.url)
		.then(util.parseXML)
		.then(function(xml) {
			return generateFeed(xml.feed.entry, config.name, generateEvent);
		});
}
