---
name: type-checker-simple-reporting
description: Provides ready-made reporter functions for the @actualwave/type-checkers library. Use when you need to route type-check violations to the console (warn or error) or throw an Error. Covers the three most common reporting strategies without any configuration.
license: MIT
metadata:
  author: burdiuz
  package: "@actualwave/type-checker-simple-reporting"
---

## Overview

Three pre-built reporter functions that can be passed directly to a TypeCheckers handler:

| Export | Behaviour |
|---|---|
| `ConsoleWarnReporter` | Calls `console.warn` with a formatted message |
| `ConsoleErrorReporter` | Calls `console.error` with a formatted message |
| `ThrowErrorReporter` | Throws an `Error` with a formatted message |

All three share the same `Reporter` signature and delegate message construction to `constructErrorString`.

## Installation

```bash
npm install @actualwave/type-checker-simple-reporting
```

## Basic usage

```typescript
import {
  ConsoleWarnReporter,
  ConsoleErrorReporter,
  ThrowErrorReporter,
} from '@actualwave/type-checker-simple-reporting';

// Pass to a type-checker — called when a type violation is detected
someTypeChecker.setReporter(ConsoleWarnReporter);

// Throw immediately on violation (strict mode)
someTypeChecker.setReporter(ThrowErrorReporter);
```

## API

```typescript
// Shared reporter signature
type Reporter = (
  action: string,             // the operation that triggered the violation (e.g. 'set', 'get')
  name: string,               // the property name involved
  requiredTypeString: string, // the expected type
  actualTypeString: string,   // the received type
) => void;

// Pre-built implementations
ConsoleErrorReporter: Reporter  // routes to console.error
ConsoleWarnReporter: Reporter   // routes to console.warn
ThrowErrorReporter: Reporter    // throws Error (TypeScript return type: never)

// Underlying message builder (also exported)
constructErrorString(
  action: string,
  name: string,
  required: string,
  received: string,
): string
```

## Error message format

All reporters produce a message of the form:

```
<action>Error on "<name>" instead of "<required>" received "<received>"
```

Example:

```
setError on "count" instead of "number" received "string"
```

## Common patterns

**Development — log violations without interrupting execution:**
```typescript
import { ConsoleWarnReporter } from '@actualwave/type-checker-simple-reporting';

checker.setReporter(ConsoleWarnReporter);
```

**Production guard — fail fast on violation:**
```typescript
import { ThrowErrorReporter } from '@actualwave/type-checker-simple-reporting';

checker.setReporter(ThrowErrorReporter);
```

**Custom reporter built on `constructErrorString`:**
```typescript
import {
  constructErrorString,
  Reporter,
} from '@actualwave/type-checker-simple-reporting';

const myReporter: Reporter = (action, name, required, received) => {
  myLogger.warn(constructErrorString(action, name, required, received));
};
```

## Edge cases

- `ThrowErrorReporter` always throws — TypeScript types its return as `never`, so callers can use it in unreachable-code positions.
- All four parameters are required; passing `undefined` or empty strings is allowed and will be interpolated as-is into the message string.
- There is no built-in deduplication — the reporter is called once per violation event; debouncing is the caller's responsibility.
