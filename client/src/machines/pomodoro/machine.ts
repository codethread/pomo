import { merge } from '@shared/merge';
import { DeepPartial, UserConfig, emptyConfig } from '@shared/types';
import {
  ActorRefFrom,
  assign,
  createMachine,
  InterpreterFrom,
  send,
  sendParent,
} from 'xstate';
import { actorIds } from '../constants';
import timerMachine from '../timer/machine';
import { ClockMachine } from '../clock/machine';
import { TimerContext } from '../timer/machine';

const initialContext = {
  completed: {
    pomo: 0,
    short: 0,
    long: 0,
  },
  longBreakEvery: emptyConfig.longBreakEvery,
  timers: emptyConfig.timers,
  autoStart: emptyConfig.autoStart,
};

export type PomodoroEvents =
  | { type: 'CONFIG_LOADED'; data: UserConfig }
  | { type: 'TIMER_COMPLETE'; data: TimerContext }
  | { type: 'TIMER_STOPPED'; data: TimerContext }
  | { type: 'TIMER_START'; data: TimerContext }
  | { type: 'TIMER_TICK'; data: TimerContext }
  | { type: 'TIMER_PLAY'; data: TimerContext }
  | { type: 'TIMER_PAUSE'; data: TimerContext };

export type PomodoroModel = typeof initialContext;

function pomodoroMachine({ context, clock }: IPomodoroMachine) {
  return createMachine(
    {
      id: 'pomodoroMachine',
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import('./machine.typegen').Typegen0,
      schema: {
        context: {} as PomodoroModel,
        events: {} as PomodoroEvents,
      },
      context: merge(initialContext, context),
      initial: 'loading',
      on: {
        TIMER_START: { actions: 'onStartHook' },
        TIMER_PAUSE: { actions: 'onPauseHook' },
        TIMER_PLAY: { actions: 'onPlayHook' },
        TIMER_TICK: { actions: 'onTickHook' },
      },
      states: {
        loading: {
          on: {
            CONFIG_LOADED: {
              actions: 'updateTimerConfig',
              target: 'pomo',
            },
          },
        },
        pomo: {
          invoke: {
            id: actorIds.TIMER,
            src: timerMachine.withConfig({ services: { clock } }),
            data: ({ timers: { pomo }, autoStart: { beforePomo } }) => {
              const s: TimerContext = {
                minutes: pomo,
                seconds: 0,
                type: 'pomo',
                autoStart: beforePomo,
                id: Math.random().toFixed(6).slice(2, -1),
                target: pomo,
              };
              return s;
            },
          },
          on: {
            TIMER_STOPPED: { target: 'pomo', actions: ['onStopHook'] },
            TIMER_COMPLETE: {
              target: 'breakDecision',
              actions: ['increasePomoCount', 'onCompleteHook'],
            },
            CONFIG_LOADED: {
              actions: ['updateTimerConfig', 'updatePomoTimerConfig'],
            },
          },
        },
        breakDecision: {
          always: [
            { cond: 'isLongBreak', target: 'long' },
            { target: 'short' },
          ],
        },
        short: {
          invoke: {
            id: actorIds.TIMER,
            src: timerMachine.withConfig({ services: { clock } }),
            data: ({ timers: { short }, autoStart: { beforeShortBreak } }) => {
              const t: TimerContext = {
                minutes: short,
                seconds: 0,
                type: 'short',
                autoStart: beforeShortBreak,
                id: Math.random().toFixed(6).slice(2, -1),
                target: short,
              };
              return t;
            },
          },
          on: {
            TIMER_COMPLETE: { target: 'pomo', actions: 'onCompleteHook' },
            TIMER_STOPPED: { target: 'pomo', actions: 'onStopHook' },
            CONFIG_LOADED: { actions: 'updateTimerConfig' },
          },
          exit: 'increaseShortBreakCount',
        },
        long: {
          invoke: {
            id: actorIds.TIMER,
            src: timerMachine.withConfig({ services: { clock } }),
            data: ({ timers: { long }, autoStart: { beforeLongBreak } }) => {
              const t: TimerContext = {
                minutes: long,
                seconds: 0,
                type: 'long',
                autoStart: beforeLongBreak,
                id: Math.random().toFixed(6).slice(2, -1),
                target: long,
              };
              return t;
            },
          },
          on: {
            TIMER_COMPLETE: { target: 'pomo', actions: 'onCompleteHook' },
            TIMER_STOPPED: { target: 'pomo', actions: 'onStopHook' },
            CONFIG_LOADED: { actions: 'updateTimerConfig' },
          },
          exit: 'increaseLongBreakCount',
        },
      },
    },
    {
      guards: {
        isLongBreak: ({ completed: { pomo }, longBreakEvery }) =>
          pomo !== 0 && pomo % longBreakEvery === 0,
      },

      actions: {
        updateTimerConfig: assign(
          (ctx, { data: { timers, autoStart, longBreakEvery } }) => ({
            ...ctx,
            longBreakEvery,
            timers,
            autoStart,
            completed: initialContext.completed,
          }),
        ),

        increasePomoCount: assign({
          completed: ({ completed }) => ({
            ...completed,
            pomo: completed.pomo + 1,
          }),
        }),

        increaseShortBreakCount: assign({
          completed: ({ completed }) => ({
            ...completed,
            short: completed.short + 1,
          }),
        }),

        increaseLongBreakCount: assign({
          completed: ({ completed }) => ({
            ...completed,
            long: completed.long + 1,
          }),
        }),

        updatePomoTimerConfig: send(
          (_, { data: { timers } }) => ({ type: 'UPDATE', data: timers.pomo }),
          { to: actorIds.TIMER },
        ),

        onPauseHook: sendParent((_, { data }) => ({
          type: 'TIMER_PAUSE',
          data,
        })),
        onStartHook: sendParent((_, { data }) => ({
          type: 'TIMER_START',
          data,
        })),
        onPlayHook: sendParent((_, { data }) => ({ type: 'TIMER_PLAY', data })),
        onStopHook: sendParent((_, { data }) => ({ type: 'TIMER_STOP', data })),
        onTickHook: sendParent((_, { data }) => ({ type: 'TIMER_TICK', data })),
        onCompleteHook: sendParent((_, { data }) => ({
          type: 'TIMER_COMPLETE',
          data,
        })),
      },
    },
  );
}

type PomodoroMachine = ReturnType<typeof pomodoroMachine>;

export type PomodoroService = InterpreterFrom<PomodoroMachine>;

export type PomodoroActorRef = ActorRefFrom<PomodoroMachine>;

export interface IPomodoroMachine {
  context?: DeepPartial<PomodoroModel>;
  clock: ClockMachine;
}

export default pomodoroMachine;
