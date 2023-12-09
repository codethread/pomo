import { SlackAuth } from '@electron/repositories/slack/slack';
import { TimerHooks, UserConfig } from '@shared/types';
import { timeInFuture } from './clock';

export const slackHooks: TimerHooks = {
  onTickHook: ({ bridge, config, timer: { minutes, seconds, type } }) => {
    const slackAuth = getSlackAuth(config);

    if (type === 'pomo' && seconds === 0 && minutes > 0 && slackAuth) {
      bridge.slackSetProfile(slackAuth, {
        text: status(minutes),
        emoji: ':tomato:',
        expiration: timeInFuture({ mins: minutes }),
      });
    }
  },
  onStartHook: ({ bridge, config, timer }) => {
    const slackAuth = getSlackAuth(config);

    if (timer.type === 'pomo' && slackAuth) {
      const mins = timer.minutes;

      bridge.slackSetPresence(slackAuth, 'away');
      bridge.slackSetSnooze(slackAuth, mins);
      bridge.slackSetProfile(slackAuth, {
        text: status(mins),
        emoji: ':tomato:',
        expiration: timeInFuture({ mins }),
      });
    }
  },
  onPauseHook: () => {},
  onPlayHook: () => {},
  onStopHook: ({ bridge, config, timer: { type } }) => {
    const slackAuth = getSlackAuth(config);

    if (type === 'pomo' && slackAuth) {
      bridge.slackSetPresence(slackAuth, 'active');
      bridge.slackEndSnooze(slackAuth);
      bridge.slackSetProfile(slackAuth, {
        text: '',
        emoji: '',
      });
    }
  },
  onCompleteHook: ({ bridge, config, timer: { type } }) => {
    const slackAuth = getSlackAuth(config);

    if (type === 'pomo' && slackAuth) {
      bridge.slackSetPresence(slackAuth, 'active');
      bridge.slackEndSnooze(slackAuth);
      bridge.slackSetProfile(slackAuth, {
        text: '',
        emoji: '',
      });
    }
  },
};

//-----------------------------------------------------------------------------
// PRIVATES
//-----------------------------------------------------------------------------

function status(minutes: number): string {
  return minutes === 1 ? `free in 1 min` : `free in ${minutes} minutes`;
}

function getSlackAuth(config: UserConfig): SlackAuth | null {
  return config.slack.enabled
    ? {
        domain: config.slack.slackDomain,
        token: config.slack.slackToken,
        dCookie: config.slack.slackDCookie,
        dSCookie: config.slack.slackDSCookie,
      }
    : null;
}
