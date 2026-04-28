---
name: type-checker-levels-storage
description: Use this skill when you need to store and look up runtime type observations per property key, with configurable reporting levels that control how much type history to keep. Use when building a runtime type checker, implementing a proxy-based type guard, or deciding whether to record a new type observation for a property based on per-object or per-property policy.
license: MIT
metadata:
  author: burdiuz
  package: "@actualwave/type-checker-levels-storage"
---

## Overview

`TypeInfoStorage` is a `Map<PropertyKey, Set<type>>` that stores observed runtime types per property. It is the storage layer for [@actualwave/type-checkers](https://github.com/burdiuz/js-primitive-type-checker).

Three reporting levels control how types are stored:

| Constant | Stored types | When to use |
|---|---|---|
| `REPORT_FIRST_TYPE_ONLY` | First observed type only | Report every mismatch from the initial type |
| `REPORT_ALL_ASSIGNED_TYPES` | All ever-seen types | Report only the first time a new type appears |
| `REPORT_NEVER` | Nothing (key cleared) | Opt a property out of type tracking |

Levels can be set globally, per object, or per property. The resolution order (highest priority first): per-property on instance → object-level on instance → per-property on constructor → object-level on constructor → global default.

## Installation

```bash
npm install @actualwave/type-checker-levels-storage
```

## Basic usage

```typescript
import {
  createTypesStorage,
  REPORT_FIRST_TYPE_ONLY,
  REPORT_ALL_ASSIGNED_TYPES,
  REPORT_NEVER,
} from '@actualwave/type-checker-levels-storage';

const storage = createTypesStorage();

// Record that 'count' was observed as 'number' — only first type is kept
storage.add('count', 'number', REPORT_FIRST_TYPE_ONLY);
storage.add('count', 'string', REPORT_FIRST_TYPE_ONLY); // ignored

storage.get('count'); // Set { 'number' }

// Record that 'tag' can be 'string' or 'symbol' — both are kept
storage.add('tag', 'string', REPORT_ALL_ASSIGNED_TYPES);
storage.add('tag', 'symbol', REPORT_ALL_ASSIGNED_TYPES);

storage.get('tag'); // Set { 'string', 'symbol' }
```

## Reporting levels API

```typescript
import {
  setGlobalReportingLevel,
  getGlobalReportingLevel,
  setReportingLevel,
  getReportingLevel,
  validateReportingLevel,
  REPORT_NEVER,
  REPORT_ALL_ASSIGNED_TYPES,
  REPORT_FIRST_TYPE_ONLY,
  ReportingLevel,
} from '@actualwave/type-checker-levels-storage';

// Global default (applied when no object/property override exists)
setGlobalReportingLevel(REPORT_ALL_ASSIGNED_TYPES);
getGlobalReportingLevel(); // 'all'

// Per-object and per-property overrides (stored via Symbol keys on the target)
const obj = { name: 'Alice', id: 1 };
setReportingLevel(
  obj,
  REPORT_ALL_ASSIGNED_TYPES, // object-level default
  { id: REPORT_FIRST_TYPE_ONLY } // property-level override for 'id'
);

getReportingLevel(obj, 'name'); // 'all'  — falls through to object-level
getReportingLevel(obj, 'id');   // 'first' — property-level override wins

// Class-level defaults (applies to all instances unless overridden)
class MyModel {}
setReportingLevel(MyModel, REPORT_NEVER);
getReportingLevel(new MyModel(), 'anything'); // 'never'

// Validate/normalise an arbitrary value to a ReportingLevel
// (unknown values map to REPORT_FIRST_TYPE_ONLY)
validateReportingLevel('bad'); // 'first'
```

## Storage API

```typescript
// factory
createTypesStorage<K, T>(): TypeInfoStorage<K, T>

// record a type for a key
storage.add(key: K, type: T, level: ReportingLevel): void

// record using level resolved from target object
storage.addFor(key: K, type: T, target: object): void

// replace all types for a key
storage.set(key: K, types: Set<T> | T[], level?: ReportingLevel): void

// replace using level resolved from target object
storage.setFor(key: K, types: Set<T> | T[], target: object): void

// read
storage.has(key: K): boolean
storage.get(key: K): Set<T> | undefined

// deep independent copy
storage.clone(): TypeInfoStorage<K, T>

// merge into another storage (skips REPORT_NEVER keys on target)
storage.copyTo(
  dest: TypeInfoStorage<K, T>,
  target?: object,
  mergeStrategy?: MergeStrategy<K, T>
): TypeInfoStorage<K, T>
```

## Common patterns

**Check whether a new type is a violation:**
```typescript
const storage = createTypesStorage();

function checkType(prop: string, value: unknown, target: object): boolean {
  const type = typeof value;
  const known = storage.get(prop);

  if (known && !known.has(type)) {
    return false; // violation
  }

  storage.addFor(prop, type, target);
  return true;
}
```

**Opt a class out of tracking while keeping per-property overrides:**
```typescript
class ReadOnlyConfig {}
setReportingLevel(ReadOnlyConfig, REPORT_NEVER, {
  version: REPORT_FIRST_TYPE_ONLY, // still track this one property
});
```

**Custom merge strategy (keep only the smallest set on conflict):**
```typescript
import { MergeStrategy } from '@actualwave/type-checker-levels-storage';

const strictMerge: MergeStrategy<PropertyKey, string> = (key, target, source) => {
  // discard source — destination wins
  return target;
};

sourceStorage.copyTo(destStorage, undefined, strictMerge);
```

**Clone a storage before a speculative operation:**
```typescript
const snapshot = storage.clone();
// apply speculative changes to storage ...
// if something goes wrong, restore:
snapshot.copyTo(createTypesStorage()); // or keep snapshot as the source of truth
```

## Edge cases

- `add()` silently ignores falsy `type` values (`null`, `''`, `0`, etc.).
- `set(key, new Set())` and `set(key, [], REPORT_NEVER)` both remove the key.
- `addFor` / `setFor` call `getReportingLevel`, which always returns a valid level — they never throw.
- `copyTo` without a `target` argument treats every key as `REPORT_FIRST_TYPE_ONLY` (copies all).
- `validateReportingLevel` maps any unrecognised value to `REPORT_FIRST_TYPE_ONLY` rather than throwing.
- Level metadata is attached to the target object via `Symbol` keys — it is invisible to `for…in`, `Object.keys()`, and `JSON.stringify()`, but does travel through `Object.assign()`.
