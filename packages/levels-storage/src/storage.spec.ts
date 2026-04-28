import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { REPORT_FIRST_TYPE_ONLY, REPORT_NEVER, REPORT_ALL_ASSIGNED_TYPES, setGlobalReportingLevel, setReportingLevel } from './levels';
import TypeInfoStorage, { createTypesStorage, defaultMergeStrategy } from './storage';

afterEach(() => {
  setGlobalReportingLevel(REPORT_FIRST_TYPE_ONLY);
});

describe('defaultMergeStrategy', () => {
  it('merges source into target without duplicates', () => {
    const target = new Set(['number', 'string']);
    const source = new Set(['string', 'boolean']);
    const result = defaultMergeStrategy('key', target, source, REPORT_FIRST_TYPE_ONLY);
    expect(result).toBe(target);
    expect([...result]).toEqual(['number', 'string', 'boolean']);
  });

  it('returns the target set', () => {
    const target = new Set<unknown>();
    const source = new Set(['number']);
    expect(defaultMergeStrategy('key', target, source, REPORT_ALL_ASSIGNED_TYPES)).toBe(target);
  });
});

describe('createTypesStorage', () => {
  it('returns a TypeInfoStorage instance', () => {
    expect(createTypesStorage()).toBeInstanceOf(TypeInfoStorage);
  });
});

describe('TypeInfoStorage', () => {
  describe('add', () => {
    it('REPORT_ALL_ASSIGNED_TYPES accumulates all types', () => {
      const storage = createTypesStorage();
      storage.add('prop', 'number', REPORT_ALL_ASSIGNED_TYPES);
      storage.add('prop', 'string', REPORT_ALL_ASSIGNED_TYPES);
      storage.add('prop', 'number', REPORT_ALL_ASSIGNED_TYPES);
      expect(storage.get('prop')).toEqual(new Set(['number', 'string']));
    });

    it('REPORT_FIRST_TYPE_ONLY stores only the first type', () => {
      const storage = createTypesStorage();
      storage.add('prop', 'number', REPORT_FIRST_TYPE_ONLY);
      storage.add('prop', 'string', REPORT_FIRST_TYPE_ONLY);
      expect(storage.get('prop')).toEqual(new Set(['number']));
    });

    it('REPORT_NEVER removes the key', () => {
      const storage = createTypesStorage();
      storage.add('prop', 'number', REPORT_ALL_ASSIGNED_TYPES);
      storage.add('prop', 'string', REPORT_NEVER);
      expect(storage.has('prop')).toBe(false);
    });

    it('ignores falsy type values', () => {
      const storage = createTypesStorage();
      storage.add('prop', '' as unknown as string, REPORT_ALL_ASSIGNED_TYPES);
      storage.add('prop', null as unknown as string, REPORT_ALL_ASSIGNED_TYPES);
      expect(storage.has('prop')).toBe(false);
    });
  });

  describe('addFor', () => {
    it('uses reporting level from target object', () => {
      const storage = createTypesStorage();
      const target = {};
      setReportingLevel(target, REPORT_ALL_ASSIGNED_TYPES);
      storage.addFor('prop', 'number', target);
      storage.addFor('prop', 'string', target);
      expect(storage.get('prop')).toEqual(new Set(['number', 'string']));
    });

    it('uses per-property level from target', () => {
      const storage = createTypesStorage();
      const target = {};
      setReportingLevel(target, REPORT_ALL_ASSIGNED_TYPES, { prop: REPORT_FIRST_TYPE_ONLY });
      storage.addFor('prop', 'number', target);
      storage.addFor('prop', 'string', target);
      expect(storage.get('prop')).toEqual(new Set(['number']));
    });
  });

  describe('set', () => {
    it('stores the given Set', () => {
      const storage = createTypesStorage();
      storage.set('prop', new Set(['number', 'string']));
      expect(storage.get('prop')).toEqual(new Set(['number', 'string']));
    });

    it('removes the key for REPORT_NEVER', () => {
      const storage = createTypesStorage();
      storage.add('prop', 'number', REPORT_ALL_ASSIGNED_TYPES);
      storage.set('prop', new Set(['string']), REPORT_NEVER);
      expect(storage.has('prop')).toBe(false);
    });

    it('removes the key for empty set', () => {
      const storage = createTypesStorage();
      storage.add('prop', 'number', REPORT_ALL_ASSIGNED_TYPES);
      storage.set('prop', new Set());
      expect(storage.has('prop')).toBe(false);
    });

    it('removes the key for falsy types argument', () => {
      const storage = createTypesStorage();
      storage.add('prop', 'number', REPORT_ALL_ASSIGNED_TYPES);
      storage.set('prop', null as unknown as Set<unknown>);
      expect(storage.has('prop')).toBe(false);
    });
  });

  describe('setFor', () => {
    it('uses reporting level from target', () => {
      const storage = createTypesStorage();
      const target = {};
      setReportingLevel(target, REPORT_NEVER);
      storage.setFor('prop', new Set(['number']), target);
      expect(storage.has('prop')).toBe(false);
    });
  });

  describe('clone', () => {
    it('returns an independent copy', () => {
      const original = createTypesStorage();
      original.add('a', 'number', REPORT_ALL_ASSIGNED_TYPES);
      original.add('b', 'string', REPORT_ALL_ASSIGNED_TYPES);

      const copy = original.clone();
      expect(copy.get('a')).toEqual(new Set(['number']));
      expect(copy.get('b')).toEqual(new Set(['string']));

      original.add('a', 'boolean', REPORT_ALL_ASSIGNED_TYPES);
      expect(copy.get('a')).toEqual(new Set(['number']));
    });

    it('mutations on clone do not affect original', () => {
      const original = createTypesStorage();
      original.add('a', 'number', REPORT_ALL_ASSIGNED_TYPES);
      const copy = original.clone();
      copy.add('a', 'string', REPORT_ALL_ASSIGNED_TYPES);
      expect(original.get('a')).toEqual(new Set(['number']));
    });

    it('returns a TypeInfoStorage instance', () => {
      expect(createTypesStorage().clone()).toBeInstanceOf(TypeInfoStorage);
    });
  });

  describe('copyTo', () => {
    it('copies all entries into target storage', () => {
      const source = createTypesStorage();
      source.add('a', 'number', REPORT_ALL_ASSIGNED_TYPES);
      source.add('b', 'string', REPORT_ALL_ASSIGNED_TYPES);

      const dest = createTypesStorage();
      source.copyTo(dest);

      expect(dest.get('a')).toEqual(new Set(['number']));
      expect(dest.get('b')).toEqual(new Set(['string']));
    });

    it('merges with existing entries using defaultMergeStrategy', () => {
      const source = createTypesStorage();
      source.add('a', 'boolean', REPORT_ALL_ASSIGNED_TYPES);

      const dest = createTypesStorage();
      dest.add('a', 'number', REPORT_ALL_ASSIGNED_TYPES);
      source.copyTo(dest);

      expect(dest.get('a')).toEqual(new Set(['number', 'boolean']));
    });

    it('skips entries where target has REPORT_NEVER', () => {
      const source = createTypesStorage();
      source.add('secret', 'number', REPORT_ALL_ASSIGNED_TYPES);

      const dest = createTypesStorage();
      const target = {};
      setReportingLevel(target, undefined, { secret: REPORT_NEVER });
      source.copyTo(dest, target);

      expect(dest.has('secret')).toBe(false);
    });

    it('passes level to REPORT_NEVER for new keys too (does not copy)', () => {
      const source = createTypesStorage();
      source.add('x', 'number', REPORT_ALL_ASSIGNED_TYPES);

      const dest = createTypesStorage();
      const target = {};
      setReportingLevel(target, REPORT_NEVER);
      source.copyTo(dest, target);

      expect(dest.has('x')).toBe(false);
    });

    it('accepts a custom merge strategy', () => {
      const source = createTypesStorage();
      source.add('a', 'boolean', REPORT_ALL_ASSIGNED_TYPES);

      const dest = createTypesStorage();
      dest.add('a', 'number', REPORT_ALL_ASSIGNED_TYPES);

      const keepTarget = jest.fn((_key: unknown, target: Set<unknown>) => target);
      source.copyTo(dest, undefined, keepTarget);

      expect(keepTarget).toHaveBeenCalledWith('a', dest.get('a'), expect.any(Set), REPORT_FIRST_TYPE_ONLY);
      expect(dest.get('a')).toEqual(new Set(['number']));
    });

    it('returns the destination storage', () => {
      const source = createTypesStorage();
      const dest = createTypesStorage();
      expect(source.copyTo(dest)).toBe(dest);
    });
  });
});
