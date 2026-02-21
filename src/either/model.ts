export type Left<E> = {
  readonly left: E;
};

export type Right<T> = {
  readonly right: T;
};

export type EitherV<E, T> = Left<E> | Right<T>;
