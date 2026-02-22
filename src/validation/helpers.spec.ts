import { describe, expect, it, vi } from "vitest";
import { invalid, valid } from "./constructors.js";
import { map2, map3, sequence } from "./helpers.js";

describe("validation helpers", () => {
	describe("map2", () => {
		it("should map valid values", () => {
			const result = map2(valid(2), valid(3), (a, b) => a * b);
			expect(result.toResult()).toEqual({ ok: true, value: 6 });
		});

		it("should accumulate errors when both are invalid", () => {
			const mapper = vi.fn();
			const result = map2(
				invalid<string, number>("e1"),
				invalid<string, number>("e2"),
				mapper,
			);
			expect(result.toResult()).toEqual({ ok: false, errors: ["e1", "e2"] });
			expect(mapper).not.toBeCalled();
		});

		it("should return invalid when first is invalid", () => {
			const mapper = vi.fn();
			const result = map2(
				invalid<string, number>("e1"),
				valid<number, string>(3),
				mapper,
			);
			expect(result.toResult()).toEqual({ ok: false, errors: ["e1"] });
			expect(mapper).not.toBeCalled();
		});

		it("should return invalid when second is invalid", () => {
			const mapper = vi.fn();
			const result = map2(
				valid<number, string>(2),
				invalid<string, number>("e2"),
				mapper,
			);
			expect(result.toResult()).toEqual({ ok: false, errors: ["e2"] });
			expect(mapper).not.toBeCalled();
		});
	});

	describe("map3", () => {
		it("should map valid values", () => {
			const result = map3(valid(2), valid(3), valid(4), (a, b, c) => a + b + c);
			expect(result.toResult()).toEqual({ ok: true, value: 9 });
		});

		it("should accumulate all errors when all are invalid", () => {
			const mapper = vi.fn();
			const result = map3(
				invalid<string, number>("e1"),
				invalid<string, number>("e2"),
				invalid<string, number>("e3"),
				mapper,
			);
			expect(result.toResult()).toEqual({
				ok: false,
				errors: ["e1", "e2", "e3"],
			});
			expect(mapper).not.toBeCalled();
		});

		it("should accumulate errors from multiple invalid values", () => {
			const mapper = vi.fn();
			const result = map3(
				invalid<string, number>("e1"),
				valid<number, string>(2),
				invalid<string, number>("e3"),
				mapper,
			);
			expect(result.toResult()).toEqual({
				ok: false,
				errors: ["e1", "e3"],
			});
			expect(mapper).not.toBeCalled();
		});
	});

	describe("sequence", () => {
		it("should return valid with array of values when all are valid", () => {
			const result = sequence([valid(1), valid(2), valid(3)]);
			expect(result.toResult()).toEqual({ ok: true, value: [1, 2, 3] });
		});

		it("should accumulate all errors when some are invalid", () => {
			const result = sequence([
				valid<number, string>(1),
				invalid<string, number>("e1"),
				invalid<string, number>("e2"),
			]);
			expect(result.toResult()).toEqual({ ok: false, errors: ["e1", "e2"] });
		});

		it("should return valid with empty array for empty input", () => {
			const result = sequence([]);
			expect(result.toResult()).toEqual({ ok: true, value: [] });
		});
	});
});
