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
    windowFocus() {},
    setTrayIcon() {},
    setTrayTitle() {},
    slackSetProfile(auth, status) {},
    slackSetSnooze(auth, minutes) {},
    slackEndSnooze(auth) {},
    slackSetPresence(auth, state) {},
    info(...args) {
      console.log(...args);
    },
    warn() {
      console.warn(...args);
    },
    error(err) {
      console.error(err);
    },
    nodenv() {},
    isProd() {},
    isTest() {},
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
