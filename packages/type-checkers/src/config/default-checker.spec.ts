import { describe, it, expect, afterEach } from '@jest/globals';
import { getDefaultTypeChecker, setDefaultTypeChecker } from './default-checker';
import StubTypeChecker from '../stub-checker';

afterEach(() => {
  setDefaultTypeChecker(undefined as never);
});

describe('getDefaultTypeChecker', () => {
  it('returns undefined when not set', () => {
    expect(getDefaultTypeChecker()).toBeUndefined();
  });
});

describe('setDefaultTypeChecker', () => {
  it('stores and returns the checker', () => {
    const checker = new StubTypeChecker();
    setDefaultTypeChecker(checker);
    expect(getDefaultTypeChecker()).toBe(checker);
  });

  it('replaces the previous checker', () => {
    const first = new StubTypeChecker();
    const second = new StubTypeChecker();
    setDefaultTypeChecker(first);
    setDefaultTypeChecker(second);
    expect(getDefaultTypeChecker()).toBe(second);
  });
});
