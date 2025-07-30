import { formatTrayTime } from '@shared/formatTrayTime';
import { TimerHooks, type IBridge } from '@shared/types';

export const osHooks: TimerHooks = {
  onTickHook: ({
    bridge,
    timer,
    config: { displayTimerInStatusBar, macos },
  }) => {
    if (displayTimerInStatusBar) {
      bridge.setTrayTitle(formatTrayTime(timer));
    }
    if (macos?.hooks.onTickHook) runAllHooks(bridge, macos.hooks.onTickHook);
  },
  onStartHook: ({ bridge, config: { macos } }) => {
    bridge.setTrayIcon('active');
    if (macos?.hooks.onStartHook) runAllHooks(bridge, macos.hooks.onStartHook);
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

async function runAllHooks(bridge: IBridge, cmds: string[]): Promise<void> {
  for (const cmd of cmds) {
    await bridge.macosShorcutsRun(cmd);
  }
}
