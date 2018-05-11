import { constructErrorString } from './utils';

export const ThrowErrorReporter = (action, name, requiredTypeString, actualTypeString) => {
  throw new Error(constructErrorString(action, name, requiredTypeString, actualTypeString));
};
