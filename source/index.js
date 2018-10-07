import { getDefaultTypeChecker, setDefaultTypeChecker } from './config/default-checker';
import { isEnabled, setEnabled } from './config/enabled';
import {
  getIgnoredClasses,
  ignoreClass,
  isClassIgnored,
  isValueOfIgnoredClass,
  stopIgnoringClass,
} from './config/ignored-classes';
import {
  getIgnoredProperties,
  ignoreProperty,
  isPropertyIgnored,
  stopIgnoringProperty,
} from './config/ignored-properties';
import { setWrapConfigValue, getWrapConfigValue } from './config/wrap-config';
import { getTargetInfo, getTypeChecker, getTypeCheckerData, removeTargetInfo } from './info';
import { wrap } from './proxy/wrap';
import { wrapDeep } from './proxy/wrapDeep';
import { isWrappable, isWrapped, unwrap, setWrapConfigTo } from './utils';
import { assign, merge } from './object';

export {
  getDefaultTypeChecker,
  setDefaultTypeChecker,
  isEnabled,
  setEnabled,
  getIgnoredClasses,
  ignoreClass,
  isClassIgnored,
  isValueOfIgnoredClass,
  stopIgnoringClass,
  getIgnoredProperties,
  ignoreProperty,
  isPropertyIgnored,
  stopIgnoringProperty,
  setWrapConfigValue,
  getWrapConfigValue,
  getTargetInfo,
  getTypeChecker,
  getTypeCheckerData,
  removeTargetInfo,
  wrap,
  wrapDeep,
  isWrappable,
  isWrapped,
  unwrap,
  setWrapConfigTo,
  assign,
  merge,
};
