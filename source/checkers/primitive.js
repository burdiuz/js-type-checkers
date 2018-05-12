import {
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  MERGE,
  buildPath,
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

const PrimitiveTypeChecker = {
  collectTypesOnInit: true,

  init(target, errorReporter, cachedTypes = null) {
    let types = {};

    if (cachedTypes) {
      types = cachedTypes;
    } else if (this.collectTypesOnInit) {
      Object.keys(target)
        .forEach((key) => {
          types[key] = this.getTypeString(target[key]);
        });
    }

    return {
      types,
      errorReporter,
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
  },

  replacePropertyTypeCheck(target, name, typeCheckFn) {
    const { types } = getTargetTypeCheckerConfig(target);
    delete types[name];

    if (typeCheckFn) {
      types[name] = typeCheckFn;
    }
  },

  replaceArgumentsTypeCheck(target, name, argumentsTypeCheckFn) {
    const { types } = getTargetTypeCheckerConfig(target);
    delete types[ARGUMENTS];

    if (argumentsTypeCheckFn) {
      types[name] = argumentsTypeCheckFn;
    }
  },

  replaceReturnValueTypeCheck(target, name, returnValueTypeCheckFn) {
    const { types } = getTargetTypeCheckerConfig(target);
    delete types[RETURN_VALUE];

    if (returnValueTypeCheckFn) {
      types[RETURN_VALUE] = returnValueTypeCheckFn;
    }
  },

  getProperty(target, name, value, config, sequence) {
    const { types, errorReporter } = config;
    const typeFn = types[name];

    if (typeFn instanceof Function) {
      return typeFn(GET_PROPERTY, target, name, value, config, sequence);
    }

    const type = this.getTypeString(value);

    return checkPrimitiveType(GET_PROPERTY, types, name, type, errorReporter, sequence);
  },

  setProperty(target, name, newValue, config, sequence) {
    const { types, errorReporter } = config;
    const typeFn = types[name];

    if (typeFn instanceof Function) {
      return typeFn(SET_PROPERTY, target, name, newValue, config, sequence);
    }

    const type = this.getTypeString(newValue);

    return checkPrimitiveType(
      SET_PROPERTY,
      types,
      name,
      type,
      errorReporter,
      sequence,
    );
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
      const type = this.getTypeString(args[index]);
      const agrValid = checkPrimitiveType(
        ARGUMENTS,
        types,
        String(index),
        type,
        errorReporter,
        sequence,
      );

      valid = agrValid && valid;
    }

    return valid;
  },

  returnValue(target, thisArg, value, config, sequence) {
    const { types, errorReporter } = config;
    const typeFn = types[RETURN_VALUE];

    if (typeFn instanceof Function) {
      return typeFn(ARGUMENTS, target, value, config, sequence);
    }

    const type = this.getTypeString(value);

    return checkPrimitiveType(
      RETURN_VALUE,
      types,
      RETURN_VALUE,
      type,
      errorReporter,
      sequence,
    );
  },
};

export default PrimitiveTypeChecker;
