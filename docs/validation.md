# Validation

::: warning Work in Progress
`Validation` is planned for release before `v1.0.0`. The API described here reflects the current design and may change.
:::

`Validation<E, T>` represents a computation that can succeed with a value (`Valid`) or fail with **accumulated** errors (`Invalid`).

- **`Valid<E, T>`** - success, carries a value of type `T`
- **`Invalid<E, T>`** - failure, carries one or more errors of type `E`

## How is it different from Either?

`Either` **short-circuits** on the first error - once a `Left` is encountered, subsequent operations are skipped.

`Validation` **accumulates** all errors, making it ideal for form validation, config parsing, or any scenario where you want to report every problem at once instead of one at a time.

```ts
import * as Either from "okfp/either";
import * as Validation from "okfp/validation";

// Either: stops at "Name is required"
Either.map2(
    Either.left("Name is required"), 
    Either.left("Age must be positive"), 
    (n, a) => ({ n, a })
);
// Left("Name is required")

// Validation: collects both errors
Validation.map2(
    Validation.invalid("Name is required"), 
    Validation.invalid("Age must be positive"), 
    (n, a) => ({ n, a })
);
// Invalid(["Name is required", "Age must be positive"])
```
