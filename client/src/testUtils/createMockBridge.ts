import { IBridge } from '@shared/types';
import { handlerMethods } from '@electron/ipc/handlerMethods';

export type Spies = Record<keyof IBridge, jest.Mock>;

export function createMockBridge(): Spies {
  return Object.keys(handlerMethods).reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: jest.fn(),
    }),
    {} as Spies
  );
}
