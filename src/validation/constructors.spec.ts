import { describe, expect, it } from "vitest";
import { left, right } from "../either.js";
import { none, some } from "../option.js";
import { fromEither, fromOption, invalid, valid } from "./constructors.js";

describe("validation constructors", () => {
	describe("valid", () => {
		it("should create validation with valid value", () => {
			expect(valid(42).toResult()).toEqual({ ok: true, value: 42 });
		});
	});

	describe("invalid", () => {
		it("should create validation with a single error", () => {
			expect(invalid("something went wrong").toResult()).toEqual({
				ok: false,
				errors: ["something went wrong"],
			});
		});
	});

	describe("fromEither", () => {
		it("should create valid from right", () => {
			expect(fromEither(right(42)).toResult()).toEqual({ ok: true, value: 42 });
		});

		it("should create invalid with single error from left", () => {
			const error = new Error("test error");
			expect(fromEither(left(error)).toResult()).toEqual({
				ok: false,
				errors: [error],
			});
		});
	});

	describe("fromOption", () => {
		it("should create valid from some", () => {
			expect(fromOption(some(42), () => "missing").toResult()).toEqual({
				ok: true,
				value: 42,
			});
		});

		it("should create invalid from none", () => {
			expect(fromOption(none(), () => "missing").toResult()).toEqual({
				ok: false,
				errors: ["missing"],
			});
		});
	});
});
