'use strict';

var ngBindDirective = ['$compile', '$parse', function($compile, $parse) {
  return {
    restrict: 'AC',
    compile: function ngBindCompile(templateElement) {
      $compile.$$addBindingClass(templateElement);
      return function ngBindLink(scope, element, attr) {
        $compile.$$addBindingInfo(element, attr.ngBind);
        element = element[0];

        var initValue, ngExp = $parse(attr.ngBind);

        if (ngExp.oneTime && isDefined(initValue = ngExp(scope))) {
          ngBindWatchAction(initValue);
        } else {
          scope.$watch(ngExp, ngBindWatchAction);
        }

        function ngBindWatchAction(value) {
          element.textContent = stringify(value);
        }
      };
    }
  };
}];

// ngBindTemplateDirective is removed

var ngBindHtmlDirective = ['$sce', '$parse', '$compile', function($sce, $parse, $compile) {
  return {
    restrict: 'A',
    compile: function ngBindHtmlCompile(tElement, tAttrs) {
      var ngBindHtmlGetter = $parse(tAttrs.ngBindHtml);
      var ngBindHtmlWatch = $parse(tAttrs.ngBindHtml, function sceValueOf(val) {
        // Unwrap the value to compare the actual inner safe value, not the wrapper object.
        return $sce.valueOf(val);
      });
      $compile.$$addBindingClass(tElement);

      return function ngBindHtmlLink(scope, element, attr) {
        $compile.$$addBindingInfo(element, attr.ngBindHtml);

        scope.$watch(ngBindHtmlWatch, function ngBindHtmlWatchAction() {
          // The watched value is the unwrapped value. To avoid re-escaping, use the direct getter.
          var value = ngBindHtmlGetter(scope);
          element.html($sce.getTrustedHtml(value) || '');
        });
      };
    }
  };
}];
