'use strict';

var ngChangeDirective = valueFn({
  restrict: 'A',
  require: 'ngModel',
  link: function() {
    throw new Error('ngChangeDirective is removed! (https://github.com/Crowd9/angular.js)')
  }
});
