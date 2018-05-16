import {
  getDefaultTypeChecker,
  setDefaultTypeChecker,
} from './checkers';

import {
  PROXY_WRAP_FUNCTION_RETURN_VALUES,
  PROXY_WRAP_FUNCTION_ARGUMENTS,
  PROXY_WRAP_SET_PROPERTY_VALUES,
  PROXY_IGNORE_PROTOTYPE_METHODS,
  getDefaultProxyConfig,
  setProxyConfig,
  getProxyConfig,
  create,
  createDeep,
} from './proxy';

import {
  ConsoleErrorReporter,
  ConsoleWarnReporter,
  ThrowErrorReporter,
  getErrorReporter,
  setErrorReporter,
} from './reporters';

import {
  isEnabled,
  setEnabled,
} from './enabled';

import {
  getTargetInfo,
  setTargetInfo,
  hasTargetInfo,
  getTargetTypeChecker,
  getTargetTypeCheckerConfig,
  mergeTargetInfo,
  getOriginalTarget,
  merge,
  properties,
} from './target';

import {
  isTypeChecked,
  isValidTarget,
} from './utils';

export {
  //  checkers
  getDefaultTypeChecker,
  setDefaultTypeChecker,
  // proxy
  PROXY_WRAP_FUNCTION_RETURN_VALUES,
  PROXY_WRAP_FUNCTION_ARGUMENTS,
  PROXY_WRAP_SET_PROPERTY_VALUES,
  PROXY_IGNORE_PROTOTYPE_METHODS,
  getDefaultProxyConfig,
  setProxyConfig,
  getProxyConfig,
  create,
  createDeep,
  // reporters
  ConsoleErrorReporter,
  ConsoleWarnReporter,
  ThrowErrorReporter,
  getErrorReporter,
  setErrorReporter,
  // enabled
  isEnabled,
  setEnabled,
  // target
  getTargetInfo,
  setTargetInfo,
  hasTargetInfo,
  getTargetTypeChecker,
  getTargetTypeCheckerConfig,
  mergeTargetInfo,
  getOriginalTarget,
  merge,
  properties,
  // utils
  isTypeChecked,
  isValidTarget,
};

export default create;
