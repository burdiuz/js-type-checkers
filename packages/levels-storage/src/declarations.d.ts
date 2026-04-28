declare module '@actualwave/map-of-sets' {
  class MapOfSets<K, V> {
    protected storage: Map<K, Set<V>>;
    has(key: K): boolean;
    hasValue(key: K, value: V): boolean;
    get(key: K): Set<V> | undefined;
    list(key: K): V[];
    add(key: K, value: V): void;
    set(key: K, values: Set<V> | V[]): void;
    remove(key: K): void;
    removeValue(key: K, value: V): void;
    forEach(callback: (value: V, key: K, map: MapOfSets<K, V>) => void): void;
    eachValue(key: K, callback: (value: V, key: K, map: MapOfSets<K, V>) => void): void;
    clone(): MapOfSets<K, V>;
  }

  export function createMapOfSets<K, V>(): MapOfSets<K, V>;
  export default MapOfSets;
}
