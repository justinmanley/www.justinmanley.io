module.exports = function(grunt) {
	var Metalsmith = require('metalsmith'),
		markdown = require('metalsmith-markdown'),
		templates = require('metalsmith-templates');

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
    	watch: {
    		options: {
    			liveReload: 7777
    		},
    		source: {
    			files: [
    				'Gruntfile.js',
    				'src/*'
    			],
    			tasks: [ 'build' ]
    		}
    	}
    });

    grunt.registerTask('build', function() {
    	var done = this.async(),
    		templateOptions = {
				"engine": "handlebars",
				"directory": "templates",
				"partials": {
					"twitterFeed": "twitterFeed"
				}
			},
			site = new Metalsmith(__dirname)
				.use(markdown())
	    		.use(templates(templateOptions))
	    		.source('src')
	    		.destination('public');

	  	site.build(function(err) {
	  		if (err) throw err;
	  		done();
	  	});
    });

    grunt.registerTask('default', 'watch');
}