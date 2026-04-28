/*
  A plain-object cache keyed with a `@`-prefixed string to avoid collisions with
  inherited properties (e.g. "constructor", "toString"). Symbols and numbers are
  coerced to string so the key is always a plain string.

  FIXME: Map might be a better fit here.
*/
const getChildInfoKey = (name: PropertyKey): string => `@${String(name)}`;

type Cache = Record<string, ChildrenCache>;

class ChildrenCache {
  cache: Cache;

  constructor(children?: ChildrenCache) {
    this.cache = children ? { ...children.cache } : {};
  }

  store(name: PropertyKey, childInfo: ChildrenCache | null): void {
    const key = getChildInfoKey(name);
    if (childInfo) {
      this.cache[key] = childInfo;
    } else {
      delete this.cache[key];
    }
  }

  get(name: PropertyKey): ChildrenCache | undefined {
    return this.cache[getChildInfoKey(name)];
  }

  has(name: PropertyKey): boolean {
    return !!this.cache[getChildInfoKey(name)];
  }

  /** Bug fix: removed dead first parameter `cache` that was never used. */
  remove(name: PropertyKey): boolean {
    return delete this.cache[getChildInfoKey(name)];
  }

  copy(source: ChildrenCache): this {
    Object.keys(source.cache).forEach((key) => {
      if (Object.hasOwn(this.cache, key)) {
        (this.cache[key] as ChildrenCache).copy(source.cache[key]);
      } else {
        this.cache[key] = source.cache[key];
      }
    });
    return this;
  }
}

export const createChildrenCache = (children?: ChildrenCache): ChildrenCache =>
  new ChildrenCache(children);

export default ChildrenCache;
