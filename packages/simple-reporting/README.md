# # Type Checker Simple Reporting
Set of type error reporting functions created for [Primitive Type Checker](https://github.com/burdiuz/js-primitive-type-checker).

 * **ConsoleErrorReporter** -- uses `console.error()` to report error
 * **ConsoleWarnReporter** -- uses `console.warn()` to report error
 * **ThrowErrorReporter** -- throws type error


## Installation


Via NPM
```bash
npm install @actualwave/type-checker-simple-reporting --save
```
Or Yarn
```bash
yarn add @actualwave/type-checker-simple-reporting
```


## How to use
To change error reporter use `setErrorReporter()` function.
```javascript
import { setErrorReporter } from '@actualwave/primitive-type-checker';
import { ThrowErrorReporter } from '@actualwave/type-checker-simple-reporting';

setErrorReporter(ThrowErrorReporter);
```


> Written with [StackEdit](https://stackedit.io/).
