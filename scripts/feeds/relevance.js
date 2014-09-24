var	_ 		= require('lodash'),
	moment 	= require('moment'),
	util 	= require('./util');

/* Input: an array of feeds. */
/* Output: a list of n interleaved feed objects. */

module.exports = function(feed, n) {
	return _.chain(feed)
		.each(calculateRelevance, this)
		.sort(byRelevance)
		.value();
}

function calculateRelevance(item) {
	if (item.body) {
		item.relevance = item.body.length;
	} else {
		item.relevance = 0;
	}

	return item;
}

function calculateAverageFrequency(item) {
	return this.config.src[item.src].frequency;
}

function byRelevance(a, b) {
	return b.relevance - a.relevance;
}