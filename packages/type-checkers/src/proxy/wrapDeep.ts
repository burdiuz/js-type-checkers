import { isEnabled } from '../config/enabled';
import { TargetInfo, setTargetInfo } from '../info';
import { isWrappable } from '../utils';
import { createInfoFromOptions, createWrapFactory, WrapFn, WrapOptions } from './wrap';
import type { WrapProxyConfig } from '../types';

const deepInitializer = (target: object, info: TargetInfo, wrapFn: WrapFn): TargetInfo => {
  const { names, checker, data } = info;

  Object.keys(target).forEach((name) => {
    const value = (target as Record<string, unknown>)[name];
    const nextNames = names.clone(name);

    if (checker.getProperty) {
      checker.getProperty(target, nextNames, value, data);
    }

    if (isWrappable(value)) {
      let childInfo = info.getChild(name) as unknown as TargetInfo | undefined;

      if (!childInfo) {
        childInfo = info.createChildWithNames(nextNames, value);
      }

      deepInitializer(value, childInfo, wrapFn);
    }
  });

  setTargetInfo(target, info);
  return info;
};

export const wrapDeep = (
  target: object,
  options?: WrapOptions,
  proxyConfig: WrapProxyConfig | null = null
): object => {
  if (!isWrappable(target) || typeof target !== 'object' || !isEnabled()) {
    return target;
  }

  const wrapInternal = createWrapFactory(proxyConfig);
  const info = createInfoFromOptions(target, options);

  deepInitializer(target, info, wrapInternal);

  return wrapInternal(target, info);
};
