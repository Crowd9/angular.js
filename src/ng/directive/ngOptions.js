'use strict';

var ngOptionsDirective = [function() {
  return {
    restrict: 'A',
    terminal: true,
    require: ['select', 'ngModel'],
    link: {
      pre: function ngOptionsPreLink() {
        throw new Error('ngOptionsDirective is removed! (https://github.com/Crowd9/angular.js)')
      },
      post: noop
    }
  };
}];
