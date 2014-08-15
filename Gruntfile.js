module.exports = function(grunt) {
	var Metalsmith = require('metalsmith'),
		markdown = require('metalsmith-markdown'),
		templates = require('metalsmith-templates');

    var assembleOptions = require('./bugle.json');

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        assemble: assembleOptions,
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
    			tasks: [ 'newer:assemble', 'newer:less' ]
    		}
    	},
        less: {
            site: {
                files: {
                    "site/css/style.css": "assets/less/style.less"
                }
            }
        }
    });

    grunt.registerTask('default', 'watch');
}