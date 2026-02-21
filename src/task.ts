export type TaskV<T> = () => Promise<T>;

export type Task<T> = {
  map: never;
  ap: never;
  flatMap: never;
  tap: never;
  run: never;
};

export function task<T>(): Task<T> {
  throw new Error("Not implemented");
}

export function fromPromise<T>(thunk: () => Promise<T>) {
  throw new Error("Not implemented");
}

export function all() {
  throw new Error("Not implemented");
}

export function traverse() {
  throw new Error("Not implemented");
}

export function sequence() {
  throw new Error("Not implemented");
}
