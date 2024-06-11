export function pick<A extends Record<string, any>, B extends keyof A>(
  obj: A,
  keys: B[]
): Pick<A, B> {
  // @ts-expect-error I have no idea if it's possible to type this before dynamically adding the key,value pairs
  const picked: Pick<A, B> = {};

  keys.forEach((key) => {
    if (obj[key]) {
      picked[key] = obj[key];
    }
  });

  return picked;
}
