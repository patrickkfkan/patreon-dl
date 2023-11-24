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
}

class ObjectPropertyNotFoundError extends Error {

  prop: string;

  constructor(prop: string) {
    super();
    this.name = 'ObjectPropertyNotFoundError';
    this.prop = prop;
  }
}
