import {
  ConsoleErrorReporter,
  ConsoleWarnReporter,
} from './console';
import { ThrowErrorReporter } from './error';

let errorReporter = ConsoleErrorReporter;

const getErrorReporter = () => errorReporter;

const setErrorReporter = (reporter) => {
  errorReporter = reporter;
};

export {
  ConsoleErrorReporter,
  ConsoleWarnReporter,
  ThrowErrorReporter,
  getErrorReporter,
  setErrorReporter,
};
