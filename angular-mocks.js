/**
 * @license AngularJS v1.8.1-local+sha.f49d70130
 * (c) 2010-2020 Google LLC. http://angularjs.org
 * License: MIT
 */
(function (window, angular) {
  'use strict';

  function routeToRegExp(path, opts) {
    var keys = [];
    var pattern = path.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)(\*\?|[?*])?/g, function (_, slash, key, option) {
      var optional = option === '?' || option === '*?';
      var star = option === '*' || option === '*?';
      keys.push({
        name: key,
        optional: optional
      });
      slash = slash || '';
      return (optional ? '(?:' + slash : slash + '(?:') + (star ? '(.+?)' : '([^/]+)') + (optional ? '?)?' : ')');
    }).replace(/([/$*])/g, '\\$1');

    if (opts.ignoreTrailingSlashes) {
      pattern = pattern.replace(/\/+$/, '') + '/*';
    }

    return {
      keys: keys,
      regexp: new RegExp('^' + pattern + '(?:[?#]|$)', opts.caseInsensitiveMatch ? 'i' : '')
    };
  }

  'use strict';

  angular.mock = {};

  angular.mock.$BrowserProvider = function () {
    this.$get = ['$log', '$$taskTrackerFactory', function ($log, $$taskTrackerFactory) {
      return new angular.mock.$Browser($log, $$taskTrackerFactory);
    }];
  };

  angular.mock.$Browser = function ($log, $$taskTrackerFactory) {
    var self = this;
    var taskTracker = $$taskTrackerFactory($log);
    this.isMock = true;
    self.$$url = 'http://server/';
    self.$$lastUrl = self.$$url;
    self.pollFns = [];
    self.$$completeOutstandingRequest = taskTracker.completeTask;
    self.$$incOutstandingRequestCount = taskTracker.incTaskCount;
    self.notifyWhenNoOutstandingRequests = taskTracker.notifyWhenNoPendingTasks;

    self.onUrlChange = function (listener) {
      self.pollFns.push(function () {
        if (self.$$lastUrl !== self.$$url || self.$$state !== self.$$lastState) {
          self.$$lastUrl = self.$$url;
          self.$$lastState = self.$$state;
          listener(self.$$url, self.$$state);
        }
      });
      return listener;
    };

    self.$$applicationDestroyed = angular.noop;
    self.$$checkUrlChange = angular.noop;
    self.deferredFns = [];
    self.deferredNextId = 0;

    self.defer = function (fn, delay, taskType) {
      var timeoutId = self.deferredNextId++;
      delay = delay || 0;
      taskType = taskType || taskTracker.DEFAULT_TASK_TYPE;
      taskTracker.incTaskCount(taskType);
      self.deferredFns.push({
        id: timeoutId,
        type: taskType,
        time: self.defer.now + delay,
        fn: fn
      });
      self.deferredFns.sort(function (a, b) {
        return a.time - b.time;
      });
      return timeoutId;
    };

    self.defer.now = 0;

    self.defer.cancel = function (deferId) {
      var taskIndex;
      angular.forEach(self.deferredFns, function (task, index) {
        if (task.id === deferId) taskIndex = index;
      });

      if (angular.isDefined(taskIndex)) {
        var task = self.deferredFns.splice(taskIndex, 1)[0];
        taskTracker.completeTask(angular.noop, task.type);
        return true;
      }

      return false;
    };

    self.defer.flush = function (delay) {
      var nextTime;

      if (angular.isDefined(delay)) {
        nextTime = self.defer.now + delay;
      } else if (self.deferredFns.length) {
        nextTime = self.deferredFns[self.deferredFns.length - 1].time;
      } else {
        throw new Error('No deferred tasks to be flushed');
      }

      while (self.deferredFns.length && self.deferredFns[0].time <= nextTime) {
        self.defer.now = self.deferredFns[0].time;
        var task = self.deferredFns.shift();
        taskTracker.completeTask(task.fn, task.type);
      }

      self.defer.now = nextTime;
    };

    self.defer.getPendingTasks = function (taskType) {
      return !taskType ? self.deferredFns : self.deferredFns.filter(function (task) {
        return task.type === taskType;
      });
    };

    self.defer.formatPendingTasks = function (pendingTasks) {
      return pendingTasks.map(function (task) {
        return '{id: ' + task.id + ', type: ' + task.type + ', time: ' + task.time + '}';
      });
    };

    self.defer.verifyNoPendingTasks = function (taskType) {
      var pendingTasks = self.defer.getPendingTasks(taskType);

      if (pendingTasks.length) {
        var formattedTasks = self.defer.formatPendingTasks(pendingTasks).join('\n  ');
        throw new Error('Deferred tasks to flush (' + pendingTasks.length + '):\n  ' + formattedTasks);
      }
    };

    self.$$baseHref = '/';

    self.baseHref = function () {
      return this.$$baseHref;
    };
  };

  angular.mock.$Browser.prototype = {
    poll: function poll() {
      angular.forEach(this.pollFns, function (pollFn) {
        pollFn();
      });
    },
    url: function (url, replace, state) {
      if (angular.isUndefined(state)) {
        state = null;
      }

      if (url) {
        this.$$url = url.replace(/#$/, '');
        this.$$state = angular.copy(state);
        return this;
      }

      return this.$$url;
    },
    state: function () {
      return this.$$state;
    }
  };

  angular.mock.$FlushPendingTasksProvider = function () {
    this.$get = ['$browser', function ($browser) {
      return function $flushPendingTasks(delay) {
        return $browser.defer.flush(delay);
      };
    }];
  };

  angular.mock.$VerifyNoPendingTasksProvider = function () {
    this.$get = ['$browser', function ($browser) {
      return function $verifyNoPendingTasks(taskType) {
        return $browser.defer.verifyNoPendingTasks(taskType);
      };
    }];
  };

  angular.mock.$ExceptionHandlerProvider = function () {
    var handler;

    this.mode = function (mode) {
      switch (mode) {
        case 'log':
        case 'rethrow':
          var errors = [];

          handler = function (e) {
            if (arguments.length === 1) {
              errors.push(e);
            } else {
              errors.push([].slice.call(arguments, 0));
            }

            if (mode === 'rethrow') {
              throw e;
            }
          };

          handler.errors = errors;
          break;

        default:
          throw new Error('Unknown mode \'' + mode + '\', only \'log\'/\'rethrow\' modes are allowed!');
      }
    };

    this.$get = function () {
      return handler;
    };

    this.mode('rethrow');
  };

  angular.mock.$LogProvider = function () {
    var debug = true;

    function concat(array1, array2, index) {
      return array1.concat(Array.prototype.slice.call(array2, index));
    }

    this.debugEnabled = function (flag) {
      if (angular.isDefined(flag)) {
        debug = flag;
        return this;
      } else {
        return debug;
      }
    };

    this.$get = function () {
      var $log = {
        log: function () {
          $log.log.logs.push(concat([], arguments, 0));
        },
        warn: function () {
          $log.warn.logs.push(concat([], arguments, 0));
        },
        info: function () {
          $log.info.logs.push(concat([], arguments, 0));
        },
        error: function () {
          $log.error.logs.push(concat([], arguments, 0));
        },
        debug: function () {
          if (debug) {
            $log.debug.logs.push(concat([], arguments, 0));
          }
        }
      };

      $log.reset = function () {
        $log.log.logs = [];
        $log.info.logs = [];
        $log.warn.logs = [];
        $log.error.logs = [];
        $log.debug.logs = [];
      };

      $log.assertEmpty = function () {
        var errors = [];
        angular.forEach(['error', 'warn', 'info', 'log', 'debug'], function (logLevel) {
          angular.forEach($log[logLevel].logs, function (log) {
            angular.forEach(log, function (logItem) {
              errors.push('MOCK $log (' + logLevel + '): ' + String(logItem) + '\n' + (logItem.stack || ''));
            });
          });
        });

        if (errors.length) {
          errors.unshift('Expected $log to be empty! Either a message was logged unexpectedly, or ' + 'an expected log message was not checked and removed:');
          errors.push('');
          throw new Error(errors.join('\n---------\n'));
        }
      };

      $log.reset();
      return $log;
    };
  };

  angular.mock.$IntervalProvider = function () {
    this.$get = ['$browser', '$$intervalFactory', function ($browser, $$intervalFactory) {
      var repeatFns = [],
          nextRepeatId = 0,
          now = 0,
          setIntervalFn = function (tick, delay, deferred, skipApply) {
        var id = nextRepeatId++;
        var fn = !skipApply ? tick : function () {
          tick();
          $browser.defer.flush();
        };
        repeatFns.push({
          nextTime: now + (delay || 0),
          delay: delay || 1,
          fn: fn,
          id: id,
          deferred: deferred
        });
        repeatFns.sort(function (a, b) {
          return a.nextTime - b.nextTime;
        });
        return id;
      },
          clearIntervalFn = function (id) {
        for (var fnIndex = repeatFns.length - 1; fnIndex >= 0; fnIndex--) {
          if (repeatFns[fnIndex].id === id) {
            repeatFns.splice(fnIndex, 1);
            break;
          }
        }
      };

      var $interval = $$intervalFactory(setIntervalFn, clearIntervalFn);

      $interval.cancel = function (promise) {
        if (!promise) return false;

        for (var fnIndex = repeatFns.length - 1; fnIndex >= 0; fnIndex--) {
          if (repeatFns[fnIndex].id === promise.$$intervalId) {
            var deferred = repeatFns[fnIndex].deferred;
            deferred.promise.then(undefined, function () {});
            deferred.reject('canceled');
            repeatFns.splice(fnIndex, 1);
            return true;
          }
        }

        return false;
      };

      $interval.flush = function (millis) {
        var before = now;
        now += millis;

        while (repeatFns.length && repeatFns[0].nextTime <= now) {
          var task = repeatFns[0];
          task.fn();

          if (task.nextTime === before) {
            task.nextTime++;
          }

          task.nextTime += task.delay;
          repeatFns.sort(function (a, b) {
            return a.nextTime - b.nextTime;
          });
        }

        return millis;
      };

      return $interval;
    }];
  };

  function jsonStringToDate(string) {
    var R_ISO8061_STR = /^(-?\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d{3}))?)?)?(Z|([+-])(\d\d):?(\d\d)))?$/;
    var match;

    if (match = string.match(R_ISO8061_STR)) {
      var date = new Date(0),
          tzHour = 0,
          tzMin = 0;

      if (match[9]) {
        tzHour = toInt(match[9] + match[10]);
        tzMin = toInt(match[9] + match[11]);
      }

      date.setUTCFullYear(toInt(match[1]), toInt(match[2]) - 1, toInt(match[3]));
      date.setUTCHours(toInt(match[4] || 0) - tzHour, toInt(match[5] || 0) - tzMin, toInt(match[6] || 0), toInt(match[7] || 0));
      return date;
    }

    return string;
  }

  function toInt(str) {
    return parseInt(str, 10);
  }

  function padNumberInMock(num, digits, trim) {
    var neg = '';

    if (num < 0) {
      neg = '-';
      num = -num;
    }

    num = '' + num;

    while (num.length < digits) num = '0' + num;

    if (trim) {
      num = num.substr(num.length - digits);
    }

    return neg + num;
  }

  angular.mock.TzDate = function (offset, timestamp) {
    var self = new Date(0);

    if (angular.isString(timestamp)) {
      var tsStr = timestamp;
      self.origDate = jsonStringToDate(timestamp);
      timestamp = self.origDate.getTime();

      if (isNaN(timestamp)) {
        throw {
          name: 'Illegal Argument',
          message: 'Arg \'' + tsStr + '\' passed into TzDate constructor is not a valid date string'
        };
      }
    } else {
      self.origDate = new Date(timestamp);
    }

    var localOffset = new Date(timestamp).getTimezoneOffset();
    self.offsetDiff = localOffset * 60 * 1000 - offset * 1000 * 60 * 60;
    self.date = new Date(timestamp + self.offsetDiff);

    self.getTime = function () {
      return self.date.getTime() - self.offsetDiff;
    };

    self.toLocaleDateString = function () {
      return self.date.toLocaleDateString();
    };

    self.getFullYear = function () {
      return self.date.getFullYear();
    };

    self.getMonth = function () {
      return self.date.getMonth();
    };

    self.getDate = function () {
      return self.date.getDate();
    };

    self.getHours = function () {
      return self.date.getHours();
    };

    self.getMinutes = function () {
      return self.date.getMinutes();
    };

    self.getSeconds = function () {
      return self.date.getSeconds();
    };

    self.getMilliseconds = function () {
      return self.date.getMilliseconds();
    };

    self.getTimezoneOffset = function () {
      return offset * 60;
    };

    self.getUTCFullYear = function () {
      return self.origDate.getUTCFullYear();
    };

    self.getUTCMonth = function () {
      return self.origDate.getUTCMonth();
    };

    self.getUTCDate = function () {
      return self.origDate.getUTCDate();
    };

    self.getUTCHours = function () {
      return self.origDate.getUTCHours();
    };

    self.getUTCMinutes = function () {
      return self.origDate.getUTCMinutes();
    };

    self.getUTCSeconds = function () {
      return self.origDate.getUTCSeconds();
    };

    self.getUTCMilliseconds = function () {
      return self.origDate.getUTCMilliseconds();
    };

    self.getDay = function () {
      return self.date.getDay();
    };

    if (self.toISOString) {
      self.toISOString = function () {
        return padNumberInMock(self.origDate.getUTCFullYear(), 4) + '-' + padNumberInMock(self.origDate.getUTCMonth() + 1, 2) + '-' + padNumberInMock(self.origDate.getUTCDate(), 2) + 'T' + padNumberInMock(self.origDate.getUTCHours(), 2) + ':' + padNumberInMock(self.origDate.getUTCMinutes(), 2) + ':' + padNumberInMock(self.origDate.getUTCSeconds(), 2) + '.' + padNumberInMock(self.origDate.getUTCMilliseconds(), 3) + 'Z';
      };
    }

    var unimplementedMethods = ['getUTCDay', 'getYear', 'setDate', 'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear', 'toDateString', 'toGMTString', 'toJSON', 'toLocaleFormat', 'toLocaleString', 'toLocaleTimeString', 'toSource', 'toString', 'toTimeString', 'toUTCString', 'valueOf'];
    angular.forEach(unimplementedMethods, function (methodName) {
      self[methodName] = function () {
        throw new Error('Method \'' + methodName + '\' is not implemented in the TzDate mock');
      };
    });
    return self;
  };

  angular.mock.TzDate.prototype = Date.prototype;
  angular.mock.animate = angular.module('ngAnimateMock', ['ng']).info({
    angularVersion: '1.8.1-local+sha.f49d70130'
  }).config(['$provide', function ($provide) {
    $provide.factory('$$forceReflow', function () {
      function reflowFn() {
        reflowFn.totalReflows++;
      }

      reflowFn.totalReflows = 0;
      return reflowFn;
    });
    $provide.factory('$$animateAsyncRun', function () {
      var queue = [];

      var queueFn = function () {
        return function (fn) {
          queue.push(fn);
        };
      };

      queueFn.flush = function () {
        if (queue.length === 0) return false;

        for (var i = 0; i < queue.length; i++) {
          queue[i]();
        }

        queue = [];
        return true;
      };

      return queueFn;
    });
    $provide.decorator('$$animateJs', ['$delegate', function ($delegate) {
      var runners = [];

      var animateJsConstructor = function () {
        var animator = $delegate.apply($delegate, arguments);

        if (animator) {
          runners.push(animator);
        }

        return animator;
      };

      animateJsConstructor.$closeAndFlush = function () {
        runners.forEach(function (runner) {
          runner.end();
        });
        runners = [];
      };

      return animateJsConstructor;
    }]);
    $provide.decorator('$animateCss', ['$delegate', function ($delegate) {
      var runners = [];

      var animateCssConstructor = function (element, options) {
        var animator = $delegate(element, options);
        runners.push(animator);
        return animator;
      };

      animateCssConstructor.$closeAndFlush = function () {
        runners.forEach(function (runner) {
          runner.end();
        });
        runners = [];
      };

      return animateCssConstructor;
    }]);
    $provide.decorator('$animate', ['$delegate', '$timeout', '$browser', '$animateCss', '$$animateJs', '$$forceReflow', '$$animateAsyncRun', '$rootScope', function ($delegate, $timeout, $browser, $animateCss, $$animateJs, $$forceReflow, $$animateAsyncRun, $rootScope) {
      var animate = {
        queue: [],
        cancel: $delegate.cancel,
        on: $delegate.on,
        off: $delegate.off,
        pin: $delegate.pin,

        get reflows() {
          return $$forceReflow.totalReflows;
        },

        enabled: $delegate.enabled,
        closeAndFlush: function () {
          this.flush(true);
          $animateCss.$closeAndFlush();
          $$animateJs.$closeAndFlush();
          this.flush();
        },
        flush: function (hideErrors) {
          $rootScope.$digest();
          var doNextRun,
              somethingFlushed = false;

          do {
            doNextRun = false;

            if ($$animateAsyncRun.flush()) {
              doNextRun = somethingFlushed = true;
            }
          } while (doNextRun);

          if (!somethingFlushed && !hideErrors) {
            throw new Error('No pending animations ready to be closed or flushed');
          }

          $rootScope.$digest();
        }
      };
      angular.forEach(['animate', 'enter', 'leave', 'move', 'addClass', 'removeClass', 'setClass'], function (method) {
        animate[method] = function () {
          animate.queue.push({
            event: method,
            element: arguments[0],
            options: arguments[arguments.length - 1],
            args: arguments
          });
          return $delegate[method].apply($delegate, arguments);
        };
      });
      return animate;
    }]);
  }]);

  angular.mock.dump = function (object) {
    return serialize(object);

    function serialize(object) {
      var out;

      if (angular.isElement(object)) {
        object = angular.element(object);
        out = angular.element('<div></div>');
        angular.forEach(object, function (element) {
          out.append(angular.element(element).clone());
        });
        out = out.html();
      } else if (angular.isArray(object)) {
        out = [];
        angular.forEach(object, function (o) {
          out.push(serialize(o));
        });
        out = '[ ' + out.join(', ') + ' ]';
      } else if (angular.isObject(object)) {
        if (angular.isFunction(object.$eval) && angular.isFunction(object.$apply)) {
          out = serializeScope(object);
        } else if (object instanceof Error) {
          out = object.stack || '' + object.name + ': ' + object.message;
        } else {
          out = angular.toJson(object, true);
        }
      } else {
        out = String(object);
      }

      return out;
    }

    function serializeScope(scope, offset) {
      offset = offset || '  ';
      var log = [offset + 'Scope(' + scope.$id + '): {'];

      for (var key in scope) {
        if (Object.prototype.hasOwnProperty.call(scope, key) && !key.match(/^(\$|this)/)) {
          log.push('  ' + key + ': ' + angular.toJson(scope[key]));
        }
      }

      var child = scope.$$childHead;

      while (child) {
        log.push(serializeScope(child, offset + '  '));
        child = child.$$nextSibling;
      }

      log.push('}');
      return log.join('\n' + offset);
    }
  };

  angular.mock.$httpBackendDecorator = ['$rootScope', '$timeout', '$delegate', createHttpBackendMock];

  function createHttpBackendMock($rootScope, $timeout, $delegate, $browser) {
    var definitions = [],
        expectations = [],
        matchLatestDefinition = false,
        responses = [],
        responsesPush = angular.bind(responses, responses.push),
        copy = angular.copy,
        originalHttpBackend = $delegate.$$originalHttpBackend || $delegate;

    function createResponse(status, data, headers, statusText) {
      if (angular.isFunction(status)) return status;
      return function () {
        return angular.isNumber(status) ? [status, data, headers, statusText, 'complete'] : [200, status, data, headers, 'complete'];
      };
    }

    function $httpBackend(method, url, data, callback, headers, timeout, withCredentials, responseType, eventHandlers, uploadEventHandlers) {
      var xhr = new MockXhr(),
          expectation = expectations[0],
          wasExpected = false;
      xhr.$$events = eventHandlers;
      xhr.upload.$$events = uploadEventHandlers;

      function prettyPrint(data) {
        return angular.isString(data) || angular.isFunction(data) || data instanceof RegExp ? data : angular.toJson(data);
      }

      function wrapResponse(wrapped) {
        if (!$browser && timeout) {
          if (timeout.then) {
            timeout.then(function () {
              handlePrematureEnd(angular.isDefined(timeout.$$timeoutId) ? 'timeout' : 'abort');
            });
          } else {
            $timeout(function () {
              handlePrematureEnd('timeout');
            }, timeout);
          }
        }

        handleResponse.description = method + ' ' + url;
        return handleResponse;

        function handleResponse() {
          var response = wrapped.response(method, url, data, headers, wrapped.params(url));
          xhr.$$respHeaders = response[2];
          callback(copy(response[0]), copy(response[1]), xhr.getAllResponseHeaders(), copy(response[3] || ''), copy(response[4]));
        }

        function handlePrematureEnd(reason) {
          for (var i = 0, ii = responses.length; i < ii; i++) {
            if (responses[i] === handleResponse) {
              responses.splice(i, 1);
              callback(-1, undefined, '', undefined, reason);
              break;
            }
          }
        }
      }

      function createFatalError(message) {
        var error = new Error(message);
        error.$$passToExceptionHandler = true;
        return error;
      }

      if (expectation && expectation.match(method, url)) {
        if (!expectation.matchData(data)) {
          throw createFatalError('Expected ' + expectation + ' with different data\n' + 'EXPECTED: ' + prettyPrint(expectation.data) + '\n' + 'GOT:      ' + data);
        }

        if (!expectation.matchHeaders(headers)) {
          throw createFatalError('Expected ' + expectation + ' with different headers\n' + 'EXPECTED: ' + prettyPrint(expectation.headers) + '\n' + 'GOT:      ' + prettyPrint(headers));
        }

        expectations.shift();

        if (expectation.response) {
          responses.push(wrapResponse(expectation));
          return;
        }

        wasExpected = true;
      }

      var i = matchLatestDefinition ? definitions.length : -1,
          definition;

      while (definition = definitions[matchLatestDefinition ? --i : ++i]) {
        if (definition.match(method, url, data, headers || {})) {
          if (definition.response) {
            ($browser ? $browser.defer : responsesPush)(wrapResponse(definition));
          } else if (definition.passThrough) {
            originalHttpBackend(method, url, data, callback, headers, timeout, withCredentials, responseType, eventHandlers, uploadEventHandlers);
          } else throw createFatalError('No response defined !');

          return;
        }
      }

      if (wasExpected) {
        throw createFatalError('No response defined !');
      }

      throw createFatalError('Unexpected request: ' + method + ' ' + url + '\n' + (expectation ? 'Expected ' + expectation : 'No more request expected'));
    }

    $httpBackend.when = function (method, url, data, headers, keys) {
      assertArgDefined(arguments, 1, 'url');
      var definition = new MockHttpExpectation(method, url, data, headers, keys),
          chain = {
        respond: function (status, data, headers, statusText) {
          definition.passThrough = undefined;
          definition.response = createResponse(status, data, headers, statusText);
          return chain;
        }
      };

      if ($browser) {
        chain.passThrough = function () {
          definition.response = undefined;
          definition.passThrough = true;
          return chain;
        };
      }

      definitions.push(definition);
      return chain;
    };

    $httpBackend.matchLatestDefinitionEnabled = function (value) {
      if (angular.isDefined(value)) {
        matchLatestDefinition = value;
        return this;
      } else {
        return matchLatestDefinition;
      }
    };

    createShortMethods('when');

    $httpBackend.whenRoute = function (method, url) {
      var parsed = parseRouteUrl(url);
      return $httpBackend.when(method, parsed.regexp, undefined, undefined, parsed.keys);
    };

    $httpBackend.expect = function (method, url, data, headers, keys) {
      assertArgDefined(arguments, 1, 'url');
      var expectation = new MockHttpExpectation(method, url, data, headers, keys),
          chain = {
        respond: function (status, data, headers, statusText) {
          expectation.response = createResponse(status, data, headers, statusText);
          return chain;
        }
      };
      expectations.push(expectation);
      return chain;
    };

    createShortMethods('expect');

    $httpBackend.expectRoute = function (method, url) {
      var parsed = parseRouteUrl(url);
      return $httpBackend.expect(method, parsed.regexp, undefined, undefined, parsed.keys);
    };

    $httpBackend.flush = function (count, skip, digest) {
      if (digest !== false) $rootScope.$digest();
      skip = skip || 0;
      if (skip >= responses.length) throw new Error('No pending request to flush !');

      if (angular.isDefined(count) && count !== null) {
        while (count--) {
          var part = responses.splice(skip, 1);
          if (!part.length) throw new Error('No more pending request to flush !');
          part[0]();
        }
      } else {
        while (responses.length > skip) {
          responses.splice(skip, 1)[0]();
        }
      }

      $httpBackend.verifyNoOutstandingExpectation(digest);
    };

    $httpBackend.verifyNoOutstandingExpectation = function (digest) {
      if (digest !== false) $rootScope.$digest();

      if (expectations.length) {
        throw new Error('Unsatisfied requests: ' + expectations.join(', '));
      }
    };

    $httpBackend.verifyNoOutstandingRequest = function (digest) {
      if (digest !== false) $rootScope.$digest();

      if (responses.length) {
        var unflushedDescriptions = responses.map(function (res) {
          return res.description;
        });
        throw new Error('Unflushed requests: ' + responses.length + '\n  ' + unflushedDescriptions.join('\n  '));
      }
    };

    $httpBackend.resetExpectations = function () {
      expectations.length = 0;
      responses.length = 0;
    };

    $httpBackend.$$originalHttpBackend = originalHttpBackend;
    return $httpBackend;

    function createShortMethods(prefix) {
      angular.forEach(['GET', 'DELETE', 'JSONP', 'HEAD'], function (method) {
        $httpBackend[prefix + method] = function (url, headers, keys) {
          assertArgDefined(arguments, 0, 'url');
          if (angular.isUndefined(url)) url = null;
          return $httpBackend[prefix](method, url, undefined, headers, keys);
        };
      });
      angular.forEach(['PUT', 'POST', 'PATCH'], function (method) {
        $httpBackend[prefix + method] = function (url, data, headers, keys) {
          assertArgDefined(arguments, 0, 'url');
          if (angular.isUndefined(url)) url = null;
          return $httpBackend[prefix](method, url, data, headers, keys);
        };
      });
    }

    function parseRouteUrl(url) {
      var strippedUrl = stripQueryAndHash(url);
      var parseOptions = {
        caseInsensitiveMatch: true,
        ignoreTrailingSlashes: true
      };
      return routeToRegExp(strippedUrl, parseOptions);
    }
  }

  function assertArgDefined(args, index, name) {
    if (args.length > index && angular.isUndefined(args[index])) {
      throw new Error('Undefined argument `' + name + '`; the argument is provided but not defined');
    }
  }

  function stripQueryAndHash(url) {
    return url.replace(/[?#].*$/, '');
  }

  function MockHttpExpectation(expectedMethod, expectedUrl, expectedData, expectedHeaders, expectedKeys) {
    this.data = expectedData;
    this.headers = expectedHeaders;

    this.match = function (method, url, data, headers) {
      if (expectedMethod !== method) return false;
      if (!this.matchUrl(url)) return false;
      if (angular.isDefined(data) && !this.matchData(data)) return false;
      if (angular.isDefined(headers) && !this.matchHeaders(headers)) return false;
      return true;
    };

    this.matchUrl = function (url) {
      if (!expectedUrl) return true;
      if (angular.isFunction(expectedUrl.test)) return expectedUrl.test(url);
      if (angular.isFunction(expectedUrl)) return expectedUrl(url);
      return expectedUrl === url || compareUrlWithQuery(url);
    };

    this.matchHeaders = function (headers) {
      if (angular.isUndefined(expectedHeaders)) return true;
      if (angular.isFunction(expectedHeaders)) return expectedHeaders(headers);
      return angular.equals(expectedHeaders, headers);
    };

    this.matchData = function (data) {
      if (angular.isUndefined(expectedData)) return true;
      if (expectedData && angular.isFunction(expectedData.test)) return expectedData.test(data);
      if (expectedData && angular.isFunction(expectedData)) return expectedData(data);

      if (expectedData && !angular.isString(expectedData)) {
        return angular.equals(angular.fromJson(angular.toJson(expectedData)), angular.fromJson(data));
      }

      return expectedData == data;
    };

    this.toString = function () {
      return expectedMethod + ' ' + expectedUrl;
    };

    this.params = function (url) {
      var queryStr = url.indexOf('?') === -1 ? '' : url.substring(url.indexOf('?') + 1);
      var strippedUrl = stripQueryAndHash(url);
      return angular.extend(extractParamsFromQuery(queryStr), extractParamsFromPath(strippedUrl));
    };

    function compareUrlWithQuery(url) {
      var urlWithQueryRe = /^([^?]*)\?(.*)$/;
      var expectedMatch = urlWithQueryRe.exec(expectedUrl);
      var actualMatch = urlWithQueryRe.exec(url);
      return !!(expectedMatch && actualMatch) && expectedMatch[1] === actualMatch[1] && normalizeQuery(expectedMatch[2]) === normalizeQuery(actualMatch[2]);
    }

    function normalizeQuery(queryStr) {
      return queryStr.split('&').sort().join('&');
    }

    function extractParamsFromPath(strippedUrl) {
      var keyObj = {};
      if (!expectedUrl || !angular.isFunction(expectedUrl.test) || !expectedKeys || !expectedKeys.length) return keyObj;
      var match = expectedUrl.exec(strippedUrl);
      if (!match) return keyObj;

      for (var i = 1, len = match.length; i < len; ++i) {
        var key = expectedKeys[i - 1];
        var val = match[i];

        if (key && val) {
          keyObj[key.name || key] = val;
        }
      }

      return keyObj;
    }

    function extractParamsFromQuery(queryStr) {
      var obj = {},
          keyValuePairs = queryStr.split('&').filter(angular.identity).map(function (keyValue) {
        return keyValue.replace(/\+/g, '%20').split('=');
      });
      angular.forEach(keyValuePairs, function (pair) {
        var key = tryDecodeURIComponent(pair[0]);

        if (angular.isDefined(key)) {
          var val = angular.isDefined(pair[1]) ? tryDecodeURIComponent(pair[1]) : true;

          if (!hasOwnProperty.call(obj, key)) {
            obj[key] = val;
          } else if (angular.isArray(obj[key])) {
            obj[key].push(val);
          } else {
            obj[key] = [obj[key], val];
          }
        }
      });
      return obj;
    }

    function tryDecodeURIComponent(value) {
      try {
        return decodeURIComponent(value);
      } catch (e) {}
    }
  }

  function createMockXhr() {
    return new MockXhr();
  }

  function MockXhr() {
    MockXhr.$$lastInstance = this;

    this.open = function (method, url, async) {
      this.$$method = method;
      this.$$url = url;
      this.$$async = async;
      this.$$reqHeaders = {};
      this.$$respHeaders = {};
    };

    this.send = function (data) {
      this.$$data = data;
    };

    this.setRequestHeader = function (key, value) {
      this.$$reqHeaders[key] = value;
    };

    this.getResponseHeader = function (name) {
      var header = this.$$respHeaders[name];
      if (header) return header;
      name = angular.$$lowercase(name);
      header = this.$$respHeaders[name];
      if (header) return header;
      header = undefined;
      angular.forEach(this.$$respHeaders, function (headerVal, headerName) {
        if (!header && angular.$$lowercase(headerName) === name) header = headerVal;
      });
      return header;
    };

    this.getAllResponseHeaders = function () {
      var lines = [];
      angular.forEach(this.$$respHeaders, function (value, key) {
        lines.push(key + ': ' + value);
      });
      return lines.join('\n');
    };

    this.abort = function () {
      if (isFunction(this.onabort)) {
        this.onabort();
      }
    };

    this.$$events = {};

    this.addEventListener = function (name, listener) {
      if (angular.isUndefined(this.$$events[name])) this.$$events[name] = [];
      this.$$events[name].push(listener);
    };

    this.upload = {
      $$events: {},
      addEventListener: this.addEventListener
    };
  }

  angular.mock.$TimeoutDecorator = ['$delegate', '$browser', function ($delegate, $browser) {
    $delegate.flush = function (delay) {
      $browser.defer.flush(delay);
    };

    $delegate.verifyNoPendingTasks = function () {
      var pendingTasks = $browser.defer.getPendingTasks();

      if (pendingTasks.length) {
        var formattedTasks = $browser.defer.formatPendingTasks(pendingTasks).join('\n  ');
        var hasPendingTimeout = pendingTasks.some(function (task) {
          return task.type === '$timeout';
        });
        var extraMessage = hasPendingTimeout ? '' : '\n\nNone of the pending tasks are timeouts. ' + 'If you only want to verify pending timeouts, use ' + '`$verifyNoPendingTasks(\'$timeout\')` instead.';
        throw new Error('Deferred tasks to flush (' + pendingTasks.length + '):\n  ' + formattedTasks + extraMessage);
      }
    };

    return $delegate;
  }];
  var originalRootElement;

  angular.mock.$RootElementProvider = function () {
    this.$get = ['$injector', function ($injector) {
      originalRootElement = angular.element('<div ng-app></div>').data('$injector', $injector);
      return originalRootElement;
    }];
  };

  function createControllerDecorator() {
    angular.mock.$ControllerDecorator = ['$delegate', function ($delegate) {
      return function (expression, locals, later, ident) {
        if (later && typeof later === 'object') {
          var instantiate = $delegate(expression, locals, true, ident);
          var instance = instantiate();
          angular.extend(instance, later);
          return instance;
        }

        return $delegate(expression, locals, later, ident);
      };
    }];
    return angular.mock.$ControllerDecorator;
  }

  angular.mock.$ComponentControllerProvider = ['$compileProvider', function ComponentControllerProvider($compileProvider) {
    this.$get = ['$controller', '$injector', '$rootScope', function ($controller, $injector, $rootScope) {
      return function $componentController(componentName, locals, bindings, ident) {
        var directives = $injector.get(componentName + 'Directive');
        var candidateDirectives = directives.filter(function (directiveInfo) {
          return directiveInfo.controller && directiveInfo.controllerAs && directiveInfo.restrict === 'E';
        });

        if (candidateDirectives.length === 0) {
          throw new Error('No component found');
        }

        if (candidateDirectives.length > 1) {
          throw new Error('Too many components found');
        }

        var directiveInfo = candidateDirectives[0];
        locals = locals || {};
        locals.$scope = locals.$scope || $rootScope.$new(true);
        return $controller(directiveInfo.controller, locals, bindings, ident || directiveInfo.controllerAs);
      };
    }];
  }];
  angular.module('ngMock', ['ng']).provider({
    $browser: angular.mock.$BrowserProvider,
    $exceptionHandler: angular.mock.$ExceptionHandlerProvider,
    $log: angular.mock.$LogProvider,
    $interval: angular.mock.$IntervalProvider,
    $rootElement: angular.mock.$RootElementProvider,
    $componentController: angular.mock.$ComponentControllerProvider,
    $flushPendingTasks: angular.mock.$FlushPendingTasksProvider,
    $verifyNoPendingTasks: angular.mock.$VerifyNoPendingTasksProvider
  }).config(['$provide', '$compileProvider', function ($provide, $compileProvider) {
    $provide.decorator('$timeout', angular.mock.$TimeoutDecorator);
    $provide.decorator('$rootScope', angular.mock.$RootScopeDecorator);
    $provide.decorator('$controller', createControllerDecorator($compileProvider));
    $provide.decorator('$httpBackend', angular.mock.$httpBackendDecorator);
  }]).info({
    angularVersion: '1.8.1-local+sha.f49d70130'
  });
  angular.module('ngMockE2E', ['ng']).config(['$provide', function ($provide) {
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
  }]).info({
    angularVersion: '1.8.1-local+sha.f49d70130'
  });
  angular.mock.e2e = {};
  angular.mock.e2e.$httpBackendDecorator = ['$rootScope', '$timeout', '$delegate', '$browser', createHttpBackendMock];
  angular.mock.$RootScopeDecorator = ['$delegate', function ($delegate) {
    var $rootScopePrototype = Object.getPrototypeOf($delegate);
    $rootScopePrototype.$countChildScopes = countChildScopes;
    $rootScopePrototype.$countWatchers = countWatchers;
    return $delegate;

    function countChildScopes() {
      var count = 0;
      var pendingChildHeads = [this.$$childHead];
      var currentScope;

      while (pendingChildHeads.length) {
        currentScope = pendingChildHeads.shift();

        while (currentScope) {
          count += 1;
          pendingChildHeads.push(currentScope.$$childHead);
          currentScope = currentScope.$$nextSibling;
        }
      }

      return count;
    }

    function countWatchers() {
      var count = this.$$watchers ? this.$$watchers.length : 0;
      var pendingChildHeads = [this.$$childHead];
      var currentScope;

      while (pendingChildHeads.length) {
        currentScope = pendingChildHeads.shift();

        while (currentScope) {
          count += currentScope.$$watchers ? currentScope.$$watchers.length : 0;
          pendingChildHeads.push(currentScope.$$childHead);
          currentScope = currentScope.$$nextSibling;
        }
      }

      return count;
    }
  }];

  (function (jasmineOrMocha) {
    if (!jasmineOrMocha) {
      return;
    }

    var currentSpec = null,
        injectorState = new InjectorState(),
        annotatedFunctions = [],
        wasInjectorCreated = function () {
      return !!currentSpec;
    };

    angular.mock.$$annotate = angular.injector.$$annotate;

    angular.injector.$$annotate = function (fn) {
      if (typeof fn === 'function' && !fn.$inject) {
        annotatedFunctions.push(fn);
      }

      return angular.mock.$$annotate.apply(this, arguments);
    };

    var module = window.module = angular.mock.module = function () {
      var moduleFns = Array.prototype.slice.call(arguments, 0);
      return wasInjectorCreated() ? workFn() : workFn;

      function workFn() {
        if (currentSpec.$injector) {
          throw new Error('Injector already created, can not register a module!');
        } else {
          var fn,
              modules = currentSpec.$modules || (currentSpec.$modules = []);
          angular.forEach(moduleFns, function (module) {
            if (angular.isObject(module) && !angular.isArray(module)) {
              fn = ['$provide', function ($provide) {
                angular.forEach(module, function (value, key) {
                  $provide.value(key, value);
                });
              }];
            } else {
              fn = module;
            }

            if (currentSpec.$providerInjector) {
              currentSpec.$providerInjector.invoke(fn);
            } else {
              modules.push(fn);
            }
          });
        }
      }
    };

    module.$$beforeAllHook = window.before || window.beforeAll;
    module.$$afterAllHook = window.after || window.afterAll;

    module.$$currentSpec = function (to) {
      if (arguments.length === 0) return to;
      currentSpec = to;
    };

    module.sharedInjector = function () {
      if (!(module.$$beforeAllHook && module.$$afterAllHook)) {
        throw Error('sharedInjector() cannot be used unless your test runner defines beforeAll/afterAll');
      }

      var initialized = false;
      module.$$beforeAllHook(function () {
        if (injectorState.shared) {
          injectorState.sharedError = Error('sharedInjector() cannot be called inside a context that has already called sharedInjector()');
          throw injectorState.sharedError;
        }

        initialized = true;
        currentSpec = this;
        injectorState.shared = true;
      });
      module.$$afterAllHook(function () {
        if (initialized) {
          injectorState = new InjectorState();
          module.$$cleanup();
        } else {
          injectorState.sharedError = null;
        }
      });
    };

    module.$$beforeEach = function () {
      if (injectorState.shared && currentSpec && currentSpec !== this) {
        var state = currentSpec;
        currentSpec = this;
        angular.forEach(['$injector', '$modules', '$providerInjector', '$injectorStrict'], function (k) {
          currentSpec[k] = state[k];
          state[k] = null;
        });
      } else {
        currentSpec = this;
        originalRootElement = null;
        annotatedFunctions = [];
      }
    };

    module.$$afterEach = function () {
      if (injectorState.cleanupAfterEach()) {
        module.$$cleanup();
      }
    };

    module.$$cleanup = function () {
      var injector = currentSpec.$injector;
      annotatedFunctions.forEach(function (fn) {
        delete fn.$inject;
      });
      currentSpec.$injector = null;
      currentSpec.$modules = null;
      currentSpec.$providerInjector = null;
      currentSpec = null;

      if (injector) {
        var $rootElement = injector.get('$rootElement');
        var rootNode = $rootElement && $rootElement[0];
        var cleanUpNodes = !originalRootElement ? [] : [originalRootElement[0]];

        if (rootNode && (!originalRootElement || rootNode !== originalRootElement[0])) {
          cleanUpNodes.push(rootNode);
        }

        angular.element.cleanData(cleanUpNodes);
        var $rootScope = injector.get('$rootScope');
        if ($rootScope && $rootScope.$destroy) $rootScope.$destroy();
      }

      angular.forEach(angular.element.fragments, function (val, key) {
        delete angular.element.fragments[key];
      });
      MockXhr.$$lastInstance = null;
      angular.forEach(angular.callbacks, function (val, key) {
        delete angular.callbacks[key];
      });
      angular.callbacks.$$counter = 0;
    };

    (window.beforeEach || window.setup)(module.$$beforeEach);
    (window.afterEach || window.teardown)(module.$$afterEach);

    var ErrorAddingDeclarationLocationStack = function ErrorAddingDeclarationLocationStack(e, errorForStack) {
      this.message = e.message;
      this.name = e.name;
      if (e.line) this.line = e.line;
      if (e.sourceId) this.sourceId = e.sourceId;
      if (e.stack && errorForStack) this.stack = e.stack + '\n' + errorForStack.stack;
      if (e.stackArray) this.stackArray = e.stackArray;
    };

    ErrorAddingDeclarationLocationStack.prototype = Error.prototype;

    window.inject = angular.mock.inject = function () {
      var blockFns = Array.prototype.slice.call(arguments, 0);
      var errorForStack = new Error('Declaration Location');

      if (!errorForStack.stack) {
        try {
          throw errorForStack;
        } catch (e) {}
      }

      return wasInjectorCreated() ? WorkFn.call(currentSpec) : WorkFn;

      function WorkFn() {
        var modules = currentSpec.$modules || [];
        var strictDi = !!currentSpec.$injectorStrict;
        modules.unshift(['$injector', function ($injector) {
          currentSpec.$providerInjector = $injector;
        }]);
        modules.unshift('ngMock');
        modules.unshift('ng');
        var injector = currentSpec.$injector;

        if (!injector) {
          if (strictDi) {
            angular.forEach(modules, function (moduleFn) {
              if (typeof moduleFn === 'function') {
                angular.injector.$$annotate(moduleFn);
              }
            });
          }

          injector = currentSpec.$injector = angular.injector(modules, strictDi);
          currentSpec.$injectorStrict = strictDi;
        }

        for (var i = 0, ii = blockFns.length; i < ii; i++) {
          if (currentSpec.$injectorStrict) {
            injector.annotate(blockFns[i]);
          }

          try {
            injector.invoke(blockFns[i] || angular.noop, this);
          } catch (e) {
            if (e.stack && errorForStack) {
              throw new ErrorAddingDeclarationLocationStack(e, errorForStack);
            }

            throw e;
          } finally {
            errorForStack = null;
          }
        }
      }
    };

    angular.mock.inject.strictDi = function (value) {
      value = arguments.length ? !!value : true;
      return wasInjectorCreated() ? workFn() : workFn;

      function workFn() {
        if (value !== currentSpec.$injectorStrict) {
          if (currentSpec.$injector) {
            throw new Error('Injector already created, can not modify strict annotations');
          } else {
            currentSpec.$injectorStrict = value;
          }
        }
      }
    };

    function InjectorState() {
      this.shared = false;
      this.sharedError = null;

      this.cleanupAfterEach = function () {
        return !this.shared || this.sharedError;
      };
    }
  })(window.jasmine || window.mocha);

  'use strict';

  (function () {
    window.browserTrigger = function browserTrigger(element, eventType, eventData) {
      if (element && !element.nodeName) element = element[0];
      if (!element) return;
      eventData = eventData || {};
      var relatedTarget = eventData.relatedTarget || element;
      var keys = eventData.keys;
      var x = eventData.x;
      var y = eventData.y;
      var inputType = element.type ? element.type.toLowerCase() : null,
          nodeName = element.nodeName.toLowerCase();

      if (!eventType) {
        eventType = {
          'text': 'change',
          'textarea': 'change',
          'hidden': 'change',
          'password': 'change',
          'button': 'click',
          'submit': 'click',
          'reset': 'click',
          'image': 'click',
          'checkbox': 'click',
          'radio': 'click',
          'select-one': 'change',
          'select-multiple': 'change',
          '_default_': 'click'
        }[inputType || '_default_'];
      }

      if (nodeName === 'option') {
        element.parentNode.value = element.value;
        element = element.parentNode;
        eventType = 'change';
      }

      keys = keys || [];

      function pressed(key) {
        return keys.indexOf(key) !== -1;
      }

      var evnt;

      if (/transitionend/.test(eventType)) {
        if (window.WebKitTransitionEvent) {
          evnt = new window.WebKitTransitionEvent(eventType, eventData);
          evnt.initEvent(eventType, eventData.bubbles, true);
        } else {
          try {
            evnt = new window.TransitionEvent(eventType, eventData);
          } catch (e) {
            evnt = window.document.createEvent('TransitionEvent');
            evnt.initTransitionEvent(eventType, eventData.bubbles, null, null, eventData.elapsedTime || 0);
          }
        }
      } else if (/animationend/.test(eventType)) {
        if (window.WebKitAnimationEvent) {
          evnt = new window.WebKitAnimationEvent(eventType, eventData);
          evnt.initEvent(eventType, eventData.bubbles, true);
        } else {
          try {
            evnt = new window.AnimationEvent(eventType, eventData);
          } catch (e) {
            evnt = window.document.createEvent('AnimationEvent');
            evnt.initAnimationEvent(eventType, eventData.bubbles, null, null, eventData.elapsedTime || 0);
          }
        }
      } else if (/touch/.test(eventType) && supportsTouchEvents()) {
        evnt = createTouchEvent(element, eventType, x, y);
      } else if (/key/.test(eventType)) {
        evnt = window.document.createEvent('Events');
        evnt.initEvent(eventType, eventData.bubbles, eventData.cancelable);
        evnt.view = window;
        evnt.ctrlKey = pressed('ctrl');
        evnt.altKey = pressed('alt');
        evnt.shiftKey = pressed('shift');
        evnt.metaKey = pressed('meta');
        evnt.keyCode = eventData.keyCode;
        evnt.charCode = eventData.charCode;
        evnt.which = eventData.which;
      } else if (/composition/.test(eventType)) {
        try {
          evnt = new window.CompositionEvent(eventType, {
            data: eventData.data
          });
        } catch (e) {
          evnt = window.document.createEvent('CompositionEvent', {});
          evnt.initCompositionEvent(eventType, eventData.bubbles, eventData.cancelable, window, eventData.data, null);
        }
      } else {
        evnt = window.document.createEvent('MouseEvents');
        x = x || 0;
        y = y || 0;
        evnt.initMouseEvent(eventType, true, true, window, 0, x, y, x, y, pressed('ctrl'), pressed('alt'), pressed('shift'), pressed('meta'), 0, relatedTarget);
      }

      evnt.$manualTimeStamp = eventData.timeStamp;
      if (!evnt) return;

      if (!eventData.bubbles || supportsEventBubblingInDetachedTree() || isAttachedToDocument(element)) {
        return element.dispatchEvent(evnt);
      } else {
        triggerForPath(element, evnt);
      }
    };

    function supportsTouchEvents() {
      if ('_cached' in supportsTouchEvents) {
        return supportsTouchEvents._cached;
      }

      if (!window.document.createTouch || !window.document.createTouchList) {
        supportsTouchEvents._cached = false;
        return false;
      }

      try {
        window.document.createEvent('TouchEvent');
      } catch (e) {
        supportsTouchEvents._cached = false;
        return false;
      }

      supportsTouchEvents._cached = true;
      return true;
    }

    function createTouchEvent(element, eventType, x, y) {
      var evnt = new window.Event(eventType);
      x = x || 0;
      y = y || 0;
      var touch = window.document.createTouch(window, element, Date.now(), x, y, x, y);
      var touches = window.document.createTouchList(touch);
      evnt.touches = touches;
      return evnt;
    }

    function supportsEventBubblingInDetachedTree() {
      if ('_cached' in supportsEventBubblingInDetachedTree) {
        return supportsEventBubblingInDetachedTree._cached;
      }

      supportsEventBubblingInDetachedTree._cached = false;
      var doc = window.document;

      if (doc) {
        var parent = doc.createElement('div'),
            child = parent.cloneNode();
        parent.appendChild(child);
        parent.addEventListener('e', function () {
          supportsEventBubblingInDetachedTree._cached = true;
        });
        var evnt = window.document.createEvent('Events');
        evnt.initEvent('e', true, true);
        child.dispatchEvent(evnt);
      }

      return supportsEventBubblingInDetachedTree._cached;
    }

    function triggerForPath(element, evnt) {
      var stop = false;
      var _stopPropagation = evnt.stopPropagation;

      evnt.stopPropagation = function () {
        stop = true;

        _stopPropagation.apply(evnt, arguments);
      };

      patchEventTargetForBubbling(evnt, element);

      do {
        element.dispatchEvent(evnt);
      } while (!stop && (element = element.parentNode));
    }

    function patchEventTargetForBubbling(event, target) {
      event._target = target;
      Object.defineProperty(event, 'target', {
        get: function () {
          return this._target;
        }
      });
    }

    function isAttachedToDocument(element) {
      while (element = element.parentNode) {
        if (element === window) {
          return true;
        }
      }

      return false;
    }
  })();
})(window, require('angular'));