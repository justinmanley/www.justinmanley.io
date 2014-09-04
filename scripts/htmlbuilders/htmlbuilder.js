var	_ 			= require('lodash'),
	xmlbuilder 	= require('xmlbuilder');

var	outputTypes = [ 'event', 'article', 'archive' ]
	htmlGenerators = _.map(outputTypes, function(outputType) {
		return { type: outputType, generate: require('./' + outputType).serializeItem };
	});

/* Generate html content from a single raw data source. */
module.exports = function(items, src, getContent) {
	this.root = xmlbuilder.create('root');

	return _.map(items, function(item) {
		var eventInfo = { type: src };

		/* Set up top-level div for each output type. */
		_.each(htmlGenerators, function(output) {
			this["_" + output.type] = this.root.ele('div', { 
				class: output.type + " " + src + "-" + output.type 
			});
		}, this);

		/* Call the source-specific feed transformer function. */
		eventInfo = _.merge(eventInfo, getContent.call(this, item));

		/* Writes each of the different requested types of output. */
		_.each(htmlGenerators, function(output) {
			if (eventInfo[output.type] === true) {

				/* Create HTML in this.container. */
				output.generate.call(this, eventInfo);

				eventInfo[output.type] = this["_" + output.type].toString({ pretty: true });
			}
		}, this);

		return eventInfo;
	});
}