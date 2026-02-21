import { type Either } from "../either.js";
import { NONE } from "./model.js";
import { Option, createOption } from "./option.js";

/**
 * Creates an {@link Option} that contains a value.
 *
 * Use this to wrap an existing value into an `Option<T>` representing presence
 * (as opposed to `none`, which represents absence).
 *
 * @typeParam T - Type of the wrapped value.
 * @param some - The value to store in the option.
 * @returns An {@link Option} containing the provided value.
 */
export function some<T>(some: T): Option<T> {
  return createOption({ some });
}

/**
 * Creates an {@link Option} representing the absence of a value.
 *
 * @typeParam T - The type of the value that would be contained if present.
 * @returns An {@link Option} in the `None` state.
 *
 * @example
 * ```ts
 * const value = none<number>();
 * ```
 */
export function none<T>(): Option<T> {
  return createOption<T>(NONE);
}

/**
 * Creates an {@link Option} from a nullable value.
 *
 * If {@link nullable} is `null` or `undefined`, returns {@link none}.
 * Otherwise, wraps the provided value in {@link some}.
 *
 * @example
 * fromNullable(0).getOrElse(() => 123); // 0
 * fromNullable(null).toNullable(); // null
 *
 * @typeParam T - The non-null value type to wrap.
 * @param nullable - A value that may be `null` or `undefined`.
 * @returns An {@link Option} that is `Some` when the value is present, otherwise `None`.
 */
export function fromNullable<T>(nullable: null | undefined | T): Option<T> {
  return nullable == null ? none() : some<T>(nullable);
}

/**
 * Creates an {@link Option} from an {@link Either} by extracting the Right value.
 *
 * If the Either is Right, returns Some containing the Right value.
 * If the Either is Left, returns None (discarding the Left value).
 *
 * @typeParam L - The type of the Left value (error type) that will be discarded
 * @typeParam R - The type of the Right value that will be preserved in the Option
 * @param either - The Either to convert to an Option
 * @returns Some containing the Right value, or None if the Either was Left
 *
 * @example
 * ```typescript
 * const success = right(42);
 * fromEither(success) // Some(42)
 *
 * const failure = left("error message");
 * fromEither(failure) // None
 * ```
 */
export function fromEither<L, R>(either: Either<L, R>): Option<R> {
  return either.match(
    () => none<R>(),
    (right) => some(right)
  );
}
