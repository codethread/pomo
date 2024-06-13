import { fakeClient } from '@client/bridge/http';
import { slackRepository } from '@client/bridge/slack';
import { fakeStoreRepoFactory } from '@client/bridge/store';
import { ok } from '@shared/Result';
import { IBridge, IClientLogger, emptyConfig } from '@shared/types';

export function createFakeBridge(overrides?: Partial<IBridge>): IBridge {
  const logger: IClientLogger = {
    async debug() {},
    async warn() {},
    async info() {},
    async error() {},
  };

  const store = fakeStoreRepoFactory({
    name: 'test',
    defaults: emptyConfig,
  });

  const slack = slackRepository({ logger, client: fakeClient() });

  return {
    ...store,
    ...slack,
    ...logger,
    async openExternal() {
      return Promise.resolve();
    },
    async windowFocus() {},
    async setTrayIcon() {},
    async setTrayTitle() {},
    async nodenv() {
      return ok('development');
    },
    async isProd() {
      return ok(false);
    },
    async isTest() {
      return ok(true);
    },
    async isDev() {
      return ok(false);
    },
    async isIntegration() {
      return ok(false);
    },
    async statsTimerComplete() {},
    async statsRead() {
      return Promise.resolve({ completed: [] });
    },
    ...overrides,
  };
}
