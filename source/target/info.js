export const INFO_KEY = Symbol('type-checkers::info');

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

export const getTargetInfo = (target) => (target ? target[INFO_KEY] : undefined);

export const setTargetInfo = (target, info) => {
  if (target && info) {
    target[INFO_KEY] = info;
  }
};

export const hasTargetInfo = (target) => !!getTargetInfo(target);

export const getTargetTypeChecker = (target) =>
  (target && target[INFO_KEY] ? target[INFO_KEY].checker : undefined);

export const getTargetTypeCheckerConfig = (target) =>
  (target && target[INFO_KEY] ? target[INFO_KEY].config : undefined);

export const createChildrenCache = (children = {}) => ({ ...children });

export const mergeChildrenCache = (targetCache, sourceCache) => {
  for (const name in sourceCache) {
    if (targetCache.hasOwnProperty(name)) {
      targetCache[name] = mergeTargetInfo(targetCache[name], sourceCache[name]);
    } else {
      targetCache[name] = sourceCache[name];
    }
  }

  return targetCache;
};

export const storeChildInfo = (cache, name, childInfo) => {
  delete cache[name];

  if (childInfo) {
    cache[name] = childInfo;
  }
};

export const storeChildInfoFrom = (cache, name, child) => {
  storeChildInfo(cache, name, getTargetInfo(child));
};

export const getChildInfo = (cache, name) => cache[name];

export const hasChildInfo = (cache, name) => !!cache[name];

export const removeChildInfo = (cache, name) => delete cache[name];

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
