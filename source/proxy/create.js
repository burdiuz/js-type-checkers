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

export const createInfoFromOptions = (target, {
  deep = true,
  names = [],
  config = null,
  children = null,
  checker = getDefaultTypeChecker(),
  info = null, // exclusive option, if set other options being ignored
} = {}) => info || createTargetInfo(
  checker,
  checker.init(target, getErrorReporter(), config),
  deep,
  names,
  createChildrenCache(children),
);

const create = (target, options) => {
  if (!isValidTarget(target) || !isEnabled() || isTypeChecked(target)) {
    return target;
  }

  setTargetInfo(
    target,
    createInfoFromOptions(target, options),
  );

  return wrapWithProxy(target);
};

getProperty = getPropertyInit(create);
setProperty = setPropertyInit(create);
callFunction = callFunctionInit(create);

export default create;
