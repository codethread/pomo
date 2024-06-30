import { deepFreeze } from './deepFreeze';

describe('deepFreeze', () => {
  it('should freeze all properties', () => {
    const obj = {
      foo: {
        bar: () => {},
        baz: 4,
      },
    };

    expect(deepFreeze(obj)).toBe(obj);
    expect(() => {
      obj.foo.baz = 2;
    }).toThrow();
  });
});
