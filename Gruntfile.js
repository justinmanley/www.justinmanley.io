module.exports = function(grunt) {
    var pkg =   grunt.file.readJSON('package.json')
        site =  grunt.file.readJSON('bugle.json');

    require('matchdep').filterDev(['grunt-*', 'assemble']).forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        assemble: site,
    	watch: {
    		source: {
    			files: [
    				'Gruntfile.js',
    				'src/**',
                    'templates/**',
                    'assets/**'
    			],
    			tasks: [ 'newer:assemble', 'newer:copy:assets', 'newer:less' ]
    		}
    	},
        copy: {
            assets: {
                files: [
                    { 
                        src: ['assets/**', '!{assets/less,assets/less/*}'], 
                        dest: 'site', 
                        expand: true 
                    }
                ]
            }
        },
        less: {
            site: {
                files: {
                    'site/assets/css/style.css': 'assets/less/style.less'
                }
            }
        },
        clean: {
            site: ["site/*.html"]
        }
    });

    grunt.registerTask('default', 'watch');
}