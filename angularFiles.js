'use strict';

var angularFiles = {
  'angularSrc': [
    'src/minErr.js',
    'src/Angular.js',
    'src/loader.js',
    'src/shallowCopy.js',
    'src/stringify.js',
    'src/AngularPublic.js',
    'src/jqLite.js',
    'src/apis.js',

    'src/auto/injector.js',

    'src/ng/anchorScroll.js',
    'src/ng/animate.js',
    'src/ng/browser.js',
    'src/ng/cacheFactory.js',
    'src/ng/compile.js',
    'src/ng/controller.js',
    'src/ng/document.js',
    'src/ng/exceptionHandler.js',
    'src/ng/forceReflow.js',
    'src/ng/http.js',
    'src/ng/httpBackend.js',
    'src/ng/interpolate.js',
    'src/ng/interval.js',
    'src/ng/intervalFactory.js',
    'src/ng/jsonpCallbacks.js',
    'src/ng/locale.js',
    'src/ng/location.js',
    'src/ng/log.js',
    'src/ng/parse.js',
    'src/ng/q.js',
    'src/ng/raf.js',
    'src/ng/rootScope.js',
    'src/ng/rootElement.js',
    'src/ng/sanitizeUri.js',
    'src/ng/sce.js',
    'src/ng/sniffer.js',
    'src/ng/taskTrackerFactory.js',
    'src/ng/templateRequest.js',
    'src/ng/testability.js',
    'src/ng/timeout.js',
    'src/ng/urlUtils.js',
    'src/ng/window.js',
    'src/ng/cookieReader.js',

    'src/ng/filter.js',
    'src/ng/filter/filter.js',
    'src/ng/filter/filters.js',
    'src/ng/filter/limitTo.js',
    'src/ng/filter/orderBy.js',

    'src/ng/directive/directives.js',
    'src/ng/directive/attrs.js',
    'src/ng/directive/form.js',
    'src/ng/directive/input.js',
    'src/ng/directive/ngBind.js',
    'src/ng/directive/ngChange.js',
    'src/ng/directive/ngClass.js',
    'src/ng/directive/ngCloak.js',
    'src/ng/directive/ngController.js',
    'src/ng/directive/ngCsp.js',
    'src/ng/directive/ngEventDirs.js',
    'src/ng/directive/ngIf.js',
    'src/ng/directive/ngInclude.js',
    'src/ng/directive/ngInit.js',
    'src/ng/directive/ngList.js',
    'src/ng/directive/ngModel.js',
    'src/ng/directive/ngModelOptions.js',
    'src/ng/directive/ngNonBindable.js',
    'src/ng/directive/ngOptions.js',
    'src/ng/directive/ngPluralize.js',
    'src/ng/directive/ngRef.js',
    'src/ng/directive/ngRepeat.js',
    'src/ng/directive/ngShowHide.js',
    'src/ng/directive/ngStyle.js',
    'src/ng/directive/ngSwitch.js',
    'src/ng/directive/ngTransclude.js',
    'src/ng/directive/script.js',
    'src/ng/directive/select.js',
    'src/ng/directive/validators.js',
    'src/angular.bind.js',
    'src/publishExternalApis.js',
    'src/ngLocale/angular-locale_en-us.js'
  ],

  'angularLoader': [
    'src/stringify.js',
    'src/minErr.js',
    'src/loader.js'
  ],

  'angularModules': {
    'ngMock': [
      'src/routeToRegExp.js',
      'src/ngMock/angular-mocks.js',
      'src/ngMock/browserTrigger.js'
    ]
  }
};

if (exports) {
  exports.files = angularFiles;
  exports.mergeFilesFor = function() {
    var files = [];

    Array.prototype.slice.call(arguments, 0).forEach(function(filegroup) {
      angularFiles[filegroup].forEach(function(file) {
        // replace @ref
        var match = file.match(/^@(.*)/);
        if (match) {
          files = files.concat(angularFiles[match[1]]);
        } else {
          files.push(file);
        }
      });
    });

    return files;
  };
}
