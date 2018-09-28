import { INFO_KEY } from './target';

export const getTypeChecker = (target) => {
  if (target) {
    const info = target[INFO_KEY];

    return (info && info.checker) || undefined;
  }

  return undefined;
};

export const getTypeCheckerData = (target) => {
  if (target) {
    const info = target[INFO_KEY];

    return (info && info.data) || undefined;
  }

  return undefined;
};
