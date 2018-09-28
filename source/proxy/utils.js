/* eslint-disable import/prefer-default-export */

import { isWrappable } from '../utils';

export const getTypeCheckedChild = (wrapFn, info, name, value) => {
  if (!isWrappable(value)) {
    return value;
  }

  const childInfo = info.getChild(name);

  if (childInfo) {
    return wrapFn(value, childInfo);
  }

  return wrapFn(value, info.createChild(name));
};
