import { INFO_KEY, TargetInfo } from './target';

export const getTypeChecker = (target: object): TargetInfo['checker'] | undefined => {
  const info = (target as Record<symbol, TargetInfo | undefined>)[INFO_KEY];
  return (info && info.checker) || undefined;
};

export const getTypeCheckerData = (target: object): unknown => {
  const info = (target as Record<symbol, TargetInfo | undefined>)[INFO_KEY];
  return (info && info.data) || undefined;
};
