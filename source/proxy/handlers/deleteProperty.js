import { INFO_KEY, getTargetInfo } from '../../info';
import { TARGET_KEY } from '../../utils';

const deletePropertyFactory = () => (target, property) => {
  if (property === INFO_KEY) {
    return delete target[property];
  } else if (property === TARGET_KEY) {
    return false;
  }

  const info = getTargetInfo(target);
  const { names, data, checker } = info;

  checker.deleteProperty(target, names.clone(property), data);

  return delete target[property];
};

export default deletePropertyFactory;
