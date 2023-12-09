import { HookContext } from '@shared/types';
import { ContextFrom, EventFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';

const timerModel = createModel(
  {
    minutes: 0,
    seconds: 0,
    type: 'pomo',
    autoStart: false,
  } as HookContext['timer'],
  {
    events: {
      START: () => ({}),
      PLAY: () => ({}),
      PAUSE: () => ({}),
      STOP: () => ({}),
      _TICK: () => ({}),
      UPDATE: (mins: number) => ({ data: mins }),
    },
  }
);

export type TimerContext = ContextFrom<typeof timerModel>;
export type TimerEvents = EventFrom<typeof timerModel>;

export default timerModel;
