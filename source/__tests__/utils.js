import { isTypeChecked, isValidTarget } from '../utils';

import { INFO_KEY } from '../target/info';

import { TARGET_KEY } from '../target/proxy';

class MyClass {}

describe('isValidTarget()', () => {
  it('should return true for object', () => {
    expect(isValidTarget({})).toBe(true);
    expect(isValidTarget([])).toBe(true);
    expect(isValidTarget(() => null)).toBe(true);
    expect(isValidTarget(new MyClass())).toBe(true);
    expect(isValidTarget(new Date())).toBe(true);
  });

  it('should return false for primitive values', () => {
    expect(isValidTarget('123')).toBe(false);
    expect(isValidTarget(123)).toBe(false);
    expect(isValidTarget(false)).toBe(false);
    expect(isValidTarget(null)).toBe(false);
    expect(isValidTarget(Symbol('123'))).toBe(false);
  });
});

describe('isTypeChecked()', () => {
  it('should return false for not an object', () => {
    expect(isTypeChecked(null)).toBe(false);
    expect(isTypeChecked('123')).toBe(false);
    expect(isTypeChecked(123)).toBe(false);
    expect(isTypeChecked(true)).toBe(false);
    expect(isTypeChecked(Symbol('123'))).toBe(false);
  });

  it('should return false for random objects', () => {
    expect(isTypeChecked({})).toBe(false);
    expect(isTypeChecked([])).toBe(false);
    expect(isTypeChecked(() => null)).toBe(false);
    expect(isTypeChecked(new Date())).toBe(false);
    expect(isTypeChecked(new MyClass())).toBe(false);
  });

  it('should return false for objects with INFO_KEY', () => {
    expect(isTypeChecked({ [INFO_KEY]: {} })).toBe(false);
    expect(isTypeChecked(Object.assign([], { [INFO_KEY]: {} }))).toBe(false);
    expect(isTypeChecked(Object.assign(() => null, { [INFO_KEY]: {} }))).toBe(false);
  });

  it('should return true for objects with TARGET_KEY', () => {
    expect(isTypeChecked({ [TARGET_KEY]: {} })).toBe(true);
    expect(isTypeChecked(Object.assign([], { [TARGET_KEY]: {} }))).toBe(true);
    expect(isTypeChecked(Object.assign(() => null, { [TARGET_KEY]: {} }))).toBe(true);
  });
});
