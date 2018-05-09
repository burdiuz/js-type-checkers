(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.TypeCheckers = {})));
}(this, (function (exports) { 'use strict';

  const GET_PROPERTY = 'GetProperty';
  const SET_PROPERTY = 'SetProperty';
  const ARGUMENTS = 'Arguments';
  const RETURN_VALUE = 'ReturnValue';
  const MERGE = 'Merge';

  const buildPath = sequence => sequence.reduce((str, name) => {
    if (String(parseInt(name, 10)) === name) {
      str = `${str}[${name}]`;
    } else if (/^[a-z][\w$]*$/i.test(name)) {
      str = str ? `${str}.${name}` : name;
    } else {
      str = `${str}["${name}"]`;
    }

    return str;
  }, '');

  const checkType = (action, types, name, type, errorReporter, sequence) => {
    if (!type) {
      return true;
    }

    const storedType = types[name];

    if (storedType) {
      // TODO add possibility to store function in types[name] that can be called to identify if there are type error
      if (storedType !== type) {
        errorReporter(action, buildPath([...sequence, name]), types[name], type);

        return false;
      }
    } else {
      types[name] = type;
    }

    return true;
  };

  const PrimitiveTypeChecker = {
    collectTypesOnInit: true,

    init(target, errorReporter, cachedTypes = null) {
      let types = {};

      if (cachedTypes) {
        types = cachedTypes;
      } else if (this.collectTypesOnInit) {
        Object.keys(target).forEach(key => {
          types[key] = this.getTypeString(target[key]);
        });
      }

      return {
        types,
        errorReporter
      };
    },

    getTypeString(value) {
      if (value === undefined) {
        return '';
      } else if (value instanceof Array) {
        return 'array';
      }

      return typeof value;
    },

    mergeConfigs({ types, errorReporter }, source, names = []) {
      const sourceTypes = source.types;

      for (const name in sourceTypes) {
        const sourceType = sourceTypes[name];
        const targetType = types[name];

        if (sourceType && targetType && targetType !== sourceType) {
          errorReporter(MERGE, buildPath([...names, name]), targetType, sourceType);
        } else {
          types[name] = sourceType;
        }
      }
    },

    getProperty(target, name, value, { types, errorReporter }, sequence) {
      return checkType(GET_PROPERTY, types, name, this.getTypeString(value), errorReporter, sequence);
    },

    setProperty(target, name, newValue, { types, errorReporter }, sequence) {
      return checkType(SET_PROPERTY, types, name, this.getTypeString(newValue), errorReporter, sequence);
    },

    arguments(target, thisArg, args, { types, errorReporter }, sequence) {
      const { length } = args;
      let valid = true;

      for (let index = 0; index < length; index++) {
        const agrValid = checkType(ARGUMENTS, types, String(index), this.getTypeString(args[index]), errorReporter, sequence);

        valid = agrValid && valid;
      }

      return valid;
    },

    returnValue(target, thisArg, value, { types, errorReporter }, sequence) {
      return checkType(RETURN_VALUE, types, '', this.getTypeString(value), errorReporter, sequence);
    }
  };

  let defaultTypeChecker = PrimitiveTypeChecker;

  const getDefaultTypeChecker = () => defaultTypeChecker;
  const setDefaultTypeChecker = typeChecker => defaultTypeChecker = typeChecker;

  const constructErrorString = (action, name, required, actual) => `${action}Error on "${name}" instead of "${required}" received "${actual}"`;

  const ConsoleErrorReporter = (action, name, requiredTypeString, actualTypeString) => console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));

  const ConsoleWarnReporter = (action, name, requiredTypeString, actualTypeString) => console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));

  const ThrowErrorReporter = (action, name, requiredTypeString, actualTypeString) => {
    throw new Error(constructErrorString(action, name, requiredTypeString, actualTypeString));
  };

  let errorReporter = ConsoleErrorReporter;

  const getErrorReporter = () => errorReporter;

  const setErrorReporter = reporter => errorReporter = reporter;

  let enabled = true;

  const isEnabled = () => enabled;
  const setEnabled = (value = true) => enabled = !!value;

  const INFO_KEY = Symbol('type-checkers::info');

  const createTargetInfo = (checker, config, deep = true, names = [], children = createChildrenCache()) => ({
    checker,
    config,
    deep,
    names,
    children
  });
  const getTargetInfo = target => target[INFO_KEY];
  const setTargetInfo = (target, info) => target[INFO_KEY] = info;
  const getTargetTypeChecker = target => getTargetInfo(target).checker;
  const getTargetTypeCheckerConfig = target => getTargetInfo(target).config;

  const createChildrenCache = (children = {}) => Object.assign({}, children);

  const mergeChildrenCache = (targetCache, sourceCache) => {
    for (const name in sourceCache) {
      if (targetCache.hasOwnProperty(name)) {
        targetCache[name] = mergeTargetInfo(targetCache[name], sourceCache[name]);
      } else {
        targetCache[name] = sourceCache[name];
      }
    }

    return targetCache;
  };

  const storeChildInfo = (cache, name, childInfo) => {
    // FIXME shoud it merge or just reassign?
    cache[name] = childInfo;
  };

  const storeChildInfoFrom = (cache, name, child) => {
    storeChildInfo(cache, name, getTargetInfo(child));
  };

  const getChildInfo = (cache, name) => cache[name];

  const mergeTargetInfo = (targetInfo, sourceInfo) => {
    const { checker, children, config, names } = targetInfo;

    if (checker === sourceInfo.checker) {
      targetInfo.children = mergeChildrenCache(children, sourceInfo.children);
      targetInfo.config = checker.mergeConfigs(config, sourceInfo.config, names);
    } else {
      console.error('TypeChecked objects can be merged only if using exactly same instance of type checker.');
    }

    return targetInfo;
  };

  const assignTargetInfo = (targetInfo, ...sourceInfo) => {
    const { length } = sourceInfo;

    for (let index = 0; index < length; index++) {
      const item = sourceInfo[index];

      if (item) {
        if (targetInfo) {
          targetInfo = mergeTargetInfo(targetInfo, item);
        } else {
          targetInfo = item;
        }
      }
    }

    return targetInfo;
  };

  const assignTargetInfoFrom = (target, ...sources) => {
    const { length } = sources;
    let targetInfo = getTargetInfo(target);

    for (let index = 0; index < length; index++) {
      const sourceInfo = sources[index];

      if (sourceInfo) {
        if (targetInfo) {
          targetInfo = mergeTargetInfo(targetInfo, sourceInfo);
        } else {
          targetInfo = sourceInfo;
        }
      }
    }

    setTargetInfo(target, targetInfo);
    return target;
  };

  const config = {
    wrapFunctionReturnValues: true,
    wrapFunctionArguments: false,
    wrapSetPropertyValues: true
  };

  const setProxyConfig = newConfig => Object.assign(config, newConfig);

  const getProxyConfig = () => Object.assign({}, config);

  const validTypes = {
      object: true,
      function: true
  };

  const isValidTarget = target => target && validTypes[typeof target];
  const isTypeChecked = target => !!getTargetInfo(target);

  const getProperty = (target, property) => {
    let value = target[property];

    if (property === INFO_KEY) {
      return value;
    }

    const info = getTargetInfo(target);
    const { deep, names, config: config$$1, checker } = info;

    checker.getProperty && checker.getProperty(target, property, value, config$$1, names);

    if (!isValidTarget(value) || isTypeChecked(value)) {
      return value;
    }

    if (deep || value instanceof Function) {
      const { children } = info;
      const childInfo = getChildInfo(children, name);

      if (childInfo) {
        value = create(value, { info: childInfo }, checker);
      } else {
        value = create(value, { deep, names: [...names, property] }, checker);
        storeChildInfoFrom(children, name, value);
      }
    }

    return value;
  };

  const setProperty = (target, property, value) => {
    const info = getTargetInfo(target);
    const { deep, names, config: config$$1, checker } = info;

    if (property !== INFO_KEY) {
      checker.setProperty && checker.setProperty(target, property, value, config$$1, names);

      if (config.wrapSetPropertyValues) {
        const { children } = info;

        if (!isTypeChecked(value)) {
          const childInfo = getChildInfo(children, name);

          if (childInfo) {
            value = create(value, { info: childInfo }, checker);
          } else {
            value = create(value, { deep, names: [...names, property] }, checker);
          }
        }

        storeChildInfoFrom(children, name, value);
      }
    }

    target[property] = value;
  };

  const callFunction = (target, thisArg, argumentsList) => {
    const info = getTargetInfo(target);
    const { deep, names, config: config$$1, checker } = info;

    checker.arguments && checker.arguments(target, thisArg, argumentsList, config$$1, names);

    if (config.wrapFunctionArguments) {
      const { length } = argumentsList;
      for (let index = 0; index < length; index++) {
        argumentsList[index] = create(argumentsList[index], { deep, names: [...names, index] }, checker);
      }
    }

    let result = target.apply(thisArg, argumentsList);

    checker.returnValue && checker.returnValue(target, thisArg, result, config$$1, names);

    if (config.wrapFunctionReturnValues) {
      const { children } = info;

      if (!isTypeChecked(result)) {
        const childInfo = getChildInfo(children, RETURN_VALUE);

        if (childInfo) {
          result = create(result, { info: childInfo }, checker);
        } else {
          result = create(result, { deep, names: [...names] }, checker);
        }
      }

      storeChildInfoFrom(children, RETURN_VALUE, result);
    }
    return result;
  };

  const objectProxy = target => new Proxy(target, {
    get: getProperty,
    set: setProperty
  });

  const functionProxy = target => new Proxy(target, {
    apply: callFunction,
    construct: callFunction
  });

  const create = (target, {
    deep = true,
    names = [],
    config: config$$1 = null,
    children = null,
    info = null // exclusive option, if set other options being ignored
  } = {}, checker = getDefaultTypeChecker()) => {
    if (!isValidTarget(target) || !isEnabled() || isTypeChecked(target)) {
      return target;
    }

    setTargetInfo(target, info || createTargetInfo(checker, checker.init(target, getErrorReporter(), config$$1), deep, names, createChildrenCache(children)));

    if (target instanceof Function) {
      return functionProxy(target);
    }

    return objectProxy(target);
  };

  const createDeep = () => {
    // FIXME add new factory function createDeep, it will have deep == true by default and init type checkers for all internal objects 
    // and functions by reassigning original values with type checked proxies
    // when creating checkers for children objects should check cached info
  };

  exports.getDefaultTypeChecker = getDefaultTypeChecker;
  exports.setDefaultTypeChecker = setDefaultTypeChecker;
  exports.ConsoleErrorReporter = ConsoleErrorReporter;
  exports.ConsoleWarnReporter = ConsoleWarnReporter;
  exports.ThrowErrorReporter = ThrowErrorReporter;
  exports.getErrorReporter = getErrorReporter;
  exports.setErrorReporter = setErrorReporter;
  exports.isEnabled = isEnabled;
  exports.setEnabled = setEnabled;
  exports.getTargetTypeChecker = getTargetTypeChecker;
  exports.getTargetTypeCheckerConfig = getTargetTypeCheckerConfig;
  exports.assignTargetInfo = assignTargetInfo;
  exports.assignTargetInfoFrom = assignTargetInfoFrom;
  exports.mergeTargetInfo = mergeTargetInfo;
  exports.getProxyConfig = getProxyConfig;
  exports.setProxyConfig = setProxyConfig;
  exports.create = create;
  exports.createDeep = createDeep;
  exports.isTypeChecked = isTypeChecked;
  exports.isValidTarget = isValidTarget;
  exports.default = create;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=type-checkers.js.map
