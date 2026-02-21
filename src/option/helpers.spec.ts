import { describe, it, expect, vi } from "vitest";
import { some, none } from "./constructors.js";
import { map2, map3, sequence } from "./helpers.js";

describe("option helpers", () => {
  describe("map2", () => {
    it("should map some values", () => {
      const a = some(2);
      const b = some(3);
      const c = map2(a, b, (a, b) => a * b);
      expect(c.toNullable()).toBe(6);
    });

    it("should not call the mapper and return none when one of the values is none", () => {
      const mapper = vi.fn();
      for (const opts of [
        [none<number>(), some(3)],
        [some(2), none<number>()],
      ]) {
        const [a, b] = opts;
        const c = map2(a!, b!, mapper);
        expect(c.toNullable()).toBe(null);
        expect(mapper).not.toBeCalled();
      }
    });
  });

  describe("map3", () => {
    it("should map some values", () => {
      const a = some(2);
      const b = some(3);
      const c = some(4);
      const d = map3(a, b, c, (a, b, c) => a * b * c);
      expect(d.toNullable()).toBe(24);
    });

    it("should not call the mapper and return none when one of the values is none", () => {
      const mapper = vi.fn();
      for (const opts of [
        [none<number>(), some(3), some(4)],
        [some(2), none<number>(), some(4)],
        [some(2), some(3), none<number>()],
      ]) {
        const [a, b, c] = opts;
        const d = map3(a!, b!, c!, mapper);
        expect(d.toNullable()).toBe(null);
        expect(mapper).not.toBeCalled();
      }
    });
  });

  describe("sequence", () => {
    it("should return an option with the array of values when no none", () => {
      const res = sequence([some(1), some(2), some(3)]);
      expect(res.toNullable()).toEqual([1, 2, 3]);
    });

    it("should return none if one array items is none", () => {
      const res = sequence([some(1), none<number>(), some(3)]);
      expect(res.toNullable()).toBe(null);
    });
  });
});
