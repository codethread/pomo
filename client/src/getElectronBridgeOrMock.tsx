import { IBridge, emptyConfig } from '@shared/types';
import { ok } from '@shared/Result';
import merge from 'lodash.merge';

export function getElectronBridgeOrMock(bridge?: Partial<IBridge>): IBridge {
  if (typeof window === 'object' && window.bridge) return window.bridge;

  return {
    openExternal: async (url) => {
      window.open(url);
      return Promise.resolve();
    },
    windowFocus() {
      throw new Error('Method not implemented.');
    },
    setTrayIcon() {
      throw new Error('Method not implemented.');
    },
    setTrayTitle() {
      throw new Error('Method not implemented.');
    },
    slackSetProfile(auth, status) {
      throw new Error('Method not implemented.');
    },
    slackSetSnooze(auth, minutes) {
      throw new Error('Method not implemented.');
    },
    slackEndSnooze(auth) {
      throw new Error('Method not implemented.');
    },
    slackSetPresence(auth, state) {
      throw new Error('Method not implemented.');
    },
    info(...args) {
      console.log(...args);
    },
    warn() {
      console.warn(...args);
    },
    error(err) {
      console.error(err);
    },
    nodenv() {
      throw new Error('Method not implemented.');
    },
    isProd() {
      throw new Error('Method not implemented.');
    },
    isTest() {
      throw new Error('Method not implemented.');
    },
    async isDev() {
      return ok(true);
    },
    async isIntegration() {
      return true;
    },
    ...fakeStoreRepoFactory({
      name: 'client',
      defaults: emptyConfig,
    }),
    ...bridge,
  };
}

const fakeStoreRepoFactory = <T,>(storeConfig: StoreConfig<T>): StoreRepository<T> => {
  let store = storeConfig.defaults;
  return {
    async storeRead() {
      return Promise.resolve(ok(store));
    },
    async storeUpdate(updatedStore) {
      merge(store, updatedStore);
      return Promise.resolve(ok(store));
    },
    async storeReset() {
      store = storeConfig.defaults;
      return Promise.resolve(ok(store));
    },
  };
};
