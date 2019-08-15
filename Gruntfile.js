/* global Buffer */
/**
 * When using enketo-core in your own app, you'd want to replace
 * this build file with one of your own in your project root.
 */
'use strict';

var nodeSass = require( 'node-sass' );

module.exports = function( grunt ) {
    // show elapsed time at the end
    require( 'time-grunt' )( grunt );
    // load all grunt tasks
    require( 'load-grunt-tasks' )( grunt );

    // Project configuration.
    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),
        concurrent: {
            develop: {
                tasks: [ 'shell:transformer', 'connect:server:keepalive', 'watch' ],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8005,
                    base: [ 'test/forms', 'test/temp', 'build' ]
                }
            },
            test: {
                options: {
                    port: 8000
                }
            }
        },
        jsbeautifier: {
            test: {
                src: [ '*.js', 'src/js/*.js', 'src/widget/*/*.js' ],
                options: {
                    config: './.jsbeautifyrc',
                    mode: 'VERIFY_ONLY'
                }
            },
            fix: {
                src: [ '*.js', 'src/js/*.js', 'src/widget/*/*.js' ],
                options: {
                    config: './.jsbeautifyrc'
                }
            }
        },
        eslint: {
            all: [ '*.js', 'src/**/*.js' ]
        },
        watch: {
            sass: {
                files: [ 'grid/sass/**/*.scss', 'src/sass/**/*.scss', 'src/widget/**/*.scss' ],
                tasks: [ 'style' ],
                options: {
                    spawn: true,
                    livereload: true,
                }
            },
            js: {
                files: [ 'config.json', '*.js', 'src/**/*.js' ],
                tasks: [ 'browserify' ],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },
        karma: {
            options: {
                singleRun: true,
                configFile: 'test/karma.conf.js',
                customLaunchers: {
                    ChromeHeadlessNoSandbox: {
                        base: 'ChromeHeadless',
                        flags: [ '--no-sandbox' ]
                    }
                }
            },
            headless: {
                browsers: [ 'ChromeHeadlessNoSandbox' ]
            },
            browsers: {
                browsers: [ 'Chrome', 'Firefox', 'Safari' ]
            }
        },
        sass: {
            options: {
                implementation: nodeSass,
                sourceMap: false,
                importer: function( url, prev, done ) {
                    // Fixes enketo-core submodule references.
                    // Those references are correct in apps that use enketo-core as a submodule.
                    url = ( /\.\.\/\.\.\/node_modules\//.test( url ) ) ? url.replace( '../../node_modules/', 'node_modules/' ) : url;
                    done( {
                        file: url
                    } );
                },
                // Temporary workaround for SVG tickmarks in checkboxes in Firefox. 
                // See https://github.com/enketo/enketo-core/issues/439
                functions: {
                    'base64-url($mimeType, $data)': function( mimeType, data ) {
                        var base64 = new Buffer( data.getValue() ).toString( 'base64' );
                        var urlString = 'url("data:' + mimeType.getValue() + ';base64,' + base64 + '")';
                        return nodeSass.types.String( urlString );
                    }
                }
            },
            compile: {
                cwd: 'src/sass',
                dest: 'build/css',
                expand: true,
                outputStyle: 'expanded',
                src: '**/*.scss',
                ext: '.css',
                flatten: true,
                extDot: 'last'
            }
        },
        browserify: {
            standalone: {
                files: {
                    'build/js/enketo-bundle.js': [ 'app.js' ],
                    'build/js/obscure-ie11-polyfills.js': [ 'src/js/obscure-ie11-polyfills.js' ]
                },
            },
            options: {
                alias: {},
            },
        },
        shell: {
            transformer: {
                command: 'node node_modules/enketo-transformer/app.js'
            },
        }
    } );

    grunt.loadNpmTasks( 'grunt-sass' );

    grunt.registerTask( 'transforms', 'Creating forms.json', function() {
        var forms = {};
        var done = this.async();
        var jsonStringify = require( 'json-pretty' );
        var formsJsonPath = 'test/mock/forms.json';
        var xformsPaths = grunt.file.expand( {}, 'test/forms/*.xml' );
        var transformer = require( 'enketo-transformer' );

        xformsPaths
            .reduce( function( prevPromise, filePath ) {
                return prevPromise.then( function() {
                    var xformStr = grunt.file.read( filePath );
                    grunt.log.writeln( 'Transforming ' + filePath + '...' );
                    return transformer.transform( { xform: xformStr } )
                        .then( function( result ) {
                            forms[ filePath.substring( filePath.lastIndexOf( '/' ) + 1 ) ] = {
                                html_form: result.form,
                                xml_model: result.model
                            };
                        } );
                } );
            }, Promise.resolve() )
            .then( function() {
                grunt.file.write( formsJsonPath, jsonStringify( forms ) );
                done();
            } );
    } );

    grunt.registerTask( 'compile', [ 'browserify' ] );
    grunt.registerTask( 'test', [ 'jsbeautifier:test', 'eslint', 'compile', 'transforms', 'karma:headless', 'style' ] );
    grunt.registerTask( 'style', [ 'sass' ] );
    grunt.registerTask( 'server', [ 'connect:server:keepalive' ] );
    grunt.registerTask( 'develop', [ 'style', 'browserify', 'concurrent:develop' ] );
    grunt.registerTask( 'default', [ 'style', 'compile' ] );
};
