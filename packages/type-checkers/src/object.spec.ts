import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { merge, assign } from './object';
import { isWrapped } from './utils';
import { wrap } from './proxy/wrap';
import { setDefaultTypeChecker } from './config/default-checker';
import StubTypeChecker from './stub-checker';

const checker = new StubTypeChecker();

beforeAll(() => {
  setDefaultTypeChecker(checker);
});

afterAll(() => {
  setDefaultTypeChecker(undefined as never);
});

describe('merge', () => {
  it('merges plain objects without wrapping', () => {
    const result = merge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
    expect(isWrapped(result)).toBe(false);
  });

  it('returns a wrapped result when any source is wrapped', () => {
    const wrapped = wrap({ a: 1 });
    const result = merge(wrapped, { b: 2 });
    expect(isWrapped(result)).toBe(true);
    expect((result as Record<string, number>).b).toBe(2);
  });

  it('merge.options forces a wrapped result', () => {
    const result = merge.options({ checker }, { a: 1 });
    expect(isWrapped(result)).toBe(true);
  });
});

describe('assign', () => {
  it('assigns sources to a plain target without wrapping', () => {
    const target = { a: 1 };
    const result = assign(target, { b: 2 });
    expect(result).toBe(target);
    expect(result).toEqual({ a: 1, b: 2 });
    expect(isWrapped(result)).toBe(false);
  });

  it('keeps the target wrapped when it is already wrapped', () => {
    const target = wrap({ a: 1 });
    const result = assign(target, { b: 2 });
    expect(isWrapped(result)).toBe(true);
  });

  it('wraps the target when a source is wrapped', () => {
    const source = wrap({ b: 2 });
    const result = assign({ a: 1 }, source);
    expect(isWrapped(result)).toBe(true);
  });

  it('assign.options forces a wrapped target', () => {
    const result = assign.options({ checker }, { a: 1 }, { b: 2 });
    expect(isWrapped(result)).toBe(true);
  });
});
