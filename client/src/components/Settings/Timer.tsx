import { useConfig } from '@client/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import T from '@client/copy';
import { Button, FormItemNumber } from '@client/components';
import { Setting } from './Setting';
import { FormProvider, useForm } from 'react-hook-form';

const MAX = 255;

const UserFormSchema = z.object({
  pomo: z.number().positive().lt(MAX),
  short: z.number().positive().lt(MAX),
  long: z.number().positive().lt(MAX),
  breakFrequency: z.number().positive().lt(20),
});

type UserForm = z.input<typeof UserFormSchema>;

export function Timer(): JSX.Element {
  const { config, storeUpdate } = useConfig();

  const methods = useForm<UserForm>({
    defaultValues: {
      ...config?.timers,
      breakFrequency: config?.longBreakEvery,
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
            storeUpdate({ timers: update, longBreakEvery: update.breakFrequency });
          })}
        >
          <FormItemNumber<UserForm>
            name="pomo"
            label="Pomo"
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
          <FormItemNumber<UserForm>
            name="breakFrequency"
            label="Break Frequency"
            ariaLabel="Set after how many Pomodoro timers do you want a longer break"
          />
          <div className="flex justify-between">
            <Button type="submit">{T.settings.submit}</Button>
            <Button
              disabled={!methods.formState.isDirty}
              type="button"
              variant="secondary"
              onClick={() => methods.reset()}
            >
              {T.settings.cancel}
            </Button>
          </div>
        </Setting>
        {/* <Setting variant="simple" heading="Other" onSubmit={() => {}}> */}
        {/*   <FormItemCheckbox<UserForm> */}
        {/*     name="displayTimerInStatusBar" */}
        {/*     label="Show timer in status bar" */}
        {/*   /> */}
        {/* </Setting> */}
      </FormProvider>
    </>
  );
}
