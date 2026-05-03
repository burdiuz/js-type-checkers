# @actualwave/type-checker-simple-reporting

Three ready-to-use reporter functions for [`@actualwave/type-checkers`](https://github.com/burdiuz/js-type-checkers) and a shared message formatter.

## Installation

```bash
npm install @actualwave/type-checker-simple-reporting
```

## Usage

Pass a reporter wherever a `Reporter`-typed callback is expected:

```typescript
import {
  ConsoleWarnReporter,
  ConsoleErrorReporter,
  ThrowErrorReporter,
} from '@actualwave/type-checker-simple-reporting';

// Log violations without stopping execution (good for development)
myChecker.setReporter(ConsoleWarnReporter);

// Hard-fail on any violation (good for tests or strict guards)
myChecker.setReporter(ThrowErrorReporter);
```

## Reporters

| Export | Behaviour |
|---|---|
| `ConsoleWarnReporter` | Calls `console.warn` with a formatted message |
| `ConsoleErrorReporter` | Calls `console.error` with a formatted message |
| `ThrowErrorReporter` | Throws an `Error` with a formatted message (`never` return type) |

All three share the same `Reporter` signature:

```typescript
type Reporter = (
  action: string,             // operation that triggered the violation, e.g. 'set', 'get'
  name: string,               // property name involved
  requiredTypeString: string, // expected type
  actualTypeString: string,   // received type
) => void;
```

## Error message format

All reporters produce a message of the form:

```
<action>Error on "<name>" instead of "<requiredType>" received "<actualType>"
```

Example:

```
setError on "count" instead of "number" received "string"
```

## `constructErrorString`

The underlying message builder is exported if you need to compose a custom reporter:

```typescript
import {
  constructErrorString,
  Reporter,
} from '@actualwave/type-checker-simple-reporting';

const myReporter: Reporter = (action, name, required, received) => {
  analytics.track('type_violation', {
    message: constructErrorString(action, name, required, received),
  });
};
```

## License

MIT
