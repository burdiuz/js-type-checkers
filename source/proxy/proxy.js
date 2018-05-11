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
  mergeTargetInfo,
} from '../target/info';
import { TARGET_KEY } from '../target/proxy';
import { config as proxyConfig } from './config';
import { isValidTarget, isTypeChecked } from '../utils';
import { RETURN_VALUE, MERGE } from '../checkers/utils';

const getProperty = (target, property) => {
  let value = target[property];

  if (property === INFO_KEY) {
    return value;
    /*
    target[TARGET_KEY] is a virtual property accessing which indicates 
    if object is wrapped with type checked proxy or not.
    */
  } else if (property === TARGET_KEY) {
    return target;
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
    const childInfo = getChildInfo(children, property);

    if (childInfo) {
      value = create(value, { info: childInfo });
    } else {
      value = create(value, { deep, names: [...names, property], checker });
      storeChildInfoFrom(children, property, value);
    }
  }

  return value;
};

const setProperty = (target, property, value) => {
  if (property === TARGET_KEY) {
    throw new Error(`"${TARGET_KEY}" is a virtual property and cannot be set`);
  }

  let info = getTargetInfo(target);
  const { deep, names, config, checker } = info;

  checker.setProperty
    && checker.setProperty(target, property, value, config, names);

  if (property === INFO_KEY) {
    if(info && value && info !== value) {
      info = mergeTargetInfo(info, value);
    } else {
      info = value;
    }

    target[property] = info;
    return true;
  } else if (!isValidTarget(value)) {
    target[property] = value;
    return true;
  }

  if (proxyConfig.wrapSetPropertyValues) {
    const { children } = info;

    if (!isTypeChecked(value)) {
      const childInfo = getChildInfo(children, property);

      if (childInfo) {
        value = create(value, { info: childInfo });
      } else {
        value = create(value, { deep, names: [...names, property], checker });
      }
    }

    storeChildInfoFrom(children, property, value);
  }

  target[property] = value;
  return true;
};

const callFunction = (target, thisArg, argumentsList) => {
  const info = getTargetInfo(target);
  const { deep, names, config, checker } = info;

  checker.arguments
    && checker.arguments(target, thisArg, argumentsList, config, names);

  if (proxyConfig.wrapFunctionArguments) {
    const { length } = argumentsList;
    // FIXME cache arguments info objects as children
    for (let index = 0; index < length; index++) {
      argumentsList[index] = create(argumentsList[index], { deep, names: [...names, index], checker });
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
        result = create(result, { info: childInfo });
      } else {
        result = create(result, { deep, names: [...names], checker });
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

export const wrapWithProxy = (target) => {
  if (target instanceof Function) {
    return functionProxy(target);
  }

  return objectProxy(target);
};

export const create = (
  target,
  {
    deep = true,
    names = [],
    config = null,
    children = null,
    checker = getDefaultTypeChecker(),
    info = null, // exclusive option, if set other options being ignored
  } = {},
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

  return wrapWithProxy(target);
};

const deepInitializer = (obj) => {
 for(const name in obj) {
   const value = obj[name];

   if(typeof value === 'object') {
    deepInitializer(value);
   }
 }
};

// FIXME initialize info without creating proxies and create proxy only for root object
// will skip functions/methods since we get info about them only when being executed
export const createDeep = (target, options) => {
  if (!target || target !== 'object' || !isEnabled() || isTypeChecked(target)) {
    return target;
  }

  const typeChecked = create(
    target, 
    {
      ...options,
      deep: true,
    },
  );

  deepInitializer(typeChecked);

  return typeChecked;
};