/* eslint-disable no-console */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ConsoleErrorReporter, ConsoleWarnReporter } from './console';

describe('ConsoleWarnReporter()', () => {
  let message: string;
  let spy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    ConsoleWarnReporter('/Action', '/Name', '/Required', '/Received');
    message = spy.mock.calls[0][0] as string;
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
});

describe('ConsoleErrorReporter()', () => {
  let message: string;
  let spy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    ConsoleErrorReporter('/Action', '/Name', '/Required', '/Received');
    message = spy.mock.calls[0][0] as string;
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
});
