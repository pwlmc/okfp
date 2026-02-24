import { left, right } from "../either/constructors.js";
import { createTaskEither, type TaskEither } from "./taskEither.js";

export function all<E, T>(taskEithers: TaskEither<E, T>[]): TaskEither<E, T[]> {
	return createTaskEither(() =>
		Promise.all(taskEithers.map((te) => te.run())).then((eithers) => {
			const out: T[] = [];
			for (const either of eithers) {
				const result = either.toResult();
				if (!result.ok) {
					return left<E, T[]>(result.error);
				}
				out.push(result.value);
			}
			return right<T[], E>(out);
		}),
	);
}
