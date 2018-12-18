
const regexJsonMilliseconds = /\.[0-9]+(Z|\+[0-9]{1,2}(:[0-9]{1,2})?)$/i;

const dateFromJson = (json: string) => {
  const fixed = json.replace(regexJsonMilliseconds, '$1');
  return new Date(fixed);
}

const dateFromTime = (milliseconds: number) => {
  const result = new Date();
  result.setTime(milliseconds);
  return result;
}

const regexTimeSpan = /^(-)?(([0-9]+)\.)?([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2})(\.([0-9]{1,3}))?)?$/;

const pow10 = (n: number) => {
  switch(n) {
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
}

const pad3 = (n: number) => {
  if (n < 10) {
    return `00${n}`;
  }
  if (n < 100) {
    return `0${n}`;
  }
  return String(n);
}

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
}

export class TimeSpan {
  static readonly millisecondsInSecond = 1000;
  static readonly millisecondsInMinute = 60000;
  static readonly millisecondsInHour = 3600000;
  static readonly millisecondsInDay = 86400000;
  private readonly value: number
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

export class DateTime {
  private readonly source: Date
  get isValid() { return !isNaN(this.source.getTime()); }
  get year() { return this.source.getFullYear(); }
  get month() { return this.source.getMonth() + 1; }
  get date() { return this.source.getDate(); }
  get hours() { return this.source.getHours(); }
  get minutes() { return this.source.getMinutes(); }
  get seconds() { return this.source.getSeconds(); }
  get milliseconds() { return this.source.getMilliseconds(); }
  constructor (source?: Date|string|number) {
    if (undefined === source) {
      this.source = new Date();
    } else if ('string' === typeof source) {
      this.source = dateFromJson(source);
    } else if ('number' === typeof source) {
      this.source = dateFromTime(source);
    } else {
      this.source = source;
    }
  }
}