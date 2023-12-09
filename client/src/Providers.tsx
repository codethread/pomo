import { ErrorBoundary, ScrollBar } from '@client/components';
import { BridgeProvider, LoggerProvider, MachinesProvider } from '@client/hooks/providers';
import { PageManager } from '@client/pages';
import { IBridge } from '@shared/types';
import React, { useEffect, useState } from 'react';
import { App } from './App';
import { hooks } from './integrations';

interface IProviders {
  bridge: IBridge;
}

export function Providers({ bridge }: IProviders): JSX.Element {
  const [booting, setBooting] = useState(true);
  const [shouldInspect, setShouldInspect] = useState(false);

  useEffect(() => {
    bridge.isDev().then((isDev) => {
      isDev.map((b) => setShouldInspect(b));
      setBooting(false);
    });
  });

  return booting ? (
    <p>booting...</p>
  ) : (
    <BridgeProvider bridge={bridge}>
      <LoggerProvider>
        <MachinesProvider hooks={hooks}>
          <ErrorBoundary>
            <ScrollBar />
            <App shouldInspect={shouldInspect}>
              <PageManager />
            </App>
          </ErrorBoundary>
        </MachinesProvider>
      </LoggerProvider>
    </BridgeProvider>
  );
}
