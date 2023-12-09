import { nullActor } from '@client/machines/utils';
import { screen, renderNoProviders } from '@test/rtl';
import { inspect as _inspect } from '@xstate/inspect';
import React, { useState } from 'react';
import { IInspector, Inspector } from './Inspector';

jest.mock('@xstate/inspect', () => ({
  inspect: jest.fn(),
}));

const inspect = jest.mocked(_inspect);

describe('Inspector', () => {
  const renderW = async (props?: IInspector) =>
    renderNoProviders(<InspectorWrapper toggleable={props?.toggleable} />);

  const disconnectSpy = jest.fn();
  let inspectorReturnsInstance = true;

  beforeAll(() => {
    inspect.mockImplementation(() => {
      const el = document.getElementById('xstate');
      if (!el) {
        throw new Error('no xstate iframe');
      }
      return inspectorReturnsInstance ? undefined : { ...nullActor(), disconnect: disconnectSpy };
    });
  });

  it('creates an iframe with the data-xstate property for xstate visualiser to hook into', async () => {
    await renderW();
    const iframe = screen.getByTitle('xstate');
    expect(iframe).toHaveAttribute('data-xstate');
  });

  describe('when passed a toggleable prop', () => {
    it('calls the inspector after the iframe has mounted and only connects once', async () => {
      const { rerender } = await renderW({ toggleable: true });
      expect(inspect).toHaveBeenCalledTimes(1);

      rerender(<InspectorWrapper />);
      expect(inspect).toHaveBeenCalledTimes(1);
    });

    it('can have visibility toggled, which is initially hidden', async () => {
      await renderW({ toggleable: true });
      const iframe = screen.getByTitle('xstate');
      expect(iframe).toBeInTheDocument();

      screen.getByRole('button', { name: /.*show.*/i }).click();
      expect(iframe).toHaveStyle({ display: 'block' });

      screen.getByRole('button', { name: /.*hide.*/i }).click();
      expect(iframe).toHaveStyle({ display: 'none' });
    });
  });

  describe('when not passed a toggleable prop', () => {
    it('can not be toggled, and is always shown', async () => {
      await renderW();
      const iframe = screen.getByTitle('xstate');
      expect(iframe).toBeInTheDocument();

      expect(screen.queryByRole('button', { name: /.*show.*/i })).not.toBeInTheDocument();

      expect(iframe).toHaveStyle({ display: 'block' });
    });
  });

  describe('when the inspector does not return an instance', () => {
    beforeAll(() => {
      inspectorReturnsInstance = false;
    });

    it('disconnects from the inspector when no longer rendered', async () => {
      await renderW();
      screen.getByTestId('test-button').click();
      expect(inspect).toHaveBeenCalledTimes(1);
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the inspector does return an instance', () => {
    beforeAll(() => {
      inspectorReturnsInstance = true;
    });

    it('does not try to disconnect', async () => {
      await renderW();
      screen.getByTestId('test-button').click();
      expect(inspect).toHaveBeenCalledTimes(1);
      expect(disconnectSpy).toHaveBeenCalledTimes(0);
    });
  });
});

function InspectorWrapper({ toggleable }: IInspector) {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <div>
      <button
        data-testid="test-button"
        type="button"
        onClick={() => {
          setIsVisible((v) => !v);
        }}
      >
        toggle
      </button>
      {isVisible ? <Inspector toggleable={toggleable} /> : null}
    </div>
  );
}
