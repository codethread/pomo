import { DeepPartial } from '@shared/types';
import _merge from 'lodash.merge';

export const union = <A, B>(a: A, b: B): A & B => _merge({}, a, b);

export function merge<A, B extends DeepPartial<A> | undefined>(a: A, ...b: B[]): A {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return _merge({}, a, ...b);
}
