import { formatTrayTime } from "@shared/formatTrayTime";
import {
  DeepPartial,
  IBridge,
  UserConfig,
  UserConfigSchema,
  emptyConfig,
} from "@shared/types";
import {
  ActorRefFrom,
  assign,
  createMachine,
  InterpreterFrom,
  sendParent,
} from "xstate";
import { fromError } from "zod-validation-error";

export interface IConfigMachine {
  bridge: IBridge;
}

const initialContext = emptyConfig;

export type ConfigContext = typeof initialContext;
export type ConfitEvents =
  | { type: "RESET" }
  | { type: "UPDATE"; data: DeepPartial<UserConfig> };

export default function configMachine({ bridge }: IConfigMachine) {
  return createMachine(
    {
      id: "config",
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as ConfigContext,
        events: {} as ConfitEvents,
        services: {} as {
          loadConfig: { data: UserConfig };
          updateConfig: { data: UserConfig };
          resetConfig: { data: UserConfig };
        },
      },
      context: initialContext,
      initial: "loading",
      states: {
        loading: {
          tags: ["loading"],
          invoke: {
            id: "loadConfig",
            src: "loadConfig",
            onDone: {
              actions: "storeConfig",
              target: "loaded",
            },
            onError: {
              target: "loaded",
            },
          },
        },
        loaded: {
          initial: "idle",
          states: {
            idle: {
              tags: ["idle"],
              entry: "broadcastConfig",
              on: {
                UPDATE: "updating",
                RESET: "resetting",
              },
            },
            updating: {
              tags: ["updating"],
              invoke: {
                id: "updateConfig",
                src: "updateConfig",
                onDone: {
                  actions: "storeConfig",
                  target: "idle",
                },
                onError: {
                  target: "idle",
                },
              },
            },
            resetting: {
              tags: ["updating"],
              invoke: {
                id: "resetConfig",
                src: "resetConfig",
                onDone: {
                  actions: "storeConfig",
                  target: "idle",
                },
                onError: {
                  target: "idle",
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
          const r = await bridge.storeRead();
          bridge.debug({ storeRead: r });
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
          const parsed = UserConfigSchema.deepPartial()
            .strict()
            .safeParse(e.data);
          if (!parsed.success) {
            const e = fromError(parsed.error).toString();
            bridge.error(e);
            throw new Error(e);
          }
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
        broadcastConfig: sendParent((c) => ({
          type: "CONFIG_LOADED",
          data: c,
        })),
        storeConfig: assign((_, { data }) => data),
      },
    },
  );
}

type ConfigMachine = ReturnType<typeof configMachine>;

export type ConfigService = InterpreterFrom<ConfigMachine>;

export type ConfigActorRef = ActorRefFrom<ConfigMachine>;

function updateIntegrations(
  data: DeepPartial<UserConfig>,
  bridge: IBridge,
  { timers }: ConfigContext,
) {
  const { displayTimerInStatusBar } = data;
  if (displayTimerInStatusBar !== undefined) {
    if (displayTimerInStatusBar) {
      bridge.setTrayTitle(
        formatTrayTime({
          minutes: timers.pomo,
          seconds: 0,
        }),
      );
    } else {
      bridge.setTrayTitle("");
    }
  }
}
