import {
  INFO_KEY,
  getTargetInfo,
  getChildInfo,
  storeChildInfoFrom,
  mergeTargetInfo,
} from '../target/info';

import { getWrapConfigValue, WRAP_SET_PROPERTY_VALUES } from './config';

import { isWrappable, isWrapped } from '../utils';

import { TARGET_KEY } from '../target/proxy';

const setNonTargetProperty = (target, property, value) => {
  if (property === INFO_KEY) {
    let info = getTargetInfo(target);
    if (info && value && info !== value) {
      info.copy(value);
    } else {
      info = value;
    }

    target[property] = info;
    return true;
  }

  if (!isWrappable(value)) {
    const { names, data, checker } = getTargetInfo(target);

    checker.setProperty(target, names.clone(property), value, data);

    target[property] = value;
    return true;
  }

  return false;
};

const setTargetProperty = (wrapFn, target, property, value) => {
  const info = getTargetInfo(target);
  const { deep, names, checker, data, children } = info;
  // FIXME might not need to create if childInfo is available
  const nextNames = names.clone(property);

  checker.setProperty(target, nextNames, value, data);

  if (getWrapConfigValue(WRAP_SET_PROPERTY_VALUES, info)) {
    if (!isWrapped(value)) {
      const childInfo = getChildInfo(children, property);

      if (childInfo) {
        value = wrapFn(value, { info: childInfo });
      } else {
        value = wrapFn(value, { deep, names: nextNames, checker });
      }
    }

    storeChildInfoFrom(children, property, value);
  }

  target[property] = value;
  return true;
};

const setPropertyFactory = (wrapFn) => (target, property, value) => {
  if (property === TARGET_KEY) {
    throw new Error(`"${TARGET_KEY}" is a virtual property and cannot be set`);
  }

  return (
    setNonTargetProperty(target, property, value) ||
    setTargetProperty(wrapFn, target, property, value)
  );
};

export default setPropertyFactory;
