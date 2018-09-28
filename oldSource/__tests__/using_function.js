import { setDefaultTypeChecker } from '../checkers';
import {
  getTargetInfo,
  getTypeChecker,
  getTypeCheckerData,
} from '../target/info';
import create from '../proxy/create';
import { isWrapped } from '../utils';

describe('Array', () => {
  let checker;
  let target;

  beforeEach(() => {
    checker = {
      init: jest.fn(() => ({ type: 'type-checker-config' })),
      getProperty: jest.fn(),
      setProperty: jest.fn(),
      arguments: jest.fn(),
      returnValue: jest.fn(),
    };

    setDefaultTypeChecker(checker);
  });

  describe('When applied to array', () => {
    beforeEach(() => {
      target = create((a) => !!a);
    });

    it('should be a function', () => {
      expect(target).toEqual(expect.any(Function));
    });

    it('should pass arguments and return values', () => {
      expect(target(1)).toBe(true);
      expect(target('')).toBe(false);
    });

    it('should become type checked', () => {
      expect(isWrapped(target)).toBe(true);
    });

    it('should contain info object with meta data', () => {
      expect(getTargetInfo(target)).toEqual(expect.any(Object));
    });

    it('should store type checker reference', () => {
      expect(getTypeChecker(target)).toBe(checker);
    });

    it('should store type checker config', () => {
      expect(getTypeCheckerData(target)).toEqual({
        type: 'type-checker-config',
      });
    });
  });
});
