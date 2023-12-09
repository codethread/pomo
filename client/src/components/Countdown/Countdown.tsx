import { Box, Button, TimerProgress } from '@client/components';
import T from '@client/copy';
import { TimerActorRef } from '@client/machines';
import { PauseIcon, PlayIcon, StopIcon } from '@heroicons/react/solid';
import { displayNum } from '@shared/format';
import { useActor } from '@xstate/react';
import React from 'react';
import './countdown.css';

export interface ICountdown {
  timerRef: TimerActorRef;
  title: string;
  duration: number;
}

export function Countdown({ timerRef, title, duration }: ICountdown): JSX.Element {
  const [state, send] = useActor(timerRef);
  const { minutes, seconds, type } = state.context;

  const timerState = (() => {
    if (state.can('START')) {
      return 'inactive';
    }
    if (type === 'pomo') {
      return 'pomo';
    }
    return 'break';
  })();

  return (
    <div className="timer mt-5">
      <Box style={{ gridArea: 'timer' }}>
        <TimerProgress duration={duration} mins={minutes} seconds={seconds} state={timerState} />
      </Box>
      <Box
        style={{
          gridRow: 'top / center',
          gridColumn: 'middle / right',
          justifyContent: 'end',
          fontSize: 14,
        }}
      >
        <p className={`text-center ${type === 'pomo' ? 'text-thmPrimary' : 'text-thmGood'}`}>
          {title}
        </p>
      </Box>
      <Box
        className="mt-[7px]"
        style={{
          gridRow: 'center / bottom',
          gridColumn: 'middle / right',
          justifyContent: 'start',
        }}
      >
        <p
          style={{
            fontSize: 38,
            textAlign: 'center',
          }}
        >
          {displayNum(minutes)} : {displayNum(seconds)}
        </p>
      </Box>
      <Box style={{ gridArea: 'controls' }}>
        <Box
          style={{
            flexDirection: 'row',
            justifyContent: state.can('START') ? 'center' : 'space-between',
          }}
        >
          {state.can('START') && (
            <Button
              data-test-id="start-button"
              variant="icon"
              onClick={() => {
                send({ type: 'START' });
              }}
              aria-label={T.pomoTimer.start}
              className="text-thmPrimary"
            >
              <PlayIcon />
            </Button>
          )}
          {state.can('STOP') && (
            <Button
              data-test-id="stop-button"
              className="text-thmPrimary"
              variant="icon"
              onClick={() => {
                send({ type: 'STOP' });
              }}
              aria-label={T.pomoTimer.stop}
            >
              <StopIcon />
            </Button>
          )}
          {state.can('PAUSE') && (
            <Button
              variant="icon"
              onClick={() => send({ type: 'PAUSE' })}
              aria-label={T.pomoTimer.pause}
              className="text-thmPrimary"
            >
              <PauseIcon />
            </Button>
          )}
          {state.can('PLAY') && (
            <Button
              className="animate-pulse text-thmPrimary"
              variant="icon"
              onClick={() => send({ type: 'PLAY' })}
              aria-label={T.pomoTimer.play}
            >
              <PlayIcon />
            </Button>
          )}
        </Box>
      </Box>
    </div>
  );
}
