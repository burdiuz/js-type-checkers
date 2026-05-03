# @actualwave/type-checker-levels-storage

Type information storage for [`@actualwave/type-checkers`](https://github.com/burdiuz/js-type-checkers). Stores the set of types ever observed for each property and controls *how much* type history to retain via reporting levels.

## Installation

```bash
npm install @actualwave/type-checker-levels-storage
```

## Reporting levels

A reporting level determines what type information is stored for a property.

| Constant | Value | Description |
|---|---|---|
| `REPORT_ALL_ASSIGNED_TYPES` | `'all'` | Accumulate every distinct type ever assigned — each new type is reported once |
| `REPORT_FIRST_TYPE_ONLY` | `'first'` | Record only the first observed type — every subsequent mismatch is reported |
| `REPORT_NEVER` | `'never'` | Do not store any type information |

The global default is `REPORT_FIRST_TYPE_ONLY`.

## Usage

### Creating a storage

```typescript
import { createTypesStorage } from '@actualwave/type-checker-levels-storage';

const storage = createTypesStorage();
```

### Adding type observations

```typescript
import {
  createTypesStorage,
  REPORT_ALL_ASSIGNED_TYPES,
  REPORT_FIRST_TYPE_ONLY,
} from '@actualwave/type-checker-levels-storage';

const storage = createTypesStorage<string, string>();

storage.add('count', 'number', REPORT_ALL_ASSIGNED_TYPES);
storage.add('count', 'string', REPORT_ALL_ASSIGNED_TYPES); // second type stored too

storage.add('label', 'string', REPORT_FIRST_TYPE_ONLY);
storage.add('label', 'number', REPORT_FIRST_TYPE_ONLY);    // ignored — first type wins
```

### Checking stored types

```typescript
storage.has('count');        // true
storage.get('count');        // Set { 'number', 'string' }
storage.has('unknown');      // false
```

### Per-target reporting levels

Set reporting levels on individual objects or per-property:

```typescript
import {
  setReportingLevel,
  getReportingLevel,
  REPORT_ALL_ASSIGNED_TYPES,
  REPORT_FIRST_TYPE_ONLY,
  REPORT_NEVER,
} from '@actualwave/type-checker-levels-storage';

const obj = { id: 1, label: 'hello', internal: null };

setReportingLevel(obj, REPORT_ALL_ASSIGNED_TYPES, {
  label: REPORT_FIRST_TYPE_ONLY, // override for this property
  internal: REPORT_NEVER,        // never track 'internal'
});

getReportingLevel(obj, 'id');       // 'all'
getReportingLevel(obj, 'label');    // 'first'
getReportingLevel(obj, 'internal'); // 'never'
```

Level resolution priority (highest to lowest):

1. Per-property level on the instance
2. Object-level on the instance
3. Per-property level on the constructor
4. Object-level on the constructor
5. Global default

### Adding observations via a target object

`addFor` and `setFor` automatically resolve the level from the target object:

```typescript
storage.addFor('label', 'string', obj);  // uses getReportingLevel(obj, 'label')
storage.setFor('label', types, obj);
```

### Global reporting level

```typescript
import {
  setGlobalReportingLevel,
  getGlobalReportingLevel,
  REPORT_ALL_ASSIGNED_TYPES,
} from '@actualwave/type-checker-levels-storage';

setGlobalReportingLevel(REPORT_ALL_ASSIGNED_TYPES);
```

### Merging storages

Copy all entries from one storage into another with `copyTo()`. When both storages contain the same key a merge strategy resolves the conflict:

```typescript
import { createTypesStorage, defaultMergeStrategy } from '@actualwave/type-checker-levels-storage';

sourceStorage.copyTo(targetStorage);

// Custom merge strategy: keep only types present in both sets (intersection)
sourceStorage.copyTo(targetStorage, obj, (key, target, source) => {
  source.forEach((type) => {
    if (!target.has(type)) target.delete(type);
  });
  return target;
});
```

The `defaultMergeStrategy` performs a union — all types from the source are added to the target.

## API reference

### Storage — `TypeInfoStorage<K, T>`

Created via `createTypesStorage<K, T>()`.

| Method | Description |
|---|---|
| `add(key, type, level?)` | Record a type observation; level defaults to `REPORT_ALL_ASSIGNED_TYPES` |
| `addFor(key, type, target)` | Like `add()` but resolves the level from `target` |
| `set(key, types, level?)` | Replace the stored type set for a key |
| `setFor(key, types, target)` | Like `set()` but resolves the level from `target` |
| `has(key)` | Returns `true` if any types are stored for `key` |
| `get(key)` | Returns the `Set` of stored types for `key` |
| `remove(key)` | Delete all type data for `key` |
| `clone()` | Return a deep copy of the storage |
| `copyTo(storage, target?, mergeStrategy?)` | Merge this storage into `storage` |

### Levels

| Function | Description |
|---|---|
| `setGlobalReportingLevel(level)` | Change the global default level |
| `getGlobalReportingLevel()` | Read the global default level |
| `setReportingLevel(target, level, perPropertyLevels?)` | Attach levels to a target object |
| `getReportingLevel(target, key)` | Resolve the effective level for a property |

## License

MIT
