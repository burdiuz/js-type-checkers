export const INFO_KEY = Symbol('type-checkers::info');

export const createTargetInfo = (checker, config, deep = true, names = [], children = {}) => ({
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

export const mergeTargetInfo = (targetInfo, sourceInfo) => {
  const { checker, children, config } = targetInfo;

  if (checker === sourceInfo.checker) {
    targetInfo.children = Object.assign(children, sourceInfo.children);
    targetInfo.config = checker.mergeConfigs(config, sourceInfo.config);
  } else {
    console.error('TypeChecked objects can be merged only if using exactly same instance of type checker.');
  }

  return targetInfo;
};

export const assignTargetInfo = (targetInfo, ...sourceInfo) => {
  const { length } = sourceInfo;

  for (let index = 0; index < length; index++) {
    const item = sourceInfo[index];

    if(item) {
      if(targetInfo) {
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

    if(sourceInfo) {
      if(targetInfo) {
        targetInfo = mergeTargetInfo(targetInfo, sourceInfo);
      } else {
        targetInfo = sourceInfo;
      }
    }
  }

  setTargetInfo(target, targetInfo);
  return target;
};
