# Task

::: warning Work in Progress
`Task` is planned for release before `v1.0.0`. The API described here reflects the current design and may change.
:::

`Task<T>` represents a **lazy asynchronous computation** that always succeeds with a value of type `T`.

Think of it as a `() => Promise<T>` with a composable, functional interface.

## Why Task instead of Promise?

- **Lazy** - a Task does nothing until you call `.run()`. Promises are eager.
- **Composable** - chain, combine, and transform Tasks before executing.

```ts
import { type Task, task, fromPromise } from "okfp/task";

// A Promise runs immediately:
const eager = fetch("/api/users"); // request fires now

// A Task is just a description - nothing runs yet:
const lazy = fromPromise(() => fetch("/api/users"));
// only runs when you call: lazy.run()
```
