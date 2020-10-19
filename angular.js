/**
 * @license AngularJS v1.8.1-local+sha.258c05485
 * (c) 2010-2020 Google LLC. http://angularjs.org
 * License: MIT
 */
(function (window) {
  'use strict';

  var minErrConfig = {
    objectMaxDepth: 5,
    urlErrorParamsEnabled: true
  };

  function errorHandlingConfig(config) {
    if (isObject(config)) {
      if (isDefined(config.objectMaxDepth)) {
        minErrConfig.objectMaxDepth = isValidObjectMaxDepth(config.objectMaxDepth) ? config.objectMaxDepth : NaN;
      }

      if (isDefined(config.urlErrorParamsEnabled) && isBoolean(config.urlErrorParamsEnabled)) {
        minErrConfig.urlErrorParamsEnabled = config.urlErrorParamsEnabled;
      }
    } else {
      return minErrConfig;
    }
  }

  function isValidObjectMaxDepth(maxDepth) {
    return isNumber(maxDepth) && maxDepth > 0;
  }

  function minErr(module, ErrorConstructor) {
    ErrorConstructor = ErrorConstructor || Error;
    var url = 'https://errors.angularjs.org/1.8.1-local+sha.258c05485/';
    var regex = url.replace('.', '\\.') + '[\\s\\S]*';
    var errRegExp = new RegExp(regex, 'g');
    return function () {
      var code = arguments[0],
          template = arguments[1],
          message = '[' + (module ? module + ':' : '') + code + '] ',
          templateArgs = sliceArgs(arguments, 2).map(function (arg) {
        return toDebugString(arg, minErrConfig.objectMaxDepth);
      }),
          paramPrefix,
          i;
      message += template.replace(/\{\d+\}/g, function (match) {
        var index = +match.slice(1, -1);

        if (index < templateArgs.length) {
          return templateArgs[index].replace(errRegExp, '');
        }

        return match;
      });
      message += '\n' + url + (module ? module + '/' : '') + code;

      if (minErrConfig.urlErrorParamsEnabled) {
        for (i = 0, paramPrefix = '?'; i < templateArgs.length; i++, paramPrefix = '&') {
          message += paramPrefix + 'p' + i + '=' + encodeURIComponent(templateArgs[i]);
        }
      }

      return new ErrorConstructor(message);
    };
  }

  var REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/;
  var VALIDITY_STATE_PROPERTY = 'validity';
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var lowercase = function (string) {
    return isString(string) ? string.toLowerCase() : string;
  };

  var uppercase = function (string) {
    return isString(string) ? string.toUpperCase() : string;
  };

  var msie,
      jqLite,
      slice = [].slice,
      splice = [].splice,
      push = [].push,
      toString = Object.prototype.toString,
      getPrototypeOf = Object.getPrototypeOf,
      ngMinErr = minErr('ng'),
      angular = module.exports.angular || (module.exports.angular = {}),
      angularModule,
      uid = 0;
  msie = window.document.documentMode;

  function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) return false;
    if (isArray(obj) || isString(obj) || jqLite && obj instanceof jqLite) return true;
    var length = 'length' in Object(obj) && obj.length;
    return isNumber(length) && (length >= 0 && length - 1 in obj || typeof obj.item === 'function');
  }

  function forEach(obj, iterator, context) {
    var key, length;

    if (obj) {
      if (isFunction(obj)) {
        for (key in obj) {
          if (key !== 'prototype' && key !== 'length' && key !== 'name' && obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      } else if (isArray(obj) || isArrayLike(obj)) {
        var isPrimitive = typeof obj !== 'object';

        for (key = 0, length = obj.length; key < length; key++) {
          if (isPrimitive || key in obj) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context, obj);
      } else if (isBlankObject(obj)) {
        for (key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      } else if (typeof obj.hasOwnProperty === 'function') {
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      } else {
        for (key in obj) {
          if (hasOwnProperty.call(obj, key)) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      }
    }

    return obj;
  }

  function forEachSorted(obj, iterator, context) {
    var keys = Object.keys(obj).sort();

    for (var i = 0; i < keys.length; i++) {
      iterator.call(context, obj[keys[i]], keys[i]);
    }

    return keys;
  }

  function reverseParams(iteratorFn) {
    return function (value, key) {
      iteratorFn(key, value);
    };
  }

  function nextUid() {
    return ++uid;
  }

  function setHashKey(obj, h) {
    if (h) {
      obj.$$hashKey = h;
    } else {
      delete obj.$$hashKey;
    }
  }

  function baseExtend(dst, objs, deep) {
    var h = dst.$$hashKey;

    for (var i = 0, ii = objs.length; i < ii; ++i) {
      var obj = objs[i];
      if (!isObject(obj) && !isFunction(obj)) continue;
      var keys = Object.keys(obj);

      for (var j = 0, jj = keys.length; j < jj; j++) {
        var key = keys[j];
        var src = obj[key];

        if (deep && isObject(src)) {
          if (isDate(src)) {
            dst[key] = new Date(src.valueOf());
          } else if (isRegExp(src)) {
            dst[key] = new RegExp(src);
          } else if (src.nodeName) {
            dst[key] = src.cloneNode(true);
          } else if (isElement(src)) {
            dst[key] = src.clone();
          } else {
            if (key !== '__proto__') {
              if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
              baseExtend(dst[key], [src], true);
            }
          }
        } else {
          dst[key] = src;
        }
      }
    }

    setHashKey(dst, h);
    return dst;
  }

  function extend(dst) {
    return baseExtend(dst, slice.call(arguments, 1), false);
  }

  function merge(dst) {
    return baseExtend(dst, slice.call(arguments, 1), true);
  }

  function toInt(str) {
    return parseInt(str, 10);
  }

  var isNumberNaN = Number.isNaN || function isNumberNaN(num) {
    return num !== num;
  };

  function inherit(parent, extra) {
    return extend(Object.create(parent), extra);
  }

  function noop() {}

  noop.$inject = [];

  function identity($) {
    return $;
  }

  identity.$inject = [];

  function valueFn(value) {
    return function valueRef() {
      return value;
    };
  }

  function hasCustomToString(obj) {
    return isFunction(obj.toString) && obj.toString !== toString;
  }

  function isUndefined(value) {
    return typeof value === 'undefined';
  }

  function isDefined(value) {
    return typeof value !== 'undefined';
  }

  function isObject(value) {
    return value !== null && typeof value === 'object';
  }

  function isBlankObject(value) {
    return value !== null && typeof value === 'object' && !getPrototypeOf(value);
  }

  function isString(value) {
    return typeof value === 'string';
  }

  function isNumber(value) {
    return typeof value === 'number';
  }

  function isDate(value) {
    return toString.call(value) === '[object Date]';
  }

  function isArray(arr) {
    return Array.isArray(arr) || arr instanceof Array;
  }

  function isError(value) {
    var tag = toString.call(value);

    switch (tag) {
      case '[object Error]':
        return true;

      case '[object Exception]':
        return true;

      case '[object DOMException]':
        return true;

      default:
        return value instanceof Error;
    }
  }

  function isFunction(value) {
    return typeof value === 'function';
  }

  function isRegExp(value) {
    return toString.call(value) === '[object RegExp]';
  }

  function isWindow(obj) {
    return obj && obj.window === obj;
  }

  function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
  }

  function isFile(obj) {
    return toString.call(obj) === '[object File]';
  }

  function isFormData(obj) {
    return toString.call(obj) === '[object FormData]';
  }

  function isBlob(obj) {
    return toString.call(obj) === '[object Blob]';
  }

  function isBoolean(value) {
    return typeof value === 'boolean';
  }

  function isPromiseLike(obj) {
    return obj && isFunction(obj.then);
  }

  var TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array]$/;

  function isTypedArray(value) {
    return value && isNumber(value.length) && TYPED_ARRAY_REGEXP.test(toString.call(value));
  }

  function isArrayBuffer(obj) {
    return toString.call(obj) === '[object ArrayBuffer]';
  }

  var trim = function (value) {
    return isString(value) ? value.trim() : value;
  };

  var escapeForRegexp = function (s) {
    return s.replace(/([-()[\]{}+?*.$^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
  };

  function isElement(node) {
    return !!(node && (node.nodeName || node.prop && node.attr && node.find));
  }

  function makeMap(str) {
    var obj = {},
        items = str.split(','),
        i;

    for (i = 0; i < items.length; i++) {
      obj[items[i]] = true;
    }

    return obj;
  }

  function nodeName_(element) {
    return lowercase(element.nodeName || element[0] && element[0].nodeName);
  }

  function includes(array, obj) {
    return Array.prototype.indexOf.call(array, obj) !== -1;
  }

  function arrayRemove(array, value) {
    var index = array.indexOf(value);

    if (index >= 0) {
      array.splice(index, 1);
    }

    return index;
  }

  function copy(source, destination, maxDepth) {
    var stackSource = [];
    var stackDest = [];
    maxDepth = isValidObjectMaxDepth(maxDepth) ? maxDepth : NaN;

    if (destination) {
      if (isTypedArray(destination) || isArrayBuffer(destination)) {
        throw ngMinErr('cpta', 'Can\'t copy! TypedArray destination cannot be mutated.');
      }

      if (source === destination) {
        throw ngMinErr('cpi', 'Can\'t copy! Source and destination are identical.');
      }

      if (isArray(destination)) {
        destination.length = 0;
      } else {
        forEach(destination, function (value, key) {
          if (key !== '$$hashKey') {
            delete destination[key];
          }
        });
      }

      stackSource.push(source);
      stackDest.push(destination);
      return copyRecurse(source, destination, maxDepth);
    }

    return copyElement(source, maxDepth);

    function copyRecurse(source, destination, maxDepth) {
      maxDepth--;

      if (maxDepth < 0) {
        return '...';
      }

      var h = destination.$$hashKey;
      var key;

      if (isArray(source)) {
        for (var i = 0, ii = source.length; i < ii; i++) {
          destination.push(copyElement(source[i], maxDepth));
        }
      } else if (isBlankObject(source)) {
        for (key in source) {
          destination[key] = copyElement(source[key], maxDepth);
        }
      } else if (source && typeof source.hasOwnProperty === 'function') {
        for (key in source) {
          if (source.hasOwnProperty(key)) {
            destination[key] = copyElement(source[key], maxDepth);
          }
        }
      } else {
        for (key in source) {
          if (hasOwnProperty.call(source, key)) {
            destination[key] = copyElement(source[key], maxDepth);
          }
        }
      }

      setHashKey(destination, h);
      return destination;
    }

    function copyElement(source, maxDepth) {
      if (!isObject(source)) {
        return source;
      }

      var index = stackSource.indexOf(source);

      if (index !== -1) {
        return stackDest[index];
      }

      if (isWindow(source) || isScope(source)) {
        throw ngMinErr('cpws', 'Can\'t copy! Making copies of Window or Scope instances is not supported.');
      }

      var needsRecurse = false;
      var destination = copyType(source);

      if (destination === undefined) {
        destination = isArray(source) ? [] : Object.create(getPrototypeOf(source));
        needsRecurse = true;
      }

      stackSource.push(source);
      stackDest.push(destination);
      return needsRecurse ? copyRecurse(source, destination, maxDepth) : destination;
    }

    function copyType(source) {
      switch (toString.call(source)) {
        case '[object Int8Array]':
        case '[object Int16Array]':
        case '[object Int32Array]':
        case '[object Float32Array]':
        case '[object Float64Array]':
        case '[object Uint8Array]':
        case '[object Uint8ClampedArray]':
        case '[object Uint16Array]':
        case '[object Uint32Array]':
          return new source.constructor(copyElement(source.buffer), source.byteOffset, source.length);

        case '[object ArrayBuffer]':
          if (!source.slice) {
            var copied = new ArrayBuffer(source.byteLength);
            new Uint8Array(copied).set(new Uint8Array(source));
            return copied;
          }

          return source.slice(0);

        case '[object Boolean]':
        case '[object Number]':
        case '[object String]':
        case '[object Date]':
          return new source.constructor(source.valueOf());

        case '[object RegExp]':
          var re = new RegExp(source.source, source.toString().match(/[^/]*$/)[0]);
          re.lastIndex = source.lastIndex;
          return re;

        case '[object Blob]':
          return new source.constructor([source], {
            type: source.type
          });
      }

      if (isFunction(source.cloneNode)) {
        return source.cloneNode(true);
      }
    }
  }

  function simpleCompare(a, b) {
    return a === b || a !== a && b !== b;
  }

  function equals(o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true;
    var t1 = typeof o1,
        t2 = typeof o2,
        length,
        key,
        keySet;

    if (t1 === t2 && t1 === 'object') {
      if (isArray(o1)) {
        if (!isArray(o2)) return false;

        if ((length = o1.length) === o2.length) {
          for (key = 0; key < length; key++) {
            if (!equals(o1[key], o2[key])) return false;
          }

          return true;
        }
      } else if (isDate(o1)) {
        if (!isDate(o2)) return false;
        return simpleCompare(o1.getTime(), o2.getTime());
      } else if (isRegExp(o1)) {
        if (!isRegExp(o2)) return false;
        return o1.toString() === o2.toString();
      } else {
        if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2) || isDate(o2) || isRegExp(o2)) return false;
        keySet = createMap();

        for (key in o1) {
          if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
          if (!equals(o1[key], o2[key])) return false;
          keySet[key] = true;
        }

        for (key in o2) {
          if (!(key in keySet) && key.charAt(0) !== '$' && isDefined(o2[key]) && !isFunction(o2[key])) return false;
        }

        return true;
      }
    }

    return false;
  }

  var csp = function () {
    if (!isDefined(csp.rules)) {
      var ngCspElement = window.document.querySelector('[ng-csp]') || window.document.querySelector('[data-ng-csp]');

      if (ngCspElement) {
        var ngCspAttribute = ngCspElement.getAttribute('ng-csp') || ngCspElement.getAttribute('data-ng-csp');
        csp.rules = {
          noUnsafeEval: !ngCspAttribute || ngCspAttribute.indexOf('no-unsafe-eval') !== -1,
          noInlineStyle: !ngCspAttribute || ngCspAttribute.indexOf('no-inline-style') !== -1
        };
      } else {
        csp.rules = {
          noUnsafeEval: noUnsafeEval(),
          noInlineStyle: false
        };
      }
    }

    return csp.rules;

    function noUnsafeEval() {
      try {
        new Function('');
        return false;
      } catch (e) {
        return true;
      }
    }
  };

  function concat(array1, array2, index) {
    return array1.concat(slice.call(array2, index));
  }

  function sliceArgs(args, startIndex) {
    return slice.call(args, startIndex || 0);
  }

  function bind(self, fn) {
    var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];

    if (isFunction(fn) && !(fn instanceof RegExp)) {
      return curryArgs.length ? function () {
        return arguments.length ? fn.apply(self, concat(curryArgs, arguments, 0)) : fn.apply(self, curryArgs);
      } : function () {
        return arguments.length ? fn.apply(self, arguments) : fn.call(self);
      };
    } else {
      return fn;
    }
  }

  function toJsonReplacer(key, value) {
    var val = value;

    if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
      val = undefined;
    } else if (isWindow(value)) {
      val = '$WINDOW';
    } else if (value && window.document === value) {
      val = '$DOCUMENT';
    } else if (isScope(value)) {
      val = '$SCOPE';
    }

    return val;
  }

  function toJson(obj, pretty) {
    if (isUndefined(obj)) return undefined;

    if (!isNumber(pretty)) {
      pretty = pretty ? 2 : null;
    }

    return JSON.stringify(obj, toJsonReplacer, pretty);
  }

  function fromJson(json) {
    return isString(json) ? JSON.parse(json) : json;
  }

  var ALL_COLONS = /:/g;

  function timezoneToOffset(timezone, fallback) {
    timezone = timezone.replace(ALL_COLONS, '');
    var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNumberNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
  }

  function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  function convertTimezoneToLocal(date, timezone, reverse) {
    reverse = reverse ? -1 : 1;
    var dateTimezoneOffset = date.getTimezoneOffset();
    var timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    return addDateMinutes(date, reverse * (timezoneOffset - dateTimezoneOffset));
  }

  function startingTag(element) {
    element = jqLite(element).clone().empty();
    var elemHtml = jqLite('<div></div>').append(element).html();

    try {
      return element[0].nodeType === NODE_TYPE_TEXT ? lowercase(elemHtml) : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w-]+)/, function (match, nodeName) {
        return '<' + lowercase(nodeName);
      });
    } catch (e) {
      return lowercase(elemHtml);
    }
  }

  function tryDecodeURIComponent(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {}
  }

  function parseKeyValue(keyValue) {
    var obj = {};
    forEach((keyValue || '').split('&'), function (keyValue) {
      var splitPoint, key, val;

      if (keyValue) {
        key = keyValue = keyValue.replace(/\+/g, '%20');
        splitPoint = keyValue.indexOf('=');

        if (splitPoint !== -1) {
          key = keyValue.substring(0, splitPoint);
          val = keyValue.substring(splitPoint + 1);
        }

        key = tryDecodeURIComponent(key);

        if (isDefined(key)) {
          val = isDefined(val) ? tryDecodeURIComponent(val) : true;

          if (!hasOwnProperty.call(obj, key)) {
            obj[key] = val;
          } else if (isArray(obj[key])) {
            obj[key].push(val);
          } else {
            obj[key] = [obj[key], val];
          }
        }
      }
    });
    return obj;
  }

  function toKeyValue(obj) {
    var parts = [];
    forEach(obj, function (value, key) {
      if (isArray(value)) {
        forEach(value, function (arrayValue) {
          parts.push(encodeUriQuery(key, true) + (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
        });
      } else {
        parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
      }
    });
    return parts.length ? parts.join('&') : '';
  }

  function encodeUriSegment(val) {
    return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
  }

  function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%3B/gi, ';').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
  }

  var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];

  function getNgAttribute(element, ngAttr) {
    var attr,
        i,
        ii = ngAttrPrefixes.length;

    for (i = 0; i < ii; ++i) {
      attr = ngAttrPrefixes[i] + ngAttr;

      if (isString(attr = element.getAttribute(attr))) {
        return attr;
      }
    }

    return null;
  }

  function allowAutoBootstrap(document) {
    var script = document.currentScript;

    if (!script) {
      return true;
    }

    if (!(script instanceof window.HTMLScriptElement || script instanceof window.SVGScriptElement)) {
      return false;
    }

    var attributes = script.attributes;
    var srcs = [attributes.getNamedItem('src'), attributes.getNamedItem('href'), attributes.getNamedItem('xlink:href')];
    return srcs.every(function (src) {
      if (!src) {
        return true;
      }

      if (!src.value) {
        return false;
      }

      var link = document.createElement('a');
      link.href = src.value;

      if (document.location.origin === link.origin) {
        return true;
      }

      switch (link.protocol) {
        case 'http:':
        case 'https:':
        case 'ftp:':
        case 'blob:':
        case 'file:':
        case 'data:':
          return true;

        default:
          return false;
      }
    });
  }

  var isAutoBootstrapAllowed = allowAutoBootstrap(window.document);

  function angularInit(element, bootstrap) {
    var appElement,
        module,
        config = {};
    forEach(ngAttrPrefixes, function (prefix) {
      var name = prefix + 'app';

      if (!appElement && element.hasAttribute && element.hasAttribute(name)) {
        appElement = element;
        module = element.getAttribute(name);
      }
    });
    forEach(ngAttrPrefixes, function (prefix) {
      var name = prefix + 'app';
      var candidate;

      if (!appElement && (candidate = element.querySelector('[' + name.replace(':', '\\:') + ']'))) {
        appElement = candidate;
        module = candidate.getAttribute(name);
      }
    });

    if (appElement) {
      console.info('Angular.js modified to launch Gleam\'s galleries ignores ng-app directives!', appElement);
    }
  }

  function bootstrap(element, modules, config) {
    if (!isObject(config)) config = {};
    var defaultConfig = {
      strictDi: false
    };
    config = extend(defaultConfig, config);

    var doBootstrap = function () {
      element = jqLite(element);

      if (element.injector()) {
        var tag = element[0] === window.document ? 'document' : startingTag(element);
        throw ngMinErr('btstrpd', 'App already bootstrapped with this element \'{0}\'', tag.replace(/</, '&lt;').replace(/>/, '&gt;'));
      }

      modules = modules || [];
      modules.unshift(['$provide', function ($provide) {
        $provide.value('$rootElement', element);
      }]);

      if (config.debugInfoEnabled) {
        modules.push(['$compileProvider', function ($compileProvider) {
          $compileProvider.debugInfoEnabled(true);
        }]);
      }

      modules.unshift('ng');
      var injector = createInjector(modules, config.strictDi);
      injector.invoke(['$rootScope', '$rootElement', '$compile', '$injector', function bootstrapApply(scope, element, compile, injector) {
        scope.$apply(function () {
          element.data('$injector', injector);
          compile(element)(scope);
        });
      }]);
      return injector;
    };

    var NG_ENABLE_DEBUG_INFO = /^NG_ENABLE_DEBUG_INFO!/;
    var NG_DEFER_BOOTSTRAP = /^NG_DEFER_BOOTSTRAP!/;

    if (window && NG_ENABLE_DEBUG_INFO.test(window.name)) {
      config.debugInfoEnabled = true;
      window.name = window.name.replace(NG_ENABLE_DEBUG_INFO, '');
    }

    if (window && !NG_DEFER_BOOTSTRAP.test(window.name)) {
      return doBootstrap();
    }

    window.name = window.name.replace(NG_DEFER_BOOTSTRAP, '');

    angular.resumeBootstrap = function (extraModules) {
      forEach(extraModules, function (module) {
        modules.push(module);
      });
      return doBootstrap();
    };

    if (isFunction(angular.resumeDeferredBootstrap)) {
      angular.resumeDeferredBootstrap();
    }
  }

  function reloadWithDebugInfo() {
    window.name = 'NG_ENABLE_DEBUG_INFO!' + window.name;
    window.location.reload();
  }

  function getTestability(rootElement) {
    var injector = angular.element(rootElement).injector();

    if (!injector) {
      throw ngMinErr('test', 'no injector found for element argument to getTestability');
    }

    return injector.get('$$testability');
  }

  var SNAKE_CASE_REGEXP = /[A-Z]/g;

  function snake_case(name, separator) {
    separator = separator || '_';
    return name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  var bindJQueryFired = false;

  function bindJQuery() {
    var originalCleanData;

    if (bindJQueryFired) {
      return;
    }

    jqLite = JQLite;
    originalCleanData = jqLite.cleanData;

    jqLite.cleanData = function (elems) {
      var events;

      for (var i = 0, elem; (elem = elems[i]) != null; i++) {
        events = (jqLite._data(elem) || {}).events;

        if (events && events.$destroy) {
          jqLite(elem).triggerHandler('$destroy');
        }
      }

      originalCleanData(elems);
    };

    angular.element = jqLite;
    bindJQueryFired = true;
  }

  function UNSAFE_restoreLegacyJqLiteXHTMLReplacement() {
    JQLite.legacyXHTMLReplacement = true;
  }

  function assertArg(arg, name, reason) {
    if (!arg) {
      throw ngMinErr('areq', 'Argument \'{0}\' is {1}', name || '?', reason || 'required');
    }

    return arg;
  }

  function assertArgFn(arg, name, acceptArrayAnnotation) {
    if (acceptArrayAnnotation && isArray(arg)) {
      arg = arg[arg.length - 1];
    }

    assertArg(isFunction(arg), name, 'not a function, got ' + (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
    return arg;
  }

  function assertNotHasOwnProperty(name, context) {
    if (name === 'hasOwnProperty') {
      throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
    }
  }

  function getter(obj, path, bindFnToScope) {
    if (!path) return obj;
    var keys = path.split('.');
    var key;
    var lastInstance = obj;
    var len = keys.length;

    for (var i = 0; i < len; i++) {
      key = keys[i];

      if (obj) {
        obj = (lastInstance = obj)[key];
      }
    }

    if (!bindFnToScope && isFunction(obj)) {
      return bind(lastInstance, obj);
    }

    return obj;
  }

  function getBlockNodes(nodes) {
    var node = nodes[0];
    var endNode = nodes[nodes.length - 1];
    var blockNodes;

    for (var i = 1; node !== endNode && (node = node.nextSibling); i++) {
      if (blockNodes || nodes[i] !== node) {
        if (!blockNodes) {
          blockNodes = jqLite(slice.call(nodes, 0, i));
        }

        blockNodes.push(node);
      }
    }

    return blockNodes || nodes;
  }

  function createMap() {
    return Object.create(null);
  }

  function stringify(value) {
    if (value == null) {
      return '';
    }

    switch (typeof value) {
      case 'string':
        break;

      case 'number':
        value = '' + value;
        break;

      default:
        if (hasCustomToString(value) && !isArray(value) && !isDate(value)) {
          value = value.toString();
        } else {
          value = toJson(value);
        }

    }

    return value;
  }

  var NODE_TYPE_ELEMENT = 1;
  var NODE_TYPE_ATTRIBUTE = 2;
  var NODE_TYPE_TEXT = 3;
  var NODE_TYPE_COMMENT = 8;
  var NODE_TYPE_DOCUMENT = 9;
  var NODE_TYPE_DOCUMENT_FRAGMENT = 11;

  function setupModuleLoader(window) {
    var $injectorMinErr = minErr('$injector');
    var ngMinErr = minErr('ng');

    function ensure(obj, name, factory) {
      return obj[name] || (obj[name] = factory());
    }

    var angular = ensure(module.exports, 'angular', Object);
    angular.$$minErr = angular.$$minErr || minErr;
    return ensure(angular, 'module', function () {
      var modules = {};
      return function module(name, requires, configFn) {
        var info = {};

        var assertNotHasOwnProperty = function (name, context) {
          if (name === 'hasOwnProperty') {
            throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
          }
        };

        assertNotHasOwnProperty(name, 'module');

        if (requires && modules.hasOwnProperty(name)) {
          modules[name] = null;
        }

        return ensure(modules, name, function () {
          if (!requires) {
            throw $injectorMinErr('nomod', 'Module \'{0}\' is not available! You either misspelled ' + 'the module name or forgot to load it. If registering a module ensure that you ' + 'specify the dependencies as the second argument.', name);
          }

          var invokeQueue = [];
          var configBlocks = [];
          var runBlocks = [];
          var config = invokeLater('$injector', 'invoke', 'push', configBlocks);
          var moduleInstance = {
            _invokeQueue: invokeQueue,
            _configBlocks: configBlocks,
            _runBlocks: runBlocks,
            info: function (value) {
              if (isDefined(value)) {
                if (!isObject(value)) throw ngMinErr('aobj', 'Argument \'{0}\' must be an object', 'value');
                info = value;
                return this;
              }

              return info;
            },
            requires: requires,
            name: name,
            provider: invokeLaterAndSetModuleName('$provide', 'provider'),
            factory: invokeLaterAndSetModuleName('$provide', 'factory'),
            service: invokeLaterAndSetModuleName('$provide', 'service'),
            value: invokeLater('$provide', 'value'),
            constant: invokeLater('$provide', 'constant', 'unshift'),
            decorator: invokeLaterAndSetModuleName('$provide', 'decorator', configBlocks),
            animation: invokeLaterAndSetModuleName('$animateProvider', 'register'),
            filter: invokeLaterAndSetModuleName('$filterProvider', 'register'),
            controller: invokeLaterAndSetModuleName('$controllerProvider', 'register'),
            directive: invokeLaterAndSetModuleName('$compileProvider', 'directive'),
            component: invokeLaterAndSetModuleName('$compileProvider', 'component'),
            config: config,
            run: function (block) {
              runBlocks.push(block);
              return this;
            }
          };

          if (configFn) {
            config(configFn);
          }

          return moduleInstance;

          function invokeLater(provider, method, insertMethod, queue) {
            if (!queue) queue = invokeQueue;
            return function () {
              queue[insertMethod || 'push']([provider, method, arguments]);
              return moduleInstance;
            };
          }

          function invokeLaterAndSetModuleName(provider, method, queue) {
            if (!queue) queue = invokeQueue;
            return function (recipeName, factoryFunction) {
              if (factoryFunction && isFunction(factoryFunction)) factoryFunction.$$moduleName = name;
              queue.push([provider, method, arguments]);
              return moduleInstance;
            };
          }
        });
      };
    });
  }

  function shallowCopy(src, dst) {
    if (isArray(src)) {
      dst = dst || [];

      for (var i = 0, ii = src.length; i < ii; i++) {
        dst[i] = src[i];
      }
    } else if (isObject(src)) {
      dst = dst || {};

      for (var key in src) {
        if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
          dst[key] = src[key];
        }
      }
    }

    return dst || src;
  }

  function serializeObject(obj, maxDepth) {
    var seen = [];

    if (isValidObjectMaxDepth(maxDepth)) {
      obj = angular.copy(obj, null, maxDepth);
    }

    return JSON.stringify(obj, function (key, val) {
      val = toJsonReplacer(key, val);

      if (isObject(val)) {
        if (seen.indexOf(val) >= 0) return '...';
        seen.push(val);
      }

      return val;
    });
  }

  function toDebugString(obj, maxDepth) {
    if (typeof obj === 'function') {
      return obj.toString().replace(/ \{[\s\S]*$/, '');
    } else if (isUndefined(obj)) {
      return 'undefined';
    } else if (typeof obj !== 'string') {
      return serializeObject(obj, maxDepth);
    }

    return obj;
  }

  var version = {
    full: '1.8.1-local+sha.258c05485',
    major: 1,
    minor: 8,
    dot: 1,
    codeName: 'snapshot'
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
      'callbacks': {
        $$counter: 0
      },
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
    angularModule('ng', [], ['$provide', function ngModule($provide) {
      $provide.provider({
        $$sanitizeUri: $$SanitizeUriProvider
      });
      $provide.provider('$compile', $CompileProvider).directive({
        ngBind: ngBindDirective,
        ngBindHtml: ngBindHtmlDirective,
        ngClass: ngClassDirective,
        ngClassEven: ngClassEvenDirective,
        ngClassOdd: ngClassOddDirective,
        ngCloak: ngCloakDirective,
        ngController: ngControllerDirective,
        ngHide: ngHideDirective,
        ngIf: ngIfDirective,
        ngInit: ngInitDirective,
        ngNonBindable: ngNonBindableDirective,
        ngRepeat: ngRepeatDirective,
        ngShow: ngShowDirective,
        ngStyle: ngStyleDirective,
        ngSwitch: ngSwitchDirective,
        ngSwitchWhen: ngSwitchWhenDirective,
        ngSwitchDefault: ngSwitchDefaultDirective,
        ngTransclude: ngTranscludeDirective
      }).directive(ngAttributeAliasDirectives).directive(ngEventDirectives);
      $provide.provider({
        $browser: $BrowserProvider,
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
        $timeout: $TimeoutProvider,
        $window: $WindowProvider,
        $$jqLite: $$jqLiteProvider,
        $$Map: $$MapProvider
      });
    }]).info({
      angularVersion: '1.8.1-local+sha.258c05485'
    });
  }

  JQLite.expando = 'ng339';
  var jqCache = JQLite.cache = {},
      jqId = 1;

  JQLite._data = function (node) {
    return this.cache[node[this.expando]] || {};
  };

  function jqNextId() {
    return ++jqId;
  }

  var DASH_LOWERCASE_REGEXP = /-([a-z])/g;
  var MS_HACK_REGEXP = /^-ms-/;
  var MOUSE_EVENT_MAP = {
    mouseleave: 'mouseout',
    mouseenter: 'mouseover'
  };
  var jqLiteMinErr = minErr('jqLite');

  function cssKebabToCamel(name) {
    return kebabToCamel(name.replace(MS_HACK_REGEXP, 'ms-'));
  }

  function fnCamelCaseReplace(all, letter) {
    return letter.toUpperCase();
  }

  function kebabToCamel(name) {
    return name.replace(DASH_LOWERCASE_REGEXP, fnCamelCaseReplace);
  }

  var SINGLE_TAG_REGEXP = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/;
  var HTML_REGEXP = /<|&#?\w+;/;
  var TAG_NAME_REGEXP = /<([\w:-]+)/;
  var XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi;
  var wrapMap = {
    thead: ['table'],
    col: ['colgroup', 'table'],
    tr: ['tbody', 'table'],
    td: ['tr', 'tbody', 'table']
  };
  wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
  wrapMap.th = wrapMap.td;
  var wrapMapIE9 = {
    option: [1, '<select multiple="multiple">', '</select>'],
    _default: [0, '', '']
  };

  for (var key in wrapMap) {
    var wrapMapValueClosing = wrapMap[key];
    var wrapMapValue = wrapMapValueClosing.slice().reverse();
    wrapMapIE9[key] = [wrapMapValue.length, '<' + wrapMapValue.join('><') + '>', '</' + wrapMapValueClosing.join('></') + '>'];
  }

  wrapMapIE9.optgroup = wrapMapIE9.option;

  function jqLiteIsTextNode(html) {
    return !HTML_REGEXP.test(html);
  }

  function jqLiteAcceptsData(node) {
    var nodeType = node.nodeType;
    return nodeType === NODE_TYPE_ELEMENT || !nodeType || nodeType === NODE_TYPE_DOCUMENT;
  }

  function jqLiteHasData(node) {
    for (var key in jqCache[node.ng339]) {
      return true;
    }

    return false;
  }

  function jqLiteBuildFragment(html, context) {
    var tmp,
        tag,
        wrap,
        finalHtml,
        fragment = context.createDocumentFragment(),
        nodes = [],
        i;

    if (jqLiteIsTextNode(html)) {
      nodes.push(context.createTextNode(html));
    } else {
      tmp = fragment.appendChild(context.createElement('div'));
      tag = (TAG_NAME_REGEXP.exec(html) || ['', ''])[1].toLowerCase();
      finalHtml = JQLite.legacyXHTMLReplacement ? html.replace(XHTML_TAG_REGEXP, '<$1></$2>') : html;

      if (msie < 10) {
        wrap = wrapMapIE9[tag] || wrapMapIE9._default;
        tmp.innerHTML = wrap[1] + finalHtml + wrap[2];
        i = wrap[0];

        while (i--) {
          tmp = tmp.firstChild;
        }
      } else {
        wrap = wrapMap[tag] || [];
        i = wrap.length;

        while (--i > -1) {
          tmp.appendChild(window.document.createElement(wrap[i]));
          tmp = tmp.firstChild;
        }

        tmp.innerHTML = finalHtml;
      }

      nodes = concat(nodes, tmp.childNodes);
      tmp = fragment.firstChild;
      tmp.textContent = '';
    }

    fragment.textContent = '';
    fragment.innerHTML = '';
    forEach(nodes, function (node) {
      fragment.appendChild(node);
    });
    return fragment;
  }

  function jqLiteParseHTML(html, context) {
    context = context || window.document;
    var parsed;

    if (parsed = SINGLE_TAG_REGEXP.exec(html)) {
      return [context.createElement(parsed[1])];
    }

    if (parsed = jqLiteBuildFragment(html, context)) {
      return parsed.childNodes;
    }

    return [];
  }

  function jqLiteWrapNode(node, wrapper) {
    var parent = node.parentNode;

    if (parent) {
      parent.replaceChild(wrapper, node);
    }

    wrapper.appendChild(node);
  }

  var jqLiteContains = window.Node.prototype.contains || function (arg) {
    return !!(this.compareDocumentPosition(arg) & 16);
  };

  function JQLite(element) {
    if (element instanceof JQLite) {
      return element;
    }

    var argIsString;

    if (isString(element)) {
      element = trim(element);
      argIsString = true;
    }

    if (!(this instanceof JQLite)) {
      if (argIsString && element.charAt(0) !== '<') {
        throw jqLiteMinErr('nosel', 'Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element');
      }

      return new JQLite(element);
    }

    if (argIsString) {
      jqLiteAddNodes(this, jqLiteParseHTML(element));
    } else if (isFunction(element)) {
      jqLiteReady(element);
    } else {
      jqLiteAddNodes(this, element);
    }
  }

  function jqLiteClone(element) {
    return element.cloneNode(true);
  }

  function jqLiteDealoc(element, onlyDescendants) {
    if (!onlyDescendants && jqLiteAcceptsData(element)) jqLite.cleanData([element]);

    if (element.querySelectorAll) {
      jqLite.cleanData(element.querySelectorAll('*'));
    }
  }

  function isEmptyObject(obj) {
    var name;

    for (name in obj) {
      return false;
    }

    return true;
  }

  function removeIfEmptyData(element) {
    var expandoId = element.ng339;
    var expandoStore = expandoId && jqCache[expandoId];
    var events = expandoStore && expandoStore.events;
    var data = expandoStore && expandoStore.data;

    if ((!data || isEmptyObject(data)) && (!events || isEmptyObject(events))) {
      delete jqCache[expandoId];
      element.ng339 = undefined;
    }
  }

  function jqLiteOff(element, type, fn, unsupported) {
    if (isDefined(unsupported)) throw jqLiteMinErr('offargs', 'jqLite#off() does not support the `selector` argument');
    var expandoStore = jqLiteExpandoStore(element);
    var events = expandoStore && expandoStore.events;
    var handle = expandoStore && expandoStore.handle;
    if (!handle) return;

    if (!type) {
      for (type in events) {
        if (type !== '$destroy') {
          element.removeEventListener(type, handle);
        }

        delete events[type];
      }
    } else {
      var removeHandler = function (type) {
        var listenerFns = events[type];

        if (isDefined(fn)) {
          arrayRemove(listenerFns || [], fn);
        }

        if (!(isDefined(fn) && listenerFns && listenerFns.length > 0)) {
          element.removeEventListener(type, handle);
          delete events[type];
        }
      };

      forEach(type.split(' '), function (type) {
        removeHandler(type);

        if (MOUSE_EVENT_MAP[type]) {
          removeHandler(MOUSE_EVENT_MAP[type]);
        }
      });
    }

    removeIfEmptyData(element);
  }

  function jqLiteRemoveData(element, name) {
    var expandoId = element.ng339;
    var expandoStore = expandoId && jqCache[expandoId];

    if (expandoStore) {
      if (name) {
        delete expandoStore.data[name];
      } else {
        expandoStore.data = {};
      }

      removeIfEmptyData(element);
    }
  }

  function jqLiteExpandoStore(element, createIfNecessary) {
    var expandoId = element.ng339,
        expandoStore = expandoId && jqCache[expandoId];

    if (createIfNecessary && !expandoStore) {
      element.ng339 = expandoId = jqNextId();
      expandoStore = jqCache[expandoId] = {
        events: {},
        data: {},
        handle: undefined
      };
    }

    return expandoStore;
  }

  function jqLiteData(element, key, value) {
    if (jqLiteAcceptsData(element)) {
      var prop;
      var isSimpleSetter = isDefined(value);
      var isSimpleGetter = !isSimpleSetter && key && !isObject(key);
      var massGetter = !key;
      var expandoStore = jqLiteExpandoStore(element, !isSimpleGetter);
      var data = expandoStore && expandoStore.data;

      if (isSimpleSetter) {
        data[kebabToCamel(key)] = value;
      } else {
        if (massGetter) {
          return data;
        } else {
          if (isSimpleGetter) {
            return data && data[kebabToCamel(key)];
          } else {
            for (prop in key) {
              data[kebabToCamel(prop)] = key[prop];
            }
          }
        }
      }
    }
  }

  function jqLiteHasClass(element, selector) {
    if (!element.getAttribute) return false;
    return (' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ').indexOf(' ' + selector + ' ') > -1;
  }

  function jqLiteRemoveClass(element, cssClasses) {
    if (cssClasses && element.setAttribute) {
      var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ');
      var newClasses = existingClasses;
      forEach(cssClasses.split(' '), function (cssClass) {
        cssClass = trim(cssClass);
        newClasses = newClasses.replace(' ' + cssClass + ' ', ' ');
      });

      if (newClasses !== existingClasses) {
        element.setAttribute('class', trim(newClasses));
      }
    }
  }

  function jqLiteAddClass(element, cssClasses) {
    if (cssClasses && element.setAttribute) {
      var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ');
      var newClasses = existingClasses;
      forEach(cssClasses.split(' '), function (cssClass) {
        cssClass = trim(cssClass);

        if (newClasses.indexOf(' ' + cssClass + ' ') === -1) {
          newClasses += cssClass + ' ';
        }
      });

      if (newClasses !== existingClasses) {
        element.setAttribute('class', trim(newClasses));
      }
    }
  }

  function jqLiteAddNodes(root, elements) {
    if (elements) {
      if (elements.nodeType) {
        root[root.length++] = elements;
      } else {
        var length = elements.length;

        if (typeof length === 'number' && elements.window !== elements) {
          if (length) {
            for (var i = 0; i < length; i++) {
              root[root.length++] = elements[i];
            }
          }
        } else {
          root[root.length++] = elements;
        }
      }
    }
  }

  function jqLiteController(element, name) {
    return jqLiteInheritedData(element, '$' + (name || 'ngController') + 'Controller');
  }

  function jqLiteInheritedData(element, name, value) {
    if (element.nodeType === NODE_TYPE_DOCUMENT) {
      element = element.documentElement;
    }

    var names = isArray(name) ? name : [name];

    while (element) {
      for (var i = 0, ii = names.length; i < ii; i++) {
        if (isDefined(value = jqLite.data(element, names[i]))) return value;
      }

      element = element.parentNode || element.nodeType === NODE_TYPE_DOCUMENT_FRAGMENT && element.host;
    }
  }

  function jqLiteEmpty(element) {
    jqLiteDealoc(element, true);

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function jqLiteRemove(element, keepData) {
    if (!keepData) jqLiteDealoc(element);
    var parent = element.parentNode;
    if (parent) parent.removeChild(element);
  }

  function jqLiteDocumentLoaded(action, win) {
    win = win || window;

    if (win.document.readyState === 'complete') {
      win.setTimeout(action);
    } else {
      jqLite(win).on('load', action);
    }
  }

  function jqLiteReady(fn) {
    function trigger() {
      window.document.removeEventListener('DOMContentLoaded', trigger);
      window.removeEventListener('load', trigger);
      fn();
    }

    if (window.document.readyState === 'complete') {
      window.setTimeout(fn);
    } else {
      window.document.addEventListener('DOMContentLoaded', trigger);
      window.addEventListener('load', trigger);
    }
  }

  var JQLitePrototype = JQLite.prototype = {
    ready: jqLiteReady,
    toString: function () {
      var value = [];
      forEach(this, function (e) {
        value.push('' + e);
      });
      return '[' + value.join(', ') + ']';
    },
    eq: function (index) {
      return index >= 0 ? jqLite(this[index]) : jqLite(this[this.length + index]);
    },
    length: 0,
    push: push,
    sort: [].sort,
    splice: [].splice
  };
  var BOOLEAN_ATTR = {};
  forEach('multiple,selected,checked,disabled,readOnly,required,open'.split(','), function (value) {
    BOOLEAN_ATTR[lowercase(value)] = value;
  });
  var BOOLEAN_ELEMENTS = {};
  forEach('input,select,option,textarea,button,form,details'.split(','), function (value) {
    BOOLEAN_ELEMENTS[value] = true;
  });
  var ALIASED_ATTR = {
    'ngMinlength': 'minlength',
    'ngMaxlength': 'maxlength',
    'ngMin': 'min',
    'ngMax': 'max',
    'ngPattern': 'pattern',
    'ngStep': 'step'
  };

  function getBooleanAttrName(element, name) {
    var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];
    return booleanAttr && BOOLEAN_ELEMENTS[nodeName_(element)] && booleanAttr;
  }

  function getAliasedAttrName(name) {
    return ALIASED_ATTR[name];
  }

  forEach({
    data: jqLiteData,
    removeData: jqLiteRemoveData,
    hasData: jqLiteHasData,
    cleanData: function jqLiteCleanData(nodes) {
      for (var i = 0, ii = nodes.length; i < ii; i++) {
        jqLiteRemoveData(nodes[i]);
        jqLiteOff(nodes[i]);
      }
    }
  }, function (fn, name) {
    JQLite[name] = fn;
  });
  forEach({
    data: jqLiteData,
    inheritedData: jqLiteInheritedData,
    scope: function (element) {
      return jqLite.data(element, '$scope') || jqLiteInheritedData(element.parentNode || element, ['$isolateScope', '$scope']);
    },
    isolateScope: function (element) {
      return jqLite.data(element, '$isolateScope') || jqLite.data(element, '$isolateScopeNoTemplate');
    },
    controller: jqLiteController,
    injector: function (element) {
      return jqLiteInheritedData(element, '$injector');
    },
    removeAttr: function (element, name) {
      element.removeAttribute(name);
    },
    hasClass: jqLiteHasClass,
    css: function (element, name, value) {
      name = cssKebabToCamel(name);

      if (isDefined(value)) {
        element.style[name] = value;
      } else {
        return element.style[name];
      }
    },
    attr: function (element, name, value) {
      var ret;
      var nodeType = element.nodeType;

      if (nodeType === NODE_TYPE_TEXT || nodeType === NODE_TYPE_ATTRIBUTE || nodeType === NODE_TYPE_COMMENT || !element.getAttribute) {
        return;
      }

      var lowercasedName = lowercase(name);
      var isBooleanAttr = BOOLEAN_ATTR[lowercasedName];

      if (isDefined(value)) {
        if (value === null || value === false && isBooleanAttr) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, isBooleanAttr ? lowercasedName : value);
        }
      } else {
        ret = element.getAttribute(name);

        if (isBooleanAttr && ret !== null) {
          ret = lowercasedName;
        }

        return ret === null ? undefined : ret;
      }
    },
    prop: function (element, name, value) {
      if (isDefined(value)) {
        element[name] = value;
      } else {
        return element[name];
      }
    },
    text: function () {
      getText.$dv = '';
      return getText;

      function getText(element, value) {
        if (isUndefined(value)) {
          var nodeType = element.nodeType;
          return nodeType === NODE_TYPE_ELEMENT || nodeType === NODE_TYPE_TEXT ? element.textContent : '';
        }

        element.textContent = value;
      }
    }(),
    val: function (element, value) {
      if (isUndefined(value)) {
        if (element.multiple && nodeName_(element) === 'select') {
          var result = [];
          forEach(element.options, function (option) {
            if (option.selected) {
              result.push(option.value || option.text);
            }
          });
          return result;
        }

        return element.value;
      }

      element.value = value;
    },
    html: function (element, value) {
      if (isUndefined(value)) {
        return element.innerHTML;
      }

      jqLiteDealoc(element, true);
      element.innerHTML = value;
    },
    empty: jqLiteEmpty
  }, function (fn, name) {
    JQLite.prototype[name] = function (arg1, arg2) {
      var i, key;
      var nodeCount = this.length;

      if (fn !== jqLiteEmpty && isUndefined(fn.length === 2 && fn !== jqLiteHasClass && fn !== jqLiteController ? arg1 : arg2)) {
        if (isObject(arg1)) {
          for (i = 0; i < nodeCount; i++) {
            if (fn === jqLiteData) {
              fn(this[i], arg1);
            } else {
              for (key in arg1) {
                fn(this[i], key, arg1[key]);
              }
            }
          }

          return this;
        } else {
          var value = fn.$dv;
          var jj = isUndefined(value) ? Math.min(nodeCount, 1) : nodeCount;

          for (var j = 0; j < jj; j++) {
            var nodeValue = fn(this[j], arg1, arg2);
            value = value ? value + nodeValue : nodeValue;
          }

          return value;
        }
      } else {
        for (i = 0; i < nodeCount; i++) {
          fn(this[i], arg1, arg2);
        }

        return this;
      }
    };
  });

  function createEventHandler(element, events) {
    var eventHandler = function (event, type) {
      event.isDefaultPrevented = function () {
        return event.defaultPrevented;
      };

      var eventFns = events[type || event.type];
      var eventFnsLength = eventFns ? eventFns.length : 0;
      if (!eventFnsLength) return;

      if (isUndefined(event.immediatePropagationStopped)) {
        var originalStopImmediatePropagation = event.stopImmediatePropagation;

        event.stopImmediatePropagation = function () {
          event.immediatePropagationStopped = true;

          if (event.stopPropagation) {
            event.stopPropagation();
          }

          if (originalStopImmediatePropagation) {
            originalStopImmediatePropagation.call(event);
          }
        };
      }

      event.isImmediatePropagationStopped = function () {
        return event.immediatePropagationStopped === true;
      };

      var handlerWrapper = eventFns.specialHandlerWrapper || defaultHandlerWrapper;

      if (eventFnsLength > 1) {
        eventFns = shallowCopy(eventFns);
      }

      for (var i = 0; i < eventFnsLength; i++) {
        if (!event.isImmediatePropagationStopped()) {
          handlerWrapper(element, event, eventFns[i]);
        }
      }
    };

    eventHandler.elem = element;
    return eventHandler;
  }

  function defaultHandlerWrapper(element, event, handler) {
    handler.call(element, event);
  }

  function specialMouseHandlerWrapper(target, event, handler) {
    var related = event.relatedTarget;

    if (!related || related !== target && !jqLiteContains.call(target, related)) {
      handler.call(target, event);
    }
  }

  forEach({
    removeData: jqLiteRemoveData,
    on: function jqLiteOn(element, type, fn, unsupported) {
      if (isDefined(unsupported)) throw jqLiteMinErr('onargs', 'jqLite#on() does not support the `selector` or `eventData` parameters');

      if (!jqLiteAcceptsData(element)) {
        return;
      }

      var expandoStore = jqLiteExpandoStore(element, true);
      var events = expandoStore.events;
      var handle = expandoStore.handle;

      if (!handle) {
        handle = expandoStore.handle = createEventHandler(element, events);
      }

      var types = type.indexOf(' ') >= 0 ? type.split(' ') : [type];
      var i = types.length;

      var addHandler = function (type, specialHandlerWrapper, noEventListener) {
        var eventFns = events[type];

        if (!eventFns) {
          eventFns = events[type] = [];
          eventFns.specialHandlerWrapper = specialHandlerWrapper;

          if (type !== '$destroy' && !noEventListener) {
            element.addEventListener(type, handle);
          }
        }

        eventFns.push(fn);
      };

      while (i--) {
        type = types[i];

        if (MOUSE_EVENT_MAP[type]) {
          addHandler(MOUSE_EVENT_MAP[type], specialMouseHandlerWrapper);
          addHandler(type, undefined, true);
        } else {
          addHandler(type);
        }
      }
    },
    off: jqLiteOff,
    one: function (element, type, fn) {
      element = jqLite(element);
      element.on(type, function onFn() {
        element.off(type, fn);
        element.off(type, onFn);
      });
      element.on(type, fn);
    },
    replaceWith: function (element, replaceNode) {
      var index,
          parent = element.parentNode;
      jqLiteDealoc(element);
      forEach(new JQLite(replaceNode), function (node) {
        if (index) {
          parent.insertBefore(node, index.nextSibling);
        } else {
          parent.replaceChild(node, element);
        }

        index = node;
      });
    },
    children: function (element) {
      var children = [];
      forEach(element.childNodes, function (element) {
        if (element.nodeType === NODE_TYPE_ELEMENT) {
          children.push(element);
        }
      });
      return children;
    },
    contents: function (element) {
      return element.contentDocument || element.childNodes || [];
    },
    append: function (element, node) {
      var nodeType = element.nodeType;
      if (nodeType !== NODE_TYPE_ELEMENT && nodeType !== NODE_TYPE_DOCUMENT_FRAGMENT) return;
      node = new JQLite(node);

      for (var i = 0, ii = node.length; i < ii; i++) {
        var child = node[i];
        element.appendChild(child);
      }
    },
    prepend: function (element, node) {
      if (element.nodeType === NODE_TYPE_ELEMENT) {
        var index = element.firstChild;
        forEach(new JQLite(node), function (child) {
          element.insertBefore(child, index);
        });
      }
    },
    wrap: function (element, wrapNode) {
      jqLiteWrapNode(element, jqLite(wrapNode).eq(0).clone()[0]);
    },
    remove: jqLiteRemove,
    detach: function (element) {
      jqLiteRemove(element, true);
    },
    after: function (element, newElement) {
      var index = element,
          parent = element.parentNode;

      if (parent) {
        newElement = new JQLite(newElement);

        for (var i = 0, ii = newElement.length; i < ii; i++) {
          var node = newElement[i];
          parent.insertBefore(node, index.nextSibling);
          index = node;
        }
      }
    },
    addClass: jqLiteAddClass,
    removeClass: jqLiteRemoveClass,
    toggleClass: function (element, selector, condition) {
      if (selector) {
        forEach(selector.split(' '), function (className) {
          var classCondition = condition;

          if (isUndefined(classCondition)) {
            classCondition = !jqLiteHasClass(element, className);
          }

          (classCondition ? jqLiteAddClass : jqLiteRemoveClass)(element, className);
        });
      }
    },
    parent: function (element) {
      var parent = element.parentNode;
      return parent && parent.nodeType !== NODE_TYPE_DOCUMENT_FRAGMENT ? parent : null;
    },
    next: function (element) {
      return element.nextElementSibling;
    },
    find: function (element, selector) {
      if (element.getElementsByTagName) {
        return element.getElementsByTagName(selector);
      } else {
        return [];
      }
    },
    clone: jqLiteClone,
    triggerHandler: function (element, event, extraParameters) {
      var dummyEvent, eventFnsCopy, handlerArgs;
      var eventName = event.type || event;
      var expandoStore = jqLiteExpandoStore(element);
      var events = expandoStore && expandoStore.events;
      var eventFns = events && events[eventName];

      if (eventFns) {
        dummyEvent = {
          preventDefault: function () {
            this.defaultPrevented = true;
          },
          isDefaultPrevented: function () {
            return this.defaultPrevented === true;
          },
          stopImmediatePropagation: function () {
            this.immediatePropagationStopped = true;
          },
          isImmediatePropagationStopped: function () {
            return this.immediatePropagationStopped === true;
          },
          stopPropagation: noop,
          type: eventName,
          target: element
        };

        if (event.type) {
          dummyEvent = extend(dummyEvent, event);
        }

        eventFnsCopy = shallowCopy(eventFns);
        handlerArgs = extraParameters ? [dummyEvent].concat(extraParameters) : [dummyEvent];
        forEach(eventFnsCopy, function (fn) {
          if (!dummyEvent.isImmediatePropagationStopped()) {
            fn.apply(element, handlerArgs);
          }
        });
      }
    }
  }, function (fn, name) {
    JQLite.prototype[name] = function (arg1, arg2, arg3) {
      var value;

      for (var i = 0, ii = this.length; i < ii; i++) {
        if (isUndefined(value)) {
          value = fn(this[i], arg1, arg2, arg3);

          if (isDefined(value)) {
            value = jqLite(value);
          }
        } else {
          jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
        }
      }

      return isDefined(value) ? value : this;
    };
  });
  JQLite.prototype.bind = JQLite.prototype.on;
  JQLite.prototype.unbind = JQLite.prototype.off;

  function $$jqLiteProvider() {
    this.$get = function $$jqLite() {
      return extend(JQLite, {
        hasClass: function (node, classes) {
          if (node.attr) node = node[0];
          return jqLiteHasClass(node, classes);
        },
        addClass: function (node, classes) {
          if (node.attr) node = node[0];
          return jqLiteAddClass(node, classes);
        },
        removeClass: function (node, classes) {
          if (node.attr) node = node[0];
          return jqLiteRemoveClass(node, classes);
        }
      });
    };
  }

  function hashKey(obj, nextUidFn) {
    var key = obj && obj.$$hashKey;

    if (key) {
      if (typeof key === 'function') {
        key = obj.$$hashKey();
      }

      return key;
    }

    var objType = typeof obj;

    if (objType === 'function' || objType === 'object' && obj !== null) {
      key = obj.$$hashKey = objType + ':' + (nextUidFn || nextUid)();
    } else {
      key = objType + ':' + obj;
    }

    return key;
  }

  var nanKey = Object.create(null);

  function NgMapShim() {
    this._keys = [];
    this._values = [];
    this._lastKey = NaN;
    this._lastIndex = -1;
  }

  NgMapShim.prototype = {
    _idx: function (key) {
      if (key !== this._lastKey) {
        this._lastKey = key;
        this._lastIndex = this._keys.indexOf(key);
      }

      return this._lastIndex;
    },
    _transformKey: function (key) {
      return isNumberNaN(key) ? nanKey : key;
    },
    get: function (key) {
      key = this._transformKey(key);

      var idx = this._idx(key);

      if (idx !== -1) {
        return this._values[idx];
      }
    },
    has: function (key) {
      key = this._transformKey(key);

      var idx = this._idx(key);

      return idx !== -1;
    },
    set: function (key, value) {
      key = this._transformKey(key);

      var idx = this._idx(key);

      if (idx === -1) {
        idx = this._lastIndex = this._keys.length;
      }

      this._keys[idx] = key;
      this._values[idx] = value;
    },
    delete: function (key) {
      key = this._transformKey(key);

      var idx = this._idx(key);

      if (idx === -1) {
        return false;
      }

      this._keys.splice(idx, 1);

      this._values.splice(idx, 1);

      this._lastKey = NaN;
      this._lastIndex = -1;
      return true;
    }
  };
  var NgMap = NgMapShim;
  var $$MapProvider = [function () {
    this.$get = [function () {
      return NgMap;
    }];
  }];
  var ARROW_ARG = /^([^(]+?)=>/;
  var FN_ARGS = /^[^(]*\(\s*([^)]*)\)/m;
  var FN_ARG_SPLIT = /,/;
  var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var $injectorMinErr = minErr('$injector');

  function stringifyFn(fn) {
    return Function.prototype.toString.call(fn);
  }

  function extractArgs(fn) {
    var fnText = stringifyFn(fn).replace(STRIP_COMMENTS, ''),
        args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
    return args;
  }

  function anonFn(fn) {
    var args = extractArgs(fn);

    if (args) {
      return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
    }

    return 'fn';
  }

  function annotate(fn, strictDi, name) {
    var $inject, argDecl, last;

    if (typeof fn === 'function') {
      if (!($inject = fn.$inject)) {
        $inject = [];

        if (fn.length) {
          if (strictDi) {
            if (!isString(name) || !name) {
              name = fn.name || anonFn(fn);
            }

            throw $injectorMinErr('strictdi', '{0} is not using explicit annotation and cannot be invoked in strict mode', name);
          }

          argDecl = extractArgs(fn);
          forEach(argDecl[1].split(FN_ARG_SPLIT), function (arg) {
            arg.replace(FN_ARG, function (all, underscore, name) {
              $inject.push(name);
            });
          });
        }

        fn.$inject = $inject;
      }
    } else if (isArray(fn)) {
      last = fn.length - 1;
      assertArgFn(fn[last], 'fn');
      $inject = fn.slice(0, last);
    } else {
      assertArgFn(fn, 'fn', true);
    }

    return $inject;
  }

  function createInjector(modulesToLoad, strictDi) {
    strictDi = strictDi === true;
    var INSTANTIATING = {},
        providerSuffix = 'Provider',
        path = [],
        loadedModules = new NgMap(),
        providerCache = {
      $provide: {
        provider: supportObject(provider),
        factory: supportObject(factory),
        service: supportObject(service),
        value: supportObject(value),
        constant: supportObject(constant),
        decorator: decorator
      }
    },
        providerInjector = providerCache.$injector = createInternalInjector(providerCache, function (serviceName, caller) {
      if (angular.isString(caller)) {
        path.push(caller);
      }

      throw $injectorMinErr('unpr', 'Unknown provider: {0}', path.join(' <- '));
    }),
        instanceCache = {},
        protoInstanceInjector = createInternalInjector(instanceCache, function (serviceName, caller) {
      var provider = providerInjector.get(serviceName + providerSuffix, caller);
      return instanceInjector.invoke(provider.$get, provider, undefined, serviceName);
    }),
        instanceInjector = protoInstanceInjector;
    providerCache['$injector' + providerSuffix] = {
      $get: valueFn(protoInstanceInjector)
    };
    instanceInjector.modules = providerInjector.modules = createMap();
    var runBlocks = loadModules(modulesToLoad);
    instanceInjector = protoInstanceInjector.get('$injector');
    instanceInjector.strictDi = strictDi;
    forEach(runBlocks, function (fn) {
      if (fn) instanceInjector.invoke(fn);
    });

    instanceInjector.loadNewModules = function (mods) {
      forEach(loadModules(mods), function (fn) {
        if (fn) instanceInjector.invoke(fn);
      });
    };

    return instanceInjector;

    function supportObject(delegate) {
      return function (key, value) {
        if (isObject(key)) {
          forEach(key, reverseParams(delegate));
        } else {
          return delegate(key, value);
        }
      };
    }

    function provider(name, provider_) {
      assertNotHasOwnProperty(name, 'service');

      if (isFunction(provider_) || isArray(provider_)) {
        provider_ = providerInjector.instantiate(provider_);
      }

      if (!provider_.$get) {
        throw $injectorMinErr('pget', 'Provider \'{0}\' must define $get factory method.', name);
      }

      return providerCache[name + providerSuffix] = provider_;
    }

    function enforceReturnValue(name, factory) {
      return function enforcedReturnValue() {
        var result = instanceInjector.invoke(factory, this);

        if (isUndefined(result)) {
          throw $injectorMinErr('undef', 'Provider \'{0}\' must return a value from $get factory method.', name);
        }

        return result;
      };
    }

    function factory(name, factoryFn, enforce) {
      return provider(name, {
        $get: enforce !== false ? enforceReturnValue(name, factoryFn) : factoryFn
      });
    }

    function service(name, constructor) {
      return factory(name, ['$injector', function ($injector) {
        return $injector.instantiate(constructor);
      }]);
    }

    function value(name, val) {
      return factory(name, valueFn(val), false);
    }

    function constant(name, value) {
      assertNotHasOwnProperty(name, 'constant');
      providerCache[name] = value;
      instanceCache[name] = value;
    }

    function decorator(serviceName, decorFn) {
      var origProvider = providerInjector.get(serviceName + providerSuffix),
          orig$get = origProvider.$get;

      origProvider.$get = function () {
        var origInstance = instanceInjector.invoke(orig$get, origProvider);
        return instanceInjector.invoke(decorFn, null, {
          $delegate: origInstance
        });
      };
    }

    function loadModules(modulesToLoad) {
      assertArg(isUndefined(modulesToLoad) || isArray(modulesToLoad), 'modulesToLoad', 'not an array');
      var runBlocks = [],
          moduleFn;
      forEach(modulesToLoad, function (module) {
        if (loadedModules.get(module)) return;
        loadedModules.set(module, true);

        function runInvokeQueue(queue) {
          var i, ii;

          for (i = 0, ii = queue.length; i < ii; i++) {
            var invokeArgs = queue[i],
                provider = providerInjector.get(invokeArgs[0]);
            provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
          }
        }

        try {
          if (isString(module)) {
            moduleFn = angularModule(module);
            instanceInjector.modules[module] = moduleFn;
            runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
            runInvokeQueue(moduleFn._invokeQueue);
            runInvokeQueue(moduleFn._configBlocks);
          } else if (isFunction(module)) {
            runBlocks.push(providerInjector.invoke(module));
          } else if (isArray(module)) {
            runBlocks.push(providerInjector.invoke(module));
          } else {
            assertArgFn(module, 'module');
          }
        } catch (e) {
          if (isArray(module)) {
            module = module[module.length - 1];
          }

          if (e.message && e.stack && e.stack.indexOf(e.message) === -1) {
            e = e.message + '\n' + e.stack;
          }

          throw $injectorMinErr('modulerr', 'Failed to instantiate module {0} due to:\n{1}', module, e.stack || e.message || e);
        }
      });
      return runBlocks;
    }

    function createInternalInjector(cache, factory) {
      function getService(serviceName, caller) {
        if (cache.hasOwnProperty(serviceName)) {
          if (cache[serviceName] === INSTANTIATING) {
            throw $injectorMinErr('cdep', 'Circular dependency found: {0}', serviceName + ' <- ' + path.join(' <- '));
          }

          return cache[serviceName];
        } else {
          try {
            path.unshift(serviceName);
            cache[serviceName] = INSTANTIATING;
            cache[serviceName] = factory(serviceName, caller);
            return cache[serviceName];
          } catch (err) {
            if (cache[serviceName] === INSTANTIATING) {
              delete cache[serviceName];
            }

            throw err;
          } finally {
            path.shift();
          }
        }
      }

      function injectionArgs(fn, locals, serviceName) {
        var args = [],
            $inject = createInjector.$$annotate(fn, strictDi, serviceName);

        for (var i = 0, length = $inject.length; i < length; i++) {
          var key = $inject[i];

          if (typeof key !== 'string') {
            throw $injectorMinErr('itkn', 'Incorrect injection token! Expected service name as string, got {0}', key);
          }

          args.push(locals && locals.hasOwnProperty(key) ? locals[key] : getService(key, serviceName));
        }

        return args;
      }

      function isClass(func) {
        if (msie || typeof func !== 'function') {
          return false;
        }

        var result = func.$$ngIsClass;

        if (!isBoolean(result)) {
          result = func.$$ngIsClass = /^class\b/.test(stringifyFn(func));
        }

        return result;
      }

      function invoke(fn, self, locals, serviceName) {
        if (typeof locals === 'string') {
          serviceName = locals;
          locals = null;
        }

        var args = injectionArgs(fn, locals, serviceName);

        if (isArray(fn)) {
          fn = fn[fn.length - 1];
        }

        if (!isClass(fn)) {
          return fn.apply(self, args);
        } else {
          args.unshift(null);
          return new (Function.prototype.bind.apply(fn, args))();
        }
      }

      function instantiate(Type, locals, serviceName) {
        var ctor = isArray(Type) ? Type[Type.length - 1] : Type;
        var args = injectionArgs(Type, locals, serviceName);
        args.unshift(null);
        return new (Function.prototype.bind.apply(ctor, args))();
      }

      return {
        invoke: invoke,
        instantiate: instantiate,
        get: getService,
        annotate: createInjector.$$annotate,
        has: function (name) {
          return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
        }
      };
    }
  }

  createInjector.$$annotate = annotate;
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

  function getHash(url) {
    var index = url.indexOf('#');
    return index === -1 ? '' : url.substr(index);
  }

  function trimEmptyHash(url) {
    return url.replace(/#$/, '');
  }

  function Browser(window, document, $log, $sniffer, $$taskTrackerFactory) {
    var self = this,
        location = window.location,
        history = window.history,
        setTimeout = window.setTimeout,
        clearTimeout = window.clearTimeout,
        pendingDeferIds = {},
        taskTracker = $$taskTrackerFactory($log);
    self.isMock = false;
    self.$$completeOutstandingRequest = taskTracker.completeTask;
    self.$$incOutstandingRequestCount = taskTracker.incTaskCount;
    self.notifyWhenNoOutstandingRequests = taskTracker.notifyWhenNoPendingTasks;
    var cachedState,
        lastHistoryState,
        lastBrowserUrl = location.href,
        baseElement = document.find('base'),
        pendingLocation = null,
        getCurrentState = !$sniffer.history ? noop : function getCurrentState() {
      try {
        return history.state;
      } catch (e) {}
    };
    cacheState();

    self.url = function (url, replace, state) {
      if (isUndefined(state)) {
        state = null;
      }

      if (location !== window.location) location = window.location;
      if (history !== window.history) history = window.history;

      if (url) {
        var sameState = lastHistoryState === state;
        url = urlResolve(url).href;

        if (lastBrowserUrl === url && (!$sniffer.history || sameState)) {
          return self;
        }

        var sameBase = lastBrowserUrl && stripHash(lastBrowserUrl) === stripHash(url);
        lastBrowserUrl = url;
        lastHistoryState = state;

        if ($sniffer.history && (!sameBase || !sameState)) {
          history[replace ? 'replaceState' : 'pushState'](state, '', url);
          cacheState();
        } else {
          if (!sameBase) {
            pendingLocation = url;
          }

          if (replace) {
            location.replace(url);
          } else if (!sameBase) {
            location.href = url;
          } else {
            location.hash = getHash(url);
          }

          if (location.href !== url) {
            pendingLocation = url;
          }
        }

        if (pendingLocation) {
          pendingLocation = url;
        }

        return self;
      } else {
        return trimEmptyHash(pendingLocation || location.href);
      }
    };

    self.state = function () {
      return cachedState;
    };

    var urlChangeListeners = [],
        urlChangeInit = false;

    function cacheStateAndFireUrlChange() {
      pendingLocation = null;
      fireStateOrUrlChange();
    }

    var lastCachedState = null;

    function cacheState() {
      cachedState = getCurrentState();
      cachedState = isUndefined(cachedState) ? null : cachedState;

      if (equals(cachedState, lastCachedState)) {
        cachedState = lastCachedState;
      }

      lastCachedState = cachedState;
      lastHistoryState = cachedState;
    }

    function fireStateOrUrlChange() {
      var prevLastHistoryState = lastHistoryState;
      cacheState();

      if (lastBrowserUrl === self.url() && prevLastHistoryState === cachedState) {
        return;
      }

      lastBrowserUrl = self.url();
      lastHistoryState = cachedState;
      forEach(urlChangeListeners, function (listener) {
        listener(self.url(), cachedState);
      });
    }

    self.onUrlChange = function (callback) {
      if (!urlChangeInit) {
        if ($sniffer.history) jqLite(window).on('popstate', cacheStateAndFireUrlChange);
        jqLite(window).on('hashchange', cacheStateAndFireUrlChange);
        urlChangeInit = true;
      }

      urlChangeListeners.push(callback);
      return callback;
    };

    self.$$applicationDestroyed = function () {
      jqLite(window).off('hashchange popstate', cacheStateAndFireUrlChange);
    };

    self.$$checkUrlChange = fireStateOrUrlChange;

    self.baseHref = function () {
      var href = baseElement.attr('href');
      return href ? href.replace(/^(https?:)?\/\/[^/]*/, '') : '';
    };

    self.defer = function (fn, delay, taskType) {
      var timeoutId;
      delay = delay || 0;
      taskType = taskType || taskTracker.DEFAULT_TASK_TYPE;
      taskTracker.incTaskCount(taskType);
      timeoutId = setTimeout(function () {
        delete pendingDeferIds[timeoutId];
        taskTracker.completeTask(fn, taskType);
      }, delay);
      pendingDeferIds[timeoutId] = taskType;
      return timeoutId;
    };

    self.defer.cancel = function (deferId) {
      if (pendingDeferIds.hasOwnProperty(deferId)) {
        var taskType = pendingDeferIds[deferId];
        delete pendingDeferIds[deferId];
        clearTimeout(deferId);
        taskTracker.completeTask(noop, taskType);
        return true;
      }

      return false;
    };
  }

  function $BrowserProvider() {
    this.$get = ['$window', '$log', '$sniffer', '$document', '$$taskTrackerFactory', function ($window, $log, $sniffer, $document, $$taskTrackerFactory) {
      return new Browser($window, $document, $log, $sniffer, $$taskTrackerFactory);
    }];
  }

  var $compileMinErr = minErr('$compile');

  function UNINITIALIZED_VALUE() {}

  var _UNINITIALIZED_VALUE = new UNINITIALIZED_VALUE();

  $CompileProvider.$inject = ['$provide', '$$sanitizeUriProvider'];

  function $CompileProvider($provide, $$sanitizeUriProvider) {
    var hasDirectives = {},
        Suffix = 'Directive',
        COMMENT_DIRECTIVE_REGEXP = /^\s*directive:\s*([\w-]+)\s+(.*)$/,
        CLASS_DIRECTIVE_REGEXP = /(([\w-]+)(?::([^;]+))?;?)/,
        ALL_OR_NOTHING_ATTRS = makeMap('ngSrc,ngSrcset,src,srcset'),
        REQUIRE_PREFIX_REGEXP = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/;
    var EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/;
    var bindingCache = createMap();

    function parseIsolateBindings(scope, directiveName, isController) {
      var LOCAL_REGEXP = /^([@&]|[=<](\*?))(\??)\s*([\w$]*)$/;
      var bindings = createMap();
      forEach(scope, function (definition, scopeName) {
        definition = definition.trim();

        if (definition in bindingCache) {
          bindings[scopeName] = bindingCache[definition];
          return;
        }

        var match = definition.match(LOCAL_REGEXP);

        if (!match) {
          throw $compileMinErr('iscp', 'Invalid {3} for directive \'{0}\'.' + ' Definition: {... {1}: \'{2}\' ...}', directiveName, scopeName, definition, isController ? 'controller bindings definition' : 'isolate scope definition');
        }

        bindings[scopeName] = {
          mode: match[1][0],
          collection: match[2] === '*',
          optional: match[3] === '?',
          attrName: match[4] || scopeName
        };

        if (match[4]) {
          bindingCache[definition] = bindings[scopeName];
        }
      });
      return bindings;
    }

    function parseDirectiveBindings(directive, directiveName) {
      var bindings = {
        isolateScope: null,
        bindToController: null
      };

      if (isObject(directive.scope)) {
        if (directive.bindToController === true) {
          bindings.bindToController = parseIsolateBindings(directive.scope, directiveName, true);
          bindings.isolateScope = {};
        } else {
          bindings.isolateScope = parseIsolateBindings(directive.scope, directiveName, false);
        }
      }

      if (isObject(directive.bindToController)) {
        bindings.bindToController = parseIsolateBindings(directive.bindToController, directiveName, true);
      }

      if (bindings.bindToController && !directive.controller) {
        throw $compileMinErr('noctrl', 'Cannot bind to controller without directive \'{0}\'s controller.', directiveName);
      }

      return bindings;
    }

    function assertValidDirectiveName(name) {
      var letter = name.charAt(0);

      if (!letter || letter !== lowercase(letter)) {
        throw $compileMinErr('baddir', 'Directive/Component name \'{0}\' is invalid. The first character must be a lowercase letter', name);
      }

      if (name !== name.trim()) {
        throw $compileMinErr('baddir', 'Directive/Component name \'{0}\' is invalid. The name should not contain leading or trailing whitespaces', name);
      }
    }

    function getDirectiveRequire(directive) {
      var require = directive.require || directive.controller && directive.name;

      if (!isArray(require) && isObject(require)) {
        forEach(require, function (value, key) {
          var match = value.match(REQUIRE_PREFIX_REGEXP);
          var name = value.substring(match[0].length);
          if (!name) require[key] = match[0] + key;
        });
      }

      return require;
    }

    function getDirectiveRestrict(restrict, name) {
      if (restrict && !(isString(restrict) && /[EACM]/.test(restrict))) {
        throw $compileMinErr('badrestrict', 'Restrict property \'{0}\' of directive \'{1}\' is invalid', restrict, name);
      }

      return restrict || 'EA';
    }

    this.directive = function registerDirective(name, directiveFactory) {
      assertArg(name, 'name');
      assertNotHasOwnProperty(name, 'directive');

      if (isString(name)) {
        assertValidDirectiveName(name);
        assertArg(directiveFactory, 'directiveFactory');

        if (!hasDirectives.hasOwnProperty(name)) {
          hasDirectives[name] = [];
          $provide.factory(name + Suffix, ['$injector', '$exceptionHandler', function ($injector, $exceptionHandler) {
            var directives = [];
            forEach(hasDirectives[name], function (directiveFactory, index) {
              try {
                var directive = $injector.invoke(directiveFactory);

                if (isFunction(directive)) {
                  directive = {
                    compile: valueFn(directive)
                  };
                } else if (!directive.compile && directive.link) {
                  directive.compile = valueFn(directive.link);
                }

                directive.priority = directive.priority || 0;
                directive.index = index;
                directive.name = directive.name || name;
                directive.require = getDirectiveRequire(directive);
                directive.restrict = getDirectiveRestrict(directive.restrict, name);
                directive.$$moduleName = directiveFactory.$$moduleName;
                directives.push(directive);
              } catch (e) {
                $exceptionHandler(e);
              }
            });
            return directives;
          }]);
        }

        hasDirectives[name].push(directiveFactory);
      } else {
        forEach(name, reverseParams(registerDirective));
      }

      return this;
    };

    this.component = function registerComponent(name, options) {
      if (!isString(name)) {
        forEach(name, reverseParams(bind(this, registerComponent)));
        return this;
      }

      var controller = options.controller || function () {};

      function factory($injector) {
        function makeInjectable(fn) {
          if (isFunction(fn) || isArray(fn)) {
            return function (tElement, tAttrs) {
              return $injector.invoke(fn, this, {
                $element: tElement,
                $attrs: tAttrs
              });
            };
          } else {
            return fn;
          }
        }

        var template = !options.template && !options.templateUrl ? '' : options.template;
        var ddo = {
          controller: controller,
          controllerAs: identifierForController(options.controller) || options.controllerAs || '$ctrl',
          template: makeInjectable(template),
          templateUrl: makeInjectable(options.templateUrl),
          transclude: options.transclude,
          scope: {},
          bindToController: options.bindings || {},
          restrict: 'E',
          require: options.require
        };
        forEach(options, function (val, key) {
          if (key.charAt(0) === '$') ddo[key] = val;
        });
        return ddo;
      }

      forEach(options, function (val, key) {
        if (key.charAt(0) === '$') {
          factory[key] = val;
          if (isFunction(controller)) controller[key] = val;
        }
      });
      factory.$inject = ['$injector'];
      return this.directive(name, factory);
    };

    this.aHrefSanitizationTrustedUrlList = function (regexp) {
      if (isDefined(regexp)) {
        $$sanitizeUriProvider.aHrefSanitizationTrustedUrlList(regexp);
        return this;
      } else {
        return $$sanitizeUriProvider.aHrefSanitizationTrustedUrlList();
      }
    };

    Object.defineProperty(this, 'aHrefSanitizationWhitelist', {
      get: function () {
        return this.aHrefSanitizationTrustedUrlList;
      },
      set: function (value) {
        this.aHrefSanitizationTrustedUrlList = value;
      }
    });

    this.imgSrcSanitizationTrustedUrlList = function (regexp) {
      if (isDefined(regexp)) {
        $$sanitizeUriProvider.imgSrcSanitizationTrustedUrlList(regexp);
        return this;
      } else {
        return $$sanitizeUriProvider.imgSrcSanitizationTrustedUrlList();
      }
    };

    Object.defineProperty(this, 'imgSrcSanitizationWhitelist', {
      get: function () {
        return this.imgSrcSanitizationTrustedUrlList;
      },
      set: function (value) {
        this.imgSrcSanitizationTrustedUrlList = value;
      }
    });
    var debugInfoEnabled = true;

    this.debugInfoEnabled = function (enabled) {
      if (isDefined(enabled)) {
        debugInfoEnabled = enabled;
        return this;
      }

      return debugInfoEnabled;
    };

    var preAssignBindingsEnabled = false;

    this.preAssignBindingsEnabled = function (enabled) {
      if (isDefined(enabled)) {
        preAssignBindingsEnabled = enabled;
        return this;
      }

      return preAssignBindingsEnabled;
    };

    var strictComponentBindingsEnabled = false;

    this.strictComponentBindingsEnabled = function (enabled) {
      if (isDefined(enabled)) {
        strictComponentBindingsEnabled = enabled;
        return this;
      }

      return strictComponentBindingsEnabled;
    };

    var TTL = 10;

    this.onChangesTtl = function (value) {
      if (arguments.length) {
        TTL = value;
        return this;
      }

      return TTL;
    };

    var commentDirectivesEnabledConfig = true;

    this.commentDirectivesEnabled = function (value) {
      if (arguments.length) {
        commentDirectivesEnabledConfig = value;
        return this;
      }

      return commentDirectivesEnabledConfig;
    };

    var cssClassDirectivesEnabledConfig = true;

    this.cssClassDirectivesEnabled = function (value) {
      if (arguments.length) {
        cssClassDirectivesEnabledConfig = value;
        return this;
      }

      return cssClassDirectivesEnabledConfig;
    };

    var PROP_CONTEXTS = createMap();

    this.addPropertySecurityContext = function (elementName, propertyName, ctx) {
      var key = elementName.toLowerCase() + '|' + propertyName.toLowerCase();

      if (key in PROP_CONTEXTS && PROP_CONTEXTS[key] !== ctx) {
        throw $compileMinErr('ctxoverride', 'Property context \'{0}.{1}\' already set to \'{2}\', cannot override to \'{3}\'.', elementName, propertyName, PROP_CONTEXTS[key], ctx);
      }

      PROP_CONTEXTS[key] = ctx;
      return this;
    };

    (function registerNativePropertyContexts() {
      function registerContext(ctx, values) {
        forEach(values, function (v) {
          PROP_CONTEXTS[v.toLowerCase()] = ctx;
        });
      }

      registerContext(SCE_CONTEXTS.HTML, ['iframe|srcdoc', '*|innerHTML', '*|outerHTML']);
      registerContext(SCE_CONTEXTS.CSS, ['*|style']);
      registerContext(SCE_CONTEXTS.URL, ['area|href', 'area|ping', 'a|href', 'a|ping', 'blockquote|cite', 'body|background', 'del|cite', 'input|src', 'ins|cite', 'q|cite']);
      registerContext(SCE_CONTEXTS.MEDIA_URL, ['audio|src', 'img|src', 'img|srcset', 'source|src', 'source|srcset', 'track|src', 'video|src', 'video|poster']);
      registerContext(SCE_CONTEXTS.RESOURCE_URL, ['*|formAction', 'applet|code', 'applet|codebase', 'base|href', 'embed|src', 'frame|src', 'form|action', 'head|profile', 'html|manifest', 'iframe|src', 'link|href', 'media|src', 'object|codebase', 'object|data', 'script|src']);
    })();

    this.$get = ['$injector', '$interpolate', '$exceptionHandler', '$parse', '$controller', '$rootScope', '$sce', function ($injector, $interpolate, $exceptionHandler, $parse, $controller, $rootScope, $sce) {
      var SIMPLE_ATTR_NAME = /^\w/;
      var specialAttrHolder = window.document.createElement('div');
      var commentDirectivesEnabled = commentDirectivesEnabledConfig;
      var cssClassDirectivesEnabled = cssClassDirectivesEnabledConfig;
      var onChangesTtl = TTL;
      var onChangesQueue;

      function flushOnChangesQueue() {
        try {
          if (! --onChangesTtl) {
            onChangesQueue = undefined;
            throw $compileMinErr('infchng', '{0} $onChanges() iterations reached. Aborting!\n', TTL);
          }

          $rootScope.$apply(function () {
            for (var i = 0, ii = onChangesQueue.length; i < ii; ++i) {
              try {
                onChangesQueue[i]();
              } catch (e) {
                $exceptionHandler(e);
              }
            }

            onChangesQueue = undefined;
          });
        } finally {
          onChangesTtl++;
        }
      }

      function sanitizeSrcset(value, invokeType) {
        if (!value) {
          return value;
        }

        if (!isString(value)) {
          throw $compileMinErr('srcset', 'Can\'t pass trusted values to `{0}`: "{1}"', invokeType, value.toString());
        }

        var result = '';
        var trimmedSrcset = trim(value);
        var srcPattern = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/;
        var pattern = /\s/.test(trimmedSrcset) ? srcPattern : /(,)/;
        var rawUris = trimmedSrcset.split(pattern);
        var nbrUrisWith2parts = Math.floor(rawUris.length / 2);

        for (var i = 0; i < nbrUrisWith2parts; i++) {
          var innerIdx = i * 2;
          result += $sce.getTrustedMediaUrl(trim(rawUris[innerIdx]));
          result += ' ' + trim(rawUris[innerIdx + 1]);
        }

        var lastTuple = trim(rawUris[i * 2]).split(/\s/);
        result += $sce.getTrustedMediaUrl(trim(lastTuple[0]));

        if (lastTuple.length === 2) {
          result += ' ' + trim(lastTuple[1]);
        }

        return result;
      }

      function Attributes(element, attributesToCopy) {
        if (attributesToCopy) {
          var keys = Object.keys(attributesToCopy);
          var i, l, key;

          for (i = 0, l = keys.length; i < l; i++) {
            key = keys[i];
            this[key] = attributesToCopy[key];
          }
        } else {
          this.$attr = {};
        }

        this.$$element = element;
      }

      Attributes.prototype = {
        $normalize: directiveNormalize,
        $addClass: function (classVal) {
          if (classVal && classVal.length > 0) {
            this.$$element.addClass(classVal);
          }
        },
        $removeClass: function (classVal) {
          if (classVal && classVal.length > 0) {
            this.$$element.removeClass(classVal);
          }
        },
        $updateClass: function (newClasses, oldClasses) {
          var toAdd = tokenDifference(newClasses, oldClasses);

          if (toAdd && toAdd.length) {
            this.$$element.addClass(toAdd);
          }

          var toRemove = tokenDifference(oldClasses, newClasses);

          if (toRemove && toRemove.length) {
            this.$$element.removeClass(toRemove);
          }
        },
        $set: function (key, value, writeAttr, attrName) {
          var node = this.$$element[0],
              booleanKey = getBooleanAttrName(node, key),
              aliasedKey = getAliasedAttrName(key),
              observer = key,
              nodeName;

          if (booleanKey) {
            this.$$element.prop(key, value);
            attrName = booleanKey;
          } else if (aliasedKey) {
            this[aliasedKey] = value;
            observer = aliasedKey;
          }

          this[key] = value;

          if (attrName) {
            this.$attr[key] = attrName;
          } else {
            attrName = this.$attr[key];

            if (!attrName) {
              this.$attr[key] = attrName = snake_case(key, '-');
            }
          }

          nodeName = nodeName_(this.$$element);

          if (nodeName === 'img' && key === 'srcset') {
            this[key] = value = sanitizeSrcset(value, '$set(\'srcset\', value)');
          }

          if (writeAttr !== false) {
            if (value === null || isUndefined(value)) {
              this.$$element.removeAttr(attrName);
            } else {
              if (SIMPLE_ATTR_NAME.test(attrName)) {
                if (booleanKey && value === false) {
                  this.$$element.removeAttr(attrName);
                } else {
                  this.$$element.attr(attrName, value);
                }
              } else {
                setSpecialAttr(this.$$element[0], attrName, value);
              }
            }
          }

          var $$observers = this.$$observers;

          if ($$observers) {
            forEach($$observers[observer], function (fn) {
              try {
                fn(value);
              } catch (e) {
                $exceptionHandler(e);
              }
            });
          }
        },
        $observe: function (key, fn) {
          var attrs = this,
              $$observers = attrs.$$observers || (attrs.$$observers = createMap()),
              listeners = $$observers[key] || ($$observers[key] = []);
          listeners.push(fn);
          $rootScope.$evalAsync(function () {
            if (!listeners.$$inter && attrs.hasOwnProperty(key) && !isUndefined(attrs[key])) {
              fn(attrs[key]);
            }
          });
          return function () {
            arrayRemove(listeners, fn);
          };
        }
      };

      function setSpecialAttr(element, attrName, value) {
        specialAttrHolder.innerHTML = '<span ' + attrName + '>';
        var attributes = specialAttrHolder.firstChild.attributes;
        var attribute = attributes[0];
        attributes.removeNamedItem(attribute.name);
        attribute.value = value;
        element.attributes.setNamedItem(attribute);
      }

      function safeAddClass($element, className) {
        try {
          $element.addClass(className);
        } catch (e) {}
      }

      var startSymbol = $interpolate.startSymbol(),
          endSymbol = $interpolate.endSymbol(),
          denormalizeTemplate = startSymbol === '{{' && endSymbol === '}}' ? identity : function denormalizeTemplate(template) {
        return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
      },
          NG_PREFIX_BINDING = /^ng(Attr|Prop|On)([A-Z].*)$/;
      var MULTI_ELEMENT_DIR_RE = /^(.+)Start$/;
      compile.$$addBindingInfo = debugInfoEnabled ? function $$addBindingInfo($element, binding) {
        var bindings = $element.data('$binding') || [];

        if (isArray(binding)) {
          bindings = bindings.concat(binding);
        } else {
          bindings.push(binding);
        }

        $element.data('$binding', bindings);
      } : noop;
      compile.$$addBindingClass = debugInfoEnabled ? function $$addBindingClass($element) {
        safeAddClass($element, 'ng-binding');
      } : noop;
      compile.$$addScopeInfo = debugInfoEnabled ? function $$addScopeInfo($element, scope, isolated, noTemplate) {
        var dataName = isolated ? noTemplate ? '$isolateScopeNoTemplate' : '$isolateScope' : '$scope';
        $element.data(dataName, scope);
      } : noop;
      compile.$$addScopeClass = debugInfoEnabled ? function $$addScopeClass($element, isolated) {
        safeAddClass($element, isolated ? 'ng-isolate-scope' : 'ng-scope');
      } : noop;

      compile.$$createComment = function (directiveName, comment) {
        var content = '';

        if (debugInfoEnabled) {
          content = ' ' + (directiveName || '') + ': ';
          if (comment) content += comment + ' ';
        }

        return window.document.createComment(content);
      };

      return compile;

      function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
        if (!($compileNodes instanceof jqLite)) {
          $compileNodes = jqLite($compileNodes);
        }

        var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext);
        compile.$$addScopeClass($compileNodes);
        var namespace = null;
        return function publicLinkFn(scope, cloneConnectFn, options) {
          if (!$compileNodes) {
            throw $compileMinErr('multilink', 'This element has already been linked.');
          }

          assertArg(scope, 'scope');

          if (previousCompileContext && previousCompileContext.needsNewScope) {
            scope = scope.$parent.$new();
          }

          options = options || {};
          var parentBoundTranscludeFn = options.parentBoundTranscludeFn,
              transcludeControllers = options.transcludeControllers,
              futureParentElement = options.futureParentElement;

          if (parentBoundTranscludeFn && parentBoundTranscludeFn.$$boundTransclude) {
            parentBoundTranscludeFn = parentBoundTranscludeFn.$$boundTransclude;
          }

          if (!namespace) {
            namespace = detectNamespaceForChildElements(futureParentElement);
          }

          var $linkNode;

          if (namespace !== 'html') {
            $linkNode = jqLite(wrapTemplate(namespace, jqLite('<div></div>').append($compileNodes).html()));
          } else if (cloneConnectFn) {
            $linkNode = JQLitePrototype.clone.call($compileNodes);
          } else {
            $linkNode = $compileNodes;
          }

          if (transcludeControllers) {
            for (var controllerName in transcludeControllers) {
              $linkNode.data('$' + controllerName + 'Controller', transcludeControllers[controllerName].instance);
            }
          }

          compile.$$addScopeInfo($linkNode, scope);
          if (cloneConnectFn) cloneConnectFn($linkNode, scope);
          if (compositeLinkFn) compositeLinkFn(scope, $linkNode, $linkNode, parentBoundTranscludeFn);

          if (!cloneConnectFn) {
            $compileNodes = compositeLinkFn = null;
          }

          return $linkNode;
        };
      }

      function detectNamespaceForChildElements(parentElement) {
        var node = parentElement && parentElement[0];

        if (!node) {
          return 'html';
        } else {
          return nodeName_(node) !== 'foreignobject' && toString.call(node).match(/SVG/) ? 'svg' : 'html';
        }
      }

      function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext) {
        var linkFns = [],
            notLiveList = isArray(nodeList) || nodeList instanceof jqLite,
            attrs,
            directives,
            nodeLinkFn,
            childNodes,
            childLinkFn,
            linkFnFound,
            nodeLinkFnFound;

        for (var i = 0; i < nodeList.length; i++) {
          attrs = new Attributes();

          if (msie === 11) {
            mergeConsecutiveTextNodes(nodeList, i, notLiveList);
          }

          directives = collectDirectives(nodeList[i], [], attrs, i === 0 ? maxPriority : undefined, ignoreDirective);
          nodeLinkFn = directives.length ? applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext) : null;

          if (nodeLinkFn && nodeLinkFn.scope) {
            compile.$$addScopeClass(attrs.$$element);
          }

          childLinkFn = nodeLinkFn && nodeLinkFn.terminal || !(childNodes = nodeList[i].childNodes) || !childNodes.length ? null : compileNodes(childNodes, nodeLinkFn ? (nodeLinkFn.transcludeOnThisElement || !nodeLinkFn.templateOnThisElement) && nodeLinkFn.transclude : transcludeFn);

          if (nodeLinkFn || childLinkFn) {
            linkFns.push(i, nodeLinkFn, childLinkFn);
            linkFnFound = true;
            nodeLinkFnFound = nodeLinkFnFound || nodeLinkFn;
          }

          previousCompileContext = null;
        }

        return linkFnFound ? compositeLinkFn : null;

        function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn) {
          var nodeLinkFn, childLinkFn, node, childScope, i, ii, idx, childBoundTranscludeFn;
          var stableNodeList;

          if (nodeLinkFnFound) {
            var nodeListLength = nodeList.length;
            stableNodeList = new Array(nodeListLength);

            for (i = 0; i < linkFns.length; i += 3) {
              idx = linkFns[i];
              stableNodeList[idx] = nodeList[idx];
            }
          } else {
            stableNodeList = nodeList;
          }

          for (i = 0, ii = linkFns.length; i < ii;) {
            node = stableNodeList[linkFns[i++]];
            nodeLinkFn = linkFns[i++];
            childLinkFn = linkFns[i++];

            if (nodeLinkFn) {
              if (nodeLinkFn.scope) {
                childScope = scope.$new();
                compile.$$addScopeInfo(jqLite(node), childScope);
              } else {
                childScope = scope;
              }

              if (nodeLinkFn.transcludeOnThisElement) {
                childBoundTranscludeFn = createBoundTranscludeFn(scope, nodeLinkFn.transclude, parentBoundTranscludeFn);
              } else if (!nodeLinkFn.templateOnThisElement && parentBoundTranscludeFn) {
                childBoundTranscludeFn = parentBoundTranscludeFn;
              } else if (!parentBoundTranscludeFn && transcludeFn) {
                childBoundTranscludeFn = createBoundTranscludeFn(scope, transcludeFn);
              } else {
                childBoundTranscludeFn = null;
              }

              nodeLinkFn(childLinkFn, childScope, node, $rootElement, childBoundTranscludeFn);
            } else if (childLinkFn) {
              childLinkFn(scope, node.childNodes, undefined, parentBoundTranscludeFn);
            }
          }
        }
      }

      function mergeConsecutiveTextNodes(nodeList, idx, notLiveList) {
        var node = nodeList[idx];
        var parent = node.parentNode;
        var sibling;

        if (node.nodeType !== NODE_TYPE_TEXT) {
          return;
        }

        while (true) {
          sibling = parent ? node.nextSibling : nodeList[idx + 1];

          if (!sibling || sibling.nodeType !== NODE_TYPE_TEXT) {
            break;
          }

          node.nodeValue = node.nodeValue + sibling.nodeValue;

          if (sibling.parentNode) {
            sibling.parentNode.removeChild(sibling);
          }

          if (notLiveList && sibling === nodeList[idx + 1]) {
            nodeList.splice(idx + 1, 1);
          }
        }
      }

      function createBoundTranscludeFn(scope, transcludeFn, previousBoundTranscludeFn) {
        function boundTranscludeFn(transcludedScope, cloneFn, controllers, futureParentElement, containingScope) {
          if (!transcludedScope) {
            transcludedScope = scope.$new(false, containingScope);
            transcludedScope.$$transcluded = true;
          }

          return transcludeFn(transcludedScope, cloneFn, {
            parentBoundTranscludeFn: previousBoundTranscludeFn,
            transcludeControllers: controllers,
            futureParentElement: futureParentElement
          });
        }

        var boundSlots = boundTranscludeFn.$$slots = createMap();

        for (var slotName in transcludeFn.$$slots) {
          if (transcludeFn.$$slots[slotName]) {
            boundSlots[slotName] = createBoundTranscludeFn(scope, transcludeFn.$$slots[slotName], previousBoundTranscludeFn);
          } else {
            boundSlots[slotName] = null;
          }
        }

        return boundTranscludeFn;
      }

      function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
        var nodeType = node.nodeType,
            attrsMap = attrs.$attr,
            match,
            nodeName,
            className;

        switch (nodeType) {
          case NODE_TYPE_ELEMENT:
            nodeName = nodeName_(node);
            addDirective(directives, directiveNormalize(nodeName), 'E', maxPriority, ignoreDirective);

            for (var attr, name, nName, value, ngPrefixMatch, nAttrs = node.attributes, j = 0, jj = nAttrs && nAttrs.length; j < jj; j++) {
              var attrStartName = false;
              var attrEndName = false;
              var isNgAttr = false,
                  isNgProp = false,
                  isNgEvent = false;
              var multiElementMatch;
              attr = nAttrs[j];
              name = attr.name;
              value = attr.value;
              nName = directiveNormalize(name.toLowerCase());

              if (ngPrefixMatch = nName.match(NG_PREFIX_BINDING)) {
                isNgAttr = ngPrefixMatch[1] === 'Attr';
                isNgProp = ngPrefixMatch[1] === 'Prop';
                isNgEvent = ngPrefixMatch[1] === 'On';
                name = name.replace(PREFIX_REGEXP, '').toLowerCase().substr(4 + ngPrefixMatch[1].length).replace(/_(.)/g, function (match, letter) {
                  return letter.toUpperCase();
                });
              } else if ((multiElementMatch = nName.match(MULTI_ELEMENT_DIR_RE)) && directiveIsMultiElement(multiElementMatch[1])) {
                attrStartName = name;
                attrEndName = name.substr(0, name.length - 5) + 'end';
                name = name.substr(0, name.length - 6);
              }

              if (isNgProp || isNgEvent) {
                attrs[nName] = value;
                attrsMap[nName] = attr.name;

                if (isNgProp) {
                  addPropertyDirective(node, directives, nName, name);
                } else {
                  addEventDirective(directives, nName, name);
                }
              } else {
                nName = directiveNormalize(name.toLowerCase());
                attrsMap[nName] = name;

                if (isNgAttr || !attrs.hasOwnProperty(nName)) {
                  attrs[nName] = value;

                  if (getBooleanAttrName(node, nName)) {
                    attrs[nName] = true;
                  }
                }

                addAttrInterpolateDirective(node, directives, value, nName, isNgAttr);
                addDirective(directives, nName, 'A', maxPriority, ignoreDirective, attrStartName, attrEndName);
              }
            }

            if (nodeName === 'input' && node.getAttribute('type') === 'hidden') {
              node.setAttribute('autocomplete', 'off');
            }

            if (!cssClassDirectivesEnabled) break;
            className = node.className;

            if (isObject(className)) {
              className = className.animVal;
            }

            if (isString(className) && className !== '') {
              while (match = CLASS_DIRECTIVE_REGEXP.exec(className)) {
                nName = directiveNormalize(match[2]);

                if (addDirective(directives, nName, 'C', maxPriority, ignoreDirective)) {
                  attrs[nName] = trim(match[3]);
                }

                className = className.substr(match.index + match[0].length);
              }
            }

            break;

          case NODE_TYPE_TEXT:
            addTextInterpolateDirective(directives, node.nodeValue);
            break;

          case NODE_TYPE_COMMENT:
            if (!commentDirectivesEnabled) break;
            collectCommentDirectives(node, directives, attrs, maxPriority, ignoreDirective);
            break;
        }

        directives.sort(byPriority);
        return directives;
      }

      function collectCommentDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
        try {
          var match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);

          if (match) {
            var nName = directiveNormalize(match[1]);

            if (addDirective(directives, nName, 'M', maxPriority, ignoreDirective)) {
              attrs[nName] = trim(match[2]);
            }
          }
        } catch (e) {}
      }

      function groupScan(node, attrStart, attrEnd) {
        var nodes = [];
        var depth = 0;

        if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
          do {
            if (!node) {
              throw $compileMinErr('uterdir', 'Unterminated attribute, found \'{0}\' but no matching \'{1}\' found.', attrStart, attrEnd);
            }

            if (node.nodeType === NODE_TYPE_ELEMENT) {
              if (node.hasAttribute(attrStart)) depth++;
              if (node.hasAttribute(attrEnd)) depth--;
            }

            nodes.push(node);
            node = node.nextSibling;
          } while (depth > 0);
        } else {
          nodes.push(node);
        }

        return jqLite(nodes);
      }

      function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
        return function groupedElementsLink(scope, element, attrs, controllers, transcludeFn) {
          element = groupScan(element[0], attrStart, attrEnd);
          return linkFn(scope, element, attrs, controllers, transcludeFn);
        };
      }

      function compilationGenerator(eager, $compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
        var compiled;

        if (eager) {
          return compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext);
        }

        return function lazyCompilation() {
          if (!compiled) {
            compiled = compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext);
            $compileNodes = transcludeFn = previousCompileContext = null;
          }

          return compiled.apply(this, arguments);
        };
      }

      function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext) {
        previousCompileContext = previousCompileContext || {};
        var terminalPriority = -Number.MAX_VALUE,
            newScopeDirective = previousCompileContext.newScopeDirective,
            controllerDirectives = previousCompileContext.controllerDirectives,
            newIsolateScopeDirective = previousCompileContext.newIsolateScopeDirective,
            templateDirective = previousCompileContext.templateDirective,
            nonTlbTranscludeDirective = previousCompileContext.nonTlbTranscludeDirective,
            hasTranscludeDirective = false,
            hasTemplate = false,
            hasElementTranscludeDirective = previousCompileContext.hasElementTranscludeDirective,
            $compileNode = templateAttrs.$$element = jqLite(compileNode),
            directive,
            directiveName,
            $template,
            replaceDirective = originalReplaceDirective,
            childTranscludeFn = transcludeFn,
            linkFn,
            didScanForMultipleTransclusion = false,
            mightHaveMultipleTransclusionError = false,
            directiveValue;

        for (var i = 0, ii = directives.length; i < ii; i++) {
          directive = directives[i];
          var attrStart = directive.$$start;
          var attrEnd = directive.$$end;

          if (attrStart) {
            $compileNode = groupScan(compileNode, attrStart, attrEnd);
          }

          $template = undefined;

          if (terminalPriority > directive.priority) {
            break;
          }

          directiveValue = directive.scope;

          if (directiveValue) {
            if (!directive.templateUrl) {
              if (isObject(directiveValue)) {
                assertNoDuplicate('new/isolated scope', newIsolateScopeDirective || newScopeDirective, directive, $compileNode);
                newIsolateScopeDirective = directive;
              } else {
                assertNoDuplicate('new/isolated scope', newIsolateScopeDirective, directive, $compileNode);
              }
            }

            newScopeDirective = newScopeDirective || directive;
          }

          directiveName = directive.name;

          if (!didScanForMultipleTransclusion && (directive.replace && (directive.templateUrl || directive.template) || directive.transclude && !directive.$$tlb)) {
            var candidateDirective;

            for (var scanningIndex = i + 1; candidateDirective = directives[scanningIndex++];) {
              if (candidateDirective.transclude && !candidateDirective.$$tlb || candidateDirective.replace && (candidateDirective.templateUrl || candidateDirective.template)) {
                mightHaveMultipleTransclusionError = true;
                break;
              }
            }

            didScanForMultipleTransclusion = true;
          }

          if (!directive.templateUrl && directive.controller) {
            controllerDirectives = controllerDirectives || createMap();
            assertNoDuplicate('\'' + directiveName + '\' controller', controllerDirectives[directiveName], directive, $compileNode);
            controllerDirectives[directiveName] = directive;
          }

          directiveValue = directive.transclude;

          if (directiveValue) {
            hasTranscludeDirective = true;

            if (!directive.$$tlb) {
              assertNoDuplicate('transclusion', nonTlbTranscludeDirective, directive, $compileNode);
              nonTlbTranscludeDirective = directive;
            }

            if (directiveValue === 'element') {
              hasElementTranscludeDirective = true;
              terminalPriority = directive.priority;
              $template = $compileNode;
              $compileNode = templateAttrs.$$element = jqLite(compile.$$createComment(directiveName, templateAttrs[directiveName]));
              compileNode = $compileNode[0];
              replaceWith(jqCollection, sliceArgs($template), compileNode);
              childTranscludeFn = compilationGenerator(mightHaveMultipleTransclusionError, $template, transcludeFn, terminalPriority, replaceDirective && replaceDirective.name, {
                nonTlbTranscludeDirective: nonTlbTranscludeDirective
              });
            } else {
              var slots = createMap();

              if (!isObject(directiveValue)) {
                $template = jqLite(jqLiteClone(compileNode)).contents();
              } else {
                $template = window.document.createDocumentFragment();
                var slotMap = createMap();
                var filledSlots = createMap();
                forEach(directiveValue, function (elementSelector, slotName) {
                  var optional = elementSelector.charAt(0) === '?';
                  elementSelector = optional ? elementSelector.substring(1) : elementSelector;
                  slotMap[elementSelector] = slotName;
                  slots[slotName] = null;
                  filledSlots[slotName] = optional;
                });
                forEach($compileNode.contents(), function (node) {
                  var slotName = slotMap[directiveNormalize(nodeName_(node))];

                  if (slotName) {
                    filledSlots[slotName] = true;
                    slots[slotName] = slots[slotName] || window.document.createDocumentFragment();
                    slots[slotName].appendChild(node);
                  } else {
                    $template.appendChild(node);
                  }
                });
                forEach(filledSlots, function (filled, slotName) {
                  if (!filled) {
                    throw $compileMinErr('reqslot', 'Required transclusion slot `{0}` was not filled.', slotName);
                  }
                });

                for (var slotName in slots) {
                  if (slots[slotName]) {
                    var slotCompileNodes = jqLite(slots[slotName].childNodes);
                    slots[slotName] = compilationGenerator(mightHaveMultipleTransclusionError, slotCompileNodes, transcludeFn);
                  }
                }

                $template = jqLite($template.childNodes);
              }

              $compileNode.empty();
              childTranscludeFn = compilationGenerator(mightHaveMultipleTransclusionError, $template, transcludeFn, undefined, undefined, {
                needsNewScope: directive.$$isolateScope || directive.$$newScope
              });
              childTranscludeFn.$$slots = slots;
            }
          }

          if (directive.template) {
            hasTemplate = true;
            assertNoDuplicate('template', templateDirective, directive, $compileNode);
            templateDirective = directive;
            directiveValue = isFunction(directive.template) ? directive.template($compileNode, templateAttrs) : directive.template;
            directiveValue = denormalizeTemplate(directiveValue);

            if (directive.replace) {
              replaceDirective = directive;

              if (jqLiteIsTextNode(directiveValue)) {
                $template = [];
              } else {
                $template = removeComments(wrapTemplate(directive.templateNamespace, trim(directiveValue)));
              }

              compileNode = $template[0];

              if ($template.length !== 1 || compileNode.nodeType !== NODE_TYPE_ELEMENT) {
                throw $compileMinErr('tplrt', 'Template for directive \'{0}\' must have exactly one root element. {1}', directiveName, '');
              }

              replaceWith(jqCollection, $compileNode, compileNode);
              var newTemplateAttrs = {
                $attr: {}
              };
              var templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs);
              var unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));

              if (newIsolateScopeDirective || newScopeDirective) {
                markDirectiveScope(templateDirectives, newIsolateScopeDirective, newScopeDirective);
              }

              directives = directives.concat(templateDirectives).concat(unprocessedDirectives);
              mergeTemplateAttributes(templateAttrs, newTemplateAttrs);
              ii = directives.length;
            } else {
              $compileNode.html(directiveValue);
            }
          }

          if (directive.templateUrl) {
            throw new Error('$templateRequest is removed! (https://github.com/Crowd9/angular.js)');
          } else if (directive.compile) {
            try {
              linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn);
              var context = directive.$$originalDirective || directive;

              if (isFunction(linkFn)) {
                addLinkFns(null, bind(context, linkFn), attrStart, attrEnd);
              } else if (linkFn) {
                addLinkFns(bind(context, linkFn.pre), bind(context, linkFn.post), attrStart, attrEnd);
              }
            } catch (e) {
              $exceptionHandler(e, startingTag($compileNode));
            }
          }

          if (directive.terminal) {
            nodeLinkFn.terminal = true;
            terminalPriority = Math.max(terminalPriority, directive.priority);
          }
        }

        nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === true;
        nodeLinkFn.transcludeOnThisElement = hasTranscludeDirective;
        nodeLinkFn.templateOnThisElement = hasTemplate;
        nodeLinkFn.transclude = childTranscludeFn;
        previousCompileContext.hasElementTranscludeDirective = hasElementTranscludeDirective;
        return nodeLinkFn;

        function addLinkFns(pre, post, attrStart, attrEnd) {
          if (pre) {
            if (attrStart) pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd);
            pre.require = directive.require;
            pre.directiveName = directiveName;

            if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
              pre = cloneAndAnnotateFn(pre, {
                isolateScope: true
              });
            }

            preLinkFns.push(pre);
          }

          if (post) {
            if (attrStart) post = groupElementsLinkFnWrapper(post, attrStart, attrEnd);
            post.require = directive.require;
            post.directiveName = directiveName;

            if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
              post = cloneAndAnnotateFn(post, {
                isolateScope: true
              });
            }

            postLinkFns.push(post);
          }
        }

        function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
          var i, ii, linkFn, isolateScope, controllerScope, elementControllers, transcludeFn, $element, attrs, scopeBindingInfo;

          if (compileNode === linkNode) {
            attrs = templateAttrs;
            $element = templateAttrs.$$element;
          } else {
            $element = jqLite(linkNode);
            attrs = new Attributes($element, templateAttrs);
          }

          controllerScope = scope;

          if (newIsolateScopeDirective) {
            isolateScope = scope.$new(true);
          } else if (newScopeDirective) {
            controllerScope = scope.$parent;
          }

          if (boundTranscludeFn) {
            transcludeFn = controllersBoundTransclude;
            transcludeFn.$$boundTransclude = boundTranscludeFn;

            transcludeFn.isSlotFilled = function (slotName) {
              return !!boundTranscludeFn.$$slots[slotName];
            };
          }

          if (controllerDirectives) {
            elementControllers = setupControllers($element, attrs, transcludeFn, controllerDirectives, isolateScope, scope, newIsolateScopeDirective);
          }

          if (newIsolateScopeDirective) {
            compile.$$addScopeInfo($element, isolateScope, true, !(templateDirective && (templateDirective === newIsolateScopeDirective || templateDirective === newIsolateScopeDirective.$$originalDirective)));
            compile.$$addScopeClass($element, true);
            isolateScope.$$isolateBindings = newIsolateScopeDirective.$$isolateBindings;
            scopeBindingInfo = initializeDirectiveBindings(scope, attrs, isolateScope, isolateScope.$$isolateBindings, newIsolateScopeDirective);

            if (scopeBindingInfo.removeWatches) {
              isolateScope.$on('$destroy', scopeBindingInfo.removeWatches);
            }
          }

          for (var name in elementControllers) {
            var controllerDirective = controllerDirectives[name];
            var controller = elementControllers[name];
            var bindings = controllerDirective.$$bindings.bindToController;

            if (preAssignBindingsEnabled) {
              if (bindings) {
                controller.bindingInfo = initializeDirectiveBindings(controllerScope, attrs, controller.instance, bindings, controllerDirective);
              } else {
                controller.bindingInfo = {};
              }

              var controllerResult = controller();

              if (controllerResult !== controller.instance) {
                controller.instance = controllerResult;
                $element.data('$' + controllerDirective.name + 'Controller', controllerResult);

                if (controller.bindingInfo.removeWatches) {
                  controller.bindingInfo.removeWatches();
                }

                controller.bindingInfo = initializeDirectiveBindings(controllerScope, attrs, controller.instance, bindings, controllerDirective);
              }
            } else {
              controller.instance = controller();
              $element.data('$' + controllerDirective.name + 'Controller', controller.instance);
              controller.bindingInfo = initializeDirectiveBindings(controllerScope, attrs, controller.instance, bindings, controllerDirective);
            }
          }

          forEach(controllerDirectives, function (controllerDirective, name) {
            var require = controllerDirective.require;

            if (controllerDirective.bindToController && !isArray(require) && isObject(require)) {
              extend(elementControllers[name].instance, getControllers(name, require, $element, elementControllers));
            }
          });
          forEach(elementControllers, function (controller) {
            var controllerInstance = controller.instance;

            if (isFunction(controllerInstance.$onChanges)) {
              try {
                controllerInstance.$onChanges(controller.bindingInfo.initialChanges);
              } catch (e) {
                $exceptionHandler(e);
              }
            }

            if (isFunction(controllerInstance.$onInit)) {
              try {
                controllerInstance.$onInit();
              } catch (e) {
                $exceptionHandler(e);
              }
            }

            if (isFunction(controllerInstance.$doCheck)) {
              controllerScope.$watch(function () {
                controllerInstance.$doCheck();
              });
              controllerInstance.$doCheck();
            }

            if (isFunction(controllerInstance.$onDestroy)) {
              controllerScope.$on('$destroy', function callOnDestroyHook() {
                controllerInstance.$onDestroy();
              });
            }
          });

          for (i = 0, ii = preLinkFns.length; i < ii; i++) {
            linkFn = preLinkFns[i];
            invokeLinkFn(linkFn, linkFn.isolateScope ? isolateScope : scope, $element, attrs, linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers), transcludeFn);
          }

          var scopeToChild = scope;

          if (newIsolateScopeDirective && (newIsolateScopeDirective.template || newIsolateScopeDirective.templateUrl === null)) {
            scopeToChild = isolateScope;
          }

          if (childLinkFn) {
            childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn);
          }

          for (i = postLinkFns.length - 1; i >= 0; i--) {
            linkFn = postLinkFns[i];
            invokeLinkFn(linkFn, linkFn.isolateScope ? isolateScope : scope, $element, attrs, linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers), transcludeFn);
          }

          forEach(elementControllers, function (controller) {
            var controllerInstance = controller.instance;

            if (isFunction(controllerInstance.$postLink)) {
              controllerInstance.$postLink();
            }
          });

          function controllersBoundTransclude(scope, cloneAttachFn, futureParentElement, slotName) {
            var transcludeControllers;

            if (!isScope(scope)) {
              slotName = futureParentElement;
              futureParentElement = cloneAttachFn;
              cloneAttachFn = scope;
              scope = undefined;
            }

            if (hasElementTranscludeDirective) {
              transcludeControllers = elementControllers;
            }

            if (!futureParentElement) {
              futureParentElement = hasElementTranscludeDirective ? $element.parent() : $element;
            }

            if (slotName) {
              var slotTranscludeFn = boundTranscludeFn.$$slots[slotName];

              if (slotTranscludeFn) {
                return slotTranscludeFn(scope, cloneAttachFn, transcludeControllers, futureParentElement, scopeToChild);
              } else if (isUndefined(slotTranscludeFn)) {
                throw $compileMinErr('noslot', 'No parent directive that requires a transclusion with slot name "{0}". ' + 'Element: {1}', slotName, startingTag($element));
              }
            } else {
              return boundTranscludeFn(scope, cloneAttachFn, transcludeControllers, futureParentElement, scopeToChild);
            }
          }
        }
      }

      function getControllers(directiveName, require, $element, elementControllers) {
        var value;

        if (isString(require)) {
          var match = require.match(REQUIRE_PREFIX_REGEXP);

          var name = require.substring(match[0].length);

          var inheritType = match[1] || match[3];
          var optional = match[2] === '?';

          if (inheritType === '^^') {
            $element = $element.parent();
          } else {
            value = elementControllers && elementControllers[name];
            value = value && value.instance;
          }

          if (!value) {
            var dataName = '$' + name + 'Controller';

            if (inheritType === '^^' && $element[0] && $element[0].nodeType === NODE_TYPE_DOCUMENT) {
              value = null;
            } else {
              value = inheritType ? $element.inheritedData(dataName) : $element.data(dataName);
            }
          }

          if (!value && !optional) {
            throw $compileMinErr('ctreq', 'Controller \'{0}\', required by directive \'{1}\', can\'t be found!', name, directiveName);
          }
        } else if (isArray(require)) {
          value = [];

          for (var i = 0, ii = require.length; i < ii; i++) {
            value[i] = getControllers(directiveName, require[i], $element, elementControllers);
          }
        } else if (isObject(require)) {
          value = {};
          forEach(require, function (controller, property) {
            value[property] = getControllers(directiveName, controller, $element, elementControllers);
          });
        }

        return value || null;
      }

      function setupControllers($element, attrs, transcludeFn, controllerDirectives, isolateScope, scope, newIsolateScopeDirective) {
        var elementControllers = createMap();

        for (var controllerKey in controllerDirectives) {
          var directive = controllerDirectives[controllerKey];
          var locals = {
            $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
            $element: $element,
            $attrs: attrs,
            $transclude: transcludeFn
          };
          var controller = directive.controller;

          if (controller === '@') {
            controller = attrs[directive.name];
          }

          var controllerInstance = $controller(controller, locals, true, directive.controllerAs);
          elementControllers[directive.name] = controllerInstance;
          $element.data('$' + directive.name + 'Controller', controllerInstance.instance);
        }

        return elementControllers;
      }

      function markDirectiveScope(directives, isolateScope, newScope) {
        for (var j = 0, jj = directives.length; j < jj; j++) {
          directives[j] = inherit(directives[j], {
            $$isolateScope: isolateScope,
            $$newScope: newScope
          });
        }
      }

      function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {
        if (name === ignoreDirective) return null;
        var match = null;

        if (hasDirectives.hasOwnProperty(name)) {
          for (var directive, directives = $injector.get(name + Suffix), i = 0, ii = directives.length; i < ii; i++) {
            directive = directives[i];

            if ((isUndefined(maxPriority) || maxPriority > directive.priority) && directive.restrict.indexOf(location) !== -1) {
              if (startAttrName) {
                directive = inherit(directive, {
                  $$start: startAttrName,
                  $$end: endAttrName
                });
              }

              if (!directive.$$bindings) {
                var bindings = directive.$$bindings = parseDirectiveBindings(directive, directive.name);

                if (isObject(bindings.isolateScope)) {
                  directive.$$isolateBindings = bindings.isolateScope;
                }
              }

              tDirectives.push(directive);
              match = directive;
            }
          }
        }

        return match;
      }

      function directiveIsMultiElement(name) {
        if (hasDirectives.hasOwnProperty(name)) {
          for (var directive, directives = $injector.get(name + Suffix), i = 0, ii = directives.length; i < ii; i++) {
            directive = directives[i];

            if (directive.multiElement) {
              return true;
            }
          }
        }

        return false;
      }

      function mergeTemplateAttributes(dst, src) {
        var srcAttr = src.$attr,
            dstAttr = dst.$attr;
        forEach(dst, function (value, key) {
          if (key.charAt(0) !== '$') {
            if (src[key] && src[key] !== value) {
              if (value.length) {
                value += (key === 'style' ? ';' : ' ') + src[key];
              } else {
                value = src[key];
              }
            }

            dst.$set(key, value, true, srcAttr[key]);
          }
        });
        forEach(src, function (value, key) {
          if (!dst.hasOwnProperty(key) && key.charAt(0) !== '$') {
            dst[key] = value;

            if (key !== 'class' && key !== 'style') {
              dstAttr[key] = srcAttr[key];
            }
          }
        });
      }

      function byPriority(a, b) {
        var diff = b.priority - a.priority;
        if (diff !== 0) return diff;
        if (a.name !== b.name) return a.name < b.name ? -1 : 1;
        return a.index - b.index;
      }

      function assertNoDuplicate(what, previousDirective, directive, element) {
        function wrapModuleNameIfDefined(moduleName) {
          return moduleName ? ' (module: ' + moduleName + ')' : '';
        }

        if (previousDirective) {
          throw $compileMinErr('multidir', 'Multiple directives [{0}{1}, {2}{3}] asking for {4} on: {5}', previousDirective.name, wrapModuleNameIfDefined(previousDirective.$$moduleName), directive.name, wrapModuleNameIfDefined(directive.$$moduleName), what, startingTag(element));
        }
      }

      function addTextInterpolateDirective(directives, text) {
        var interpolateFn = $interpolate(text, true);

        if (interpolateFn) {
          directives.push({
            priority: 0,
            compile: function textInterpolateCompileFn(templateNode) {
              var templateNodeParent = templateNode.parent(),
                  hasCompileParent = !!templateNodeParent.length;
              if (hasCompileParent) compile.$$addBindingClass(templateNodeParent);
              return function textInterpolateLinkFn(scope, node) {
                var parent = node.parent();
                if (!hasCompileParent) compile.$$addBindingClass(parent);
                compile.$$addBindingInfo(parent, interpolateFn.expressions);
                scope.$watch(interpolateFn, function interpolateFnWatchAction(value) {
                  node[0].nodeValue = value;
                });
              };
            }
          });
        }
      }

      function wrapTemplate(type, template) {
        type = lowercase(type || 'html');

        switch (type) {
          case 'svg':
          case 'math':
            var wrapper = window.document.createElement('div');
            wrapper.innerHTML = '<' + type + '>' + template + '</' + type + '>';
            return wrapper.childNodes[0].childNodes;

          default:
            return template;
        }
      }

      function getTrustedAttrContext(nodeName, attrNormalizedName) {
        if (attrNormalizedName === 'srcdoc') {
          return $sce.HTML;
        }

        if (attrNormalizedName === 'src' || attrNormalizedName === 'ngSrc') {
          if (['img', 'video', 'audio', 'source', 'track'].indexOf(nodeName) === -1) {
            return $sce.RESOURCE_URL;
          }

          return $sce.MEDIA_URL;
        } else if (attrNormalizedName === 'xlinkHref') {
          if (nodeName === 'image') return $sce.MEDIA_URL;
          if (nodeName === 'a') return $sce.URL;
          return $sce.RESOURCE_URL;
        } else if (nodeName === 'form' && attrNormalizedName === 'action' || nodeName === 'base' && attrNormalizedName === 'href' || nodeName === 'link' && attrNormalizedName === 'href') {
          return $sce.RESOURCE_URL;
        } else if (nodeName === 'a' && (attrNormalizedName === 'href' || attrNormalizedName === 'ngHref')) {
          return $sce.URL;
        }
      }

      function getTrustedPropContext(nodeName, propNormalizedName) {
        var prop = propNormalizedName.toLowerCase();
        return PROP_CONTEXTS[nodeName + '|' + prop] || PROP_CONTEXTS['*|' + prop];
      }

      function sanitizeSrcsetPropertyValue(value) {
        return sanitizeSrcset($sce.valueOf(value), 'ng-prop-srcset');
      }

      function addPropertyDirective(node, directives, attrName, propName) {
        if (EVENT_HANDLER_ATTR_REGEXP.test(propName)) {
          throw $compileMinErr('nodomevents', 'Property bindings for HTML DOM event properties are disallowed');
        }

        var nodeName = nodeName_(node);
        var trustedContext = getTrustedPropContext(nodeName, propName);
        var sanitizer = identity;

        if (propName === 'srcset' && (nodeName === 'img' || nodeName === 'source')) {
          sanitizer = sanitizeSrcsetPropertyValue;
        } else if (trustedContext) {
          sanitizer = $sce.getTrusted.bind($sce, trustedContext);
        }

        directives.push({
          priority: 100,
          compile: function ngPropCompileFn(_, attr) {
            var ngPropGetter = $parse(attr[attrName]);
            var ngPropWatch = $parse(attr[attrName], function sceValueOf(val) {
              return $sce.valueOf(val);
            });
            return {
              pre: function ngPropPreLinkFn(scope, $element) {
                function applyPropValue() {
                  var propValue = ngPropGetter(scope);
                  $element[0][propName] = sanitizer(propValue);
                }

                applyPropValue();
                scope.$watch(ngPropWatch, applyPropValue);
              }
            };
          }
        });
      }

      function addEventDirective(directives, attrName, eventName) {
        directives.push(createEventDirective($parse, $rootScope, $exceptionHandler, attrName, eventName, false));
      }

      function addAttrInterpolateDirective(node, directives, value, name, isNgAttr) {
        var nodeName = nodeName_(node);
        var trustedContext = getTrustedAttrContext(nodeName, name);
        var mustHaveExpression = !isNgAttr;
        var allOrNothing = ALL_OR_NOTHING_ATTRS[name] || isNgAttr;
        var interpolateFn = $interpolate(value, mustHaveExpression, trustedContext, allOrNothing);
        if (!interpolateFn) return;

        if (name === 'multiple' && nodeName === 'select') {
          throw $compileMinErr('selmulti', 'Binding to the \'multiple\' attribute is not supported. Element: {0}', startingTag(node));
        }

        if (EVENT_HANDLER_ATTR_REGEXP.test(name)) {
          throw $compileMinErr('nodomevents', 'Interpolations for HTML DOM event attributes are disallowed');
        }

        directives.push({
          priority: 100,
          compile: function () {
            return {
              pre: function attrInterpolatePreLinkFn(scope, element, attr) {
                var $$observers = attr.$$observers || (attr.$$observers = createMap());
                var newValue = attr[name];

                if (newValue !== value) {
                  interpolateFn = newValue && $interpolate(newValue, true, trustedContext, allOrNothing);
                  value = newValue;
                }

                if (!interpolateFn) return;
                attr[name] = interpolateFn(scope);
                ($$observers[name] || ($$observers[name] = [])).$$inter = true;
                (attr.$$observers && attr.$$observers[name].$$scope || scope).$watch(interpolateFn, function interpolateFnWatchAction(newValue, oldValue) {
                  if (name === 'class' && newValue !== oldValue) {
                    attr.$updateClass(newValue, oldValue);
                  } else {
                    attr.$set(name, newValue);
                  }
                });
              }
            };
          }
        });
      }

      function replaceWith($rootElement, elementsToRemove, newNode) {
        var firstElementToRemove = elementsToRemove[0],
            removeCount = elementsToRemove.length,
            parent = firstElementToRemove.parentNode,
            i,
            ii;

        if ($rootElement) {
          for (i = 0, ii = $rootElement.length; i < ii; i++) {
            if ($rootElement[i] === firstElementToRemove) {
              $rootElement[i++] = newNode;

              for (var j = i, j2 = j + removeCount - 1, jj = $rootElement.length; j < jj; j++, j2++) {
                if (j2 < jj) {
                  $rootElement[j] = $rootElement[j2];
                } else {
                  delete $rootElement[j];
                }
              }

              $rootElement.length -= removeCount - 1;

              if ($rootElement.context === firstElementToRemove) {
                $rootElement.context = newNode;
              }

              break;
            }
          }
        }

        if (parent) {
          parent.replaceChild(newNode, firstElementToRemove);
        }

        var fragment = window.document.createDocumentFragment();

        for (i = 0; i < removeCount; i++) {
          fragment.appendChild(elementsToRemove[i]);
        }

        if (jqLite.hasData(firstElementToRemove)) {
          jqLite.data(newNode, jqLite.data(firstElementToRemove));
          jqLite(firstElementToRemove).off('$destroy');
        }

        jqLite.cleanData(fragment.querySelectorAll('*'));

        for (i = 1; i < removeCount; i++) {
          delete elementsToRemove[i];
        }

        elementsToRemove[0] = newNode;
        elementsToRemove.length = 1;
      }

      function cloneAndAnnotateFn(fn, annotation) {
        return extend(function () {
          return fn.apply(null, arguments);
        }, fn, annotation);
      }

      function invokeLinkFn(linkFn, scope, $element, attrs, controllers, transcludeFn) {
        try {
          linkFn(scope, $element, attrs, controllers, transcludeFn);
        } catch (e) {
          $exceptionHandler(e, startingTag($element));
        }
      }

      function strictBindingsCheck(attrName, directiveName) {
        if (strictComponentBindingsEnabled) {
          throw $compileMinErr('missingattr', 'Attribute \'{0}\' of \'{1}\' is non-optional and must be set!', attrName, directiveName);
        }
      }

      function initializeDirectiveBindings(scope, attrs, destination, bindings, directive) {
        var removeWatchCollection = [];
        var initialChanges = {};
        var changes;
        forEach(bindings, function initializeBinding(definition, scopeName) {
          var attrName = definition.attrName,
              optional = definition.optional,
              mode = definition.mode,
              lastValue,
              parentGet,
              parentSet,
              compare,
              removeWatch;

          switch (mode) {
            case '@':
              if (!optional && !hasOwnProperty.call(attrs, attrName)) {
                strictBindingsCheck(attrName, directive.name);
                destination[scopeName] = attrs[attrName] = undefined;
              }

              removeWatch = attrs.$observe(attrName, function (value) {
                if (isString(value) || isBoolean(value)) {
                  var oldValue = destination[scopeName];
                  recordChanges(scopeName, value, oldValue);
                  destination[scopeName] = value;
                }
              });
              attrs.$$observers[attrName].$$scope = scope;
              lastValue = attrs[attrName];

              if (isString(lastValue)) {
                destination[scopeName] = $interpolate(lastValue)(scope);
              } else if (isBoolean(lastValue)) {
                destination[scopeName] = lastValue;
              }

              initialChanges[scopeName] = new SimpleChange(_UNINITIALIZED_VALUE, destination[scopeName]);
              removeWatchCollection.push(removeWatch);
              break;

            case '=':
              if (!hasOwnProperty.call(attrs, attrName)) {
                if (optional) break;
                strictBindingsCheck(attrName, directive.name);
                attrs[attrName] = undefined;
              }

              if (optional && !attrs[attrName]) break;
              parentGet = $parse(attrs[attrName]);

              if (parentGet.literal) {
                compare = equals;
              } else {
                compare = simpleCompare;
              }

              parentSet = parentGet.assign || function () {
                lastValue = destination[scopeName] = parentGet(scope);
                throw $compileMinErr('nonassign', 'Expression \'{0}\' in attribute \'{1}\' used with directive \'{2}\' is non-assignable!', attrs[attrName], attrName, directive.name);
              };

              lastValue = destination[scopeName] = parentGet(scope);

              var parentValueWatch = function parentValueWatch(parentValue) {
                if (!compare(parentValue, destination[scopeName])) {
                  if (!compare(parentValue, lastValue)) {
                    destination[scopeName] = parentValue;
                  } else {
                    parentSet(scope, parentValue = destination[scopeName]);
                  }
                }

                lastValue = parentValue;
                return lastValue;
              };

              parentValueWatch.$stateful = true;

              if (definition.collection) {
                removeWatch = scope.$watchCollection(attrs[attrName], parentValueWatch);
              } else {
                removeWatch = scope.$watch($parse(attrs[attrName], parentValueWatch), null, parentGet.literal);
              }

              removeWatchCollection.push(removeWatch);
              break;

            case '<':
              if (!hasOwnProperty.call(attrs, attrName)) {
                if (optional) break;
                strictBindingsCheck(attrName, directive.name);
                attrs[attrName] = undefined;
              }

              if (optional && !attrs[attrName]) break;
              parentGet = $parse(attrs[attrName]);
              var isLiteral = parentGet.literal;
              var initialValue = destination[scopeName] = parentGet(scope);
              initialChanges[scopeName] = new SimpleChange(_UNINITIALIZED_VALUE, destination[scopeName]);

              if (!(parentGet.oneTime && isDefined(initialValue))) {
                removeWatch = scope[definition.collection ? '$watchCollection' : '$watch'](parentGet, function parentValueWatchAction(newValue, oldValue) {
                  if (oldValue === newValue) {
                    if (oldValue === initialValue || isLiteral && equals(oldValue, initialValue)) {
                      return;
                    }

                    oldValue = initialValue;
                  }

                  recordChanges(scopeName, newValue, oldValue);
                  destination[scopeName] = newValue;
                });
                removeWatchCollection.push(removeWatch);
              }

              break;

            case '&':
              if (!optional && !hasOwnProperty.call(attrs, attrName)) {
                strictBindingsCheck(attrName, directive.name);
              }

              parentGet = attrs.hasOwnProperty(attrName) ? $parse(attrs[attrName]) : noop;
              if (parentGet === noop && optional) break;

              destination[scopeName] = function (locals) {
                return parentGet(scope, locals);
              };

              break;
          }
        });

        function recordChanges(key, currentValue, previousValue) {
          if (isFunction(destination.$onChanges) && !simpleCompare(currentValue, previousValue)) {
            if (!onChangesQueue) {
              scope.$$postDigest(flushOnChangesQueue);
              onChangesQueue = [];
            }

            if (!changes) {
              changes = {};
              onChangesQueue.push(triggerOnChangesHook);
            }

            if (changes[key]) {
              previousValue = changes[key].previousValue;
            }

            changes[key] = new SimpleChange(previousValue, currentValue);
          }
        }

        function triggerOnChangesHook() {
          destination.$onChanges(changes);
          changes = undefined;
        }

        return {
          initialChanges: initialChanges,
          removeWatches: removeWatchCollection.length && function removeWatches() {
            for (var i = 0, ii = removeWatchCollection.length; i < ii; ++i) {
              removeWatchCollection[i]();
            }
          }
        };
      }
    }];
  }

  function SimpleChange(previous, current) {
    this.previousValue = previous;
    this.currentValue = current;
  }

  SimpleChange.prototype.isFirstChange = function () {
    return this.previousValue === _UNINITIALIZED_VALUE;
  };

  var PREFIX_REGEXP = /^((?:x|data)[:\-_])/i;
  var SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;

  function directiveNormalize(name) {
    return name.replace(PREFIX_REGEXP, '').replace(SPECIAL_CHARS_REGEXP, function (_, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    });
  }

  function nodesetLinkingFn(scope, nodeList, rootElement, boundTranscludeFn) {}

  function directiveLinkingFn(nodesetLinkingFn, scope, node, rootElement, boundTranscludeFn) {}

  function tokenDifference(str1, str2) {
    var values = '',
        tokens1 = str1.split(/\s+/),
        tokens2 = str2.split(/\s+/);

    outer: for (var i = 0; i < tokens1.length; i++) {
      var token = tokens1[i];

      for (var j = 0; j < tokens2.length; j++) {
        if (token === tokens2[j]) continue outer;
      }

      values += (values.length > 0 ? ' ' : '') + token;
    }

    return values;
  }

  function removeComments(jqNodes) {
    jqNodes = jqLite(jqNodes);
    var i = jqNodes.length;

    if (i <= 1) {
      return jqNodes;
    }

    while (i--) {
      var node = jqNodes[i];

      if (node.nodeType === NODE_TYPE_COMMENT || node.nodeType === NODE_TYPE_TEXT && node.nodeValue.trim() === '') {
        splice.call(jqNodes, i, 1);
      }
    }

    return jqNodes;
  }

  var $controllerMinErr = minErr('$controller');
  var CNTRL_REG = /^(\S+)(\s+as\s+([\w$]+))?$/;

  function identifierForController(controller, ident) {
    if (ident && isString(ident)) return ident;

    if (isString(controller)) {
      var match = CNTRL_REG.exec(controller);
      if (match) return match[3];
    }
  }

  function $ControllerProvider() {
    var controllers = {};

    this.has = function (name) {
      return controllers.hasOwnProperty(name);
    };

    this.register = function (name, constructor) {
      assertNotHasOwnProperty(name, 'controller');

      if (isObject(name)) {
        extend(controllers, name);
      } else {
        controllers[name] = constructor;
      }
    };

    this.$get = ['$injector', function ($injector) {
      return function $controller(expression, locals, later, ident) {
        var instance, match, constructor, identifier;
        later = later === true;

        if (ident && isString(ident)) {
          identifier = ident;
        }

        if (isString(expression)) {
          match = expression.match(CNTRL_REG);

          if (!match) {
            throw $controllerMinErr('ctrlfmt', 'Badly formed controller string \'{0}\'. ' + 'Must match `__name__ as __id__` or `__name__`.', expression);
          }

          constructor = match[1];
          identifier = identifier || match[3];
          expression = controllers.hasOwnProperty(constructor) ? controllers[constructor] : getter(locals.$scope, constructor, true);

          if (!expression) {
            throw $controllerMinErr('ctrlreg', 'The controller with the name \'{0}\' is not registered.', constructor);
          }

          assertArgFn(expression, constructor, true);
        }

        if (later) {
          var controllerPrototype = (isArray(expression) ? expression[expression.length - 1] : expression).prototype;
          instance = Object.create(controllerPrototype || null);

          if (identifier) {
            addIdentifier(locals, identifier, instance, constructor || expression.name);
          }

          return extend(function $controllerInit() {
            var result = $injector.invoke(expression, instance, locals, constructor);

            if (result !== instance && (isObject(result) || isFunction(result))) {
              instance = result;

              if (identifier) {
                addIdentifier(locals, identifier, instance, constructor || expression.name);
              }
            }

            return instance;
          }, {
            instance: instance,
            identifier: identifier
          });
        }

        instance = $injector.instantiate(expression, locals, constructor);

        if (identifier) {
          addIdentifier(locals, identifier, instance, constructor || expression.name);
        }

        return instance;
      };

      function addIdentifier(locals, identifier, instance, name) {
        if (!(locals && isObject(locals.$scope))) {
          throw minErr('$controller')('noscp', 'Cannot export controller \'{0}\' as \'{1}\'! No $scope object provided via `locals`.', name, identifier);
        }

        locals.$scope[identifier] = instance;
      }
    }];
  }

  function $DocumentProvider() {
    this.$get = ['$window', function (window) {
      return jqLite(window.document);
    }];
  }

  function $$IsDocumentHiddenProvider() {
    this.$get = ['$document', '$rootScope', function ($document, $rootScope) {
      var doc = $document[0];
      var hidden = doc && doc.hidden;
      $document.on('visibilitychange', changeListener);
      $rootScope.$on('$destroy', function () {
        $document.off('visibilitychange', changeListener);
      });

      function changeListener() {
        hidden = doc.hidden;
      }

      return function () {
        return hidden;
      };
    }];
  }

  function $ExceptionHandlerProvider() {
    this.$get = ['$log', function ($log) {
      return function (exception, cause) {
        $log.error.apply($log, arguments);
      };
    }];
  }

  var APPLICATION_JSON = 'application/json';
  var CONTENT_TYPE_APPLICATION_JSON = {
    'Content-Type': APPLICATION_JSON + ';charset=utf-8'
  };
  var JSON_START = /^\[|^\{(?!\{)/;
  var JSON_ENDS = {
    '[': /]$/,
    '{': /}$/
  };
  var JSON_PROTECTION_PREFIX = /^\)]\}',?\n/;
  var $httpMinErr = minErr('$http');

  function serializeValue(v) {
    if (isObject(v)) {
      return isDate(v) ? v.toISOString() : toJson(v);
    }

    return v;
  }

  function $HttpParamSerializerProvider() {
    this.$get = function () {
      return function ngParamSerializer(params) {
        if (!params) return '';
        var parts = [];
        forEachSorted(params, function (value, key) {
          if (value === null || isUndefined(value) || isFunction(value)) return;

          if (isArray(value)) {
            forEach(value, function (v) {
              parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(v)));
            });
          } else {
            parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(value)));
          }
        });
        return parts.join('&');
      };
    };
  }

  function $HttpParamSerializerJQLikeProvider() {
    this.$get = function () {
      return function jQueryLikeParamSerializer(params) {
        if (!params) return '';
        var parts = [];
        serialize(params, '', true);
        return parts.join('&');

        function serialize(toSerialize, prefix, topLevel) {
          if (isArray(toSerialize)) {
            forEach(toSerialize, function (value, index) {
              serialize(value, prefix + '[' + (isObject(value) ? index : '') + ']');
            });
          } else if (isObject(toSerialize) && !isDate(toSerialize)) {
            forEachSorted(toSerialize, function (value, key) {
              serialize(value, prefix + (topLevel ? '' : '[') + key + (topLevel ? '' : ']'));
            });
          } else {
            if (isFunction(toSerialize)) {
              toSerialize = toSerialize();
            }

            parts.push(encodeUriQuery(prefix) + '=' + (toSerialize == null ? '' : encodeUriQuery(serializeValue(toSerialize))));
          }
        }
      };
    };
  }

  function defaultHttpResponseTransform(data, headers) {
    if (isString(data)) {
      var tempData = data.replace(JSON_PROTECTION_PREFIX, '').trim();

      if (tempData) {
        var contentType = headers('Content-Type');
        var hasJsonContentType = contentType && contentType.indexOf(APPLICATION_JSON) === 0;

        if (hasJsonContentType || isJsonLike(tempData)) {
          try {
            data = fromJson(tempData);
          } catch (e) {
            if (!hasJsonContentType) {
              return data;
            }

            throw $httpMinErr('baddata', 'Data must be a valid JSON object. Received: "{0}". ' + 'Parse error: "{1}"', data, e);
          }
        }
      }
    }

    return data;
  }

  function isJsonLike(str) {
    var jsonStart = str.match(JSON_START);
    return jsonStart && JSON_ENDS[jsonStart[0]].test(str);
  }

  function parseHeaders(headers) {
    var parsed = createMap(),
        i;

    function fillInParsed(key, val) {
      if (key) {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }

    if (isString(headers)) {
      forEach(headers.split('\n'), function (line) {
        i = line.indexOf(':');
        fillInParsed(lowercase(trim(line.substr(0, i))), trim(line.substr(i + 1)));
      });
    } else if (isObject(headers)) {
      forEach(headers, function (headerVal, headerKey) {
        fillInParsed(lowercase(headerKey), trim(headerVal));
      });
    }

    return parsed;
  }

  function headersGetter(headers) {
    var headersObj;
    return function (name) {
      if (!headersObj) headersObj = parseHeaders(headers);

      if (name) {
        var value = headersObj[lowercase(name)];

        if (value === undefined) {
          value = null;
        }

        return value;
      }

      return headersObj;
    };
  }

  function transformData(data, headers, status, fns) {
    if (isFunction(fns)) {
      return fns(data, headers, status);
    }

    forEach(fns, function (fn) {
      data = fn(data, headers, status);
    });
    return data;
  }

  function isSuccess(status) {
    return 200 <= status && status < 300;
  }

  function $HttpProvider() {
    var defaults = this.defaults = {
      transformResponse: [defaultHttpResponseTransform],
      transformRequest: [function (d) {
        return isObject(d) && !isFile(d) && !isBlob(d) && !isFormData(d) ? toJson(d) : d;
      }],
      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        },
        post: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
        put: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
        patch: shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
      },
      paramSerializer: '$httpParamSerializer',
      jsonpCallbackParam: 'callback'
    };
    var useApplyAsync = false;

    this.useApplyAsync = function (value) {
      if (isDefined(value)) {
        useApplyAsync = !!value;
        return this;
      }

      return useApplyAsync;
    };

    var interceptorFactories = this.interceptors = [];
    this.$get = ['$browser', '$httpBackend', '$rootScope', '$q', '$injector', '$sce', function ($browser, $httpBackend, $rootScope, $q, $injector, $sce) {
      defaults.paramSerializer = isString(defaults.paramSerializer) ? $injector.get(defaults.paramSerializer) : defaults.paramSerializer;
      var reversedInterceptors = [];
      forEach(interceptorFactories, function (interceptorFactory) {
        reversedInterceptors.unshift(isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
      });

      function $http(requestConfig) {
        if (!isObject(requestConfig)) {
          throw minErr('$http')('badreq', 'Http request configuration must be an object.  Received: {0}', requestConfig);
        }

        if (!isString($sce.valueOf(requestConfig.url))) {
          throw minErr('$http')('badreq', 'Http request configuration url must be a string or a $sce trusted object.  Received: {0}', requestConfig.url);
        }

        if (requestConfig.cache) {
          throw new Error('$http does not support cache anymore! (https://github.com/Crowd9/angular.js)');
        }

        var config = extend({
          method: 'get',
          transformRequest: defaults.transformRequest,
          transformResponse: defaults.transformResponse,
          paramSerializer: defaults.paramSerializer,
          jsonpCallbackParam: defaults.jsonpCallbackParam
        }, requestConfig);
        config.headers = mergeHeaders(requestConfig);
        config.method = uppercase(config.method);
        config.paramSerializer = isString(config.paramSerializer) ? $injector.get(config.paramSerializer) : config.paramSerializer;
        $browser.$$incOutstandingRequestCount('$http');
        var requestInterceptors = [];
        var responseInterceptors = [];
        var promise = $q.resolve(config);
        forEach(reversedInterceptors, function (interceptor) {
          if (interceptor.request || interceptor.requestError) {
            requestInterceptors.unshift(interceptor.request, interceptor.requestError);
          }

          if (interceptor.response || interceptor.responseError) {
            responseInterceptors.push(interceptor.response, interceptor.responseError);
          }
        });
        promise = chainInterceptors(promise, requestInterceptors);
        promise = promise.then(serverRequest);
        promise = chainInterceptors(promise, responseInterceptors);
        promise = promise.finally(completeOutstandingRequest);
        return promise;

        function chainInterceptors(promise, interceptors) {
          for (var i = 0, ii = interceptors.length; i < ii;) {
            var thenFn = interceptors[i++];
            var rejectFn = interceptors[i++];
            promise = promise.then(thenFn, rejectFn);
          }

          interceptors.length = 0;
          return promise;
        }

        function completeOutstandingRequest() {
          $browser.$$completeOutstandingRequest(noop, '$http');
        }

        function executeHeaderFns(headers, config) {
          var headerContent,
              processedHeaders = {};
          forEach(headers, function (headerFn, header) {
            if (isFunction(headerFn)) {
              headerContent = headerFn(config);

              if (headerContent != null) {
                processedHeaders[header] = headerContent;
              }
            } else {
              processedHeaders[header] = headerFn;
            }
          });
          return processedHeaders;
        }

        function mergeHeaders(config) {
          var defHeaders = defaults.headers,
              reqHeaders = extend({}, config.headers),
              defHeaderName,
              lowercaseDefHeaderName,
              reqHeaderName;
          defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

          defaultHeadersIteration: for (defHeaderName in defHeaders) {
            lowercaseDefHeaderName = lowercase(defHeaderName);

            for (reqHeaderName in reqHeaders) {
              if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                continue defaultHeadersIteration;
              }
            }

            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
          }

          return executeHeaderFns(reqHeaders, shallowCopy(config));
        }

        function serverRequest(config) {
          var headers = config.headers;
          var reqData = transformData(config.data, headersGetter(headers), undefined, config.transformRequest);

          if (isUndefined(reqData)) {
            forEach(headers, function (value, header) {
              if (lowercase(header) === 'content-type') {
                delete headers[header];
              }
            });
          }

          if (isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials)) {
            config.withCredentials = defaults.withCredentials;
          }

          return sendReq(config, reqData).then(transformResponse, transformResponse);
        }

        function transformResponse(response) {
          var resp = extend({}, response);
          resp.data = transformData(response.data, response.headers, response.status, config.transformResponse);
          return isSuccess(response.status) ? resp : $q.reject(resp);
        }
      }

      $http.pendingRequests = [];
      createShortMethods('get', 'delete', 'head', 'jsonp');
      createShortMethodsWithData('post', 'put', 'patch');
      $http.defaults = defaults;
      return $http;

      function createShortMethods(names) {
        forEach(arguments, function (name) {
          $http[name] = function (url, config) {
            return $http(extend({}, config || {}, {
              method: name,
              url: url
            }));
          };
        });
      }

      function createShortMethodsWithData(name) {
        forEach(arguments, function (name) {
          $http[name] = function (url, data, config) {
            return $http(extend({}, config || {}, {
              method: name,
              url: url,
              data: data
            }));
          };
        });
      }

      function sendReq(config, reqData) {
        var deferred = $q.defer(),
            promise = deferred.promise,
            reqHeaders = config.headers,
            isJsonp = lowercase(config.method) === 'jsonp',
            url = config.url;

        if (isJsonp) {
          url = $sce.getTrustedResourceUrl(url);
        } else if (!isString(url)) {
          url = $sce.valueOf(url);
        }

        url = buildUrl(url, config.paramSerializer(config.params));

        if (isJsonp) {
          url = sanitizeJsonpCallbackParam(url, config.jsonpCallbackParam);
        }

        $http.pendingRequests.push(config);
        promise.then(removePendingReq, removePendingReq);
        $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout, config.withCredentials, config.responseType, createApplyHandlers(config.eventHandlers), createApplyHandlers(config.uploadEventHandlers));
        return promise;

        function createApplyHandlers(eventHandlers) {
          if (eventHandlers) {
            var applyHandlers = {};
            forEach(eventHandlers, function (eventHandler, key) {
              applyHandlers[key] = function (event) {
                if (useApplyAsync) {
                  $rootScope.$applyAsync(callEventHandler);
                } else if ($rootScope.$$phase) {
                  callEventHandler();
                } else {
                  $rootScope.$apply(callEventHandler);
                }

                function callEventHandler() {
                  eventHandler(event);
                }
              };
            });
            return applyHandlers;
          }
        }

        function done(status, response, headersString, statusText, xhrStatus) {
          function resolveHttpPromise() {
            resolvePromise(response, status, headersString, statusText, xhrStatus);
          }

          if (useApplyAsync) {
            $rootScope.$applyAsync(resolveHttpPromise);
          } else {
            resolveHttpPromise();
            if (!$rootScope.$$phase) $rootScope.$apply();
          }
        }

        function resolvePromise(response, status, headers, statusText, xhrStatus) {
          status = status >= -1 ? status : 0;
          (isSuccess(status) ? deferred.resolve : deferred.reject)({
            data: response,
            status: status,
            headers: headersGetter(headers),
            config: config,
            statusText: statusText,
            xhrStatus: xhrStatus
          });
        }

        function resolvePromiseWithResult(result) {
          resolvePromise(result.data, result.status, shallowCopy(result.headers()), result.statusText, result.xhrStatus);
        }

        function removePendingReq() {
          var idx = $http.pendingRequests.indexOf(config);
          if (idx !== -1) $http.pendingRequests.splice(idx, 1);
        }
      }

      function buildUrl(url, serializedParams) {
        if (serializedParams.length > 0) {
          url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
        }

        return url;
      }

      function sanitizeJsonpCallbackParam(url, cbKey) {
        var parts = url.split('?');

        if (parts.length > 2) {
          throw $httpMinErr('badjsonp', 'Illegal use more than one "?", in url, "{1}"', url);
        }

        var params = parseKeyValue(parts[1]);
        forEach(params, function (value, key) {
          if (value === 'JSON_CALLBACK') {
            throw $httpMinErr('badjsonp', 'Illegal use of JSON_CALLBACK in url, "{0}"', url);
          }

          if (key === cbKey) {
            throw $httpMinErr('badjsonp', 'Illegal use of callback param, "{0}", in url, "{1}"', cbKey, url);
          }
        });
        url += (url.indexOf('?') === -1 ? '?' : '&') + cbKey + '=JSON_CALLBACK';
        return url;
      }
    }];
  }

  function $HttpBackendProvider() {
    this.$get = function () {
      return function httpBackend() {
        throw new Error('$HttpBackendProvider is removed! (https://github.com/Crowd9/angular.js)');
      };
    };
  }

  var $interpolateMinErr = angular.$interpolateMinErr = minErr('$interpolate');

  $interpolateMinErr.throwNoconcat = function (text) {
    throw $interpolateMinErr('noconcat', 'Error while interpolating: {0}\nStrict Contextual Escaping disallows ' + 'interpolations that concatenate multiple expressions when a trusted value is ' + 'required.  See http://docs.angularjs.org/api/ng.$sce', text);
  };

  $interpolateMinErr.interr = function (text, err) {
    return $interpolateMinErr('interr', 'Can\'t interpolate: {0}\n{1}', text, err.toString());
  };

  function $InterpolateProvider() {
    var startSymbol = '{{';
    var endSymbol = '}}';

    this.startSymbol = function (value) {
      if (value) {
        startSymbol = value;
        return this;
      }

      return startSymbol;
    };

    this.endSymbol = function (value) {
      if (value) {
        endSymbol = value;
        return this;
      }

      return endSymbol;
    };

    this.$get = ['$parse', '$exceptionHandler', '$sce', function ($parse, $exceptionHandler, $sce) {
      var startSymbolLength = startSymbol.length,
          endSymbolLength = endSymbol.length,
          escapedStartRegexp = new RegExp(startSymbol.replace(/./g, escape), 'g'),
          escapedEndRegexp = new RegExp(endSymbol.replace(/./g, escape), 'g');

      function escape(ch) {
        return '\\\\\\' + ch;
      }

      function unescapeText(text) {
        return text.replace(escapedStartRegexp, startSymbol).replace(escapedEndRegexp, endSymbol);
      }

      function constantWatchDelegate(scope, listener, objectEquality, constantInterp) {
        var unwatch = scope.$watch(function constantInterpolateWatch(scope) {
          unwatch();
          return constantInterp(scope);
        }, listener, objectEquality);
        return unwatch;
      }

      function $interpolate(text, mustHaveExpression, trustedContext, allOrNothing) {
        var contextAllowsConcatenation = trustedContext === $sce.URL || trustedContext === $sce.MEDIA_URL;

        if (!text.length || text.indexOf(startSymbol) === -1) {
          if (mustHaveExpression) return;
          var unescapedText = unescapeText(text);

          if (contextAllowsConcatenation) {
            unescapedText = $sce.getTrusted(trustedContext, unescapedText);
          }

          var constantInterp = valueFn(unescapedText);
          constantInterp.exp = text;
          constantInterp.expressions = [];
          constantInterp.$$watchDelegate = constantWatchDelegate;
          return constantInterp;
        }

        allOrNothing = !!allOrNothing;
        var startIndex,
            endIndex,
            index = 0,
            expressions = [],
            parseFns,
            textLength = text.length,
            exp,
            concat = [],
            expressionPositions = [],
            singleExpression;

        while (index < textLength) {
          if ((startIndex = text.indexOf(startSymbol, index)) !== -1 && (endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) !== -1) {
            if (index !== startIndex) {
              concat.push(unescapeText(text.substring(index, startIndex)));
            }

            exp = text.substring(startIndex + startSymbolLength, endIndex);
            expressions.push(exp);
            index = endIndex + endSymbolLength;
            expressionPositions.push(concat.length);
            concat.push('');
          } else {
            if (index !== textLength) {
              concat.push(unescapeText(text.substring(index)));
            }

            break;
          }
        }

        singleExpression = concat.length === 1 && expressionPositions.length === 1;
        var interceptor = contextAllowsConcatenation && singleExpression ? undefined : parseStringifyInterceptor;
        parseFns = expressions.map(function (exp) {
          return $parse(exp, interceptor);
        });

        if (!mustHaveExpression || expressions.length) {
          var compute = function (values) {
            for (var i = 0, ii = expressions.length; i < ii; i++) {
              if (allOrNothing && isUndefined(values[i])) return;
              concat[expressionPositions[i]] = values[i];
            }

            if (contextAllowsConcatenation) {
              return $sce.getTrusted(trustedContext, singleExpression ? concat[0] : concat.join(''));
            } else if (trustedContext && concat.length > 1) {
              $interpolateMinErr.throwNoconcat(text);
            }

            return concat.join('');
          };

          return extend(function interpolationFn(context) {
            var i = 0;
            var ii = expressions.length;
            var values = new Array(ii);

            try {
              for (; i < ii; i++) {
                values[i] = parseFns[i](context);
              }

              return compute(values);
            } catch (err) {
              $exceptionHandler($interpolateMinErr.interr(text, err));
            }
          }, {
            exp: text,
            expressions: expressions,
            $$watchDelegate: function (scope, listener) {
              var lastValue;
              return scope.$watchGroup(parseFns, function interpolateFnWatcher(values, oldValues) {
                var currValue = compute(values);
                listener.call(this, currValue, values !== oldValues ? lastValue : currValue, scope);
                lastValue = currValue;
              });
            }
          });
        }

        function parseStringifyInterceptor(value) {
          try {
            value = trustedContext && !contextAllowsConcatenation ? $sce.getTrusted(trustedContext, value) : $sce.valueOf(value);
            return allOrNothing && !isDefined(value) ? value : stringify(value);
          } catch (err) {
            $exceptionHandler($interpolateMinErr.interr(text, err));
          }
        }
      }

      $interpolate.startSymbol = function () {
        return startSymbol;
      };

      $interpolate.endSymbol = function () {
        return endSymbol;
      };

      return $interpolate;
    }];
  }

  var $intervalMinErr = minErr('$interval');

  function $IntervalProvider() {
    this.$get = ['$$intervalFactory', '$window', function ($$intervalFactory, $window) {
      var intervals = {};

      var setIntervalFn = function (tick, delay, deferred) {
        var id = $window.setInterval(tick, delay);
        intervals[id] = deferred;
        return id;
      };

      var clearIntervalFn = function (id) {
        $window.clearInterval(id);
        delete intervals[id];
      };

      var interval = $$intervalFactory(setIntervalFn, clearIntervalFn);

      interval.cancel = function (promise) {
        if (!promise) return false;

        if (!promise.hasOwnProperty('$$intervalId')) {
          throw $intervalMinErr('badprom', '`$interval.cancel()` called with a promise that was not generated by `$interval()`.');
        }

        if (!intervals.hasOwnProperty(promise.$$intervalId)) return false;
        var id = promise.$$intervalId;
        var deferred = intervals[id];
        markQExceptionHandled(deferred.promise);
        deferred.reject('canceled');
        clearIntervalFn(id);
        return true;
      };

      return interval;
    }];
  }

  function $$IntervalFactoryProvider() {
    this.$get = ['$browser', '$q', '$$q', '$rootScope', function ($browser, $q, $$q, $rootScope) {
      return function intervalFactory(setIntervalFn, clearIntervalFn) {
        return function intervalFn(fn, delay, count, invokeApply) {
          var hasParams = arguments.length > 4,
              args = hasParams ? sliceArgs(arguments, 4) : [],
              iteration = 0,
              skipApply = isDefined(invokeApply) && !invokeApply,
              deferred = (skipApply ? $$q : $q).defer(),
              promise = deferred.promise;
          count = isDefined(count) ? count : 0;

          function callback() {
            if (!hasParams) {
              fn(iteration);
            } else {
              fn.apply(null, args);
            }
          }

          function tick() {
            if (skipApply) {
              $browser.defer(callback);
            } else {
              $rootScope.$evalAsync(callback);
            }

            deferred.notify(iteration++);

            if (count > 0 && iteration >= count) {
              deferred.resolve(iteration);
              clearIntervalFn(promise.$$intervalId);
            }

            if (!skipApply) $rootScope.$apply();
          }

          promise.$$intervalId = setIntervalFn(tick, delay, deferred, skipApply);
          return promise;
        };
      };
    }];
  }

  var $jsonpCallbacksProvider = function () {
    this.$get = function () {
      return {
        createCallback: function (url) {
          throw new Error('$jsonpCallbacksProvider is removed! (https://github.com/Crowd9/angular.js)');
        },
        wasCalled: function (callbackPath) {
          throw new Error('$jsonpCallbacksProvider is removed! (https://github.com/Crowd9/angular.js)');
        },
        getResponse: function (callbackPath) {
          throw new Error('$jsonpCallbacksProvider is removed! (https://github.com/Crowd9/angular.js)');
        },
        removeCallback: function (callbackPath) {
          throw new Error('$jsonpCallbacksProvider is removed! (https://github.com/Crowd9/angular.js)');
        }
      };
    };
  };

  function $LogProvider() {
    var debug = true,
        self = this;

    this.debugEnabled = function (flag) {
      if (isDefined(flag)) {
        debug = flag;
        return this;
      } else {
        return debug;
      }
    };

    this.$get = ['$window', function ($window) {
      var formatStackTrace = msie || /\bEdge\//.test($window.navigator && $window.navigator.userAgent);
      return {
        log: consoleLog('log'),
        info: consoleLog('info'),
        warn: consoleLog('warn'),
        error: consoleLog('error'),
        debug: function () {
          var fn = consoleLog('debug');
          return function () {
            if (debug) {
              fn.apply(self, arguments);
            }
          };
        }()
      };

      function formatError(arg) {
        if (isError(arg)) {
          if (arg.stack && formatStackTrace) {
            arg = arg.message && arg.stack.indexOf(arg.message) === -1 ? 'Error: ' + arg.message + '\n' + arg.stack : arg.stack;
          } else if (arg.sourceURL) {
            arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
          }
        }

        return arg;
      }

      function consoleLog(type) {
        var console = $window.console || {},
            logFn = console[type] || console.log || noop;
        return function () {
          var args = [];
          forEach(arguments, function (arg) {
            args.push(formatError(arg));
          });
          return Function.prototype.apply.call(logFn, console, args);
        };
      }
    }];
  }

  var $parseMinErr = minErr('$parse');
  var objectValueOf = {}.constructor.prototype.valueOf;

  function getStringValue(name) {
    return name + '';
  }

  var OPERATORS = createMap();
  forEach('+ - * / % === !== == != < > <= >= && || ! = |'.split(' '), function (operator) {
    OPERATORS[operator] = true;
  });
  var ESCAPE = {
    'n': '\n',
    'f': '\f',
    'r': '\r',
    't': '\t',
    'v': '\v',
    '\'': '\'',
    '"': '"'
  };

  var Lexer = function Lexer(options) {
    this.options = options;
  };

  Lexer.prototype = {
    constructor: Lexer,
    lex: function (text) {
      this.text = text;
      this.index = 0;
      this.tokens = [];

      while (this.index < this.text.length) {
        var ch = this.text.charAt(this.index);

        if (ch === '"' || ch === '\'') {
          this.readString(ch);
        } else if (this.isNumber(ch) || ch === '.' && this.isNumber(this.peek())) {
          this.readNumber();
        } else if (this.isIdentifierStart(this.peekMultichar())) {
          this.readIdent();
        } else if (this.is(ch, '(){}[].,;:?')) {
          this.tokens.push({
            index: this.index,
            text: ch
          });
          this.index++;
        } else if (this.isWhitespace(ch)) {
          this.index++;
        } else {
          var ch2 = ch + this.peek();
          var ch3 = ch2 + this.peek(2);
          var op1 = OPERATORS[ch];
          var op2 = OPERATORS[ch2];
          var op3 = OPERATORS[ch3];

          if (op1 || op2 || op3) {
            var token = op3 ? ch3 : op2 ? ch2 : ch;
            this.tokens.push({
              index: this.index,
              text: token,
              operator: true
            });
            this.index += token.length;
          } else {
            this.throwError('Unexpected next character ', this.index, this.index + 1);
          }
        }
      }

      return this.tokens;
    },
    is: function (ch, chars) {
      return chars.indexOf(ch) !== -1;
    },
    peek: function (i) {
      var num = i || 1;
      return this.index + num < this.text.length ? this.text.charAt(this.index + num) : false;
    },
    isNumber: function (ch) {
      return '0' <= ch && ch <= '9' && typeof ch === 'string';
    },
    isWhitespace: function (ch) {
      return ch === ' ' || ch === '\r' || ch === '\t' || ch === '\n' || ch === '\v' || ch === '\u00A0';
    },
    isIdentifierStart: function (ch) {
      return this.options.isIdentifierStart ? this.options.isIdentifierStart(ch, this.codePointAt(ch)) : this.isValidIdentifierStart(ch);
    },
    isValidIdentifierStart: function (ch) {
      return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || '_' === ch || ch === '$';
    },
    isIdentifierContinue: function (ch) {
      return this.options.isIdentifierContinue ? this.options.isIdentifierContinue(ch, this.codePointAt(ch)) : this.isValidIdentifierContinue(ch);
    },
    isValidIdentifierContinue: function (ch, cp) {
      return this.isValidIdentifierStart(ch, cp) || this.isNumber(ch);
    },
    codePointAt: function (ch) {
      if (ch.length === 1) return ch.charCodeAt(0);
      return (ch.charCodeAt(0) << 10) + ch.charCodeAt(1) - 0x35FDC00;
    },
    peekMultichar: function () {
      var ch = this.text.charAt(this.index);
      var peek = this.peek();

      if (!peek) {
        return ch;
      }

      var cp1 = ch.charCodeAt(0);
      var cp2 = peek.charCodeAt(0);

      if (cp1 >= 0xD800 && cp1 <= 0xDBFF && cp2 >= 0xDC00 && cp2 <= 0xDFFF) {
        return ch + peek;
      }

      return ch;
    },
    isExpOperator: function (ch) {
      return ch === '-' || ch === '+' || this.isNumber(ch);
    },
    throwError: function (error, start, end) {
      end = end || this.index;
      var colStr = isDefined(start) ? 's ' + start + '-' + this.index + ' [' + this.text.substring(start, end) + ']' : ' ' + end;
      throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].', error, colStr, this.text);
    },
    readNumber: function () {
      var number = '';
      var start = this.index;

      while (this.index < this.text.length) {
        var ch = lowercase(this.text.charAt(this.index));

        if (ch === '.' || this.isNumber(ch)) {
          number += ch;
        } else {
          var peekCh = this.peek();

          if (ch === 'e' && this.isExpOperator(peekCh)) {
            number += ch;
          } else if (this.isExpOperator(ch) && peekCh && this.isNumber(peekCh) && number.charAt(number.length - 1) === 'e') {
            number += ch;
          } else if (this.isExpOperator(ch) && (!peekCh || !this.isNumber(peekCh)) && number.charAt(number.length - 1) === 'e') {
            this.throwError('Invalid exponent');
          } else {
            break;
          }
        }

        this.index++;
      }

      this.tokens.push({
        index: start,
        text: number,
        constant: true,
        value: Number(number)
      });
    },
    readIdent: function () {
      var start = this.index;
      this.index += this.peekMultichar().length;

      while (this.index < this.text.length) {
        var ch = this.peekMultichar();

        if (!this.isIdentifierContinue(ch)) {
          break;
        }

        this.index += ch.length;
      }

      this.tokens.push({
        index: start,
        text: this.text.slice(start, this.index),
        identifier: true
      });
    },
    readString: function (quote) {
      var start = this.index;
      this.index++;
      var string = '';
      var rawString = quote;
      var escape = false;

      while (this.index < this.text.length) {
        var ch = this.text.charAt(this.index);
        rawString += ch;

        if (escape) {
          if (ch === 'u') {
            var hex = this.text.substring(this.index + 1, this.index + 5);

            if (!hex.match(/[\da-f]{4}/i)) {
              this.throwError('Invalid unicode escape [\\u' + hex + ']');
            }

            this.index += 4;
            string += String.fromCharCode(parseInt(hex, 16));
          } else {
            var rep = ESCAPE[ch];
            string = string + (rep || ch);
          }

          escape = false;
        } else if (ch === '\\') {
          escape = true;
        } else if (ch === quote) {
          this.index++;
          this.tokens.push({
            index: start,
            text: rawString,
            constant: true,
            value: string
          });
          return;
        } else {
          string += ch;
        }

        this.index++;
      }

      this.throwError('Unterminated quote', start);
    }
  };

  var AST = function AST(lexer, options) {
    this.lexer = lexer;
    this.options = options;
  };

  AST.Program = 'Program';
  AST.ExpressionStatement = 'ExpressionStatement';
  AST.AssignmentExpression = 'AssignmentExpression';
  AST.ConditionalExpression = 'ConditionalExpression';
  AST.LogicalExpression = 'LogicalExpression';
  AST.BinaryExpression = 'BinaryExpression';
  AST.UnaryExpression = 'UnaryExpression';
  AST.CallExpression = 'CallExpression';
  AST.MemberExpression = 'MemberExpression';
  AST.Identifier = 'Identifier';
  AST.Literal = 'Literal';
  AST.ArrayExpression = 'ArrayExpression';
  AST.Property = 'Property';
  AST.ObjectExpression = 'ObjectExpression';
  AST.ThisExpression = 'ThisExpression';
  AST.LocalsExpression = 'LocalsExpression';
  AST.NGValueParameter = 'NGValueParameter';
  AST.prototype = {
    ast: function (text) {
      this.text = text;
      this.tokens = this.lexer.lex(text);
      var value = this.program();

      if (this.tokens.length !== 0) {
        this.throwError('is an unexpected token', this.tokens[0]);
      }

      return value;
    },
    program: function () {
      var body = [];

      while (true) {
        if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) body.push(this.expressionStatement());

        if (!this.expect(';')) {
          return {
            type: AST.Program,
            body: body
          };
        }
      }
    },
    expressionStatement: function () {
      return {
        type: AST.ExpressionStatement,
        expression: this.filterChain()
      };
    },
    filterChain: function () {
      var left = this.expression();

      while (this.expect('|')) {
        left = this.filter(left);
      }

      return left;
    },
    expression: function () {
      return this.assignment();
    },
    assignment: function () {
      var result = this.ternary();

      if (this.expect('=')) {
        if (!isAssignable(result)) {
          throw $parseMinErr('lval', 'Trying to assign a value to a non l-value');
        }

        result = {
          type: AST.AssignmentExpression,
          left: result,
          right: this.assignment(),
          operator: '='
        };
      }

      return result;
    },
    ternary: function () {
      var test = this.logicalOR();
      var alternate;
      var consequent;

      if (this.expect('?')) {
        alternate = this.expression();

        if (this.consume(':')) {
          consequent = this.expression();
          return {
            type: AST.ConditionalExpression,
            test: test,
            alternate: alternate,
            consequent: consequent
          };
        }
      }

      return test;
    },
    logicalOR: function () {
      var left = this.logicalAND();

      while (this.expect('||')) {
        left = {
          type: AST.LogicalExpression,
          operator: '||',
          left: left,
          right: this.logicalAND()
        };
      }

      return left;
    },
    logicalAND: function () {
      var left = this.equality();

      while (this.expect('&&')) {
        left = {
          type: AST.LogicalExpression,
          operator: '&&',
          left: left,
          right: this.equality()
        };
      }

      return left;
    },
    equality: function () {
      var left = this.relational();
      var token;

      while (token = this.expect('==', '!=', '===', '!==')) {
        left = {
          type: AST.BinaryExpression,
          operator: token.text,
          left: left,
          right: this.relational()
        };
      }

      return left;
    },
    relational: function () {
      var left = this.additive();
      var token;

      while (token = this.expect('<', '>', '<=', '>=')) {
        left = {
          type: AST.BinaryExpression,
          operator: token.text,
          left: left,
          right: this.additive()
        };
      }

      return left;
    },
    additive: function () {
      var left = this.multiplicative();
      var token;

      while (token = this.expect('+', '-')) {
        left = {
          type: AST.BinaryExpression,
          operator: token.text,
          left: left,
          right: this.multiplicative()
        };
      }

      return left;
    },
    multiplicative: function () {
      var left = this.unary();
      var token;

      while (token = this.expect('*', '/', '%')) {
        left = {
          type: AST.BinaryExpression,
          operator: token.text,
          left: left,
          right: this.unary()
        };
      }

      return left;
    },
    unary: function () {
      var token;

      if (token = this.expect('+', '-', '!')) {
        return {
          type: AST.UnaryExpression,
          operator: token.text,
          prefix: true,
          argument: this.unary()
        };
      } else {
        return this.primary();
      }
    },
    primary: function () {
      var primary;

      if (this.expect('(')) {
        primary = this.filterChain();
        this.consume(')');
      } else if (this.expect('[')) {
        primary = this.arrayDeclaration();
      } else if (this.expect('{')) {
        primary = this.object();
      } else if (this.selfReferential.hasOwnProperty(this.peek().text)) {
        primary = copy(this.selfReferential[this.consume().text]);
      } else if (this.options.literals.hasOwnProperty(this.peek().text)) {
        primary = {
          type: AST.Literal,
          value: this.options.literals[this.consume().text]
        };
      } else if (this.peek().identifier) {
        primary = this.identifier();
      } else if (this.peek().constant) {
        primary = this.constant();
      } else {
        this.throwError('not a primary expression', this.peek());
      }

      var next;

      while (next = this.expect('(', '[', '.')) {
        if (next.text === '(') {
          primary = {
            type: AST.CallExpression,
            callee: primary,
            arguments: this.parseArguments()
          };
          this.consume(')');
        } else if (next.text === '[') {
          primary = {
            type: AST.MemberExpression,
            object: primary,
            property: this.expression(),
            computed: true
          };
          this.consume(']');
        } else if (next.text === '.') {
          primary = {
            type: AST.MemberExpression,
            object: primary,
            property: this.identifier(),
            computed: false
          };
        } else {
          this.throwError('IMPOSSIBLE');
        }
      }

      return primary;
    },
    filter: function (baseExpression) {
      var args = [baseExpression];
      var result = {
        type: AST.CallExpression,
        callee: this.identifier(),
        arguments: args,
        filter: true
      };

      while (this.expect(':')) {
        args.push(this.expression());
      }

      return result;
    },
    parseArguments: function () {
      var args = [];

      if (this.peekToken().text !== ')') {
        do {
          args.push(this.filterChain());
        } while (this.expect(','));
      }

      return args;
    },
    identifier: function () {
      var token = this.consume();

      if (!token.identifier) {
        this.throwError('is not a valid identifier', token);
      }

      return {
        type: AST.Identifier,
        name: token.text
      };
    },
    constant: function () {
      return {
        type: AST.Literal,
        value: this.consume().value
      };
    },
    arrayDeclaration: function () {
      var elements = [];

      if (this.peekToken().text !== ']') {
        do {
          if (this.peek(']')) {
            break;
          }

          elements.push(this.expression());
        } while (this.expect(','));
      }

      this.consume(']');
      return {
        type: AST.ArrayExpression,
        elements: elements
      };
    },
    object: function () {
      var properties = [],
          property;

      if (this.peekToken().text !== '}') {
        do {
          if (this.peek('}')) {
            break;
          }

          property = {
            type: AST.Property,
            kind: 'init'
          };

          if (this.peek().constant) {
            property.key = this.constant();
            property.computed = false;
            this.consume(':');
            property.value = this.expression();
          } else if (this.peek().identifier) {
            property.key = this.identifier();
            property.computed = false;

            if (this.peek(':')) {
              this.consume(':');
              property.value = this.expression();
            } else {
              property.value = property.key;
            }
          } else if (this.peek('[')) {
            this.consume('[');
            property.key = this.expression();
            this.consume(']');
            property.computed = true;
            this.consume(':');
            property.value = this.expression();
          } else {
            this.throwError('invalid key', this.peek());
          }

          properties.push(property);
        } while (this.expect(','));
      }

      this.consume('}');
      return {
        type: AST.ObjectExpression,
        properties: properties
      };
    },
    throwError: function (msg, token) {
      throw $parseMinErr('syntax', 'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].', token.text, msg, token.index + 1, this.text, this.text.substring(token.index));
    },
    consume: function (e1) {
      if (this.tokens.length === 0) {
        throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
      }

      var token = this.expect(e1);

      if (!token) {
        this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
      }

      return token;
    },
    peekToken: function () {
      if (this.tokens.length === 0) {
        throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
      }

      return this.tokens[0];
    },
    peek: function (e1, e2, e3, e4) {
      return this.peekAhead(0, e1, e2, e3, e4);
    },
    peekAhead: function (i, e1, e2, e3, e4) {
      if (this.tokens.length > i) {
        var token = this.tokens[i];
        var t = token.text;

        if (t === e1 || t === e2 || t === e3 || t === e4 || !e1 && !e2 && !e3 && !e4) {
          return token;
        }
      }

      return false;
    },
    expect: function (e1, e2, e3, e4) {
      var token = this.peek(e1, e2, e3, e4);

      if (token) {
        this.tokens.shift();
        return token;
      }

      return false;
    },
    selfReferential: {
      'this': {
        type: AST.ThisExpression
      },
      '$locals': {
        type: AST.LocalsExpression
      }
    }
  };

  function ifDefined(v, d) {
    return typeof v !== 'undefined' ? v : d;
  }

  function plusFn(l, r) {
    if (typeof l === 'undefined') return r;
    if (typeof r === 'undefined') return l;
    return l + r;
  }

  function isStateless($filter, filterName) {
    var fn = $filter(filterName);
    return !fn.$stateful;
  }

  var PURITY_ABSOLUTE = 1;
  var PURITY_RELATIVE = 2;

  function isPure(node, parentIsPure) {
    switch (node.type) {
      case AST.MemberExpression:
        if (node.computed) {
          return false;
        }

        break;

      case AST.UnaryExpression:
        return PURITY_ABSOLUTE;

      case AST.BinaryExpression:
        return node.operator !== '+' ? PURITY_ABSOLUTE : false;

      case AST.CallExpression:
        return false;
    }

    return undefined === parentIsPure ? PURITY_RELATIVE : parentIsPure;
  }

  function findConstantAndWatchExpressions(ast, $filter, parentIsPure) {
    var allConstants;
    var argsToWatch;
    var isStatelessFilter;
    var astIsPure = ast.isPure = isPure(ast, parentIsPure);

    switch (ast.type) {
      case AST.Program:
        allConstants = true;
        forEach(ast.body, function (expr) {
          findConstantAndWatchExpressions(expr.expression, $filter, astIsPure);
          allConstants = allConstants && expr.expression.constant;
        });
        ast.constant = allConstants;
        break;

      case AST.Literal:
        ast.constant = true;
        ast.toWatch = [];
        break;

      case AST.UnaryExpression:
        findConstantAndWatchExpressions(ast.argument, $filter, astIsPure);
        ast.constant = ast.argument.constant;
        ast.toWatch = ast.argument.toWatch;
        break;

      case AST.BinaryExpression:
        findConstantAndWatchExpressions(ast.left, $filter, astIsPure);
        findConstantAndWatchExpressions(ast.right, $filter, astIsPure);
        ast.constant = ast.left.constant && ast.right.constant;
        ast.toWatch = ast.left.toWatch.concat(ast.right.toWatch);
        break;

      case AST.LogicalExpression:
        findConstantAndWatchExpressions(ast.left, $filter, astIsPure);
        findConstantAndWatchExpressions(ast.right, $filter, astIsPure);
        ast.constant = ast.left.constant && ast.right.constant;
        ast.toWatch = ast.constant ? [] : [ast];
        break;

      case AST.ConditionalExpression:
        findConstantAndWatchExpressions(ast.test, $filter, astIsPure);
        findConstantAndWatchExpressions(ast.alternate, $filter, astIsPure);
        findConstantAndWatchExpressions(ast.consequent, $filter, astIsPure);
        ast.constant = ast.test.constant && ast.alternate.constant && ast.consequent.constant;
        ast.toWatch = ast.constant ? [] : [ast];
        break;

      case AST.Identifier:
        ast.constant = false;
        ast.toWatch = [ast];
        break;

      case AST.MemberExpression:
        findConstantAndWatchExpressions(ast.object, $filter, astIsPure);

        if (ast.computed) {
          findConstantAndWatchExpressions(ast.property, $filter, astIsPure);
        }

        ast.constant = ast.object.constant && (!ast.computed || ast.property.constant);
        ast.toWatch = ast.constant ? [] : [ast];
        break;

      case AST.CallExpression:
        isStatelessFilter = ast.filter ? isStateless($filter, ast.callee.name) : false;
        allConstants = isStatelessFilter;
        argsToWatch = [];
        forEach(ast.arguments, function (expr) {
          findConstantAndWatchExpressions(expr, $filter, astIsPure);
          allConstants = allConstants && expr.constant;
          argsToWatch.push.apply(argsToWatch, expr.toWatch);
        });
        ast.constant = allConstants;
        ast.toWatch = isStatelessFilter ? argsToWatch : [ast];
        break;

      case AST.AssignmentExpression:
        findConstantAndWatchExpressions(ast.left, $filter, astIsPure);
        findConstantAndWatchExpressions(ast.right, $filter, astIsPure);
        ast.constant = ast.left.constant && ast.right.constant;
        ast.toWatch = [ast];
        break;

      case AST.ArrayExpression:
        allConstants = true;
        argsToWatch = [];
        forEach(ast.elements, function (expr) {
          findConstantAndWatchExpressions(expr, $filter, astIsPure);
          allConstants = allConstants && expr.constant;
          argsToWatch.push.apply(argsToWatch, expr.toWatch);
        });
        ast.constant = allConstants;
        ast.toWatch = argsToWatch;
        break;

      case AST.ObjectExpression:
        allConstants = true;
        argsToWatch = [];
        forEach(ast.properties, function (property) {
          findConstantAndWatchExpressions(property.value, $filter, astIsPure);
          allConstants = allConstants && property.value.constant;
          argsToWatch.push.apply(argsToWatch, property.value.toWatch);

          if (property.computed) {
            findConstantAndWatchExpressions(property.key, $filter, false);
            allConstants = allConstants && property.key.constant;
            argsToWatch.push.apply(argsToWatch, property.key.toWatch);
          }
        });
        ast.constant = allConstants;
        ast.toWatch = argsToWatch;
        break;

      case AST.ThisExpression:
        ast.constant = false;
        ast.toWatch = [];
        break;

      case AST.LocalsExpression:
        ast.constant = false;
        ast.toWatch = [];
        break;
    }
  }

  function getInputs(body) {
    if (body.length !== 1) return;
    var lastExpression = body[0].expression;
    var candidate = lastExpression.toWatch;
    if (candidate.length !== 1) return candidate;
    return candidate[0] !== lastExpression ? candidate : undefined;
  }

  function isAssignable(ast) {
    return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
  }

  function assignableAST(ast) {
    if (ast.body.length === 1 && isAssignable(ast.body[0].expression)) {
      return {
        type: AST.AssignmentExpression,
        left: ast.body[0].expression,
        right: {
          type: AST.NGValueParameter
        },
        operator: '='
      };
    }
  }

  function isLiteral(ast) {
    return ast.body.length === 0 || ast.body.length === 1 && (ast.body[0].expression.type === AST.Literal || ast.body[0].expression.type === AST.ArrayExpression || ast.body[0].expression.type === AST.ObjectExpression);
  }

  function isConstant(ast) {
    return ast.constant;
  }

  function ASTCompiler($filter) {
    this.$filter = $filter;
  }

  ASTCompiler.prototype = {
    compile: function (ast) {
      var self = this;
      this.state = {
        nextId: 0,
        filters: {},
        fn: {
          vars: [],
          body: [],
          own: {}
        },
        assign: {
          vars: [],
          body: [],
          own: {}
        },
        inputs: []
      };
      findConstantAndWatchExpressions(ast, self.$filter);
      var extra = '';
      var assignable;
      this.stage = 'assign';

      if (assignable = assignableAST(ast)) {
        this.state.computing = 'assign';
        var result = this.nextId();
        this.recurse(assignable, result);
        this.return_(result);
        extra = 'fn.assign=' + this.generateFunction('assign', 's,v,l');
      }

      var toWatch = getInputs(ast.body);
      self.stage = 'inputs';
      forEach(toWatch, function (watch, key) {
        var fnKey = 'fn' + key;
        self.state[fnKey] = {
          vars: [],
          body: [],
          own: {}
        };
        self.state.computing = fnKey;
        var intoId = self.nextId();
        self.recurse(watch, intoId);
        self.return_(intoId);
        self.state.inputs.push({
          name: fnKey,
          isPure: watch.isPure
        });
        watch.watchId = key;
      });
      this.state.computing = 'fn';
      this.stage = 'main';
      this.recurse(ast);
      var fnString = '"' + this.USE + ' ' + this.STRICT + '";\n' + this.filterPrefix() + 'var fn=' + this.generateFunction('fn', 's,l,a,i') + extra + this.watchFns() + 'return fn;';
      var fn = new Function('$filter', 'getStringValue', 'ifDefined', 'plus', fnString)(this.$filter, getStringValue, ifDefined, plusFn);
      this.state = this.stage = undefined;
      return fn;
    },
    USE: 'use',
    STRICT: 'strict',
    watchFns: function () {
      var result = [];
      var inputs = this.state.inputs;
      var self = this;
      forEach(inputs, function (input) {
        result.push('var ' + input.name + '=' + self.generateFunction(input.name, 's'));

        if (input.isPure) {
          result.push(input.name, '.isPure=' + JSON.stringify(input.isPure) + ';');
        }
      });

      if (inputs.length) {
        result.push('fn.inputs=[' + inputs.map(function (i) {
          return i.name;
        }).join(',') + '];');
      }

      return result.join('');
    },
    generateFunction: function (name, params) {
      return 'function(' + params + '){' + this.varsPrefix(name) + this.body(name) + '};';
    },
    filterPrefix: function () {
      var parts = [];
      var self = this;
      forEach(this.state.filters, function (id, filter) {
        parts.push(id + '=$filter(' + self.escape(filter) + ')');
      });
      if (parts.length) return 'var ' + parts.join(',') + ';';
      return '';
    },
    varsPrefix: function (section) {
      return this.state[section].vars.length ? 'var ' + this.state[section].vars.join(',') + ';' : '';
    },
    body: function (section) {
      return this.state[section].body.join('');
    },
    recurse: function (ast, intoId, nameId, recursionFn, create, skipWatchIdCheck) {
      var left,
          right,
          self = this,
          args,
          expression,
          computed;
      recursionFn = recursionFn || noop;

      if (!skipWatchIdCheck && isDefined(ast.watchId)) {
        intoId = intoId || this.nextId();
        this.if_('i', this.lazyAssign(intoId, this.computedMember('i', ast.watchId)), this.lazyRecurse(ast, intoId, nameId, recursionFn, create, true));
        return;
      }

      switch (ast.type) {
        case AST.Program:
          forEach(ast.body, function (expression, pos) {
            self.recurse(expression.expression, undefined, undefined, function (expr) {
              right = expr;
            });

            if (pos !== ast.body.length - 1) {
              self.current().body.push(right, ';');
            } else {
              self.return_(right);
            }
          });
          break;

        case AST.Literal:
          expression = this.escape(ast.value);
          this.assign(intoId, expression);
          recursionFn(intoId || expression);
          break;

        case AST.UnaryExpression:
          this.recurse(ast.argument, undefined, undefined, function (expr) {
            right = expr;
          });
          expression = ast.operator + '(' + this.ifDefined(right, 0) + ')';
          this.assign(intoId, expression);
          recursionFn(expression);
          break;

        case AST.BinaryExpression:
          this.recurse(ast.left, undefined, undefined, function (expr) {
            left = expr;
          });
          this.recurse(ast.right, undefined, undefined, function (expr) {
            right = expr;
          });

          if (ast.operator === '+') {
            expression = this.plus(left, right);
          } else if (ast.operator === '-') {
            expression = this.ifDefined(left, 0) + ast.operator + this.ifDefined(right, 0);
          } else {
            expression = '(' + left + ')' + ast.operator + '(' + right + ')';
          }

          this.assign(intoId, expression);
          recursionFn(expression);
          break;

        case AST.LogicalExpression:
          intoId = intoId || this.nextId();
          self.recurse(ast.left, intoId);
          self.if_(ast.operator === '&&' ? intoId : self.not(intoId), self.lazyRecurse(ast.right, intoId));
          recursionFn(intoId);
          break;

        case AST.ConditionalExpression:
          intoId = intoId || this.nextId();
          self.recurse(ast.test, intoId);
          self.if_(intoId, self.lazyRecurse(ast.alternate, intoId), self.lazyRecurse(ast.consequent, intoId));
          recursionFn(intoId);
          break;

        case AST.Identifier:
          intoId = intoId || this.nextId();

          if (nameId) {
            nameId.context = self.stage === 'inputs' ? 's' : this.assign(this.nextId(), this.getHasOwnProperty('l', ast.name) + '?l:s');
            nameId.computed = false;
            nameId.name = ast.name;
          }

          self.if_(self.stage === 'inputs' || self.not(self.getHasOwnProperty('l', ast.name)), function () {
            self.if_(self.stage === 'inputs' || 's', function () {
              if (create && create !== 1) {
                self.if_(self.isNull(self.nonComputedMember('s', ast.name)), self.lazyAssign(self.nonComputedMember('s', ast.name), '{}'));
              }

              self.assign(intoId, self.nonComputedMember('s', ast.name));
            });
          }, intoId && self.lazyAssign(intoId, self.nonComputedMember('l', ast.name)));
          recursionFn(intoId);
          break;

        case AST.MemberExpression:
          left = nameId && (nameId.context = this.nextId()) || this.nextId();
          intoId = intoId || this.nextId();
          self.recurse(ast.object, left, undefined, function () {
            self.if_(self.notNull(left), function () {
              if (ast.computed) {
                right = self.nextId();
                self.recurse(ast.property, right);
                self.getStringValue(right);

                if (create && create !== 1) {
                  self.if_(self.not(self.computedMember(left, right)), self.lazyAssign(self.computedMember(left, right), '{}'));
                }

                expression = self.computedMember(left, right);
                self.assign(intoId, expression);

                if (nameId) {
                  nameId.computed = true;
                  nameId.name = right;
                }
              } else {
                if (create && create !== 1) {
                  self.if_(self.isNull(self.nonComputedMember(left, ast.property.name)), self.lazyAssign(self.nonComputedMember(left, ast.property.name), '{}'));
                }

                expression = self.nonComputedMember(left, ast.property.name);
                self.assign(intoId, expression);

                if (nameId) {
                  nameId.computed = false;
                  nameId.name = ast.property.name;
                }
              }
            }, function () {
              self.assign(intoId, 'undefined');
            });
            recursionFn(intoId);
          }, !!create);
          break;

        case AST.CallExpression:
          intoId = intoId || this.nextId();

          if (ast.filter) {
            right = self.filter(ast.callee.name);
            args = [];
            forEach(ast.arguments, function (expr) {
              var argument = self.nextId();
              self.recurse(expr, argument);
              args.push(argument);
            });
            expression = right + '(' + args.join(',') + ')';
            self.assign(intoId, expression);
            recursionFn(intoId);
          } else {
            right = self.nextId();
            left = {};
            args = [];
            self.recurse(ast.callee, right, left, function () {
              self.if_(self.notNull(right), function () {
                forEach(ast.arguments, function (expr) {
                  self.recurse(expr, ast.constant ? undefined : self.nextId(), undefined, function (argument) {
                    args.push(argument);
                  });
                });

                if (left.name) {
                  expression = self.member(left.context, left.name, left.computed) + '(' + args.join(',') + ')';
                } else {
                  expression = right + '(' + args.join(',') + ')';
                }

                self.assign(intoId, expression);
              }, function () {
                self.assign(intoId, 'undefined');
              });
              recursionFn(intoId);
            });
          }

          break;

        case AST.AssignmentExpression:
          right = this.nextId();
          left = {};
          this.recurse(ast.left, undefined, left, function () {
            self.if_(self.notNull(left.context), function () {
              self.recurse(ast.right, right);
              expression = self.member(left.context, left.name, left.computed) + ast.operator + right;
              self.assign(intoId, expression);
              recursionFn(intoId || expression);
            });
          }, 1);
          break;

        case AST.ArrayExpression:
          args = [];
          forEach(ast.elements, function (expr) {
            self.recurse(expr, ast.constant ? undefined : self.nextId(), undefined, function (argument) {
              args.push(argument);
            });
          });
          expression = '[' + args.join(',') + ']';
          this.assign(intoId, expression);
          recursionFn(intoId || expression);
          break;

        case AST.ObjectExpression:
          args = [];
          computed = false;
          forEach(ast.properties, function (property) {
            if (property.computed) {
              computed = true;
            }
          });

          if (computed) {
            intoId = intoId || this.nextId();
            this.assign(intoId, '{}');
            forEach(ast.properties, function (property) {
              if (property.computed) {
                left = self.nextId();
                self.recurse(property.key, left);
              } else {
                left = property.key.type === AST.Identifier ? property.key.name : '' + property.key.value;
              }

              right = self.nextId();
              self.recurse(property.value, right);
              self.assign(self.member(intoId, left, property.computed), right);
            });
          } else {
            forEach(ast.properties, function (property) {
              self.recurse(property.value, ast.constant ? undefined : self.nextId(), undefined, function (expr) {
                args.push(self.escape(property.key.type === AST.Identifier ? property.key.name : '' + property.key.value) + ':' + expr);
              });
            });
            expression = '{' + args.join(',') + '}';
            this.assign(intoId, expression);
          }

          recursionFn(intoId || expression);
          break;

        case AST.ThisExpression:
          this.assign(intoId, 's');
          recursionFn(intoId || 's');
          break;

        case AST.LocalsExpression:
          this.assign(intoId, 'l');
          recursionFn(intoId || 'l');
          break;

        case AST.NGValueParameter:
          this.assign(intoId, 'v');
          recursionFn(intoId || 'v');
          break;
      }
    },
    getHasOwnProperty: function (element, property) {
      var key = element + '.' + property;
      var own = this.current().own;

      if (!own.hasOwnProperty(key)) {
        own[key] = this.nextId(false, element + '&&(' + this.escape(property) + ' in ' + element + ')');
      }

      return own[key];
    },
    assign: function (id, value) {
      if (!id) return;
      this.current().body.push(id, '=', value, ';');
      return id;
    },
    filter: function (filterName) {
      if (!this.state.filters.hasOwnProperty(filterName)) {
        this.state.filters[filterName] = this.nextId(true);
      }

      return this.state.filters[filterName];
    },
    ifDefined: function (id, defaultValue) {
      return 'ifDefined(' + id + ',' + this.escape(defaultValue) + ')';
    },
    plus: function (left, right) {
      return 'plus(' + left + ',' + right + ')';
    },
    return_: function (id) {
      this.current().body.push('return ', id, ';');
    },
    if_: function (test, alternate, consequent) {
      if (test === true) {
        alternate();
      } else {
        var body = this.current().body;
        body.push('if(', test, '){');
        alternate();
        body.push('}');

        if (consequent) {
          body.push('else{');
          consequent();
          body.push('}');
        }
      }
    },
    not: function (expression) {
      return '!(' + expression + ')';
    },
    isNull: function (expression) {
      return expression + '==null';
    },
    notNull: function (expression) {
      return expression + '!=null';
    },
    nonComputedMember: function (left, right) {
      var SAFE_IDENTIFIER = /^[$_a-zA-Z][$_a-zA-Z0-9]*$/;
      var UNSAFE_CHARACTERS = /[^$_a-zA-Z0-9]/g;

      if (SAFE_IDENTIFIER.test(right)) {
        return left + '.' + right;
      } else {
        return left + '["' + right.replace(UNSAFE_CHARACTERS, this.stringEscapeFn) + '"]';
      }
    },
    computedMember: function (left, right) {
      return left + '[' + right + ']';
    },
    member: function (left, right, computed) {
      if (computed) return this.computedMember(left, right);
      return this.nonComputedMember(left, right);
    },
    getStringValue: function (item) {
      this.assign(item, 'getStringValue(' + item + ')');
    },
    lazyRecurse: function (ast, intoId, nameId, recursionFn, create, skipWatchIdCheck) {
      var self = this;
      return function () {
        self.recurse(ast, intoId, nameId, recursionFn, create, skipWatchIdCheck);
      };
    },
    lazyAssign: function (id, value) {
      var self = this;
      return function () {
        self.assign(id, value);
      };
    },
    stringEscapeRegex: /[^ a-zA-Z0-9]/g,
    stringEscapeFn: function (c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    },
    escape: function (value) {
      if (isString(value)) return '\'' + value.replace(this.stringEscapeRegex, this.stringEscapeFn) + '\'';
      if (isNumber(value)) return value.toString();
      if (value === true) return 'true';
      if (value === false) return 'false';
      if (value === null) return 'null';
      if (typeof value === 'undefined') return 'undefined';
      throw $parseMinErr('esc', 'IMPOSSIBLE');
    },
    nextId: function (skip, init) {
      var id = 'v' + this.state.nextId++;

      if (!skip) {
        this.current().vars.push(id + (init ? '=' + init : ''));
      }

      return id;
    },
    current: function () {
      return this.state[this.state.computing];
    }
  };

  function ASTInterpreter($filter) {
    this.$filter = $filter;
  }

  ASTInterpreter.prototype = {
    compile: function (ast) {
      var self = this;
      findConstantAndWatchExpressions(ast, self.$filter);
      var assignable;
      var assign;

      if (assignable = assignableAST(ast)) {
        assign = this.recurse(assignable);
      }

      var toWatch = getInputs(ast.body);
      var inputs;

      if (toWatch) {
        inputs = [];
        forEach(toWatch, function (watch, key) {
          var input = self.recurse(watch);
          input.isPure = watch.isPure;
          watch.input = input;
          inputs.push(input);
          watch.watchId = key;
        });
      }

      var expressions = [];
      forEach(ast.body, function (expression) {
        expressions.push(self.recurse(expression.expression));
      });
      var fn = ast.body.length === 0 ? noop : ast.body.length === 1 ? expressions[0] : function (scope, locals) {
        var lastValue;
        forEach(expressions, function (exp) {
          lastValue = exp(scope, locals);
        });
        return lastValue;
      };

      if (assign) {
        fn.assign = function (scope, value, locals) {
          return assign(scope, locals, value);
        };
      }

      if (inputs) {
        fn.inputs = inputs;
      }

      return fn;
    },
    recurse: function (ast, context, create) {
      var left,
          right,
          self = this,
          args;

      if (ast.input) {
        return this.inputs(ast.input, ast.watchId);
      }

      switch (ast.type) {
        case AST.Literal:
          return this.value(ast.value, context);

        case AST.UnaryExpression:
          right = this.recurse(ast.argument);
          return this['unary' + ast.operator](right, context);

        case AST.BinaryExpression:
          left = this.recurse(ast.left);
          right = this.recurse(ast.right);
          return this['binary' + ast.operator](left, right, context);

        case AST.LogicalExpression:
          left = this.recurse(ast.left);
          right = this.recurse(ast.right);
          return this['binary' + ast.operator](left, right, context);

        case AST.ConditionalExpression:
          return this['ternary?:'](this.recurse(ast.test), this.recurse(ast.alternate), this.recurse(ast.consequent), context);

        case AST.Identifier:
          return self.identifier(ast.name, context, create);

        case AST.MemberExpression:
          left = this.recurse(ast.object, false, !!create);

          if (!ast.computed) {
            right = ast.property.name;
          }

          if (ast.computed) right = this.recurse(ast.property);
          return ast.computed ? this.computedMember(left, right, context, create) : this.nonComputedMember(left, right, context, create);

        case AST.CallExpression:
          args = [];
          forEach(ast.arguments, function (expr) {
            args.push(self.recurse(expr));
          });
          if (ast.filter) right = this.$filter(ast.callee.name);
          if (!ast.filter) right = this.recurse(ast.callee, true);
          return ast.filter ? function (scope, locals, assign, inputs) {
            var values = [];

            for (var i = 0; i < args.length; ++i) {
              values.push(args[i](scope, locals, assign, inputs));
            }

            var value = right.apply(undefined, values, inputs);
            return context ? {
              context: undefined,
              name: undefined,
              value: value
            } : value;
          } : function (scope, locals, assign, inputs) {
            var rhs = right(scope, locals, assign, inputs);
            var value;

            if (rhs.value != null) {
              var values = [];

              for (var i = 0; i < args.length; ++i) {
                values.push(args[i](scope, locals, assign, inputs));
              }

              value = rhs.value.apply(rhs.context, values);
            }

            return context ? {
              value: value
            } : value;
          };

        case AST.AssignmentExpression:
          left = this.recurse(ast.left, true, 1);
          right = this.recurse(ast.right);
          return function (scope, locals, assign, inputs) {
            var lhs = left(scope, locals, assign, inputs);
            var rhs = right(scope, locals, assign, inputs);
            lhs.context[lhs.name] = rhs;
            return context ? {
              value: rhs
            } : rhs;
          };

        case AST.ArrayExpression:
          args = [];
          forEach(ast.elements, function (expr) {
            args.push(self.recurse(expr));
          });
          return function (scope, locals, assign, inputs) {
            var value = [];

            for (var i = 0; i < args.length; ++i) {
              value.push(args[i](scope, locals, assign, inputs));
            }

            return context ? {
              value: value
            } : value;
          };

        case AST.ObjectExpression:
          args = [];
          forEach(ast.properties, function (property) {
            if (property.computed) {
              args.push({
                key: self.recurse(property.key),
                computed: true,
                value: self.recurse(property.value)
              });
            } else {
              args.push({
                key: property.key.type === AST.Identifier ? property.key.name : '' + property.key.value,
                computed: false,
                value: self.recurse(property.value)
              });
            }
          });
          return function (scope, locals, assign, inputs) {
            var value = {};

            for (var i = 0; i < args.length; ++i) {
              if (args[i].computed) {
                value[args[i].key(scope, locals, assign, inputs)] = args[i].value(scope, locals, assign, inputs);
              } else {
                value[args[i].key] = args[i].value(scope, locals, assign, inputs);
              }
            }

            return context ? {
              value: value
            } : value;
          };

        case AST.ThisExpression:
          return function (scope) {
            return context ? {
              value: scope
            } : scope;
          };

        case AST.LocalsExpression:
          return function (scope, locals) {
            return context ? {
              value: locals
            } : locals;
          };

        case AST.NGValueParameter:
          return function (scope, locals, assign) {
            return context ? {
              value: assign
            } : assign;
          };
      }
    },
    'unary+': function (argument, context) {
      return function (scope, locals, assign, inputs) {
        var arg = argument(scope, locals, assign, inputs);

        if (isDefined(arg)) {
          arg = +arg;
        } else {
          arg = 0;
        }

        return context ? {
          value: arg
        } : arg;
      };
    },
    'unary-': function (argument, context) {
      return function (scope, locals, assign, inputs) {
        var arg = argument(scope, locals, assign, inputs);

        if (isDefined(arg)) {
          arg = -arg;
        } else {
          arg = -0;
        }

        return context ? {
          value: arg
        } : arg;
      };
    },
    'unary!': function (argument, context) {
      return function (scope, locals, assign, inputs) {
        var arg = !argument(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary+': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var lhs = left(scope, locals, assign, inputs);
        var rhs = right(scope, locals, assign, inputs);
        var arg = plusFn(lhs, rhs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary-': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var lhs = left(scope, locals, assign, inputs);
        var rhs = right(scope, locals, assign, inputs);
        var arg = (isDefined(lhs) ? lhs : 0) - (isDefined(rhs) ? rhs : 0);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary*': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) * right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary/': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) / right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary%': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) % right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary===': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) === right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary!==': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) !== right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary==': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) == right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary!=': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) != right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary<': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) < right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary>': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) > right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary<=': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) <= right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary>=': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) >= right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary&&': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) && right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'binary||': function (left, right, context) {
      return function (scope, locals, assign, inputs) {
        var arg = left(scope, locals, assign, inputs) || right(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    'ternary?:': function (test, alternate, consequent, context) {
      return function (scope, locals, assign, inputs) {
        var arg = test(scope, locals, assign, inputs) ? alternate(scope, locals, assign, inputs) : consequent(scope, locals, assign, inputs);
        return context ? {
          value: arg
        } : arg;
      };
    },
    value: function (value, context) {
      return function () {
        return context ? {
          context: undefined,
          name: undefined,
          value: value
        } : value;
      };
    },
    identifier: function (name, context, create) {
      return function (scope, locals, assign, inputs) {
        var base = locals && name in locals ? locals : scope;

        if (create && create !== 1 && base && base[name] == null) {
          base[name] = {};
        }

        var value = base ? base[name] : undefined;

        if (context) {
          return {
            context: base,
            name: name,
            value: value
          };
        } else {
          return value;
        }
      };
    },
    computedMember: function (left, right, context, create) {
      return function (scope, locals, assign, inputs) {
        var lhs = left(scope, locals, assign, inputs);
        var rhs;
        var value;

        if (lhs != null) {
          rhs = right(scope, locals, assign, inputs);
          rhs = getStringValue(rhs);

          if (create && create !== 1) {
            if (lhs && !lhs[rhs]) {
              lhs[rhs] = {};
            }
          }

          value = lhs[rhs];
        }

        if (context) {
          return {
            context: lhs,
            name: rhs,
            value: value
          };
        } else {
          return value;
        }
      };
    },
    nonComputedMember: function (left, right, context, create) {
      return function (scope, locals, assign, inputs) {
        var lhs = left(scope, locals, assign, inputs);

        if (create && create !== 1) {
          if (lhs && lhs[right] == null) {
            lhs[right] = {};
          }
        }

        var value = lhs != null ? lhs[right] : undefined;

        if (context) {
          return {
            context: lhs,
            name: right,
            value: value
          };
        } else {
          return value;
        }
      };
    },
    inputs: function (input, watchId) {
      return function (scope, value, locals, inputs) {
        if (inputs) return inputs[watchId];
        return input(scope, value, locals);
      };
    }
  };

  function Parser(lexer, $filter, options) {
    this.ast = new AST(lexer, options);
    this.astCompiler = options.csp ? new ASTInterpreter($filter) : new ASTCompiler($filter);
  }

  Parser.prototype = {
    constructor: Parser,
    parse: function (text) {
      var ast = this.getAst(text);
      var fn = this.astCompiler.compile(ast.ast);
      fn.literal = isLiteral(ast.ast);
      fn.constant = isConstant(ast.ast);
      fn.oneTime = ast.oneTime;
      return fn;
    },
    getAst: function (exp) {
      var oneTime = false;
      exp = exp.trim();

      if (exp.charAt(0) === ':' && exp.charAt(1) === ':') {
        oneTime = true;
        exp = exp.substring(2);
      }

      return {
        ast: this.ast.ast(exp),
        oneTime: oneTime
      };
    }
  };

  function getValueOf(value) {
    return isFunction(value.valueOf) ? value.valueOf() : objectValueOf.call(value);
  }

  function $ParseProvider() {
    var cache = createMap();
    var literals = {
      'true': true,
      'false': false,
      'null': null,
      'undefined': undefined
    };
    var identStart, identContinue;

    this.addLiteral = function (literalName, literalValue) {
      literals[literalName] = literalValue;
    };

    this.setIdentifierFns = function (identifierStart, identifierContinue) {
      identStart = identifierStart;
      identContinue = identifierContinue;
      return this;
    };

    this.$get = ['$filter', function ($filter) {
      var noUnsafeEval = csp().noUnsafeEval;
      var $parseOptions = {
        csp: noUnsafeEval,
        literals: copy(literals),
        isIdentifierStart: isFunction(identStart) && identStart,
        isIdentifierContinue: isFunction(identContinue) && identContinue
      };
      $parse.$$getAst = $$getAst;
      return $parse;

      function $parse(exp, interceptorFn) {
        var parsedExpression, cacheKey;

        switch (typeof exp) {
          case 'string':
            exp = exp.trim();
            cacheKey = exp;
            parsedExpression = cache[cacheKey];

            if (!parsedExpression) {
              var lexer = new Lexer($parseOptions);
              var parser = new Parser(lexer, $filter, $parseOptions);
              parsedExpression = parser.parse(exp);
              cache[cacheKey] = addWatchDelegate(parsedExpression);
            }

            return addInterceptor(parsedExpression, interceptorFn);

          case 'function':
            return addInterceptor(exp, interceptorFn);

          default:
            return addInterceptor(noop, interceptorFn);
        }
      }

      function $$getAst(exp) {
        var lexer = new Lexer($parseOptions);
        var parser = new Parser(lexer, $filter, $parseOptions);
        return parser.getAst(exp).ast;
      }

      function expressionInputDirtyCheck(newValue, oldValueOfValue, compareObjectIdentity) {
        if (newValue == null || oldValueOfValue == null) {
          return newValue === oldValueOfValue;
        }

        if (typeof newValue === 'object') {
          newValue = getValueOf(newValue);

          if (typeof newValue === 'object' && !compareObjectIdentity) {
            return false;
          }
        }

        return newValue === oldValueOfValue || newValue !== newValue && oldValueOfValue !== oldValueOfValue;
      }

      function inputsWatchDelegate(scope, listener, objectEquality, parsedExpression, prettyPrintExpression) {
        var inputExpressions = parsedExpression.inputs;
        var lastResult;

        if (inputExpressions.length === 1) {
          var oldInputValueOf = expressionInputDirtyCheck;
          inputExpressions = inputExpressions[0];
          return scope.$watch(function expressionInputWatch(scope) {
            var newInputValue = inputExpressions(scope);

            if (!expressionInputDirtyCheck(newInputValue, oldInputValueOf, inputExpressions.isPure)) {
              lastResult = parsedExpression(scope, undefined, undefined, [newInputValue]);
              oldInputValueOf = newInputValue && getValueOf(newInputValue);
            }

            return lastResult;
          }, listener, objectEquality, prettyPrintExpression);
        }

        var oldInputValueOfValues = [];
        var oldInputValues = [];

        for (var i = 0, ii = inputExpressions.length; i < ii; i++) {
          oldInputValueOfValues[i] = expressionInputDirtyCheck;
          oldInputValues[i] = null;
        }

        return scope.$watch(function expressionInputsWatch(scope) {
          var changed = false;

          for (var i = 0, ii = inputExpressions.length; i < ii; i++) {
            var newInputValue = inputExpressions[i](scope);

            if (changed || (changed = !expressionInputDirtyCheck(newInputValue, oldInputValueOfValues[i], inputExpressions[i].isPure))) {
              oldInputValues[i] = newInputValue;
              oldInputValueOfValues[i] = newInputValue && getValueOf(newInputValue);
            }
          }

          if (changed) {
            lastResult = parsedExpression(scope, undefined, undefined, oldInputValues);
          }

          return lastResult;
        }, listener, objectEquality, prettyPrintExpression);
      }

      function oneTimeWatchDelegate(scope, listener, objectEquality, parsedExpression, prettyPrintExpression) {
        var isDone = parsedExpression.literal ? isAllDefined : isDefined;
        var unwatch, lastValue;
        var exp = parsedExpression.$$intercepted || parsedExpression;
        var post = parsedExpression.$$interceptor || identity;
        var useInputs = parsedExpression.inputs && !exp.inputs;
        oneTimeWatch.literal = parsedExpression.literal;
        oneTimeWatch.constant = parsedExpression.constant;
        oneTimeWatch.inputs = parsedExpression.inputs;
        addWatchDelegate(oneTimeWatch);
        unwatch = scope.$watch(oneTimeWatch, listener, objectEquality, prettyPrintExpression);
        return unwatch;

        function unwatchIfDone() {
          if (isDone(lastValue)) {
            unwatch();
          }
        }

        function oneTimeWatch(scope, locals, assign, inputs) {
          lastValue = useInputs && inputs ? inputs[0] : exp(scope, locals, assign, inputs);

          if (isDone(lastValue)) {
            scope.$$postDigest(unwatchIfDone);
          }

          return post(lastValue);
        }
      }

      function isAllDefined(value) {
        var allDefined = true;
        forEach(value, function (val) {
          if (!isDefined(val)) allDefined = false;
        });
        return allDefined;
      }

      function constantWatchDelegate(scope, listener, objectEquality, parsedExpression) {
        var unwatch = scope.$watch(function constantWatch(scope) {
          unwatch();
          return parsedExpression(scope);
        }, listener, objectEquality);
        return unwatch;
      }

      function addWatchDelegate(parsedExpression) {
        if (parsedExpression.constant) {
          parsedExpression.$$watchDelegate = constantWatchDelegate;
        } else if (parsedExpression.oneTime) {
          parsedExpression.$$watchDelegate = oneTimeWatchDelegate;
        } else if (parsedExpression.inputs) {
          parsedExpression.$$watchDelegate = inputsWatchDelegate;
        }

        return parsedExpression;
      }

      function chainInterceptors(first, second) {
        function chainedInterceptor(value) {
          return second(first(value));
        }

        chainedInterceptor.$stateful = first.$stateful || second.$stateful;
        chainedInterceptor.$$pure = first.$$pure && second.$$pure;
        return chainedInterceptor;
      }

      function addInterceptor(parsedExpression, interceptorFn) {
        if (!interceptorFn) return parsedExpression;

        if (parsedExpression.$$interceptor) {
          interceptorFn = chainInterceptors(parsedExpression.$$interceptor, interceptorFn);
          parsedExpression = parsedExpression.$$intercepted;
        }

        var useInputs = false;

        var fn = function interceptedExpression(scope, locals, assign, inputs) {
          var value = useInputs && inputs ? inputs[0] : parsedExpression(scope, locals, assign, inputs);
          return interceptorFn(value);
        };

        fn.$$intercepted = parsedExpression;
        fn.$$interceptor = interceptorFn;
        fn.literal = parsedExpression.literal;
        fn.oneTime = parsedExpression.oneTime;
        fn.constant = parsedExpression.constant;

        if (!interceptorFn.$stateful) {
          useInputs = !parsedExpression.inputs;
          fn.inputs = parsedExpression.inputs ? parsedExpression.inputs : [parsedExpression];

          if (!interceptorFn.$$pure) {
            fn.inputs = fn.inputs.map(function (e) {
              if (e.isPure === PURITY_RELATIVE) {
                return function depurifier(s) {
                  return e(s);
                };
              }

              return e;
            });
          }
        }

        return addWatchDelegate(fn);
      }
    }];
  }

  function $QProvider() {
    var errorOnUnhandledRejections = true;
    this.$get = ['$rootScope', '$exceptionHandler', function ($rootScope, $exceptionHandler) {
      return qFactory(function (callback) {
        $rootScope.$evalAsync(callback);
      }, $exceptionHandler, errorOnUnhandledRejections);
    }];

    this.errorOnUnhandledRejections = function (value) {
      if (isDefined(value)) {
        errorOnUnhandledRejections = value;
        return this;
      } else {
        return errorOnUnhandledRejections;
      }
    };
  }

  function $$QProvider() {
    var errorOnUnhandledRejections = true;
    this.$get = ['$browser', '$exceptionHandler', function ($browser, $exceptionHandler) {
      return qFactory(function (callback) {
        $browser.defer(callback);
      }, $exceptionHandler, errorOnUnhandledRejections);
    }];

    this.errorOnUnhandledRejections = function (value) {
      if (isDefined(value)) {
        errorOnUnhandledRejections = value;
        return this;
      } else {
        return errorOnUnhandledRejections;
      }
    };
  }

  function qFactory(nextTick, exceptionHandler, errorOnUnhandledRejections) {
    var $qMinErr = minErr('$q', TypeError);
    var queueSize = 0;
    var checkQueue = [];

    function defer() {
      return new Deferred();
    }

    function Deferred() {
      var promise = this.promise = new Promise();

      this.resolve = function (val) {
        resolvePromise(promise, val);
      };

      this.reject = function (reason) {
        rejectPromise(promise, reason);
      };

      this.notify = function (progress) {
        notifyPromise(promise, progress);
      };
    }

    function Promise() {
      this.$$state = {
        status: 0
      };
    }

    extend(Promise.prototype, {
      then: function (onFulfilled, onRejected, progressBack) {
        if (isUndefined(onFulfilled) && isUndefined(onRejected) && isUndefined(progressBack)) {
          return this;
        }

        var result = new Promise();
        this.$$state.pending = this.$$state.pending || [];
        this.$$state.pending.push([result, onFulfilled, onRejected, progressBack]);
        if (this.$$state.status > 0) scheduleProcessQueue(this.$$state);
        return result;
      },
      'catch': function (callback) {
        return this.then(null, callback);
      },
      'finally': function (callback, progressBack) {
        return this.then(function (value) {
          return handleCallback(value, resolve, callback);
        }, function (error) {
          return handleCallback(error, reject, callback);
        }, progressBack);
      }
    });

    function processQueue(state) {
      var fn, promise, pending;
      pending = state.pending;
      state.processScheduled = false;
      state.pending = undefined;

      try {
        for (var i = 0, ii = pending.length; i < ii; ++i) {
          markQStateExceptionHandled(state);
          promise = pending[i][0];
          fn = pending[i][state.status];

          try {
            if (isFunction(fn)) {
              resolvePromise(promise, fn(state.value));
            } else if (state.status === 1) {
              resolvePromise(promise, state.value);
            } else {
              rejectPromise(promise, state.value);
            }
          } catch (e) {
            rejectPromise(promise, e);

            if (e && e.$$passToExceptionHandler === true) {
              exceptionHandler(e);
            }
          }
        }
      } finally {
        --queueSize;

        if (errorOnUnhandledRejections && queueSize === 0) {
          nextTick(processChecks);
        }
      }
    }

    function processChecks() {
      while (!queueSize && checkQueue.length) {
        var toCheck = checkQueue.shift();

        if (!isStateExceptionHandled(toCheck)) {
          markQStateExceptionHandled(toCheck);
          var errorMessage = 'Possibly unhandled rejection: ' + toDebugString(toCheck.value);

          if (isError(toCheck.value)) {
            exceptionHandler(toCheck.value, errorMessage);
          } else {
            exceptionHandler(errorMessage);
          }
        }
      }
    }

    function scheduleProcessQueue(state) {
      if (errorOnUnhandledRejections && !state.pending && state.status === 2 && !isStateExceptionHandled(state)) {
        if (queueSize === 0 && checkQueue.length === 0) {
          nextTick(processChecks);
        }

        checkQueue.push(state);
      }

      if (state.processScheduled || !state.pending) return;
      state.processScheduled = true;
      ++queueSize;
      nextTick(function () {
        processQueue(state);
      });
    }

    function resolvePromise(promise, val) {
      if (promise.$$state.status) return;

      if (val === promise) {
        $$reject(promise, $qMinErr('qcycle', 'Expected promise to be resolved with value other than itself \'{0}\'', val));
      } else {
        $$resolve(promise, val);
      }
    }

    function $$resolve(promise, val) {
      var then;
      var done = false;

      try {
        if (isObject(val) || isFunction(val)) then = val.then;

        if (isFunction(then)) {
          promise.$$state.status = -1;
          then.call(val, doResolve, doReject, doNotify);
        } else {
          promise.$$state.value = val;
          promise.$$state.status = 1;
          scheduleProcessQueue(promise.$$state);
        }
      } catch (e) {
        doReject(e);
      }

      function doResolve(val) {
        if (done) return;
        done = true;
        $$resolve(promise, val);
      }

      function doReject(val) {
        if (done) return;
        done = true;
        $$reject(promise, val);
      }

      function doNotify(progress) {
        notifyPromise(promise, progress);
      }
    }

    function rejectPromise(promise, reason) {
      if (promise.$$state.status) return;
      $$reject(promise, reason);
    }

    function $$reject(promise, reason) {
      promise.$$state.value = reason;
      promise.$$state.status = 2;
      scheduleProcessQueue(promise.$$state);
    }

    function notifyPromise(promise, progress) {
      var callbacks = promise.$$state.pending;

      if (promise.$$state.status <= 0 && callbacks && callbacks.length) {
        nextTick(function () {
          var callback, result;

          for (var i = 0, ii = callbacks.length; i < ii; i++) {
            result = callbacks[i][0];
            callback = callbacks[i][3];

            try {
              notifyPromise(result, isFunction(callback) ? callback(progress) : progress);
            } catch (e) {
              exceptionHandler(e);
            }
          }
        });
      }
    }

    function reject(reason) {
      var result = new Promise();
      rejectPromise(result, reason);
      return result;
    }

    function handleCallback(value, resolver, callback) {
      var callbackOutput = null;

      try {
        if (isFunction(callback)) callbackOutput = callback();
      } catch (e) {
        return reject(e);
      }

      if (isPromiseLike(callbackOutput)) {
        return callbackOutput.then(function () {
          return resolver(value);
        }, reject);
      } else {
        return resolver(value);
      }
    }

    function when(value, callback, errback, progressBack) {
      var result = new Promise();
      resolvePromise(result, value);
      return result.then(callback, errback, progressBack);
    }

    var resolve = when;

    function all(promises) {
      var result = new Promise(),
          counter = 0,
          results = isArray(promises) ? [] : {};
      forEach(promises, function (promise, key) {
        counter++;
        when(promise).then(function (value) {
          results[key] = value;
          if (! --counter) resolvePromise(result, results);
        }, function (reason) {
          rejectPromise(result, reason);
        });
      });

      if (counter === 0) {
        resolvePromise(result, results);
      }

      return result;
    }

    function race(promises) {
      var deferred = defer();
      forEach(promises, function (promise) {
        when(promise).then(deferred.resolve, deferred.reject);
      });
      return deferred.promise;
    }

    function $Q(resolver) {
      if (!isFunction(resolver)) {
        throw $qMinErr('norslvr', 'Expected resolverFn, got \'{0}\'', resolver);
      }

      var promise = new Promise();

      function resolveFn(value) {
        resolvePromise(promise, value);
      }

      function rejectFn(reason) {
        rejectPromise(promise, reason);
      }

      resolver(resolveFn, rejectFn);
      return promise;
    }

    $Q.prototype = Promise.prototype;
    $Q.defer = defer;
    $Q.reject = reject;
    $Q.when = when;
    $Q.resolve = resolve;
    $Q.all = all;
    $Q.race = race;
    return $Q;
  }

  function isStateExceptionHandled(state) {
    return !!state.pur;
  }

  function markQStateExceptionHandled(state) {
    state.pur = true;
  }

  function markQExceptionHandled(q) {
    if (q.$$state) {
      markQStateExceptionHandled(q.$$state);
    }
  }

  function $RootScopeProvider() {
    var TTL = 10;
    var $rootScopeMinErr = minErr('$rootScope');
    var lastDirtyWatch = null;
    var applyAsyncId = null;

    this.digestTtl = function (value) {
      if (arguments.length) {
        TTL = value;
      }

      return TTL;
    };

    function createChildScopeClass(parent) {
      function ChildScope() {
        this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null;
        this.$$listeners = {};
        this.$$listenerCount = {};
        this.$$watchersCount = 0;
        this.$id = nextUid();
        this.$$ChildScope = null;
        this.$$suspended = false;
      }

      ChildScope.prototype = parent;
      return ChildScope;
    }

    this.$get = ['$exceptionHandler', '$parse', '$browser', function ($exceptionHandler, $parse, $browser) {
      function destroyChildScope($event) {
        $event.currentScope.$$destroyed = true;
      }

      function cleanUpScope($scope) {
        if (msie === 9) {
          if ($scope.$$childHead) {
            cleanUpScope($scope.$$childHead);
          }

          if ($scope.$$nextSibling) {
            cleanUpScope($scope.$$nextSibling);
          }
        }

        $scope.$parent = $scope.$$nextSibling = $scope.$$prevSibling = $scope.$$childHead = $scope.$$childTail = $scope.$root = $scope.$$watchers = null;
      }

      function Scope() {
        this.$id = nextUid();
        this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
        this.$root = this;
        this.$$destroyed = false;
        this.$$suspended = false;
        this.$$listeners = {};
        this.$$listenerCount = {};
        this.$$watchersCount = 0;
        this.$$isolateBindings = null;
      }

      Scope.prototype = {
        constructor: Scope,
        $new: function (isolate, parent) {
          var child;
          parent = parent || this;

          if (isolate) {
            child = new Scope();
            child.$root = this.$root;
          } else {
            if (!this.$$ChildScope) {
              this.$$ChildScope = createChildScopeClass(this);
            }

            child = new this.$$ChildScope();
          }

          child.$parent = parent;
          child.$$prevSibling = parent.$$childTail;

          if (parent.$$childHead) {
            parent.$$childTail.$$nextSibling = child;
            parent.$$childTail = child;
          } else {
            parent.$$childHead = parent.$$childTail = child;
          }

          if (isolate || parent !== this) child.$on('$destroy', destroyChildScope);
          return child;
        },
        $watch: function (watchExp, listener, objectEquality, prettyPrintExpression) {
          var get = $parse(watchExp);
          var fn = isFunction(listener) ? listener : noop;

          if (get.$$watchDelegate) {
            return get.$$watchDelegate(this, fn, objectEquality, get, watchExp);
          }

          var scope = this,
              array = scope.$$watchers,
              watcher = {
            fn: fn,
            last: initWatchVal,
            get: get,
            exp: prettyPrintExpression || watchExp,
            eq: !!objectEquality
          };
          lastDirtyWatch = null;

          if (!array) {
            array = scope.$$watchers = [];
            array.$$digestWatchIndex = -1;
          }

          array.unshift(watcher);
          array.$$digestWatchIndex++;
          incrementWatchersCount(this, 1);
          return function deregisterWatch() {
            var index = arrayRemove(array, watcher);

            if (index >= 0) {
              incrementWatchersCount(scope, -1);

              if (index < array.$$digestWatchIndex) {
                array.$$digestWatchIndex--;
              }
            }

            lastDirtyWatch = null;
          };
        },
        $watchGroup: function (watchExpressions, listener) {
          var oldValues = new Array(watchExpressions.length);
          var newValues = new Array(watchExpressions.length);
          var deregisterFns = [];
          var self = this;
          var changeReactionScheduled = false;
          var firstRun = true;

          if (!watchExpressions.length) {
            var shouldCall = true;
            self.$evalAsync(function () {
              if (shouldCall) listener(newValues, newValues, self);
            });
            return function deregisterWatchGroup() {
              shouldCall = false;
            };
          }

          if (watchExpressions.length === 1) {
            return this.$watch(watchExpressions[0], function watchGroupAction(value, oldValue, scope) {
              newValues[0] = value;
              oldValues[0] = oldValue;
              listener(newValues, value === oldValue ? newValues : oldValues, scope);
            });
          }

          forEach(watchExpressions, function (expr, i) {
            var unwatchFn = self.$watch(expr, function watchGroupSubAction(value) {
              newValues[i] = value;

              if (!changeReactionScheduled) {
                changeReactionScheduled = true;
                self.$evalAsync(watchGroupAction);
              }
            });
            deregisterFns.push(unwatchFn);
          });

          function watchGroupAction() {
            changeReactionScheduled = false;

            try {
              if (firstRun) {
                firstRun = false;
                listener(newValues, newValues, self);
              } else {
                listener(newValues, oldValues, self);
              }
            } finally {
              for (var i = 0; i < watchExpressions.length; i++) {
                oldValues[i] = newValues[i];
              }
            }
          }

          return function deregisterWatchGroup() {
            while (deregisterFns.length) {
              deregisterFns.shift()();
            }
          };
        },
        $watchCollection: function (obj, listener) {
          $watchCollectionInterceptor.$$pure = $parse(obj).literal;
          $watchCollectionInterceptor.$stateful = !$watchCollectionInterceptor.$$pure;
          var self = this;
          var newValue;
          var oldValue;
          var veryOldValue;
          var trackVeryOldValue = listener.length > 1;
          var changeDetected = 0;
          var changeDetector = $parse(obj, $watchCollectionInterceptor);
          var internalArray = [];
          var internalObject = {};
          var initRun = true;
          var oldLength = 0;

          function $watchCollectionInterceptor(_value) {
            newValue = _value;
            var newLength, key, bothNaN, newItem, oldItem;
            if (isUndefined(newValue)) return;

            if (!isObject(newValue)) {
              if (oldValue !== newValue) {
                oldValue = newValue;
                changeDetected++;
              }
            } else if (isArrayLike(newValue)) {
              if (oldValue !== internalArray) {
                oldValue = internalArray;
                oldLength = oldValue.length = 0;
                changeDetected++;
              }

              newLength = newValue.length;

              if (oldLength !== newLength) {
                changeDetected++;
                oldValue.length = oldLength = newLength;
              }

              for (var i = 0; i < newLength; i++) {
                oldItem = oldValue[i];
                newItem = newValue[i];
                bothNaN = oldItem !== oldItem && newItem !== newItem;

                if (!bothNaN && oldItem !== newItem) {
                  changeDetected++;
                  oldValue[i] = newItem;
                }
              }
            } else {
              if (oldValue !== internalObject) {
                oldValue = internalObject = {};
                oldLength = 0;
                changeDetected++;
              }

              newLength = 0;

              for (key in newValue) {
                if (hasOwnProperty.call(newValue, key)) {
                  newLength++;
                  newItem = newValue[key];
                  oldItem = oldValue[key];

                  if (key in oldValue) {
                    bothNaN = oldItem !== oldItem && newItem !== newItem;

                    if (!bothNaN && oldItem !== newItem) {
                      changeDetected++;
                      oldValue[key] = newItem;
                    }
                  } else {
                    oldLength++;
                    oldValue[key] = newItem;
                    changeDetected++;
                  }
                }
              }

              if (oldLength > newLength) {
                changeDetected++;

                for (key in oldValue) {
                  if (!hasOwnProperty.call(newValue, key)) {
                    oldLength--;
                    delete oldValue[key];
                  }
                }
              }
            }

            return changeDetected;
          }

          function $watchCollectionAction() {
            if (initRun) {
              initRun = false;
              listener(newValue, newValue, self);
            } else {
              listener(newValue, veryOldValue, self);
            }

            if (trackVeryOldValue) {
              if (!isObject(newValue)) {
                veryOldValue = newValue;
              } else if (isArrayLike(newValue)) {
                veryOldValue = new Array(newValue.length);

                for (var i = 0; i < newValue.length; i++) {
                  veryOldValue[i] = newValue[i];
                }
              } else {
                veryOldValue = {};

                for (var key in newValue) {
                  if (hasOwnProperty.call(newValue, key)) {
                    veryOldValue[key] = newValue[key];
                  }
                }
              }
            }
          }

          return this.$watch(changeDetector, $watchCollectionAction);
        },
        $digest: function () {
          var watch,
              value,
              last,
              fn,
              get,
              watchers,
              dirty,
              ttl = TTL,
              next,
              current,
              target = asyncQueue.length ? $rootScope : this,
              watchLog = [],
              logIdx,
              asyncTask;
          beginPhase('$digest');
          $browser.$$checkUrlChange();

          if (this === $rootScope && applyAsyncId !== null) {
            $browser.defer.cancel(applyAsyncId);
            flushApplyAsync();
          }

          lastDirtyWatch = null;

          do {
            dirty = false;
            current = target;

            for (var asyncQueuePosition = 0; asyncQueuePosition < asyncQueue.length; asyncQueuePosition++) {
              try {
                asyncTask = asyncQueue[asyncQueuePosition];
                fn = asyncTask.fn;
                fn(asyncTask.scope, asyncTask.locals);
              } catch (e) {
                $exceptionHandler(e);
              }

              lastDirtyWatch = null;
            }

            asyncQueue.length = 0;

            traverseScopesLoop: do {
              if (watchers = !current.$$suspended && current.$$watchers) {
                watchers.$$digestWatchIndex = watchers.length;

                while (watchers.$$digestWatchIndex--) {
                  try {
                    watch = watchers[watchers.$$digestWatchIndex];

                    if (watch) {
                      get = watch.get;

                      if ((value = get(current)) !== (last = watch.last) && !(watch.eq ? equals(value, last) : isNumberNaN(value) && isNumberNaN(last))) {
                        dirty = true;
                        lastDirtyWatch = watch;
                        watch.last = watch.eq ? copy(value, null) : value;
                        fn = watch.fn;
                        fn(value, last === initWatchVal ? value : last, current);

                        if (ttl < 5) {
                          logIdx = 4 - ttl;
                          if (!watchLog[logIdx]) watchLog[logIdx] = [];
                          watchLog[logIdx].push({
                            msg: isFunction(watch.exp) ? 'fn: ' + (watch.exp.name || watch.exp.toString()) : watch.exp,
                            newVal: value,
                            oldVal: last
                          });
                        }
                      } else if (watch === lastDirtyWatch) {
                        dirty = false;
                        break traverseScopesLoop;
                      }
                    }
                  } catch (e) {
                    $exceptionHandler(e);
                  }
                }
              }

              if (!(next = !current.$$suspended && current.$$watchersCount && current.$$childHead || current !== target && current.$$nextSibling)) {
                while (current !== target && !(next = current.$$nextSibling)) {
                  current = current.$parent;
                }
              }
            } while (current = next);

            if ((dirty || asyncQueue.length) && !ttl--) {
              clearPhase();
              throw $rootScopeMinErr('infdig', '{0} $digest() iterations reached. Aborting!\n' + 'Watchers fired in the last 5 iterations: {1}', TTL, watchLog);
            }
          } while (dirty || asyncQueue.length);

          clearPhase();

          while (postDigestQueuePosition < postDigestQueue.length) {
            try {
              postDigestQueue[postDigestQueuePosition++]();
            } catch (e) {
              $exceptionHandler(e);
            }
          }

          postDigestQueue.length = postDigestQueuePosition = 0;
          $browser.$$checkUrlChange();
        },
        $suspend: function () {
          this.$$suspended = true;
        },
        $isSuspended: function () {
          return this.$$suspended;
        },
        $resume: function () {
          this.$$suspended = false;
        },
        $destroy: function () {
          if (this.$$destroyed) return;
          var parent = this.$parent;
          this.$broadcast('$destroy');
          this.$$destroyed = true;

          if (this === $rootScope) {
            $browser.$$applicationDestroyed();
          }

          incrementWatchersCount(this, -this.$$watchersCount);

          for (var eventName in this.$$listenerCount) {
            decrementListenerCount(this, this.$$listenerCount[eventName], eventName);
          }

          if (parent && parent.$$childHead === this) parent.$$childHead = this.$$nextSibling;
          if (parent && parent.$$childTail === this) parent.$$childTail = this.$$prevSibling;
          if (this.$$prevSibling) this.$$prevSibling.$$nextSibling = this.$$nextSibling;
          if (this.$$nextSibling) this.$$nextSibling.$$prevSibling = this.$$prevSibling;
          this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = noop;

          this.$on = this.$watch = this.$watchGroup = function () {
            return noop;
          };

          this.$$listeners = {};
          this.$$nextSibling = null;
          cleanUpScope(this);
        },
        $eval: function (expr, locals) {
          return $parse(expr)(this, locals);
        },
        $evalAsync: function (expr, locals) {
          if (!$rootScope.$$phase && !asyncQueue.length) {
            $browser.defer(function () {
              if (asyncQueue.length) {
                $rootScope.$digest();
              }
            }, null, '$evalAsync');
          }

          asyncQueue.push({
            scope: this,
            fn: $parse(expr),
            locals: locals
          });
        },
        $$postDigest: function (fn) {
          postDigestQueue.push(fn);
        },
        $apply: function (expr) {
          try {
            beginPhase('$apply');

            try {
              return this.$eval(expr);
            } finally {
              clearPhase();
            }
          } catch (e) {
            $exceptionHandler(e);
          } finally {
            try {
              $rootScope.$digest();
            } catch (e) {
              $exceptionHandler(e);
              throw e;
            }
          }
        },
        $applyAsync: function (expr) {
          var scope = this;

          if (expr) {
            applyAsyncQueue.push($applyAsyncExpression);
          }

          expr = $parse(expr);
          scheduleApplyAsync();

          function $applyAsyncExpression() {
            scope.$eval(expr);
          }
        },
        $on: function (name, listener) {
          var namedListeners = this.$$listeners[name];

          if (!namedListeners) {
            this.$$listeners[name] = namedListeners = [];
          }

          namedListeners.push(listener);
          var current = this;

          do {
            if (!current.$$listenerCount[name]) {
              current.$$listenerCount[name] = 0;
            }

            current.$$listenerCount[name]++;
          } while (current = current.$parent);

          var self = this;
          return function () {
            var indexOfListener = namedListeners.indexOf(listener);

            if (indexOfListener !== -1) {
              delete namedListeners[indexOfListener];
              decrementListenerCount(self, 1, name);
            }
          };
        },
        $emit: function (name, args) {
          var empty = [],
              namedListeners,
              scope = this,
              stopPropagation = false,
              event = {
            name: name,
            targetScope: scope,
            stopPropagation: function () {
              stopPropagation = true;
            },
            preventDefault: function () {
              event.defaultPrevented = true;
            },
            defaultPrevented: false
          },
              listenerArgs = concat([event], arguments, 1),
              i,
              length;

          do {
            namedListeners = scope.$$listeners[name] || empty;
            event.currentScope = scope;

            for (i = 0, length = namedListeners.length; i < length; i++) {
              if (!namedListeners[i]) {
                namedListeners.splice(i, 1);
                i--;
                length--;
                continue;
              }

              try {
                namedListeners[i].apply(null, listenerArgs);
              } catch (e) {
                $exceptionHandler(e);
              }
            }

            if (stopPropagation) {
              break;
            }

            scope = scope.$parent;
          } while (scope);

          event.currentScope = null;
          return event;
        },
        $broadcast: function (name, args) {
          var target = this,
              current = target,
              next = target,
              event = {
            name: name,
            targetScope: target,
            preventDefault: function () {
              event.defaultPrevented = true;
            },
            defaultPrevented: false
          };
          if (!target.$$listenerCount[name]) return event;
          var listenerArgs = concat([event], arguments, 1),
              listeners,
              i,
              length;

          while (current = next) {
            event.currentScope = current;
            listeners = current.$$listeners[name] || [];

            for (i = 0, length = listeners.length; i < length; i++) {
              if (!listeners[i]) {
                listeners.splice(i, 1);
                i--;
                length--;
                continue;
              }

              try {
                listeners[i].apply(null, listenerArgs);
              } catch (e) {
                $exceptionHandler(e);
              }
            }

            if (!(next = current.$$listenerCount[name] && current.$$childHead || current !== target && current.$$nextSibling)) {
              while (current !== target && !(next = current.$$nextSibling)) {
                current = current.$parent;
              }
            }
          }

          event.currentScope = null;
          return event;
        }
      };
      var $rootScope = new Scope();
      var asyncQueue = $rootScope.$$asyncQueue = [];
      var postDigestQueue = $rootScope.$$postDigestQueue = [];
      var applyAsyncQueue = $rootScope.$$applyAsyncQueue = [];
      var postDigestQueuePosition = 0;
      return $rootScope;

      function beginPhase(phase) {
        if ($rootScope.$$phase) {
          throw $rootScopeMinErr('inprog', '{0} already in progress', $rootScope.$$phase);
        }

        $rootScope.$$phase = phase;
      }

      function clearPhase() {
        $rootScope.$$phase = null;
      }

      function incrementWatchersCount(current, count) {
        do {
          current.$$watchersCount += count;
        } while (current = current.$parent);
      }

      function decrementListenerCount(current, count, name) {
        do {
          current.$$listenerCount[name] -= count;

          if (current.$$listenerCount[name] === 0) {
            delete current.$$listenerCount[name];
          }
        } while (current = current.$parent);
      }

      function initWatchVal() {}

      function flushApplyAsync() {
        while (applyAsyncQueue.length) {
          try {
            applyAsyncQueue.shift()();
          } catch (e) {
            $exceptionHandler(e);
          }
        }

        applyAsyncId = null;
      }

      function scheduleApplyAsync() {
        if (applyAsyncId === null) {
          applyAsyncId = $browser.defer(function () {
            $rootScope.$apply(flushApplyAsync);
          }, null, '$applyAsync');
        }
      }
    }];
  }

  function $$SanitizeUriProvider() {
    var aHrefSanitizationTrustedUrlList = /^\s*(https?|s?ftp|mailto|tel|file):/,
        imgSrcSanitizationTrustedUrlList = /^\s*((https?|ftp|file|blob):|data:image\/)/;

    this.aHrefSanitizationTrustedUrlList = function (regexp) {
      if (isDefined(regexp)) {
        aHrefSanitizationTrustedUrlList = regexp;
        return this;
      }

      return aHrefSanitizationTrustedUrlList;
    };

    this.imgSrcSanitizationTrustedUrlList = function (regexp) {
      if (isDefined(regexp)) {
        imgSrcSanitizationTrustedUrlList = regexp;
        return this;
      }

      return imgSrcSanitizationTrustedUrlList;
    };

    this.$get = function () {
      return function sanitizeUri(uri, isMediaUrl) {
        var regex = isMediaUrl ? imgSrcSanitizationTrustedUrlList : aHrefSanitizationTrustedUrlList;
        var normalizedVal = urlResolve(uri && uri.trim()).href;

        if (normalizedVal !== '' && !normalizedVal.match(regex)) {
          return 'unsafe:' + normalizedVal;
        }

        return uri;
      };
    };
  }

  var $sceMinErr = minErr('$sce');
  var SCE_CONTEXTS = {
    HTML: 'html',
    CSS: 'css',
    MEDIA_URL: 'mediaUrl',
    URL: 'url',
    RESOURCE_URL: 'resourceUrl',
    JS: 'js'
  };
  var UNDERSCORE_LOWERCASE_REGEXP = /_([a-z])/g;

  function snakeToCamel(name) {
    return name.replace(UNDERSCORE_LOWERCASE_REGEXP, fnCamelCaseReplace);
  }

  function adjustMatcher(matcher) {
    if (matcher === 'self') {
      return matcher;
    } else if (isString(matcher)) {
      if (matcher.indexOf('***') > -1) {
        throw $sceMinErr('iwcard', 'Illegal sequence *** in string matcher.  String: {0}', matcher);
      }

      matcher = escapeForRegexp(matcher).replace(/\\\*\\\*/g, '.*').replace(/\\\*/g, '[^:/.?&;]*');
      return new RegExp('^' + matcher + '$');
    } else if (isRegExp(matcher)) {
      return new RegExp('^' + matcher.source + '$');
    } else {
      throw $sceMinErr('imatcher', 'Matchers may only be "self", string patterns or RegExp objects');
    }
  }

  function adjustMatchers(matchers) {
    var adjustedMatchers = [];

    if (isDefined(matchers)) {
      forEach(matchers, function (matcher) {
        adjustedMatchers.push(adjustMatcher(matcher));
      });
    }

    return adjustedMatchers;
  }

  function $SceDelegateProvider() {
    this.SCE_CONTEXTS = SCE_CONTEXTS;
    var trustedResourceUrlList = ['self'],
        bannedResourceUrlList = [];

    this.trustedResourceUrlList = function (value) {
      if (arguments.length) {
        trustedResourceUrlList = adjustMatchers(value);
      }

      return trustedResourceUrlList;
    };

    Object.defineProperty(this, 'resourceUrlWhitelist', {
      get: function () {
        return this.trustedResourceUrlList;
      },
      set: function (value) {
        this.trustedResourceUrlList = value;
      }
    });

    this.bannedResourceUrlList = function (value) {
      if (arguments.length) {
        bannedResourceUrlList = adjustMatchers(value);
      }

      return bannedResourceUrlList;
    };

    Object.defineProperty(this, 'resourceUrlBlacklist', {
      get: function () {
        return this.bannedResourceUrlList;
      },
      set: function (value) {
        this.bannedResourceUrlList = value;
      }
    });
    this.$get = ['$injector', '$$sanitizeUri', function ($injector, $$sanitizeUri) {
      var htmlSanitizer = function htmlSanitizer(html) {
        return html;
      };

      if ($injector.has('$sanitize')) {
        htmlSanitizer = $injector.get('$sanitize');
      }

      function matchUrl(matcher, parsedUrl) {
        if (matcher === 'self') {
          return urlIsSameOrigin(parsedUrl) || urlIsSameOriginAsBaseUrl(parsedUrl);
        } else {
          return !!matcher.exec(parsedUrl.href);
        }
      }

      function isResourceUrlAllowedByPolicy(url) {
        var parsedUrl = urlResolve(url.toString());
        var i,
            n,
            allowed = false;

        for (i = 0, n = trustedResourceUrlList.length; i < n; i++) {
          if (matchUrl(trustedResourceUrlList[i], parsedUrl)) {
            allowed = true;
            break;
          }
        }

        if (allowed) {
          for (i = 0, n = bannedResourceUrlList.length; i < n; i++) {
            if (matchUrl(bannedResourceUrlList[i], parsedUrl)) {
              allowed = false;
              break;
            }
          }
        }

        return allowed;
      }

      function generateHolderType(Base) {
        var holderType = function TrustedValueHolderType(trustedValue) {
          this.$$unwrapTrustedValue = function () {
            return trustedValue;
          };
        };

        if (Base) {
          holderType.prototype = new Base();
        }

        holderType.prototype.valueOf = function sceValueOf() {
          return this.$$unwrapTrustedValue();
        };

        holderType.prototype.toString = function sceToString() {
          return this.$$unwrapTrustedValue().toString();
        };

        return holderType;
      }

      var trustedValueHolderBase = generateHolderType(),
          byType = {};
      byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase);
      byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase);
      byType[SCE_CONTEXTS.MEDIA_URL] = generateHolderType(trustedValueHolderBase);
      byType[SCE_CONTEXTS.URL] = generateHolderType(byType[SCE_CONTEXTS.MEDIA_URL]);
      byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase);
      byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]);

      function trustAs(type, trustedValue) {
        var Constructor = byType.hasOwnProperty(type) ? byType[type] : null;

        if (!Constructor) {
          throw $sceMinErr('icontext', 'Attempted to trust a value in invalid context. Context: {0}; Value: {1}', type, trustedValue);
        }

        if (trustedValue === null || isUndefined(trustedValue) || trustedValue === '') {
          return trustedValue;
        }

        if (typeof trustedValue !== 'string') {
          throw $sceMinErr('itype', 'Attempted to trust a non-string value in a content requiring a string: Context: {0}', type);
        }

        return new Constructor(trustedValue);
      }

      function valueOf(maybeTrusted) {
        if (maybeTrusted instanceof trustedValueHolderBase) {
          return maybeTrusted.$$unwrapTrustedValue();
        } else {
          return maybeTrusted;
        }
      }

      function getTrusted(type, maybeTrusted) {
        if (maybeTrusted === null || isUndefined(maybeTrusted) || maybeTrusted === '') {
          return maybeTrusted;
        }

        var constructor = byType.hasOwnProperty(type) ? byType[type] : null;

        if (constructor && maybeTrusted instanceof constructor) {
          return maybeTrusted.$$unwrapTrustedValue();
        }

        if (isFunction(maybeTrusted.$$unwrapTrustedValue)) {
          maybeTrusted = maybeTrusted.$$unwrapTrustedValue();
        }

        if (type === SCE_CONTEXTS.MEDIA_URL || type === SCE_CONTEXTS.URL) {
          return $$sanitizeUri(maybeTrusted.toString(), type === SCE_CONTEXTS.MEDIA_URL);
        } else if (type === SCE_CONTEXTS.RESOURCE_URL) {
          if (isResourceUrlAllowedByPolicy(maybeTrusted)) {
            return maybeTrusted;
          } else {
            throw $sceMinErr('insecurl', 'Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}', maybeTrusted.toString());
          }
        } else if (type === SCE_CONTEXTS.HTML) {
          return htmlSanitizer(maybeTrusted);
        }

        throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
      }

      return {
        trustAs: trustAs,
        getTrusted: getTrusted,
        valueOf: valueOf
      };
    }];
  }

  function $SceProvider() {
    var enabled = true;

    this.enabled = function (value) {
      if (arguments.length) {
        enabled = !!value;
      }

      return enabled;
    };

    this.$get = ['$parse', '$sceDelegate', function ($parse, $sceDelegate) {
      if (enabled && msie < 8) {
        throw $sceMinErr('iequirks', 'Strict Contextual Escaping does not support Internet Explorer version < 11 in quirks ' + 'mode.  You can fix this by adding the text <!doctype html> to the top of your HTML ' + 'document.  See http://docs.angularjs.org/api/ng.$sce for more information.');
      }

      var sce = shallowCopy(SCE_CONTEXTS);

      sce.isEnabled = function () {
        return enabled;
      };

      sce.trustAs = $sceDelegate.trustAs;
      sce.getTrusted = $sceDelegate.getTrusted;
      sce.valueOf = $sceDelegate.valueOf;

      if (!enabled) {
        sce.trustAs = sce.getTrusted = function (type, value) {
          return value;
        };

        sce.valueOf = identity;
      }

      sce.parseAs = function sceParseAs(type, expr) {
        var parsed = $parse(expr);

        if (parsed.literal && parsed.constant) {
          return parsed;
        } else {
          return $parse(expr, function (value) {
            return sce.getTrusted(type, value);
          });
        }
      };

      var parse = sce.parseAs,
          getTrusted = sce.getTrusted,
          trustAs = sce.trustAs;
      forEach(SCE_CONTEXTS, function (enumValue, name) {
        var lName = lowercase(name);

        sce[snakeToCamel('parse_as_' + lName)] = function (expr) {
          return parse(enumValue, expr);
        };

        sce[snakeToCamel('get_trusted_' + lName)] = function (value) {
          return getTrusted(enumValue, value);
        };

        sce[snakeToCamel('trust_as_' + lName)] = function (value) {
          return trustAs(enumValue, value);
        };
      });
      return sce;
    }];
  }

  function $SnifferProvider() {
    this.$get = ['$window', '$document', function ($window, $document) {
      var eventSupport = {},
          isNw = $window.nw && $window.nw.process,
          isChromePackagedApp = !isNw && $window.chrome && ($window.chrome.app && $window.chrome.app.runtime || !$window.chrome.app && $window.chrome.runtime && $window.chrome.runtime.id),
          hasHistoryPushState = !isChromePackagedApp && $window.history && $window.history.pushState,
          android = toInt((/android (\d+)/.exec(lowercase(($window.navigator || {}).userAgent)) || [])[1]),
          boxee = /Boxee/i.test(($window.navigator || {}).userAgent),
          document = $document[0] || {},
          bodyStyle = document.body && document.body.style,
          transitions = false,
          animations = false;

      if (bodyStyle) {
        transitions = !!('transition' in bodyStyle || 'webkitTransition' in bodyStyle);
        animations = !!('animation' in bodyStyle || 'webkitAnimation' in bodyStyle);
      }

      return {
        history: !!(hasHistoryPushState && !(android < 4) && !boxee),
        hasEvent: function (event) {
          if (event === 'input' && msie) return false;

          if (isUndefined(eventSupport[event])) {
            var divElm = document.createElement('div');
            eventSupport[event] = 'on' + event in divElm;
          }

          return eventSupport[event];
        },
        csp: csp(),
        transitions: transitions,
        animations: animations,
        android: android
      };
    }];
  }

  function $$TaskTrackerFactoryProvider() {
    this.$get = valueFn(function (log) {
      return new TaskTracker(log);
    });
  }

  function TaskTracker(log) {
    var self = this;
    var taskCounts = {};
    var taskCallbacks = [];
    var ALL_TASKS_TYPE = self.ALL_TASKS_TYPE = '$$all$$';
    var DEFAULT_TASK_TYPE = self.DEFAULT_TASK_TYPE = '$$default$$';
    self.completeTask = completeTask;
    self.incTaskCount = incTaskCount;
    self.notifyWhenNoPendingTasks = notifyWhenNoPendingTasks;

    function completeTask(fn, taskType) {
      taskType = taskType || DEFAULT_TASK_TYPE;

      try {
        fn();
      } finally {
        decTaskCount(taskType);
        var countForType = taskCounts[taskType];
        var countForAll = taskCounts[ALL_TASKS_TYPE];

        if (!countForAll || !countForType) {
          var getNextCallback = !countForAll ? getLastCallback : getLastCallbackForType;
          var nextCb;

          while (nextCb = getNextCallback(taskType)) {
            try {
              nextCb();
            } catch (e) {
              log.error(e);
            }
          }
        }
      }
    }

    function decTaskCount(taskType) {
      taskType = taskType || DEFAULT_TASK_TYPE;

      if (taskCounts[taskType]) {
        taskCounts[taskType]--;
        taskCounts[ALL_TASKS_TYPE]--;
      }
    }

    function getLastCallback() {
      var cbInfo = taskCallbacks.pop();
      return cbInfo && cbInfo.cb;
    }

    function getLastCallbackForType(taskType) {
      for (var i = taskCallbacks.length - 1; i >= 0; --i) {
        var cbInfo = taskCallbacks[i];

        if (cbInfo.type === taskType) {
          taskCallbacks.splice(i, 1);
          return cbInfo.cb;
        }
      }
    }

    function incTaskCount(taskType) {
      taskType = taskType || DEFAULT_TASK_TYPE;
      taskCounts[taskType] = (taskCounts[taskType] || 0) + 1;
      taskCounts[ALL_TASKS_TYPE] = (taskCounts[ALL_TASKS_TYPE] || 0) + 1;
    }

    function notifyWhenNoPendingTasks(callback, taskType) {
      taskType = taskType || ALL_TASKS_TYPE;

      if (!taskCounts[taskType]) {
        callback();
      } else {
        taskCallbacks.push({
          type: taskType,
          cb: callback
        });
      }
    }
  }

  var $timeoutMinErr = minErr('$timeout');

  function $TimeoutProvider() {
    this.$get = ['$rootScope', '$browser', '$q', '$$q', '$exceptionHandler', function ($rootScope, $browser, $q, $$q, $exceptionHandler) {
      var deferreds = {};

      function timeout(fn, delay, invokeApply) {
        if (!isFunction(fn)) {
          invokeApply = delay;
          delay = fn;
          fn = noop;
        }

        var args = sliceArgs(arguments, 3),
            skipApply = isDefined(invokeApply) && !invokeApply,
            deferred = (skipApply ? $$q : $q).defer(),
            promise = deferred.promise,
            timeoutId;
        timeoutId = $browser.defer(function () {
          try {
            deferred.resolve(fn.apply(null, args));
          } catch (e) {
            deferred.reject(e);
            $exceptionHandler(e);
          } finally {
            delete deferreds[promise.$$timeoutId];
          }

          if (!skipApply) $rootScope.$apply();
        }, delay, '$timeout');
        promise.$$timeoutId = timeoutId;
        deferreds[timeoutId] = deferred;
        return promise;
      }

      timeout.cancel = function (promise) {
        if (!promise) return false;

        if (!promise.hasOwnProperty('$$timeoutId')) {
          throw $timeoutMinErr('badprom', '`$timeout.cancel()` called with a promise that was not generated by `$timeout()`.');
        }

        if (!deferreds.hasOwnProperty(promise.$$timeoutId)) return false;
        var id = promise.$$timeoutId;
        var deferred = deferreds[id];
        markQExceptionHandled(deferred.promise);
        deferred.reject('canceled');
        delete deferreds[id];
        return $browser.defer.cancel(id);
      };

      return timeout;
    }];
  }

  var urlParsingNode = window.document.createElement('a');
  var originUrl = urlResolve(window.location.href);
  var baseUrlParsingNode;
  urlParsingNode.href = 'http://[::1]';
  var ipv6InBrackets = urlParsingNode.hostname === '[::1]';

  function urlResolve(url) {
    if (!isString(url)) return url;
    var href = url;

    if (msie) {
      urlParsingNode.setAttribute('href', href);
      href = urlParsingNode.href;
    }

    urlParsingNode.setAttribute('href', href);
    var hostname = urlParsingNode.hostname;

    if (!ipv6InBrackets && hostname.indexOf(':') > -1) {
      hostname = '[' + hostname + ']';
    }

    return {
      href: urlParsingNode.href,
      protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
      host: urlParsingNode.host,
      search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
      hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
      hostname: hostname,
      port: urlParsingNode.port,
      pathname: urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
    };
  }

  function urlIsSameOrigin(requestUrl) {
    return urlsAreSameOrigin(requestUrl, originUrl);
  }

  function urlIsSameOriginAsBaseUrl(requestUrl) {
    return urlsAreSameOrigin(requestUrl, getBaseUrl());
  }

  function urlsAreSameOrigin(url1, url2) {
    url1 = urlResolve(url1);
    url2 = urlResolve(url2);
    return url1.protocol === url2.protocol && url1.host === url2.host;
  }

  function getBaseUrl() {
    if (window.document.baseURI) {
      return window.document.baseURI;
    }

    if (!baseUrlParsingNode) {
      baseUrlParsingNode = window.document.createElement('a');
      baseUrlParsingNode.href = '.';
      baseUrlParsingNode = baseUrlParsingNode.cloneNode(false);
    }

    return baseUrlParsingNode.href;
  }

  function $WindowProvider() {
    this.$get = valueFn(window);
  }

  $FilterProvider.$inject = ['$provide'];

  function $FilterProvider($provide) {
    var suffix = 'Filter';

    function register(name, factory) {
      if (isObject(name)) {
        var filters = {};
        forEach(name, function (filter, key) {
          filters[key] = register(key, filter);
        });
        return filters;
      } else {
        return $provide.factory(name + suffix, factory);
      }
    }

    this.register = register;
    this.$get = ['$injector', function ($injector) {
      return function (name) {
        return $injector.get(name + suffix);
      };
    }];
    register('json', jsonFilter);
  }

  function jsonFilter() {
    return function (object, spacing) {
      if (isUndefined(spacing)) {
        spacing = 2;
      }

      return toJson(object, spacing);
    };
  }

  function ngDirective(directive) {
    if (isFunction(directive)) {
      directive = {
        link: directive
      };
    }

    directive.restrict = directive.restrict || 'AC';
    return valueFn(directive);
  }

  var ngAttributeAliasDirectives = {};
  forEach(BOOLEAN_ATTR, function (propName, attrName) {
    if (propName === 'multiple') return;

    function defaultLinkFn(scope, element, attr) {
      scope.$watch(attr[normalized], function ngBooleanAttrWatchAction(value) {
        attr.$set(attrName, !!value);
      });
    }

    var normalized = directiveNormalize('ng-' + attrName);
    var linkFn = defaultLinkFn;

    if (propName === 'checked') {
      linkFn = function (scope, element, attr) {
        if (attr.ngModel !== attr[normalized]) {
          defaultLinkFn(scope, element, attr);
        }
      };
    }

    ngAttributeAliasDirectives[normalized] = function () {
      return {
        restrict: 'A',
        priority: 100,
        link: linkFn
      };
    };
  });
  forEach(ALIASED_ATTR, function (htmlAttr, ngAttr) {
    ngAttributeAliasDirectives[ngAttr] = function () {
      return {
        priority: 100,
        link: function (scope, element, attr) {
          if (ngAttr === 'ngPattern' && attr.ngPattern.charAt(0) === '/') {
            var match = attr.ngPattern.match(REGEX_STRING_REGEXP);

            if (match) {
              attr.$set('ngPattern', new RegExp(match[1], match[2]));
              return;
            }
          }

          scope.$watch(attr[ngAttr], function ngAttrAliasWatchAction(value) {
            attr.$set(ngAttr, value);
          });
        }
      };
    };
  });
  forEach(['src', 'srcset', 'href'], function (attrName) {
    var normalized = directiveNormalize('ng-' + attrName);
    ngAttributeAliasDirectives[normalized] = ['$sce', function ($sce) {
      return {
        priority: 99,
        link: function (scope, element, attr) {
          var propName = attrName,
              name = attrName;

          if (attrName === 'href' && toString.call(element.prop('href')) === '[object SVGAnimatedString]') {
            name = 'xlinkHref';
            attr.$attr[name] = 'xlink:href';
            propName = null;
          }

          attr.$set(normalized, $sce.getTrustedMediaUrl(attr[normalized]));
          attr.$observe(normalized, function (value) {
            if (!value) {
              if (attrName === 'href') {
                attr.$set(name, null);
              }

              return;
            }

            attr.$set(name, value);
            if (msie && propName) element.prop(propName, attr[name]);
          });
        }
      };
    }];
  });
  var ngBindDirective = ['$compile', '$parse', function ($compile, $parse) {
    return {
      restrict: 'AC',
      compile: function ngBindCompile(templateElement) {
        $compile.$$addBindingClass(templateElement);
        return function ngBindLink(scope, element, attr) {
          $compile.$$addBindingInfo(element, attr.ngBind);
          element = element[0];
          var initValue,
              ngExp = $parse(attr.ngBind);

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
  var ngBindHtmlDirective = ['$sce', '$parse', '$compile', function ($sce, $parse, $compile) {
    return {
      restrict: 'A',
      compile: function ngBindHtmlCompile(tElement, tAttrs) {
        var ngBindHtmlGetter = $parse(tAttrs.ngBindHtml);
        var ngBindHtmlWatch = $parse(tAttrs.ngBindHtml, function sceValueOf(val) {
          return $sce.valueOf(val);
        });
        $compile.$$addBindingClass(tElement);
        return function ngBindHtmlLink(scope, element, attr) {
          $compile.$$addBindingInfo(element, attr.ngBindHtml);
          scope.$watch(ngBindHtmlWatch, function ngBindHtmlWatchAction() {
            var value = ngBindHtmlGetter(scope);
            element.html($sce.getTrustedHtml(value) || '');
          });
        };
      }
    };
  }];

  function classDirective(name, selector) {
    name = 'ngClass' + name;
    var indexWatchExpression;
    return ['$parse', function ($parse) {
      return {
        restrict: 'AC',
        link: function (scope, element, attr) {
          var classCounts = element.data('$classCounts');
          var oldModulo = true;
          var oldClassString;
          var initValue;
          var ngExp = $parse(attr[name], toClassString);

          if (!classCounts) {
            classCounts = createMap();
            element.data('$classCounts', classCounts);
          }

          if (name !== 'ngClass') {
            if (!indexWatchExpression) {
              indexWatchExpression = $parse('$index', function moduloTwo($index) {
                return $index & 1;
              });
            }

            scope.$watch(indexWatchExpression, ngClassIndexWatchAction);
          }

          if (ngExp.oneTime && isDefined(initValue = ngExp(scope))) {
            ngClassWatchAction(initValue);
          } else {
            scope.$watch(ngExp, ngClassWatchAction);
          }

          function addClasses(classString) {
            classString = digestClassCounts(split(classString), 1);
            attr.$addClass(classString);
          }

          function removeClasses(classString) {
            classString = digestClassCounts(split(classString), -1);
            attr.$removeClass(classString);
          }

          function updateClasses(oldClassString, newClassString) {
            var oldClassArray = split(oldClassString);
            var newClassArray = split(newClassString);
            var toRemoveArray = arrayDifference(oldClassArray, newClassArray);
            var toAddArray = arrayDifference(newClassArray, oldClassArray);
            var toRemoveString = digestClassCounts(toRemoveArray, -1);
            var toAddString = digestClassCounts(toAddArray, 1);
            attr.$addClass(toAddString);
            attr.$removeClass(toRemoveString);
          }

          function digestClassCounts(classArray, count) {
            var classesToUpdate = [];
            forEach(classArray, function (className) {
              if (count > 0 || classCounts[className]) {
                classCounts[className] = (classCounts[className] || 0) + count;

                if (classCounts[className] === +(count > 0)) {
                  classesToUpdate.push(className);
                }
              }
            });
            return classesToUpdate.join(' ');
          }

          function ngClassIndexWatchAction(newModulo) {
            if (newModulo === selector) {
              addClasses(oldClassString);
            } else {
              removeClasses(oldClassString);
            }

            oldModulo = newModulo;
          }

          function ngClassWatchAction(newClassString) {
            if (oldModulo === selector) {
              updateClasses(oldClassString, newClassString);
            }

            oldClassString = newClassString;
          }
        }
      };
    }];

    function arrayDifference(tokens1, tokens2) {
      if (!tokens1 || !tokens1.length) return [];
      if (!tokens2 || !tokens2.length) return tokens1;
      var values = [];

      outer: for (var i = 0; i < tokens1.length; i++) {
        var token = tokens1[i];

        for (var j = 0; j < tokens2.length; j++) {
          if (token === tokens2[j]) continue outer;
        }

        values.push(token);
      }

      return values;
    }

    function split(classString) {
      return classString && classString.split(' ');
    }

    function toClassString(classValue) {
      if (!classValue) return classValue;
      var classString = classValue;

      if (isArray(classValue)) {
        classString = classValue.map(toClassString).join(' ');
      } else if (isObject(classValue)) {
        classString = Object.keys(classValue).filter(function (key) {
          return classValue[key];
        }).join(' ');
      } else if (!isString(classValue)) {
        classString = classValue + '';
      }

      return classString;
    }
  }

  var ngClassDirective = classDirective('', true);
  var ngClassOddDirective = classDirective('Odd', 0);
  var ngClassEvenDirective = classDirective('Even', 1);
  var ngCloakDirective = ngDirective({
    compile: function (element, attr) {
      attr.$set('ngCloak', undefined);
      element.removeClass('ng-cloak');
    }
  });
  var ngControllerDirective = [function () {
    return {
      restrict: 'A',
      scope: true,
      controller: '@',
      priority: 500
    };
  }];
  var ngEventDirectives = {};
  var forceAsyncEvents = {
    'blur': true,
    'focus': true
  };
  forEach('click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' '), function (eventName) {
    var directiveName = directiveNormalize('ng-' + eventName);
    ngEventDirectives[directiveName] = ['$parse', '$rootScope', '$exceptionHandler', function ($parse, $rootScope, $exceptionHandler) {
      return createEventDirective($parse, $rootScope, $exceptionHandler, directiveName, eventName, forceAsyncEvents[eventName]);
    }];
  });

  function createEventDirective($parse, $rootScope, $exceptionHandler, directiveName, eventName, forceAsync) {
    return {
      restrict: 'A',
      compile: function ($element, attr) {
        var fn = $parse(attr[directiveName]);
        return function ngEventHandler(scope, element) {
          element.on(eventName, function (event) {
            var callback = function () {
              fn(scope, {
                $event: event
              });
            };

            if (!$rootScope.$$phase) {
              scope.$apply(callback);
            } else if (forceAsync) {
              scope.$evalAsync(callback);
            } else {
              try {
                callback();
              } catch (error) {
                $exceptionHandler(error);
              }
            }
          });
        };
      }
    };
  }

  var ngIfDirective = ['$compile', '$parse', function ($compile, $parse) {
    return {
      multiElement: true,
      transclude: 'element',
      priority: 600,
      terminal: true,
      restrict: 'A',
      $$tlb: true,
      link: function ($scope, $element, $attr, ctrl, $transclude) {
        var block, childScope, previousElements;
        var initValue,
            ngExp = $parse($attr.ngIf);

        if (ngExp.oneTime && isDefined(initValue = ngExp($scope))) {
          ngIfWatchAction(initValue);
        } else {
          $scope.$watch(ngExp, ngIfWatchAction);
        }

        function ngIfWatchAction(value) {
          if (value) {
            if (!childScope) {
              $transclude(function (clone, newScope) {
                childScope = newScope;
                clone[clone.length++] = $compile.$$createComment('end ngIf', $attr.ngIf);
                block = {
                  clone: clone
                };
                domInsert(clone, $element.parent(), $element);
              });
            }
          } else {
            if (previousElements) {
              previousElements.remove();
              previousElements = null;
            }

            if (childScope) {
              childScope.$destroy();
              childScope = null;
            }

            if (block) {
              previousElements = getBlockNodes(block.clone);
              previousElements.remove();
              previousElements = null;
              block = null;
            }
          }
        }
      }
    };
  }];
  var ngInitDirective = ngDirective({
    priority: 450,
    compile: function () {
      return {
        pre: function (scope, element, attrs) {
          scope.$eval(attrs.ngInit);
        }
      };
    }
  });
  var ngNonBindableDirective = ngDirective({
    terminal: true,
    priority: 1000
  });
  var ngRepeatDirective = ['$parse', '$compile', function ($parse, $compile) {
    var NG_REMOVED = '$$NG_REMOVED';
    var ngRepeatMinErr = minErr('ngRepeat');

    var updateScope = function (scope, index, valueIdentifier, value, keyIdentifier, key, arrayLength) {
      scope[valueIdentifier] = value;
      if (keyIdentifier) scope[keyIdentifier] = key;
      scope.$index = index;
      scope.$first = index === 0;
      scope.$last = index === arrayLength - 1;
      scope.$middle = !(scope.$first || scope.$last);
      scope.$odd = !(scope.$even = (index & 1) === 0);
    };

    var getBlockStart = function (block) {
      return block.clone[0];
    };

    var getBlockEnd = function (block) {
      return block.clone[block.clone.length - 1];
    };

    var trackByIdArrayFn = function ($scope, key, value) {
      return hashKey(value);
    };

    var trackByIdObjFn = function ($scope, key) {
      return key;
    };

    return {
      restrict: 'A',
      multiElement: true,
      transclude: 'element',
      priority: 1000,
      terminal: true,
      $$tlb: true,
      compile: function ngRepeatCompile($element, $attr) {
        var expression = $attr.ngRepeat;
        var ngRepeatEndComment = $compile.$$createComment('end ngRepeat', expression);
        var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

        if (!match) {
          throw ngRepeatMinErr('iexp', 'Expected expression in form of \'_item_ in _collection_[ track by _id_]\' but got \'{0}\'.', expression);
        }

        var lhs = match[1];
        var rhs = match[2];
        var aliasAs = match[3];
        var trackByExp = match[4];
        match = lhs.match(/^(?:(\s*[$\w]+)|\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\))$/);

        if (!match) {
          throw ngRepeatMinErr('iidexp', '\'_item_\' in \'_item_ in _collection_\' should be an identifier or \'(_key_, _value_)\' expression, but got \'{0}\'.', lhs);
        }

        var valueIdentifier = match[3] || match[1];
        var keyIdentifier = match[2];

        if (aliasAs && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(aliasAs) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(aliasAs))) {
          throw ngRepeatMinErr('badident', 'alias \'{0}\' is invalid --- must be a valid JS identifier which is not a reserved name.', aliasAs);
        }

        var trackByIdExpFn;

        if (trackByExp) {
          var hashFnLocals = {
            $id: hashKey
          };
          var trackByExpGetter = $parse(trackByExp);

          trackByIdExpFn = function ($scope, key, value, index) {
            if (keyIdentifier) hashFnLocals[keyIdentifier] = key;
            hashFnLocals[valueIdentifier] = value;
            hashFnLocals.$index = index;
            return trackByExpGetter($scope, hashFnLocals);
          };
        }

        return function ngRepeatLink($scope, $element, $attr, ctrl, $transclude) {
          var lastBlockMap = createMap();
          $scope.$watchCollection(rhs, function ngRepeatAction(collection) {
            var index,
                length,
                previousNode = $element[0],
                nextNode,
                nextBlockMap = createMap(),
                collectionLength,
                key,
                value,
                trackById,
                trackByIdFn,
                collectionKeys,
                block,
                nextBlockOrder,
                elementsToRemove;

            if (aliasAs) {
              $scope[aliasAs] = collection;
            }

            if (isArrayLike(collection)) {
              collectionKeys = collection;
              trackByIdFn = trackByIdExpFn || trackByIdArrayFn;
            } else {
              trackByIdFn = trackByIdExpFn || trackByIdObjFn;
              collectionKeys = [];

              for (var itemKey in collection) {
                if (hasOwnProperty.call(collection, itemKey) && itemKey.charAt(0) !== '$') {
                  collectionKeys.push(itemKey);
                }
              }
            }

            collectionLength = collectionKeys.length;
            nextBlockOrder = new Array(collectionLength);

            for (index = 0; index < collectionLength; index++) {
              key = collection === collectionKeys ? index : collectionKeys[index];
              value = collection[key];
              trackById = trackByIdFn($scope, key, value, index);

              if (lastBlockMap[trackById]) {
                block = lastBlockMap[trackById];
                delete lastBlockMap[trackById];
                nextBlockMap[trackById] = block;
                nextBlockOrder[index] = block;
              } else if (nextBlockMap[trackById]) {
                forEach(nextBlockOrder, function (block) {
                  if (block && block.scope) lastBlockMap[block.id] = block;
                });
                throw ngRepeatMinErr('dupes', 'Duplicates in a repeater are not allowed. Use \'track by\' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}', expression, trackById, value);
              } else {
                nextBlockOrder[index] = {
                  id: trackById,
                  scope: undefined,
                  clone: undefined
                };
                nextBlockMap[trackById] = true;
              }
            }

            if (hashFnLocals) {
              hashFnLocals[valueIdentifier] = undefined;
            }

            for (var blockKey in lastBlockMap) {
              block = lastBlockMap[blockKey];
              elementsToRemove = getBlockNodes(block.clone);
              elementsToRemove.remove();

              if (elementsToRemove[0].parentNode) {
                for (index = 0, length = elementsToRemove.length; index < length; index++) {
                  elementsToRemove[index][NG_REMOVED] = true;
                }
              }

              block.scope.$destroy();
            }

            for (index = 0; index < collectionLength; index++) {
              key = collection === collectionKeys ? index : collectionKeys[index];
              value = collection[key];
              block = nextBlockOrder[index];

              if (block.scope) {
                nextNode = previousNode;

                do {
                  nextNode = nextNode.nextSibling;
                } while (nextNode && nextNode[NG_REMOVED]);

                if (getBlockStart(block) !== nextNode) {
                  var previousNodeJL = jqLite(previousNode);
                  domInsert(getBlockNodes(block.clone), previousNodeJL.parent(), previousNodeJL);
                }

                previousNode = getBlockEnd(block);
                updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength);
              } else {
                $transclude(function ngRepeatTransclude(clone, scope) {
                  block.scope = scope;
                  var endNode = ngRepeatEndComment.cloneNode(false);
                  clone[clone.length++] = endNode;
                  var previousNodeJL = jqLite(previousNode);
                  domInsert(clone, previousNodeJL.parent(), previousNodeJL);
                  previousNode = endNode;
                  block.clone = clone;
                  nextBlockMap[block.id] = block;
                  updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength);
                });
              }
            }

            lastBlockMap = nextBlockMap;
          });
        };
      }
    };
  }];
  var NG_HIDE_CLASS = 'ng-hide';
  var NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate';
  var ngShowDirective = ['$parse', function ($parse) {
    return {
      restrict: 'A',
      multiElement: true,
      link: function (scope, element, attr) {
        var initValue,
            ngExp = $parse(attr.ngShow);

        if (ngExp.oneTime && isDefined(initValue = ngExp(scope))) {
          ngShowWatchAction(initValue);
        } else {
          scope.$watch(ngExp, ngShowWatchAction);
        }

        function ngShowWatchAction(value) {
          if (value) {
            element.removeClass(NG_HIDE_CLASS);
          } else {
            element.addClass(NG_HIDE_CLASS);
          }
        }
      }
    };
  }];
  var ngHideDirective = ['$parse', function ($parse) {
    return {
      restrict: 'A',
      multiElement: true,
      link: function (scope, element, attr) {
        var initValue,
            ngExp = $parse(attr.ngHide);

        if (ngExp.oneTime && isDefined(initValue = ngExp(scope))) {
          ngHideWatchAction(initValue);
        } else {
          scope.$watch(ngExp, ngHideWatchAction);
        }

        function ngHideWatchAction(value) {
          if (value) {
            element.addClass(NG_HIDE_CLASS);
          } else {
            element.removeClass(NG_HIDE_CLASS);
          }
        }
      }
    };
  }];
  var ngStyleDirective = ngDirective(function (scope, element, attr) {
    scope.$watchCollection(attr.ngStyle, function ngStyleWatchAction(newStyles, oldStyles) {
      if (oldStyles && newStyles !== oldStyles) {
        forEach(oldStyles, function (val, style) {
          element.css(style, '');
        });
      }

      if (newStyles) element.css(newStyles);
    });
  });
  var ngSwitchDirective = ['$compile', '$parse', function ($compile, $parse) {
    return {
      require: 'ngSwitch',
      controller: ['$scope', function NgSwitchController() {
        this.cases = {};
      }],
      link: function (scope, element, attr, ngSwitchController) {
        var watchExpr = attr.ngSwitch || attr.on,
            selectedTranscludes = [],
            selectedElements = [],
            selectedScopes = [];
        var initValue,
            ngExp = $parse(watchExpr);

        if (ngExp.oneTime && isDefined(initValue = ngExp(scope))) {
          ngSwitchWatchAction(initValue);
        } else {
          scope.$watch(ngExp, ngSwitchWatchAction);
        }

        function ngSwitchWatchAction(value) {
          var i, ii;

          for (i = 0, ii = selectedScopes.length; i < ii; ++i) {
            var selected = getBlockNodes(selectedElements[i].clone);
            selectedScopes[i].$destroy();
            selected.remove();
          }

          selectedElements.length = 0;
          selectedScopes.length = 0;

          if (selectedTranscludes = ngSwitchController.cases['!' + value] || ngSwitchController.cases['?']) {
            forEach(selectedTranscludes, function (selectedTransclude) {
              selectedTransclude.transclude(function (caseElement, selectedScope) {
                selectedScopes.push(selectedScope);
                var anchor = selectedTransclude.element;
                caseElement[caseElement.length++] = $compile.$$createComment('end ngSwitchWhen');
                var block = {
                  clone: caseElement
                };
                selectedElements.push(block);
                domInsert(caseElement, anchor.parent(), anchor);
              });
            });
          }
        }
      }
    };
  }];
  var ngSwitchWhenDirective = ngDirective({
    transclude: 'element',
    priority: 1200,
    require: '^ngSwitch',
    multiElement: true,
    link: function (scope, element, attrs, ctrl, $transclude) {
      var cases = attrs.ngSwitchWhen.split(attrs.ngSwitchWhenSeparator).sort().filter(function (element, index, array) {
        return array[index - 1] !== element;
      });
      forEach(cases, function (whenCase) {
        ctrl.cases['!' + whenCase] = ctrl.cases['!' + whenCase] || [];
        ctrl.cases['!' + whenCase].push({
          transclude: $transclude,
          element: element
        });
      });
    }
  });
  var ngSwitchDefaultDirective = ngDirective({
    transclude: 'element',
    priority: 1200,
    require: '^ngSwitch',
    multiElement: true,
    link: function (scope, element, attr, ctrl, $transclude) {
      ctrl.cases['?'] = ctrl.cases['?'] || [];
      ctrl.cases['?'].push({
        transclude: $transclude,
        element: element
      });
    }
  });
  var ngTranscludeMinErr = minErr('ngTransclude');
  var ngTranscludeDirective = ['$compile', function ($compile) {
    return {
      restrict: 'EAC',
      compile: function ngTranscludeCompile(tElement) {
        var fallbackLinkFn = $compile(tElement.contents());
        tElement.empty();
        return function ngTranscludePostLink($scope, $element, $attrs, controller, $transclude) {
          if (!$transclude) {
            throw ngTranscludeMinErr('orphan', 'Illegal use of ngTransclude directive in the template! ' + 'No parent directive that requires a transclusion found. ' + 'Element: {0}', startingTag($element));
          }

          if ($attrs.ngTransclude === $attrs.$attr.ngTransclude) {
            $attrs.ngTransclude = '';
          }

          var slotName = $attrs.ngTransclude || $attrs.ngTranscludeSlot;
          $transclude(ngTranscludeCloneAttachFn, null, slotName);

          if (slotName && !$transclude.isSlotFilled(slotName)) {
            useFallbackContent();
          }

          function ngTranscludeCloneAttachFn(clone, transcludedScope) {
            if (clone.length && notWhitespace(clone)) {
              $element.append(clone);
            } else {
              useFallbackContent();
              transcludedScope.$destroy();
            }
          }

          function useFallbackContent() {
            fallbackLinkFn($scope, function (clone) {
              $element.append(clone);
            });
          }

          function notWhitespace(nodes) {
            for (var i = 0, ii = nodes.length; i < ii; i++) {
              var node = nodes[i];

              if (node.nodeType !== NODE_TYPE_TEXT || node.nodeValue.trim()) {
                return true;
              }
            }
          }
        };
      }
    };
  }];
  bindJQuery();
  publishExternalAPI(angular);
  jqLite(function () {
    angularInit(window.document, bootstrap);
  });
})(window);

!module.exports.angular.$$csp().noInlineStyle && module.exports.angular.element(document.head).prepend(module.exports.angular.element('<style>').text('@charset "UTF-8";\n\n[ng\\:cloak],\n[ng-cloak],\n[data-ng-cloak],\n[x-ng-cloak],\n.ng-cloak,\n.x-ng-cloak,\n.ng-hide:not(.ng-hide-animate) {\n  display: none !important;\n}\n\nng\\:form {\n  display: block;\n}\n\n.ng-animate-shim {\n  visibility:hidden;\n}\n\n.ng-anchor {\n  position:absolute;\n}\n'));