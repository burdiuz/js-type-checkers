'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var hasOwn = _interopDefault(require('@actualwave/hasOwn'));

let defaultTypeChecker = null;

const getDefaultTypeChecker = () => defaultTypeChecker;
const setDefaultTypeChecker = typeChecker => {
  defaultTypeChecker = typeChecker;
};

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

const getProxyConfigValue = (key, info = null) => hasOwn(info, key) ? info[key] : config[key];

/* eslint-disable import/prefer-default-export */

const constructErrorString = (action, name, required, actual) => `${action}Error on "${name}" instead of "${required}" received "${actual}"`;

const ConsoleErrorReporter = (action, name, requiredTypeString, actualTypeString) => console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));

const ConsoleWarnReporter = (action, name, requiredTypeString, actualTypeString) => console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));

/* eslint-disable import/prefer-default-export */

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
  // eslint-disable-next-line guard-for-in
  for (const name in sourceCache) {
    const key = getChildInfoKey(name);

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

const getOriginalTarget = target => target[TARGET_KEY] || target;

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
  if (value instanceof Function && !hasOwn(target, property) && getProxyConfigValue(PROXY_IGNORE_PROTOTYPE_METHODS, info)) {
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

/* eslint-disable import/prefer-default-export */

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
    result = getTypeCheckedChild(createFn, info, 'returnValue', result);
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
//# sourceMappingURL=type-checkers.js.map
