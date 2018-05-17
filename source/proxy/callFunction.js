import { getTargetInfo } from '../target/info';

import {
  getProxyConfigValue,
  PROXY_WRAP_FUNCTION_ARGUMENTS,
  PROXY_WRAP_FUNCTION_RETURN_VALUES
} from './config';

import { getTypeCheckedChild } from './utils';

const getTargetArguments = (createFn, target, argumentsList) => {
  const info = getTargetInfo(target);

  if (getProxyConfigValue(PROXY_WRAP_FUNCTION_ARGUMENTS, info)) {
    const { length } = argumentsList;
    // FIXME cache arguments info objects as children
    for (let index = 0; index < length; index++) {
      argumentsList[index] = getTypeCheckedChild(
        createFn,
        info,
        String(index),
        argumentsList[index]
      );
    }
  }

  return argumentsList;
};

const callFunction = (createFn) => (target, thisArg, argumentsList) => {
  const info = getTargetInfo(target);
  const { names, config, checker } = info;

  if (checker.arguments) {
    checker.arguments(target, thisArg, argumentsList, config, names);
  }

  argumentsList = getTargetArguments(createFn, target, argumentsList);

  let result = target.apply(thisArg, argumentsList);

  if (checker.returnValue) {
    checker.returnValue(target, thisArg, result, config, names);
  }

  if (getProxyConfigValue(PROXY_WRAP_FUNCTION_RETURN_VALUES, info)) {
    result = getTypeCheckedChild(createFn, info, 'returnValue', result);
  }

  return result;
};

export default callFunction;
