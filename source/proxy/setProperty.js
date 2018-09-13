import {
  INFO_KEY,
  getTargetInfo,
  getChildInfo,
  storeChildInfoFrom,
  mergeTargetInfo,
} from '../target/info';

import {
  getProxyConfigValue,
  PROXY_WRAP_SET_PROPERTY_VALUES,
} from './config';

import {
  isValidTarget,
  isTypeChecked,
} from '../utils';

import { TARGET_KEY } from '../target/proxy';

const setNonTargetProperty = (target, property, value) => {
  if (property === INFO_KEY) {
    let info = getTargetInfo(target);
    if (info && value && info !== value) {
      info = mergeTargetInfo(info, value);
    } else {
      info = value;
    }

    target[property] = info;
    return true;
  } else if (!isValidTarget(value)) {
    const { names, config, checker } = getTargetInfo(target);

    if (checker.setProperty) {
      checker.setProperty(target, property, value, config, names);
    }

    target[property] = value;
    return true;
  }

  return false;
};

const setTargetProperty = (createFn, target, property, value) => {
  const info = getTargetInfo(target);
  const { deep, names, checker, config, children } = info;

  if (checker.setProperty) {
    checker.setProperty(target, property, value, config, names);
  }

  if (getProxyConfigValue(PROXY_WRAP_SET_PROPERTY_VALUES, info)) {
    if (!isTypeChecked(value)) {
      const childInfo = getChildInfo(children, property);

      if (childInfo) {
        value = createFn(value, { info: childInfo });
      } else {
        value = createFn(value, { deep, names: [...names, property], checker });
      }
    }

    storeChildInfoFrom(children, property, value);
  }

  target[property] = value;
  return true;
};

const setProperty = (createFn) => (target, property, value) => {
  if (property === TARGET_KEY) {
    throw new Error(`"${TARGET_KEY}" is a virtual property and cannot be set`);
  }

  return setNonTargetProperty(target, property, value)
    || setTargetProperty(createFn, target, property, value);
};

export default setProperty;
