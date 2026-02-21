export type Some<T> = {
  some: T;
};

export type None = Symbol;

export type OptionV<T> = Some<T> | None;

export const NONE = Symbol("None");
