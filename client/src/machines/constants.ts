import { type ConfigActorRef } from './config/machine';
import { type PomodoroActorRef } from './pomodoro/machine';
import { type TimerActorRef } from './timer/machine';

export const actorIds = {
  POMODORO: 'POMODORO',
  CONFIG: 'CONFIG',
  TIMER: 'TIMER',
} as const;

export interface Actors {
  CONFIG: ConfigActorRef;
  TIMER: TimerActorRef;
  POMODORO: PomodoroActorRef;
}
