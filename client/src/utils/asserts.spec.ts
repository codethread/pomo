import { assertIsError, assertValidNodenv, validNodenvs } from "./asserts";

describe("asserts", () => {
  test("assertIsError", () => {
    expect(() => assertIsError("")).toThrowError();
    expect(() => assertIsError(new Error())).not.toThrowError();
  });

  test("assertValidNodenv", () => {
    validNodenvs.forEach((valid) => {
      expect(() => assertValidNodenv(valid)).not.toThrowError();
    });

    const invalids = ["", "squantch", " "];
    invalids.forEach((invalid) => {
      expect(() => assertValidNodenv(invalid)).toThrowError();
    });
  });
});
