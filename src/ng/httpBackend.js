// $xhrFactoryProvider is removed

function $HttpBackendProvider() {
  this.$get = function() {
    return function httpBackend() {
      throw new Error('$HttpBackendProvider is removed! (https://github.com/Crowd9/angular.js)');
    };
  };
}
