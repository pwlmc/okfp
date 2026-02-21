import { left, right } from "./constructors.js";
import { Either } from "./either.js";

/**
 * Combines two Eithers using a mapping function.
 * Returns the mapped result if both Eithers are Right, otherwise the first Left.
 *
 * @param eitherA - First Either to combine
 * @param eitherB - Second Either to combine
 * @param mapper - Function to combine both Right values
 * @returns Either containing the mapped result, or the first Left
 *
 * @example
 * ```typescript
 * map2(right("John"), right("Doe"), (first, last) => `${first} ${last}`)
 * // Right("John Doe")
 * ```
 */
export function map2<EA, A, EB, B, C>(
  eitherA: Either<EA, A>,
  eitherB: Either<EB, B>,
  mapper: (a: A, b: B) => C
) {
  return eitherA.map((a) => (b: B) => mapper(a, b)).ap(eitherB);
}

/**
 * Combines three Eithers using a mapping function.
 * Returns the mapped result if all Eithers are Right, otherwise the first Left.
 *
 * @param eitherA - First Either to combine
 * @param eitherB - Second Either to combine
 * @param eitherC - Third Either to combine
 * @param mapper - Function to combine all three Right values
 * @returns Either containing the mapped result, or the first Left
 *
 * @example
 * ```typescript
 * map3(right(1), right(2), right(3), (a, b, c) => a + b + c)
 * // Right(6)
 * ```
 */
export function map3<EA, A, EB, B, EC, C, D>(
  eitherA: Either<EA, A>,
  eitherB: Either<EB, B>,
  eitherC: Either<EC, C>,
  mapper: (a: A, b: B, c: C) => D
) {
  return eitherA
    .map((a) => (b: B) => (c: C) => mapper(a, b, c))
    .ap(eitherB)
    .ap(eitherC);
}

/**
 * Converts an array of Eithers into an Either of array.
 * Returns Right with all values if all Eithers are Right, otherwise the first Left.
 *
 * @param eithers - Array of Eithers to sequence
 * @returns Either containing array of all values, or the first Left
 *
 * @example
 * ```typescript
 * sequence([right(1), right(2), right(3)]) // Right([1, 2, 3])
 * sequence([right(1), left("error")])      // Left("error")
 * ```
 */
export function sequence<E, T>(eithers: Either<E, T>[]): Either<E, T[]> {
  const out: T[] = [];

  for (const either of eithers) {
    const result = either.toResult();
    if (!result.ok) {
      return left(result.error);
    }
    out.push(result.value);
  }

  return right(out);
}
