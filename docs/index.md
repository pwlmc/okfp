<div style="text-align: center; padding: 2rem 0 6rem;">
  <h1 style="font-size: 3rem; font-weight: 700; color: var(--vp-c-brand-1); margin: 0 0 0.75rem; line-height: 1.1;">OK-FP</h1>
  <p style="font-size: 1.25rem; color: var(--vp-c-text-2); margin: 0;">Essential Effect Data Types for TypeScript</p>
</div>

# Getting Started

OK-FP is a small, focused functional programming toolkit for TypeScript. It provides composable, type-safe wrappers for optional values, errors, and async computations.

## Installation

Install OK-FP with your package manager of choice:

::: code-group

```sh [npm]
$ npm install ok-fp
```

```sh [pnpm]
$ pnpm add ok-fp
```

```sh [yarn]
$ yarn add ok-fp
```

:::

## Your First Effect: Option

The simplest way to start is with `Option`, which represents a value that may or may not exist.

```ts
import { type Option, some, none } from "ok-fp/option";

type User = {
  id: string;
  name: string;
};

const users: User[] = [
  {
    id: "a-001",
    name: "Alice",
  },
  {
    id: "b-002",
    name: "Bob",
  },
];

// A function that may not find a result
const getUserName = (id: string): Option<string> => {
  const user = users.find((u) => u.id === id);
  return user ? some(user.name) : none();
};

// Chain operations safely
const greeting = getUserName("a-001")
  .map((name) => `Hello, ${name}!`)
  .getOrElse(() => "User not found");

console.log(greeting); // "Hello, Alice!"
console.log(getUserName("xxx").getOrElse(() => "User not found")); // "User not found"
```

::: tip Key takeaway
Instead of checking `if (user !== null)`, `Option` forces you to handle both cases explicitly.
:::

**Dive deeper into `Option`:** See the [Option guide](./option.md) for all available methods and advanced patterns

## Handling Errors: Either

When your operation can fail _with a reason_, use `Either`. It can be `Right` (success) or `Left` (error).

```ts
import { type Either, right, left } from "ok-fp/either";

const parseAge = (input: string): Either<string, number> => {
  const age = Number(input);
  if (!Number.isInteger(age)) {
    return left("Age must be a whole number");
  }
  if (age < 0 || age > 150) {
    return left("Age must be between 0 and 150");
  }
  return right(age);
};

// Chain with custom error handling
const result = parseAge("25")
  .map((age) => age + 1)
  .match(
    (error) => `Error: ${error}`,
    (age) => `Next year you'll be ${age}`,
  );

console.log(result); // "Next year you'll be 26"
console.log(
  parseAge("abc").match(
    (error) => `Error: ${error}`,
    (age) => `Age: ${age}`,
  ),
); // "Error: Age must be a whole number"
```

::: tip Key takeaway
`Either` gives you both the success value and error information, making it ideal for error recovery.
:::

**Learn about `Either`:** Check the [Either guide](./either.md) for error handling strategies.

## Collecting All Errors: Validation

When you need to validate several **independent** fields and report every problem at once, use `Validation`. Unlike `Either`, it accumulates all errors instead of stopping at the first one.

```ts
import { valid, invalid, map3 } from "ok-fp/validation";

const validateName = (name: string) =>
  name.trim().length > 0 ? valid(name.trim()) : invalid("Name is required");

const validateEmail = (email: string) =>
  email.includes("@") ? valid(email) : invalid("Invalid email address");

const validateAge = (age: number) =>
  age >= 18 ? valid(age) : invalid("Must be at least 18");

const result = map3(
  validateName(""),
  validateEmail("not-an-email"),
  validateAge(16),
  (name, email, age) => ({ name, email, age }),
);

result.match(
  (errors) => console.error("Errors:", errors),
  // ["Name is required", "Invalid email address", "Must be at least 18"]
  (user) => console.log("Created user:", user),
);
```

::: tip Key takeaway
Use `Validation` when you want to show users **all** their mistakes at once — forms, config files, batch inputs. Use `Either` when each step depends on the previous one.
:::

**Learn about `Validation`:** See the [Validation guide](./validation.md) for the full API and a detailed comparison with `Either`.

## Async Computations: Task

When you need to work with async operations, use `Task`. It represents a **lazy** computation that runs only when you call `.run()` — unlike Promises, which execute immediately.

```ts
import { task, fromPromise, all } from "ok-fp/task";

const fetchUser = (id: string) =>
  fromPromise(() =>
    fetch(`/api/users/${id}`).then(
      (r) => r.json() as Promise<{ name: string }>,
    ),
  );

// Build the pipeline without executing anything yet
const greeting = fetchUser("a-001").map((user) => `Hello, ${user.name}!`);

// Nothing has run until here:
const message = await greeting.run(); // "Hello, Alice!"

// Run multiple Tasks concurrently
const [user1, user2] = await all([
  fetchUser("a-001"),
  fetchUser("b-002"),
]).run();
```

::: tip Key takeaway
`Task` lets you describe and compose async operations before executing them. Chain steps with `.flatMap()`, transform results with `.map()`, and run concurrent work with `all()`.
:::

**Dive deeper into `Task`:** See the [Task guide](./task.md) for all available methods and patterns.

## Fallible Async Computations: TaskEither

When your async operation can fail with a typed error, use `TaskEither`. It is a lazy `() => Promise<Either<E, T>>` — combining `Task`'s laziness with `Either`'s typed error handling.

```ts
import { tryCatch, taskEither, all } from "ok-fp/taskEither";

type User = { id: string; name: string };

const fetchUser = (id: string) =>
  tryCatch(
    () => fetch(`/api/users/${id}`).then((r) => r.json() as Promise<User>),
    (err) => `Fetch failed: ${err}`,
  );

// Chain two async steps — short-circuits on first error
const greeting = fetchUser("a-001")
  .map((user) => `Hello, ${user.name}!`);

const result = await greeting.run();
result.match(
  (err) => console.error(err),
  (msg) => console.log(msg), // "Hello, Alice!"
);

// Run multiple requests concurrently
const [user1, user2] = await all([fetchUser("a-001"), fetchUser("b-002")])
  .getOrElse(() => [])
  .run();
```

::: tip Key takeaway
`TaskEither` makes the error type visible in the signature and forces you to handle it. Use it for any async operation that can fail — API requests, file reads, database queries.
:::

**Dive deeper into `TaskEither`:** See the [TaskEither guide](./task-either.md) for all available methods and patterns.
