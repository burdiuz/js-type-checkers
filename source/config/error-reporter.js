import { ConsoleErrorReporter } from '@actualwave/type-checker-simple-reporting';
import { singleConfigFactory } from './utils';

export const {
  get: getErrorReporter,
  set: setErrorReporter,
} = singleConfigFactory(ConsoleErrorReporter);
