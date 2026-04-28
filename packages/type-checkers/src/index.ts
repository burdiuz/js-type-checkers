export { getDefaultTypeChecker, setDefaultTypeChecker } from './config/default-checker';
export { isEnabled, setEnabled } from './config/enabled';
export {
  getIgnoredClasses,
  ignoreClass,
  isClassIgnored,
  isValueOfIgnoredClass,
  stopIgnoringClass,
} from './config/ignored-classes';
export {
  getIgnoredProperties,
  ignoreProperty,
  isPropertyIgnored,
  stopIgnoringProperty,
} from './config/ignored-properties';
export { setWrapConfigValue, getWrapConfigValue } from './config/wrap-config';
export { getTargetInfo, getTypeChecker, getTypeCheckerData, removeTargetInfo } from './info';
export { wrap } from './proxy/wrap';
export { wrapDeep } from './proxy/wrapDeep';
export { isWrappable, isWrapped, unwrap, setWrapConfigTo } from './utils';
export { assign, merge } from './object';

export type { TypeChecker, WrapProxyConfig } from './types';
export type { WrapOptions } from './proxy/wrap';
