import {
  getProxyConfig,
  setProxyConfig,
  create,
  PROXY_WRAP_FUNCTION_ARGUMENTS,
  PROXY_WRAP_FUNCTION_RETURN_VALUES,
  PROXY_WRAP_SET_PROPERTY_VALUES,
  PROXY_IGNORE_PROTOTYPE_METHODS,
  getDefaultProxyConfig
} from '../proxy';
import { setDefaultTypeChecker } from '../checkers';
import { isTypeChecked } from '../utils';

// all tests about configuring proxy
describe('Proxy configs', () => {
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

  afterEach(() => {
    setProxyConfig(getDefaultProxyConfig());
  });

  describe('When partially updating config', () => {
    beforeEach(() => {
      setProxyConfig({ [PROXY_WRAP_FUNCTION_RETURN_VALUES]: false });
      setProxyConfig({ [PROXY_WRAP_FUNCTION_ARGUMENTS]: true });
      setProxyConfig({ [PROXY_WRAP_SET_PROPERTY_VALUES]: false });
      setProxyConfig({ [PROXY_IGNORE_PROTOTYPE_METHODS]: false });
    });

    it('should apply specified configs', () => {
      expect(getProxyConfig()).toEqual({
        [PROXY_WRAP_FUNCTION_RETURN_VALUES]: false,
        [PROXY_WRAP_FUNCTION_ARGUMENTS]: true,
        [PROXY_WRAP_SET_PROPERTY_VALUES]: false,
        [PROXY_IGNORE_PROTOTYPE_METHODS]: false
      });
    });
  });

  describe(PROXY_WRAP_FUNCTION_RETURN_VALUES, () => {
    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ [PROXY_WRAP_FUNCTION_RETURN_VALUES]: true });
      });

      describe('When returning primitive value', () => {
        beforeEach(() => {
          target = create({
            method: () => 'my string'
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
              stringValue: 'my string'
            })
          });

          result = target.method();
        });

        it('should retun type checked value', () => {
          expect(isTypeChecked(result)).toBe(true);
        });

        it('should retun type wrapped object', () => {
          expect(result).toEqual(
            expect.objectContaining({
              numberValue: 123,
              stringValue: 'my string'
            })
          );
        });
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ [PROXY_WRAP_FUNCTION_RETURN_VALUES]: false });
      });

      describe('When returning primitive value', () => {
        beforeEach(() => {
          target = create({
            method: () => 'my string'
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
              stringValue: 'my string'
            })
          });

          result = target.method();
        });

        it('should retun type checked value', () => {
          expect(isTypeChecked(result)).toBe(false);
        });

        it('should retun type wrapped object', () => {
          expect(result).toEqual({
            numberValue: 123,
            stringValue: 'my string'
          });
        });
      });
    });
  });

  describe(PROXY_WRAP_FUNCTION_ARGUMENTS, () => {
    let method;

    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ [PROXY_WRAP_FUNCTION_ARGUMENTS]: true });
        method = jest.fn();
        target = create({
          method: (...args) => method(...args)
        });

        target.method(true, 12, { value: 'my string' });
      });

      it('should make object type checked', () => {
        const [args] = method.mock.calls;
        expect(isTypeChecked(args[0])).toBe(false);
        expect(isTypeChecked(args[1])).toBe(false);
        expect(isTypeChecked(args[2])).toBe(true);
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ [PROXY_WRAP_FUNCTION_ARGUMENTS]: false });
        method = jest.fn();
        target = create({
          method: (...args) => method(...args)
        });

        target.method(true, 12, { value: 'my string' }, []);
      });

      it('should make object type checked', () => {
        const [args] = method.mock.calls;
        expect(isTypeChecked(args[0])).toBe(false);
        expect(isTypeChecked(args[1])).toBe(false);
        expect(isTypeChecked(args[2])).toBe(false);
        expect(isTypeChecked(args[3])).toBe(false);
      });
    });
  });

  describe(PROXY_WRAP_SET_PROPERTY_VALUES, () => {
    let value;

    beforeEach(() => {
      target = create({
        get value() {
          return value;
        },
        set value(newValue) {
          value = newValue;
        }
      });
    });

    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ [PROXY_WRAP_SET_PROPERTY_VALUES]: true });
        target.value = { child: 123 };
      });

      it('should assign type checked value', () => {
        expect(isTypeChecked(value)).toBe(true);
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ [PROXY_WRAP_SET_PROPERTY_VALUES]: false });
        target.value = { child: 123 };
      });

      it('should assign original value', () => {
        expect(isTypeChecked(value)).toBe(false);
      });
    });
  });

  describe(PROXY_IGNORE_PROTOTYPE_METHODS, () => {
    beforeEach(() => {
      target = create([]);
    });

    describe('When set to true', () => {
      beforeEach(() => {
        setProxyConfig({ [PROXY_IGNORE_PROTOTYPE_METHODS]: false });
      });

      it('prototype method should be type checked', () => {
        expect(isTypeChecked(target.push)).toBe(true);
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setProxyConfig({ [PROXY_IGNORE_PROTOTYPE_METHODS]: true });
      });

      it('prototype method should not be type checked', () => {
        expect(isTypeChecked(target.push)).toBe(false);
      });
    });
  });

  describe('When created with custom proxy config', () => {
    beforeEach(() => {
      setProxyConfig({
        [PROXY_WRAP_FUNCTION_RETURN_VALUES]: false,
        [PROXY_WRAP_FUNCTION_ARGUMENTS]: false,
        [PROXY_WRAP_SET_PROPERTY_VALUES]: false,
        [PROXY_IGNORE_PROTOTYPE_METHODS]: true
      });

      target = create(
        {
          method: () => null
        },
        {
          [PROXY_WRAP_FUNCTION_RETURN_VALUES]: true,
          [PROXY_WRAP_FUNCTION_ARGUMENTS]: true,
          [PROXY_WRAP_SET_PROPERTY_VALUES]: true,
          [PROXY_IGNORE_PROTOTYPE_METHODS]: false
        }
      );
    });

    describe('When set property', () => {
      it('should override config global and assign type checked value', () => {});
    });

    describe('When call method', () => {
      it('should override config global and apply type checked arguments', () => {});
    });

    describe('When access prototype method', () => {
      it('should override config global and return type checked function', () => {});
    });
  });
});
