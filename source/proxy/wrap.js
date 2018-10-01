/* eslint-disable import/prefer-default-export */
import withProxy from '@actualwave/with-proxy';
import { createPathSequence } from '@actualwave/path-sequence-to-string';

import { isWrappable } from '../utils';
import { setTargetInfo, createTargetInfo } from '../info';
import { isEnabled } from '../config/enabled';
import { getDefaultTypeChecker } from '../config/default-checker';

import getPropertyFactory from './handlers/get';
import setPropertyFactory from './handlers/set';
import applyFunctionFactory from './handlers/apply';
import constructFactory from './handlers/construct';
import deletePropertyFactory from './handlers/deleteProperty';

export const createInfoFromOptions = (
  target,
  {
    checker = getDefaultTypeChecker(),
    deep,
    name,
    data,
    children,
    info = null, // exclusive option, if set other options being ignored
  } = {},
) =>
  info ||
  createTargetInfo(checker, checker.init(target, data), deep, createPathSequence(name), children);

const generateHandlers = (create, config = null) => ({
  get: (!config || config.get) && getPropertyFactory(create),
  set: (!config || config.set) && setPropertyFactory(create),
  apply: (!config || config.apply) && applyFunctionFactory(create),
  construct: (!config || config.construct) && constructFactory(create),
  deleteProperty: (!config || config.deleteProperty) && deletePropertyFactory(create),
});

export const createWrapFactory = (proxyConfig) => {
  let wrapInternal;
  const assignInfoAndWrap = (target, info) => {
    setTargetInfo(target, info);
    return wrapInternal(target);
  };

  const handlers = generateHandlers(assignInfoAndWrap, proxyConfig);
  wrapInternal = withProxy(handlers);

  return assignInfoAndWrap;
};

export const wrap = (target, options = null, proxyConfig = null) => {
  if (!isWrappable(target) || !isEnabled()) {
    return target;
  }

  const wrapInternal = createWrapFactory(proxyConfig);
  const info = createInfoFromOptions(target, options || undefined);

  return wrapInternal(target, info);
};
