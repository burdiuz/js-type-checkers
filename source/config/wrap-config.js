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
  getValue: getWrapConfigValue,
} = mapConfigFactory({
  [WRAP_FUNCTION_RETURN_VALUES]: true,
  [WRAP_FUNCTION_ARGUMENTS]: false,
  [WRAP_SET_PROPERTY_VALUES]: true,
  [WRAP_IGNORE_PROTOTYPE_METHODS]: false,
});

export const getWrapConfigInternal = () => values;

export { getDefaultWrapConfig, getWrapConfig, setWrapConfig, getWrapConfigValue };
