import { ErrorBoundary, ScrollBar } from '@client/components';
import { BridgeProvider, LoggerProvider, MachinesProvider } from '@client/hooks/providers';
import { PageManager } from '@client/pages';
import { IBridge } from '@shared/types';
import { App } from './App';
import { hooks } from './integrations';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

interface IProviders {
  isDev: boolean;
  bridge: IBridge;
}

['start', 'Start', 'tick', 'Tick'].forEach((e) => {
  listen(e, (event) => {
    console.log({ event });
  });
});

export function Providers({ bridge, isDev }: IProviders): JSX.Element {
  useEffect(() => {
    emit('client-event', { event: 'hi' });
    // invoke('greet', { name: 'foo' });
  }, []);
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
