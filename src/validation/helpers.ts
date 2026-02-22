import { createValidation, type Validation } from "./validation.js";

/**
 * Combines two Validations using a mapping function.
 * If both are Valid, applies the mapper. If any are Invalid, accumulates all errors.
 *
 * @param valA - First Validation to combine
 * @param valB - Second Validation to combine
 * @param mapper - Function to combine both valid values
 * @returns Validation containing the mapped result, or all accumulated errors
 *
 * @example
 * ```typescript
 * map2(valid("John"), valid("Doe"), (first, last) => `${first} ${last}`)
 * // Valid("John Doe")
 * map2(invalid("e1"), invalid("e2"), mapper)
 * // Invalid(["e1", "e2"])
 * ```
 */
export function map2<EA, A, EB, B, C>(
	valA: Validation<EA, A>,
	valB: Validation<EB, B>,
	mapper: (a: A, b: B) => C,
) {
	return valA.map((a) => (b: B) => mapper(a, b)).ap(valB);
}

/**
 * Combines three Validations using a mapping function.
 * If all are Valid, applies the mapper. If any are Invalid, accumulates all errors.
 *
 * @param valA - First Validation to combine
 * @param valB - Second Validation to combine
 * @param valC - Third Validation to combine
 * @param mapper - Function to combine all three valid values
 * @returns Validation containing the mapped result, or all accumulated errors
 *
 * @example
 * ```typescript
 * map3(valid(1), valid(2), valid(3), (a, b, c) => a + b + c)
 * // Valid(6)
 * map3(invalid("e1"), valid(2), invalid("e3"), mapper)
 * // Invalid(["e1", "e3"])
 * ```
 */
export function map3<EA, A, EB, B, EC, C, D>(
	valA: Validation<EA, A>,
	valB: Validation<EB, B>,
	valC: Validation<EC, C>,
	mapper: (a: A, b: B, c: C) => D,
) {
	return valA
		.map((a) => (b: B) => (c: C) => mapper(a, b, c))
		.ap(valB)
		.ap(valC);
}

/**
 * Converts an array of Validations into a Validation of array.
 * Returns Valid with all values if all Validations are Valid, otherwise accumulates all errors.
 *
 * @param validations - Array of Validations to sequence
 * @returns Validation containing array of all values, or all accumulated errors
 *
 * @example
 * ```typescript
 * sequence([valid(1), valid(2), valid(3)]) // Valid([1, 2, 3])
 * sequence([valid(1), invalid("e1"), invalid("e2")]) // Invalid(["e1", "e2"])
 * ```
 */
export function sequence<E, T>(
	validations: readonly Validation<E, T>[],
): Validation<E, T[]> {
	const errors: E[] = [];
	const values: T[] = [];

	for (const v of validations) {
		v.match(
			(errs) => errors.push(...errs),
			(value) => values.push(value),
		);
	}

	return errors.length > 0
		? createValidation({ invalid: errors })
		: createValidation({ valid: values });
}
