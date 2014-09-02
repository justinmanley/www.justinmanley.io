var moment 			= require('moment'),
	HtmlEntities 	= require('html-entities').XmlEntities,
	util			= require('./util');

var entity = new HtmlEntities();

module.exports = function(item) {
	this._article.ele('h3', { class: "article-title" })
		.text(item.title);

	this._article.ele('div', { class: "article-info" })
		.ele('time', { class: "article-date" })
			.text(moment(item.timestamp).format(util.TIME_FORMAT))
			.up()
		.ele('div', { class: "article-source" })
			.text('Originally published on ')
			.ele('a', { href: item.srcLink })
				.text(item.src);

	this._article.ele('div', { class: "article-body" })
		.raw(entity.decode(item.body));

	return this._article.toString({ pretty: true });
}