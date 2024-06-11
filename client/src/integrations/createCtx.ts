import { merge } from '@shared/merge';
import { DeepPartial, emptyConfig, HookContext, IBridge } from '@shared/types';
import { createFakeBridge } from '@client/testHelpers/createFakeBridge';
import { Mock } from 'vitest';

type Spies = Record<keyof IBridge, Mock>;

export interface TestSetup {
  ctx: HookContext;
  spies: Spies;
}

export function createCtx(overrides?: DeepPartial<HookContext>): TestSetup {
  const bridge = createFakeBridge();
  const spies = {
    ...Object.keys(bridge).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: vi.fn(),
      }),
      {} as Spies
    ),
  };

  const config = merge(
    emptyConfig,
    {
      slack: {
        enabled: true,
        slackDomain: 'slackUrl',
        slackDCookie: 'slackDCookie',
        slackDSCookie: 'slackDSCookie',
        slackToken: 'slackToken',
      },
    },
    overrides?.config
  );

  const ctx: HookContext = {
    bridge: spies,
    config,
    timer: {
      id: 'ctx id',
      autoStart: false,
      minutes: 17,
      seconds: 3,
      type: 'pomo',
    },
  };

  return { ctx: merge(ctx, overrides), spies };
}
