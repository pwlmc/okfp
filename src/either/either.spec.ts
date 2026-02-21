import { describe, it, expect, vi } from "vitest";
import { left, right } from "./constructors.js";
import { Either } from "./either.js";
import { monadLawsSpec } from "../testUtils/monadLaws.js";
import { functorLawsSpec } from "../testUtils/functorLaws.js";
import { applicativeLawsSpec } from "../testUtils/applicativeLaws.js";

describe("either", () => {
  describe("filterOrElse", () => {
    it("should return the same either when predicate returns true", () => {
      const either = right<number, Error>(2);
      const error = new Error("Value is negative");
      const newEither = either.filterOrElse(
        (x) => x >= 0,
        () => error
      );

      expect(newEither).toBe(either);
    });

    it("should return left when predicate returns false", () => {
      const either = right<number, Error>(-2);
      const error = new Error("Value is negative");
      const newEither = either.filterOrElse(
        (x) => x >= 0,
        () => error
      );

      expect(newEither.toResult()).toEqual(left(error).toResult());
    });

    it("should not call the predicate when value is left", () => {
      const error = new Error("some error");
      const either = left(error);
      const predicate = vi.fn();
      const newEither = either.filterOrElse(predicate, () => error);

      expect(newEither).toBe(either);
      expect(predicate).not.toBeCalled();
    });
  });

  describe("map", () => {
    const mapper = (n: number) => n + 2;

    it("should map right value", () => {
      const value = right(2);
      const newValue = value.map(mapper);
      expect(newValue.toResult()).toEqual(right(4).toResult());
    });

    it("should not change the left value", () => {
      const value = left(new Error("Test error"));
      const newValue = value.map(mapper);
      expect(newValue).toBe(value);
    });

    it("should not call the mapper when value is left", () => {
      const mapper = vi.fn();
      left(new Error("Test error")).map(mapper);
      expect(mapper).not.toHaveBeenCalled();
    });
  });

  describe("orElse", () => {
    it("should return the same either and not call the fallback when value is right", () => {
      const fallback = vi.fn();
      const either = right(2);
      const newEither = either.orElse(fallback);

      expect(newEither).toBe(either);
      expect(fallback).not.toHaveBeenCalled();
    });

    it("should not call the fallback when value is left", () => {
      const fallback = () => right(2);
      const either = left<Error, number>(new Error("some error")).orElse(
        fallback
      );

      expect(either.toResult()).toEqual(right(2).toResult());
    });
  });

  describe("ap", () => {
    it("should apply the value to the elevated function", () => {
      const either = right((num: number) => num * 2).ap(right(2));
      expect(either.toResult()).toEqual(right(4).toResult());
    });

    it("should not call the function and return left when argument either is left", () => {
      const fn = vi.fn();
      const error = new Error("some error");
      const either = right(fn as (num: number) => number).ap(left(error));
      expect(either.toResult()).toEqual(left(error).toResult());
      expect(fn).not.toHaveBeenCalled();
    });

    it("should return left if the either is left", () => {
      const error = new Error("some error");
      const either = left<Error, (num: number) => number>(error).ap(right(2));
      expect(either.toResult()).toEqual(left(error).toResult());
    });
  });

  describe("swap", () => {
    it("should reverse the order of left and right", () => {
      expect(right(2).swap().toResult()).toEqual(left(2).toResult());
      expect(left(2).swap().toResult()).toEqual(right(2).toResult());
    });
  });

  describe("zip", () => {
    it("should return an either of tuple on right value", () => {
      const either = right(2).zip(right("two"));
      expect(either.toResult()).toEqual(right([2, "two"]).toResult());
    });

    it("should return left on left", () => {
      const error = new Error("test error");
      const either1 = right(2).zip(left(error));
      const either2 = left(error).zip(right(2));
      expect(either1.toResult()).toEqual(left(error).toResult());
      expect(either2.toResult()).toEqual(left(error).toResult());
    });

    it("should return the first left", () => {
      const error1 = new Error("first error");
      const error2 = new Error("second error");
      const either = left(error1).zip(left(error2));
      expect(either.toResult()).toEqual(left(error1).toResult());
    });
  });

  describe("flatten", () => {
    it("should remove one level of nesting from either", () => {
      const either = right(right(2));
      expect(either.flatten().toResult()).toEqual(right(2).toResult());
    });

    it("should do nothing when on left", () => {
      const error = new Error("test error");
      const either = left<Error, Either<Error, number>>(error).flatten();
      expect(either.toResult()).toEqual(left(error).toResult());
    });

    it("should return left when the inner either is left", () => {
      const error = new Error("test error");
      const either = right(left(error)).flatten();
      expect(either.toResult()).toEqual(left(error).toResult());
    });
  });

  describe("flatMap", () => {
    const mapper = (r: number) => right(r + 2);

    it("should map and flatten the right value", () => {
      const value = right(2);
      const newValue = value.flatMap(mapper);
      expect(newValue.toResult()).toEqual(right(4).toResult());
    });

    it("should not change the left value", () => {
      const value = left(new Error("test error"));
      const newValue = value.flatMap(mapper);
      expect(newValue).toBe(value);
    });
  });

  describe("tap", () => {
    const sideEffect = vi.fn();

    it("should run the side effect and return the same either on right value", () => {
      const either = right(2);
      const tapEither = either.tap(sideEffect);
      expect(sideEffect).toBeCalledWith(2);
      expect(tapEither).toBe(either);
    });

    it("should not call the side effect and return the same either on left value", () => {
      const either = left(new Error("test error"));
      const tapEither = either.tap(sideEffect);
      expect(sideEffect).not.toHaveBeenCalled();
      expect(tapEither).toBe(either);
    });
  });

  describe("match", () => {
    it("should return the mapped right", () => {
      const value = right(1).match(
        () => 0,
        (value) => value + 1
      );
      expect(value).toBe(2);
    });

    it("should return the mapped left", () => {
      const value = left(new Error("test error")).match(
        () => 0,
        (value) => value + 1
      );
      expect(value).toBe(0);
    });
  });

  describe("getOrElse", () => {
    const fallback = () => 0;

    it("should return right value", () => {
      const value = right(2);
      expect(value.getOrElse(fallback)).toBe(2);
    });

    it("should map the fallback value", () => {
      const value = left<Error, number>(new Error("test error"));
      expect(value.getOrElse(fallback)).toBe(0);
    });
  });

  describe("toResult", () => {
    it("should return ok result with value on right", () => {
      expect(right(2).toResult()).toEqual({
        ok: true,
        value: 2,
      });
    });

    it("should return not ok result with error on left", () => {
      const error = new Error("test error");
      expect(left(error).toResult()).toEqual({
        ok: false,
        error,
      });
    });
  });

  describe(
    "functor laws",
    functorLawsSpec<Either<never, number>>({
      of: (value) => right(value),
      map: (m, mapper) => m.map(mapper),
      asTag: (m) => m.toResult(),
    })
  );

  describe(
    "applicative laws",
    applicativeLawsSpec<Either<never, unknown>>({
      of: (value) => right(value),
      ap: (either, arg) =>
        (either as Either<never, (arg: unknown) => unknown>).ap(arg),
      asTag: (e) => e.toResult(),
    })
  );

  describe(
    "monad laws",
    monadLawsSpec<Either<never, number>>({
      of: (value) => right(value),
      flatMap: (m, mapper) => m.flatMap(mapper),
      asTag: (m) => m.toResult(),
    })
  );
});
