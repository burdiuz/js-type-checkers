import { getDefaultTypeChecker, setDefaultTypeChecker } from './config/default-checker';
import { isEnabled, setEnabled } from './config/enabled';
import {
  addIgnoredClasses,
  isIgnoredClass,
  isValueOfIgnoredClass,
  removeIgnoredClasses,
} from './config/ignored-classes';
import { getWrapConfig, setWrapConfig, getWrapConfigValue } from './config/wrap-config';
import { getTargetInfo, getTypeChecker, getTypeCheckerData, removeTargetInfo } from './info';
import { wrap } from './proxy/wrap';
import { wrapDeep } from './proxy/wrapDeep';
import { isWrappable, isWrapped, unwrap, setWrapConfigTo } from './utils';

export {
  getDefaultTypeChecker,
  setDefaultTypeChecker,
  isEnabled,
  setEnabled,
  addIgnoredClasses,
  isIgnoredClass,
  isValueOfIgnoredClass,
  removeIgnoredClasses,
  getWrapConfig,
  setWrapConfig,
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
};
