import { formatTrayTime } from '@shared/formatTrayTime';
import { TimerHooks } from '@shared/types';

export const osHooks: TimerHooks = {
  onTickHook: ({
    bridge,
    timer,
    config: { displayTimerInStatusBar, macos },
  }) => {
    if (displayTimerInStatusBar) {
      bridge.setTrayTitle(formatTrayTime(timer));
    }
    if (macos?.hooks.onTickHook)
      bridge.macosShorcutsRun(macos.hooks.onTickHook);
  },
  onStartHook: ({ bridge, config: { macos } }) => {
    bridge.setTrayIcon('active');
    if (macos?.hooks.onStartHook)
      bridge.macosShorcutsRun(macos.hooks.onStartHook);
  },
  onStopHook: ({ bridge, config: { macos } }) => {
    bridge.setTrayTitle('');
    bridge.setTrayIcon('inactive');
    if (macos?.hooks.onStopHook)
      bridge.macosShorcutsRun(macos.hooks.onStopHook);
  },
  onCompleteHook: ({ bridge, config: { macos } }) => {
    bridge.windowFocus();
    bridge.setTrayTitle('');
    bridge.setTrayIcon('inactive');
    if (macos?.hooks.onCompleteHook)
      bridge.macosShorcutsRun(macos.hooks.onCompleteHook);
  },
  onPauseHook: ({ bridge, config: { macos } }) => {
    if (macos?.hooks.onPauseHook)
      bridge.macosShorcutsRun(macos.hooks.onPauseHook);
  },
  onPlayHook: ({ bridge, config: { macos } }) => {
    if (macos?.hooks.onPlayHook)
      bridge.macosShorcutsRun(macos.hooks.onPlayHook);
  },
};
