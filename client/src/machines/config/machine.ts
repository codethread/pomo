import { formatTrayTime } from '@shared/formatTrayTime';
import { DeepPartial, IBridge, UserConfig } from '@shared/types';
import { ActorRefFrom, assign, createMachine, InterpreterFrom, sendParent } from 'xstate';
import { respond } from 'xstate/lib/actions';
import { actorIds } from '../constants';
import mainModel from '../main/model';
import { createContext, timerSettingsMachine } from '../timerSettings/machine';
import { ConfigContext, configModel, ConfitEvents } from './model';

export interface IConfigMachine {
  bridge: IBridge;
  /**
   * Inject a config as a testing mechanism
   */
  configOverride?: UserConfig;
}

export default function configMachine({ bridge, configOverride }: IConfigMachine) {
  return createMachine(
    {
      id: 'config',
      tsTypes: {} as import('./machine.typegen').Typegen0,
      schema: {
        context: {} as ConfigContext,
        events: {} as ConfitEvents,
        services: {} as {
          loadConfig: { data: UserConfig };
          updateConfig: { data: UserConfig };
          resetConfig: { data: UserConfig };
        },
      },
      context: configModel.initialContext,
      initial: 'loading',
      states: {
        loading: {
          tags: ['loading'],
          invoke: {
            id: 'loadConfig',
            src: 'loadConfig',
            onDone: {
              actions: 'storeConfig',
              target: 'loaded',
            },
            onError: {
              target: 'loaded',
            },
          },
        },
        loaded: {
          type: 'parallel',
          states: {
            settings: {
              invoke: {
                id: actorIds.TIMER_SETTINGS,
                src: timerSettingsMachine,
                data: ({ timers }) =>
                  createContext({
                    long: { value: timers.long },
                    short: { value: timers.short },
                    pomo: { value: timers.pomo },
                  }),
              },
            },
            config: {
              initial: 'idle',
              states: {
                idle: {
                  tags: ['idle'],
                  entry: 'broadcastConfig',
                  on: {
                    UPDATE: 'updating',
                    RESET: 'resetting',
                    REQUEST_CONFIG: { actions: 'respondWithConfig' },
                  },
                },
                updating: {
                  tags: ['updating'],
                  invoke: {
                    id: 'updateConfig',
                    src: 'updateConfig',
                    onDone: {
                      actions: 'storeConfig',
                      target: 'idle',
                    },
                    onError: {
                      target: 'idle',
                    },
                  },
                },
                resetting: {
                  tags: ['updating'],
                  invoke: {
                    id: 'resetConfig',
                    src: 'resetConfig',
                    onDone: {
                      actions: 'storeConfig',
                      target: 'idle',
                    },
                    onError: {
                      target: 'idle',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      services: {
        loadConfig: async () => {
          if (configOverride) {
            return configOverride;
          }

          const r = await bridge.storeRead();
          return r.match({
            Ok: (config) => config,
            Err: (e) => {
              bridge.warn(e);
              throw new Error();
            },
          });
        },
        resetConfig: async () => {
          const res = await bridge.storeReset();
          return res.match({
            Ok: (config) => config,
            Err: (e) => {
              bridge.warn(e);
              throw new Error();
            },
          });
        },
        updateConfig: async (c, e) => {
          const res = await bridge.storeUpdate(e.data);
          return res.match({
            Ok: (config) => {
              updateIntegrations(e.data, bridge, c);
              return config;
            },
            Err: (er) => {
              bridge.warn(er);
              throw new Error();
            },
          });
        },
      },
      actions: {
        broadcastConfig: sendParent((c) => mainModel.events.CONFIG_LOADED(c)),
        respondWithConfig: respond((c) => mainModel.events.CONFIG_LOADED(c)),
        storeConfig: assign((_, { data }) => data),
      },
    }
  );
}

type ConfigMachine = ReturnType<typeof configMachine>;

export type ConfigService = InterpreterFrom<ConfigMachine>;

export type ConfigActorRef = ActorRefFrom<ConfigMachine>;

function updateIntegrations(
  data: DeepPartial<UserConfig>,
  bridge: IBridge,
  { timers }: ConfigContext
) {
  const { displayTimerInStatusBar } = data;
  if (displayTimerInStatusBar !== undefined) {
    if (displayTimerInStatusBar) {
      bridge.setTrayTitle(
        formatTrayTime({
          minutes: timers.pomo,
          seconds: 0,
        })
      );
    } else {
      bridge.setTrayTitle('');
    }
  }
}
