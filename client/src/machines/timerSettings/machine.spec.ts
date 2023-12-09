import { createFakeBridge } from '@electron/ipc/createFakeBridge';
import { merge } from '@shared/merge';
import { emptyConfig, UserConfig } from '@shared/types';
import { interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';
import configMachineFactory from '../config/machine';
import { actorIds } from '../constants';
import mainModel from '../main/model';
import { parentMachine } from '../testHelpers/machines';
import { getActor } from '../utils';
import { timerSettingsModel } from './model';

const { TIMER_SETTINGS, CONFIG } = actorIds;
const { CANCEL, UPDATE, SAVE } = timerSettingsModel.events;

const config: UserConfig = merge(emptyConfig, {
  timers: {
    long: 22,
    pomo: 11,
    short: 33,
  },
});

describe('timerSettings machine', () => {
  async function setupTest() {
    const parent = parentMachine({
      parentEvents: Object.keys(mainModel.events),
      childId: CONFIG,
      childMachine: configMachineFactory({
        bridge: createFakeBridge(),
        configOverride: config,
      }),
    });

    const service = interpret(parent);
    service.start();
    const configMachine = getActor(service, CONFIG);
    await waitFor(configMachine, (m) => !m.hasTag('loading'), { timeout: 100 });
    const timerSettingsMachine = getActor(configMachine, TIMER_SETTINGS);

    return {
      configMachine,
      timerSettingsMachine,
    };
  }

  it('should start idle with the current timer settings', async () => {
    const { timerSettingsMachine } = await setupTest();

    const c = timerSettingsMachine.getSnapshot();

    expect(c?.hasTag('idle')).toBe(true);
    expect(c?.context.pomo.value).toBe(config.timers.pomo);
  });

  describe('when the user makes a valid edit', () => {
    it('should allow the user to make multiple changes and continue to update', async () => {
      const { timerSettingsMachine } = await setupTest();

      timerSettingsMachine.send(timerSettingsModel.events.UPDATE('pomo', 77));

      const c = timerSettingsMachine.getSnapshot();

      expect(c?.context.pomo.value).toBe(77);
      expect(c?.hasTag('editing')).toBe(true);

      timerSettingsMachine.send(timerSettingsModel.events.UPDATE('pomo', 29));

      const c2 = timerSettingsMachine.getSnapshot();
      expect(c2?.context.pomo.value).toBe(29);
      expect(c2?.hasTag('editing')).toBe(true);
    });

    it('should allow the user cancel the changes and return to an idle state', async () => {
      const { timerSettingsMachine } = await setupTest();

      timerSettingsMachine.send(UPDATE('pomo', 77));

      const c = timerSettingsMachine.getSnapshot();

      expect(c?.context.pomo.value).toBe(77);

      timerSettingsMachine.send(CANCEL());

      const c2 = timerSettingsMachine.getSnapshot();
      expect(c2?.context.pomo.value).toBe(config.timers.pomo);
      expect(c2?.hasTag('idle')).toBe(true);
    });

    it('should allow the user to submit the changes and return to an idle state', async () => {
      const { timerSettingsMachine, configMachine } = await setupTest();

      expect(configMachine.getSnapshot()?.context.timers.pomo).toBe(config.timers.pomo);

      timerSettingsMachine.send(UPDATE('pomo', 77));
      timerSettingsMachine.send(SAVE());

      await waitFor(configMachine, (s) => s.hasTag('idle'));

      expect(configMachine.getSnapshot()?.context.timers.pomo).toBe(77);
      expect(timerSettingsMachine.getSnapshot()?.hasTag('idle')).toBe(true);
    });
  });

  describe('when the user makes an invalid edit', () => {
    it('should report errors and allow the user cancel the changes', async () => {
      const { timerSettingsMachine } = await setupTest();

      timerSettingsMachine.send(UPDATE('pomo', 0));
      timerSettingsMachine.send(UPDATE('short', 0));
      timerSettingsMachine.send(UPDATE('long', 0));

      expect(timerSettingsMachine.getSnapshot()?.hasTag('errors')).toBe(true);
      expect(timerSettingsMachine.getSnapshot()?.context.pomo.error).toMatchInlineSnapshot(
        `"Timer must be at least 1 minute"`
      );
      expect(timerSettingsMachine.getSnapshot()?.context.short.error).toMatchInlineSnapshot(
        `"Timer must be at least 1 minute"`
      );
      expect(timerSettingsMachine.getSnapshot()?.context.long.error).toMatchInlineSnapshot(
        `"Timer must be at least 1 minute"`
      );

      timerSettingsMachine.send(CANCEL());

      expect(timerSettingsMachine.getSnapshot()?.hasTag('errors')).toBe(false);
      expect(timerSettingsMachine.getSnapshot()?.context.pomo.error).toBeUndefined();
    });

    it('should prevent the user submitting the changes', async () => {
      const { timerSettingsMachine } = await setupTest();

      timerSettingsMachine.send(UPDATE('pomo', 0));

      expect(timerSettingsMachine.getSnapshot()?.can('SAVE')).toBe(false);
    });

    describe('once the user corrects all errors', () => {
      it('should allow the user cancel the changes', async () => {
        const { timerSettingsMachine } = await setupTest();

        timerSettingsMachine.send(UPDATE('pomo', 0));
        timerSettingsMachine.send(UPDATE('short', 0));

        expect(timerSettingsMachine.getSnapshot()?.hasTag('errors')).toBe(true);

        timerSettingsMachine.send(UPDATE('pomo', 1));

        expect(timerSettingsMachine.getSnapshot()?.hasTag('errors')).toBe(true);

        timerSettingsMachine.send(UPDATE('short', 1));

        expect(timerSettingsMachine.getSnapshot()?.hasTag('errors')).toBe(false);

        timerSettingsMachine.send(CANCEL());
        const c = timerSettingsMachine.getSnapshot();

        expect(c?.context.pomo.value).toBe(config.timers.pomo);
        expect(c?.hasTag('idle')).toBe(true);
      });

      it('should allow the user to submit the changes', async () => {
        const { timerSettingsMachine, configMachine } = await setupTest();

        timerSettingsMachine.send(UPDATE('pomo', 0));
        timerSettingsMachine.send(UPDATE('short', 0));

        expect(timerSettingsMachine.getSnapshot()?.hasTag('errors')).toBe(true);

        timerSettingsMachine.send(UPDATE('pomo', 77));

        expect(timerSettingsMachine.getSnapshot()?.hasTag('errors')).toBe(true);

        timerSettingsMachine.send(UPDATE('short', 1));

        expect(timerSettingsMachine.getSnapshot()?.hasTag('errors')).toBe(false);

        timerSettingsMachine.send(SAVE());
        const c = timerSettingsMachine.getSnapshot();

        await waitFor(configMachine, (s) => s.hasTag('idle'));

        expect(configMachine.getSnapshot()?.context.timers.pomo).toBe(77);
        expect(timerSettingsMachine.getSnapshot()?.hasTag('idle')).toBe(true);
      });
    });
  });
});
