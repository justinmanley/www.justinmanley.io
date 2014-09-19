module.exports = function(grunt) {
    var fs = require('fs'),
        getContent = require('./scripts/feeds/feeds'),

        pkg =   grunt.file.readJSON('package.json'),
        site =  grunt.file.readYAML('config/assemble.yml');

    require('matchdep').filterDev(['grunt-*', 'assemble']).forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        assemble: site,
        watch: {
            options: {
                livereload: true
            },
            source: {
                files: [
                    'Gruntfile.js',
                    'src/**',
                    '!src/assets/bower_components/**'
                ],
                tasks: [ 
                    'newer:copy',
                    'newer:less',
                    'newer:assemble'
                ]
            }
        },
        copy: {
            assets: {
                files: [
                    {
                        cwd: 'src/', 
                        src: ['assets/**', 'demos/**', '!{assets/less,assets/less/*}'], 
                        dest: 'site', 
                        expand: true 
                    }
                ]
            },
            config: {
                files: [
                    {
                        cwd: 'config/',
                        src: 'CNAME',
                        dest: 'site',
                        expand: true // need expand: true when cwd is set
                    }
                ]
            }
        },
        less: {
            site: {
                files: {
                    'site/assets/css/style.css': 'src/assets/less/style.less'
                }
            }
        },
        clean: {
            site: ["site/*.html"]
        }
    });

    grunt.registerTask('default', 'watch');

    grunt.registerTask('get-content', 'Create dynamically-generated content', function() {
        var done = this.async();

        getContent(done);
    });

    grunt.registerTask('build', ['get-content', 'copy', 'less', 'assemble']);
};