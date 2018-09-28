import {
  getWrapConfig,
  setWrapConfig,
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
  WRAP_SET_PROPERTY_VALUES,
  PROXY_IGNORE_PROTOTYPE_METHODS,
  getDefaultWrapConfig,
} from '../config';

import create from '../create';

import { setDefaultTypeChecker } from '../../checkers';

import { isWrapped } from '../../utils';

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
      returnValue: jest.fn(),
    };

    setDefaultTypeChecker(checker);
  });

  afterEach(() => {
    setWrapConfig(getDefaultWrapConfig());
  });

  describe('When partially updating config', () => {
    beforeEach(() => {
      setWrapConfig({ [WRAP_FUNCTION_RETURN_VALUES]: false });
      setWrapConfig({ [WRAP_FUNCTION_ARGUMENTS]: true });
      setWrapConfig({ [WRAP_SET_PROPERTY_VALUES]: false });
      setWrapConfig({ [PROXY_IGNORE_PROTOTYPE_METHODS]: false });
    });

    it('should apply specified configs', () => {
      expect(getWrapConfig()).toEqual({
        [WRAP_FUNCTION_RETURN_VALUES]: false,
        [WRAP_FUNCTION_ARGUMENTS]: true,
        [WRAP_SET_PROPERTY_VALUES]: false,
        [PROXY_IGNORE_PROTOTYPE_METHODS]: false,
      });
    });
  });

  describe(WRAP_FUNCTION_RETURN_VALUES, () => {
    describe('When set to true', () => {
      beforeEach(() => {
        setWrapConfig({ [WRAP_FUNCTION_RETURN_VALUES]: true });
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
          expect(isWrapped(result)).toBe(true);
        });

        it('should retun type wrapped object', () => {
          expect(result).toEqual(expect.objectContaining({
            numberValue: 123,
            stringValue: 'my string',
          }));
        });
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setWrapConfig({ [WRAP_FUNCTION_RETURN_VALUES]: false });
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
          expect(isWrapped(result)).toBe(false);
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

  describe(WRAP_FUNCTION_ARGUMENTS, () => {
    let method;

    describe('When set to true', () => {
      beforeEach(() => {
        setWrapConfig({ [WRAP_FUNCTION_ARGUMENTS]: true });
        method = jest.fn();
        target = create({
          method: (...args) => method(...args),
        });

        target.method(true, 12, { value: 'my string' });
      });

      it('should make object type checked', () => {
        const [args] = method.mock.calls;
        expect(isWrapped(args[0])).toBe(false);
        expect(isWrapped(args[1])).toBe(false);
        expect(isWrapped(args[2])).toBe(true);
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setWrapConfig({ [WRAP_FUNCTION_ARGUMENTS]: false });
        method = jest.fn();
        target = create({
          method: (...args) => method(...args),
        });

        target.method(true, 12, { value: 'my string' }, []);
      });

      it('should make object type checked', () => {
        const [args] = method.mock.calls;
        expect(isWrapped(args[0])).toBe(false);
        expect(isWrapped(args[1])).toBe(false);
        expect(isWrapped(args[2])).toBe(false);
        expect(isWrapped(args[3])).toBe(false);
      });
    });
  });

  describe(WRAP_SET_PROPERTY_VALUES, () => {
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
        setWrapConfig({ [WRAP_SET_PROPERTY_VALUES]: true });
        target.value = { child: 123 };
      });

      it('should assign type checked value', () => {
        expect(isWrapped(value)).toBe(true);
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setWrapConfig({ [WRAP_SET_PROPERTY_VALUES]: false });
        target.value = { child: 123 };
      });

      it('should assign original value', () => {
        expect(isWrapped(value)).toBe(false);
      });
    });
  });

  describe(PROXY_IGNORE_PROTOTYPE_METHODS, () => {
    beforeEach(() => {
      target = create([]);
    });

    describe('When set to true', () => {
      beforeEach(() => {
        setWrapConfig({ [PROXY_IGNORE_PROTOTYPE_METHODS]: false });
      });

      it('prototype method should be type checked', () => {
        expect(isWrapped(target.push)).toBe(true);
      });
    });

    describe('When set to false', () => {
      beforeEach(() => {
        setWrapConfig({ [PROXY_IGNORE_PROTOTYPE_METHODS]: true });
      });

      it('prototype method should not be type checked', () => {
        expect(isWrapped(target.push)).toBe(false);
      });
    });
  });

  describe('When created with custom proxy config', () => {
    beforeEach(() => {
      setWrapConfig({
        [WRAP_FUNCTION_RETURN_VALUES]: false,
        [WRAP_FUNCTION_ARGUMENTS]: false,
        [WRAP_SET_PROPERTY_VALUES]: false,
        [PROXY_IGNORE_PROTOTYPE_METHODS]: true,
      });

      target = create(
        {
          method: () => null,
        },
        {
          [WRAP_FUNCTION_RETURN_VALUES]: true,
          [WRAP_FUNCTION_ARGUMENTS]: true,
          [WRAP_SET_PROPERTY_VALUES]: true,
          [PROXY_IGNORE_PROTOTYPE_METHODS]: false,
        },
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
