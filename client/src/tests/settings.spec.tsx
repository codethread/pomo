/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PageManager } from '@client/pages';
import { merge } from '@shared/merge';
import { ok } from '@shared/Result';
import { emptyConfig, TimerHooks } from '@shared/types';
import { ignoreWarnings } from '@test/ignore';
import { pageModel, userActions } from '@test/pageModels';
import { act, render, screen } from '@test/rtl';
import { tick } from '@test/tick';
import userEvent from '@testing-library/user-event';
import React from 'react';

beforeEach(() => {
  jest.useFakeTimers();
});

const hooks: TimerHooks = {
  onStartHook: jest.fn(),
  onTickHook: jest.fn(),
  onPauseHook: jest.fn(),
  onPlayHook: jest.fn(),
  onStopHook: jest.fn(),
  onCompleteHook: jest.fn(),
};

async function initTest() {
  return render(<PageManager />, {
    overrides: {
      bridge: {
        storeRead: async () =>
          ok(
            merge(emptyConfig, {
              timers: { pomo: 5, short: 5, long: 8 },
              autoStart: {
                beforePomo: false,
                beforeLongBreak: false,
                beforeShortBreak: false,
              },
            })
          ),
      },
      hooks,
    },
  });
}

const {
  pomo: { timer },
  settings,
} = pageModel;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});

ignoreWarnings(
  'xstate has a bug which logs a harmless warning for exit/entry actions https://github.com/statelyai/xstate/issues/1792',
  /No implementation found for action type 'onStartHook'/
);

describe(`given no timer is running
when the user changes the timer duration to 57`, () => {
  test('the timer updates to new the time', async () => {
    await initTest();
    await userActions.navigateToSettings();

    const input = screen.getByLabelText('Pomodoro');

    userEvent.type(input, '7');

    expect(await screen.findByDisplayValue('57')).toBeInTheDocument();

    userEvent.click(settings.timer.submit());
    await userActions.navigateToTimer();

    expect(screen.getByText('57 : 00')).toBeInTheDocument();
  });
});

describe(`given a 5 minute timer is running
when the user changes the timer settings to 57 minutes`, () => {
  test('the timer keeps ticking down for the original 5 minutes without pause', async () => {
    await initTest();

    userEvent.click(timer.startButton());

    tick(1);

    expect(hooks.onStartHook).toHaveBeenCalledTimes(1);
    expect(hooks.onTickHook).toHaveBeenLastCalledWith(
      expect.objectContaining({
        timer: expect.objectContaining({ minutes: 4, seconds: 59, type: 'pomo' }),
      })
    );

    await userActions.navigateToSettings();

    const input = screen.getByLabelText('Pomodoro');

    userEvent.type(input, '7');
    userEvent.click(settings.timer.submit());

    await userActions.navigateToTimer();
    tick(1);

    expect(hooks.onStartHook).toHaveBeenCalledTimes(1);
    expect(hooks.onTickHook).toHaveBeenLastCalledWith(
      expect.objectContaining({
        timer: expect.objectContaining({ minutes: 4, seconds: 58, type: 'pomo' }),
      })
    );
    expect(hooks.onCompleteHook).toHaveBeenCalledTimes(0);
    expect(hooks.onPauseHook).toHaveBeenCalledTimes(0);
    expect(hooks.onStopHook).toHaveBeenCalledTimes(0);
  });

  test('once the timer completes, the timer shows the new time of 57 minutes', async () => {
    await initTest();

    userEvent.click(timer.startButton());

    await userActions.navigateToSettings();

    const input = screen.getByLabelText('Pomodoro');

    userEvent.type(input, '7');
    userEvent.click(settings.timer.submit());

    await userActions.navigateToTimer();
    userEvent.click(timer.stopButton());

    expect(hooks.onStartHook).toHaveBeenCalledTimes(1);

    expect(screen.getByText('57 : 00')).toBeInTheDocument();

    userEvent.click(timer.startButton());
    tick(1);
    expect(hooks.onTickHook).toHaveBeenLastCalledWith(
      expect.objectContaining({
        timer: expect.objectContaining({ minutes: 56, seconds: 59, type: 'pomo' }),
      })
    );
  });
});
