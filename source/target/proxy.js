export const TARGET_KEY = Symbol('type-checkers::target');

export const getOriginalTarget = (target) => {
  return target[TARGET_KEY] || target;
};
