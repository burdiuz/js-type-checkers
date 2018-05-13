import { TARGET_KEY } from './target/proxy';

const validTypes = {
  object: true,
  function: true,
};

export const isValidTarget = (target) => target && validTypes[typeof target];
export const isTypeChecked = (target) => Boolean(target && target[TARGET_KEY]);
