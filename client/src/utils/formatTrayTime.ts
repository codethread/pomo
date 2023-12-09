export function formatTrayTime({ minutes, seconds }: { minutes: number; seconds: number }): string {
  return `${minutes}:${seconds >= 10 ? seconds : `0${seconds}`}`;
}
