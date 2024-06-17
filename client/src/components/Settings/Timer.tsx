import { FormItemCheckbox } from '@client/components/Form/FormItem';
import { useConfig } from '@client/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import T from '@client/copy';
import { Button, FormItemNumber } from '@client/components';
import { TimerSettingsActorRef, timerSettingsModel } from '@client/machines';
import { Setting } from './Setting';
import { FormProvider, useForm } from 'react-hook-form';

const { CANCEL, SAVE, UPDATE } = timerSettingsModel.events;

const MAX = 255;

const UserFormSchema = z.object({
  pomo: z.number().positive().lt(MAX),
  short: z.number().positive().lt(MAX),
  long: z.number().positive().lt(MAX),
  displayTimerInStatusBar: z.boolean(),
});

type UserForm = z.infer<typeof UserFormSchema>;

export function Timer({ actor }: { actor: TimerSettingsActorRef }): JSX.Element {
  const { config, storeUpdate } = useConfig();

  const methods = useForm<UserForm>({
    defaultValues: {
      ...config?.timers,
      displayTimerInStatusBar: config?.displayTimerInStatusBar,
    },
    resolver: zodResolver(UserFormSchema),
  });

  return (
    <>
      <FormProvider {...methods}>
        <Setting
          variant="simple"
          heading="Timer"
          onSubmit={methods.handleSubmit((update) => {
            storeUpdate(update);
          })}
        >
          <FormItemNumber<UserForm>
            name="pomo"
            label="pomo"
            ariaLabel="Set the duration, in minutes, of a pomodoro timer"
          />
          <FormItemNumber<UserForm>
            name="short"
            label="Short Break"
            ariaLabel="Set the duration, in minutes, of each short break timer between pomodoros"
          />
          <FormItemNumber<UserForm>
            name="long"
            label="Long Break"
            ariaLabel="Set the duration, in minutes, of each long break timer which runs after completing several pomodoros"
          />
          <div className="flex justify-between">
            <Button
              // disabled={!state.can('SAVE')}
              type="submit"
              style={{ gridColumn: 'middle-r / right' }}
            >
              {T.settings.submit}
            </Button>
            <Button
              // disabled={!state.can('CANCEL')}
              type="button"
              variant="secondary"
              style={{ gridColumn: 'middle-r / right' }}
              onClick={() => {
                methods.reset();
                // send(CANCEL());
                // inputRef.current?.focus();
              }}
            >
              {T.settings.cancel}
            </Button>
          </div>
        </Setting>
        <Setting variant="simple" heading="Other" onSubmit={() => {}}>
          <FormItemCheckbox<UserForm>
            name="displayTimerInStatusBar"
            label="Show timer in status bar"
          />
        </Setting>
      </FormProvider>
    </>
  );
}
