import { getTargetInfo } from '../../info';
import {
  getWrapConfigValue,
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
} from '../../config/wrap-config';
import { getTargetArguments, getTypeCheckedChild } from './apply';

const constructFactory = (wrapFn) => (Target, argumentsList) => {
  const info = getTargetInfo(Target);
  const { names, data, checker } = info;

  if (checker.arguments) {
    checker.arguments(Target, names, argumentsList, data);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, info)) {
    argumentsList = getTargetArguments(wrapFn, info, argumentsList);
  }

  let result = new Target(...argumentsList);

  if (checker.returnValue) {
    checker.returnValue(Target, names, result, data);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, info)) {
    result = getTypeCheckedChild(wrapFn, info, 'returnValue', result);
  }

  return result;
};

export default constructFactory;
