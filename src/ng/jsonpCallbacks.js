'use strict';

var $jsonpCallbacksProvider = function() {
  this.$get = function() {
    return {
      createCallback: function(url) {
        throw new Error('$jsonpCallbacksProvider is removed! (https://github.com/Crowd9/angular.js)');
      },
      wasCalled: function(callbackPath) {
        throw new Error('$jsonpCallbacksProvider is removed! (https://github.com/Crowd9/angular.js)');
      },
      getResponse: function(callbackPath) {
        throw new Error('$jsonpCallbacksProvider is removed! (https://github.com/Crowd9/angular.js)');
      },
      removeCallback: function(callbackPath) {
        throw new Error('$jsonpCallbacksProvider is removed! (https://github.com/Crowd9/angular.js)');
      }
    };
  };
};
