/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createFakeBridge } from '@electron/ipc/createFakeBridge';
import { DeepPartial, emptyConfig, HookContext, TimerHooks, UserConfig } from '@shared/types';
import { ticks } from '@test/tick';
import { merge } from '@shared/merge';
import { assign, createMachine, interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';
import { actorIds } from '../constants';
import { getActor } from '../utils';
import { createFakeHooks } from '../createFakeHooks';
import mainMachineFactory, { MainService } from './machine';
import timerModel from '../timer/model';

interface Overrides {
  actions?: Partial<TimerHooks>;
  configOverride?: DeepPartial<UserConfig>;
}

function getService(overrides?: Overrides): MainService {
  const machine = mainMachineFactory({
    pomodoro: {}, // TODO this needs a rename and optional overrides
    bridge: createFakeBridge(),
    actions: { ...createFakeHooks(), ...overrides?.actions },
    configOverride: overrides?.configOverride && merge(emptyConfig, overrides.configOverride),
    updateTheme: () => {},
  });

  const service = interpret(machine);

  return service;
}

function getConfigActor(service: MainService) {
  return getActor(service, CONFIG);
}

function getPomoActor(service: MainService) {
  return getActor(service, POMODORO);
}

function getTimerActor(service: MainService) {
  return getActor(getPomoActor(service), TIMER);
}

const { CONFIG, POMODORO, TIMER } = actorIds;
const { PAUSE, PLAY, START, STOP } = timerModel.events;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('mainMachine', () => {
  it('should start in active state', () => {
    const service = getService();

    service.start();

    expect(service.state.value).toBe('active');
  });

  it('should spawn all child actors in their loading states', () => {
    const service = getService();

    service.start();

    const configActor = getConfigActor(service);
    const pomoActor = getPomoActor(service);

    expect(configActor.getSnapshot()?.value).toBe('loading');
    expect(pomoActor.getSnapshot()?.value).toBe('loading');
  });

  it('should pass the loaded config to the pomo timer', async () => {
    const service = getService({
      configOverride: { timers: { pomo: 23 } },
    });

    service.start();

    const pomoActor = getPomoActor(service);

    expect(
      await waitFor(pomoActor, ({ value }) => value === 'pomo', { timeout: 100 })
    ).toBeTruthy();

    expect(pomoActor.getSnapshot()?.context.timers.pomo).toBe(23);
  });

  it('should invoke integrations when events fire', async () => {
    const hooks: TimerHooks = {
      onStartHook: jest.fn(),
      onTickHook: jest.fn(),
      onPauseHook: jest.fn(),
      onPlayHook: jest.fn(),
      onStopHook: jest.fn(),
      onCompleteHook: jest.fn(),
    };

    const pomoDuration = 1;

    const service = getService({
      actions: hooks,
      configOverride: { timers: { pomo: 1 } },
    });

    service.start();

    const pomoActor = getPomoActor(service);

    await waitFor(pomoActor, ({ value }) => value === 'pomo', { timeout: 100 });

    const timerActor = getTimerActor(service);

    /* ******************************************************************* */
    // START
    /* ******************************************************************* */
    timerActor.send(START());

    expect(hooks.onStartHook).toHaveBeenCalledWith<[HookContext]>({
      timer: { minutes: pomoDuration, seconds: 0, type: 'pomo', autoStart: false },
      bridge: expect.anything(),
      config: expect.anything(),
    });

    /* ******************************************************************* */
    // TICK
    /* ******************************************************************* */
    ticks(11);

    expect(hooks.onTickHook).toHaveBeenCalledTimes(11);
    expect(hooks.onTickHook).toHaveBeenNthCalledWith(
      11,
      expect.objectContaining({
        timer: expect.objectContaining({ minutes: pomoDuration - 1, seconds: 49, type: 'pomo' }),
      })
    );

    /* ******************************************************************* */
    // PAUSE
    /* ******************************************************************* */
    timerActor.send(PAUSE());
    ticks(11);

    expect(hooks.onPauseHook).toHaveBeenCalledTimes(1);
    expect(hooks.onPauseHook).toHaveBeenCalledWith(
      expect.objectContaining({
        timer: expect.objectContaining({ minutes: pomoDuration - 1, seconds: 49, type: 'pomo' }),
      })
    );

    /* ******************************************************************* */
    // PLAY
    /* ******************************************************************* */
    timerActor.send(PLAY());

    ticks(9);

    expect(hooks.onPlayHook).toHaveBeenCalledTimes(1);
    expect(hooks.onPlayHook).toHaveBeenCalledWith(
      expect.objectContaining({
        timer: expect.objectContaining({ minutes: pomoDuration - 1, seconds: 49, type: 'pomo' }),
      })
    );
    expect(hooks.onTickHook).toHaveBeenCalledTimes(20);

    /* ******************************************************************* */
    // STOP
    /* ******************************************************************* */
    timerActor.send(STOP());

    ticks(5);

    expect(hooks.onStopHook).toHaveBeenCalledTimes(1);
    expect(hooks.onStopHook).toHaveBeenCalledWith(
      expect.objectContaining({
        timer: expect.objectContaining({ minutes: pomoDuration - 1, seconds: 40, type: 'pomo' }),
      })
    );

    /* ******************************************************************* */
    // COMPLETE
    /* ******************************************************************* */

    expect(hooks.onCompleteHook).toHaveBeenCalledTimes(0);

    // new timer actor is created after the last one is stopped
    getTimerActor(service).send(START());

    ticks(60 * pomoDuration);

    expect(hooks.onCompleteHook).toHaveBeenCalledTimes(1);
    expect(hooks.onCompleteHook).toHaveBeenCalledWith(
      expect.objectContaining({
        timer: expect.objectContaining({ minutes: 0, seconds: 1, type: 'pomo' }),
      })
    );
  });
});
