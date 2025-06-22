import type DateTime from "./DateTime";
import os from 'os';

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

// https://www.totaltypescript.com/get-keys-of-an-object-where-values-are-of-a-given-type
export type KeysOfValue<T, TCondition> = {
  [K in keyof T]: T[K] extends TCondition
    ? K
    : never;
}[keyof T];

// https://stackoverflow.com/questions/69676439/create-constant-array-type-from-an-object-type/69676731#69676731
export type UnionToTuple<U extends string, R extends unknown[] = []> =
  {
    [S in U]: Exclude<U, S> extends never ? [...R, S]
    : UnionToTuple<Exclude<U, S>, [...R, S]>;
  }[U] extends infer S extends unknown[] ?
    S
  : never;

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

export function getYearMonthString(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Ensure two digits
  return `${year}-${month}`;
}

export function getLocalIPAddress(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return '127.0.0.1';
}