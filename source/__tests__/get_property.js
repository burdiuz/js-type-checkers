import { setErrorReporter } from '../reporters';
import { PrimitiveTypeChecker, setDefaultTypeChecker } from '../checkers';
import { create } from '../';

describe('Get Property', () => {
  const reporter = jest.fn();

  beforeEach(() => {
    setErrorReporter(reporter);
    reporter.mockClear();
  });

  describe('When type pre-initialized', () => {
    let target;

    beforeEach(() => {
      PrimitiveTypeChecker.collectTypesOnInit = true;
      target = create({
        numberValue: 12,
        stringValue: 'my string',
        booleanValue: true,
        arrayValue: [],
        objectValue: {},
      });
    });

    describe('When setting values of mismatched types', () => {
      beforeEach(() => {
        target.numberValue = '123';
        target.stringValue = false;
        target.booleanValue = false;
        target.arrayValue = {};
        target.objectValue = [];
      });

      it('should report mismatched primitive types', () => {
        // console.log(reporter.mock.calls);
        expect(reporter).toHaveBeenCalledTimes(4);
      });
    });
  });

  describe('When type was not initialized', () => {

  });
});
