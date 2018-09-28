import create from '../create';
import { isWrapped } from '../../utils';
import { setDefaultTypeChecker } from '../../checkers';
import { setEnabled } from '../../enabled';

const mockChecker = () => ({
  init: jest.fn(() => ({ type: 'type-checker-config' })),
  getProperty: jest.fn(),
  setProperty: jest.fn(),
  arguments: jest.fn(),
  returnValue: jest.fn(),
  mergeConfigs: jest.fn((config1, config2, names) => ({
    config1,
    config2,
    names,
  })),
});

describe('create()', () => {
  let target;

  beforeEach(() => {
    setDefaultTypeChecker(mockChecker());
  });

  describe('When disabled', () => {
    beforeEach(() => {
      setEnabled(false);

      target = create({
        val11: 1,
        val12: '2',
      });
    });

    afterEach(() => {
      setEnabled(true);
    });

    it('should return same object', () => {
      expect(target).toBe(target);
      expect(target).toEqual({
        val11: 1,
        val12: '2',
      });
      expect(isWrapped(target)).toBe(false);
    });
  });

  describe('When options passed', () => {});

  describe('When no options passed', () => {
    beforeEach(() => {
      target = create({
        val11: 1,
        val12: '2',
      });
    });

    it('should return type checked object', () => {
      expect(isWrapped(target)).toBe(true);
    });
  });
});
