/**
 * Advance fake timer by `duration` in seconds
 * @param duration
 */
export function ticks(duration: number): void {
  vi.advanceTimersByTime(duration * 1000);
}
