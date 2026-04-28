import { TargetInfo, getTargetInfo } from '../../info';
import {
  getWrapConfigValue,
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
} from '../../config/wrap-config';
import { getTargetArguments, getTypeCheckedChild } from './apply';

type WrapFn = (target: object, info: TargetInfo) => object;

const constructFactory =
  (wrapFn: WrapFn) =>
  (Target: object, argumentsList: unknown[]): object => {
    const info = getTargetInfo(Target)!;
    const { names, data, checker } = info;

    if (checker.arguments) {
      checker.arguments(Target as never, names, argumentsList, data);
    }

    const args = getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)
      ? getTargetArguments(wrapFn, info, argumentsList)
      : argumentsList;

    let result = new (Target as new (...args: unknown[]) => object)(...args);

    if (checker.returnValue) {
      checker.returnValue(Target as never, names, result, data);
    }

    if (getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, info)) {
      result = getTypeCheckedChild(wrapFn, info, 'returnValue', result) as object;
    }

    return result;
  };

export default constructFactory;
