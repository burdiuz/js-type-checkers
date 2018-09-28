import { isEnabled, setEnabled } from '../enabled';

describe('isEnabled()', () => {
  it('should be enabled by default', () => {
    expect(isEnabled()).toBe(true);
  });

  describe('When set disabled', () => {
    beforeEach(() => {
      setEnabled(false);
    });

    afterEach(() => {
      setEnabled(true);
    });

    it('should return false', () => {
      expect(isEnabled()).toBe(false);
    });

    describe('When set enabled', () => {
      beforeEach(() => {
        setEnabled(true);
      });

      it('should return true', () => {
        expect(isEnabled()).toBe(true);
      });
    });
  });
});
