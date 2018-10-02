import { wrap } from './proxy/wrap';
import { isWrapped } from './utils';
import { getTargetInfo } from './info';

const findWrapped = (list) => list.find(isWrapped);

/**
 * Merge all objects and return new. If any of source objects were wrapped,
 * resulting object will be wrapped.
 * @param  {...any} sources
 */
export const merge = (...sources) => {
  const wrapped = findWrapped(sources);

  if (!wrapped) {
    return Object.assign({}, ...sources);
  }

  const info = getTargetInfo(wrapped);

  return Object.assign(wrap({}, { info }), ...sources);
};

/**
 * Calls merge() and forces wrapped result.
 * @param {*} options
 * @param  {...Object} sources
 */
merge.options = (options, ...sources) => merge(wrap({}, options), ...sources);

/**
 * Assign properties from source objects to target. If target or any of sources
 * were wrapped, resulting object will be wrapped.
 * @param {*} target
 * @param  {...any} sources
 */
export const assign = (target, ...sources) => {
  if (isWrapped(target)) {
    return Object.assign(target, ...sources);
  }

  const wrapped = findWrapped(sources);

  if (!wrapped) {
    return Object.assign(target, ...sources);
  }

  const info = getTargetInfo(wrapped);

  return Object.assign(wrap(target, { info }), ...sources);
};

/**
 * calls assign() and forces wrapped result.
 * @param {*} options
 * @param {Object} target
 * @param  {...Object} sources
 */
assign.options = (options, target, ...sources) => assign(wrap(target, options), ...sources);
