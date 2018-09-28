import hasOwn from '@actualwave/has-own';
import isFunction from '@actualwave/is-function';

import { INFO_KEY, getTargetInfo } from '../../info/target';

import { getWrapConfigValue, WRAP_IGNORE_PROTOTYPE_METHODS } from '../../config/wrap-config';

import { isWrappable, TARGET_KEY } from '../../utils';

const getTargetProperty = (wrapFn, target, names, value) => {
  const info = getTargetInfo(target);
  const { deep } = info;

  if (deep || isFunction(value)) {
    const { lastName: property } = names;

    const childInfo = info.getChild(property);

    if (childInfo) {
      return wrapFn(value, childInfo);
    }

    return wrapFn(value, info.createChildWithNames(names));
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
    */
  } else if (property === TARGET_KEY) {
    return target;
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
