var moment 			= require('moment'),
 	util  			= require('../util'),
	generateHTML	= require('../htmlbuilders/htmlbuilder'),
	HtmlEntities 	= require('html-entities').XmlEntities; 

var entity = new HtmlEntities();	

function getContent(item) {
	return {
		body: 		item.content[0]._,
		timestamp: 	moment(item.published[0]).format(),
		srcLink: 	'http://outoftheyards.com',
		src: 		'Out of the Yards',
		link: 		item.link[0].$.href,
		title: 		entity.decode(item.title[0]._),
		username: 	'justinmanley',
		verb: 		'published',

		/* Content types to output */
		article: 	true,
		event: 		true,
		archive: 	true
	};
}

module.exports = function(config) {
	return util.get(config.url)
		.then(util.parseXML)
		.then(function(xml) {
			return generateHTML(xml.feed.entry, config.name, getContent);
		});
}
