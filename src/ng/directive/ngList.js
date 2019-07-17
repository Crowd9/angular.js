'use strict';

var ngListDirective = function() {
  return {
    restrict: 'A',
    priority: 100,
    require: 'ngModel',
    link: function() {
      throw new Error('ngListDirective is removed! (https://github.com/Crowd9/angular.js)')
    }
  };
};
