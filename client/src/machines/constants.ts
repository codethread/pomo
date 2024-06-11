import { type ConfigActorRef } from './config/machine';
import { type PomodoroActorRef } from './pomodoro/machine';
import { type TimerActorRef } from './timer/machine';
import { type TimerSettingsActorRef } from './timerSettings/machine';

export const actorIds = {
  POMODORO: 'POMODORO',
  CONFIG: 'CONFIG',
  TIMER: 'TIMER',
  TIMER_SETTINGS: 'TIMER_SETTINGS',
} as const;

export interface Actors {
  CONFIG: ConfigActorRef;
  TIMER: TimerActorRef;
  POMODORO: PomodoroActorRef;
  TIMER_SETTINGS: TimerSettingsActorRef;
}
