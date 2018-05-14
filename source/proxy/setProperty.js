import {
  INFO_KEY,
  getTargetInfo,
  getChildInfo,
  storeChildInfoFrom,
  mergeTargetInfo,
} from '../target/info';
import { TARGET_KEY } from '../target/proxy';
import { config as proxyConfig } from './config';
import { isValidTarget, isTypeChecked } from '../utils';

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
  const { deep, names, checker, config, children } = getTargetInfo(target);

  if (checker.setProperty) {
    checker.setProperty(target, property, value, config, names);
  }

  if (proxyConfig.wrapSetPropertyValues) {
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
