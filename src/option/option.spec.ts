import { describe, it, expect, vi } from "vitest";
import { some, none } from "./constructors.js";
import { Option } from "./option.js";
import { functorLawsSpec } from "../testUtils/functorLaws.js";
import { monadLawsSpec } from "../testUtils/monadLaws.js";
import { applicativeLawsSpec } from "../testUtils/applicativeLaws.js";

type OptionTag<T> = { tag: "SOME"; some: T } | { tag: "NONE" };

describe("option", () => {
  describe("filter", () => {
    const predicate = vi.fn().mockReturnValue(true);

    it("should keep some value if the predicate returns true", () => {
      const opt = some(1).filter(predicate);
      expect(opt.toNullable()).toBe(1);
    });

    it("should return none if the predicate returns false", () => {
      predicate.mockReturnValue(false);
      const opt = some(-1).filter(predicate);
      expect(opt.toNullable()).toBe(null);
    });

    it("should not call the predicate and return none if the value is none", () => {
      const opt = none().filter(predicate);
      expect(opt.toNullable()).toEqual(null);
      expect(predicate).not.toHaveBeenCalled();
    });
  });

  describe("map", () => {
    const mapper = (n: number) => n + 2;

    it("should map some values", () => {
      const value = some(2);
      const newValue = value.map(mapper);
      expect(newValue.toNullable()).toEqual(4);
    });

    it("should not change the value if it is left", () => {
      const value = none<number>();
      const newValue = value.map(mapper);
      expect(newValue.toNullable()).toBe(null);
    });
  });

  describe("orElse", () => {
    it("should not call the fallback and return the same option on some ", () => {
      const fallback = vi.fn();
      const opt = some(2);
      expect(opt.orElse(fallback)).toBe(opt);
      expect(fallback).not.toBeCalled();
    });

    it("should return the fallback option when none", () => {
      const opt = none<number>().orElse(() => some(0));
      expect(opt.toNullable()).toBe(0);
    });
  });

  describe("ap", () => {
    it("should apply the value to the elevated function", () => {
      const opt = some((num: number) => num * 2).ap(some(2));
      expect(opt.toNullable()).toBe(4);
    });

    it("should not call the function and return none when argument option is none", () => {
      const fn = vi.fn();
      const opt = some(fn as (num: number) => number).ap(none());
      expect(opt.toNullable()).toBe(null);
      expect(fn).not.toHaveBeenCalled();
    });

    it("should return none if the option is none", () => {
      const opt = none<(num: number) => number>().ap(some(2));
      expect(opt.toNullable()).toBe(null);
    });
  });

  describe("zip", () => {
    it("should return an option of tuple on some value", () => {
      const opt = some(2).zip(some("two"));
      expect(opt.toNullable()).toEqual([2, "two"]);
    });

    it("should return none on none", () => {
      const opt1 = some(2).zip(none());
      const opt2 = none().zip(some("two"));
      expect(opt1.toNullable()).toBe(null);
      expect(opt2.toNullable()).toBe(null);
    });
  });

  describe("flatten", () => {
    it("should remove one level of nesting from option", () => {
      const opt = some(some<number>(2));
      expect(opt.flatten().toNullable()).toBe(2);
    });

    it("should do nothing on none", () => {
      const opt = none<Option<number>>().flatten();
      expect(opt.toNullable()).toBe(null);
    });

    it("should return none when the inner option is none", () => {
      const opt = some(none()).flatten();
      expect(opt.toNullable()).toBe(null);
    });
  });

  describe("flatMap", () => {
    const mapper = (r: number) => some(r + 2);

    it("should map and flatten the right value", () => {
      const value = some(2);
      const newValue = value.flatMap(mapper);
      expect(newValue.toNullable()).toBe(4);
    });

    it("should not change the left value", () => {
      const value = none<number>();
      const newValue = value.flatMap(mapper);
      expect(newValue).toBe(value);
    });
  });

  describe("tap", () => {
    const sideEffect = vi.fn();

    it("should run the side effect and return the same option on some value", () => {
      const opt = some(2);
      const tapOpt = opt.tap(sideEffect);
      expect(sideEffect).toBeCalledWith(2);
      expect(tapOpt).toBe(opt);
    });

    it("should not call the side effect and return the same option on none", () => {
      const opt = none();
      const tapOpt = opt.tap(sideEffect);
      expect(sideEffect).not.toHaveBeenCalled();
      expect(tapOpt).toBe(opt);
    });
  });

  describe("tapNone", () => {
    const sideEffect = vi.fn();

    it("should not call the side effect and return the same option on some value", () => {
      const opt = some(2);
      const tapOpt = opt.tapNone(sideEffect);
      expect(sideEffect).not.toHaveBeenCalled();
      expect(opt).toBe(tapOpt);
    });

    it("should call the side effect and return the same option on none value", () => {
      const opt = none();
      const tapOpt = opt.tapNone(sideEffect);
      expect(sideEffect).toHaveBeenCalled();
      expect(opt).toBe(tapOpt);
    });
  });

  describe("match", () => {
    it("should return the mapped some", () => {
      const res = some(1).match(
        () => 0,
        (value) => value + 1
      );
      expect(res).toBe(2);
    });

    it("should return the mapped none", () => {
      const res = none<number>().match(
        () => 0,
        (value) => value + 1
      );
      expect(res).toBe(0);
    });
  });

  describe("getOrElse", () => {
    const fallback = () => 0;

    it("should return some value", () => {
      const value = some(2);
      expect(value.getOrElse(fallback)).toBe(2);
    });

    it("should map the fallback value", () => {
      const value = none();
      expect(value.getOrElse(fallback)).toBe(0);
    });
  });

  describe("toNullable", () => {
    it("should return the some value", () => {
      const value = some(2);
      expect(value.toNullable()).toBe(2);
    });

    it("should return null for none", () => {
      const value = none();
      expect(value.toNullable()).toBe(null);
    });
  });

  describe("toArray", () => {
    it("should return and array with the some value ", () => {
      const value = some(2);
      expect(value.toArray()).toEqual([2]);
    });

    it("should return an empty array for none", () => {
      const value = none();
      expect(value.toArray()).toEqual([]);
    });
  });

  const asTag = <T>(value: Option<T>) =>
    value.match<OptionTag<T>>(
      () => ({ tag: "NONE" as const }),
      (some) => ({ tag: "SOME" as const, some })
    );

  describe(
    "functor laws",
    functorLawsSpec<Option<number>>({
      of: (testValue) => some(testValue),
      map: (m, mapper) => m.map(mapper),
      asTag,
    })
  );

  describe(
    "applicative laws",
    applicativeLawsSpec<Option<unknown>>({
      of: (value) => some(value),
      ap: (opt, arg) => (opt as Option<(arg: unknown) => unknown>).ap(arg),
      asTag,
    })
  );

  describe(
    "monad laws",
    monadLawsSpec<Option<number>>({
      of: (testValue) => some(testValue),
      flatMap: (m, mapper) => m.flatMap(mapper),
      asTag,
    })
  );
});
