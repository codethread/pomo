import { IBridge } from '@shared/types';
import { createContext, useContext } from 'react';

export const bridgeContext = createContext<IBridge | null>(null);

export const useBridge = (): IBridge => {
  const context = useContext(bridgeContext);
  if (!context) throw new Error('bridgeContext must be wrapper in a provider');
  return context;
};
