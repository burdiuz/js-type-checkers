import { setDefaultTypeChecker } from '../checkers';
import {
  getTargetInfo,
  getTargetTypeChecker,
  getTargetTypeCheckerConfig
} from '../target/info';
import create from '../proxy/create';
import { isTypeChecked } from '../utils';

describe('Array', () => {
  let checker;
  let target;

  beforeEach(() => {
    checker = {
      init: jest.fn(() => ({ type: 'type-checker-config' })),
      getProperty: jest.fn(),
      setProperty: jest.fn(),
      arguments: jest.fn(),
      returnValue: jest.fn()
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
      expect(isTypeChecked(target)).toBe(true);
    });

    it('should contain info object with meta data', () => {
      expect(getTargetInfo(target)).toEqual(expect.any(Object));
    });

    it('should store type checker reference', () => {
      expect(getTargetTypeChecker(target)).toBe(checker);
    });

    it('should store type checker config', () => {
      expect(getTargetTypeCheckerConfig(target)).toEqual({
        type: 'type-checker-config'
      });
    });
  });
});
