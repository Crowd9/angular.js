'use strict';

var ELEMENT_NODE = 1;

function extractElementNode(element) {
  for (var i = 0; i < element.length; i++) {
    var elm = element[i];
    if (elm.nodeType === ELEMENT_NODE) {
      return elm;
    }
  }
}

function domInsert(element, parentElement, afterElement) {
  // if for some reason the previous element was removed
  // from the dom sometime before this code runs then let's
  // just stick to using the parent element as the anchor
  if (afterElement) {
    var afterNode = extractElementNode(afterElement);
    if (afterNode && !afterNode.parentNode && !afterNode.previousElementSibling) {
      afterElement = null;
    }
  }
  if (afterElement) {
    afterElement.after(element);
  } else {
    parentElement.prepend(element);
  }
}

var $$CoreAnimateQueueProvider = function() {
  this.$get = [function() {
    throw new Error('$$CoreAnimateQueueProvider is removed! (https://github.com/Crowd9/angular.js)');
  }];
};

var $$CoreAnimateJsProvider = function() {
  this.$get = [function() {
    throw new Error('$$CoreAnimateJsProvider is removed! (https://github.com/Crowd9/angular.js)');
  }];
};

var $AnimateProvider = function() {
  this.$get = [function() {
    throw new Error('$AnimateProvider is removed! (https://github.com/Crowd9/angular.js)');
  }];
}
