import MapOfSets from '@actualwave/map-of-sets';

import { REPORT_NEVER, REPORT_ALL_ASSIGNED_TYPES, REPORT_FIRST_TYPE_ONLY, ReportingLevel, getReportingLevel, validateReportingLevel } from './levels';

/** Called when two storages are merged and both contain the same key. Must return the target Set. */
export type MergeStrategy<K, T> = (key: K, target: Set<T>, source: Set<T>, level: ReportingLevel) => Set<T>;

/** Default merge strategy: union of both sets (source types are added to target). */
export const defaultMergeStrategy: MergeStrategy<unknown, unknown> = (key, target, source) => {
  source.forEach((type) => {
    if (!target.has(type)) {
      target.add(type);
    }
  });
  return target;
};

class TypeInfoStorage<K = PropertyKey, T = unknown> extends MapOfSets<K, T> {
  // MapOfSets.has() returns `values && values.size` — truthy but not a real boolean.
  has(key: K): boolean {
    return !!super.has(key);
  }

  /**
   * Record a type observation for a key according to the given reporting level.
   * - REPORT_ALL_ASSIGNED_TYPES: accumulate every distinct type into the Set.
   * - REPORT_FIRST_TYPE_ONLY: store the first type only; ignore subsequent calls.
   * - REPORT_NEVER: clear any stored types for the key.
   */
  add(key: K, type: T, level: ReportingLevel = REPORT_ALL_ASSIGNED_TYPES): void {
    if (!type) return;

    switch (level) {
      case REPORT_NEVER:
        this.remove(key);
        break;
      case REPORT_ALL_ASSIGNED_TYPES:
        super.add(key, type);
        break;
      case REPORT_FIRST_TYPE_ONLY:
      default: {
        // Only write if the key is empty — subsequent types are intentionally discarded.
        const types = this.storage.get(key);
        if (!types || !types.size) {
          this.storage.set(key, new Set([type]));
        }
        break;
      }
    }
  }

  /** Convenience wrapper: resolves the level from the target object before calling add(). */
  addFor(key: K, type: T, target: object): void {
    this.add(key, type, getReportingLevel(target, key as PropertyKey));
  }

  set(key: K, types: Set<T> | T[], level?: ReportingLevel): void {
    if (!types || (types as Set<T>).size === 0 || level === REPORT_NEVER) {
      this.remove(key);
      return;
    }
    super.set(key, types);
  }

  /** Convenience wrapper: resolves the level from the target object before calling set(). */
  setFor(key: K, types: Set<T> | T[], target: object): void {
    this.set(key, types, getReportingLevel(target, key as PropertyKey));
  }

  clone(): TypeInfoStorage<K, T> {
    const target = new TypeInfoStorage<K, T>();
    this.storage.forEach((types, key) => target.set(key, new Set(types)));
    return target;
  }

  /**
   * Merge all entries from this storage into `storage`.
   * If `target` is provided its reporting levels are respected — keys marked
   * REPORT_NEVER on `target` are skipped entirely.
   * When both storages contain the same key, `mergeStrategy` decides the result.
   */
  copyTo(
    storage: TypeInfoStorage<K, T>,
    target?: object,
    mergeStrategy: MergeStrategy<K, T> = defaultMergeStrategy as MergeStrategy<K, T>
  ): TypeInfoStorage<K, T> {
    this.storage.forEach((types, key) => {
      // When no target is given, validateReportingLevel(undefined) returns REPORT_FIRST_TYPE_ONLY.
      const level = validateReportingLevel(target && getReportingLevel(target, key as PropertyKey));

      switch (level) {
        case REPORT_FIRST_TYPE_ONLY:
        case REPORT_ALL_ASSIGNED_TYPES:
          if (storage.has(key)) {
            storage.set(key, mergeStrategy(key, storage.get(key)!, types, level), level);
          } else {
            storage.set(key, new Set(types), level);
          }
          break;
        case REPORT_NEVER:
        default:
          break;
      }
    });

    return storage;
  }
}

export const createTypesStorage = <K = PropertyKey, T = unknown>(): TypeInfoStorage<K, T> =>
  new TypeInfoStorage<K, T>();

export default TypeInfoStorage;
