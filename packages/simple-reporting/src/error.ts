import { constructErrorString } from './utils';

export const ThrowErrorReporter = (
  action: string,
  name: string,
  requiredTypeString: string,
  actualTypeString: string
): never => {
  throw new Error(constructErrorString(action, name, requiredTypeString, actualTypeString));
};
