'use strict';

/* global angularModule: true,
  version: true,

  $CompileProvider,

  scriptDirective,
  ngBindDirective,
  ngBindHtmlDirective,
  ngBindTemplateDirective,
  ngClassDirective,
  ngClassEvenDirective,
  ngClassOddDirective,
  ngCloakDirective,
  ngControllerDirective,
  ngHideDirective,
  ngIfDirective,
  ngInitDirective,
  ngNonBindableDirective,
  ngPluralizeDirective,
  ngRefDirective,
  ngRepeatDirective,
  ngShowDirective,
  ngStyleDirective,
  ngSwitchDirective,
  ngSwitchWhenDirective,
  ngSwitchDefaultDirective,
  ngTranscludeDirective,
  ngAttributeAliasDirectives,
  ngEventDirectives,

  $BrowserProvider,
  $CacheFactoryProvider,
  $ControllerProvider,
  $DateProvider,
  $DocumentProvider,
  $$IsDocumentHiddenProvider,
  $ExceptionHandlerProvider,
  $FilterProvider,
  $InterpolateProvider,
  $$IntervalFactoryProvider,
  $IntervalProvider,
  $HttpProvider,
  $HttpParamSerializerProvider,
  $HttpParamSerializerJQLikeProvider,
  $HttpBackendProvider,
  $jsonpCallbacksProvider,
  $LogProvider,
  $$MapProvider,
  $ParseProvider,
  $RootScopeProvider,
  $QProvider,
  $$QProvider,
  $$SanitizeUriProvider,
  $SceProvider,
  $SceDelegateProvider,
  $SnifferProvider,
  $$TaskTrackerFactoryProvider,
  $TemplateCacheProvider,
  $TimeoutProvider,
  $WindowProvider,
  $$jqLiteProvider,
  $$CookieReaderProvider
*/


/**
 * @ngdoc object
 * @name angular.version
 * @module ng
 * @description
 * An object that contains information about the current AngularJS version.
 *
 * This object has the following properties:
 *
 * - `full` – `{string}` – Full version string, such as "0.9.18".
 * - `major` – `{number}` – Major version number, such as "0".
 * - `minor` – `{number}` – Minor version number, such as "9".
 * - `dot` – `{number}` – Dot version number, such as "18".
 * - `codeName` – `{string}` – Code name of the release, such as "jiggling-armfat".
 */
var version = {
  // These placeholder strings will be replaced by grunt's `build` task.
  // They need to be double- or single-quoted.
  full: '"NG_VERSION_FULL"',
  major: 'NG_VERSION_MAJOR',
  minor: 'NG_VERSION_MINOR',
  dot: 'NG_VERSION_DOT',
  codeName: '"NG_VERSION_CODENAME"'
};


function publishExternalAPI(angular) {
  extend(angular, {
    'errorHandlingConfig': errorHandlingConfig,
    'bootstrap': bootstrap,
    'copy': copy,
    'extend': extend,
    'merge': merge,
    'equals': equals,
    'element': jqLite,
    'forEach': forEach,
    'injector': createInjector,
    'noop': noop,
    'bind': bind,
    'toJson': toJson,
    'fromJson': fromJson,
    'identity': identity,
    'isUndefined': isUndefined,
    'isDefined': isDefined,
    'isString': isString,
    'isFunction': isFunction,
    'isObject': isObject,
    'isNumber': isNumber,
    'isElement': isElement,
    'isArray': isArray,
    'version': version,
    'isDate': isDate,
    'callbacks': {$$counter: 0},
    'getTestability': getTestability,
    'reloadWithDebugInfo': reloadWithDebugInfo,
    'UNSAFE_restoreLegacyJqLiteXHTMLReplacement': UNSAFE_restoreLegacyJqLiteXHTMLReplacement,
    '$$minErr': minErr,
    '$$csp': csp,
    '$$encodeUriSegment': encodeUriSegment,
    '$$encodeUriQuery': encodeUriQuery,
    '$$lowercase': lowercase,
    '$$stringify': stringify,
    '$$uppercase': uppercase
  });

  angularModule = setupModuleLoader(window);

  angularModule('ng', ['ngLocale'], ['$provide',
    function ngModule($provide) {
      // $$sanitizeUriProvider needs to be before $compileProvider as it is used by it.
      $provide.provider({
        $$sanitizeUri: $$SanitizeUriProvider
      });
      $provide.provider('$compile', $CompileProvider).
        directive({
            script: scriptDirective,
            ngBind: ngBindDirective,
            ngBindHtml: ngBindHtmlDirective,
            ngBindTemplate: ngBindTemplateDirective,
            ngClass: ngClassDirective,
            ngClassEven: ngClassEvenDirective,
            ngClassOdd: ngClassOddDirective,
            ngCloak: ngCloakDirective,
            ngController: ngControllerDirective,
            ngHide: ngHideDirective,
            ngIf: ngIfDirective,
            ngInit: ngInitDirective,
            ngNonBindable: ngNonBindableDirective,
            ngPluralize: ngPluralizeDirective,
            ngRef: ngRefDirective,
            ngRepeat: ngRepeatDirective,
            ngShow: ngShowDirective,
            ngStyle: ngStyleDirective,
            ngSwitch: ngSwitchDirective,
            ngSwitchWhen: ngSwitchWhenDirective,
            ngSwitchDefault: ngSwitchDefaultDirective,
            ngTransclude: ngTranscludeDirective
        }).
        directive(ngAttributeAliasDirectives).
        directive(ngEventDirectives);
      $provide.provider({
        $browser: $BrowserProvider,
        $cacheFactory: $CacheFactoryProvider,
        $controller: $ControllerProvider,
        $document: $DocumentProvider,
        $$isDocumentHidden: $$IsDocumentHiddenProvider,
        $exceptionHandler: $ExceptionHandlerProvider,
        $filter: $FilterProvider,
        $interpolate: $InterpolateProvider,
        $interval: $IntervalProvider,
        $$intervalFactory: $$IntervalFactoryProvider,
        $http: $HttpProvider,
        $httpParamSerializer: $HttpParamSerializerProvider,
        $httpParamSerializerJQLike: $HttpParamSerializerJQLikeProvider,
        $httpBackend: $HttpBackendProvider,
        $jsonpCallbacks: $jsonpCallbacksProvider,
        $log: $LogProvider,
        $parse: $ParseProvider,
        $rootScope: $RootScopeProvider,
        $q: $QProvider,
        $$q: $$QProvider,
        $sce: $SceProvider,
        $sceDelegate: $SceDelegateProvider,
        $sniffer: $SnifferProvider,
        $$taskTrackerFactory: $$TaskTrackerFactoryProvider,
        $templateCache: $TemplateCacheProvider,
        $timeout: $TimeoutProvider,
        $window: $WindowProvider,
        $$jqLite: $$jqLiteProvider,
        $$Map: $$MapProvider,
        $$cookieReader: $$CookieReaderProvider
      });
    }
  ])
  .info({ angularVersion: '"NG_VERSION_FULL"' });
}
