import { IBridge, emptyConfig } from '@shared/types';
import { ok } from '@shared/Result';
import { createStore } from './store';

export async function setupBridge(bridge?: Partial<IBridge>): Promise<IBridge> {
  // TODO need to handle running in browser with fake bridge

  const logger: Console = console;

  return {
    ...logger,
    ...(await createStore(logger, {
      name: 'pomo',
      defaults: emptyConfig,
    })),
    async openExternal(url) {
      window.open(url);
      return Promise.resolve();
    },
    async windowFocus() {},
    async setTrayIcon() {},
    async setTrayTitle() {},
    async slackSetProfile(auth, status) {},
    async slackSetSnooze(auth, minutes) {},
    async slackEndSnooze(auth) {},
    async slackSetPresence(auth, state) {},
    async nodenv() {
      return ok('development');
    },
    async isProd() {
      return ok(true);
    },
    async isTest() {
      return ok(true);
    },
    async isDev() {
      return ok(true);
    },
    async isIntegration() {
      return ok(true);
    },
    ...bridge,
  };
}
