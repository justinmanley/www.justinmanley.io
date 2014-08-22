#!/usr/bin/node

/*
 * Example:
 *     scripts/js/publiclab.js <filename>
 *     scripts/js/publiclab.js myfile.html
 */

var fs = require("fs"),
	marked = require("marked"),
	_ = require("lodash"),
	xml2js = require("xml2js");

var parseXML = xml2js.parseString,
	buildXML = new xml2js.Builder({ headless: true }),
	filename = process.cwd() + "/" + process.argv[2];

fs.readFile(filename, { encoding: 'utf-8'}, function(err, data)  {
	if (err) throw err;
	parseXML(data, function(err, result) {
		if (err) throw err;

		// console.log(buildXML.buildObject(result));

		var output = _.map(result.rss.channel[0].item, function(x) {
			return {
				$: { class: "event github-event" },
				div: [
					{ time: x.pubDate, $: { class: "time" } },			
					{ 
						$: { class: "title" }, a: [
							x.author[0],
							x.title[0]
						], 
					},
				]
			};
		});

		console.log(buildXML.buildObject({
			div: { 
				$: { class: "container" },
				div: output
			}
		}));
	});
});