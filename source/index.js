import {
  getDefaultTypeChecker,
  setDefaultTypeChecker,
} from './checkers';

import {
  ConsoleErrorReporter,
  ConsoleWarnReporter,
} from './reporters/console';

import {
  ThrowErrorReporter,
} from './reporters/error';

import {
  getErrorReporter,
  setErrorReporter,
} from './reporters';

import {
  isEnabled,
  setEnabled,
} from './enabled';

import {
  getTargetInfo,
  hasTargetInfo,
  setTargetInfo,
  getTargetTypeChecker,
  getTargetTypeCheckerConfig,
  mergeTargetInfo,
} from './target/info';

import { getOriginalTarget } from './target/proxy';

import objectMerge from './target/objectMerge';

import {
  getProxyConfig,
  setProxyConfig,
  create,
  createDeep,
} from './proxy';

import {
  isTypeChecked,
  isValidTarget,
} from './utils';

import PrimitiveTypeChecker from './checkers/primitive';

export {
  PrimitiveTypeChecker,
  getDefaultTypeChecker,
  setDefaultTypeChecker,
  ConsoleErrorReporter,
  ConsoleWarnReporter,
  ThrowErrorReporter,
  getErrorReporter,
  setErrorReporter,
  isEnabled,
  setEnabled,
  getTargetInfo,
  hasTargetInfo,
  setTargetInfo,
  getTargetTypeChecker,
  getTargetTypeCheckerConfig,
  mergeTargetInfo,
  getOriginalTarget,
  objectMerge,
  getProxyConfig,
  setProxyConfig,
  create,
  createDeep,
  isTypeChecked,
  isValidTarget,
};

export default create;
