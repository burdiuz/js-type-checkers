import hasOwn from '@actualwave/has-own';
import isFunction from '@actualwave/is-function';

import { isWrappable, isSymbol, TARGET_KEY } from '../../utils';
import { INFO_KEY, getTargetInfo } from '../../info';
import { getWrapConfigValue, WRAP_IGNORE_PROTOTYPE_METHODS } from '../../config/wrap-config';

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
const isIgnoredProperty = (target, info, property, value) => {
  if (
    isFunction(value) &&
    !hasOwn(target, property) &&
    getWrapConfigValue(WRAP_IGNORE_PROTOTYPE_METHODS, info)
  ) {
    return true;
  }

  return false;
};

const getPropertyFactory = (wrapFn) => (target, property) => {
  const value = target[property];

  if (property === INFO_KEY) {
    return value;
    /*
    target[TARGET_KEY] is a virtual property accessing which indicates
    if object is wrapped with type checked proxy or not.
    Also it allows "unwrapping" target.
    */
  }

  if (property === TARGET_KEY) {
    return target;
  }

  if (isSymbol(property)) {
    return target[property];
  }

  const info = getTargetInfo(target);
  const { names, data, checker } = info;

  const nextNames = names.clone(property);

  if (checker.getProperty) {
    checker.getProperty(target, nextNames, value, data);
  }

  if (!isWrappable(value) || isIgnoredProperty(target, info, property, value)) {
    return value;
  }

  return getTargetProperty(wrapFn, target, nextNames, value);
};

export default getPropertyFactory;
