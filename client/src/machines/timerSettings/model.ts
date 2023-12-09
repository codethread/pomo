import { UserConfig } from '@shared/types';
import { ContextFrom, EventFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';

export interface TimerSettingsContext {
  pomo: {
    value: number;
    error?: string;
  };
  short: {
    value: number;
    error?: string;
  };
  long: {
    value: number;
    error?: string;
  };
}

export const timerSettingsModel = createModel(
  {
    pomo: {
      value: 1,
      error: undefined,
    },
    short: {
      value: 1,
      error: undefined,
    },
    long: {
      value: 1,
      error: undefined,
    },
  },
  {
    events: {
      CONFIG_LOADED: (data: UserConfig) => ({ data }),
      UPDATE: (key: 'long' | 'pomo' | 'short', value: number) => ({ data: { key, value } }),
      CANCEL: () => ({}),
      SAVE: () => ({}),
    },
  }
);

export type TimerSettingsEvents = EventFrom<typeof timerSettingsModel>;
