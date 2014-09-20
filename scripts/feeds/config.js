var fs 		= require('fs'),
	yaml 	= require('js-yaml'),
	Q 		= require('q');
	_ 		= require('lodash');

/* 
 * config.js
 * Parses application configuration and secrets and sets this.config and this.secrets.
 */

module.exports = function(secretFile, configFile) {
	return Q.nfcall(fs.readFile, secretFile, 'utf-8')
		.then(function(secretString) { this.secrets = yaml.safeLoad(secretString); })
		.then(function() { return Q.nfcall(fs.readFile, configFile, 'utf-8' ); })
		.then(function(configString) { this.configString = configString; })
		.then(function() {
			/* Mix application secrets into config file. */
			var	configYAML = _.template(this.configString, { 'secret': this.secrets });

			this.config = yaml.safeLoad(configYAML);

			_.each(config.src, function(srcConfig, srcName) {
				srcConfig.name = srcName;
			});
			return this.config;
		});
}
