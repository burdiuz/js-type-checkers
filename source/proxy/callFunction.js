import {
  getTargetInfo,
  getChildInfo,
  storeChildInfoFrom,
} from '../target/info';

import {
  getProxyConfigValue,
  PROXY_WRAP_FUNCTION_ARGUMENTS,
  PROXY_WRAP_FUNCTION_RETURN_VALUES,
} from './config';

import { isTypeChecked } from '../utils';

import { RETURN_VALUE } from '../checkers/utils';

const getTargetArguments = (createFn, target, argumentsList) => {
  const info = getTargetInfo(target);

  if (getProxyConfigValue(PROXY_WRAP_FUNCTION_ARGUMENTS, info)) {
    const { deep, names, checker } = info;
    const { length } = argumentsList;
    // FIXME cache arguments info objects as children
    for (let index = 0; index < length; index++) {
      argumentsList[index] = createFn(
        argumentsList[index],
        {
          deep,
          names: [...names, index],
          checker,
        },
      );
    }
  }

  return argumentsList;
};
const getTargetReturnValue = (createFn, target, returnValue) => {
  const info = getTargetInfo(target);

  if (getProxyConfigValue(PROXY_WRAP_FUNCTION_RETURN_VALUES, info)) {
    const { deep, names, checker, children } = info;

    if (!isTypeChecked(returnValue)) {
      const childInfo = getChildInfo(children, RETURN_VALUE);

      if (childInfo) {
        returnValue = createFn(returnValue, { info: childInfo });
      } else {
        returnValue = createFn(returnValue, { deep, names: [...names], checker });
      }
    }

    storeChildInfoFrom(children, RETURN_VALUE, returnValue);
  }

  return returnValue;
};

const callFunction = (createFn) => (target, thisArg, argumentsList) => {
  const info = getTargetInfo(target);
  const { names, config, checker } = info;

  if (checker.arguments) {
    checker.arguments(target, thisArg, argumentsList, config, names);
  }

  argumentsList = getTargetArguments(createFn, target, argumentsList);

  const result = target.apply(thisArg, argumentsList);

  if (checker.returnValue) {
    checker.returnValue(target, thisArg, result, config, names);
  }

  return getTargetReturnValue(createFn, target, result);
};

export default callFunction;
