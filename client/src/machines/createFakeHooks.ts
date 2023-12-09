import { TimerHooks } from '@shared/types';

export function createFakeHooks(): TimerHooks {
  return {
    onTickHook: () => {},
    onStartHook: () => {},
    onPauseHook: () => {},
    onPlayHook: () => {},
    onStopHook: () => {},
    onCompleteHook: () => {},
  };
}
