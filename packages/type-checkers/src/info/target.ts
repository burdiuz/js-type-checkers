import { createPathSequence, PathSequence } from '@actualwave/path-sequence-to-string';
import type { TypeChecker } from '../types';
import {
  WRAP_FUNCTION_ARGUMENTS,
  WRAP_FUNCTION_RETURN_VALUES,
  WRAP_IGNORE_PROTOTYPE_METHODS,
  WRAP_SET_PROPERTY_VALUES,
  type WrapConfigKey,
} from '../config/wrap-config';
import ChildrenCache, { createChildrenCache } from './children';

export const INFO_KEY: unique symbol = Symbol('type-checkers::info');

export type TargetInfoFields = {
  checker: TypeChecker;
  data: unknown;
  deep: boolean;
  names: PathSequence;
  children: ChildrenCache;
} & Partial<Record<WrapConfigKey, boolean>>;

export class TargetInfo implements TargetInfoFields {
  checker: TypeChecker;
  data: unknown;
  deep: boolean;
  names: PathSequence;
  children: ChildrenCache;
  [WRAP_FUNCTION_RETURN_VALUES]?: boolean;
  [WRAP_FUNCTION_ARGUMENTS]?: boolean;
  [WRAP_SET_PROPERTY_VALUES]?: boolean;
  [WRAP_IGNORE_PROTOTYPE_METHODS]?: boolean;

  constructor(
    checker: TypeChecker,
    data: unknown = undefined,
    deep: boolean = true,
    names: PathSequence = createPathSequence(),
    children: ChildrenCache = createChildrenCache()
  ) {
    this.checker = checker;
    this.data = data;
    this.deep = deep;
    this.names = names;
    this.children = children;
  }

  getChild(name: PropertyKey): ChildrenCache | undefined {
    return this.children.get(name);
  }

  storeChildFrom(name: PropertyKey, child: object): void {
    const info = getTargetInfo(child);
    if (info) {
      this.children.store(name, info.children);
    }
  }

  createChildWithNames(names: PathSequence, value: object, data: unknown = undefined): TargetInfo {
    const childInfo = new TargetInfo(
      this.checker,
      this.checker.init(value, data),
      this.deep,
      names
    );
    this.children.store(names.lastName, childInfo as unknown as ChildrenCache);
    return childInfo;
  }

  createChild(name: PropertyKey, value: object, data: unknown = undefined): TargetInfo {
    return this.createChildWithNames(this.names.clone(name), value, data);
  }

  copy(source: TargetInfo): this {
    if (this.checker === source.checker) {
      this.deep = this.deep || source.deep;
      this.children.copy(source.children);
      this.data = this.checker.mergeConfigs(this.data, source.data, source.names);
    } else {
      console.error(
        'TypeChecked objects can be merged only if using exactly same instance of type checker.'
      );
    }
    return this;
  }
}

type WithInfo = { [INFO_KEY]?: TargetInfo };

export const getTargetInfo = (target: object): TargetInfo | undefined =>
  (target as WithInfo)[INFO_KEY];

export const setTargetInfo = (target: object, info: TargetInfo): void => {
  if (target && info) {
    (target as WithInfo)[INFO_KEY] = info;
  }
};

export const removeTargetInfo = (target: object): boolean =>
  delete (target as WithInfo)[INFO_KEY];

export const hasTargetInfo = (target: object): boolean => !!getTargetInfo(target);

export const createTargetInfo = (
  checker: TypeChecker,
  data?: unknown,
  deep?: boolean,
  names?: PathSequence,
  children?: ChildrenCache
): TargetInfo => new TargetInfo(checker, data, deep, names, children);
