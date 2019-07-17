'use strict';

currencyFilter.$inject = [];
function currencyFilter() {
  return function() {
    throw new Error('currencyFilter is removed! (https://github.com/Crowd9/angular.js)')
  };
}

numberFilter.$inject = [];
function numberFilter($locale) {
  return function() {
    throw new Error('numberFilter is removed! (https://github.com/Crowd9/angular.js)')
  };
}

dateFilter.$inject = [];
function dateFilter() {
  return function() {
    throw new Error('dateFilter is removed! (https://github.com/Crowd9/angular.js)')
  };
}

/**
 * @ngdoc filter
 * @name json
 * @kind function
 *
 * @description
 *   Allows you to convert a JavaScript object into JSON string.
 *
 *   This filter is mostly useful for debugging. When using the double curly {{value}} notation
 *   the binding is automatically converted to JSON.
 *
 * @param {*} object Any JavaScript object (including arrays and primitive types) to filter.
 * @param {number=} spacing The number of spaces to use per indentation, defaults to 2.
 * @returns {string} JSON string.
 *
 *
 * @example
   <example name="filter-json">
     <file name="index.html">
       <pre id="default-spacing">{{ {'name':'value'} | json }}</pre>
       <pre id="custom-spacing">{{ {'name':'value'} | json:4 }}</pre>
     </file>
     <file name="protractor.js" type="protractor">
       it('should jsonify filtered objects', function() {
         expect(element(by.id('default-spacing')).getText()).toMatch(/\{\n {2}"name": ?"value"\n}/);
         expect(element(by.id('custom-spacing')).getText()).toMatch(/\{\n {4}"name": ?"value"\n}/);
       });
     </file>
   </example>
 *
 */
function jsonFilter() {
  return function(object, spacing) {
    if (isUndefined(spacing)) {
        spacing = 2;
    }
    return toJson(object, spacing);
  };
}


/**
 * @ngdoc filter
 * @name lowercase
 * @kind function
 * @description
 * Converts string to lowercase.
 *
 * See the {@link ng.uppercase uppercase filter documentation} for a functionally identical example.
 *
 * @see angular.lowercase
 */
var lowercaseFilter = valueFn(lowercase);


/**
 * @ngdoc filter
 * @name uppercase
 * @kind function
 * @description
 * Converts string to uppercase.
 * @example
   <example module="uppercaseFilterExample" name="filter-uppercase">
     <file name="index.html">
       <script>
         angular.module('uppercaseFilterExample', [])
           .controller('ExampleController', ['$scope', function($scope) {
             $scope.title = 'This is a title';
           }]);
       </script>
       <div ng-controller="ExampleController">
         <!-- This title should be formatted normally -->
         <h1>{{title}}</h1>
         <!-- This title should be capitalized -->
         <h1>{{title | uppercase}}</h1>
       </div>
     </file>
   </example>
 */
var uppercaseFilter = valueFn(uppercase);
