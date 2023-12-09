import React from 'react';
import { renderNoProviders, screen } from '@test/rtl';
import * as _constants from '@shared/constants';
import { testWrap } from './testComp';

jest.mock('@shared/constants');

const constants = jest.mocked(_constants);

describe('nullComp', () => {
  describe('in tests', () => {
    beforeAll(() => {
      constants.isTest = true;
    });

    it('returns an empty span to assert on', () => {
      const Wrapped = testWrap(RealComp, 'test-component');
      renderNoProviders(<Wrapped text="some info" />);
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.queryByText('some info')).not.toBeInTheDocument();
    });
  });

  describe('not in tests', () => {
    beforeAll(() => {
      constants.isTest = false;
    });

    it('returns the real component', () => {
      const Wrapped = testWrap(RealComp, 'test-component');
      renderNoProviders(<Wrapped text="some info" />);
      expect(screen.getByTestId('real-component')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      expect(screen.getByText('some info')).toBeInTheDocument();
    });
  });
});

function RealComp({ text }: { text: string }) {
  return <div data-testid="real-component">{text}</div>;
}
