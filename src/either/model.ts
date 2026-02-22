export type Left<E> = {
	readonly left: E;
};

export type Right<T> = {
	readonly right: T;
};

export type EitherValue<E, T> = Left<E> | Right<T>;

export type EitherResult<E, T> =
	| { ok: true; value: T }
	| { ok: false; error: E };
