import { INFO_KEY, getTargetInfo } from '../../info';
import { TARGET_KEY, isSymbol } from '../../utils';

const deletePropertyFactory = () => (target, property) => {
  if (property === INFO_KEY) {
    return delete target[property];
  }

  if (property === TARGET_KEY) {
    return false;
  }

  if (isSymbol(property)) {
    return delete target[property];
  }

  const info = getTargetInfo(target);
  const { names, data, checker } = info;

  checker.deleteProperty(target, names.clone(property), data);

  return delete target[property];
};

export default deletePropertyFactory;
