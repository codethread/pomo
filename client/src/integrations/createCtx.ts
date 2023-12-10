import { merge } from '@shared/merge';
import { DeepPartial, emptyConfig, HookContext } from '@shared/types';
import { createFakeBridge, Spies } from '@client/testHelpers/createFakeBridge';

export interface TestSetup {
  ctx: HookContext;
  spies: Spies;
}

export function createCtx(overrides?: DeepPartial<HookContext>): TestSetup {
  const spies = createFakeBridge();

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
      autoStart: false,
      minutes: 17,
      seconds: 3,
      type: 'pomo',
    },
  };

  return { ctx: merge(ctx, overrides), spies };
}
