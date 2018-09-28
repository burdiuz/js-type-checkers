import {
  INFO_KEY,
  getTargetInfo,
} from '../target/info';

import { TARGET_KEY } from '../target/proxy';

const deletePropertyFactory = () => (target, property) => {
  if (property === INFO_KEY) {
    return delete target[property];
  } else if (property === TARGET_KEY) {
    return false;
  }


  const value = target[property];
  const info = getTargetInfo(target);
  const { names, data, checker } = info;

  checker.deleteProperty(target, property, value, data, names);

  return delete target[property];
};

export default deletePropertyFactory;
