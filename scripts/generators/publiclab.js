var	_ 				= require("lodash"),
	xmlbuilder 		= require("xmlbuilder"),
	Q 				= require("q"),
	moment			= require("moment"),
	util 			= require("../util"),
	generateHTML	= require('../htmlbuilders/htmlbuilder');

function getContent(item) {
	var time = moment(item[0].pubDate, 'ddd Do MMM YYYY hh:mm:ss Z');

	return {
		timestamp: 	time.format(),
		srcLink: 	'http://publiclab.org/profile/justinmanley',
		src: 		'Public Lab',
		verb: 		'posted',
		link: 		item[0].link,
		title: 		item[0].title,
		body: 		item[1],
		username: 	'justinmanley',
		
		article: 	true,
		event: 		true,
		archive: true
	};
}

module.exports = function(config) {
	return util.get(config.url)
		.then(util.parseXML)
		.then(function(xml) {
			var items = xml.rss.channel[0].item;

			return Q.all(_.map(items, function(item) {
					return util.parseMarkdown(item.description[0]);
				}))
				.then(function(htmls) {
					return Q.all(_.map(htmls, util.parseHTML))
					.then(function(doms) {
						return generateHTML(_.zip(items, htmls, doms), config.name, getContent);
					});
				});
		});
}
