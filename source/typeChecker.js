const buildPath = sequence => sequence
  .reduce((str, name) => {
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
