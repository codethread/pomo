export function parsePomoError(n: number): string | undefined {
  switch (true) {
    case n < 1:
      return 'Timer must be at least 1 minute';
    case n > 99:
      return 'Timer must be less than 100';
    case !Number.isInteger(n):
      return 'Timer must be a whole number';
    default:
      return undefined;
  }
}
