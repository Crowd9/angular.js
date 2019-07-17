'use strict';

var ngIncludeDirective = [function() {
  return {
    restrict: 'ECA',
    priority: 400,
    terminal: true,
    transclude: 'element',
    controller: angular.noop,
    compile: function() {
      throw new Error('ngIncludeDirective is removed! (https://github.com/Crowd9/angular.js)')
    }
  };
}];

var ngIncludeFillContentDirective = [
  function() {
    return {
      restrict: 'ECA',
      priority: -400,
      require: 'ngInclude',
      link: function() {
        throw new Error('ngIncludeFillContentDirective is removed! (https://github.com/Crowd9/angular.js)')
      }
    };
  }];
