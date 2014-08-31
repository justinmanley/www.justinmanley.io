var	_ 		= require('lodash'),
	moment 	= require('moment'),
	util 	= require('./util');

/* Input: an array of feeds. */
/* Output: a list of n interleaved feed objects. */

/* Process: Add each object to an array the number of times specified by its importance indicator. */

module.exports = function(feed, config, n) {
	return new Interleave(feed, config, n);
}

var Interleave = function(feed, config, n) {
	this._config = config;

	var feed = this.normalizeImportance(feed);

	return _.chain(feed)
		.shuffle()
		.filter(this.select)
		.sort(this.eventDate)
		.map(this.addPositionalClass)
		.value();
};

_.merge(Interleave.prototype, {

	getImportance: function(event) {
		var importance;

		if (typeof this._config[event.type].importance === 'number') {
			importance = this._config[event.type].importance;
		} else {
			/* Will need to make this more complex in order to handle GitHub. */
			importance = 1;
		}

		return importance;
	},

	select: function(event) {
		return Math.random() < event.importance ? true : false;
	},

	eventDate: function(event1, event2) {
		var t1 = moment(event1.timestamp),
			t2 = moment(event2.timestamp);

		if (t1.isBefore(t2)) {
			return 1;
		} else if (t1.isAfter(t2)) {
			return -1;
		} else if (t1.isSame(t2)) {
			return 0;
		}
	},

	addPositionalClass: function(event) {
		return event;
	},

	/* Normalizes all importance values to be between zero and one. */
	normalizeImportance: function(feed) {
		var that = this,
			max = _.chain(feed)
			.map(function(event) {
				return that.getImportance(event);
			})
			.max()
			.value();

		return _.map(feed, function(event) {
			event.importance = that.getImportance(event) / max;
			return event;
		});
	}	
});