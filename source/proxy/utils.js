import { isTypeChecked, isValidTarget } from '../utils';
import { getChildInfo, storeChildInfoFrom } from '../target/info';

export const getTypeCheckedChild = (createFn, info, name, value) => {
  if (!isValidTarget(value)) {
    return value;
  }

  let result = value;

  if (!isTypeChecked(value)) {
    const { children } = info;
    const childInfo = getChildInfo(children, name);

    if (childInfo) {
      result = createFn(value, { info: childInfo });
    } else {
      const { deep, names, checker } = info;
      result = createFn(value, { deep, names: [...names, name], checker });
      storeChildInfoFrom(children, name, result);
    }
  }

  return result;
};
