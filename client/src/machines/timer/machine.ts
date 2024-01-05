import { ActorRefFrom, assign, createMachine } from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import pomodoroModel from '../pomodoro/model';
import model, { TimerContext, TimerEvents } from './model';
import { listen, once } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

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
    states: {
      ready: {
        always: [{ cond: 'shouldAutoStart', target: 'playing' }],
        on: {
          START: { target: 'playing' },
          UPDATE: { actions: 'updateTimerConfig' },
        },
        exit: 'onStartHook',
      },
      playing: {
        invoke: {
          id: 'updater',
          src: 'updater',
        },
        on: {
          _TICK: [
            { cond: 'isTimerFinished', target: 'complete' },
            { actions: ['updateTimer', 'onTickHook'] },
          ],
          FORCE_UPDATE: { actions: 'updateNow' },
          PAUSE: 'paused',
          STOP: 'stopped',
        },
      },
      paused: {
        entry: ['onPauseHook'],
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
        invoke: {
          id: 'stopper',
          src:
            ({ id }) =>
            () =>
              invoke('stop', { id }),
        },
        entry: ['onStopHook'],
        type: 'final',
      },
    },
  },
  {
    services: {
      updater:
        ({ seconds, minutes, id }) =>
        async (sendBack) => {
          console.log({ id });
          invoke('start', { seconds, minutes, timerid: id }).catch((e) => console.error(e));
          console.log('start');

          const list = await Promise.all([
            once(`setTime_${id}`, (e: any) => {
              sendBack({
                type: 'FORCE_UPDATE',
                seconds: e.payload.seconds as number,
                minutes: e.payload.minutes as number,
              });
            }),
            listen(`tick_${id}`, () => {
              sendBack('_TICK');
            }),
          ]);

          return () => list.forEach((c) => c());
        },
    },
    guards: {
      isTimerFinished: ({ minutes, seconds }) => minutes === 0 && seconds === 1,

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
      }),

      onStartHook: sendParent((c) => pomodoroModel.events.TIMER_START(c)),
      onPauseHook: sendParent((c) => pomodoroModel.events.TIMER_PAUSE(c)),
      onPlayHook: sendParent((c) => pomodoroModel.events.TIMER_PLAY(c)),
      onStopHook: sendParent((c) => pomodoroModel.events.TIMER_STOPPED(c)),
      onTickHook: sendParent((c) => pomodoroModel.events.TIMER_TICK(c)),
      onCompleteHook: sendParent((c) => pomodoroModel.events.TIMER_COMPLETE(c)),
    },
  }
);

export type TimerActorRef = ActorRefFrom<typeof timerMachine>;

export default timerMachine;
