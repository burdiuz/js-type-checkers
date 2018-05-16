(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.TypeCheckers = {})));
}(this, (function (exports) { 'use strict';

  let defaultTypeChecker = null;

  const getDefaultTypeChecker = () => defaultTypeChecker;
  const setDefaultTypeChecker = typeChecker => {
    defaultTypeChecker = typeChecker;
  };

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      symbolTag = '[object Symbol]';

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/,
      reLeadingDot = /^\./,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Checks if `value` is a host object in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
   */
  function isHostObject(value) {
    // Many host objects are `Object` objects that can coerce to strings
    // despite having improperly defined `toString` methods.
    var result = false;
    if (value != null && typeof value.toString != 'function') {
      try {
        result = !!(value + '');
      } catch (e) {}
    }
    return result;
  }

  /** Used for built-in method references. */
  var arrayProto = Array.prototype,
      funcProto = Function.prototype,
      objectProto = Object.prototype;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /** Built-in value references. */
  var Symbol$1 = root.Symbol,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      splice = arrayProto.splice;

  /* Built-in method references that are verified to be native. */
  var Map = getNative(root, 'Map'),
      nativeCreate = getNative(Object, 'create');

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    return this.has(key) && delete this.__data__[key];
  }

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
  }

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
  }

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    return this;
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
  }

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    return true;
  }

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map || ListCache),
      'string': new Hash
    };
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    return getMapData(this, key)['delete'](key);
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value);
    return this;
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.has` without support for deep paths.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */
  function baseHas(object, key) {
    return object != null && hasOwnProperty.call(object, key);
  }

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  /**
   * Casts `value` to a path array if it's not one.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {Array} Returns the cast property path array.
   */
  function castPath(value) {
    return isArray(value) ? value : stringToPath(value);
  }

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /**
   * Checks if `path` exists on `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @param {Function} hasFunc The function to check properties.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   */
  function hasPath(object, path, hasFunc) {
    path = isKey(path, object) ? [path] : castPath(path);

    var result,
        index = -1,
        length = path.length;

    while (++index < length) {
      var key = toKey(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result) {
      return result;
    }
    var length = object ? object.length : 0;
    return !!length && isLength(length) && isIndex(key, length) &&
      (isArray(object) || isArguments(object));
  }

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length &&
      (typeof value == 'number' || reIsUint.test(value)) &&
      (value > -1 && value % 1 == 0 && value < length);
  }

  /**
   * Checks if `value` is a property name and not a property path.
   *
   * @private
   * @param {*} value The value to check.
   * @param {Object} [object] The object to query keys on.
   * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
   */
  function isKey(value, object) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == 'number' || type == 'symbol' || type == 'boolean' ||
        value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
      (object != null && value in Object(object));
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /**
   * Converts `string` to a property path array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the property path array.
   */
  var stringToPath = memoize(function(string) {
    string = toString(string);

    var result = [];
    if (reLeadingDot.test(string)) {
      result.push('');
    }
    string.replace(rePropName, function(match, number, quote, string) {
      result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  });

  /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */
  function toKey(value) {
    if (typeof value == 'string' || isSymbol(value)) {
      return value;
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to process.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * provided, it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key. The `func`
   * is invoked with the `this` binding of the memoized function.
   *
   * **Note:** The cache is exposed as the `cache` property on the memoized
   * function. Its creation may be customized by replacing the `_.memoize.Cache`
   * constructor with one whose instances implement the
   * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
   * method interface of `delete`, `get`, `has`, and `set`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] The function to resolve the cache key.
   * @returns {Function} Returns the new memoized function.
   * @example
   *
   * var object = { 'a': 1, 'b': 2 };
   * var other = { 'c': 3, 'd': 4 };
   *
   * var values = _.memoize(_.values);
   * values(object);
   * // => [1, 2]
   *
   * values(other);
   * // => [3, 4]
   *
   * object.a = 2;
   * values(object);
   * // => [1, 2]
   *
   * // Modify the result cache.
   * values.cache.set(object, ['a', 'b']);
   * values(object);
   * // => ['a', 'b']
   *
   * // Replace `_.memoize.Cache`.
   * _.memoize.Cache = WeakMap;
   */
  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
  }

  // Assign cache to `_.memoize`.
  memoize.Cache = MapCache;

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
    return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
      (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object,
   *  else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8-9 which returns 'object' for typed array and other constructors.
    var tag = isObject(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
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
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  /**
   * Checks if `path` is a direct property of `object`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = { 'a': { 'b': 2 } };
   * var other = _.create({ 'a': _.create({ 'b': 2 }) });
   *
   * _.has(object, 'a');
   * // => true
   *
   * _.has(object, 'a.b');
   * // => true
   *
   * _.has(object, ['a', 'b']);
   * // => true
   *
   * _.has(other, 'a');
   * // => false
   */
  function has(object, path) {
    return object != null && hasPath(object, path, baseHas);
  }

  var lodash_has = has;

  const PROXY_WRAP_FUNCTION_RETURN_VALUES = 'wrapFunctionReturnValues';
  const PROXY_WRAP_FUNCTION_ARGUMENTS = 'wrapFunctionArguments';
  const PROXY_WRAP_SET_PROPERTY_VALUES = 'wrapSetPropertyValues';
  const PROXY_IGNORE_PROTOTYPE_METHODS = 'ignorePrototypeMethods';

  const getDefaultProxyConfig = () => ({
    [PROXY_WRAP_FUNCTION_RETURN_VALUES]: true,
    [PROXY_WRAP_FUNCTION_ARGUMENTS]: false,
    [PROXY_WRAP_SET_PROPERTY_VALUES]: true,
    [PROXY_IGNORE_PROTOTYPE_METHODS]: false
  });

  const config = getDefaultProxyConfig();

  const setProxyConfig = newConfig => Object.assign(config, newConfig);

  const getProxyConfig = () => Object.assign({}, config);

  const getProxyConfigValue = (key, info = null) => lodash_has(info, key) ? info[key] : config[key];

  const constructErrorString = (action, name, required, actual) => `${action}Error on "${name}" instead of "${required}" received "${actual}"`;

  const ConsoleErrorReporter = (action, name, requiredTypeString, actualTypeString) => console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));

  const ConsoleWarnReporter = (action, name, requiredTypeString, actualTypeString) => console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));

  const ThrowErrorReporter = (action, name, requiredTypeString, actualTypeString) => {
    throw new Error(constructErrorString(action, name, requiredTypeString, actualTypeString));
  };

  let errorReporter = ConsoleErrorReporter;

  const getErrorReporter = () => errorReporter;

  const setErrorReporter = reporter => {
    errorReporter = reporter;
  };

  let enabled = true;

  const isEnabled = () => enabled;
  const setEnabled = (value = true) => {
    enabled = !!value;
  };

  const INFO_KEY = Symbol('type-checkers::info');

  const createChildrenCache = (children = {}) => Object.assign({}, children);

  const createTargetInfo = (checker, config, deep = true, names = [], children = createChildrenCache()) => ({
    checker,
    config,
    deep,
    names,
    children
  });

  const getTargetInfo = target => target ? target[INFO_KEY] : undefined;

  const setTargetInfo = (target, info) => {
    if (target && info) {
      target[INFO_KEY] = info;
    }
  };

  const hasTargetInfo = target => !!getTargetInfo(target);

  const getTargetTypeChecker = target => target && target[INFO_KEY] ? target[INFO_KEY].checker : undefined;

  const getTargetTypeCheckerConfig = target => {
    if (!target || !target[INFO_KEY]) {
      return undefined;
    }

    return target[INFO_KEY].config;
  };

  const mergeChildrenCache = (targetCache, sourceCache) => {
    for (const name in sourceCache) {
      if (lodash_has(targetCache, name)) {
        targetCache[name] = mergeTargetInfo(targetCache[name], sourceCache[name]);
      } else {
        targetCache[name] = sourceCache[name];
      }
    }

    return targetCache;
  };

  const storeChildInfo = (cache, name, childInfo) => {
    delete cache[name];

    if (childInfo) {
      cache[name] = childInfo;
    }
  };

  const storeChildInfoFrom = (cache, name, child) => {
    storeChildInfo(cache, name, getTargetInfo(child));
  };

  const getChildInfo = (cache, name) => cache[name];

  const mergeTargetInfo = (targetInfo, sourceInfo) => {
    const { deep, checker, children, config, names } = targetInfo;

    if (checker === sourceInfo.checker) {
      targetInfo.deep = deep || sourceInfo.deep;
      targetInfo.children = mergeChildrenCache(children, sourceInfo.children);
      targetInfo.config = checker.mergeConfigs(config, sourceInfo.config, names);
    } else {
      console.error('TypeChecked objects can be merged only if using exactly same instance of type checker.');
    }

    return targetInfo;
  };

  const TARGET_KEY = Symbol('type-checkers::target');

  const getOriginalTarget = target => {
    return target[TARGET_KEY] || target;
  };

  const validTypes = {
    object: true,
    function: true
  };

  const isValidTarget = target => Boolean(target && validTypes[typeof target]);
  const isTypeChecked = target => Boolean(target && target[TARGET_KEY]);

  const getTargetProperty = (createFn, target, property, value) => {
    const info = getTargetInfo(target);
    const { deep, children, names, checker } = info;

    if (deep || value instanceof Function) {
      const childInfo = getChildInfo(children, property);

      if (childInfo) {
        value = createFn(value, { info: childInfo });
      } else {
        value = createFn(value, { deep, names: [...names, property], checker });
        storeChildInfoFrom(children, property, value);
      }
    }

    return value;
  };

  const isIgnoredProperty = (target, info, property, value) => {
    if (value instanceof Function && !lodash_has(target, property) && getProxyConfigValue(PROXY_IGNORE_PROTOTYPE_METHODS, info)) {
      return true;
    }

    return false;
  };

  const getProperty = createFn => (target, property) => {
    const value = target[property];

    if (property === INFO_KEY) {
      return value;
      /*
      target[TARGET_KEY] is a virtual property accessing which indicates
      if object is wrapped with type checked proxy or not.
      */
    } else if (property === TARGET_KEY) {
      return target;
    }

    const info = getTargetInfo(target);
    const { names, config, checker } = info;

    if (checker.getProperty) {
      checker.getProperty(target, property, value, config, names);
    }

    if (!isValidTarget(value) || isTypeChecked(value) || isIgnoredProperty(target, info, property, value)) {
      return value;
    }

    return getTargetProperty(createFn, target, property, value);
  };

  const setNonTargetProperty = (target, property, value) => {
    if (property === INFO_KEY) {
      let info = getTargetInfo(target);
      if (info && value && info !== value) {
        info = mergeTargetInfo(info, value);
      } else {
        info = value;
      }

      target[property] = info;
      return true;
    } else if (!isValidTarget(value)) {
      const { names, config, checker } = getTargetInfo(target);

      if (checker.setProperty) {
        checker.setProperty(target, property, value, config, names);
      }

      target[property] = value;
      return true;
    }

    return false;
  };

  const setTargetProperty = (createFn, target, property, value) => {
    const info = getTargetInfo(target);
    const { deep, names, checker, config, children } = info;

    if (checker.setProperty) {
      checker.setProperty(target, property, value, config, names);
    }

    if (getProxyConfigValue(PROXY_WRAP_SET_PROPERTY_VALUES, info)) {
      if (!isTypeChecked(value)) {
        const childInfo = getChildInfo(children, property);

        if (childInfo) {
          value = createFn(value, { info: childInfo });
        } else {
          value = createFn(value, { deep, names: [...names, property], checker });
        }
      }

      storeChildInfoFrom(children, property, value);
    }

    target[property] = value;
    return true;
  };

  const setProperty = createFn => (target, property, value) => {
    if (property === TARGET_KEY) {
      throw new Error(`"${TARGET_KEY}" is a virtual property and cannot be set`);
    }

    return setNonTargetProperty(target, property, value) || setTargetProperty(createFn, target, property, value);
  };

  const RETURN_VALUE = '(ReturnValue)';

  function AsIs(value) {
    if (this instanceof AsIs) {
      this.value = value;
    } else {
      return new AsIs(value);
    }
  }

  function asIs() {
    return this.value;
  }

  AsIs.prototype.toString = asIs;
  AsIs.prototype.valueOf = asIs;
  AsIs.prototype[Symbol.toPrimitive] = asIs;

  const getTypeCheckedChild = (createFn, info, name, value) => {
    if (!isValidTarget(value)) {
      return value;
    }

    let result = value;

    if (!isTypeChecked(value)) {
      const { children } = info;
      const childInfo = getChildInfo(children, name);

      if (childInfo) {
        result = createFn(value, { info: childInfo });
      } else {
        const { deep, names, checker } = info;
        result = createFn(value, { deep, names: [...names, name], checker });
        storeChildInfoFrom(children, name, result);
      }
    }

    return result;
  };

  const getTargetArguments = (createFn, target, argumentsList) => {
    const info = getTargetInfo(target);

    if (getProxyConfigValue(PROXY_WRAP_FUNCTION_ARGUMENTS, info)) {
      const { length } = argumentsList;
      // FIXME cache arguments info objects as children
      for (let index = 0; index < length; index++) {
        argumentsList[index] = getTypeCheckedChild(createFn, info, String(index), argumentsList[index]);
      }
    }

    return argumentsList;
  };

  const callFunction = createFn => (target, thisArg, argumentsList) => {
    const info = getTargetInfo(target);
    const { names, config, checker } = info;

    if (checker.arguments) {
      checker.arguments(target, thisArg, argumentsList, config, names);
    }

    argumentsList = getTargetArguments(createFn, target, argumentsList);

    let result = target.apply(thisArg, argumentsList);

    if (checker.returnValue) {
      checker.returnValue(target, thisArg, result, config, names);
    }

    if (getProxyConfigValue(PROXY_WRAP_FUNCTION_RETURN_VALUES, info)) {
      result = getTypeCheckedChild(createFn, info, new AsIs(RETURN_VALUE), result);
    }

    return result;
  };

  let getProperty$1;
  let setProperty$1;
  let callFunction$1;

  const objectProxy = target => new Proxy(target, {
    get: getProperty$1,
    set: setProperty$1
  });

  const functionProxy = target => new Proxy(target, {
    get: getProperty$1,
    set: setProperty$1,
    apply: callFunction$1,
    construct: callFunction$1
  });

  const wrapWithProxy = target => {
    if (target instanceof Function) {
      return functionProxy(target);
    }

    return objectProxy(target);
  };

  const createInfoFromOptions = (target, {
    deep = true,
    names = [],
    config = null,
    children = null,
    checker = getDefaultTypeChecker(),
    info = null // exclusive option, if set other options being ignored
  } = {}) => info || createTargetInfo(checker, checker.init(target, getErrorReporter(), config), deep, names, createChildrenCache(children));

  const create = (target, options) => {
    if (!isValidTarget(target) || !isEnabled() || isTypeChecked(target)) {
      return target;
    }

    setTargetInfo(target, createInfoFromOptions(target, options));

    return wrapWithProxy(target);
  };

  getProperty$1 = getProperty(create);
  setProperty$1 = setProperty(create);
  callFunction$1 = callFunction(create);

  const deepInitializer = (target, options) => {
    const info = createInfoFromOptions(target, options);
    const { deep, names, checker, config, children } = info;

    Object.keys(target).forEach(name => {
      const value = target[name];

      checker.getProperty(target, name, value, config, names);

      // skip functions/methods since we get info about them only when being executed
      if (typeof value === 'object') {
        let childInfo = getChildInfo(children, name);

        if (childInfo) {
          deepInitializer(value, { info: childInfo });
        } else {
          childInfo = deepInitializer(value, { deep, names: [...names, name], checker });
          storeChildInfo(children, name, childInfo);
        }
      }
    });

    setTargetInfo(target, info);

    return info;
  };

  const createDeep = (target, options) => {
    if (!target || typeof target !== 'object' || !isEnabled() || isTypeChecked(target)) {
      return target;
    }

    deepInitializer(target, options);

    return wrapWithProxy(target);
  };

  const objectMerge = (options, ...sources) => {
    let target = {};

    if (isEnabled()) {
      if (!options) {
        options = {
          info: getTargetInfo(sources.find(item => hasTargetInfo(item))),
          deep: false
        };
      }

      target = create(target, options);
    }

    return Object.assign(target, ...sources);
  };

  // TODO if enabled, replaces original value with type checked
  const properties = (target, options = undefined, ...names) => {
    if (!isEnabled()) {
      return target;
    }

    if (!isValidTarget(target)) {
      throw new Error('Target must be a valid object.');
    }

    if (Object.isFrozen(target) || Object.isSealed(target)) {
      throw new Error('Target object should not be sealed or frozen.');
    }

    if (!names.length) {
      // Symbols and non-enumerables must be explicitly specified
      names = Object.keys(target);
    }

    const { length } = names;
    for (let index = 0; index < length; index += 1) {
      const name = names[index];
      const { writable, get, set } = Object.getOwnPropertyDescriptor(target, name);

      // Prohibit applying to properties with accessor/mutator pair?
      if (get && set || writable) {
        const value = target[name];

        if (isValidTarget(value) && !isTypeChecked(value)) {
          target[name] = create(value, options);
        }
      }
    }

    return target;
  };

  exports.getDefaultTypeChecker = getDefaultTypeChecker;
  exports.setDefaultTypeChecker = setDefaultTypeChecker;
  exports.PROXY_WRAP_FUNCTION_RETURN_VALUES = PROXY_WRAP_FUNCTION_RETURN_VALUES;
  exports.PROXY_WRAP_FUNCTION_ARGUMENTS = PROXY_WRAP_FUNCTION_ARGUMENTS;
  exports.PROXY_WRAP_SET_PROPERTY_VALUES = PROXY_WRAP_SET_PROPERTY_VALUES;
  exports.PROXY_IGNORE_PROTOTYPE_METHODS = PROXY_IGNORE_PROTOTYPE_METHODS;
  exports.getDefaultProxyConfig = getDefaultProxyConfig;
  exports.setProxyConfig = setProxyConfig;
  exports.getProxyConfig = getProxyConfig;
  exports.create = create;
  exports.createDeep = createDeep;
  exports.ConsoleErrorReporter = ConsoleErrorReporter;
  exports.ConsoleWarnReporter = ConsoleWarnReporter;
  exports.ThrowErrorReporter = ThrowErrorReporter;
  exports.getErrorReporter = getErrorReporter;
  exports.setErrorReporter = setErrorReporter;
  exports.isEnabled = isEnabled;
  exports.setEnabled = setEnabled;
  exports.getTargetInfo = getTargetInfo;
  exports.setTargetInfo = setTargetInfo;
  exports.hasTargetInfo = hasTargetInfo;
  exports.getTargetTypeChecker = getTargetTypeChecker;
  exports.getTargetTypeCheckerConfig = getTargetTypeCheckerConfig;
  exports.mergeTargetInfo = mergeTargetInfo;
  exports.getOriginalTarget = getOriginalTarget;
  exports.merge = objectMerge;
  exports.properties = properties;
  exports.isTypeChecked = isTypeChecked;
  exports.isValidTarget = isValidTarget;
  exports.default = create;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=type-checkers.js.map
