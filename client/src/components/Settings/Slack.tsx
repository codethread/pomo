import { Button, FormItemPassword } from '@client/components';
import { FormItemText } from '@client/components/Form/FormItem';
import z from 'zod';
import { useBridge, useConfig } from '@client/hooks';
import { Setting } from './Setting';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IBridge } from '@shared/types';
import { useAsyncFn, useLocalStorage } from 'react-use';
import { CheckIcon, RssIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';

const SlackFormSchema = z.object({
  enabled: z.boolean(),
  slackDomain: z.string().min(1, { message: 'domain is required' }).trim(),
  slackToken: z.string().min(1, { message: 'token is required' }).trim(),
  slackDCookie: z.string().min(1, { message: 'cookie is required' }).trim(),
  slackDSCookie: z.string().trim(),
});

type SlackForm = z.infer<typeof SlackFormSchema>;

export function Slack() {
  const { config, storeUpdate } = useConfig();
  const [updated, setUpdated] = useState(false);
  // TODO: move this storage into some generic component/hook
  const [wip, setWipStorage, remove] = useLocalStorage<Partial<SlackForm>>('slack-form-key');
  const bridge = useBridge();

  const [{ error, loading, value: userName }, validate] = useAsyncFn(validateDetails(bridge));

  const methods = useForm<SlackForm>({
    defaultValues: config?.slack,
    resolver: zodResolver(SlackFormSchema),
  });

  // Update the form state from local storage if data is present
  useEffect(() => {
    if (wip && !updated) {
      setUpdated(true);
      Object.entries(wip).map(([key, value]) => {
        if (value) {
          methods.setValue(key, value);
        }
      });
    }
  }, [wip, methods, setUpdated, updated]);

  methods.watch((inputs) => {
    setWipStorage(inputs);
  });

  return (
    <FormProvider {...methods}>
      <Setting<SlackForm>
        heading="Slack"
        name="enabled"
        variant="toggle"
        onSubmit={methods.handleSubmit((update) => {
          remove();
          validate(update).then(() => {
            storeUpdate({ slack: update });
          });
        })}
      >
        <FormItemText<SlackForm> name="slackDomain" label="Url" placeholder="slack" />
        <FormItemPassword<SlackForm> name="slackToken" label="Token" placeholder="xocx-..." />
        <FormItemPassword<SlackForm>
          name="slackDCookie"
          label="Cookie 'd'"
          placeholder="xocx-..."
        />
        <FormItemPassword<SlackForm>
          name="slackDSCookie"
          label="Cookie 'ds'"
          placeholder="xocx-..."
        />

        {methods.formState.isSubmitted && loading && (
          <p className="text-thmSecondary">
            Checking details{' '}
            <RssIcon className="inline-flex ml-1 w-2 relative bottom-2 animate-ping" />
          </p>
        )}
        {methods.formState.isSubmitted && !methods.formState.isDirty && !loading && error && (
          <p className="text-thmError">{error.message}</p>
        )}
        {methods.formState.isSubmitted &&
          !methods.formState.isDirty &&
          typeof userName === 'string' && (
            <p className="text-thmGood flex items-center">
              Greetings {userName} <CheckIcon className="inline-flex ml-1 w-5" />
            </p>
          )}

        <div
          style={{
            gridColumn: 'left / right',
            textAlign: 'center',
          }}
        >
          <Button
            type="button"
            variant="tertiary"
            onClick={() => {
              bridge.openExternal('https://github.com/codethread/pomo#slack-integration');
            }}
          >
            where do I get these from?
          </Button>
        </div>
        <div className="flex justify-between">
          <Button
            type="submit"
            disabled={!methods.formState.isDirty}
            isSubmitting={methods.formState.isSubmitting}
          >
            Submit
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!methods.formState.isDirty}
            onClick={() => {
              remove();
              methods.reset();
            }}
          >
            Cancel
          </Button>
        </div>
      </Setting>
    </FormProvider>
  );
}

function validateDetails(bridge: IBridge) {
  return async (auth: SlackForm): Promise<string | true> => {
    // no point validating if turning off slack
    if (!auth.enabled) return true;

    try {
      const res = await bridge.slackValidate({
        token: auth.slackToken,
        domain: auth.slackDomain,
        dCookie: auth.slackDCookie,
        dSCookie: auth.slackDSCookie,
      });

      return res.match({
        Ok: (res) => {
          if (!res.ok) {
            throw res;
          }
          return (
            res.profile.real_name_normalized ||
            res.profile.real_name ||
            res.profile.first_name ||
            res.profile.display_name_normalized
          );
        },
        Err: (e) => {
          throw e;
        },
      });
    } catch (e: any) {
      console.error(e);
      if (e.error === 'invalid_auth') {
        throw new Error(
          'These details did not work, be sure to check the link below for details about these fields'
        );
      } else {
        throw new Error(
          `Something went wrong with these details: "${e.error}". This is likely an issue with the details you put in, but if it looks like a technical error, please raise an issue!`
        );
      }
    }
  };
}
