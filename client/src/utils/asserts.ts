/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function assertIsError(err: any): asserts err is Error {
  if (!(err instanceof Error)) throw err;
}

export const validNodenvs = ['production', 'development', 'test'] as const;

export type Nodenv = typeof validNodenvs[number];

export function assertValidNodenv(env: string): asserts env is Nodenv {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (!validNodenvs.includes(env as Nodenv)) {
    throw new Error(`node_env of "${env}" is invalid`);
  }
}

export function assertUnreachable(branch: never): never {
  throw new Error(
    `This should not be reachable, likely there is a missing condition or switch case for branch ${
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      branch as string
    }`
  );
}
