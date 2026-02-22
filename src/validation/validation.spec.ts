import { describe, expect, it, vi } from "vitest";
import { applicativeLawsSpec } from "../testUtils/applicativeLaws.js";
import { functorLawsSpec } from "../testUtils/functorLaws.js";
import { invalid, valid } from "./constructors.js";
import type { Validation } from "./validation.js";

describe("validation", () => {
	describe("filterOrElse", () => {
		it("should return the same validation when predicate returns true", () => {
			const v = valid<number, string>(5);
			const result = v.filterOrElse(
				(x) => x > 0,
				() => "Must be positive",
			);
			expect(result).toBe(v);
		});

		it("should return invalid when predicate returns false", () => {
			const v = valid<number, string>(-3);
			const result = v.filterOrElse(
				(x) => x > 0,
				() => "Must be positive",
			);
			expect(result.toResult()).toEqual({
				ok: false,
				errors: ["Must be positive"],
			});
		});

		it("should not call the predicate when invalid", () => {
			const v = invalid<string, number>("error");
			const predicate = vi.fn();
			const result = v.filterOrElse(predicate, () => "other error");
			expect(result).toBe(v);
			expect(predicate).not.toHaveBeenCalled();
		});
	});

	describe("map", () => {
		const mapper = (n: number) => n + 2;

		it("should map valid value", () => {
			const v = valid(2);
			expect(v.map(mapper).toResult()).toEqual(valid(4).toResult());
		});

		it("should not change the invalid value", () => {
			const v = invalid<string, number>("error");
			expect(v.map(mapper)).toBe(v);
		});

		it("should not call the mapper when invalid", () => {
			const mapper = vi.fn();
			invalid("error").map(mapper);
			expect(mapper).not.toHaveBeenCalled();
		});
	});

	describe("ap", () => {
		it("should apply the function to the valid value", () => {
			const v = valid((n: number) => n * 2).ap(valid(3));
			expect(v.toResult()).toEqual(valid(6).toResult());
		});

		it("should return invalid when the function is invalid", () => {
			const v = invalid<string, (n: number) => number>("fn error").ap(valid(3));
			expect(v.toResult()).toEqual(invalid("fn error").toResult());
		});

		it("should return invalid when the argument is invalid", () => {
			const v = valid((n: number) => n * 2).ap(invalid("arg error"));
			expect(v.toResult()).toEqual(invalid("arg error").toResult());
		});

		it("should accumulate errors when both are invalid", () => {
			const v = invalid<string, (n: number) => number>("fn error").ap(
				invalid("arg error"),
			);
			expect(v.toResult()).toEqual({
				ok: false,
				errors: ["fn error", "arg error"],
			});
		});
	});

	describe("match", () => {
		it("should return the mapped valid value", () => {
			const result = valid(1).match(
				() => 0,
				(value) => value + 1,
			);
			expect(result).toBe(2);
		});

		it("should return the mapped invalid errors", () => {
			const result = invalid<string, number>("error").match(
				(errors) => errors.length,
				() => 0,
			);
			expect(result).toBe(1);
		});
	});

	describe("getOrElse", () => {
		it("should return valid value", () => {
			expect(valid(2).getOrElse(() => 0)).toBe(2);
		});

		it("should return the fallback value when invalid", () => {
			expect(
				invalid<string, number>("error").getOrElse((errors) => errors.length),
			).toBe(1);
		});
	});

	describe("tap", () => {
		it("should run the side effect and return the same validation on valid value", () => {
			const sideEffect = vi.fn();
			const v = valid(2);
			const tapV = v.tap(sideEffect);
			expect(sideEffect).toBeCalledWith(2);
			expect(tapV).toBe(v);
		});

		it("should not call the side effect and return the same validation on invalid", () => {
			const sideEffect = vi.fn();
			const v = invalid("error");
			const tapV = v.tap(sideEffect);
			expect(sideEffect).not.toHaveBeenCalled();
			expect(tapV).toBe(v);
		});
	});

	describe("tapInvalid", () => {
		it("should not call the side effect and return the same validation on valid value", () => {
			const sideEffect = vi.fn();
			const v = valid(2);
			const tapV = v.tapInvalid(sideEffect);
			expect(sideEffect).not.toHaveBeenCalled();
			expect(tapV).toBe(v);
		});

		it("should call the side effect and return the same validation on invalid", () => {
			const sideEffect = vi.fn();
			const v = invalid("error");
			const tapV = v.tapInvalid(sideEffect);
			expect(sideEffect).toHaveBeenCalledWith(["error"]);
			expect(tapV).toBe(v);
		});
	});

	describe("zip", () => {
		it("should return a validation of tuple on valid values", () => {
			const v = valid(2).zip(valid("two"));
			expect(v.toResult()).toEqual(valid([2, "two"]).toResult());
		});

		it("should accumulate errors when both are invalid", () => {
			const v = invalid<string, number>("e1").zip(
				invalid<string, string>("e2"),
			);
			expect(v.toResult()).toEqual({ ok: false, errors: ["e1", "e2"] });
		});

		it("should return invalid when first is invalid", () => {
			expect(
				invalid<string, number>("e1").zip(valid("two")).toResult(),
			).toEqual({ ok: false, errors: ["e1"] });
		});

		it("should return invalid when second is invalid", () => {
			expect(valid(2).zip(invalid<string, string>("e2")).toResult()).toEqual({
				ok: false,
				errors: ["e2"],
			});
		});
	});

	describe("toResult", () => {
		it("should return ok result with value on valid", () => {
			expect(valid(42).toResult()).toEqual({ ok: true, value: 42 });
		});

		it("should return not ok result with errors on invalid", () => {
			expect(invalid("error").toResult()).toEqual({
				ok: false,
				errors: ["error"],
			});
		});
	});

	describe(
		"functor laws",
		functorLawsSpec<Validation<never, number>>({
			of: (value) => valid(value),
			map: (v, mapper) => v.map(mapper),
			asTag: (v) => v.toResult(),
		}),
	);

	describe(
		"applicative laws",
		applicativeLawsSpec<Validation<never, unknown>>({
			of: (value) => valid(value),
			ap: (v, arg) =>
				(v as Validation<never, (arg: unknown) => unknown>).ap(arg),
			asTag: (v) => v.toResult(),
		}),
	);
});
