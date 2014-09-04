// article.js

var moment 			= require('moment'),
	_ 				= require('lodash'),
	HtmlEntities 	= require('html-entities').XmlEntities,
	util			= require('../util');

var entity = new HtmlEntities();

module.exports = {

	serializeFeed: function(feed) {
		return _.chain(feed)
			.filter(function(event) { return event.article; })
			.sort(util.byDate)
			.first()
			.value()
			.article;
	},

	serializeItem: function(item) {
		/* Override default container. */
		this._article = this.root.ele('article');

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
	}
}