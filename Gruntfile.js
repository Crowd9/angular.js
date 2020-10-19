'use strict';

var files = require('./angularFiles').files;
var util = require('./lib/grunt/utils.js');
var versionInfo = require('./lib/versions/version-info');

module.exports = function(grunt) {
  grunt.loadTasks('lib/grunt');

  // compute version related info for this build
  var NG_VERSION = versionInfo.currentVersion;

  grunt.initConfig({
    NG_VERSION: NG_VERSION,
    build: {
      angular: {
        dest: 'build/angular.js',
        src: util.wrap([files['angularSrc']], 'angular'),
        styles: {
          css: ['css/angular.css'],
          generateCspCssFile: true
        }
      },
      loader: {
        dest: 'build/angular-loader.js',
        src: util.wrap(files['angularLoader'], 'loader')
      },
      touch: {
        dest: 'build/angular-touch.js',
        src: util.wrap(files['angularModules']['ngTouch'], 'module')
      },
      mocks: {
        dest: 'build/angular-mocks.js',
        src: util.wrap(files['angularModules']['ngMock'], 'module'),
        strict: false
      },
      sanitize: {
        dest: 'build/angular-sanitize.js',
        src: util.wrap(files['angularModules']['ngSanitize'], 'module')
      },
      resource: {
        dest: 'build/angular-resource.js',
        src: util.wrap(files['angularModules']['ngResource'], 'module')
      },
      messageformat: {
        dest: 'build/angular-message-format.js',
        src: util.wrap(files['angularModules']['ngMessageFormat'], 'module')
      },
      messages: {
        dest: 'build/angular-messages.js',
        src: util.wrap(files['angularModules']['ngMessages'], 'module')
      },
      animate: {
        dest: 'build/angular-animate.js',
        src: util.wrap(files['angularModules']['ngAnimate'], 'module')
      },
      route: {
        dest: 'build/angular-route.js',
        src: util.wrap(files['angularModules']['ngRoute'], 'module')
      },
      cookies: {
        dest: 'build/angular-cookies.js',
        src: util.wrap(files['angularModules']['ngCookies'], 'module')
      },
      aria: {
        dest: 'build/angular-aria.js',
        src: util.wrap(files['angularModules']['ngAria'], 'module')
      },
      parseext: {
        dest: 'build/angular-parse-ext.js',
        src: util.wrap(files['angularModules']['ngParseExt'], 'module')
      }
    },
  });
};

function reportOrFail(message) {
  if (process.env.CI) {
    throw new Error(message);
  } else {
    console.log('===============================================================================');
    console.log(message);
    console.log('===============================================================================');
  }
}
