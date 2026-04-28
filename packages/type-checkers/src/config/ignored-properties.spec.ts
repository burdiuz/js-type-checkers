import { describe, it, expect, afterEach } from '@jest/globals';
import {
  ignoreProperty,
  isPropertyIgnored,
  stopIgnoringProperty,
} from './ignored-properties';

afterEach(() => {
  stopIgnoringProperty('myProp');
});

describe('isPropertyIgnored (default set)', () => {
  it('ignores "constructor" by default', () => {
    expect(isPropertyIgnored('constructor')).toBe(true);
  });

  it('ignores "prototype" by default', () => {
    expect(isPropertyIgnored('prototype')).toBe(true);
  });

  it('ignores "__proto__" by default', () => {
    expect(isPropertyIgnored('__proto__')).toBe(true);
  });

  it('does not ignore arbitrary properties by default', () => {
    expect(isPropertyIgnored('myProp')).toBe(false);
  });
});

describe('ignoreProperty / stopIgnoringProperty', () => {
  it('adds a property to the ignored set', () => {
    ignoreProperty('myProp');
    expect(isPropertyIgnored('myProp')).toBe(true);
  });

  it('removes a property from the ignored set', () => {
    ignoreProperty('myProp');
    stopIgnoringProperty('myProp');
    expect(isPropertyIgnored('myProp')).toBe(false);
  });
});
