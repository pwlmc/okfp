import { describe, expect, it, vi } from "vitest";
import { left, right } from "../either/constructors.js";
import { taskEither, taskLeft } from "./constructors.js";
import type { TaskEither } from "./taskEither.js";

describe("taskEither", () => {
	describe("map", () => {
		it("should transform the right value", async () => {
			const te = taskEither(5).map((x) => x * 2);
			expect((await te.run()).toResult()).toEqual(right(10).toResult());
		});

		it("should not call the mapper and preserve left", async () => {
			const mapper = vi.fn();
			const error = new Error("test error");
			const te = taskLeft(error).map(mapper);
			const result = await te.run();
			expect(result.toResult()).toEqual(left(error).toResult());
			expect(mapper).not.toHaveBeenCalled();
		});

		it("should be composable", async () => {
			const te = taskEither(5)
				.map((x) => x + 1)
				.map((x) => x * 2);
			const result = await te.run();
			expect(result.toResult()).toEqual(right(12).toResult());
		});
	});

	describe("mapLeft", () => {
		it("should transform the left value", async () => {
			const te = taskLeft<string, number>("error").mapLeft(
				(e) => `mapped: ${e}`,
			);
			const result = await te.run();
			expect(result.toResult()).toEqual(left("mapped: error").toResult());
		});

		it("should not call the mapper and preserve right", async () => {
			const mapper = vi.fn();
			const te = taskEither(42).mapLeft(mapper);
			const result = await te.run();
			expect(result.toResult()).toEqual(right(42).toResult());
			expect(mapper).not.toHaveBeenCalled();
		});
	});

	describe("ap", () => {
		it("should apply a function taskEither to a value taskEither", async () => {
			const add = (x: number) => (y: number) => x + y;
			const result = taskEither(add(5)).ap(taskEither(3));
			expect((await result.run()).toResult()).toEqual(right(8).toResult());
		});

		it("should return left when function taskEither is left", async () => {
			const error = new Error("fn error");
			const result = taskLeft<Error, (n: number) => number>(error).ap(
				taskEither(3),
			);
			expect((await result.run()).toResult()).toEqual(left(error).toResult());
		});

		it("should return left when arg taskEither is left", async () => {
			const error = new Error("arg error");
			const result = taskEither((n: number) => n * 2).ap(taskLeft(error));
			expect((await result.run()).toResult()).toEqual(left(error).toResult());
		});
	});

	describe("zip", () => {
		it("should combine two taskEithers into a tuple", async () => {
			const result = taskEither("Alice").zip(taskEither(30));
			expect((await result.run()).toResult()).toEqual(
				right(["Alice", 30]).toResult(),
			);
		});

		it("should return left when first is left", async () => {
			const error = new Error("test error");
			const result = taskLeft(error).zip(taskEither(30));
			expect((await result.run()).toResult()).toEqual(left(error).toResult());
		});

		it("should return left when second is left", async () => {
			const error = new Error("test error");
			const result = taskEither("Alice").zip(taskLeft(error));
			expect((await result.run()).toResult()).toEqual(left(error).toResult());
		});
	});

	describe("flatten", () => {
		it("should remove one level of taskEither nesting", async () => {
			const nested = taskEither(taskEither(42));
			const result = await nested.flatten().run();
			expect(result.toResult()).toEqual(right(42).toResult());
		});

		it("should return left when outer is left", async () => {
			const error = new Error("test error");
			const te = taskLeft<Error, TaskEither<Error, number>>(error).flatten();
			expect((await te.run()).toResult()).toEqual(left(error).toResult());
		});

		it("should return left when inner is left", async () => {
			const error = new Error("test error");
			const te = taskEither(taskLeft<Error, number>(error)).flatten();
			expect((await te.run()).toResult()).toEqual(left(error).toResult());
		});
	});

	describe("flatMap", () => {
		it("should chain taskEither-returning operations", async () => {
			const result = taskEither(10).flatMap((x) => taskEither(x * 2));
			expect((await result.run()).toResult()).toEqual(right(20).toResult());
		});

		it("should not call the mapper and preserve left", async () => {
			const mapper = vi.fn();
			const error = new Error("test error");
			const result = await taskLeft(error).flatMap(mapper).run();
			expect(result.toResult()).toEqual(left(error).toResult());
			expect(mapper).not.toHaveBeenCalled();
		});

		it("should propagate left returned by mapper", async () => {
			const error = new Error("mapper error");
			const result = await taskEither(5)
				.flatMap(() => taskLeft(error))
				.run();
			expect(result.toResult()).toEqual(left(error).toResult());
		});
	});

	describe("tap", () => {
		it("should run the side effect with the right value and return the same either", async () => {
			const sideEffect = vi.fn();
			const result = await taskEither(42).tap(sideEffect).run();
			expect(sideEffect).toHaveBeenCalledWith(42);
			expect(result.toResult()).toEqual(right(42).toResult());
		});

		it("should not call the side effect on left", async () => {
			const sideEffect = vi.fn();
			const error = new Error("test error");
			await taskLeft(error).tap(sideEffect).run();
			expect(sideEffect).not.toHaveBeenCalled();
		});
	});

	describe("tapLeft", () => {
		it("should run the side effect with the left value and return the same either", async () => {
			const sideEffect = vi.fn();
			const error = new Error("test error");
			const result = await taskLeft(error).tapLeft(sideEffect).run();
			expect(sideEffect).toHaveBeenCalledWith(error);
			expect(result.toResult()).toEqual(left(error).toResult());
		});

		it("should not call the side effect on right", async () => {
			const sideEffect = vi.fn();
			await taskEither(42).tapLeft(sideEffect).run();
			expect(sideEffect).not.toHaveBeenCalled();
		});
	});

	describe("match", () => {
		it("should return the mapped right value as a task", async () => {
			const result = await taskEither(5)
				.match(
					() => 0,
					(x) => x * 2,
				)
				.run();
			expect(result).toBe(10);
		});

		it("should return the mapped left value as a task", async () => {
			const result = await taskLeft<string, number>("error")
				.match(
					(e) => `got: ${e}`,
					(x) => `value: ${x}`,
				)
				.run();
			expect(result).toBe("got: error");
		});
	});

	describe("getOrElse", () => {
		it("should return the right value as a task", async () => {
			const result = await taskEither(42)
				.getOrElse(() => 0)
				.run();
			expect(result).toBe(42);
		});

		it("should return the fallback value on left as a task", async () => {
			const result = await taskLeft<string, number>("error")
				.getOrElse(() => 0)
				.run();
			expect(result).toBe(0);
		});
	});

	describe("orElse", () => {
		it("should return the same taskEither and not call fallback when right", async () => {
			const fallback = vi.fn();
			const te = taskEither(42);
			const result = await te.orElse(fallback).run();
			expect(result.toResult()).toEqual(right(42).toResult());
			expect(fallback).not.toHaveBeenCalled();
		});

		it("should return the fallback taskEither on left", async () => {
			const result = await taskLeft<string, number>("error")
				.orElse(() => taskEither(0))
				.run();
			expect(result.toResult()).toEqual(right(0).toResult());
		});
	});

	describe("run", () => {
		it("should return a Promise", () => {
			const result = taskEither(42).run();
			expect(result).toBeInstanceOf(Promise);
		});

		it("should resolve with an Either", async () => {
			const result = await taskEither(42).run();
			expect(result.toResult()).toEqual(right(42).toResult());
		});
	});

	describe("functor laws", () => {
		it("should obey the identity law", async () => {
			const id = <T>(x: T) => x;
			const te = taskEither(123);
			const r1 = await te.map(id).run();
			const r2 = await te.run();
			expect(r1.toResult()).toEqual(r2.toResult());
		});

		it("should obey the composition law", async () => {
			const f = (x: number) => x + 1;
			const g = (x: number) => x * 2;
			const te = taskEither(10);
			const r1 = await te.map(f).map(g).run();
			const r2 = await te.map((x) => g(f(x))).run();
			expect(r1.toResult()).toEqual(r2.toResult());
		});
	});

	describe("monad laws", () => {
		it("should obey the left identity law", async () => {
			const f = (x: number): TaskEither<never, number> => taskEither(x * 2);
			const a = 42;
			const r1 = await taskEither(a).flatMap(f).run();
			const r2 = await f(a).run();
			expect(r1.toResult()).toEqual(r2.toResult());
		});

		it("should obey the right identity law", async () => {
			const te = taskEither(7);
			const r1 = await te.flatMap(taskEither).run();
			const r2 = await te.run();
			expect(r1.toResult()).toEqual(r2.toResult());
		});

		it("should obey the associativity law", async () => {
			const f = (x: number): TaskEither<never, number> => taskEither(x * 2);
			const g = (x: number): TaskEither<never, number> => taskEither(x + 1);
			const te = taskEither(5);
			const r1 = await te.flatMap(f).flatMap(g).run();
			const r2 = await te.flatMap((x) => f(x).flatMap(g)).run();
			expect(r1.toResult()).toEqual(r2.toResult());
		});
	});
});
