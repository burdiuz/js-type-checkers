import { getTargetInfo } from '../../info/target';

import {
  getWrapConfigValue,
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
} from '../../config/wrap-config';

import { getTypeCheckedChild } from '../utils';

export const getTargetArguments = (wrapFn, info, argumentsList) => {
  if (getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)) {
    const { length } = argumentsList;
    for (let index = 0; index < length; index++) {
      argumentsList[index] = getTypeCheckedChild(
        wrapFn,
        info,
        String(index),
        argumentsList[index],
      );
    }
  }

  return argumentsList;
};

const applyFunctionFactory = (wrapFn) => (target, thisArg, argumentsList) => {
  const info = getTargetInfo(target);
  const { names, data, checker } = info;

  if (checker.arguments) {
    checker.arguments(target, names, argumentsList, data, thisArg);
  }

  argumentsList = getTargetArguments(wrapFn, info, argumentsList);

  let result = target.apply(thisArg, argumentsList);

  if (checker.returnValue) {
    checker.returnValue(target, names, result, data, thisArg);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, info)) {
    result = getTypeCheckedChild(wrapFn, info, 'returnValue', result);
  }

  return result;
};

export default applyFunctionFactory;
