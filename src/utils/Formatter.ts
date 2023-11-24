import escapeStringRegexp from 'escape-string-regexp';

export type FormatFieldName = string;

export type FormatFieldRules<T extends FormatFieldName> = {
  name: T;
  atLeastOneOf: boolean;
}[];

export type FormatFieldValues<T extends FormatFieldName> = Record<T, any>;

export default class Formatter {

  static format<T extends FormatFieldName>(format: string, dict: FormatFieldValues<T>, rules?: FormatFieldRules<T>) {

    let result = '';

    const fieldRegex = this.#getFieldRegex(Object.keys(dict));
    const emptyValuePlaceHolder = '//';
    const emptyValAdjCondSepRegex = /\[[^[]*?]\?\s*?\/\/\s*?\[.*?\]\?|\[[^[]*?]\?\s*?\/\/|\/\/\s*?\[.*?]\?/g;
    const condSepRegex = /\[(.*?)]\?/g;

    const fields = Object.keys(dict);
    const consumedFields: string[] = [];

    const __findPositionOfFirstField = (s: string) => {
      const match = fieldRegex.exec(s);
      if (match) {
        const foundField = s.substring(match.index + 1, match.index + match[0].length - 1);
        const placeholder = s.substring(match.index, match.index + match[0].length);
        if (fields.includes(foundField)) {
          return {
            field: foundField as T,
            placeholder,
            placeholderPosition: match.index
          };
        }
      }
      return {
        field: null,
        placeholder: null,
        placeholderPosition: -1
      };
    };

    let { field, placeholder, placeholderPosition } = __findPositionOfFirstField(format);
    while (field && placeholder && placeholderPosition >= 0) {
      result += format.substring(0, placeholderPosition);
      const fieldValue = dict[field];
      if (fieldValue) {
        result += fieldValue;
        if (!consumedFields.includes(field)) {
          consumedFields.push(field);
        }
      }
      else {
        result += emptyValuePlaceHolder;
      }
      format = format.substring(placeholderPosition + placeholder.length);

      if (format.length === 0) {
        break;
      }
      ({ field, placeholder, placeholderPosition } = __findPositionOfFirstField(format));
    }
    result += format;

    // Handle conditional separators
    // - Strip empty value placeholders  + adjacent separators
    result = result.replaceAll(emptyValAdjCondSepRegex, '');
    // - Strip remaining empty value placeholders
    result = result.replaceAll(emptyValuePlaceHolder, '');
    // - Remove []? around conditional separators
    result = result.replace(condSepRegex, '$1');

    result = result.trim();

    // Validate
    let validateOK: boolean | null = null;
    if (rules) {
      const atLeastOneOfFields = rules.reduce<string[]>((result, f) => {
        if (f.atLeastOneOf) {
          result.push(f.name);
        }
        return result;
      }, []);

      validateOK = false;
      if (result) {
        for (const field of consumedFields) {
          if (atLeastOneOfFields.includes(field)) {
            validateOK = true;
            break;
          }
        }
      }
    }

    return {
      result,
      validateOK
    };
  }

  static validate<T extends FormatFieldName>(format: string, schema: FormatFieldRules<T>) {
    const fieldNames = schema.reduce<string[]>((result, s) => {
      if (s.atLeastOneOf) {
        result.push(s.name);
      }
      return result;
    }, []);
    if (fieldNames.length === 0) {
      return {
        validateOK: true
      };
    }
    const fieldRegex = this.#getFieldRegex(fieldNames, 'g');
    const match = fieldRegex.exec(format);
    return {
      validateOK: match && match.length > 0,
      regex: fieldRegex
    };
  }

  static #getFieldRegex(fieldNames: string[], flags?: string) {
    const pattern = fieldNames.map((k) => `{${escapeStringRegexp(k)}}`).join('|');
    return new RegExp(pattern, flags);
  }
}
