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

  const getTargetInfo = target => {
    return target ? target[INFO_KEY] : undefined;
  };

  const setTargetInfo = (target, info) => {
    if (target && info) {
      target[INFO_KEY] = info;
    }
  };

  const hasTargetInfo = target => !!getTargetInfo(target);

  const getTargetTypeChecker = target => {
    return target && target[INFO_KEY] ? target[INFO_KEY].checker : undefined;
  };

  const getTargetTypeCheckerConfig = target => {
    return target && target[INFO_KEY] ? target[INFO_KEY].config : undefined;
  };

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

  const config = {
    wrapFunctionReturnValues: true,
    wrapFunctionArguments: false,
    wrapSetPropertyValues: true
  };

  const setProxyConfig = newConfig => Object.assign(config, newConfig);

  const getProxyConfig = () => Object.assign({}, config);

  const TARGET_KEY = Symbol('type-checkers::target');

  const validTypes = {
    object: true,
    function: true
  };

  const isValidTarget = target => target && validTypes[typeof target];
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

    if (!isValidTarget(value) || isTypeChecked(value)) {
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
      target[property] = value;
      return true;
    }

    return false;
  };

  const setTargetProperty = (createFn, target, property, value) => {
    if (config.wrapSetPropertyValues) {
      const { deep, names, checker, children } = getTargetInfo(target);

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

    const { names, config: config$$1, checker } = getTargetInfo(target);

    if (checker.setProperty) {
      checker.setProperty(target, property, value, config$$1, names);
    }

    return setNonTargetProperty(target, property, value) || setTargetProperty(createFn, target, property, value);
  };

  const getTargetArguments = (createFn, target, argumentsList) => {
    if (config.wrapFunctionArguments) {
      const { deep, names, checker } = getTargetInfo(target);
      const { length } = argumentsList;
      // FIXME cache arguments info objects as children
      for (let index = 0; index < length; index++) {
        argumentsList[index] = createFn(argumentsList[index], { deep, names: [...names, index], checker });
      }
    }

    return argumentsList;
  };
  const getTargetReturnValue = (createFn, target, returnValue) => {
    if (config.wrapFunctionReturnValues) {
      const { deep, names, checker, children } = getTargetInfo(target);

      if (!isTypeChecked(returnValue)) {
        const childInfo = getChildInfo(children, RETURN_VALUE);

        if (childInfo) {
          returnValue = createFn(returnValue, { info: childInfo });
        } else {
          returnValue = createFn(returnValue, { deep, names: [...names], checker });
        }
      }

      storeChildInfoFrom(children, RETURN_VALUE, returnValue);
    }

    return returnValue;
  };

  const callFunction = createFn => (target, thisArg, argumentsList) => {
    const info = getTargetInfo(target);
    const { names, config: config$$1, checker } = info;

    if (checker.arguments) {
      checker.arguments(target, thisArg, argumentsList, config$$1, names);
    }

    argumentsList = getTargetArguments(createFn, target, argumentsList);

    const result = target.apply(thisArg, argumentsList);

    if (checker.returnValue) {
      checker.returnValue(target, thisArg, result, config$$1, names);
    }

    return getTargetReturnValue(createFn, target, result);
  };

  let getProperty$1;
  let setProperty$1;
  let callFunction$1;

  const objectProxy = target => new Proxy(target, {
    get: getProperty$1,
    set: setProperty$1
  });

  const functionProxy = target => new Proxy(target, {
    apply: callFunction$1,
    construct: callFunction$1
  });

  const wrapWithProxy = target => {
    if (target instanceof Function) {
      return functionProxy(target);
    }

    return objectProxy(target);
  };

  const create = (target, {
    deep = true,
    names = [],
    config = null,
    children = null,
    checker = getDefaultTypeChecker(),
    info = null // exclusive option, if set other options being ignored
  } = {}) => {
    if (!isValidTarget(target) || !isEnabled() || isTypeChecked(target)) {
      return target;
    }

    setTargetInfo(target, info || createTargetInfo(checker, checker.init(target, getErrorReporter(), config), deep, names, createChildrenCache(children)));

    return wrapWithProxy(target);
  };
  getProperty$1 = getProperty(create);
  setProperty$1 = setProperty(create);
  callFunction$1 = callFunction(create);

  const deepInitializer = obj => {
    for (const name in obj) {
      const value = obj[name];

      if (typeof value === 'object') {
        deepInitializer(value);
      }
    }
  };

  // FIXME initialize info without creating proxies and create proxy only for root object
  // will skip functions/methods since we get info about them only when being executed
  const createDeep = (target, options) => {
    if (!target || target !== 'object' || !isEnabled() || isTypeChecked(target)) {
      return target;
    }

    const typeChecked = create(target, Object.assign({}, options, {
      deep: true
    }));

    deepInitializer(typeChecked);

    return typeChecked;
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

  exports.getDefaultTypeChecker = getDefaultTypeChecker;
  exports.setDefaultTypeChecker = setDefaultTypeChecker;
  exports.ConsoleErrorReporter = ConsoleErrorReporter;
  exports.ConsoleWarnReporter = ConsoleWarnReporter;
  exports.ThrowErrorReporter = ThrowErrorReporter;
  exports.getErrorReporter = getErrorReporter;
  exports.setErrorReporter = setErrorReporter;
  exports.isEnabled = isEnabled;
  exports.setEnabled = setEnabled;
  exports.getTargetInfo = getTargetInfo;
  exports.hasTargetInfo = hasTargetInfo;
  exports.setTargetInfo = setTargetInfo;
  exports.getTargetTypeChecker = getTargetTypeChecker;
  exports.getTargetTypeCheckerConfig = getTargetTypeCheckerConfig;
  exports.mergeTargetInfo = mergeTargetInfo;
  exports.objectMerge = objectMerge;
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
