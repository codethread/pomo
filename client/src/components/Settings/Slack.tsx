import { Button, FormItemPassword } from '@client/components';
import { FormItemCheckbox, FormItemText } from '@client/components/Form/FormItem';
import { useBridge, useConfig } from '@client/hooks';
import React, { useState } from 'react';
import { Setting } from './Setting';

export function Slack(): JSX.Element | null {
  const config = useConfig();
  const { storeUpdate } = config;
  const bridge = useBridge();

  // TODO: fix this up to handle loading
  const slack = config.config?.slack ?? { enabled: false };

  const initialToken = slack.enabled ? slack.slackToken : '';
  const initialCookie = slack.enabled ? slack.slackDCookie : '';
  const initialSCookie = slack.enabled ? slack.slackDSCookie : '';
  const initialDomain = slack.enabled ? slack.slackDomain : '';

  const [token, setToken] = useState(initialToken);
  const [cookie, setCookie] = useState(initialCookie);
  const [sCookie, setSCookie] = useState(initialSCookie);
  const [domain, setDomain] = useState(initialDomain);

  // TODO: upgrade Typescript to get this to work as just loading
  if (config.loading) return null;

  const canNotSubmit =
    [token, cookie, domain].includes('') ||
    (token === initialToken &&
      cookie === initialCookie &&
      sCookie === initialSCookie &&
      domain === initialDomain);

  return (
    <Setting
      heading="Slack"
      variant="simple"
      onSubmit={() => {
        storeUpdate({
          slack: {
            slackDomain: domain,
            slackToken: token,
            slackDCookie: cookie,
            slackDSCookie: sCookie,
          },
        });
      }}
    >
      <FormItemCheckbox
        checkbox={{
          initiallyChecked: slack.enabled,
          onChange() {
            storeUpdate({
              slack: {
                enabled: !slack.enabled,
              },
            });
          },
        }}
        label="Enabled"
      />
      <FormItemText
        id="slackUrl"
        label="Url"
        input={{
          placeholder: 'domain',
          value: domain,
          onChange: (v) => setDomain(v),
        }}
      />
      <FormItemPassword
        id="slackToken"
        label="Token"
        input={{
          placeholder: 'xocx-...',
          value: token,
          onChange: (v) => setToken(v),
        }}
      />
      <FormItemPassword
        id="slackCookie"
        label="Cookie 'd'"
        input={{
          placeholder: 'xocx-...',
          value: cookie,
          onChange: (v) => setCookie(v),
        }}
      />
      <FormItemPassword
        id="slackCookieD"
        label="Cookie 'ds'"
        input={{
          placeholder: 'xocx-...',
          value: sCookie,
          onChange: (v) => setSCookie(v),
        }}
      />

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
            bridge.openExternal('https://github.com/AHDesigns/pomo-electron#slack-integration');
          }}
        >
          where do I get these from?
        </Button>
      </div>
      <div className="flex justify-between">
        <Button disabled={canNotSubmit} type="submit">
          Submit
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setDomain(initialDomain);
            setToken(initialToken);
            setCookie(initialCookie);
            setSCookie(initialSCookie);
          }}
        >
          Cancel
        </Button>
      </div>
    </Setting>
  );
}
