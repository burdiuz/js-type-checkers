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
      target = create([1, '2', true, {}]);
    });

    it('should be an array with all properties available', () => {
      expect(expect.arrayContaining([1, '2', true, expect.any(Object)]));
    });

    it('should contain info object with meta data', () => {
      expect(getTargetInfo(target)).toEqual(expect.any(Object));
    });

    it('should become type checked', () => {
      expect(isWrapped(target)).toBe(true);
    });

    it('should store type checker reference', () => {
      expect(getTypeChecker(target)).toBe(checker);
    });

    it('should store type checker config', () => {
      expect(getTypeCheckerData(target)).toEqual({
        type: 'type-checker-config',
      });
    });

    describe('When reading property', () => {
      describe('When reading primitive value', () => {
        it('should return value as is', () => {
          expect(target[0]).toBe(1);
          expect(target[1]).toBe('2');
          expect(target[2]).toBe(true);
        });
      });

      describe('When reading unexistent property', () => {
        it('should be undefined', () => {
          expect(target[123]).toBe(undefined);
        });
      });
    });

    describe('When writing property', () => {
      describe('When type matches', () => {
        beforeEach(() => {
          target[0] = 123;
          target[1] = '123';
        });

        it('should apply new values', () => {
          expect(target).toEqual(expect.arrayContaining([123, '123', true, expect.any(Object)]));
        });
      });

      describe('When type does not match', () => {
        beforeEach(() => {
          target[0] = '123';
          target[1] = 123;
        });

        it('should apply new values', () => {
          expect(target).toEqual(expect.arrayContaining(['123', 123, true, expect.any(Object)]));
        });
      });
    });
  });
});
