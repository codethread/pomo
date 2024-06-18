import { ActorRefFrom, assign, createMachine, sendParent, sendTo } from 'xstate';
import pomodoroModel from '../pomodoro/model';
import model, { TimerContext, TimerEvents } from './model';

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
    context: model.initialContext,
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

      onStartHook: sendParent((c) => pomodoroModel.events.TIMER_START(c)),
      onPauseHook: sendParent((c) => pomodoroModel.events.TIMER_PAUSE(c)),
      onPlayHook: sendParent((c) => pomodoroModel.events.TIMER_PLAY(c)),
      onStopHook: sendParent((c) => pomodoroModel.events.TIMER_STOPPED(c)),
      onTickHook: sendParent((c) => pomodoroModel.events.TIMER_TICK(c)),
      onCompleteHook: sendParent((c) => pomodoroModel.events.TIMER_COMPLETE(c)),

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
