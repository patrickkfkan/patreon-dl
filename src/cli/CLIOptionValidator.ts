import URLHelper from '../utils/URLHelper.js';
import { CLIOptionParserEntry } from './CLIOptions.js';

const CLI_OPTION_SRC_NAME = {
  cli: 'Command-line',
  cfg: 'Config file',
  tgt: 'Targets file'
};

export default class CLIOptionValidator {

  static validateRequired(entry?: CLIOptionParserEntry, errMsg?: string) {
    if (entry && entry.value) {
      return entry.value;
    }
    if (errMsg) {
      throw Error(errMsg);
    }
    if (entry) {
      throw Error(`${this.#logEntryKey(entry)} requires a value`);
    }
    throw Error('A required option missing');
  }

  static validateString<T extends string[]>(entry?: CLIOptionParserEntry, ...match: T): T[number] | undefined {
    if (!entry) {
      return undefined;
    }
    const value = entry.value || undefined;
    if (match.length > 0 && value && !match.includes(value)) {
      throw Error(`${this.#logEntryKey(entry)} must be one of ${match.map((m) => `'${m}'`).join(', ')}`);
    }
    return value;
  }

  static validateBoolean(entry?: CLIOptionParserEntry) {
    if (!entry) {
      return undefined;
    }
    const value = entry.value || undefined;
    const trueValues = [ 'yes', '1', 'true' ];
    const falseValues = [ 'no', '0', 'false' ];
    let sanitized: boolean | undefined;
    if (value) {
      if (trueValues.includes(value.toLowerCase())) {
        sanitized = true;
      }
      else if (falseValues.includes(value.toLowerCase())) {
        sanitized = false;
      }
      else {
        const allowedValues = [ ...trueValues, ...falseValues ];
        throw Error(`${this.#logEntryKey(entry)} must be one of ${allowedValues.map((m) => `'${m}'`).join(', ')}; currently '${value}'`);
      }
    }
    else {
      sanitized = undefined;
    }
    return sanitized;
  }

  static validateNumber(entry?: CLIOptionParserEntry, min?: number, max?: number) {
    if (!entry) {
      return undefined;
    }
    const value = entry.value || undefined;
    const sanitized = value ? parseInt(value, 10) : undefined;
    if (sanitized !== undefined) {
      if (isNaN(sanitized)) {
        throw Error(`${this.#logEntryKey(entry)} is not a valid number`);
      }
      else if (min !== undefined && sanitized < min) {
        throw Error(`${this.#logEntryKey(entry)} must not be less than ${min}`);
      }
      else if (max !== undefined && sanitized > max) {
        throw Error(`${this.#logEntryKey(entry)} must not be greater than ${max}`);
      }
    }
    return sanitized;
  }

  static validateStringArray<T>(entry: CLIOptionParserEntry | undefined, match?: readonly T[], delimiter = ',') {
    const value = entry?.value || undefined;
    if (!entry || !value) {
      return undefined;
    }
    const split = value.split(delimiter).reduce<string[]>((result, v) => {
      v = v.trim().toLowerCase();
      if (v && !result.includes(v)) {
        result.push(v);
      }
      return result;
    }, []);
    if (split.length === 0) {
      return undefined;
    }
    if (match && match.length > 0) {
      for (const v of split) {
        if (!match.includes(v as any)) {
          throw Error(`${this.#logEntryKey(entry)} has invalid delimited value '${v}'; must be one of ${match.map((m) => `'${m}'`).join(', ')}.`);
        }
      }
    }
    return split as T[];
  }

  static validateTargetURLs(value: string | string[], delimiter = ','): string[] {
    if (!Array.isArray(value)) {
      const splitted = value.split(delimiter);
      return this.validateTargetURLs(splitted);
    }
    return value.map((v) => this.validateTargetURL(v));
  }

  static validateTargetURL(s: string) {
    const _s = s.trim();
    try {
      const type = URLHelper.analyzeURL(_s);
      if (!type) {
        throw Error('Unknown URL');
      }
    }
    catch (error) {
      if (error instanceof Error) {
        error.message += `: ${_s}`;
        throw error;
      }
      else {
        throw Error(`${error}: ${_s}`);
      }
    }
    return _s;
  }

  static validateIncludeContentWithMediaType(entry?: CLIOptionParserEntry) {
    try {
      return this.validateString(entry, 'any', 'none');
    }
    catch (error) {
      return this.validateStringArray(entry, [ 'image', 'video', 'audio', 'attachment' ] as const);
    }
  }

  static validateIncludeContentInTier(entry?: CLIOptionParserEntry) {
    try {
      return this.validateString(entry, 'any');
    }
    catch (error) {
      return this.validateStringArray<string>(entry);
    }
  }

  static validateIncludePreviewMedia(entry?: CLIOptionParserEntry) {
    try {
      return this.validateBoolean(entry);
    }
    catch (error) {
      return this.validateStringArray(entry, [ 'image', 'video', 'audio' ] as const);
    }
  }

  static validateIncludeContentMedia(entry?: CLIOptionParserEntry) {
    try {
      return this.validateBoolean(entry);
    }
    catch (error) {
      return this.validateStringArray(entry, [ 'image', 'video', 'audio', 'attachment', 'file' ] as const);
    }
  }

  static #logEntryKey(entry: CLIOptionParserEntry) {
    const src = CLI_OPTION_SRC_NAME[entry.src];
    switch (entry.src) {
      case 'cli':
        return `${src} option '${entry.key}'`;
      case 'cfg':
        return `${src} option '[${entry.section}]->${entry.key}'`;
      case 'tgt':
        return `Value given in ${src.toLowerCase()} on line ${entry.line} starting with '${entry.key}'`;
    }
  }
}
