import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { wrapDeep } from './wrapDeep';
import { isWrapped } from '../utils';
import { setDefaultTypeChecker } from '../config/default-checker';
import { setEnabled } from '../config/enabled';
import { getTargetInfo } from '../info';
import StubTypeChecker from '../stub-checker';

const checker = new StubTypeChecker();

beforeAll(() => {
  setDefaultTypeChecker(checker);
});

afterAll(() => {
  setDefaultTypeChecker(undefined as never);
  setEnabled(true);
});

describe('wrapDeep', () => {
  it('wraps the root target', () => {
    const target = { a: 1 };
    const result = wrapDeep(target);
    expect(isWrapped(result)).toBe(true);
  });

  it('returns primitives and arrays unchanged (not object)', () => {
    expect(wrapDeep(42 as unknown as object)).toBe(42);
  });

  it('returns unchanged when disabled', () => {
    setEnabled(false);
    const target = {};
    expect(wrapDeep(target)).toBe(target);
    setEnabled(true);
  });

  it('calls checker.getProperty for each enumerable property', () => {
    const spy = jest.spyOn(checker, 'getProperty');
    const target = { x: 1, y: 2 };
    wrapDeep(target);
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('attaches TargetInfo to nested object properties', () => {
    const child = { nested: true };
    const target = { child };
    wrapDeep(target);
    expect(getTargetInfo(child)).toBeDefined();
  });
});
