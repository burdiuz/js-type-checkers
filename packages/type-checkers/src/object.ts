import { wrap, WrapOptions } from './proxy/wrap';
import { isWrapped } from './utils';
import { getTargetInfo, TargetInfo } from './info';

const findWrapped = (list: unknown[]): object | undefined =>
  list.find((item): item is object => isWrapped(item));

/**
 * Merge all objects and return a new one. If any source was wrapped the result
 * is also wrapped with the same type-checker info.
 */
export const merge = (...sources: object[]): object => {
  const wrapped = findWrapped(sources);

  if (!wrapped) {
    return Object.assign({}, ...sources);
  }

  const info = getTargetInfo(wrapped) as TargetInfo;
  return Object.assign(wrap({}, { info }), ...sources);
};

/**
 * Forces a wrapped result regardless of whether sources are wrapped.
 */
merge.options = (options: WrapOptions, ...sources: object[]): object =>
  merge(wrap({}, options), ...sources);

/**
 * Assign properties from source objects to target. If the target or any source
 * was wrapped the result is also wrapped.
 */
export const assign = (target: object, ...sources: object[]): object => {
  if (isWrapped(target)) {
    return Object.assign(target, ...sources);
  }

  const wrapped = findWrapped(sources);

  if (!wrapped) {
    return Object.assign(target, ...sources);
  }

  const info = getTargetInfo(wrapped) as TargetInfo;
  return Object.assign(wrap(target, { info }), ...sources);
};

/**
 * Forces a wrapped result on the target before assigning.
 */
assign.options = (options: WrapOptions, target: object, ...sources: object[]): object =>
  assign(wrap(target, options), ...sources);
