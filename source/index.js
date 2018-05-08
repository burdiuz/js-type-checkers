import {
  getDefaultTypeChecker,
  setDefaultTypeChecker,
} from './defaultTypeChecker';
import {
  ConsoleErrorReporter,
  ConsoleWarnReporter,
  getErrorReporter,
  setErrorReporter,
  ThrowErrorReporter,
} from './errorReporter';
import {
  isEnabled,
  setEnabled,
} from './enabled';
import {
  getTargetTypeChecker,
  getTargetTypeCheckerConfig,
} from './config';
import {
  create,
  isValidTarget,
} from './proxy';
import PrimitiveTypeChecker from './typeChecker';

export {
  getDefaultTypeChecker,
  setDefaultTypeChecker,
  ConsoleErrorReporter,
  ConsoleWarnReporter,
  getErrorReporter,
  setErrorReporter,
  ThrowErrorReporter,
  isEnabled,
  setEnabled,
  getTargetTypeChecker,
  getTargetTypeCheckerConfig,
  create,
  isValidTarget,
};

setDefaultTypeChecker(PrimitiveTypeChecker);

export default create;
