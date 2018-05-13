import { setErrorReporter } from '../reporters';
import { PrimitiveTypeChecker, setDefaultTypeChecker } from '../checkers';
import { SET_PROPERTY, GET_PROPERTY } from '../checkers/utils';
import { create, isEnabled, isTypeChecked, setEnabled } from '../';

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
        arrayValue: [1, 2, 3],
        objectValue: { val1: 1, val2: '2', val3: true },
        method: () => false,
      });
    });

    describe('When getting values', () => {
      beforeEach(() => {
        expect(target.numberValue).toBe(12);
        expect(target.stringValue).toBe(12);
        expect(target.booleanValue).toBe(12);
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

  describe('When deep is true', () => {
    beforeEach(() => {
      target = create({
        arrayValue: [1, 2, 3],
        objectValue: { val1: 1, val2: '2', val3: true },
        method: () => false,
      });
    });

    it('should have child objects type checked', () => {
      expect(isTypeChecked(target.arrayValue)).toBe(true);
      expect(isTypeChecked(target.objectValue)).toBe(true);
    });

    it('should have methods type checked', () => {
      expect(isTypeChecked(target.method)).toBe(true);
    });

    describe('When accessing descendants', () => {
      beforeEach(() => {
        //expect(target.objectValue.val1).toBe(1);
        console.log(isTypeChecked(target.arrayValue), target.arrayValue);
        target.arrayValue[2] = '5';
        target.objectValue.val1 = 'any string';
      });

      it.only('should report type violation', () => {
        console.log(reporter.mock.calls);
        //expect(reporter);
      });
    });
  });

  describe('When deep is false', () => {
    beforeEach(() => {
      target = create({
        arrayValue: [1, 2, 3],
        objectValue: { val1: 1, val2: '2', val3: true },
        method: () => false,
      }, { deep: false });
    });

    it('should have child objects type checked', () => {
      expect(isTypeChecked(target.arrayValue)).toBe(false);
      expect(isTypeChecked(target.objectValue)).toBe(false);
    });

    it('should have methods type checked', () => {
      expect(isTypeChecked(target.method)).toBe(true);
    });
  });

  describe('When disabled', () => {
    beforeEach(() => {
      setEnabled(false);

      target = create({
        numberValue: 12,
      });

      afterEach(() => {
        setEnabled(true);
      });

      target.numberValue = 'abc';
      target.numberValue = false;
      target.numberValue = () => null;
    });

    it('should not be type checked', () => {
      expect(isTypeChecked(target)).toBe(false);
    });

    it('should not check types', () => {
      expect(reporter).not.toHaveBeenCalled();
    });
  });
});
