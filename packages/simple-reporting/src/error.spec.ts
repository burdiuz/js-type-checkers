import { describe, it, expect, beforeEach } from '@jest/globals';
import { ThrowErrorReporter } from './error';

describe('ThrowErrorReporter()', () => {
  let message: string;

  beforeEach(() => {
    try {
      ThrowErrorReporter('/Action', '/Name', '/Required', '/Received');
    } catch (error) {
      ({ message } = error as Error);
    }
  });

  it('should construct string with action value', () => {
    expect(message).toEqual(expect.stringContaining('/Action'));
  });

  it('should construct string with name value', () => {
    expect(message).toEqual(expect.stringContaining('/Name'));
  });

  it('should construct string with required type value', () => {
    expect(message).toEqual(expect.stringContaining('/Required'));
  });

  it('should construct string with received type value', () => {
    expect(message).toEqual(expect.stringContaining('/Received'));
  });

  it('should throw an Error instance', () => {
    expect(() => ThrowErrorReporter('set', 'count', 'number', 'string')).toThrow(Error);
  });
});
