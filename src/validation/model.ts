export type Valid<T> = {
	readonly valid: T;
};

export type Invalid<E> = {
	readonly invalid: readonly E[];
};

export type ValidationValue<E, T> = Valid<T> | Invalid<E>;

export type ValidationResult<E, T> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly errors: readonly E[] };
