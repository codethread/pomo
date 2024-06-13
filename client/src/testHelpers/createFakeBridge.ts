import { fakeClient } from '@client/bridge/http';
import { slackRepository } from '@client/bridge/slack';
import { fakeStoreRepoFactory } from '@client/bridge/store';
import { ok } from '@shared/Result';
import { IBridge, IClientLogger, Stats, emptyConfig } from '@shared/types';

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
      const d: Stats = {
        completed: [
          { _tag: 'pomo.pomo', duration: 50, timestamp: '2024-06-13T06:33:49.129Z' },
          { _tag: 'pomo.pomo', duration: 12, timestamp: '2024-06-13T06:35:59.081Z' },
          { _tag: 'pomo.pomo', duration: 8, timestamp: '2024-06-13T06:36:01.030Z' },
          { _tag: 'pomo.pomo', duration: 5, timestamp: '2024-06-13T06:36:02.126Z' },
          { _tag: 'pomo.pomo', duration: 15, timestamp: '2024-06-13T08:03:40.070Z' },
          { _tag: 'pomo.pomo', duration: 8, timestamp: '2024-06-13T08:08:38.323Z' },
          { _tag: 'pomo.pomo', duration: 16, timestamp: '2024-06-13T09:04:15.823Z' },
          { _tag: 'pomo.pomo', duration: 4619, timestamp: '2024-06-13T09:08:24.038Z' },
          { _tag: 'pomo.pomo', duration: 961, timestamp: '2024-06-13T09:09:04.235Z' },
          { _tag: 'pomo.pomo', duration: 277, timestamp: '2024-06-13T09:10:22.401Z' },
          { _tag: 'pomo.pomo', duration: 420, timestamp: '2024-06-11T01:13:00.000Z' },
          { _tag: 'pomo.pomo', duration: 840, timestamp: '2024-06-11T01:13:00.000Z' },
          { _tag: 'pomo.pomo', duration: 60, timestamp: '2024-06-06T01:13:00.000Z' },
          { _tag: 'other.meeting', duration: 60, timestamp: '2024-06-13T14:34:35.266Z' },
        ],
      };

      return Promise.resolve(d);
    },
    ...overrides,
  };
}
