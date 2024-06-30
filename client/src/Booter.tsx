import { useEffect, useLayoutEffect, useState } from 'react';
import { Providers } from './Providers';
import { setupBridge } from './bridge/setup';
import { IBridge } from '@shared/types';
import { createFakeBridge } from './testHelpers/createFakeBridge';
import { clockMachine } from './machines/clock/machine';
import { fakeClockMachine } from './machines/clock/fakeClock';
import { inspect } from '@xstate/inspect';

export function Booter() {
  const [bridge, setBridge] = useState<IBridge>();
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    env({
      browser: async () => createFakeBridge(),
      tauri: () => setupBridge(),
    })
      .then(async (b) => {
        const isDev = (await b.isDev()).expect('shoulnt fail');
        setIsDev(isDev);
        return b;
      })
      .then(setBridge);
  }, []);

  useLayoutEffect(() => {
    const notTauri = typeof window === 'object' && !window.__TAURI_METADATA__;
    if (notTauri) {
      inspect({
        iframe: false,
      });
    }
  }, []);

  if (!bridge) return <p>booting...</p>;

  return (
    <Providers
      bridge={bridge}
      isDev={isDev}
      services={{
        clock: env({
          tauri: () => clockMachine,
          browser: () => fakeClockMachine,
        }),
      }}
    />
  );
}

function env<A>(setup: { tauri: () => A; browser: () => A }): A {
  if (window.__TAURI__) return setup.tauri();
  return setup.browser();
}
