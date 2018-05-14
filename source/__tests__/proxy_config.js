import {
  getProxyConfig,
  setProxyConfig,
  create,
} from '../proxy';
import { PrimitiveTypeChecker, isTypeChecked, setErrorReporter } from '..';

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
            method: () => ({ numberValue: 123, stringValue: 'my string' }),
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
            target = create({
              method: () => ({ numberValue: 'my string', stringValue: 123 }),
            });
            result = target.method();
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

          it.only('should report return value errors', () => {
            console.log(reporter.mock.calls);
            expect(reporter).toHaveBeenCalledTimes(1);
          });
        });
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ wrapFunctionReturnValues: false });
      });

    });
  });

  describe('wrapFunctionArguments', () => {
    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ wrapFunctionArguments: true });
      });

    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ wrapFunctionArguments: false });
      });
    });
  });
  describe('wrapSetPropertyValues', () => {
    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ wrapSetPropertyValues: true });
      });

    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ wrapSetPropertyValues: false });
      });
    });
  });
});
