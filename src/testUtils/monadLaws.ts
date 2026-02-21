import { expect, it } from "vitest";

type MonadApi<M> = {
  of: (testValue: number) => M;
  flatMap: (m: M, mapper: (x: number) => M) => M;
  asTag: (m: M) => Record<string, unknown>;
};

export function monadLawsSpec<M>({ of, flatMap, asTag }: MonadApi<M>) {
  return () => {
    it("should obey the left identity law: of(a).flatMap(f) == f(a)", () => {
      const f = (x: number): M => of(x * 2);
      const a = 42;

      const leftSide = flatMap(of(a), f);
      const rightSide = f(a);
      expect(asTag(leftSide)).toEqual(asTag(rightSide));
    });

    it("should obey the right identity law: m.flatMap(of) == m", () => {
      const m = of(7);
      const leftSide = flatMap(m, of);
      expect(asTag(leftSide)).toEqual(asTag(m));
    });

    it("should obey the associativity law: (m.flatMap(f)).flatMap(g) == m.flatMap(x => f(x).flatMap(g))", () => {
      const f = (x: number): M => of(x * 2);
      const g = (x: number): M => of(x / 3);
      const m = of(5);
      const leftSide = flatMap(flatMap(m, f), g);
      const rightSide = flatMap(f(5), g);
      expect(asTag(leftSide)).toEqual(asTag(rightSide));
    });
  };
}
