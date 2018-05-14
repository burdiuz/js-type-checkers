import { isEnabled } from '../enabled';
import { isValidTarget, isTypeChecked } from '../utils';

// TODO if enabled, replaces original value with type checked
const replaceProperty = (target, name, options) => {
  const value = target[name];

  if (!isEnabled() || !isValidTarget(value) || isTypeChecked(value)) {
    return target;
  }

  return target;
};

export default replaceProperty;
