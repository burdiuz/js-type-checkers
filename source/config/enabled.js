import { singleConfigFactory } from './utils';

export const {
  get: isEnabled,
  set: setEnabled,
} = singleConfigFactory(true, (value) => !!value);
