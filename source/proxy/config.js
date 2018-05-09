export const config = {
  wrapFunctionReturnValues: true,
  wrapFunctionArguments: false,
  wrapSetPropertyValues: true,
};

export const setProxyConfig = (newConfig) => Object.assign(config, newConfig);

export const getProxyConfig = () => ({ ...config });
