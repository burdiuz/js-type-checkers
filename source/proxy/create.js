import withProxy from '@actualwave/with-proxy';
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

let wrapWithProxy; // eslint-disable-line

const createInfoFromOptions = (target, {
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

wrapWithProxy = (() => {
  const callHandler = callFunctionInit(create);

  return withProxy({
    get: getPropertyInit(create),
    set: setPropertyInit(create),
    apply: callHandler,
    construct: callHandler,
  });
})();

export {
  createInfoFromOptions,
  wrapWithProxy,
};

export default create;
