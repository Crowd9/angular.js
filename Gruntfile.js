'use strict';

var files = require('./angularFiles').files;
var util = require('./lib/grunt/utils.js');
var versionInfo = require('./lib/versions/version-info');
var path = require('path');

var semver = require('semver');
var exec = require('shelljs').exec;
var pkg = require(__dirname + '/package.json');

// Node.js version checks
if (!semver.satisfies(process.version, pkg.engines.node)) {
  reportOrFail('Invalid node version (' + process.version + '). ' +
               'Please use a version that satisfies ' + pkg.engines.node);
}

// Yarn version checks
var expectedYarnVersion = pkg.engines.yarn;
var currentYarnVersion = exec('yarn --version', {silent: true}).stdout.trim();
if (!semver.satisfies(currentYarnVersion, expectedYarnVersion)) {
  reportOrFail('Invalid yarn version (' + currentYarnVersion + '). ' +
               'Please use a version that satisfies ' + expectedYarnVersion);
}

// Grunt CLI version checks
var expectedGruntVersion = pkg.engines.grunt;
var currentGruntVersions = exec('grunt --version', {silent: true}).stdout;
var match = /^grunt-cli v(.+)$/m.exec(currentGruntVersions);
if (!match) {
  reportOrFail('Unable to compute the current grunt-cli version. We found:\n' +
               currentGruntVersions);
} else {
  if (!semver.satisfies(match[1], expectedGruntVersion)) {
  reportOrFail('Invalid grunt-cli version (' + match[1] + '). ' +
               'Please use a version that satisfies ' + expectedGruntVersion);
  }
}

// Ensure Node.js dependencies have been installed
if (!process.env.TRAVIS && !process.env.JENKINS_HOME) {
  var yarnOutput = exec('yarn install');
  if (yarnOutput.code !== 0) {
    throw new Error('Yarn install failed: ' + yarnOutput.stderr);
  }
}

module.exports = function(grunt) {

  // load additional grunt tasks
  grunt.loadTasks('lib/grunt');

  // compute version related info for this build
  var NG_VERSION = versionInfo.currentVersion;
  NG_VERSION.cdn = versionInfo.cdnVersion;
  var dist = 'angular-' + NG_VERSION.full;

  var deployVersion = NG_VERSION.full;

  if (NG_VERSION.isSnapshot) {
    deployVersion = NG_VERSION.distTag === 'latest' ? 'snapshot-stable' : 'snapshot';
  }

  if (versionInfo.cdnVersion == null) {
    throw new Error('Unable to read CDN version, are you offline or has the CDN not been properly pushed?\n' +
                    'Perhaps you want to set the NG1_BUILD_NO_REMOTE_VERSION_REQUESTS environment variable?');
  }

  //config
  grunt.initConfig({
    NG_VERSION: NG_VERSION,
    build: {
      scenario: {
        dest: 'build/angular-scenario.js',
        src: [
          'bower_components/jquery/dist/jquery.js',
          util.wrap([files['angularSrc'], files['angularScenario']], 'ngScenario/angular')
        ],
        styles: {
          css: ['css/angular.css', 'css/angular-scenario.css']
        }
      },
      angular: {
        dest: 'build/angular.js',
        src: util.wrap([files['angularSrc']], 'angular'),
        styles: {
          css: ['css/angular.css'],
          generateCspCssFile: true,
          minify: true
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
  if (process.env.TRAVIS || process.env.JENKINS_HOME) {
    throw new Error(message);
  } else {
    console.log('===============================================================================');
    console.log(message);
    console.log('===============================================================================');
  }
}
