interface Duration {
  hrs?: number;
  mins: number;
}

export function timeInFuture({ hrs, mins }: Duration): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + mins);
  if (hrs) {
    now.setHours(now.getHours() + hrs);
  }
  return now;
}
