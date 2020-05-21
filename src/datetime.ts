import { Equatable, Comparable } from './contract';

export interface DateTimeFormat {
  readonly locale: string;
  readonly abbreviatedMonthNames: string[];
  readonly dayNames: string[];
  readonly monthNames: string[];
  readonly AMDesignator: string;
  readonly firstDayOfWeek: number;
  readonly fullDateTimePattern: string;
  readonly longDatePattern: string;
  readonly longTimePattern: string;
  readonly shortDatePattern: string;
  readonly shortDayNames: string[];
  readonly shortTimePattern: string;
  readonly timeSeparator: string;
}

export namespace Formats {
  export const hu: DateTimeFormat = {
    locale: 'hu-HU',
    abbreviatedMonthNames: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szept', 'Okt', 'Nov', 'Dec'],
    dayNames: [ 'Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
    monthNames: [
      'Január',
      'Február',
      'Március',
      'Április',
      'Május',
      'Június',
      'Július',
      'Augusztus',
      'Szeptember',
      'Október',
      'November',
      'December'],
    AMDesignator: '',
    firstDayOfWeek: 1,
    fullDateTimePattern: 'yyyy. mmmm dd. HH:MM:ss',
    longDatePattern: 'yyyy. mmmm dd.',
    longTimePattern: 'HH:MM:ss',
    shortDatePattern: 'yyyy. m. d.',
    shortDayNames: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
    shortTimePattern: 'HH:MM',
    timeSeparator: ':'
  };

  export const enGB: DateTimeFormat = {
    locale: 'en-GB',
    abbreviatedMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'Oktober',
      'November',
      'December'],
    AMDesignator: 'am',
    firstDayOfWeek: 1,
    fullDateTimePattern: 'dd mmmm yyyy HH:MM:ss',
    longDatePattern: 'dd mmmm yyyy',
    longTimePattern: 'HH:MM:ss',
    shortDatePattern: 'dd/mm/yyyy',
    shortDayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    shortTimePattern: 'HH:MM',
    timeSeparator: ':'
  };

  export const enUS: DateTimeFormat = {
    locale: 'en-US',
    abbreviatedMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'Oktober',
      'November',
      'December'],
    AMDesignator: 'AM',
    firstDayOfWeek: 0,
    fullDateTimePattern: 'dddd, mmmm d, yyyy h:MM:ss TT',
    longDatePattern: 'dddd, mmmm d, yyyy',
    longTimePattern: 'h:MM:ss tt',
    shortDatePattern: 'm/d/yyyy',
    shortDayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    shortTimePattern: 'h:MM tt',
    timeSeparator: ':'
  };

  export const ru: DateTimeFormat = {
    locale: 'ru-RU',
    // tslint:disable-next-line:max-line-length
    abbreviatedMonthNames: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
    dayNames: ['Воскпесенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Субота'],
    monthNames: [
      'январь',
      'февраль',
      'март',
      'апрель',
      'май',
      'июнь',
      'июль',
      'август',
      'Сентябрь',
      'октябрь',
      'ноябрь',
      'декабрь'],
    AMDesignator: '',
    firstDayOfWeek: 0,
    fullDateTimePattern: 'd mmmm yyyy \'г.\' H:mm:ss',
    longDatePattern: 'd mmmm yyyy \'г.\'',
    longTimePattern: 'H:MM:ss',
    shortDatePattern: 'dd.mm.yyyy',
    shortDayNames: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
    shortTimePattern: 'H:MM',
    timeSeparator: ':'
  };
}

const regexJsonMilliseconds = /\.[0-9]+(Z|\+[0-9]{1,2}(:[0-9]{1,2})?)$/i;

const dateFromJson = (json: string) => {
  const fixed = json.replace(regexJsonMilliseconds, '$1');
  return new Date(fixed);
};

const dateFromTime = (milliseconds: number) => {
  const result = new Date();
  result.setTime(milliseconds);
  return result;
};

const regexTimeSpan = /^(-)?(([0-9]+)\.)?([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2})(\.([0-9]{1,3}))?)?$/;

const monthLengths = [
  31, // jan
  NaN, // feb
  31,  // mar
  30,  // apr
  31,  // may
  30,  // jun
  31,  // jul
  31,  // aug
  30,  // sep
  31,  // okt
  30,  // nov
  31  // dec
];

const pow10 = (n: number) => {
  switch (n) {
    case 0:
      return 1;
    case 1:
      return 10;
    case 2:
      return 100;
    case 3:
      return 1000;
    default:
      let res = 1;
      for (let i = 0; i < n; ++i) {
        res *= 10;
      }
      return res;
  }
};

const pad3 = (n: number) => {
  if (n < 10) {
    return `00${n}`;
  }
  if (n < 100) {
    return `0${n}`;
  }
  return String(n);
};

const parseTimeStamp = (input: string) => {
  const m = regexTimeSpan.exec(input);
  if (!m) {
    throw new Error(`invalid timestamp value: "${input}"`);
  }
  let milliseconds = m[9] ? parseInt(m[9], 10) * pow10(3 - m[9].length) : 0;
  milliseconds += (parseInt(m[7], 10) || 0) * TimeSpan.millisecondsInSecond;
  milliseconds += (parseInt(m[5], 10) || 0) * TimeSpan.millisecondsInMinute;
  milliseconds += (parseInt(m[4], 10) || 0) * TimeSpan.millisecondsInHour;
  milliseconds += (parseInt(m[3], 10) || 0) * TimeSpan.millisecondsInDay;
  if ('-' === m[1]) {
    milliseconds = -milliseconds;
  }
  return milliseconds;
};

export class TimeSpan implements Equatable<TimeSpan>, Comparable<TimeSpan> {
  static readonly millisecondsInSecond = 1000;
  static readonly millisecondsInMinute = 60000;
  static readonly millisecondsInHour = 3600000;
  static readonly millisecondsInDay = 86400000;
  private readonly value: number;
  get milliseconds() { return this.value % TimeSpan.millisecondsInSecond; }
  get seconds() { return Math.floor(this.totalSeconds) % 60; }
  get minutes() { return Math.floor(this.totalMinutes) % 60; }
  get hours() { return Math.floor(this.totalHours) % 24; }
  get days() { return Math.floor(this.totalDays); }
  get totalMilliseconds() { return this.value; }
  get totalSeconds() { return this.value / TimeSpan.millisecondsInSecond; }
  get totalMinutes() { return this.value / TimeSpan.millisecondsInMinute; }
  get totalHours() { return this.value / TimeSpan.millisecondsInHour; }
  get totalDays() { return this.value / TimeSpan.millisecondsInDay; }

  /**
   * Creates timespan for the specified amount of milliseconds.
   * @param milliseconds Amount of milliseconds.
   */
  constructor(milliseconds: number);

  /**
   * Creates timespan by parsing its string representation.
   * @param input String representation of the timespan.
   */
  constructor(input: string);

  constructor(source: number|string) {
    if ('number' === typeof source) {
      this.value = source;
    } else {
      this.value = parseTimeStamp(source);
    }
  }
  abs() {
    return new TimeSpan(Math.abs(this.value));
  }
  addMilliseconds(milliseconds: number) {
    return new TimeSpan(this.value + milliseconds);
  }
  addSeconds(seconds: number) {
    return this.addMilliseconds(seconds * TimeSpan.millisecondsInSecond);
  }
  addMinutes(minutes: number) {
    return this.addMilliseconds(minutes * TimeSpan.millisecondsInMinute);
  }
  addHours(hours: number) {
    return this.addMilliseconds(hours * TimeSpan.millisecondsInHour);
  }
  addDays(days: number) {
    return this.addMilliseconds(days * TimeSpan.millisecondsInDay);
  }
  add(value: TimeSpan|number) {
    const milliseconds = value instanceof TimeSpan ? value.totalMilliseconds : value;
    return this.addMilliseconds(milliseconds);
  }
  neg() {
    return new TimeSpan(-1 * this.value);
  }
  subMilliseconds(milliseconds: number) {
    return new TimeSpan(this.value - milliseconds);
  }
  subSeconds(seconds: number) {
    return this.subMilliseconds(seconds * TimeSpan.millisecondsInSecond);
  }
  subMinutes(minutes: number) {
    return this.subMilliseconds(minutes * TimeSpan.millisecondsInMinute);
  }
  subHours(hours: number) {
    return this.subMilliseconds(hours * TimeSpan.millisecondsInHour);
  }
  subDays(days: number) {
    return this.subMilliseconds(days * TimeSpan.millisecondsInDay);
  }
  sub(value: TimeSpan|number) {
    const milliseconds = value instanceof TimeSpan ? value.totalMilliseconds : value;
    return this.subMilliseconds(milliseconds);
  }

  equalsTo(other: TimeSpan) {
    return this.value === other.value;
  }

  compareTo(other: TimeSpan) {
    return this.value > other.value ? 1 : (this.value === other.value ? 0 : -1);
  }

  toString() {
    if (this.value < 0) {
      return `-${this.abs()}`;
    }
    const days = this.days;
    const hours = this.hours;
    const minutes = this.minutes;
    const seconds = this.seconds;
    const milliseconds = this.milliseconds;
    if (days) {
      if (seconds || !milliseconds) {
        return `${days}.${hours}.${minutes}.${seconds}`;
      }
      if (milliseconds) {
        return `${days}.${hours}.${minutes}.${seconds}.${pad3(milliseconds)}`;
      }
      return `${days}.${hours}.${minutes}`;
    }
    if (seconds || !milliseconds) {
      return `${hours}.${minutes}.${seconds}`;
    }
    if (milliseconds) {
      return `${hours}.${minutes}.${seconds}.${pad3(milliseconds)}`;
    }
    return `${hours}.${minutes}`;
  }
}

export interface DateTimeInit {
  year?: number;
  month?: number;
  day?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

const patterns = {
  d: Symbol('d'),
  dd: Symbol('dd'),
  ddd: Symbol('ddd'),
  dddd: Symbol('dddd'),
  m: Symbol('m'),
  mm: Symbol('mm'),
  mmm: Symbol('mmm'),
  mmmm: Symbol('mmmm'),
  yy: Symbol('yy'),
  yyyy: Symbol('yyyy'),
  h: Symbol('h'),
  hh: Symbol('hh'),
  H: Symbol('H'),
  HH: Symbol('HH'),
  M: Symbol('M'),
  MM: Symbol('MM'),
  s: Symbol('s'),
  ss: Symbol('ss'),
  tt: Symbol('tt'),
  TT: Symbol('TT'),
};

const patternKeys = (function() {
  const x: Array<[string, Symbol]> = [];
  Object.keys(patterns).forEach((k) => {
    x.push([k, <Symbol> (<any> patterns)[k]]);
  });
  // tslint:disable-next-line:max-line-length
  x.sort(([k1, _], [k2, __]) => k1.length === k2.length ? (k1 < k2 ? -1 : (k1 === k2 ? 0 : -1)) : k1.length < k2.length ? 1 : -1);
  return x;
}());

type FormatToken = string|Symbol;

function parseFormat(source: string, index: number, tokens: FormatToken[]): FormatToken[] {
  if (index >= source.length) {
    return tokens;
  }
  if ('\'' === source[index]) {
    const closing = source.indexOf('\'', index + 1);
    if (-1 === closing) {
      throw new Error('unclosed quote');
    }
    tokens.push(source.substring(index + 1, closing));
    return parseFormat(source, closing + 1, tokens);
  }
  // check formats
  for (const [k, s] of patternKeys) {
    if (index === source.indexOf(k, index)) {
      tokens.push(s);
      return parseFormat(source, index + k.length, tokens);
    }
  }
  // plain text
  const l = tokens.length;
  if (l && 'string' === typeof tokens[l]) {
    tokens[l] += source[index];
  } else {
    tokens.push(source[index]);
  }
  return parseFormat(source, index + 1, tokens);
}

const formatCache: { [fmt: string]: FormatToken[]|undefined } = {};

const parseFormatCached = (source: string): FormatToken[] => {
  let tokens = formatCache[source];
  if (tokens) {
    return tokens;
  }
  tokens = parseFormat(source, 0, []);
  formatCache[source] = tokens;
  return tokens;
};

const padZero: (source: string, n: number) => string = (function() {
  if ((<any> String.prototype).padStart) {
    const pad: (n: number, padString: string) => string = (<any> String.prototype).padStart;
    return (source: string, n: number) => pad.call(source, n, '0');
  }
  return (source: string, n: number) => {
    let result = source;
    while (result.length < n) {
      result = '0' + result;
    }
    return result;
  };
}());

function stringify(source: DateTime, tokens: FormatToken[], format: DateTimeFormat) {
  let result = '';
  for (const token of tokens) {
    if ('string' === typeof token) {
      result += token;
    } else if (patterns.d === token) {
      result += String(source.day);
    } else if (patterns.dd === token) {
      result += padZero(String(source.day), 2);
    } else if (patterns.ddd === token) {
      result += format.shortDayNames[source.dayOfWeek];
    } else if (patterns.dddd === token) {
      result += format.dayNames[source.dayOfWeek];
    } else if (patterns.m === token) {
      result += String(source.month);
    } else if (patterns.mm === token) {
      result += padZero(String(source.month), 2);
    } else if (patterns.mmm === token) {
      result += format.abbreviatedMonthNames[source.month - 1];
    } else if (patterns.mmmm === token) {
      result += format.monthNames[source.month - 1];
    } else if (patterns.yy === token) {
      result += String(source.year % 100);
    } else if (patterns.yyyy === token) {
      result += String(source.year);
    } else if (patterns.h === token) {
      result += String(source.hours % 12);
    } else if (patterns.hh === token) {
      result += padZero(String(source.hours % 12), 2);
    } else if (patterns.H === token) {
      result += String(source.hours);
    } else if (patterns.HH === token) {
      result += padZero(String(source.hours), 2);
    } else if (patterns.M === token) {
      result += String(source.minutes);
    } else if (patterns.MM === token) {
      result += padZero(String(source.minutes), 2);
    } else if (patterns.s === token) {
      result += String(source.seconds);
    } else if (patterns.ss === token) {
      result += padZero(String(source.seconds), 2);
    } else if (patterns.tt === token) {
      result += source.hours > 11 ? 'pm' : 'am';
    } else if (patterns.TT === token) {
      result += source.hours > 11 ? 'PM' : 'AM';
    } else {
      throw new Error('invalid fotmat token');
    }
  }
  return result;
}

const formatCustom = (source: DateTime, fmt: string, format: DateTimeFormat): string => {
  const tokens = parseFormatCached(fmt);
  return stringify(source, tokens, format);
};

const formatStandard = (source: DateTime, fmt: 'd'|'D'|'f'|'F'|'g'|'G', format: DateTimeFormat) => {
  switch (fmt) {
    case 'd':
      return formatCustom(source, format.shortDatePattern, format);
    case 'D':
      return formatCustom(source, format.longDatePattern, format);
    case 'f':
    case 'F':
      return formatCustom(source, format.fullDateTimePattern, format);
    case 'g':
      return formatCustom(source, format.shortDatePattern + ' ' + format.shortTimePattern, format);
    case 'G':
      return formatCustom(source, format.shortDatePattern + ' ' + format.longTimePattern, format);
  }
  throw new Error('should never happen');
};

export class DateTime implements Equatable<DateTime>, Comparable<DateTime> {

  static defaultFormatProvider = Formats.hu;
  static defaultFormat = 'g';

  /**
   * Returns amount of days in the specified month.
   * @param month Month.
   * @param year Year.
   */
  static getMonthLength(month: number, year: number) {
    if (month < 1 || month > 12) {
        throw new RangeError('month out of range');
    }
    if (month !== 2) {
        return monthLengths[month - 1];
    }
    return (0 === year % 4 && (0 !== year % 100 || 0 === year % 400)) ? 29 : 28;
  }

  private readonly source: Date;
  get isValid() { return !isNaN(this.source.getTime()); }
  get year() { return this.source.getFullYear(); }
  get month() { return this.source.getMonth() + 1; }
  get day() { return this.source.getDate(); }
  get dayOfWeek() { return this.source.getDay(); }
  get hours() { return this.source.getHours(); }
  get minutes() { return this.source.getMinutes(); }
  get seconds() { return this.source.getSeconds(); }
  get milliseconds() { return this.source.getMilliseconds(); }

  /** Creates new instance of datetime for actual date and time. */
  constructor();

  /**
   * Creates new instance of datetime from the specified date.
   * @param source Date object to use.
   */
  constructor(source: Date);

  /**
   * Creates new instance of datetime from the specified JSON string representing date.
   * @param json JSON string representing date.
   */
  constructor(json: string);

  /**
   * Creates new instance of datetime from the specified amount of milliseconds from 1970 jan 1 UTC.
   * @param source Amount of milliseconds from 1970 jan 1 UTC.
   */
  constructor(milliseconds: number);

  /**
   * Creates new instance of datetime from the specified initializer.
   * @param source Initializer object to use.
   */
  constructor(init: DateTimeInit);

  constructor(source?: Date|string|number|DateTimeInit) {
    if (undefined === source || null === source) {
      this.source = new Date();
    } else if ('string' === typeof source) {
      this.source = dateFromJson(source);
    } else if ('number' === typeof source) {
      this.source = dateFromTime(source);
    } else if (source instanceof Date) {
      this.source = source;
    } else {
      // assume init
      const init = <DateTimeInit> source;
      this.source = new Date(
        init.year || new Date().getFullYear(),
        init.month ? init.month - 1 : 0,
        init.day || 1,
        init.hours || 0,
        init.minutes || 0,
        init.seconds || 0,
        init.milliseconds || 0);
    }
  }

  equalsTo(other: DateTime) {
    return this.source.getTime() === other.source.getTime();
  }

  compareTo(other: DateTime) {
    return this.source < other.source ? -1 : (this.equalsTo(other) ? 0 : 1);
  }

  addMilliseconds(milliseconds: number) {
    const res = dateFromTime(this.source.getTime() + milliseconds);
    const offsetDelta = this.source.getTimezoneOffset() - res.getTimezoneOffset();
    if (offsetDelta !== 0) {
        const adjust = offsetDelta * TimeSpan.millisecondsInMinute;
        res.setTime(res.getTime() - adjust);
    }
    return new DateTime(res);
  }

  addSeconds(seconds: number) {
    return this.addMilliseconds(seconds * TimeSpan.millisecondsInSecond);
  }

  addMinutes(minutes: number) {
    return this.addMilliseconds(minutes * TimeSpan.millisecondsInMinute);
  }

  addHours(hours: number) {
    return this.addMilliseconds(hours * TimeSpan.millisecondsInHour);
  }

  addDays(days: number) {
    return this.addMilliseconds(days * TimeSpan.millisecondsInDay);
  }

  addMonths(months: number) {
    if (0 === months) {
        return this.addDays(0);
    }
    if (0 < months) {
      const full = Math.floor(months) + (this.month - 1);
      const fm = full % 12;
      const fy = Math.floor(full / 12);
      const res = new DateTime({
        year: this.year + fy,
        month: fm + 1,
        day: Math.min(DateTime.getMonthLength(fm + 1, this.year + fy), this.day),
        hours: this.hours,
        minutes: this.minutes,
        seconds: this.seconds,
        milliseconds: this.milliseconds
      });
      const part = months % 1;
      if (0 === part) {
        return res;
      }
      return res.addDays(DateTime.getMonthLength(res.month, res.year) * part);
    } else {
      const abs = Math.abs(months);
      let m = (this.month - 1) - Math.floor(abs);
      let y = this.year;
      while (0 > m) {
        y = y - 1;
        m = m + 12;
      }
      const part = abs % 1;
      if (0 === part) {
        return new DateTime({
          year: y,
          month: m + 1,
          day: this.day,
          hours: this.hours,
          minutes: this.minutes,
          seconds: this.seconds,
          milliseconds: this.milliseconds
        });
      }
      if (0 === m) {
          y = y - 1;
          m = 11;
      } else {
          m = m - 1;
      }
      const days = DateTime.getMonthLength(m + 1, y);
      const toAdd = days * (1 - part);
      return new DateTime({
        year: y,
        month: m,
        day: this.day,
        hours: this.hours,
        minutes: this.minutes,
        seconds: this.seconds,
        milliseconds: this.milliseconds
      }).addDays(toAdd);
    }
  }
  add(timeSpan: TimeSpan): DateTime;
  add(milliseconds: number): DateTime;
  add(value: TimeSpan|number) {
    if (value instanceof TimeSpan) {
      return this.addMilliseconds(value.totalMilliseconds);
    }
    return this.addMilliseconds(value);
  }
  substract(other: DateTime): TimeSpan;
  substract(timespan: TimeSpan): DateTime;
  substract(milliseconds: number): DateTime;
  substract(value: DateTime|TimeSpan|number) {
    if (value instanceof DateTime) {
      return new TimeSpan(this.source.getTime() - value.source.getTime());
    }
    if (value instanceof TimeSpan) {
      return this.add(-1 * value.totalMilliseconds);
    }
    return this.add(-1 * value);
  }
  toDate() {
    const result = new Date();
    result.setTime(this.source.getTime());
    return result;
  }
  private format(format: string, provider: DateTimeFormat): string {
    if ('d' === format || 'D' === format || 'f' === format || 'F' === format || 'g' === format || 'G' === format) {
      return formatStandard(this, format, provider);
    }
    return formatCustom(this, format, provider);
  }
  toString(): string;
  toString(format: string): string;
  toString(provider: DateTimeFormat): string;
  toString(format: string, provider: DateTimeFormat): string;
  toString(formatOrProvider?: string|DateTimeFormat, provider?: DateTimeFormat) {
    if (!provider) {
      if (!formatOrProvider) {
        return this.format(DateTime.defaultFormat, DateTime.defaultFormatProvider);
      } else if ('string' === typeof formatOrProvider) {
        return this.format(formatOrProvider, DateTime.defaultFormatProvider);
      } else {
        return this.format(DateTime.defaultFormat, formatOrProvider);
      }
    }
    if ('string' !== typeof formatOrProvider) {
      throw new Error('invalid format argument');
    }
    return this.format(formatOrProvider, provider);
  }
}
