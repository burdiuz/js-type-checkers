import { getDefaultTypeChecker } from './defaultTypeChecker';
import { isEnabled } from './enabled';

const objectProxy = (target) => new Proxy(
  target,
  {
    get: () => {
      // if object or function and deep -- wrap
    },

    set: () => {

    },
  }
);

const functionProxy = (target, name = 'anonymous') => new Proxy(
  target,
  {
    apply: () => {

    },
    construct: () => {

    },
  }
);

export const create = (target, deep = true, typeChecker = getDefaultTypeChecker()) => {
  if (!target || !isEnabled()) {
    return target;
  }

  const config = { deep, typeChecker, enabled: true, types: typeChecker.init(target) };

  if (target)

    setConfig(
      target

    );
};
