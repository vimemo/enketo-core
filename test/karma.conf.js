// Karma configuration
// Generated on Mon Mar 16 2015 13:42:33 GMT-0600 (MDT)

var istanbul = require('browserify-istanbul');

module.exports = function( config ) {

    // Force timezone for tests, so that datetime conversion results are predictable
    // Use timezone that doesn't have Daylight Savings Time.
    process.env.TZ = 'America/Phoenix';

    config.set( {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '..',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'browserify', 'jasmine' ],


        // list of files / patterns to load in the browser
        files: [
            'test/mock/*.js',
            'test/spec/*.spec.js', {
                pattern: 'src/js/*.js',
                included: false
            }, {
                pattern: 'src/widget/*/*.*',
                included: false
            }, {
                pattern: 'config.json',
                included: false
            }
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/**/*.js': [ 'browserify', 'coverage' ],
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [ 'progress', 'coverage' ],


        browserify: {
          debug: true,
          transform: [istanbul({
            ignore: [
              'node_modules/**', 
              'test/**',
              // exclude libraries that ware copied into widgets
              'src/widget/geo-esri/**',
              'src/widget/time/timepicker.js'
            ]
          })],
          extensions: ['js']
        },

        coverageReporter: {
            dir: 'test-coverage',
            reporters: [
                // for in-depth analysis in your browser
                {
                    type: 'html',
                    includeAllSources: true
                },
                // for displaying percentages summary in command line
                {
                    type: 'text-summary',
                    includeAllSources: true
                }
            ]
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
    } );
};
