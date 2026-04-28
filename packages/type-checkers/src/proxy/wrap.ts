import withProxy from '@actualwave/with-proxy';
import { createPathSequence } from '@actualwave/path-sequence-to-string';

import type { TypeChecker, WrapProxyConfig } from '../types';
import { isWrappable } from '../utils';
import { TargetInfo, setTargetInfo, createTargetInfo } from '../info';
import { isEnabled } from '../config/enabled';
import { getDefaultTypeChecker } from '../config/default-checker';
import type ChildrenCache from '../info/children';

import getPropertyFactory from './handlers/get';
import setPropertyFactory from './handlers/set';
import applyFunctionFactory from './handlers/apply';
import constructFactory from './handlers/construct';
import deletePropertyFactory from './handlers/deleteProperty';

export type WrapFn = (target: object, info: TargetInfo) => object;

export interface WrapOptions {
  checker?: TypeChecker | null;
  deep?: boolean;
  name?: string | number | symbol;
  data?: unknown;
  children?: ChildrenCache;
  /** Exclusive option — when set all other options are ignored. */
  info?: TargetInfo | null;
}

export const createInfoFromOptions = (
  target: object,
  {
    checker = getDefaultTypeChecker() as TypeChecker,
    deep,
    name,
    data,
    children,
    info = null,
  }: WrapOptions = {}
): TargetInfo => {
  if (info) return info;

  if (!checker) {
    throw new Error(
      'No TypeChecker is set. Call setDefaultTypeChecker() before wrapping objects, or pass a checker in options.'
    );
  }

  return createTargetInfo(checker, checker.init(target, data), deep, createPathSequence(name), children);
};

/**
 * Bug fix: use ternary instead of `&&` so disabled handlers are `undefined`
 * (Proxy treats undefined as "no trap" and falls through to the target) rather
 * than `false` (which would throw TypeError when the trap is triggered).
 */
const generateHandlers = (create: WrapFn, config: WrapProxyConfig | null = null): ProxyHandler<object> => ({
  get: !config || config.get !== false ? getPropertyFactory(create) : undefined,
  set: !config || config.set !== false ? setPropertyFactory(create) : undefined,
  apply: !config || config.apply !== false ? applyFunctionFactory(create) : undefined,
  construct: !config || config.construct !== false ? constructFactory(create) : undefined,
  deleteProperty: !config || config.deleteProperty !== false ? deletePropertyFactory() : undefined,
});

export const createWrapFactory = (proxyConfig: WrapProxyConfig | null = null): WrapFn => {
  let wrapInternal: ReturnType<typeof withProxy>;

  const assignInfoAndWrap: WrapFn = (target, info) => {
    setTargetInfo(target, info);
    return wrapInternal(target);
  };

  const handlers = generateHandlers(assignInfoAndWrap, proxyConfig);
  wrapInternal = withProxy(handlers);

  return assignInfoAndWrap;
};

export const wrap = (
  target: object,
  options: WrapOptions | null = null,
  proxyConfig: WrapProxyConfig | null = null
): object => {
  if (!isWrappable(target) || !isEnabled()) {
    return target;
  }

  const wrapInternal = createWrapFactory(proxyConfig);
  const info = createInfoFromOptions(target, options ?? undefined);

  return wrapInternal(target, info);
};
