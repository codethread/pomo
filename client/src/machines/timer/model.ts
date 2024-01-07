import { HookContext } from '@shared/types';
import { ContextFrom, EventFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';

const timerModel = createModel(
  {
    id: '',
    minutes: 0,
    seconds: 0,
    type: 'pomo',
    autoStart: false,
    started: false,
  } as HookContext['timer'],
  {
    events: {
      START: () => ({}),
      PLAY: () => ({}),
      PAUSE: () => ({}),
      STOP: () => ({}),
      _TICK: () => ({}),
      NOPE: () => ({}),
      UPDATE: (mins: number) => ({ data: mins }),
      FORCE_UPDATE: (seconds: number, minutes: number) => ({ minutes, seconds }),
    },
  }
);

export type TimerContext = ContextFrom<typeof timerModel>;
export type TimerEvents = EventFrom<typeof timerModel>;

export default timerModel;
