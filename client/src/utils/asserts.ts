export function assertIsError(err: any): asserts err is Error {
  if (!(err instanceof Error)) {
    throw new Error(`not an error ${JSON.stringify(err)}`);
  }
}

export const validNodenvs = ["production", "development", "test"] as const;

export type Nodenv = (typeof validNodenvs)[number];

export function assertValidNodenv(env: string): asserts env is Nodenv {
  if (!validNodenvs.includes(env as Nodenv)) {
    throw new Error(`node_env of "${env}" is invalid`);
  }
}

export function assertUnreachable(branch: never): never {
  throw new Error(
    `This should not be reachable, likely there is a missing condition or switch case for branch ${
      branch as string
    }`,
  );
}
