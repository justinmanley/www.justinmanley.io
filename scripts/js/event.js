var moment 			= require('moment'),
	util 			= require('./util');

module.exports = function(item) {
	var niceTime 	= moment(item.timestamp).format(util.TIME_FORMAT),
		verb 		= item.verb ? item.verb : 'published'

	this._event.ele('time', { class: 'time' })
		.text(niceTime);

	this._event.ele('div', { class: 'title' })
		.ele('a', { href: item.srcLink })
			.text(item.username)
			.up()
		.ele('span')
			.text(' ' + verb + ' ')
			.up()
		.ele('a', { href: item.link })
			.text(item.title);

	return this._event.toString({ pretty: true });
}