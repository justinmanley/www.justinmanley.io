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
	htmlparser = require("htmlparser2"),
	xml2js = require("xml2js").parseString;

var	filename = process.cwd() + "/" + process.argv[2];

readFile(filename)
	.then(parseXML)
	.then(function(xml) {
		var items = xml.rss.channel[0].item;

		return Q.all(_.map(items, function(item) {
			return parseMarkdown(item.description[0]);
		}))
		.then(function(htmls) {
			return Q.all(_.map(htmls, parseHTML))
			.then(function(doms) {
				generateFeed(_.zip(items, htmls, doms));
			});
		});
	})
	.done();

function generateFeed(events) {

	var output = xmlbuilder.create('root', { headless: true });

	_.each(events, function(item) {

		event = output.ele('div', { class: "event publiclab-event"});

		if (item[2][0].children[0].attribs) {
			var src = item[2][0].children[0].attribs.src;
			event
				.ele('div', { class: "thumbnail" })
				.ele('img', { src: src });
		}

		event.ele('div', { class: "time" })
			.text(item[0].pubDate[0]);

		event.ele('div', { class: "title" })
			.ele('a', { href: "http://publiclab.org/profile/justinmanley" })
			.text(item[0].author)
			.up()
			.ele('span').text("published")
			.up()
			.ele('a', { href: item[0].link })
			.text(item[0].title);

		event.ele('div', { class: "details" })
			.raw(item[1]);
	});

	console.log(output.children.toString({ pretty: true }));
}

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

function parseMarkdown(markdownString) {
	var deferred = Q.defer();

	marked(markdownString, { xhtml: true }, function(err, data) {
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

function parseHTML(htmlString) {
	var deferred = Q.defer(),
		handler, parser;

	handler = new htmlparser.DomHandler(function(err, dom) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(dom);
		}
	});

	parser = new htmlparser.Parser(handler);
	parser.write(htmlString);
	parser.done();

	return deferred.promise;
}
