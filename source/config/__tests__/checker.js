import { getDefaultTypeChecker, setDefaultTypeChecker } from '../checker';

describe('getDefaultTypeChecker()', () => {
  let checker;

  beforeEach(() => {
    checker = { type: 'checker' };
  });

  describe('When accessing default', () => {
    it('should be null', () => {
      expect(getDefaultTypeChecker()).toBeNull();
    });
  });

  describe('When specifying default', () => {
    beforeEach(() => {
      setDefaultTypeChecker(checker);
    });

    it('should be checker instance', () => {
      expect(getDefaultTypeChecker()).toBe(checker);
    });
  });
});
