import { expect, it } from "vitest";

type FunctorApi<F> = {
  of: (value: number) => F;
  map: (f: F, mapper: (x: number) => number) => F;
  asTag: (f: F) => Record<string, unknown>;
};

export function functorLawsSpec<F>({ of, map, asTag }: FunctorApi<F>) {
  return () => {
    it("should obey the identity law: m.map(id) == m", () => {
      const id = <T>(x: T) => x;
      const m = of(123);
      const leftSide = map(m, id);
      expect(asTag(leftSide)).toEqual(asTag(m));
    });

    it("should obey the composition law: m.map(f).map(g) == m.map(x => g(f(x)))", () => {
      const f = (x: number) => x + 1;
      const g = (x: number) => x * 2;
      const m = of(10);
      const leftSide = map(map(m, f), g);
      const rightSide = map(m, (r) => g(f(r)));
      expect(asTag(leftSide)).toEqual(asTag(rightSide));
    });
  };
}
