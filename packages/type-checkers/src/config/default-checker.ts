import { singleValueFactory } from '@actualwave/closure-value';
import type { TypeChecker } from '../types';

const { get: _getRaw, set: setDefaultTypeChecker } = singleValueFactory<TypeChecker>();

// singleValueFactory uses null as its "empty" sentinel; normalise to undefined for callers.
const getDefaultTypeChecker = (): TypeChecker | undefined => _getRaw() ?? undefined;

export { getDefaultTypeChecker, setDefaultTypeChecker };
