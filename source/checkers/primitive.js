import {
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  INDEX,
  MERGE,
  buildPath,
  AsIs,
} from './utils';

import { getTargetTypeCheckerConfig } from '../target/info';

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

export const isIndexAccessTarget = (target) =>
  (target && indexBasedClasses.indexOf(target.constructor) >= 0);

export const getTypeString = (value) => {
  if (value === undefined) {
    return '';
  } else if (value instanceof Array) {
    return 'array';
  }

  return typeof value;
};

export const mergeConfigs = ({ types, errorReporter }, source, names = []) => {
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

  return { types, errorReporter };
};

export const replacePropertyTypeCheck = (target, name, typeCheckFn) => {
  const { types } = getTargetTypeCheckerConfig(target);
  delete types[name];

  if (typeCheckFn) {
    types[name] = typeCheckFn;
  }
};

export const replaceArgumentsTypeCheck = (target, argumentsTypeCheckFn) => {
  const { types } = getTargetTypeCheckerConfig(target);
  delete types[ARGUMENTS];

  if (argumentsTypeCheckFn) {
    types[ARGUMENTS] = argumentsTypeCheckFn;
  }
};

export const replaceReturnValueTypeCheck = (target, returnValueTypeCheckFn) => {
  const { types } = getTargetTypeCheckerConfig(target);
  delete types[RETURN_VALUE];

  if (returnValueTypeCheckFn) {
    types[RETURN_VALUE] = returnValueTypeCheckFn;
  }
};

export const registerIndexBasedClass = (constructor) => {
  indexBasedClasses.push(constructor);
};

export const setIndexValueType = (target, type) => {
  const config = getTargetTypeCheckerConfig(target);
  if (config) {
    config.types[INDEX] = type;
  }
};

export const setIndexValueTypeBy = (target, value) => {
  setIndexValueType(target, getTypeString(value));
};

export const replaceIndexedTypeCheck = (target, typeCheckFn) => {
  const { types } = getTargetTypeCheckerConfig(target);
  delete types[INDEX];

  if (typeCheckFn) {
    types[INDEX] = typeCheckFn;
  }
};

const PrimitiveTypeChecker = {
  collectTypesOnInit: true,
  areArrayElementsOfSameType: true,

  init(target, errorReporter, cachedTypes = null) {
    let types = {};

    if (cachedTypes) {
      types = cachedTypes;
    } else if (this.collectTypesOnInit) {
      if (this.areArrayElementsOfSameType && target instanceof Array) {
        const indexType = getTypeString(target
        .find((item) => (typeof item !== 'undefined')));

        if (indexType) {
          types[INDEX] = indexType;
        }
      } else {
        Object.keys(target)
          .forEach((key) => {
            types[key] = getTypeString(target[key]);
          });
      }
    }

    return {
      types,
      errorReporter,
    };
  },

  getProperty(target, name, value, config, sequence) {
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
  replaceIndexedTypeCheck,
};

export default PrimitiveTypeChecker;
