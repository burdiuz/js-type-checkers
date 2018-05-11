import {
  INFO_KEY,
  getTargetInfo,
  getChildInfo,
  storeChildInfoFrom,
} from '../target/info';
import { TARGET_KEY } from '../target/proxy';
import { isValidTarget, isTypeChecked } from '../utils';

const getTargetProperty = (createFn, target, property, value) => {
  const info = getTargetInfo(target);
  const { deep, children, names, checker } = info;

  if (deep || value instanceof Function) {
    const childInfo = getChildInfo(children, property);

    if (childInfo) {
      value = createFn(value, { info: childInfo });
    } else {
      value = createFn(value, { deep, names: [...names, property], checker });
      storeChildInfoFrom(children, property, value);
    }
  }

  return value;
};

const getProperty = (createFn) => (target, property) => {
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
  const { names, config, checker } = info;

  if (checker.getProperty) {
    checker.getProperty(target, property, value, config, names);
  }

  if (!isValidTarget(value) || isTypeChecked(value)) {
    return value;
  }

  return getTargetProperty(createFn, target, property, value);
};

export default getProperty;
