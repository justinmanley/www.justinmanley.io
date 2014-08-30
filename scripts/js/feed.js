var	_ 			= require('lodash'),
	xmlbuilder 	= require('xmlbuilder');

/* Generate a feed from a single raw data source. */
module.exports = function(items, feedType, transform) {
	var root = xmlbuilder.create('root');

	return _.map(items, function(item) {
		this.feedType = feedType;
		this.event = root.ele('div', { class: "event " + feedType + "-event"});

		return transform.call(this, item);
	});
}