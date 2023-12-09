import { IBridge } from '@shared/types';
import React, { createContext, useContext } from 'react';

const bridgeContext = createContext<IBridge | null>(null);

const { Provider } = bridgeContext;

export const useBridge = (): IBridge => {
  const context = useContext(bridgeContext);
  if (!context) throw new Error('bridgeContext must be wrapper in a provider');
  return context;
};

interface IBridgeProvider {
  bridge: IBridge;
  children: React.ReactNode;
}
export function BridgeProvider({ bridge, children }: IBridgeProvider): JSX.Element {
  return <Provider value={bridge}>{children}</Provider>;
}
