import { err, isErr, isOk, ok, reBuild, Result, strip, tupleResult } from './Result';

describe('Result', () => {
  describe('ok', () => {
    it('should create an Ok data structure', () => {
      const result = ok('foo');

      expect(result).toStrictEqual(
        expect.objectContaining({
          ok: true,
          val: 'foo',
        })
      );

      expect(isOk(result)).toBe(true);
      expect(isErr(result)).toBe(false);

      // test our custom matcher
      expect(result).toMatchResult(ok('foo'));
      expect(ok({ data: { nested: 4 } })).toMatchResult(ok({ data: { nested: 4 } }));
    });
  });

  describe('err', () => {
    it('should create an Err data structure', () => {
      const result = err('failed');

      expect(result).toStrictEqual(
        expect.objectContaining({
          ok: false,
          reason: 'failed',
        })
      );

      expect(isOk(result)).toBe(false);
      expect(isErr(result)).toBe(true);

      // test our custom matcher
      expect(result).toMatchResult(err('failed'));
      expect(err({ data: { nested: 4 } })).toMatchResult(err({ data: { nested: 4 } }));
    });
  });

  describe('boundary handlers to allow post message to move Result between processes', () => {
    it('should strip and rebuild an Ok -> Ok', () => {
      expect(reBuild(strip(ok('data')))).toMatchResult(ok('data'));
    });
    it('should strip and rebuild an Err -> Err', () => {
      expect(reBuild(strip(err(5)))).toMatchResult(err(5));
    });
  });

  describe('type assertions', () => {
    it('should narrow a Result to an Ok or Err', () => {
      const okResult = ok(' data ') as Result<string>;

      // @ts-expect-error this should error before the type narrowing
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      okResult.val.trim();

      if (isOk(okResult)) {
        expect(okResult.val.trim()).toBe('data');
      } else {
        throw new Error('Test failure, this branch of logic should never be true');
      }

      const errResult = err('fail') as Result<string>;

      // @ts-expect-error this should error before the type narrowing
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      errResult.reason.trim();

      if (isErr(errResult)) {
        expect(errResult.reason.trim()).toBe('fail');
      } else {
        throw new Error('Test failure, this branch of logic should never be true');
      }
    });
  });

  describe('conditional flows', () => {
    const toSpongeBob = (s: string) =>
      s
        .split('')
        .map((value, index) => (index % 2 === 0 ? value.toUpperCase() : value.toLowerCase()))
        .join('');

    const toUpper = (s: string) => s.toUpperCase();

    describe('map', () => {
      it('should allow working unknown Results to manipulate data', () => {
        const okResult = ok('here be data') as Result<string, string>;

        expect(okResult.map(toUpper)).toMatchResult(ok('HERE BE DATA'));
        expect(okResult.map(toUpper).map(toSpongeBob)).toMatchResult(ok('HeRe bE DaTa'));

        const errResult = err(42) as Result<string, number>;

        expect(errResult.map(toUpper)).toMatchResult(err(42));
        expect(errResult.map(toUpper).map(toSpongeBob)).toMatchResult(err(42));
      });
    });

    describe('errMap', () => {
      it('should allow operating on the error data in a Result', () => {
        const errResult = err('failed') as Result<number>;
        const okResult = ok(12345) as Result<number>;

        expect(okResult.errMap(toUpper)).toMatchResult(ok(12345));
        expect(errResult.errMap(toUpper)).toMatchResult(err('FAILED'));

        expect(okResult.errMap(toUpper).map((x) => x * 2)).toMatchResult(ok(24690));
        expect(errResult.map((x) => x * 2).errMap(toUpper)).toMatchResult(err('FAILED'));
      });
    });

    describe('flatMap', () => {
      it('should allow working unknown Results to manipulate data in ways that also return Results', () => {
        const okResult = ok('12345') as Result<string>;

        const tryToUpper: (s: string) => Result<string> = () => err('upper failed');
        const tryToSplit: (s: string) => Result<string[]> = (s) => ok(s.split(''));
        const tryToNumber: (s: string[]) => Result<number[]> = (s) => ok(s.map(Number));

        expect(okResult.flatMap(tryToUpper)).toMatchResult(err('upper failed'));
        expect(okResult.flatMap(tryToUpper).map(toSpongeBob)).toMatchResult(err('upper failed'));

        expect(okResult.flatMap(tryToSplit).flatMap(tryToNumber)).toMatchResult(
          ok([1, 2, 3, 4, 5])
        );

        const errResult = err('failed first') as Result<string>;

        expect(errResult.flatMap(tryToUpper)).toMatchResult(err('failed first'));
        expect(errResult.flatMap((x) => tryToUpper(x)).flatMap(tryToUpper)).toMatchResult(
          err('failed first')
        );
      });
    });

    describe('chain', () => {
      it('should allow working with unknown Results to manipulate data that return Promise Results', async () => {
        const okResult = ok('hi there') as Result<string>;
        const tryToUpper: (s: string) => Promise<Result<string>> = async () => err('upper failed');
        const tryToSpongeBob: (s: string) => Promise<Result<string>> = async (s) =>
          ok(toSpongeBob(s));

        expect(await okResult.chain(tryToUpper)).toMatchResult(err('upper failed'));
        expect(await okResult.chain(tryToSpongeBob)).toMatchResult(ok('Hi tHeRe'));

        const errResult = err('failed first') as Result<string>;
        const tryToNumber: (s: string) => Promise<Result<string>> = async () =>
          err('number failed');

        expect(await errResult.chain(tryToNumber)).toMatchResult(err('failed first'));
      });
    });

    describe('match', () => {
      it('should allow handling both err and ok results and only run the appropriate function', () => {
        const okResult = ok(5) as Result<number>;

        const result = okResult.match({
          Ok: (n) => 5 * n,
          Err: (e) => `fail: ${e}`,
        });

        expect(result).toBe(25);

        const errResult = err('burger') as Result<number>;

        const result2 = errResult.match({
          Ok: (n) => 5 * n,
          Err: (e) => `fail: ${e}`,
        });

        expect(result2).toBe('fail: burger');
      });
    });
  });

  describe('tupleResult', () => {
    it('should combine to Results in a tuple for easier mapping', () => {
      const okResult = ok('meaning of life') as Result<string>;
      const okResult2 = ok(42) as Result<number>;
      const errResult = err('failed first') as Result<string>;

      expect(tupleResult(okResult, okResult2).map(([a, b]) => `${a} ${b}`)).toMatchResult(
        ok('meaning of life 42')
      );
      expect(tupleResult(okResult, errResult).map(([a, b]) => a + b)).toMatchResult(
        err('failed first')
      );
    });
  });
});
