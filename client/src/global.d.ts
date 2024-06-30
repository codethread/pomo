import { IBridge } from "@shared/types";
import { NonUndefined } from "react-hook-form";

type Entries<T> = NonUndefined<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>[];

declare global {
  interface Window {
    bridge?: IBridge;
  }

  type Prettify<T> = {
    [K in keyof T]: T[K];
  } & {}; // eslint-disable-line

  interface ObjectConstructor {
    entries<T>(o: T): Entries<T>;
  }
}
