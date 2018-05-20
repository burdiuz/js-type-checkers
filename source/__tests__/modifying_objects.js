import create from '../proxy/create';
import { isTypeChecked } from '../utils';
import { setDefaultTypeChecker } from '../checkers';

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

describe('Object.assign()', () => {});

describe('merge()', () => {
  let checker;
  let target1;
  let target2;

  beforeEach(() => {
    checker = mockChecker();
    setDefaultTypeChecker(checker);

    target1 = create({
      val11: 1,
      val12: '2',
    });

    target2 = create({
      val21: true,
      val22: {},
    });
  });

  it('shoult both targets be type checked', () => {
    expect(isTypeChecked(target1)).toBe(true);
    expect(isTypeChecked(target2)).toBe(true);
  });
});

describe('properties()', () => {});