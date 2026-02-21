import { type Either } from "./either.js";

export type ValidationV<E, T> = {};

export type Validation<E, T> = {
  ap: unknown;
  map: unknown;
  map3: unknown;
};

export function valid<T, E = never>(): Validation<E, T> {
  throw new Error("Not implemented");
}

export function invalid<E, T = never>(): Validation<E, T> {
  throw new Error("Not implemented");
}

export function fromEither<E, T>(either: Either<E, T>): Validation<E, T> {
  throw new Error("Not implemented");
}

export function traverse() {
  throw new Error("Not implemented");
}

export function sequence() {
  throw new Error("Not implemented");
}
