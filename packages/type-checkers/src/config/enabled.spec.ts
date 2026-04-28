import { describe, it, expect, afterEach } from '@jest/globals';
import { isEnabled, setEnabled } from './enabled';

afterEach(() => {
  setEnabled(true);
});

describe('isEnabled', () => {
  it('is true by default', () => {
    expect(isEnabled()).toBe(true);
  });
});

describe('setEnabled', () => {
  it('disables type checking', () => {
    setEnabled(false);
    expect(isEnabled()).toBe(false);
  });

  it('re-enables type checking', () => {
    setEnabled(false);
    setEnabled(true);
    expect(isEnabled()).toBe(true);
  });

  it('coerces truthy values to true', () => {
    setEnabled(1 as unknown as boolean);
    expect(isEnabled()).toBe(true);
  });

  it('coerces falsy values to false', () => {
    setEnabled(0 as unknown as boolean);
    expect(isEnabled()).toBe(false);
  });
});
