import { useEffect, useState } from 'react';
import { Providers } from './Providers';
import { setupBridge } from './bridge/setup';
import { IBridge } from '@shared/types';

export function Booter() {
  const [bridge, setBridge] = useState<IBridge>();
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    (async () => {
      setupBridge()
        .then(async (b) => {
          const isDev = await b.isDev();
          setIsDev(isDev.expect('shouldnt fail'));
          return b;
        })
        .then(setBridge);
    })();
  }, []);

  if (!bridge) return <p>booting...</p>;

  return <Providers bridge={bridge} isDev={isDev} />;
}
