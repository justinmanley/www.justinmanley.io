var fs 			= require("fs"),
	marked 		= require("marked"),
	xml2js 		= require("xml2js").parseString,
	Q 			= require("q"),
	yaml 		= require("js-yaml"),
	htmlparser 	= require("htmlparser2"),
	http 		= require("http"),
	urlHelper 	= require('url'),
	https 		= require("https"),
	moment 		= require('moment');

module.exports = {

	TIME_FORMAT: 'MMMM D, YYYY',

	parseMarkdown: function(markdownString) {
		return Q.nfcall(marked, markdownString, { xhtml: true });
	},

	parseXML: function(xmlString) {
		return Q.nfcall(xml2js, xmlString);
	},

	readInput: function() {
		var deferred = Q.defer(),
			data = '';

		process.stdin.setEncoding('utf-8');

		process.stdin.on('readable', function() {
			data += process.stdin.read();
		});

		process.stdin.on('end', function() {
			deferred.resolve(data);
		});

		return deferred.promise;
	},

	writeFile: function(filename, data) {
		return Q.nfcall(fs.writeFile, filename, data, 'utf8' );
	},

	readYAML: function(filename) {
		return Q.nfcall(fs.readFile, filename, 'utf-8')
			.then(function(yamlString) {
				return Q.fcall(function() { return yaml.safeLoad(yamlString); });
			});
	},

	parseHTML: function(htmlString) {
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
	},

	get: function(options) {
		var deferred = Q.defer(),
			protocol = typeof options === 'object' ? options.protocol : urlHelper.parse(options).protocol,
			h;

		switch(protocol) {
			case 'https:':
				h = https;
				break;
			case 'http:':
				h = http;
				break;
			default:
				throw new Error("Only http and https protocols are supported.");				
		}

		h.get(options, function(response) {
			var data = [];

			response.setEncoding('utf8');
			response.on('data', function(chunk) {
				data.push(chunk);
			});
			response.on('end', function() {
				deferred.resolve(data.join(""));
			});
		})
		.on('error', function(err) {
			deferred.reject(err);
		});

		return deferred.promise;
	},

	byDate: function(event1, event2) {
		var t1 = moment(event1.timestamp),
			t2 = moment(event2.timestamp);

		if (t1.isBefore(t2)) {
			return 1;
		} else if (t1.isAfter(t2)) {
			return -1;
		} else if (t1.isSame(t2)) {
			return 0;
		}
	}
}
