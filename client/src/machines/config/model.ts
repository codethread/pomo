import { DeepPartial, emptyConfig, UserConfig } from '@shared/types';
import { ContextFrom, EventFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';

export const configModel = createModel(emptyConfig, {
  events: {
    RESET: () => ({}),
    REQUEST_CONFIG: () => ({}),
    UPDATE: (data: DeepPartial<UserConfig>) => ({ data }),
  },
});

export type ConfigContext = ContextFrom<typeof configModel>;
export type ConfitEvents = EventFrom<typeof configModel>;
