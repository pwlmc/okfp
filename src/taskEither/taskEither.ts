import { left, right } from "../either/constructors.js";
import type { Either } from "../either/either.js";
import { createTask, type Task } from "../task/task.js";
import type { TaskEitherValue } from "./model.js";

export type TaskEither<E, T> = {
	map: <U>(mapper: (right: T) => U) => TaskEither<E, U>;

	mapLeft: <F>(mapper: (left: E) => F) => TaskEither<F, T>;

	ap: <EE, A, U>(
		this: TaskEither<E, (a: A) => U>,
		arg: TaskEither<EE, A>,
	) => TaskEither<E | EE, U>;

	zip: <EE, A>(other: TaskEither<EE, A>) => TaskEither<E | EE, readonly [T, A]>;

	flatten: <EE, U>(
		this: TaskEither<E, TaskEither<EE, U>>,
	) => TaskEither<E | EE, U>;

	flatMap: <EE, U>(
		mapper: (right: T) => TaskEither<EE, U>,
	) => TaskEither<E | EE, U>;

	tap: (sideEffect: (right: T) => unknown) => TaskEither<E, T>;

	tapLeft: (sideEffect: (left: E) => unknown) => TaskEither<E, T>;

	match: <U>(onLeft: (left: E) => U, onRight: (right: T) => U) => Task<U>;

	getOrElse: (fallback: (left: E) => T) => Task<T>;

	orElse: <EE>(
		fallback: (left: E) => TaskEither<EE, T>,
	) => TaskEither<E | EE, T>;

	run: () => Promise<Either<E, T>>;
};

export function createTaskEither<E, T>(
	thunk: TaskEitherValue<E, T>,
): TaskEither<E, T> {
	const te: TaskEither<E, T> = {
		map: <U>(mapper: (right: T) => U): TaskEither<E, U> =>
			te.flatMap((rightVal) =>
				createTaskEither(() => Promise.resolve(right<U, E>(mapper(rightVal)))),
			),

		mapLeft: <F>(mapper: (leftVal: E) => F): TaskEither<F, T> =>
			createTaskEither<F, T>(() =>
				thunk().then((either) =>
					either.match(
						(leftVal) => left<F, T>(mapper(leftVal)),
						(rightVal) => right<T, F>(rightVal),
					),
				),
			),

		ap: function <EE, A, U>(
			this: TaskEither<E, (a: A) => U>,
			arg: TaskEither<EE, A>,
		): TaskEither<E | EE, U> {
			return createTaskEither<E | EE, U>(() =>
				Promise.all([this.run(), arg.run()]).then(
					([eitherFn, eitherA]) =>
						(eitherFn as Either<E, (a: A) => U>).ap(
							eitherA as Either<EE, A>,
						) as Either<E | EE, U>,
				),
			);
		},

		zip: <EE, A>(
			other: TaskEither<EE, A>,
		): TaskEither<E | EE, readonly [T, A]> =>
			te.map((value) => (a: A) => [value, a] as const).ap(other),

		flatten: function <EE, U>(
			this: TaskEither<E, TaskEither<EE, U>>,
		): TaskEither<E | EE, U> {
			// biome-ignore lint/complexity/noFlatMapIdentity: flatMap here is the custom TaskEither method, not Array.flatMap
			return this.flatMap((value) => value);
		},

		flatMap: <EE, U>(
			mapper: (rightVal: T) => TaskEither<EE, U>,
		): TaskEither<E | EE, U> =>
			createTaskEither<E | EE, U>(() =>
				thunk().then((either) =>
					either.match<Promise<Either<E | EE, U>>>(
						(leftVal) => Promise.resolve(left<E | EE, U>(leftVal)),
						(rightVal) => mapper(rightVal).run() as Promise<Either<E | EE, U>>,
					),
				),
			),

		tap: (sideEffect: (right: T) => unknown): TaskEither<E, T> =>
			createTaskEither(() =>
				thunk().then((either) => {
					either.tap(sideEffect);
					return either;
				}),
			),

		tapLeft: (sideEffect: (leftVal: E) => unknown): TaskEither<E, T> =>
			createTaskEither(() =>
				thunk().then((either) => {
					either.match(sideEffect, () => {});
					return either;
				}),
			),

		match: <U>(onLeft: (left: E) => U, onRight: (right: T) => U): Task<U> =>
			createTask(() => thunk().then((either) => either.match(onLeft, onRight))),

		getOrElse: (fallback: (left: E) => T): Task<T> =>
			createTask(() => thunk().then((either) => either.getOrElse(fallback))),

		orElse: <EE>(
			fallback: (leftVal: E) => TaskEither<EE, T>,
		): TaskEither<E | EE, T> =>
			createTaskEither<E | EE, T>(() =>
				thunk().then((either) =>
					either.match<Promise<Either<E | EE, T>>>(
						(leftVal) => fallback(leftVal).run() as Promise<Either<E | EE, T>>,
						() => Promise.resolve(either as unknown as Either<E | EE, T>),
					),
				),
			),

		run: () => thunk(),
	};

	return te;
}
