import { IBridge } from '@shared/types';
import { createContext, useContext } from 'react';
import { useAsync } from 'react-use';

export const bridgeContext = createContext<IBridge | null>(null);

export const useBridge = (): IBridge => {
  const context = useContext(bridgeContext);
  if (!context) throw new Error('bridgeContext must be wrapper in a provider');
  return context;
};

export const useIsDev = () => {
  const b = useBridge().isDev;
  return useAsync(async () => b().then((r) => r.expect()));
};
