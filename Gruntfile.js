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
            site: [ 'src/content/feeds/*.html' ]
        },
        validation: {
            options: {
                reset: true,
                failHard: true,
                relaxerror: [
                    'An img element must have an alt attribute, except under certain conditions. For details, consult guidance on providing text alternatives for images.',
                    'Attribute is not allowed on element time at this point.'                 
                ]
            },
            content: {
                options: { wrapfile: 'test/wrap.html' },
                files: { src: [ 'src/content/feeds/*.html' ] }
            },
            output: {
                files: { src: [ 'site/*.html' ] }
            }
        }
    });

    grunt.registerTask('default', 'watch');

    grunt.registerTask('get-content', 'Create dynamically-generated content', function() {
        var done = this.async();

        getContent(done);
    });

    grunt.registerTask('build', ['clean', 'get-content', 'copy', 'less', 'assemble']);

    grunt.registerTask('test', [ 'validation' ]);
};