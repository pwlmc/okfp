# Either

`Either` represents a computation that can succeed with a value (`right`) or fail with a typed error (`left`).

```ts
import { type Either, right, left } from "okfp/either";

const parsePositive = (input: string): Either<string, number> => {
  const n = Number(input);
  if (!Number.isFinite(n)) return left("Not a number");
  if (n <= 0) return left("Must be positive");
  return right(n);
};

const result = parsePositive("4");
// Either.right(4)

const failed = parsePositive("-1");
// Either.left("Must be positive")
```