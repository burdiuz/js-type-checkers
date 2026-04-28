declare module '@actualwave/closure-value' {
  export function singleValueFactory<T>(
    initialValue?: T,
    validator?: (value: unknown) => T
  ): { get(): T | undefined; set(value: unknown): void };

  export function valuesSetFactory<T>(
    initialValues?: T[]
  ): {
    get(): Set<T>;
    add(value: T): void;
    has(value: T): boolean;
    delete(value: T): void;
  };

  export function valuesMapFactory<K extends PropertyKey, V>(
    initialEntries?: [K, V][],
    validator?: (key: K, value: unknown) => V
  ): {
    getDefault(): Map<K, V>;
    set(key: K, value: V): void;
    get(key: K): V | undefined;
  };
}

declare module '@actualwave/path-sequence-to-string' {
  export interface PathSequence {
    readonly lastName: string;
    clone(name: string | number | symbol): PathSequence;
    toString(): string;
  }
  export function createPathSequence(name?: string | number | symbol): PathSequence;
}

declare module '@actualwave/with-proxy' {
  export default function withProxy(
    handlers: ProxyHandler<object>
  ): <T extends object>(target: T) => T;
}

declare module '@actualwave/get-class' {
  export function getClass(value: unknown): Function | null | undefined;
}

