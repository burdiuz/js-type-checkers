import { isValueOfIgnoredClass } from './config/ignored-classes';

export const TARGET_KEY = Symbol('type-checkers::target');

export const isOfWrappableType = (target) => {
  const type = typeof target;

  return Boolean(target)
  && (type === 'function' || type === 'object')
  && !isValueOfIgnoredClass(target);
};

export const isWrapped = (target) => Boolean(target && target[TARGET_KEY]);

export const isWrappable = (target) => isOfWrappableType(target) && !isWrapped(target);

export const unwrap = (target) => (target && target[TARGET_KEY]) || target;
