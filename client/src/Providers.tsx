import { ErrorBoundary, ScrollBar } from '@client/components';
import { BridgeProvider, LoggerProvider, MachinesProvider } from '@client/hooks/providers';
import { PageManager } from '@client/pages';
import { IBridge } from '@shared/types';
import { App } from './App';
import { hooks } from './integrations';
import { ClockMachine } from './machines/clock/machine';

interface IProviders {
  isDev: boolean;
  bridge: IBridge;
  services: {
    clock: ClockMachine;
  };
}

export function Providers({ bridge, services }: IProviders): JSX.Element {
  return (
    <BridgeProvider bridge={bridge}>
      <LoggerProvider>
        <MachinesProvider hooks={hooks} services={services}>
          <ErrorBoundary>
            <ScrollBar />
            <App>
              <PageManager />
            </App>
          </ErrorBoundary>
        </MachinesProvider>
      </LoggerProvider>
    </BridgeProvider>
  );
}
