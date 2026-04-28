import { valuesSetFactory } from '@actualwave/closure-value';

const {
  get: getIgnoredProperties,
  add: ignoreProperty,
  has: isPropertyIgnored,
  delete: stopIgnoringProperty,
} = valuesSetFactory<PropertyKey>(['constructor', 'prototype', '__proto__']);

export { getIgnoredProperties, ignoreProperty, isPropertyIgnored, stopIgnoringProperty };
