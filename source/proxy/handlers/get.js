import hasOwn from '@actualwave/has-own';
import isFunction from '@actualwave/is-function';

import { isWrappable, isSymbol, TARGET_KEY } from '../../utils';
import { getTargetInfo } from '../../info';
import { getWrapConfigValue, WRAP_IGNORE_PROTOTYPE_METHODS } from '../../config/wrap-config';
import { isPropertyIgnored } from '../../config/ignored-properties';

const getTargetProperty = (wrapFn, target, names, value) => {
  const info = getTargetInfo(target);
  const { deep } = info;

  if (deep || isFunction(value)) {
    const { lastName: property } = names;

    const childInfo = info.getChild(property);

    if (childInfo) {
      return wrapFn(value, childInfo);
    }

    return wrapFn(value, info.createChildWithNames(names, value));
  }

  return value;
};

/**
 * Skips prototype methods if they are ignored by config
 */
const isWrappableProperty = (target, info, property, value) => {
  if (
    isFunction(value) &&
    !hasOwn(target, property) &&
    getWrapConfigValue(WRAP_IGNORE_PROTOTYPE_METHODS, info)
  ) {
    return false;
  }

  return true;
};

const getPropertyFactory = (wrapFn) => (target, property) => {
  const value = target[property];

  // property === INFO_KEY not needed because INFO_KEY is Symbol
  if (isSymbol(property) || isPropertyIgnored(property)) {
    return value;
  }

  /*
    target[TARGET_KEY] is a virtual property accessing which indicates
    if object is wrapped with type checked proxy or not.
    Also it allows "unwrapping" target.
  */
  if (property === TARGET_KEY) {
    return target;
  }

  const info = getTargetInfo(target);
  const { names, data, checker } = info;

  const nextNames = names.clone(property);

  if (checker.getProperty) {
    checker.getProperty(target, nextNames, value, data);
  }

  if (!isWrappable(value) || isWrappableProperty(target, info, property, value)) {
    return value;
  }

  return getTargetProperty(wrapFn, target, nextNames, value);
};

export default getPropertyFactory;
