import { Result, ok } from '@shared/Result';
import mergeMutate from 'lodash.merge';
import { merge } from '@shared/merge';
import { DeepPartial } from '@shared/types';
import { Store } from 'tauri-plugin-store-api';

interface StoreConfig<T> {
  defaults: T;
  name: string;
}
export interface StoreRepository<T> {
  storeRead(): Promise<Result<T>>;
  storeUpdate(value: DeepPartial<T>): Promise<Result<T>>;
  storeReset(): Promise<Result<T>>;
}

const KEY = 'store';

export async function createStore<T>(
  logger: Console,
  storeConfig: StoreConfig<T>
): Promise<StoreRepository<T>> {
  // TODO: update with zod later
  const store = new Store(storeConfig.name);

  logger.info(`setting up Store Repo: name "${storeConfig.name}", path: "${store.path}"`);

  if (!(await store.get(KEY))) {
    await store.clear();
    await store.set(KEY, storeConfig.defaults);
  }

  // TODO handle migrations

  return {
    async storeRead() {
      logger.info('reading store');
      const data = await store.get(KEY);
      logger.info('store', data);
      return ok(data as T);
    },
    async storeReset() {
      logger.info('resetting store');
      await store.clear();
      const data = await store.get(KEY);
      logger.info('store', data);
      return ok(data as T);
    },
    async storeUpdate(updatedStore) {
      const originalStore = await store.get(KEY);
      const updated = merge(originalStore, updatedStore);
      await store.set(KEY, updated);
      await store.save();
      return ok(updated as T);
    },
  };
}

export const fakeStoreRepoFactory = <T>(storeConfig: StoreConfig<T>): StoreRepository<T> => {
  let store = storeConfig.defaults;
  return {
    async storeRead() {
      return Promise.resolve(ok(store));
    },
    async storeUpdate(updatedStore) {
      mergeMutate(store, updatedStore);
      return Promise.resolve(ok(store));
    },
    async storeReset() {
      store = storeConfig.defaults;
      return Promise.resolve(ok(store));
    },
  };
};
