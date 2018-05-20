/* eslint-disable no-console */
import { ConsoleErrorReporter, ConsoleWarnReporter } from '../console';

describe('ConsoleWarnReporter()', () => {
  let message;

  beforeEach(() => {
    jest.spyOn(console, 'warn');
    ConsoleWarnReporter('/Action', '/Name', '/Required', '/Received');
    [[message]] = console.warn.mock.calls;
  });

  afterEach(() => {
    console.warn.mockRestore();
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
  let message;

  beforeEach(() => {
    jest.spyOn(console, 'error');
    ConsoleErrorReporter('/Action', '/Name', '/Required', '/Received');
    [[message]] = console.error.mock.calls;
  });

  afterEach(() => {
    console.error.mockRestore();
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
