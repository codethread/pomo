import { createModel } from 'xstate/lib/model';
import { IBridge, UserConfig } from '@shared/types';
import { ContextFrom, EventFrom } from 'xstate';
import { TimerContext } from '../timer/model';

const mainModel = createModel(
  {
    loaded: false,
    config: {} as UserConfig,
  },
  {
    events: {
      CONFIG_LOADED: (data: UserConfig) => ({ data }),
      TIMER_START: (data: TimerContext) => ({ data }),
      TIMER_TICK: (data: TimerContext) => ({ data }),
      TIMER_PLAY: (data: TimerContext) => ({ data }),
      TIMER_PAUSE: (data: TimerContext) => ({ data }),
      TIMER_STOP: (data: TimerContext) => ({ data }),
      TIMER_COMPLETE: (data: TimerContext) => ({ data }),
    },
  }
);

export type MainContext = ContextFrom<typeof mainModel>;
export type MainEvents = EventFrom<typeof mainModel>;
export default mainModel;
