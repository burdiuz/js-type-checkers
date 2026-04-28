import { describe, it, expect, beforeEach } from '@jest/globals';
import { constructErrorString } from './utils';

describe('constructErrorString()', () => {
  let result: string;

  beforeEach(() => {
    result = constructErrorString('/Action', '/Name', '/Required', '/Received');
  });

  it('should construct string with action value', () => {
    expect(result).toEqual(expect.stringContaining('/Action'));
  });

  it('should construct string with name value', () => {
    expect(result).toEqual(expect.stringContaining('/Name'));
  });

  it('should construct string with required type value', () => {
    expect(result).toEqual(expect.stringContaining('/Required'));
  });

  it('should construct string with received type value', () => {
    expect(result).toEqual(expect.stringContaining('/Received'));
  });

  it('should follow the expected message format', () => {
    expect(result).toBe('/ActionError on "/Name" instead of "/Required" received "/Received"');
  });
});
