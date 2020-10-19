'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var semver = require('semver');
var process = require('process');

var currentPackage, previousVersions;

/**
 * Load information about this project from the package.json
 * @return {Object} The package information
 */
var getPackage = function() {
  // Search up the folder hierarchy for the first package.json
  var packageFolder = path.resolve('.');
  while (!fs.existsSync(path.join(packageFolder, 'package.json'))) {
    var parent = path.dirname(packageFolder);
    if (parent === packageFolder) { break; }
    packageFolder = parent;
  }
  return JSON.parse(fs.readFileSync(path.join(packageFolder,'package.json'), 'UTF-8'));
};

/**
 * Extract the code name from the tagged commit's message - it should contain the text of the form:
 * "codename(some-code-name)"
 * @param  {String} tagName Name of the tag to look in for the codename
 * @return {String}         The codename if found, otherwise null/undefined
 */
var getCodeName = function(tagName) {
  var gitCatOutput = shell.exec('git cat-file -p ' + tagName, {silent:true}).stdout;
  var tagMessage = gitCatOutput.match(/^.*codename.*$/mg)[0];
  var codeName = tagMessage && tagMessage.match(/codename\((.*)\)/)[1];
  if (!codeName) {
    throw new Error('Could not extract release code name. The message of tag ' + tagName +
      ' must match \'*codename(some release name)*\'');
  }
  return codeName;
};


/**
 * Compute a build segment for the version, from the CI build number and current commit SHA
 * @return {String} The build segment of the version
 */
function getBuild() {
  var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).stdout.replace('\n', '');
  return 'sha.' + hash;
}

function checkBranchPattern(version, branchPattern) {
  // check that the version starts with the branch pattern minus its asterisk
  // e.g. branchPattern = '1.6.*'; version = '1.6.0-rc.0' => '1.6.' === '1.6.'
  return version.slice(0, branchPattern.length - 1) === branchPattern.replace('*', '');
}

/**
 * If the current commit is tagged as a version get that version
 * @return {SemVer} The version or null
 */
var getTaggedVersion = function() {
  var gitTagResult = shell.exec('git describe --exact-match', {silent:true});

  if (gitTagResult.code === 0) {
    var tag = gitTagResult.stdout.trim();
    var version = semver.parse(tag);

    if (version && checkBranchPattern(version.version, currentPackage.branchPattern)) {
      version.codeName = getCodeName(tag);
      version.full = version.version;
      version.branch = 'v' + currentPackage.branchPattern.replace('*', 'x');
      return version;
    }
  }

  return null;
};

/**
 * Get a collection of all the previous versions sorted by semantic version
 * @return {Array.<SemVer>} The collection of previous versions
 */
var getPreviousVersions =  function() {
  var query = 'git tag';
  var tagResults = shell.exec(query, {silent: true});
  if (tagResults.code === 0) {
    return _(tagResults.stdout.match(/v[0-9].*[0-9]$/mg))
      .map(function(tag) {
        var version = semver.parse(tag);
        return version;
      })
      .filter()
      .map(function(version) {
        // angular.js didn't follow semantic version until 1.20rc1
        if ((version.major === 1 && version.minor === 0 && version.prerelease.length > 0) || (version.major === 1 && version.minor === 2 && version.prerelease[0] === 'rc1')) {
          version.version = [version.major, version.minor, version.patch].join('.') + version.prerelease.join('');
          version.raw = 'v' + version.version;
        }
        version.docsUrl = 'http://code.angularjs.org/' + version.version + '/docs';
        // Versions before 1.0.2 had a different docs folder name
        if (version.major < 1 || (version.major === 1 && version.minor === 0 && version.patch < 2)) {
          version.docsUrl += '-' + version.version;
          version.isOldDocsUrl = true;
        }
        return version;
      })
      .sort(semver.compare)
      .value();
  } else {
    return [];
  }
};

/**
 * Get the unstable snapshot version
 * @return {SemVer} The snapshot version
 */
var getSnapshotVersion = function() {
  var version = _(previousVersions)
    .filter(function(tag) {
      return semver.satisfies(tag, currentPackage.branchVersion);
    })
    .last();

  if (!version) {
    // a snapshot version before the first tag on the branch
    version = semver.parse(currentPackage.branchPattern.replace('*','0-beta.1'));
  }

  // We need to clone to ensure that we are not modifying another version
  version = semver.parse(version.raw);

  var ciBuild = process.env.CIRCLE_BUILD_NUM || process.env.BUILD_NUMBER;
  version.prerelease = ciBuild ? ['build', ciBuild] : ['local'];
  version.build = getBuild();
  version.codeName = 'snapshot';
  version.isSnapshot = true;
  version.format();
  version.full = version.version + '+' + version.build;
  version.branch = 'master';

  return version;
};


exports.currentPackage = currentPackage = getPackage();
exports.previousVersions = previousVersions = getPreviousVersions();
exports.currentVersion = getTaggedVersion() || getSnapshotVersion();

console.log('Current version:', exports.currentVersion.raw);
