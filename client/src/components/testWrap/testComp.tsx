import React from 'react';
import { isTest } from '@shared/constants';

export function testWrap<A>(Component: A, testId: string): A {
  // @ts-expect-error meh
  return isTest
    ? // @ts-expect-error meh
      ({ children }) => <span data-testid={testId}>{children}</span>
    : // @ts-expect-error meh
      (props) => <Component {...props} />;
}
