import { ConfigActorRef } from "@client/machines/config/machine";
import { actorIds } from "@client/machines/constants";
import { MainService } from "@client/machines/main/machine";
import { PomodoroActorRef } from "@client/machines/pomodoro/machine";
import { TimerActorRef } from "@client/machines/timer/machine";
import { ActorError } from "@client/machines/utils";
import { useActor, useSelector } from "@xstate/react";
import { createContext, useContext } from "react";

export const machinesContext = createContext<MainService | null>(null);

export const useMachines = (): MainService => {
  const context = useContext(machinesContext);
  if (!context) {
    throw new Error("useMachines used without Provider");
  }
  return context;
};

const usePomodoroService = (): PomodoroActorRef => {
  const main = useMachines();
  const pomodoro = useSelector(
    main,
    (c) => c.children[actorIds.POMODORO] as PomodoroActorRef | null,
  );

  if (!pomodoro) throw new ActorError(main, actorIds.POMODORO);
  return pomodoro;
};

export const useConfigService = (): ConfigActorRef => {
  const main = useMachines();
  const config = useSelector(
    main,
    (c) => c.children[actorIds.CONFIG] as ConfigActorRef | null,
  );

  if (!config) throw new ActorError(main, actorIds.CONFIG);
  return config;
};

export const usePomodoro = () => {
  const service = usePomodoroService();
  return useActor(service);
};

export const useTimer = (): TimerActorRef | null => {
  const pomodoro = usePomodoroService();
  const timer = useSelector(
    pomodoro,
    (c) => c.children[actorIds.TIMER] as TimerActorRef | null,
  );

  return timer;
};
