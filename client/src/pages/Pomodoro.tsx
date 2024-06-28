import { Countdown } from '@client/components/Countdown/Countdown';
import { usePomodoro, useTimer } from '@client/hooks/machines';
import { assertUnreachable } from '@shared/asserts';
import { TimerType } from '@shared/types';

export function Pomodoro(): JSX.Element | null {
  const [state] = usePomodoro();
  const timerRef = useTimer();

  const { pomo, long } = state.context.completed;
  const value = getValue();
  const duration = state.context.timers[value];

  const title = getTitle(value);

  return timerRef ? (
    <>
      <Countdown timerRef={timerRef} title={title} duration={duration} />
      <div style={{ display: 'none' }}>
        <p>completed pomos: {pomo}</p>
        <p>completed breaks: {long}</p>
      </div>
    </>
  ) : null;

  function getValue(): TimerType {
    switch (true) {
      case state.matches('long'):
        return 'long';
      case state.matches('short'):
        return 'short';
      default:
        return 'pomo';
    }
  }
}

function getTitle(state: TimerType): string {
  switch (state) {
    case 'pomo':
      return 'Pomodoro';
    case 'short':
      return 'Short Break';
    case 'long':
      return 'Long Break';
    default:
      return assertUnreachable(state);
  }
}
