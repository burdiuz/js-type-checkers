import type { TypeChecker } from './types';

/** No-op type checker useful as a starting point or for testing. */
class StubTypeChecker implements TypeChecker {
  init(_target: object, _data?: unknown): null {
    return null;
  }

  mergeConfigs(_targetData: unknown, _sourceData: unknown): null {
    return null;
  }

  getProperty(_target: object, _names: unknown, _value: unknown, _data: unknown): void {}
  setProperty(_target: object, _names: unknown, _value: unknown, _data: unknown): void {}
  arguments(_target: never, _names: unknown, _argumentsList: unknown[], _data: unknown): void {}
  returnValue(_target: never, _names: unknown, _result: unknown, _data: unknown): void {}
  deleteProperty(_target: object, _names: unknown, _data: unknown): void {}
}

export default StubTypeChecker;
