# Option

`Option<T>` represents a value that may or may not exist. It is a type-safe alternative to `null`, `undefined`, or optional chaining.

- **`Some<T>`** - a value of type `T` is present
- **`None<T>`** - no value is present (absence)

## Why Option?

Nullable values (`null`, `undefined`) are a common source of runtime errors. They're easy to forget, hard to track, and their meaning is often ambiguous - does `null` mean "not found", "not loaded yet", or "explicitly empty"?

`Option` makes absence **explicit and type-safe**. You can't accidentally use a missing value - the compiler forces you to handle both cases.

```ts
import { type Option, some, none } from "okfp/option";

// Without Option: null is ambiguous and easy to forget
function unsafeGet(id: string): User | null { /* ... */ }
const user = unsafeGet("123");
console.log(user.name); // 💥 runtime error if null

// With Option: you must handle absence
function safeGet(id: string): Option<User> { /* ... */ }
safeGet("123").match(
  () => console.log("User not found"),
  (user) => console.log(user.name)
);
```

## Basic Usage

### Creating an Option

```ts
import { some, none, fromNullable } from "okfp/option";

const hasValue = some(42);  // Some(42)
const empty = none();       // None
const fromNull = fromNullable(null); // None
const fromValue = fromNullable("hello"); // Some("hello")
```

### Transforming and Chaining

```ts
import { type Option, some, none } from "okfp/option";

const parseNumber = (input: string): Option<number> => {
  const n = Number(input);
  return Number.isFinite(n) ? some(n) : none();
};

const positive = (n: number): Option<number> => (n > 0 ? some(n) : none());

const reciprocal = (n: number): Option<number> => some(1 / n);

const compute = (input: string): Option<number> =>
  parseNumber(input)
    .flatMap(positive)
    .flatMap(reciprocal)
    .map((n) => n * 100);

compute("4");   // Some(25)
compute("0");   // None (fails positive)
compute("-3");  // None (fails positive)
compute("abc"); // None (fails parsing)
```

### Extracting the Value

```ts
import { type Option, some, none } from "okfp/option";

const x: Option<number> = some(42);
x.getOrElse(() => 0); // 42

const y: Option<number> = none();
y.getOrElse(() => 0); // 0

// Pattern matching
const result = x.match(
  () => "no value",   // None case
  (val) => `value: ${val}` // Some case
);
// result = "value: 42"
```

---

## API Reference

### some

```ts
some<T>(value: T): Option<T>
```

Create an Option containing a value.

```ts
some(42) // Some(42)
some("hello") // Some("hello")
```
---

### none

```ts
none<T>(): Option<T>
```

Create an Option representing absence.

```ts
none() // None
none<number>() // None (typed)
```
---

### fromNullable

```ts
fromNullable<T>(value: T | null | undefined): Option<T>
```

Convert a nullable value to Option. Returns `Some` if the value is not `null`/`undefined`, otherwise `None`.

```ts
fromNullable(42)        // Some(42)
fromNullable(null)      // None
fromNullable(undefined) // None
```

---

### fromEither

```ts
fromEither<L, R>(either: Either<L, R>): Option<R>
```

Convert an Either to an Option. Right becomes Some, Left becomes None.

```ts
fromEither(right(42))          // Some(42)
fromEither(left("error"))      // None
```

---

### map

```ts
map<U>(f: (value: T) => U): Option<U>
```

Transform the value if present. Returns None if the Option is None.

```ts
some(5).map(n => n * 2)     // Some(10)
none<number>().map(n => n * 2) // None
```

---

### filter

```ts
filter(predicate: (value: T) => boolean): Option<T>
```

Keep the value only if the predicate holds. Returns None otherwise.

```ts
some(5).filter(n => n > 3) // Some(5)
some(2).filter(n => n > 3) // None
```

---

### flatMap

```ts
flatMap<U>(f: (value: T) => Option<U>): Option<U>
```

Chain Option-returning operations. Short-circuits to None if this Option is None.

```ts
const safeDivide = (x: number) => x === 0 ? none() : some(10 / x);
some(2).flatMap(safeDivide)  // Some(5)
some(0).flatMap(safeDivide)  // None
none().flatMap(safeDivide)   // None
```

---

### flatten

```ts
flatten(): Option<U>  // where this is Option<Option<U>>
```

Remove one level of nesting from a nested Option.

```ts
some(some(5)).flatten()        // Some(5)
some(none<number>()).flatten() // None
```

---

### orElse

```ts
orElse(fallback: () => Option<T>): Option<T>
```

Return this Option if it contains a value, otherwise return the fallback. The fallback is lazily evaluated.

```ts
some(5).orElse(() => some(10))  // Some(5)
none().orElse(() => some(10))   // Some(10)
```

---

### zip

```ts
zip<A>(optA: Option<A>): Option<readonly [T, A]>
```

Combine two Options into a tuple. Returns None if either is None.

```ts
some("Alice").zip(some(30)) // Some(["Alice", 30])
some("Alice").zip(none())   // None
```

---

### ap

```ts
ap<A, U>(this: Option<(arg: A) => U>, optA: Option<A>): Option<U>
```

Apply a function wrapped in an Option to a value wrapped in an Option.

```ts
const add = (x: number) => (y: number) => x + y;
some(add(5)).ap(some(3)) // Some(8)
some(add(5)).ap(none())  // None
```

---

### tap

```ts
tap(sideEffect: (value: T) => unknown): Option<T>
```

Run a side effect if Some. Returns the original Option unchanged.

```ts
some(5).tap(v => console.log("value:", v)) // Some(5), logs "value: 5"
none().tap(v => console.log("value:", v))  // None, no log
```

---

### tapNone

```ts
tapNone(sideEffect: () => unknown): Option<T>
```

Run a side effect if None. Returns the original Option unchanged.

```ts
some(5).tapNone(() => console.log("empty")) // Some(5), no log
none().tapNone(() => console.log("empty"))  // None, logs "empty"
```

---

### match

```ts
match<U>(onNone: () => U, onSome: (value: T) => U): U
```

Pattern match on the Option.

```ts
some(5).match(() => "empty", x => `value: ${x}`) // "value: 5"
none().match(() => "empty", x => `value: ${x}`)  // "empty"
```

---

### getOrElse

```ts
getOrElse(fallback: () => T): T
```

Extract the value, or return a fallback if None. The fallback is lazily evaluated.

```ts
some(5).getOrElse(() => 0)  // 5
none().getOrElse(() => 0)   // 0
```

---

### toNullable

```ts
toNullable(): T | null
```

Convert the Option to a nullable value. Returns the value if Some, `null` if None.

```ts
some(5).toNullable()  // 5
none().toNullable()   // null
```

---

### toArray

```ts
toArray(): readonly T[]
```

Convert the Option to an array. Returns a single-element array if Some, empty array if None.

```ts
some(42).toArray() // [42]
none().toArray()   // []
```

---

### map2

```ts
map2<A, B, C>(optA: Option<A>, optB: Option<B>, f: (a: A, b: B) => C): Option<C>
```

Combine two Options with a function. Returns None if either is None.

```ts
map2(some("John"), some("Doe"), (f, l) => `${f} ${l}`) // Some("John Doe")
map2(some("John"), none(), (f, l) => `${f} ${l}`)      // None
```

---

### map3

```ts
map3<A, B, C, D>(optA: Option<A>, optB: Option<B>, optC: Option<C>, f: (a: A, b: B, c: C) => D): Option<D>
```

Combine three Options with a function. Returns None if any is None.

```ts
map3(some(1), some(2), some(3), (a, b, c) => a + b + c) // Some(6)
```

---

### sequence

```ts
sequence<T>(opts: Option<T>[]): Option<T[]>
```

Convert an array of Options to an Option of array. Returns None if any element is None.

```ts
sequence([some(1), some(2), some(3)]) // Some([1, 2, 3])
sequence([some(1), none(), some(3)])  // None
```