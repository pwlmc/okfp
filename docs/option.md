
# Option

`Option<T>` represents a value that may or may not exist. It is a type-safe alternative to `null`, `undefined`, or optional chaining.

- **`Some<T>`** — a value of type `T` is present
- **`None<T>`** — no value is present (absence)

## Overview

Using `Option` instead of `null`/`undefined` forces you to explicitly handle both cases, reducing runtime errors and improving code clarity.

```ts
import { type Option, some, none } from "okfp/option";

// Without Option: can return null or undefined (unclear)
function unsafeGet(id: string): User | null { /* ... */ }

// With Option: explicit that result may be absent
function safeGet(id: string): Option<User> { /* ... */ }
```

## Basic Usage

### Creating an Option

```ts
import { some, none } from "okfp/option";

const hasValue = some(42);  // Some(42)
const empty = none();        // None
```

### Transforming with `map`

Transform the value inside if it exists; leave `None` unchanged.

```ts
const x: Option<number> = some(5);
const doubled = x.map((n) => n * 2); // Some(10)

const y: Option<number> = none();
const result = y.map((n) => n * 2);  // None
```

### Chaining with `flatMap`

Use `flatMap` (also called `bind` in other languages) to sequence operations that return `Option`.

```ts
const parseNumber = (input: string): Option<number> => {
  const n = Number(input);
  return Number.isFinite(n) ? some(n) : none();
};

const positive = (n: number): Option<number> => (n > 0 ? some(n) : none());

const reciprocal = (n: number): Option<number> => some(1 / n);

const compute = (input: string): Option<number> =>
  parseNumber(input)
    .flatMap(positive)   // short-circuits to None if not positive
    .flatMap(reciprocal) // short-circuits to None if reciprocal fails
    .map((n) => n * 100);

compute("4");   // Some(25)
compute("0");   // None (fails positive)
compute("-3");  // None (fails positive)
compute("abc"); // None (fails parsing)
```

### Extracting the Value

Use `getOrElse` or `fold` to extract or handle the value:

```ts
const x: Option<number> = some(42);
x.getOrElse(0); // 42

const y: Option<number> = none();
y.getOrElse(0); // 0

// Using fold for pattern matching
const result = x.fold(
  () => "no value",   // None case
  (val) => `value: ${val}` // Some case
);
// result = "value: 42"
```

## Common Patterns

### Filtering

Keep the value only if a predicate holds:

```ts
const isEven = (n: number): boolean => n % 2 === 0;
some(4).filter(isEven);  // Some(4)
some(3).filter(isEven);  // None
```

### Default Values

Provide a fallback:

```ts
some(10).getOrElse(0);  // 10
none().getOrElse(0);    // 0
```

### Combining Multiple Options

```ts
const a: Option<number> = some(5);
const b: Option<number> = some(10);

// Using flatMap
const sum = a.flatMap((x) => b.map((y) => x + y));
// Some(15)
```

## API Reference

| Method | Signature | Description |
|--------|-----------|-------------|
| `map` | `<U>(f: (a: T) => U): Option<U>` | Transform the value if present |
| `flatMap` | `<U>(f: (a: T) => Option<U>): Option<U>` | Chain `Option`-returning operations |
| `filter` | `(predicate: (a: T) => boolean): Option<T>` | Keep value only if predicate holds |
| `getOrElse` | `(defaultValue: T): T` | Extract value or return default |
| `fold` | `<U>(onNone: () => U, onSome: (a: T) => U): U` | Pattern match on `Some` / `None` |
| `isSome` | `(): boolean` | Check if value is present |
| `isNone` | `(): boolean` | Check if value is absent |

## When to Use Option

- **Representing optional values:** Instead of `| null` or `| undefined`
- **Parsing and validation:** When an operation may fail (e.g., parsing JSON)
- **Safe property access:** Instead of optional chaining, use explicit `Option`
- **Composing operations:** Chain multiple fallible computations elegantly

## See Also

- [Either](./either.md) — for operations that may fail with an error message
- [Task](./task.md) — for asynchronous computations
- [TaskEither](./task-either.md) — for async operations that may fail