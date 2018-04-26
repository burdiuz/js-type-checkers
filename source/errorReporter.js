const constructErrorString = (action, name, required, actual) =>
  `TypeChecker error for "${action}" on "${name}" instead of "${required}" received "${actual}"`;

export const ConsoleErrorReporter = (action, name, requiredTypeString, actualTypeString) =>
  console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));

export const ConsoleWarnReporter = (action, name, requiredTypeString, actualTypeString) =>
  console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));

export const ThrowErrorReporter = (action, name, requiredTypeString, actualTypeString) => {
  throw new Error(constructErrorString(action, name, requiredTypeString, actualTypeString));
};

let errorReporter = ConsoleErrorReporter;

export const getErrorReporter = () => errorReporter;

export const setErrorReporter = (reporter) => errorReporter = reporter;
