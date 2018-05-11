import { getDefaultTypeChecker } from '../checkers';
import { getErrorReporter } from '../reporters';
import { isEnabled } from '../enabled';
import {
  createTargetInfo,
  setTargetInfo,
  createChildrenCache,
} from '../target/info';
import { isValidTarget, isTypeChecked } from '../utils';
import getPropertyInit from './getProperty';
import setPropertyInit from './setProperty';
import callFunctionInit from './callFunction';

let getProperty;
let setProperty;
let callFunction;

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
getProperty = getPropertyInit(create);
setProperty = setPropertyInit(create);
callFunction = callFunctionInit(create);

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
