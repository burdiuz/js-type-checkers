import { TARGET_KEY, getOriginalTarget } from '../proxy';

describe('getOriginalTarget()', () => {
  let target;

  describe('When target is null', () => {
    it('should not throw error', () => {
      expect(getOriginalTarget(null)).toBe(null);
    });
  });

  describe('When target contains TARGET_KEY', () => {
    let internal;

    beforeEach(() => {
      internal = { type: 'original-target' };

      target = { [TARGET_KEY]: internal };
    });

    it('should result with target object', () => {
      expect(getOriginalTarget(target)).toBe(internal);
    });
  });

  describe('When target does not contain TARGET_KEY', () => {
    beforeEach(() => {
      target = { type: 'original-target' };
    });
    it('should result with target object', () => {
      expect(getOriginalTarget(target)).toBe(target);
    });
  });
});
