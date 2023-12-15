import userEvent from '@testing-library/user-event';
import T from '@client/copy';
import { ok } from '@shared/Result';
import { emptyConfig, UserConfig } from '@shared/types';
import { ignoreWarnings } from '@test/ignore';
import { assert, pageModel } from '@test/pageModels';
import { act, render, screen } from '@test/rtl';
import { tick } from '@test/tick';
import { Pomodoro } from './Pomodoro';
import { ErrorBoundary } from '@client/components';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  const button = screen.queryByRole('button', { name: T.pomoTimer.stop });
  if (button) userEvent.click(button);
  act(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
});

const config: UserConfig = {
  ...emptyConfig,
  timers: { pomo: 10, short: 5, long: 8 },
  longBreakEvery: 4,
  autoStart: { beforeShortBreak: false, beforePomo: false, beforeLongBreak: false },
};

const {
  pomo: { timer, records },
} = pageModel;

describe('Pomodoro tests', () => {
  async function initTest() {
    await render(
      // <Pomodoro />
      <p>hey</p>,
      { overrides: { bridge: { storeRead: async () => ok(config) } } }
    );
    screen.debug();
  }

  ignoreWarnings(
    'xstate has a bug which logs a harmless warning for exit/entry actions https://github.com/statelyai/xstate/issues/1792',
    /No implementation found for action type 'onStartHook'/,
    /No implementation found for action type 'increaseShortBreakCount'/
  );

  it('the timer can be played, paused and stopped', async () => {
    // await initTest();
    const s = await render(
      // <Pomodoro />
      <p>hey</p>,
      { overrides: { bridge: { storeRead: async () => ok(config) } } }
    );
    s.debug();
    // screen.debug();

    expect(timer.current({ mins: 10 })).toBeInTheDocument();

    await userEvent.click(timer.startButton());

    tick(11);

    assert.timerAndProgress({ mins: 9, secs: 49, pomos: 0, long: 0 });

    await userEvent.click(timer.pauseButton());

    tick(11);

    expect(timer.current({ mins: 9, secs: 49 })).toBeInTheDocument();

    await userEvent.click(timer.playButton());

    tick(9);

    expect(timer.current({ mins: 9, secs: 40 })).toBeInTheDocument();

    await userEvent.click(timer.stopButton());

    tick(5);

    assert.timerAndProgress({ mins: 10, secs: 0, pomos: 0, long: 0 });

    await userEvent.click(timer.startButton());

    tick(5);

    expect(timer.current({ mins: 9, secs: 55 })).toBeInTheDocument();

    await userEvent.click(timer.stopButton());

    assert.timerAndProgress({ mins: 10, secs: 0, pomos: 0, long: 0 });
  }, 800);
});
