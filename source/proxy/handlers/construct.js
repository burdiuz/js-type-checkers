import { getTargetInfo } from '../target/info';

import { getWrapConfigValue, WRAP_FUNCTION_RETURN_VALUES } from './config';

import { getTypeCheckedChild } from '../utils';

import { getTargetArguments } from './apply';

const constructFactory = (wrapFn) => (Target, argumentsList) => {
  const info = getTargetInfo(Target);
  const { names, data, checker } = info;

  if (checker.arguments) {
    checker.arguments(Target, null, argumentsList, data, names);
  }

  argumentsList = getTargetArguments(wrapFn, info, argumentsList);

  let result = new Target(...argumentsList);

  if (checker.returnValue) {
    checker.returnValue(Target, null, result, data, names);
  }

  if (getWrapConfigValue(WRAP_FUNCTION_RETURN_VALUES, info)) {
    result = getTypeCheckedChild(wrapFn, info, 'returnValue', result);
  }

  return result;
};

export default constructFactory;
