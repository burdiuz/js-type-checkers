/* eslint-disable import/prefer-default-export */
import withProxy from '@actualwave/with-proxy';

import { isWrappable } from '../utils';
import { setTargetInfo, createTargetInfo } from '../info';
import { getErrorReporter } from '../config/error-reporter';
import { isEnabled } from '../config/enabled';
import { getDefaultTypeChecker } from '../config/default-checker';

import getPropertyFactory from './handlers/get';
import setPropertyFactory from './handlers/set';
import applyFunctionFactory from './handlers/apply';
import constructFactory from './handlers/construct';
import deletePropertyFactory from './handlers/deleteProperty';

const generateHandlers = (create, config = null) => ({
  get: (!config || config.get) && getPropertyFactory(create),
  set: (!config || config.set) && setPropertyFactory(create),
  apply: (!config || config.apply) && applyFunctionFactory(create),
  construct: (!config || config.construct) && constructFactory(create),
  deleteProperty: (!config || config.deleteProperty) && deletePropertyFactory(create),
});

export const createInfoFromOptions = (
  target,
  {
    checker = getDefaultTypeChecker(),
    deep,
    names,
    data,
    children,
    info = null, // exclusive option, if set other options being ignored
  } = {},
) =>
  info ||
  createTargetInfo(checker, checker.init(target, getErrorReporter(), data), deep, names, children);

export const createWrapFactory = (proxyConfig) => {
  let wrapInternal;

  const handlers = generateHandlers((target, info) => {
    setTargetInfo(target, info);
    return wrapInternal(target);
  }, proxyConfig);

  wrapInternal = withProxy(handlers);

  return wrapInternal;
};

export const wrap = (target, options, proxyConfig = null) => {
  if (!isWrappable(target) || !isEnabled()) {
    return target;
  }

  const wrapInternal = createWrapFactory(proxyConfig);

  return wrapInternal(target, createInfoFromOptions(target, options));
};
