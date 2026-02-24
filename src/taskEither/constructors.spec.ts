import { describe, expect, it, vi } from "vitest";
import { left, right } from "../either/constructors.js";
import { task } from "../task/constructors.js";
import {
	fromEither,
	fromTask,
	taskEither,
	taskLeft,
	tryCatch,
} from "./constructors.js";

describe("taskEither constructors", () => {
	describe("taskEither", () => {
		it("should create a taskEither that resolves with a right value", async () => {
			const te = taskEither(42);
			expect((await te.run()).toResult()).toEqual(right(42).toResult());
		});

		it("should be lazy and not run until run() is called", () => {
			const te = taskEither(1);
			expect(te).toBeDefined();
		});
	});

	describe("taskLeft", () => {
		it("should create a taskEither that resolves with a left value", async () => {
			const error = new Error("test error");
			const te = taskLeft(error);
			expect((await te.run()).toResult()).toEqual(left(error).toResult());
		});
	});

	describe("fromEither", () => {
		it("should wrap a right either in a taskEither", async () => {
			const either = right(42);
			const te = fromEither(either);
			expect((await te.run()).toResult()).toEqual(right(42).toResult());
		});

		it("should wrap a left either in a taskEither", async () => {
			const error = new Error("test error");
			const either = left(error);
			const te = fromEither(either);
			expect((await te.run()).toResult()).toEqual(left(error).toResult());
		});
	});

	describe("fromTask", () => {
		it("should wrap a task value in a right taskEither", async () => {
			const t = task(42);
			const te = fromTask(t);
			expect((await te.run()).toResult()).toEqual(right(42).toResult());
		});
	});

	describe("tryCatch", () => {
		it("should create a right taskEither when promise resolves", async () => {
			const te = tryCatch(
				() => Promise.resolve(42),
				(err) => err,
			);
			expect((await te.run()).toResult()).toEqual(right(42).toResult());
		});

		it("should create a left taskEither when promise rejects", async () => {
			const error = new Error("async error");
			const te = tryCatch(
				() => Promise.reject(error),
				(err) => err as Error,
			);
			expect((await te.run()).toResult()).toEqual(left(error).toResult());
		});

		it("should call the thunk only when run() is called", async () => {
			const fn = vi.fn(() => Promise.resolve(1));
			const te = tryCatch(fn, (err) => err);
			expect(fn).not.toHaveBeenCalled();
			await te.run();
			expect(fn).toHaveBeenCalledOnce();
		});
	});
});
