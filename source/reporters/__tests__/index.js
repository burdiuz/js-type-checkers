import {
  getErrorReporter,
  setErrorReporter,
  ConsoleErrorReporter,
} from '../index';

describe('getErrorReporter()', () => {
  let reporter;

  beforeEach(() => {
    reporter = () => null;
  });

  afterEach(() => {
    setErrorReporter(ConsoleErrorReporter);
  });

  describe('When accessing default', () => {
    it('should have default error reporter', () => {
      expect(getErrorReporter()).toBe(ConsoleErrorReporter);
    });
  });

  describe('When specifying default', () => {
    beforeEach(() => {
      setErrorReporter(reporter);
    });

    it('should be checker instance', () => {
      expect(getErrorReporter()).toBe(reporter);
    });
  });
});
