/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';
import { createFakeBridge } from '@electron/ipc/createFakeBridge';
import { merge } from '@shared/merge';
import { err, ok } from '@shared/Result';
import { DeepPartial, emptyConfig, IBridge, UserConfig } from '@shared/types';
import { createMockFn } from '@test/createMockFn';
import { parentMachine } from '@client/machines/testHelpers/machines';
import { getActor, actorIds } from '@client/machines';
import mainModel from '../main/model';
import configMachineFactory from './machine';
import { configModel } from './model';

const { CONFIG } = actorIds;
const { UPDATE, RESET } = configModel.events;

interface TestOverrides {
  /**
   * Don't wait for the machine to have left the 'loading' state
   */
  dontWait?: true;
  bridge?: Partial<IBridge>;
  config?: DeepPartial<UserConfig>;
}

async function runTest(overrides?: TestOverrides) {
  const spy = jest.fn();

  const { bridge, config, dontWait } = overrides ?? {};

  const parent = parentMachine({
    parentEvents: Object.keys(mainModel.events),
    childId: CONFIG,
    childMachine: configMachineFactory({
      bridge: createFakeBridge(bridge),
      configOverride: config && merge(emptyConfig, config),
    }),
  });

  const service = interpret(
    parent.withConfig({
      actions: { spy: (_, e) => spy(e) },
    })
  );

  service.start();
  const configMachine = getActor(service, CONFIG);

  if (!dontWait) {
    await waitFor(configMachine, (m) => !m.hasTag('loading'), { timeout: 100 });
  }

  return {
    parent: service,
    configMachine,
    spy,
  };
}

describe('config machine', () => {
  it('should start in a loading state', async () => {
    const { configMachine } = await runTest({ dontWait: true });

    expect(configMachine.getSnapshot()?.value).toBe('loading');
  });

  describe('when config fails to load', () => {
    it('should return the default config, broadcast it and log a warning', async () => {
      const spy = jest.fn();

      const { configMachine, spy: storeSpy } = await runTest({
        bridge: {
          warn: spy,
          storeRead: async () => err('oh no!'),
        },
      });

      const { context } = configMachine.getSnapshot() ?? {};
      expect(context).toBe(emptyConfig);
      expect(spy).toHaveBeenCalledWith('oh no!');
      expect(storeSpy).toHaveBeenCalledWith({
        type: expect.anything(),
        data: emptyConfig,
      });
    });
  });

  describe('when config loads', () => {
    it("should return the user's config and broadcast it", async () => {
      const { configMachine, spy: storeSpy } = await runTest({
        bridge: {
          storeRead: async () => ok(merge(emptyConfig, { timers: { pomo: 612 } })),
        },
      });

      const { context } = configMachine.getSnapshot() ?? {};
      expect(context?.timers.pomo).toBe(612);
      expect(storeSpy).toHaveBeenCalledWith({
        type: expect.anything(),
        data: expect.objectContaining({
          timers: expect.objectContaining({ pomo: 612 }),
        }),
      });
    });
  });

  describe("when config is DI'd", () => {
    it('should return the users config', async () => {
      const storeSpy = jest.fn();

      const { configMachine } = await runTest({
        bridge: {
          storeRead: storeSpy,
        },
        config: {
          timers: { pomo: 2222 },
        },
      });

      expect(storeSpy).not.toHaveBeenCalled();
      const { context } = configMachine.getSnapshot() ?? {};
      expect(context?.timers.pomo).toBe(2222);
    });
  });

  describe('when config is updated', () => {
    it('should update the config and broadcast the change', async () => {
      const updatedConfig = merge(emptyConfig, { timers: { pomo: 222 } });
      const mock = createMockFn<IBridge['storeUpdate']>().mockResolvedValue(ok(updatedConfig));
      const { configMachine, spy } = await runTest({
        bridge: {
          storeRead: async () => ok(merge(emptyConfig, { timers: { pomo: 612 } })),
          storeUpdate: mock,
        },
      });

      const update = { slack: { enabled: true, slackToken: 'Wubba Lubba Dub Dub!' } };

      configMachine.send(UPDATE(update));

      const c = configMachine.getSnapshot();
      expect(c?.hasTag('updating')).toBe(true);

      await waitFor(configMachine, (m) => m.hasTag('idle'));

      const { context } = configMachine.getSnapshot() ?? {};
      expect(context?.timers.pomo).toBe(222);
      expect(mock).toHaveBeenCalledWith(update);
      expect(spy).toHaveBeenLastCalledWith({
        data: updatedConfig,
        type: expect.anything(),
      });
    });
  });

  describe('when config is reset', () => {
    it('should reset the config and broadcast the change', async () => {
      const updatedConfig = merge(emptyConfig, { timers: { pomo: 222 } });
      const { configMachine, spy } = await runTest({
        bridge: {
          storeReset: async () => ok(updatedConfig),
        },
      });

      configMachine.send(RESET());

      const c = configMachine.getSnapshot();
      expect(c?.hasTag('updating')).toBe(true);

      await waitFor(configMachine, (m) => m.hasTag('idle'));

      const { context } = configMachine.getSnapshot() ?? {};
      expect(context?.timers.pomo).toBe(222);
      expect(spy).toHaveBeenLastCalledWith({
        data: updatedConfig,
        type: expect.anything(),
      });
    });
  });
});
