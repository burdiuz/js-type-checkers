import { constructErrorString } from '../utils';

describe('constructErrorString()', () => {
  let result;

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
});
