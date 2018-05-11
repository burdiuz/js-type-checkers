import { ConsoleErrorReporter } from './console';

let errorReporter = ConsoleErrorReporter;

export const getErrorReporter = () => errorReporter;

export const setErrorReporter = (reporter) => errorReporter = reporter;
