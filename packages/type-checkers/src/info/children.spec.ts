import { describe, it, expect, beforeEach } from '@jest/globals';
import ChildrenCache, { createChildrenCache } from './children';

describe('createChildrenCache', () => {
  it('returns a ChildrenCache instance', () => {
    expect(createChildrenCache()).toBeInstanceOf(ChildrenCache);
  });

  it('clones an existing cache', () => {
    const original = createChildrenCache();
    const inner = createChildrenCache();
    original.store('a', inner);
    const cloned = createChildrenCache(original);
    expect(cloned.get('a')).toBe(inner);
  });
});

describe('ChildrenCache', () => {
  let cache: ChildrenCache;

  beforeEach(() => {
    cache = createChildrenCache();
  });

  describe('store / get', () => {
    it('stores and retrieves a child by string name', () => {
      const child = createChildrenCache();
      cache.store('foo', child);
      expect(cache.get('foo')).toBe(child);
    });

    it('stores and retrieves a child by symbol name', () => {
      const sym = Symbol('s');
      const child = createChildrenCache();
      cache.store(sym, child);
      expect(cache.get(sym)).toBe(child);
    });

    it('stores and retrieves a child by number name', () => {
      const child = createChildrenCache();
      cache.store(0, child);
      expect(cache.get(0)).toBe(child);
    });

    it('deletes the entry when stored with null', () => {
      const child = createChildrenCache();
      cache.store('x', child);
      cache.store('x', null);
      expect(cache.get('x')).toBeUndefined();
    });

    it('avoids collisions with built-in properties like "constructor"', () => {
      const child = createChildrenCache();
      cache.store('constructor', child);
      expect(cache.get('constructor')).toBe(child);
    });
  });

  describe('has', () => {
    it('returns true for stored key', () => {
      cache.store('k', createChildrenCache());
      expect(cache.has('k')).toBe(true);
    });

    it('returns false for missing key', () => {
      expect(cache.has('missing')).toBe(false);
    });
  });

  describe('remove', () => {
    it('removes a stored entry', () => {
      cache.store('r', createChildrenCache());
      cache.remove('r');
      expect(cache.has('r')).toBe(false);
    });
  });

  describe('copy', () => {
    it('copies entries from source that do not exist in target', () => {
      const source = createChildrenCache();
      const child = createChildrenCache();
      source.store('new', child);
      cache.copy(source);
      expect(cache.get('new')).toBe(child);
    });

    it('calls copy() recursively for entries that exist in both', () => {
      const existingChild = createChildrenCache();
      const sourceChild = createChildrenCache();
      const grandchild = createChildrenCache();
      sourceChild.store('g', grandchild);

      cache.store('shared', existingChild);
      const source = createChildrenCache();
      source.store('shared', sourceChild);

      cache.copy(source);
      expect(existingChild.get('g')).toBe(grandchild);
    });
  });
});
