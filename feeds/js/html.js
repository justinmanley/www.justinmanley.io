var	_ 			= require('lodash'),
	xmlbuilder 	= require('xmlbuilder');

var	outputTypes = [ 'event', 'article', 'archive' ]
	htmlGenerators = _.map(outputTypes, function(outputType) {
		return { type: outputType, generate: require('./htmlbuilders/' + outputType) };
	});

/* Generate html content from a single raw data source. */
module.exports = function(items, src, transform) {
	var root = xmlbuilder.create('root');

	return _.map(items, function(item) {
		var eventInfo = { type: src };

		/* Set up different types of html builders. */
		this._event = root.ele('div', { class: "event " + src + "-event"});
		this._article = root.ele('article', { class: "article" });
		this._archive = root.ele('div', { class: "archive" });

		/* Call the source-specific feed transformer function. */
		eventInfo = _.merge(eventInfo, transform.call(this, item));

		/* Writes each of the different requested types of output. */
		_.each(htmlGenerators, function(output) {
			if (eventInfo[output.type] === true) {
				eventInfo[output.type] = output.generate.call(this, eventInfo);
			}
		}, this);

		return eventInfo;
	});
}