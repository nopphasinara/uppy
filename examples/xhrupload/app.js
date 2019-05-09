(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

var fingerprint = require('./lib/fingerprint.js');
var pad = require('./lib/pad.js');
var getRandomValue = require('./lib/getRandomValue.js');

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock () {
  return pad((getRandomValue() *
    discreteValues << 0)
    .toString(base), blockSize);
}

function safeCounter () {
  c = c < discreteValues ? c : 0;
  c++; // this is not subliminal
  return c - 1;
}

function cuid () {
  // Starting with a lowercase letter makes
  // it HTML element ID friendly.
  var letter = 'c', // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = (new Date().getTime()).toString(base),

    // Prevent same-machine collisions.
    counter = pad(safeCounter().toString(base), blockSize),

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug () {
  var date = new Date().getTime().toString(36),
    counter = safeCounter().toString(36).slice(-4),
    print = fingerprint().slice(0, 1) +
      fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) +
    counter + print + random;
};

cuid.isCuid = function isCuid (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  if (stringToCheck.startsWith('c')) return true;
  return false;
};

cuid.isSlug = function isSlug (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  var stringLength = stringToCheck.length;
  if (stringLength >= 7 && stringLength <= 10) return true;
  return false;
};

cuid.fingerprint = fingerprint;

module.exports = cuid;

},{"./lib/fingerprint.js":2,"./lib/getRandomValue.js":3,"./lib/pad.js":4}],2:[function(require,module,exports){
var pad = require('./pad.js');

var env = typeof window === 'object' ? window : self;
var globalCount = Object.keys(env).length;
var mimeTypesLength = navigator.mimeTypes ? navigator.mimeTypes.length : 0;
var clientId = pad((mimeTypesLength +
  navigator.userAgent.length).toString(36) +
  globalCount.toString(36), 4);

module.exports = function fingerprint () {
  return clientId;
};

},{"./pad.js":4}],3:[function(require,module,exports){

var getRandomValue;

var crypto = window.crypto || window.msCrypto;

if (crypto) {
    var lim = Math.pow(2, 32) - 1;
    getRandomValue = function () {
        return Math.abs(crypto.getRandomValues(new Uint32Array(1))[0] / lim);
    };
} else {
    getRandomValue = Math.random;
}

module.exports = getRandomValue;

},{}],4:[function(require,module,exports){
module.exports = function pad (num, size) {
  var s = '000000000' + num;
  return s.substr(s.length - size);
};

},{}],5:[function(require,module,exports){
// This file can be required in Browserify and Node.js for automatic polyfill
// To use it:  require('es6-promise/auto');
'use strict';
module.exports = require('./').polyfill();

},{"./":6}],6:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.5+7f2b526d
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var TRY_CATCH_ERROR = { error: null };

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    TRY_CATCH_ERROR.error = error;
    return TRY_CATCH_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === TRY_CATCH_ERROR) {
      reject(promise, TRY_CATCH_ERROR.error);
      TRY_CATCH_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = void 0,
      failed = void 0;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = getThen(entry);

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        handleMaybeThenable(promise, entry, _then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":40}],7:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
var wildcard = require('wildcard');
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
module.exports = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

},{"wildcard":13}],9:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = {}
  var _fns = emitter._fns = {}

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event)

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6])
    }
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = []
    }

    _fns[event].push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      var fns = this._fns[event]
      var i = 0
      var l = fns ? fns.length : 0

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : []
    var idx = e.indexOf(':')
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)]

    var keys = Object.keys(_fns)
    var i = 0
    var l = keys.length

    for (i; i < l; i++) {
      var key = keys[i]
      if (key === '*') {
        out = out.concat(_fns[key])
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key])
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0
    var l = fns.length

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],10:[function(require,module,exports){
!function() {
    'use strict';
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if ('boolean' == typeof child) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function applyRef(ref, value) {
        if (null != ref) if ('function' == typeof ref) ref(value); else ref.current = value;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p;
        while (p = items.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        var parentNode = node.parentNode;
        if (parentNode) parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            applyRef(old, null);
            applyRef(value, node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !1 === IS_NON_DIMENSIONAL.test(i) ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            try {
                node[name] = null == value ? '' : value;
            } catch (e) {}
            if ((null == value || !1 === value) && 'spellcheck' != name) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));
            if (null == value || !1 === value) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.shift()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode || 'boolean' == typeof vnode) vnode = '';
        if ('string' == typeof vnode || 'number' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        var vnodeName = vnode.nodeName;
        if ('function' == typeof vnodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnodeName ? !0 : 'foreignObject' === vnodeName ? !1 : isSvgMode;
        vnodeName = String(vnodeName);
        if (!dom || !isNamedNode(dom, vnodeName)) {
            out = createNode(vnodeName, isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_, vchildren = vnode.children;
        if (null == props) {
            props = out.__preactattr_ = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, f, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            f = originalChildren[i];
            if (child && child !== dom && child !== f) if (null == f) dom.appendChild(child); else if (child === f.nextSibling) removeNode(f); else dom.insertBefore(child, f);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_) applyRef(node.__preactattr_.ref, null);
            if (!1 === unmountOnly || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function createComponent(Ctor, props, context) {
        var inst, i = recyclerComponents.length;
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        while (i--) if (recyclerComponents[i].constructor === Ctor) {
            inst.__b = recyclerComponents[i].__b;
            recyclerComponents.splice(i, 1);
            return inst;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, renderMode, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            component.__r = props.ref;
            component.__k = props.key;
            delete props.ref;
            delete props.key;
            if (void 0 === component.constructor.getDerivedStateFromProps) if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== renderMode) if (1 === renderMode || !1 !== options.syncComponentUpdates || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            applyRef(component.__r, component);
        }
    }
    function renderComponent(component, renderMode, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1, snapshot = previousContext;
            if (component.constructor.getDerivedStateFromProps) {
                state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
                component.state = state;
            }
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== renderMode && component.shouldComponentUpdate && !1 === component.shouldComponentUpdate(props, state, context)) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                if (isUpdate && component.getSnapshotBeforeUpdate) snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === renderMode) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.push(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, snapshot);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (null != base.__preactattr_) applyRef(base.__preactattr_.ref, null);
            component.__b = base;
            removeNode(base);
            recyclerComponents.push(component);
            removeChildren(base);
        }
        applyRef(component.__r, null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
        this.__h = [];
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    function createRef() {
        return {};
    }
    var VNode = function() {};
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var defer = 'function' == typeof Promise ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var recyclerComponents = [];
    extend(Component.prototype, {
        setState: function(state, callback) {
            if (!this.__s) this.__s = this.state;
            this.state = extend(extend({}, this.state), 'function' == typeof state ? state(this.state, this.props) : state);
            if (callback) this.__h.push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) this.__h.push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        createRef: createRef,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if ('undefined' != typeof module) module.exports = preact; else self.preact = preact;
}();

},{}],11:[function(require,module,exports){
module.exports = prettierBytes

function prettierBytes (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num)
  }

  var neg = num < 0
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (neg) {
    num = -num
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
  num = Number(num / Math.pow(1000, exponent))
  var unit = units[exponent]

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit
  }
}

},{}],12:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.WHATWGFetch = {})));
}(this, (function (exports) { 'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],13:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

},{}],14:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AuthError = function (_Error) {
  _inherits(AuthError, _Error);

  function AuthError() {
    _classCallCheck(this, AuthError);

    var _this = _possibleConstructorReturn(this, _Error.call(this, 'Authorization required'));

    _this.name = 'AuthError';
    _this.isAuthError = true;
    return _this;
  }

  return AuthError;
}(Error);

module.exports = AuthError;

},{}],15:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RequestClient = require('./RequestClient');
var tokenStorage = require('./tokenStorage');

var _getName = function _getName(id) {
  return id.split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

module.exports = function (_RequestClient) {
  _inherits(Provider, _RequestClient);

  function Provider(uppy, opts) {
    _classCallCheck(this, Provider);

    var _this = _possibleConstructorReturn(this, _RequestClient.call(this, uppy, opts));

    _this.provider = opts.provider;
    _this.id = _this.provider;
    _this.authProvider = opts.authProvider || _this.provider;
    _this.name = _this.opts.name || _getName(_this.id);
    _this.pluginId = _this.opts.pluginId;
    _this.tokenKey = 'companion-' + _this.pluginId + '-auth-token';
    return _this;
  }

  Provider.prototype.headers = function headers() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _RequestClient.prototype.headers.call(_this2).then(function (headers) {
        _this2.getAuthToken().then(function (token) {
          resolve(_extends({}, headers, { 'uppy-auth-token': token }));
        });
      }).catch(reject);
    });
  };

  Provider.prototype.onReceiveResponse = function onReceiveResponse(response) {
    response = _RequestClient.prototype.onReceiveResponse.call(this, response);
    var authenticated = response.status !== 401;
    this.uppy.getPlugin(this.pluginId).setPluginState({ authenticated: authenticated });
    return response;
  };

  // @todo(i.olarewaju) consider whether or not this method should be exposed


  Provider.prototype.setAuthToken = function setAuthToken(token) {
    return this.uppy.getPlugin(this.pluginId).storage.setItem(this.tokenKey, token);
  };

  Provider.prototype.getAuthToken = function getAuthToken() {
    return this.uppy.getPlugin(this.pluginId).storage.getItem(this.tokenKey);
  };

  Provider.prototype.authUrl = function authUrl() {
    return this.hostname + '/' + this.id + '/connect';
  };

  Provider.prototype.fileUrl = function fileUrl(id) {
    return this.hostname + '/' + this.id + '/get/' + id;
  };

  Provider.prototype.list = function list(directory) {
    return this.get(this.id + '/list/' + (directory || ''));
  };

  Provider.prototype.logout = function logout() {
    var _this3 = this;

    var redirect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : location.href;

    return new Promise(function (resolve, reject) {
      _this3.get(_this3.id + '/logout?redirect=' + redirect).then(function (res) {
        _this3.uppy.getPlugin(_this3.pluginId).storage.removeItem(_this3.tokenKey).then(function () {
          return resolve(res);
        }).catch(reject);
      }).catch(reject);
    });
  };

  Provider.initPlugin = function initPlugin(plugin, opts, defaultOpts) {
    plugin.type = 'acquirer';
    plugin.files = [];
    if (defaultOpts) {
      plugin.opts = _extends({}, defaultOpts, opts);
    }

    if (opts.serverUrl || opts.serverPattern) {
      throw new Error('`serverUrl` and `serverPattern` have been renamed to `companionUrl` and `companionAllowedHosts` respectively in the 0.30.5 release. Please consult the docs (for example, https://uppy.io/docs/instagram/ for the Instagram plugin) and use the updated options.`');
    }

    if (opts.companionAllowedHosts) {
      var pattern = opts.companionAllowedHosts;
      // validate companionAllowedHosts param
      if (typeof pattern !== 'string' && !Array.isArray(pattern) && !(pattern instanceof RegExp)) {
        throw new TypeError(plugin.id + ': the option "companionAllowedHosts" must be one of string, Array, RegExp');
      }
      plugin.opts.companionAllowedHosts = pattern;
    } else {
      // does not start with https://
      if (/^(?!https?:\/\/).*$/i.test(opts.companionUrl)) {
        plugin.opts.companionAllowedHosts = 'https://' + opts.companionUrl.replace(/^\/\//, '');
      } else {
        plugin.opts.companionAllowedHosts = opts.companionUrl;
      }
    }

    plugin.storage = plugin.opts.storage || tokenStorage;
  };

  return Provider;
}(RequestClient);

},{"./RequestClient":16,"./tokenStorage":19}],16:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthError = require('./AuthError');

// Remove the trailing slash so we can always safely append /xyz.
function stripSlash(url) {
  return url.replace(/\/$/, '');
}

module.exports = function () {
  function RequestClient(uppy, opts) {
    _classCallCheck(this, RequestClient);

    this.uppy = uppy;
    this.opts = opts;
    this.onReceiveResponse = this.onReceiveResponse.bind(this);
  }

  RequestClient.prototype.headers = function headers() {
    return Promise.resolve(_extends({}, this.defaultHeaders, this.opts.serverHeaders || {}));
  };

  RequestClient.prototype._getPostResponseFunc = function _getPostResponseFunc(skip) {
    var _this = this;

    return function (response) {
      if (!skip) {
        return _this.onReceiveResponse(response);
      }

      return response;
    };
  };

  RequestClient.prototype.onReceiveResponse = function onReceiveResponse(response) {
    var state = this.uppy.getState();
    var companion = state.companion || {};
    var host = this.opts.companionUrl;
    var headers = response.headers;
    // Store the self-identified domain name for the Companion instance we just hit.
    if (headers.has('i-am') && headers.get('i-am') !== companion[host]) {
      var _extends2;

      this.uppy.setState({
        companion: _extends({}, companion, (_extends2 = {}, _extends2[host] = headers.get('i-am'), _extends2))
      });
    }
    return response;
  };

  RequestClient.prototype._getUrl = function _getUrl(url) {
    if (/^(https?:|)\/\//.test(url)) {
      return url;
    }
    return this.hostname + '/' + url;
  };

  RequestClient.prototype._json = function _json(res) {
    if (res.status === 401) {
      throw new AuthError();
    }

    if (res.status < 200 || res.status > 300) {
      throw new Error('Failed request to ' + res.url + '. ' + res.statusText);
    }
    return res.json();
  };

  RequestClient.prototype.get = function get(path, skipPostResponse) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _this2.headers().then(function (headers) {
        fetch(_this2._getUrl(path), {
          method: 'get',
          headers: headers,
          credentials: 'same-origin'
        }).then(_this2._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this2._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error('Could not get ' + _this2._getUrl(path) + '. ' + err);
          reject(err);
        });
      });
    });
  };

  RequestClient.prototype.post = function post(path, data, skipPostResponse) {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      _this3.headers().then(function (headers) {
        fetch(_this3._getUrl(path), {
          method: 'post',
          headers: headers,
          credentials: 'same-origin',
          body: JSON.stringify(data)
        }).then(_this3._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this3._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error('Could not post ' + _this3._getUrl(path) + '. ' + err);
          reject(err);
        });
      });
    });
  };

  RequestClient.prototype.delete = function _delete(path, data, skipPostResponse) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      _this4.headers().then(function (headers) {
        fetch(_this4.hostname + '/' + path, {
          method: 'delete',
          headers: headers,
          credentials: 'same-origin',
          body: data ? JSON.stringify(data) : null
        }).then(_this4._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this4._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error('Could not delete ' + _this4._getUrl(path) + '. ' + err);
          reject(err);
        });
      });
    });
  };

  _createClass(RequestClient, [{
    key: 'hostname',
    get: function get() {
      var _uppy$getState = this.uppy.getState(),
          companion = _uppy$getState.companion;

      var host = this.opts.companionUrl;
      return stripSlash(companion && companion[host] ? companion[host] : host);
    }
  }, {
    key: 'defaultHeaders',
    get: function get() {
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    }
  }]);

  return RequestClient;
}();

},{"./AuthError":14}],17:[function(require,module,exports){
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ee = require('namespace-emitter');

module.exports = function () {
  function UppySocket(opts) {
    var _this = this;

    _classCallCheck(this, UppySocket);

    this.queued = [];
    this.isOpen = false;
    this.socket = new WebSocket(opts.target);
    this.emitter = ee();

    this.socket.onopen = function (e) {
      _this.isOpen = true;

      while (_this.queued.length > 0 && _this.isOpen) {
        var first = _this.queued[0];
        _this.send(first.action, first.payload);
        _this.queued = _this.queued.slice(1);
      }
    };

    this.socket.onclose = function (e) {
      _this.isOpen = false;
    };

    this._handleMessage = this._handleMessage.bind(this);

    this.socket.onmessage = this._handleMessage;

    this.close = this.close.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.send = this.send.bind(this);
  }

  UppySocket.prototype.close = function close() {
    return this.socket.close();
  };

  UppySocket.prototype.send = function send(action, payload) {
    // attach uuid

    if (!this.isOpen) {
      this.queued.push({ action: action, payload: payload });
      return;
    }

    this.socket.send(JSON.stringify({
      action: action,
      payload: payload
    }));
  };

  UppySocket.prototype.on = function on(action, handler) {
    this.emitter.on(action, handler);
  };

  UppySocket.prototype.emit = function emit(action, payload) {
    this.emitter.emit(action, payload);
  };

  UppySocket.prototype.once = function once(action, handler) {
    this.emitter.once(action, handler);
  };

  UppySocket.prototype._handleMessage = function _handleMessage(e) {
    try {
      var message = JSON.parse(e.data);
      this.emit(message.action, message.payload);
    } catch (err) {
      console.log(err);
    }
  };

  return UppySocket;
}();

},{"namespace-emitter":9}],18:[function(require,module,exports){
'use-strict';
/**
 * Manages communications with Companion
 */

var RequestClient = require('./RequestClient');
var Provider = require('./Provider');
var Socket = require('./Socket');

module.exports = {
  RequestClient: RequestClient,
  Provider: Provider,
  Socket: Socket
};

},{"./Provider":15,"./RequestClient":16,"./Socket":17}],19:[function(require,module,exports){
'use strict';
/**
 * This module serves as an Async wrapper for LocalStorage
 */

module.exports.setItem = function (key, value) {
  return new Promise(function (resolve) {
    localStorage.setItem(key, value);
    resolve();
  });
};

module.exports.getItem = function (key) {
  return Promise.resolve(localStorage.getItem(key));
};

module.exports.removeItem = function (key) {
  return new Promise(function (resolve) {
    localStorage.removeItem(key);
    resolve();
  });
};

},{}],20:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var preact = require('preact');
var findDOMElement = require('./../../utils/lib/findDOMElement');

/**
 * Defer a frequent call to the microtask queue.
 */
function debounce(fn) {
  var calling = null;
  var latestArgs = null;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    latestArgs = args;
    if (!calling) {
      calling = Promise.resolve().then(function () {
        calling = null;
        // At this point `args` may be different from the most
        // recent state, if multiple calls happened since this task
        // was queued. So we use the `latestArgs`, which definitely
        // is the most recent call.
        return fn.apply(undefined, latestArgs);
      });
    }
    return calling;
  };
}

/**
 * Boilerplate that all Plugins share - and should not be used
 * directly. It also shows which methods final plugins should implement/override,
 * this deciding on structure.
 *
 * @param {object} main Uppy core object
 * @param {object} object with plugin options
 * @return {array | string} files or success/fail message
 */
module.exports = function () {
  function Plugin(uppy, opts) {
    _classCallCheck(this, Plugin);

    this.uppy = uppy;
    this.opts = opts || {};

    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  Plugin.prototype.getPluginState = function getPluginState() {
    var _uppy$getState = this.uppy.getState(),
        plugins = _uppy$getState.plugins;

    return plugins[this.id] || {};
  };

  Plugin.prototype.setPluginState = function setPluginState(update) {
    var _extends2;

    var _uppy$getState2 = this.uppy.getState(),
        plugins = _uppy$getState2.plugins;

    this.uppy.setState({
      plugins: _extends({}, plugins, (_extends2 = {}, _extends2[this.id] = _extends({}, plugins[this.id], update), _extends2))
    });
  };

  Plugin.prototype.update = function update(state) {
    if (typeof this.el === 'undefined') {
      return;
    }

    if (this._updateUI) {
      this._updateUI(state);
    }
  };

  /**
  * Called when plugin is mounted, whether in DOM or into another plugin.
  * Needed because sometimes plugins are mounted separately/after `install`,
  * so this.el and this.parent might not be available in `install`.
  * This is the case with @uppy/react plugins, for example.
  */


  Plugin.prototype.onMount = function onMount() {};

  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   *
   * @param {String|Object} target
   *
   */


  Plugin.prototype.mount = function mount(target, plugin) {
    var _this = this;

    var callerPluginName = plugin.id;

    var targetElement = findDOMElement(target);

    if (targetElement) {
      this.isTargetDOMEl = true;

      // API for plugins that require a synchronous rerender.
      this.rerender = function (state) {
        // plugin could be removed, but this.rerender is debounced below,
        // so it could still be called even after uppy.removePlugin or uppy.close
        // hence the check
        if (!_this.uppy.getPlugin(_this.id)) return;
        _this.el = preact.render(_this.render(state), targetElement, _this.el);
      };
      this._updateUI = debounce(this.rerender);

      this.uppy.log('Installing ' + callerPluginName + ' to a DOM element');

      // clear everything inside the target container
      if (this.opts.replaceTargetContent) {
        targetElement.innerHTML = '';
      }

      this.el = preact.render(this.render(this.uppy.getState()), targetElement);

      this.onMount();
      return this.el;
    }

    var targetPlugin = void 0;
    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target instanceof Plugin) {
      // Targeting a plugin *instance*
      targetPlugin = target;
    } else if (typeof target === 'function') {
      // Targeting a plugin type
      var Target = target;
      // Find the target plugin instance.
      this.uppy.iteratePlugins(function (plugin) {
        if (plugin instanceof Target) {
          targetPlugin = plugin;
          return false;
        }
      });
    }

    if (targetPlugin) {
      this.uppy.log('Installing ' + callerPluginName + ' to ' + targetPlugin.id);
      this.parent = targetPlugin;
      this.el = targetPlugin.addTarget(plugin);

      this.onMount();
      return this.el;
    }

    this.uppy.log('Not installing ' + callerPluginName);
    throw new Error('Invalid target option given to ' + callerPluginName + '. Please make sure that the element \n      exists on the page, or that the plugin you are targeting has been installed. Check that the <script> tag initializing Uppy \n      comes at the bottom of the page, before the closing </body> tag (see https://github.com/transloadit/uppy/issues/1042).');
  };

  Plugin.prototype.render = function render(state) {
    throw new Error('Extend the render method to add your plugin to a DOM element');
  };

  Plugin.prototype.addTarget = function addTarget(plugin) {
    throw new Error('Extend the addTarget method to add your plugin to another plugin\'s target');
  };

  Plugin.prototype.unmount = function unmount() {
    if (this.isTargetDOMEl && this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  };

  Plugin.prototype.install = function install() {};

  Plugin.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return Plugin;
}();

},{"./../../utils/lib/findDOMElement":28,"preact":10}],21:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Translator = require('./../../utils/lib/Translator');
var ee = require('namespace-emitter');
var cuid = require('cuid');
// const throttle = require('lodash.throttle')
var prettyBytes = require('prettier-bytes');
var match = require('mime-match');
var DefaultStore = require('./../../store-default');
var getFileType = require('./../../utils/lib/getFileType');
var getFileNameAndExtension = require('./../../utils/lib/getFileNameAndExtension');
var generateFileID = require('./../../utils/lib/generateFileID');
var getTimeStamp = require('./../../utils/lib/getTimeStamp');
var supportsUploadProgress = require('./supportsUploadProgress');
var Plugin = require('./Plugin'); // Exported from here.

/**
 * Uppy Core module.
 * Manages plugins, state updates, acts as an event bus,
 * adds/removes files and metadata.
 */

var Uppy = function () {
  /**
  * Instantiate Uppy
  * @param {object} opts — Uppy options
  */
  function Uppy(opts) {
    var _this = this;

    _classCallCheck(this, Uppy);

    this.defaultLocale = {
      strings: {
        youCanOnlyUploadX: {
          0: 'You can only upload %{smart_count} file',
          1: 'You can only upload %{smart_count} files',
          2: 'You can only upload %{smart_count} files'
        },
        youHaveToAtLeastSelectX: {
          0: 'You have to select at least %{smart_count} file',
          1: 'You have to select at least %{smart_count} files',
          2: 'You have to select at least %{smart_count} files'
        },
        exceedsSize: 'This file exceeds maximum allowed size of',
        youCanOnlyUploadFileTypes: 'You can only upload: %{types}',
        companionError: 'Connection with Companion failed',
        companionAuthError: 'Authorization required',
        failedToUpload: 'Failed to upload %{file}',
        noInternetConnection: 'No Internet connection',
        connectedToInternet: 'Connected to the Internet',
        // Strings for remote providers
        noFilesFound: 'You have no files or folders here',
        selectXFiles: {
          0: 'Select %{smart_count} file',
          1: 'Select %{smart_count} files',
          2: 'Select %{smart_count} files'
        },
        cancel: 'Cancel',
        logOut: 'Log out',
        filter: 'Filter',
        resetFilter: 'Reset filter',
        loading: 'Loading...',
        authenticateWithTitle: 'Please authenticate with %{pluginName} to select files',
        authenticateWith: 'Connect to %{pluginName}'
      }

      // set default options
    };var defaultOptions = {
      id: 'uppy',
      autoProceed: false,
      allowMultipleUploads: true,
      debug: false,
      restrictions: {
        maxFileSize: null,
        maxNumberOfFiles: null,
        minNumberOfFiles: null,
        allowedFileTypes: null
      },
      meta: {},
      onBeforeFileAdded: function onBeforeFileAdded(currentFile, files) {
        return currentFile;
      },
      onBeforeUpload: function onBeforeUpload(files) {
        return files;
      },
      store: DefaultStore()

      // Merge default options with the ones set by user
    };this.opts = _extends({}, defaultOptions, opts);
    this.opts.restrictions = _extends({}, defaultOptions.restrictions, this.opts.restrictions);

    // i18n
    this.translator = new Translator([this.defaultLocale, this.opts.locale]);
    this.locale = this.translator.locale;
    this.i18n = this.translator.translate.bind(this.translator);
    this.i18nArray = this.translator.translateArray.bind(this.translator);

    // Container for different types of plugins
    this.plugins = {};

    this.getState = this.getState.bind(this);
    this.getPlugin = this.getPlugin.bind(this);
    this.setFileMeta = this.setFileMeta.bind(this);
    this.setFileState = this.setFileState.bind(this);
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.hideInfo = this.hideInfo.bind(this);
    this.addFile = this.addFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.pauseResume = this.pauseResume.bind(this);
    this._calculateProgress = this._calculateProgress.bind(this);
    this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
    this.resetProgress = this.resetProgress.bind(this);

    this.pauseAll = this.pauseAll.bind(this);
    this.resumeAll = this.resumeAll.bind(this);
    this.retryAll = this.retryAll.bind(this);
    this.cancelAll = this.cancelAll.bind(this);
    this.retryUpload = this.retryUpload.bind(this);
    this.upload = this.upload.bind(this);

    this.emitter = ee();
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.emitter.once.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);

    this.preProcessors = [];
    this.uploaders = [];
    this.postProcessors = [];

    this.store = this.opts.store;
    this.setState({
      plugins: {},
      files: {},
      currentUploads: {},
      allowNewUpload: true,
      capabilities: {
        uploadProgress: supportsUploadProgress(),
        individualCancellation: true,
        resumableUploads: false
      },
      totalProgress: 0,
      meta: _extends({}, this.opts.meta),
      info: {
        isHidden: true,
        type: 'info',
        message: ''
      }
    });

    this._storeUnsubscribe = this.store.subscribe(function (prevState, nextState, patch) {
      _this.emit('state-update', prevState, nextState, patch);
      _this.updateAll(nextState);
    });

    // for debugging and testing
    // this.updateNum = 0
    if (this.opts.debug && typeof window !== 'undefined') {
      window['uppyLog'] = '';
      window[this.opts.id] = this;
    }

    this._addListeners();
  }

  Uppy.prototype.on = function on(event, callback) {
    this.emitter.on(event, callback);
    return this;
  };

  Uppy.prototype.off = function off(event, callback) {
    this.emitter.off(event, callback);
    return this;
  };

  /**
   * Iterate on all plugins and run `update` on them.
   * Called each time state changes.
   *
   */


  Uppy.prototype.updateAll = function updateAll(state) {
    this.iteratePlugins(function (plugin) {
      plugin.update(state);
    });
  };

  /**
   * Updates state with a patch
   *
   * @param {object} patch {foo: 'bar'}
   */


  Uppy.prototype.setState = function setState(patch) {
    this.store.setState(patch);
  };

  /**
   * Returns current state.
   * @return {object}
   */


  Uppy.prototype.getState = function getState() {
    return this.store.getState();
  };

  /**
  * Back compat for when uppy.state is used instead of uppy.getState().
  */


  /**
  * Shorthand to set state for a specific file.
  */
  Uppy.prototype.setFileState = function setFileState(fileID, state) {
    var _extends2;

    if (!this.getState().files[fileID]) {
      throw new Error('Can\u2019t set state for ' + fileID + ' (the file could have been removed)');
    }

    this.setState({
      files: _extends({}, this.getState().files, (_extends2 = {}, _extends2[fileID] = _extends({}, this.getState().files[fileID], state), _extends2))
    });
  };

  Uppy.prototype.resetProgress = function resetProgress() {
    var defaultProgress = {
      percentage: 0,
      bytesUploaded: 0,
      uploadComplete: false,
      uploadStarted: false
    };
    var files = _extends({}, this.getState().files);
    var updatedFiles = {};
    Object.keys(files).forEach(function (fileID) {
      var updatedFile = _extends({}, files[fileID]);
      updatedFile.progress = _extends({}, updatedFile.progress, defaultProgress);
      updatedFiles[fileID] = updatedFile;
    });

    this.setState({
      files: updatedFiles,
      totalProgress: 0
    });

    // TODO Document on the website
    this.emit('reset-progress');
  };

  Uppy.prototype.addPreProcessor = function addPreProcessor(fn) {
    this.preProcessors.push(fn);
  };

  Uppy.prototype.removePreProcessor = function removePreProcessor(fn) {
    var i = this.preProcessors.indexOf(fn);
    if (i !== -1) {
      this.preProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addPostProcessor = function addPostProcessor(fn) {
    this.postProcessors.push(fn);
  };

  Uppy.prototype.removePostProcessor = function removePostProcessor(fn) {
    var i = this.postProcessors.indexOf(fn);
    if (i !== -1) {
      this.postProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addUploader = function addUploader(fn) {
    this.uploaders.push(fn);
  };

  Uppy.prototype.removeUploader = function removeUploader(fn) {
    var i = this.uploaders.indexOf(fn);
    if (i !== -1) {
      this.uploaders.splice(i, 1);
    }
  };

  Uppy.prototype.setMeta = function setMeta(data) {
    var updatedMeta = _extends({}, this.getState().meta, data);
    var updatedFiles = _extends({}, this.getState().files);

    Object.keys(updatedFiles).forEach(function (fileID) {
      updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
        meta: _extends({}, updatedFiles[fileID].meta, data)
      });
    });

    this.log('Adding metadata:');
    this.log(data);

    this.setState({
      meta: updatedMeta,
      files: updatedFiles
    });
  };

  Uppy.prototype.setFileMeta = function setFileMeta(fileID, data) {
    var updatedFiles = _extends({}, this.getState().files);
    if (!updatedFiles[fileID]) {
      this.log('Was trying to set metadata for a file that’s not with us anymore: ', fileID);
      return;
    }
    var newMeta = _extends({}, updatedFiles[fileID].meta, data);
    updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
      meta: newMeta
    });
    this.setState({ files: updatedFiles });
  };

  /**
   * Get a file object.
   *
   * @param {string} fileID The ID of the file object to return.
   */


  Uppy.prototype.getFile = function getFile(fileID) {
    return this.getState().files[fileID];
  };

  /**
   * Get all files in an array.
   */


  Uppy.prototype.getFiles = function getFiles() {
    var _getState = this.getState(),
        files = _getState.files;

    return Object.keys(files).map(function (fileID) {
      return files[fileID];
    });
  };

  /**
  * Check if minNumberOfFiles restriction is reached before uploading.
  *
  * @private
  */


  Uppy.prototype._checkMinNumberOfFiles = function _checkMinNumberOfFiles(files) {
    var minNumberOfFiles = this.opts.restrictions.minNumberOfFiles;

    if (Object.keys(files).length < minNumberOfFiles) {
      throw new Error('' + this.i18n('youHaveToAtLeastSelectX', { smart_count: minNumberOfFiles }));
    }
  };

  /**
  * Check if file passes a set of restrictions set in options: maxFileSize,
  * maxNumberOfFiles and allowedFileTypes.
  *
  * @param {object} file object to check
  * @private
  */


  Uppy.prototype._checkRestrictions = function _checkRestrictions(file) {
    var _opts$restrictions = this.opts.restrictions,
        maxFileSize = _opts$restrictions.maxFileSize,
        maxNumberOfFiles = _opts$restrictions.maxNumberOfFiles,
        allowedFileTypes = _opts$restrictions.allowedFileTypes;


    if (maxNumberOfFiles) {
      if (Object.keys(this.getState().files).length + 1 > maxNumberOfFiles) {
        throw new Error('' + this.i18n('youCanOnlyUploadX', { smart_count: maxNumberOfFiles }));
      }
    }

    if (allowedFileTypes) {
      var isCorrectFileType = allowedFileTypes.some(function (type) {
        // if (!file.type) return false

        // is this is a mime-type
        if (type.indexOf('/') > -1) {
          if (!file.type) return false;
          return match(file.type, type);
        }

        // otherwise this is likely an extension
        if (type[0] === '.') {
          return file.extension.toLowerCase() === type.substr(1).toLowerCase();
        }
        return false;
      });

      if (!isCorrectFileType) {
        var allowedFileTypesString = allowedFileTypes.join(', ');
        throw new Error(this.i18n('youCanOnlyUploadFileTypes', { types: allowedFileTypesString }));
      }
    }

    // We can't check maxFileSize if the size is unknown.
    if (maxFileSize && file.data.size != null) {
      if (file.data.size > maxFileSize) {
        throw new Error(this.i18n('exceedsSize') + ' ' + prettyBytes(maxFileSize));
      }
    }
  };

  /**
  * Add a new file to `state.files`. This will run `onBeforeFileAdded`,
  * try to guess file type in a clever way, check file against restrictions,
  * and start an upload if `autoProceed === true`.
  *
  * @param {object} file object to add
  */


  Uppy.prototype.addFile = function addFile(file) {
    var _this2 = this,
        _extends3;

    var _getState2 = this.getState(),
        files = _getState2.files,
        allowNewUpload = _getState2.allowNewUpload;

    var onError = function onError(msg) {
      var err = (typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object' ? msg : new Error(msg);
      _this2.log(err.message);
      _this2.info(err.message, 'error', 5000);
      throw err;
    };

    if (allowNewUpload === false) {
      onError(new Error('Cannot add new files: already uploading.'));
    }

    var onBeforeFileAddedResult = this.opts.onBeforeFileAdded(file, files);

    if (onBeforeFileAddedResult === false) {
      this.log('Not adding file because onBeforeFileAdded returned false');
      return;
    }

    if ((typeof onBeforeFileAddedResult === 'undefined' ? 'undefined' : _typeof(onBeforeFileAddedResult)) === 'object' && onBeforeFileAddedResult) {
      // warning after the change in 0.24
      if (onBeforeFileAddedResult.then) {
        throw new TypeError('onBeforeFileAdded() returned a Promise, but this is no longer supported. It must be synchronous.');
      }
      file = onBeforeFileAddedResult;
    }

    var fileType = getFileType(file);
    var fileName = void 0;
    if (file.name) {
      fileName = file.name;
    } else if (fileType.split('/')[0] === 'image') {
      fileName = fileType.split('/')[0] + '.' + fileType.split('/')[1];
    } else {
      fileName = 'noname';
    }
    var fileExtension = getFileNameAndExtension(fileName).extension;
    var isRemote = file.isRemote || false;

    var fileID = generateFileID(file);

    var meta = file.meta || {};
    meta.name = fileName;
    meta.type = fileType;

    // `null` means the size is unknown.
    var size = isFinite(file.data.size) ? file.data.size : null;
    var newFile = {
      source: file.source || '',
      id: fileID,
      name: fileName,
      extension: fileExtension || '',
      meta: _extends({}, this.getState().meta, meta),
      type: fileType,
      data: file.data,
      progress: {
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: size,
        uploadComplete: false,
        uploadStarted: false
      },
      size: size,
      isRemote: isRemote,
      remote: file.remote || '',
      preview: file.preview
    };

    try {
      this._checkRestrictions(newFile);
    } catch (err) {
      this.emit('restriction-failed', newFile, err);
      onError(err);
    }

    this.setState({
      files: _extends({}, files, (_extends3 = {}, _extends3[fileID] = newFile, _extends3))
    });

    this.emit('file-added', newFile);
    this.log('Added file: ' + fileName + ', ' + fileID + ', mime type: ' + fileType);

    if (this.opts.autoProceed && !this.scheduledAutoProceed) {
      this.scheduledAutoProceed = setTimeout(function () {
        _this2.scheduledAutoProceed = null;
        _this2.upload().catch(function (err) {
          console.error(err.stack || err.message || err);
        });
      }, 4);
    }
  };

  Uppy.prototype.removeFile = function removeFile(fileID) {
    var _this3 = this;

    var _getState3 = this.getState(),
        files = _getState3.files,
        currentUploads = _getState3.currentUploads;

    var updatedFiles = _extends({}, files);
    var removedFile = updatedFiles[fileID];
    delete updatedFiles[fileID];

    // Remove this file from its `currentUpload`.
    var updatedUploads = _extends({}, currentUploads);
    var removeUploads = [];
    Object.keys(updatedUploads).forEach(function (uploadID) {
      var newFileIDs = currentUploads[uploadID].fileIDs.filter(function (uploadFileID) {
        return uploadFileID !== fileID;
      });
      // Remove the upload if no files are associated with it anymore.
      if (newFileIDs.length === 0) {
        removeUploads.push(uploadID);
        return;
      }

      updatedUploads[uploadID] = _extends({}, currentUploads[uploadID], {
        fileIDs: newFileIDs
      });
    });

    this.setState({
      currentUploads: updatedUploads,
      files: updatedFiles
    });

    removeUploads.forEach(function (uploadID) {
      _this3._removeUpload(uploadID);
    });

    this._calculateTotalProgress();
    this.emit('file-removed', removedFile);
    this.log('File removed: ' + removedFile.id);
  };

  Uppy.prototype.pauseResume = function pauseResume(fileID) {
    if (!this.getState().capabilities.resumableUploads || this.getFile(fileID).uploadComplete) {
      return;
    }

    var wasPaused = this.getFile(fileID).isPaused || false;
    var isPaused = !wasPaused;

    this.setFileState(fileID, {
      isPaused: isPaused
    });

    this.emit('upload-pause', fileID, isPaused);

    return isPaused;
  };

  Uppy.prototype.pauseAll = function pauseAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });

    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: true
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({ files: updatedFiles });

    this.emit('pause-all');
  };

  Uppy.prototype.resumeAll = function resumeAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });

    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({ files: updatedFiles });

    this.emit('resume-all');
  };

  Uppy.prototype.retryAll = function retryAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var filesToRetry = Object.keys(updatedFiles).filter(function (file) {
      return updatedFiles[file].error;
    });

    filesToRetry.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      error: null
    });

    this.emit('retry-all', filesToRetry);

    var uploadID = this._createUpload(filesToRetry);
    return this._runUpload(uploadID);
  };

  Uppy.prototype.cancelAll = function cancelAll() {
    var _this4 = this;

    this.emit('cancel-all');

    var files = Object.keys(this.getState().files);
    files.forEach(function (fileID) {
      _this4.removeFile(fileID);
    });

    this.setState({
      allowNewUpload: true,
      totalProgress: 0,
      error: null
    });
  };

  Uppy.prototype.retryUpload = function retryUpload(fileID) {
    var updatedFiles = _extends({}, this.getState().files);
    var updatedFile = _extends({}, updatedFiles[fileID], { error: null, isPaused: false });
    updatedFiles[fileID] = updatedFile;
    this.setState({
      files: updatedFiles
    });

    this.emit('upload-retry', fileID);

    var uploadID = this._createUpload([fileID]);
    return this._runUpload(uploadID);
  };

  Uppy.prototype.reset = function reset() {
    this.cancelAll();
  };

  Uppy.prototype._calculateProgress = function _calculateProgress(file, data) {
    if (!this.getFile(file.id)) {
      this.log('Not setting progress for a file that has been removed: ' + file.id);
      return;
    }

    // bytesTotal may be null or zero; in that case we can't divide by it
    var canHavePercentage = isFinite(data.bytesTotal) && data.bytesTotal > 0;
    this.setFileState(file.id, {
      progress: _extends({}, this.getFile(file.id).progress, {
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: canHavePercentage
        // TODO(goto-bus-stop) flooring this should probably be the choice of the UI?
        // we get more accurate calculations if we don't round this at all.
        ? Math.floor(data.bytesUploaded / data.bytesTotal * 100) : 0
      })
    });

    this._calculateTotalProgress();
  };

  Uppy.prototype._calculateTotalProgress = function _calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    var files = this.getFiles();

    var inProgress = files.filter(function (file) {
      return file.progress.uploadStarted;
    });

    if (inProgress.length === 0) {
      this.emit('progress', 0);
      this.setState({ totalProgress: 0 });
      return;
    }

    var sizedFiles = inProgress.filter(function (file) {
      return file.progress.bytesTotal != null;
    });
    var unsizedFiles = inProgress.filter(function (file) {
      return file.progress.bytesTotal == null;
    });

    if (sizedFiles.length === 0) {
      var progressMax = inProgress.length;
      var currentProgress = unsizedFiles.reduce(function (acc, file) {
        return acc + file.progress.percentage;
      }, 0);
      var _totalProgress = Math.round(currentProgress / progressMax * 100);
      this.setState({ totalProgress: _totalProgress });
      return;
    }

    var totalSize = sizedFiles.reduce(function (acc, file) {
      return acc + file.progress.bytesTotal;
    }, 0);
    var averageSize = totalSize / sizedFiles.length;
    totalSize += averageSize * unsizedFiles.length;

    var uploadedSize = 0;
    sizedFiles.forEach(function (file) {
      uploadedSize += file.progress.bytesUploaded;
    });
    unsizedFiles.forEach(function (file) {
      uploadedSize += averageSize * (file.progress.percentage || 0);
    });

    var totalProgress = totalSize === 0 ? 0 : Math.round(uploadedSize / totalSize * 100);

    // hot fix, because:
    // uploadedSize ended up larger than totalSize, resulting in 1325% total
    if (totalProgress > 100) {
      totalProgress = 100;
    }

    this.setState({ totalProgress: totalProgress });
    this.emit('progress', totalProgress);
  };

  /**
   * Registers listeners for all global actions, like:
   * `error`, `file-removed`, `upload-progress`
   */


  Uppy.prototype._addListeners = function _addListeners() {
    var _this5 = this;

    this.on('error', function (error) {
      _this5.setState({ error: error.message });
    });

    this.on('upload-error', function (file, error, response) {
      _this5.setFileState(file.id, {
        error: error.message,
        response: response
      });

      _this5.setState({ error: error.message });

      var message = _this5.i18n('failedToUpload', { file: file.name });
      if ((typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && error.message) {
        message = { message: message, details: error.message };
      }
      _this5.info(message, 'error', 5000);
    });

    this.on('upload', function () {
      _this5.setState({ error: null });
    });

    this.on('upload-started', function (file, upload) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: {
          uploadStarted: Date.now(),
          uploadComplete: false,
          percentage: 0,
          bytesUploaded: 0,
          bytesTotal: file.size
        }
      });
    });

    // upload progress events can occur frequently, especially when you have a good
    // connection to the remote server. Therefore, we are throtteling them to
    // prevent accessive function calls.
    // see also: https://github.com/tus/tus-js-client/commit/9940f27b2361fd7e10ba58b09b60d82422183bbb
    // const _throttledCalculateProgress = throttle(this._calculateProgress, 100, { leading: true, trailing: true })

    this.on('upload-progress', this._calculateProgress);

    this.on('upload-success', function (file, uploadResp) {
      var currentProgress = _this5.getFile(file.id).progress;
      _this5.setFileState(file.id, {
        progress: _extends({}, currentProgress, {
          uploadComplete: true,
          percentage: 100,
          bytesUploaded: currentProgress.bytesTotal
        }),
        response: uploadResp,
        uploadURL: uploadResp.uploadURL,
        isPaused: false
      });

      _this5._calculateTotalProgress();
    });

    this.on('preprocess-progress', function (file, progress) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: _extends({}, _this5.getFile(file.id).progress, {
          preprocess: progress
        })
      });
    });

    this.on('preprocess-complete', function (file) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      var files = _extends({}, _this5.getState().files);
      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.preprocess;

      _this5.setState({ files: files });
    });

    this.on('postprocess-progress', function (file, progress) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: _extends({}, _this5.getState().files[file.id].progress, {
          postprocess: progress
        })
      });
    });

    this.on('postprocess-complete', function (file) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      var files = _extends({}, _this5.getState().files);
      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.postprocess;
      // TODO should we set some kind of `fullyComplete` property on the file object
      // so it's easier to see that the file is upload…fully complete…rather than
      // what we have to do now (`uploadComplete && !postprocess`)

      _this5.setState({ files: files });
    });

    this.on('restored', function () {
      // Files may have changed--ensure progress is still accurate.
      _this5._calculateTotalProgress();
    });

    // show informer if offline
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', function () {
        return _this5.updateOnlineStatus();
      });
      window.addEventListener('offline', function () {
        return _this5.updateOnlineStatus();
      });
      setTimeout(function () {
        return _this5.updateOnlineStatus();
      }, 3000);
    }
  };

  Uppy.prototype.updateOnlineStatus = function updateOnlineStatus() {
    var online = typeof window.navigator.onLine !== 'undefined' ? window.navigator.onLine : true;
    if (!online) {
      this.emit('is-offline');
      this.info(this.i18n('noInternetConnection'), 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');
      if (this.wasOffline) {
        this.emit('back-online');
        this.info(this.i18n('connectedToInternet'), 'success', 3000);
        this.wasOffline = false;
      }
    }
  };

  Uppy.prototype.getID = function getID() {
    return this.opts.id;
  };

  /**
   * Registers a plugin with Core.
   *
   * @param {object} Plugin object
   * @param {object} [opts] object with options to be passed to Plugin
   * @return {Object} self for chaining
   */


  Uppy.prototype.use = function use(Plugin, opts) {
    if (typeof Plugin !== 'function') {
      var msg = 'Expected a plugin class, but got ' + (Plugin === null ? 'null' : typeof Plugin === 'undefined' ? 'undefined' : _typeof(Plugin)) + '.' + ' Please verify that the plugin was imported and spelled correctly.';
      throw new TypeError(msg);
    }

    // Instantiate
    var plugin = new Plugin(this, opts);
    var pluginId = plugin.id;
    this.plugins[plugin.type] = this.plugins[plugin.type] || [];

    if (!pluginId) {
      throw new Error('Your plugin must have an id');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    var existsPluginAlready = this.getPlugin(pluginId);
    if (existsPluginAlready) {
      var _msg = 'Already found a plugin named \'' + existsPluginAlready.id + '\'. ' + ('Tried to use: \'' + pluginId + '\'.\n') + 'Uppy plugins must have unique \'id\' options. See https://uppy.io/docs/plugins/#id.';
      throw new Error(_msg);
    }

    this.plugins[plugin.type].push(plugin);
    plugin.install();

    return this;
  };

  /**
   * Find one Plugin by name.
   *
   * @param {string} id plugin id
   * @return {object | boolean}
   */


  Uppy.prototype.getPlugin = function getPlugin(id) {
    var foundPlugin = null;
    this.iteratePlugins(function (plugin) {
      if (plugin.id === id) {
        foundPlugin = plugin;
        return false;
      }
    });
    return foundPlugin;
  };

  /**
   * Iterate through all `use`d plugins.
   *
   * @param {function} method that will be run on each plugin
   */


  Uppy.prototype.iteratePlugins = function iteratePlugins(method) {
    var _this6 = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this6.plugins[pluginType].forEach(method);
    });
  };

  /**
   * Uninstall and remove a plugin.
   *
   * @param {object} instance The plugin instance to remove.
   */


  Uppy.prototype.removePlugin = function removePlugin(instance) {
    this.log('Removing plugin ' + instance.id);
    this.emit('plugin-remove', instance);

    if (instance.uninstall) {
      instance.uninstall();
    }

    var list = this.plugins[instance.type].slice();
    var index = list.indexOf(instance);
    if (index !== -1) {
      list.splice(index, 1);
      this.plugins[instance.type] = list;
    }

    var updatedState = this.getState();
    delete updatedState.plugins[instance.id];
    this.setState(updatedState);
  };

  /**
   * Uninstall all plugins and close down this Uppy instance.
   */


  Uppy.prototype.close = function close() {
    var _this7 = this;

    this.log('Closing Uppy instance ' + this.opts.id + ': removing all files and uninstalling plugins');

    this.reset();

    this._storeUnsubscribe();

    this.iteratePlugins(function (plugin) {
      _this7.removePlugin(plugin);
    });
  };

  /**
  * Set info message in `state.info`, so that UI plugins like `Informer`
  * can display the message.
  *
  * @param {string | object} message Message to be displayed by the informer
  * @param {string} [type]
  * @param {number} [duration]
  */

  Uppy.prototype.info = function info(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;

    var isComplexMessage = (typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object';

    this.setState({
      info: {
        isHidden: false,
        type: type,
        message: isComplexMessage ? message.message : message,
        details: isComplexMessage ? message.details : null
      }
    });

    this.emit('info-visible');

    clearTimeout(this.infoTimeoutID);
    if (duration === 0) {
      this.infoTimeoutID = undefined;
      return;
    }

    // hide the informer after `duration` milliseconds
    this.infoTimeoutID = setTimeout(this.hideInfo, duration);
  };

  Uppy.prototype.hideInfo = function hideInfo() {
    var newInfo = _extends({}, this.getState().info, {
      isHidden: true
    });
    this.setState({
      info: newInfo
    });
    this.emit('info-hidden');
  };

  /**
   * Logs stuff to console, only if `debug` is set to true. Silent in production.
   *
   * @param {String|Object} message to log
   * @param {String} [type] optional `error` or `warning`
   */


  Uppy.prototype.log = function log(message, type) {
    if (!this.opts.debug) {
      return;
    }

    var prefix = '[Uppy] [' + getTimeStamp() + ']';

    if (type === 'error') {
      console.error(prefix, message);
      return;
    }

    if (type === 'warning') {
      console.warn(prefix, message);
      return;
    }

    console.log(prefix, message);
  };

  /**
   * Obsolete, event listeners are now added in the constructor.
   */


  Uppy.prototype.run = function run() {
    this.log('Calling run() is no longer necessary.', 'warning');
    return this;
  };

  /**
   * Restore an upload by its ID.
   */


  Uppy.prototype.restore = function restore(uploadID) {
    this.log('Core: attempting to restore upload "' + uploadID + '"');

    if (!this.getState().currentUploads[uploadID]) {
      this._removeUpload(uploadID);
      return Promise.reject(new Error('Nonexistent upload'));
    }

    return this._runUpload(uploadID);
  };

  /**
   * Create an upload for a bunch of files.
   *
   * @param {Array<string>} fileIDs File IDs to include in this upload.
   * @return {string} ID of this upload.
   */


  Uppy.prototype._createUpload = function _createUpload(fileIDs) {
    var _extends4;

    var _getState4 = this.getState(),
        allowNewUpload = _getState4.allowNewUpload,
        currentUploads = _getState4.currentUploads;

    if (!allowNewUpload) {
      throw new Error('Cannot create a new upload: already uploading.');
    }

    var uploadID = cuid();

    this.emit('upload', {
      id: uploadID,
      fileIDs: fileIDs
    });

    this.setState({
      allowNewUpload: this.opts.allowMultipleUploads !== false,

      currentUploads: _extends({}, currentUploads, (_extends4 = {}, _extends4[uploadID] = {
        fileIDs: fileIDs,
        step: 0,
        result: {}
      }, _extends4))
    });

    return uploadID;
  };

  Uppy.prototype._getUpload = function _getUpload(uploadID) {
    var _getState5 = this.getState(),
        currentUploads = _getState5.currentUploads;

    return currentUploads[uploadID];
  };

  /**
   * Add data to an upload's result object.
   *
   * @param {string} uploadID The ID of the upload.
   * @param {object} data Data properties to add to the result object.
   */


  Uppy.prototype.addResultData = function addResultData(uploadID, data) {
    var _extends5;

    if (!this._getUpload(uploadID)) {
      this.log('Not setting result for an upload that has been removed: ' + uploadID);
      return;
    }
    var currentUploads = this.getState().currentUploads;
    var currentUpload = _extends({}, currentUploads[uploadID], {
      result: _extends({}, currentUploads[uploadID].result, data)
    });
    this.setState({
      currentUploads: _extends({}, currentUploads, (_extends5 = {}, _extends5[uploadID] = currentUpload, _extends5))
    });
  };

  /**
   * Remove an upload, eg. if it has been canceled or completed.
   *
   * @param {string} uploadID The ID of the upload.
   */


  Uppy.prototype._removeUpload = function _removeUpload(uploadID) {
    var currentUploads = _extends({}, this.getState().currentUploads);
    delete currentUploads[uploadID];

    this.setState({
      currentUploads: currentUploads
    });
  };

  /**
   * Run an upload. This picks up where it left off in case the upload is being restored.
   *
   * @private
   */


  Uppy.prototype._runUpload = function _runUpload(uploadID) {
    var _this8 = this;

    var uploadData = this.getState().currentUploads[uploadID];
    var restoreStep = uploadData.step;

    var steps = [].concat(this.preProcessors, this.uploaders, this.postProcessors);
    var lastStep = Promise.resolve();
    steps.forEach(function (fn, step) {
      // Skip this step if we are restoring and have already completed this step before.
      if (step < restoreStep) {
        return;
      }

      lastStep = lastStep.then(function () {
        var _extends6;

        var _getState6 = _this8.getState(),
            currentUploads = _getState6.currentUploads;

        var currentUpload = _extends({}, currentUploads[uploadID], {
          step: step
        });
        _this8.setState({
          currentUploads: _extends({}, currentUploads, (_extends6 = {}, _extends6[uploadID] = currentUpload, _extends6))
        });

        // TODO give this the `currentUpload` object as its only parameter maybe?
        // Otherwise when more metadata may be added to the upload this would keep getting more parameters
        return fn(currentUpload.fileIDs, uploadID);
      }).then(function (result) {
        return null;
      });
    });

    // Not returning the `catch`ed promise, because we still want to return a rejected
    // promise from this method if the upload failed.
    lastStep.catch(function (err) {
      _this8.emit('error', err, uploadID);
      _this8._removeUpload(uploadID);
    });

    return lastStep.then(function () {
      // Set result data.
      var _getState7 = _this8.getState(),
          currentUploads = _getState7.currentUploads;

      var currentUpload = currentUploads[uploadID];
      if (!currentUpload) {
        return;
      }

      var files = currentUpload.fileIDs.map(function (fileID) {
        return _this8.getFile(fileID);
      });
      var successful = files.filter(function (file) {
        return !file.error;
      });
      var failed = files.filter(function (file) {
        return file.error;
      });
      _this8.addResultData(uploadID, { successful: successful, failed: failed, uploadID: uploadID });
    }).then(function () {
      // Emit completion events.
      // This is in a separate function so that the `currentUploads` variable
      // always refers to the latest state. In the handler right above it refers
      // to an outdated object without the `.result` property.
      var _getState8 = _this8.getState(),
          currentUploads = _getState8.currentUploads;

      if (!currentUploads[uploadID]) {
        return;
      }
      var currentUpload = currentUploads[uploadID];
      var result = currentUpload.result;
      _this8.emit('complete', result);

      _this8._removeUpload(uploadID);

      return result;
    }).then(function (result) {
      if (result == null) {
        _this8.log('Not setting result for an upload that has been removed: ' + uploadID);
      }
      return result;
    });
  };

  /**
   * Start an upload for all the files that are not currently being uploaded.
   *
   * @return {Promise}
   */


  Uppy.prototype.upload = function upload() {
    var _this9 = this;

    if (!this.plugins.uploader) {
      this.log('No uploader type plugins are used', 'warning');
    }

    var files = this.getState().files;
    var onBeforeUploadResult = this.opts.onBeforeUpload(files);

    if (onBeforeUploadResult === false) {
      return Promise.reject(new Error('Not starting the upload because onBeforeUpload returned false'));
    }

    if (onBeforeUploadResult && (typeof onBeforeUploadResult === 'undefined' ? 'undefined' : _typeof(onBeforeUploadResult)) === 'object') {
      // warning after the change in 0.24
      if (onBeforeUploadResult.then) {
        throw new TypeError('onBeforeUpload() returned a Promise, but this is no longer supported. It must be synchronous.');
      }

      files = onBeforeUploadResult;
    }

    return Promise.resolve().then(function () {
      return _this9._checkMinNumberOfFiles(files);
    }).then(function () {
      var _getState9 = _this9.getState(),
          currentUploads = _getState9.currentUploads;
      // get a list of files that are currently assigned to uploads


      var currentlyUploadingFiles = Object.keys(currentUploads).reduce(function (prev, curr) {
        return prev.concat(currentUploads[curr].fileIDs);
      }, []);

      var waitingFileIDs = [];
      Object.keys(files).forEach(function (fileID) {
        var file = _this9.getFile(fileID);
        // if the file hasn't started uploading and hasn't already been assigned to an upload..
        if (!file.progress.uploadStarted && currentlyUploadingFiles.indexOf(fileID) === -1) {
          waitingFileIDs.push(file.id);
        }
      });

      var uploadID = _this9._createUpload(waitingFileIDs);
      return _this9._runUpload(uploadID);
    }).catch(function (err) {
      var message = (typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err.message : err;
      var details = (typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err.details : null;
      _this9.log(message + ' ' + details);
      _this9.info({ message: message, details: details }, 'error', 4000);
      return Promise.reject((typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err : new Error(err));
    });
  };

  _createClass(Uppy, [{
    key: 'state',
    get: function get() {
      return this.getState();
    }
  }]);

  return Uppy;
}();

module.exports = function (opts) {
  return new Uppy(opts);
};

// Expose class constructor.
module.exports.Uppy = Uppy;
module.exports.Plugin = Plugin;

},{"./../../store-default":25,"./../../utils/lib/Translator":26,"./../../utils/lib/generateFileID":29,"./../../utils/lib/getFileNameAndExtension":30,"./../../utils/lib/getFileType":31,"./../../utils/lib/getTimeStamp":33,"./Plugin":20,"./supportsUploadProgress":22,"cuid":1,"mime-match":8,"namespace-emitter":9,"prettier-bytes":11}],22:[function(require,module,exports){
// Edge 15.x does not fire 'progress' events on uploads.
// See https://github.com/transloadit/uppy/issues/945
// And https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12224510/
module.exports = function supportsUploadProgress(userAgent) {
  // Allow passing in userAgent for tests
  if (userAgent == null) {
    userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
  }
  // Assume it works because basically everything supports progress events.
  if (!userAgent) return true;

  var m = /Edge\/(\d+\.\d+)/.exec(userAgent);
  if (!m) return true;

  var edgeVersion = m[1];

  var _edgeVersion$split = edgeVersion.split('.'),
      major = _edgeVersion$split[0],
      minor = _edgeVersion$split[1];

  major = parseInt(major, 10);
  minor = parseInt(minor, 10);

  // Worked before:
  // Edge 40.15063.0.0
  // Microsoft EdgeHTML 15.15063
  if (major < 15 || major === 15 && minor < 15063) {
    return true;
  }

  // Fixed in:
  // Microsoft EdgeHTML 18.18218
  if (major > 18 || major === 18 && minor >= 18218) {
    return true;
  }

  // other versions don't work.
  return false;
};

},{}],23:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var toArray = require('./../../utils/lib/toArray');
var Translator = require('./../../utils/lib/Translator');

var _require2 = require('preact'),
    h = _require2.h;

module.exports = function (_Plugin) {
  _inherits(FileInput, _Plugin);

  function FileInput(uppy, opts) {
    _classCallCheck(this, FileInput);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = _this.opts.id || 'FileInput';
    _this.title = 'File Input';
    _this.type = 'acquirer';

    _this.defaultLocale = {
      strings: {
        chooseFiles: 'Choose files'
      }

      // Default options
    };var defaultOptions = {
      target: null,
      pretty: true,
      inputName: 'files[]'

      // Merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    // i18n
    _this.translator = new Translator([_this.defaultLocale, _this.uppy.locale, _this.opts.locale]);
    _this.i18n = _this.translator.translate.bind(_this.translator);
    _this.i18nArray = _this.translator.translateArray.bind(_this.translator);

    _this.render = _this.render.bind(_this);
    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.handleClick = _this.handleClick.bind(_this);
    return _this;
  }

  FileInput.prototype.handleInputChange = function handleInputChange(ev) {
    var _this2 = this;

    this.uppy.log('[FileInput] Something selected through input...');

    var files = toArray(ev.target.files);

    files.forEach(function (file) {
      try {
        _this2.uppy.addFile({
          source: _this2.id,
          name: file.name,
          type: file.type,
          data: file
        });
      } catch (err) {
        // Nothing, restriction errors handled in Core
      }
    });
  };

  FileInput.prototype.handleClick = function handleClick(ev) {
    this.input.click();
  };

  FileInput.prototype.render = function render(state) {
    var _this3 = this;

    /* http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/ */
    var hiddenInputStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1
    };

    var restrictions = this.uppy.opts.restrictions;
    var accept = restrictions.allowedFileTypes ? restrictions.allowedFileTypes.join(',') : null;

    // empty value="" on file input, so that the input is cleared after a file is selected,
    // because Uppy will be handling the upload and so we can select same file
    // after removing — otherwise browser thinks it’s already selected
    return h(
      'div',
      { 'class': 'uppy-Root uppy-FileInput-container' },
      h('input', { 'class': 'uppy-FileInput-input',
        style: this.opts.pretty && hiddenInputStyle,
        type: 'file',
        name: this.opts.inputName,
        onchange: this.handleInputChange,
        multiple: restrictions.maxNumberOfFiles !== 1,
        accept: accept,
        ref: function ref(input) {
          _this3.input = input;
        },
        value: '' }),
      this.opts.pretty && h(
        'button',
        { 'class': 'uppy-FileInput-btn', type: 'button', onclick: this.handleClick },
        this.i18n('chooseFiles')
      )
    );
  };

  FileInput.prototype.install = function install() {
    var target = this.opts.target;
    if (target) {
      this.mount(target, this);
    }
  };

  FileInput.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return FileInput;
}(Plugin);

},{"./../../core":21,"./../../utils/lib/Translator":26,"./../../utils/lib/toArray":38,"preact":10}],24:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var _require2 = require('preact'),
    h = _require2.h;

/**
 * Progress bar
 *
 */


module.exports = function (_Plugin) {
  _inherits(ProgressBar, _Plugin);

  function ProgressBar(uppy, opts) {
    _classCallCheck(this, ProgressBar);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = _this.opts.id || 'ProgressBar';
    _this.title = 'Progress Bar';
    _this.type = 'progressindicator';

    // set default options
    var defaultOptions = {
      target: 'body',
      replaceTargetContent: false,
      fixed: false,
      hideAfterFinish: true

      // merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    _this.render = _this.render.bind(_this);
    return _this;
  }

  ProgressBar.prototype.render = function render(state) {
    var progress = state.totalProgress || 0;
    var isHidden = progress === 100 && this.opts.hideAfterFinish;
    return h(
      'div',
      { 'class': 'uppy uppy-ProgressBar', style: { position: this.opts.fixed ? 'fixed' : 'initial' }, 'aria-hidden': isHidden },
      h('div', { 'class': 'uppy-ProgressBar-inner', style: { width: progress + '%' } }),
      h(
        'div',
        { 'class': 'uppy-ProgressBar-percentage' },
        progress
      )
    );
  };

  ProgressBar.prototype.install = function install() {
    var target = this.opts.target;
    if (target) {
      this.mount(target, this);
    }
  };

  ProgressBar.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return ProgressBar;
}(Plugin);

},{"./../../core":21,"preact":10}],25:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Default store that keeps state in a simple object.
 */
var DefaultStore = function () {
  function DefaultStore() {
    _classCallCheck(this, DefaultStore);

    this.state = {};
    this.callbacks = [];
  }

  DefaultStore.prototype.getState = function getState() {
    return this.state;
  };

  DefaultStore.prototype.setState = function setState(patch) {
    var prevState = _extends({}, this.state);
    var nextState = _extends({}, this.state, patch);

    this.state = nextState;
    this._publish(prevState, nextState, patch);
  };

  DefaultStore.prototype.subscribe = function subscribe(listener) {
    var _this = this;

    this.callbacks.push(listener);
    return function () {
      // Remove the listener.
      _this.callbacks.splice(_this.callbacks.indexOf(listener), 1);
    };
  };

  DefaultStore.prototype._publish = function _publish() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.callbacks.forEach(function (listener) {
      listener.apply(undefined, args);
    });
  };

  return DefaultStore;
}();

module.exports = function defaultStore() {
  return new DefaultStore();
};

},{}],26:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 *
 * @param {object|Array<object>} locale Locale or list of locales.
 */
module.exports = function () {
  function Translator(locales) {
    var _this = this;

    _classCallCheck(this, Translator);

    this.locale = {
      strings: {},
      pluralize: function pluralize(n) {
        if (n === 1) {
          return 0;
        }
        return 1;
      }
    };

    if (Array.isArray(locales)) {
      locales.forEach(function (locale) {
        return _this._apply(locale);
      });
    } else {
      this._apply(locales);
    }
  }

  Translator.prototype._apply = function _apply(locale) {
    if (!locale || !locale.strings) {
      return;
    }

    var prevLocale = this.locale;
    this.locale = _extends({}, prevLocale, {
      strings: _extends({}, prevLocale.strings, locale.strings)
    });
    this.locale.pluralize = locale.pluralize || prevLocale.pluralize;
  };

  /**
   * Takes a string with placeholder variables like `%{smart_count} file selected`
   * and replaces it with values from options `{smart_count: 5}`
   *
   * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
   * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
   *
   * @param {string} phrase that needs interpolation, with placeholders
   * @param {object} options with values that will be used to replace placeholders
   * @return {string} interpolated
   */


  Translator.prototype.interpolate = function interpolate(phrase, options) {
    var _String$prototype = String.prototype,
        split = _String$prototype.split,
        replace = _String$prototype.replace;

    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$$$';
    var interpolated = [phrase];

    for (var arg in options) {
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];
        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        }
        // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.
        interpolated = insertReplacement(interpolated, new RegExp('%\\{' + arg + '\\}', 'g'), replacement);
      }
    }

    return interpolated;

    function insertReplacement(source, rx, replacement) {
      var newParts = [];
      source.forEach(function (chunk) {
        split.call(chunk, rx).forEach(function (raw, i, list) {
          if (raw !== '') {
            newParts.push(raw);
          }

          // Interlace with the `replacement` value
          if (i < list.length - 1) {
            newParts.push(replacement);
          }
        });
      });
      return newParts;
    }
  };

  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @return {string} translated (and interpolated)
   */


  Translator.prototype.translate = function translate(key, options) {
    return this.translateArray(key, options).join('');
  };

  /**
   * Get a translation and return the translated and interpolated parts as an array.
   * @param {string} key
   * @param {object} options with values that will be used to replace placeholders
   * @return {Array} The translated and interpolated parts, in order.
   */


  Translator.prototype.translateArray = function translateArray(key, options) {
    if (options && typeof options.smart_count !== 'undefined') {
      var plural = this.locale.pluralize(options.smart_count);
      return this.interpolate(this.locale.strings[key][plural], options);
    }

    return this.interpolate(this.locale.strings[key], options);
  };

  return Translator;
}();

},{}],27:[function(require,module,exports){
var throttle = require('lodash.throttle');

function _emitSocketProgress(uploader, progressData, file) {
  var progress = progressData.progress,
      bytesUploaded = progressData.bytesUploaded,
      bytesTotal = progressData.bytesTotal;

  if (progress) {
    uploader.uppy.log('Upload progress: ' + progress);
    uploader.uppy.emit('upload-progress', file, {
      uploader: uploader,
      bytesUploaded: bytesUploaded,
      bytesTotal: bytesTotal
    });
  }
}

module.exports = throttle(_emitSocketProgress, 300, { leading: true, trailing: true });

},{"lodash.throttle":7}],28:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isDOMElement = require('./isDOMElement');

/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @return {Node|null}
 */
module.exports = function findDOMElement(element) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  if (typeof element === 'string') {
    return context.querySelector(element);
  }

  if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && isDOMElement(element)) {
    return element;
  }
};

},{"./isDOMElement":34}],29:[function(require,module,exports){
/**
 * Takes a file object and turns it into fileID, by converting file.name to lowercase,
 * removing extra characters and adding type, size and lastModified
 *
 * @param {Object} file
 * @return {String} the fileID
 *
 */
module.exports = function generateFileID(file) {
  // filter is needed to not join empty values with `-`
  return ['uppy', file.name ? file.name.toLowerCase().replace(/[^A-Z0-9]/ig, '') : '', file.type, file.data.size, file.data.lastModified].filter(function (val) {
    return val;
  }).join('-');
};

},{}],30:[function(require,module,exports){
/**
* Takes a full filename string and returns an object {name, extension}
*
* @param {string} fullFileName
* @return {object} {name, extension}
*/
module.exports = function getFileNameAndExtension(fullFileName) {
  var re = /(?:\.([^.]+))?$/;
  var fileExt = re.exec(fullFileName)[1];
  var fileName = fullFileName.replace('.' + fileExt, '');
  return {
    name: fileName,
    extension: fileExt
  };
};

},{}],31:[function(require,module,exports){
var getFileNameAndExtension = require('./getFileNameAndExtension');
var mimeTypes = require('./mimeTypes');

module.exports = function getFileType(file) {
  var fileExtension = file.name ? getFileNameAndExtension(file.name).extension : null;
  fileExtension = fileExtension ? fileExtension.toLowerCase() : null;

  if (file.isRemote) {
    // some remote providers do not support file types
    return file.type ? file.type : mimeTypes[fileExtension];
  }

  // check if mime type is set in the file object
  if (file.type) {
    return file.type;
  }

  // see if we can map extension to a mime type
  if (fileExtension && mimeTypes[fileExtension]) {
    return mimeTypes[fileExtension];
  }

  // if all fails, fall back to a generic byte stream type
  return 'application/octet-stream';
};

},{"./getFileNameAndExtension":30,"./mimeTypes":36}],32:[function(require,module,exports){
module.exports = function getSocketHost(url) {
  // get the host domain
  var regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/i;
  var host = regex.exec(url)[1];
  var socketProtocol = /^http:\/\//i.test(url) ? 'ws' : 'wss';

  return socketProtocol + '://' + host;
};

},{}],33:[function(require,module,exports){
/**
 * Returns a timestamp in the format of `hours:minutes:seconds`
*/
module.exports = function getTimeStamp() {
  var date = new Date();
  var hours = pad(date.getHours().toString());
  var minutes = pad(date.getMinutes().toString());
  var seconds = pad(date.getSeconds().toString());
  return hours + ':' + minutes + ':' + seconds;
};

/**
 * Adds zero to strings shorter than two characters
*/
function pad(str) {
  return str.length !== 2 ? 0 + str : str;
}

},{}],34:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.nodeType === Node.ELEMENT_NODE;
};

},{}],35:[function(require,module,exports){
/**
 * Limit the amount of simultaneously pending Promises.
 * Returns a function that, when passed a function `fn`,
 * will make sure that at most `limit` calls to `fn` are pending.
 *
 * @param {number} limit
 * @return {function()}
 */
module.exports = function limitPromises(limit) {
  var pending = 0;
  var queue = [];
  return function (fn) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var call = function call() {
        pending++;
        var promise = fn.apply(undefined, args);
        promise.then(onfinish, onfinish);
        return promise;
      };

      if (pending >= limit) {
        return new Promise(function (resolve, reject) {
          queue.push(function () {
            call().then(resolve, reject);
          });
        });
      }
      return call();
    };
  };
  function onfinish() {
    pending--;
    var next = queue.shift();
    if (next) next();
  }
};

},{}],36:[function(require,module,exports){
module.exports = {
  'md': 'text/markdown',
  'markdown': 'text/markdown',
  'mp4': 'video/mp4',
  'mp3': 'audio/mp3',
  'svg': 'image/svg+xml',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'yaml': 'text/yaml',
  'yml': 'text/yaml',
  'csv': 'text/csv',
  'avi': 'video/x-msvideo',
  'mks': 'video/x-matroska',
  'mkv': 'video/x-matroska',
  'mov': 'video/quicktime',
  'doc': 'application/msword',
  'docm': 'application/vnd.ms-word.document.macroenabled.12',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'dot': 'application/msword',
  'dotm': 'application/vnd.ms-word.template.macroenabled.12',
  'dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'xla': 'application/vnd.ms-excel',
  'xlam': 'application/vnd.ms-excel.addin.macroenabled.12',
  'xlc': 'application/vnd.ms-excel',
  'xlf': 'application/x-xliff+xml',
  'xlm': 'application/vnd.ms-excel',
  'xls': 'application/vnd.ms-excel',
  'xlsb': 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  'xlsm': 'application/vnd.ms-excel.sheet.macroenabled.12',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xlt': 'application/vnd.ms-excel',
  'xltm': 'application/vnd.ms-excel.template.macroenabled.12',
  'xltx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'xlw': 'application/vnd.ms-excel'
};

},{}],37:[function(require,module,exports){
module.exports = function settle(promises) {
  var resolutions = [];
  var rejections = [];
  function resolved(value) {
    resolutions.push(value);
  }
  function rejected(error) {
    rejections.push(error);
  }

  var wait = Promise.all(promises.map(function (promise) {
    return promise.then(resolved, rejected);
  }));

  return wait.then(function () {
    return {
      successful: resolutions,
      failed: rejections
    };
  });
};

},{}],38:[function(require,module,exports){
/**
 * Converts list into array
*/
module.exports = function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
};

},{}],39:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var cuid = require('cuid');
var Translator = require('./../../utils/lib/Translator');

var _require2 = require('./../../companion-client'),
    Provider = _require2.Provider,
    RequestClient = _require2.RequestClient,
    Socket = _require2.Socket;

var emitSocketProgress = require('./../../utils/lib/emitSocketProgress');
var getSocketHost = require('./../../utils/lib/getSocketHost');
var settle = require('./../../utils/lib/settle');
var limitPromises = require('./../../utils/lib/limitPromises');

function buildResponseError(xhr, error) {
  // No error message
  if (!error) error = new Error('Upload error');
  // Got an error message string
  if (typeof error === 'string') error = new Error(error);
  // Got something else
  if (!(error instanceof Error)) {
    error = _extends(new Error('Upload error'), { data: error });
  }

  error.request = xhr;
  return error;
}

module.exports = function (_Plugin) {
  _inherits(XHRUpload, _Plugin);

  function XHRUpload(uppy, opts) {
    _classCallCheck(this, XHRUpload);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.type = 'uploader';
    _this.id = 'XHRUpload';
    _this.title = 'XHRUpload';

    _this.defaultLocale = {
      strings: {
        timedOut: 'Upload stalled for %{seconds} seconds, aborting.'
      }

      // Default options
    };var defaultOptions = {
      formData: true,
      fieldName: 'files[]',
      method: 'post',
      metaFields: null,
      responseUrlFieldName: 'url',
      bundle: false,
      headers: {},
      timeout: 30 * 1000,
      limit: 0,
      withCredentials: false,
      responseType: '',
      /**
       * @typedef respObj
       * @property {string} responseText
       * @property {number} status
       * @property {string} statusText
       * @property {Object.<string, string>} headers
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseData: function getResponseData(responseText, response) {
        var parsedResponse = {};
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (err) {
          console.log(err);
        }

        return parsedResponse;
      },

      /**
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseError: function getResponseError(responseText, response) {
        return new Error('Upload error');
      },

      /**
       * @param {number} status the response status code
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      validateStatus: function validateStatus(status, responseText, response) {
        return status >= 200 && status < 300;
      }
    };

    // Merge default options with the ones set by user
    _this.opts = _extends({}, defaultOptions, opts);

    // i18n
    _this.translator = new Translator([_this.defaultLocale, _this.uppy.locale, _this.opts.locale]);
    _this.i18n = _this.translator.translate.bind(_this.translator);
    _this.i18nArray = _this.translator.translateArray.bind(_this.translator);

    _this.handleUpload = _this.handleUpload.bind(_this);

    // Simultaneous upload limiting is shared across all uploads with this plugin.
    if (typeof _this.opts.limit === 'number' && _this.opts.limit !== 0) {
      _this.limitUploads = limitPromises(_this.opts.limit);
    } else {
      _this.limitUploads = function (fn) {
        return fn;
      };
    }

    if (_this.opts.bundle && !_this.opts.formData) {
      throw new Error('`opts.formData` must be true when `opts.bundle` is enabled.');
    }
    return _this;
  }

  XHRUpload.prototype.getOptions = function getOptions(file) {
    var overrides = this.uppy.getState().xhrUpload;
    var opts = _extends({}, this.opts, overrides || {}, file.xhrUpload || {});
    opts.headers = {};
    _extends(opts.headers, this.opts.headers);
    if (overrides) {
      _extends(opts.headers, overrides.headers);
    }
    if (file.xhrUpload) {
      _extends(opts.headers, file.xhrUpload.headers);
    }

    return opts;
  };

  // Helper to abort upload requests if there has not been any progress for `timeout` ms.
  // Create an instance using `timer = createProgressTimeout(10000, onTimeout)`
  // Call `timer.progress()` to signal that there has been progress of any kind.
  // Call `timer.done()` when the upload has completed.


  XHRUpload.prototype.createProgressTimeout = function createProgressTimeout(timeout, timeoutHandler) {
    var uppy = this.uppy;
    var self = this;
    var isDone = false;

    function onTimedOut() {
      uppy.log('[XHRUpload] timed out');
      var error = new Error(self.i18n('timedOut', { seconds: Math.ceil(timeout / 1000) }));
      timeoutHandler(error);
    }

    var aliveTimer = null;
    function progress() {
      // Some browsers fire another progress event when the upload is
      // cancelled, so we have to ignore progress after the timer was
      // told to stop.
      if (isDone) return;

      if (timeout > 0) {
        if (aliveTimer) clearTimeout(aliveTimer);
        aliveTimer = setTimeout(onTimedOut, timeout);
      }
    }

    function done() {
      uppy.log('[XHRUpload] timer done');
      if (aliveTimer) {
        clearTimeout(aliveTimer);
        aliveTimer = null;
      }
      isDone = true;
    }

    return {
      progress: progress,
      done: done
    };
  };

  XHRUpload.prototype.createFormDataUpload = function createFormDataUpload(file, opts) {
    var formPost = new FormData();

    var metaFields = Array.isArray(opts.metaFields) ? opts.metaFields
    // Send along all fields by default.
    : Object.keys(file.meta);
    metaFields.forEach(function (item) {
      formPost.append(item, file.meta[item]);
    });

    if (file.name) {
      formPost.append(opts.fieldName, file.data, file.name);
    } else {
      formPost.append(opts.fieldName, file.data);
    }

    return formPost;
  };

  XHRUpload.prototype.createBareUpload = function createBareUpload(file, opts) {
    return file.data;
  };

  XHRUpload.prototype.upload = function upload(file, current, total) {
    var _this2 = this;

    var opts = this.getOptions(file);

    this.uppy.log('uploading ' + current + ' of ' + total);
    return new Promise(function (resolve, reject) {
      var data = opts.formData ? _this2.createFormDataUpload(file, opts) : _this2.createBareUpload(file, opts);

      var timer = _this2.createProgressTimeout(opts.timeout, function (error) {
        xhr.abort();
        _this2.uppy.emit('upload-error', file, error);
        reject(error);
      });

      var xhr = new XMLHttpRequest();

      var id = cuid();

      xhr.upload.addEventListener('loadstart', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' started');
      });

      xhr.upload.addEventListener('progress', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' progress: ' + ev.loaded + ' / ' + ev.total);
        // Begin checking for timeouts when progress starts, instead of loading,
        // to avoid timing out requests on browser concurrency queue
        timer.progress();

        if (ev.lengthComputable) {
          _this2.uppy.emit('upload-progress', file, {
            uploader: _this2,
            bytesUploaded: ev.loaded,
            bytesTotal: ev.total
          });
        }
      });

      xhr.addEventListener('load', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' finished');
        timer.done();

        if (opts.validateStatus(ev.target.status, xhr.responseText, xhr)) {
          var body = opts.getResponseData(xhr.responseText, xhr);
          var uploadURL = body[opts.responseUrlFieldName];

          var uploadResp = {
            status: ev.target.status,
            body: body,
            uploadURL: uploadURL
          };

          _this2.uppy.emit('upload-success', file, uploadResp);

          if (uploadURL) {
            _this2.uppy.log('Download ' + file.name + ' from ' + file.uploadURL);
          }

          return resolve(file);
        } else {
          var _body = opts.getResponseData(xhr.responseText, xhr);
          var error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));

          var response = {
            status: ev.target.status,
            body: _body
          };

          _this2.uppy.emit('upload-error', file, error, response);
          return reject(error);
        }
      });

      xhr.addEventListener('error', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' errored');
        timer.done();

        var error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));
        _this2.uppy.emit('upload-error', file, error);
        return reject(error);
      });

      xhr.open(opts.method.toUpperCase(), opts.endpoint, true);
      // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.
      xhr.withCredentials = opts.withCredentials;
      if (opts.responseType !== '') {
        xhr.responseType = opts.responseType;
      }

      Object.keys(opts.headers).forEach(function (header) {
        xhr.setRequestHeader(header, opts.headers[header]);
      });

      xhr.send(data);

      _this2.uppy.on('file-removed', function (removedFile) {
        if (removedFile.id === file.id) {
          timer.done();
          xhr.abort();
          reject(new Error('File removed'));
        }
      });

      _this2.uppy.on('cancel-all', function () {
        timer.done();
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    });
  };

  XHRUpload.prototype.uploadRemote = function uploadRemote(file, current, total) {
    var _this3 = this;

    var opts = this.getOptions(file);
    return new Promise(function (resolve, reject) {
      var fields = {};
      var metaFields = Array.isArray(opts.metaFields) ? opts.metaFields
      // Send along all fields by default.
      : Object.keys(file.meta);

      metaFields.forEach(function (name) {
        fields[name] = file.meta[name];
      });

      var Client = file.remote.providerOptions.provider ? Provider : RequestClient;
      var client = new Client(_this3.uppy, file.remote.providerOptions);
      client.post(file.remote.url, _extends({}, file.remote.body, {
        endpoint: opts.endpoint,
        size: file.data.size,
        fieldname: opts.fieldName,
        metadata: fields,
        headers: opts.headers
      })).then(function (res) {
        var token = res.token;
        var host = getSocketHost(file.remote.companionUrl);
        var socket = new Socket({ target: host + '/api/' + token });

        socket.on('progress', function (progressData) {
          return emitSocketProgress(_this3, progressData, file);
        });

        socket.on('success', function (data) {
          var body = opts.getResponseData(data.response.responseText, data.response);
          var uploadURL = body[opts.responseUrlFieldName];

          var uploadResp = {
            status: data.response.status,
            body: body,
            uploadURL: uploadURL
          };

          _this3.uppy.emit('upload-success', file, uploadResp);
          socket.close();
          return resolve();
        });

        socket.on('error', function (errData) {
          var resp = errData.response;
          var error = resp ? opts.getResponseError(resp.responseText, resp) : _extends(new Error(errData.error.message), { cause: errData.error });
          _this3.uppy.emit('upload-error', file, error);
          reject(error);
        });
      });
    });
  };

  XHRUpload.prototype.uploadBundle = function uploadBundle(files) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      var endpoint = _this4.opts.endpoint;
      var method = _this4.opts.method;

      var formData = new FormData();
      files.forEach(function (file, i) {
        var opts = _this4.getOptions(file);

        if (file.name) {
          formData.append(opts.fieldName, file.data, file.name);
        } else {
          formData.append(opts.fieldName, file.data);
        }
      });

      var xhr = new XMLHttpRequest();

      var timer = _this4.createProgressTimeout(_this4.opts.timeout, function (error) {
        xhr.abort();
        emitError(error);
        reject(error);
      });

      var emitError = function emitError(error) {
        files.forEach(function (file) {
          _this4.uppy.emit('upload-error', file, error);
        });
      };

      xhr.upload.addEventListener('loadstart', function (ev) {
        _this4.uppy.log('[XHRUpload] started uploading bundle');
        timer.progress();
      });

      xhr.upload.addEventListener('progress', function (ev) {
        timer.progress();

        if (!ev.lengthComputable) return;

        files.forEach(function (file) {
          _this4.uppy.emit('upload-progress', file, {
            uploader: _this4,
            bytesUploaded: ev.loaded / ev.total * file.size,
            bytesTotal: file.size
          });
        });
      });

      xhr.addEventListener('load', function (ev) {
        timer.done();

        if (_this4.opts.validateStatus(ev.target.status, xhr.responseText, xhr)) {
          var body = _this4.opts.getResponseData(xhr.responseText, xhr);
          var uploadResp = {
            status: ev.target.status,
            body: body
          };
          files.forEach(function (file) {
            _this4.uppy.emit('upload-success', file, uploadResp);
          });
          return resolve();
        }

        var error = _this4.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        error.request = xhr;
        emitError(error);
        return reject(error);
      });

      xhr.addEventListener('error', function (ev) {
        timer.done();

        var error = _this4.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        emitError(error);
        return reject(error);
      });

      _this4.uppy.on('cancel-all', function () {
        timer.done();
        xhr.abort();
      });

      xhr.open(method.toUpperCase(), endpoint, true);
      // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.
      xhr.withCredentials = _this4.opts.withCredentials;
      if (_this4.opts.responseType !== '') {
        xhr.responseType = _this4.opts.responseType;
      }

      Object.keys(_this4.opts.headers).forEach(function (header) {
        xhr.setRequestHeader(header, _this4.opts.headers[header]);
      });

      xhr.send(formData);

      files.forEach(function (file) {
        _this4.uppy.emit('upload-started', file);
      });
    });
  };

  XHRUpload.prototype.uploadFiles = function uploadFiles(files) {
    var _this5 = this;

    var actions = files.map(function (file, i) {
      var current = parseInt(i, 10) + 1;
      var total = files.length;

      if (file.error) {
        return function () {
          return Promise.reject(new Error(file.error));
        };
      } else if (file.isRemote) {
        // We emit upload-started here, so that it's also emitted for files
        // that have to wait due to the `limit` option.
        _this5.uppy.emit('upload-started', file);
        return _this5.uploadRemote.bind(_this5, file, current, total);
      } else {
        _this5.uppy.emit('upload-started', file);
        return _this5.upload.bind(_this5, file, current, total);
      }
    });

    var promises = actions.map(function (action) {
      var limitedAction = _this5.limitUploads(action);
      return limitedAction();
    });

    return settle(promises);
  };

  XHRUpload.prototype.handleUpload = function handleUpload(fileIDs) {
    var _this6 = this;

    if (fileIDs.length === 0) {
      this.uppy.log('[XHRUpload] No files to upload!');
      return Promise.resolve();
    }

    this.uppy.log('[XHRUpload] Uploading...');
    var files = fileIDs.map(function (fileID) {
      return _this6.uppy.getFile(fileID);
    });

    if (this.opts.bundle) {
      return this.uploadBundle(files);
    }

    return this.uploadFiles(files).then(function () {
      return null;
    });
  };

  XHRUpload.prototype.install = function install() {
    if (this.opts.bundle) {
      var _uppy$getState = this.uppy.getState(),
          capabilities = _uppy$getState.capabilities;

      this.uppy.setState({
        capabilities: _extends({}, capabilities, {
          individualCancellation: false
        })
      });
    }

    this.uppy.addUploader(this.handleUpload);
  };

  XHRUpload.prototype.uninstall = function uninstall() {
    if (this.opts.bundle) {
      var _uppy$getState2 = this.uppy.getState(),
          capabilities = _uppy$getState2.capabilities;

      this.uppy.setState({
        capabilities: _extends({}, capabilities, {
          individualCancellation: true
        })
      });
    }

    this.uppy.removeUploader(this.handleUpload);
  };

  return XHRUpload;
}(Plugin);

},{"./../../companion-client":18,"./../../core":21,"./../../utils/lib/Translator":26,"./../../utils/lib/emitSocketProgress":27,"./../../utils/lib/getSocketHost":32,"./../../utils/lib/limitPromises":35,"./../../utils/lib/settle":37,"cuid":1}],40:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],41:[function(require,module,exports){
require('es6-promise/auto');
require('whatwg-fetch');
var Uppy = require('./../../../../packages/@uppy/core');
var FileInput = require('./../../../../packages/@uppy/file-input');
var XHRUpload = require('./../../../../packages/@uppy/xhr-upload');
var ProgressBar = require('./../../../../packages/@uppy/progress-bar');

var uppy = new Uppy({ debug: true, autoProceed: true });
uppy.use(FileInput, { target: '.UppyForm', replaceTargetContent: true });
uppy.use(XHRUpload, {
  endpoint: '//api2.transloadit.com',
  formData: true,
  fieldName: 'files[]'
});
uppy.use(ProgressBar, {
  target: 'body',
  fixed: true,
  hideAfterFinish: false
});

console.log('Uppy with Formtag and XHRUpload is loaded');

},{"./../../../../packages/@uppy/core":21,"./../../../../packages/@uppy/file-input":23,"./../../../../packages/@uppy/progress-bar":24,"./../../../../packages/@uppy/xhr-upload":39,"es6-promise/auto":5,"whatwg-fetch":12}]},{},[41])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jdWlkL2xpYi9maW5nZXJwcmludC5icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2N1aWQvbGliL2dldFJhbmRvbVZhbHVlLmJyb3dzZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9saWIvcGFkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2F1dG8uanMiLCIuLi9ub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbWltZS1tYXRjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9uYW1lc3BhY2UtZW1pdHRlci9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcHJldHRpZXItYnl0ZXMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2Rpc3QvZmV0Y2gudW1kLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dpbGRjYXJkL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvQXV0aEVycm9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvUHJvdmlkZXIuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9SZXF1ZXN0Q2xpZW50LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvU29ja2V0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy90b2tlblN0b3JhZ2UuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9QbHVnaW4uanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL3N1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9maWxlLWlucHV0L3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3Byb2dyZXNzLWJhci9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdG9yZS1kZWZhdWx0L3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9UcmFuc2xhdG9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2VtaXRTb2NrZXRQcm9ncmVzcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9maW5kRE9NRWxlbWVudC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZW5lcmF0ZUZpbGVJRC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbi5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRGaWxlVHlwZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRTb2NrZXRIb3N0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldFRpbWVTdGFtcC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9pc0RPTUVsZW1lbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvbGltaXRQcm9taXNlcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9taW1lVHlwZXMuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvc2V0dGxlLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL3RvQXJyYXkuanMiLCIuLi9wYWNrYWdlcy9AdXBweS94aHItdXBsb2FkL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmMvZXhhbXBsZXMveGhydXBsb2FkL2FwcC5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy9wQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUosQ0FBUyxFQUFFLE9BQU8sSUFBVCxFQUFlLGFBQWEsSUFBNUIsRUFBVCxDQUFiO0FBQ0EsS0FBSyxHQUFMLENBQVMsU0FBVCxFQUFvQixFQUFFLFFBQVEsV0FBVixFQUF1QixzQkFBc0IsSUFBN0MsRUFBcEI7QUFDQSxLQUFLLEdBQUwsQ0FBUyxTQUFULEVBQW9CO0FBQ2xCLFlBQVUsd0JBRFE7QUFFbEIsWUFBVSxJQUZRO0FBR2xCLGFBQVc7QUFITyxDQUFwQjtBQUtBLEtBQUssR0FBTCxDQUFTLFdBQVQsRUFBc0I7QUFDcEIsVUFBUSxNQURZO0FBRXBCLFNBQU8sSUFGYTtBQUdwQixtQkFBaUI7QUFIRyxDQUF0Qjs7QUFNQSxRQUFRLEdBQVIsQ0FBWSwyQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogY3VpZC5qc1xuICogQ29sbGlzaW9uLXJlc2lzdGFudCBVSUQgZ2VuZXJhdG9yIGZvciBicm93c2VycyBhbmQgbm9kZS5cbiAqIFNlcXVlbnRpYWwgZm9yIGZhc3QgZGIgbG9va3VwcyBhbmQgcmVjZW5jeSBzb3J0aW5nLlxuICogU2FmZSBmb3IgZWxlbWVudCBJRHMgYW5kIHNlcnZlci1zaWRlIGxvb2t1cHMuXG4gKlxuICogRXh0cmFjdGVkIGZyb20gQ0xDVFJcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEVyaWMgRWxsaW90dCAyMDEyXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbnZhciBmaW5nZXJwcmludCA9IHJlcXVpcmUoJy4vbGliL2ZpbmdlcnByaW50LmpzJyk7XG52YXIgcGFkID0gcmVxdWlyZSgnLi9saWIvcGFkLmpzJyk7XG52YXIgZ2V0UmFuZG9tVmFsdWUgPSByZXF1aXJlKCcuL2xpYi9nZXRSYW5kb21WYWx1ZS5qcycpO1xuXG52YXIgYyA9IDAsXG4gIGJsb2NrU2l6ZSA9IDQsXG4gIGJhc2UgPSAzNixcbiAgZGlzY3JldGVWYWx1ZXMgPSBNYXRoLnBvdyhiYXNlLCBibG9ja1NpemUpO1xuXG5mdW5jdGlvbiByYW5kb21CbG9jayAoKSB7XG4gIHJldHVybiBwYWQoKGdldFJhbmRvbVZhbHVlKCkgKlxuICAgIGRpc2NyZXRlVmFsdWVzIDw8IDApXG4gICAgLnRvU3RyaW5nKGJhc2UpLCBibG9ja1NpemUpO1xufVxuXG5mdW5jdGlvbiBzYWZlQ291bnRlciAoKSB7XG4gIGMgPSBjIDwgZGlzY3JldGVWYWx1ZXMgPyBjIDogMDtcbiAgYysrOyAvLyB0aGlzIGlzIG5vdCBzdWJsaW1pbmFsXG4gIHJldHVybiBjIC0gMTtcbn1cblxuZnVuY3Rpb24gY3VpZCAoKSB7XG4gIC8vIFN0YXJ0aW5nIHdpdGggYSBsb3dlcmNhc2UgbGV0dGVyIG1ha2VzXG4gIC8vIGl0IEhUTUwgZWxlbWVudCBJRCBmcmllbmRseS5cbiAgdmFyIGxldHRlciA9ICdjJywgLy8gaGFyZC1jb2RlZCBhbGxvd3MgZm9yIHNlcXVlbnRpYWwgYWNjZXNzXG5cbiAgICAvLyB0aW1lc3RhbXBcbiAgICAvLyB3YXJuaW5nOiB0aGlzIGV4cG9zZXMgdGhlIGV4YWN0IGRhdGUgYW5kIHRpbWVcbiAgICAvLyB0aGF0IHRoZSB1aWQgd2FzIGNyZWF0ZWQuXG4gICAgdGltZXN0YW1wID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKS50b1N0cmluZyhiYXNlKSxcblxuICAgIC8vIFByZXZlbnQgc2FtZS1tYWNoaW5lIGNvbGxpc2lvbnMuXG4gICAgY291bnRlciA9IHBhZChzYWZlQ291bnRlcigpLnRvU3RyaW5nKGJhc2UpLCBibG9ja1NpemUpLFxuXG4gICAgLy8gQSBmZXcgY2hhcnMgdG8gZ2VuZXJhdGUgZGlzdGluY3QgaWRzIGZvciBkaWZmZXJlbnRcbiAgICAvLyBjbGllbnRzIChzbyBkaWZmZXJlbnQgY29tcHV0ZXJzIGFyZSBmYXIgbGVzc1xuICAgIC8vIGxpa2VseSB0byBnZW5lcmF0ZSB0aGUgc2FtZSBpZClcbiAgICBwcmludCA9IGZpbmdlcnByaW50KCksXG5cbiAgICAvLyBHcmFiIHNvbWUgbW9yZSBjaGFycyBmcm9tIE1hdGgucmFuZG9tKClcbiAgICByYW5kb20gPSByYW5kb21CbG9jaygpICsgcmFuZG9tQmxvY2soKTtcblxuICByZXR1cm4gbGV0dGVyICsgdGltZXN0YW1wICsgY291bnRlciArIHByaW50ICsgcmFuZG9tO1xufVxuXG5jdWlkLnNsdWcgPSBmdW5jdGlvbiBzbHVnICgpIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygzNiksXG4gICAgY291bnRlciA9IHNhZmVDb3VudGVyKCkudG9TdHJpbmcoMzYpLnNsaWNlKC00KSxcbiAgICBwcmludCA9IGZpbmdlcnByaW50KCkuc2xpY2UoMCwgMSkgK1xuICAgICAgZmluZ2VycHJpbnQoKS5zbGljZSgtMSksXG4gICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKS5zbGljZSgtMik7XG5cbiAgcmV0dXJuIGRhdGUuc2xpY2UoLTIpICtcbiAgICBjb3VudGVyICsgcHJpbnQgKyByYW5kb207XG59O1xuXG5jdWlkLmlzQ3VpZCA9IGZ1bmN0aW9uIGlzQ3VpZCAoc3RyaW5nVG9DaGVjaykge1xuICBpZiAodHlwZW9mIHN0cmluZ1RvQ2hlY2sgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gIGlmIChzdHJpbmdUb0NoZWNrLnN0YXJ0c1dpdGgoJ2MnKSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmN1aWQuaXNTbHVnID0gZnVuY3Rpb24gaXNTbHVnIChzdHJpbmdUb0NoZWNrKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nVG9DaGVjayAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgdmFyIHN0cmluZ0xlbmd0aCA9IHN0cmluZ1RvQ2hlY2subGVuZ3RoO1xuICBpZiAoc3RyaW5nTGVuZ3RoID49IDcgJiYgc3RyaW5nTGVuZ3RoIDw9IDEwKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuY3VpZC5maW5nZXJwcmludCA9IGZpbmdlcnByaW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGN1aWQ7XG4iLCJ2YXIgcGFkID0gcmVxdWlyZSgnLi9wYWQuanMnKTtcblxudmFyIGVudiA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93IDogc2VsZjtcbnZhciBnbG9iYWxDb3VudCA9IE9iamVjdC5rZXlzKGVudikubGVuZ3RoO1xudmFyIG1pbWVUeXBlc0xlbmd0aCA9IG5hdmlnYXRvci5taW1lVHlwZXMgPyBuYXZpZ2F0b3IubWltZVR5cGVzLmxlbmd0aCA6IDA7XG52YXIgY2xpZW50SWQgPSBwYWQoKG1pbWVUeXBlc0xlbmd0aCArXG4gIG5hdmlnYXRvci51c2VyQWdlbnQubGVuZ3RoKS50b1N0cmluZygzNikgK1xuICBnbG9iYWxDb3VudC50b1N0cmluZygzNiksIDQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmdlcnByaW50ICgpIHtcbiAgcmV0dXJuIGNsaWVudElkO1xufTtcbiIsIlxudmFyIGdldFJhbmRvbVZhbHVlO1xuXG52YXIgY3J5cHRvID0gd2luZG93LmNyeXB0byB8fCB3aW5kb3cubXNDcnlwdG87XG5cbmlmIChjcnlwdG8pIHtcbiAgICB2YXIgbGltID0gTWF0aC5wb3coMiwgMzIpIC0gMTtcbiAgICBnZXRSYW5kb21WYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KDEpKVswXSAvIGxpbSk7XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgZ2V0UmFuZG9tVmFsdWUgPSBNYXRoLnJhbmRvbTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYW5kb21WYWx1ZTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFkIChudW0sIHNpemUpIHtcbiAgdmFyIHMgPSAnMDAwMDAwMDAwJyArIG51bTtcbiAgcmV0dXJuIHMuc3Vic3RyKHMubGVuZ3RoIC0gc2l6ZSk7XG59O1xuIiwiLy8gVGhpcyBmaWxlIGNhbiBiZSByZXF1aXJlZCBpbiBCcm93c2VyaWZ5IGFuZCBOb2RlLmpzIGZvciBhdXRvbWF0aWMgcG9seWZpbGxcbi8vIFRvIHVzZSBpdDogIHJlcXVpcmUoJ2VzNi1wcm9taXNlL2F1dG8nKTtcbid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8nKS5wb2x5ZmlsbCgpO1xuIiwiLyohXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3N0ZWZhbnBlbm5lci9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICB2NC4yLjUrN2YyYjUyNmRcbiAqL1xuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwuRVM2UHJvbWlzZSA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHg7XG4gIHJldHVybiB4ICE9PSBudWxsICYmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuXG5cbnZhciBfaXNBcnJheSA9IHZvaWQgMDtcbmlmIChBcnJheS5pc0FycmF5KSB7XG4gIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbn0gZWxzZSB7XG4gIF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xufVxuXG52YXIgaXNBcnJheSA9IF9pc0FycmF5O1xuXG52YXIgbGVuID0gMDtcbnZhciB2ZXJ0eE5leHQgPSB2b2lkIDA7XG52YXIgY3VzdG9tU2NoZWR1bGVyRm4gPSB2b2lkIDA7XG5cbnZhciBhc2FwID0gZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gIHF1ZXVlW2xlbl0gPSBjYWxsYmFjaztcbiAgcXVldWVbbGVuICsgMV0gPSBhcmc7XG4gIGxlbiArPSAyO1xuICBpZiAobGVuID09PSAyKSB7XG4gICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgLy8gd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhpcyBmbHVzaCB0aGF0IHdlIGFyZSBzY2hlZHVsaW5nLlxuICAgIGlmIChjdXN0b21TY2hlZHVsZXJGbikge1xuICAgICAgY3VzdG9tU2NoZWR1bGVyRm4oZmx1c2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzY2hlZHVsZUZsdXNoKCk7XG4gICAgfVxuICB9XG59O1xuXG5mdW5jdGlvbiBzZXRTY2hlZHVsZXIoc2NoZWR1bGVGbikge1xuICBjdXN0b21TY2hlZHVsZXJGbiA9IHNjaGVkdWxlRm47XG59XG5cbmZ1bmN0aW9uIHNldEFzYXAoYXNhcEZuKSB7XG4gIGFzYXAgPSBhc2FwRm47XG59XG5cbnZhciBicm93c2VyV2luZG93ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB1bmRlZmluZWQ7XG52YXIgYnJvd3Nlckdsb2JhbCA9IGJyb3dzZXJXaW5kb3cgfHwge307XG52YXIgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSBicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xudmFyIGlzTm9kZSA9IHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nO1xuXG4vLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxudmFyIGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcblxuLy8gbm9kZVxuZnVuY3Rpb24gdXNlTmV4dFRpY2soKSB7XG4gIC8vIG5vZGUgdmVyc2lvbiAwLjEwLnggZGlzcGxheXMgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHdoZW4gbmV4dFRpY2sgaXMgdXNlZCByZWN1cnNpdmVseVxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2N1am9qcy93aGVuL2lzc3Vlcy80MTAgZm9yIGRldGFpbHNcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gIH07XG59XG5cbi8vIHZlcnR4XG5mdW5jdGlvbiB1c2VWZXJ0eFRpbWVyKCkge1xuICBpZiAodHlwZW9mIHZlcnR4TmV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmVydHhOZXh0KGZsdXNoKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHVzZVNldFRpbWVvdXQoKTtcbn1cblxuZnVuY3Rpb24gdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICB2YXIgb2JzZXJ2ZXIgPSBuZXcgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIoZmx1c2gpO1xuICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBub2RlLmRhdGEgPSBpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMjtcbiAgfTtcbn1cblxuLy8gd2ViIHdvcmtlclxuZnVuY3Rpb24gdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZmx1c2g7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHVzZVNldFRpbWVvdXQoKSB7XG4gIC8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIGVzNi1wcm9taXNlIHdpbGwgYmUgdW5hZmZlY3RlZCBieVxuICAvLyBvdGhlciBjb2RlIG1vZGlmeWluZyBzZXRUaW1lb3V0IChsaWtlIHNpbm9uLnVzZUZha2VUaW1lcnMoKSlcbiAgdmFyIGdsb2JhbFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnbG9iYWxTZXRUaW1lb3V0KGZsdXNoLCAxKTtcbiAgfTtcbn1cblxudmFyIHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuZnVuY3Rpb24gZmx1c2goKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBxdWV1ZVtpXTtcbiAgICB2YXIgYXJnID0gcXVldWVbaSArIDFdO1xuXG4gICAgY2FsbGJhY2soYXJnKTtcblxuICAgIHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgIHF1ZXVlW2kgKyAxXSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGxlbiA9IDA7XG59XG5cbmZ1bmN0aW9uIGF0dGVtcHRWZXJ0eCgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgdmVydHggPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpLnJlcXVpcmUoJ3ZlcnR4Jyk7XG4gICAgdmVydHhOZXh0ID0gdmVydHgucnVuT25Mb29wIHx8IHZlcnR4LnJ1bk9uQ29udGV4dDtcbiAgICByZXR1cm4gdXNlVmVydHhUaW1lcigpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHVzZVNldFRpbWVvdXQoKTtcbiAgfVxufVxuXG52YXIgc2NoZWR1bGVGbHVzaCA9IHZvaWQgMDtcbi8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG5pZiAoaXNOb2RlKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xufSBlbHNlIGlmIChCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTXV0YXRpb25PYnNlcnZlcigpO1xufSBlbHNlIGlmIChpc1dvcmtlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTWVzc2FnZUNoYW5uZWwoKTtcbn0gZWxzZSBpZiAoYnJvd3NlcldpbmRvdyA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSBhdHRlbXB0VmVydHgoKTtcbn0gZWxzZSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VTZXRUaW1lb3V0KCk7XG59XG5cbmZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgdmFyIHBhcmVudCA9IHRoaXM7XG5cbiAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3Iobm9vcCk7XG5cbiAgaWYgKGNoaWxkW1BST01JU0VfSURdID09PSB1bmRlZmluZWQpIHtcbiAgICBtYWtlUHJvbWlzZShjaGlsZCk7XG4gIH1cblxuICB2YXIgX3N0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuXG4gIGlmIChfc3RhdGUpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbX3N0YXRlIC0gMV07XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW52b2tlQ2FsbGJhY2soX3N0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHBhcmVudC5fcmVzdWx0KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICB9XG5cbiAgcmV0dXJuIGNoaWxkO1xufVxuXG4vKipcbiAgYFByb21pc2UucmVzb2x2ZWAgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlY29tZSByZXNvbHZlZCB3aXRoIHRoZVxuICBwYXNzZWQgYHZhbHVlYC4gSXQgaXMgc2hvcnRoYW5kIGZvciB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHJlc29sdmUoMSk7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKDEpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcmVzb2x2ZVxuICBAc3RhdGljXG4gIEBwYXJhbSB7QW55fSB2YWx1ZSB2YWx1ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aFxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIGZ1bGZpbGxlZCB3aXRoIHRoZSBnaXZlblxuICBgdmFsdWVgXG4qL1xuZnVuY3Rpb24gcmVzb2x2ZSQxKG9iamVjdCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcbiAgcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICByZXR1cm4gcHJvbWlzZTtcbn1cblxudmFyIFBST01JU0VfSUQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMik7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG52YXIgUEVORElORyA9IHZvaWQgMDtcbnZhciBGVUxGSUxMRUQgPSAxO1xudmFyIFJFSkVDVEVEID0gMjtcblxudmFyIFRSWV9DQVRDSF9FUlJPUiA9IHsgZXJyb3I6IG51bGwgfTtcblxuZnVuY3Rpb24gc2VsZkZ1bGZpbGxtZW50KCkge1xuICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIik7XG59XG5cbmZ1bmN0aW9uIGNhbm5vdFJldHVybk93bigpIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS4nKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGhlbihwcm9taXNlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBUUllfQ0FUQ0hfRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICByZXR1cm4gVFJZX0NBVENIX0VSUk9SO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeVRoZW4odGhlbiQkMSwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICB0cnkge1xuICAgIHRoZW4kJDEuY2FsbCh2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbiQkMSkge1xuICBhc2FwKGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgIHZhciBlcnJvciA9IHRyeVRoZW4odGhlbiQkMSwgdGhlbmFibGUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHNlYWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIGlmIChzZWFsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgIGlmICghc2VhbGVkICYmIGVycm9yKSB7XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICB9XG4gIH0sIHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICBpZiAodGhlbmFibGUuX3N0YXRlID09PSBGVUxGSUxMRUQpIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICB9IGVsc2UgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICByZWplY3QocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gIH0gZWxzZSB7XG4gICAgc3Vic2NyaWJlKHRoZW5hYmxlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIHJldHVybiByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4kJDEpIHtcbiAgaWYgKG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IgPT09IHByb21pc2UuY29uc3RydWN0b3IgJiYgdGhlbiQkMSA9PT0gdGhlbiAmJiBtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yLnJlc29sdmUgPT09IHJlc29sdmUkMSkge1xuICAgIGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aGVuJCQxID09PSBUUllfQ0FUQ0hfRVJST1IpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCBUUllfQ0FUQ0hfRVJST1IuZXJyb3IpO1xuICAgICAgVFJZX0NBVENIX0VSUk9SLmVycm9yID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHRoZW4kJDEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odGhlbiQkMSkpIHtcbiAgICAgIGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuJCQxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICByZWplY3QocHJvbWlzZSwgc2VsZkZ1bGZpbGxtZW50KCkpO1xuICB9IGVsc2UgaWYgKG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCB2YWx1ZSwgZ2V0VGhlbih2YWx1ZSkpO1xuICB9IGVsc2Uge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICBpZiAocHJvbWlzZS5fb25lcnJvcikge1xuICAgIHByb21pc2UuX29uZXJyb3IocHJvbWlzZS5fcmVzdWx0KTtcbiAgfVxuXG4gIHB1Ymxpc2gocHJvbWlzZSk7XG59XG5cbmZ1bmN0aW9uIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gIHByb21pc2UuX3N0YXRlID0gRlVMRklMTEVEO1xuXG4gIGlmIChwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggIT09IDApIHtcbiAgICBhc2FwKHB1Ymxpc2gsIHByb21pc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHByb21pc2UuX3N0YXRlID0gUkVKRUNURUQ7XG4gIHByb21pc2UuX3Jlc3VsdCA9IHJlYXNvbjtcblxuICBhc2FwKHB1Ymxpc2hSZWplY3Rpb24sIHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgdmFyIF9zdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gIHZhciBsZW5ndGggPSBfc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG5cbiAgcGFyZW50Ll9vbmVycm9yID0gbnVsbDtcblxuICBfc3Vic2NyaWJlcnNbbGVuZ3RoXSA9IGNoaWxkO1xuICBfc3Vic2NyaWJlcnNbbGVuZ3RoICsgRlVMRklMTEVEXSA9IG9uRnVsZmlsbG1lbnQ7XG4gIF9zdWJzY3JpYmVyc1tsZW5ndGggKyBSRUpFQ1RFRF0gPSBvblJlamVjdGlvbjtcblxuICBpZiAobGVuZ3RoID09PSAwICYmIHBhcmVudC5fc3RhdGUpIHtcbiAgICBhc2FwKHB1Ymxpc2gsIHBhcmVudCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHVibGlzaChwcm9taXNlKSB7XG4gIHZhciBzdWJzY3JpYmVycyA9IHByb21pc2UuX3N1YnNjcmliZXJzO1xuICB2YXIgc2V0dGxlZCA9IHByb21pc2UuX3N0YXRlO1xuXG4gIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgY2hpbGQgPSB2b2lkIDAsXG4gICAgICBjYWxsYmFjayA9IHZvaWQgMCxcbiAgICAgIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgY2hpbGQgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgIGlmIChjaGlsZCkge1xuICAgICAgaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayhkZXRhaWwpO1xuICAgIH1cbiAgfVxuXG4gIHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG59XG5cbmZ1bmN0aW9uIHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gY2FsbGJhY2soZGV0YWlsKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IGU7XG4gICAgcmV0dXJuIFRSWV9DQVRDSF9FUlJPUjtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gIHZhciBoYXNDYWxsYmFjayA9IGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgdmFsdWUgPSB2b2lkIDAsXG4gICAgICBlcnJvciA9IHZvaWQgMCxcbiAgICAgIHN1Y2NlZWRlZCA9IHZvaWQgMCxcbiAgICAgIGZhaWxlZCA9IHZvaWQgMDtcblxuICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICB2YWx1ZSA9IHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgaWYgKHZhbHVlID09PSBUUllfQ0FUQ0hfRVJST1IpIHtcbiAgICAgIGZhaWxlZCA9IHRydWU7XG4gICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgdmFsdWUuZXJyb3IgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgcmVqZWN0KHByb21pc2UsIGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIC8vIG5vb3BcbiAgfSBlbHNlIGlmIChoYXNDYWxsYmFjayAmJiBzdWNjZWVkZWQpIHtcbiAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgfSBlbHNlIGlmIChmYWlsZWQpIHtcbiAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IEZVTEZJTExFRCkge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IFJFSkVDVEVEKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICB0cnkge1xuICAgIHJlc29sdmVyKGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbHVlKSB7XG4gICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZWplY3QocHJvbWlzZSwgZSk7XG4gIH1cbn1cblxudmFyIGlkID0gMDtcbmZ1bmN0aW9uIG5leHRJZCgpIHtcbiAgcmV0dXJuIGlkKys7XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKHByb21pc2UpIHtcbiAgcHJvbWlzZVtQUk9NSVNFX0lEXSA9IGlkKys7XG4gIHByb21pc2UuX3N0YXRlID0gdW5kZWZpbmVkO1xuICBwcm9taXNlLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gIHByb21pc2UuX3N1YnNjcmliZXJzID0gW107XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRpb25FcnJvcigpIHtcbiAgcmV0dXJuIG5ldyBFcnJvcignQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5Jyk7XG59XG5cbnZhciBFbnVtZXJhdG9yID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCkge1xuICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG5cbiAgICBpZiAoIXRoaXMucHJvbWlzZVtQUk9NSVNFX0lEXSkge1xuICAgICAgbWFrZVByb21pc2UodGhpcy5wcm9taXNlKTtcbiAgICB9XG5cbiAgICBpZiAoaXNBcnJheShpbnB1dCkpIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAgICAgdGhpcy5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuXG4gICAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDA7XG4gICAgICAgIHRoaXMuX2VudW1lcmF0ZShpbnB1dCk7XG4gICAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICBmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZWplY3QodGhpcy5wcm9taXNlLCB2YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgfVxuICB9XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uIF9lbnVtZXJhdGUoaW5wdXQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgdGhpcy5fc3RhdGUgPT09IFBFTkRJTkcgJiYgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgIH1cbiAgfTtcblxuICBFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24gX2VhY2hFbnRyeShlbnRyeSwgaSkge1xuICAgIHZhciBjID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcbiAgICB2YXIgcmVzb2x2ZSQkMSA9IGMucmVzb2x2ZTtcblxuXG4gICAgaWYgKHJlc29sdmUkJDEgPT09IHJlc29sdmUkMSkge1xuICAgICAgdmFyIF90aGVuID0gZ2V0VGhlbihlbnRyeSk7XG5cbiAgICAgIGlmIChfdGhlbiA9PT0gdGhlbiAmJiBlbnRyeS5fc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICAgICAgdGhpcy5fc2V0dGxlZEF0KGVudHJ5Ll9zdGF0ZSwgaSwgZW50cnkuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBfdGhlbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcbiAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gZW50cnk7XG4gICAgICB9IGVsc2UgaWYgKGMgPT09IFByb21pc2UkMSkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBjKG5vb3ApO1xuICAgICAgICBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIGVudHJ5LCBfdGhlbik7XG4gICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChwcm9taXNlLCBpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgYyhmdW5jdGlvbiAocmVzb2x2ZSQkMSkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlJCQxKGVudHJ5KTtcbiAgICAgICAgfSksIGkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl93aWxsU2V0dGxlQXQocmVzb2x2ZSQkMShlbnRyeSksIGkpO1xuICAgIH1cbiAgfTtcblxuICBFbnVtZXJhdG9yLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24gX3NldHRsZWRBdChzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcblxuXG4gICAgaWYgKHByb21pc2UuX3N0YXRlID09PSBQRU5ESU5HKSB7XG4gICAgICB0aGlzLl9yZW1haW5pbmctLTtcblxuICAgICAgaWYgKHN0YXRlID09PSBSRUpFQ1RFRCkge1xuICAgICAgICByZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgIH1cbiAgfTtcblxuICBFbnVtZXJhdG9yLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24gX3dpbGxTZXR0bGVBdChwcm9taXNlLCBpKSB7XG4gICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgc3Vic2NyaWJlKHByb21pc2UsIHVuZGVmaW5lZCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZW51bWVyYXRvci5fc2V0dGxlZEF0KEZVTEZJTExFRCwgaSwgdmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIHJldHVybiBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIEVudW1lcmF0b3I7XG59KCk7XG5cbi8qKlxuICBgUHJvbWlzZS5hbGxgIGFjY2VwdHMgYW4gYXJyYXkgb2YgcHJvbWlzZXMsIGFuZCByZXR1cm5zIGEgbmV3IHByb21pc2Ugd2hpY2hcbiAgaXMgZnVsZmlsbGVkIHdpdGggYW4gYXJyYXkgb2YgZnVsZmlsbG1lbnQgdmFsdWVzIGZvciB0aGUgcGFzc2VkIHByb21pc2VzLCBvclxuICByZWplY3RlZCB3aXRoIHRoZSByZWFzb24gb2YgdGhlIGZpcnN0IHBhc3NlZCBwcm9taXNlIHRvIGJlIHJlamVjdGVkLiBJdCBjYXN0cyBhbGxcbiAgZWxlbWVudHMgb2YgdGhlIHBhc3NlZCBpdGVyYWJsZSB0byBwcm9taXNlcyBhcyBpdCBydW5zIHRoaXMgYWxnb3JpdGhtLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSByZXNvbHZlKDEpO1xuICBsZXQgcHJvbWlzZTIgPSByZXNvbHZlKDIpO1xuICBsZXQgcHJvbWlzZTMgPSByZXNvbHZlKDMpO1xuICBsZXQgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihhcnJheSl7XG4gICAgLy8gVGhlIGFycmF5IGhlcmUgd291bGQgYmUgWyAxLCAyLCAzIF07XG4gIH0pO1xuICBgYGBcblxuICBJZiBhbnkgb2YgdGhlIGBwcm9taXNlc2AgZ2l2ZW4gdG8gYGFsbGAgYXJlIHJlamVjdGVkLCB0aGUgZmlyc3QgcHJvbWlzZVxuICB0aGF0IGlzIHJlamVjdGVkIHdpbGwgYmUgZ2l2ZW4gYXMgYW4gYXJndW1lbnQgdG8gdGhlIHJldHVybmVkIHByb21pc2VzJ3NcbiAgcmVqZWN0aW9uIGhhbmRsZXIuIEZvciBleGFtcGxlOlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSByZXNvbHZlKDEpO1xuICBsZXQgcHJvbWlzZTIgPSByZWplY3QobmV3IEVycm9yKFwiMlwiKSk7XG4gIGxldCBwcm9taXNlMyA9IHJlamVjdChuZXcgRXJyb3IoXCIzXCIpKTtcbiAgbGV0IHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oYXJyYXkpe1xuICAgIC8vIENvZGUgaGVyZSBuZXZlciBydW5zIGJlY2F1c2UgdGhlcmUgYXJlIHJlamVjdGVkIHByb21pc2VzIVxuICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgIC8vIGVycm9yLm1lc3NhZ2UgPT09IFwiMlwiXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIGFsbFxuICBAc3RhdGljXG4gIEBwYXJhbSB7QXJyYXl9IGVudHJpZXMgYXJyYXkgb2YgcHJvbWlzZXNcbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIGFsbCBgcHJvbWlzZXNgIGhhdmUgYmVlblxuICBmdWxmaWxsZWQsIG9yIHJlamVjdGVkIGlmIGFueSBvZiB0aGVtIGJlY29tZSByZWplY3RlZC5cbiAgQHN0YXRpY1xuKi9cbmZ1bmN0aW9uIGFsbChlbnRyaWVzKSB7XG4gIHJldHVybiBuZXcgRW51bWVyYXRvcih0aGlzLCBlbnRyaWVzKS5wcm9taXNlO1xufVxuXG4vKipcbiAgYFByb21pc2UucmFjZWAgcmV0dXJucyBhIG5ldyBwcm9taXNlIHdoaWNoIGlzIHNldHRsZWQgaW4gdGhlIHNhbWUgd2F5IGFzIHRoZVxuICBmaXJzdCBwYXNzZWQgcHJvbWlzZSB0byBzZXR0bGUuXG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAxJyk7XG4gICAgfSwgMjAwKTtcbiAgfSk7XG5cbiAgbGV0IHByb21pc2UyID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKCdwcm9taXNlIDInKTtcbiAgICB9LCAxMDApO1xuICB9KTtcblxuICBQcm9taXNlLnJhY2UoW3Byb21pc2UxLCBwcm9taXNlMl0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAvLyByZXN1bHQgPT09ICdwcm9taXNlIDInIGJlY2F1c2UgaXQgd2FzIHJlc29sdmVkIGJlZm9yZSBwcm9taXNlMVxuICAgIC8vIHdhcyByZXNvbHZlZC5cbiAgfSk7XG4gIGBgYFxuXG4gIGBQcm9taXNlLnJhY2VgIGlzIGRldGVybWluaXN0aWMgaW4gdGhhdCBvbmx5IHRoZSBzdGF0ZSBvZiB0aGUgZmlyc3RcbiAgc2V0dGxlZCBwcm9taXNlIG1hdHRlcnMuIEZvciBleGFtcGxlLCBldmVuIGlmIG90aGVyIHByb21pc2VzIGdpdmVuIHRvIHRoZVxuICBgcHJvbWlzZXNgIGFycmF5IGFyZ3VtZW50IGFyZSByZXNvbHZlZCwgYnV0IHRoZSBmaXJzdCBzZXR0bGVkIHByb21pc2UgaGFzXG4gIGJlY29tZSByZWplY3RlZCBiZWZvcmUgdGhlIG90aGVyIHByb21pc2VzIGJlY2FtZSBmdWxmaWxsZWQsIHRoZSByZXR1cm5lZFxuICBwcm9taXNlIHdpbGwgYmVjb21lIHJlamVjdGVkOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKCdwcm9taXNlIDEnKTtcbiAgICB9LCAyMDApO1xuICB9KTtcblxuICBsZXQgcHJvbWlzZTIgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ3Byb21pc2UgMicpKTtcbiAgICB9LCAxMDApO1xuICB9KTtcblxuICBQcm9taXNlLnJhY2UoW3Byb21pc2UxLCBwcm9taXNlMl0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVuc1xuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHJlYXNvbi5tZXNzYWdlID09PSAncHJvbWlzZSAyJyBiZWNhdXNlIHByb21pc2UgMiBiZWNhbWUgcmVqZWN0ZWQgYmVmb3JlXG4gICAgLy8gcHJvbWlzZSAxIGJlY2FtZSBmdWxmaWxsZWRcbiAgfSk7XG4gIGBgYFxuXG4gIEFuIGV4YW1wbGUgcmVhbC13b3JsZCB1c2UgY2FzZSBpcyBpbXBsZW1lbnRpbmcgdGltZW91dHM6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBQcm9taXNlLnJhY2UoW2FqYXgoJ2Zvby5qc29uJyksIHRpbWVvdXQoNTAwMCldKVxuICBgYGBcblxuICBAbWV0aG9kIHJhY2VcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FycmF5fSBwcm9taXNlcyBhcnJheSBvZiBwcm9taXNlcyB0byBvYnNlcnZlXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHdoaWNoIHNldHRsZXMgaW4gdGhlIHNhbWUgd2F5IGFzIHRoZSBmaXJzdCBwYXNzZWRcbiAgcHJvbWlzZSB0byBzZXR0bGUuXG4qL1xuZnVuY3Rpb24gcmFjZShlbnRyaWVzKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgaWYgKCFpc0FycmF5KGVudHJpZXMpKSB7XG4gICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiAoXywgcmVqZWN0KSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICBgUHJvbWlzZS5yZWplY3RgIHJldHVybnMgYSBwcm9taXNlIHJlamVjdGVkIHdpdGggdGhlIHBhc3NlZCBgcmVhc29uYC5cbiAgSXQgaXMgc2hvcnRoYW5kIGZvciB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHJlamVjdChuZXcgRXJyb3IoJ1dIT09QUycpKTtcbiAgfSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyBDb2RlIGhlcmUgZG9lc24ndCBydW4gYmVjYXVzZSB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgfSk7XG4gIGBgYFxuXG4gIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdXSE9PUFMnKSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyBDb2RlIGhlcmUgZG9lc24ndCBydW4gYmVjYXVzZSB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcmVqZWN0XG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBbnl9IHJlYXNvbiB2YWx1ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aC5cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgcmVqZWN0ZWQgd2l0aCB0aGUgZ2l2ZW4gYHJlYXNvbmAuXG4qL1xuZnVuY3Rpb24gcmVqZWN0JDEocmVhc29uKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKG5vb3ApO1xuICByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIG5lZWRzUmVzb2x2ZXIoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbn1cblxuZnVuY3Rpb24gbmVlZHNOZXcoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG59XG5cbi8qKlxuICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsIHdoaWNoXG4gIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICBUZXJtaW5vbG9neVxuICAtLS0tLS0tLS0tLVxuXG4gIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gIC0gYHRoZW5hYmxlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIGEgYHRoZW5gIG1ldGhvZC5cbiAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgLSBgcmVhc29uYCBpcyBhIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdoeSBhIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgUHJvbWlzZXMgdGhhdCBhcmUgZnVsZmlsbGVkIGhhdmUgYSBmdWxmaWxsbWVudCB2YWx1ZSBhbmQgYXJlIGluIHRoZSBmdWxmaWxsZWRcbiAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICBQcm9taXNlcyBjYW4gYWxzbyBiZSBzYWlkIHRvICpyZXNvbHZlKiBhIHZhbHVlLiAgSWYgdGhpcyB2YWx1ZSBpcyBhbHNvIGFcbiAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgaXRzZWxmIHJlamVjdCwgYW5kIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgd2lsbFxuICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gIEJhc2ljIFVzYWdlOlxuICAtLS0tLS0tLS0tLS1cblxuICBgYGBqc1xuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIC8vIG9uIHN1Y2Nlc3NcbiAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgIC8vIG9uIGZhaWx1cmVcbiAgICByZWplY3QocmVhc29uKTtcbiAgfSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gb24gcmVqZWN0aW9uXG4gIH0pO1xuICBgYGBcblxuICBBZHZhbmNlZCBVc2FnZTpcbiAgLS0tLS0tLS0tLS0tLS0tXG5cbiAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICBgYGBqc1xuICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAvLyBvbiBmdWxmaWxsbWVudFxuICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAvLyBvbiByZWplY3Rpb25cbiAgfSk7XG4gIGBgYFxuXG4gIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgYGBganNcbiAgUHJvbWlzZS5hbGwoW1xuICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgIGdldEpTT04oJy9jb21tZW50cycpXG4gIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgdmFsdWVzWzFdIC8vID0+IGNvbW1lbnRzSlNPTlxuXG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfSk7XG4gIGBgYFxuXG4gIEBjbGFzcyBQcm9taXNlXG4gIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmVyXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQGNvbnN0cnVjdG9yXG4qL1xuXG52YXIgUHJvbWlzZSQxID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQcm9taXNlKHJlc29sdmVyKSB7XG4gICAgdGhpc1tQUk9NSVNFX0lEXSA9IG5leHRJZCgpO1xuICAgIHRoaXMuX3Jlc3VsdCA9IHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICBpZiAobm9vcCAhPT0gcmVzb2x2ZXIpIHtcbiAgICAgIHR5cGVvZiByZXNvbHZlciAhPT0gJ2Z1bmN0aW9uJyAmJiBuZWVkc1Jlc29sdmVyKCk7XG4gICAgICB0aGlzIGluc3RhbmNlb2YgUHJvbWlzZSA/IGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKSA6IG5lZWRzTmV3KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyB1c2VyIGlzIHVuYXZhaWxhYmxlLCBhbmQgeW91IGFyZSBnaXZlbiB0aGUgcmVhc29uIHdoeVxuICB9KTtcbiAgYGBgXG4gICBDaGFpbmluZ1xuICAtLS0tLS0tLVxuICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiB1c2VyLm5hbWU7XG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICByZXR1cm4gJ2RlZmF1bHQgbmFtZSc7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgLy8gSWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGB1c2VyTmFtZWAgd2lsbCBiZSB0aGUgdXNlcidzIG5hbWUsIG90aGVyd2lzZSBpdFxuICAgIC8vIHdpbGwgYmUgYCdkZWZhdWx0IG5hbWUnYFxuICB9KTtcbiAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScpO1xuICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gIH0pO1xuICBgYGBcbiAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB0aHJvdyBuZXcgUGVkYWdvZ2ljYWxFeGNlcHRpb24oJ1Vwc3RyZWFtIGVycm9yJyk7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gbmV2ZXIgcmVhY2hlZFxuICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIC8vIFRoZSBgUGVkZ2Fnb2NpYWxFeGNlcHRpb25gIGlzIHByb3BhZ2F0ZWQgYWxsIHRoZSB3YXkgZG93biB0byBoZXJlXG4gIH0pO1xuICBgYGBcbiAgIEFzc2ltaWxhdGlvblxuICAtLS0tLS0tLS0tLS1cbiAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uIGhhbmRsZXIuIFRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCB0aGVuIGJlIHBlbmRpbmdcbiAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICB9KTtcbiAgYGBgXG4gICBJZiB0aGUgYXNzaW1saWF0ZWQgcHJvbWlzZSByZWplY3RzLCB0aGVuIHRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCBhbHNvIHJlamVjdC5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gIH0pO1xuICBgYGBcbiAgIFNpbXBsZSBFeGFtcGxlXG4gIC0tLS0tLS0tLS0tLS0tXG4gICBTeW5jaHJvbm91cyBFeGFtcGxlXG4gICBgYGBqYXZhc2NyaXB0XG4gIGxldCByZXN1bHQ7XG4gICB0cnkge1xuICAgIHJlc3VsdCA9IGZpbmRSZXN1bHQoKTtcbiAgICAvLyBzdWNjZXNzXG4gIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgLy8gZmFpbHVyZVxuICB9XG4gIGBgYFxuICAgRXJyYmFjayBFeGFtcGxlXG4gICBgYGBqc1xuICBmaW5kUmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCwgZXJyKXtcbiAgICBpZiAoZXJyKSB7XG4gICAgICAvLyBmYWlsdXJlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICB9XG4gIH0pO1xuICBgYGBcbiAgIFByb21pc2UgRXhhbXBsZTtcbiAgIGBgYGphdmFzY3JpcHRcbiAgZmluZFJlc3VsdCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAvLyBzdWNjZXNzXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gZmFpbHVyZVxuICB9KTtcbiAgYGBgXG4gICBBZHZhbmNlZCBFeGFtcGxlXG4gIC0tLS0tLS0tLS0tLS0tXG4gICBTeW5jaHJvbm91cyBFeGFtcGxlXG4gICBgYGBqYXZhc2NyaXB0XG4gIGxldCBhdXRob3IsIGJvb2tzO1xuICAgdHJ5IHtcbiAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAvLyBzdWNjZXNzXG4gIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgLy8gZmFpbHVyZVxuICB9XG4gIGBgYFxuICAgRXJyYmFjayBFeGFtcGxlXG4gICBgYGBqc1xuICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuICAgfVxuICAgZnVuY3Rpb24gZmFpbHVyZShyZWFzb24pIHtcbiAgIH1cbiAgIGZpbmRBdXRob3IoZnVuY3Rpb24oYXV0aG9yLCBlcnIpe1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgIC8vIGZhaWx1cmVcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZmluZEJvb29rc0J5QXV0aG9yKGF1dGhvciwgZnVuY3Rpb24oYm9va3MsIGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm91bmRCb29rcyhib29rcyk7XG4gICAgICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgfVxuICAgICAgLy8gc3VjY2Vzc1xuICAgIH1cbiAgfSk7XG4gIGBgYFxuICAgUHJvbWlzZSBFeGFtcGxlO1xuICAgYGBgamF2YXNjcmlwdFxuICBmaW5kQXV0aG9yKCkuXG4gICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgdGhlbihmdW5jdGlvbihib29rcyl7XG4gICAgICAvLyBmb3VuZCBib29rc1xuICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gIH0pO1xuICBgYGBcbiAgIEBtZXRob2QgdGhlblxuICBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZ1bGZpbGxlZFxuICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGVkXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cblxuICAvKipcbiAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuICBgYGBqc1xuICBmdW5jdGlvbiBmaW5kQXV0aG9yKCl7XG4gIHRocm93IG5ldyBFcnJvcignY291bGRuJ3QgZmluZCB0aGF0IGF1dGhvcicpO1xuICB9XG4gIC8vIHN5bmNocm9ub3VzXG4gIHRyeSB7XG4gIGZpbmRBdXRob3IoKTtcbiAgfSBjYXRjaChyZWFzb24pIHtcbiAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgfVxuICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICB9KTtcbiAgYGBgXG4gIEBtZXRob2QgY2F0Y2hcbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfVxuICAqL1xuXG5cbiAgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbiBfY2F0Y2gob25SZWplY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKTtcbiAgfTtcblxuICAvKipcbiAgICBgZmluYWxseWAgd2lsbCBiZSBpbnZva2VkIHJlZ2FyZGxlc3Mgb2YgdGhlIHByb21pc2UncyBmYXRlIGp1c3QgYXMgbmF0aXZlXG4gICAgdHJ5L2NhdGNoL2ZpbmFsbHkgYmVoYXZlc1xuICBcbiAgICBTeW5jaHJvbm91cyBleGFtcGxlOlxuICBcbiAgICBgYGBqc1xuICAgIGZpbmRBdXRob3IoKSB7XG4gICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQXV0aG9yKCk7XG4gICAgfVxuICBcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZpbmRBdXRob3IoKTsgLy8gc3VjY2VlZCBvciBmYWlsXG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBhbHdheXMgcnVuc1xuICAgICAgLy8gZG9lc24ndCBhZmZlY3QgdGhlIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICBgYGBcbiAgXG4gICAgQXN5bmNocm9ub3VzIGV4YW1wbGU6XG4gIFxuICAgIGBgYGpzXG4gICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICByZXR1cm4gZmluZE90aGVyQXV0aGVyKCk7XG4gICAgfSkuZmluYWxseShmdW5jdGlvbigpe1xuICAgICAgLy8gYXV0aG9yIHdhcyBlaXRoZXIgZm91bmQsIG9yIG5vdFxuICAgIH0pO1xuICAgIGBgYFxuICBcbiAgICBAbWV0aG9kIGZpbmFsbHlcbiAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG5cblxuICBQcm9taXNlLnByb3RvdHlwZS5maW5hbGx5ID0gZnVuY3Rpb24gX2ZpbmFsbHkoY2FsbGJhY2spIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgdmFyIGNvbnN0cnVjdG9yID0gcHJvbWlzZS5jb25zdHJ1Y3RvcjtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlLnRoZW4oY2FsbGJhY2ssIGNhbGxiYWNrKTtcbiAgfTtcblxuICByZXR1cm4gUHJvbWlzZTtcbn0oKTtcblxuUHJvbWlzZSQxLnByb3RvdHlwZS50aGVuID0gdGhlbjtcblByb21pc2UkMS5hbGwgPSBhbGw7XG5Qcm9taXNlJDEucmFjZSA9IHJhY2U7XG5Qcm9taXNlJDEucmVzb2x2ZSA9IHJlc29sdmUkMTtcblByb21pc2UkMS5yZWplY3QgPSByZWplY3QkMTtcblByb21pc2UkMS5fc2V0U2NoZWR1bGVyID0gc2V0U2NoZWR1bGVyO1xuUHJvbWlzZSQxLl9zZXRBc2FwID0gc2V0QXNhcDtcblByb21pc2UkMS5fYXNhcCA9IGFzYXA7XG5cbi8qZ2xvYmFsIHNlbGYqL1xuZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gIHZhciBsb2NhbCA9IHZvaWQgMDtcblxuICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsb2NhbCA9IGdsb2JhbDtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsb2NhbCA9IHNlbGY7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BvbHlmaWxsIGZhaWxlZCBiZWNhdXNlIGdsb2JhbCBvYmplY3QgaXMgdW5hdmFpbGFibGUgaW4gdGhpcyBlbnZpcm9ubWVudCcpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBQID0gbG9jYWwuUHJvbWlzZTtcblxuICBpZiAoUCkge1xuICAgIHZhciBwcm9taXNlVG9TdHJpbmcgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBwcm9taXNlVG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoUC5yZXNvbHZlKCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHNpbGVudGx5IGlnbm9yZWRcbiAgICB9XG5cbiAgICBpZiAocHJvbWlzZVRvU3RyaW5nID09PSAnW29iamVjdCBQcm9taXNlXScgJiYgIVAuY2FzdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIGxvY2FsLlByb21pc2UgPSBQcm9taXNlJDE7XG59XG5cbi8vIFN0cmFuZ2UgY29tcGF0Li5cblByb21pc2UkMS5wb2x5ZmlsbCA9IHBvbHlmaWxsO1xuUHJvbWlzZSQxLlByb21pc2UgPSBQcm9taXNlJDE7XG5cbnJldHVybiBQcm9taXNlJDE7XG5cbn0pKSk7XG5cblxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lczYtcHJvbWlzZS5tYXBcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTkFOID0gMCAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW0gPSAvXlxccyt8XFxzKyQvZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgbmF0aXZlTWluID0gTWF0aC5taW47XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGludm9jYXRpb24uXG4gKi9cbnZhciBub3cgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJvb3QuRGF0ZS5ub3coKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGRlbGF5cyBpbnZva2luZyBgZnVuY2AgdW50aWwgYWZ0ZXIgYHdhaXRgXG4gKiBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3YXNcbiAqIGludm9rZWQuIFRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgIG1ldGhvZCB0byBjYW5jZWxcbiAqIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLlxuICogUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlXG4gKiBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkXG4gKiB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50XG4gKiBjYWxscyB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYFxuICogaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIGRlYm91bmNlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy5kZWJvdW5jZWAgYW5kIGBfLnRocm90dGxlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdXG4gKiAgVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGludm9rZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eC5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gSW52b2tlIGBzZW5kTWFpbGAgd2hlbiBjbGlja2VkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHMuXG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gKiAgICdsZWFkaW5nJzogdHJ1ZSxcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqXG4gKiAvLyBFbnN1cmUgYGJhdGNoTG9nYCBpcyBpbnZva2VkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzLlxuICogdmFyIGRlYm91bmNlZCA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDI1MCwgeyAnbWF4V2FpdCc6IDEwMDAgfSk7XG4gKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gKiBqUXVlcnkoc291cmNlKS5vbignbWVzc2FnZScsIGRlYm91bmNlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyBkZWJvdW5jZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGRlYm91bmNlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsYXN0QXJncyxcbiAgICAgIGxhc3RUaGlzLFxuICAgICAgbWF4V2FpdCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHRpbWVySWQsXG4gICAgICBsYXN0Q2FsbFRpbWUsXG4gICAgICBsYXN0SW52b2tlVGltZSA9IDAsXG4gICAgICBsZWFkaW5nID0gZmFsc2UsXG4gICAgICBtYXhpbmcgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB3YWl0ID0gdG9OdW1iZXIod2FpdCkgfHwgMDtcbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICEhb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heGluZyA9ICdtYXhXYWl0JyBpbiBvcHRpb25zO1xuICAgIG1heFdhaXQgPSBtYXhpbmcgPyBuYXRpdmVNYXgodG9OdW1iZXIob3B0aW9ucy5tYXhXYWl0KSB8fCAwLCB3YWl0KSA6IG1heFdhaXQ7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZUZ1bmModGltZSkge1xuICAgIHZhciBhcmdzID0gbGFzdEFyZ3MsXG4gICAgICAgIHRoaXNBcmcgPSBsYXN0VGhpcztcblxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlYWRpbmdFZGdlKHRpbWUpIHtcbiAgICAvLyBSZXNldCBhbnkgYG1heFdhaXRgIHRpbWVyLlxuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICAvLyBTdGFydCB0aGUgdGltZXIgZm9yIHRoZSB0cmFpbGluZyBlZGdlLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgLy8gSW52b2tlIHRoZSBsZWFkaW5nIGVkZ2UuXG4gICAgcmV0dXJuIGxlYWRpbmcgPyBpbnZva2VGdW5jKHRpbWUpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtYWluaW5nV2FpdCh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZSxcbiAgICAgICAgcmVzdWx0ID0gd2FpdCAtIHRpbWVTaW5jZUxhc3RDYWxsO1xuXG4gICAgcmV0dXJuIG1heGluZyA/IG5hdGl2ZU1pbihyZXN1bHQsIG1heFdhaXQgLSB0aW1lU2luY2VMYXN0SW52b2tlKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZEludm9rZSh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZTtcblxuICAgIC8vIEVpdGhlciB0aGlzIGlzIHRoZSBmaXJzdCBjYWxsLCBhY3Rpdml0eSBoYXMgc3RvcHBlZCBhbmQgd2UncmUgYXQgdGhlXG4gICAgLy8gdHJhaWxpbmcgZWRnZSwgdGhlIHN5c3RlbSB0aW1lIGhhcyBnb25lIGJhY2t3YXJkcyBhbmQgd2UncmUgdHJlYXRpbmdcbiAgICAvLyBpdCBhcyB0aGUgdHJhaWxpbmcgZWRnZSwgb3Igd2UndmUgaGl0IHRoZSBgbWF4V2FpdGAgbGltaXQuXG4gICAgcmV0dXJuIChsYXN0Q2FsbFRpbWUgPT09IHVuZGVmaW5lZCB8fCAodGltZVNpbmNlTGFzdENhbGwgPj0gd2FpdCkgfHxcbiAgICAgICh0aW1lU2luY2VMYXN0Q2FsbCA8IDApIHx8IChtYXhpbmcgJiYgdGltZVNpbmNlTGFzdEludm9rZSA+PSBtYXhXYWl0KSk7XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lckV4cGlyZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICBpZiAoc2hvdWxkSW52b2tlKHRpbWUpKSB7XG4gICAgICByZXR1cm4gdHJhaWxpbmdFZGdlKHRpbWUpO1xuICAgIH1cbiAgICAvLyBSZXN0YXJ0IHRoZSB0aW1lci5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhaWxpbmdFZGdlKHRpbWUpIHtcbiAgICB0aW1lcklkID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gT25seSBpbnZva2UgaWYgd2UgaGF2ZSBgbGFzdEFyZ3NgIHdoaWNoIG1lYW5zIGBmdW5jYCBoYXMgYmVlblxuICAgIC8vIGRlYm91bmNlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGlmICh0cmFpbGluZyAmJiBsYXN0QXJncykge1xuICAgICAgcmV0dXJuIGludm9rZUZ1bmModGltZSk7XG4gICAgfVxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBpZiAodGltZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgfVxuICAgIGxhc3RJbnZva2VUaW1lID0gMDtcbiAgICBsYXN0QXJncyA9IGxhc3RDYWxsVGltZSA9IGxhc3RUaGlzID0gdGltZXJJZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHJldHVybiB0aW1lcklkID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiB0cmFpbGluZ0VkZ2Uobm93KCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2VkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCksXG4gICAgICAgIGlzSW52b2tpbmcgPSBzaG91bGRJbnZva2UodGltZSk7XG5cbiAgICBsYXN0QXJncyA9IGFyZ3VtZW50cztcbiAgICBsYXN0VGhpcyA9IHRoaXM7XG4gICAgbGFzdENhbGxUaW1lID0gdGltZTtcblxuICAgIGlmIChpc0ludm9raW5nKSB7XG4gICAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nRWRnZShsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG1heGluZykge1xuICAgICAgICAvLyBIYW5kbGUgaW52b2NhdGlvbnMgaW4gYSB0aWdodCBsb29wLlxuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGRlYm91bmNlZC5jYW5jZWwgPSBjYW5jZWw7XG4gIGRlYm91bmNlZC5mbHVzaCA9IGZsdXNoO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25jZSBwZXJcbiAqIGV2ZXJ5IGB3YWl0YCBtaWxsaXNlY29uZHMuIFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgXG4gKiBtZXRob2QgdG8gY2FuY2VsIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvXG4gKiBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS4gUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2BcbiAqIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGBcbiAqIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZCB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGVcbiAqIHRocm90dGxlZCBmdW5jdGlvbi4gU3Vic2VxdWVudCBjYWxscyB0byB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHJldHVybiB0aGVcbiAqIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRocm90dGxlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy50aHJvdHRsZWAgYW5kIGBfLmRlYm91bmNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGludm9jYXRpb25zIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZy5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlcy5cbiAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwgeyAndHJhaWxpbmcnOiBmYWxzZSB9KTtcbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCB0aHJvdHRsZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgdGhyb3R0bGVkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCB0aHJvdHRsZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGVhZGluZyA9IHRydWUsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIHtcbiAgICAnbGVhZGluZyc6IGxlYWRpbmcsXG4gICAgJ21heFdhaXQnOiB3YWl0LFxuICAgICd0cmFpbGluZyc6IHRyYWlsaW5nXG4gIH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PSAnZnVuY3Rpb24nID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlVHJpbSwgJycpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcbiIsInZhciB3aWxkY2FyZCA9IHJlcXVpcmUoJ3dpbGRjYXJkJyk7XG52YXIgcmVNaW1lUGFydFNwbGl0ID0gL1tcXC9cXCtcXC5dLztcblxuLyoqXG4gICMgbWltZS1tYXRjaFxuXG4gIEEgc2ltcGxlIGZ1bmN0aW9uIHRvIGNoZWNrZXIgd2hldGhlciBhIHRhcmdldCBtaW1lIHR5cGUgbWF0Y2hlcyBhIG1pbWUtdHlwZVxuICBwYXR0ZXJuIChlLmcuIGltYWdlL2pwZWcgbWF0Y2hlcyBpbWFnZS9qcGVnIE9SIGltYWdlLyopLlxuXG4gICMjIEV4YW1wbGUgVXNhZ2VcblxuICA8PDwgZXhhbXBsZS5qc1xuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0LCBwYXR0ZXJuKSB7XG4gIGZ1bmN0aW9uIHRlc3QocGF0dGVybikge1xuICAgIHZhciByZXN1bHQgPSB3aWxkY2FyZChwYXR0ZXJuLCB0YXJnZXQsIHJlTWltZVBhcnRTcGxpdCk7XG5cbiAgICAvLyBlbnN1cmUgdGhhdCB3ZSBoYXZlIGEgdmFsaWQgbWltZSB0eXBlIChzaG91bGQgaGF2ZSB0d28gcGFydHMpXG4gICAgcmV0dXJuIHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID49IDI7XG4gIH1cblxuICByZXR1cm4gcGF0dGVybiA/IHRlc3QocGF0dGVybi5zcGxpdCgnOycpWzBdKSA6IHRlc3Q7XG59O1xuIiwiLyoqXG4qIENyZWF0ZSBhbiBldmVudCBlbWl0dGVyIHdpdGggbmFtZXNwYWNlc1xuKiBAbmFtZSBjcmVhdGVOYW1lc3BhY2VFbWl0dGVyXG4qIEBleGFtcGxlXG4qIHZhciBlbWl0dGVyID0gcmVxdWlyZSgnLi9pbmRleCcpKClcbipcbiogZW1pdHRlci5vbignKicsIGZ1bmN0aW9uICgpIHtcbiogICBjb25zb2xlLmxvZygnYWxsIGV2ZW50cyBlbWl0dGVkJywgdGhpcy5ldmVudClcbiogfSlcbipcbiogZW1pdHRlci5vbignZXhhbXBsZScsIGZ1bmN0aW9uICgpIHtcbiogICBjb25zb2xlLmxvZygnZXhhbXBsZSBldmVudCBlbWl0dGVkJylcbiogfSlcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZU5hbWVzcGFjZUVtaXR0ZXIgKCkge1xuICB2YXIgZW1pdHRlciA9IHt9XG4gIHZhciBfZm5zID0gZW1pdHRlci5fZm5zID0ge31cblxuICAvKipcbiAgKiBFbWl0IGFuIGV2ZW50LiBPcHRpb25hbGx5IG5hbWVzcGFjZSB0aGUgZXZlbnQuIEhhbmRsZXJzIGFyZSBmaXJlZCBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSB3ZXJlIGFkZGVkIHdpdGggZXhhY3QgbWF0Y2hlcyB0YWtpbmcgcHJlY2VkZW5jZS4gU2VwYXJhdGUgdGhlIG5hbWVzcGFjZSBhbmQgZXZlbnQgd2l0aCBhIGA6YFxuICAqIEBuYW1lIGVtaXRcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQg4oCTIHRoZSBuYW1lIG9mIHRoZSBldmVudCwgd2l0aCBvcHRpb25hbCBuYW1lc3BhY2VcbiAgKiBAcGFyYW0gey4uLip9IGRhdGEg4oCTIHVwIHRvIDYgYXJndW1lbnRzIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIuZW1pdCgnZXhhbXBsZScpXG4gICogZW1pdHRlci5lbWl0KCdkZW1vOnRlc3QnKVxuICAqIGVtaXR0ZXIuZW1pdCgnZGF0YScsIHsgZXhhbXBsZTogdHJ1ZX0sICdhIHN0cmluZycsIDEpXG4gICovXG4gIGVtaXR0ZXIuZW1pdCA9IGZ1bmN0aW9uIGVtaXQgKGV2ZW50LCBhcmcxLCBhcmcyLCBhcmczLCBhcmc0LCBhcmc1LCBhcmc2KSB7XG4gICAgdmFyIHRvRW1pdCA9IGdldExpc3RlbmVycyhldmVudClcblxuICAgIGlmICh0b0VtaXQubGVuZ3RoKSB7XG4gICAgICBlbWl0QWxsKGV2ZW50LCB0b0VtaXQsIFthcmcxLCBhcmcyLCBhcmczLCBhcmc0LCBhcmc1LCBhcmc2XSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGUgZW4gZXZlbnQgbGlzdGVuZXIuXG4gICogQG5hbWUgb25cbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vbignZXhhbXBsZScsIGZ1bmN0aW9uICgpIHt9KVxuICAqIGVtaXR0ZXIub24oJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vbiA9IGZ1bmN0aW9uIG9uIChldmVudCwgZm4pIHtcbiAgICBpZiAoIV9mbnNbZXZlbnRdKSB7XG4gICAgICBfZm5zW2V2ZW50XSA9IFtdXG4gICAgfVxuXG4gICAgX2Zuc1tldmVudF0ucHVzaChmbilcbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZSBlbiBldmVudCBsaXN0ZW5lciB0aGF0IGZpcmVzIG9uY2UuXG4gICogQG5hbWUgb25jZVxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9uY2UoJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7fSlcbiAgKiBlbWl0dGVyLm9uY2UoJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vbmNlID0gZnVuY3Rpb24gb25jZSAoZXZlbnQsIGZuKSB7XG4gICAgZnVuY3Rpb24gb25lICgpIHtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIGVtaXR0ZXIub2ZmKGV2ZW50LCBvbmUpXG4gICAgfVxuICAgIHRoaXMub24oZXZlbnQsIG9uZSlcbiAgfVxuXG4gIC8qKlxuICAqIFN0b3AgbGlzdGVuaW5nIHRvIGFuIGV2ZW50LiBTdG9wIGFsbCBsaXN0ZW5lcnMgb24gYW4gZXZlbnQgYnkgb25seSBwYXNzaW5nIHRoZSBldmVudCBuYW1lLiBTdG9wIGEgc2luZ2xlIGxpc3RlbmVyIGJ5IHBhc3NpbmcgdGhhdCBldmVudCBoYW5kbGVyIGFzIGEgY2FsbGJhY2suXG4gICogWW91IG11c3QgYmUgZXhwbGljaXQgYWJvdXQgd2hhdCB3aWxsIGJlIHVuc3Vic2NyaWJlZDogYGVtaXR0ZXIub2ZmKCdkZW1vJylgIHdpbGwgdW5zdWJzY3JpYmUgYW4gYGVtaXR0ZXIub24oJ2RlbW8nKWAgbGlzdGVuZXIsXG4gICogYGVtaXR0ZXIub2ZmKCdkZW1vOmV4YW1wbGUnKWAgd2lsbCB1bnN1YnNjcmliZSBhbiBgZW1pdHRlci5vbignZGVtbzpleGFtcGxlJylgIGxpc3RlbmVyXG4gICogQG5hbWUgb2ZmXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXSDigJMgdGhlIHNwZWNpZmljIGhhbmRsZXJcbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub2ZmKCdleGFtcGxlJylcbiAgKiBlbWl0dGVyLm9mZignZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9mZiA9IGZ1bmN0aW9uIG9mZiAoZXZlbnQsIGZuKSB7XG4gICAgdmFyIGtlZXAgPSBbXVxuXG4gICAgaWYgKGV2ZW50ICYmIGZuKSB7XG4gICAgICB2YXIgZm5zID0gdGhpcy5fZm5zW2V2ZW50XVxuICAgICAgdmFyIGkgPSAwXG4gICAgICB2YXIgbCA9IGZucyA/IGZucy5sZW5ndGggOiAwXG5cbiAgICAgIGZvciAoaTsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoZm5zW2ldICE9PSBmbikge1xuICAgICAgICAgIGtlZXAucHVzaChmbnNbaV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBrZWVwLmxlbmd0aCA/IHRoaXMuX2Zuc1tldmVudF0gPSBrZWVwIDogZGVsZXRlIHRoaXMuX2Zuc1tldmVudF1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExpc3RlbmVycyAoZSkge1xuICAgIHZhciBvdXQgPSBfZm5zW2VdID8gX2Zuc1tlXSA6IFtdXG4gICAgdmFyIGlkeCA9IGUuaW5kZXhPZignOicpXG4gICAgdmFyIGFyZ3MgPSAoaWR4ID09PSAtMSkgPyBbZV0gOiBbZS5zdWJzdHJpbmcoMCwgaWR4KSwgZS5zdWJzdHJpbmcoaWR4ICsgMSldXG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKF9mbnMpXG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIGwgPSBrZXlzLmxlbmd0aFxuXG4gICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgaWYgKGtleSA9PT0gJyonKSB7XG4gICAgICAgIG91dCA9IG91dC5jb25jYXQoX2Zuc1trZXldKVxuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDIgJiYgYXJnc1swXSA9PT0ga2V5KSB7XG4gICAgICAgIG91dCA9IG91dC5jb25jYXQoX2Zuc1trZXldKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXRcbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXRBbGwgKGUsIGZucywgYXJncykge1xuICAgIHZhciBpID0gMFxuICAgIHZhciBsID0gZm5zLmxlbmd0aFxuXG4gICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoIWZuc1tpXSkgYnJlYWtcbiAgICAgIGZuc1tpXS5ldmVudCA9IGVcbiAgICAgIGZuc1tpXS5hcHBseShmbnNbaV0sIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVtaXR0ZXJcbn1cbiIsIiFmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgZnVuY3Rpb24gaChub2RlTmFtZSwgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIgbGFzdFNpbXBsZSwgY2hpbGQsIHNpbXBsZSwgaSwgY2hpbGRyZW4gPSBFTVBUWV9DSElMRFJFTjtcbiAgICAgICAgZm9yIChpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSBzdGFjay5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzICYmIG51bGwgIT0gYXR0cmlidXRlcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgaWYgKCFzdGFjay5sZW5ndGgpIHN0YWNrLnB1c2goYXR0cmlidXRlcy5jaGlsZHJlbik7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy5jaGlsZHJlbjtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoKSBpZiAoKGNoaWxkID0gc3RhY2sucG9wKCkpICYmIHZvaWQgMCAhPT0gY2hpbGQucG9wKSBmb3IgKGkgPSBjaGlsZC5sZW5ndGg7IGktLTsgKSBzdGFjay5wdXNoKGNoaWxkW2ldKTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiBjaGlsZCkgY2hpbGQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHNpbXBsZSA9ICdmdW5jdGlvbicgIT0gdHlwZW9mIG5vZGVOYW1lKSBpZiAobnVsbCA9PSBjaGlsZCkgY2hpbGQgPSAnJzsgZWxzZSBpZiAoJ251bWJlcicgPT0gdHlwZW9mIGNoaWxkKSBjaGlsZCA9IFN0cmluZyhjaGlsZCk7IGVsc2UgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBjaGlsZCkgc2ltcGxlID0gITE7XG4gICAgICAgICAgICBpZiAoc2ltcGxlICYmIGxhc3RTaW1wbGUpIGNoaWxkcmVuW2NoaWxkcmVuLmxlbmd0aCAtIDFdICs9IGNoaWxkOyBlbHNlIGlmIChjaGlsZHJlbiA9PT0gRU1QVFlfQ0hJTERSRU4pIGNoaWxkcmVuID0gWyBjaGlsZCBdOyBlbHNlIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgbGFzdFNpbXBsZSA9IHNpbXBsZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcCA9IG5ldyBWTm9kZSgpO1xuICAgICAgICBwLm5vZGVOYW1lID0gbm9kZU5hbWU7XG4gICAgICAgIHAuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgcC5hdHRyaWJ1dGVzID0gbnVsbCA9PSBhdHRyaWJ1dGVzID8gdm9pZCAwIDogYXR0cmlidXRlcztcbiAgICAgICAgcC5rZXkgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzLmtleTtcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gb3B0aW9ucy52bm9kZSkgb3B0aW9ucy52bm9kZShwKTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV4dGVuZChvYmosIHByb3BzKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gcHJvcHMpIG9ialtpXSA9IHByb3BzW2ldO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhcHBseVJlZihyZWYsIHZhbHVlKSB7XG4gICAgICAgIGlmIChudWxsICE9IHJlZikgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHJlZikgcmVmKHZhbHVlKTsgZWxzZSByZWYuY3VycmVudCA9IHZhbHVlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbG9uZUVsZW1lbnQodm5vZGUsIHByb3BzKSB7XG4gICAgICAgIHJldHVybiBoKHZub2RlLm5vZGVOYW1lLCBleHRlbmQoZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKSwgcHJvcHMpLCBhcmd1bWVudHMubGVuZ3RoID4gMiA/IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSA6IHZub2RlLmNoaWxkcmVuKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpIHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQuX19kICYmIChjb21wb25lbnQuX19kID0gITApICYmIDEgPT0gaXRlbXMucHVzaChjb21wb25lbnQpKSAob3B0aW9ucy5kZWJvdW5jZVJlbmRlcmluZyB8fCBkZWZlcikocmVyZW5kZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXJlbmRlcigpIHtcbiAgICAgICAgdmFyIHA7XG4gICAgICAgIHdoaWxlIChwID0gaXRlbXMucG9wKCkpIGlmIChwLl9fZCkgcmVuZGVyQ29tcG9uZW50KHApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShub2RlLCB2bm9kZSwgaHlkcmF0aW5nKSB7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUgfHwgJ251bWJlcicgPT0gdHlwZW9mIHZub2RlKSByZXR1cm4gdm9pZCAwICE9PSBub2RlLnNwbGl0VGV4dDtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZS5ub2RlTmFtZSkgcmV0dXJuICFub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciAmJiBpc05hbWVkTm9kZShub2RlLCB2bm9kZS5ub2RlTmFtZSk7IGVsc2UgcmV0dXJuIGh5ZHJhdGluZyB8fCBub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzTmFtZWROb2RlKG5vZGUsIG5vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBub2RlLl9fbiA9PT0gbm9kZU5hbWUgfHwgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROb2RlUHJvcHModm5vZGUpIHtcbiAgICAgICAgdmFyIHByb3BzID0gZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKTtcbiAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGRlZmF1bHRQcm9wcyA9IHZub2RlLm5vZGVOYW1lLmRlZmF1bHRQcm9wcztcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gZGVmYXVsdFByb3BzKSBmb3IgKHZhciBpIGluIGRlZmF1bHRQcm9wcykgaWYgKHZvaWQgMCA9PT0gcHJvcHNbaV0pIHByb3BzW2ldID0gZGVmYXVsdFByb3BzW2ldO1xuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZU5vZGUobm9kZU5hbWUsIGlzU3ZnKSB7XG4gICAgICAgIHZhciBub2RlID0gaXNTdmcgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbm9kZU5hbWUpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlTmFtZSk7XG4gICAgICAgIG5vZGUuX19uID0gbm9kZU5hbWU7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmVudE5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIGlmIChwYXJlbnROb2RlKSBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRBY2Nlc3Nvcihub2RlLCBuYW1lLCBvbGQsIHZhbHVlLCBpc1N2Zykge1xuICAgICAgICBpZiAoJ2NsYXNzTmFtZScgPT09IG5hbWUpIG5hbWUgPSAnY2xhc3MnO1xuICAgICAgICBpZiAoJ2tleScgPT09IG5hbWUpIDsgZWxzZSBpZiAoJ3JlZicgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGFwcGx5UmVmKG9sZCwgbnVsbCk7XG4gICAgICAgICAgICBhcHBseVJlZih2YWx1ZSwgbm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PT0gbmFtZSAmJiAhaXNTdmcpIG5vZGUuY2xhc3NOYW1lID0gdmFsdWUgfHwgJyc7IGVsc2UgaWYgKCdzdHlsZScgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgJ3N0cmluZycgPT0gdHlwZW9mIHZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiBvbGQpIG5vZGUuc3R5bGUuY3NzVGV4dCA9IHZhbHVlIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc3RyaW5nJyAhPSB0eXBlb2Ygb2xkKSBmb3IgKHZhciBpIGluIG9sZCkgaWYgKCEoaSBpbiB2YWx1ZSkpIG5vZGUuc3R5bGVbaV0gPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSBub2RlLnN0eWxlW2ldID0gJ251bWJlcicgPT0gdHlwZW9mIHZhbHVlW2ldICYmICExID09PSBJU19OT05fRElNRU5TSU9OQUwudGVzdChpKSA/IHZhbHVlW2ldICsgJ3B4JyA6IHZhbHVlW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCdkYW5nZXJvdXNseVNldElubmVySFRNTCcgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgbm9kZS5pbm5lckhUTUwgPSB2YWx1ZS5fX2h0bWwgfHwgJyc7XG4gICAgICAgIH0gZWxzZSBpZiAoJ28nID09IG5hbWVbMF0gJiYgJ24nID09IG5hbWVbMV0pIHtcbiAgICAgICAgICAgIHZhciB1c2VDYXB0dXJlID0gbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL0NhcHR1cmUkLywgJycpKTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvbGQpIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0gZWxzZSBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICAobm9kZS5fX2wgfHwgKG5vZGUuX19sID0ge30pKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCdsaXN0JyAhPT0gbmFtZSAmJiAndHlwZScgIT09IG5hbWUgJiYgIWlzU3ZnICYmIG5hbWUgaW4gbm9kZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBub2RlW25hbWVdID0gbnVsbCA9PSB2YWx1ZSA/ICcnIDogdmFsdWU7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgaWYgKChudWxsID09IHZhbHVlIHx8ICExID09PSB2YWx1ZSkgJiYgJ3NwZWxsY2hlY2snICE9IG5hbWUpIG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG5zID0gaXNTdmcgJiYgbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL154bGluazo/LywgJycpKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlIHx8ICExID09PSB2YWx1ZSkgaWYgKG5zKSBub2RlLnJlbW92ZUF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgbmFtZS50b0xvd2VyQ2FzZSgpKTsgZWxzZSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTsgZWxzZSBpZiAoJ2Z1bmN0aW9uJyAhPSB0eXBlb2YgdmFsdWUpIGlmIChucykgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSwgdmFsdWUpOyBlbHNlIG5vZGUuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBldmVudFByb3h5KGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19sW2UudHlwZV0ob3B0aW9ucy5ldmVudCAmJiBvcHRpb25zLmV2ZW50KGUpIHx8IGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmbHVzaE1vdW50cygpIHtcbiAgICAgICAgdmFyIGM7XG4gICAgICAgIHdoaWxlIChjID0gbW91bnRzLnNoaWZ0KCkpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmFmdGVyTW91bnQpIG9wdGlvbnMuYWZ0ZXJNb3VudChjKTtcbiAgICAgICAgICAgIGlmIChjLmNvbXBvbmVudERpZE1vdW50KSBjLmNvbXBvbmVudERpZE1vdW50KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgcGFyZW50LCBjb21wb25lbnRSb290KSB7XG4gICAgICAgIGlmICghZGlmZkxldmVsKyspIHtcbiAgICAgICAgICAgIGlzU3ZnTW9kZSA9IG51bGwgIT0gcGFyZW50ICYmIHZvaWQgMCAhPT0gcGFyZW50Lm93bmVyU1ZHRWxlbWVudDtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9IG51bGwgIT0gZG9tICYmICEoJ19fcHJlYWN0YXR0cl8nIGluIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJldCA9IGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBjb21wb25lbnRSb290KTtcbiAgICAgICAgaWYgKHBhcmVudCAmJiByZXQucGFyZW50Tm9kZSAhPT0gcGFyZW50KSBwYXJlbnQuYXBwZW5kQ2hpbGQocmV0KTtcbiAgICAgICAgaWYgKCEtLWRpZmZMZXZlbCkge1xuICAgICAgICAgICAgaHlkcmF0aW5nID0gITE7XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudFJvb3QpIGZsdXNoTW91bnRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIGNvbXBvbmVudFJvb3QpIHtcbiAgICAgICAgdmFyIG91dCA9IGRvbSwgcHJldlN2Z01vZGUgPSBpc1N2Z01vZGU7XG4gICAgICAgIGlmIChudWxsID09IHZub2RlIHx8ICdib29sZWFuJyA9PSB0eXBlb2Ygdm5vZGUpIHZub2RlID0gJyc7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUgfHwgJ251bWJlcicgPT0gdHlwZW9mIHZub2RlKSB7XG4gICAgICAgICAgICBpZiAoZG9tICYmIHZvaWQgMCAhPT0gZG9tLnNwbGl0VGV4dCAmJiBkb20ucGFyZW50Tm9kZSAmJiAoIWRvbS5fY29tcG9uZW50IHx8IGNvbXBvbmVudFJvb3QpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbS5ub2RlVmFsdWUgIT0gdm5vZGUpIGRvbS5ub2RlVmFsdWUgPSB2bm9kZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodm5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChkb20pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbS5wYXJlbnROb2RlKSBkb20ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQob3V0LCBkb20pO1xuICAgICAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20sICEwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXQuX19wcmVhY3RhdHRyXyA9ICEwO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdm5vZGVOYW1lID0gdm5vZGUubm9kZU5hbWU7XG4gICAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB2bm9kZU5hbWUpIHJldHVybiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgIGlzU3ZnTW9kZSA9ICdzdmcnID09PSB2bm9kZU5hbWUgPyAhMCA6ICdmb3JlaWduT2JqZWN0JyA9PT0gdm5vZGVOYW1lID8gITEgOiBpc1N2Z01vZGU7XG4gICAgICAgIHZub2RlTmFtZSA9IFN0cmluZyh2bm9kZU5hbWUpO1xuICAgICAgICBpZiAoIWRvbSB8fCAhaXNOYW1lZE5vZGUoZG9tLCB2bm9kZU5hbWUpKSB7XG4gICAgICAgICAgICBvdXQgPSBjcmVhdGVOb2RlKHZub2RlTmFtZSwgaXNTdmdNb2RlKTtcbiAgICAgICAgICAgIGlmIChkb20pIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoZG9tLmZpcnN0Q2hpbGQpIG91dC5hcHBlbmRDaGlsZChkb20uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbS5wYXJlbnROb2RlKSBkb20ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQob3V0LCBkb20pO1xuICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGRvbSwgITApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBmYyA9IG91dC5maXJzdENoaWxkLCBwcm9wcyA9IG91dC5fX3ByZWFjdGF0dHJfLCB2Y2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKG51bGwgPT0gcHJvcHMpIHtcbiAgICAgICAgICAgIHByb3BzID0gb3V0Ll9fcHJlYWN0YXR0cl8gPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGEgPSBvdXQuYXR0cmlidXRlcywgaSA9IGEubGVuZ3RoOyBpLS07ICkgcHJvcHNbYVtpXS5uYW1lXSA9IGFbaV0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoeWRyYXRpbmcgJiYgdmNoaWxkcmVuICYmIDEgPT09IHZjaGlsZHJlbi5sZW5ndGggJiYgJ3N0cmluZycgPT0gdHlwZW9mIHZjaGlsZHJlblswXSAmJiBudWxsICE9IGZjICYmIHZvaWQgMCAhPT0gZmMuc3BsaXRUZXh0ICYmIG51bGwgPT0gZmMubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgIGlmIChmYy5ub2RlVmFsdWUgIT0gdmNoaWxkcmVuWzBdKSBmYy5ub2RlVmFsdWUgPSB2Y2hpbGRyZW5bMF07XG4gICAgICAgIH0gZWxzZSBpZiAodmNoaWxkcmVuICYmIHZjaGlsZHJlbi5sZW5ndGggfHwgbnVsbCAhPSBmYykgaW5uZXJEaWZmTm9kZShvdXQsIHZjaGlsZHJlbiwgY29udGV4dCwgbW91bnRBbGwsIGh5ZHJhdGluZyB8fCBudWxsICE9IHByb3BzLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MKTtcbiAgICAgICAgZGlmZkF0dHJpYnV0ZXMob3V0LCB2bm9kZS5hdHRyaWJ1dGVzLCBwcm9wcyk7XG4gICAgICAgIGlzU3ZnTW9kZSA9IHByZXZTdmdNb2RlO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbm5lckRpZmZOb2RlKGRvbSwgdmNoaWxkcmVuLCBjb250ZXh0LCBtb3VudEFsbCwgaXNIeWRyYXRpbmcpIHtcbiAgICAgICAgdmFyIGosIGMsIGYsIHZjaGlsZCwgY2hpbGQsIG9yaWdpbmFsQ2hpbGRyZW4gPSBkb20uY2hpbGROb2RlcywgY2hpbGRyZW4gPSBbXSwga2V5ZWQgPSB7fSwga2V5ZWRMZW4gPSAwLCBtaW4gPSAwLCBsZW4gPSBvcmlnaW5hbENoaWxkcmVuLmxlbmd0aCwgY2hpbGRyZW5MZW4gPSAwLCB2bGVuID0gdmNoaWxkcmVuID8gdmNoaWxkcmVuLmxlbmd0aCA6IDA7XG4gICAgICAgIGlmICgwICE9PSBsZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBfY2hpbGQgPSBvcmlnaW5hbENoaWxkcmVuW2ldLCBwcm9wcyA9IF9jaGlsZC5fX3ByZWFjdGF0dHJfLCBrZXkgPSB2bGVuICYmIHByb3BzID8gX2NoaWxkLl9jb21wb25lbnQgPyBfY2hpbGQuX2NvbXBvbmVudC5fX2sgOiBwcm9wcy5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKG51bGwgIT0ga2V5KSB7XG4gICAgICAgICAgICAgICAga2V5ZWRMZW4rKztcbiAgICAgICAgICAgICAgICBrZXllZFtrZXldID0gX2NoaWxkO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wcyB8fCAodm9pZCAwICE9PSBfY2hpbGQuc3BsaXRUZXh0ID8gaXNIeWRyYXRpbmcgPyBfY2hpbGQubm9kZVZhbHVlLnRyaW0oKSA6ICEwIDogaXNIeWRyYXRpbmcpKSBjaGlsZHJlbltjaGlsZHJlbkxlbisrXSA9IF9jaGlsZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoMCAhPT0gdmxlbikgZm9yICh2YXIgaSA9IDA7IGkgPCB2bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZjaGlsZCA9IHZjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNoaWxkID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBrZXkgPSB2Y2hpbGQua2V5O1xuICAgICAgICAgICAgaWYgKG51bGwgIT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleWVkTGVuICYmIHZvaWQgMCAhPT0ga2V5ZWRba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZCA9IGtleWVkW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGtleWVkW2tleV0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgIGtleWVkTGVuLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChtaW4gPCBjaGlsZHJlbkxlbikgZm9yIChqID0gbWluOyBqIDwgY2hpbGRyZW5MZW47IGorKykgaWYgKHZvaWQgMCAhPT0gY2hpbGRyZW5bal0gJiYgaXNTYW1lTm9kZVR5cGUoYyA9IGNoaWxkcmVuW2pdLCB2Y2hpbGQsIGlzSHlkcmF0aW5nKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkID0gYztcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltqXSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gY2hpbGRyZW5MZW4gLSAxKSBjaGlsZHJlbkxlbi0tO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBtaW4pIG1pbisrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGQgPSBpZGlmZihjaGlsZCwgdmNoaWxkLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBmID0gb3JpZ2luYWxDaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChjaGlsZCAmJiBjaGlsZCAhPT0gZG9tICYmIGNoaWxkICE9PSBmKSBpZiAobnVsbCA9PSBmKSBkb20uYXBwZW5kQ2hpbGQoY2hpbGQpOyBlbHNlIGlmIChjaGlsZCA9PT0gZi5uZXh0U2libGluZykgcmVtb3ZlTm9kZShmKTsgZWxzZSBkb20uaW5zZXJ0QmVmb3JlKGNoaWxkLCBmKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ZWRMZW4pIGZvciAodmFyIGkgaW4ga2V5ZWQpIGlmICh2b2lkIDAgIT09IGtleWVkW2ldKSByZWNvbGxlY3ROb2RlVHJlZShrZXllZFtpXSwgITEpO1xuICAgICAgICB3aGlsZSAobWluIDw9IGNoaWxkcmVuTGVuKSBpZiAodm9pZCAwICE9PSAoY2hpbGQgPSBjaGlsZHJlbltjaGlsZHJlbkxlbi0tXSkpIHJlY29sbGVjdE5vZGVUcmVlKGNoaWxkLCAhMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsIHVubW91bnRPbmx5KSB7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSBub2RlLl9jb21wb25lbnQ7XG4gICAgICAgIGlmIChjb21wb25lbnQpIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBub2RlLl9fcHJlYWN0YXR0cl8pIGFwcGx5UmVmKG5vZGUuX19wcmVhY3RhdHRyXy5yZWYsIG51bGwpO1xuICAgICAgICAgICAgaWYgKCExID09PSB1bm1vdW50T25seSB8fCBudWxsID09IG5vZGUuX19wcmVhY3RhdHRyXykgcmVtb3ZlTm9kZShub2RlKTtcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkcmVuKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuKG5vZGUpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUubGFzdENoaWxkO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsICEwKTtcbiAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmZBdHRyaWJ1dGVzKGRvbSwgYXR0cnMsIG9sZCkge1xuICAgICAgICB2YXIgbmFtZTtcbiAgICAgICAgZm9yIChuYW1lIGluIG9sZCkgaWYgKCghYXR0cnMgfHwgbnVsbCA9PSBhdHRyc1tuYW1lXSkgJiYgbnVsbCAhPSBvbGRbbmFtZV0pIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSB2b2lkIDAsIGlzU3ZnTW9kZSk7XG4gICAgICAgIGZvciAobmFtZSBpbiBhdHRycykgaWYgKCEoJ2NoaWxkcmVuJyA9PT0gbmFtZSB8fCAnaW5uZXJIVE1MJyA9PT0gbmFtZSB8fCBuYW1lIGluIG9sZCAmJiBhdHRyc1tuYW1lXSA9PT0gKCd2YWx1ZScgPT09IG5hbWUgfHwgJ2NoZWNrZWQnID09PSBuYW1lID8gZG9tW25hbWVdIDogb2xkW25hbWVdKSkpIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSBhdHRyc1tuYW1lXSwgaXNTdmdNb2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KEN0b3IsIHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBpbnN0LCBpID0gcmVjeWNsZXJDb21wb25lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKEN0b3IucHJvdG90eXBlICYmIEN0b3IucHJvdG90eXBlLnJlbmRlcikge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDdG9yKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIENvbXBvbmVudC5jYWxsKGluc3QsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3QgPSBuZXcgQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGluc3QuY29uc3RydWN0b3IgPSBDdG9yO1xuICAgICAgICAgICAgaW5zdC5yZW5kZXIgPSBkb1JlbmRlcjtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoaS0tKSBpZiAocmVjeWNsZXJDb21wb25lbnRzW2ldLmNvbnN0cnVjdG9yID09PSBDdG9yKSB7XG4gICAgICAgICAgICBpbnN0Ll9fYiA9IHJlY3ljbGVyQ29tcG9uZW50c1tpXS5fX2I7XG4gICAgICAgICAgICByZWN5Y2xlckNvbXBvbmVudHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgcmV0dXJuIGluc3Q7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3Q7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldENvbXBvbmVudFByb3BzKGNvbXBvbmVudCwgcHJvcHMsIHJlbmRlck1vZGUsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fciA9IHByb3BzLnJlZjtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX2sgPSBwcm9wcy5rZXk7XG4gICAgICAgICAgICBkZWxldGUgcHJvcHMucmVmO1xuICAgICAgICAgICAgZGVsZXRlIHByb3BzLmtleTtcbiAgICAgICAgICAgIGlmICh2b2lkIDAgPT09IGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMpIGlmICghY29tcG9uZW50LmJhc2UgfHwgbW91bnRBbGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykgY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gY29tcG9uZW50LmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2MpIGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuY29udGV4dDtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3ApIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQucHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMTtcbiAgICAgICAgICAgIGlmICgwICE9PSByZW5kZXJNb2RlKSBpZiAoMSA9PT0gcmVuZGVyTW9kZSB8fCAhMSAhPT0gb3B0aW9ucy5zeW5jQ29tcG9uZW50VXBkYXRlcyB8fCAhY29tcG9uZW50LmJhc2UpIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIDEsIG1vdW50QWxsKTsgZWxzZSBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBhcHBseVJlZihjb21wb25lbnQuX19yLCBjb21wb25lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIHJlbmRlck1vZGUsIG1vdW50QWxsLCBpc0NoaWxkKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgdmFyIHJlbmRlcmVkLCBpbnN0LCBjYmFzZSwgcHJvcHMgPSBjb21wb25lbnQucHJvcHMsIHN0YXRlID0gY29tcG9uZW50LnN0YXRlLCBjb250ZXh0ID0gY29tcG9uZW50LmNvbnRleHQsIHByZXZpb3VzUHJvcHMgPSBjb21wb25lbnQuX19wIHx8IHByb3BzLCBwcmV2aW91c1N0YXRlID0gY29tcG9uZW50Ll9fcyB8fCBzdGF0ZSwgcHJldmlvdXNDb250ZXh0ID0gY29tcG9uZW50Ll9fYyB8fCBjb250ZXh0LCBpc1VwZGF0ZSA9IGNvbXBvbmVudC5iYXNlLCBuZXh0QmFzZSA9IGNvbXBvbmVudC5fX2IsIGluaXRpYWxCYXNlID0gaXNVcGRhdGUgfHwgbmV4dEJhc2UsIGluaXRpYWxDaGlsZENvbXBvbmVudCA9IGNvbXBvbmVudC5fY29tcG9uZW50LCBza2lwID0gITEsIHNuYXBzaG90ID0gcHJldmlvdXNDb250ZXh0O1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IGV4dGVuZChleHRlbmQoe30sIHN0YXRlKSwgY29tcG9uZW50LmNvbnN0cnVjdG9yLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyhwcm9wcywgc3RhdGUpKTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1VwZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByZXZpb3VzUHJvcHM7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gcHJldmlvdXNTdGF0ZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IHByZXZpb3VzQ29udGV4dDtcbiAgICAgICAgICAgICAgICBpZiAoMiAhPT0gcmVuZGVyTW9kZSAmJiBjb21wb25lbnQuc2hvdWxkQ29tcG9uZW50VXBkYXRlICYmICExID09PSBjb21wb25lbnQuc2hvdWxkQ29tcG9uZW50VXBkYXRlKHByb3BzLCBzdGF0ZSwgY29udGV4dCkpIHNraXAgPSAhMDsgZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50Ll9fcCA9IGNvbXBvbmVudC5fX3MgPSBjb21wb25lbnQuX19jID0gY29tcG9uZW50Ll9fYiA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX19kID0gITE7XG4gICAgICAgICAgICBpZiAoIXNraXApIHtcbiAgICAgICAgICAgICAgICByZW5kZXJlZCA9IGNvbXBvbmVudC5yZW5kZXIocHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmdldENoaWxkQ29udGV4dCkgY29udGV4dCA9IGV4dGVuZChleHRlbmQoe30sIGNvbnRleHQpLCBjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KCkpO1xuICAgICAgICAgICAgICAgIGlmIChpc1VwZGF0ZSAmJiBjb21wb25lbnQuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUpIHNuYXBzaG90ID0gY29tcG9uZW50LmdldFNuYXBzaG90QmVmb3JlVXBkYXRlKHByZXZpb3VzUHJvcHMsIHByZXZpb3VzU3RhdGUpO1xuICAgICAgICAgICAgICAgIHZhciB0b1VubW91bnQsIGJhc2UsIGNoaWxkQ29tcG9uZW50ID0gcmVuZGVyZWQgJiYgcmVuZGVyZWQubm9kZU5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGNoaWxkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZFByb3BzID0gZ2V0Tm9kZVByb3BzKHJlbmRlcmVkKTtcbiAgICAgICAgICAgICAgICAgICAgaW5zdCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3QgJiYgaW5zdC5jb25zdHJ1Y3RvciA9PT0gY2hpbGRDb21wb25lbnQgJiYgY2hpbGRQcm9wcy5rZXkgPT0gaW5zdC5fX2spIHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIDEsIGNvbnRleHQsICExKTsgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbnN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Ll9jb21wb25lbnQgPSBpbnN0ID0gY3JlYXRlQ29tcG9uZW50KGNoaWxkQ29tcG9uZW50LCBjaGlsZFByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QuX19iID0gaW5zdC5fX2IgfHwgbmV4dEJhc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Ll9fdSA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIDAsIGNvbnRleHQsICExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckNvbXBvbmVudChpbnN0LCAxLCBtb3VudEFsbCwgITApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJhc2UgPSBpbnN0LmJhc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2Jhc2UgPSBpbml0aWFsQmFzZTtcbiAgICAgICAgICAgICAgICAgICAgdG9Vbm1vdW50ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9Vbm1vdW50KSBjYmFzZSA9IGNvbXBvbmVudC5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWxCYXNlIHx8IDEgPT09IHJlbmRlck1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYmFzZSkgY2Jhc2UuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gZGlmZihjYmFzZSwgcmVuZGVyZWQsIGNvbnRleHQsIG1vdW50QWxsIHx8ICFpc1VwZGF0ZSwgaW5pdGlhbEJhc2UgJiYgaW5pdGlhbEJhc2UucGFyZW50Tm9kZSwgITApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbml0aWFsQmFzZSAmJiBiYXNlICE9PSBpbml0aWFsQmFzZSAmJiBpbnN0ICE9PSBpbml0aWFsQ2hpbGRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2VQYXJlbnQgPSBpbml0aWFsQmFzZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZVBhcmVudCAmJiBiYXNlICE9PSBiYXNlUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlUGFyZW50LnJlcGxhY2VDaGlsZChiYXNlLCBpbml0aWFsQmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRvVW5tb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxCYXNlLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGluaXRpYWxCYXNlLCAhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRvVW5tb3VudCkgdW5tb3VudENvbXBvbmVudCh0b1VubW91bnQpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5iYXNlID0gYmFzZTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZSAmJiAhaXNDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50UmVmID0gY29tcG9uZW50LCB0ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAodCA9IHQuX191KSAoY29tcG9uZW50UmVmID0gdCkuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudCA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPSBjb21wb25lbnRSZWYuY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc1VwZGF0ZSB8fCBtb3VudEFsbCkgbW91bnRzLnB1c2goY29tcG9uZW50KTsgZWxzZSBpZiAoIXNraXApIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZSkgY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzLCBwcmV2aW91c1N0YXRlLCBzbmFwc2hvdCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJVcGRhdGUpIG9wdGlvbnMuYWZ0ZXJVcGRhdGUoY29tcG9uZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChjb21wb25lbnQuX19oLmxlbmd0aCkgY29tcG9uZW50Ll9faC5wb3AoKS5jYWxsKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoIWRpZmZMZXZlbCAmJiAhaXNDaGlsZCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICB2YXIgYyA9IGRvbSAmJiBkb20uX2NvbXBvbmVudCwgb3JpZ2luYWxDb21wb25lbnQgPSBjLCBvbGREb20gPSBkb20sIGlzRGlyZWN0T3duZXIgPSBjICYmIGRvbS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lLCBpc093bmVyID0gaXNEaXJlY3RPd25lciwgcHJvcHMgPSBnZXROb2RlUHJvcHModm5vZGUpO1xuICAgICAgICB3aGlsZSAoYyAmJiAhaXNPd25lciAmJiAoYyA9IGMuX191KSkgaXNPd25lciA9IGMuY29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoYyAmJiBpc093bmVyICYmICghbW91bnRBbGwgfHwgYy5fY29tcG9uZW50KSkge1xuICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDMsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGRvbSA9IGMuYmFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbENvbXBvbmVudCAmJiAhaXNEaXJlY3RPd25lcikge1xuICAgICAgICAgICAgICAgIHVubW91bnRDb21wb25lbnQob3JpZ2luYWxDb21wb25lbnQpO1xuICAgICAgICAgICAgICAgIGRvbSA9IG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjID0gY3JlYXRlQ29tcG9uZW50KHZub2RlLm5vZGVOYW1lLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoZG9tICYmICFjLl9fYikge1xuICAgICAgICAgICAgICAgIGMuX19iID0gZG9tO1xuICAgICAgICAgICAgICAgIG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICAgICAgaWYgKG9sZERvbSAmJiBkb20gIT09IG9sZERvbSkge1xuICAgICAgICAgICAgICAgIG9sZERvbS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShvbGREb20sICExKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9tO1xuICAgIH1cbiAgICBmdW5jdGlvbiB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgICAgICBpZiAob3B0aW9ucy5iZWZvcmVVbm1vdW50KSBvcHRpb25zLmJlZm9yZVVubW91bnQoY29tcG9uZW50KTtcbiAgICAgICAgdmFyIGJhc2UgPSBjb21wb25lbnQuYmFzZTtcbiAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQoKTtcbiAgICAgICAgY29tcG9uZW50LmJhc2UgPSBudWxsO1xuICAgICAgICB2YXIgaW5uZXIgPSBjb21wb25lbnQuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGlubmVyKSB1bm1vdW50Q29tcG9uZW50KGlubmVyKTsgZWxzZSBpZiAoYmFzZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gYmFzZS5fX3ByZWFjdGF0dHJfKSBhcHBseVJlZihiYXNlLl9fcHJlYWN0YXR0cl8ucmVmLCBudWxsKTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX2IgPSBiYXNlO1xuICAgICAgICAgICAgcmVtb3ZlTm9kZShiYXNlKTtcbiAgICAgICAgICAgIHJlY3ljbGVyQ29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihiYXNlKTtcbiAgICAgICAgfVxuICAgICAgICBhcHBseVJlZihjb21wb25lbnQuX19yLCBudWxsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX19kID0gITA7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUgfHwge307XG4gICAgICAgIHRoaXMuX19oID0gW107XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlcih2bm9kZSwgcGFyZW50LCBtZXJnZSkge1xuICAgICAgICByZXR1cm4gZGlmZihtZXJnZSwgdm5vZGUsIHt9LCAhMSwgcGFyZW50LCAhMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJlZigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICB2YXIgVk5vZGUgPSBmdW5jdGlvbigpIHt9O1xuICAgIHZhciBvcHRpb25zID0ge307XG4gICAgdmFyIHN0YWNrID0gW107XG4gICAgdmFyIEVNUFRZX0NISUxEUkVOID0gW107XG4gICAgdmFyIGRlZmVyID0gJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgUHJvbWlzZSA/IFByb21pc2UucmVzb2x2ZSgpLnRoZW4uYmluZChQcm9taXNlLnJlc29sdmUoKSkgOiBzZXRUaW1lb3V0O1xuICAgIHZhciBJU19OT05fRElNRU5TSU9OQUwgPSAvYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmQvaTtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgbW91bnRzID0gW107XG4gICAgdmFyIGRpZmZMZXZlbCA9IDA7XG4gICAgdmFyIGlzU3ZnTW9kZSA9ICExO1xuICAgIHZhciBoeWRyYXRpbmcgPSAhMTtcbiAgICB2YXIgcmVjeWNsZXJDb21wb25lbnRzID0gW107XG4gICAgZXh0ZW5kKENvbXBvbmVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgc2V0U3RhdGU6IGZ1bmN0aW9uKHN0YXRlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9fcykgdGhpcy5fX3MgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IGV4dGVuZChleHRlbmQoe30sIHRoaXMuc3RhdGUpLCAnZnVuY3Rpb24nID09IHR5cGVvZiBzdGF0ZSA/IHN0YXRlKHRoaXMuc3RhdGUsIHRoaXMucHJvcHMpIDogc3RhdGUpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB0aGlzLl9faC5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGVucXVldWVSZW5kZXIodGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvcmNlVXBkYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB0aGlzLl9faC5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJlbmRlckNvbXBvbmVudCh0aGlzLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHt9XG4gICAgfSk7XG4gICAgdmFyIHByZWFjdCA9IHtcbiAgICAgICAgaDogaCxcbiAgICAgICAgY3JlYXRlRWxlbWVudDogaCxcbiAgICAgICAgY2xvbmVFbGVtZW50OiBjbG9uZUVsZW1lbnQsXG4gICAgICAgIGNyZWF0ZVJlZjogY3JlYXRlUmVmLFxuICAgICAgICBDb21wb25lbnQ6IENvbXBvbmVudCxcbiAgICAgICAgcmVuZGVyOiByZW5kZXIsXG4gICAgICAgIHJlcmVuZGVyOiByZXJlbmRlcixcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH07XG4gICAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiBtb2R1bGUpIG1vZHVsZS5leHBvcnRzID0gcHJlYWN0OyBlbHNlIHNlbGYucHJlYWN0ID0gcHJlYWN0O1xufSgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJlYWN0LmpzLm1hcCIsIm1vZHVsZS5leHBvcnRzID0gcHJldHRpZXJCeXRlc1xuXG5mdW5jdGlvbiBwcmV0dGllckJ5dGVzIChudW0pIHtcbiAgaWYgKHR5cGVvZiBudW0gIT09ICdudW1iZXInIHx8IGlzTmFOKG51bSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIG51bWJlciwgZ290ICcgKyB0eXBlb2YgbnVtKVxuICB9XG5cbiAgdmFyIG5lZyA9IG51bSA8IDBcbiAgdmFyIHVuaXRzID0gWydCJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ11cblxuICBpZiAobmVnKSB7XG4gICAgbnVtID0gLW51bVxuICB9XG5cbiAgaWYgKG51bSA8IDEpIHtcbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bSArICcgQidcbiAgfVxuXG4gIHZhciBleHBvbmVudCA9IE1hdGgubWluKE1hdGguZmxvb3IoTWF0aC5sb2cobnVtKSAvIE1hdGgubG9nKDEwMDApKSwgdW5pdHMubGVuZ3RoIC0gMSlcbiAgbnVtID0gTnVtYmVyKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSlcbiAgdmFyIHVuaXQgPSB1bml0c1tleHBvbmVudF1cblxuICBpZiAobnVtID49IDEwIHx8IG51bSAlIDEgPT09IDApIHtcbiAgICAvLyBEbyBub3Qgc2hvdyBkZWNpbWFscyB3aGVuIHRoZSBudW1iZXIgaXMgdHdvLWRpZ2l0LCBvciBpZiB0aGUgbnVtYmVyIGhhcyBub1xuICAgIC8vIGRlY2ltYWwgY29tcG9uZW50LlxuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtLnRvRml4ZWQoMCkgKyAnICcgKyB1bml0XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0udG9GaXhlZCgxKSArICcgJyArIHVuaXRcbiAgfVxufVxuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLldIQVRXR0ZldGNoID0ge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6XG4gICAgICAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJlxuICAgICAgJ0Jsb2InIGluIHNlbGYgJiZcbiAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBuZXcgQmxvYigpO1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfTtcblxuICBmdW5jdGlvbiBpc0RhdGFWaWV3KG9iaikge1xuICAgIHJldHVybiBvYmogJiYgRGF0YVZpZXcucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yob2JqKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdmlld0NsYXNzZXMgPSBbXG4gICAgICAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQ2NEFycmF5XSdcbiAgICBdO1xuXG4gICAgdmFyIGlzQXJyYXlCdWZmZXJWaWV3ID1cbiAgICAgIEFycmF5QnVmZmVyLmlzVmlldyB8fFxuICAgICAgZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSk7XG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLl5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9O1xuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKGhlYWRlclswXSwgaGVhZGVyWzFdKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKTtcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKTtcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLm1hcFtuYW1lXTtcbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUgKyAnLCAnICsgdmFsdWUgOiB2YWx1ZTtcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldO1xuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKTtcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLm1hcFtuYW1lXSwgbmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgIGl0ZW1zLnB1c2gobmFtZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgIGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9O1xuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXM7XG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpO1xuICAgICAgfTtcbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpO1xuICAgICAgfTtcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpO1xuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcik7XG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYik7XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRBcnJheUJ1ZmZlckFzVGV4dChidWYpIHtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zik7XG4gICAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gY2hhcnMuam9pbignJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICAgIGlmIChidWYuc2xpY2UpIHtcbiAgICAgIHJldHVybiBidWYuc2xpY2UoMClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYuYnl0ZUxlbmd0aCk7XG4gICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShidWYpKTtcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHk7XG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJztcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5O1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcik7XG4gICAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gbmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pO1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYm9keSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpO1xuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpO1xuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddO1xuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICAgIHJldHVybiBtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keTtcblxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmw7XG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHM7XG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kO1xuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZTtcbiAgICAgIHRoaXMuc2lnbmFsID0gaW5wdXQuc2lnbmFsO1xuICAgICAgaWYgKCFib2R5ICYmIGlucHV0Ll9ib2R5SW5pdCAhPSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXQ7XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBTdHJpbmcoaW5wdXQpO1xuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ3NhbWUtb3JpZ2luJztcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKTtcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGw7XG4gICAgdGhpcy5zaWduYWwgPSBvcHRpb25zLnNpZ25hbCB8fCB0aGlzLnNpZ25hbDtcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbDtcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSk7XG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7Ym9keTogdGhpcy5fYm9keUluaXR9KVxuICB9O1xuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKTtcbiAgICBib2R5XG4gICAgICAudHJpbSgpXG4gICAgICAuc3BsaXQoJyYnKVxuICAgICAgLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKTtcbiAgICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJyk7XG4gICAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuICAgICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAgICAvLyBSZXBsYWNlIGluc3RhbmNlcyBvZiBcXHJcXG4gYW5kIFxcbiBmb2xsb3dlZCBieSBhdCBsZWFzdCBvbmUgc3BhY2Ugb3IgaG9yaXpvbnRhbCB0YWIgd2l0aCBhIHNwYWNlXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcyMzAjc2VjdGlvbi0zLjJcbiAgICB2YXIgcHJlUHJvY2Vzc2VkSGVhZGVycyA9IHJhd0hlYWRlcnMucmVwbGFjZSgvXFxyP1xcbltcXHQgXSsvZywgJyAnKTtcbiAgICBwcmVQcm9jZXNzZWRIZWFkZXJzLnNwbGl0KC9cXHI/XFxuLykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCc6Jyk7XG4gICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKCk7XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKCk7XG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnO1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXMgPT09IHVuZGVmaW5lZCA/IDIwMCA6IG9wdGlvbnMuc3RhdHVzO1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDA7XG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gJ3N0YXR1c1RleHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1c1RleHQgOiAnT0snO1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJztcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdCk7XG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKTtcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9O1xuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSk7XG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcic7XG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH07XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdO1xuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH07XG5cbiAgZXhwb3J0cy5ET01FeGNlcHRpb24gPSBzZWxmLkRPTUV4Y2VwdGlvbjtcbiAgdHJ5IHtcbiAgICBuZXcgZXhwb3J0cy5ET01FeGNlcHRpb24oKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZXhwb3J0cy5ET01FeGNlcHRpb24gPSBmdW5jdGlvbihtZXNzYWdlLCBuYW1lKSB7XG4gICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgIHZhciBlcnJvciA9IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgdGhpcy5zdGFjayA9IGVycm9yLnN0YWNrO1xuICAgIH07XG4gICAgZXhwb3J0cy5ET01FeGNlcHRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuICAgIGV4cG9ydHMuRE9NRXhjZXB0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGV4cG9ydHMuRE9NRXhjZXB0aW9uO1xuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2goaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KTtcblxuICAgICAgaWYgKHJlcXVlc3Quc2lnbmFsICYmIHJlcXVlc3Quc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgZXhwb3J0cy5ET01FeGNlcHRpb24oJ0Fib3J0ZWQnLCAnQWJvcnRFcnJvcicpKVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIGZ1bmN0aW9uIGFib3J0WGhyKCkge1xuICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAgICAgfTtcbiAgICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKTtcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpO1xuICAgICAgfTtcblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgZXhwb3J0cy5ET01FeGNlcHRpb24oJ0Fib3J0ZWQnLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSk7XG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdvbWl0Jykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7XG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVxdWVzdC5zaWduYWwpIHtcbiAgICAgICAgcmVxdWVzdC5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydFhocik7XG5cbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIERPTkUgKHN1Y2Nlc3Mgb3IgZmFpbHVyZSlcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIHJlcXVlc3Quc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRYaHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdCk7XG4gICAgfSlcbiAgfVxuXG4gIGZldGNoLnBvbHlmaWxsID0gdHJ1ZTtcblxuICBpZiAoIXNlbGYuZmV0Y2gpIHtcbiAgICBzZWxmLmZldGNoID0gZmV0Y2g7XG4gICAgc2VsZi5IZWFkZXJzID0gSGVhZGVycztcbiAgICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0O1xuICAgIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZTtcbiAgfVxuXG4gIGV4cG9ydHMuSGVhZGVycyA9IEhlYWRlcnM7XG4gIGV4cG9ydHMuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIGV4cG9ydHMuUmVzcG9uc2UgPSBSZXNwb25zZTtcbiAgZXhwb3J0cy5mZXRjaCA9IGZldGNoO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAgIyB3aWxkY2FyZFxuXG4gIFZlcnkgc2ltcGxlIHdpbGRjYXJkIG1hdGNoaW5nLCB3aGljaCBpcyBkZXNpZ25lZCB0byBwcm92aWRlIHRoZSBzYW1lXG4gIGZ1bmN0aW9uYWxpdHkgdGhhdCBpcyBmb3VuZCBpbiB0aGVcbiAgW2V2ZV0oaHR0cHM6Ly9naXRodWIuY29tL2Fkb2JlLXdlYnBsYXRmb3JtL2V2ZSkgZXZlbnRpbmcgbGlicmFyeS5cblxuICAjIyBVc2FnZVxuXG4gIEl0IHdvcmtzIHdpdGggc3RyaW5nczpcblxuICA8PDwgZXhhbXBsZXMvc3RyaW5ncy5qc1xuXG4gIEFycmF5czpcblxuICA8PDwgZXhhbXBsZXMvYXJyYXlzLmpzXG5cbiAgT2JqZWN0cyAobWF0Y2hpbmcgYWdhaW5zdCBrZXlzKTpcblxuICA8PDwgZXhhbXBsZXMvb2JqZWN0cy5qc1xuXG4gIFdoaWxlIHRoZSBsaWJyYXJ5IHdvcmtzIGluIE5vZGUsIGlmIHlvdSBhcmUgYXJlIGxvb2tpbmcgZm9yIGZpbGUtYmFzZWRcbiAgd2lsZGNhcmQgbWF0Y2hpbmcgdGhlbiB5b3Ugc2hvdWxkIGhhdmUgYSBsb29rIGF0OlxuXG4gIDxodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtZ2xvYj5cbioqL1xuXG5mdW5jdGlvbiBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yKSB7XG4gIHRoaXMudGV4dCA9IHRleHQgPSB0ZXh0IHx8ICcnO1xuICB0aGlzLmhhc1dpbGQgPSB+dGV4dC5pbmRleE9mKCcqJyk7XG4gIHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuICB0aGlzLnBhcnRzID0gdGV4dC5zcGxpdChzZXBhcmF0b3IpO1xufVxuXG5XaWxkY2FyZE1hdGNoZXIucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgdmFyIG1hdGNoZXMgPSB0cnVlO1xuICB2YXIgcGFydHMgPSB0aGlzLnBhcnRzO1xuICB2YXIgaWk7XG4gIHZhciBwYXJ0c0NvdW50ID0gcGFydHMubGVuZ3RoO1xuICB2YXIgdGVzdFBhcnRzO1xuXG4gIGlmICh0eXBlb2YgaW5wdXQgPT0gJ3N0cmluZycgfHwgaW5wdXQgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuaGFzV2lsZCAmJiB0aGlzLnRleHQgIT0gaW5wdXQpIHtcbiAgICAgIG1hdGNoZXMgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVzdFBhcnRzID0gKGlucHV0IHx8ICcnKS5zcGxpdCh0aGlzLnNlcGFyYXRvcik7XG4gICAgICBmb3IgKGlpID0gMDsgbWF0Y2hlcyAmJiBpaSA8IHBhcnRzQ291bnQ7IGlpKyspIHtcbiAgICAgICAgaWYgKHBhcnRzW2lpXSA9PT0gJyonKSAge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlpIDwgdGVzdFBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgIG1hdGNoZXMgPSBwYXJ0c1tpaV0gPT09IHRlc3RQYXJ0c1tpaV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG1hdGNoZXMsIHRoZW4gcmV0dXJuIHRoZSBjb21wb25lbnQgcGFydHNcbiAgICAgIG1hdGNoZXMgPSBtYXRjaGVzICYmIHRlc3RQYXJ0cztcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0LnNwbGljZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgbWF0Y2hlcyA9IFtdO1xuXG4gICAgZm9yIChpaSA9IGlucHV0Lmxlbmd0aDsgaWktLTsgKSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChpbnB1dFtpaV0pKSB7XG4gICAgICAgIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGhdID0gaW5wdXRbaWldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT0gJ29iamVjdCcpIHtcbiAgICBtYXRjaGVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgIGlmICh0aGlzLm1hdGNoKGtleSkpIHtcbiAgICAgICAgbWF0Y2hlc1trZXldID0gaW5wdXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGV4dCwgdGVzdCwgc2VwYXJhdG9yKSB7XG4gIHZhciBtYXRjaGVyID0gbmV3IFdpbGRjYXJkTWF0Y2hlcih0ZXh0LCBzZXBhcmF0b3IgfHwgL1tcXC9cXC5dLyk7XG4gIGlmICh0eXBlb2YgdGVzdCAhPSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBtYXRjaGVyLm1hdGNoKHRlc3QpO1xuICB9XG5cbiAgcmV0dXJuIG1hdGNoZXI7XG59O1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmNsYXNzIEF1dGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKCdBdXRob3JpemF0aW9uIHJlcXVpcmVkJylcbiAgICB0aGlzLm5hbWUgPSAnQXV0aEVycm9yJ1xuICAgIHRoaXMuaXNBdXRoRXJyb3IgPSB0cnVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoRXJyb3JcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50JylcbmNvbnN0IHRva2VuU3RvcmFnZSA9IHJlcXVpcmUoJy4vdG9rZW5TdG9yYWdlJylcblxuY29uc3QgX2dldE5hbWUgPSAoaWQpID0+IHtcbiAgcmV0dXJuIGlkLnNwbGl0KCctJykubWFwKChzKSA9PiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKSkuam9pbignICcpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvdmlkZXIgZXh0ZW5kcyBSZXF1ZXN0Q2xpZW50IHtcbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMucHJvdmlkZXIgPSBvcHRzLnByb3ZpZGVyXG4gICAgdGhpcy5pZCA9IHRoaXMucHJvdmlkZXJcbiAgICB0aGlzLmF1dGhQcm92aWRlciA9IG9wdHMuYXV0aFByb3ZpZGVyIHx8IHRoaXMucHJvdmlkZXJcbiAgICB0aGlzLm5hbWUgPSB0aGlzLm9wdHMubmFtZSB8fCBfZ2V0TmFtZSh0aGlzLmlkKVxuICAgIHRoaXMucGx1Z2luSWQgPSB0aGlzLm9wdHMucGx1Z2luSWRcbiAgICB0aGlzLnRva2VuS2V5ID0gYGNvbXBhbmlvbi0ke3RoaXMucGx1Z2luSWR9LWF1dGgtdG9rZW5gXG4gIH1cblxuICBoZWFkZXJzICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc3VwZXIuaGVhZGVycygpLnRoZW4oKGhlYWRlcnMpID0+IHtcbiAgICAgICAgdGhpcy5nZXRBdXRoVG9rZW4oKS50aGVuKCh0b2tlbikgPT4ge1xuICAgICAgICAgIHJlc29sdmUoT2JqZWN0LmFzc2lnbih7fSwgaGVhZGVycywgeyAndXBweS1hdXRoLXRva2VuJzogdG9rZW4gfSkpXG4gICAgICAgIH0pXG4gICAgICB9KS5jYXRjaChyZWplY3QpXG4gICAgfSlcbiAgfVxuXG4gIG9uUmVjZWl2ZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIHJlc3BvbnNlID0gc3VwZXIub25SZWNlaXZlUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgY29uc3QgYXV0aGVudGljYXRlZCA9IHJlc3BvbnNlLnN0YXR1cyAhPT0gNDAxXG4gICAgdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zZXRQbHVnaW5TdGF0ZSh7IGF1dGhlbnRpY2F0ZWQgfSlcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIC8vIEB0b2RvKGkub2xhcmV3YWp1KSBjb25zaWRlciB3aGV0aGVyIG9yIG5vdCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgZXhwb3NlZFxuICBzZXRBdXRoVG9rZW4gKHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMudXBweS5nZXRQbHVnaW4odGhpcy5wbHVnaW5JZCkuc3RvcmFnZS5zZXRJdGVtKHRoaXMudG9rZW5LZXksIHRva2VuKVxuICB9XG5cbiAgZ2V0QXV0aFRva2VuICgpIHtcbiAgICByZXR1cm4gdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLmdldEl0ZW0odGhpcy50b2tlbktleSlcbiAgfVxuXG4gIGF1dGhVcmwgKCkge1xuICAgIHJldHVybiBgJHt0aGlzLmhvc3RuYW1lfS8ke3RoaXMuaWR9L2Nvbm5lY3RgXG4gIH1cblxuICBmaWxlVXJsIChpZCkge1xuICAgIHJldHVybiBgJHt0aGlzLmhvc3RuYW1lfS8ke3RoaXMuaWR9L2dldC8ke2lkfWBcbiAgfVxuXG4gIGxpc3QgKGRpcmVjdG9yeSkge1xuICAgIHJldHVybiB0aGlzLmdldChgJHt0aGlzLmlkfS9saXN0LyR7ZGlyZWN0b3J5IHx8ICcnfWApXG4gIH1cblxuICBsb2dvdXQgKHJlZGlyZWN0ID0gbG9jYXRpb24uaHJlZikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmdldChgJHt0aGlzLmlkfS9sb2dvdXQ/cmVkaXJlY3Q9JHtyZWRpcmVjdH1gKVxuICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy50b2tlbktleSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHJlc29sdmUocmVzKSlcbiAgICAgICAgICAgIC5jYXRjaChyZWplY3QpXG4gICAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGluaXRQbHVnaW4gKHBsdWdpbiwgb3B0cywgZGVmYXVsdE9wdHMpIHtcbiAgICBwbHVnaW4udHlwZSA9ICdhY3F1aXJlcidcbiAgICBwbHVnaW4uZmlsZXMgPSBbXVxuICAgIGlmIChkZWZhdWx0T3B0cykge1xuICAgICAgcGx1Z2luLm9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0cywgb3B0cylcbiAgICB9XG5cbiAgICBpZiAob3B0cy5zZXJ2ZXJVcmwgfHwgb3B0cy5zZXJ2ZXJQYXR0ZXJuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzZXJ2ZXJVcmxgIGFuZCBgc2VydmVyUGF0dGVybmAgaGF2ZSBiZWVuIHJlbmFtZWQgdG8gYGNvbXBhbmlvblVybGAgYW5kIGBjb21wYW5pb25BbGxvd2VkSG9zdHNgIHJlc3BlY3RpdmVseSBpbiB0aGUgMC4zMC41IHJlbGVhc2UuIFBsZWFzZSBjb25zdWx0IHRoZSBkb2NzIChmb3IgZXhhbXBsZSwgaHR0cHM6Ly91cHB5LmlvL2RvY3MvaW5zdGFncmFtLyBmb3IgdGhlIEluc3RhZ3JhbSBwbHVnaW4pIGFuZCB1c2UgdGhlIHVwZGF0ZWQgb3B0aW9ucy5gJylcbiAgICB9XG5cbiAgICBpZiAob3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMpIHtcbiAgICAgIGNvbnN0IHBhdHRlcm4gPSBvcHRzLmNvbXBhbmlvbkFsbG93ZWRIb3N0c1xuICAgICAgLy8gdmFsaWRhdGUgY29tcGFuaW9uQWxsb3dlZEhvc3RzIHBhcmFtXG4gICAgICBpZiAodHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnICYmICFBcnJheS5pc0FycmF5KHBhdHRlcm4pICYmICEocGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtwbHVnaW4uaWR9OiB0aGUgb3B0aW9uIFwiY29tcGFuaW9uQWxsb3dlZEhvc3RzXCIgbXVzdCBiZSBvbmUgb2Ygc3RyaW5nLCBBcnJheSwgUmVnRXhwYClcbiAgICAgIH1cbiAgICAgIHBsdWdpbi5vcHRzLmNvbXBhbmlvbkFsbG93ZWRIb3N0cyA9IHBhdHRlcm5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZG9lcyBub3Qgc3RhcnQgd2l0aCBodHRwczovL1xuICAgICAgaWYgKC9eKD8haHR0cHM/OlxcL1xcLykuKiQvaS50ZXN0KG9wdHMuY29tcGFuaW9uVXJsKSkge1xuICAgICAgICBwbHVnaW4ub3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMgPSBgaHR0cHM6Ly8ke29wdHMuY29tcGFuaW9uVXJsLnJlcGxhY2UoL15cXC9cXC8vLCAnJyl9YFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGx1Z2luLm9wdHMuY29tcGFuaW9uQWxsb3dlZEhvc3RzID0gb3B0cy5jb21wYW5pb25VcmxcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwbHVnaW4uc3RvcmFnZSA9IHBsdWdpbi5vcHRzLnN0b3JhZ2UgfHwgdG9rZW5TdG9yYWdlXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBBdXRoRXJyb3IgPSByZXF1aXJlKCcuL0F1dGhFcnJvcicpXG5cbi8vIFJlbW92ZSB0aGUgdHJhaWxpbmcgc2xhc2ggc28gd2UgY2FuIGFsd2F5cyBzYWZlbHkgYXBwZW5kIC94eXouXG5mdW5jdGlvbiBzdHJpcFNsYXNoICh1cmwpIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC8kLywgJycpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUmVxdWVzdENsaWVudCB7XG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgdGhpcy51cHB5ID0gdXBweVxuICAgIHRoaXMub3B0cyA9IG9wdHNcbiAgICB0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlID0gdGhpcy5vblJlY2VpdmVSZXNwb25zZS5iaW5kKHRoaXMpXG4gIH1cblxuICBnZXQgaG9zdG5hbWUgKCkge1xuICAgIGNvbnN0IHsgY29tcGFuaW9uIH0gPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IGhvc3QgPSB0aGlzLm9wdHMuY29tcGFuaW9uVXJsXG4gICAgcmV0dXJuIHN0cmlwU2xhc2goY29tcGFuaW9uICYmIGNvbXBhbmlvbltob3N0XSA/IGNvbXBhbmlvbltob3N0XSA6IGhvc3QpXG4gIH1cblxuICBnZXQgZGVmYXVsdEhlYWRlcnMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIH1cbiAgfVxuXG4gIGhlYWRlcnMgKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0SGVhZGVycywgdGhpcy5vcHRzLnNlcnZlckhlYWRlcnMgfHwge30pKVxuICB9XG5cbiAgX2dldFBvc3RSZXNwb25zZUZ1bmMgKHNraXApIHtcbiAgICByZXR1cm4gKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIXNraXApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub25SZWNlaXZlUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNwb25zZVxuICAgIH1cbiAgfVxuXG4gIG9uUmVjZWl2ZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICBjb25zdCBjb21wYW5pb24gPSBzdGF0ZS5jb21wYW5pb24gfHwge31cbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmNvbXBhbmlvblVybFxuICAgIGNvbnN0IGhlYWRlcnMgPSByZXNwb25zZS5oZWFkZXJzXG4gICAgLy8gU3RvcmUgdGhlIHNlbGYtaWRlbnRpZmllZCBkb21haW4gbmFtZSBmb3IgdGhlIENvbXBhbmlvbiBpbnN0YW5jZSB3ZSBqdXN0IGhpdC5cbiAgICBpZiAoaGVhZGVycy5oYXMoJ2ktYW0nKSAmJiBoZWFkZXJzLmdldCgnaS1hbScpICE9PSBjb21wYW5pb25baG9zdF0pIHtcbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIGNvbXBhbmlvbjogT2JqZWN0LmFzc2lnbih7fSwgY29tcGFuaW9uLCB7XG4gICAgICAgICAgW2hvc3RdOiBoZWFkZXJzLmdldCgnaS1hbScpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIF9nZXRVcmwgKHVybCkge1xuICAgIGlmICgvXihodHRwcz86fClcXC9cXC8vLnRlc3QodXJsKSkge1xuICAgICAgcmV0dXJuIHVybFxuICAgIH1cbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vJHt1cmx9YFxuICB9XG5cbiAgX2pzb24gKHJlcykge1xuICAgIGlmIChyZXMuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgIHRocm93IG5ldyBBdXRoRXJyb3IoKVxuICAgIH1cblxuICAgIGlmIChyZXMuc3RhdHVzIDwgMjAwIHx8IHJlcy5zdGF0dXMgPiAzMDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHJlcXVlc3QgdG8gJHtyZXMudXJsfS4gJHtyZXMuc3RhdHVzVGV4dH1gKVxuICAgIH1cbiAgICByZXR1cm4gcmVzLmpzb24oKVxuICB9XG5cbiAgZ2V0IChwYXRoLCBza2lwUG9zdFJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuaGVhZGVycygpLnRoZW4oKGhlYWRlcnMpID0+IHtcbiAgICAgICAgZmV0Y2godGhpcy5fZ2V0VXJsKHBhdGgpLCB7XG4gICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG4gICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4odGhpcy5fZ2V0UG9zdFJlc3BvbnNlRnVuYyhza2lwUG9zdFJlc3BvbnNlKSlcbiAgICAgICAgICAudGhlbigocmVzKSA9PiB0aGlzLl9qc29uKHJlcykudGhlbihyZXNvbHZlKSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgZXJyID0gZXJyLmlzQXV0aEVycm9yID8gZXJyIDogbmV3IEVycm9yKGBDb3VsZCBub3QgZ2V0ICR7dGhpcy5fZ2V0VXJsKHBhdGgpfS4gJHtlcnJ9YClcbiAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHBvc3QgKHBhdGgsIGRhdGEsIHNraXBQb3N0UmVzcG9uc2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5oZWFkZXJzKCkudGhlbigoaGVhZGVycykgPT4ge1xuICAgICAgICBmZXRjaCh0aGlzLl9nZXRVcmwocGF0aCksIHtcbiAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4odGhpcy5fZ2V0UG9zdFJlc3BvbnNlRnVuYyhza2lwUG9zdFJlc3BvbnNlKSlcbiAgICAgICAgICAudGhlbigocmVzKSA9PiB0aGlzLl9qc29uKHJlcykudGhlbihyZXNvbHZlKSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgZXJyID0gZXJyLmlzQXV0aEVycm9yID8gZXJyIDogbmV3IEVycm9yKGBDb3VsZCBub3QgcG9zdCAke3RoaXMuX2dldFVybChwYXRoKX0uICR7ZXJyfWApXG4gICAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBkZWxldGUgKHBhdGgsIGRhdGEsIHNraXBQb3N0UmVzcG9uc2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5oZWFkZXJzKCkudGhlbigoaGVhZGVycykgPT4ge1xuICAgICAgICBmZXRjaChgJHt0aGlzLmhvc3RuYW1lfS8ke3BhdGh9YCwge1xuICAgICAgICAgIG1ldGhvZDogJ2RlbGV0ZScsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgICBib2R5OiBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBudWxsXG4gICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4odGhpcy5fZ2V0UG9zdFJlc3BvbnNlRnVuYyhza2lwUG9zdFJlc3BvbnNlKSlcbiAgICAgICAgICAudGhlbigocmVzKSA9PiB0aGlzLl9qc29uKHJlcykudGhlbihyZXNvbHZlKSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgZXJyID0gZXJyLmlzQXV0aEVycm9yID8gZXJyIDogbmV3IEVycm9yKGBDb3VsZCBub3QgZGVsZXRlICR7dGhpcy5fZ2V0VXJsKHBhdGgpfS4gJHtlcnJ9YClcbiAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuIiwiY29uc3QgZWUgPSByZXF1aXJlKCduYW1lc3BhY2UtZW1pdHRlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVXBweVNvY2tldCB7XG4gIGNvbnN0cnVjdG9yIChvcHRzKSB7XG4gICAgdGhpcy5xdWV1ZWQgPSBbXVxuICAgIHRoaXMuaXNPcGVuID0gZmFsc2VcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQob3B0cy50YXJnZXQpXG4gICAgdGhpcy5lbWl0dGVyID0gZWUoKVxuXG4gICAgdGhpcy5zb2NrZXQub25vcGVuID0gKGUpID0+IHtcbiAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZVxuXG4gICAgICB3aGlsZSAodGhpcy5xdWV1ZWQubGVuZ3RoID4gMCAmJiB0aGlzLmlzT3Blbikge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHRoaXMucXVldWVkWzBdXG4gICAgICAgIHRoaXMuc2VuZChmaXJzdC5hY3Rpb24sIGZpcnN0LnBheWxvYWQpXG4gICAgICAgIHRoaXMucXVldWVkID0gdGhpcy5xdWV1ZWQuc2xpY2UoMSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gKGUpID0+IHtcbiAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9oYW5kbGVNZXNzYWdlID0gdGhpcy5faGFuZGxlTWVzc2FnZS5iaW5kKHRoaXMpXG5cbiAgICB0aGlzLnNvY2tldC5vbm1lc3NhZ2UgPSB0aGlzLl9oYW5kbGVNZXNzYWdlXG5cbiAgICB0aGlzLmNsb3NlID0gdGhpcy5jbG9zZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5lbWl0ID0gdGhpcy5lbWl0LmJpbmQodGhpcylcbiAgICB0aGlzLm9uID0gdGhpcy5vbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5vbmNlID0gdGhpcy5vbmNlLmJpbmQodGhpcylcbiAgICB0aGlzLnNlbmQgPSB0aGlzLnNlbmQuYmluZCh0aGlzKVxuICB9XG5cbiAgY2xvc2UgKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5jbG9zZSgpXG4gIH1cblxuICBzZW5kIChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICAvLyBhdHRhY2ggdXVpZFxuXG4gICAgaWYgKCF0aGlzLmlzT3Blbikge1xuICAgICAgdGhpcy5xdWV1ZWQucHVzaCh7YWN0aW9uLCBwYXlsb2FkfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgYWN0aW9uLFxuICAgICAgcGF5bG9hZFxuICAgIH0pKVxuICB9XG5cbiAgb24gKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuZW1pdHRlci5vbihhY3Rpb24sIGhhbmRsZXIpXG4gIH1cblxuICBlbWl0IChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdChhY3Rpb24sIHBheWxvYWQpXG4gIH1cblxuICBvbmNlIChhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB0aGlzLmVtaXR0ZXIub25jZShhY3Rpb24sIGhhbmRsZXIpXG4gIH1cblxuICBfaGFuZGxlTWVzc2FnZSAoZSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShlLmRhdGEpXG4gICAgICB0aGlzLmVtaXQobWVzc2FnZS5hY3Rpb24sIG1lc3NhZ2UucGF5bG9hZClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Utc3RyaWN0J1xuLyoqXG4gKiBNYW5hZ2VzIGNvbW11bmljYXRpb25zIHdpdGggQ29tcGFuaW9uXG4gKi9cblxuY29uc3QgUmVxdWVzdENsaWVudCA9IHJlcXVpcmUoJy4vUmVxdWVzdENsaWVudCcpXG5jb25zdCBQcm92aWRlciA9IHJlcXVpcmUoJy4vUHJvdmlkZXInKVxuY29uc3QgU29ja2V0ID0gcmVxdWlyZSgnLi9Tb2NrZXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUmVxdWVzdENsaWVudCxcbiAgUHJvdmlkZXIsXG4gIFNvY2tldFxufVxuIiwiJ3VzZSBzdHJpY3QnXG4vKipcbiAqIFRoaXMgbW9kdWxlIHNlcnZlcyBhcyBhbiBBc3luYyB3cmFwcGVyIGZvciBMb2NhbFN0b3JhZ2VcbiAqL1xubW9kdWxlLmV4cG9ydHMuc2V0SXRlbSA9IChrZXksIHZhbHVlKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpXG4gICAgcmVzb2x2ZSgpXG4gIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzLmdldEl0ZW0gPSAoa2V5KSA9PiB7XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUobG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSlcbn1cblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlSXRlbSA9IChrZXkpID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KVxuICAgIHJlc29sdmUoKVxuICB9KVxufVxuIiwiY29uc3QgcHJlYWN0ID0gcmVxdWlyZSgncHJlYWN0JylcbmNvbnN0IGZpbmRET01FbGVtZW50ID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2ZpbmRET01FbGVtZW50JylcblxuLyoqXG4gKiBEZWZlciBhIGZyZXF1ZW50IGNhbGwgdG8gdGhlIG1pY3JvdGFzayBxdWV1ZS5cbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UgKGZuKSB7XG4gIGxldCBjYWxsaW5nID0gbnVsbFxuICBsZXQgbGF0ZXN0QXJncyA9IG51bGxcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgbGF0ZXN0QXJncyA9IGFyZ3NcbiAgICBpZiAoIWNhbGxpbmcpIHtcbiAgICAgIGNhbGxpbmcgPSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgY2FsbGluZyA9IG51bGxcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCBgYXJnc2AgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBtb3N0XG4gICAgICAgIC8vIHJlY2VudCBzdGF0ZSwgaWYgbXVsdGlwbGUgY2FsbHMgaGFwcGVuZWQgc2luY2UgdGhpcyB0YXNrXG4gICAgICAgIC8vIHdhcyBxdWV1ZWQuIFNvIHdlIHVzZSB0aGUgYGxhdGVzdEFyZ3NgLCB3aGljaCBkZWZpbml0ZWx5XG4gICAgICAgIC8vIGlzIHRoZSBtb3N0IHJlY2VudCBjYWxsLlxuICAgICAgICByZXR1cm4gZm4oLi4ubGF0ZXN0QXJncylcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBjYWxsaW5nXG4gIH1cbn1cblxuLyoqXG4gKiBCb2lsZXJwbGF0ZSB0aGF0IGFsbCBQbHVnaW5zIHNoYXJlIC0gYW5kIHNob3VsZCBub3QgYmUgdXNlZFxuICogZGlyZWN0bHkuIEl0IGFsc28gc2hvd3Mgd2hpY2ggbWV0aG9kcyBmaW5hbCBwbHVnaW5zIHNob3VsZCBpbXBsZW1lbnQvb3ZlcnJpZGUsXG4gKiB0aGlzIGRlY2lkaW5nIG9uIHN0cnVjdHVyZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbWFpbiBVcHB5IGNvcmUgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IHdpdGggcGx1Z2luIG9wdGlvbnNcbiAqIEByZXR1cm4ge2FycmF5IHwgc3RyaW5nfSBmaWxlcyBvciBzdWNjZXNzL2ZhaWwgbWVzc2FnZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgdGhpcy51cHB5ID0gdXBweVxuICAgIHRoaXMub3B0cyA9IG9wdHMgfHwge31cblxuICAgIHRoaXMudXBkYXRlID0gdGhpcy51cGRhdGUuYmluZCh0aGlzKVxuICAgIHRoaXMubW91bnQgPSB0aGlzLm1vdW50LmJpbmQodGhpcylcbiAgICB0aGlzLmluc3RhbGwgPSB0aGlzLmluc3RhbGwuYmluZCh0aGlzKVxuICAgIHRoaXMudW5pbnN0YWxsID0gdGhpcy51bmluc3RhbGwuYmluZCh0aGlzKVxuICB9XG5cbiAgZ2V0UGx1Z2luU3RhdGUgKCkge1xuICAgIGNvbnN0IHsgcGx1Z2lucyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICByZXR1cm4gcGx1Z2luc1t0aGlzLmlkXSB8fCB7fVxuICB9XG5cbiAgc2V0UGx1Z2luU3RhdGUgKHVwZGF0ZSkge1xuICAgIGNvbnN0IHsgcGx1Z2lucyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcblxuICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICBwbHVnaW5zOiB7XG4gICAgICAgIC4uLnBsdWdpbnMsXG4gICAgICAgIFt0aGlzLmlkXToge1xuICAgICAgICAgIC4uLnBsdWdpbnNbdGhpcy5pZF0sXG4gICAgICAgICAgLi4udXBkYXRlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgdXBkYXRlIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5lbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLl91cGRhdGVVSSkge1xuICAgICAgdGhpcy5fdXBkYXRlVUkoc3RhdGUpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogQ2FsbGVkIHdoZW4gcGx1Z2luIGlzIG1vdW50ZWQsIHdoZXRoZXIgaW4gRE9NIG9yIGludG8gYW5vdGhlciBwbHVnaW4uXG4gICogTmVlZGVkIGJlY2F1c2Ugc29tZXRpbWVzIHBsdWdpbnMgYXJlIG1vdW50ZWQgc2VwYXJhdGVseS9hZnRlciBgaW5zdGFsbGAsXG4gICogc28gdGhpcy5lbCBhbmQgdGhpcy5wYXJlbnQgbWlnaHQgbm90IGJlIGF2YWlsYWJsZSBpbiBgaW5zdGFsbGAuXG4gICogVGhpcyBpcyB0aGUgY2FzZSB3aXRoIEB1cHB5L3JlYWN0IHBsdWdpbnMsIGZvciBleGFtcGxlLlxuICAqL1xuICBvbk1vdW50ICgpIHtcblxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN1cHBsaWVkIGB0YXJnZXRgIGlzIGEgRE9NIGVsZW1lbnQgb3IgYW4gYG9iamVjdGAuXG4gICAqIElmIGl04oCZcyBhbiBvYmplY3Qg4oCUIHRhcmdldCBpcyBhIHBsdWdpbiwgYW5kIHdlIHNlYXJjaCBgcGx1Z2luc2BcbiAgICogZm9yIGEgcGx1Z2luIHdpdGggc2FtZSBuYW1lIGFuZCByZXR1cm4gaXRzIHRhcmdldC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB0YXJnZXRcbiAgICpcbiAgICovXG4gIG1vdW50ICh0YXJnZXQsIHBsdWdpbikge1xuICAgIGNvbnN0IGNhbGxlclBsdWdpbk5hbWUgPSBwbHVnaW4uaWRcblxuICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBmaW5kRE9NRWxlbWVudCh0YXJnZXQpXG5cbiAgICBpZiAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgdGhpcy5pc1RhcmdldERPTUVsID0gdHJ1ZVxuXG4gICAgICAvLyBBUEkgZm9yIHBsdWdpbnMgdGhhdCByZXF1aXJlIGEgc3luY2hyb25vdXMgcmVyZW5kZXIuXG4gICAgICB0aGlzLnJlcmVuZGVyID0gKHN0YXRlKSA9PiB7XG4gICAgICAgIC8vIHBsdWdpbiBjb3VsZCBiZSByZW1vdmVkLCBidXQgdGhpcy5yZXJlbmRlciBpcyBkZWJvdW5jZWQgYmVsb3csXG4gICAgICAgIC8vIHNvIGl0IGNvdWxkIHN0aWxsIGJlIGNhbGxlZCBldmVuIGFmdGVyIHVwcHkucmVtb3ZlUGx1Z2luIG9yIHVwcHkuY2xvc2VcbiAgICAgICAgLy8gaGVuY2UgdGhlIGNoZWNrXG4gICAgICAgIGlmICghdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLmlkKSkgcmV0dXJuXG4gICAgICAgIHRoaXMuZWwgPSBwcmVhY3QucmVuZGVyKHRoaXMucmVuZGVyKHN0YXRlKSwgdGFyZ2V0RWxlbWVudCwgdGhpcy5lbClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3VwZGF0ZVVJID0gZGVib3VuY2UodGhpcy5yZXJlbmRlcilcblxuICAgICAgdGhpcy51cHB5LmxvZyhgSW5zdGFsbGluZyAke2NhbGxlclBsdWdpbk5hbWV9IHRvIGEgRE9NIGVsZW1lbnRgKVxuXG4gICAgICAvLyBjbGVhciBldmVyeXRoaW5nIGluc2lkZSB0aGUgdGFyZ2V0IGNvbnRhaW5lclxuICAgICAgaWYgKHRoaXMub3B0cy5yZXBsYWNlVGFyZ2V0Q29udGVudCkge1xuICAgICAgICB0YXJnZXRFbGVtZW50LmlubmVySFRNTCA9ICcnXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwgPSBwcmVhY3QucmVuZGVyKHRoaXMucmVuZGVyKHRoaXMudXBweS5nZXRTdGF0ZSgpKSwgdGFyZ2V0RWxlbWVudClcblxuICAgICAgdGhpcy5vbk1vdW50KClcbiAgICAgIHJldHVybiB0aGlzLmVsXG4gICAgfVxuXG4gICAgbGV0IHRhcmdldFBsdWdpblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnb2JqZWN0JyAmJiB0YXJnZXQgaW5zdGFuY2VvZiBQbHVnaW4pIHtcbiAgICAgIC8vIFRhcmdldGluZyBhIHBsdWdpbiAqaW5zdGFuY2UqXG4gICAgICB0YXJnZXRQbHVnaW4gPSB0YXJnZXRcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIFRhcmdldGluZyBhIHBsdWdpbiB0eXBlXG4gICAgICBjb25zdCBUYXJnZXQgPSB0YXJnZXRcbiAgICAgIC8vIEZpbmQgdGhlIHRhcmdldCBwbHVnaW4gaW5zdGFuY2UuXG4gICAgICB0aGlzLnVwcHkuaXRlcmF0ZVBsdWdpbnMoKHBsdWdpbikgPT4ge1xuICAgICAgICBpZiAocGx1Z2luIGluc3RhbmNlb2YgVGFyZ2V0KSB7XG4gICAgICAgICAgdGFyZ2V0UGx1Z2luID0gcGx1Z2luXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHRhcmdldFBsdWdpbikge1xuICAgICAgdGhpcy51cHB5LmxvZyhgSW5zdGFsbGluZyAke2NhbGxlclBsdWdpbk5hbWV9IHRvICR7dGFyZ2V0UGx1Z2luLmlkfWApXG4gICAgICB0aGlzLnBhcmVudCA9IHRhcmdldFBsdWdpblxuICAgICAgdGhpcy5lbCA9IHRhcmdldFBsdWdpbi5hZGRUYXJnZXQocGx1Z2luKVxuXG4gICAgICB0aGlzLm9uTW91bnQoKVxuICAgICAgcmV0dXJuIHRoaXMuZWxcbiAgICB9XG5cbiAgICB0aGlzLnVwcHkubG9nKGBOb3QgaW5zdGFsbGluZyAke2NhbGxlclBsdWdpbk5hbWV9YClcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGFyZ2V0IG9wdGlvbiBnaXZlbiB0byAke2NhbGxlclBsdWdpbk5hbWV9LiBQbGVhc2UgbWFrZSBzdXJlIHRoYXQgdGhlIGVsZW1lbnQgXG4gICAgICBleGlzdHMgb24gdGhlIHBhZ2UsIG9yIHRoYXQgdGhlIHBsdWdpbiB5b3UgYXJlIHRhcmdldGluZyBoYXMgYmVlbiBpbnN0YWxsZWQuIENoZWNrIHRoYXQgdGhlIDxzY3JpcHQ+IHRhZyBpbml0aWFsaXppbmcgVXBweSBcbiAgICAgIGNvbWVzIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UsIGJlZm9yZSB0aGUgY2xvc2luZyA8L2JvZHk+IHRhZyAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5L2lzc3Vlcy8xMDQyKS5gKVxuICB9XG5cbiAgcmVuZGVyIChzdGF0ZSkge1xuICAgIHRocm93IChuZXcgRXJyb3IoJ0V4dGVuZCB0aGUgcmVuZGVyIG1ldGhvZCB0byBhZGQgeW91ciBwbHVnaW4gdG8gYSBET00gZWxlbWVudCcpKVxuICB9XG5cbiAgYWRkVGFyZ2V0IChwbHVnaW4pIHtcbiAgICB0aHJvdyAobmV3IEVycm9yKCdFeHRlbmQgdGhlIGFkZFRhcmdldCBtZXRob2QgdG8gYWRkIHlvdXIgcGx1Z2luIHRvIGFub3RoZXIgcGx1Z2luXFwncyB0YXJnZXQnKSlcbiAgfVxuXG4gIHVubW91bnQgKCkge1xuICAgIGlmICh0aGlzLmlzVGFyZ2V0RE9NRWwgJiYgdGhpcy5lbCAmJiB0aGlzLmVsLnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICAgIH1cbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuXG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIHRoaXMudW5tb3VudCgpXG4gIH1cbn1cbiIsImNvbnN0IFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpXG5jb25zdCBlZSA9IHJlcXVpcmUoJ25hbWVzcGFjZS1lbWl0dGVyJylcbmNvbnN0IGN1aWQgPSByZXF1aXJlKCdjdWlkJylcbi8vIGNvbnN0IHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJylcbmNvbnN0IHByZXR0eUJ5dGVzID0gcmVxdWlyZSgncHJldHRpZXItYnl0ZXMnKVxuY29uc3QgbWF0Y2ggPSByZXF1aXJlKCdtaW1lLW1hdGNoJylcbmNvbnN0IERlZmF1bHRTdG9yZSA9IHJlcXVpcmUoJ0B1cHB5L3N0b3JlLWRlZmF1bHQnKVxuY29uc3QgZ2V0RmlsZVR5cGUgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0RmlsZVR5cGUnKVxuY29uc3QgZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24gPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24nKVxuY29uc3QgZ2VuZXJhdGVGaWxlSUQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2VuZXJhdGVGaWxlSUQnKVxuY29uc3QgZ2V0VGltZVN0YW1wID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldFRpbWVTdGFtcCcpXG5jb25zdCBzdXBwb3J0c1VwbG9hZFByb2dyZXNzID0gcmVxdWlyZSgnLi9zdXBwb3J0c1VwbG9hZFByb2dyZXNzJylcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vUGx1Z2luJykgLy8gRXhwb3J0ZWQgZnJvbSBoZXJlLlxuXG4vKipcbiAqIFVwcHkgQ29yZSBtb2R1bGUuXG4gKiBNYW5hZ2VzIHBsdWdpbnMsIHN0YXRlIHVwZGF0ZXMsIGFjdHMgYXMgYW4gZXZlbnQgYnVzLFxuICogYWRkcy9yZW1vdmVzIGZpbGVzIGFuZCBtZXRhZGF0YS5cbiAqL1xuY2xhc3MgVXBweSB7XG4gIC8qKlxuICAqIEluc3RhbnRpYXRlIFVwcHlcbiAgKiBAcGFyYW0ge29iamVjdH0gb3B0cyDigJQgVXBweSBvcHRpb25zXG4gICovXG4gIGNvbnN0cnVjdG9yIChvcHRzKSB7XG4gICAgdGhpcy5kZWZhdWx0TG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge1xuICAgICAgICB5b3VDYW5Pbmx5VXBsb2FkWDoge1xuICAgICAgICAgIDA6ICdZb3UgY2FuIG9ubHkgdXBsb2FkICV7c21hcnRfY291bnR9IGZpbGUnLFxuICAgICAgICAgIDE6ICdZb3UgY2FuIG9ubHkgdXBsb2FkICV7c21hcnRfY291bnR9IGZpbGVzJyxcbiAgICAgICAgICAyOiAnWW91IGNhbiBvbmx5IHVwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlcydcbiAgICAgICAgfSxcbiAgICAgICAgeW91SGF2ZVRvQXRMZWFzdFNlbGVjdFg6IHtcbiAgICAgICAgICAwOiAnWW91IGhhdmUgdG8gc2VsZWN0IGF0IGxlYXN0ICV7c21hcnRfY291bnR9IGZpbGUnLFxuICAgICAgICAgIDE6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZXMnLFxuICAgICAgICAgIDI6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZXMnXG4gICAgICAgIH0sXG4gICAgICAgIGV4Y2VlZHNTaXplOiAnVGhpcyBmaWxlIGV4Y2VlZHMgbWF4aW11bSBhbGxvd2VkIHNpemUgb2YnLFxuICAgICAgICB5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzOiAnWW91IGNhbiBvbmx5IHVwbG9hZDogJXt0eXBlc30nLFxuICAgICAgICBjb21wYW5pb25FcnJvcjogJ0Nvbm5lY3Rpb24gd2l0aCBDb21wYW5pb24gZmFpbGVkJyxcbiAgICAgICAgY29tcGFuaW9uQXV0aEVycm9yOiAnQXV0aG9yaXphdGlvbiByZXF1aXJlZCcsXG4gICAgICAgIGZhaWxlZFRvVXBsb2FkOiAnRmFpbGVkIHRvIHVwbG9hZCAle2ZpbGV9JyxcbiAgICAgICAgbm9JbnRlcm5ldENvbm5lY3Rpb246ICdObyBJbnRlcm5ldCBjb25uZWN0aW9uJyxcbiAgICAgICAgY29ubmVjdGVkVG9JbnRlcm5ldDogJ0Nvbm5lY3RlZCB0byB0aGUgSW50ZXJuZXQnLFxuICAgICAgICAvLyBTdHJpbmdzIGZvciByZW1vdGUgcHJvdmlkZXJzXG4gICAgICAgIG5vRmlsZXNGb3VuZDogJ1lvdSBoYXZlIG5vIGZpbGVzIG9yIGZvbGRlcnMgaGVyZScsXG4gICAgICAgIHNlbGVjdFhGaWxlczoge1xuICAgICAgICAgIDA6ICdTZWxlY3QgJXtzbWFydF9jb3VudH0gZmlsZScsXG4gICAgICAgICAgMTogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fSBmaWxlcycsXG4gICAgICAgICAgMjogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fSBmaWxlcydcbiAgICAgICAgfSxcbiAgICAgICAgY2FuY2VsOiAnQ2FuY2VsJyxcbiAgICAgICAgbG9nT3V0OiAnTG9nIG91dCcsXG4gICAgICAgIGZpbHRlcjogJ0ZpbHRlcicsXG4gICAgICAgIHJlc2V0RmlsdGVyOiAnUmVzZXQgZmlsdGVyJyxcbiAgICAgICAgbG9hZGluZzogJ0xvYWRpbmcuLi4nLFxuICAgICAgICBhdXRoZW50aWNhdGVXaXRoVGl0bGU6ICdQbGVhc2UgYXV0aGVudGljYXRlIHdpdGggJXtwbHVnaW5OYW1lfSB0byBzZWxlY3QgZmlsZXMnLFxuICAgICAgICBhdXRoZW50aWNhdGVXaXRoOiAnQ29ubmVjdCB0byAle3BsdWdpbk5hbWV9J1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGlkOiAndXBweScsXG4gICAgICBhdXRvUHJvY2VlZDogZmFsc2UsXG4gICAgICBhbGxvd011bHRpcGxlVXBsb2FkczogdHJ1ZSxcbiAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgIHJlc3RyaWN0aW9uczoge1xuICAgICAgICBtYXhGaWxlU2l6ZTogbnVsbCxcbiAgICAgICAgbWF4TnVtYmVyT2ZGaWxlczogbnVsbCxcbiAgICAgICAgbWluTnVtYmVyT2ZGaWxlczogbnVsbCxcbiAgICAgICAgYWxsb3dlZEZpbGVUeXBlczogbnVsbFxuICAgICAgfSxcbiAgICAgIG1ldGE6IHt9LFxuICAgICAgb25CZWZvcmVGaWxlQWRkZWQ6IChjdXJyZW50RmlsZSwgZmlsZXMpID0+IGN1cnJlbnRGaWxlLFxuICAgICAgb25CZWZvcmVVcGxvYWQ6IChmaWxlcykgPT4gZmlsZXMsXG4gICAgICBzdG9yZTogRGVmYXVsdFN0b3JlKClcbiAgICB9XG5cbiAgICAvLyBNZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKVxuICAgIHRoaXMub3B0cy5yZXN0cmljdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucy5yZXN0cmljdGlvbnMsIHRoaXMub3B0cy5yZXN0cmljdGlvbnMpXG5cbiAgICAvLyBpMThuXG4gICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3IoWyB0aGlzLmRlZmF1bHRMb2NhbGUsIHRoaXMub3B0cy5sb2NhbGUgXSlcbiAgICB0aGlzLmxvY2FsZSA9IHRoaXMudHJhbnNsYXRvci5sb2NhbGVcbiAgICB0aGlzLmkxOG4gPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodGhpcy50cmFuc2xhdG9yKVxuICAgIHRoaXMuaTE4bkFycmF5ID0gdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZUFycmF5LmJpbmQodGhpcy50cmFuc2xhdG9yKVxuXG4gICAgLy8gQ29udGFpbmVyIGZvciBkaWZmZXJlbnQgdHlwZXMgb2YgcGx1Z2luc1xuICAgIHRoaXMucGx1Z2lucyA9IHt9XG5cbiAgICB0aGlzLmdldFN0YXRlID0gdGhpcy5nZXRTdGF0ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5nZXRQbHVnaW4gPSB0aGlzLmdldFBsdWdpbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5zZXRGaWxlTWV0YSA9IHRoaXMuc2V0RmlsZU1ldGEuYmluZCh0aGlzKVxuICAgIHRoaXMuc2V0RmlsZVN0YXRlID0gdGhpcy5zZXRGaWxlU3RhdGUuYmluZCh0aGlzKVxuICAgIHRoaXMubG9nID0gdGhpcy5sb2cuYmluZCh0aGlzKVxuICAgIHRoaXMuaW5mbyA9IHRoaXMuaW5mby5iaW5kKHRoaXMpXG4gICAgdGhpcy5oaWRlSW5mbyA9IHRoaXMuaGlkZUluZm8uYmluZCh0aGlzKVxuICAgIHRoaXMuYWRkRmlsZSA9IHRoaXMuYWRkRmlsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZW1vdmVGaWxlID0gdGhpcy5yZW1vdmVGaWxlLmJpbmQodGhpcylcbiAgICB0aGlzLnBhdXNlUmVzdW1lID0gdGhpcy5wYXVzZVJlc3VtZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MgPSB0aGlzLl9jYWxjdWxhdGVQcm9ncmVzcy5iaW5kKHRoaXMpXG4gICAgdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMgPSB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cy5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZXNldFByb2dyZXNzID0gdGhpcy5yZXNldFByb2dyZXNzLmJpbmQodGhpcylcblxuICAgIHRoaXMucGF1c2VBbGwgPSB0aGlzLnBhdXNlQWxsLmJpbmQodGhpcylcbiAgICB0aGlzLnJlc3VtZUFsbCA9IHRoaXMucmVzdW1lQWxsLmJpbmQodGhpcylcbiAgICB0aGlzLnJldHJ5QWxsID0gdGhpcy5yZXRyeUFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy5jYW5jZWxBbGwgPSB0aGlzLmNhbmNlbEFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZXRyeVVwbG9hZCA9IHRoaXMucmV0cnlVcGxvYWQuYmluZCh0aGlzKVxuICAgIHRoaXMudXBsb2FkID0gdGhpcy51cGxvYWQuYmluZCh0aGlzKVxuXG4gICAgdGhpcy5lbWl0dGVyID0gZWUoKVxuICAgIHRoaXMub24gPSB0aGlzLm9uLmJpbmQodGhpcylcbiAgICB0aGlzLm9mZiA9IHRoaXMub2ZmLmJpbmQodGhpcylcbiAgICB0aGlzLm9uY2UgPSB0aGlzLmVtaXR0ZXIub25jZS5iaW5kKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLmVtaXQgPSB0aGlzLmVtaXR0ZXIuZW1pdC5iaW5kKHRoaXMuZW1pdHRlcilcblxuICAgIHRoaXMucHJlUHJvY2Vzc29ycyA9IFtdXG4gICAgdGhpcy51cGxvYWRlcnMgPSBbXVxuICAgIHRoaXMucG9zdFByb2Nlc3NvcnMgPSBbXVxuXG4gICAgdGhpcy5zdG9yZSA9IHRoaXMub3B0cy5zdG9yZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcGx1Z2luczoge30sXG4gICAgICBmaWxlczoge30sXG4gICAgICBjdXJyZW50VXBsb2Fkczoge30sXG4gICAgICBhbGxvd05ld1VwbG9hZDogdHJ1ZSxcbiAgICAgIGNhcGFiaWxpdGllczoge1xuICAgICAgICB1cGxvYWRQcm9ncmVzczogc3VwcG9ydHNVcGxvYWRQcm9ncmVzcygpLFxuICAgICAgICBpbmRpdmlkdWFsQ2FuY2VsbGF0aW9uOiB0cnVlLFxuICAgICAgICByZXN1bWFibGVVcGxvYWRzOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDAsXG4gICAgICBtZXRhOiB7IC4uLnRoaXMub3B0cy5tZXRhIH0sXG4gICAgICBpbmZvOiB7XG4gICAgICAgIGlzSGlkZGVuOiB0cnVlLFxuICAgICAgICB0eXBlOiAnaW5mbycsXG4gICAgICAgIG1lc3NhZ2U6ICcnXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuX3N0b3JlVW5zdWJzY3JpYmUgPSB0aGlzLnN0b3JlLnN1YnNjcmliZSgocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoJ3N0YXRlLXVwZGF0ZScsIHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwYXRjaClcbiAgICAgIHRoaXMudXBkYXRlQWxsKG5leHRTdGF0ZSlcbiAgICB9KVxuXG4gICAgLy8gZm9yIGRlYnVnZ2luZyBhbmQgdGVzdGluZ1xuICAgIC8vIHRoaXMudXBkYXRlTnVtID0gMFxuICAgIGlmICh0aGlzLm9wdHMuZGVidWcgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvd1sndXBweUxvZyddID0gJydcbiAgICAgIHdpbmRvd1t0aGlzLm9wdHMuaWRdID0gdGhpc1xuICAgIH1cblxuICAgIHRoaXMuX2FkZExpc3RlbmVycygpXG4gIH1cblxuICBvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKGV2ZW50LCBjYWxsYmFjaylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgb2ZmIChldmVudCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub2ZmKGV2ZW50LCBjYWxsYmFjaylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb24gYWxsIHBsdWdpbnMgYW5kIHJ1biBgdXBkYXRlYCBvbiB0aGVtLlxuICAgKiBDYWxsZWQgZWFjaCB0aW1lIHN0YXRlIGNoYW5nZXMuXG4gICAqXG4gICAqL1xuICB1cGRhdGVBbGwgKHN0YXRlKSB7XG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucyhwbHVnaW4gPT4ge1xuICAgICAgcGx1Z2luLnVwZGF0ZShzdGF0ZSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgc3RhdGUgd2l0aCBhIHBhdGNoXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXRjaCB7Zm9vOiAnYmFyJ31cbiAgICovXG4gIHNldFN0YXRlIChwYXRjaCkge1xuICAgIHRoaXMuc3RvcmUuc2V0U3RhdGUocGF0Y2gpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBjdXJyZW50IHN0YXRlLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuICBnZXRTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKVxuICB9XG5cbiAgLyoqXG4gICogQmFjayBjb21wYXQgZm9yIHdoZW4gdXBweS5zdGF0ZSBpcyB1c2VkIGluc3RlYWQgb2YgdXBweS5nZXRTdGF0ZSgpLlxuICAqL1xuICBnZXQgc3RhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFN0YXRlKClcbiAgfVxuXG4gIC8qKlxuICAqIFNob3J0aGFuZCB0byBzZXQgc3RhdGUgZm9yIGEgc3BlY2lmaWMgZmlsZS5cbiAgKi9cbiAgc2V0RmlsZVN0YXRlIChmaWxlSUQsIHN0YXRlKSB7XG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW7igJl0IHNldCBzdGF0ZSBmb3IgJHtmaWxlSUR9ICh0aGUgZmlsZSBjb3VsZCBoYXZlIGJlZW4gcmVtb3ZlZClgKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcywge1xuICAgICAgICBbZmlsZUlEXTogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzW2ZpbGVJRF0sIHN0YXRlKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgcmVzZXRQcm9ncmVzcyAoKSB7XG4gICAgY29uc3QgZGVmYXVsdFByb2dyZXNzID0ge1xuICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICB1cGxvYWRTdGFydGVkOiBmYWxzZVxuICAgIH1cbiAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7fVxuICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKGZpbGVJRCA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGVJRF0pXG4gICAgICB1cGRhdGVkRmlsZS5wcm9ncmVzcyA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlLnByb2dyZXNzLCBkZWZhdWx0UHJvZ3Jlc3MpXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IHVwZGF0ZWRGaWxlXG4gICAgfSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlcyxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDBcbiAgICB9KVxuXG4gICAgLy8gVE9ETyBEb2N1bWVudCBvbiB0aGUgd2Vic2l0ZVxuICAgIHRoaXMuZW1pdCgncmVzZXQtcHJvZ3Jlc3MnKVxuICB9XG5cbiAgYWRkUHJlUHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucHJlUHJvY2Vzc29ycy5wdXNoKGZuKVxuICB9XG5cbiAgcmVtb3ZlUHJlUHJvY2Vzc29yIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnByZVByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucHJlUHJvY2Vzc29ycy5zcGxpY2UoaSwgMSlcbiAgICB9XG4gIH1cblxuICBhZGRQb3N0UHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucG9zdFByb2Nlc3NvcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVBvc3RQcm9jZXNzb3IgKGZuKSB7XG4gICAgY29uc3QgaSA9IHRoaXMucG9zdFByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucG9zdFByb2Nlc3NvcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgYWRkVXBsb2FkZXIgKGZuKSB7XG4gICAgdGhpcy51cGxvYWRlcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVVwbG9hZGVyIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnVwbG9hZGVycy5pbmRleE9mKGZuKVxuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgdGhpcy51cGxvYWRlcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgc2V0TWV0YSAoZGF0YSkge1xuICAgIGNvbnN0IHVwZGF0ZWRNZXRhID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLm1ldGEsIGRhdGEpXG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuXG4gICAgT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sIHtcbiAgICAgICAgbWV0YTogT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgZGF0YSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMubG9nKCdBZGRpbmcgbWV0YWRhdGE6JylcbiAgICB0aGlzLmxvZyhkYXRhKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtZXRhOiB1cGRhdGVkTWV0YSxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXNcbiAgICB9KVxuICB9XG5cbiAgc2V0RmlsZU1ldGEgKGZpbGVJRCwgZGF0YSkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBpZiAoIXVwZGF0ZWRGaWxlc1tmaWxlSURdKSB7XG4gICAgICB0aGlzLmxvZygnV2FzIHRyeWluZyB0byBzZXQgbWV0YWRhdGEgZm9yIGEgZmlsZSB0aGF04oCZcyBub3Qgd2l0aCB1cyBhbnltb3JlOiAnLCBmaWxlSUQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgbmV3TWV0YSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLm1ldGEsIGRhdGEpXG4gICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwge1xuICAgICAgbWV0YTogbmV3TWV0YVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7ZmlsZXM6IHVwZGF0ZWRGaWxlc30pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgZmlsZSBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSUQgVGhlIElEIG9mIHRoZSBmaWxlIG9iamVjdCB0byByZXR1cm4uXG4gICAqL1xuICBnZXRGaWxlIChmaWxlSUQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpLmZpbGVzW2ZpbGVJRF1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGZpbGVzIGluIGFuIGFycmF5LlxuICAgKi9cbiAgZ2V0RmlsZXMgKCkge1xuICAgIGNvbnN0IHsgZmlsZXMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIHJldHVybiBPYmplY3Qua2V5cyhmaWxlcykubWFwKChmaWxlSUQpID0+IGZpbGVzW2ZpbGVJRF0pXG4gIH1cblxuICAvKipcbiAgKiBDaGVjayBpZiBtaW5OdW1iZXJPZkZpbGVzIHJlc3RyaWN0aW9uIGlzIHJlYWNoZWQgYmVmb3JlIHVwbG9hZGluZy5cbiAgKlxuICAqIEBwcml2YXRlXG4gICovXG4gIF9jaGVja01pbk51bWJlck9mRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3Qge21pbk51bWJlck9mRmlsZXN9ID0gdGhpcy5vcHRzLnJlc3RyaWN0aW9uc1xuICAgIGlmIChPYmplY3Qua2V5cyhmaWxlcykubGVuZ3RoIDwgbWluTnVtYmVyT2ZGaWxlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMuaTE4bigneW91SGF2ZVRvQXRMZWFzdFNlbGVjdFgnLCB7IHNtYXJ0X2NvdW50OiBtaW5OdW1iZXJPZkZpbGVzIH0pfWApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogQ2hlY2sgaWYgZmlsZSBwYXNzZXMgYSBzZXQgb2YgcmVzdHJpY3Rpb25zIHNldCBpbiBvcHRpb25zOiBtYXhGaWxlU2l6ZSxcbiAgKiBtYXhOdW1iZXJPZkZpbGVzIGFuZCBhbGxvd2VkRmlsZVR5cGVzLlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IGZpbGUgb2JqZWN0IHRvIGNoZWNrXG4gICogQHByaXZhdGVcbiAgKi9cbiAgX2NoZWNrUmVzdHJpY3Rpb25zIChmaWxlKSB7XG4gICAgY29uc3Qge21heEZpbGVTaXplLCBtYXhOdW1iZXJPZkZpbGVzLCBhbGxvd2VkRmlsZVR5cGVzfSA9IHRoaXMub3B0cy5yZXN0cmljdGlvbnNcblxuICAgIGlmIChtYXhOdW1iZXJPZkZpbGVzKSB7XG4gICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5nZXRTdGF0ZSgpLmZpbGVzKS5sZW5ndGggKyAxID4gbWF4TnVtYmVyT2ZGaWxlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGhpcy5pMThuKCd5b3VDYW5Pbmx5VXBsb2FkWCcsIHsgc21hcnRfY291bnQ6IG1heE51bWJlck9mRmlsZXMgfSl9YClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYWxsb3dlZEZpbGVUeXBlcykge1xuICAgICAgY29uc3QgaXNDb3JyZWN0RmlsZVR5cGUgPSBhbGxvd2VkRmlsZVR5cGVzLnNvbWUoKHR5cGUpID0+IHtcbiAgICAgICAgLy8gaWYgKCFmaWxlLnR5cGUpIHJldHVybiBmYWxzZVxuXG4gICAgICAgIC8vIGlzIHRoaXMgaXMgYSBtaW1lLXR5cGVcbiAgICAgICAgaWYgKHR5cGUuaW5kZXhPZignLycpID4gLTEpIHtcbiAgICAgICAgICBpZiAoIWZpbGUudHlwZSkgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgcmV0dXJuIG1hdGNoKGZpbGUudHlwZSwgdHlwZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGlzIGlzIGxpa2VseSBhbiBleHRlbnNpb25cbiAgICAgICAgaWYgKHR5cGVbMF0gPT09ICcuJykge1xuICAgICAgICAgIHJldHVybiBmaWxlLmV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSB0eXBlLnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9KVxuXG4gICAgICBpZiAoIWlzQ29ycmVjdEZpbGVUeXBlKSB7XG4gICAgICAgIGNvbnN0IGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgPSBhbGxvd2VkRmlsZVR5cGVzLmpvaW4oJywgJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMuaTE4bigneW91Q2FuT25seVVwbG9hZEZpbGVUeXBlcycsIHsgdHlwZXM6IGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgfSkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2UgY2FuJ3QgY2hlY2sgbWF4RmlsZVNpemUgaWYgdGhlIHNpemUgaXMgdW5rbm93bi5cbiAgICBpZiAobWF4RmlsZVNpemUgJiYgZmlsZS5kYXRhLnNpemUgIT0gbnVsbCkge1xuICAgICAgaWYgKGZpbGUuZGF0YS5zaXplID4gbWF4RmlsZVNpemUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMuaTE4bignZXhjZWVkc1NpemUnKX0gJHtwcmV0dHlCeXRlcyhtYXhGaWxlU2l6ZSl9YClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBBZGQgYSBuZXcgZmlsZSB0byBgc3RhdGUuZmlsZXNgLiBUaGlzIHdpbGwgcnVuIGBvbkJlZm9yZUZpbGVBZGRlZGAsXG4gICogdHJ5IHRvIGd1ZXNzIGZpbGUgdHlwZSBpbiBhIGNsZXZlciB3YXksIGNoZWNrIGZpbGUgYWdhaW5zdCByZXN0cmljdGlvbnMsXG4gICogYW5kIHN0YXJ0IGFuIHVwbG9hZCBpZiBgYXV0b1Byb2NlZWQgPT09IHRydWVgLlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IGZpbGUgb2JqZWN0IHRvIGFkZFxuICAqL1xuICBhZGRGaWxlIChmaWxlKSB7XG4gICAgY29uc3QgeyBmaWxlcywgYWxsb3dOZXdVcGxvYWQgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuXG4gICAgY29uc3Qgb25FcnJvciA9IChtc2cpID0+IHtcbiAgICAgIGNvbnN0IGVyciA9IHR5cGVvZiBtc2cgPT09ICdvYmplY3QnID8gbXNnIDogbmV3IEVycm9yKG1zZylcbiAgICAgIHRoaXMubG9nKGVyci5tZXNzYWdlKVxuICAgICAgdGhpcy5pbmZvKGVyci5tZXNzYWdlLCAnZXJyb3InLCA1MDAwKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgaWYgKGFsbG93TmV3VXBsb2FkID09PSBmYWxzZSkge1xuICAgICAgb25FcnJvcihuZXcgRXJyb3IoJ0Nhbm5vdCBhZGQgbmV3IGZpbGVzOiBhbHJlYWR5IHVwbG9hZGluZy4nKSlcbiAgICB9XG5cbiAgICBjb25zdCBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCA9IHRoaXMub3B0cy5vbkJlZm9yZUZpbGVBZGRlZChmaWxlLCBmaWxlcylcblxuICAgIGlmIChvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMubG9nKCdOb3QgYWRkaW5nIGZpbGUgYmVjYXVzZSBvbkJlZm9yZUZpbGVBZGRlZCByZXR1cm5lZCBmYWxzZScpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0ID09PSAnb2JqZWN0JyAmJiBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCkge1xuICAgICAgLy8gd2FybmluZyBhZnRlciB0aGUgY2hhbmdlIGluIDAuMjRcbiAgICAgIGlmIChvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdC50aGVuKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uQmVmb3JlRmlsZUFkZGVkKCkgcmV0dXJuZWQgYSBQcm9taXNlLCBidXQgdGhpcyBpcyBubyBsb25nZXIgc3VwcG9ydGVkLiBJdCBtdXN0IGJlIHN5bmNocm9ub3VzLicpXG4gICAgICB9XG4gICAgICBmaWxlID0gb25CZWZvcmVGaWxlQWRkZWRSZXN1bHRcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlVHlwZSA9IGdldEZpbGVUeXBlKGZpbGUpXG4gICAgbGV0IGZpbGVOYW1lXG4gICAgaWYgKGZpbGUubmFtZSkge1xuICAgICAgZmlsZU5hbWUgPSBmaWxlLm5hbWVcbiAgICB9IGVsc2UgaWYgKGZpbGVUeXBlLnNwbGl0KCcvJylbMF0gPT09ICdpbWFnZScpIHtcbiAgICAgIGZpbGVOYW1lID0gZmlsZVR5cGUuc3BsaXQoJy8nKVswXSArICcuJyArIGZpbGVUeXBlLnNwbGl0KCcvJylbMV1cbiAgICB9IGVsc2Uge1xuICAgICAgZmlsZU5hbWUgPSAnbm9uYW1lJ1xuICAgIH1cbiAgICBjb25zdCBmaWxlRXh0ZW5zaW9uID0gZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24oZmlsZU5hbWUpLmV4dGVuc2lvblxuICAgIGNvbnN0IGlzUmVtb3RlID0gZmlsZS5pc1JlbW90ZSB8fCBmYWxzZVxuXG4gICAgY29uc3QgZmlsZUlEID0gZ2VuZXJhdGVGaWxlSUQoZmlsZSlcblxuICAgIGNvbnN0IG1ldGEgPSBmaWxlLm1ldGEgfHwge31cbiAgICBtZXRhLm5hbWUgPSBmaWxlTmFtZVxuICAgIG1ldGEudHlwZSA9IGZpbGVUeXBlXG5cbiAgICAvLyBgbnVsbGAgbWVhbnMgdGhlIHNpemUgaXMgdW5rbm93bi5cbiAgICBjb25zdCBzaXplID0gaXNGaW5pdGUoZmlsZS5kYXRhLnNpemUpID8gZmlsZS5kYXRhLnNpemUgOiBudWxsXG4gICAgY29uc3QgbmV3RmlsZSA9IHtcbiAgICAgIHNvdXJjZTogZmlsZS5zb3VyY2UgfHwgJycsXG4gICAgICBpZDogZmlsZUlELFxuICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICBleHRlbnNpb246IGZpbGVFeHRlbnNpb24gfHwgJycsXG4gICAgICBtZXRhOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkubWV0YSwgbWV0YSksXG4gICAgICB0eXBlOiBmaWxlVHlwZSxcbiAgICAgIGRhdGE6IGZpbGUuZGF0YSxcbiAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICAgIGJ5dGVzVG90YWw6IHNpemUsXG4gICAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgdXBsb2FkU3RhcnRlZDogZmFsc2VcbiAgICAgIH0sXG4gICAgICBzaXplOiBzaXplLFxuICAgICAgaXNSZW1vdGU6IGlzUmVtb3RlLFxuICAgICAgcmVtb3RlOiBmaWxlLnJlbW90ZSB8fCAnJyxcbiAgICAgIHByZXZpZXc6IGZpbGUucHJldmlld1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICB0aGlzLl9jaGVja1Jlc3RyaWN0aW9ucyhuZXdGaWxlKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5lbWl0KCdyZXN0cmljdGlvbi1mYWlsZWQnLCBuZXdGaWxlLCBlcnIpXG4gICAgICBvbkVycm9yKGVycilcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiBPYmplY3QuYXNzaWduKHt9LCBmaWxlcywge1xuICAgICAgICBbZmlsZUlEXTogbmV3RmlsZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdmaWxlLWFkZGVkJywgbmV3RmlsZSlcbiAgICB0aGlzLmxvZyhgQWRkZWQgZmlsZTogJHtmaWxlTmFtZX0sICR7ZmlsZUlEfSwgbWltZSB0eXBlOiAke2ZpbGVUeXBlfWApXG5cbiAgICBpZiAodGhpcy5vcHRzLmF1dG9Qcm9jZWVkICYmICF0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQgPSBudWxsXG4gICAgICAgIHRoaXMudXBsb2FkKCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlIHx8IGVycilcbiAgICAgICAgfSlcbiAgICAgIH0sIDQpXG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlRmlsZSAoZmlsZUlEKSB7XG4gICAgY29uc3QgeyBmaWxlcywgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzKVxuICAgIGNvbnN0IHJlbW92ZWRGaWxlID0gdXBkYXRlZEZpbGVzW2ZpbGVJRF1cbiAgICBkZWxldGUgdXBkYXRlZEZpbGVzW2ZpbGVJRF1cblxuICAgIC8vIFJlbW92ZSB0aGlzIGZpbGUgZnJvbSBpdHMgYGN1cnJlbnRVcGxvYWRgLlxuICAgIGNvbnN0IHVwZGF0ZWRVcGxvYWRzID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHMpXG4gICAgY29uc3QgcmVtb3ZlVXBsb2FkcyA9IFtdXG4gICAgT2JqZWN0LmtleXModXBkYXRlZFVwbG9hZHMpLmZvckVhY2goKHVwbG9hZElEKSA9PiB7XG4gICAgICBjb25zdCBuZXdGaWxlSURzID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLmZpbGVJRHMuZmlsdGVyKCh1cGxvYWRGaWxlSUQpID0+IHVwbG9hZEZpbGVJRCAhPT0gZmlsZUlEKVxuICAgICAgLy8gUmVtb3ZlIHRoZSB1cGxvYWQgaWYgbm8gZmlsZXMgYXJlIGFzc29jaWF0ZWQgd2l0aCBpdCBhbnltb3JlLlxuICAgICAgaWYgKG5ld0ZpbGVJRHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlbW92ZVVwbG9hZHMucHVzaCh1cGxvYWRJRClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZWRVcGxvYWRzW3VwbG9hZElEXSA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwge1xuICAgICAgICBmaWxlSURzOiBuZXdGaWxlSURzXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiB1cGRhdGVkVXBsb2FkcyxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXNcbiAgICB9KVxuXG4gICAgcmVtb3ZlVXBsb2Fkcy5mb3JFYWNoKCh1cGxvYWRJRCkgPT4ge1xuICAgICAgdGhpcy5fcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgIH0pXG5cbiAgICB0aGlzLl9jYWxjdWxhdGVUb3RhbFByb2dyZXNzKClcbiAgICB0aGlzLmVtaXQoJ2ZpbGUtcmVtb3ZlZCcsIHJlbW92ZWRGaWxlKVxuICAgIHRoaXMubG9nKGBGaWxlIHJlbW92ZWQ6ICR7cmVtb3ZlZEZpbGUuaWR9YClcbiAgfVxuXG4gIHBhdXNlUmVzdW1lIChmaWxlSUQpIHtcbiAgICBpZiAoIXRoaXMuZ2V0U3RhdGUoKS5jYXBhYmlsaXRpZXMucmVzdW1hYmxlVXBsb2FkcyB8fFxuICAgICAgICAgdGhpcy5nZXRGaWxlKGZpbGVJRCkudXBsb2FkQ29tcGxldGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHdhc1BhdXNlZCA9IHRoaXMuZ2V0RmlsZShmaWxlSUQpLmlzUGF1c2VkIHx8IGZhbHNlXG4gICAgY29uc3QgaXNQYXVzZWQgPSAhd2FzUGF1c2VkXG5cbiAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlSUQsIHtcbiAgICAgIGlzUGF1c2VkOiBpc1BhdXNlZFxuICAgIH0pXG5cbiAgICB0aGlzLmVtaXQoJ3VwbG9hZC1wYXVzZScsIGZpbGVJRCwgaXNQYXVzZWQpXG5cbiAgICByZXR1cm4gaXNQYXVzZWRcbiAgfVxuXG4gIHBhdXNlQWxsICgpIHtcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgY29uc3QgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcyA9IE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZmlsdGVyKChmaWxlKSA9PiB7XG4gICAgICByZXR1cm4gIXVwZGF0ZWRGaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRDb21wbGV0ZSAmJlxuICAgICAgICAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRTdGFydGVkXG4gICAgfSlcblxuICAgIGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZV0sIHtcbiAgICAgICAgaXNQYXVzZWQ6IHRydWVcbiAgICAgIH0pXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7ZmlsZXM6IHVwZGF0ZWRGaWxlc30pXG5cbiAgICB0aGlzLmVtaXQoJ3BhdXNlLWFsbCcpXG4gIH1cblxuICByZXN1bWVBbGwgKCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCBpblByb2dyZXNzVXBkYXRlZEZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiAhdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlICYmXG4gICAgICAgICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICB9KVxuXG4gICAgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlXSwge1xuICAgICAgICBpc1BhdXNlZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiBudWxsXG4gICAgICB9KVxuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVdID0gdXBkYXRlZEZpbGVcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoe2ZpbGVzOiB1cGRhdGVkRmlsZXN9KVxuXG4gICAgdGhpcy5lbWl0KCdyZXN1bWUtYWxsJylcbiAgfVxuXG4gIHJldHJ5QWxsICgpIHtcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgY29uc3QgZmlsZXNUb1JldHJ5ID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoZmlsZSA9PiB7XG4gICAgICByZXR1cm4gdXBkYXRlZEZpbGVzW2ZpbGVdLmVycm9yXG4gICAgfSlcblxuICAgIGZpbGVzVG9SZXRyeS5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlXSwge1xuICAgICAgICBpc1BhdXNlZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiBudWxsXG4gICAgICB9KVxuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVdID0gdXBkYXRlZEZpbGVcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlcyxcbiAgICAgIGVycm9yOiBudWxsXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgncmV0cnktYWxsJywgZmlsZXNUb1JldHJ5KVxuXG4gICAgY29uc3QgdXBsb2FkSUQgPSB0aGlzLl9jcmVhdGVVcGxvYWQoZmlsZXNUb1JldHJ5KVxuICAgIHJldHVybiB0aGlzLl9ydW5VcGxvYWQodXBsb2FkSUQpXG4gIH1cblxuICBjYW5jZWxBbGwgKCkge1xuICAgIHRoaXMuZW1pdCgnY2FuY2VsLWFsbCcpXG5cbiAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5rZXlzKHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBmaWxlcy5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlRmlsZShmaWxlSUQpXG4gICAgfSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYWxsb3dOZXdVcGxvYWQ6IHRydWUsXG4gICAgICB0b3RhbFByb2dyZXNzOiAwLFxuICAgICAgZXJyb3I6IG51bGxcbiAgICB9KVxuICB9XG5cbiAgcmV0cnlVcGxvYWQgKGZpbGVJRCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLFxuICAgICAgeyBlcnJvcjogbnVsbCwgaXNQYXVzZWQ6IGZhbHNlIH1cbiAgICApXG4gICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB1cGRhdGVkRmlsZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlc1xuICAgIH0pXG5cbiAgICB0aGlzLmVtaXQoJ3VwbG9hZC1yZXRyeScsIGZpbGVJRClcblxuICAgIGNvbnN0IHVwbG9hZElEID0gdGhpcy5fY3JlYXRlVXBsb2FkKFsgZmlsZUlEIF0pXG4gICAgcmV0dXJuIHRoaXMuX3J1blVwbG9hZCh1cGxvYWRJRClcbiAgfVxuXG4gIHJlc2V0ICgpIHtcbiAgICB0aGlzLmNhbmNlbEFsbCgpXG4gIH1cblxuICBfY2FsY3VsYXRlUHJvZ3Jlc3MgKGZpbGUsIGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGJ5dGVzVG90YWwgbWF5IGJlIG51bGwgb3IgemVybzsgaW4gdGhhdCBjYXNlIHdlIGNhbid0IGRpdmlkZSBieSBpdFxuICAgIGNvbnN0IGNhbkhhdmVQZXJjZW50YWdlID0gaXNGaW5pdGUoZGF0YS5ieXRlc1RvdGFsKSAmJiBkYXRhLmJ5dGVzVG90YWwgPiAwXG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzcywge1xuICAgICAgICBieXRlc1VwbG9hZGVkOiBkYXRhLmJ5dGVzVXBsb2FkZWQsXG4gICAgICAgIGJ5dGVzVG90YWw6IGRhdGEuYnl0ZXNUb3RhbCxcbiAgICAgICAgcGVyY2VudGFnZTogY2FuSGF2ZVBlcmNlbnRhZ2VcbiAgICAgICAgICAvLyBUT0RPKGdvdG8tYnVzLXN0b3ApIGZsb29yaW5nIHRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHRoZSBjaG9pY2Ugb2YgdGhlIFVJP1xuICAgICAgICAgIC8vIHdlIGdldCBtb3JlIGFjY3VyYXRlIGNhbGN1bGF0aW9ucyBpZiB3ZSBkb24ndCByb3VuZCB0aGlzIGF0IGFsbC5cbiAgICAgICAgICA/IE1hdGguZmxvb3IoZGF0YS5ieXRlc1VwbG9hZGVkIC8gZGF0YS5ieXRlc1RvdGFsICogMTAwKVxuICAgICAgICAgIDogMFxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG4gIH1cblxuICBfY2FsY3VsYXRlVG90YWxQcm9ncmVzcyAoKSB7XG4gICAgLy8gY2FsY3VsYXRlIHRvdGFsIHByb2dyZXNzLCB1c2luZyB0aGUgbnVtYmVyIG9mIGZpbGVzIGN1cnJlbnRseSB1cGxvYWRpbmcsXG4gICAgLy8gbXVsdGlwbGllZCBieSAxMDAgYW5kIHRoZSBzdW1tIG9mIGluZGl2aWR1YWwgcHJvZ3Jlc3Mgb2YgZWFjaCBmaWxlXG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldEZpbGVzKClcblxuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICB9KVxuXG4gICAgaWYgKGluUHJvZ3Jlc3MubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzJywgMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzOiAwIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzaXplZEZpbGVzID0gaW5Qcm9ncmVzcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbCAhPSBudWxsKVxuICAgIGNvbnN0IHVuc2l6ZWRGaWxlcyA9IGluUHJvZ3Jlc3MuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLmJ5dGVzVG90YWwgPT0gbnVsbClcblxuICAgIGlmIChzaXplZEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgcHJvZ3Jlc3NNYXggPSBpblByb2dyZXNzLmxlbmd0aFxuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdW5zaXplZEZpbGVzLnJlZHVjZSgoYWNjLCBmaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgKyBmaWxlLnByb2dyZXNzLnBlcmNlbnRhZ2VcbiAgICAgIH0sIDApXG4gICAgICBjb25zdCB0b3RhbFByb2dyZXNzID0gTWF0aC5yb3VuZChjdXJyZW50UHJvZ3Jlc3MgLyBwcm9ncmVzc01heCAqIDEwMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgdG90YWxTaXplID0gc2l6ZWRGaWxlcy5yZWR1Y2UoKGFjYywgZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuIGFjYyArIGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbFxuICAgIH0sIDApXG4gICAgY29uc3QgYXZlcmFnZVNpemUgPSB0b3RhbFNpemUgLyBzaXplZEZpbGVzLmxlbmd0aFxuICAgIHRvdGFsU2l6ZSArPSBhdmVyYWdlU2l6ZSAqIHVuc2l6ZWRGaWxlcy5sZW5ndGhcblxuICAgIGxldCB1cGxvYWRlZFNpemUgPSAwXG4gICAgc2l6ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICB1cGxvYWRlZFNpemUgKz0gZmlsZS5wcm9ncmVzcy5ieXRlc1VwbG9hZGVkXG4gICAgfSlcbiAgICB1bnNpemVkRmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgdXBsb2FkZWRTaXplICs9IGF2ZXJhZ2VTaXplICogKGZpbGUucHJvZ3Jlc3MucGVyY2VudGFnZSB8fCAwKVxuICAgIH0pXG5cbiAgICBsZXQgdG90YWxQcm9ncmVzcyA9IHRvdGFsU2l6ZSA9PT0gMFxuICAgICAgPyAwXG4gICAgICA6IE1hdGgucm91bmQodXBsb2FkZWRTaXplIC8gdG90YWxTaXplICogMTAwKVxuXG4gICAgLy8gaG90IGZpeCwgYmVjYXVzZTpcbiAgICAvLyB1cGxvYWRlZFNpemUgZW5kZWQgdXAgbGFyZ2VyIHRoYW4gdG90YWxTaXplLCByZXN1bHRpbmcgaW4gMTMyNSUgdG90YWxcbiAgICBpZiAodG90YWxQcm9ncmVzcyA+IDEwMCkge1xuICAgICAgdG90YWxQcm9ncmVzcyA9IDEwMFxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgdGhpcy5lbWl0KCdwcm9ncmVzcycsIHRvdGFsUHJvZ3Jlc3MpXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgYWxsIGdsb2JhbCBhY3Rpb25zLCBsaWtlOlxuICAgKiBgZXJyb3JgLCBgZmlsZS1yZW1vdmVkYCwgYHVwbG9hZC1wcm9ncmVzc2BcbiAgICovXG4gIF9hZGRMaXN0ZW5lcnMgKCkge1xuICAgIHRoaXMub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkLWVycm9yJywgKGZpbGUsIGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KVxuXG4gICAgICBsZXQgbWVzc2FnZSA9IHRoaXMuaTE4bignZmFpbGVkVG9VcGxvYWQnLCB7IGZpbGU6IGZpbGUubmFtZSB9KVxuICAgICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IubWVzc2FnZSkge1xuICAgICAgICBtZXNzYWdlID0geyBtZXNzYWdlOiBtZXNzYWdlLCBkZXRhaWxzOiBlcnJvci5tZXNzYWdlIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuaW5mbyhtZXNzYWdlLCAnZXJyb3InLCA1MDAwKVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkLXN0YXJ0ZWQnLCAoZmlsZSwgdXBsb2FkKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICB1cGxvYWRTdGFydGVkOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICAgICAgYnl0ZXNUb3RhbDogZmlsZS5zaXplXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vIHVwbG9hZCBwcm9ncmVzcyBldmVudHMgY2FuIG9jY3VyIGZyZXF1ZW50bHksIGVzcGVjaWFsbHkgd2hlbiB5b3UgaGF2ZSBhIGdvb2RcbiAgICAvLyBjb25uZWN0aW9uIHRvIHRoZSByZW1vdGUgc2VydmVyLiBUaGVyZWZvcmUsIHdlIGFyZSB0aHJvdHRlbGluZyB0aGVtIHRvXG4gICAgLy8gcHJldmVudCBhY2Nlc3NpdmUgZnVuY3Rpb24gY2FsbHMuXG4gICAgLy8gc2VlIGFsc286IGh0dHBzOi8vZ2l0aHViLmNvbS90dXMvdHVzLWpzLWNsaWVudC9jb21taXQvOTk0MGYyN2IyMzYxZmQ3ZTEwYmE1OGIwOWI2MGQ4MjQyMjE4M2JiYlxuICAgIC8vIGNvbnN0IF90aHJvdHRsZWRDYWxjdWxhdGVQcm9ncmVzcyA9IHRocm90dGxlKHRoaXMuX2NhbGN1bGF0ZVByb2dyZXNzLCAxMDAsIHsgbGVhZGluZzogdHJ1ZSwgdHJhaWxpbmc6IHRydWUgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZC1wcm9ncmVzcycsIHRoaXMuX2NhbGN1bGF0ZVByb2dyZXNzKVxuXG4gICAgdGhpcy5vbigndXBsb2FkLXN1Y2Nlc3MnLCAoZmlsZSwgdXBsb2FkUmVzcCkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdGhpcy5nZXRGaWxlKGZpbGUuaWQpLnByb2dyZXNzXG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50UHJvZ3Jlc3MsIHtcbiAgICAgICAgICB1cGxvYWRDb21wbGV0ZTogdHJ1ZSxcbiAgICAgICAgICBwZXJjZW50YWdlOiAxMDAsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogY3VycmVudFByb2dyZXNzLmJ5dGVzVG90YWxcbiAgICAgICAgfSksXG4gICAgICAgIHJlc3BvbnNlOiB1cGxvYWRSZXNwLFxuICAgICAgICB1cGxvYWRVUkw6IHVwbG9hZFJlc3AudXBsb2FkVVJMLFxuICAgICAgICBpc1BhdXNlZDogZmFsc2VcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLXByb2dyZXNzJywgKGZpbGUsIHByb2dyZXNzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzcywge1xuICAgICAgICAgIHByZXByb2Nlc3M6IHByb2dyZXNzXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLWNvbXBsZXRlJywgKGZpbGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgZmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgICBmaWxlc1tmaWxlLmlkXSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGUuaWRdLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcylcbiAgICAgIH0pXG4gICAgICBkZWxldGUgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MucHJlcHJvY2Vzc1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IGZpbGVzIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3Bvc3Rwcm9jZXNzLXByb2dyZXNzJywgKGZpbGUsIHByb2dyZXNzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlLmlkXS5wcm9ncmVzcywge1xuICAgICAgICAgIHBvc3Rwcm9jZXNzOiBwcm9ncmVzc1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigncG9zdHByb2Nlc3MtY29tcGxldGUnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICAgIGZpbGVzW2ZpbGUuaWRdID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsZXNbZmlsZS5pZF0sIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGUuaWRdLnByb2dyZXNzKVxuICAgICAgfSlcbiAgICAgIGRlbGV0ZSBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcy5wb3N0cHJvY2Vzc1xuICAgICAgLy8gVE9ETyBzaG91bGQgd2Ugc2V0IHNvbWUga2luZCBvZiBgZnVsbHlDb21wbGV0ZWAgcHJvcGVydHkgb24gdGhlIGZpbGUgb2JqZWN0XG4gICAgICAvLyBzbyBpdCdzIGVhc2llciB0byBzZWUgdGhhdCB0aGUgZmlsZSBpcyB1cGxvYWTigKZmdWxseSBjb21wbGV0ZeKApnJhdGhlciB0aGFuXG4gICAgICAvLyB3aGF0IHdlIGhhdmUgdG8gZG8gbm93IChgdXBsb2FkQ29tcGxldGUgJiYgIXBvc3Rwcm9jZXNzYClcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiBmaWxlcyB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdyZXN0b3JlZCcsICgpID0+IHtcbiAgICAgIC8vIEZpbGVzIG1heSBoYXZlIGNoYW5nZWQtLWVuc3VyZSBwcm9ncmVzcyBpcyBzdGlsbCBhY2N1cmF0ZS5cbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIH0pXG5cbiAgICAvLyBzaG93IGluZm9ybWVyIGlmIG9mZmxpbmVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCAoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29mZmxpbmUnLCAoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpLCAzMDAwKVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZU9ubGluZVN0YXR1cyAoKSB7XG4gICAgY29uc3Qgb25saW5lID1cbiAgICAgIHR5cGVvZiB3aW5kb3cubmF2aWdhdG9yLm9uTGluZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyB3aW5kb3cubmF2aWdhdG9yLm9uTGluZVxuICAgICAgICA6IHRydWVcbiAgICBpZiAoIW9ubGluZSkge1xuICAgICAgdGhpcy5lbWl0KCdpcy1vZmZsaW5lJylcbiAgICAgIHRoaXMuaW5mbyh0aGlzLmkxOG4oJ25vSW50ZXJuZXRDb25uZWN0aW9uJyksICdlcnJvcicsIDApXG4gICAgICB0aGlzLndhc09mZmxpbmUgPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdCgnaXMtb25saW5lJylcbiAgICAgIGlmICh0aGlzLndhc09mZmxpbmUpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdiYWNrLW9ubGluZScpXG4gICAgICAgIHRoaXMuaW5mbyh0aGlzLmkxOG4oJ2Nvbm5lY3RlZFRvSW50ZXJuZXQnKSwgJ3N1Y2Nlc3MnLCAzMDAwKVxuICAgICAgICB0aGlzLndhc09mZmxpbmUgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldElEICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRzLmlkXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgcGx1Z2luIHdpdGggQ29yZS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IFBsdWdpbiBvYmplY3RcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRzXSBvYmplY3Qgd2l0aCBvcHRpb25zIHRvIGJlIHBhc3NlZCB0byBQbHVnaW5cbiAgICogQHJldHVybiB7T2JqZWN0fSBzZWxmIGZvciBjaGFpbmluZ1xuICAgKi9cbiAgdXNlIChQbHVnaW4sIG9wdHMpIHtcbiAgICBpZiAodHlwZW9mIFBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGV0IG1zZyA9IGBFeHBlY3RlZCBhIHBsdWdpbiBjbGFzcywgYnV0IGdvdCAke1BsdWdpbiA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBQbHVnaW59LmAgK1xuICAgICAgICAnIFBsZWFzZSB2ZXJpZnkgdGhhdCB0aGUgcGx1Z2luIHdhcyBpbXBvcnRlZCBhbmQgc3BlbGxlZCBjb3JyZWN0bHkuJ1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cpXG4gICAgfVxuXG4gICAgLy8gSW5zdGFudGlhdGVcbiAgICBjb25zdCBwbHVnaW4gPSBuZXcgUGx1Z2luKHRoaXMsIG9wdHMpXG4gICAgY29uc3QgcGx1Z2luSWQgPSBwbHVnaW4uaWRcbiAgICB0aGlzLnBsdWdpbnNbcGx1Z2luLnR5cGVdID0gdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXSB8fCBbXVxuXG4gICAgaWYgKCFwbHVnaW5JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHBsdWdpbiBtdXN0IGhhdmUgYW4gaWQnKVxuICAgIH1cblxuICAgIGlmICghcGx1Z2luLnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBwbHVnaW4gbXVzdCBoYXZlIGEgdHlwZScpXG4gICAgfVxuXG4gICAgbGV0IGV4aXN0c1BsdWdpbkFscmVhZHkgPSB0aGlzLmdldFBsdWdpbihwbHVnaW5JZClcbiAgICBpZiAoZXhpc3RzUGx1Z2luQWxyZWFkeSkge1xuICAgICAgbGV0IG1zZyA9IGBBbHJlYWR5IGZvdW5kIGEgcGx1Z2luIG5hbWVkICcke2V4aXN0c1BsdWdpbkFscmVhZHkuaWR9Jy4gYCArXG4gICAgICAgIGBUcmllZCB0byB1c2U6ICcke3BsdWdpbklkfScuXFxuYCArXG4gICAgICAgIGBVcHB5IHBsdWdpbnMgbXVzdCBoYXZlIHVuaXF1ZSAnaWQnIG9wdGlvbnMuIFNlZSBodHRwczovL3VwcHkuaW8vZG9jcy9wbHVnaW5zLyNpZC5gXG4gICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKVxuICAgIH1cblxuICAgIHRoaXMucGx1Z2luc1twbHVnaW4udHlwZV0ucHVzaChwbHVnaW4pXG4gICAgcGx1Z2luLmluc3RhbGwoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIG9uZSBQbHVnaW4gYnkgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHBsdWdpbiBpZFxuICAgKiBAcmV0dXJuIHtvYmplY3QgfCBib29sZWFufVxuICAgKi9cbiAgZ2V0UGx1Z2luIChpZCkge1xuICAgIGxldCBmb3VuZFBsdWdpbiA9IG51bGxcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKChwbHVnaW4pID0+IHtcbiAgICAgIGlmIChwbHVnaW4uaWQgPT09IGlkKSB7XG4gICAgICAgIGZvdW5kUGx1Z2luID0gcGx1Z2luXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvdW5kUGx1Z2luXG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSB0aHJvdWdoIGFsbCBgdXNlYGQgcGx1Z2lucy5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWV0aG9kIHRoYXQgd2lsbCBiZSBydW4gb24gZWFjaCBwbHVnaW5cbiAgICovXG4gIGl0ZXJhdGVQbHVnaW5zIChtZXRob2QpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLnBsdWdpbnMpLmZvckVhY2gocGx1Z2luVHlwZSA9PiB7XG4gICAgICB0aGlzLnBsdWdpbnNbcGx1Z2luVHlwZV0uZm9yRWFjaChtZXRob2QpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVbmluc3RhbGwgYW5kIHJlbW92ZSBhIHBsdWdpbi5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGluc3RhbmNlIFRoZSBwbHVnaW4gaW5zdGFuY2UgdG8gcmVtb3ZlLlxuICAgKi9cbiAgcmVtb3ZlUGx1Z2luIChpbnN0YW5jZSkge1xuICAgIHRoaXMubG9nKGBSZW1vdmluZyBwbHVnaW4gJHtpbnN0YW5jZS5pZH1gKVxuICAgIHRoaXMuZW1pdCgncGx1Z2luLXJlbW92ZScsIGluc3RhbmNlKVxuXG4gICAgaWYgKGluc3RhbmNlLnVuaW5zdGFsbCkge1xuICAgICAgaW5zdGFuY2UudW5pbnN0YWxsKClcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0ID0gdGhpcy5wbHVnaW5zW2luc3RhbmNlLnR5cGVdLnNsaWNlKClcbiAgICBjb25zdCBpbmRleCA9IGxpc3QuaW5kZXhPZihpbnN0YW5jZSlcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBsaXN0LnNwbGljZShpbmRleCwgMSlcbiAgICAgIHRoaXMucGx1Z2luc1tpbnN0YW5jZS50eXBlXSA9IGxpc3RcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVkU3RhdGUgPSB0aGlzLmdldFN0YXRlKClcbiAgICBkZWxldGUgdXBkYXRlZFN0YXRlLnBsdWdpbnNbaW5zdGFuY2UuaWRdXG4gICAgdGhpcy5zZXRTdGF0ZSh1cGRhdGVkU3RhdGUpXG4gIH1cblxuICAvKipcbiAgICogVW5pbnN0YWxsIGFsbCBwbHVnaW5zIGFuZCBjbG9zZSBkb3duIHRoaXMgVXBweSBpbnN0YW5jZS5cbiAgICovXG4gIGNsb3NlICgpIHtcbiAgICB0aGlzLmxvZyhgQ2xvc2luZyBVcHB5IGluc3RhbmNlICR7dGhpcy5vcHRzLmlkfTogcmVtb3ZpbmcgYWxsIGZpbGVzIGFuZCB1bmluc3RhbGxpbmcgcGx1Z2luc2ApXG5cbiAgICB0aGlzLnJlc2V0KClcblxuICAgIHRoaXMuX3N0b3JlVW5zdWJzY3JpYmUoKVxuXG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucygocGx1Z2luKSA9PiB7XG4gICAgICB0aGlzLnJlbW92ZVBsdWdpbihwbHVnaW4pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAqIFNldCBpbmZvIG1lc3NhZ2UgaW4gYHN0YXRlLmluZm9gLCBzbyB0aGF0IFVJIHBsdWdpbnMgbGlrZSBgSW5mb3JtZXJgXG4gICogY2FuIGRpc3BsYXkgdGhlIG1lc3NhZ2UuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZyB8IG9iamVjdH0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIGRpc3BsYXllZCBieSB0aGUgaW5mb3JtZXJcbiAgKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdXG4gICogQHBhcmFtIHtudW1iZXJ9IFtkdXJhdGlvbl1cbiAgKi9cblxuICBpbmZvIChtZXNzYWdlLCB0eXBlID0gJ2luZm8nLCBkdXJhdGlvbiA9IDMwMDApIHtcbiAgICBjb25zdCBpc0NvbXBsZXhNZXNzYWdlID0gdHlwZW9mIG1lc3NhZ2UgPT09ICdvYmplY3QnXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGluZm86IHtcbiAgICAgICAgaXNIaWRkZW46IGZhbHNlLFxuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBtZXNzYWdlOiBpc0NvbXBsZXhNZXNzYWdlID8gbWVzc2FnZS5tZXNzYWdlIDogbWVzc2FnZSxcbiAgICAgICAgZGV0YWlsczogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UuZGV0YWlscyA6IG51bGxcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdpbmZvLXZpc2libGUnKVxuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaW5mb1RpbWVvdXRJRClcbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgIHRoaXMuaW5mb1RpbWVvdXRJRCA9IHVuZGVmaW5lZFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gaGlkZSB0aGUgaW5mb3JtZXIgYWZ0ZXIgYGR1cmF0aW9uYCBtaWxsaXNlY29uZHNcbiAgICB0aGlzLmluZm9UaW1lb3V0SUQgPSBzZXRUaW1lb3V0KHRoaXMuaGlkZUluZm8sIGR1cmF0aW9uKVxuICB9XG5cbiAgaGlkZUluZm8gKCkge1xuICAgIGNvbnN0IG5ld0luZm8gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuaW5mbywge1xuICAgICAgaXNIaWRkZW46IHRydWVcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaW5mbzogbmV3SW5mb1xuICAgIH0pXG4gICAgdGhpcy5lbWl0KCdpbmZvLWhpZGRlbicpXG4gIH1cblxuICAvKipcbiAgICogTG9ncyBzdHVmZiB0byBjb25zb2xlLCBvbmx5IGlmIGBkZWJ1Z2AgaXMgc2V0IHRvIHRydWUuIFNpbGVudCBpbiBwcm9kdWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG1lc3NhZ2UgdG8gbG9nXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gb3B0aW9uYWwgYGVycm9yYCBvciBgd2FybmluZ2BcbiAgICovXG4gIGxvZyAobWVzc2FnZSwgdHlwZSkge1xuICAgIGlmICghdGhpcy5vcHRzLmRlYnVnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBwcmVmaXggPSBgW1VwcHldIFske2dldFRpbWVTdGFtcCgpfV1gXG5cbiAgICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgY29uc29sZS5lcnJvcihwcmVmaXgsIG1lc3NhZ2UpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICBjb25zb2xlLndhcm4ocHJlZml4LCBtZXNzYWdlKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc29sZS5sb2cocHJlZml4LCBtZXNzYWdlKVxuICB9XG5cbiAgLyoqXG4gICAqIE9ic29sZXRlLCBldmVudCBsaXN0ZW5lcnMgYXJlIG5vdyBhZGRlZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAqL1xuICBydW4gKCkge1xuICAgIHRoaXMubG9nKCdDYWxsaW5nIHJ1bigpIGlzIG5vIGxvbmdlciBuZWNlc3NhcnkuJywgJ3dhcm5pbmcnKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZSBhbiB1cGxvYWQgYnkgaXRzIElELlxuICAgKi9cbiAgcmVzdG9yZSAodXBsb2FkSUQpIHtcbiAgICB0aGlzLmxvZyhgQ29yZTogYXR0ZW1wdGluZyB0byByZXN0b3JlIHVwbG9hZCBcIiR7dXBsb2FkSUR9XCJgKVxuXG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHNbdXBsb2FkSURdKSB7XG4gICAgICB0aGlzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdOb25leGlzdGVudCB1cGxvYWQnKSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcnVuVXBsb2FkKHVwbG9hZElEKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiB1cGxvYWQgZm9yIGEgYnVuY2ggb2YgZmlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZmlsZUlEcyBGaWxlIElEcyB0byBpbmNsdWRlIGluIHRoaXMgdXBsb2FkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IElEIG9mIHRoaXMgdXBsb2FkLlxuICAgKi9cbiAgX2NyZWF0ZVVwbG9hZCAoZmlsZUlEcykge1xuICAgIGNvbnN0IHsgYWxsb3dOZXdVcGxvYWQsIGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBpZiAoIWFsbG93TmV3VXBsb2FkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgYSBuZXcgdXBsb2FkOiBhbHJlYWR5IHVwbG9hZGluZy4nKVxuICAgIH1cblxuICAgIGNvbnN0IHVwbG9hZElEID0gY3VpZCgpXG5cbiAgICB0aGlzLmVtaXQoJ3VwbG9hZCcsIHtcbiAgICAgIGlkOiB1cGxvYWRJRCxcbiAgICAgIGZpbGVJRHM6IGZpbGVJRHNcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhbGxvd05ld1VwbG9hZDogdGhpcy5vcHRzLmFsbG93TXVsdGlwbGVVcGxvYWRzICE9PSBmYWxzZSxcblxuICAgICAgY3VycmVudFVwbG9hZHM6IHtcbiAgICAgICAgLi4uY3VycmVudFVwbG9hZHMsXG4gICAgICAgIFt1cGxvYWRJRF06IHtcbiAgICAgICAgICBmaWxlSURzOiBmaWxlSURzLFxuICAgICAgICAgIHN0ZXA6IDAsXG4gICAgICAgICAgcmVzdWx0OiB7fVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB1cGxvYWRJRFxuICB9XG5cbiAgX2dldFVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcblxuICAgIHJldHVybiBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZGF0YSB0byBhbiB1cGxvYWQncyByZXN1bHQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXBsb2FkSUQgVGhlIElEIG9mIHRoZSB1cGxvYWQuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIERhdGEgcHJvcGVydGllcyB0byBhZGQgdG8gdGhlIHJlc3VsdCBvYmplY3QuXG4gICAqL1xuICBhZGRSZXN1bHREYXRhICh1cGxvYWRJRCwgZGF0YSkge1xuICAgIGlmICghdGhpcy5fZ2V0VXBsb2FkKHVwbG9hZElEKSkge1xuICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHJlc3VsdCBmb3IgYW4gdXBsb2FkIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHt1cGxvYWRJRH1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRVcGxvYWRzID0gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzXG4gICAgY29uc3QgY3VycmVudFVwbG9hZCA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwge1xuICAgICAgcmVzdWx0OiBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0ucmVzdWx0LCBkYXRhKVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHMsIHtcbiAgICAgICAgW3VwbG9hZElEXTogY3VycmVudFVwbG9hZFxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiB1cGxvYWQsIGVnLiBpZiBpdCBoYXMgYmVlbiBjYW5jZWxlZCBvciBjb21wbGV0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cGxvYWRJRCBUaGUgSUQgb2YgdGhlIHVwbG9hZC5cbiAgICovXG4gIF9yZW1vdmVVcGxvYWQgKHVwbG9hZElEKSB7XG4gICAgY29uc3QgY3VycmVudFVwbG9hZHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHMpXG4gICAgZGVsZXRlIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogY3VycmVudFVwbG9hZHNcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbiB1cGxvYWQuIFRoaXMgcGlja3MgdXAgd2hlcmUgaXQgbGVmdCBvZmYgaW4gY2FzZSB0aGUgdXBsb2FkIGlzIGJlaW5nIHJlc3RvcmVkLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3J1blVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCB1cGxvYWREYXRhID0gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgIGNvbnN0IHJlc3RvcmVTdGVwID0gdXBsb2FkRGF0YS5zdGVwXG5cbiAgICBjb25zdCBzdGVwcyA9IFtcbiAgICAgIC4uLnRoaXMucHJlUHJvY2Vzc29ycyxcbiAgICAgIC4uLnRoaXMudXBsb2FkZXJzLFxuICAgICAgLi4udGhpcy5wb3N0UHJvY2Vzc29yc1xuICAgIF1cbiAgICBsZXQgbGFzdFN0ZXAgPSBQcm9taXNlLnJlc29sdmUoKVxuICAgIHN0ZXBzLmZvckVhY2goKGZuLCBzdGVwKSA9PiB7XG4gICAgICAvLyBTa2lwIHRoaXMgc3RlcCBpZiB3ZSBhcmUgcmVzdG9yaW5nIGFuZCBoYXZlIGFscmVhZHkgY29tcGxldGVkIHRoaXMgc3RlcCBiZWZvcmUuXG4gICAgICBpZiAoc3RlcCA8IHJlc3RvcmVTdGVwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBsYXN0U3RlcCA9IGxhc3RTdGVwLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICAgICAgY29uc3QgY3VycmVudFVwbG9hZCA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwge1xuICAgICAgICAgIHN0ZXA6IHN0ZXBcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY3VycmVudFVwbG9hZHM6IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRVcGxvYWRzLCB7XG4gICAgICAgICAgICBbdXBsb2FkSURdOiBjdXJyZW50VXBsb2FkXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBUT0RPIGdpdmUgdGhpcyB0aGUgYGN1cnJlbnRVcGxvYWRgIG9iamVjdCBhcyBpdHMgb25seSBwYXJhbWV0ZXIgbWF5YmU/XG4gICAgICAgIC8vIE90aGVyd2lzZSB3aGVuIG1vcmUgbWV0YWRhdGEgbWF5IGJlIGFkZGVkIHRvIHRoZSB1cGxvYWQgdGhpcyB3b3VsZCBrZWVwIGdldHRpbmcgbW9yZSBwYXJhbWV0ZXJzXG4gICAgICAgIHJldHVybiBmbihjdXJyZW50VXBsb2FkLmZpbGVJRHMsIHVwbG9hZElEKVxuICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyBOb3QgcmV0dXJuaW5nIHRoZSBgY2F0Y2hgZWQgcHJvbWlzZSwgYmVjYXVzZSB3ZSBzdGlsbCB3YW50IHRvIHJldHVybiBhIHJlamVjdGVkXG4gICAgLy8gcHJvbWlzZSBmcm9tIHRoaXMgbWV0aG9kIGlmIHRoZSB1cGxvYWQgZmFpbGVkLlxuICAgIGxhc3RTdGVwLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIsIHVwbG9hZElEKVxuICAgICAgdGhpcy5fcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbGFzdFN0ZXAudGhlbigoKSA9PiB7XG4gICAgICAvLyBTZXQgcmVzdWx0IGRhdGEuXG4gICAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICAgIGNvbnN0IGN1cnJlbnRVcGxvYWQgPSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgICAgIGlmICghY3VycmVudFVwbG9hZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZXMgPSBjdXJyZW50VXBsb2FkLmZpbGVJRHNcbiAgICAgICAgLm1hcCgoZmlsZUlEKSA9PiB0aGlzLmdldEZpbGUoZmlsZUlEKSlcbiAgICAgIGNvbnN0IHN1Y2Nlc3NmdWwgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+ICFmaWxlLmVycm9yKVxuICAgICAgY29uc3QgZmFpbGVkID0gZmlsZXMuZmlsdGVyKChmaWxlKSA9PiBmaWxlLmVycm9yKVxuICAgICAgdGhpcy5hZGRSZXN1bHREYXRhKHVwbG9hZElELCB7IHN1Y2Nlc3NmdWwsIGZhaWxlZCwgdXBsb2FkSUQgfSlcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIC8vIEVtaXQgY29tcGxldGlvbiBldmVudHMuXG4gICAgICAvLyBUaGlzIGlzIGluIGEgc2VwYXJhdGUgZnVuY3Rpb24gc28gdGhhdCB0aGUgYGN1cnJlbnRVcGxvYWRzYCB2YXJpYWJsZVxuICAgICAgLy8gYWx3YXlzIHJlZmVycyB0byB0aGUgbGF0ZXN0IHN0YXRlLiBJbiB0aGUgaGFuZGxlciByaWdodCBhYm92ZSBpdCByZWZlcnNcbiAgICAgIC8vIHRvIGFuIG91dGRhdGVkIG9iamVjdCB3aXRob3V0IHRoZSBgLnJlc3VsdGAgcHJvcGVydHkuXG4gICAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICAgIGlmICghY3VycmVudFVwbG9hZHNbdXBsb2FkSURdKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgY3VycmVudFVwbG9hZCA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgICAgY29uc3QgcmVzdWx0ID0gY3VycmVudFVwbG9hZC5yZXN1bHRcbiAgICAgIHRoaXMuZW1pdCgnY29tcGxldGUnLCByZXN1bHQpXG5cbiAgICAgIHRoaXMuX3JlbW92ZVVwbG9hZCh1cGxvYWRJRClcblxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyByZXN1bHQgZm9yIGFuIHVwbG9hZCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7dXBsb2FkSUR9YClcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGFuIHVwbG9hZCBmb3IgYWxsIHRoZSBmaWxlcyB0aGF0IGFyZSBub3QgY3VycmVudGx5IGJlaW5nIHVwbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgdXBsb2FkICgpIHtcbiAgICBpZiAoIXRoaXMucGx1Z2lucy51cGxvYWRlcikge1xuICAgICAgdGhpcy5sb2coJ05vIHVwbG9hZGVyIHR5cGUgcGx1Z2lucyBhcmUgdXNlZCcsICd3YXJuaW5nJylcbiAgICB9XG5cbiAgICBsZXQgZmlsZXMgPSB0aGlzLmdldFN0YXRlKCkuZmlsZXNcbiAgICBjb25zdCBvbkJlZm9yZVVwbG9hZFJlc3VsdCA9IHRoaXMub3B0cy5vbkJlZm9yZVVwbG9hZChmaWxlcylcblxuICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vdCBzdGFydGluZyB0aGUgdXBsb2FkIGJlY2F1c2Ugb25CZWZvcmVVcGxvYWQgcmV0dXJuZWQgZmFsc2UnKSlcbiAgICB9XG5cbiAgICBpZiAob25CZWZvcmVVcGxvYWRSZXN1bHQgJiYgdHlwZW9mIG9uQmVmb3JlVXBsb2FkUmVzdWx0ID09PSAnb2JqZWN0Jykge1xuICAgICAgLy8gd2FybmluZyBhZnRlciB0aGUgY2hhbmdlIGluIDAuMjRcbiAgICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdC50aGVuKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uQmVmb3JlVXBsb2FkKCkgcmV0dXJuZWQgYSBQcm9taXNlLCBidXQgdGhpcyBpcyBubyBsb25nZXIgc3VwcG9ydGVkLiBJdCBtdXN0IGJlIHN5bmNocm9ub3VzLicpXG4gICAgICB9XG5cbiAgICAgIGZpbGVzID0gb25CZWZvcmVVcGxvYWRSZXN1bHRcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuX2NoZWNrTWluTnVtYmVyT2ZGaWxlcyhmaWxlcykpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgICAgICAvLyBnZXQgYSBsaXN0IG9mIGZpbGVzIHRoYXQgYXJlIGN1cnJlbnRseSBhc3NpZ25lZCB0byB1cGxvYWRzXG4gICAgICAgIGNvbnN0IGN1cnJlbnRseVVwbG9hZGluZ0ZpbGVzID0gT2JqZWN0LmtleXMoY3VycmVudFVwbG9hZHMpLnJlZHVjZSgocHJldiwgY3VycikgPT4gcHJldi5jb25jYXQoY3VycmVudFVwbG9hZHNbY3Vycl0uZmlsZUlEcyksIFtdKVxuXG4gICAgICAgIGNvbnN0IHdhaXRpbmdGaWxlSURzID0gW11cbiAgICAgICAgT2JqZWN0LmtleXMoZmlsZXMpLmZvckVhY2goKGZpbGVJRCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmdldEZpbGUoZmlsZUlEKVxuICAgICAgICAgIC8vIGlmIHRoZSBmaWxlIGhhc24ndCBzdGFydGVkIHVwbG9hZGluZyBhbmQgaGFzbid0IGFscmVhZHkgYmVlbiBhc3NpZ25lZCB0byBhbiB1cGxvYWQuLlxuICAgICAgICAgIGlmICgoIWZpbGUucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZCkgJiYgKGN1cnJlbnRseVVwbG9hZGluZ0ZpbGVzLmluZGV4T2YoZmlsZUlEKSA9PT0gLTEpKSB7XG4gICAgICAgICAgICB3YWl0aW5nRmlsZUlEcy5wdXNoKGZpbGUuaWQpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHVwbG9hZElEID0gdGhpcy5fY3JlYXRlVXBsb2FkKHdhaXRpbmdGaWxlSURzKVxuICAgICAgICByZXR1cm4gdGhpcy5fcnVuVXBsb2FkKHVwbG9hZElEKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgZXJyID09PSAnb2JqZWN0JyA/IGVyci5tZXNzYWdlIDogZXJyXG4gICAgICAgIGNvbnN0IGRldGFpbHMgPSB0eXBlb2YgZXJyID09PSAnb2JqZWN0JyA/IGVyci5kZXRhaWxzIDogbnVsbFxuICAgICAgICB0aGlzLmxvZyhgJHttZXNzYWdlfSAke2RldGFpbHN9YClcbiAgICAgICAgdGhpcy5pbmZvKHsgbWVzc2FnZTogbWVzc2FnZSwgZGV0YWlsczogZGV0YWlscyB9LCAnZXJyb3InLCA0MDAwKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodHlwZW9mIGVyciA9PT0gJ29iamVjdCcgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSlcbiAgICAgIH0pXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0cykge1xuICByZXR1cm4gbmV3IFVwcHkob3B0cylcbn1cblxuLy8gRXhwb3NlIGNsYXNzIGNvbnN0cnVjdG9yLlxubW9kdWxlLmV4cG9ydHMuVXBweSA9IFVwcHlcbm1vZHVsZS5leHBvcnRzLlBsdWdpbiA9IFBsdWdpblxuIiwiLy8gRWRnZSAxNS54IGRvZXMgbm90IGZpcmUgJ3Byb2dyZXNzJyBldmVudHMgb24gdXBsb2Fkcy5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXMvOTQ1XG4vLyBBbmQgaHR0cHM6Ly9kZXZlbG9wZXIubWljcm9zb2Z0LmNvbS9lbi11cy9taWNyb3NvZnQtZWRnZS9wbGF0Zm9ybS9pc3N1ZXMvMTIyMjQ1MTAvXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MgKHVzZXJBZ2VudCkge1xuICAvLyBBbGxvdyBwYXNzaW5nIGluIHVzZXJBZ2VudCBmb3IgdGVzdHNcbiAgaWYgKHVzZXJBZ2VudCA9PSBudWxsKSB7XG4gICAgdXNlckFnZW50ID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IudXNlckFnZW50IDogbnVsbFxuICB9XG4gIC8vIEFzc3VtZSBpdCB3b3JrcyBiZWNhdXNlIGJhc2ljYWxseSBldmVyeXRoaW5nIHN1cHBvcnRzIHByb2dyZXNzIGV2ZW50cy5cbiAgaWYgKCF1c2VyQWdlbnQpIHJldHVybiB0cnVlXG5cbiAgY29uc3QgbSA9IC9FZGdlXFwvKFxcZCtcXC5cXGQrKS8uZXhlYyh1c2VyQWdlbnQpXG4gIGlmICghbSkgcmV0dXJuIHRydWVcblxuICBjb25zdCBlZGdlVmVyc2lvbiA9IG1bMV1cbiAgbGV0IFttYWpvciwgbWlub3JdID0gZWRnZVZlcnNpb24uc3BsaXQoJy4nKVxuICBtYWpvciA9IHBhcnNlSW50KG1ham9yLCAxMClcbiAgbWlub3IgPSBwYXJzZUludChtaW5vciwgMTApXG5cbiAgLy8gV29ya2VkIGJlZm9yZTpcbiAgLy8gRWRnZSA0MC4xNTA2My4wLjBcbiAgLy8gTWljcm9zb2Z0IEVkZ2VIVE1MIDE1LjE1MDYzXG4gIGlmIChtYWpvciA8IDE1IHx8IChtYWpvciA9PT0gMTUgJiYgbWlub3IgPCAxNTA2MykpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gRml4ZWQgaW46XG4gIC8vIE1pY3Jvc29mdCBFZGdlSFRNTCAxOC4xODIxOFxuICBpZiAobWFqb3IgPiAxOCB8fCAobWFqb3IgPT09IDE4ICYmIG1pbm9yID49IDE4MjE4KSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyBvdGhlciB2ZXJzaW9ucyBkb24ndCB3b3JrLlxuICByZXR1cm4gZmFsc2Vcbn1cbiIsImNvbnN0IHsgUGx1Z2luIH0gPSByZXF1aXJlKCdAdXBweS9jb3JlJylcbmNvbnN0IHRvQXJyYXkgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvdG9BcnJheScpXG5jb25zdCBUcmFuc2xhdG9yID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL1RyYW5zbGF0b3InKVxuY29uc3QgeyBoIH0gPSByZXF1aXJlKCdwcmVhY3QnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZpbGVJbnB1dCBleHRlbmRzIFBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgc3VwZXIodXBweSwgb3B0cylcbiAgICB0aGlzLmlkID0gdGhpcy5vcHRzLmlkIHx8ICdGaWxlSW5wdXQnXG4gICAgdGhpcy50aXRsZSA9ICdGaWxlIElucHV0J1xuICAgIHRoaXMudHlwZSA9ICdhY3F1aXJlcidcblxuICAgIHRoaXMuZGVmYXVsdExvY2FsZSA9IHtcbiAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgY2hvb3NlRmlsZXM6ICdDaG9vc2UgZmlsZXMnXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICB0YXJnZXQ6IG51bGwsXG4gICAgICBwcmV0dHk6IHRydWUsXG4gICAgICBpbnB1dE5hbWU6ICdmaWxlc1tdJ1xuICAgIH1cblxuICAgIC8vIE1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdHMpXG5cbiAgICAvLyBpMThuXG4gICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3IoWyB0aGlzLmRlZmF1bHRMb2NhbGUsIHRoaXMudXBweS5sb2NhbGUsIHRoaXMub3B0cy5sb2NhbGUgXSlcbiAgICB0aGlzLmkxOG4gPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodGhpcy50cmFuc2xhdG9yKVxuICAgIHRoaXMuaTE4bkFycmF5ID0gdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZUFycmF5LmJpbmQodGhpcy50cmFuc2xhdG9yKVxuXG4gICAgdGhpcy5yZW5kZXIgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVJbnB1dENoYW5nZSA9IHRoaXMuaGFuZGxlSW5wdXRDaGFuZ2UuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlQ2xpY2sgPSB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcylcbiAgfVxuXG4gIGhhbmRsZUlucHV0Q2hhbmdlIChldikge1xuICAgIHRoaXMudXBweS5sb2coJ1tGaWxlSW5wdXRdIFNvbWV0aGluZyBzZWxlY3RlZCB0aHJvdWdoIGlucHV0Li4uJylcblxuICAgIGNvbnN0IGZpbGVzID0gdG9BcnJheShldi50YXJnZXQuZmlsZXMpXG5cbiAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnVwcHkuYWRkRmlsZSh7XG4gICAgICAgICAgc291cmNlOiB0aGlzLmlkLFxuICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcbiAgICAgICAgICB0eXBlOiBmaWxlLnR5cGUsXG4gICAgICAgICAgZGF0YTogZmlsZVxuICAgICAgICB9KVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIE5vdGhpbmcsIHJlc3RyaWN0aW9uIGVycm9ycyBoYW5kbGVkIGluIENvcmVcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaGFuZGxlQ2xpY2sgKGV2KSB7XG4gICAgdGhpcy5pbnB1dC5jbGljaygpXG4gIH1cblxuICByZW5kZXIgKHN0YXRlKSB7XG4gICAgLyogaHR0cDovL3R5bXBhbnVzLm5ldC9jb2Ryb3BzLzIwMTUvMDkvMTUvc3R5bGluZy1jdXN0b21pemluZy1maWxlLWlucHV0cy1zbWFydC13YXkvICovXG4gICAgY29uc3QgaGlkZGVuSW5wdXRTdHlsZSA9IHtcbiAgICAgIHdpZHRoOiAnMC4xcHgnLFxuICAgICAgaGVpZ2h0OiAnMC4xcHgnLFxuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgekluZGV4OiAtMVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3RyaWN0aW9ucyA9IHRoaXMudXBweS5vcHRzLnJlc3RyaWN0aW9uc1xuICAgIGNvbnN0IGFjY2VwdCA9IHJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzID8gcmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMuam9pbignLCcpIDogbnVsbFxuXG4gICAgLy8gZW1wdHkgdmFsdWU9XCJcIiBvbiBmaWxlIGlucHV0LCBzbyB0aGF0IHRoZSBpbnB1dCBpcyBjbGVhcmVkIGFmdGVyIGEgZmlsZSBpcyBzZWxlY3RlZCxcbiAgICAvLyBiZWNhdXNlIFVwcHkgd2lsbCBiZSBoYW5kbGluZyB0aGUgdXBsb2FkIGFuZCBzbyB3ZSBjYW4gc2VsZWN0IHNhbWUgZmlsZVxuICAgIC8vIGFmdGVyIHJlbW92aW5nIOKAlCBvdGhlcndpc2UgYnJvd3NlciB0aGlua3MgaXTigJlzIGFscmVhZHkgc2VsZWN0ZWRcbiAgICByZXR1cm4gPGRpdiBjbGFzcz1cInVwcHktUm9vdCB1cHB5LUZpbGVJbnB1dC1jb250YWluZXJcIj5cbiAgICAgIDxpbnB1dCBjbGFzcz1cInVwcHktRmlsZUlucHV0LWlucHV0XCJcbiAgICAgICAgc3R5bGU9e3RoaXMub3B0cy5wcmV0dHkgJiYgaGlkZGVuSW5wdXRTdHlsZX1cbiAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICBuYW1lPXt0aGlzLm9wdHMuaW5wdXROYW1lfVxuICAgICAgICBvbmNoYW5nZT17dGhpcy5oYW5kbGVJbnB1dENoYW5nZX1cbiAgICAgICAgbXVsdGlwbGU9e3Jlc3RyaWN0aW9ucy5tYXhOdW1iZXJPZkZpbGVzICE9PSAxfVxuICAgICAgICBhY2NlcHQ9e2FjY2VwdH1cbiAgICAgICAgcmVmPXsoaW5wdXQpID0+IHsgdGhpcy5pbnB1dCA9IGlucHV0IH19XG4gICAgICAgIHZhbHVlPVwiXCIgLz5cbiAgICAgIHt0aGlzLm9wdHMucHJldHR5ICYmXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJ1cHB5LUZpbGVJbnB1dC1idG5cIiB0eXBlPVwiYnV0dG9uXCIgb25jbGljaz17dGhpcy5oYW5kbGVDbGlja30+XG4gICAgICAgICAge3RoaXMuaTE4bignY2hvb3NlRmlsZXMnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICB9XG4gICAgPC9kaXY+XG4gIH1cblxuICBpbnN0YWxsICgpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm9wdHMudGFyZ2V0XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5tb3VudCh0YXJnZXQsIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgdW5pbnN0YWxsICgpIHtcbiAgICB0aGlzLnVubW91bnQoKVxuICB9XG59XG4iLCJjb25zdCB7IFBsdWdpbiB9ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCB7IGggfSA9IHJlcXVpcmUoJ3ByZWFjdCcpXG5cbi8qKlxuICogUHJvZ3Jlc3MgYmFyXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFByb2dyZXNzQmFyIGV4dGVuZHMgUGx1Z2luIHtcbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMuaWQgPSB0aGlzLm9wdHMuaWQgfHwgJ1Byb2dyZXNzQmFyJ1xuICAgIHRoaXMudGl0bGUgPSAnUHJvZ3Jlc3MgQmFyJ1xuICAgIHRoaXMudHlwZSA9ICdwcm9ncmVzc2luZGljYXRvcidcblxuICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIHRhcmdldDogJ2JvZHknLFxuICAgICAgcmVwbGFjZVRhcmdldENvbnRlbnQ6IGZhbHNlLFxuICAgICAgZml4ZWQ6IGZhbHNlLFxuICAgICAgaGlkZUFmdGVyRmluaXNoOiB0cnVlXG4gICAgfVxuXG4gICAgLy8gbWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXJcbiAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cylcblxuICAgIHRoaXMucmVuZGVyID0gdGhpcy5yZW5kZXIuYmluZCh0aGlzKVxuICB9XG5cbiAgcmVuZGVyIChzdGF0ZSkge1xuICAgIGNvbnN0IHByb2dyZXNzID0gc3RhdGUudG90YWxQcm9ncmVzcyB8fCAwXG4gICAgY29uc3QgaXNIaWRkZW4gPSBwcm9ncmVzcyA9PT0gMTAwICYmIHRoaXMub3B0cy5oaWRlQWZ0ZXJGaW5pc2hcbiAgICByZXR1cm4gPGRpdiBjbGFzcz1cInVwcHkgdXBweS1Qcm9ncmVzc0JhclwiIHN0eWxlPXt7IHBvc2l0aW9uOiB0aGlzLm9wdHMuZml4ZWQgPyAnZml4ZWQnIDogJ2luaXRpYWwnIH19IGFyaWEtaGlkZGVuPXtpc0hpZGRlbn0+XG4gICAgICA8ZGl2IGNsYXNzPVwidXBweS1Qcm9ncmVzc0Jhci1pbm5lclwiIHN0eWxlPXt7IHdpZHRoOiBwcm9ncmVzcyArICclJyB9fSAvPlxuICAgICAgPGRpdiBjbGFzcz1cInVwcHktUHJvZ3Jlc3NCYXItcGVyY2VudGFnZVwiPntwcm9ncmVzc308L2Rpdj5cbiAgICA8L2Rpdj5cbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMub3B0cy50YXJnZXRcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLm1vdW50KHRhcmdldCwgdGhpcylcbiAgICB9XG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIHRoaXMudW5tb3VudCgpXG4gIH1cbn1cbiIsIi8qKlxuICogRGVmYXVsdCBzdG9yZSB0aGF0IGtlZXBzIHN0YXRlIGluIGEgc2ltcGxlIG9iamVjdC5cbiAqL1xuY2xhc3MgRGVmYXVsdFN0b3JlIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuc3RhdGUgPSB7fVxuICAgIHRoaXMuY2FsbGJhY2tzID0gW11cbiAgfVxuXG4gIGdldFN0YXRlICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZVxuICB9XG5cbiAgc2V0U3RhdGUgKHBhdGNoKSB7XG4gICAgY29uc3QgcHJldlN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdGF0ZSlcbiAgICBjb25zdCBuZXh0U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLCBwYXRjaClcblxuICAgIHRoaXMuc3RhdGUgPSBuZXh0U3RhdGVcbiAgICB0aGlzLl9wdWJsaXNoKHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwYXRjaClcbiAgfVxuXG4gIHN1YnNjcmliZSAobGlzdGVuZXIpIHtcbiAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGxpc3RlbmVyKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAvLyBSZW1vdmUgdGhlIGxpc3RlbmVyLlxuICAgICAgdGhpcy5jYWxsYmFja3Muc3BsaWNlKFxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGxpc3RlbmVyKSxcbiAgICAgICAgMVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIF9wdWJsaXNoICguLi5hcmdzKSB7XG4gICAgdGhpcy5jYWxsYmFja3MuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyKC4uLmFyZ3MpXG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHRTdG9yZSAoKSB7XG4gIHJldHVybiBuZXcgRGVmYXVsdFN0b3JlKClcbn1cbiIsIi8qKlxuICogVHJhbnNsYXRlcyBzdHJpbmdzIHdpdGggaW50ZXJwb2xhdGlvbiAmIHBsdXJhbGl6YXRpb24gc3VwcG9ydC5cbiAqIEV4dGVuc2libGUgd2l0aCBjdXN0b20gZGljdGlvbmFyaWVzIGFuZCBwbHVyYWxpemF0aW9uIGZ1bmN0aW9ucy5cbiAqXG4gKiBCb3Jyb3dzIGhlYXZpbHkgZnJvbSBhbmQgaW5zcGlyZWQgYnkgUG9seWdsb3QgaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcyxcbiAqIGJhc2ljYWxseSBhIHN0cmlwcGVkLWRvd24gdmVyc2lvbiBvZiBpdC4gRGlmZmVyZW5jZXM6IHBsdXJhbGl6YXRpb24gZnVuY3Rpb25zIGFyZSBub3QgaGFyZGNvZGVkXG4gKiBhbmQgY2FuIGJlIGVhc2lseSBhZGRlZCBhbW9uZyB3aXRoIGRpY3Rpb25hcmllcywgbmVzdGVkIG9iamVjdHMgYXJlIHVzZWQgZm9yIHBsdXJhbGl6YXRpb25cbiAqIGFzIG9wcG9zZWQgdG8gYHx8fHxgIGRlbGltZXRlclxuICpcbiAqIFVzYWdlIGV4YW1wbGU6IGB0cmFuc2xhdG9yLnRyYW5zbGF0ZSgnZmlsZXNfY2hvc2VuJywge3NtYXJ0X2NvdW50OiAzfSlgXG4gKlxuICogQHBhcmFtIHtvYmplY3R8QXJyYXk8b2JqZWN0Pn0gbG9jYWxlIExvY2FsZSBvciBsaXN0IG9mIGxvY2FsZXMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVHJhbnNsYXRvciB7XG4gIGNvbnN0cnVjdG9yIChsb2NhbGVzKSB7XG4gICAgdGhpcy5sb2NhbGUgPSB7XG4gICAgICBzdHJpbmdzOiB7fSxcbiAgICAgIHBsdXJhbGl6ZTogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgaWYgKG4gPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobG9jYWxlcykpIHtcbiAgICAgIGxvY2FsZXMuZm9yRWFjaCgobG9jYWxlKSA9PiB0aGlzLl9hcHBseShsb2NhbGUpKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hcHBseShsb2NhbGVzKVxuICAgIH1cbiAgfVxuXG4gIF9hcHBseSAobG9jYWxlKSB7XG4gICAgaWYgKCFsb2NhbGUgfHwgIWxvY2FsZS5zdHJpbmdzKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBwcmV2TG9jYWxlID0gdGhpcy5sb2NhbGVcbiAgICB0aGlzLmxvY2FsZSA9IE9iamVjdC5hc3NpZ24oe30sIHByZXZMb2NhbGUsIHtcbiAgICAgIHN0cmluZ3M6IE9iamVjdC5hc3NpZ24oe30sIHByZXZMb2NhbGUuc3RyaW5ncywgbG9jYWxlLnN0cmluZ3MpXG4gICAgfSlcbiAgICB0aGlzLmxvY2FsZS5wbHVyYWxpemUgPSBsb2NhbGUucGx1cmFsaXplIHx8IHByZXZMb2NhbGUucGx1cmFsaXplXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSBzdHJpbmcgd2l0aCBwbGFjZWhvbGRlciB2YXJpYWJsZXMgbGlrZSBgJXtzbWFydF9jb3VudH0gZmlsZSBzZWxlY3RlZGBcbiAgICogYW5kIHJlcGxhY2VzIGl0IHdpdGggdmFsdWVzIGZyb20gb3B0aW9ucyBge3NtYXJ0X2NvdW50OiA1fWBcbiAgICpcbiAgICogQGxpY2Vuc2UgaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gICAqIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcy9ibG9iL21hc3Rlci9saWIvcG9seWdsb3QuanMjTDI5OVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlIHRoYXQgbmVlZHMgaW50ZXJwb2xhdGlvbiwgd2l0aCBwbGFjZWhvbGRlcnNcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgd2l0aCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnNcbiAgICogQHJldHVybiB7c3RyaW5nfSBpbnRlcnBvbGF0ZWRcbiAgICovXG4gIGludGVycG9sYXRlIChwaHJhc2UsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IHNwbGl0LCByZXBsYWNlIH0gPSBTdHJpbmcucHJvdG90eXBlXG4gICAgY29uc3QgZG9sbGFyUmVnZXggPSAvXFwkL2dcbiAgICBjb25zdCBkb2xsYXJCaWxsc1lhbGwgPSAnJCQkJCdcbiAgICBsZXQgaW50ZXJwb2xhdGVkID0gW3BocmFzZV1cblxuICAgIGZvciAobGV0IGFyZyBpbiBvcHRpb25zKSB7XG4gICAgICBpZiAoYXJnICE9PSAnXycgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShhcmcpKSB7XG4gICAgICAgIC8vIEVuc3VyZSByZXBsYWNlbWVudCB2YWx1ZSBpcyBlc2NhcGVkIHRvIHByZXZlbnQgc3BlY2lhbCAkLXByZWZpeGVkXG4gICAgICAgIC8vIHJlZ2V4IHJlcGxhY2UgdG9rZW5zLiB0aGUgXCIkJCQkXCIgaXMgbmVlZGVkIGJlY2F1c2UgZWFjaCBcIiRcIiBuZWVkcyB0b1xuICAgICAgICAvLyBiZSBlc2NhcGVkIHdpdGggXCIkXCIgaXRzZWxmLCBhbmQgd2UgbmVlZCB0d28gaW4gdGhlIHJlc3VsdGluZyBvdXRwdXQuXG4gICAgICAgIHZhciByZXBsYWNlbWVudCA9IG9wdGlvbnNbYXJnXVxuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJlcGxhY2VtZW50ID0gcmVwbGFjZS5jYWxsKG9wdGlvbnNbYXJnXSwgZG9sbGFyUmVnZXgsIGRvbGxhckJpbGxzWWFsbClcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBjcmVhdGUgYSBuZXcgYFJlZ0V4cGAgZWFjaCB0aW1lIGluc3RlYWQgb2YgdXNpbmcgYSBtb3JlLWVmZmljaWVudFxuICAgICAgICAvLyBzdHJpbmcgcmVwbGFjZSBzbyB0aGF0IHRoZSBzYW1lIGFyZ3VtZW50IGNhbiBiZSByZXBsYWNlZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICAvLyBpbiB0aGUgc2FtZSBwaHJhc2UuXG4gICAgICAgIGludGVycG9sYXRlZCA9IGluc2VydFJlcGxhY2VtZW50KGludGVycG9sYXRlZCwgbmV3IFJlZ0V4cCgnJVxcXFx7JyArIGFyZyArICdcXFxcfScsICdnJyksIHJlcGxhY2VtZW50KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbnRlcnBvbGF0ZWRcblxuICAgIGZ1bmN0aW9uIGluc2VydFJlcGxhY2VtZW50IChzb3VyY2UsIHJ4LCByZXBsYWNlbWVudCkge1xuICAgICAgY29uc3QgbmV3UGFydHMgPSBbXVxuICAgICAgc291cmNlLmZvckVhY2goKGNodW5rKSA9PiB7XG4gICAgICAgIHNwbGl0LmNhbGwoY2h1bmssIHJ4KS5mb3JFYWNoKChyYXcsIGksIGxpc3QpID0+IHtcbiAgICAgICAgICBpZiAocmF3ICE9PSAnJykge1xuICAgICAgICAgICAgbmV3UGFydHMucHVzaChyYXcpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSW50ZXJsYWNlIHdpdGggdGhlIGByZXBsYWNlbWVudGAgdmFsdWVcbiAgICAgICAgICBpZiAoaSA8IGxpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgbmV3UGFydHMucHVzaChyZXBsYWNlbWVudClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuIG5ld1BhcnRzXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpYyB0cmFuc2xhdGUgbWV0aG9kXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgd2l0aCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHVzZWQgbGF0ZXIgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnMgaW4gc3RyaW5nXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdHJhbnNsYXRlZCAoYW5kIGludGVycG9sYXRlZClcbiAgICovXG4gIHRyYW5zbGF0ZSAoa2V5LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlQXJyYXkoa2V5LCBvcHRpb25zKS5qb2luKCcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHRyYW5zbGF0aW9uIGFuZCByZXR1cm4gdGhlIHRyYW5zbGF0ZWQgYW5kIGludGVycG9sYXRlZCBwYXJ0cyBhcyBhbiBhcnJheS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVyc1xuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIHRyYW5zbGF0ZWQgYW5kIGludGVycG9sYXRlZCBwYXJ0cywgaW4gb3JkZXIuXG4gICAqL1xuICB0cmFuc2xhdGVBcnJheSAoa2V5LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMuc21hcnRfY291bnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgcGx1cmFsID0gdGhpcy5sb2NhbGUucGx1cmFsaXplKG9wdGlvbnMuc21hcnRfY291bnQpXG4gICAgICByZXR1cm4gdGhpcy5pbnRlcnBvbGF0ZSh0aGlzLmxvY2FsZS5zdHJpbmdzW2tleV1bcGx1cmFsXSwgb3B0aW9ucylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbnRlcnBvbGF0ZSh0aGlzLmxvY2FsZS5zdHJpbmdzW2tleV0sIG9wdGlvbnMpXG4gIH1cbn1cbiIsImNvbnN0IHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJylcblxuZnVuY3Rpb24gX2VtaXRTb2NrZXRQcm9ncmVzcyAodXBsb2FkZXIsIHByb2dyZXNzRGF0YSwgZmlsZSkge1xuICBjb25zdCB7IHByb2dyZXNzLCBieXRlc1VwbG9hZGVkLCBieXRlc1RvdGFsIH0gPSBwcm9ncmVzc0RhdGFcbiAgaWYgKHByb2dyZXNzKSB7XG4gICAgdXBsb2FkZXIudXBweS5sb2coYFVwbG9hZCBwcm9ncmVzczogJHtwcm9ncmVzc31gKVxuICAgIHVwbG9hZGVyLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgdXBsb2FkZXIsXG4gICAgICBieXRlc1VwbG9hZGVkOiBieXRlc1VwbG9hZGVkLFxuICAgICAgYnl0ZXNUb3RhbDogYnl0ZXNUb3RhbFxuICAgIH0pXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZShfZW1pdFNvY2tldFByb2dyZXNzLCAzMDAsIHtsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogdHJ1ZX0pXG4iLCJjb25zdCBpc0RPTUVsZW1lbnQgPSByZXF1aXJlKCcuL2lzRE9NRWxlbWVudCcpXG5cbi8qKlxuICogRmluZCBhIERPTSBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7Tm9kZXxzdHJpbmd9IGVsZW1lbnRcbiAqIEByZXR1cm4ge05vZGV8bnVsbH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaW5kRE9NRWxlbWVudCAoZWxlbWVudCwgY29udGV4dCA9IGRvY3VtZW50KSB7XG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpXG4gIH1cblxuICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdvYmplY3QnICYmIGlzRE9NRWxlbWVudChlbGVtZW50KSkge1xuICAgIHJldHVybiBlbGVtZW50XG4gIH1cbn1cbiIsIi8qKlxuICogVGFrZXMgYSBmaWxlIG9iamVjdCBhbmQgdHVybnMgaXQgaW50byBmaWxlSUQsIGJ5IGNvbnZlcnRpbmcgZmlsZS5uYW1lIHRvIGxvd2VyY2FzZSxcbiAqIHJlbW92aW5nIGV4dHJhIGNoYXJhY3RlcnMgYW5kIGFkZGluZyB0eXBlLCBzaXplIGFuZCBsYXN0TW9kaWZpZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZmlsZVxuICogQHJldHVybiB7U3RyaW5nfSB0aGUgZmlsZUlEXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdlbmVyYXRlRmlsZUlEIChmaWxlKSB7XG4gIC8vIGZpbHRlciBpcyBuZWVkZWQgdG8gbm90IGpvaW4gZW1wdHkgdmFsdWVzIHdpdGggYC1gXG4gIHJldHVybiBbXG4gICAgJ3VwcHknLFxuICAgIGZpbGUubmFtZSA/IGZpbGUubmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teQS1aMC05XS9pZywgJycpIDogJycsXG4gICAgZmlsZS50eXBlLFxuICAgIGZpbGUuZGF0YS5zaXplLFxuICAgIGZpbGUuZGF0YS5sYXN0TW9kaWZpZWRcbiAgXS5maWx0ZXIodmFsID0+IHZhbCkuam9pbignLScpXG59XG4iLCIvKipcbiogVGFrZXMgYSBmdWxsIGZpbGVuYW1lIHN0cmluZyBhbmQgcmV0dXJucyBhbiBvYmplY3Qge25hbWUsIGV4dGVuc2lvbn1cbipcbiogQHBhcmFtIHtzdHJpbmd9IGZ1bGxGaWxlTmFtZVxuKiBAcmV0dXJuIHtvYmplY3R9IHtuYW1lLCBleHRlbnNpb259XG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbiAoZnVsbEZpbGVOYW1lKSB7XG4gIHZhciByZSA9IC8oPzpcXC4oW14uXSspKT8kL1xuICB2YXIgZmlsZUV4dCA9IHJlLmV4ZWMoZnVsbEZpbGVOYW1lKVsxXVxuICB2YXIgZmlsZU5hbWUgPSBmdWxsRmlsZU5hbWUucmVwbGFjZSgnLicgKyBmaWxlRXh0LCAnJylcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBmaWxlTmFtZSxcbiAgICBleHRlbnNpb246IGZpbGVFeHRcbiAgfVxufVxuIiwiY29uc3QgZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24gPSByZXF1aXJlKCcuL2dldEZpbGVOYW1lQW5kRXh0ZW5zaW9uJylcbmNvbnN0IG1pbWVUeXBlcyA9IHJlcXVpcmUoJy4vbWltZVR5cGVzJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRGaWxlVHlwZSAoZmlsZSkge1xuICBsZXQgZmlsZUV4dGVuc2lvbiA9IGZpbGUubmFtZSA/IGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uKGZpbGUubmFtZSkuZXh0ZW5zaW9uIDogbnVsbFxuICBmaWxlRXh0ZW5zaW9uID0gZmlsZUV4dGVuc2lvbiA/IGZpbGVFeHRlbnNpb24udG9Mb3dlckNhc2UoKSA6IG51bGxcblxuICBpZiAoZmlsZS5pc1JlbW90ZSkge1xuICAgIC8vIHNvbWUgcmVtb3RlIHByb3ZpZGVycyBkbyBub3Qgc3VwcG9ydCBmaWxlIHR5cGVzXG4gICAgcmV0dXJuIGZpbGUudHlwZSA/IGZpbGUudHlwZSA6IG1pbWVUeXBlc1tmaWxlRXh0ZW5zaW9uXVxuICB9XG5cbiAgLy8gY2hlY2sgaWYgbWltZSB0eXBlIGlzIHNldCBpbiB0aGUgZmlsZSBvYmplY3RcbiAgaWYgKGZpbGUudHlwZSkge1xuICAgIHJldHVybiBmaWxlLnR5cGVcbiAgfVxuXG4gIC8vIHNlZSBpZiB3ZSBjYW4gbWFwIGV4dGVuc2lvbiB0byBhIG1pbWUgdHlwZVxuICBpZiAoZmlsZUV4dGVuc2lvbiAmJiBtaW1lVHlwZXNbZmlsZUV4dGVuc2lvbl0pIHtcbiAgICByZXR1cm4gbWltZVR5cGVzW2ZpbGVFeHRlbnNpb25dXG4gIH1cblxuICAvLyBpZiBhbGwgZmFpbHMsIGZhbGwgYmFjayB0byBhIGdlbmVyaWMgYnl0ZSBzdHJlYW0gdHlwZVxuICByZXR1cm4gJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSdcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0U29ja2V0SG9zdCAodXJsKSB7XG4gIC8vIGdldCB0aGUgaG9zdCBkb21haW5cbiAgdmFyIHJlZ2V4ID0gL14oPzpodHRwcz86XFwvXFwvfFxcL1xcLyk/KD86W15AXFxuXStAKT8oPzp3d3dcXC4pPyhbXlxcbl0rKS9pXG4gIHZhciBob3N0ID0gcmVnZXguZXhlYyh1cmwpWzFdXG4gIHZhciBzb2NrZXRQcm90b2NvbCA9IC9eaHR0cDpcXC9cXC8vaS50ZXN0KHVybCkgPyAnd3MnIDogJ3dzcydcblxuICByZXR1cm4gYCR7c29ja2V0UHJvdG9jb2x9Oi8vJHtob3N0fWBcbn1cbiIsIi8qKlxuICogUmV0dXJucyBhIHRpbWVzdGFtcCBpbiB0aGUgZm9ybWF0IG9mIGBob3VyczptaW51dGVzOnNlY29uZHNgXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRUaW1lU3RhbXAgKCkge1xuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKClcbiAgdmFyIGhvdXJzID0gcGFkKGRhdGUuZ2V0SG91cnMoKS50b1N0cmluZygpKVxuICB2YXIgbWludXRlcyA9IHBhZChkYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpKVxuICB2YXIgc2Vjb25kcyA9IHBhZChkYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygpKVxuICByZXR1cm4gaG91cnMgKyAnOicgKyBtaW51dGVzICsgJzonICsgc2Vjb25kc1xufVxuXG4vKipcbiAqIEFkZHMgemVybyB0byBzdHJpbmdzIHNob3J0ZXIgdGhhbiB0d28gY2hhcmFjdGVyc1xuKi9cbmZ1bmN0aW9uIHBhZCAoc3RyKSB7XG4gIHJldHVybiBzdHIubGVuZ3RoICE9PSAyID8gMCArIHN0ciA6IHN0clxufVxuIiwiLyoqXG4gKiBDaGVjayBpZiBhbiBvYmplY3QgaXMgYSBET00gZWxlbWVudC4gRHVjay10eXBpbmcgYmFzZWQgb24gYG5vZGVUeXBlYC5cbiAqXG4gKiBAcGFyYW0geyp9IG9ialxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzRE9NRWxlbWVudCAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgb2JqLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERVxufVxuIiwiLyoqXG4gKiBMaW1pdCB0aGUgYW1vdW50IG9mIHNpbXVsdGFuZW91c2x5IHBlbmRpbmcgUHJvbWlzZXMuXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBwYXNzZWQgYSBmdW5jdGlvbiBgZm5gLFxuICogd2lsbCBtYWtlIHN1cmUgdGhhdCBhdCBtb3N0IGBsaW1pdGAgY2FsbHMgdG8gYGZuYCBhcmUgcGVuZGluZy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbGltaXRcbiAqIEByZXR1cm4ge2Z1bmN0aW9uKCl9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGltaXRQcm9taXNlcyAobGltaXQpIHtcbiAgbGV0IHBlbmRpbmcgPSAwXG4gIGNvbnN0IHF1ZXVlID0gW11cbiAgcmV0dXJuIChmbikgPT4ge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgY29uc3QgY2FsbCA9ICgpID0+IHtcbiAgICAgICAgcGVuZGluZysrXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBmbiguLi5hcmdzKVxuICAgICAgICBwcm9taXNlLnRoZW4ob25maW5pc2gsIG9uZmluaXNoKVxuICAgICAgICByZXR1cm4gcHJvbWlzZVxuICAgICAgfVxuXG4gICAgICBpZiAocGVuZGluZyA+PSBsaW1pdCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHF1ZXVlLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgY2FsbCgpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gY2FsbCgpXG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG9uZmluaXNoICgpIHtcbiAgICBwZW5kaW5nLS1cbiAgICBjb25zdCBuZXh0ID0gcXVldWUuc2hpZnQoKVxuICAgIGlmIChuZXh0KSBuZXh0KClcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdtZCc6ICd0ZXh0L21hcmtkb3duJyxcbiAgJ21hcmtkb3duJzogJ3RleHQvbWFya2Rvd24nLFxuICAnbXA0JzogJ3ZpZGVvL21wNCcsXG4gICdtcDMnOiAnYXVkaW8vbXAzJyxcbiAgJ3N2Zyc6ICdpbWFnZS9zdmcreG1sJyxcbiAgJ2pwZyc6ICdpbWFnZS9qcGVnJyxcbiAgJ3BuZyc6ICdpbWFnZS9wbmcnLFxuICAnZ2lmJzogJ2ltYWdlL2dpZicsXG4gICd5YW1sJzogJ3RleHQveWFtbCcsXG4gICd5bWwnOiAndGV4dC95YW1sJyxcbiAgJ2Nzdic6ICd0ZXh0L2NzdicsXG4gICdhdmknOiAndmlkZW8veC1tc3ZpZGVvJyxcbiAgJ21rcyc6ICd2aWRlby94LW1hdHJvc2thJyxcbiAgJ21rdic6ICd2aWRlby94LW1hdHJvc2thJyxcbiAgJ21vdic6ICd2aWRlby9xdWlja3RpbWUnLFxuICAnZG9jJzogJ2FwcGxpY2F0aW9uL21zd29yZCcsXG4gICdkb2NtJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLmRvY3VtZW50Lm1hY3JvZW5hYmxlZC4xMicsXG4gICdkb2N4JzogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50JyxcbiAgJ2RvdCc6ICdhcHBsaWNhdGlvbi9tc3dvcmQnLFxuICAnZG90bSc6ICdhcHBsaWNhdGlvbi92bmQubXMtd29yZC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTInLFxuICAnZG90eCc6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC50ZW1wbGF0ZScsXG4gICd4bGEnOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgJ3hsYW0nOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLmFkZGluLm1hY3JvZW5hYmxlZC4xMicsXG4gICd4bGMnOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgJ3hsZic6ICdhcHBsaWNhdGlvbi94LXhsaWZmK3htbCcsXG4gICd4bG0nOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgJ3hscyc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGxzYic6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQuYmluYXJ5Lm1hY3JvZW5hYmxlZC4xMicsXG4gICd4bHNtJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5tYWNyb2VuYWJsZWQuMTInLFxuICAneGxzeCc6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldCcsXG4gICd4bHQnOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgJ3hsdG0nOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMicsXG4gICd4bHR4JzogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnRlbXBsYXRlJyxcbiAgJ3hsdyc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZSAocHJvbWlzZXMpIHtcbiAgY29uc3QgcmVzb2x1dGlvbnMgPSBbXVxuICBjb25zdCByZWplY3Rpb25zID0gW11cbiAgZnVuY3Rpb24gcmVzb2x2ZWQgKHZhbHVlKSB7XG4gICAgcmVzb2x1dGlvbnMucHVzaCh2YWx1ZSlcbiAgfVxuICBmdW5jdGlvbiByZWplY3RlZCAoZXJyb3IpIHtcbiAgICByZWplY3Rpb25zLnB1c2goZXJyb3IpXG4gIH1cblxuICBjb25zdCB3YWl0ID0gUHJvbWlzZS5hbGwoXG4gICAgcHJvbWlzZXMubWFwKChwcm9taXNlKSA9PiBwcm9taXNlLnRoZW4ocmVzb2x2ZWQsIHJlamVjdGVkKSlcbiAgKVxuXG4gIHJldHVybiB3YWl0LnRoZW4oKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzZnVsOiByZXNvbHV0aW9ucyxcbiAgICAgIGZhaWxlZDogcmVqZWN0aW9uc1xuICAgIH1cbiAgfSlcbn1cbiIsIi8qKlxuICogQ29udmVydHMgbGlzdCBpbnRvIGFycmF5XG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0FycmF5IChsaXN0KSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChsaXN0IHx8IFtdLCAwKVxufVxuIiwiY29uc3QgeyBQbHVnaW4gfSA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUnKVxuY29uc3QgY3VpZCA9IHJlcXVpcmUoJ2N1aWQnKVxuY29uc3QgVHJhbnNsYXRvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9UcmFuc2xhdG9yJylcbmNvbnN0IHsgUHJvdmlkZXIsIFJlcXVlc3RDbGllbnQsIFNvY2tldCB9ID0gcmVxdWlyZSgnQHVwcHkvY29tcGFuaW9uLWNsaWVudCcpXG5jb25zdCBlbWl0U29ja2V0UHJvZ3Jlc3MgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZW1pdFNvY2tldFByb2dyZXNzJylcbmNvbnN0IGdldFNvY2tldEhvc3QgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0U29ja2V0SG9zdCcpXG5jb25zdCBzZXR0bGUgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvc2V0dGxlJylcbmNvbnN0IGxpbWl0UHJvbWlzZXMgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvbGltaXRQcm9taXNlcycpXG5cbmZ1bmN0aW9uIGJ1aWxkUmVzcG9uc2VFcnJvciAoeGhyLCBlcnJvcikge1xuICAvLyBObyBlcnJvciBtZXNzYWdlXG4gIGlmICghZXJyb3IpIGVycm9yID0gbmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKVxuICAvLyBHb3QgYW4gZXJyb3IgbWVzc2FnZSBzdHJpbmdcbiAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIGVycm9yID0gbmV3IEVycm9yKGVycm9yKVxuICAvLyBHb3Qgc29tZXRoaW5nIGVsc2VcbiAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikpIHtcbiAgICBlcnJvciA9IE9iamVjdC5hc3NpZ24obmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKSwgeyBkYXRhOiBlcnJvciB9KVxuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHhoclxuICByZXR1cm4gZXJyb3Jcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBYSFJVcGxvYWQgZXh0ZW5kcyBQbHVnaW4ge1xuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy50eXBlID0gJ3VwbG9hZGVyJ1xuICAgIHRoaXMuaWQgPSAnWEhSVXBsb2FkJ1xuICAgIHRoaXMudGl0bGUgPSAnWEhSVXBsb2FkJ1xuXG4gICAgdGhpcy5kZWZhdWx0TG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge1xuICAgICAgICB0aW1lZE91dDogJ1VwbG9hZCBzdGFsbGVkIGZvciAle3NlY29uZHN9IHNlY29uZHMsIGFib3J0aW5nLidcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGZvcm1EYXRhOiB0cnVlLFxuICAgICAgZmllbGROYW1lOiAnZmlsZXNbXScsXG4gICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgIG1ldGFGaWVsZHM6IG51bGwsXG4gICAgICByZXNwb25zZVVybEZpZWxkTmFtZTogJ3VybCcsXG4gICAgICBidW5kbGU6IGZhbHNlLFxuICAgICAgaGVhZGVyczoge30sXG4gICAgICB0aW1lb3V0OiAzMCAqIDEwMDAsXG4gICAgICBsaW1pdDogMCxcbiAgICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gICAgICByZXNwb25zZVR5cGU6ICcnLFxuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZWRlZiByZXNwT2JqXG4gICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gcmVzcG9uc2VUZXh0XG4gICAgICAgKiBAcHJvcGVydHkge251bWJlcn0gc3RhdHVzXG4gICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdHVzVGV4dFxuICAgICAgICogQHByb3BlcnR5IHtPYmplY3QuPHN0cmluZywgc3RyaW5nPn0gaGVhZGVyc1xuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXNwb25zZVRleHQgdGhlIHJlc3BvbnNlIGJvZHkgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0IHwgcmVzcE9ian0gcmVzcG9uc2UgdGhlIHJlc3BvbnNlIG9iamVjdCAoWEhSIG9yIHNpbWlsYXIpXG4gICAgICAgKi9cbiAgICAgIGdldFJlc3BvbnNlRGF0YSAocmVzcG9uc2VUZXh0LCByZXNwb25zZSkge1xuICAgICAgICBsZXQgcGFyc2VkUmVzcG9uc2UgPSB7fVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhcnNlZFJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZWRSZXNwb25zZVxuICAgICAgfSxcbiAgICAgIC8qKlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXNwb25zZVRleHQgdGhlIHJlc3BvbnNlIGJvZHkgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0IHwgcmVzcE9ian0gcmVzcG9uc2UgdGhlIHJlc3BvbnNlIG9iamVjdCAoWEhSIG9yIHNpbWlsYXIpXG4gICAgICAgKi9cbiAgICAgIGdldFJlc3BvbnNlRXJyb3IgKHJlc3BvbnNlVGV4dCwgcmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignVXBsb2FkIGVycm9yJylcbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGF0dXMgdGhlIHJlc3BvbnNlIHN0YXR1cyBjb2RlXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzcG9uc2VUZXh0IHRoZSByZXNwb25zZSBib2R5IHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdCB8IHJlc3BPYmp9IHJlc3BvbnNlIHRoZSByZXNwb25zZSBvYmplY3QgKFhIUiBvciBzaW1pbGFyKVxuICAgICAgICovXG4gICAgICB2YWxpZGF0ZVN0YXR1cyAoc3RhdHVzLCByZXNwb25zZVRleHQsIHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdHMpXG5cbiAgICAvLyBpMThuXG4gICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3IoWyB0aGlzLmRlZmF1bHRMb2NhbGUsIHRoaXMudXBweS5sb2NhbGUsIHRoaXMub3B0cy5sb2NhbGUgXSlcbiAgICB0aGlzLmkxOG4gPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodGhpcy50cmFuc2xhdG9yKVxuICAgIHRoaXMuaTE4bkFycmF5ID0gdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZUFycmF5LmJpbmQodGhpcy50cmFuc2xhdG9yKVxuXG4gICAgdGhpcy5oYW5kbGVVcGxvYWQgPSB0aGlzLmhhbmRsZVVwbG9hZC5iaW5kKHRoaXMpXG5cbiAgICAvLyBTaW11bHRhbmVvdXMgdXBsb2FkIGxpbWl0aW5nIGlzIHNoYXJlZCBhY3Jvc3MgYWxsIHVwbG9hZHMgd2l0aCB0aGlzIHBsdWdpbi5cbiAgICBpZiAodHlwZW9mIHRoaXMub3B0cy5saW1pdCA9PT0gJ251bWJlcicgJiYgdGhpcy5vcHRzLmxpbWl0ICE9PSAwKSB7XG4gICAgICB0aGlzLmxpbWl0VXBsb2FkcyA9IGxpbWl0UHJvbWlzZXModGhpcy5vcHRzLmxpbWl0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpbWl0VXBsb2FkcyA9IChmbikgPT4gZm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRzLmJ1bmRsZSAmJiAhdGhpcy5vcHRzLmZvcm1EYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BvcHRzLmZvcm1EYXRhYCBtdXN0IGJlIHRydWUgd2hlbiBgb3B0cy5idW5kbGVgIGlzIGVuYWJsZWQuJylcbiAgICB9XG4gIH1cblxuICBnZXRPcHRpb25zIChmaWxlKSB7XG4gICAgY29uc3Qgb3ZlcnJpZGVzID0gdGhpcy51cHB5LmdldFN0YXRlKCkueGhyVXBsb2FkXG4gICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sXG4gICAgICB0aGlzLm9wdHMsXG4gICAgICBvdmVycmlkZXMgfHwge30sXG4gICAgICBmaWxlLnhoclVwbG9hZCB8fCB7fVxuICAgIClcbiAgICBvcHRzLmhlYWRlcnMgPSB7fVxuICAgIE9iamVjdC5hc3NpZ24ob3B0cy5oZWFkZXJzLCB0aGlzLm9wdHMuaGVhZGVycylcbiAgICBpZiAob3ZlcnJpZGVzKSB7XG4gICAgICBPYmplY3QuYXNzaWduKG9wdHMuaGVhZGVycywgb3ZlcnJpZGVzLmhlYWRlcnMpXG4gICAgfVxuICAgIGlmIChmaWxlLnhoclVwbG9hZCkge1xuICAgICAgT2JqZWN0LmFzc2lnbihvcHRzLmhlYWRlcnMsIGZpbGUueGhyVXBsb2FkLmhlYWRlcnMpXG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdHNcbiAgfVxuXG4gIC8vIEhlbHBlciB0byBhYm9ydCB1cGxvYWQgcmVxdWVzdHMgaWYgdGhlcmUgaGFzIG5vdCBiZWVuIGFueSBwcm9ncmVzcyBmb3IgYHRpbWVvdXRgIG1zLlxuICAvLyBDcmVhdGUgYW4gaW5zdGFuY2UgdXNpbmcgYHRpbWVyID0gY3JlYXRlUHJvZ3Jlc3NUaW1lb3V0KDEwMDAwLCBvblRpbWVvdXQpYFxuICAvLyBDYWxsIGB0aW1lci5wcm9ncmVzcygpYCB0byBzaWduYWwgdGhhdCB0aGVyZSBoYXMgYmVlbiBwcm9ncmVzcyBvZiBhbnkga2luZC5cbiAgLy8gQ2FsbCBgdGltZXIuZG9uZSgpYCB3aGVuIHRoZSB1cGxvYWQgaGFzIGNvbXBsZXRlZC5cbiAgY3JlYXRlUHJvZ3Jlc3NUaW1lb3V0ICh0aW1lb3V0LCB0aW1lb3V0SGFuZGxlcikge1xuICAgIGNvbnN0IHVwcHkgPSB0aGlzLnVwcHlcbiAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgIGxldCBpc0RvbmUgPSBmYWxzZVxuXG4gICAgZnVuY3Rpb24gb25UaW1lZE91dCAoKSB7XG4gICAgICB1cHB5LmxvZyhgW1hIUlVwbG9hZF0gdGltZWQgb3V0YClcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKHNlbGYuaTE4bigndGltZWRPdXQnLCB7IHNlY29uZHM6IE1hdGguY2VpbCh0aW1lb3V0IC8gMTAwMCkgfSkpXG4gICAgICB0aW1lb3V0SGFuZGxlcihlcnJvcilcbiAgICB9XG5cbiAgICBsZXQgYWxpdmVUaW1lciA9IG51bGxcbiAgICBmdW5jdGlvbiBwcm9ncmVzcyAoKSB7XG4gICAgICAvLyBTb21lIGJyb3dzZXJzIGZpcmUgYW5vdGhlciBwcm9ncmVzcyBldmVudCB3aGVuIHRoZSB1cGxvYWQgaXNcbiAgICAgIC8vIGNhbmNlbGxlZCwgc28gd2UgaGF2ZSB0byBpZ25vcmUgcHJvZ3Jlc3MgYWZ0ZXIgdGhlIHRpbWVyIHdhc1xuICAgICAgLy8gdG9sZCB0byBzdG9wLlxuICAgICAgaWYgKGlzRG9uZSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aW1lb3V0ID4gMCkge1xuICAgICAgICBpZiAoYWxpdmVUaW1lcikgY2xlYXJUaW1lb3V0KGFsaXZlVGltZXIpXG4gICAgICAgIGFsaXZlVGltZXIgPSBzZXRUaW1lb3V0KG9uVGltZWRPdXQsIHRpbWVvdXQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG9uZSAoKSB7XG4gICAgICB1cHB5LmxvZyhgW1hIUlVwbG9hZF0gdGltZXIgZG9uZWApXG4gICAgICBpZiAoYWxpdmVUaW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQoYWxpdmVUaW1lcilcbiAgICAgICAgYWxpdmVUaW1lciA9IG51bGxcbiAgICAgIH1cbiAgICAgIGlzRG9uZSA9IHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJvZ3Jlc3MsXG4gICAgICBkb25lXG4gICAgfVxuICB9XG5cbiAgY3JlYXRlRm9ybURhdGFVcGxvYWQgKGZpbGUsIG9wdHMpIHtcbiAgICBjb25zdCBmb3JtUG9zdCA9IG5ldyBGb3JtRGF0YSgpXG5cbiAgICBjb25zdCBtZXRhRmllbGRzID0gQXJyYXkuaXNBcnJheShvcHRzLm1ldGFGaWVsZHMpXG4gICAgICA/IG9wdHMubWV0YUZpZWxkc1xuICAgICAgLy8gU2VuZCBhbG9uZyBhbGwgZmllbGRzIGJ5IGRlZmF1bHQuXG4gICAgICA6IE9iamVjdC5rZXlzKGZpbGUubWV0YSlcbiAgICBtZXRhRmllbGRzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGZvcm1Qb3N0LmFwcGVuZChpdGVtLCBmaWxlLm1ldGFbaXRlbV0pXG4gICAgfSlcblxuICAgIGlmIChmaWxlLm5hbWUpIHtcbiAgICAgIGZvcm1Qb3N0LmFwcGVuZChvcHRzLmZpZWxkTmFtZSwgZmlsZS5kYXRhLCBmaWxlLm5hbWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcm1Qb3N0LmFwcGVuZChvcHRzLmZpZWxkTmFtZSwgZmlsZS5kYXRhKVxuICAgIH1cblxuICAgIHJldHVybiBmb3JtUG9zdFxuICB9XG5cbiAgY3JlYXRlQmFyZVVwbG9hZCAoZmlsZSwgb3B0cykge1xuICAgIHJldHVybiBmaWxlLmRhdGFcbiAgfVxuXG4gIHVwbG9hZCAoZmlsZSwgY3VycmVudCwgdG90YWwpIHtcbiAgICBjb25zdCBvcHRzID0gdGhpcy5nZXRPcHRpb25zKGZpbGUpXG5cbiAgICB0aGlzLnVwcHkubG9nKGB1cGxvYWRpbmcgJHtjdXJyZW50fSBvZiAke3RvdGFsfWApXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBvcHRzLmZvcm1EYXRhXG4gICAgICAgID8gdGhpcy5jcmVhdGVGb3JtRGF0YVVwbG9hZChmaWxlLCBvcHRzKVxuICAgICAgICA6IHRoaXMuY3JlYXRlQmFyZVVwbG9hZChmaWxlLCBvcHRzKVxuXG4gICAgICBjb25zdCB0aW1lciA9IHRoaXMuY3JlYXRlUHJvZ3Jlc3NUaW1lb3V0KG9wdHMudGltZW91dCwgKGVycm9yKSA9PiB7XG4gICAgICAgIHhoci5hYm9ydCgpXG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnJvcilcbiAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgY29uc3QgaWQgPSBjdWlkKClcblxuICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdsb2Fkc3RhcnQnLCAoZXYpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmxvZyhgW1hIUlVwbG9hZF0gJHtpZH0gc3RhcnRlZGApXG4gICAgICB9KVxuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgKGV2KSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coYFtYSFJVcGxvYWRdICR7aWR9IHByb2dyZXNzOiAke2V2LmxvYWRlZH0gLyAke2V2LnRvdGFsfWApXG4gICAgICAgIC8vIEJlZ2luIGNoZWNraW5nIGZvciB0aW1lb3V0cyB3aGVuIHByb2dyZXNzIHN0YXJ0cywgaW5zdGVhZCBvZiBsb2FkaW5nLFxuICAgICAgICAvLyB0byBhdm9pZCB0aW1pbmcgb3V0IHJlcXVlc3RzIG9uIGJyb3dzZXIgY29uY3VycmVuY3kgcXVldWVcbiAgICAgICAgdGltZXIucHJvZ3Jlc3MoKVxuXG4gICAgICAgIGlmIChldi5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1wcm9ncmVzcycsIGZpbGUsIHtcbiAgICAgICAgICAgIHVwbG9hZGVyOiB0aGlzLFxuICAgICAgICAgICAgYnl0ZXNVcGxvYWRlZDogZXYubG9hZGVkLFxuICAgICAgICAgICAgYnl0ZXNUb3RhbDogZXYudG90YWxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIChldikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGBbWEhSVXBsb2FkXSAke2lkfSBmaW5pc2hlZGApXG4gICAgICAgIHRpbWVyLmRvbmUoKVxuXG4gICAgICAgIGlmIChvcHRzLnZhbGlkYXRlU3RhdHVzKGV2LnRhcmdldC5zdGF0dXMsIHhoci5yZXNwb25zZVRleHQsIHhocikpIHtcbiAgICAgICAgICBjb25zdCBib2R5ID0gb3B0cy5nZXRSZXNwb25zZURhdGEoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKVxuICAgICAgICAgIGNvbnN0IHVwbG9hZFVSTCA9IGJvZHlbb3B0cy5yZXNwb25zZVVybEZpZWxkTmFtZV1cblxuICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IGV2LnRhcmdldC5zdGF0dXMsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgdXBsb2FkVVJMXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcblxuICAgICAgICAgIGlmICh1cGxvYWRVUkwpIHtcbiAgICAgICAgICAgIHRoaXMudXBweS5sb2coYERvd25sb2FkICR7ZmlsZS5uYW1lfSBmcm9tICR7ZmlsZS51cGxvYWRVUkx9YClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmaWxlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBvcHRzLmdldFJlc3BvbnNlRGF0YSh4aHIucmVzcG9uc2VUZXh0LCB4aHIpXG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBidWlsZFJlc3BvbnNlRXJyb3IoeGhyLCBvcHRzLmdldFJlc3BvbnNlRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSlcblxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgc3RhdHVzOiBldi50YXJnZXQuc3RhdHVzLFxuICAgICAgICAgICAgYm9keVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnJvciwgcmVzcG9uc2UpXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2KSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coYFtYSFJVcGxvYWRdICR7aWR9IGVycm9yZWRgKVxuICAgICAgICB0aW1lci5kb25lKClcblxuICAgICAgICBjb25zdCBlcnJvciA9IGJ1aWxkUmVzcG9uc2VFcnJvcih4aHIsIG9wdHMuZ2V0UmVzcG9uc2VFcnJvcih4aHIucmVzcG9uc2VUZXh0LCB4aHIpKVxuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICB9KVxuXG4gICAgICB4aHIub3BlbihvcHRzLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBvcHRzLmVuZHBvaW50LCB0cnVlKVxuICAgICAgLy8gSUUxMCBkb2VzIG5vdCBhbGxvdyBzZXR0aW5nIGB3aXRoQ3JlZGVudGlhbHNgIGFuZCBgcmVzcG9uc2VUeXBlYFxuICAgICAgLy8gYmVmb3JlIGBvcGVuKClgIGlzIGNhbGxlZC5cbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBvcHRzLndpdGhDcmVkZW50aWFsc1xuICAgICAgaWYgKG9wdHMucmVzcG9uc2VUeXBlICE9PSAnJykge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gb3B0cy5yZXNwb25zZVR5cGVcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXMob3B0cy5oZWFkZXJzKS5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCBvcHRzLmhlYWRlcnNbaGVhZGVyXSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKGRhdGEpXG5cbiAgICAgIHRoaXMudXBweS5vbignZmlsZS1yZW1vdmVkJywgKHJlbW92ZWRGaWxlKSA9PiB7XG4gICAgICAgIGlmIChyZW1vdmVkRmlsZS5pZCA9PT0gZmlsZS5pZCkge1xuICAgICAgICAgIHRpbWVyLmRvbmUoKVxuICAgICAgICAgIHhoci5hYm9ydCgpXG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRmlsZSByZW1vdmVkJykpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHRoaXMudXBweS5vbignY2FuY2VsLWFsbCcsICgpID0+IHtcbiAgICAgICAgdGltZXIuZG9uZSgpXG4gICAgICAgIHhoci5hYm9ydCgpXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1VwbG9hZCBjYW5jZWxsZWQnKSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHVwbG9hZFJlbW90ZSAoZmlsZSwgY3VycmVudCwgdG90YWwpIHtcbiAgICBjb25zdCBvcHRzID0gdGhpcy5nZXRPcHRpb25zKGZpbGUpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGZpZWxkcyA9IHt9XG4gICAgICBjb25zdCBtZXRhRmllbGRzID0gQXJyYXkuaXNBcnJheShvcHRzLm1ldGFGaWVsZHMpXG4gICAgICAgID8gb3B0cy5tZXRhRmllbGRzXG4gICAgICAgIC8vIFNlbmQgYWxvbmcgYWxsIGZpZWxkcyBieSBkZWZhdWx0LlxuICAgICAgICA6IE9iamVjdC5rZXlzKGZpbGUubWV0YSlcblxuICAgICAgbWV0YUZpZWxkcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGZpZWxkc1tuYW1lXSA9IGZpbGUubWV0YVtuYW1lXVxuICAgICAgfSlcblxuICAgICAgY29uc3QgQ2xpZW50ID0gZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zLnByb3ZpZGVyID8gUHJvdmlkZXIgOiBSZXF1ZXN0Q2xpZW50XG4gICAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHRoaXMudXBweSwgZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zKVxuICAgICAgY2xpZW50LnBvc3QoXG4gICAgICAgIGZpbGUucmVtb3RlLnVybCxcbiAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgZmlsZS5yZW1vdGUuYm9keSwge1xuICAgICAgICAgIGVuZHBvaW50OiBvcHRzLmVuZHBvaW50LFxuICAgICAgICAgIHNpemU6IGZpbGUuZGF0YS5zaXplLFxuICAgICAgICAgIGZpZWxkbmFtZTogb3B0cy5maWVsZE5hbWUsXG4gICAgICAgICAgbWV0YWRhdGE6IGZpZWxkcyxcbiAgICAgICAgICBoZWFkZXJzOiBvcHRzLmhlYWRlcnNcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSByZXMudG9rZW5cbiAgICAgICAgY29uc3QgaG9zdCA9IGdldFNvY2tldEhvc3QoZmlsZS5yZW1vdGUuY29tcGFuaW9uVXJsKVxuICAgICAgICBjb25zdCBzb2NrZXQgPSBuZXcgU29ja2V0KHsgdGFyZ2V0OiBgJHtob3N0fS9hcGkvJHt0b2tlbn1gIH0pXG5cbiAgICAgICAgc29ja2V0Lm9uKCdwcm9ncmVzcycsIChwcm9ncmVzc0RhdGEpID0+IGVtaXRTb2NrZXRQcm9ncmVzcyh0aGlzLCBwcm9ncmVzc0RhdGEsIGZpbGUpKVxuXG4gICAgICAgIHNvY2tldC5vbignc3VjY2VzcycsIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3QgYm9keSA9IG9wdHMuZ2V0UmVzcG9uc2VEYXRhKGRhdGEucmVzcG9uc2UucmVzcG9uc2VUZXh0LCBkYXRhLnJlc3BvbnNlKVxuICAgICAgICAgIGNvbnN0IHVwbG9hZFVSTCA9IGJvZHlbb3B0cy5yZXNwb25zZVVybEZpZWxkTmFtZV1cblxuICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IGRhdGEucmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIHVwbG9hZFVSTFxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3VjY2VzcycsIGZpbGUsIHVwbG9hZFJlc3ApXG4gICAgICAgICAgc29ja2V0LmNsb3NlKClcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgc29ja2V0Lm9uKCdlcnJvcicsIChlcnJEYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVzcCA9IGVyckRhdGEucmVzcG9uc2VcbiAgICAgICAgICBjb25zdCBlcnJvciA9IHJlc3BcbiAgICAgICAgICAgID8gb3B0cy5nZXRSZXNwb25zZUVycm9yKHJlc3AucmVzcG9uc2VUZXh0LCByZXNwKVxuICAgICAgICAgICAgOiBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihlcnJEYXRhLmVycm9yLm1lc3NhZ2UpLCB7IGNhdXNlOiBlcnJEYXRhLmVycm9yIH0pXG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKVxuICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHVwbG9hZEJ1bmRsZSAoZmlsZXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgZW5kcG9pbnQgPSB0aGlzLm9wdHMuZW5kcG9pbnRcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMub3B0cy5tZXRob2RcblxuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSwgaSkgPT4ge1xuICAgICAgICBjb25zdCBvcHRzID0gdGhpcy5nZXRPcHRpb25zKGZpbGUpXG5cbiAgICAgICAgaWYgKGZpbGUubmFtZSkge1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChvcHRzLmZpZWxkTmFtZSwgZmlsZS5kYXRhLCBmaWxlLm5hbWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKG9wdHMuZmllbGROYW1lLCBmaWxlLmRhdGEpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIGNvbnN0IHRpbWVyID0gdGhpcy5jcmVhdGVQcm9ncmVzc1RpbWVvdXQodGhpcy5vcHRzLnRpbWVvdXQsIChlcnJvcikgPT4ge1xuICAgICAgICB4aHIuYWJvcnQoKVxuICAgICAgICBlbWl0RXJyb3IoZXJyb3IpXG4gICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGVtaXRFcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIChldikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKCdbWEhSVXBsb2FkXSBzdGFydGVkIHVwbG9hZGluZyBidW5kbGUnKVxuICAgICAgICB0aW1lci5wcm9ncmVzcygpXG4gICAgICB9KVxuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgKGV2KSA9PiB7XG4gICAgICAgIHRpbWVyLnByb2dyZXNzKClcblxuICAgICAgICBpZiAoIWV2Lmxlbmd0aENvbXB1dGFibGUpIHJldHVyblxuXG4gICAgICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgICAgICAgdXBsb2FkZXI6IHRoaXMsXG4gICAgICAgICAgICBieXRlc1VwbG9hZGVkOiBldi5sb2FkZWQgLyBldi50b3RhbCAqIGZpbGUuc2l6ZSxcbiAgICAgICAgICAgIGJ5dGVzVG90YWw6IGZpbGUuc2l6ZVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIChldikgPT4ge1xuICAgICAgICB0aW1lci5kb25lKClcblxuICAgICAgICBpZiAodGhpcy5vcHRzLnZhbGlkYXRlU3RhdHVzKGV2LnRhcmdldC5zdGF0dXMsIHhoci5yZXNwb25zZVRleHQsIHhocikpIHtcbiAgICAgICAgICBjb25zdCBib2R5ID0gdGhpcy5vcHRzLmdldFJlc3BvbnNlRGF0YSh4aHIucmVzcG9uc2VUZXh0LCB4aHIpXG4gICAgICAgICAgY29uc3QgdXBsb2FkUmVzcCA9IHtcbiAgICAgICAgICAgIHN0YXR1czogZXYudGFyZ2V0LnN0YXR1cyxcbiAgICAgICAgICAgIGJvZHlcbiAgICAgICAgICB9XG4gICAgICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVycm9yID0gdGhpcy5vcHRzLmdldFJlc3BvbnNlRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSB8fCBuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpXG4gICAgICAgIGVycm9yLnJlcXVlc3QgPSB4aHJcbiAgICAgICAgZW1pdEVycm9yKGVycm9yKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuICAgICAgfSlcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2KSA9PiB7XG4gICAgICAgIHRpbWVyLmRvbmUoKVxuXG4gICAgICAgIGNvbnN0IGVycm9yID0gdGhpcy5vcHRzLmdldFJlc3BvbnNlRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSB8fCBuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpXG4gICAgICAgIGVtaXRFcnJvcihlcnJvcilcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMudXBweS5vbignY2FuY2VsLWFsbCcsICgpID0+IHtcbiAgICAgICAgdGltZXIuZG9uZSgpXG4gICAgICAgIHhoci5hYm9ydCgpXG4gICAgICB9KVxuXG4gICAgICB4aHIub3BlbihtZXRob2QudG9VcHBlckNhc2UoKSwgZW5kcG9pbnQsIHRydWUpXG4gICAgICAvLyBJRTEwIGRvZXMgbm90IGFsbG93IHNldHRpbmcgYHdpdGhDcmVkZW50aWFsc2AgYW5kIGByZXNwb25zZVR5cGVgXG4gICAgICAvLyBiZWZvcmUgYG9wZW4oKWAgaXMgY2FsbGVkLlxuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRoaXMub3B0cy53aXRoQ3JlZGVudGlhbHNcbiAgICAgIGlmICh0aGlzLm9wdHMucmVzcG9uc2VUeXBlICE9PSAnJykge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gdGhpcy5vcHRzLnJlc3BvbnNlVHlwZVxuICAgICAgfVxuXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLm9wdHMuaGVhZGVycykuZm9yRWFjaCgoaGVhZGVyKSA9PiB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgdGhpcy5vcHRzLmhlYWRlcnNbaGVhZGVyXSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKGZvcm1EYXRhKVxuXG4gICAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICB1cGxvYWRGaWxlcyAoZmlsZXMpIHtcbiAgICBjb25zdCBhY3Rpb25zID0gZmlsZXMubWFwKChmaWxlLCBpKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50ID0gcGFyc2VJbnQoaSwgMTApICsgMVxuICAgICAgY29uc3QgdG90YWwgPSBmaWxlcy5sZW5ndGhcblxuICAgICAgaWYgKGZpbGUuZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihmaWxlLmVycm9yKSlcbiAgICAgIH0gZWxzZSBpZiAoZmlsZS5pc1JlbW90ZSkge1xuICAgICAgICAvLyBXZSBlbWl0IHVwbG9hZC1zdGFydGVkIGhlcmUsIHNvIHRoYXQgaXQncyBhbHNvIGVtaXR0ZWQgZm9yIGZpbGVzXG4gICAgICAgIC8vIHRoYXQgaGF2ZSB0byB3YWl0IGR1ZSB0byB0aGUgYGxpbWl0YCBvcHRpb24uXG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpXG4gICAgICAgIHJldHVybiB0aGlzLnVwbG9hZFJlbW90ZS5iaW5kKHRoaXMsIGZpbGUsIGN1cnJlbnQsIHRvdGFsKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdGFydGVkJywgZmlsZSlcbiAgICAgICAgcmV0dXJuIHRoaXMudXBsb2FkLmJpbmQodGhpcywgZmlsZSwgY3VycmVudCwgdG90YWwpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IHByb21pc2VzID0gYWN0aW9ucy5tYXAoKGFjdGlvbikgPT4ge1xuICAgICAgY29uc3QgbGltaXRlZEFjdGlvbiA9IHRoaXMubGltaXRVcGxvYWRzKGFjdGlvbilcbiAgICAgIHJldHVybiBsaW1pdGVkQWN0aW9uKClcbiAgICB9KVxuXG4gICAgcmV0dXJuIHNldHRsZShwcm9taXNlcylcbiAgfVxuXG4gIGhhbmRsZVVwbG9hZCAoZmlsZUlEcykge1xuICAgIGlmIChmaWxlSURzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy51cHB5LmxvZygnW1hIUlVwbG9hZF0gTm8gZmlsZXMgdG8gdXBsb2FkIScpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9XG5cbiAgICB0aGlzLnVwcHkubG9nKCdbWEhSVXBsb2FkXSBVcGxvYWRpbmcuLi4nKVxuICAgIGNvbnN0IGZpbGVzID0gZmlsZUlEcy5tYXAoKGZpbGVJRCkgPT4gdGhpcy51cHB5LmdldEZpbGUoZmlsZUlEKSlcblxuICAgIGlmICh0aGlzLm9wdHMuYnVuZGxlKSB7XG4gICAgICByZXR1cm4gdGhpcy51cGxvYWRCdW5kbGUoZmlsZXMpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudXBsb2FkRmlsZXMoZmlsZXMpLnRoZW4oKCkgPT4gbnVsbClcbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIGlmICh0aGlzLm9wdHMuYnVuZGxlKSB7XG4gICAgICBjb25zdCB7IGNhcGFiaWxpdGllcyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIGNhcGFiaWxpdGllczoge1xuICAgICAgICAgIC4uLmNhcGFiaWxpdGllcyxcbiAgICAgICAgICBpbmRpdmlkdWFsQ2FuY2VsbGF0aW9uOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMudXBweS5hZGRVcGxvYWRlcih0aGlzLmhhbmRsZVVwbG9hZClcbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgaWYgKHRoaXMub3B0cy5idW5kbGUpIHtcbiAgICAgIGNvbnN0IHsgY2FwYWJpbGl0aWVzIH0gPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuICAgICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgICAgY2FwYWJpbGl0aWVzOiB7XG4gICAgICAgICAgLi4uY2FwYWJpbGl0aWVzLFxuICAgICAgICAgIGluZGl2aWR1YWxDYW5jZWxsYXRpb246IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnVwcHkucmVtb3ZlVXBsb2FkZXIodGhpcy5oYW5kbGVVcGxvYWQpXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJyZXF1aXJlKCdlczYtcHJvbWlzZS9hdXRvJylcbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpXG5jb25zdCBVcHB5ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCBGaWxlSW5wdXQgPSByZXF1aXJlKCdAdXBweS9maWxlLWlucHV0JylcbmNvbnN0IFhIUlVwbG9hZCA9IHJlcXVpcmUoJ0B1cHB5L3hoci11cGxvYWQnKVxuY29uc3QgUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCdAdXBweS9wcm9ncmVzcy1iYXInKVxuXG5jb25zdCB1cHB5ID0gbmV3IFVwcHkoeyBkZWJ1ZzogdHJ1ZSwgYXV0b1Byb2NlZWQ6IHRydWUgfSlcbnVwcHkudXNlKEZpbGVJbnB1dCwgeyB0YXJnZXQ6ICcuVXBweUZvcm0nLCByZXBsYWNlVGFyZ2V0Q29udGVudDogdHJ1ZSB9KVxudXBweS51c2UoWEhSVXBsb2FkLCB7XG4gIGVuZHBvaW50OiAnLy9hcGkyLnRyYW5zbG9hZGl0LmNvbScsXG4gIGZvcm1EYXRhOiB0cnVlLFxuICBmaWVsZE5hbWU6ICdmaWxlc1tdJ1xufSlcbnVwcHkudXNlKFByb2dyZXNzQmFyLCB7XG4gIHRhcmdldDogJ2JvZHknLFxuICBmaXhlZDogdHJ1ZSxcbiAgaGlkZUFmdGVyRmluaXNoOiBmYWxzZVxufSlcblxuY29uc29sZS5sb2coJ1VwcHkgd2l0aCBGb3JtdGFnIGFuZCBYSFJVcGxvYWQgaXMgbG9hZGVkJylcbiJdfQ==
