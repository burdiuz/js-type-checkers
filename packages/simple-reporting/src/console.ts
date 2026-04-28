/* eslint-disable no-console */
import { constructErrorString } from './utils';

export const ConsoleErrorReporter = (
  action: string,
  name: string,
  requiredTypeString: string,
  actualTypeString: string
): void => {
  console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));
};

export const ConsoleWarnReporter = (
  action: string,
  name: string,
  requiredTypeString: string,
  actualTypeString: string
): void => {
  console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));
};
