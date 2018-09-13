import createDeep from '../createDeep';
import { setDefaultTypeChecker } from '../../checkers';
import { getTargetInfo } from '../../target/info';
import { getOriginalTarget } from '../../target/proxy';
import { setEnabled } from '../../enabled';
import { isTypeChecked } from '../../utils';
import create from '../create';

const mockChecker = () => ({
  init: (target) => ({ type: `type-checker-${typeof target}` }),
  getProperty: () => true,
  setProperty: () => true,
  arguments: () => true,
  returnValue: () => true,
  mergeConfigs: (config1, config2, names) => ({ config1, config2, names }),
});

describe('createDeep()', () => {
  let target;

  class MyClass {
    constructor() {
      this.stringValue = 'my string';
      this.booleanValue = 0;
      this.numbers = [0, 2, 3, 4];
    }
  }

  beforeEach(() => {
    setDefaultTypeChecker(mockChecker());
  });

  describe('When type checkers disabled', () => {
    beforeEach(() => {
      setEnabled(false);
      target = { list: [0, 1, 2, 3] };
    });

    afterEach(() => {
      setEnabled(true);
    });

    it('should return target as is', () => {
      expect(createDeep(target)).toBe(target);
    });

    it('should not be type checked', () => {
      expect(isTypeChecked(createDeep(target))).toBe(false);
      expect(isTypeChecked(createDeep(target).list)).toBe(false);
    });
  });

  describe('When target is not valid', () => {
    it('should return target as is', () => {
      const symbol = Symbol('1213223');
      expect(createDeep('my str')).toBe('my str');
      expect(createDeep(123)).toBe(123);
      expect(createDeep(true)).toBe(true);
      expect(createDeep(symbol)).toBe(symbol);
    });
  });

  describe('When target is type checked already', () => {
    beforeEach(() => {
      target = create({
        child: { val1: 1, val2: '2' },
      });
    });

    it('should return target as is', () => {
      expect(createDeep(target)).toBe(target);
    });

    it('should skip checking children', () => {
      expect(getOriginalTarget(createDeep(target)).child).toEqual({
        val1: 1,
        val2: '2',
      });
    });
  });

  describe('When target is valid and not type checked', () => {
    beforeEach(() => {
      const object = {
        stringValue: 'my string',
        booleanValue: true,
        list: [0, '2', true, [{ type: 'my objects' }]],
        method: (a, b, c) => (a + b) / c,
        child: new MyClass(),
      };

      target = createDeep(object);
    });

    it('should touch every descendant to generate full types map', () => {
      expect(target).toMatchSnapshot();
    });

    it('should contain type checked arrays', () => {
      expect(getTargetInfo(target.list)).toMatchSnapshot();
    });

    describe('When creating an object with already existing info', () => {
      let info;
      let newTarget;

      beforeEach(() => {
        info = getTargetInfo(target);

        const object = {
          stringValue: new MyClass(),
          booleanValue: true,
          list: (a, b, c) => (a + b) / c,
          method: [0, '2', true, [{ type: 'my objects' }]],
          child: 'my string',
        };

        newTarget = getOriginalTarget(createDeep(object, { info }));
      });

      it('should apply Function ino to "method"', () => {
        expect(getTargetInfo(newTarget.method).config.type).toBe('type-checker-function');
        expect(getTargetInfo(newTarget.method)).toMatchSnapshot();
      });

      it('should apply Array info to "list"', () => {
        expect(getTargetInfo(newTarget.list).config.type).toBe('type-checker-object');
        expect(getTargetInfo(newTarget.list)).toMatchSnapshot();
      });
    });
  });
});
