import type { EitherResult, EitherValue, Left } from "./model.js";

export type Either<E, T> = {
	/**
	 * Filters the Either based on a predicate function applied to the Right value.
	 *
	 * @param predicate - Function that tests the Right value
	 * @param onLeft - Function that provides the error value when predicate fails
	 * @returns The same Either if Left or predicate passes, otherwise Left with the provided error
	 *
	 * @example
	 * ```typescript
	 * const isPositive = (n: number) => n > 0;
	 * right(5).filterOrElse(isPositive, () => "Must be positive")  // Right(5)
	 * right(-3).filterOrElse(isPositive, () => "Must be positive") // Left("Must be positive")
	 * left("error").filterOrElse(isPositive, () => "Must be positive") // Left("error")
	 * ```
	 */
	filterOrElse: (
		predicate: (right: T) => boolean,
		onLeft: () => E,
	) => Either<E, T>;

	/**
	 * Transforms the Right value using a mapping function.
	 *
	 * @typeParam U - The type of the transformed value
	 * @param mapper - Function to transform the Right value
	 * @returns New Either with the transformed Right value, or the same Left if error
	 *
	 * @example
	 * ```typescript
	 * right(5).map(x => x * 2)        // Right(10)
	 * left("error").map(x => x * 2)   // Left("error")
	 * ```
	 */
	map: <U>(mapper: (right: T) => U) => Either<E, U>;

	/**
	 * Returns this Either if it's Right, otherwise returns the result of the fallback function.
	 *
	 * @typeParam EE - The type of the error in the fallback Either
	 * @param fallback - Function that takes the Left value and returns an alternative Either
	 * @returns This Either if Right, otherwise the Either returned by the fallback function
	 *
	 * @example
	 * ```typescript
	 * right(42).orElse((err) => right(0))           // Right(42)
	 * left("error").orElse((err) => right(0))       // Right(0)
	 * ```
	 */
	orElse: <EE>(fallback: (left: E) => Either<EE, T>) => Either<E | EE, T>;

	/**
	 * Applies a function wrapped in an Either to a value wrapped in an Either.
	 *
	 * @typeParam A - The type of the argument value
	 * @typeParam U - The type of the function's return value
	 * @param arg - Either containing the argument to apply the function to
	 * @returns Either containing the function result, or the first Left if any Either is Left
	 *
	 * @example
	 * ```typescript
	 * const add = (x: number) => (y: number) => x + y;
	 * right(add(5)).ap(right(3))     // Right(8)
	 * right(add(5)).ap(left("err"))  // Left("err")
	 * left("err").ap(right(3))       // Left("err")
	 * ```
	 */
	ap: <EE, A, U>(
		this: Either<E, (a: A) => U>,
		arg: Either<EE, A>,
	) => Either<E | EE, U>;

	/**
	 * Swaps the Left and Right sides of the Either.
	 *
	 * @returns Either with Left and Right sides swapped
	 *
	 * @example
	 * ```typescript
	 * right(42).swap()        // Left(42)
	 * left("error").swap()    // Right("error")
	 * ```
	 */
	swap: () => Either<T, E>;

	/**
	 * Combines this Either with another Either into a tuple.
	 *
	 * @typeParam EE - Left type of the Either to combine with
	 * @typeParam A - Right type of the Either to combine with
	 * @param eitherA - The Either to combine with this one
	 * @returns Either containing a tuple of both Right values, or the first Left if any Either is Left
	 *
	 * @example
	 * ```typescript
	 * right("Alice").zip(right(30))        // Right(["Alice", 30])
	 * right("Alice").zip(left("No age"))   // Left("No age")
	 * left("No name").zip(right(30))       // Left("No name")
	 * ```
	 */
	zip: <EE, A>(eitherA: Either<EE, A>) => Either<E | EE, readonly [T, A]>;

	/**
	 * Flattens a nested Either structure by removing one level of nesting.
	 *
	 * @typeParam EE - Left type of the inner Either
	 * @typeParam U - Right type of the inner Either
	 * @returns The inner Either if this Either is Right, otherwise this Either unchanged
	 *
	 * @example
	 * ```typescript
	 * right(right(42)).flatten() // Right(42)
	 * right(left("inner error")).flatten() // Left("inner error")
	 *
	 * ```
	 */
	flatten: <EE, U>(this: Either<E, Either<EE, U>>) => Either<E | EE, U>;

	/**
	 * Chains Either-returning operations together (monadic bind).
	 *
	 * @typeParam EE - The error type of the Either returned by the mapper
	 * @typeParam U - The success type of the Either returned by the mapper
	 * @param mapper - Function that takes a Right value and returns an Either
	 * @returns The Either returned by mapper if this Either is Right, otherwise this Either unchanged
	 *
	 * @example
	 * ```typescript
	 * const safeDivide = (x: number, y: number) =>
	 *   y === 0 ? left("Division by zero") : right(x / y);
	 *
	 * right(10).flatMap(x => safeDivide(x, 2))  // Right(5)
	 * right(10).flatMap(x => safeDivide(x, 0))  // Left("Division by zero")
	 * left("error").flatMap(x => safeDivide(x, 2)) // Left("error") - mapper not called
	 * ```
	 */
	flatMap: <EE, U>(mapper: (right: T) => Either<EE, U>) => Either<E | EE, U>;

	/**
	 * Performs a side effect if this Either is Right, returning the original Either unchanged.
	 * If this Either is Left, the side effect is not executed and the Either is returned as-is.
	 *
	 * @param sideEffect - Function to execute with the Right value (return value is ignored)
	 * @returns The same Either instance unchanged
	 *
	 * @example
	 * ```typescript
	 * right(42)
	 *   .tap(value => console.log(`Got value: ${value}`)) // Logs: "Got value: 42"
	 * left("error")
	 *   .tap(value => console.log(`Got value: ${value}`)) // No log output
	 *
	 * ```
	 */
	tap: (sideEffect: (right: T) => void) => Either<E, T>;

	/**
	 * Pattern matches on the Either, executing different functions based on its state.
	 *
	 * @typeParam U - The return type of both matcher functions
	 * @param onLeft - Function to execute if Either is Left, receives the Left value
	 * @param onRight - Function to execute if Either is Right, receives the Right value
	 * @returns The result of the executed function
	 *
	 * @example
	 * ```typescript
	 * right(42).match(
	 *   (err) => `Error: ${err}`,
	 *   (val) => `Value: ${val}`
	 * ) // "Value: 42"
	 *
	 * left("Not a number").match(
	 *   (err) => `Error: ${err}`,
	 *   (val) => `Value: ${val}`
	 * ) // "Error: Not a number"
	 * ```
	 */
	match: <U>(onLeft: (left: E) => U, onRight: (right: T) => U) => U;

	/**
	 * Extracts the Right value from the Either, or returns a fallback value if Left.
	 *
	 * @param fallback - Function that takes the Left value and returns a default value of type T
	 * @returns The Right value if present, otherwise the result of the fallback function
	 *
	 * @example
	 * ```typescript
	 * right(42).getOrElse((err) => 0)           // 42
	 * left("error").getOrElse((err) => 0)       // 0
	 * ```
	 */
	getOrElse: (fallback: (left: E) => T) => T;

	/**
	 * Converts the Either to a Result type, which is an object with `ok` and `error` or `value` properties.
	 *
	 * @returns A Result object representing the Either's state
	 *
	 * @example
	 * ```typescript
	 * const result = right(42).toResult();
	 * console.log(result.ok); // true
	 * console.log(result.value); // 42
	 *
	 * const errorResult = left("error").toResult();
	 * console.log(errorResult.ok); // false
	 * console.log(errorResult.error); // "error"
	 * ```
	 */
	toResult: () => EitherResult<E, T>;
};

export function createEither<E, T>(value: EitherValue<E, T>): Either<E, T> {
	const either: Either<E, T> = {
		filterOrElse: (predicate: (right: T) => boolean, onLeft: () => E) =>
			either.flatMap((right) =>
				predicate(right) ? either : createEither({ left: onLeft() }),
			),

		map: <U>(mapper: (right: T) => U): Either<E, U> =>
			either.flatMap((right) => createEither({ right: mapper(right) })),

		orElse: <EE>(fallback: (left: E) => Either<EE, T>) =>
			either.match(
				(left) => forceCast<EE, T, E | EE, T>(fallback(left)),
				() => forceCast<E, T, E | EE, T>(either),
			),

		ap: function <EE, A, U>(this: Either<E, (a: A) => U>, arg: Either<EE, A>) {
			return this.flatMap((fn) => arg.map((right) => fn(right)));
		},

		swap: () =>
			either.match(
				(left) => createEither<T, E>({ right: left }),
				(right) => createEither<T, E>({ left: right }),
			),

		zip: <EE, A>(eitherA: Either<EE, A>) =>
			either.map((value) => (a: A) => [value, a] as const).ap(eitherA),

		flatten: function <EE, U>(this: Either<E, Either<EE, U>>) {
			// biome-ignore lint/complexity/noFlatMapIdentity: flatMap here is the custom Either method, not Array.flatMap
			return this.flatMap((value) => value);
		},

		flatMap: <EE, U>(mapper: (right: T) => Either<EE, U>) =>
			either.match(
				() => forceCast<E, T, E | EE, U>(either),
				(right) => forceCast<EE, U, EE | E, U>(mapper(right)),
			),

		tap: (sideEffect) => {
			either.match(() => {}, sideEffect);
			return either;
		},

		match: <U>(onLeft: (left: E) => U, onRight: (right: T) => U) =>
			isLeft(value) ? onLeft(value.left) : onRight(value.right),

		getOrElse: (fallback) =>
			either.match(
				(error) => fallback(error),
				(value) => value,
			),

		toResult: () =>
			either.match<EitherResult<E, T>>(
				(error) => ({
					ok: false,
					error,
				}),
				(value) => ({
					ok: true,
					value,
				}),
			),
	};

	return either;
}

function isLeft<E, T>(value: EitherValue<E, T>): value is Left<E> {
	return typeof value === "object" && "left" in value;
}

function forceCast<E, T, EE, TT>(either: Either<E, T>) {
	return either as unknown as Either<EE, TT>;
}
