import { describe, it, expect, afterEach } from '@jest/globals';
import {
  ignoreClass,
  isClassIgnored,
  isValueOfIgnoredClass,
  stopIgnoringClass,
} from './ignored-classes';

class MyClass {}
class OtherClass {}

afterEach(() => {
  stopIgnoringClass(MyClass);
  stopIgnoringClass(OtherClass);
});

describe('ignoreClass / isClassIgnored', () => {
  it('returns false before ignoring', () => {
    expect(isClassIgnored(MyClass)).toBe(false);
  });

  it('returns true after ignoring', () => {
    ignoreClass(MyClass);
    expect(isClassIgnored(MyClass)).toBe(true);
  });

  it('does not affect other classes', () => {
    ignoreClass(MyClass);
    expect(isClassIgnored(OtherClass)).toBe(false);
  });
});

describe('stopIgnoringClass', () => {
  it('removes the class from the ignored set', () => {
    ignoreClass(MyClass);
    stopIgnoringClass(MyClass);
    expect(isClassIgnored(MyClass)).toBe(false);
  });
});

describe('isValueOfIgnoredClass', () => {
  it('returns false for instances of non-ignored classes', () => {
    expect(isValueOfIgnoredClass(new MyClass())).toBe(false);
  });

  it('returns true for instances of ignored classes', () => {
    ignoreClass(MyClass);
    expect(isValueOfIgnoredClass(new MyClass())).toBe(true);
  });

  it('returns false for primitives', () => {
    expect(isValueOfIgnoredClass(42)).toBe(false);
    expect(isValueOfIgnoredClass('str')).toBe(false);
  });
});
