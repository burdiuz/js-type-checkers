import { isWrapped, isWrappable } from '../utils';

import { INFO_KEY } from '../target/info';

import { TARGET_KEY } from '../target/proxy';

class MyClass {}

describe('isWrappable()', () => {
  it('should return true for object', () => {
    expect(isWrappable({})).toBe(true);
    expect(isWrappable([])).toBe(true);
    expect(isWrappable(() => null)).toBe(true);
    expect(isWrappable(new MyClass())).toBe(true);
    expect(isWrappable(new Date())).toBe(true);
  });

  it('should return false for primitive values', () => {
    expect(isWrappable('123')).toBe(false);
    expect(isWrappable(123)).toBe(false);
    expect(isWrappable(false)).toBe(false);
    expect(isWrappable(null)).toBe(false);
    expect(isWrappable(Symbol('123'))).toBe(false);
  });
});

describe('isWrapped()', () => {
  it('should return false for not an object', () => {
    expect(isWrapped(null)).toBe(false);
    expect(isWrapped('123')).toBe(false);
    expect(isWrapped(123)).toBe(false);
    expect(isWrapped(true)).toBe(false);
    expect(isWrapped(Symbol('123'))).toBe(false);
  });

  it('should return false for random objects', () => {
    expect(isWrapped({})).toBe(false);
    expect(isWrapped([])).toBe(false);
    expect(isWrapped(() => null)).toBe(false);
    expect(isWrapped(new Date())).toBe(false);
    expect(isWrapped(new MyClass())).toBe(false);
  });

  it('should return false for objects with INFO_KEY', () => {
    expect(isWrapped({ [INFO_KEY]: {} })).toBe(false);
    expect(isWrapped(Object.assign([], { [INFO_KEY]: {} }))).toBe(false);
    expect(isWrapped(Object.assign(() => null, { [INFO_KEY]: {} }))).toBe(false);
  });

  it('should return true for objects with TARGET_KEY', () => {
    expect(isWrapped({ [TARGET_KEY]: {} })).toBe(true);
    expect(isWrapped(Object.assign([], { [TARGET_KEY]: {} }))).toBe(true);
    expect(isWrapped(Object.assign(() => null, { [TARGET_KEY]: {} }))).toBe(true);
  });
});
