import { App } from '@client/App';
import { ErrorBoundary } from '@client/components';
import { IMachinesProvider } from '@client/hooks/machines';
import { BridgeProvider, LoggerProvider, MachinesProvider } from '@client/hooks/providers';
import { createFakeHooks } from '@client/machines';
import { createFakeBridge } from '@test/createFakeBridge';
import { IBridge } from '@shared/types';
import {
  render as ogRender,
  RenderOptions,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import React, { ReactElement } from 'react';
import { fakeClockMachine } from '@client/machines/clock/fakeClock';

vi.mock('@xstate/inspect');

interface Options {
  renderOptions?: Omit<RenderOptions, 'queries'>;
  overrides?: Overrides;
}

async function renderAsync(ui: ReactElement, options?: Options): Promise<Rendered> {
  const { overrides, renderOptions } = options ?? {};

  const view = ogRender(ui, {
    wrapper: ({ children }) => <Providers {...overrides}>{children}</Providers>,
    ...renderOptions,
  });

  await waitForElementToBeRemoved(() => screen.queryByTestId('providers-loading'));

  return view;
}

export * from '@testing-library/react';
export const render = renderAsync;
export const renderNoProviders = ogRender;

//-----------------------------------------------------------------------------
// PRIVATES
//-----------------------------------------------------------------------------

type Rendered = ReturnType<typeof ogRender>;

interface Overrides {
  bridge?: Partial<IBridge>;
  hooks?: Partial<IMachinesProvider['hooks']>;
  children?: React.ReactNode;
}

export function Providers({ children, bridge, hooks }: Overrides): JSX.Element {
  return (
    <BridgeProvider bridge={{ ...createFakeBridge(), ...bridge }}>
      <LoggerProvider>
        <ErrorBoundary>
          <MachinesProvider
            hooks={{ ...createFakeHooks(), ...hooks }}
            services={{ clock: fakeClockMachine }}
          >
            <App shouldInspect={false}>{children}</App>
          </MachinesProvider>
        </ErrorBoundary>
      </LoggerProvider>
    </BridgeProvider>
  );
}
