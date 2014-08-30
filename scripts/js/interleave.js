var Q 		= require('q'),
	_ 		= require('lodash'),
	util 	= require('./util');

/* Input: an array of feeds. */
/* Output: a list of n interleaved feed objects. */

/* Process: Add each object to an array the number of times specified by its importance indicator. */

module.exports = function(feeds, n) {
	var eventPool = [],
		feed = _.flatten(feeds);

	return util.readYAML('data/config/importance.yml')
		.then(function(config) {
			_.each(feed, function(event) {
				var importance = getImportance(event, config);

				_.chain(importance)
					.range()
					.each(function() {
						eventPool.push(event);
					});
			});

			return _.shuffle(eventPool);
		});
}

function getImportance(event, config) {
	var importance;

	if (typeof config[event.type] === 'number') {
		importance = config[event.type];
	} else {
		/* Will need to make this more complex in order to handle GitHub. */
		importance = 1;
	}

	return importance;
}
