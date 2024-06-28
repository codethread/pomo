import { Button, InputSelect } from '@client/components';
import { useBridge, useConfig } from '@client/hooks';
import { ThemeName, themes } from '@client/theme';
import { Setting } from './Setting';
import { FormProvider, useForm } from 'react-hook-form';

export function Theme(): JSX.Element {
  const { storeUpdate, config } = useConfig();
  const id = 'theme-selector';
  const bridge = useBridge();
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <Setting variant="simple" heading="Theme" onSubmit={() => {}}>
        <InputSelect<ThemeName>
          id={id}
          onChange={(theme) => {
            storeUpdate({ theme });
          }}
          initialValue={config?.theme ?? 'nord'}
          options={themes}
        />
        <p className="mt-4 text-sm">
          Can&apos;t find the theme you want?{' '}
          <Button
            variant="tertiary"
            onClick={() => {
              bridge.openExternal(
                'https://github.com/codethread/pomo-electron/issues/new?assignees=codethread&labels=theme&template=theme-request.md&title='
              );
            }}
          >
            Request it here
          </Button>{' '}
          and we'll get right on it!
        </p>
      </Setting>
    </FormProvider>
  );
}
