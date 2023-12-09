import { act } from '@testing-library/react';

/**
 * Advance fake timer by `duration` in seconds
 * @param duration
 */
export function tick(duration: number): void {
  act(() => {
    jest.advanceTimersByTime(duration * 1000);
  });
}

export function ticks(duration: number): void {
  jest.advanceTimersByTime(duration * 1000);
}
