import { formatTrayTime } from '@shared/formatTrayTime';
import { TimerHooks } from '@shared/types';

export const osHooks: TimerHooks = {
  onTickHook: ({ bridge, timer, config: { displayTimerInStatusBar } }) => {
    if (displayTimerInStatusBar) {
      bridge.setTrayTitle(formatTrayTime(timer));
    }
  },
  onStartHook: ({ bridge }) => {
    bridge.setTrayIcon('active');
  },
  onPauseHook: () => {},
  onPlayHook: () => {},
  onStopHook: ({ bridge }) => {
    bridge.setTrayTitle('');
    bridge.setTrayIcon('inactive');
  },
  onCompleteHook: ({ bridge }) => {
    bridge.windowFocus();
    bridge.setTrayTitle('');
    bridge.setTrayIcon('inactive');
  },
};
