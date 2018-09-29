import { createPathSequence } from '@actualwave/path-sequence-to-string';

import { createChildrenCache } from './children';

export const INFO_KEY = Symbol('type-checkers::info');

export const getTargetInfo = (target) => (target ? target[INFO_KEY] : undefined);

export const setTargetInfo = (target, info) => {
  if (target && info) {
    target[INFO_KEY] = info;
  }
};

export const removeTargetInfo = (target) => delete target[INFO_KEY];

export const hasTargetInfo = (target) => !!getTargetInfo(target);

class TargetInfo {
  constructor(
    checker,
    data = null,
    deep = true,
    names = createPathSequence(),
    children = createChildrenCache(),
  ) {
    this.checker = checker;
    this.data = data;
    this.deep = deep;
    this.names = names;
    this.children = children;
  }

  getChild(name) {
    return this.children.get(name);
  }

  storeChildFrom(name, child) {
    const info = getTargetInfo(child);

    if (info) {
      this.children.store(name, info);
    }
  }

  createChildWithNames(names, value, data = null) {
    const childInfo = new TargetInfo(
      this.checker,
      this.checker.init(value, data),
      this.deep,
      names,
    );

    this.children.store(names.lastName, childInfo);

    return childInfo;
  }

  createChild(name, value, data = null) {
    return this.createChildWithNames(this.names.clone(name), value, data);
  }

  copy({ deep, checker, children, data, names }) {
    if (this.checker === checker) {
      this.deep = this.deep || deep;
      this.children.copy(children);
      this.data = checker.mergeConfigs(this.data, data, names);
    } else {
      console.error(
        'TypeChecked objects can be merged only if using exactly same instance of type checker.',
      );
    }

    return this;
  }
}

export const createTargetInfo = (checker, data, deep, names, children) =>
  new TargetInfo(checker, data, deep, names, children);
