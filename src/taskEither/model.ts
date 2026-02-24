import type { Either } from "../either/either.js";

export type TaskEitherValue<E, T> = () => Promise<Either<E, T>>;
