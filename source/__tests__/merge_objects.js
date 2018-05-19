import create from '../proxy/create';
import { isTypeChecked } from '../utils';
import { setDefaultTypeChecker } from '../checkers';

describe('When merging objects', () => {
  let checker;
  let target1;
  let target2;

  beforeEach(() => {
    checker = {
      init: jest.fn(() => ({ type: 'type-checker-config' })),
      getProperty: jest.fn(),
      setProperty: jest.fn(),
      arguments: jest.fn(),
      returnValue: jest.fn(),
    };

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

  describe('Object.assign()', () => {});

  describe('merge()', () => {});
});
