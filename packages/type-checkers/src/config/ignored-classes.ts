import { getClass } from '@actualwave/get-class';
import { valuesSetFactory } from '@actualwave/closure-value';

const {
  get: getIgnoredClasses,
  add: ignoreClass,
  has: isClassIgnored,
  delete: stopIgnoringClass,
} = valuesSetFactory<Function>();

export const isValueOfIgnoredClass = (value: unknown): boolean =>
  isClassIgnored(getClass(value) as Function);

export { getIgnoredClasses, ignoreClass, isClassIgnored, stopIgnoringClass };
