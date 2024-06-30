import { IBridge, IClientLogger, emptyConfig, emptyStats } from "@shared/types";
import { ok } from "@shared/Result";
import { createStore } from "./store";
import { slackRepository } from "./slack";
import { open } from "@tauri-apps/api/shell";
import { appWindow } from "@tauri-apps/api/window";
import { prodClient } from "./http";

export async function setupBridge(bridge?: Partial<IBridge>): Promise<IBridge> {
  const logger: IClientLogger = {
    async debug(...msg) {
      console.debug(...msg);
    },
    async warn(...msg) {
      console.warn(...msg);
    },
    async info(...msg) {
      console.info(...msg);
    },
    async error(...msg) {
      console.error(...msg);
    },
  };

  const store = await createStore(logger, {
    name: "store",
    defaults: emptyConfig,
  });

  const stats = await createStore(logger, {
    name: "stats",
    defaults: emptyStats,
  });

  const slack = slackRepository({ logger, client: await prodClient() });

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
      return ok("development");
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
    async statsTimerComplete(duration, statType, timestamp) {
      stats.storeUpdate({
        completed: [
          {
            duration,
            timestamp: timestamp ?? new Date().toISOString(),
            _tag: statType ?? "pomo.pomo",
          },
        ],
      });
    },
    async statsRead() {
      return stats.storeRead().then((r) => r.expect("could not read stats"));
    },
    ...bridge,
  };
}
