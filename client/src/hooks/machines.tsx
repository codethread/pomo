import { useActor, useInterpret, useSelector } from '@xstate/react';
import { createContext, useContext, useEffect } from 'react';
import {
  actorIds,
  mainMachine,
  MainService,
  PomodoroActorRef,
  TimerSettingsActorRef,
  TimerActorRef,
  ConfigActorRef,
  ActorError,
} from '@client/machines';

export const machinesConfig = createContext<MainService | null>(null);

export const useMachines = (): MainService => {
  const context = useContext(machinesConfig);
  if (!context) {
    throw new Error('useMachines used without Provider');
  }
  return context;
};

const usePomodoroService = (): PomodoroActorRef => {
  const main = useMachines();
  const pomodoro = useSelector(
    main,
    (c) => c.children[actorIds.POMODORO] as PomodoroActorRef | null
  );

  if (!pomodoro) throw new ActorError(main, actorIds.POMODORO);
  return pomodoro;
};

export const useConfigService = (): ConfigActorRef => {
  const main = useMachines();
  const config = useSelector(main, (c) => c.children[actorIds.CONFIG] as ConfigActorRef | null);

  if (!config) throw new ActorError(main, actorIds.CONFIG);
  return config;
};

export const usePomodoro = () => {
  const service = usePomodoroService();
  return useActor(service);
};

export const useTimer = (): TimerActorRef | null => {
  const pomodoro = usePomodoroService();
  const timer = useSelector(pomodoro, (c) => c.children[actorIds.TIMER] as TimerActorRef | null);

  return timer;
};

export const useTimerSettings = () => {
  const config = useConfigService();
  const settings = useSelector(
    config,
    (c) => c.children[actorIds.TIMER_SETTINGS] as TimerSettingsActorRef | null
  );

  return settings;
};
