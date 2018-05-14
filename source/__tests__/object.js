import { setErrorReporter } from '../reporters';
import { PrimitiveTypeChecker, setDefaultTypeChecker } from '../checkers';
import { SET_PROPERTY, GET_PROPERTY, INDEX, ARGUMENTS, RETURN_VALUE } from '../checkers/utils';
import { create, isEnabled, isTypeChecked, setEnabled, getTargetInfo, getTargetTypeCheckerConfig, setTargetInfo } from '../';
import { TARGET_KEY, getOriginalTarget } from '../target/proxy';
import { INFO_KEY } from '../target/info';

describe('Object', () => {
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
        method: (a) => !!a,
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

    describe('When calling method', () => {
      beforeEach(() => {
        expect(target.method(1)).toBe(true);
      });

      it('should not report any errors', () => {
        expect(reporter).not.toHaveBeenCalled();
      });

      describe('When calling method with same argument types', () => {
        beforeEach(() => {
          expect(target.method(0)).toBe(false);
        });

        it('should not report any errors', () => {
          expect(reporter).not.toHaveBeenCalled();
        });
      });

      describe('When calling method with mismatched argument types', () => {
        beforeEach(() => {
          expect(target.method('0')).toBe(true);
        });

        it('should report call errors', () => {
          expect(reporter).toHaveBeenCalledTimes(1);
          expect(reporter).toHaveBeenCalledWith(ARGUMENTS, 'method[0]', 'number', 'string');
        });
      });

      describe('When method is replaced in runtime', () => {
        beforeEach(() => {
          target.method = (b) => ++b;
        });

        describe('When calling method with mismatched argument types', () => {
          beforeEach(() => {
            expect(target.method('5')).toBe(6);
          });

          it('should report call errors', () => {
            expect(reporter).toHaveBeenCalledTimes(2);
            expect(reporter).toHaveBeenCalledWith(ARGUMENTS, 'method[0]', 'number', 'string');
            expect(reporter).toHaveBeenCalledWith(RETURN_VALUE, `method${RETURN_VALUE}`, 'boolean', 'number');
          });
        });
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
        expect(target.objectValue.val1).toBe(1);
        expect(target.arrayValue[2]).toBe(3);
        target.arrayValue[2] = '5';
        target.objectValue.val1 = 'any string';
      });

      it('should report type violation', () => {
        expect(reporter).toHaveBeenCalledTimes(2);
        expect(reporter).toHaveBeenCalledWith(
          SET_PROPERTY,
          `arrayValue${INDEX}`,
          'number',
          'string',
        );
        expect(reporter).toHaveBeenCalledWith(
          SET_PROPERTY,
          'objectValue.val1',
          'number',
          'string',
        );
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

    describe('When accessing descendants', () => {
      beforeEach(() => {
        target.arrayValue[2] = '5';
        target.objectValue.val1 = 'any string';
      });

      it('should ignore type violation', () => {
        expect(reporter).not.toHaveBeenCalled();
      });
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

  describe('When accessing types information', () => {
    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = true;
      target = create({
        numberValue: 12,
        stringValue: 'my string',
      });
    });

    it('should contain collection with primitive types', () => {
      expect(getTargetInfo(target)).toMatchSnapshot();
      expect(getTargetTypeCheckerConfig(target).types).toEqual({
        numberValue: 'number',
        stringValue: 'string',
      });
    });

    describe('When writing types information', () => {
      beforeEach(() => {
        const newTarget = create({
          booleanValue: true,
          arrayValue: [1, 2, 3],
          objectValue: { val1: 1, val2: '2', val3: true },
        });

        // init children types
        (() => null)(newTarget.arrayValue, newTarget.objectValue);

        // merge types
        setTargetInfo(target, getTargetInfo(newTarget));
      });

      it('should contain collection with primitive types', () => {
        expect(getTargetInfo(target)).toMatchSnapshot();
        expect(getTargetTypeCheckerConfig(target).types).toEqual({
          numberValue: 'number',
          stringValue: 'string',
          booleanValue: 'boolean',
          arrayValue: 'array',
          objectValue: 'object',
        });
      });
    });
  });

  describe('When accessing original object', () => {
    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = true;
      target = create({
        numberValue: 12,
        stringValue: 'my string',
      });
    });

    it('should be possible to access target object', () => {
      expect(getOriginalTarget(target)).toEqual({
        numberValue: 12,
        stringValue: 'my string',
        [INFO_KEY]: expect.any(Object),
      });
    });

    describe('When original object updated directly', () => {
      beforeEach(() => {
        getOriginalTarget(target).numberValue = '44';
        (() => null)(target.numberValue);
      });

      it('should report type error when accessing updated property', () => {
        expect(reporter).toHaveBeenCalledTimes(1);
        expect(reporter).toHaveBeenCalledWith(GET_PROPERTY, 'numberValue', 'number', 'string');
      });
    });

    describe('When reset original object', () => {
      it('should throw error', () => {
        expect(() => {
          target[TARGET_KEY] = { numberValue: 15 };
        }).toThrow();
      });

    });
  });
});
