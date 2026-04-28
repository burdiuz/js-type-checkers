import { TargetInfo, getTargetInfo } from '../../info';
import { isWrappable } from '../../utils';
import {
  getWrapConfigValue,
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
} from '../../config/wrap-config';

type WrapFn = (target: object, info: TargetInfo) => object;

export const getTypeCheckedChild = (
  wrapFn: WrapFn,
  info: TargetInfo,
  name: PropertyKey,
  value: unknown
): unknown => {
  if (!isWrappable(value)) {
    return value;
  }

  const childInfo = info.getChild(name);

  if (childInfo) {
    return wrapFn(value, childInfo as unknown as TargetInfo);
  }

  return wrapFn(value, info.createChild(name, value));
};

export const getTargetArguments = (
  wrapFn: WrapFn,
  info: TargetInfo,
  argumentsList: unknown[]
): unknown[] => {
  if (getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)) {
    for (let index = 0; index < argumentsList.length; index++) {
      argumentsList[index] = getTypeCheckedChild(wrapFn, info, String(index), argumentsList[index]);
    }
  }
  return argumentsList;
};

const applyFunctionFactory =
  (wrapFn: WrapFn) =>
  (target: object, thisArg: unknown, argumentsList: unknown[]): unknown => {
    const info = getTargetInfo(target)!;
    const { names, data, checker } = info;

    if (checker.arguments) {
      checker.arguments(target as never, names, argumentsList, data, thisArg);
    }

    const args = getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)
      ? getTargetArguments(wrapFn, info, argumentsList)
      : argumentsList;

    let result = (target as Function).apply(thisArg, args);

    if (checker.returnValue) {
      checker.returnValue(target as never, names, result, data, thisArg);
    }

    if (getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, info)) {
      result = getTypeCheckedChild(wrapFn, info, 'returnValue', result);
    }

    return result;
  };

export default applyFunctionFactory;
