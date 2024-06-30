import { pick } from './pick';

describe('pick', () => {
  it('should pick keys from an object', () => {
    const obj = {
      a: 2,
      b: 'foo',
      c: true,
    };
    const picked = pick(obj, ['a', 'c']);

    expect(picked).toStrictEqual(
      expect.objectContaining<typeof picked>({
        a: 2,
        c: true,
      }),
    );

    expect(picked.a.toFixed(1)).toBe((2).toFixed(1));
  });

  it('should support invalid keys, even though it should be impossible due to types', () => {
    const obj = {
      a: 2,
      b: 'foo',
      c: true,
    };

    // @ts-expect-error deliberate error for tests
    const picked = pick(obj, ['d']);

    expect(picked).toStrictEqual({});
  });
});
