import DateTime from "./DateTime.js";

const NO_CLEAN = [ DateTime ];

export default class ObjectHelper {

  static getProperty(obj: any, prop: string, required = false) {
    const props = prop.split('.');
    let v = obj;
    while (props.length > 0) {
      const p = props.shift() as string;
      if (v && typeof v === 'object') {
        v = v[p];
        if (v === undefined) {
          if (required) {
            throw new ObjectPropertyNotFoundError(prop);
          }
          return v;
        }
      }
      else if (required) {
        throw new ObjectPropertyNotFoundError(prop);
      }
    }
    return v;
  }

  static clean(obj: any, opts?: {
    deep?: boolean;
    cleanNulls?: boolean;
    cleanEmptyObjects?: boolean;
  }) {
    const deep = opts?.deep || false;
    const cleanNulls = opts?.cleanNulls || false;
    const cleanEmptyObjects = opts?.cleanEmptyObjects || false;

    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    const result: any = {};
    for (const [ k, v ] of Object.entries(obj)) {
      const skip = v === undefined || (v === null && cleanNulls);
      if (!skip) {
        if (v !== null && typeof v === 'object' && !NO_CLEAN.find((nc) => v instanceof nc)) {
          const c = deep ? this.clean(v, opts) : v;
          if (Object.entries(c).length > 0 || !cleanEmptyObjects) {
            result[k] = c;
          }
        }
        else {
          result[k] = v;
        }
      }
    }
    return Array.isArray(obj) ? Object.values(result) : result;
  }
}

class ObjectPropertyNotFoundError extends Error {

  prop: string;

  constructor(prop: string) {
    super();
    this.name = 'ObjectPropertyNotFoundError';
    this.prop = prop;
  }
}
