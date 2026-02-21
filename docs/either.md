# Either

`Either<E, T>` represents a computation that can succeed with a value (`Right`) or fail with a typed error (`Left`).

- **`Right<E, T>`** - success, carries a value of type `T`
- **`Left<E, T>`** - failure, carries an error of type `E`

## Why Either?

Throwing exceptions is the most common way to handle errors in JavaScript, but it has serious downsides: exceptions are invisible in type signatures, easy to forget to catch, and break the normal control flow.

`Either` makes errors **explicit and typed**. The caller always knows that a function can fail - and *how* it can fail - because the error type is right there in the signature.

```ts
import { type Either, right, left } from "okfp/either";

// Without Either: throws, caller has no idea what can go wrong
function unsafeParse(input: string): number { /* ... */ }
const n = unsafeParse("abc"); // 💥 runtime exception, nothing in the type warned you

// With Either: error type is explicit, you must handle it
function safeParse(input: string): Either<string, number> { /* ... */ }
safeParse("abc").match(
  (err) => console.error(`Parse failed: ${err}`),
  (n) => console.log(`Got number: ${n}`)
);
```

## Basic Usage

### Creating an Either

```ts
import { right, left, fromNullable, tryCatch } from "okfp/either";

const success = right(42);               // Right(42)
const failure = left("something wrong");  // Left("something wrong")
const fromNull = fromNullable(null, () => "was null"); // Left("was null")
const safe = tryCatch(
  () => JSON.parse('{"a":1}'),
  (err) => "parse failed"
);                                        // Right({ a: 1 })
```

### Transforming and Chaining

```ts
import { type Either, right, left } from "okfp/either";

const parseNumber = (input: string): Either<string, number> => {
  const n = Number(input);
  return Number.isFinite(n) ? right(n) : left("Not a number");
};

const positive = (n: number): Either<string, number> =>
  n > 0 ? right(n) : left("Must be positive");

const compute = (input: string): Either<string, number> =>
  parseNumber(input)
    .flatMap(positive)
    .map((n) => n * 100);

compute("4");   // Right(400)
compute("0");   // Left("Must be positive")
compute("abc"); // Left("Not a number")
```

### Extracting the Value

```ts
import { type Either, right, left } from "okfp/either";

const x: Either<string, number> = right(42);
x.getOrElse(() => 0); // 42

const y: Either<string, number> = left("error");
y.getOrElse(() => 0); // 0

// Pattern matching
const result = x.match(
  (err) => `Error: ${err}`,   // Left case
  (val) => `Value: ${val}`    // Right case
);
// result = "Value: 42"
```

## API Reference

### right

```ts
right<T, E = never>(value: T): Either<E, T>
```

Create an Either containing a success value.

```ts
right(42)      // Right(42)
right("hello") // Right("hello")
```

---

### left

```ts
left<E, T = never>(error: E): Either<E, T>
```

Create an Either containing an error value.

```ts
left("something went wrong") // Left("something went wrong")
left(404)                    // Left(404)
```

---

### fromNullable

```ts
fromNullable<E, T>(value: T | null | undefined, onNullish: () => E): Either<E, T>
```

Convert a nullable value to Either. Returns `Right` if the value is present, `Left` with the provided error otherwise.

```ts
fromNullable("hello", () => "empty") // Right("hello")
fromNullable(null, () => "empty")    // Left("empty")
fromNullable(undefined, () => "empty") // Left("empty")
```

---

### tryCatch

```ts
tryCatch<E, T>(fn: () => T, onThrow: (err: unknown) => E): Either<E, T>
```

Safely execute a function that might throw. Catches exceptions and wraps them in Left.

```ts
tryCatch(() => JSON.parse('{"a":1}'), (err) => "parse failed")
// Right({ a: 1 })

tryCatch(() => JSON.parse('invalid'), (err) => "parse failed")
// Left("parse failed")
```

---

### fromOption

```ts
fromOption<E, T>(opt: Option<T>, onNone: () => E): Either<E, T>
```

Convert an Option to Either. Some becomes Right, None becomes Left with the provided error.

```ts
fromOption(some(42), () => "empty")  // Right(42)
fromOption(none(), () => "empty")    // Left("empty")
```

---

### map

```ts
map<U>(f: (value: T) => U): Either<E, U>
```

Transform the Right value. Left is passed through unchanged.

```ts
right(5).map(n => n * 2)      // Right(10)
left("error").map(n => n * 2) // Left("error")
```

---

### filterOrElse

```ts
filterOrElse(predicate: (value: T) => boolean, onLeft: () => E): Either<E, T>
```

Keep the Right value only if the predicate holds. Returns Left with the provided error otherwise.

```ts
right(5).filterOrElse(n => n > 3, () => "too small")  // Right(5)
right(2).filterOrElse(n => n > 3, () => "too small")  // Left("too small")
left("error").filterOrElse(n => n > 3, () => "too small") // Left("error")
```

---

### swap

```ts
swap(): Either<T, E>
```

Swap the Left and Right sides of the Either.

```ts
right(42).swap()      // Left(42)
left("error").swap()  // Right("error")
```

---

### flatMap

```ts
flatMap<EE, U>(f: (value: T) => Either<EE, U>): Either<E | EE, U>
```

Chain Either-returning operations. Short-circuits to Left if this Either is Left.

```ts
const safeDivide = (x: number, y: number) =>
  y === 0 ? left("Division by zero") : right(x / y);

right(10).flatMap(x => safeDivide(x, 2))  // Right(5)
right(10).flatMap(x => safeDivide(x, 0))  // Left("Division by zero")
left("error").flatMap(x => safeDivide(x, 2)) // Left("error")
```

---

### flatten

```ts
flatten(): Either<E | EE, U>  // where this is Either<E, Either<EE, U>>
```

Remove one level of nesting from a nested Either.

```ts
right(right(42)).flatten()             // Right(42)
right(left("inner error")).flatten()   // Left("inner error")
left("outer error").flatten()          // Left("outer error")
```

---

### orElse

```ts
orElse<EE>(fallback: (error: E) => Either<EE, T>): Either<E | EE, T>
```

Return this Either if Right, otherwise recover from the error with a fallback.

```ts
right(42).orElse((err) => right(0))      // Right(42)
left("error").orElse((err) => right(0))  // Right(0)
left("error").orElse((err) => left("still bad")) // Left("still bad")
```

---

### zip

```ts
zip<EE, A>(eitherA: Either<EE, A>): Either<E | EE, readonly [T, A]>
```

Combine two Eithers into a tuple. Returns the first Left if either is Left.

```ts
right("Alice").zip(right(30))       // Right(["Alice", 30])
right("Alice").zip(left("No age"))  // Left("No age")
left("No name").zip(right(30))      // Left("No name")
```

---

### ap

```ts
ap<EE, A, U>(this: Either<E, (a: A) => U>, arg: Either<EE, A>): Either<E | EE, U>
```

Apply a function wrapped in an Either to a value wrapped in an Either.

```ts
const add = (x: number) => (y: number) => x + y;
right(add(5)).ap(right(3))    // Right(8)
right(add(5)).ap(left("err")) // Left("err")
left("err").ap(right(3))      // Left("err")
```

---

### tap

```ts
tap(sideEffect: (value: T) => void): Either<E, T>
```

Run a side effect if Right. Returns the original Either unchanged.

```ts
right(42).tap(v => console.log("value:", v))  // Right(42), logs "value: 42"
left("error").tap(v => console.log("value:", v)) // Left("error"), no log
```

---

### match

```ts
match<U>(onLeft: (error: E) => U, onRight: (value: T) => U): U
```

Pattern match on the Either.

```ts
right(42).match(
  (err) => `Error: ${err}`,
  (val) => `Value: ${val}`
) // "Value: 42"

left("oops").match(
  (err) => `Error: ${err}`,
  (val) => `Value: ${val}`
) // "Error: oops"
```

---

### getOrElse

```ts
getOrElse(fallback: (error: E) => T): T
```

Extract the Right value, or return a fallback computed from the Left.

```ts
right(42).getOrElse(() => 0)      // 42
left("error").getOrElse(() => 0)  // 0
```

---

### toResult

```ts
toResult(): Result<E, T>
```

Convert Either to a plain `Result` object: `{ ok: true, value: T }` or `{ ok: false, error: E }`.

```ts
right(42).toResult()      // { ok: true, value: 42 }
left("error").toResult()  // { ok: false, error: "error" }
```

---

### map2

```ts
map2<EA, A, EB, B, C>(eitherA: Either<EA, A>, eitherB: Either<EB, B>, f: (a: A, b: B) => C): Either<EA | EB, C>
```

Combine two Eithers with a function. Returns the first Left if either is Left.

```ts
map2(right("John"), right("Doe"), (f, l) => `${f} ${l}`) // Right("John Doe")
map2(right("John"), left("missing"), (f, l) => `${f} ${l}`) // Left("missing")
```

---

### map3

```ts
map3<EA, A, EB, B, EC, C, D>(eitherA: Either<EA, A>, eitherB: Either<EB, B>, eitherC: Either<EC, C>, f: (a: A, b: B, c: C) => D): Either<EA | EB | EC, D>
```

Combine three Eithers with a function. Returns the first Left if any is Left.

```ts
map3(right(1), right(2), right(3), (a, b, c) => a + b + c) // Right(6)
```

---

### sequence

```ts
sequence<E, T>(eithers: Either<E, T>[]): Either<E, T[]>
```

Convert an array of Eithers to an Either of array. Returns the first Left if any element is Left.

```ts
sequence([right(1), right(2), right(3)]) // Right([1, 2, 3])
sequence([right(1), left("error")])      // Left("error")
```
