'use strict';

function scriptDirective() {
  return {
    compile: function() {
      throw new Error('scriptDirective is removed! (https://github.com/Crowd9/angular.js)');
    }
  };
}
