import withProxy from '@actualwave/with-proxy';

import getPropertyFactory from './handlers/get';
import setPropertyFactory from './handlers/set';
import applyFunctionFactory from './handlers/apply';
import constructFactory from './handlers/construct';
import deletePropertyFactory from './handlers/deleteProperty';

const PROXY_GET_TRAP = 'get';
const PROXY_SET_TRAP = 'set';
const PROXY_APPLY_TRAP = 'apply';
const PROXY_CONSTRUCT_TRAP = 'construct';
const PROXY_DELETE_PROPERTY_TRAP = 'deleteProperty';

const CHECKER_GET_METHOD = 'getProperty';
const CHECKER_SET_METHOD = 'setProperty';
const CHECKER_ARGUMENTS_METHOD = 'arguments';
const CHECKER_RETURN_METHOD = 'returnValue';
const CHECKER_DELETE_METHOD = 'deleteProperty';

const readProxyConfigFromChecker = (typeChecker) => {
  const callables = CHECKER_ARGUMENTS_METHOD in typeChecker || CHECKER_RETURN_METHOD in typeChecker;

  return {
    [PROXY_GET_TRAP]: CHECKER_GET_METHOD in typeChecker,
    [PROXY_SET_TRAP]: CHECKER_SET_METHOD in typeChecker,
    [PROXY_APPLY_TRAP]: callables,
    [PROXY_CONSTRUCT_TRAP]: callables,
    [PROXY_DELETE_PROPERTY_TRAP]: CHECKER_DELETE_METHOD in typeChecker,
  };
};

const generateHandlers = (create, config) => ({
  get: config.get && getPropertyFactory(create),
  set: config.set && setPropertyFactory(create),
  apply: config.apply && applyFunctionFactory(create),
  construct: config.construct && constructFactory(create),
  deleteProperty: config.deleteProperty && deletePropertyFactory(create),
});

const createInfoFromOptions = (
  target,
  {
    checker,
    deep,
    names,
    data,
    children,
    info = null, // exclusive option, if set other options being ignored
  } = {},
) =>
  info ||
  createTargetInfo(checker, checker.init(target, getErrorReporter(), data), deep, names, children);

const createWrapFactory = (proxyConfig, checker) => {
  let wrapInternal;

  const handlers = generateHandlers((target, info) => {
    setTargetInfo(target, info);
    return wrapInternal(target);
  }, proxyConfig || readProxyConfigFromChecker(checker));

  wrapInternal = withProxy(handlers);

  return wrapInternal;
};

export const wrap = (target, options, proxyConfig = null) => {
  if (!isWrappable(target) || !isEnabled()) {
    return target;
  }

  const { checker = getDefaultTypeChecker() } = options;
  const wrapInternal = createWrapFactory(proxyConfig, checker);

  return wrapInternal(target, createInfoFromOptions(target, { checker, ...options }));
};
