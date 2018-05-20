/* eslint-disable no-console */
import { constructErrorString } from './utils';

export const ConsoleErrorReporter = (
  action,
  name,
  requiredTypeString,
  actualTypeString,
) =>
  console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));

export const ConsoleWarnReporter = (
  action,
  name,
  requiredTypeString,
  actualTypeString,
) =>
  console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));
