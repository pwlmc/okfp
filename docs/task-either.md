# TaskEither

::: warning Work in Progress
`TaskEither` is planned for release before `v1.0.0`. The API described here reflects the current design and may change.
:::

`TaskEither<E, T>` represents a **lazy asynchronous computation** that can succeed with a value of type `T` or fail with an error of type `E`.

It combines the laziness of `Task` with the error handling of `Either` - think of it as a `() => Promise<Either<E, T>>`.

## Why TaskEither?

Most real-world async operations can fail: API calls, file reads, database queries. `TaskEither` lets you:

- **Compose** fallible async operations with `flatMap`
- **Handle errors** in a type-safe way - the error type `E` is always visible
- **Stay lazy** - nothing executes until you call `.run()`

```ts
import { type TaskEither } from "okfp/taskEither";

// A plain Promise hides what can go wrong:
async function unsafeFetch(url: string): Promise<User> { /* ... */ }

// TaskEither makes it explicit:
function safeFetch(url: string): TaskEither<HttpError, User> { /* ... */ }
```