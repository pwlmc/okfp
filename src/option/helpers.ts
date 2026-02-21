import { some, none } from "./constructors.js";
import { Option } from "./option.js";

/**
 * Combines two Options using a mapping function.
 * Only applies the mapper if both Options contain values.
 *
 * @param optA - First Option to combine
 * @param optB - Second Option to combine
 * @param mapper - Function that combines both values
 * @returns Option containing the combined result, or None if either Option is None
 *
 * @example
 * ```typescript
 * const greet = (first, last) => `Hi ${first} ${last}!`
 * map2(some("John"), some("Doe"), greet) // Some("John Doe")
 * map2(some("John"), none<string>(), greet) // None
 * ```
 */
export function map2<A, B, C>(
  optA: Option<A>,
  optB: Option<B>,
  mapper: (a: A, b: B) => C
) {
  return optA.map((a) => (b: B) => mapper(a, b)).ap(optB);
}

/**
 * Combines three Options using a mapping function.
 * Only applies the mapper if all three Options contain values.
 *
 * @param optA - First Option to combine
 * @param optB - Second Option to combine
 * @param optC - Third Option to combine
 * @param mapper - Function that combines all three values
 * @returns Option containing the combined result, or None if any Option is None
 *
 * @example
 * ```typescript
 * const toDateString = (d, m, y) => `${d}/${m}/${y}`
 * map3(some(15), some(6), some(2023), toDateString) // Some("15/6/2023")
 * map3(some(15), some(6), none<number>(), toDateString) // None
 * ```
 */
export function map3<A, B, C, D>(
  optA: Option<A>,
  optB: Option<B>,
  optC: Option<C>,
  mapper: (a: A, b: B, c: C) => D
) {
  return optA
    .map((a) => (b: B) => (c: C) => mapper(a, b, c))
    .ap(optB)
    .ap(optC);
}

/**
 * Converts an array of Options into an Option of array.
 * If all Options in the array contain values, returns Some containing an array of all values.
 * If any Option in the array is None, returns None.
 *
 * @param opts - Array of Options to sequence
 * @returns Some containing array of all values if all Options are Some, otherwise None
 *
 * @example
 * ```typescript
 * sequence([some(1), some(2), some(3)]) // Some([1, 2, 3])
 * sequence([some(1), none(), some(3)]) // None
 * ```
 */
export function sequence<T>(opts: Option<T>[]): Option<T[]> {
  const out: T[] = [];

  for (const opt of opts) {
    const [value] = opt.toArray();
    if (!value) {
      return none<T[]>();
    }
    out.push(value);
  }

  return some(out);
}
