import MockDate from 'mockdate';
import { timeInFuture } from './clock';

describe('clock', () => {
  describe('timeInFuture', () => {
    beforeEach(() => {
      MockDate.set('Jan 01, 2000 10:00:00');
    });

    afterEach(() => {
      MockDate.reset();
    });

    interface Test {
      hrs?: number;
      mins: number;
      resHours: number;
      resMins: number;
    }

    test.each`
      hrs          | mins  | resHours | resMins
      ${undefined} | ${0}  | ${10}    | ${0}
      ${undefined} | ${1}  | ${10}    | ${1}
      ${undefined} | ${61} | ${11}    | ${1}
      ${1}         | ${0}  | ${11}    | ${0}
      ${1}         | ${61} | ${12}    | ${1}
    `(
      'returns a date advanced by "$hrs" hours and "$mins" mins',
      ({ hrs, mins, resHours, resMins }: Test) => {
        const timer = timeInFuture({ mins, hrs });

        expect(timer.getHours()).toBe(resHours);
        expect(timer.getMinutes()).toBe(resMins);
      }
    );
  });
});
