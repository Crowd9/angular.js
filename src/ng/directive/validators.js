'use strict';

var requiredDirective = [function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function() {
      throw new Error('requiredDirective is removed! (https://github.com/Crowd9/angular.js)')
    }
  };
}];

var patternDirective = [function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    compile: function() {
      throw new Error('patternDirective is removed! (https://github.com/Crowd9/angular.js)')
    }

  };
}];

var maxlengthDirective = [function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function() {
      throw new Error('maxlengthDirective is removed! (https://github.com/Crowd9/angular.js)')
    }
  };
}];

var minlengthDirective = [function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function() {
      throw new Error('minlengthDirective is removed! (https://github.com/Crowd9/angular.js)')
    }
  };
}];
