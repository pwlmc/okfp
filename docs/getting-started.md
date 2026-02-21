# Getting Started

Welcome to OKFP! This guide will help you get up and running with typed effects in TypeScript.

## Installation

Install OKFP with your package manager of choice:

::: code-group
```sh [npm]
$ npm install okfp
```

```sh [pnpm]
$ pnpm add okfp
```

```sh [yarn]
$ yarn add okfp
```
:::


## Your First Effect: Option

The simplest way to start is with `Option`, which represents a value that may or may not exist.

```ts
import { type Option, some, none } from "okfp/option";

type User = {
  id: string,
  name: string
}

const users: User[] = [{
  id: "a-001",
  name: "Alice"
}, { 
  id: "b-002",
  name: "Bob" 
}]

// A function that may not find a result
const getUserName = (id: string): Option<string> => {
  const user = users.find(u => u.id === id)
  return user ? some(user.name) : none();
};

// Chain operations safely
const greeting = getUserName('a-001')
  .map((name) => `Hello, ${name}!`)
  .getOrElse("User not found");

console.log(greeting); // "Hello, Alice!"
console.log(getUserName('xxx').getOrElse("User not found")); // "User not found"
```

::: tip Key takeaway
Instead of checking `if (user !== null)`, `Option` forces you to handle both cases explicitly.
:::

**Dive deeper into `Option`:** See the [Option guide](./option.md) for all available methods and advanced patterns

## Handling Errors: Either

When your operation can fail *with a reason*, use `Either`. It can be `Right` (success) or `Left` (error).

```ts
import { type Either, right, left } from "okfp";

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
    (age) => `Next year you'll be ${age}`
  );

console.log(result); // "Next year you'll be 26"
console.log(
  parseAge("abc").match(
    (error) => `Error: ${error}`,
    (age) => `Age: ${age}`
  )
); // "Error: Age must be a whole number"
```
::: tip Key takeaway
`Either` gives you both the success value and error information, making it ideal for error recovery.
:::

**Learn about `Either`:** Check the [Either guide](./either.md) for error handling strategies.



