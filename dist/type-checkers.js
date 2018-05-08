(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.TypeCheckers = {})));
}(this, (function (exports) { 'use strict';

  let defaultTypeChecker;

  const getDefaultTypeChecker = () => defaultTypeChecker;
  const setDefaultTypeChecker = typeChecker => defaultTypeChecker = typeChecker;

  const constructErrorString = (action, name, required, actual) => `TypeChecker error for "${action}" on "${name}" instead of "${required}" received "${actual}"`;

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
  const setEnabled = value => enabled = !!value;

  const configKey = Symbol('data-checkers::config');

  const getConfig = target => target[configKey];
  const setConfig = (target, config) => target[configKey] = config;

  const getTargetTypeChecker = target => target[configKey] && target[configKey].typeChecker;
  const getTargetTypeCheckerConfig = target => target[configKey] && target[configKey].config;

  const validTypes = {
    object: true,
    function: true
  };

  const isValidTarget = target => target && validTypes[typeof target];

  const getProperty = (target, property) => {
    // if object or function and deep -- wrap
    const value = target[property];

    if (property === configKey) {
      return value;
    }

    const { deep, names, config, typeChecker } = getConfig(target);

    typeChecker.getProperty && typeChecker.getProperty(target, property, value, config, names);

    if (deep && isValidTarget(value) || value instanceof Function) {
      const { children } = getConfig(target);

      if (!children.hasOwnProperty(property)) {
        children[property] = create(value, { deep, names: [...names, property] }, typeChecker);
      }

      return children[property];
    }

    return value;
  };

  const setProperty = (target, property, value, receiver) => {
    const { names, config, children, typeChecker } = getConfig(target);

    if (property !== configKey) {
      delete children[property];
      typeChecker.setProperty && typeChecker.setProperty(target, property, value, config, names);
    }

    target[property] = value;
  };

  const callFunction = (target, thisArg, argumentsList) => {
    const { names, config, typeChecker } = getConfig(target);

    typeChecker.arguments && typeChecker.arguments(target, thisArg, argumentsList, config, names);

    const result = target.apply(thisArg, argumentsList);

    typeChecker.returnValue && typeChecker.returnValue(target, thisArg, result, config, names);

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

  const create = (target, { deep = true, names = [] } = {}, typeChecker = getDefaultTypeChecker()) => {
    if (!isValidTarget(target) || !isEnabled() || getConfig(target)) {
      return target;
    }

    setConfig(target, {
      deep,
      names,
      children: {},
      typeChecker,
      config: typeChecker.init(target, getErrorReporter())
    });

    if (target instanceof Function) {
      return functionProxy(target);
    }

    return objectProxy(target);
  };

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

  const GET_PROPERTY = 'getProperty';
  const SET_PROPERTY = 'setProperty';
  const ARGUMENTS = 'arguments';
  const RETURN_VALUE = 'returnValue';

  const PrimitiveTypeChecker = {
    collectTypesOnInit: true,

    getTypeString(value) {
      if (value === undefined) {
        return '';
      } else if (value instanceof Array) {
        return 'array';
      }

      return typeof value;
    },

    init(target, errorReporter) {
      const types = {};

      if (this.collectTypesOnInit) {
        Object.keys(target).forEach(key => {
          types[key] = this.getTypeString(target[key]);
        });
      }

      return {
        types,
        errorReporter
      };
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

  setDefaultTypeChecker(PrimitiveTypeChecker);

  exports.getDefaultTypeChecker = getDefaultTypeChecker;
  exports.setDefaultTypeChecker = setDefaultTypeChecker;
  exports.ConsoleErrorReporter = ConsoleErrorReporter;
  exports.ConsoleWarnReporter = ConsoleWarnReporter;
  exports.getErrorReporter = getErrorReporter;
  exports.setErrorReporter = setErrorReporter;
  exports.ThrowErrorReporter = ThrowErrorReporter;
  exports.isEnabled = isEnabled;
  exports.setEnabled = setEnabled;
  exports.getTargetTypeChecker = getTargetTypeChecker;
  exports.getTargetTypeCheckerConfig = getTargetTypeCheckerConfig;
  exports.create = create;
  exports.isValidTarget = isValidTarget;
  exports.default = create;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=type-checkers.js.map
