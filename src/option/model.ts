export type Some<T> = {
	some: T;
};

export type None = symbol;

export type OptionValue<T> = Some<T> | None;

export const NONE = Symbol("None");
