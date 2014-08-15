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
    				'src/*',
                    'src/*/*',
                    'templates/*'
    			],
    			tasks: [ 'build', 'less', 'clean' ]
    		}
    	},
        less: {
            site: {
                files: {
                    "public/css/style.css": "src/less/style.less"
                }
            }
        },
        clean: {
            less: ["public/less"]
        },
        copy: {
            src: 'src/images',
            dest: 'public/images'
        }
    });

    grunt.registerTask('build', function() {
    	var done = this.async(),
    		templateOptions = {
				"engine": "handlebars",
				"directory": ".",
                "partials": {
                    "github": "../feeds/github"
                }
			},
			site = new Metalsmith(__dirname)
                .source('src')
                .destination('public')
				.use(markdown())
	    		.use(templates(templateOptions));

	  	site.build(function(err) {
	  		if (err) throw err;
	  		done();
	  	});

        grunt.task.run('less');
    });

    grunt.registerTask('default', 'watch');
}