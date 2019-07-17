'use strict';

NgModelController.$inject = [];
function NgModelController() {
  throw new Error('NgModelController is removed! (https://github.com/Crowd9/angular.js)')
}

var ngModelDirective = [function() {
  return {
    restrict: 'A',
    require: ['ngModel', '^?form', '^?ngModelOptions'],
    controller: NgModelController,
    priority: 1,
    compile: function() {
      throw new Error('ngModelDirective is removed! (https://github.com/Crowd9/angular.js)')
    }
  };
}];
