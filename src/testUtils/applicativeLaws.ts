import { expect, it } from "vitest";

type ApplicativeApi<A> = {
  of: (value: unknown) => A;
  ap: (t: A, arg: A) => A;
  asTag: (u: A) => Record<string, unknown>;
};

export function applicativeLawsSpec<T>({ of, ap, asTag }: ApplicativeApi<T>) {
  return () => {
    it("should obey the identity law: : of(id) <*> a == a", () => {
      const id = (x: unknown) => x;
      const arg = of(3);

      const leftSide = ap(of(id), arg);

      expect(asTag(leftSide)).toEqual(asTag(arg));
    });

    it("should obey the homomorphism law: of(f) <*> of(a) == of(f(a))", () => {
      const fn = (x: number) => x * 2;
      const arg = 3;

      const leftSide = ap(of(fn), of(arg));
      const rightSide = of(fn(arg));

      expect(asTag(leftSide)).toEqual(asTag(rightSide));
    });

    it("should obey the interchange law: a <*> of(x) == of(f => f(x)) <*> a", () => {
      const fn = (x: number) => x * 2;
      const arg = 3;
      const a = of(fn);

      const leftSide = ap(a, of(arg));
      const rightSide = ap(
        of((f: typeof fn) => f(arg)),
        a
      );

      expect(asTag(leftSide)).toEqual(asTag(rightSide));
    });

    it("should obey the composition law: of(compose) <*> u <*> v <*> w = u <*> (v <*> w)", () => {
      type Fn = (x: number) => number;
      const compose = (f: Fn) => (g: Fn) => (x: number) => f(g(x));
      const u = of((x: number) => x * 2);
      const v = of((x: number) => x + 3);
      const w = of(4);

      const leftSide = ap(ap(ap(of(compose), u), v), w);
      const rightSide = ap(u, ap(v, w));

      expect(asTag(leftSide)).toEqual(asTag(rightSide));
    });
  };
}
