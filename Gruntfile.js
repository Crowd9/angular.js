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
      mocks: {
        dest: 'build/angular-mocks.js',
        src: util.wrap(files['angularModules']['ngMock'], 'module'),
        strict: false
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
