# @actualwave/type-checkers

Runtime type consistency checking for JavaScript and TypeScript objects via `Proxy`. Wraps any object or function and calls a pluggable `TypeChecker` whenever a property is read, written, a function is called, or a property is deleted — letting you detect type inconsistencies without a build step.

## Installation

```bash
npm install @actualwave/type-checkers
```

## Quick start

Implement the `TypeChecker` interface and pass it to `wrap()`:

```typescript
import { wrap, setDefaultTypeChecker, TypeChecker } from '@actualwave/type-checkers';

const myChecker: TypeChecker<Record<string, string>> = {
  init(_target, data) {
    return (data as Record<string, string>) ?? {};
  },
  mergeConfigs(target, source) {
    return { ...target, ...source };
  },
  setProperty(_target, names, value, data) {
    const key = names.toString();
    const expected = data?.[key];
    const actual = typeof value;
    if (expected && actual !== expected) {
      console.warn(`"${key}": expected ${expected}, got ${actual}`);
    } else {
      data![key] = actual;
    }
  },
};

setDefaultTypeChecker(myChecker);

const obj = wrap({ count: 0, label: 'hello' });

obj.count = 1;       // ok
obj.count = 'oops';  // warns: "count": expected number, got string
```

## API

### Wrapping

#### `wrap(target, options?, proxyConfig?)`

Wraps a single object or function with a `Proxy`. Returns `target` unchanged when it is already wrapped, not wrappable, or type-checking is globally disabled.

```typescript
import { wrap } from '@actualwave/type-checkers';

const wrapped = wrap(myObject, { checker, deep: false, name: 'root' });
```

#### `wrapDeep(target, options?, proxyConfig?)`

Like `wrap()` but also walks all own enumerable properties and pre-wraps nested objects, calling `checker.getProperty()` for each encountered value.

```typescript
import { wrapDeep } from '@actualwave/type-checkers';

const wrapped = wrapDeep(myObject);
```

#### `WrapOptions`

| Field | Type | Description |
|---|---|---|
| `checker` | `TypeChecker` | Checker to use; defaults to the global default |
| `deep` | `boolean` | Auto-wrap child objects on access (default `true`) |
| `name` | `string \| number \| symbol` | Name for the root path segment |
| `data` | `unknown` | Initial data forwarded to `checker.init()` |
| `info` | `TargetInfo` | Supply a pre-built info object; all other options are ignored |

#### `WrapProxyConfig`

Disable individual proxy traps. All are enabled by default.

```typescript
// Monitor gets and sets only — ignore calls and construction
const wrapped = wrap(fn, null, { get: true, set: true, apply: false, construct: false });
```

### Object utilities

#### `assign(target, ...sources)` / `assign.options(options, target, ...sources)`

Drop-in replacement for `Object.assign`. If `target` or any source is already wrapped the result retains the type-checker.

```typescript
import { assign } from '@actualwave/type-checkers';

const result = assign(wrappedTarget, { extra: true });
// result is wrapped with the same checker
```

#### `merge(...sources)` / `merge.options(options, ...sources)`

Like `Object.assign({}, ...sources)`. If any source is wrapped, the newly created object is also wrapped with the same checker.

```typescript
import { merge } from '@actualwave/type-checkers';

const result = merge(wrappedA, plainB);
// result is a new wrapped object
```

### Wrap configuration flags

Global defaults are changed with `setWrapConfigValue(key, value)`. Individual wrapped objects can be overridden with `setWrapConfigTo(wrapped, key, value)`.

| Constant | Default | Description |
|---|---|---|
| `WRAP_FUNCTION_RETURN_VALUES` | `true` | Wrap objects returned from functions |
| `WRAP_FUNCTION_ARGUMENTS` | `false` | Wrap objects passed as function arguments |
| `WRAP_SET_PROPERTY_VALUES` | `false` | Wrap objects written to properties |
| `WRAP_IGNORE_PROTOTYPE_METHODS` | `false` | Skip prototype-inherited methods |

```typescript
import {
  setWrapConfigValue,
  setWrapConfigTo,
  WRAP_FUNCTION_ARGUMENTS,
} from '@actualwave/type-checkers';

// Enable argument wrapping globally
setWrapConfigValue(WRAP_FUNCTION_ARGUMENTS, true);

// Or for a single wrapped object
setWrapConfigTo(wrappedObj, WRAP_FUNCTION_ARGUMENTS, true);
```

### Utility functions

| Function | Description |
|---|---|
| `isWrapped(value)` | `true` if the value is a proxy created by this library |
| `isWrappable(value)` | `true` if the value is an object or function that can be wrapped |
| `unwrap(value)` | Returns the raw underlying target |

### Global configuration

| Function | Description |
|---|---|
| `setDefaultTypeChecker(checker)` | Set the checker used when none is passed to `wrap()` |
| `getDefaultTypeChecker()` | Retrieve the current global checker |
| `setEnabled(value)` | Globally enable or disable wrapping (`true` by default) |
| `isEnabled()` | Returns the current enabled state |

Disabling globally lets you turn off all overhead in production without removing `wrap()` calls:

```typescript
import { setEnabled } from '@actualwave/type-checkers';

if (process.env.NODE_ENV === 'production') {
  setEnabled(false);
}
```

### Filtering

Prevent specific classes or property names from being intercepted:

```typescript
import {
  ignoreClass,
  stopIgnoringClass,
  isClassIgnored,
  getIgnoredClasses,
} from '@actualwave/type-checkers';

ignoreClass(Date);       // Date instances will never be wrapped
stopIgnoringClass(Date); // remove the exclusion
```

```typescript
import {
  ignoreProperty,
  stopIgnoringProperty,
  isPropertyIgnored,
  getIgnoredProperties,
} from '@actualwave/type-checkers';

ignoreProperty('id');    // 'id' will not trigger checker events
```

The properties `constructor`, `prototype`, and `__proto__` are ignored by default.

### Introspection

```typescript
import {
  getTargetInfo,
  getTypeChecker,
  getTypeCheckerData,
  removeTargetInfo,
} from '@actualwave/type-checkers';

const info    = getTargetInfo(wrapped);      // TargetInfo | undefined
const checker = getTypeChecker(wrapped);     // TypeChecker | undefined
const data    = getTypeCheckerData(wrapped); // checker data | undefined
```

## TypeChecker interface

```typescript
interface TypeChecker<D = unknown> {
  /** Called when a proxy is created. Return the initial checker data for this target. */
  init(target: object, data?: D | null): D | null;

  /** Called when two wrapped objects are merged. Combine data from both and return the result. */
  mergeConfigs(targetData: D | null, sourceData: D | null, names: PathSequence): D | null;

  // All hooks below are optional:

  /** A property was read from the wrapped object. */
  getProperty?(target: object, names: PathSequence, value: unknown, data: D | null): void;

  /** A value was assigned to a property. */
  setProperty?(target: object, names: PathSequence, value: unknown, data: D | null): void;

  /** A wrapped function was called — inspect its arguments. */
  arguments?(target: Function, names: PathSequence, args: unknown[], data: D | null, thisArg?: unknown): void;

  /** A wrapped function returned — inspect its return value. */
  returnValue?(target: Function, names: PathSequence, result: unknown, data: D | null, thisArg?: unknown): void;

  /** A property was deleted. */
  deleteProperty?(target: object, names: PathSequence, data: D | null): void;
}
```

`PathSequence` is from [`@actualwave/path-sequence-to-string`](https://github.com/burdiuz/js-path-sequence-to-string) and represents the dot-path to the current property (e.g. `root.child.method`).

## License

MIT
