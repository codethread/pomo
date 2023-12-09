import { Checkbox } from '@client/components';
import { PageWrapper } from '@client/storybook';
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { IInputNumber, InputNumber as InputNumberC } from './InputNumber';
import { InputPassword } from './InputPassword';
import { InputSelectFactory } from './InputSelect';

export default {
  component: InputNumberC,
  args: {
    wrapped: true,
    hasError: false,
    disabled: false,
  },
} as ComponentMeta<StoryArgs>;

type StoryArgs = (
  args: IInputNumber & {
    wrapped: boolean;
    onChange(arg: any): void;
  }
) => JSX.Element;

export const Inputs: ComponentStory<StoryArgs> = (args) => (
  <PageWrapper wrapped={args.wrapped} padded centered>
    <InputNumberC {...args} placeholder="add some number" />
    <InputNumberC {...args} placeholder="add some number" />
    <InputPassword
      {...args}
      id="input-password"
      placeholder="enter your password"
      onChange={() => {}}
    />
    <InputSelectC
      id="some id"
      hasError={args.hasError}
      options={options}
      initialValue="burger"
      onChange={(o) => {
        args.onChange(o);
      }}
    />
  </PageWrapper>
);

export const InputNumber: ComponentStory<StoryArgs> = (args) => (
  <PageWrapper wrapped={args.wrapped} padded centered>
    <InputNumberC {...args} placeholder="add some number" />
  </PageWrapper>
);

InputNumber.args = {};

const options = ['burger', 'bacon', 'sausage'] as const;
const InputSelectC = InputSelectFactory<typeof options[number]>();

export const InputSelect: ComponentStory<StoryArgs> = (args) => (
  <PageWrapper wrapped={args.wrapped} padded centered>
    <InputSelectC
      id="some id"
      hasError={args.hasError}
      options={options}
      initialValue="bacon"
      onChange={(o) => {
        args.onChange(o);
      }}
    />
    <InputSelectC
      id="some id"
      hasError={args.hasError}
      options={options}
      initialValue="none"
      onChange={(o) => {
        args.onChange(o);
      }}
    />
  </PageWrapper>
);

export const CheckBoxS: ComponentStory<StoryArgs> = (args) => (
  <PageWrapper wrapped={args.wrapped} padded centered>
    <Checkbox {...args} initiallyChecked>
      <p>Toggle me!</p>
    </Checkbox>
    <Checkbox {...args} initiallyChecked>
      <p className="text-xl">Toggle me large!</p>
    </Checkbox>
  </PageWrapper>
);
