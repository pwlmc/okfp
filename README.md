# OK-FP

![npm (scoped)](https://img.shields.io/npm/v/ok-fp?color=orange&label=npm) ![license](https://img.shields.io/badge/license-MIT-blue)

> Essential Effect Data Types for TypeScript

OK-FP is a small, focused functional programming toolkit for TypeScript.

It provides a minimal set of **typed effects**: composable, type-safe wrappers for optional values, errors, and async computations.

## Status

OK-FP is pre-1.0.

- ✅ Implemented: `Option`, `Either`
- 🚧 Planned before `v1.0.0`: `Validation`, `Task`, `TaskEither`

See: [ROADMAP.md](./ROADMAP.md)

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

const reciprocal = (n: number): Option<number> => some(1 / n);

const compute = (input: string): Option<number> =>
  parseNumber(input)
    .flatMap(positive) // must be > 0
    .flatMap(nonZero) // must not be 0
    .flatMap(reciprocal) // compute 1 / n
    .map((n) => n * 100); // scale result

// Usage (returns Option instances)
compute("4"); // returns Option.some(25)
compute("0"); // returns Option.none() (fails nonZero)
compute("-3"); // returns Option.none() (fails positive)
compute("abc"); // returns Option.none() (fails parsing)
```

## Documentation

Full documentation and API reference are available in the docs site or the `docs/` folder.

[API docs](https://pwlmc.github.io/ok-fp/)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
