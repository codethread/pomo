import {
  Button,
  FormItemNumber as FormItemNumberC,
  FormItemPassword,
  Header,
  InputSelectFactory,
  Slack,
} from '@client/components';
import { useConfig } from '@client/hooks';
import { colors, palette, ThemeName, themes } from '@client/theme';
import { Pomodoro } from '@client/pages';
import { IChildren } from '@shared/types';
import { ComponentMeta } from '@storybook/react';
import React from 'react';

export default {
  component: Theme,
} as ComponentMeta<typeof Theme>;

export function Palette(): JSX.Element {
  const { config } = useConfig();

  return (
    <div>
      <p>Current Theme: {config?.theme ?? 'loading'}</p>
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-1">
        <p className="pl-3">var</p>
        <p className="pl-3">bg</p>
        {colors.map((c) => (
          <Color col={c} key={c}>
            {c}
          </Color>
        ))}
      </div>
    </div>
  );
}

const InputSelect = InputSelectFactory<ThemeName>();
export function General(): JSX.Element {
  return (
    <div className="grid h-full w-full grid-cols-2 gap-2 bg-thmBackground md:grid-cols-3">
      <Item>
        <Pomodoro />
      </Item>
      <Slack />
      <Item>
        <FormItemNumberC
          id="number item"
          label="Some number"
          input={{ min: 0, max: 20, onChange() {}, value: 3 }}
        />
        <FormItemNumberC
          id="333 item"
          label="Some number"
          error="wah ney"
          input={{ min: 0, max: 20, onChange() {}, value: 3 }}
        />
        <FormItemPassword
          id="ofijwef"
          label="input password"
          input={{
            placeholder: 'enter passowrd',
            onChange: () => {},
            value: 'foo',
          }}
        />
        <FormItemPassword
          id="ofijwef"
          label="input password"
          error="oh my"
          input={{
            placeholder: 'enter passowrd',
            onChange: () => {},
            value: 'foo',
          }}
        />
      </Item>
      <Item>
        <Header onClick={() => {}} page="Timer Settings" showClose />
        <Header onClick={() => {}} page="Slack Settings" showClose={false} />
        <InputSelect id="cheese" onChange={() => {}} initialValue="none" options={themes} />
        <InputSelect id="butter" onChange={() => {}} initialValue="one-dark" options={themes} />
      </Item>
      <Item>
        <Button type="button" variant="primary">
          Primary
        </Button>
        <Button type="button" variant="secondary">
          secondary
        </Button>
        <Button type="button" variant="tertiary">
          tertiary
        </Button>
      </Item>
      <Item>
        <Button disabled type="button" variant="primary">
          Primary
        </Button>
        <Button disabled type="button" variant="secondary">
          secondary
        </Button>
        <Button disabled type="button" variant="tertiary">
          tertiary
        </Button>
      </Item>
    </div>
  );
}

function Item({ children }: IChildren): JSX.Element {
  return <div className="m-3 flex flex-col space-y-2">{children}</div>;
}

export function Theme(): JSX.Element {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-2 gap-1">
      <p className="pl-3">var</p>
      <p className="pl-3">bg</p>
      {palette.map((c) => (
        <Color col={c} key={c}>
          {c}
        </Color>
      ))}
    </div>
  );
}

function Color({ col, children }: IChildren & { col: string }): JSX.Element {
  return (
    <>
      <p
        className="pl-3"
        style={{
          color: `rgb(var(${col}))`,
          border: `thin solid rgb(var(${col}))`,
        }}
      >
        {col}
      </p>
      <p
        className="pl-3"
        style={{
          backgroundColor: `rgb(var(${col}))`,
          color: 'rgb(var(--col-fg))',
        }}
      >
        {children}
      </p>
    </>
  );
}
