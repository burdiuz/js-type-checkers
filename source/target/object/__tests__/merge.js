import create from '../../../proxy/create';
import { setEnabled } from '../../../enabled';
import merge from '../merge';

jest.mock('../../../proxy/create', () =>
  jest.fn(() => ({ type: 'type-checked' })));

describe('merge()', () => {
  let target1;
  let target2;

  describe('When disabled', () => {
    beforeEach(() => {
      setEnabled(false);
    });

    afterEach(() => {
      setEnabled(true);
    });

    it('should return merged object', () => {});
  });

  describe('When options passed', () => {});

  describe('When no options passed', () => {});

  describe('When all type checked', () => {
    beforeEach(() => {
      target1 = create({
        val11: 1,
        val12: '2',
      });

      target2 = create({
        val21: true,
        val22: {},
      });
    });

    merge(target1, target2);
  });

  describe('When some type checked', () => {});

  describe('When none type checked', () => {});
});

describe('Object.assign()', () => {});
