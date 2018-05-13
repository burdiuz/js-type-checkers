import { setErrorReporter } from '../reporters';
import { PrimitiveTypeChecker, setDefaultTypeChecker } from '../checkers';
import { SET_PROPERTY, GET_PROPERTY } from '../checkers/utils';
import { create } from '../';

describe('Set Property', () => {
  const reporter = jest.fn();
  let target;

  beforeEach(() => {
    setErrorReporter(reporter);
    reporter.mockClear();
  });

  describe('When types pre-initialized', () => {
    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = true;
      target = create({
        numberValue: 12,
        stringValue: 'my string',
        booleanValue: true,
        arrayValue: [],
        objectValue: {},
      });
    });

    describe('When setting values of mismatched types', () => {
      beforeEach(() => {
        target.numberValue = '123';
        target.stringValue = false;
        target.booleanValue = false;
        target.arrayValue = {};
        target.objectValue = [];
      });

      it('should report mismatched primitive types', () => {
        expect(reporter).toHaveBeenCalledTimes(4);
        expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'numberValue', 'number', 'string');
        expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'stringValue', 'string', 'boolean');
        expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'arrayValue', 'array', 'object');
        expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'objectValue', 'object', 'array');
      });
    });
  });

  describe('When types were not initialized', () => {
    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = false;
      target = create({
        numberValue: 12,
        booleanValue: true,
        objectValue: {},
      });
    });

    describe('When setting values of mismatched types', () => {
      beforeEach(() => {
        target.numberValue = '123';
        target.stringValue = false;
        target.booleanValue = false;
        target.arrayValue = {};
        target.objectValue = [];
      });

      it('should record set types without error', () => {
        expect(reporter).not.toHaveBeenCalled();
      });

      describe('When setting values of mismatched types', () => {
        beforeEach(() => {
          target.numberValue = 123;
          target.stringValue = 'true';
          target.booleanValue = true;
          target.arrayValue = [];
          target.objectValue = {};
        });

        it('should record set types without error', () => {
          expect(reporter).toHaveBeenCalledTimes(4);
          expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'numberValue', 'string', 'number');
          expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'stringValue', 'boolean', 'string');
          expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'arrayValue', 'object', 'array');
          expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'objectValue', 'array', 'object');
        });
      });
    });
  });

  describe('When target is an array', () => {
    describe('When indexed values of same type enabled', () => {

    });

    describe('When indexed values of same type disabled', () => {

    });
  });

  describe('When custom type checker specified', () => {

  });
});a
