import hasOwn from '@actualwave/hasOwn';

export const INFO_KEY = Symbol('type-checkers::info');

export const createChildrenCache = (children = {}) => ({ ...children });

export const createTargetInfo = (
  checker,
  config,
  deep = true,
  names = [],
  children = createChildrenCache(),
) => ({
  checker,
  config,
  deep,
  names,
  children,
});

export const getTargetInfo = (target) =>
  (target ? target[INFO_KEY] : undefined);

export const setTargetInfo = (target, info) => {
  if (target && info) {
    target[INFO_KEY] = info;
  }
};

export const hasTargetInfo = (target) => !!getTargetInfo(target);

export const getTargetTypeChecker = (target) =>
  (target && target[INFO_KEY] ? target[INFO_KEY].checker : undefined);

export const getTargetTypeCheckerConfig = (target) => {
  if (!target || !target[INFO_KEY]) {
    return undefined;
  }

  return target[INFO_KEY].config;
};

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

export const mergeChildrenCache = (targetCache, sourceCache) => {
  // eslint-disable-next-line guard-for-in
  for (const name in sourceCache) {
    const key = getChildInfoKey(name);

    if (hasOwn(targetCache, key)) {
      // eslint-disable-next-line no-use-before-define
      targetCache[key] = mergeTargetInfo(targetCache[key], sourceCache[key]);
    } else {
      targetCache[key] = sourceCache[key];
    }
  }

  return targetCache;
};

export const storeChildInfo = (cache, name, childInfo) => {
  const key = getChildInfoKey(name);
  delete cache[key];

  if (childInfo) {
    cache[key] = childInfo;
  }
};

export const storeChildInfoFrom = (cache, name, child) => {
  storeChildInfo(cache, name, getTargetInfo(child));
};

export const getChildInfo = (cache, name) => cache[getChildInfoKey(name)];

export const hasChildInfo = (cache, name) => !!cache[getChildInfoKey(name)];

export const removeChildInfo = (cache, name) =>
  delete cache[getChildInfoKey(name)];

export const mergeTargetInfo = (targetInfo, sourceInfo) => {
  const { deep, checker, children, config, names } = targetInfo;

  if (checker === sourceInfo.checker) {
    targetInfo.deep = deep || sourceInfo.deep;
    targetInfo.children = mergeChildrenCache(children, sourceInfo.children);
    targetInfo.config = checker.mergeConfigs(config, sourceInfo.config, names);
  } else {
    console.error('TypeChecked objects can be merged only if using exactly same instance of type checker.');
  }

  return targetInfo;
};
