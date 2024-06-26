// eslint-disable-next-line
import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

interface CustomMatchers<R = unknown> {
  toMatchResult<A, B>(expected: Result<A, B>): R;
}

declare module 'vitest' {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
