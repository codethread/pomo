import { PageWrapper } from '@client/storybook';
import React, { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import {
  FormItemCheckbox as FormItemCheckboxC,
  FormItemNumber as FormItemNumberC,
  FormItemPassword,
} from './FormItem';

export default {
  component: FormItemNumberC,
  args: {
    wrapped: true,
  },
} as ComponentMeta<StoryArgs>;

type StoryArgs = (args: { wrapped: boolean; error?: string }) => JSX.Element;

export const Form: ComponentStory<StoryArgs> = ({ wrapped, error }) => {
  const [c, setC] = useState(0);
  const [s, setS] = useState('');
  const [checked, setChecked] = useState(false);

  return (
    <PageWrapper wrapped={wrapped} padded centered>
      <div className="flex flex-col gap-5">
        <FormItemNumberC
          id="number item"
          label="Some number"
          error={error}
          input={{
            min: 0,
            max: 20,
            onChange(n) {
              setC(n);
            },
            value: c,
          }}
        />
        <FormItemNumberC
          id="number item"
          label="Some number"
          error={error}
          input={{
            min: 0,
            max: 20,
            onChange: setC,
            value: c,
          }}
        />
        <FormItemCheckboxC
          checkbox={{
            onChange() {
              setChecked(!checked);
            },
            initiallyChecked: checked,
          }}
          label="hello"
        />
        <FormItemPassword
          id="ofijwef"
          label="input password"
          error={error}
          input={{
            placeholder: 'enter passowrd',
            onChange: setS,
            value: s,
          }}
        />
      </div>
    </PageWrapper>
  );
};

export const FormInputPassword: ComponentStory<StoryArgs> = ({ wrapped, error }) => {
  const [s, setS] = useState('');

  return (
    <PageWrapper wrapped={wrapped} padded centered>
      <FormItemPassword
        id="ofijwef"
        label="input password"
        error={error}
        input={{
          placeholder: 'enter passowrd',
          onChange: setS,
          value: s,
        }}
      />
    </PageWrapper>
  );
};

export const FormInputNumber: ComponentStory<StoryArgs> = ({ wrapped, error }) => {
  const [c, setC] = useState(0);

  return (
    <PageWrapper wrapped={wrapped} padded centered>
      <FormItemNumberC
        id="number item"
        label="Some number"
        error={error}
        input={{
          min: 0,
          max: 20,
          onChange: setC,
          value: c,
        }}
      />
    </PageWrapper>
  );
};

export const FormItemCheckbox: ComponentStory<StoryArgs> = ({ wrapped }) => {
  const [c, setC] = useState(false);
  return (
    <PageWrapper wrapped={wrapped} padded centered>
      <FormItemCheckboxC
        checkbox={{
          onChange() {
            setC(!c);
          },
          initiallyChecked: c,
        }}
        label="hello"
      />
    </PageWrapper>
  );
};
