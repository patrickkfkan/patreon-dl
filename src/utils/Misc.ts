import { sync as spawnSync } from "@patrickkfkan/cross-spawn";
import type DateTime from "./DateTime.js";
import {transliterate} from 'transliteration';
import slugify from 'slugify';
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
  [K in keyof T]-?: undefined extends T[K]
    ? never
    : T[K] extends TCondition
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

export type DenoInstallStatus =
  | {
      installed: true;
      version: string;
    }
  | {
      installed: false;
      error: Error;
    };

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

const denoInstalled: (DenoInstallStatus & { checkedPath?: string; })[] = [];

export function isDenoInstalled(pathToDeno?: string): DenoInstallStatus {
  const installStatus = denoInstalled.find((d) => d.checkedPath === pathToDeno);
  if (installStatus) {
    return installStatus;
  }
  let di: DenoInstallStatus;
  try {
    const cmd = pathToDeno || 'deno';
    const result = spawnSync(cmd, ['--version']);
    if (result.error) {
      throw result.error;
    } else if (result.status !== 0) {
      const output = result.stderr.toString();
      throw Error(`Command exited with non-zero code: ${result.status}${output ? ` - ${output}` : ''}`);
    }
    const output = result.stdout.toString();
    let version = output.trim().split(/\r?\n/)[0];
    if (version.toLowerCase().startsWith('deno ')) {
      version = version.substring('deno '.length);
    }
    di = {
      installed: true,
      version
    };
  } catch (error) {
    di = {
      installed: false,
      error: error instanceof Error ? error : Error(String(error))
    };
  }
  denoInstalled.push({
    checkedPath: pathToDeno,
    ...di
  });
  return di;
}

export function createSafeSlug(
  input: string,
  maxSegments = 5,
  maxLength = 24,
  separator = "-"
): string {
  const slug = slugify(
    transliterate(input, {trim: true, fixChineseSpacing: true }),
    {
      lower: true,
      strict: true,
      replacement: separator,
      trim: true
    }
  );

  const segments = slug.split(separator);
  const result: string[] = [];

  for (const seg of segments) {
    if (result.length >= maxSegments) {
      break;
    }

    const candidate = [...result, seg].join(separator);
    if (candidate.length > maxLength) {
      break;
    }

    result.push(seg);
  }

  return result.join(separator);
}
