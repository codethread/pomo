import { DeepPartial } from '@shared/types';
import _merge from 'lodash.mergewith';

const union = <A, B>(a: A, b: B): A & B => _merge({}, a, b);

export function merge<A, B extends DeepPartial<A> | undefined>(
  a: A,
  ...b: B[]
): A {
  return _merge({}, a, ...b, customizer);
}

function customizer(objValue: any, srcValue: any) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}
