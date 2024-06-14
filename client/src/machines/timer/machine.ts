import { ActorRefFrom, assign, createMachine, sendParent, sendTo } from 'xstate';
import pomodoroModel from '../pomodoro/model';
import model, { TimerContext, TimerEvents } from './model';

const timerMachine = createMachine(
  {
    id: 'timer',
    initial: 'ready',
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
          UPDATE: { actions: 'updateTimerConfig' },
        },
        exit: 'onStartHook',
      },
      playing: {
        entry: ['startTimer'],
        on: {
          _TICK: [
            { cond: 'isTimerFinished', target: 'complete' },
            { actions: ['updateTimer', 'onTickHook'] },
          ],
          _COMPLETE: 'complete',
          FORCE_UPDATE: { actions: 'updateNow' },
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
      isTimerFinished: ({ minutes, seconds }) => minutes === 0 && seconds <= 1,

      shouldAutoStart: ({ autoStart }) => autoStart,
    },
    actions: {
      updateNow: assign((_, e) => ({
        minutes: e.minutes,
        seconds: e.seconds,
      })),
      updateTimer: assign(({ minutes, seconds }) =>
        seconds === 0 ? { minutes: minutes - 1, seconds: 59 } : { minutes, seconds: seconds - 1 }
      ),

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
    },
  }
);

export type TimerActorRef = ActorRefFrom<typeof timerMachine>;

export default timerMachine;
