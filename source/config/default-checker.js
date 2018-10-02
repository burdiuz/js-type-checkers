import { singleConfigFactory } from './utils';

export const {
  get: getDefaultTypeChecker,
  set: setDefaultTypeChecker,
} = singleConfigFactory();
