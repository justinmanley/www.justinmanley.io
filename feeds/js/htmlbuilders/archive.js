var moment 	= require('moment'),
	util 	= require('../util');

module.exports = function(item) {
	this._archive.ele('div', { class: "archive-title" })
		.text(item.title);

	this._archive.ele('time', { class: "archive-time" })
		.text(moment(item.timestamp).format(util.TIME_FORMAT));

	return this._archive.toString({ pretty: true });
}