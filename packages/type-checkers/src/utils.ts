import { isValueOfIgnoredClass } from './config/ignored-classes';
import { getTargetInfo } from './info';
import {
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
  WRAP_IGNORE_PROTOTYPE_METHODS,
  WRAP_SET_PROPERTY_VALUES,
  WrapConfigKey,
  WrapConfigTarget,
} from './config/wrap-config';

export const TARGET_KEY: unique symbol = Symbol('type-checkers::target');

export const isSymbol = (value: unknown): value is symbol => typeof value === 'symbol';

export const isOfWrappableType = (target: unknown): target is object => {
  const type = typeof target;
  return Boolean(target) && (type === 'function' || type === 'object') && !isValueOfIgnoredClass(target);
};

export const isWrapped = (target: unknown): boolean =>
  Boolean(target && (target as Record<symbol, unknown>)[TARGET_KEY]);

export const isWrappable = (target: unknown): target is object =>
  isOfWrappableType(target) && !isWrapped(target);

export const unwrap = <T>(target: T): T =>
  ((target && (target as Record<symbol, unknown>)[TARGET_KEY]) || target) as T;

export const setWrapConfigTo = (target: object, key: WrapConfigKey, value: boolean): boolean => {
  if (!isWrapped(target)) {
    return false;
  }

  const info = getTargetInfo(target);
  if (!info) return false;

  switch (key) {
    case WRAP_FUNCTION_RETURN_VALUES:
    case WRAP_FUNCTION_ARGUMENTS:
    case WRAP_SET_PROPERTY_VALUES:
    case WRAP_IGNORE_PROTOTYPE_METHODS:
      (info as WrapConfigTarget)[key] = !!value;
      return true;
    default:
      return false;
  }
};
