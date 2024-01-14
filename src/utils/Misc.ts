// https://stackoverflow.com/questions/57835286/deep-recursive-requiredt-on-specific-properties
export type DeepRequired<T> =
  T extends [infer I] ? [DeepRequired<I>] :
  T extends Array<infer I> ? Array<DeepRequired<I>> :
  T extends object ? {[P in keyof T]-?: DeepRequired<T[P]> } :
  T extends undefined ? never :
  T;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

// Recursively sets properties of T to U
export type RecursivePropsTo<T, U> =
  T extends Array<infer I> ? I extends object ? Array<RecursivePropsTo<I, U>> : I extends undefined | null ? never : U :
  T extends object ? { [ P in keyof T ]: RecursivePropsTo<T[P], U> } :
  T extends undefined | null ? never :
  U


export function pickDefined<T>(value1: T | undefined, value2: T): T;
export function pickDefined<T>(value1: T, value2: T | undefined): T;
export function pickDefined(value1: undefined, value2: undefined): undefined;
export function pickDefined<T>(value1?: T, value2?: T): T | undefined;
export function pickDefined<T>(value1?: T, value2?: T) {
  return value1 !== undefined ? value1 : value2;
}
