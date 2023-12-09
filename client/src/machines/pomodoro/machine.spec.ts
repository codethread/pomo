/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { merge } from '@shared/merge';
import { emptyConfig, UserConfig } from '@shared/types';
import { ticks } from '@test/tick';
import { createMachine, interpret } from 'xstate';
import { actorIds } from '../constants';
import mainModel from '../main/model';
import timerModel from '../timer/model';
import { getActor } from '../utils';
import pomodoroMachineFactory, { IPomodoroMachine } from './machine';
import pomodoroModel from './model';

const { POMODORO, TIMER } = actorIds;
const { CONFIG_LOADED } = pomodoroModel.events;
const { PAUSE, PLAY, START, STOP } = timerModel.events;
const parentEvents = Object.keys(mainModel.events);

interface TestOverrides extends IPomodoroMachine {
  /**
   * Don't wait for the machine to have left the 'loading' state
   */
  dontWait?: true;
  config?: UserConfig;
}

function runTest(overrides?: TestOverrides) {
  const spy = jest.fn();

  const { context, dontWait, config } = overrides ?? {};
  const parent = createMachine(
    {
      id: 'parent',
      initial: 'running',
      states: {
        running: {
          on: Object.fromEntries(
            parentEvents.map((e) => [e, { actions: (ctx, event) => spy({ ctx, event }) }])
          ),
          invoke: {
            id: POMODORO,
            src: pomodoroMachineFactory({ context }),
          },
        },
      },
    },
    {
      actions: {
        spy: (_, e) => spy(e),
      },
    }
  );

  const service = interpret(parent);
  service.start();
  const pomoMachine = getActor(service, POMODORO);

  if (!dontWait) {
    pomoMachine.send(CONFIG_LOADED(config ?? emptyConfig));
  }

  return {
    parent: service,
    pomoMachine,
    getTimerMachine: () => getActor(pomoMachine, TIMER),
    spy,
  };
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('pomodoro machine', () => {
  it('should start in a loading state and transition to ready once config is loaded', () => {
    const { pomoMachine } = runTest({ dontWait: true });

    const c = pomoMachine.getSnapshot();
    expect(c?.value).toBe('loading');
    expect(c?.context.timers).toStrictEqual(emptyConfig.timers);

    const config = merge(emptyConfig, {
      timers: {
        long: 111,
        pomo: 222,
        short: 333,
      },
    });
    pomoMachine.send(CONFIG_LOADED(config));

    const c2 = pomoMachine.getSnapshot();
    expect(c2?.value).toBe('pomo');
    expect(c2?.context.timers).toStrictEqual(config.timers);
  });

  describe('when there are no autostarts in config', () => {
    const config = merge(emptyConfig, {
      autoStart: {
        beforeLongBreak: false,
        beforePomo: false,
        beforeShortBreak: false,
      },
      longBreakEvery: 5,
      timers: {
        long: 1,
        pomo: 1,
        short: 1,
      },
    });

    describe('when a pomo timer is started', () => {
      it('can be paused and continued ', () => {
        const { getTimerMachine, spy } = runTest({ config });
        const timer = getTimerMachine();

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 1, seconds: 0 });

        timer.send(START());

        expect(spy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              type: 'TIMER_START',
              data: expect.objectContaining({
                type: 'pomo',
              }),
            }),
          })
        );

        ticks(12);

        expect(spy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              type: 'TIMER_TICK',
              data: expect.objectContaining({
                type: 'pomo',
              }),
            }),
          })
        );

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 0, seconds: 48 });

        timer.send(PAUSE());

        expect(spy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              type: 'TIMER_PAUSE',
            }),
          })
        );

        ticks(12);

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 0, seconds: 48 });

        timer.send(PLAY());

        expect(spy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              type: 'TIMER_PLAY',
            }),
          })
        );

        ticks(12);

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 0, seconds: 36 });
      });

      it('does not count as a completed timer when the user stops', () => {
        const { pomoMachine, getTimerMachine, spy } = runTest({ config });

        const timer = getTimerMachine();

        timer.send(START());

        ticks(12);

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 0, seconds: 48 });

        timer.send(STOP());

        expect(spy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              type: 'TIMER_STOP',
            }),
          })
        );

        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({ minutes: 1, seconds: 0 });
        expect(pomoMachine.getSnapshot()?.context.completed).toStrictEqual({
          pomo: 0,
          long: 0,
          short: 0,
        });
      });

      it('should increase the pomo count, and move into a break timer when the timer completes', () => {
        const { pomoMachine, getTimerMachine } = runTest({ config });

        getTimerMachine().send(START());

        ticks(60);

        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({ minutes: 1, seconds: 0 });

        const { value, context } = pomoMachine.getSnapshot() ?? {};
        expect(context?.completed).toStrictEqual({
          pomo: 1,
          long: 0,
          short: 0,
        });
        expect(value).toBe('short');
      });

      describe('when config is updated', () => {
        it('should not interupt the current timer, but set the next timer correctly', () => {
          const { pomoMachine, getTimerMachine } = runTest({ config });

          getTimerMachine().send(START());

          ticks(30);

          expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
            minutes: config.timers.pomo - 1,
            seconds: 30,
          });
          expect(pomoMachine.getSnapshot()?.value).toBe('pomo');

          pomoMachine.send(
            CONFIG_LOADED(
              merge(emptyConfig, {
                timers: {
                  pomo: 17,
                },
              })
            )
          );

          // Timer should not appear to have changed after the event
          expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
            minutes: config.timers.pomo - 1,
            seconds: 30,
          });
          expect(pomoMachine.getSnapshot()?.value).toBe('pomo');

          // Timer should carry on ticking as usual
          ticks(5);

          expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
            minutes: config.timers.pomo - 1,
            seconds: 25,
          });
          expect(pomoMachine.getSnapshot()?.value).toBe('pomo');

          // End the timer to see the new config picked up
          getTimerMachine().send(STOP());

          expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
            minutes: 17,
            seconds: 0,
          });
          expect(pomoMachine.getSnapshot()?.value).toBe('pomo');
        });
      });
    });

    describe('when no timer is running, and config is updated', () => {
      it('should show the updated duration in the current timer', () => {
        const { pomoMachine, getTimerMachine } = runTest({ config });

        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
          minutes: config.timers.pomo,
          seconds: 0,
        });
        expect(pomoMachine.getSnapshot()?.value).toBe('pomo');

        pomoMachine.send(
          CONFIG_LOADED(
            merge(emptyConfig, {
              timers: {
                pomo: 17,
              },
            })
          )
        );

        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
          minutes: 17,
          seconds: 0,
        });
        expect(pomoMachine.getSnapshot()?.value).toBe('pomo');

        // Timer should not have started
        ticks(5);

        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
          minutes: 17,
          seconds: 0,
        });
      });
    });

    describe('when in a short break', () => {
      function runTestToShortBreak() {
        const res = runTest({ config });

        res.getTimerMachine().send(START());
        ticks(60);
        const { value } = res.pomoMachine.getSnapshot() ?? {};
        expect(value).toBe('short');

        return res;
      }

      it('can be paused and continued ', () => {
        const { getTimerMachine, spy } = runTestToShortBreak();

        const timer = getTimerMachine();

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 1, seconds: 0 });

        timer.send(START());

        expect(spy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              data: expect.objectContaining({
                type: 'short',
              }),
            }),
          })
        );

        ticks(12);

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 0, seconds: 48 });

        timer.send(PAUSE());

        ticks(12);

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 0, seconds: 48 });

        timer.send(PLAY());

        ticks(12);

        expect(timer.getSnapshot()?.context).toMatchObject({ minutes: 0, seconds: 36 });
      });

      it('should complete the break when the user stops', () => {
        const { getTimerMachine, pomoMachine } = runTestToShortBreak();

        getTimerMachine().send(START());

        ticks(12);

        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({ minutes: 0, seconds: 48 });

        getTimerMachine().send(STOP());

        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
          minutes: 1,
          seconds: 0,
          type: 'pomo',
        });

        const { context, value } = pomoMachine.getSnapshot() ?? {};

        expect(context?.completed).toStrictEqual({ pomo: 1, long: 0, short: 1 });
        expect(value).toBe('pomo');
      });
    });

    describe('when the target number of pomo timers have been completed', () => {
      function runTestToLongTimer() {
        const res = runTest({ config });
        const { getTimerMachine } = res;

        repeat(config.longBreakEvery - 1, (c) => {
          getTimerMachine().send(START());
          // wait for timer to complete
          ticks(60);
          // start then stop to immediately skip the break
          getTimerMachine().send(START());
          getTimerMachine().send(STOP());
        });

        // complete the final timer
        getTimerMachine().send(START());
        // wait for timer to complete
        ticks(60);

        return res;
      }

      it('should transition to a long break and then back to a pomo timer', () => {
        const { pomoMachine, getTimerMachine, spy } = runTestToLongTimer();

        const { context, value } = pomoMachine.getSnapshot() ?? {};

        expect(context?.completed).toStrictEqual({
          pomo: config.longBreakEvery,
          long: 0,
          short: config.longBreakEvery - 1,
        });
        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
          minutes: config.timers.long,
          seconds: 0,
        });
        expect(value).toBe('long');

        // complete long break
        getTimerMachine().send(START());

        expect(spy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              type: 'TIMER_START',
              data: expect.objectContaining({
                type: 'long',
              }),
            }),
          })
        );

        ticks(config.timers.long * 60);

        const s = pomoMachine.getSnapshot();

        expect(s?.value).toBe('pomo');
        expect(s?.context.completed).toMatchObject({
          pomo: config.longBreakEvery,
          long: 1,
          short: config.longBreakEvery - 1,
        });
        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
          minutes: config.timers.pomo,
          seconds: 0,
        });
      });

      it('should transition to a long break and back to pomo when the timer is stopped', () => {
        const { pomoMachine, getTimerMachine } = runTestToLongTimer();

        getTimerMachine().send(START());
        getTimerMachine().send(STOP());

        const s = pomoMachine.getSnapshot();

        expect(s?.value).toBe('pomo');
        expect(s?.context.completed).toMatchObject({
          pomo: config.longBreakEvery,
          long: 1,
          short: config.longBreakEvery - 1,
        });
        expect(getTimerMachine().getSnapshot()?.context).toMatchObject({
          minutes: config.timers.pomo,
          seconds: 0,
        });
      });
    });
  });

  describe('when there are autostarts', () => {
    const config = merge(emptyConfig, {
      autoStart: {
        beforeLongBreak: true,
        beforePomo: true,
        beforeShortBreak: true,
      },
      longBreakEvery: 2,
      timers: {
        long: 1,
        pomo: 1,
        short: 1,
      },
    });

    it('should start automatically progress through all timers', () => {
      const { pomoMachine, spy } = runTest({ config });

      repeat(config.longBreakEvery * 2, () => {
        // pomo timer
        ticks(60);
        // break timer
        ticks(60);
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({
            type: 'TIMER_START',
            data: expect.objectContaining({
              type: 'pomo',
            }),
          }),
        })
      );

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({
            type: 'TIMER_START',
            data: expect.objectContaining({
              type: 'short',
            }),
          }),
        })
      );

      const s2 = pomoMachine.getSnapshot();
      expect(s2?.value).toBe('pomo');
      expect(s2?.context.completed).toStrictEqual({
        pomo: config.longBreakEvery * 2,
        long: 2,
        short: (config.longBreakEvery - 1) * 2,
      });
    });
  });
});

function repeat(count: number, cb: (iteration: number) => void): void {
  let c = 1;
  while (c <= count) {
    cb(c);
    // eslint-disable-next-line no-plusplus
    c++;
  }
}
