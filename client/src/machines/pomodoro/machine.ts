import { merge } from '@shared/merge';
import { DeepPartial } from '@shared/types';
import {
  ActorRefFrom,
  assign,
  ContextFrom,
  createMachine,
  InterpreterFrom,
  send,
  sendParent,
} from 'xstate';
import { actorIds } from '../constants';
import timerMachine from '../timer/machine';
import timerModel, { TimerContext } from '../timer/model';
import mainModel from '../main/model';
import model, { PomodoroEvents, PomodoroModel } from './model';

function pomodoroMachine({ context }: IPomodoroMachine) {
  return createMachine(
    {
      id: 'pomodoroMachine',
      tsTypes: {} as import('./machine.typegen').Typegen0,
      schema: {
        context: {} as PomodoroModel,
        events: {} as PomodoroEvents,
      },
      context: merge(model.initialContext, context),
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
            src: timerMachine,
            data: ({ timers: { pomo }, autoStart: { beforePomo } }) =>
              ({ minutes: pomo, seconds: 0, type: 'pomo', autoStart: beforePomo } as TimerContext),
          },
          on: {
            TIMER_STOPPED: { target: 'pomo', actions: ['onStopHook'] },
            TIMER_COMPLETE: {
              target: 'breakDecision',
              actions: ['increasePomoCount', 'onCompleteHook'],
            },
            CONFIG_LOADED: { actions: ['updateTimerConfig', 'updatePomoTimerConfig'] },
          },
        },
        breakDecision: {
          always: [{ cond: 'isLongBreak', target: 'long' }, { target: 'short' }],
        },
        short: {
          invoke: {
            id: actorIds.TIMER,
            src: timerMachine,
            data: ({ timers: { short }, autoStart: { beforeShortBreak } }) =>
              ({
                minutes: short,
                seconds: 0,
                type: 'short',
                autoStart: beforeShortBreak,
              } as TimerContext),
            onDone: { target: 'pomo' },
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
            src: timerMachine,
            data: ({ timers: { long }, autoStart: { beforeLongBreak } }) =>
              ({
                minutes: long,
                seconds: 0,
                type: 'long',
                autoStart: beforeLongBreak,
              } as TimerContext),
            onDone: { target: 'pomo' },
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
        updateTimerConfig: assign((ctx, { data: { timers, autoStart, longBreakEvery } }) => ({
          ...ctx,
          longBreakEvery,
          timers,
          autoStart,
        })),

        increasePomoCount: assign({
          completed: ({ completed }) => ({ ...completed, pomo: completed.pomo + 1 }),
        }),

        increaseShortBreakCount: assign({
          completed: ({ completed }) => ({ ...completed, short: completed.short + 1 }),
        }),

        increaseLongBreakCount: assign({
          completed: ({ completed }) => ({ ...completed, long: completed.long + 1 }),
        }),

        updatePomoTimerConfig: send(
          (_, { data: { timers } }) => timerModel.events.UPDATE(timers.pomo),
          { to: actorIds.TIMER }
        ),

        onPauseHook: sendParent((_, { data }) => mainModel.events.TIMER_PAUSE(data)),
        onStartHook: sendParent((_, { data }) => mainModel.events.TIMER_START(data)),
        onPlayHook: sendParent((_, { data }) => mainModel.events.TIMER_PLAY(data)),
        onStopHook: sendParent((_, { data }) => mainModel.events.TIMER_STOP(data)),
        onTickHook: sendParent((_, { data }) => mainModel.events.TIMER_TICK(data)),
        onCompleteHook: sendParent((_, { data }) => mainModel.events.TIMER_COMPLETE(data)),
      },
    }
  );
}

type PomodoroMachine = ReturnType<typeof pomodoroMachine>;

export type PomodoroService = InterpreterFrom<PomodoroMachine>;

export type PomodoroActorRef = ActorRefFrom<PomodoroMachine>;

export interface IPomodoroMachine {
  context?: DeepPartial<ContextFrom<typeof model>>;
}

export default pomodoroMachine;
