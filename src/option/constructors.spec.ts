import { expect, describe, it } from "vitest";
import { some, none, fromNullable, fromEither } from "./constructors.js";
import { left, right } from "../either.js";

describe("option constructors", () => {
  describe("some", () => {
    it("should create some option instance", () => {
      expect(some(2).toNullable()).toBe(2);
    });
  });

  describe("none", () => {
    it("should create none option instance", () => {
      expect(none().toNullable()).toBe(null);
    });
  });

  describe("fromNullable", () => {
    it("should create some when value is a number", () => {
      expect(fromNullable(2).toNullable()).toBe(2);
    });

    it("should create none when value is null or undefined", () => {
      expect(fromNullable(undefined).toNullable()).toBe(null);
      expect(fromNullable(null).toNullable()).toBe(null);
    });
  });

  describe("fromEither", () => {
    it("should create some when wither is right", () => {
      const opt = fromEither(right(2));
      expect(opt.toNullable()).toBe(2);
    });

    it("should create none when predicate returns false", () => {
      const opt = fromEither(left(2));
      expect(opt.toNullable()).toBe(null);
    });
  });
});
