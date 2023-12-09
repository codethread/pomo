/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line import/no-extraneous-dependencies
import diff from 'jest-diff';

import { isErr, isOk, Result } from '@shared/Result';
import { pick } from '@shared/pick';

declare global {
  // TODO investigate
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchResult<A, B>(expected: Result<A, B>): R;
    }
  }
}

expect.extend({
  toMatchResult(got: Result<any, any>, expected: Result<any, any>) {
    if (isOk(got) && isOk(expected)) {
      const pass = this.equals(got.val, expected.val);
      const message = getMessage(pass, expected.val, got.val, this);

      return { actual: got.val, message, pass, expected: expected.val };
    }
    if (isErr(got) && isErr(expected)) {
      const pass = this.equals(got.reason, expected.reason);
      const message = getMessage(pass, expected.reason, got.reason, this);

      return { actual: got.reason, message, pass, expected: expected.reason };
    }
    if (isOk(expected) && isErr(got)) {
      const pass = false;
      const message = () =>
        `Result expected to be Ok but got Err\n\n` +
        `Expected: ${this.utils.printExpected(pick(expected, ['val', 'ok']))}\n` +
        `Received: ${this.utils.printReceived(pick(got, ['reason', 'ok']))}`;

      return { pass, message, actual: got, expected };
    }
    if (isErr(expected) && isOk(got)) {
      const pass = false;
      const message = () =>
        `Result expected to be Err but got Ok\n\n` +
        `Expected: ${this.utils.printExpected(pick(expected, ['reason', 'ok']))}\n` +
        `Received: ${this.utils.printReceived(pick(got, ['ok', 'val']))}`;

      return { pass, message, actual: got, expected };
    }
    // should be an impossible case
    const pass = false;
    const message = () =>
      `Result expected to be Result type "Ok" or "Err" but got something else\n\n` +
      `Expected: ${this.utils.printExpected(expected)}\n` +
      `Received: ${this.utils.printReceived(got)}`;

    return { pass, message, actual: got, expected };

    function getMessage(
      didPass: boolean,
      expectedVal: any,
      recieved: any,
      jestThis: any
    ): () => string {
      return didPass
        ? () =>
            `${jestThis.utils.matcherHint('toDeepEqual')}\n\n` +
            `Expected: not ${jestThis.utils.printExpected(expectedVal)}\n` +
            `Received: ${jestThis.utils.printReceived(recieved)}`
        : () => {
            const diffString = diff(expectedVal.val, recieved.val, {
              expand: jestThis.expand,
            });
            return `${jestThis.utils.matcherHint('toDeepEqual')}\n\n${
              diffString?.includes('- Expect')
                ? `Difference:\n\n${diffString}`
                : `Expected: ${jestThis.utils.printExpected(expectedVal)}\n` +
                  `Received: ${jestThis.utils.printReceived(recieved)}`
            }`;
          };
    }
  },
});
