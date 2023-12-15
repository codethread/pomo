import { setupBridge } from '@client/bridge/setup';
import { IBridge } from '@shared/types';

export type Spies = Record<keyof IBridge, vi.Mock>;

export function createFakeBridge(overrides?: Partial<Spies>): Spies {
  const handlerMethods = setupBridge();
  return {
    ...Object.keys(handlerMethods).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: vi.fn(),
      }),
      {} as Spies
    ),
    ...overrides,
  };
}
