import { describe, it, expect, jest } from '@jest/globals';
import {
  TargetInfo,
  createTargetInfo,
  getTargetInfo,
  setTargetInfo,
  removeTargetInfo,
  hasTargetInfo,
  INFO_KEY,
} from './target';
import StubTypeChecker from '../stub-checker';

const makeChecker = () => new StubTypeChecker();
const makeInfo = (checker = makeChecker()) => createTargetInfo(checker);

describe('createTargetInfo', () => {
  it('returns a TargetInfo instance', () => {
    expect(makeInfo()).toBeInstanceOf(TargetInfo);
  });

  it('stores the checker', () => {
    const checker = makeChecker();
    expect(makeInfo(checker).checker).toBe(checker);
  });

  it('defaults data to undefined', () => {
    expect(makeInfo().data).toBeUndefined();
  });

  it('defaults deep to true', () => {
    expect(makeInfo().deep).toBe(true);
  });
});

describe('getTargetInfo / setTargetInfo', () => {
  it('returns undefined when no info is set', () => {
    expect(getTargetInfo({})).toBeUndefined();
  });

  it('returns the info after setTargetInfo', () => {
    const target = {};
    const info = makeInfo();
    setTargetInfo(target, info);
    expect(getTargetInfo(target)).toBe(info);
  });
});

describe('removeTargetInfo', () => {
  it('removes the info from the target', () => {
    const target = {};
    const info = makeInfo();
    setTargetInfo(target, info);
    removeTargetInfo(target);
    expect(getTargetInfo(target)).toBeUndefined();
  });
});

describe('hasTargetInfo', () => {
  it('returns false when no info is set', () => {
    expect(hasTargetInfo({})).toBe(false);
  });

  it('returns true after info is set', () => {
    const target = {};
    setTargetInfo(target, makeInfo());
    expect(hasTargetInfo(target)).toBe(true);
  });
});

describe('TargetInfo', () => {
  describe('createChild / getChild', () => {
    it('creates a child info and retrieves it by name', () => {
      const info = makeInfo();
      const childValue = {};
      const child = info.createChild('prop', childValue);
      expect(child).toBeInstanceOf(TargetInfo);
      expect(info.getChild('prop')).toBeDefined();
    });
  });

  describe('copy', () => {
    it('merges children from source into target info', () => {
      const checker = makeChecker();
      const infoA = createTargetInfo(checker);
      const infoB = createTargetInfo(checker);
      const childValue = {};
      infoB.createChild('x', childValue);

      infoA.copy(infoB);
      expect(infoA.getChild('x')).toBeDefined();
    });

    it('logs error and does nothing when checkers differ', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const infoA = createTargetInfo(makeChecker());
      const infoB = createTargetInfo(makeChecker());
      infoA.copy(infoB);
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('same instance'));
      spy.mockRestore();
    });
  });

  describe('INFO_KEY', () => {
    it('is a symbol', () => {
      expect(typeof INFO_KEY).toBe('symbol');
    });
  });
});
