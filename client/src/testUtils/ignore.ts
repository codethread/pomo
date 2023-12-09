/* eslint-disable no-console */
/**
 * Disable console.warn for each provided msgs regexp.
 *
 * Note this function must be invoked in place as it calls beforeAll/afterAll
 *
 * only matches on the first argument to console.warn
 *
 * @example
 * // in unit under test
 * function foo() {
 *   console.warn('here is a warning!', 'with two messages');
 * }
 *
 * // in test file
 * describe('my tests', () => {
 *   ignoreWarnings("Warning from third party app", /a warning/)
 *
 *   test("foo doesn't print any warnings", () => {
 *     foo();
 *   });
 * })
 *
 * describe('my other tests', () => {
 *   ignoreWarnings("Safe to ignore, I promise", /two messages/)
 *
 *   test("foo print the warnings", () => {
 *     foo();
 *   });
 * })
 */
export function ignoreWarnings(reason: string, ...ignorePatterns: RegExp[]): void {
  beforeAll(() => {
    const ogWarn = console.warn;

    jest.spyOn(console, 'warn').mockImplementation((...args: string[]) => {
      const [message = ''] = args;
      if (!ignorePatterns.some((pat) => pat.test(message))) {
        ogWarn(...args);
      }
    });
  });

  afterAll(() => {
    (console.warn as jest.Mock).mockRestore();
  });
}

/**
 * Disable console.error for each provided msgs regexp.
 *
 * Note this function must be invoked in place as it calls beforeAll/afterAll
 *
 * only matches on the first argument to console.error
 *
 * @example
 * // in unit under test
 * function foo() {
 *   console.error('here is a erroring!', 'with two messages');
 * }
 *
 * // in test file
 * describe('my tests', () => {
 *   ignoreWarnings("Warning from third party app", /a erroring/)
 *
 *   test("foo doesn't print any errorings", () => {
 *     foo();
 *   });
 * })
 *
 * describe('my other tests', () => {
 *   ignoreWarnings("Safe to ignore, I promise", /two messages/)
 *
 *   test("foo print the errorings", () => {
 *     foo();
 *   });
 * })
 */
export function ignoreErrors(reason: string, ...ignorePatterns: RegExp[]): void {
  beforeEach(() => {
    const ogError = console.error;
    jest.spyOn(console, 'error').mockImplementation((...args: string[]) => {
      const [message = ''] = args;
      if (!ignorePatterns.some((pat) => pat.test(message))) {
        ogError(...args);
      }
    });
  });

  afterEach(() => {
    // (console.error as jest.Mock).mockRestore();
  });
}
