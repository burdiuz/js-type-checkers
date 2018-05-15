import {
  getProxyConfig,
  setProxyConfig,
  create,
} from '../proxy';
import { PrimitiveTypeChecker, isTypeChecked, setErrorReporter, getTargetTypeCheckerConfig, getTargetInfo, getOriginalTarget } from '..';
import { GET_PROPERTY, ARGUMENTS } from '../checkers/utils';

// all tests about configuring proxy
describe('Proxy configs', () => {
  const reporter = jest.fn();
  let target;

  beforeEach(() => {
    setErrorReporter(reporter);
    reporter.mockClear();
    PrimitiveTypeChecker.collectTypesOnInit = true;
  });

  afterEach(() => {
    setProxyConfig({
      wrapFunctionReturnValues: true,
      wrapFunctionArguments: false,
      wrapSetPropertyValues: true,
    });
  });

  describe('When partially updating config', () => {
    beforeEach(() => {
      setProxyConfig({ wrapFunctionReturnValues: false });
      setProxyConfig({ wrapFunctionArguments: true });
      setProxyConfig({ wrapSetPropertyValues: false });
      setProxyConfig({ ignorePrototypeMethods: false });
    });

    it('should apply specified configs', () => {
      expect(getProxyConfig()).toEqual({
        wrapFunctionReturnValues: false,
        wrapFunctionArguments: true,
        wrapSetPropertyValues: false,
        ignorePrototypeMethods: false,
      });
    });
  });

  describe('wrapFunctionReturnValues', () => {
    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ wrapFunctionReturnValues: true });
      });

      describe('When returning primitive value', () => {
        beforeEach(() => {
          target = create({
            method: () => 'my string',
          });
        });

        it('should retun string as is', () => {
          expect(target.method()).toBe('my string');
        });
      });

      describe('When returning target value', () => {
        let result;

        beforeEach(() => {
          target = create({
            method: () => ({
              numberValue: 123,
              stringValue: 'my string',
            }),
          });

          result = target.method();
        });

        it('should retun type checked value', () => {
          expect(isTypeChecked(result)).toBe(true);
        });

        it('should retun type wrapped object', () => {
          expect(result).toEqual(expect.objectContaining({
            numberValue: 123,
            stringValue: 'my string',
          }));
        });

        describe('When return value is inconsistent', () => {
          let result;

          beforeEach(() => {
            target.method = () => ({
              numberValue: 'my string',
              stringValue: 123,
            });

            result = target.method();
            (() => null)(result.numberValue, result.stringValue);
          });

          it('should retun type checked value', () => {
            expect(isTypeChecked(result)).toBe(true);
          });

          it('should return type wrapped object', () => {
            expect(result).toEqual(expect.objectContaining({
              numberValue: 'my string',
              stringValue: 123,
            }));
          });

          it('should report return value errors', () => {
            expect(reporter).toHaveBeenCalledTimes(2);
            expect(reporter).toHaveBeenCalledWith(GET_PROPERTY, 'method(ReturnValue).numberValue', 'number', 'string');
            expect(reporter).toHaveBeenCalledWith(GET_PROPERTY, 'method(ReturnValue).stringValue', 'string', 'number');
          });
        });
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ wrapFunctionReturnValues: false });
      });

      describe('When returning primitive value', () => {
        beforeEach(() => {
          target = create({
            method: () => 'my string',
          });
        });

        it('should retun string as is', () => {
          expect(target.method()).toBe('my string');
        });
      });

      describe('When returning target value', () => {
        let result;

        beforeEach(() => {
          target = create({
            method: () => ({
              numberValue: 123,
              stringValue: 'my string',
            }),
          });

          result = target.method();
        });

        it('should retun type checked value', () => {
          expect(isTypeChecked(result)).toBe(false);
        });

        it('should retun type wrapped object', () => {
          expect(result).toEqual({
            numberValue: 123,
            stringValue: 'my string',
          });
        });
      });
    });
  });

  describe('wrapFunctionArguments', () => {
    let method;
    let arg;

    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ wrapFunctionArguments: true });
        method = jest.fn();
        target = create({
          method: (...args) => method(...args),
        });

        target.method(true, 12, { value: 'my string' });
        arg = method.mock.calls[0][2];
        (() => null)(arg.value);
      });

      it('should make object type checked', () => {
        expect(isTypeChecked(arg)).toBe(true);
      });

      it('should not report any type errors', () => {
        expect(reporter).not.toHaveBeenCalled();
      });

      describe('When called with wrong arguments', () => {
        beforeEach(() => {
          method.mockClear();
          target.method(0, '12', { value: 123 });
        });

        it('should report primitive type errors', () => {
          expect(reporter).toHaveBeenCalledTimes(2);
          expect(reporter).toHaveBeenCalledWith(ARGUMENTS, 'method[0]', 'boolean', 'number');
          expect(reporter).toHaveBeenCalledWith(ARGUMENTS, 'method[1]', 'number', 'string');
        });

        describe('When accessed argument property', () => {
          beforeEach(() => {
            reporter.mockClear();
            arg = method.mock.calls[0][2];
            (() => null)(arg.value);
          });

          it('should report primitive type errors', () => {
            expect(reporter).toHaveBeenCalledTimes(1);
            expect(reporter).toHaveBeenCalledWith(GET_PROPERTY, 'method[2].value', 'string', 'number');
          });
        });
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ wrapFunctionArguments: false });
        method = jest.fn();
        target = create({
          method: (...args) => method(...args),
        });

        target.method(true, 12, { value: 'my string' });
        arg = method.mock.calls[0][2];
        (() => null)(arg.value);
      });

      it('should make object type checked', () => {
        expect(isTypeChecked(arg)).toBe(false);
      });

      it('should not report any type errors', () => {
        expect(reporter).not.toHaveBeenCalled();
      });

      describe('When called with wrong arguments', () => {
        beforeEach(() => {
          target.method(0, '12', { value: 123 });
          arg = method.mock.calls[0][2];
          (() => null)(arg.value);
        });

        it('should report primitive type errors', () => {
          expect(reporter).toHaveBeenCalledTimes(2);
          expect(reporter).toHaveBeenCalledWith(ARGUMENTS, 'method[0]', 'boolean', 'number');
          expect(reporter).toHaveBeenCalledWith(ARGUMENTS, 'method[1]', 'number', 'string');
        });
      });
    });
  });

  describe('wrapSetPropertyValues', () => {
    let value;

    beforeEach(() => {
      target = create({
        get value() {
          return value;
        },
        set value(newValue) {
          value = newValue;
        },
      });
    });

    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ wrapSetPropertyValues: true });
        target.value = { child: 123 };
      });

      it('should assign type checked value', () => {
        expect(isTypeChecked(value)).toBe(true);
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ wrapSetPropertyValues: false });
        target.value = { child: 123 };
      });

      it('should assign original value', () => {
        expect(isTypeChecked(value)).toBe(false);
      });
    });
  });
});
