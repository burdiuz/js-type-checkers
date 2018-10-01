import { mapConfigFactory } from './utils';

export const WRAP_FUNCTION_RETURN_VALUES = 'wrapFunctionReturnValues';
export const WRAP_FUNCTION_ARGUMENTS = 'wrapFunctionArguments';
export const WRAP_SET_PROPERTY_VALUES = 'wrapSetPropertyValues';
export const WRAP_IGNORE_PROTOTYPE_METHODS = 'ignorePrototypeMethods';

const {
  values,
  getDefault: getDefaultWrapConfig,
  get: getWrapConfig,
  set: setWrapConfig,
  getValue,
} = mapConfigFactory(
  {
    [WRAP_FUNCTION_RETURN_VALUES]: true,
    [WRAP_FUNCTION_ARGUMENTS]: false,
    [WRAP_SET_PROPERTY_VALUES]: false,
    [WRAP_IGNORE_PROTOTYPE_METHODS]: false,
  },
  (newValues) =>
    Object.keys(newValues).forEach((key) => {
      newValues[key] = !!newValues[key];
    }),
);

export const getWrapConfigInternal = () => values;

export const getWrapConfigValue = (name, target) => {
  let value = target[name];

  if (target) {
    value = target[name];
  }

  return value === undefined ? getValue(name) : value;
};

export { getDefaultWrapConfig, getWrapConfig, setWrapConfig };