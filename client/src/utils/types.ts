import { Result } from '@shared/Result';
import z from 'zod';
import { Nodenv } from '@shared/asserts';
import { ThemeName } from '@client/theme';
import { ThemeNameSchema } from '@client/theme/updateTheme';
import { SlackProfile } from '@client/bridge/slack';

export type IClientLogger = {
  debug(...msg: any): Promise<void>;
  info(...msg: any): Promise<void>;
  warn(...msg: any): Promise<void>;
  error(...msg: any): Promise<void>;
};

export type TimerType = keyof UserConfig['timers'];

export const emptyConfig: UserConfig = {
  timers: {
    pomo: 25,
    short: 5,
    long: 15,
  },
  displayTimerInStatusBar: true,
  longBreakEvery: 4,
  autoStart: {
    beforeShortBreak: true,
    beforeLongBreak: true,
    beforePomo: false,
  },
  theme: 'nord',
};

export const emptyStats: Stats = {
  completed: [],
};

export const UserConfigSchema = z.object({
  timers: z.object({
    pomo: z.number(),
    short: z.number(),
    long: z.number(),
  }),
  displayTimerInStatusBar: z.boolean(),
  longBreakEvery: z.number(),
  autoStart: z.object({
    beforeShortBreak: z.boolean(),
    beforeLongBreak: z.boolean(),
    beforePomo: z.boolean(),
  }),
  slack: z
    .object({
      enabled: z.boolean(),
      slackDomain: z.string(),
      slackToken: z.string(),
      slackDCookie: z.string(),
      slackDSCookie: z.string(),
    })
    .optional(),
  theme: ThemeNameSchema,
});

export type UserConfig = z.infer<typeof UserConfigSchema>;

export interface SlackAuth {
  domain: string;
  token: string;
  dCookie: string;
  dSCookie: string;
}

export interface SlackStatus {
  text: string;
  emoji: string;
  expiration?: Date;
}

interface SlackOk {
  ok: true;
}

/**
 * There are more of these, but I will add them as I find them
 */
type SlackErr =
  | {
      ok: false;
      error: 'connection_error';
    }
  | {
      ok: false;
      error: 'invalid_auth';
    };

export type IBridge<T = UserConfig> = IClientLogger & {
  windowFocus(): Promise<void>;
  setTrayIcon(msg: string): Promise<void>;
  setTrayTitle(msg: string): Promise<void>;
  openExternal(url: string): Promise<void>;
  storeRead(): Promise<Result<T>>;
  storeUpdate(value: DeepPartial<T>): Promise<Result<T>>;
  storeReset(): Promise<Result<T>>;
  slackSetProfile(auth: SlackAuth, status: SlackStatus): Promise<Result<SlackOk, SlackErr>>;
  slackSetSnooze(auth: SlackAuth, minutes: number): Promise<Result<SlackOk, SlackErr>>;
  slackEndSnooze(auth: SlackAuth): Promise<Result<SlackOk, SlackErr>>;
  slackSetPresence(auth: SlackAuth, state: 'active' | 'away'): Promise<Result<SlackOk, SlackErr>>;
  slackValidate(auth: SlackAuth): Promise<Result<SlackProfile, SlackErr>>;
  nodenv(): Promise<Result<Nodenv>>;
  isProd(): Promise<Result<boolean>>;
  isTest(): Promise<Result<boolean>>;
  isDev(): Promise<Result<boolean>>;
  isIntegration(): Promise<Result<boolean>>;
  statsTimerComplete(duration: number, stat?: StatType, timestamp?: string): Promise<void>;
  statsRead(): Promise<Stats>;
};

export const StatTypes = ['pomo.pomo', 'other.meeting'] as const;
export const StatTypeSchema = z.enum(StatTypes);
export type StatType = typeof StatTypes[number];
export interface Stats {
  completed: Array<{
    timestamp: string;
    /** seconds of work done */
    duration: number;
    /** type */
    _tag: StatType;
  }>;
}

export type Partial2Deep<T> = {
  [P in keyof T]?: Partial<T[P]>;
};

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface AnyObject {
  [key: string]: any;
}

type CssSizeUnits = '%' | 'em' | 'px';
export type CssSize = `${string}${CssSizeUnits}`;

export interface HookContext {
  timer: {
    id: string;
    /** minute count left on timer */
    minutes: number;
    seconds: number;
    type: TimerType;
    autoStart: boolean;
    /** original minute target for timer, i.e after a timer has completed minutes will
     * be 0, so for hooks interested in completed timers, the target shows what was done */
    target: number;
  };
  config: UserConfig;
  bridge: IBridge;
}

type Hook = (context: HookContext) => void;

export interface TimerHooks {
  onStartHook: Hook;
  onTickHook: Hook;
  onPauseHook: Hook;
  onPlayHook: Hook;
  onStopHook: Hook;
  onCompleteHook: Hook;
}

export interface IChildren {
  children: React.ReactNode;
}

export type ICss = {
  className?: string;
};
