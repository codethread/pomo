// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockFn<A extends (...args: any[]) => any>(): jest.Mock<
  ReturnType<A>,
  Parameters<A>
> {
  return jest.fn<ReturnType<A>, Parameters<A>>();
}
