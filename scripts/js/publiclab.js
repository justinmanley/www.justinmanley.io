#!/usr/bin/node

/*
 * Example:
 *     scripts/js/publiclab.js <filename>
 *     scripts/js/publiclab.js myfile.html
 */

var fs = require("fs"),
	marked = require("marked"),
	_ = require("lodash"),
	xmlbuilder = require("xmlbuilder"),
	Q = require("q"),
	xml2js = require("xml2js").parseString;

var	filename = process.cwd() + "/" + process.argv[2];

readFile(filename)
	.then(parseXML)
	.then(function(xml) {
		return Q.all(_.map(xml.rss.channel[0].item, function(item) {
			var markdown = parseMarkdown(item.description[0]);
			return { event: item, body: { string: markdown, nodes: markdown.then(parseXML) } };
		}))
	})
	.then(function(items) {
		var output = xmlbuilder.create('root');

		_.each(items, function(item) {
			event = output.ele('div', { class: "event publiclab-event"});

			event.ele('div', { class: "time" })
				.text(item.event.pubDate[0]);

			event.ele('div', { class: "title" })
				.ele('a', { href: "http://publiclab.org/profile/justinmanley" })
				.text(item.event.author)
				.up()
				.ele('span').text("published")
				.up()
				.ele('a', { href: item.event.link })
				.text(item.event.title);

			event.ele('div', { class: "details" })
				.raw(item.body.string);	
		});

		console.log(output.end({ pretty: true }));
	})
	.done();

function readFile(filename) {
	var deferred = Q.defer();

	fs.readFile(filename, { encoding: 'utf-8' }, function(err, data) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(data);
		}
	});

	return deferred.promise;
}

function parseMarkdown(markdownString, options) {
	var deferred = Q.defer(),
		options = options || {};

	marked(markdownString, options, function(err, data) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(data);
		}
	});

	return deferred.promise;
}

function parseXML(xmlString) {
	var deferred = Q.defer();

	xml2js(xmlString, function(err, data) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(data);
		}
	});

	return deferred.promise;
}
