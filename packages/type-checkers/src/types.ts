import type { PathSequence } from '@actualwave/path-sequence-to-string';

export type AnyFunction = (...args: unknown[]) => unknown;

/** Interface every type checker plugin must implement. */
export interface TypeChecker<D = unknown> {
  init(target: object, data?: D | null): D | null;
  mergeConfigs(targetData: D | null, sourceData: D | null, names: PathSequence): D | null;
  getProperty?(target: object, names: PathSequence, value: unknown, data: D | null): void;
  setProperty?(target: object, names: PathSequence, value: unknown, data: D | null): void;
  arguments?(
    target: AnyFunction,
    names: PathSequence,
    argumentsList: unknown[],
    data: D | null,
    thisArg?: unknown
  ): void;
  returnValue?(
    target: AnyFunction,
    names: PathSequence,
    result: unknown,
    data: D | null,
    thisArg?: unknown
  ): void;
  deleteProperty?(target: object, names: PathSequence, data: D | null): void;
}

export interface WrapProxyConfig {
  get?: boolean;
  set?: boolean;
  apply?: boolean;
  construct?: boolean;
  deleteProperty?: boolean;
}
