import { ActorRefFrom, assign, createMachine, sendParent, sendTo } from 'xstate';
import { HookContext } from '@shared/types';

export type TimerContext = HookContext['timer'];

const initialContext: TimerContext = {
  id: '',
  target: 0,
  minutes: 0,
  seconds: 0,
  type: 'pomo',
  autoStart: false,
};

export type TimerEvents =
  | { type: 'START' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: '_TICK'; seconds: number; minutes: number }
  | { type: 'UPDATE'; data: number };

const timerMachine = createMachine(
  {
    id: 'timer',
    initial: 'ready',
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./machine.typegen').Typegen0,
    schema: {
      events: {} as TimerEvents,
      context: {} as TimerContext,
    },
    context: initialContext,
    invoke: {
      id: 'clock',
      src: 'clock',
    },
    states: {
      ready: {
        entry: ['createTimer'],
        always: [{ cond: 'shouldAutoStart', target: 'playing' }],
        on: {
          START: { target: 'playing' },
          UPDATE: { actions: ['updateTimerConfig', 'updateClock'] },
        },
        exit: 'onStartHook',
      },
      playing: {
        entry: ['startTimer'],
        on: {
          _TICK: [
            { cond: 'isTimerFinished', actions: ['updateTimer'], target: 'complete' },
            { actions: ['updateTimer', 'onTickHook'] },
          ],
          PAUSE: 'paused',
          STOP: 'stopped',
        },
      },
      paused: {
        entry: ['pauseTimer', 'onPauseHook'],
        on: {
          PLAY: { target: 'playing', actions: ['onPlayHook'] },
          STOP: 'stopped',
        },
      },
      complete: {
        entry: ['onCompleteHook'],
        type: 'final',
      },
      stopped: {
        entry: ['stopTimer', 'onStopHook'],
        type: 'final',
      },
    },
  },
  {
    guards: {
      isTimerFinished: (_, { minutes, seconds }) => minutes === 0 && seconds === 0,

      shouldAutoStart: ({ autoStart }) => autoStart,
    },
    actions: {
      updateTimer: assign((_, { minutes, seconds }) => ({ minutes, seconds })),

      updateTimerConfig: assign({
        minutes: (_, { data }) => data,
        target: (_, { data }) => data,
      }),

      onStartHook: sendParent((c) => ({ type: 'TIMER_START', data: c })),
      onPauseHook: sendParent((c) => ({ type: 'TIMER_PAUSE', data: c })),
      onPlayHook: sendParent((c) => ({ type: 'TIMER_PLAY', data: c })),
      onStopHook: sendParent((c) => ({ type: 'TIMER_STOPPED', data: c })),
      onTickHook: sendParent((c) => ({ type: 'TIMER_TICK', data: c })),
      onCompleteHook: sendParent((c) => ({ type: 'TIMER_COMPLETE', data: c })),

      createTimer: sendTo('clock', (c) => ({ type: 'create', data: c })),
      startTimer: sendTo('clock', (c) => ({ type: 'play', data: c })),
      pauseTimer: sendTo('clock', (c) => ({ type: 'pause', data: c })),
      stopTimer: sendTo('clock', (c) => ({ type: 'stop', data: c })),
      updateClock: sendTo('clock', (c) => ({ type: 'update', data: c })),
    },
  }
);

export type TimerActorRef = ActorRefFrom<typeof timerMachine>;

export default timerMachine;
