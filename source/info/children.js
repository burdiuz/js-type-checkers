import hasOwn from '@actualwave/has-own';

/*
  I have had to apply custom key instead of name as is to
  fix "construtor" issue. Since ordinary object has some
  properties with values from start, these properties were
  mustakenly returned as child info objects, for example, if
  requesting hild info for "constructor" function of the target,
  it returned class constructor which caused errors later,
  when accesing info properties.
 */
const getChildInfoKey = (name) => `@${name}`;

class ChildrenCache {
  constructor(children) {
    if (children) {
      this.cache = { ...children.cache };
    } else {
      this.cache = {};
    }
  }

  store(name, childInfo) {
    const key = getChildInfoKey(name);

    if (childInfo) {
      this.cache[key] = childInfo;
    } else {
      delete this.cache[key];
    }
  }

  get(name) {
    return this.cache[getChildInfoKey(name)];
  }

  has(name) {
    return !!this.cache[getChildInfoKey(name)];
  }

  remove(cache, name) {
    return delete this.cache[getChildInfoKey(name)];
  }

  copy({ cache: sourceCache }) {
    Object.keys(sourceCache).forEach((key) => {
      if (hasOwn(this.cache, key)) {
        this.cache[key].copy(sourceCache[key]);
      } else {
        this.cache[key] = sourceCache[key];
      }
    });

    return this;
  }
}

export const createChildrenCache = (children) => new ChildrenCache(children);

export default ChildrenCache;
