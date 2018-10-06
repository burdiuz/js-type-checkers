import { valuesMapFactory } from '@actualwave/closure-value';

export const WRAP_FUNCTION_RETURN_VALUES = 'wrapFunctionReturnValues';
export const WRAP_FUNCTION_ARGUMENTS = 'wrapFunctionArguments';
export const WRAP_SET_PROPERTY_VALUES = 'wrapSetPropertyValues';
export const WRAP_IGNORE_PROTOTYPE_METHODS = 'ignorePrototypeMethods';

const { getDefault: getDefaultWrapConfig, set: setWrapConfigValue, get } = valuesMapFactory(
  [
    [WRAP_FUNCTION_RETURN_VALUES, true],
    [WRAP_FUNCTION_ARGUMENTS, false],
    [WRAP_SET_PROPERTY_VALUES, false],
    [WRAP_IGNORE_PROTOTYPE_METHODS, false],
  ],
  (key, value) => !!value,
);

export const getWrapConfigValue = (name, target) => {
  let value;

  if (target) {
    value = target[name];
  }

  return value === undefined ? get(name) : value;
};

export { getDefaultWrapConfig, setWrapConfigValue };
