import { displayNum } from './format';

interface ITest {
  input: Parameters<typeof displayNum>[0];
  output: ReturnType<typeof displayNum>;
}

describe('displayNum', () => {
  test.each`
    input        | output
    ${null}      | ${'00'}
    ${undefined} | ${'00'}
    ${0}         | ${'00'}
    ${1}         | ${'01'}
    ${9}         | ${'09'}
    ${10}        | ${'10'}
    ${19}        | ${'19'}
    ${100}       | ${'100'}
  `('when passed $input, it renders $output', ({ input, output }: ITest) => {
    expect(displayNum(input)).toBe(output);
  });
});
