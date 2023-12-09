import { Inspector } from '@client/components';
import { emptyConfig } from '@shared/types';
import { useActor, useInterpret, useSelector } from '@xstate/react';
import React from 'react';
import type { PomodoroService, TimerActorRef } from '..';
import machine from './machine';
import pomodoroModel from './model';

export default {
  component: Pomo,
};

export function Pomo(): JSX.Element {
  return (
    <>
      <Inspector />
      <PomoMachine />
    </>
  );
}

function PomoMachine(): JSX.Element {
  const service = useInterpret(
    machine({
      context: {
        timers: {
          pomo: 1,
        },
      },
    }),
    {
      devTools: true,
    }
  );

  return <Child service={service} />;
}

function Child({ service }: { service: PomodoroService }): JSX.Element {
  const context = useSelector(service, (s) => s.context);
  const timerRef = useSelector(service, (c) => c.children['timer-actor'] as TimerActorRef | null);
  const state = useSelector(service, (s) => s);

  return (
    <>
      <p>parent</p>
      <code>{JSON.stringify(context, null, 2)}</code>
      {timerRef && <Actor actorRef={timerRef} />}
      {state.matches('loading') && (
        <button
          type="button"
          onClick={() => {
            service.send(pomodoroModel.events.CONFIG_LOADED(emptyConfig));
          }}
        >
          load config
        </button>
      )}
    </>
  );
}

function Actor({ actorRef }: { actorRef: TimerActorRef }): JSX.Element {
  const [state] = useActor(actorRef);

  return (
    <>
      <p>child</p>
      <code>{JSON.stringify({ value: state.value, context: state.context }, null, 2)}</code>
    </>
  );
}
