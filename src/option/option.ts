import { NONE, type OptionValue, type Some } from "./model.js";

export type Option<T> = {
	/**
	 * Filters the Option based on a predicate function.
	 * If this Option is Some and the predicate returns true, returns this Option.
	 * Otherwise, returns None.
	 *
	 * @param predicate - Function that tests the contained value
	 * @returns The same Option if predicate passes, None otherwise
	 *
	 * @example
	 * ```typescript
	 * some(5).filter(x => x > 3) // Some(5)
	 * some(2).filter(x => x > 3) // None
	 * none().filter(x => x > 3)  // None
	 * ```
	 */
	filter: (predicate: (value: T) => boolean) => Option<T>;

	/**
	 * Transforms the value inside the Option using a mapping function.
	 * If this Option is None, returns None without calling the mapper.
	 *
	 * @param mapper - Function to transform the contained value
	 * @returns New Option containing the transformed value, or None
	 *
	 * @example
	 * ```typescript
	 * some(5).map(x => x * 2)     // Some(10)
	 * none<number>().map(x => x * 2) // None
	 * ```
	 */
	map: <U>(mapper: (value: T) => U) => Option<U>;

	/**
	 * Returns this Option if it contains a value, otherwise returns the fallback Option.
	 * The fallback is lazily evaluated to avoid unnecessary computation.
	 *
	 * @param fallback - Function that provides the alternative Option
	 * @returns This Option if Some, otherwise the fallback Option
	 *
	 * @example
	 * ```typescript
	 * some(5).orElse(() => some(10))  // Some(5)
	 * none().orElse(() => some(10))   // Some(10)
	 * ```
	 */
	orElse: (fallback: () => Option<T>) => Option<T>;

	/**
	 * Applies a function wrapped in an Option to a value wrapped in an Option.
	 * This is useful for applying functions that are also optional.
	 *
	 * @param optA - Option containing the argument to apply the function to
	 * @returns Option containing the result, or None if either Option is None
	 *
	 * @example
	 * ```typescript
	 * const add = (x: number) => (y: number) => x + y;
	 * some(add(5)).ap(some(3)) // Some(8)
	 * some(add(5)).ap(none())  // None
	 * none().ap(some(3))       // None
	 * ```
	 */
	ap: <A, U>(this: Option<(arg: A) => U>, optA: Option<A>) => Option<U>;

	/**
	 * Combines this Option with another Option into a tuple.
	 * If both Options contain values, returns Some containing a tuple of both values.
	 * If either Option is None, returns None.
	 *
	 * @param optA - The Option to combine with this one
	 * @returns Option containing a tuple of both values, or None if either is None
	 *
	 * @example
	 * ```typescript
	 * const name = some("Alice");
	 * const age = some(30);
	 * name.zip(age) // Some(["Alice", 30])
	 *
	 * const missing = none<number>();
	 * name.zip(missing) // None
	 * none().zip(age)   // None
	 * ```
	 */
	zip: <A>(optA: Option<A>) => Option<readonly [T, A]>;

	/**
	 * Flattens a nested Option structure by removing one level of nesting.
	 * If this Option contains another Option, returns the inner Option.
	 * If this Option is None, returns None.
	 *
	 * @returns The inner Option if this Option contains one, or None
	 *
	 * @example
	 * ```typescript
	 * some(some(5)).flatten() // Some(5)
	 * some(none<number>()).flatten() // None
	 * ```
	 */
	flatten: <U>(this: Option<Option<U>>) => Option<U>;

	/**
	 * Chains Option-returning operations together (monadic bind).
	 * If this Option is Some, applies the mapper and returns the result.
	 * If this Option is None, returns None without calling the mapper.
	 *
	 * @param mapper - Function that returns an Option
	 * @returns The Option returned by mapper, or None
	 *
	 * @example
	 * ```typescript
	 * const safeDivide = (x: number) => x === 0 ? none() : some(10 / x);
	 * some(2).flatMap(safeDivide)  // Some(5)
	 * some(0).flatMap(safeDivide)  // None
	 * none().flatMap(safeDivide)   // None
	 * ```
	 */
	flatMap: <U>(mapper: (value: T) => Option<U>) => Option<U>;

	/**
	 * Performs a side effect if this Option contains a value.
	 * Returns the original Option unchanged.
	 *
	 * @returns The same Option instance
	 *
	 * @example
	 * ```typescript
	 * some(5).tap((value) => console.log("Has value", value)) // Some(5), logs message
	 * none().tap((value) => console.log("Has value", value))  // None, no log
	 * ```
	 */
	tap: (sideEffect: (value: T) => unknown) => Option<T>;

	/**
	 * Performs a side effect if this Option is None.
	 * Returns the original Option unchanged.
	 *
	 * @returns The same Option instance
	 *
	 * @example
	 * ```typescript
	 * some(5).tapNone(() => console.log("No value")) // Some(5), no log
	 * none().tapNone(() => console.log("No value"))  // None, logs message
	 * ```
	 */
	tapNone: (sideEffect: () => unknown) => Option<T>;

	/**
	 * Pattern matches on the Option, executing different functions based on its state.
	 *
	 * @param onNone - Function to execute if Option is None
	 * @param onSome - Function to execute if Option is Some
	 * @returns The result of the executed function
	 *
	 * @example
	 * ```typescript
	 * some(5).match(() => "empty", x => `value: ${x}`) // "value: 5"
	 * none().match(() => "empty", x => `value: ${x}`)  // "empty"
	 * ```
	 */
	match: <U>(onNone: () => U, onSome: (value: T) => U) => U;

	/**
	 * Extracts the value from the Option, or returns a fallback value if None.
	 *
	 * @param fallback - Function that provides the default value
	 * @returns The value or the fallback value
	 *
	 * @example
	 * ```typescript
	 * some(5).getOrElse(() => 0)  // 5
	 * none().getOrElse(() => 0)   // 0
	 * ```
	 */
	getOrElse: (fallback: () => T) => T;

	/**
	 * Converts the Option to a nullable value.
	 * Returns the contained value if Some, or null if None.
	 *
	 * @returns The value or null
	 *
	 * @example
	 * ```typescript
	 * some(5).toNullable()  // 5
	 * none().toNullable()   // null
	 * ```
	 */
	toNullable: () => T | null;

	/**
	 * Converts the Option to an array.
	 * If this Option contains a value, returns an array with that single value.
	 * If this Option is None, returns an empty array.
	 *
	 * @returns Array containing the value if Some, or empty array if None
	 *
	 * @example
	 * ```typescript
	 * some(42).toArray()    // [42]
	 * none().toArray()      // []
	 * ```
	 */
	toArray: () => readonly T[];
};

export function createOption<T>(optionValue: OptionValue<T>): Option<T> {
	const option: Option<T> = {
		filter: (predicate) =>
			option.flatMap((value) =>
				predicate(value) ? option : createOption(NONE),
			),

		map: (mapper) =>
			option.flatMap((value) => createOption({ some: mapper(value) })),

		orElse: (fallback) => option.match(fallback, () => option),

		ap: function <A, U>(
			this: Option<(arg: A) => U>,
			optA: Option<A>,
		): Option<U> {
			return this.flatMap((fn) =>
				optA.match(
					() => createOption(NONE),
					(arg) => createOption({ some: fn(arg) }),
				),
			);
		},

		zip: <A>(optA: Option<A>) =>
			option.map((value) => (a: A) => [value, a] as const).ap(optA),

		flatten: function <U>(this: Option<Option<U>>) {
			// biome-ignore lint/complexity/noFlatMapIdentity: flatMap here is the custom Option method, not Array.flatMap
			return this.flatMap((value) => value);
		},

		flatMap: <U>(mapper: (value: T) => Option<U>): Option<U> =>
			option.match(
				() => forceCast<T, U>(option),
				(value) => mapper(value),
			),

		tap: (sideEffect) => {
			option.match(() => {}, sideEffect);
			return option;
		},

		tapNone: (sideEffect) => {
			option.match(sideEffect, () => {});
			return option;
		},

		match: <U>(onNone: () => U, onSome: (value: T) => U) =>
			isSome(optionValue) ? onSome(optionValue.some) : onNone(),

		getOrElse: (fallback) => option.match(fallback, (value) => value),

		toNullable: () =>
			option.match(
				() => null,
				(value) => value,
			),

		toArray: () =>
			option.match(
				() => [],
				(val) => [val],
			),
	};

	return option;
}

function isSome<T>(option: OptionValue<T>): option is Some<T> {
	return typeof option === "object" && "some" in option;
}

function forceCast<T, U>(option: Option<T>): Option<U> {
	return option as unknown as Option<U>;
}
