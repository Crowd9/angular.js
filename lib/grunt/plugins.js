'use strict';

/* eslint-disable no-invalid-this */

var util = require('./utils.js');

module.exports = function(grunt) {
  grunt.registerMultiTask('build', 'build JS files', function() {
    util.build(this.data, this.async());
  });
};
