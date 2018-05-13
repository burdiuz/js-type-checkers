(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.TypeCheckers = {})));
}(this, (function (exports) { 'use strict';

  const GET_PROPERTY = '(GetProperty)';
  const SET_PROPERTY = '(SetProperty)';
  const INDEX = '(Index)';
  const ARGUMENTS = '(Arguments)';
  const RETURN_VALUE = '(ReturnValue)';
  const MERGE = '(Merge)';

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

  const buildPath = sequence => sequence.reduce((str, name) => {
    if (name instanceof AsIs) {
      str = `${str}${name}`;
    } else if (String(parseInt(name, 10)) === name) {
      str = `${str}[${name}]`;
    } else if (/^[a-z][\w$]*$/i.test(name)) {
      str = str ? `${str}.${name}` : name;
    } else {
      str = `${str}["${name}"]`;
    }

    return str;
  }, '');

  const INFO_KEY = Symbol('type-checkers::info');

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

  const getTargetTypeCheckerConfig = target => target && target[INFO_KEY] ? target[INFO_KEY].config : undefined;

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

  const checkPrimitiveType = (action, types, name, type, errorReporter, sequence) => {
    if (!type) {
      return true;
    }

    const storedType = types[name];

    if (storedType) {
      if (storedType !== type) {
        errorReporter(action, buildPath([...sequence, name]), storedType, type);

        return false;
      }
    } else {
      types[name] = type;
    }

    return true;
  };

  const indexBasedClasses = [Array];

  const isIndexAccessTarget = target => target && indexBasedClasses.indexOf(target.constructor) >= 0;

  const getTypeString = value => {
    if (value === undefined) {
      return '';
    } else if (value instanceof Array) {
      return 'array';
    }

    return typeof value;
  };

  const mergeConfigs = ({ types, errorReporter }, source, names = []) => {
    const sourceTypes = source.types;

    for (const name in sourceTypes) {
      if (sourceTypes.hasOwnProperty(name)) {
        const sourceType = sourceTypes[name];
        const targetType = types[name];

        if (sourceType && targetType && targetType !== sourceType) {
          errorReporter(MERGE, buildPath([...names, name]), targetType, sourceType);
        } else {
          types[name] = sourceType;
        }
      }
    }
  };

  const replacePropertyTypeCheck = (target, name, typeCheckFn) => {
    const { types } = getTargetTypeCheckerConfig(target);
    delete types[name];

    if (typeCheckFn) {
      types[name] = typeCheckFn;
    }
  };

  const replaceArgumentsTypeCheck = (target, argumentsTypeCheckFn) => {
    const { types } = getTargetTypeCheckerConfig(target);
    delete types[ARGUMENTS];

    if (argumentsTypeCheckFn) {
      types[ARGUMENTS] = argumentsTypeCheckFn;
    }
  };

  const replaceReturnValueTypeCheck = (target, returnValueTypeCheckFn) => {
    const { types } = getTargetTypeCheckerConfig(target);
    delete types[RETURN_VALUE];

    if (returnValueTypeCheckFn) {
      types[RETURN_VALUE] = returnValueTypeCheckFn;
    }
  };

  const registerIndexBasedClass = constructor => {
    indexBasedClasses.push(constructor);
  };

  const setIndexValueType = (target, type) => {
    const config = getTargetTypeCheckerConfig(target);
    if (config) {
      config.types[INDEX] = type;
    }
  };

  const setIndexValueTypeBy = (target, value) => {
    setIndexValueType(target, getTypeString(value));
  };

  const replaceIndexedTypeCheck = (target, typeCheckFn) => {
    const { types } = getTargetTypeCheckerConfig(target);
    delete types[INDEX];

    if (typeCheckFn) {
      types[INDEX] = typeCheckFn;
    }
  };

  const PrimitiveTypeChecker = {
    collectTypesOnInit: true,
    areArrayElementsOfSameType: true,
    ignorePrototypeValues: false,

    init(target, errorReporter, cachedTypes = null) {
      let types = {};

      if (cachedTypes) {
        types = cachedTypes;
      } else if (this.collectTypesOnInit) {
        if (this.areArrayElementsOfSameType && target instanceof Array) {
          const indexType = getTypeString(target.find(item => typeof item !== 'undefined'));

          if (indexType !== 'undefined') {
            types[INDEX] = indexType;
          }
        } else {
          Object.keys(target).forEach(key => {
            types[key] = getTypeString(target[key]);
          });
        }
      }

      return {
        types,
        errorReporter
      };
    },

    getProperty(target, name, value, config, sequence) {
      if (!target.hasOwnProperty(name) && (this.ignorePrototypeValues || value instanceof Function)) {
        return true;
      }

      if (this.areArrayElementsOfSameType && isIndexAccessTarget(target)) {
        return this.getIndexProperty(target, INDEX, value, config, sequence);
      }

      return this.getNamedProperty(target, name, value, config, sequence);
    },

    getIndexProperty(target, name, value, config, sequence) {
      const { types, errorReporter } = config;
      const typeFn = types[name];

      if (typeFn instanceof Function) {
        return typeFn(GET_PROPERTY, target, name, value, config, sequence);
      }

      const type = getTypeString(value);

      return checkPrimitiveType(GET_PROPERTY, types, AsIs(INDEX), type, errorReporter, sequence);
    },

    getNamedProperty(target, name, value, config, sequence) {
      const { types, errorReporter } = config;
      const typeFn = types[name];

      if (typeFn instanceof Function) {
        return typeFn(GET_PROPERTY, target, name, value, config, sequence);
      }

      const type = getTypeString(value);

      return checkPrimitiveType(GET_PROPERTY, types, name, type, errorReporter, sequence);
    },

    setProperty(target, name, newValue, config, sequence) {
      if (this.areArrayElementsOfSameType && isIndexAccessTarget(target)) {
        return this.setIndexProperty(target, INDEX, newValue, config, sequence);
      }

      return this.setNamedProperty(target, name, newValue, config, sequence);
    },

    setIndexProperty(target, name, newValue, config, sequence) {
      const { types, errorReporter } = config;
      const typeFn = types[name];

      if (typeFn instanceof Function) {
        return typeFn(SET_PROPERTY, target, name, newValue, config, sequence);
      }

      const type = getTypeString(newValue);

      return checkPrimitiveType(SET_PROPERTY, types, AsIs(INDEX), type, errorReporter, sequence);
    },

    setNamedProperty(target, name, newValue, config, sequence) {
      const { types, errorReporter } = config;
      const typeFn = types[name];

      if (typeFn instanceof Function) {
        return typeFn(SET_PROPERTY, target, name, newValue, config, sequence);
      }

      const type = getTypeString(newValue);

      return checkPrimitiveType(SET_PROPERTY, types, name, type, errorReporter, sequence);
    },

    arguments(target, thisArg, args, config, sequence) {
      const { types, errorReporter } = config;
      const typeFn = types[ARGUMENTS];

      if (typeFn instanceof Function) {
        return typeFn(ARGUMENTS, target, args, config, sequence);
      }

      const { length } = args;
      let valid = true;

      for (let index = 0; index < length; index++) {
        const type = getTypeString(args[index]);
        const agrValid = checkPrimitiveType(ARGUMENTS, types, String(index), type, errorReporter, sequence);

        valid = agrValid && valid;
      }

      return valid;
    },

    returnValue(target, thisArg, value, config, sequence) {
      const { types, errorReporter } = config;
      const typeFn = types[RETURN_VALUE];

      if (typeFn instanceof Function) {
        return typeFn(RETURN_VALUE, target, value, config, sequence);
      }

      const type = getTypeString(value);

      return checkPrimitiveType(RETURN_VALUE, types, AsIs(RETURN_VALUE), type, errorReporter, sequence);
    },

    isIndexAccessTarget,
    getTypeString,
    mergeConfigs,
    replacePropertyTypeCheck,
    replaceArgumentsTypeCheck,
    replaceReturnValueTypeCheck,
    registerIndexBasedClass,
    setIndexValueType,
    setIndexValueTypeBy,
    replaceIndexedTypeCheck
  };

  let defaultTypeChecker = PrimitiveTypeChecker;

  const getDefaultTypeChecker = () => defaultTypeChecker;
  const setDefaultTypeChecker = typeChecker => {
    defaultTypeChecker = typeChecker;
  };

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
  const setEnabled = (value = true) => {
    enabled = !!value;
  };

  const TARGET_KEY = Symbol('type-checkers::target');

  const getOriginalTarget = target => {
    return target[TARGET_KEY] || target;
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
        argumentsList[index] = createFn(argumentsList[index], {
          deep,
          names: [...names, index],
          checker
        });
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

  exports.PrimitiveTypeChecker = PrimitiveTypeChecker;
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
  exports.getOriginalTarget = getOriginalTarget;
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
