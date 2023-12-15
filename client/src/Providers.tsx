import { ErrorBoundary, ScrollBar } from '@client/components';
import { BridgeProvider, LoggerProvider, MachinesProvider } from '@client/hooks/providers';
import { PageManager } from '@client/pages';
import { IBridge } from '@shared/types';
import { App } from './App';
import { hooks } from './integrations';

interface IProviders {
  isDev: boolean;
  bridge: IBridge;
}

export function Providers({ bridge, isDev }: IProviders): JSX.Element {
  return (
    <BridgeProvider bridge={bridge}>
      <LoggerProvider>
        <MachinesProvider hooks={hooks}>
          <ErrorBoundary>
            <ScrollBar />
            <App shouldInspect={isDev}>
              <PageManager />
            </App>
          </ErrorBoundary>
        </MachinesProvider>
      </LoggerProvider>
    </BridgeProvider>
  );
}
