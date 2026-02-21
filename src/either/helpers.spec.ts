import { describe, it, expect, vi } from "vitest";
import { map2, map3, sequence } from "./helpers.js";
import { left, right } from "./constructors.js";

describe("either helpers", () => {
  describe("map2", () => {
    it("should map right values", () => {
      const a = right(2);
      const b = right(3);
      const c = map2(a, b, (a, b) => a * b);
      expect(c.toResult()).toEqual(right(6).toResult());
    });

    it("should not call the mapper and return left when one of the values is left", () => {
      const mapper = vi.fn();
      const error = new Error("test error");
      for (const eithers of [
        [left<Error, number>(error), right<number, Error>(3)],
        [right<number, Error>(2), left<Error, number>(error)],
      ]) {
        const [a, b] = eithers;
        const c = map2(a!, b!, mapper);
        expect(c.toResult()).toEqual(left(error).toResult());
        expect(mapper).not.toBeCalled();
      }
    });
  });

  describe("map3", () => {
    it("should map right values", () => {
      const a = right(2);
      const b = right(3);
      const c = right(4);
      const d = map3(a, b, c, (a, b, c) => a * b * c);
      expect(d.toResult()).toEqual(right(24).toResult());
    });

    it("should not call the mapper and return left when one of the values is left", () => {
      const mapper = vi.fn();
      const error = new Error("test error");
      for (const eithers of [
        [
          left<Error, number>(error),
          right<number, Error>(3),
          right<number, Error>(4),
        ],
        [
          right<number, Error>(2),
          left<Error, number>(error),
          right<number, Error>(4),
        ],

        [
          right<number, Error>(2),
          right<number, Error>(3),
          left<Error, number>(error),
        ],
      ]) {
        const [a, b, c] = eithers;
        const d = map3(a!, b!, c!, mapper);
        expect(d.toResult()).toEqual(left(error).toResult());
        expect(mapper).not.toBeCalled();
      }
    });
  });

  describe("sequence", () => {
    it("should return a right with the array of values when no left", () => {
      const res = sequence([right(1), right(2), right(3)]);
      expect(res.toResult()).toEqual(right([1, 2, 3]).toResult());
    });

    it("should return left if one array item is left", () => {
      const error = new Error("test error");
      const res = sequence([
        right<number, Error>(1),
        left<Error, number>(error),
        right<number, Error>(3),
      ]);
      expect(res.toResult()).toEqual(left(error).toResult());
    });
  });
});
