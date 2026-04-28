import { isWrappable, isSymbol, TARGET_KEY } from '../../utils';
import { TargetInfo, getTargetInfo } from '../../info';
import { getWrapConfigValue, WRAP_IGNORE_PROTOTYPE_METHODS } from '../../config/wrap-config';
import { isPropertyIgnored } from '../../config/ignored-properties';

type WrapFn = (target: object, info: TargetInfo) => object;

const getTargetProperty = (wrapFn: WrapFn, target: object, info: TargetInfo, names: ReturnType<TargetInfo['names']['clone']>, value: object): object => {
  const { deep } = info;
  const { lastName: property } = names;

  if (deep || typeof value === 'function') {
    const childInfo = info.getChild(property);

    if (childInfo) {
      return wrapFn(value, childInfo as unknown as TargetInfo);
    }

    return wrapFn(value, info.createChildWithNames(names, value));
  }

  return value;
};

/**
 * Prototype methods are only wrapped when `ignorePrototypeMethods` is explicitly false.
 * Returns `false` to skip wrapping (i.e. property is a prototype method and config says ignore).
 */
const isWrappableProperty = (
  target: object,
  info: TargetInfo,
  property: PropertyKey,
  value: unknown
): boolean => {
  if (typeof value === 'function' && !Object.hasOwn(target, property)) {
    return !getWrapConfigValue(WRAP_IGNORE_PROTOTYPE_METHODS, info);
  }
  return true;
};

const getPropertyFactory =
  (wrapFn: WrapFn) =>
  (target: object, property: string | symbol): unknown => {
    const value = (target as Record<PropertyKey, unknown>)[property];

    /*
      target[TARGET_KEY] is a virtual property that indicates whether the object is
      wrapped and allows unwrapping. Must be checked before isSymbol so TARGET_KEY
      is not swallowed by the early symbol return.
    */
    if (property === TARGET_KEY) {
      return target;
    }

    if (isSymbol(property) || isPropertyIgnored(property)) {
      return value;
    }

    const info = getTargetInfo(target)!;
    const { names, data, checker } = info;
    const nextNames = names.clone(property);

    if (checker.getProperty) {
      checker.getProperty(target, nextNames, value, data);
    }

    if (isWrappable(value) && isWrappableProperty(target, info, property, value)) {
      return getTargetProperty(wrapFn, target, info, nextNames, value as object);
    }

    return value;
  };

export default getPropertyFactory;
