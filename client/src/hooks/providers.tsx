import { TimerHooks } from '@shared/types';
import { ClockMachine } from '@client/machines/clock/machine';
import { useBridge } from './useBridge';
import { loggerContext } from './useLogger';
import { bridgeContext } from './useBridge';
import { IBridge } from '@shared/types';
import { machinesContext } from './machines';
import { useInterpret } from '@xstate/react';
import { useEffect } from 'react';
import mainMachineFactory from '@client/machines/main/machine';
import { updateTheme } from '@client/theme/updateTheme';

interface ILoggerProvider {
  children: React.ReactNode;
}

export function LoggerProvider({ children }: ILoggerProvider): JSX.Element {
  const bridge = useBridge();
  return (
    <loggerContext.Provider
      value={{
        info: bridge.info,
        error: bridge.error,
        warn: bridge.warn,
        debug: bridge.debug,
      }}
    >
      {children}
    </loggerContext.Provider>
  );
}

interface IBridgeProvider {
  bridge: IBridge;
  children: React.ReactNode;
}

export function BridgeProvider({
  bridge,
  children,
}: IBridgeProvider): JSX.Element {
  return (
    <bridgeContext.Provider value={bridge}>{children}</bridgeContext.Provider>
  );
}

export interface IMachinesProvider {
  children: React.ReactNode;
  hooks: TimerHooks;
  services: {
    clock: ClockMachine;
  };
}

export function MachinesProvider({
  children,
  hooks,
  services,
}: IMachinesProvider): JSX.Element {
  const bridge = useBridge();

  useEffect(() => {
    bridge.info('client starting');
  }, [bridge]);

  const main = useInterpret(
    mainMachineFactory({
      bridge,
      actions: hooks,
      pomodoro: {
        clock: services.clock,
      },
      updateTheme,
    }),
    {
      devTools: true,
    },
  );

  return (
    <machinesContext.Provider value={main}>{children}</machinesContext.Provider>
  );
}
