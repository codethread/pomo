import { interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';
import { merge } from '@shared/merge';
import { err, ok } from '@shared/Result';
import { DeepPartial, emptyConfig, IBridge, UserConfig } from '@shared/types';
import { parentMachine } from '@client/machines/testHelpers/machines';
import configMachineFactory from './machine';
import { createFakeBridge } from '@client/testHelpers/createFakeBridge';
import { actorIds } from '../constants';
import { getActor } from '../utils';
import { mainEvents } from '../main/machine';

const { CONFIG } = actorIds;

interface TestOverrides {
  bridge?: Partial<IBridge>;
  config?: DeepPartial<UserConfig>;
}

async function runTest(overrides?: TestOverrides) {
  const spy = vi.fn();

  const { bridge, config } = overrides ?? {};

  const parent = parentMachine({
    parentEvents: mainEvents,
    childId: CONFIG,
    childMachine: configMachineFactory({
      bridge: createFakeBridge(bridge, { configOverride: config }),
    }),
  });

  const service = interpret(
    parent.withConfig({
      actions: { spy: (_, e) => spy(e) },
    })
  );

  service.start();
  const configMachine = getActor(service, CONFIG);
  const initial = configMachine.getSnapshot();

  await waitFor(configMachine, (m) => !m.hasTag('loading'), { timeout: 100 });

  return {
    initial,
    parent: service,
    configMachine,
    spy,
  };
}

describe('config machine', () => {
  it('should start in a loading state', async () => {
    const { initial } = await runTest();

    expect(initial?.value).toBe('loading');
  });

  describe('when config fails to load', () => {
    it('should return the default config, broadcast it and log a warning', async () => {
      const spy = vi.fn();

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

  describe('when config is updated', () => {
    it('should update the config and broadcast the change', async () => {
      const updatedConfig = merge(emptyConfig, { timers: { pomo: 222 } });
      const mock = vi.fn().mockResolvedValue(ok(updatedConfig));
      const { configMachine, spy } = await runTest({
        bridge: {
          storeRead: async () => ok(merge(emptyConfig, { timers: { pomo: 612 } })),
          storeUpdate: mock,
        },
      });

      const update = { slack: { enabled: true, slackToken: 'Wubba Lubba Dub Dub!' } };

      configMachine.send({ type: 'UPDATE', data: update });

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

      configMachine.send({ type: 'RESET' });

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
