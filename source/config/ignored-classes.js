import { getClass } from '@actualwave/get-class';

/*
 When ignoring class, its instances will never be wrapped.
*/
const constructors = new Set();

export const addIgnoredClasses = (...classes) => {
  classes.forEach((constructor) => {
    if (constructor && !constructors.has(constructor)) {
      constructors.add(constructor);
    }
  });
};

export const removeIgnoredClasses = (...classes) => {
  classes.forEach((constructor) => constructors.delete(constructor));
};

export const isIgnoredClass = (constructor) => constructors.has(constructor);

export const isValueOfIgnoredClass = (value) => constructors.has(getClass(value));

/**
 * Number, String, Boolean and Symbol will not pass
 *
 *  typeof === 'object' || typeof === 'function'
 *
 * check, so not need to add them.
 */
addIgnoredClasses(Map, Set, Date, Error);
