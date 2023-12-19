import { IBridge, emptyConfig } from '@shared/types';
import { ok } from '@shared/Result';
import { createStore } from './store';
import { slackRepository } from './slack';
import { open } from '@tauri-apps/api/shell';
import { appWindow } from '@tauri-apps/api/window';

export async function setupBridge(bridge?: Partial<IBridge>): Promise<IBridge> {
  // TODO need to handle running in browser with fake bridge

  const logger: Console = console;
  const store = await createStore(logger, {
    name: 'pomo',
    defaults: emptyConfig,
  });
  const slack = await slackRepository({ logger });

  return {
    ...logger,
    ...store,
    ...slack,
    async openExternal(url) {
      await open(url);
      return Promise.resolve();
    },
    async windowFocus() {
      await appWindow.setFocus();
    },
    async setTrayIcon() {},
    async setTrayTitle() {},
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
