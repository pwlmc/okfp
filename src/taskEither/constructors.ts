import { left, right } from "../either/constructors.js";
import type { Either } from "../either/either.js";
import type { Task } from "../task/task.js";
import { createTaskEither, type TaskEither } from "./taskEither.js";

export function taskEither<T, E = never>(value: T): TaskEither<E, T> {
	return createTaskEither(() => Promise.resolve(right<T, E>(value)));
}

export function taskLeft<E, T = never>(error: E): TaskEither<E, T> {
	return createTaskEither(() => Promise.resolve(left<E, T>(error)));
}

export function fromEither<E, T>(either: Either<E, T>): TaskEither<E, T> {
	return createTaskEither(() => Promise.resolve(either));
}

export function fromTask<T, E = never>(t: Task<T>): TaskEither<E, T> {
	return createTaskEither(() => t.run().then((value) => right<T, E>(value)));
}

export function tryCatch<T, E>(
	thunk: () => Promise<T>,
	onThrow: (err: unknown) => E,
): TaskEither<E, T> {
	return createTaskEither(() =>
		thunk().then(
			(value) => right<T, E>(value),
			(err) => left<E, T>(onThrow(err)),
		),
	);
}
