'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var hasOwn = _interopDefault(require('@actualwave/has-own'));

let defaultTypeChecker = null;

const getDefaultTypeChecker = () => defaultTypeChecker;
const setDefaultTypeChecker = typeChecker => {
  defaultTypeChecker = typeChecker;
};

const WRAP_FUNCTION_RETURN_VALUES = 'wrapFunctionReturnValues';
const WRAP_FUNCTION_ARGUMENTS = 'wrapFunctionArguments';
const WRAP_SET_PROPERTY_VALUES = 'wrapSetPropertyValues';
const PROXY_IGNORE_PROTOTYPE_METHODS = 'ignorePrototypeMethods';

const getDefaultWrapConfig = () => ({
  [WRAP_FUNCTION_RETURN_VALUES]: true,
  [WRAP_FUNCTION_ARGUMENTS]: false,
  [WRAP_SET_PROPERTY_VALUES]: true,
  [PROXY_IGNORE_PROTOTYPE_METHODS]: false
});

const config = getDefaultWrapConfig();

const setWrapConfig = newConfig => Object.assign(config, newConfig);

const getWrapConfig = () => Object.assign({}, config);

const getWrapConfigValue = (key, info = null) => hasOwn(info, key) ? info[key] : config[key];

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var isFunction_1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', { value: true });

const isFunction = (target) => (typeof target === 'function');

exports.isFunction = isFunction;
exports.default = isFunction;
});

var isFunction = unwrapExports(isFunction_1);
var isFunction_2 = isFunction_1.isFunction;

var withProxy_1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', { value: true });

const { isFunction } = isFunction_1;

const withProxy = (handlers) => {
  /*
   have problems with using rest operator here, when in node_modules without additional
   configurations, so using old style code
  */
  const { apply, construct } = handlers;

  delete handlers.apply;
  delete handlers.construct;

  const functionHandlers = { ...handlers, construct, apply };

  return (target) => new Proxy(target, isFunction(target) ? functionHandlers : handlers);
};

exports.withProxy = withProxy;
exports.default = withProxy;
});

var withProxy = unwrapExports(withProxy_1);
var withProxy_2 = withProxy_1.withProxy;

/* eslint-disable import/prefer-default-export */

const constructErrorString = (action, name, required, received) => `${action}Error on "${name}" instead of "${required}" received "${received}"`;

/* eslint-disable no-console */

const ConsoleErrorReporter = (action, name, requiredTypeString, actualTypeString) => console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));

const ConsoleWarnReporter = (action, name, requiredTypeString, actualTypeString) => console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));

/* eslint-disable import/prefer-default-export */

const ThrowErrorReporter = (action, name, requiredTypeString, receivedTypeString) => {
  throw new Error(constructErrorString(action, name, requiredTypeString, receivedTypeString));
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

// TODO three times getting same, might need optimizing
const getTypeChecker = target => {
  if (target) {
    const info = target[INFO_KEY];

    return info && info.checker || undefined;
  }

  return undefined;
};

const getTypeCheckerData = target => {
  if (target) {
    const info = target[INFO_KEY];

    return info && info.config || undefined;
  }

  return undefined;
};

/*
  I have had to apply custom key instead of name as is to
  fix "construtor" issue. Since ordinary object has some
  properties with values from start, these properties were
  mustakenly returned as child info objects, for example, if
  requesting hild info for "constructor" function of the target,
  it returned class constructor which caused errors later,
  when accesing info properties.
 */
const getChildInfoKey = name => `@${name}`;

const mergeChildrenCache = (targetCache, sourceCache) => {
  for (const key in sourceCache) {
    if (hasOwn(targetCache, key)) {
      // eslint-disable-next-line no-use-before-define
      targetCache[key] = mergeTargetInfo(targetCache[key], sourceCache[key]);
    } else {
      targetCache[key] = sourceCache[key];
    }
  }

  return targetCache;
};

const storeChildInfo = (cache, name, childInfo) => {
  const key = getChildInfoKey(name);
  delete cache[key];

  if (childInfo) {
    cache[key] = childInfo;
  }
};

const storeChildInfoFrom = (cache, name, child) => {
  storeChildInfo(cache, name, getTargetInfo(child));
};

const getChildInfo = (cache, name) => cache[getChildInfoKey(name)];

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

const unwrap = target => target && target[TARGET_KEY] || target;

const validTypes = {
  object: true,
  function: true
};

const isWrappable = target => Boolean(target && validTypes[typeof target]);
const isWrapped = target => Boolean(target && target[TARGET_KEY]);

const getTargetProperty = (wrapFn, target, property, value) => {
  const info = getTargetInfo(target);
  const { deep, children, names, checker } = info;

  if (deep || isFunction(value)) {
    const childInfo = getChildInfo(children, property);

    if (childInfo) {
      value = wrapFn(value, { info: childInfo });
    } else {
      value = wrapFn(value, { deep, names: [...names, property], checker });
      storeChildInfoFrom(children, property, value);
    }
  }

  return value;
};

const isIgnoredProperty = (target, info, property, value) => {
  if (isFunction(value) && !hasOwn(target, property) && getWrapConfigValue(PROXY_IGNORE_PROTOTYPE_METHODS, info)) {
    return true;
  }

  return false;
};

const getProperty = wrapFn => (target, property) => {
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

  if (!isWrappable(value) || isWrapped(value) || isIgnoredProperty(target, info, property, value)) {
    return value;
  }

  return getTargetProperty(wrapFn, target, property, value);
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
  } else if (!isWrappable(value)) {
    const { names, config, checker } = getTargetInfo(target);

    if (checker.setProperty) {
      checker.setProperty(target, property, value, config, names);
    }

    target[property] = value;
    return true;
  }

  return false;
};

const setTargetProperty = (wrapFn, target, property, value) => {
  const info = getTargetInfo(target);
  const { deep, names, checker, config, children } = info;

  if (checker.setProperty) {
    checker.setProperty(target, property, value, config, names);
  }

  if (getWrapConfigValue(WRAP_SET_PROPERTY_VALUES, info)) {
    if (!isWrapped(value)) {
      const childInfo = getChildInfo(children, property);

      if (childInfo) {
        value = wrapFn(value, { info: childInfo });
      } else {
        value = wrapFn(value, { deep, names: [...names, property], checker });
      }
    }

    storeChildInfoFrom(children, property, value);
  }

  target[property] = value;
  return true;
};

const setProperty = wrapFn => (target, property, value) => {
  if (property === TARGET_KEY) {
    throw new Error(`"${TARGET_KEY}" is a virtual property and cannot be set`);
  }

  return setNonTargetProperty(target, property, value) || setTargetProperty(wrapFn, target, property, value);
};

/* eslint-disable import/prefer-default-export */

const getTypeCheckedChild = (wrapFn, info, name, value) => {
  if (!isWrappable(value)) {
    return value;
  }

  let result = value;

  if (!isWrapped(value)) {
    const { children } = info;
    const childInfo = getChildInfo(children, name);

    if (childInfo) {
      result = wrapFn(value, { info: childInfo });
    } else {
      const { deep, names, checker } = info;
      result = wrapFn(value, { deep, names: [...names, name], checker });
      storeChildInfoFrom(children, name, result);
    }
  }

  return result;
};

const getTargetArguments = (wrapFn, target, argumentsList) => {
  const info = getTargetInfo(target);

  if (getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)) {
    const { length } = argumentsList;
    // FIXME cache arguments info objects as children
    for (let index = 0; index < length; index++) {
      argumentsList[index] = getTypeCheckedChild(wrapFn, info, String(index), argumentsList[index]);
    }
  }

  return argumentsList;
};

const callFunction = wrapFn => (target, thisArg, argumentsList) => {
  const info = getTargetInfo(target);
  const { names, config, checker } = info;

  if (checker.arguments) {
    checker.arguments(target, thisArg, argumentsList, config, names);
  }

  argumentsList = getTargetArguments(wrapFn, target, argumentsList);

  let result = target.apply(thisArg, argumentsList);

  if (checker.returnValue) {
    checker.returnValue(target, thisArg, result, config, names);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, info)) {
    result = getTypeCheckedChild(wrapFn, info, 'returnValue', result);
  }

  return result;
};

let wrapWithProxy; // eslint-disable-line

const createInfoFromOptions = (target, {
  deep = true,
  names = [],
  config = null,
  children = null,
  checker = getDefaultTypeChecker(),
  info = null // exclusive option, if set other options being ignored
} = {}) => info || createTargetInfo(checker, checker.init(target, getErrorReporter(), config), deep, names, createChildrenCache(children));

const create = (target, options) => {
  if (!isWrappable(target) || !isEnabled() || isWrapped(target)) {
    return target;
  }

  setTargetInfo(target, createInfoFromOptions(target, options));

  return wrapWithProxy(target);
};

wrapWithProxy = (() => {
  const callHandler = callFunction(create);

  return withProxy({
    get: getProperty(create),
    set: setProperty(create),
    apply: callHandler,
    construct: callHandler
  });
})();

const deepInitializer = (target, options) => {
  const info = createInfoFromOptions(target, options);
  const { deep, names, checker, config, children } = info;

  Object.keys(target).forEach(name => {
    const value = target[name];

    checker.getProperty(target, name, value, config, names);

    if (isWrappable(value)) {
      let childInfo = getChildInfo(children, name);

      if (childInfo) {
        deepInitializer(value, { info: childInfo });
      } else {
        childInfo = deepInitializer(value, {
          deep,
          names: [...names, name],
          checker
        });
        storeChildInfo(children, name, childInfo);
      }
    }
  });

  setTargetInfo(target, info);

  return info;
};

const createDeep = (target, options) => {
  if (!target || typeof target !== 'object' || !isEnabled() || isWrapped(target)) {
    return target;
  }

  deepInitializer(target, options);

  return wrapWithProxy(target);
};

const merge = (options, ...sources) => {
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

  if (!isWrappable(target)) {
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

      if (isWrappable(value) && !isWrapped(value)) {
        target[name] = create(value, options);
      }
    }
  }

  return target;
};

exports.getDefaultTypeChecker = getDefaultTypeChecker;
exports.setDefaultTypeChecker = setDefaultTypeChecker;
exports.WRAP_FUNCTION_RETURN_VALUES = WRAP_FUNCTION_RETURN_VALUES;
exports.WRAP_FUNCTION_ARGUMENTS = WRAP_FUNCTION_ARGUMENTS;
exports.WRAP_SET_PROPERTY_VALUES = WRAP_SET_PROPERTY_VALUES;
exports.PROXY_IGNORE_PROTOTYPE_METHODS = PROXY_IGNORE_PROTOTYPE_METHODS;
exports.getDefaultWrapConfig = getDefaultWrapConfig;
exports.setWrapConfig = setWrapConfig;
exports.getWrapConfig = getWrapConfig;
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
exports.getTypeChecker = getTypeChecker;
exports.getTypeCheckerData = getTypeCheckerData;
exports.mergeTargetInfo = mergeTargetInfo;
exports.unwrap = unwrap;
exports.merge = merge;
exports.properties = properties;
exports.isWrapped = isWrapped;
exports.isWrappable = isWrappable;
exports.default = create;
//# sourceMappingURL=type-checkers.js.map
