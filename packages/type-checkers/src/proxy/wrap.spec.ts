import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { wrap, createInfoFromOptions, createWrapFactory } from './wrap';
import { isWrapped, isWrappable, unwrap } from '../utils';
import { setEnabled } from '../config/enabled';
import { setDefaultTypeChecker } from '../config/default-checker';
import { getTargetInfo, hasTargetInfo } from '../info';
import StubTypeChecker from '../stub-checker';

const checker = new StubTypeChecker();

beforeAll(() => {
  setDefaultTypeChecker(checker);
});

afterAll(() => {
  setDefaultTypeChecker(undefined as never);
  setEnabled(true);
});

describe('wrap', () => {
  it('returns the target wrapped in a Proxy', () => {
    const target = {};
    const result = wrap(target);
    expect(isWrapped(result)).toBe(true);
    expect(unwrap(result)).toBe(target);
  });

  it('attaches TargetInfo to the wrapped target', () => {
    const target = {};
    wrap(target);
    expect(hasTargetInfo(target)).toBe(true);
  });

  it('returns the target unchanged when not wrappable (primitive)', () => {
    expect(wrap(42 as unknown as object)).toBe(42);
  });

  it('returns the target unchanged when type-checking is disabled', () => {
    setEnabled(false);
    const target = {};
    expect(wrap(target)).toBe(target);
    setEnabled(true);
  });

  it('does not re-wrap an already wrapped target', () => {
    const first = wrap({});
    const second = wrap(first);
    expect(second).toBe(first);
  });

  it('calls checker.init with the target', () => {
    const initSpy = jest.spyOn(checker, 'init');
    const target = {};
    wrap(target);
    expect(initSpy).toHaveBeenCalledWith(target, undefined);
    initSpy.mockRestore();
  });

  it('throws when no checker is configured and none is in options', () => {
    setDefaultTypeChecker(undefined as never);
    expect(() => wrap({})).toThrow(/No TypeChecker/);
    setDefaultTypeChecker(checker);
  });
});

describe('createInfoFromOptions', () => {
  it('returns the info object directly when info option is provided', () => {
    const info = getTargetInfo(wrap({}))!;
    const result = createInfoFromOptions({}, { info });
    expect(result).toBe(info);
  });

  it('uses checker from options over the default', () => {
    const customChecker = new StubTypeChecker();
    const spy = jest.spyOn(customChecker, 'init').mockReturnValue(null);
    const target = {};
    const info = createInfoFromOptions(target, { checker: customChecker });
    expect(spy).toHaveBeenCalledWith(target, undefined);
    expect(info.checker).toBe(customChecker);
    spy.mockRestore();
  });
});

describe('proxy get trap', () => {
  it('returns property values', () => {
    const target = { x: 42 };
    const proxied = wrap(target) as typeof target;
    expect(proxied.x).toBe(42);
  });

  it('calls checker.getProperty on access', () => {
    const spy = jest.spyOn(checker, 'getProperty');
    const target = { x: 1 };
    const proxied = wrap(target) as typeof target;
    const _ = proxied.x;
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('proxy set trap', () => {
  it('sets property values', () => {
    const target: Record<string, unknown> = {};
    const proxied = wrap(target) as typeof target;
    proxied.y = 99;
    expect(target.y).toBe(99);
  });

  it('calls checker.setProperty on assignment', () => {
    const spy = jest.spyOn(checker, 'setProperty');
    const target: Record<string, unknown> = {};
    const proxied = wrap(target) as typeof target;
    proxied.z = 1;
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('setting a symbol property does NOT update target info', () => {
    const sym = Symbol('test');
    const target: Record<symbol, unknown> = {};
    const proxied = wrap(target) as typeof target;
    proxied[sym] = 'value';
    expect(target[sym]).toBe('value');
    expect(getTargetInfo(target)?.checker).toBe(checker);
  });
});

describe('proxy deleteProperty trap', () => {
  it('deletes a property', () => {
    const target: Record<string, unknown> = { toDelete: true };
    const proxied = wrap(target) as typeof target;
    delete proxied.toDelete;
    expect(target.toDelete).toBeUndefined();
  });
});
