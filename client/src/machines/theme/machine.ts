import { UserConfig } from '@shared/types';
import { ActorRefFrom, createMachine } from 'xstate';

interface Events {
  type: 'CONFIG_LOADED';
  data: UserConfig;
}

export const themeMachine = createMachine({
  schema: {
    events: {} as Events,
  },
  tsTypes: {} as import('./machine.typegen').Typegen0,
  id: 'theme',
  initial: 'ready',
  states: {
    ready: {
      on: {
        CONFIG_LOADED: { actions: ['updateTheme'] },
      },
    },
  },
});

export type ThemeActorRef = ActorRefFrom<typeof themeMachine>;
