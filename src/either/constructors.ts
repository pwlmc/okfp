import { type Option } from "../option.js";
import { createEither, Either } from "./either.js";

/**
 * Creates an Either containing an error value (Left).
 *
 * @typeParam E - The type of the error value
 * @typeParam T - The type of the success value (defaults to never since this is an error)
 * @param left - The error value to wrap
 * @returns Either containing the error value on the Left side
 *
 * @example
 * ```typescript
 * const error = left("Something went wrong"); // Either<string, never>
 * ```
 */
export function left<E, T = never>(left: E): Either<E, T> {
  return createEither({ left });
}

/**
 * Creates an Either containing a success value (Right).
 *
 * @typeParam T - The type of the success value
 * @typeParam E - The type of the error value (defaults to never since this is a success)
 * @param right - The success value to wrap
 * @returns Either containing the success value on the Right side
 *
 * @example
 * ```typescript
 * const success = right(42); // Either<never, number>
 * ```
 */
export function right<T, E = never>(right: T): Either<E, T> {
  return createEither({ right });
}

/**
 * Creates an Either from a potentially nullable value.
 * If the value is null or undefined, creates a Left with the provided error.
 * If the value is present, creates a Right with the value.
 *
 * @typeParam E - The type of the error value
 * @typeParam T - The type of the success value
 * @param nullable - The potentially null/undefined value
 * @param onNullish - Function that provides the error value when nullable is null/undefined
 * @returns Either containing the value if present, or the error if null/undefined
 *
 * @example
 * ```typescript
 * fromNullable("hello", () => "empty") // Right("hello")
 * fromNullable(null, () => "empty")    // Left("empty")
 * fromNullable(undefined, () => "empty") // Left("empty")
 * ```
 */
export function fromNullable<E, T>(
  nullable: T | null | undefined,
  onNullish: () => E
): Either<E, T> {
  return nullable != null ? right<T, E>(nullable) : left<E, T>(onNullish());
}

/**
 * Safely executes a function that might throw, converting exceptions to Either.
 *
 * @typeParam E - The type of the processed error value
 * @typeParam T - The type of the success value
 * @param fn - The function to execute that might throw
 * @param onThrow - Function that processes the caught error into the desired error type
 * @returns Either containing the result if successful, or the processed error if thrown
 *
 * @example
 * ```typescript
 * const parseNumber = (str: string) =>
 *   tryCatch(
 *     () => JSON.parse(str),
 *     (err) => `Parse error: ${err.message}`
 *   );
 *
 * parseNumber("42")     // Right(42)
 * parseNumber("invalid") // Left("Parse error: ...")
 * ```
 */
export function tryCatch<E, T>(
  fn: () => T,
  onThrow: (err: unknown) => E
): Either<E, T> {
  try {
    return right(fn());
  } catch (err) {
    return left(onThrow(err));
  }
}

/**
 * Creates an Either from an Option by providing an error value for the None case.
 *
 * @typeParam E - The type of the error value
 * @typeParam T - The type of the success value
 * @param opt - The Option to convert
 * @param onNone - Function that provides the error value when Option is None
 * @returns Either containing the Option's value if Some, or the error if None
 *
 * @example
 * ```typescript
 * fromOption(some(42), () => "empty")   // Right(42)
 * fromOption(none(), () => "empty")     // Left("empty")
 * ```
 */
export function fromOption<E, T>(
  opt: Option<T>,
  onNone: () => E
): Either<E, T> {
  return opt.match(
    () => left<E, T>(onNone()),
    (value) => right<T, E>(value)
  );
}
