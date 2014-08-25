var marked 	= require("marked"),
	xml2js 	= require("xml2js").parseString,
	Q 		= require("q"),
	htmlparser = require("htmlparser2");

module.exports = {

	parseMarkdown: function(markdownString) {
		return Q.nfcall(marked, markdownString, { xhtml: true });
	},

	parseXML: function(xmlString) {
		return Q.nfcall(xml2js, xmlString);
	},

	readFile: function() {
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
	}
}