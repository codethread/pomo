// based on rust's Result Enum, this is a really basic functor and would probably make someone who knows FP cry
export type Result<O, E = string> = Err<O, E> | Ok<O, E>;

type SimpleResult<O, E> = Pick<Err<O, E>, 'ok' | 'reason'> | Pick<Ok<O, E>, 'ok' | 'val'>;

export const strip = <A, B>(result: Result<A, B>): SimpleResult<A, B> =>
  result.match({
    Ok: (val) => ({ ok: true, val }),
    Err: (reason) => ({ ok: false, reason }),
  });

export const reBuild = <A, B>(result: SimpleResult<A, B>): Result<A, B> =>
  result.ok ? ok(result.val) : err(result.reason);

export const ok = <O, E = string>(arg: O): Ok<O, E> => ({
  ok: true,
  val: arg,
  map: (cb) => ok(cb(arg)),
  errMap: () => ok(arg),
  flatMap: (cb) => cb(arg),
  chain: async (cb) => cb(arg),
  match: ({ Ok }) => Ok(arg),
  expect: () => arg,
});

export const err = <E = string, O = string>(arg: E): Err<O, E> => ({
  ok: false,
  reason: arg,
  map: () => err(arg),
  errMap: (cb) => err(cb(arg)),
  flatMap: () => err(arg),
  chain: async () => Promise.resolve(err(arg)),
  match: ({ Err }) => Err(arg),
  expect: (message) => {
    throw new Error(message);
  },
});

// TODO there is an issue in here if you try to flatMap from two different error types, but I've spent too long on this already and most useful functionality is there
export interface Err<O, E = string> {
  ok: false;
  reason: E;
  map: <A>(cb: (arg: O) => A) => Result<A, E>;
  errMap: (cb: (arg: E) => E) => Result<O, E>;
  flatMap: <A>(cb: (arg: O) => Result<A, E>) => Result<A, E>;
  chain: <A>(cb: (arg: O) => Promise<Result<A, E>>) => Promise<Result<A, E>>;
  match: <R, T>(handlers: { Err: (e: E) => R; Ok: (o: O) => T }) => R;
  expect: (message: string) => O;
}

export interface Ok<O, E = string> {
  ok: true;
  val: O;
  map: <A>(cb: (arg: O) => A) => Result<A, E>;
  errMap: (cb: (arg: E) => E) => Result<O, E>;
  flatMap: <A>(cb: (arg: O) => Result<A, E>) => Result<A, E>;
  chain: <A>(cb: (arg: O) => Promise<Result<A, E>>) => Promise<Result<A, E>>;
  match: <R, T>(handlers: { Err: (e: E) => R; Ok: (o: O) => T }) => T;
  expect: (message: string) => O;
}

export const isErr = <O, E>(result: Result<O, E>): result is Err<O, E> => !result.ok;
export const isOk = <O, E>(result: Result<O, E>): result is Ok<O, E> => result.ok;

export function tupleResult<A, B, C>(
  result1: Result<A, B>,
  result2: Result<C, B>
): Result<[A, C], B> {
  return result1.flatMap((ok1) => result2.map((ok2) => [ok1, ok2]));
}
