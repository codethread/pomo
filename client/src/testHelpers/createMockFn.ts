// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockFn<A extends (...args: any[]) => any>(): vi.Mock<
  ReturnType<A>,
  Parameters<A>
> {
  return vi.fn<ReturnType<A>, Parameters<A>>();
}
