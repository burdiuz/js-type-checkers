/* eslint-disable import/prefer-default-export */

import { constructErrorString } from './utils';

export const ThrowErrorReporter = (
  action,
  name,
  requiredTypeString,
  receivedTypeString,
) => {
  throw new Error(constructErrorString(action, name, requiredTypeString, receivedTypeString));
};
