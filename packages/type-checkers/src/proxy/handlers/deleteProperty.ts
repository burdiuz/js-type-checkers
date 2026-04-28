import { INFO_KEY, getTargetInfo } from '../../info';
import { TARGET_KEY, isSymbol } from '../../utils';

const deletePropertyFactory =
  () =>
  (target: object, property: string | symbol): boolean => {
    if (property === INFO_KEY) {
      return delete (target as Record<symbol, unknown>)[INFO_KEY];
    }

    if (property === TARGET_KEY) {
      return false;
    }

    if (isSymbol(property)) {
      return delete (target as Record<symbol, unknown>)[property];
    }

    const info = getTargetInfo(target)!;
    const { names, data, checker } = info;

    /* Bug fix: guard optional method before calling, consistent with other handlers. */
    if (checker.deleteProperty) {
      checker.deleteProperty(target, names.clone(property), data);
    }

    return delete (target as Record<string, unknown>)[property];
  };

export default deletePropertyFactory;
