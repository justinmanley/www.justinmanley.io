var	_ 			= require('lodash'),
	xmlbuilder 	= require('xmlbuilder');

/* Generate a feed from a single raw data source. */
module.exports = function(items, feedType, transform) {
	var root = xmlbuilder.create('root');

	return _.map(items, function(item) {
		var eventInfo;

		this.event = root.ele('div', { class: "event " + feedType + "-event"});

		/* Call the source-specific feed transformer function. */
		eventInfo = transform.call(this, item);
		eventInfo.type = feedType;
		eventInfo.html = this.event.toString({ pretty: true });

		return eventInfo;
	});
}

function calculateImportance() {

}