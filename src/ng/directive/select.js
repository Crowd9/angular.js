'use strict';

var SelectController = [function() {
  throw new Error('SelectController is removed! (https://github.com/Crowd9/angular.js)')
}];

var selectDirective = function() {

  return {
    restrict: 'E',
    require: ['select', '?ngModel'],
    controller: SelectController,
    priority: 1,
    link: {
      pre: selectPreLink,
      post: noop
    }
  };

  function selectPreLink() {
    throw new Error('selectDirective is removed! (https://github.com/Crowd9/angular.js)')
  }
};


var optionDirective = [function() {
  return {
    restrict: 'E',
    priority: 100,
    compile: function() {
      throw new Error('optionDirective is removed')
    }
  };
}];
