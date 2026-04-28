# js-type-checkers

A Lerna monorepo containing the `@actualwave/type-checkers` framework and its companion packages. The library wraps JavaScript objects in Proxies to intercept property access and mutation, enabling runtime type checking and analysis.

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| [`@actualwave/type-checkers`](packages/type-checkers) | — | Core framework — wraps objects/functions in Proxies and dispatches events to a pluggable type-checker |
| [`@actualwave/type-checker-simple-reporting`](packages/simple-reporting) | — | Three ready-made reporter functions: `ConsoleWarnReporter`, `ConsoleErrorReporter`, `ThrowErrorReporter` |
| [`@actualwave/type-checker-levels-storage`](packages/levels-storage) | — | Per-key type-info storage with configurable reporting levels (`REPORT_FIRST_TYPE_ONLY`, `REPORT_ALL_ASSIGNED_TYPES`, `REPORT_NEVER`) |

## Requirements

- Node.js 18+
- npm 9+

## Setup

Install all dependencies from the repo root (npm workspaces hoist shared devDependencies):

```bash
npm install
```

## Building

Build all packages:

```bash
npm run build
```

Build a single package:

```bash
cd packages/type-checkers
npm run build
```

Each package produces:

- `index.js` — CommonJS build (primary entry point)
- `index.min.js` / `dist/*.js` — UMD builds for direct browser use

## Testing

Run all tests across the monorepo:

```bash
npm test
```

Run tests for a single package:

```bash
cd packages/type-checkers
npm test
```

Watch mode:

```bash
npm run test:watch
```

Tests are written in TypeScript, run with Jest + ts-jest, and follow the `*.spec.ts` naming convention.

## Project structure

```
js-type-checkers/
├── tsconfig.base.json          # Shared TypeScript config (extended by each package)
├── packages/
│   ├── type-checkers/          # @actualwave/type-checkers
│   │   └── src/
│   │       ├── config/         # Global flags, default checker, ignored classes/properties
│   │       ├── info/           # TargetInfo and children cache
│   │       ├── proxy/          # Proxy handler factories and wrap/wrapDeep entry points
│   │       ├── types.ts        # TypeChecker interface and shared types
│   │       └── utils.ts        # isWrapped, isWrappable, unwrap, setWrapConfigTo
│   ├── simple-reporting/       # @actualwave/type-checker-simple-reporting
│   │   └── src/
│   │       ├── console.ts      # ConsoleWarnReporter, ConsoleErrorReporter
│   │       ├── error.ts        # ThrowErrorReporter
│   │       └── utils.ts        # constructErrorString
│   └── levels-storage/         # @actualwave/type-checker-levels-storage
│       └── src/
│           ├── levels.ts       # ReportingLevel constants and per-object level storage
│           └── storage.ts      # TypeInfoStorage — Map-backed type observation store
└── package.json                # Workspace root (private)
```

## How it works

`@actualwave/type-checkers` wraps a target object with `wrap(target, checker)` or `wrapDeep(target)`. Every property get, set, function call, and `delete` is intercepted by a Proxy. The active `TypeChecker` receives these events and can record, validate, or report type information however it likes.

Companion packages plug into this system:

- **simple-reporting** supplies reporter callbacks that format and emit violation messages.
- **levels-storage** provides a data structure that type-checker implementations can use to accumulate and query type observations per property key.

## Tooling

All packages share:

- **TypeScript 5** with strict mode
- **Rollup 4** with `@rollup/plugin-typescript` for builds
- **Jest 29** + **ts-jest** for tests
- **Prettier 3** for formatting
