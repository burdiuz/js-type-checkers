import { TARGET_KEY, unwrap } from '../proxy';

describe('unwrap()', () => {
  let target;

  describe('When target is null', () => {
    it('should not throw error', () => {
      expect(unwrap(null)).toBe(null);
    });
  });

  describe('When target contains TARGET_KEY', () => {
    let internal;

    beforeEach(() => {
      internal = { type: 'original-target' };

      target = { [TARGET_KEY]: internal };
    });

    it('should result with target object', () => {
      expect(unwrap(target)).toBe(internal);
    });
  });

  describe('When target does not contain TARGET_KEY', () => {
    beforeEach(() => {
      target = { type: 'original-target' };
    });
    it('should result with target object', () => {
      expect(unwrap(target)).toBe(target);
    });
  });
});
