/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { HookContext, TimerHooks } from '@shared/types';
import { osHooks } from './os';
import { slackHooks } from './slack';

export const hooks = createHooks();

function createHooks(): TimerHooks {
  const hookDic: TimerHooks = {
    onStartHook: () => {},
    onTickHook: () => {},
    onPauseHook: () => {},
    onPlayHook: () => {},
    onStopHook: () => {},
    onCompleteHook: () => {},
  };

  const keys = Object.keys(hookDic) as Array<keyof TimerHooks>;

  return keys.reduce(
    (all, hook) => ({
      ...all,
      [hook]: (ctx: HookContext) => {
        if (hook !== 'onTickHook') {
          // too annoying logging this every time
          ctx.bridge.info(`${hook} called`);
        }

        //-----------------------------------------------------------------------------
        // ADD INTEGRATIONS HERE
        //-----------------------------------------------------------------------------

        slackHooks[hook](ctx);
        osHooks[hook](ctx);

        //-----------------------------------------------------------------------------
      },
    }),
    {} as TimerHooks
  );
}
