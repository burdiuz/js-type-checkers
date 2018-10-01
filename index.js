'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var hasOwn = _interopDefault(require('@actualwave/has-own'));
var getClass = require('@actualwave/get-class');
var pathSequenceToString = require('@actualwave/path-sequence-to-string');
var isFunction = _interopDefault(require('@actualwave/is-function'));
var withProxy = _interopDefault(require('@actualwave/with-proxy'));

const singleConfigFactory = (defaultValue = null, validator = undefined) => {
  let value = defaultValue;
  return {
    get: () => value,
    set: (newValue = defaultValue) => {
      if (validator) {
        value = validator(newValue);
      } else {
        value = newValue;
      }
    }
  };
};
const mapConfigFactory = (defaultValues = {}, validator = undefined) => {
  const getDefault = () => ({ ...defaultValues
  });

  const values = getDefault();
  return {
    values,
    getDefault,
    set: newValues => Object.assign(values, validator ? validator(newValues) : newValues),
    get: () => ({ ...values
    }),
    getValue: key => hasOwn(values, key) ? values[key] : undefined
  };
};

const {
  get: getDefaultTypeChecker,
  set: setDefaultTypeChecker
} = singleConfigFactory();

const {
  get: isEnabled,
  set: setEnabled
} = singleConfigFactory(true, value => !!value);

/*
 When ignoring class, its instances will never be wrapped.
*/

const constructors = new Set();
const addIgnoredClasses = (...classes) => {
  classes.forEach(constructor => {
    if (constructor && !constructors.has(constructor)) {
      constructors.add(constructor);
    }
  });
};
const removeIgnoredClasses = (...classes) => {
  classes.forEach(constructor => constructors.delete(constructor));
};
const isIgnoredClass = constructor => constructors.has(constructor);
const isValueOfIgnoredClass = value => constructors.has(getClass.getClass(value));
/**
 * Number, String, Boolean and Symbol will not pass
 *
 *  typeof === 'object' || typeof === 'function'
 *
 * check, so not need to add them.
 */

addIgnoredClasses(Map, Set, Date, Error);

const WRAP_FUNCTION_RETURN_VALUES = 'wrapFunctionReturnValues';
const WRAP_FUNCTION_ARGUMENTS = 'wrapFunctionArguments';
const WRAP_SET_PROPERTY_VALUES = 'wrapSetPropertyValues';
const WRAP_IGNORE_PROTOTYPE_METHODS = 'ignorePrototypeMethods';
const {
  values,
  getDefault: getDefaultWrapConfig,
  get: getWrapConfig,
  set: setWrapConfig,
  getValue
} = mapConfigFactory({
  [WRAP_FUNCTION_RETURN_VALUES]: true,
  [WRAP_FUNCTION_ARGUMENTS]: false,
  [WRAP_SET_PROPERTY_VALUES]: false,
  [WRAP_IGNORE_PROTOTYPE_METHODS]: false
}, newValues => Object.keys(newValues).forEach(key => {
  newValues[key] = !!newValues[key];
}));
const getWrapConfigValue = (name, target) => {
  let value = target[name];

  if (target) {
    value = target[name];
  }

  return value === undefined ? getValue(name) : value;
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

class ChildrenCache {
  constructor(children) {
    if (children) {
      this.cache = { ...children.cache
      };
    } else {
      this.cache = {};
    }
  }

  store(name, childInfo) {
    const key = getChildInfoKey(name);

    if (childInfo) {
      this.cache[key] = childInfo;
    } else {
      delete this.cache[key];
    }
  }

  get(name) {
    return this.cache[getChildInfoKey(name)];
  }

  has(name) {
    return !!this.cache[getChildInfoKey(name)];
  }

  remove(cache, name) {
    return delete this.cache[getChildInfoKey(name)];
  }

  copy({
    cache: sourceCache
  }) {
    Object.keys(sourceCache).forEach(key => {
      if (hasOwn(this.cache, key)) {
        this.cache[key].copy(sourceCache[key]);
      } else {
        this.cache[key] = sourceCache[key];
      }
    });
    return this;
  }

}

const createChildrenCache = children => new ChildrenCache(children);

const INFO_KEY = Symbol('type-checkers::info');
const getTargetInfo = target => target ? target[INFO_KEY] : undefined;
const setTargetInfo = (target, info) => {
  if (target && info) {
    target[INFO_KEY] = info;
  }
};
const removeTargetInfo = target => delete target[INFO_KEY];

class TargetInfo {
  constructor(checker, data = null, deep = true, names = pathSequenceToString.createPathSequence(), children = createChildrenCache()) {
    this.checker = checker;
    this.data = data;
    this.deep = deep;
    this.names = names;
    this.children = children;
  }

  getChild(name) {
    return this.children.get(name);
  }

  storeChildFrom(name, child) {
    const info = getTargetInfo(child);

    if (info) {
      this.children.store(name, info);
    }
  }

  createChildWithNames(names, value, data = null) {
    const childInfo = new TargetInfo(this.checker, this.checker.init(value, data), this.deep, names);
    this.children.store(names.lastName, childInfo);
    return childInfo;
  }

  createChild(name, value, data = null) {
    return this.createChildWithNames(this.names.clone(name), value, data);
  }

  copy({
    deep,
    checker,
    children,
    data,
    names
  }) {
    if (this.checker === checker) {
      this.deep = this.deep || deep;
      this.children.copy(children);
      this.data = checker.mergeConfigs(this.data, data, names);
    } else {
      console.error('TypeChecked objects can be merged only if using exactly same instance of type checker.');
    }

    return this;
  }

}

const createTargetInfo = (checker, data, deep, names, children) => new TargetInfo(checker, data, deep, names, children);

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
    return info && info.data || undefined;
  }

  return undefined;
};

const TARGET_KEY = Symbol('type-checkers::target');
const isOfWrappableType = target => {
  const type = typeof target;
  return Boolean(target) && (type === 'function' || type === 'object') && !isValueOfIgnoredClass(target);
};
const isWrapped = target => Boolean(target && target[TARGET_KEY]);
const isWrappable = target => isOfWrappableType(target) && !isWrapped(target);
const unwrap = target => target && target[TARGET_KEY] || target;
const wrapConfigKeys = [WRAP_FUNCTION_ARGUMENTS, WRAP_FUNCTION_RETURN_VALUES, WRAP_IGNORE_PROTOTYPE_METHODS, WRAP_SET_PROPERTY_VALUES];
const setWrapConfigTo = (target, config) => {
  if (!isWrapped(target) || !config) {
    return;
  }

  const info = getTargetInfo(target);
  wrapConfigKeys.forEach(key => {
    if (hasOwn(key, config)) {
      info[key] = config[key];
    }
  });
};

const getTargetProperty = (wrapFn, target, names, value) => {
  const info = getTargetInfo(target);
  const {
    deep
  } = info;

  if (deep || isFunction(value)) {
    const {
      lastName: property
    } = names;
    const childInfo = info.getChild(property);

    if (childInfo) {
      return wrapFn(value, childInfo);
    }

    return wrapFn(value, info.createChildWithNames(names, value));
  }

  return value;
};
/**
 * Skips prototype methods if they are ignored by config
 */


const isIgnoredProperty = (target, info, property, value) => {
  if (isFunction(value) && !hasOwn(target, property) && getWrapConfigValue(WRAP_IGNORE_PROTOTYPE_METHODS, info)) {
    return true;
  }

  return false;
};

const getPropertyFactory = wrapFn => (target, property) => {
  const value = target[property];

  if (property === INFO_KEY) {
    return value;
    /*
    target[TARGET_KEY] is a virtual property accessing which indicates
    if object is wrapped with type checked proxy or not.
    Also it allows "unwrapping" target.
    */
  } else if (property === TARGET_KEY) {
    return target;
  }

  const info = getTargetInfo(target);
  const {
    names,
    data,
    checker
  } = info;
  const nextNames = names.clone(property);

  if (checker.getProperty) {
    checker.getProperty(target, nextNames, value, data);
  }

  if (!isWrappable(value) || isIgnoredProperty(target, info, property, value)) {
    return value;
  }

  return getTargetProperty(wrapFn, target, nextNames, value);
};

const setNonTargetProperty = (target, property, value) => {
  const {
    names,
    data,
    checker
  } = getTargetInfo(target);

  if (checker.setProperty) {
    checker.setProperty(target, names.clone(property), value, data);
  }

  target[property] = value;
  return true;
};

const setTargetProperty = (wrapFn, target, property, value) => {
  const info = getTargetInfo(target);
  const {
    names,
    checker,
    data
  } = info;
  const childInfo = info.getChild(property);
  const nextNames = childInfo ? childInfo.names : names.clone(property);

  if (checker.setProperty) {
    checker.setProperty(target, nextNames, value, data);
  }

  if (childInfo) {
    value = wrapFn(value, childInfo);
  } else {
    value = wrapFn(value, info.createChildWithNames(nextNames, value));
  }

  target[property] = value;
  return true;
};

const updateTargetInfo = (target, value) => {
  let info = getTargetInfo(target);

  if (info && value && info !== value) {
    info.copy(value);
  } else {
    info = value;
  }

  target[INFO_KEY] = info;
  return true;
};

const setPropertyFactory = wrapFn => (target, property, value) => {
  if (property === TARGET_KEY) {
    throw new Error(`"${TARGET_KEY}" is a virtual property and cannot be set`);
  }

  if (property === INFO_KEY) {
    return updateTargetInfo(target, value);
  }

  const info = getTargetInfo(target);

  if (isWrappable(value) && getWrapConfigValue(WRAP_SET_PROPERTY_VALUES, info)) {
    return setTargetProperty(wrapFn, target, property, value);
  }

  return setNonTargetProperty(target, property, value);
};

const getTypeCheckedChild = (wrapFn, info, name, value) => {
  if (!isWrappable(value)) {
    return value;
  }

  const childInfo = info.getChild(name);

  if (childInfo) {
    return wrapFn(value, childInfo);
  }

  return wrapFn(value, info.createChild(name, value));
};
const getTargetArguments = (wrapFn, info, argumentsList) => {
  if (getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)) {
    const {
      length
    } = argumentsList;

    for (let index = 0; index < length; index++) {
      argumentsList[index] = getTypeCheckedChild(wrapFn, info, String(index), argumentsList[index]);
    }
  }

  return argumentsList;
};

const applyFunctionFactory = wrapFn => (target, thisArg, argumentsList) => {
  const info = getTargetInfo(target);
  const {
    names,
    data,
    checker
  } = info;

  if (checker.arguments) {
    checker.arguments(target, names, argumentsList, data, thisArg);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)) {
    argumentsList = getTargetArguments(wrapFn, info, argumentsList);
  }

  let result = target.apply(thisArg, argumentsList);

  if (checker.returnValue) {
    checker.returnValue(target, names, result, data, thisArg);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, info)) {
    result = getTypeCheckedChild(wrapFn, info, 'returnValue', result);
  }

  return result;
};

const constructFactory = wrapFn => (Target, argumentsList) => {
  const info = getTargetInfo(Target);
  const {
    names,
    data,
    checker
  } = info;

  if (checker.arguments) {
    checker.arguments(Target, names, argumentsList, data);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)) {
    argumentsList = getTargetArguments(wrapFn, info, argumentsList);
  }

  let result = new Target(...argumentsList);

  if (checker.returnValue) {
    checker.returnValue(Target, names, result, data);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, info)) {
    result = getTypeCheckedChild(wrapFn, info, 'returnValue', result);
  }

  return result;
};

const deletePropertyFactory = () => (target, property) => {
  if (property === INFO_KEY) {
    return delete target[property];
  } else if (property === TARGET_KEY) {
    return false;
  }

  const info = getTargetInfo(target);
  const {
    names,
    data,
    checker
  } = info;
  checker.deleteProperty(target, names.clone(property), data);
  return delete target[property];
};

/* eslint-disable import/prefer-default-export */
const createInfoFromOptions = (target, {
  checker = getDefaultTypeChecker(),
  deep,
  name,
  data,
  children,
  info = null // exclusive option, if set other options being ignored

} = {}) => info || createTargetInfo(checker, checker.init(target, data), deep, pathSequenceToString.createPathSequence(name), children);

const generateHandlers = (create, config = null) => ({
  get: (!config || config.get) && getPropertyFactory(create),
  set: (!config || config.set) && setPropertyFactory(create),
  apply: (!config || config.apply) && applyFunctionFactory(create),
  construct: (!config || config.construct) && constructFactory(create),
  deleteProperty: (!config || config.deleteProperty) && deletePropertyFactory(create)
});

const createWrapFactory = proxyConfig => {
  let wrapInternal;

  const assignInfoAndWrap = (target, info) => {
    setTargetInfo(target, info);
    return wrapInternal(target);
  };

  const handlers = generateHandlers(assignInfoAndWrap, proxyConfig);
  wrapInternal = withProxy(handlers);
  return assignInfoAndWrap;
};
const wrap = (target, options, proxyConfig = null) => {
  if (!isWrappable(target) || !isEnabled()) {
    return target;
  }

  const wrapInternal = createWrapFactory(proxyConfig);
  const info = createInfoFromOptions(target, options);
  return wrapInternal(target, info);
};

/* eslint-disable import/prefer-default-export */

const deepInitializer = (target, info) => {
  const {
    names,
    checker,
    data
  } = info;
  Object.keys(target).forEach(name => {
    const value = target[name];
    const nextNames = names.clone(name);

    if (checker.getProperty) {
      checker.getProperty(target, nextNames, value, data);
    }

    if (isWrappable(value)) {
      let childInfo = info.getChild(name);

      if (!childInfo) {
        childInfo = info.createChildWithNames(nextNames, value);
      }

      deepInitializer(value, childInfo);
    }
  });
  setTargetInfo(target, info);
  return info;
};

const wrapDeep = (target, options, proxyConfig = null) => {
  if (!isWrappable(target) || typeof target !== 'object' || !isEnabled()) {
    return target;
  }

  const wrapInternal = createWrapFactory(proxyConfig);
  const info = createInfoFromOptions(target, options);
  deepInitializer(target, info);
  return wrapInternal(target, info);
};

exports.getDefaultTypeChecker = getDefaultTypeChecker;
exports.setDefaultTypeChecker = setDefaultTypeChecker;
exports.isEnabled = isEnabled;
exports.setEnabled = setEnabled;
exports.addIgnoredClasses = addIgnoredClasses;
exports.isIgnoredClass = isIgnoredClass;
exports.isValueOfIgnoredClass = isValueOfIgnoredClass;
exports.removeIgnoredClasses = removeIgnoredClasses;
exports.getWrapConfig = getWrapConfig;
exports.setWrapConfig = setWrapConfig;
exports.getWrapConfigValue = getWrapConfigValue;
exports.getTargetInfo = getTargetInfo;
exports.getTypeChecker = getTypeChecker;
exports.getTypeCheckerData = getTypeCheckerData;
exports.removeTargetInfo = removeTargetInfo;
exports.wrap = wrap;
exports.wrapDeep = wrapDeep;
exports.isWrappable = isWrappable;
exports.isWrapped = isWrapped;
exports.unwrap = unwrap;
exports.setWrapConfigTo = setWrapConfigTo;
//# sourceMappingURL=index.js.map
