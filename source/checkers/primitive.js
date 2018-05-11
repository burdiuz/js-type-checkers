import {
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  MERGE,
  buildPath,
} from './utils';

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

  getProperty(target, name, value, { types, errorReporter }, sequence) {
    return checkType(
      GET_PROPERTY,
      types,
      name,
      this.getTypeString(value),
      errorReporter,
      sequence,
    );
  },

  setProperty(target, name, newValue, { types, errorReporter }, sequence) {
    return checkType(
      SET_PROPERTY,
      types,
      name,
      this.getTypeString(newValue),
      errorReporter,
      sequence,
    );
  },

  arguments(target, thisArg, args, { types, errorReporter }, sequence) {
    const { length } = args;
    let valid = true;

    for (let index = 0; index < length; index++) {
      const agrValid = checkType(
        ARGUMENTS,
        types,
        String(index),
        this.getTypeString(args[index]),
        errorReporter,
        sequence,
      );

      valid = agrValid && valid;
    }

    return valid;
  },

  returnValue(target, thisArg, value, { types, errorReporter }, sequence) {
    return checkType(
      RETURN_VALUE,
      types,
      '',
      this.getTypeString(value),
      errorReporter,
      sequence,
    );
  },
};

export default PrimitiveTypeChecker;
