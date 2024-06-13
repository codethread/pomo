import { TimerContext } from '@client/machines/timer/model';
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
  onCompleteHook: ({ bridge, config, timer }) => {
    if (timer.type === 'pomo') {
      bridge.statsTimerComplete(config.timers.pomo * 60 - toSeconds(timer));
    }
  },
};

function toSeconds(timer: TimerContext) {
  return timer.minutes * 60 + timer.seconds;
}
