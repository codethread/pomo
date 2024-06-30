import { TimerContext } from '@client/machines/timer/machine';
import { TimerHooks } from '@shared/types';

export const statHooks: TimerHooks = {
  onTickHook() {},
  onStartHook: () => {},
  onPauseHook: () => {},
  onPlayHook: () => {},
  onStopHook: ({ bridge, config, timer }) => {
    if (timer.type === 'pomo') {
      bridge.statsTimerComplete(config.timers.pomo * 60 - toSeconds(timer));
    }
  },
  onCompleteHook: ({ bridge, timer }) => {
    if (timer.type === 'pomo') {
      bridge.statsTimerComplete(timer.target * 60);
    }
  },
};

function toSeconds(timer: TimerContext) {
  return timer.minutes * 60 + timer.seconds;
}
