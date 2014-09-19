var fs 		= require('fs'),
	yaml 	= require('js-yaml'),
	Q 		= require('q');
	_ 		= require('lodash');

module.exports = function(secretFile, configFile) {
	return Q.nfcall(fs.readFile, secretFile, 'utf-8')
		.then(function(secretString) {
			return Q.nfcall(fs.readFile, configFile, 'utf-8')
				.then(function(configString) {
					var secret = yaml.safeLoad(secretString),
						configYAML = _.template(configString, { 'secret': secret }),
						config = yaml.safeLoad(configYAML);

						_.each(config.src, function(srcConfig, srcName) {
							srcConfig.name = srcName;
						});
						return config;
				});
		});
}
