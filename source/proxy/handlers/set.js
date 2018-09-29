import { INFO_KEY, getTargetInfo } from '../../info';
import { TARGET_KEY, isWrappable } from '../../utils';
import { getWrapConfigValue, WRAP_SET_PROPERTY_VALUES } from '../../config/wrap-config';

const setNonTargetProperty = (target, property, value) => {
  const { names, data, checker } = getTargetInfo(target);

  if (checker.setProperty) {
    checker.setProperty(target, names.clone(property), value, data);
  }

  target[property] = value;

  return true;
};

const setTargetProperty = (wrapFn, target, property, value) => {
  const info = getTargetInfo(target);
  const { names, checker, data } = info;
  const childInfo = info.getChild(property);
  const nextNames = childInfo ? childInfo.names : names.clone(property);

  if (checker.setProperty) {
    checker.setProperty(target, nextNames, value, data);
  }

  if (childInfo) {
    value = wrapFn(value, childInfo);
  } else {
    value = wrapFn(value, info.createChildWithNames(nextNames, value));
  }

  target[property] = value;
  return true;
};

const updateTargetInfo = (target, value) => {
  let info = getTargetInfo(target);
  if (info && value && info !== value) {
    info.copy(value);
  } else {
    info = value;
  }

  target[INFO_KEY] = info;
  return true;
};

const setPropertyFactory = (wrapFn) => (target, property, value) => {
  if (property === TARGET_KEY) {
    throw new Error(`"${TARGET_KEY}" is a virtual property and cannot be set`);
  }

  if (property === INFO_KEY) {
    return updateTargetInfo(target, value);
  }

  const info = getTargetInfo(target);

  if (isWrappable(value) && getWrapConfigValue(WRAP_SET_PROPERTY_VALUES, info)) {
    return setTargetProperty(wrapFn, target, property, value);
  }

  return setNonTargetProperty(target, property, value);
};

export default setPropertyFactory;
