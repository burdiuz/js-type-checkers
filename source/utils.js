import hasOwn from '@actualwave/has-own';

import { isValueOfIgnoredClass } from './config/ignored-classes';
import { getTargetInfo } from './info';
import {
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
  WRAP_IGNORE_PROTOTYPE_METHODS,
  WRAP_SET_PROPERTY_VALUES,
} from './config/wrap-config';

export const TARGET_KEY = Symbol('type-checkers::target');

export const isOfWrappableType = (target) => {
  const type = typeof target;

  return (
    Boolean(target)
    && (type === 'function' || type === 'object')
    && !isValueOfIgnoredClass(target)
  );
};

export const isWrapped = (target) => Boolean(target && target[TARGET_KEY]);

export const isWrappable = (target) => isOfWrappableType(target) && !isWrapped(target);

export const unwrap = (target) => (target && target[TARGET_KEY]) || target;

const wrapConfigKeys = [
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
  WRAP_IGNORE_PROTOTYPE_METHODS,
  WRAP_SET_PROPERTY_VALUES,
];

export const setWrapConfigTo = (target, config) => {
  if (!isWrapped(target) || !config) {
    return;
  }

  const info = getTargetInfo(target);

  wrapConfigKeys.forEach((key) => {
    if (hasOwn(key, config)) {
      info[key] = config[key];
    }
  });
};
