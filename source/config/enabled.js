import { singleValueFactory } from '@actualwave/closure-value';

export const {
  get: isEnabled,
  set: setEnabled,
} = singleValueFactory(true, (value) => !!value);
