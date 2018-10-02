/* eslint-disable import/prefer-default-export */
import { isEnabled } from '../config/enabled';
import { setTargetInfo } from '../info';
import { isWrappable } from '../utils';
import { createInfoFromOptions, createWrapFactory } from './wrap';

const deepInitializer = (target, info) => {
  const { names, checker, data } = info;

  Object.keys(target).forEach((name) => {
    const value = target[name];
    const nextNames = names.clone(name);

    if (checker.getProperty) {
      checker.getProperty(target, nextNames, value, data);
    }

    if (isWrappable(value)) {
      let childInfo = info.getChild(name);

      if (!childInfo) {
        childInfo = info.createChildWithNames(nextNames, value);
      }

      deepInitializer(value, childInfo);
    }
  });

  setTargetInfo(target, info);

  return info;
};

export const wrapDeep = (target, options, proxyConfig = null) => {
  if (!isWrappable(target) || typeof target !== 'object' || !isEnabled()) {
    return target;
  }

  const wrapInternal = createWrapFactory(proxyConfig);
  const info = createInfoFromOptions(target, options);

  deepInitializer(target, info);

  return wrapInternal(target, info);
};
