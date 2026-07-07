import type { en } from "./dictionaries/en";

export type Locale = "en" | "vi";

type WidenDictionary<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly WidenDictionary<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: WidenDictionary<T[Key]> }
      : T;

export type Dictionary = WidenDictionary<typeof en>;
