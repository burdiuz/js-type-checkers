import { describe, it, expect, afterEach } from '@jest/globals';
import {
  getWrapConfigValue,
  setWrapConfigValue,
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
  WRAP_SET_PROPERTY_VALUES,
  WRAP_IGNORE_PROTOTYPE_METHODS,
} from './wrap-config';

afterEach(() => {
  setWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, true);
  setWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, false);
  setWrapConfigValue(WRAP_SET_PROPERTY_VALUES, false);
  setWrapConfigValue(WRAP_IGNORE_PROTOTYPE_METHODS, false);
});

describe('default global values', () => {
  it('WRAP_FUNCTION_RETURN_VALUES defaults to true', () => {
    expect(getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES)).toBe(true);
  });

  it('WRAP_FUNCTION_ARGUMENTS defaults to false', () => {
    expect(getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS)).toBe(false);
  });

  it('WRAP_SET_PROPERTY_VALUES defaults to false', () => {
    expect(getWrapConfigValue(WRAP_SET_PROPERTY_VALUES)).toBe(false);
  });

  it('WRAP_IGNORE_PROTOTYPE_METHODS defaults to false', () => {
    expect(getWrapConfigValue(WRAP_IGNORE_PROTOTYPE_METHODS)).toBe(false);
  });
});

describe('setWrapConfigValue', () => {
  it('updates a global config value', () => {
    setWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, true);
    expect(getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS)).toBe(true);
  });
});

describe('getWrapConfigValue with per-target override', () => {
  it('returns the per-target value when set', () => {
    const target = { [WRAP_FUNCTION_RETURN_VALUES]: false };
    expect(getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, target)).toBe(false);
  });

  it('falls back to global when per-target value is undefined', () => {
    const target = {};
    expect(getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, target)).toBe(true);
  });
});
