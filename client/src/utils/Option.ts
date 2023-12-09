interface None<A> {
  _tag: 'none';
  map: <B>(f: (m: A) => B) => None<A>;
  get: (fallback: A) => A;
  match: <R, T>(handlers: { None: () => R; Some: (s: A) => T }) => R;
  expect: (errorMessage?: string) => A;
  else: (value: A) => Some<A>;
}

interface Some<A> {
  _tag: 'some';
  map: <B>(f: (m: A) => B) => Some<B>;
  get: (fallback: A) => A;
  match: <R, T>(handlers: { None: () => R; Some: (s: A) => T }) => T;
  expect: () => A;
  else: (value: A) => Some<A>;
}

export function some<A>(val: A): Some<A> {
  return {
    _tag: 'some',
    get: () => val,
    map: (fn) => some(fn(val)),
    match: ({ Some }) => Some(val),
    expect: () => val,
    else: () => some(val),
  };
}

export function none<A>(): None<A> {
  return {
    _tag: 'none',
    get: (fallback) => fallback,
    map: () => none(),
    match: ({ None }) => None(),
    expect: (errorMessage) => {
      throw new Error(errorMessage ?? 'Option was of type None, expected Some');
    },
    else: (val) => some(val),
  };
}

export type Option<A> = None<A> | Some<A>;
