import { assertUnreachable } from '@shared/asserts';
import { merge } from '@shared/merge';
import { ActorRefFrom, assign, createMachine, InterpreterFrom, sendParent } from 'xstate';
import { configModel } from '../config/model';
import { TimerSettingsContext, TimerSettingsEvents } from './model';
import { parsePomoError } from './validations';

export function createContext(ctx: TimerSettingsContext) {
  return ctx;
}

export const timerSettingsMachine = createMachine(
  {
    id: 'timerSettingsMachine',
    schema: {
      context: {} as TimerSettingsContext,
      events: {} as TimerSettingsEvents,
    },
    tsTypes: {} as import('./machine.typegen').Typegen0,
    initial: 'idle',
    states: {
      idle: {
        tags: ['idle'],
        on: {
          UPDATE: { target: 'checking', actions: ['updateSetting', 'validateSetting'] },
        },
      },
      valid: {
        tags: ['editing'],
        on: {
          UPDATE: { target: 'checking', actions: ['updateSetting', 'validateSetting'] },
          SAVE: { actions: 'saveSettings', target: 'idle' },
          CANCEL: 'resetting',
        },
      },
      invalid: {
        tags: ['editing', 'errors'],
        on: {
          UPDATE: { target: 'checking', actions: ['updateSetting', 'validateSetting'] },
          CANCEL: 'resetting',
        },
      },
      checking: {
        tags: ['editing'],
        always: [
          {
            cond: 'hasError',
            target: 'invalid',
          },
          {
            target: 'valid',
          },
        ],
      },
      resetting: {
        entry: [sendParent(configModel.events.REQUEST_CONFIG())],
        on: {
          CONFIG_LOADED: { actions: 'storeConfig', target: 'idle' },
        },
      },
    },
  },
  {
    guards: {
      hasError: (c) => Object.values(c).some(({ error }) => Boolean(error)),
    },
    actions: {
      storeConfig: assign({
        long: (_, { data }) => ({ value: data.timers.long }),
        short: (_, { data }) => ({ value: data.timers.short }),
        pomo: (_, { data }) => ({ value: data.timers.pomo }),
      }),
      saveSettings: sendParent((c) =>
        configModel.events.UPDATE({
          timers: {
            long: c.long.value,
            pomo: c.pomo.value,
            short: c.short.value,
          },
        })
      ),
      updateSetting: assign((c, { data }) => merge(c, { [data.key]: { value: data.value } })),
      validateSetting: assign((c, { data }) => {
        switch (data.key) {
          case 'pomo': {
            return {
              ...c,
              pomo: {
                ...c.pomo,
                error: parsePomoError(data.value),
              },
            };
          }
          case 'short':
            return {
              ...c,
              short: {
                ...c.short,
                error: parsePomoError(data.value),
              },
            };
          case 'long':
            return {
              ...c,
              long: {
                ...c.long,
                error: parsePomoError(data.value),
              },
            };
          default:
            return assertUnreachable(data.key);
        }
      }),
    },
  }
);

type TimerSettingsMachine = typeof timerSettingsMachine;

export type TimerSettingsService = InterpreterFrom<TimerSettingsMachine>;

export type TimerSettingsActorRef = ActorRefFrom<TimerSettingsMachine>;
