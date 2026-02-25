# OK-FP

![npm (scoped)](https://img.shields.io/npm/v/ok-fp?color=orange&label=npm) ![license](https://img.shields.io/badge/license-MIT-blue)

> Essential Effect Data Types for TypeScript

OK-FP is a small, focused functional programming toolkit for TypeScript.

It provides a minimal set of **typed effects**: composable, type-safe wrappers for optional values, errors, and async computations.

## Effects

| Effect | Description |
|---|---|
| [`Option<T>`](./docs/option.md) | A value that may or may not be present. Use instead of `null`/`undefined`. |
| [`Either<E, T>`](./docs/either.md) | A computation that succeeds with `T` or fails with a typed error `E`. Errors are explicit and must be handled. |
| [`Validation<E, T>`](./docs/validation.md) | Like `Either`, but accumulates **all** errors instead of stopping at the first one. Ideal for form and config validation. |
| [`Task<T>`](./docs/task.md) | A lazy async computation that always succeeds. Executes only when `.run()` is called — unlike Promises, which are eager. |
| [`TaskEither<E, T>`](./docs/task-either.md) | A lazy async computation that can succeed with `T` or fail with `E`. Combines `Task`'s laziness with `Either`'s typed errors. |

## Installation

Install with your package manager of choice:

```bash
npm install ok-fp
# or
# pnpm add ok-fp
# yarn add ok-fp
```

### Basic example

This example shows a small pipeline using `Option`.

```ts
import { type Option, some, none } from "ok-fp/option";

const parseNumber = (input: string): Option<number> => {
  const n = Number(input);
  return Number.isFinite(n) ? some(n) : none();
};

const nonZero = (n: number): Option<number> => (n !== 0 ? some(n) : none());

const positive = (n: number): Option<number> => (n > 0 ? some(n) : none());

const compute = (input: string): Option<number> =>
  parseNumber(input)
    .flatMap(nonZero)     // must not be 0
    .flatMap(positive)    // must be > 0
    .map((n) => 1 / n)    // reciprocal (no need for flatMap)
    .map((n) => n * 100); // scale

// Usage (returns Option instances)
compute("4");   // returns some(25)
compute("0");   // returns none() (fails nonZero)
compute("-3");  // returns none() (fails positive)
compute("abc"); // returns none() (fails parsing)
```

## Documentation

Full documentation and API reference are available in the docs site or the `docs/` folder.

[API docs](https://pwlmc.github.io/ok-fp/)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
