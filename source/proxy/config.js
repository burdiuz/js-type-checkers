import hasOwn from '@actualwave/has-own';

export const PROXY_WRAP_FUNCTION_RETURN_VALUES = 'wrapFunctionReturnValues';
export const PROXY_WRAP_FUNCTION_ARGUMENTS = 'wrapFunctionArguments';
export const PROXY_WRAP_SET_PROPERTY_VALUES = 'wrapSetPropertyValues';
export const PROXY_IGNORE_PROTOTYPE_METHODS = 'ignorePrototypeMethods';

export const getDefaultProxyConfig = () => ({
  [PROXY_WRAP_FUNCTION_RETURN_VALUES]: true,
  [PROXY_WRAP_FUNCTION_ARGUMENTS]: false,
  [PROXY_WRAP_SET_PROPERTY_VALUES]: true,
  [PROXY_IGNORE_PROTOTYPE_METHODS]: false,
});

const config = getDefaultProxyConfig();

export const setProxyConfig = (newConfig) => Object.assign(config, newConfig);

export const getProxyConfig = () => ({ ...config });

export const getProxyConfigValue = (key, info = null) =>
  (hasOwn(info, key) ? info[key] : config[key]);
