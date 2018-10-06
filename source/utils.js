import { isValueOfIgnoredClass } from './config/ignored-classes';
import { getTargetInfo } from './info';
import {
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
  WRAP_IGNORE_PROTOTYPE_METHODS,
  WRAP_SET_PROPERTY_VALUES,
} from './config/wrap-config';

export const TARGET_KEY = Symbol('type-checkers::target');

export const isSymbol = (value) => typeof value === 'symbol';

export const isOfWrappableType = (target) => {
  const type = typeof target;

  return (
    Boolean(target) && (type === 'function' || type === 'object') && !isValueOfIgnoredClass(target)
  );
};

export const isWrapped = (target) => Boolean(target && target[TARGET_KEY]);

export const isWrappable = (target) => isOfWrappableType(target) && !isWrapped(target);

export const unwrap = (target) => (target && target[TARGET_KEY]) || target;

export const setWrapConfigTo = (target, key, value) => {
  if (!isWrapped(target)) {
    return false;
  }

  const info = getTargetInfo(target);

  switch (key) {
    case WRAP_FUNCTION_RETURN_VALUES:
    case WRAP_FUNCTION_ARGUMENTS:
    case WRAP_SET_PROPERTY_VALUES:
    case WRAP_IGNORE_PROTOTYPE_METHODS:
      info[key] = !!value;
      return true;
    default:
      return false;
  }
};
