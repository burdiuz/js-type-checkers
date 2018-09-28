import { isEnabled } from '../../enabled';
import { isWrappable, isWrapped } from '../../utils';
import create from '../../proxy/create';

// TODO if enabled, replaces original value with type checked
const properties = (target, options = undefined, ...names) => {
  if (!isEnabled()) {
    return target;
  }

  if (!isWrappable(target)) {
    throw new Error('Target must be a valid object.');
  }

  if (Object.isFrozen(target) || Object.isSealed(target)) {
    throw new Error('Target object should not be sealed or frozen.');
  }

  if (!names.length) {
    // Symbols and non-enumerables must be explicitly specified
    names = Object.keys(target);
  }

  const { length } = names;
  for (let index = 0; index < length; index += 1) {
    const name = names[index];
    const { writable, get, set } = Object.getOwnPropertyDescriptor(target, name);

    // Prohibit applying to properties with accessor/mutator pair?
    if ((get && set) || writable) {
      const value = target[name];

      if (isWrappable(value)) {
        target[name] = create(value, options);
      }
    }
  }

  return target;
};

export default properties;
