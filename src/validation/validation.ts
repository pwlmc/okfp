import type { Valid, ValidationResult, ValidationValue } from "./model.js";

export type Validation<E, T> = {
	/**
	 * Filters the Valid value based on a predicate function.
	 * If the predicate fails, returns Invalid with the provided error.
	 * If this Validation is already Invalid, returns the same Invalid unchanged.
	 *
	 * @param predicate - Function that tests the valid value
	 * @param onInvalid - Function that provides the error value when predicate fails
	 * @returns The same Validation if Invalid or predicate passes, otherwise Invalid with the provided error
	 *
	 * @example
	 * ```typescript
	 * const isPositive = (n: number) => n > 0;
	 * valid(5).filterOrElse(isPositive, () => "Must be positive")   // Valid(5)
	 * valid(-3).filterOrElse(isPositive, () => "Must be positive")  // Invalid(["Must be positive"])
	 * invalid("error").filterOrElse(isPositive, () => "Must be positive") // Invalid(["error"])
	 * ```
	 */
	filterOrElse: (
		predicate: (value: T) => boolean,
		onInvalid: () => E,
	) => Validation<E, T>;

	/**
	 * Transforms the valid value using a mapping function.
	 * If this Validation is Invalid, returns the same Invalid unchanged.
	 *
	 * @param mapper - Function to transform the contained value
	 * @returns New Validation containing the transformed value, or the same Invalid
	 */
	map: <U>(mapper: (value: T) => U) => Validation<E, U>;

	/**
	 * Applies a function wrapped in a Validation to a value wrapped in a Validation.
	 * Unlike Either, if both are Invalid, errors are accumulated (concatenated).
	 *
	 * @param arg - Validation containing the argument to apply the function to
	 * @returns Validation containing the result, or accumulated errors if any are Invalid
	 *
	 * @example
	 * ```typescript
	 * const add = (x: number) => (y: number) => x + y;
	 * valid(add(5)).ap(valid(3))         // Valid(8)
	 * valid(add(5)).ap(invalid("err"))   // Invalid(["err"])
	 * invalid("e1").ap(invalid("e2"))    // Invalid(["e1", "e2"]) ← errors accumulated!
	 * ```
	 */
	ap: <EE, A, U>(
		this: Validation<E, (a: A) => U>,
		arg: Validation<EE, A>,
	) => Validation<E | EE, U>;

	/**
	 * Combines this Validation with another Validation into a tuple.
	 * If both are Valid, returns Valid containing a tuple of both values.
	 * If either is Invalid, accumulates all errors.
	 *
	 * @param valA - The Validation to combine with this one
	 * @returns Validation containing a tuple of both values, or accumulated errors
	 *
	 * @example
	 * ```typescript
	 * valid("Alice").zip(valid(30))          // Valid(["Alice", 30])
	 * valid("Alice").zip(invalid("No age"))  // Invalid(["No age"])
	 * invalid("e1").zip(invalid("e2"))       // Invalid(["e1", "e2"])
	 * ```
	 */
	zip: <EE, A>(valA: Validation<EE, A>) => Validation<E | EE, readonly [T, A]>;

	/**
	 * Pattern matches on the Validation, executing different functions based on its state.
	 *
	 * @param onInvalid - Function to execute if Validation is Invalid, receives the array of errors
	 * @param onValid - Function to execute if Validation is Valid, receives the value
	 * @returns The result of the executed function
	 */
	match: <U>(
		onInvalid: (errors: readonly E[]) => U,
		onValid: (value: T) => U,
	) => U;

	/**
	 * Extracts the valid value, or returns a fallback value if Invalid.
	 *
	 * @param fallback - Function that receives the errors and returns a default value
	 * @returns The valid value if present, otherwise the result of the fallback function
	 */
	getOrElse: (fallback: (errors: readonly E[]) => T) => T;

	/**
	 * Performs a side effect if this Validation is Valid, returning the original Validation unchanged.
	 * If this Validation is Invalid, the side effect is not executed.
	 *
	 * @param sideEffect - Function to execute with the valid value (return value is ignored)
	 * @returns The same Validation instance unchanged
	 */
	tap: (sideEffect: (value: T) => void) => Validation<E, T>;

	/**
	 * Performs a side effect if this Validation is Invalid, returning the original Validation unchanged.
	 * If this Validation is Valid, the side effect is not executed.
	 *
	 * @param sideEffect - Function to execute with the errors array (return value is ignored)
	 * @returns The same Validation instance unchanged
	 */
	tapInvalid: (sideEffect: (errors: readonly E[]) => void) => Validation<E, T>;

	/**
	 * Converts the Validation to a ValidationResult type.
	 *
	 * @returns A ValidationResult object representing the Validation's state
	 *
	 * @example
	 * ```typescript
	 * valid(42).toResult()           // { ok: true, value: 42 }
	 * invalid("error").toResult()    // { ok: false, errors: ["error"] }
	 * ```
	 */
	toResult: () => ValidationResult<E, T>;
};

export function createValidation<E, T>(
	value: ValidationValue<E, T>,
): Validation<E, T> {
	const validation: Validation<E, T> = {
		filterOrElse: (predicate: (value: T) => boolean, onInvalid: () => E) =>
			validation.match(
				() => validation,
				(v) =>
					predicate(v)
						? validation
						: createValidation<E, T>({ invalid: [onInvalid()] }),
			),

		map: <U>(mapper: (value: T) => U): Validation<E, U> =>
			validation.match(
				() => forceCast<E, T, E, U>(validation),
				(v) => createValidation<E, U>({ valid: mapper(v) }),
			),

		ap: function <EE, A, U>(
			this: Validation<E, (a: A) => U>,
			arg: Validation<EE, A>,
		): Validation<E | EE, U> {
			return this.match(
				(errors1) =>
					arg.match(
						(errors2) =>
							createValidation<E | EE, U>({
								invalid: [...errors1, ...errors2],
							}),
						() =>
							createValidation<E | EE, U>({
								invalid: errors1 as readonly (E | EE)[],
							}),
					),
				(fn) =>
					arg.match(
						(errors2) =>
							createValidation<E | EE, U>({
								invalid: errors2 as readonly (E | EE)[],
							}),
						(v) => createValidation<E | EE, U>({ valid: fn(v) }),
					),
			);
		},

		zip: <EE, A>(valA: Validation<EE, A>) =>
			validation.map((value) => (a: A) => [value, a] as const).ap(valA),

		match: <U>(
			onInvalid: (errors: readonly E[]) => U,
			onValid: (value: T) => U,
		) => (isValid(value) ? onValid(value.valid) : onInvalid(value.invalid)),

		getOrElse: (fallback) =>
			validation.match(
				(errors) => fallback(errors),
				(v) => v,
			),

		tap: (sideEffect) => {
			validation.match(() => {}, sideEffect);
			return validation;
		},

		tapInvalid: (sideEffect) => {
			validation.match(sideEffect, () => {});
			return validation;
		},

		toResult: () =>
			validation.match<ValidationResult<E, T>>(
				(errors) => ({ ok: false, errors }),
				(value) => ({ ok: true, value }),
			),
	};

	return validation;
}

function isValid<E, T>(value: ValidationValue<E, T>): value is Valid<T> {
	return typeof value === "object" && "valid" in value;
}

function forceCast<E, T, EE, TT>(v: Validation<E, T>): Validation<EE, TT> {
	return v as unknown as Validation<EE, TT>;
}
