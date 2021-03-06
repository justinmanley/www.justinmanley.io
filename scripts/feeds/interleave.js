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
		.filter(this.selectRandomly)
		.sort(util.byDate)
		.map(this.addPositionalClass)
		.value();
};

_.merge(Interleave.prototype, {

	getImportance: function(event) {
		var config = this._config[event.type].importance,
			importance;

		if (typeof config === 'number') {
			importance = config;
		} else if (typeof config === 'object' ) {
			importance = this.getImportanceByTag(event)
		}

		return importance;
	},

	getImportanceByTag: function(event) {
		var config = this._config[event.type].importance,
			importanceMap = {},
			tagsNum = 0,
			total;

		/* Create hashmap of tag / importance pairs. */
		_.each(config, function(tags, rating) {
			_.each(tags, function(tag) {
				importanceMap[tag] = rating;
			});
		});

		total = _.reduce(importanceMap, function(result, num, key) {
			if (_.contains(event.tags, key)) {
				tagsNum += 1;
				return result + num;
			} else {
				return result;
			}
		}, 0);

		/* Check to see if tagsNum === 0 (don't want to divide by zero) */
		return tagsNum ? total / tagsNum : 0;
	},

	selectRandomly: function(event) {
		return Math.random() < event.importance ? true : false;
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