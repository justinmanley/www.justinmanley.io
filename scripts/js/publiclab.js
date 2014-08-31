var	_ 				= require("lodash"),
	xmlbuilder 		= require("xmlbuilder"),
	Q 				= require("q"),
	moment			= require("moment"),
	util 			= require("./util"),
	generateFeed	= require("./feed");

function generateEvent(item) {
	var humanReadableTime = niceTime(item[0].pubDate)

	/* Get header image, if it exists. */
	if (item[2][0].children[0].attribs) {
		var src = item[2][0].children[0].attribs.src;
		this.event
			.ele('div', { class: "thumbnail" })
			.ele('img', { src: src });
	}

	this.event.ele('div', { class: "time" })
		.text(humanReadableTime);

	this.event.ele('div', { class: "title" })
		.ele('a', { href: "http://publiclab.org/profile/justinmanley" })
			.text(item[0].author)
			.up()
		.ele('span').text(" published ")
			.up()
		.ele('a', { href: item[0].link })
			.text(item[0].title);

	return {
		timestamp: moment(item[0].pubDate).format(),
		article: generateArticle(item)
	};
}

function generateArticle(item) {
	var root = xmlbuilder.create('root'),
		article = root.ele('div', { class: "article" });

	article.ele('h3', { class: "article-title" })
		.text(item[0].title);

	article.ele('div', { class: "article-date"})
		.text(niceTime(item[0].pubDate));

	article.ele('div', { class: "article-souce" })
		.text('Posted on ')
		.up()
		.ele('a', { href: item[0].link })
			.text('PublicLab.org.')

	article.ele('div', { class: "article-body" })
		.raw(item[1]);

	return article.toString({ pretty: true });
}

function niceTime(time) {
	return moment(time, 'ddd Do MMM YYYY hh:mm:ss Z')
		.format(util.TIME_FORMAT);
}

module.exports = function(url, feedType) {
	return util.get(url)
		.then(util.parseXML)
		.then(function(xml) {
			var items = xml.rss.channel[0].item;

			return Q.all(_.map(items, function(item) {
					return util.parseMarkdown(item.description[0]);
				}))
				.then(function(htmls) {
					return Q.all(_.map(htmls, util.parseHTML))
					.then(function(doms) {
						return generateFeed(_.zip(items, htmls, doms), feedType, generateEvent);
					});
				});
		});
}
