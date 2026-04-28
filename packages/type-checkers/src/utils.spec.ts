import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { isSymbol, isOfWrappableType, isWrapped, isWrappable, unwrap, setWrapConfigTo, TARGET_KEY } from './utils';
import { setDefaultTypeChecker, getDefaultTypeChecker } from './config/default-checker';
import { setEnabled } from './config/enabled';
import { wrap } from './proxy/wrap';
import StubTypeChecker from './stub-checker';
import {
  WRAP_FUNCTION_RETURN_VALUES,
  WRAP_FUNCTION_ARGUMENTS,
  setWrapConfigValue,
} from './config/wrap-config';

const checker = new StubTypeChecker();

beforeAll(() => {
  setDefaultTypeChecker(checker);
});

afterAll(() => {
  setDefaultTypeChecker(undefined as never);
  setEnabled(true);
});

afterEach(() => {
  setWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, true);
  setWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, false);
});

describe('isSymbol', () => {
  it('returns true for symbols', () => {
    expect(isSymbol(Symbol())).toBe(true);
  });

  it('returns false for strings and numbers', () => {
    expect(isSymbol('str')).toBe(false);
    expect(isSymbol(42)).toBe(false);
  });
});

describe('isOfWrappableType', () => {
  it('returns true for plain objects', () => {
    expect(isOfWrappableType({})).toBe(true);
  });

  it('returns true for functions', () => {
    expect(isOfWrappableType(() => {})).toBe(true);
  });

  it('returns false for null', () => {
    expect(isOfWrappableType(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isOfWrappableType(42)).toBe(false);
    expect(isOfWrappableType('str')).toBe(false);
  });
});

describe('isWrapped / isWrappable', () => {
  it('returns false for plain objects', () => {
    expect(isWrapped({})).toBe(false);
    expect(isWrappable({})).toBe(true);
  });

  it('returns true / false for wrapped objects', () => {
    const target = wrap({});
    expect(isWrapped(target)).toBe(true);
    expect(isWrappable(target)).toBe(false);
  });
});

describe('unwrap', () => {
  it('returns the original target for a wrapped object', () => {
    const raw = {};
    const proxied = wrap(raw);
    expect(unwrap(proxied)).toBe(raw);
  });

  it('returns the value as-is when not wrapped', () => {
    const raw = {};
    expect(unwrap(raw)).toBe(raw);
  });
});

describe('setWrapConfigTo', () => {
  it('returns false for non-wrapped targets', () => {
    expect(setWrapConfigTo({}, WRAP_FUNCTION_RETURN_VALUES, false)).toBe(false);
  });

  it('sets a known config key on a wrapped target', () => {
    const target = wrap({});
    const result = setWrapConfigTo(target, WRAP_FUNCTION_ARGUMENTS, true);
    expect(result).toBe(true);
  });

  it('returns false for unknown keys', () => {
    const target = wrap({});
    expect(setWrapConfigTo(target, 'unknown' as never, true)).toBe(false);
  });
});
