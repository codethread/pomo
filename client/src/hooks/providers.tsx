import { updateTheme } from '@client/theme';
import { TimerHooks } from '@shared/types';
import { ClockMachine } from '@client/machines/clock/machine';
import { useBridge } from './useBridge';
import { loggerContext } from './useLogger';
import { bridgeContext } from './useBridge';
import { IBridge } from '@shared/types';
import { machinesConfig } from './machines';
import { mainMachine } from '@client/machines';
import { useInterpret } from '@xstate/react';
import { useEffect } from 'react';

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

export function BridgeProvider({ bridge, children }: IBridgeProvider): JSX.Element {
  return <bridgeContext.Provider value={bridge}>{children}</bridgeContext.Provider>;
}

export interface IMachinesProvider {
  children: React.ReactNode;
  hooks: TimerHooks;
  services: {
    clock: ClockMachine;
  };
}

export function MachinesProvider({ children, hooks, services }: IMachinesProvider): JSX.Element {
  const bridge = useBridge();

  useEffect(() => {
    bridge.info('client starting');
  }, [bridge]);

  const main = useInterpret(
    mainMachine({
      bridge,
      actions: hooks,
      pomodoro: {
        clock: services.clock,
      },
      updateTheme,
    }),
    {
      devTools: true,
    }
  );

  return <machinesConfig.Provider value={main}>{children}</machinesConfig.Provider>;
}
