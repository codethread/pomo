import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import T from '@client/copy';
import { Setting } from './Setting';
import { FormProvider, useForm } from 'react-hook-form';
import { useConfig } from '@client/hooks/useConfig';
import { Button } from '../Button/Button';
import { useBridge } from '@client/hooks/useBridge';
import { useAsync } from 'react-use';

const timerHooks = [
  'onStartHook',
  'onTickHook',
  'onPauseHook',
  'onPlayHook',
  'onStopHook',
  'onCompleteHook',
] as const;

const MacOSFormSchema = z.object({
  hooks: z.record(z.enum(timerHooks), z.string().optional()),
});

type MacOSForm = z.infer<typeof MacOSFormSchema>;

export function MacOS(): JSX.Element {
  const { config, storeUpdate } = useConfig();
  const bridge = useBridge();

  const availableShortcuts = useAsync(async () => {
    const result = await bridge.macosShortcutsList().catch((e) => {
      throw new Error(e);
    });
    return result;
  });

  const methods = useForm<MacOSForm>({
    defaultValues: {
      hooks: config?.macos?.hooks || {},
    },
    resolver: zodResolver(MacOSFormSchema),
  });

  const { watch, setValue } = methods;
  const watchedHooks = watch('hooks');

  const setHookShortcut = (
    hook: keyof typeof watchedHooks,
    shortcut: string | undefined,
  ) => {
    setValue(`hooks.${hook}` as any, shortcut, { shouldDirty: true });
  };

  if (availableShortcuts.loading) {
    return <div>Loading shortcuts...</div>;
  }

  if (availableShortcuts.error) {
    return (
      <div>Error loading shortcuts: {availableShortcuts.error.message}</div>
    );
  }

  const shortcuts = availableShortcuts.value || [];

  return (
    <FormProvider {...methods}>
      <Setting
        variant="simple"
        heading="macOS Shortcuts"
        onSubmit={methods.handleSubmit((update) => {
          storeUpdate({
            macos: {
              shortcuts: shortcuts,
              hooks: update.hooks,
            },
          });
        })}
      >
        <div className="space-y-4">
          <h3 className="text-md mb-3 font-medium">Timer Hook Configuration</h3>
          <div className="space-y-3">
            {timerHooks.map((hook) => (
              <div key={hook} className="flex items-center justify-between">
                <label className="text-sm font-medium">{hook}</label>
                <select
                  value={watchedHooks?.[hook] || ''}
                  onChange={(e) =>
                    setHookShortcut(hook, e.target.value || undefined)
                  }
                  className="border-gray-300 min-w-[200px] rounded border px-3 py-1 text-sm"
                >
                  <option value="">None</option>
                  {shortcuts.map((shortcut) => (
                    <option key={shortcut} value={shortcut}>
                      {shortcut}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button type="submit" disabled={!methods.formState.isDirty}>
              {T.settings.submit}
            </Button>
            <Button
              disabled={!methods.formState.isDirty}
              type="button"
              variant="secondary"
              onClick={() => methods.reset()}
            >
              {T.settings.cancel}
            </Button>
          </div>
        </div>
      </Setting>
    </FormProvider>
  );
}
