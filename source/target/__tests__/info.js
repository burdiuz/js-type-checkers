import {
  createChildrenCache,
  createTargetInfo,
  getChildInfo,
  getTargetInfo,
  getTargetTypeChecker,
  getTargetTypeCheckerConfig,
  hasChildInfo,
  hasTargetInfo,
  mergeTargetInfo,
  removeChildInfo,
  setTargetInfo,
  storeChildInfo,
  storeChildInfoFrom,
  INFO_KEY,
} from '../info';

describe('createChildrenCache()', () => {
  it('should result with empty object', () => {
    expect(createChildrenCache()).toEqual({});
  });

  it('should result with new object', () => {
    expect(createChildrenCache()).not.toBe(createChildrenCache());
  });
});

describe('createTargetInfo()', () => {
  it('should apply defaults for missing args', () => {
    expect(createTargetInfo()).toEqual({
      checker: undefined,
      config: undefined,
      deep: true,
      names: [],
      children: {},
    });
  });

  it('should store options', () => {
    expect(createTargetInfo(
      { type: 'checker' },
      { type: 'config' },
      false,
      ['name'],
      { type: 'children' },
    )).toEqual({
      checker: { type: 'checker' },
      config: { type: 'config' },
      deep: false,
      names: ['name'],
      children: { type: 'children' },
    });
  });

  it('should result with new object', () => {
    expect(createTargetInfo()).not.toBe(createTargetInfo());
  });
});

describe('getTargetInfo()', () => {
  it('should return info', () => {
    expect(getTargetInfo({ [INFO_KEY]: { type: 'info-object' } })).toEqual({
      type: 'info-object',
    });
  });

  describe('When target has no info', () => {
    it('should return undefined', () => {
      expect(getTargetInfo({ type: 'object' })).toEqual(undefined);
    });
  });

  describe('When target is null', () => {
    it('should return undefined', () => {
      expect(getTargetInfo(null)).toEqual(undefined);
    });
  });
});

describe('setTargetInfo()', () => {
  let target;

  beforeEach(() => {
    target = {};
  });

  describe('When all args are ok', () => {
    beforeEach(() => {
      setTargetInfo(target, { type: 'info-object' });
    });

    it('should return info', () => {
      expect(target).toEqual({ [INFO_KEY]: { type: 'info-object' } });
    });
  });

  describe('When no info passed', () => {
    beforeEach(() => {
      setTargetInfo(target, null);
    });

    it('should return undefined', () => {
      expect(target).toEqual({});
    });
  });

  describe('When target is null', () => {
    it('should not throw error', () => {
      expect(() => {
        setTargetInfo(null, { type: 'info-object' });
        setTargetInfo(null, null);
        setTargetInfo();
      }).not.toThrow();
    });
  });
});

describe('hasTargetInfo()', () => {
  describe('When target has info', () => {
    it('should result with true', () => {
      expect(hasTargetInfo({ [INFO_KEY]: { type: 'info-object' } })).toBe(true);
    });
  });

  describe('When target does not have info', () => {
    it('should result with true', () => {
      expect(hasTargetInfo({ info: {} })).toBe(false);
    });
  });
});

describe('getTargetTypeChecker()', () => {
  describe('When no target passed', () => {
    it('should result with undefined', () => {
      expect(getTargetTypeChecker()).toBeUndefined();
    });
  });

  describe('When target has info', () => {
    describe('When target does not have type checker', () => {
      it('should result with undefined', () => {
        expect(getTargetTypeChecker({ [INFO_KEY]: { type: 'info-object' } })).toBeUndefined();
      });
    });

    describe('When target has type checker', () => {
      let checker;

      beforeEach(() => {
        checker = { type: 'checker-object' };
      });

      it('should result with undefined', () => {
        expect(getTargetTypeChecker({ [INFO_KEY]: { checker } })).toBe(checker);
      });
    });
  });

  describe('When target does not have info', () => {
    it('should result with undefined', () => {
      expect(getTargetTypeChecker({ info: {} })).toBeUndefined();
    });
  });
});

describe('getTargetTypeCheckerConfig()', () => {
  describe('When no target passed', () => {
    it('should result with undefined', () => {
      expect(getTargetTypeCheckerConfig()).toBeUndefined();
    });
  });

  describe('When target has info', () => {
    describe('When target does not have type checker', () => {
      it('should result with undefined', () => {
        expect(getTargetTypeCheckerConfig({ [INFO_KEY]: { type: 'info-object' } })).toBeUndefined();
      });
    });

    describe('When target has type checker', () => {
      let config;

      beforeEach(() => {
        config = { type: 'checker-config' };
      });

      it('should result with undefined', () => {
        expect(getTargetTypeCheckerConfig({ [INFO_KEY]: { config } })).toBe(config);
      });
    });
  });

  describe('When target does not have info', () => {
    it('should result with undefined', () => {
      expect(getTargetTypeCheckerConfig({ info: {} })).toBeUndefined();
    });
  });
});

describe('storeChildInfo()', () => {
  let children;

  beforeEach(() => {
    children = {};
    storeChildInfo(children, 'myProperty', { type: 'child-info' });
  });

  it('should save child info into object', () => {
    expect(children).toEqual({
      '@myProperty': { type: 'child-info' },
    });
  });
});

describe('storeChildInfoFrom()', () => {
  let children;

  beforeEach(() => {
    children = {};
    storeChildInfoFrom(children, 'myProperty', {
      [INFO_KEY]: { type: 'child-info' },
    });
  });

  it('should save child info into object', () => {
    expect(children).toEqual({
      '@myProperty': { type: 'child-info' },
    });
  });
});

describe('getChildInfo()', () => {
  let child;

  beforeEach(() => {
    child = { type: 'child-info' };
  });

  it('should return info object by name', () => {
    expect(getChildInfo(
      {
        '@prop': child,
      },
      'prop',
    )).toBe(child);
  });
});

describe('hasChildInfo()', () => {
  it('should return true if exists', () => {
    expect(hasChildInfo(
      {
        '@property': { type: 'child-info' },
      },
      'property',
    )).toBe(true);
  });

  it('should return false if exists', () => {
    expect(hasChildInfo(
      {
        '@property': { type: 'child-info' },
      },
      'property1',
    )).toBe(false);
  });
});

describe('removeChildInfo()', () => {
  let children;

  beforeEach(() => {
    children = {
      '@property': { type: 'child-info' },
    };

    removeChildInfo(children, 'property');
  });

  it('should return child info from collection', () => {
    expect(children).toEqual({});
  });
});

describe('When merging info', () => {
  let checker;
  let mergeConfigs;
  let info1;
  let info2;
  let result;

  beforeEach(() => {
    mergeConfigs = jest.fn(() => ({ type: 'merged-config' }));
    checker = {
      type: 'checker',
      mergeConfigs: (...args) => mergeConfigs(...args),
    };

    info1 = createTargetInfo(
      checker,
      { type: 'checker1-config1' },
      true,
      ['name1'],
      {
        prop1: createTargetInfo(checker, { type: 'checker1-child1' }, true, [
          'name1',
          'child1',
        ]),
        prop2: createTargetInfo(checker, { type: 'checker1-child2' }, true, [
          'name1',
          'child2',
        ]),
      },
    );

    info2 = createTargetInfo(
      checker,
      { type: 'checker2-config2' },
      true,
      ['name2'],
      {
        prop2: createTargetInfo(checker, { type: 'checker2-child2' }, true, [
          'name2',
          'child2',
        ]),
        prop3: createTargetInfo(checker, { type: 'checker2-child3' }, true, [
          'name2',
          'child3',
        ]),
      },
    );
  });

  describe('When same type checker used', () => {
    beforeEach(() => {
      result = mergeTargetInfo(info1, info2);
    });

    it('should match merged info objects', () => {
      expect(result).toMatchSnapshot();
    });

    it('should result with modified info1', () => {
      expect(result).toBe(info1);
    });

    it('should call to merge children', () => {
      expect(mergeConfigs).toHaveBeenCalledTimes(2);
      expect(mergeConfigs).toHaveBeenCalledWith(
        { type: 'checker1-config1' },
        { type: 'checker2-config2' },
        ['name1'],
      );
      expect(mergeConfigs).toHaveBeenCalledWith(
        { type: 'checker1-child2' },
        { type: 'checker2-child2' },
        ['name1', 'child2'],
      );
    });
  });

  describe('When different type checkers used', () => {
    beforeEach(() => {
      info2.checker = {
        type: 'checker2',
        mergeConfigs: (...args) => mergeConfigs(...args),
      };
      result = mergeTargetInfo(info1, info2);
    });

    it('should match not merged info1', () => {
      expect(result).toMatchSnapshot();
    });

    it('should result with modified info1', () => {
      expect(result).toBe(info1);
    });

    it('should keep config unchanged', () => {
      expect(result.config).toEqual({ type: 'checker1-config1' });
    });

    it('should not call to merge children', () => {
      expect(mergeConfigs).not.toHaveBeenCalled();
    });
  });
});
