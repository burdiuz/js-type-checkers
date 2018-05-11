import { isEnabled } from '../enabled';
import {
  setTargetInfo,
  storeChildInfo,
  getChildInfo,
} from '../target/info';
import { isTypeChecked } from '../utils';
import { wrapWithProxy, createInfoFromOptions } from './create';

const deepInitializer = (target, options) => {
  const info = createInfoFromOptions(target, options);
  const { deep, names, checker, config, children } = info;

  Object.keys(target)
    .forEach((name) => {
      const value = target[name];

      checker.getProperty(target, name, value, config, names);

      // skip functions/methods since we get info about them only when being executed
      if (typeof value === 'object') {
        let childInfo = getChildInfo(children, name);

        if (childInfo) {
          deepInitializer(value, { info: childInfo });
        } else {
          childInfo = deepInitializer(value, { deep, names: [...names, name], checker });
          storeChildInfo(children, name, childInfo);
        }
      }
    });

  setTargetInfo(target, info);

  return info;
};

const createDeep = (target, options) => {
  if (!target || typeof target !== 'object' || !isEnabled() || isTypeChecked(target)) {
    return target;
  }

  deepInitializer(target, options);

  return wrapWithProxy(target);
};

export default createDeep;
