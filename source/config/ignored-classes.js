import { getClass } from '@actualwave/get-class';
import { valuesSetFactory } from '@actualwave/closure-value';

const {
  get: getIgnoredClasses,
  add: ignoreClass,
  has: isClassIgnored,
  delete: stopIgnoringClass,
} = valuesSetFactory();

export const isValueOfIgnoredClass = (value) => isClassIgnored(getClass(value));

export { getIgnoredClasses, ignoreClass, isClassIgnored, stopIgnoringClass };
