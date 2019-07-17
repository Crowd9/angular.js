'use strict';

var nullFormCtrl = {
  $addControl: noop,
  $getControls: valueFn([]),
  $$renameControl: nullFormRenameControl,
  $removeControl: noop,
  $setValidity: noop,
  $setDirty: noop,
  $setPristine: noop,
  $setSubmitted: noop,
  $$setSubmitted: noop
}

function nullFormRenameControl(control, name) {
  control.$name = name;
}

FormController.$inject = [];
function FormController() {
  throw new Error('FormController is removed! (https://github.com/Crowd9/angular.js)')
}

var formDirectiveFactory = function(isNgForm) {
  return [function() {
    return {
      name: 'form',
      restrict: isNgForm ? 'EAC' : 'E',
      require: ['form', '^^?form'],
      controller: FormController,
      compile: function ngFormCompile() {
        if (isNgForm) {
          throw new Error('formDirectiveFactory is removed! (https://github.com/Crowd9/angular.js)')
        }
      }
    };
  }];
};

var formDirective = formDirectiveFactory();
var ngFormDirective = formDirectiveFactory(true);

function setupValidity() {
  throw new Error('setupValidity is removed')
}

function addSetValidityMethod(input) {
  if (version.codeName === 'snapshot') {
    return input
  } else {
    throw new Error('addSetValidityMethod is removed')
  }
}
