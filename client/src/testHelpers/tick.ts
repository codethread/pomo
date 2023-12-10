import { act } from '@testing-library/react';

/**
 * Advance fake timer by `duration` in seconds
 * @param duration
 */
export function tick(duration: number): void {
  act(() => {
    vi.advanceTimersByTime(duration * 1000);
  });
}

export function ticks(duration: number): void {
  vi.advanceTimersByTime(duration * 1000);
}
