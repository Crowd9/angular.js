'use strict';

// currencyFilter is removed
// numberFilter is removed
// dateFilter is removed
// lowercaseFilter is removed
// uppercaseFilter is removed

function jsonFilter() {
  return function(object, spacing) {
    if (isUndefined(spacing)) {
        spacing = 2;
    }
    return toJson(object, spacing);
  };
}
