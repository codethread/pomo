import { DeepPartial, UserConfig } from '@shared/types';
import { useActor } from '@xstate/react';
import { useConfigService } from './machines';

interface ConfigUpdaters {
  storeUpdate(config: DeepPartial<UserConfig>): void;
  storeReset(): void;
}

interface ConfigLoaded extends ConfigUpdaters {
  config: UserConfig;
  loading: false;
}

interface ConfigLoading extends ConfigUpdaters {
  config: null;
  loading: true;
}

type ConfigMaybe = ConfigLoaded | ConfigLoading;

export const useConfig = (): ConfigMaybe => {
  const config = useConfigService();

  const [state, send] = useActor(config);

  return {
    storeUpdate: (newConfig) => {
      send({ type: 'UPDATE', data: newConfig });
    },
    storeReset: () => {
      send({ type: 'RESET' });
    },
    ...(state.hasTag('loading') ?
      { loading: true, config: null }
    : { loading: false, config: state.context }),
  };
};
