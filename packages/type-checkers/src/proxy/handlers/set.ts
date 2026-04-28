import { INFO_KEY, TargetInfo, getTargetInfo } from '../../info';
import { TARGET_KEY, isSymbol, isWrappable } from '../../utils';
import { getWrapConfigValue, WRAP_SET_PROPERTY_VALUES } from '../../config/wrap-config';

type WrapFn = (target: object, info: TargetInfo) => object;

const setNonTargetProperty = (target: object, property: string, value: unknown): boolean => {
  const { names, data, checker } = getTargetInfo(target)!;

  if (checker.setProperty) {
    checker.setProperty(target, names.clone(property), value, data);
  }

  (target as Record<string, unknown>)[property] = value;
  return true;
};

const setTargetProperty = (wrapFn: WrapFn, target: object, property: string, value: object): boolean => {
  const info = getTargetInfo(target)!;
  const { names, checker, data } = info;
  const childInfo = info.getChild(property);
  const nextNames = childInfo
    ? (childInfo as unknown as TargetInfo).names
    : names.clone(property);

  if (checker.setProperty) {
    checker.setProperty(target, nextNames, value, data);
  }

  const wrapped = childInfo
    ? wrapFn(value, childInfo as unknown as TargetInfo)
    : wrapFn(value, info.createChildWithNames(nextNames, value));

  (target as Record<string, unknown>)[property] = wrapped;
  return true;
};

const updateTargetInfo = (target: object, value: TargetInfo | null): boolean => {
  let info = getTargetInfo(target);
  if (info && value && info !== value) {
    info.copy(value);
  } else {
    info = value ?? undefined;
  }

  (target as Record<symbol, unknown>)[INFO_KEY] = info;
  return true;
};

const setPropertyFactory =
  (wrapFn: WrapFn) =>
  (target: object, property: string | symbol, value: unknown): boolean => {
    if (property === TARGET_KEY) {
      throw new Error(`"${String(TARGET_KEY)}" is a virtual property and cannot be set`);
    }

    if (property === INFO_KEY) {
      return updateTargetInfo(target, value as TargetInfo | null);
    }

    /* Bug fix: any other symbol key is a plain property set, not an info mutation. */
    if (isSymbol(property)) {
      (target as Record<symbol, unknown>)[property] = value;
      return true;
    }

    const info = getTargetInfo(target)!;

    if (isWrappable(value) && getWrapConfigValue(WRAP_SET_PROPERTY_VALUES, info)) {
      return setTargetProperty(wrapFn, target, property, value as object);
    }

    return setNonTargetProperty(target, property, value);
  };

export default setPropertyFactory;
