import { FormItemCheckbox } from '@client/components/Form/FormItem';
import { useConfig } from '@client/hooks';
import React, { useRef } from 'react';
import { useActor } from '@xstate/react';
import T from '@client/copy';
import { Button, FormItemNumber } from '@client/components';
import { TimerSettingsActorRef, timerSettingsModel } from '@client/machines';
import { Setting } from './Setting';

const { CANCEL, SAVE, UPDATE } = timerSettingsModel.events;

export function Timer({ actor }: { actor: TimerSettingsActorRef }): JSX.Element {
  const [state, send] = useActor(actor);
  const {
    context: { long, pomo, short },
  } = state;
  const inputRef = useRef<HTMLInputElement>(null);
  const { config, storeUpdate } = useConfig();

  return (
    <>
      <Setting
        variant="simple"
        heading="Timer"
        onSubmit={() => {
          send(SAVE());
          inputRef.current?.focus();
        }}
      >
        <FormItemNumber
          label="Pomodoro"
          ariaLabel="Set the duration, in minutes, of a pomodoro timer"
          error={pomo.error}
          input={{
            min: 1,
            max: 100,
            value: pomo.value,
            onChange: (n) => {
              send(UPDATE('pomo', n));
            },
          }}
        />
        <FormItemNumber
          label="Short Break"
          ariaLabel="Set the duration, in minutes, of each short break timer between pomodoros"
          error={short.error}
          input={{
            min: 1,
            max: 100,
            value: short.value,
            onChange: (n) => {
              send(UPDATE('short', n));
            },
          }}
        />
        <FormItemNumber
          label="Long Break"
          ariaLabel="Set the duration, in minutes, of each long break timer which runs after completing several pomodoros"
          error={long.error}
          input={{
            min: 1,
            max: 100,
            value: long.value,
            onChange: (n) => {
              send(UPDATE('long', n));
            },
          }}
        />
        <div className="flex justify-between">
          <Button
            disabled={!state.can('SAVE')}
            type="submit"
            style={{ gridColumn: 'middle-r / right' }}
          >
            {T.settings.submit}
          </Button>
          <Button
            disabled={!state.can('CANCEL')}
            type="button"
            variant="secondary"
            style={{ gridColumn: 'middle-r / right' }}
            onClick={() => {
              send(CANCEL());
              inputRef.current?.focus();
            }}
          >
            {T.settings.cancel}
          </Button>
        </div>
      </Setting>
      <Setting variant="simple" heading="Other" onSubmit={() => {}}>
        <FormItemCheckbox
          checkbox={{
            initiallyChecked: config?.displayTimerInStatusBar ?? false,
            onChange(checked: boolean) {
              storeUpdate({ displayTimerInStatusBar: checked });
            },
          }}
          label="Show timer in status bar"
        />
      </Setting>
    </>
  );
}
