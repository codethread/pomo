/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Recursively Object.freeze() on objects and functions
 * @see https://github.com/substack/deep-freeze
 * @param o Object on which to lock the attributes
 */
export function deepFreeze<T extends Record<string, any>>(o: T): Readonly<T> {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach((prop) => {
    if (
      // eslint-disable-next-line no-prototype-builtins
      o.hasOwnProperty(prop) &&
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });

  return o;
}
