'use strict';

var shell = require('shelljs');
var semver = require('semver');
var packageJSON = require('../../package.json');

function getBuild() {
  var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).stdout.replace('\n', '');
  return 'sha.' + hash;
}

var getSnapshotVersion = function() {
  var version = semver.parse(packageJSON.version);
  version.prerelease = ['local'];
  version.build = getBuild();
  version.codeName = 'snapshot';
  version.isSnapshot = true;
  version.format();
  version.full = version.version + '+' + version.build;
  version.branch = 'master';

  return version;
};

exports.currentVersion = getSnapshotVersion();

console.log('Current version:', exports.currentVersion.raw);
