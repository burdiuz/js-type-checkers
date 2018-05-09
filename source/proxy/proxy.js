import { getDefaultTypeChecker } from './defaultTypeChecker';
import { getErrorReporter } from './errorReporter';
import { isEnabled } from './enabled';
import { getConfig, setConfig, configKey } from './targetConfig';
import { proxyOptions } from './proxyOptions';

const validTypes = {
  object: true,
  function: true,
};

export const isValidTarget = (target) => target && validTypes[typeof target];

const getProperty = (target, property) => {
  // if object or function and deep -- wrap
  const value = target[property];

  if (property === configKey) {
    return value;
  }

  const { deep, names, config, typeChecker } = getConfig(target);

  typeChecker.getProperty
  && typeChecker.getProperty(target, property, value, config, names);

  if ((deep && isValidTarget(value)) || value instanceof Function) {
    const { children } = getConfig(target);

    if (!children.hasOwnProperty(property)) {
      // FIXME should not cache value, only config
      children[property] = create(value, { deep, names: [...names, property] }, typeChecker);
    }

    return children[property];
  }

  return value;
};

const setProperty = (target, property, value) => {
  const { deep, names, config, children, typeChecker } = getConfig(target);

  if (property !== configKey) {
    delete children[property];

    typeChecker.setProperty
    && typeChecker.setProperty(target, property, value, config, names);

    if (proxyOptions.wrapSetPropertyValues) {
      // FIXME add cache
      target[property] = create(value, { deep, names: [...names, property] }, typeChecker);
      return;
    }
  }

  target[property] = value;
};

const callFunction = (target, thisArg, argumentsList) => {
  const { deep, names, config, typeChecker } = getConfig(target);

  typeChecker.arguments
  && typeChecker.arguments(target, thisArg, argumentsList, config, names);

  if (proxyOptions.wrapFunctionArguments) {
    const { length } = argumentsList;
    for (let index = 0; index < length; index++) {
      argumentsList[index] = create(argumentsList[index], { deep, names: [...names, index] }, typeChecker);
    }
  }

  const result = target.apply(thisArg, argumentsList);

  typeChecker.returnValue
  && typeChecker.returnValue(target, thisArg, result, config, names);

  return proxyOptions.wrapFunctionReturnValues
    ? create(result, { deep, names: [...names] }, typeChecker)
    : result;
};

const objectProxy = (target) => new Proxy(
  target,
  {
    get: getProperty,
    set: setProperty,
  },
);

const functionProxy = (target) => new Proxy(
  target,
  {
    apply: callFunction,
    construct: callFunction,
  },
);

export const create = (target, { deep = true, names = [] } = {}, typeChecker = getDefaultTypeChecker()) => {
  if (!isValidTarget(target) || !isEnabled() || getConfig(target)) {
    return target;
  }

  setConfig(
    target,
    {
      deep,
      names,
      children: {},
      typeChecker,
      config: typeChecker.init(target, getErrorReporter()),
    },
  );

  if (target instanceof Function) {
    return functionProxy(target);
  }

  return objectProxy(target);
};
