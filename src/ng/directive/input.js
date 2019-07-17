'use strict';

var inputDirective = [function() {
  return {
    restrict: 'E',
    require: ['?ngModel'],
    link: {
      pre: function(scope, element, attr, ctrls) {
        if (ctrls[0]) {
          throw new Error('inputDirective is removed! (https://github.com/Crowd9/angular.js)')
        }
      }
    }
  };
}];


/* hiddenInputBrowserCacheDirective is removed */

var ngValueDirective = function() {
  return {
    restrict: 'A',
    priority: 100,
    compile: function(tpl, tplAttr) {
      throw new Error('ngValueDirective is removed! (https://github.com/Crowd9/angular.js)')
    }
  };
};
