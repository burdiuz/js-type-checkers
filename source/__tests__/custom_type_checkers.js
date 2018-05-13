import { setErrorReporter } from '../reporters';
import { ConsoleWarnReporter } from '../reporters/console';
import { PrimitiveTypeChecker, setDefaultTypeChecker } from '../checkers';
import { SET_PROPERTY, GET_PROPERTY, ARGUMENTS, RETURN_VALUE } from '../checkers/utils';
import { getOriginalTarget, TARGET_KEY } from '../target/proxy';
import { create, isTypeChecked } from '../';

describe('Custom Type Checkers', () => {
  const reporter = jest.fn(ConsoleWarnReporter);
  const expectConfig = expect.objectContaining({
    types: expect.any(Object),
    errorReporter: reporter,
  });
  let target;
  let checker;

  class MyClass {
    constructor(value) {
      this.value = value;
    }
  }

  const myClassTypeChecker = (action, trgt, name, value, { errorReporter }) => {
    if (value === null || value === undefined || value instanceof MyClass) {
      return true;
    }

    const [, type] = String(getOriginalTarget(value).constructor).match(/^\w+\s+(\w+)/) || ['', typeof value];
    errorReporter(action, name, 'MyClass', type);
    return false;
  };

  const allArgsOfSameTypeChecker = (action, trgt, value, { errorReporter }) => {
    const type = typeof value[0];
    const index = value.findIndex((item) => (typeof item !== type));

    if (!value.length || index < 0) {
      return true;
    }

    errorReporter(action, index, type, typeof value[index]);
    return false;
  };

  const notLess3TypeChecker = (action, trgt, name, value, { errorReporter }) => {
    if (value < 3) {
      errorReporter(action, name, '< 3', value);
      return false;
    }
    return true;
  };

  beforeEach(() => {
    setErrorReporter(reporter);
    reporter.mockClear();
  });

  describe('When property set', () => {
    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = true;
      target = create({
        numberValue: 12,
        objectValue: new MyClass(15),
      });

      checker = jest.fn(myClassTypeChecker);

      PrimitiveTypeChecker.replacePropertyTypeCheck(target, 'objectValue', (...args) => checker(...args));
    });

    describe('When reading property', () => {
      beforeEach(() => {
        target.objectValue;
      });

      it('shoud run type check', () => {
        expect(checker).toHaveBeenCalledTimes(1);
        expect(checker).toHaveBeenCalledWith(
          GET_PROPERTY,
          target,
          'objectValue',
          expect.any(MyClass),
          expectConfig,
          [],
        );
      });
    });

    describe('When writing property with value of other type', () => {
      beforeEach(() => {
        checker.mockClear();
        target.objectValue = { value: 115 };
      });

      it('shoud call type checker with updated value', () => {
        expect(checker).toHaveBeenCalledTimes(1);
        expect(checker).toHaveBeenCalledWith(
          SET_PROPERTY,
          target,
          'objectValue',
          expect.objectContaining({ value: 115 }),
          expectConfig,
          [],
        );
      });

      describe('When reading property', () => {
        beforeEach(() => {
          checker.mockClear();
          target.objectValue;
        });

        it('shoud call type checker with current value', () => {
          expect(checker).toHaveBeenCalledTimes(1);
          expect(checker).toHaveBeenCalledWith(
            GET_PROPERTY,
            target,
            'objectValue',
            expect.objectContaining({ value: 115 }),
            expectConfig,
            [],
          );
        });
      });
    });

    describe('When writing property with undefined', () => {
      beforeEach(() => {
        checker.mockClear();
        target.objectValue = undefined;
      });

      it('shoud call type checker with updated value', () => {
        expect(checker).toHaveBeenCalledTimes(1);
        expect(checker).toHaveBeenCalledWith(
          SET_PROPERTY,
          target,
          'objectValue',
          undefined,
          expectConfig,
          [],
        );
      });
    });
  });

  describe('When arguments set', () => {
    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = true;
      target = create({
        numberValue: 12,
        method: () => new MyClass(15),
      });

      checker = jest.fn(allArgsOfSameTypeChecker);

      PrimitiveTypeChecker.replaceArgumentsTypeCheck(target.method, (...args) => checker(...args));
    });

    describe('When calling type checked function', () => {
      let method;

      beforeEach(() => {
        ({ method } = target);
      });

      describe('When called with valid arguments', () => {
        beforeEach(() => {
          method(1, 2, 3, 4, 5);
        });

        it('should run type checks', () => {
          expect(checker).toHaveBeenCalledTimes(1);
          expect(checker).toHaveBeenCalledWith(
            ARGUMENTS,
            getOriginalTarget(method),
            [1, 2, 3, 4, 5],
            expectConfig,
            ['method'],
          );
        });
      });

      describe('When called with invalid arguments', () => {
        beforeEach(() => {
          method(1, 2, '3', 4, '5');
        });

        it('should run type checks', () => {
          expect(checker).toHaveBeenCalledTimes(1);
          expect(checker).toHaveBeenCalledWith(
            ARGUMENTS,
            getOriginalTarget(method),
            [1, 2, '3', 4, '5'],
            expectConfig,
            ['method'],
          );
        });
      });
    });
  });

  describe('When return value set', () => {
    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = true;
      target = create({
        numberValue: 12,
        method: () => new MyClass(15),
      });

      checker = jest.fn((action, trgt, ...rest) => myClassTypeChecker(action, trgt, action, ...rest));

      PrimitiveTypeChecker.replaceReturnValueTypeCheck(target.method, (...args) => checker(...args));
    });

    describe('When return value with proper type', () => {
      beforeEach(() => {
        target.method();
      });

      it('should run type checks', () => {
        expect(checker).toHaveBeenCalledTimes(1);
        expect(checker).toHaveBeenCalledWith(
          RETURN_VALUE,
          getOriginalTarget(target.method),
          expect.any(MyClass),
          expectConfig,
          ['method'],
        );
      });
    });

    describe('When returns value with wrong type', () => {
      beforeEach(() => {
        target.method = () => ({ value: 15 })
        target.method();
      });

      it.only('should run type checks', () => {
        expect(checker).toHaveBeenCalledTimes(1);
        expect(checker).toHaveBeenCalledWith(
          RETURN_VALUE,
          getOriginalTarget(target.method),
          expect.any(Object),
          expectConfig,
          ['method'],
        );
      });
    });
  });

  describe('When indexed value set', () => {
    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = true;
      target = create([1, 2, 3, 4, 5]);

      checker = jest.fn(notLess3TypeChecker);

      PrimitiveTypeChecker.replaceIndexedTypeCheck(target, (...args) => checker(...args));
    });
  });
});
