import type DateTime from "./DateTime";

export type NoDeepTypes = DateTime;

// https://stackoverflow.com/questions/57835286/deep-recursive-requiredt-on-specific-properties
export type DeepRequired<T, E = NoDeepTypes> =
  T extends E ? T :
  T extends [infer I] ? [DeepRequired<I>] :
  T extends Array<infer I> ? Array<DeepRequired<I>> :
  T extends object ? {[P in keyof T]-?: DeepRequired<T[P]> } :
  T extends undefined ? never :
  T;


export type DeepPartial<T, E = NoDeepTypes> = 
  T extends E ? T :
  T extends object ? { [P in keyof T]?: DeepPartial<T[P], E> } : T

// Recursively sets properties of T to U
export type RecursivePropsTo<T, U, E = NoDeepTypes> =
  T extends E ? U :
  T extends Array<infer I> ? I extends object ? Array<RecursivePropsTo<I, U, E>> : I extends undefined | null ? never : U :
  T extends object ? { [ P in keyof T ]: RecursivePropsTo<T[P], U, E> } :
  T extends undefined | null ? never :
  U


export function pickDefined<T>(value1: T | undefined, value2: T): T;
export function pickDefined<T>(value1: T, value2: T | undefined): T;
export function pickDefined(value1: undefined, value2: undefined): undefined;
export function pickDefined<T>(value1?: T, value2?: T): T | undefined;
export function pickDefined<T>(value1?: T, value2?: T) {
  return value1 !== undefined ? value1 : value2;
}

export function toISODate(date: string): string {
  return new Date(date).toISOString().slice(0, 10);
}
