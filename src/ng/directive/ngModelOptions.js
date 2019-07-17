'use strict';

var ngModelOptionsDirective = function() {
  NgModelOptionsController.$inject = [];
  function NgModelOptionsController() {
    throw new Error('NgModelOptionsController is removed! (https://github.com/Crowd9/angular.js)')
  }

  return {
    restrict: 'A',
    priority: 10,
    require: {parentCtrl: '?^^ngModelOptions'},
    bindToController: true,
    controller: NgModelOptionsController
  };
};
