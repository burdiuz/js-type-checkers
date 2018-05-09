import { getDefaultTypeChecker } from '../checkers';
import { getErrorReporter } from '../reporters';
import { isEnabled } from '../enabled';
import {
  INFO_KEY,
  createTargetInfo,
  getTargetInfo,
  setTargetInfo,
  createChildrenCache,
  getChildInfo,
  storeChildInfoFrom,
  removeChildInfo,
} from '../target';
import { config as proxyConfig } from './config';
import { isValidTarget, isTypeChecked } from '../utils';
import { RETURN_VALUE } from '../checkers/utils';

const getProperty = (target, property) => {
  let value = target[property];

  if (property === INFO_KEY) {
    return value;
  }

  const info = getTargetInfo(target);
  const { deep, names, config, checker } = info;

  checker.getProperty
    && checker.getProperty(target, property, value, config, names);

  if (!isValidTarget(value) || isTypeChecked(value)) {
    return value;
  }

  if (deep || value instanceof Function) {
    const { children } = info;
    const childInfo = getChildInfo(children, name);

    if (childInfo) {
      value = create(value, { info: childInfo }, checker);
    } else {
      value = create(value, { deep, names: [...names, property] }, checker);
      storeChildInfoFrom(children, name, value);
    }
  }

  return value;
};

const setProperty = (target, property, value) => {
  const info = getTargetInfo(target);
  const { deep, names, config, checker } = info;

  if (property !== INFO_KEY) {
    checker.setProperty
      && checker.setProperty(target, property, value, config, names);

    if (proxyConfig.wrapSetPropertyValues) {
      const { children } = info;

      if (!isTypeChecked(value)) {
        const childInfo = getChildInfo(children, name);

        if (childInfo) {
          value = create(value, { info: childInfo }, checker);
        } else {
          value = create(value, { deep, names: [...names, property] }, checker);
        }
      }

      storeChildInfoFrom(children, name, value);
    }
  }

  target[property] = value;
};

const callFunction = (target, thisArg, argumentsList) => {
  const info = getTargetInfo(target);
  const { deep, names, config, checker } = info;

  checker.arguments
    && checker.arguments(target, thisArg, argumentsList, config, names);

  if (proxyConfig.wrapFunctionArguments) {
    const { length } = argumentsList;
    for (let index = 0; index < length; index++) {
      argumentsList[index] = create(argumentsList[index], { deep, names: [...names, index] }, checker);
    }
  }

  let result = target.apply(thisArg, argumentsList);

  checker.returnValue
    && checker.returnValue(target, thisArg, result, config, names);

  if (proxyConfig.wrapFunctionReturnValues) {
    const { children } = info;

    if (!isTypeChecked(result)) {
      const childInfo = getChildInfo(children, RETURN_VALUE);

      if (childInfo) {
        result = create(result, { info: childInfo }, checker);
      } else {
        result = create(result, { deep, names: [...names] }, checker)
      }
    }

    storeChildInfoFrom(children, RETURN_VALUE, result);
  }
  return result;
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

export const create = (
  target,
  {
    deep = true,
    names = [],
    config = null,
    children = null,
    info = null, // exclusive option, if set other options being ignored
  } = {},
  checker = getDefaultTypeChecker(),
) => {
  if (!isValidTarget(target) || !isEnabled() || isTypeChecked(target)) {
    return target;
  }

  setTargetInfo(
    target,
    info || createTargetInfo(
      checker,
      checker.init(target, getErrorReporter(), config),
      deep,
      names,
      createChildrenCache(children),
    ),
  );

  if (target instanceof Function) {
    return functionProxy(target);
  }

  return objectProxy(target);
};

export const createDeep = () => {
  // FIXME add new factory function createDeep, it will have deep == true by default and init type checkers for all internal objects 
  // and functions by reassigning original values with type checked proxies
  // when creating checkers for children objects should check cached info
};