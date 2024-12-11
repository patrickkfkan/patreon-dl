export type DateTimeConstructorArgs = {
  year: number;
  month: number;
  day: number;
} & ({
  hour: number;
  minute: number;
  second?: number;
  gmt?: string;
} | {
  hour?: undefined;
  minute?: undefined;
  second?: undefined;
  gmt?: undefined;
});

export default class DateTime {

  static FORMAT = 'yyyy-MM-dd [hh:mm[:ss] [GMT]]';

  #year: number;
  #month: number;
  #day: number;
  #hour: number;
  #minute: number;
  #second: number;
  #gmt: string;

  #internal: Date;
  #str: string;

  constructor(args: DateTimeConstructorArgs) {
    this.#year = args.year;
    this.#month = args.month;
    this.#day = args.day;
    this.#hour = args.hour || 0;
    this.#minute = args.minute || 0;
    this.#second = args.second || 0;
    this.#gmt = args.gmt || '+0000';

    const result = this.#validate();
    if (result.ok) {
      this.#internal = result.parsed;
      this.#str = result.dateTimeStr;
    }
    else {
      throw Error(`DateTime creation error: ${result.message}`);
    }
  }

  #validate(): { ok: true; parsed: Date; dateTimeStr: string; } | { ok: false; message: string; } {
    const dateStr = `${this.#year.toString().padStart(4, '0')}-${this.#month.toString().padStart(2, '0')}-${this.#day.toString().padStart(2, '0')}`;
    const timeStr = `${this.#hour.toString().padStart(2, '0')}:${this.#minute.toString().padStart(2, '0')}:${this.#second.toString().padStart(2, '0')}`;
    const dateTimeStr = `${dateStr}T${timeStr}${this.#gmt}`;
    try {
      const parsed = new Date(dateTimeStr);
      return {
        ok: true,
        parsed,
        dateTimeStr
      };
    }
    catch (_error: unknown) {
      return {
        ok: false,
        message: `failed to parse date from ${dateTimeStr}`
      };
    }
  }

  static from(value: string | number) {
    if (typeof value === 'string') {
      // Match 'yyyy-MM-dd [hh:mm[:ss] [+/-GMT]]
      const regex = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2})(?::(\d{2}))?(?: ([+-]\d{4}))?)?/;
      const match = regex.exec(value);
      if (match) {
        const [_v, yyyy, MM, dd, hh, mm, ss, gmt] = match;
        const args: DateTimeConstructorArgs = {
          year: Number(yyyy),
          month: Number(MM),
          day: Number(dd),
          hour: Number(hh),
          minute: Number(mm),
          second: Number(ss),
          gmt
        };
        if (ss !== undefined && (ss.startsWith('+') || ss.startsWith('-'))) {
          args.second = undefined;
          args.gmt = ss;
        }
        return new DateTime(args);
      }
      throw Error(`Could not create DateTime object from "${value}": invalid format`);
    }
    // Value is number
    const date = new Date();
    date.setTime(value);
    const args = {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds()
    };
    return new DateTime(args);
  }

  valueOf() {
    return this.#internal;
  }

  toString() {
    return this.#str;
  }
}
