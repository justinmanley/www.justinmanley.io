module.exports = function(grunt) {
    var nap = require('nap'),
        fs = require('fs'),
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
                    'site/assets/css/style.css': 'src/assets/less/style.less'
                }
            }
        },
        clean: {
            site: ["site/*.html"]
        }
    });

    grunt.registerTask('default', 'watch');
};