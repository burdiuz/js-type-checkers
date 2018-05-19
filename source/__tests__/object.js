import { setDefaultTypeChecker } from '../checkers';
import {
  getTargetInfo,
  getTargetTypeChecker,
  getTargetTypeCheckerConfig,
} from '../target/info';
import create from '../proxy/create';
import { isTypeChecked } from '../utils';

describe('Object', () => {
  let checker;
  let target;
  let result;

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

  describe('When applied to object', () => {
    beforeEach(() => {
      target = create({
        numberValue: 12,
        stringValue: 'my string',
        booleanValue: true,
        arrayValue: [1, 2, 3],
        objectValue: { val1: 1, val2: '2', val3: true },
        method: (a) => !!a,
      });
    });

    it('should be an object with all properties available', () => {
      expect(target).toEqual(expect.objectContaining({
        numberValue: 12,
        stringValue: 'my string',
        booleanValue: true,
        arrayValue: expect.arrayContaining([1, 2, 3]),
        objectValue: expect.objectContaining({
          val1: 1,
          val2: '2',
          val3: true,
        }),
        method: expect.any(Function),
      }));
    });

    it('should contain info object with meta data', () => {
      expect(getTargetInfo(target)).toEqual(expect.any(Object));
    });

    it('should become type checked', () => {
      expect(isTypeChecked(target)).toBe(true);
    });

    it('should store type checker reference', () => {
      expect(getTargetTypeChecker(target)).toBe(checker);
    });

    it('should store type checker config', () => {
      expect(getTargetTypeCheckerConfig(target)).toEqual({
        type: 'type-checker-config',
      });
    });

    describe('When reading property', () => {
      describe('When reading primitive value', () => {
        it('should return value as is', () => {
          expect(target.numberValue).toBe(12);
          expect(target.stringValue).toBe('my string');
          expect(target.booleanValue).toBe(true);
        });
      });

      describe('When reading object property', () => {
        beforeEach(() => {
          result = target.objectValue;
        });

        it('should be an object with all properties available', () => {
          expect(result).toEqual(expect.objectContaining({
            val1: 1,
            val2: '2',
            val3: true,
          }));
        });

        it('should be type checked', () => {
          expect(isTypeChecked(result)).toBe(true);
        });
      });

      describe('When reading function property', () => {
        beforeEach(() => {
          result = target.method;
        });
        it('should be a function', () => {
          expect(result).toBeInstanceOf(Function);
          expect(result(1)).toBe(true);
        });
      });

      describe('When reading unexistent property', () => {
        beforeEach(() => {
          result = target.unknownValue;
        });

        it('should be undefined', () => {
          expect(result).toBe(undefined);
        });
      });

      describe('When reading built-ins', () => {
        beforeEach(() => {
          result = target.constructor;
        });

        it('should be a function', () => {
          expect(result).toEqual(expect.any(Function));
        });

        it('should contain info object with meta data', () => {
          expect(getTargetInfo(result)).toEqual(expect.any(Object));
        });

        it('should become type checked', () => {
          expect(isTypeChecked(result)).toBe(true);
        });

        it('should store type checker reference', () => {
          expect(getTargetTypeChecker(result)).toBe(checker);
        });

        it('should store type checker config', () => {
          expect(getTargetTypeCheckerConfig(result)).toEqual({
            type: 'type-checker-config',
          });
        });
      });
    });

    describe('When writing property', () => {
      describe('When type matches', () => {
        beforeEach(() => {
          target.stringValue = '123';
          target.objectValue = { type: 'my-object' };
        });

        it('should apply new values', () => {
          expect(target).toEqual(expect.objectContaining({
            numberValue: 12,
            stringValue: '123',
            booleanValue: true,
            objectValue: expect.objectContaining({ type: 'my-object' }),
          }));
        });
      });

      describe('When type does not match', () => {
        beforeEach(() => {
          target.stringValue = 123;
          target.arrayValue = { type: 'my-object' };
        });

        it('should apply new values', () => {
          expect(target).toEqual(expect.objectContaining({
            numberValue: 12,
            stringValue: 123,
            booleanValue: true,
            arrayValue: expect.objectContaining({ type: 'my-object' }),
          }));
        });
      });
    });
  });
});
