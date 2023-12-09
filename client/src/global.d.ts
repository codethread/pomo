import { IBridge } from '@shared/types';

declare global {
  interface Window {
    bridge?: IBridge;
  }
}
