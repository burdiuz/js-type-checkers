export const TARGET_KEY = Symbol('type-checkers::target');

export const getOriginalTarget = (target) => target[TARGET_KEY] || target;
