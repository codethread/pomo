export function displayNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return '00';
  if (n < 10) return `0${n}`;
  return n.toString();
}
