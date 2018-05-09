export const INFO_KEY = Symbol('type-checkers::info');

export const createTargetInfo = (checker, config, deep = true, names = [], children = createChildrenCache()) => ({
  checker,
  config,
  deep,
  names,
  children,
});
export const getTargetInfo = (target) => target[INFO_KEY];
export const setTargetInfo = (target, info) => target[INFO_KEY] = info;
export const getTargetTypeChecker = (target) => getTargetInfo(target).checker;
export const getTargetTypeCheckerConfig = (target) => getTargetInfo(target).config;

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
  // FIXME shoud it merge or just reassign?
  cache[name] = childInfo;
};

export const storeChildInfoFrom = (cache, name, child) => {
  storeChildInfo(cache, name, getTargetInfo(child));
};

export const getChildInfo = (cache, name) => cache[name];

export const removeChildInfo = (cache, name) => delete cache[name];

export const mergeTargetInfo = (targetInfo, sourceInfo) => {
  const { checker, children, config, names } = targetInfo;

  if (checker === sourceInfo.checker) {
    targetInfo.children = mergeChildrenCache(children, sourceInfo.children);
    targetInfo.config = checker.mergeConfigs(config, sourceInfo.config, names);
  } else {
    console.error('TypeChecked objects can be merged only if using exactly same instance of type checker.');
  }

  return targetInfo;
};

export const assignTargetInfo = (targetInfo, ...sourceInfo) => {
  const { length } = sourceInfo;

  for (let index = 0; index < length; index++) {
    const item = sourceInfo[index];

    if (item) {
      if (targetInfo) {
        targetInfo = mergeTargetInfo(targetInfo, item);
      } else {
        targetInfo = item;
      }
    }
  }

  return targetInfo;
};

export const assignTargetInfoFrom = (target, ...sources) => {
  const { length } = sources;
  let targetInfo = getTargetInfo(target);

  for (let index = 0; index < length; index++) {
    const sourceInfo = sources[index];

    if (sourceInfo) {
      if (targetInfo) {
        targetInfo = mergeTargetInfo(targetInfo, sourceInfo);
      } else {
        targetInfo = sourceInfo;
      }
    }
  }

  setTargetInfo(target, targetInfo);
  return target;
};
