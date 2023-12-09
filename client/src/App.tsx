import React, { useLayoutEffect } from 'react';
import { inspect } from '@xstate/inspect';
import { useSelector } from '@xstate/react';
import { useMachines } from '@client/hooks';

interface IApp {
  children: React.ReactNode;
  shouldInspect: boolean;
}

export function App({ children, shouldInspect }: IApp): JSX.Element {
  useLayoutEffect(() => {
    if (shouldInspect) {
      inspect({
        iframe: false,
      });
    }
  });
  const main = useMachines();
  const loaded = useSelector(main, (c) => c.context.loaded);

  // annoying workaround to make sure all child actors are ready
  if (!loaded) {
    return <p data-testid="providers-loading">...booting</p>;
  }
  return (
    <div id="App-loaded" className="h-screen w-screen">
      {children}
    </div>
  );
}
