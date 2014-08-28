var fs 			= require("fs"),
	marked 		= require("marked"),
	xml2js 		= require("xml2js").parseString,
	Q 			= require("q"),
	yaml 		= require("js-yaml"),
	htmlparser 	= require("htmlparser2"),
	http 		= require("http"),
	https 		= require("https");

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

	get: function(url) {
		var deferred = Q.defer(),
			protocol = url.slice(0, url.indexOf(":")),
			h;

		switch(protocol) {
			case 'https':
				h = https;
				break;
			case 'http':
				h = http;
				break;
			default:
				throw new Error("Only http and https protocols are supported.");				
		}

		h.get(url, function(response) {
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
	}
}
