export var Formats;
(function (Formats) {
    Formats.hu = {
        abbreviatedMonthNames: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szept', 'Okt', 'Nov', 'Dec'],
        dayNames: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
        monthNames: [
            'Január',
            'Február',
            'Március',
            'Május',
            'Június',
            'Július',
            'Augusztus',
            'Szeptember',
            'Október',
            'November',
            'December'
        ],
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
    Formats.enGB = {
        abbreviatedMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dec'],
        dayNames: ['Sunday', 'Monday', 'Thuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        monthNames: [
            'January',
            'February',
            'March',
            'May',
            'June',
            'July',
            'August',
            'September',
            'Oktober',
            'November',
            'December'
        ],
        AMDesignator: 'am',
        firstDayOfWeek: 1,
        fullDateTimePattern: 'dd mmmm yyyy HH:MM:ss',
        longDatePattern: 'dd mmmm yyyy',
        longTimePattern: 'HH:MM:ss',
        shortDatePattern: 'dd/mm/yyyy',
        shortDayNames: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        shortTimePattern: 'HH:MM',
        timeSeparator: ':'
    };
    Formats.enUS = {
        abbreviatedMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dec'],
        dayNames: ['Sunday', 'Monday', 'Thuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        monthNames: [
            'January',
            'February',
            'March',
            'May',
            'June',
            'July',
            'August',
            'September',
            'Oktober',
            'November',
            'December'
        ],
        AMDesignator: 'AM',
        firstDayOfWeek: 0,
        fullDateTimePattern: 'dddd, mmmm d, yyyy h:MM:ss TT',
        longDatePattern: 'dddd, mmmm d, yyyy',
        longTimePattern: 'h:MM:ss tt',
        shortDatePattern: 'm/d/yyyy',
        shortDayNames: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        shortTimePattern: 'h:MM tt',
        timeSeparator: ':'
    };
    Formats.ru = {
        abbreviatedMonthNames: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
        dayNames: ['Воскпесенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Субота'],
        monthNames: [
            'январь',
            'февраль',
            'март',
            'май',
            'июнь',
            'июль',
            'август',
            'Сентябрь',
            'октябрь',
            'ноябрь',
            'декабрь'
        ],
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
})(Formats || (Formats = {}));
const regexJsonMilliseconds = /\.[0-9]+(Z|\+[0-9]{1,2}(:[0-9]{1,2})?)$/i;
const dateFromJson = (json) => {
    const fixed = json.replace(regexJsonMilliseconds, '$1');
    return new Date(fixed);
};
const dateFromTime = (milliseconds) => {
    const result = new Date();
    result.setTime(milliseconds);
    return result;
};
const regexTimeSpan = /^(-)?(([0-9]+)\.)?([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2})(\.([0-9]{1,3}))?)?$/;
const monthLengths = [
    31,
    NaN,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31 // dec
];
const pow10 = (n) => {
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
const pad3 = (n) => {
    if (n < 10) {
        return `00${n}`;
    }
    if (n < 100) {
        return `0${n}`;
    }
    return String(n);
};
const parseTimeStamp = (input) => {
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
export class TimeSpan {
    constructor(source) {
        if ('number' === typeof source) {
            this.value = source;
        }
        else {
            this.value = parseTimeStamp(source);
        }
    }
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
    abs() {
        return new TimeSpan(Math.abs(this.value));
    }
    addMilliseconds(milliseconds) {
        return new TimeSpan(this.value + milliseconds);
    }
    addSeconds(seconds) {
        return this.addMilliseconds(seconds * TimeSpan.millisecondsInSecond);
    }
    addMinutes(minutes) {
        return this.addMilliseconds(minutes * TimeSpan.millisecondsInMinute);
    }
    addHours(hours) {
        return this.addMilliseconds(hours * TimeSpan.millisecondsInHour);
    }
    addDays(days) {
        return this.addMilliseconds(days * TimeSpan.millisecondsInDay);
    }
    add(value) {
        const milliseconds = value instanceof TimeSpan ? value.totalMilliseconds : value;
        return this.addMilliseconds(milliseconds);
    }
    neg() {
        return new TimeSpan(-1 * this.value);
    }
    subMilliseconds(milliseconds) {
        return new TimeSpan(this.value - milliseconds);
    }
    subSeconds(seconds) {
        return this.subMilliseconds(seconds * TimeSpan.millisecondsInSecond);
    }
    subMinutes(minutes) {
        return this.subMilliseconds(minutes * TimeSpan.millisecondsInMinute);
    }
    subHours(hours) {
        return this.subMilliseconds(hours * TimeSpan.millisecondsInHour);
    }
    subDays(days) {
        return this.subMilliseconds(days * TimeSpan.millisecondsInDay);
    }
    sub(value) {
        const milliseconds = value instanceof TimeSpan ? value.totalMilliseconds : value;
        return this.subMilliseconds(milliseconds);
    }
    equalsTo(other) {
        return this.value === other.value;
    }
    compareTo(other) {
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
TimeSpan.millisecondsInSecond = 1000;
TimeSpan.millisecondsInMinute = 60000;
TimeSpan.millisecondsInHour = 3600000;
TimeSpan.millisecondsInDay = 86400000;
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
const patternKeys = (function () {
    const x = [];
    Object.keys(patterns).forEach(k => {
        x.push([k, patterns[k]]);
    });
    x.sort(([k1, _], [k2, __]) => k1.length === k2.length ? (k1 < k2 ? -1 : (k1 === k2 ? 0 : -1)) : k1.length < k2.length ? 1 : -1);
    return x;
}());
function parseFormat(source, index, tokens) {
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
    }
    else {
        tokens.push(source[index]);
    }
    return parseFormat(source, index + 1, tokens);
}
const formatCache = {};
const parseFormatCached = (source) => {
    let tokens = formatCache[source];
    if (tokens) {
        return tokens;
    }
    tokens = parseFormat(source, 0, []);
    formatCache[source] = tokens;
    return tokens;
};
const padZero = (function () {
    if (String.prototype.padStart) {
        const pad = String.prototype.padStart;
        return (source, n) => pad.call(source, n, '0');
    }
    return (source, n) => {
        let result = source;
        while (result.length < n) {
            result = '0' + result;
        }
        return result;
    };
}());
function stringify(source, tokens, format) {
    let result = '';
    for (const token of tokens) {
        if ('string' === typeof token) {
            result += token;
        }
        else if (patterns.d === token) {
            result += String(source.day);
        }
        else if (patterns.dd === token) {
            result += padZero(String(source.day), 2);
        }
        else if (patterns.ddd === token) {
            result += format.shortDayNames[source.dayOfWeek];
        }
        else if (patterns.dddd === token) {
            result += format.dayNames[source.dayOfWeek];
        }
        else if (patterns.m === token) {
            result += String(source.month);
        }
        else if (patterns.mm === token) {
            result += padZero(String(source.month), 2);
        }
        else if (patterns.mmm === token) {
            result += format.abbreviatedMonthNames[source.month - 1];
        }
        else if (patterns.mmmm === token) {
            result += format.monthNames[source.month - 1];
        }
        else if (patterns.yy === token) {
            result += String(source.year % 100);
        }
        else if (patterns.yyyy === token) {
            result += String(source.year);
        }
        else if (patterns.h === token) {
            result += String(source.hours % 12);
        }
        else if (patterns.hh === token) {
            result += padZero(String(source.hours % 12), 2);
        }
        else if (patterns.H === token) {
            result += String(source.hours);
        }
        else if (patterns.HH === token) {
            result += padZero(String(source.hours), 2);
        }
        else if (patterns.M === token) {
            result += String(source.minutes);
        }
        else if (patterns.MM === token) {
            result += padZero(String(source.minutes), 2);
        }
        else if (patterns.s === token) {
            result += String(source.seconds);
        }
        else if (patterns.ss === token) {
            result += padZero(String(source.seconds), 2);
        }
        else if (patterns.tt === token) {
            result += source.hours > 11 ? 'pm' : 'am';
        }
        else if (patterns.TT === token) {
            result += source.hours > 11 ? 'PM' : 'AM';
        }
        else {
            throw new Error('invalid fotmat token');
        }
    }
    return result;
}
const formatCustom = (source, fmt, format) => {
    const tokens = parseFormatCached(fmt);
    return stringify(source, tokens, format);
};
const formatStandard = (source, fmt, format) => {
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
export class DateTime {
    constructor(source) {
        if (undefined === source || null === source) {
            this.source = new Date();
        }
        else if ('string' === typeof source) {
            this.source = dateFromJson(source);
        }
        else if ('number' === typeof source) {
            this.source = dateFromTime(source);
        }
        else if (source instanceof Date) {
            this.source = source;
        }
        else {
            // assume init
            const init = source;
            this.source = new Date(init.year || new Date().getFullYear(), init.month ? init.month - 1 : 0, init.day || 1, init.hours || 0, init.minutes || 0, init.seconds || 0, init.milliseconds || 0);
        }
    }
    /**
     * Returns amount of days in the specified month.
     * @param month Month.
     * @param year Year.
     */
    static getMonthLength(month, year) {
        if (month < 1 || month > 12) {
            throw new RangeError('month out of range');
        }
        if (month !== 2) {
            return monthLengths[month - 1];
        }
        return (0 === year % 4 && (0 !== year % 100 || 0 === year % 400)) ? 29 : 28;
    }
    get isValid() { return !isNaN(this.source.getTime()); }
    get year() { return this.source.getFullYear(); }
    get month() { return this.source.getMonth() + 1; }
    get day() { return this.source.getDate(); }
    get dayOfWeek() { return this.source.getDay(); }
    get hours() { return this.source.getHours(); }
    get minutes() { return this.source.getMinutes(); }
    get seconds() { return this.source.getSeconds(); }
    get milliseconds() { return this.source.getMilliseconds(); }
    equalsTo(other) {
        return this.source.getTime() === other.source.getTime();
    }
    compareTo(other) {
        return this.source < other.source ? -1 : (this.equalsTo(other) ? 0 : 1);
    }
    addMilliseconds(milliseconds) {
        const res = dateFromTime(this.source.getTime() + milliseconds);
        const offsetDelta = this.source.getTimezoneOffset() - res.getTimezoneOffset();
        if (offsetDelta !== 0) {
            const adjust = offsetDelta * TimeSpan.millisecondsInMinute;
            res.setTime(res.getTime() - adjust);
        }
        return new DateTime(res);
    }
    addSeconds(seconds) {
        return this.addMilliseconds(seconds * TimeSpan.millisecondsInSecond);
    }
    addMinutes(minutes) {
        return this.addMilliseconds(minutes * TimeSpan.millisecondsInMinute);
    }
    addHours(hours) {
        return this.addMilliseconds(hours * TimeSpan.millisecondsInHour);
    }
    addDays(days) {
        return this.addMilliseconds(days * TimeSpan.millisecondsInDay);
    }
    addMonths(months) {
        if (0 === months) {
            return this.addDays(0);
        }
        if (0 < months) {
            const full = Math.floor(months) + (this.month - 1);
            const fm = full % 12;
            const fy = Math.floor(full / 12);
            let res = new DateTime({
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
        }
        else {
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
            }
            else {
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
    add(value) {
        if (value instanceof TimeSpan) {
            return this.addMilliseconds(value.totalMilliseconds);
        }
        return this.addMilliseconds(value);
    }
    substract(value) {
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
    format(format, provider) {
        if ('d' === format || 'D' === format || 'f' === format || 'F' === format || 'g' === format || 'G' === format) {
            return formatStandard(this, format, provider);
        }
        return formatCustom(this, format, provider);
    }
    toString(formatOrProvider, provider) {
        if (!provider) {
            if (!formatOrProvider) {
                return this.format(DateTime.defaultFormat, DateTime.defaultFormatProvider);
            }
            else if ('string' === typeof formatOrProvider) {
                return this.format(formatOrProvider, DateTime.defaultFormatProvider);
            }
            else {
                return this.format(DateTime.defaultFormat, formatOrProvider);
            }
        }
        if ('string' !== typeof formatOrProvider) {
            throw new Error('invalid format argument');
        }
        return this.format(formatOrProvider, provider);
    }
}
DateTime.defaultFormatProvider = Formats.hu;
DateTime.defaultFormat = 'g';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXRpbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGF0ZXRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJBLE1BQU0sS0FBVyxPQUFPLENBd0d2QjtBQXhHRCxXQUFpQixPQUFPO0lBQ1QsVUFBRSxHQUFtQjtRQUNoQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQzdHLFFBQVEsRUFBRSxDQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQztRQUNwRixVQUFVLEVBQUU7WUFDVixRQUFRO1lBQ1IsU0FBUztZQUNULFNBQVM7WUFDVCxPQUFPO1lBQ1AsUUFBUTtZQUNSLFFBQVE7WUFDUixXQUFXO1lBQ1gsWUFBWTtZQUNaLFNBQVM7WUFDVCxVQUFVO1lBQ1YsVUFBVTtTQUFDO1FBQ2IsWUFBWSxFQUFFLEVBQUU7UUFDaEIsY0FBYyxFQUFFLENBQUM7UUFDakIsbUJBQW1CLEVBQUUseUJBQXlCO1FBQzlDLGVBQWUsRUFBRSxnQkFBZ0I7UUFDakMsZUFBZSxFQUFFLFVBQVU7UUFDM0IsZ0JBQWdCLEVBQUUsYUFBYTtRQUMvQixhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7UUFDckQsZ0JBQWdCLEVBQUUsT0FBTztRQUN6QixhQUFhLEVBQUUsR0FBRztLQUNuQixDQUFDO0lBRVcsWUFBSSxHQUFtQjtRQUNsQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUs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QzlEO1NBQ0Y7UUFDRCxJQUFJLFFBQVEsS0FBSyxPQUFPLGdCQUFnQixFQUFFO1lBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUM1QztRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqRCxDQUFDOztBQXhOTSw4QkFBcUIsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQ25DLHNCQUFhLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXF1YXRhYmxlLCBDb21wYXJhYmxlIH0gZnJvbSBcIi4vY29udHJhY3RcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEYXRlVGltZUZvcm1hdCB7XG4gIGFiYnJldmlhdGVkTW9udGhOYW1lczogc3RyaW5nW107XG4gIGRheU5hbWVzOiBzdHJpbmdbXTtcbiAgbW9udGhOYW1lczogc3RyaW5nW107XG4gIEFNRGVzaWduYXRvcjogc3RyaW5nO1xuICBmaXJzdERheU9mV2VlazogbnVtYmVyO1xuICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiBzdHJpbmc7XG4gIGxvbmdEYXRlUGF0dGVybjogc3RyaW5nO1xuICBsb25nVGltZVBhdHRlcm46IHN0cmluZztcbiAgc2hvcnREYXRlUGF0dGVybjogc3RyaW5nO1xuICBzaG9ydERheU5hbWVzOiBzdHJpbmdbXTtcbiAgc2hvcnRUaW1lUGF0dGVybjogc3RyaW5nO1xuICB0aW1lU2VwYXJhdG9yOiBzdHJpbmdcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBGb3JtYXRzIHtcbiAgZXhwb3J0IGNvbnN0IGh1ID0gPERhdGVUaW1lRm9ybWF0PntcbiAgICBhYmJyZXZpYXRlZE1vbnRoTmFtZXM6IFsnSmFuJywgJ0ZlYicsICdNw6FyJywgJ8OBcHInLCAnTcOhaicsICdKw7puJywgJ0rDumwnLCAnQXVnJywgJ1N6ZXB0JywgJ09rdCcsICdOb3YnLCAnRGVjJ10sXG4gICAgZGF5TmFtZXM6IFsgJ1Zhc8Ohcm5hcCcsICdIw6l0ZsWRJywgJ0tlZGQnLCAnU3plcmRhJywgJ0Nzw7x0w7ZydMO2aycsICdQw6ludGVrJywgJ1N6b21iYXQnXSxcbiAgICBtb250aE5hbWVzOiBbXG4gICAgICAnSmFudcOhcicsXG4gICAgICAnRmVicnXDoXInLFxuICAgICAgJ03DoXJjaXVzJyxcbiAgICAgICdNw6FqdXMnLFxuICAgICAgJ0rDum5pdXMnLFxuICAgICAgJ0rDumxpdXMnLFxuICAgICAgJ0F1Z3VzenR1cycsXG4gICAgICAnU3plcHRlbWJlcicsXG4gICAgICAnT2t0w7NiZXInLFxuICAgICAgJ05vdmVtYmVyJyxcbiAgICAgICdEZWNlbWJlciddLFxuICAgIEFNRGVzaWduYXRvcjogJycsXG4gICAgZmlyc3REYXlPZldlZWs6IDEsXG4gICAgZnVsbERhdGVUaW1lUGF0dGVybjogJ3l5eXkuIG1tbW0gZGQuIEhIOk1NOnNzJyxcbiAgICBsb25nRGF0ZVBhdHRlcm46ICd5eXl5LiBtbW1tIGRkLicsXG4gICAgbG9uZ1RpbWVQYXR0ZXJuOiAnSEg6TU06c3MnLFxuICAgIHNob3J0RGF0ZVBhdHRlcm46ICd5eXl5LiBtLiBkLicsXG4gICAgc2hvcnREYXlOYW1lczogWydWJywgJ0gnLCAnSycsICdTeicsICdDcycsICdQJywgJ1N6J10sXG4gICAgc2hvcnRUaW1lUGF0dGVybjogJ0hIOk1NJyxcbiAgICB0aW1lU2VwYXJhdG9yOiAnOidcbiAgfTtcblxuICBleHBvcnQgY29uc3QgZW5HQiA9IDxEYXRlVGltZUZvcm1hdD57XG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwdCcsICdPa3QnLCAnTm92JywgJ0RlYyddLFxuICAgIGRheU5hbWVzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVGh1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAgIG1vbnRoTmFtZXM6IFtcbiAgICAgICdKYW51YXJ5JyxcbiAgICAgICdGZWJydWFyeScsXG4gICAgICAnTWFyY2gnLFxuICAgICAgJ01heScsXG4gICAgICAnSnVuZScsXG4gICAgICAnSnVseScsXG4gICAgICAnQXVndXN0JyxcbiAgICAgICdTZXB0ZW1iZXInLFxuICAgICAgJ09rdG9iZXInLFxuICAgICAgJ05vdmVtYmVyJyxcbiAgICAgICdEZWNlbWJlciddLFxuICAgIEFNRGVzaWduYXRvcjogJ2FtJyxcbiAgICBmaXJzdERheU9mV2VlazogMSxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAnZGQgbW1tbSB5eXl5IEhIOk1NOnNzJyxcbiAgICBsb25nRGF0ZVBhdHRlcm46ICdkZCBtbW1tIHl5eXknLFxuICAgIGxvbmdUaW1lUGF0dGVybjogJ0hIOk1NOnNzJyxcbiAgICBzaG9ydERhdGVQYXR0ZXJuOiAnZGQvbW0veXl5eScsXG4gICAgc2hvcnREYXlOYW1lczogWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10sXG4gICAgc2hvcnRUaW1lUGF0dGVybjogJ0hIOk1NJyxcbiAgICB0aW1lU2VwYXJhdG9yOiAnOidcbiAgfTtcblxuICBleHBvcnQgY29uc3QgZW5VUyA9IDxEYXRlVGltZUZvcm1hdD57XG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwdCcsICdPa3QnLCAnTm92JywgJ0RlYyddLFxuICAgIGRheU5hbWVzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVGh1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAgIG1vbnRoTmFtZXM6IFtcbiAgICAgICdKYW51YXJ5JyxcbiAgICAgICdGZWJydWFyeScsXG4gICAgICAnTWFyY2gnLFxuICAgICAgJ01heScsXG4gICAgICAnSnVuZScsXG4gICAgICAnSnVseScsXG4gICAgICAnQXVndXN0JyxcbiAgICAgICdTZXB0ZW1iZXInLFxuICAgICAgJ09rdG9iZXInLFxuICAgICAgJ05vdmVtYmVyJyxcbiAgICAgICdEZWNlbWJlciddLFxuICAgIEFNRGVzaWduYXRvcjogJ0FNJyxcbiAgICBmaXJzdERheU9mV2VlazogMCxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAnZGRkZCwgbW1tbSBkLCB5eXl5IGg6TU06c3MgVFQnLFxuICAgIGxvbmdEYXRlUGF0dGVybjogJ2RkZGQsIG1tbW0gZCwgeXl5eScsXG4gICAgbG9uZ1RpbWVQYXR0ZXJuOiAnaDpNTTpzcyB0dCcsXG4gICAgc2hvcnREYXRlUGF0dGVybjogJ20vZC95eXl5JyxcbiAgICBzaG9ydERheU5hbWVzOiBbJ1MnLCAnTScsICdUJywgJ1cnLCAnVCcsICdGJywgJ1MnXSxcbiAgICBzaG9ydFRpbWVQYXR0ZXJuOiAnaDpNTSB0dCcsXG4gICAgdGltZVNlcGFyYXRvcjogJzonXG4gIH07XG5cbiAgZXhwb3J0IGNvbnN0IHJ1ID0gPERhdGVUaW1lRm9ybWF0PntcbiAgICBhYmJyZXZpYXRlZE1vbnRoTmFtZXM6IFsn0Y/QvdCyLicsICfRhNC10LLRgC4nLCAn0LzQsNGA0YInLCAn0LDQv9GALicsICfQvNCw0LknLCAn0LjRjtC90YwnLCAn0LjRjtC70YwnLCAn0LDQstCzLicsICfRgdC10L3Rgi4nLCAn0L7QutGCLicsICfQvdC+0Y/QsS4nLCAn0LTQtdC6LiddLFxuICAgIGRheU5hbWVzOiBbJ9CS0L7RgdC60L/QtdGB0LXQvdGM0LUnLCAn0J/QvtC90LXQtNC10LvRjNC90LjQuicsICfQktGC0L7RgNC90LjQuicsICfQodGA0LXQtNCwJywgJ9Cn0LXRgtCy0LXRgNCzJywgJ9Cf0Y/RgtC90LjRhtCwJywgJ9Ch0YPQsdC+0YLQsCddLFxuICAgIG1vbnRoTmFtZXM6IFtcbiAgICAgICfRj9C90LLQsNGA0YwnLFxuICAgICAgJ9GE0LXQstGA0LDQu9GMJyxcbiAgICAgICfQvNCw0YDRgicsXG4gICAgICAn0LzQsNC5JyxcbiAgICAgICfQuNGO0L3RjCcsXG4gICAgICAn0LjRjtC70YwnLFxuICAgICAgJ9Cw0LLQs9GD0YHRgicsXG4gICAgICAn0KHQtdC90YLRj9Cx0YDRjCcsXG4gICAgICAn0L7QutGC0Y/QsdGA0YwnLFxuICAgICAgJ9C90L7Rj9Cx0YDRjCcsXG4gICAgICAn0LTQtdC60LDQsdGA0YwnXSxcbiAgICBBTURlc2lnbmF0b3I6ICcnLFxuICAgIGZpcnN0RGF5T2ZXZWVrOiAwLFxuICAgIGZ1bGxEYXRlVGltZVBhdHRlcm46ICdkIG1tbW0geXl5eSBcXCfQsy5cXCcgSDptbTpzcycsXG4gICAgbG9uZ0RhdGVQYXR0ZXJuOiAnZCBtbW1tIHl5eXkgXFwn0LMuXFwnJyxcbiAgICBsb25nVGltZVBhdHRlcm46ICdIOk1NOnNzJyxcbiAgICBzaG9ydERhdGVQYXR0ZXJuOiAnZGQubW0ueXl5eScsXG4gICAgc2hvcnREYXlOYW1lczogWyfQkicsICfQnycsICfQkicsICfQoScsICfQpycsICfQnycsICfQoSddLFxuICAgIHNob3J0VGltZVBhdHRlcm46ICdIOk1NJyxcbiAgICB0aW1lU2VwYXJhdG9yOiAnOidcbiAgfTtcbn1cblxuY29uc3QgcmVnZXhKc29uTWlsbGlzZWNvbmRzID0gL1xcLlswLTldKyhafFxcK1swLTldezEsMn0oOlswLTldezEsMn0pPykkL2k7XG5cbmNvbnN0IGRhdGVGcm9tSnNvbiA9IChqc29uOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgZml4ZWQgPSBqc29uLnJlcGxhY2UocmVnZXhKc29uTWlsbGlzZWNvbmRzLCAnJDEnKTtcbiAgcmV0dXJuIG5ldyBEYXRlKGZpeGVkKTtcbn1cblxuY29uc3QgZGF0ZUZyb21UaW1lID0gKG1pbGxpc2Vjb25kczogbnVtYmVyKSA9PiB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBEYXRlKCk7XG4gIHJlc3VsdC5zZXRUaW1lKG1pbGxpc2Vjb25kcyk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmNvbnN0IHJlZ2V4VGltZVNwYW4gPSAvXigtKT8oKFswLTldKylcXC4pPyhbMC05XXsxLDJ9KTooWzAtOV17MSwyfSkoOihbMC05XXsxLDJ9KShcXC4oWzAtOV17MSwzfSkpPyk/JC87XG5cbmNvbnN0IG1vbnRoTGVuZ3RocyA9IFtcbiAgMzEsIC8vIGphblxuICBOYU4sIC8vIGZlYlxuICAzMSwgIC8vIG1hclxuICAzMCwgIC8vIGFwclxuICAzMSwgIC8vIG1heVxuICAzMCwgIC8vIGp1blxuICAzMSwgIC8vIGp1bFxuICAzMSwgIC8vIGF1Z1xuICAzMCwgIC8vIHNlcFxuICAzMSwgIC8vIG9rdFxuICAzMCwgIC8vIG5vdlxuICAzMSAgLy8gZGVjXG5dO1xuXG5jb25zdCBwb3cxMCA9IChuOiBudW1iZXIpID0+IHtcbiAgc3dpdGNoKG4pIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gMTA7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIDEwMDtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gMTAwMDtcbiAgICBkZWZhdWx0OlxuICAgICAgbGV0IHJlcyA9IDE7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICByZXMgKj0gMTA7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICB9XG59XG5cbmNvbnN0IHBhZDMgPSAobjogbnVtYmVyKSA9PiB7XG4gIGlmIChuIDwgMTApIHtcbiAgICByZXR1cm4gYDAwJHtufWA7XG4gIH1cbiAgaWYgKG4gPCAxMDApIHtcbiAgICByZXR1cm4gYDAke259YDtcbiAgfVxuICByZXR1cm4gU3RyaW5nKG4pO1xufVxuXG5jb25zdCBwYXJzZVRpbWVTdGFtcCA9IChpbnB1dDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IG0gPSByZWdleFRpbWVTcGFuLmV4ZWMoaW5wdXQpO1xuICBpZiAoIW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgdGltZXN0YW1wIHZhbHVlOiBcIiR7aW5wdXR9XCJgKTtcbiAgfVxuICBsZXQgbWlsbGlzZWNvbmRzID0gbVs5XSA/IHBhcnNlSW50KG1bOV0sIDEwKSAqIHBvdzEwKDMgLSBtWzldLmxlbmd0aCkgOiAwO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bN10sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bNV0sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bNF0sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luSG91cjtcbiAgbWlsbGlzZWNvbmRzICs9IChwYXJzZUludChtWzNdLCAxMCkgfHwgMCkgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkRheTtcbiAgaWYgKCctJyA9PT0gbVsxXSkge1xuICAgIG1pbGxpc2Vjb25kcyA9IC1taWxsaXNlY29uZHM7XG4gIH1cbiAgcmV0dXJuIG1pbGxpc2Vjb25kcztcbn1cblxuZXhwb3J0IGNsYXNzIFRpbWVTcGFuIGltcGxlbWVudHMgRXF1YXRhYmxlPFRpbWVTcGFuPiwgQ29tcGFyYWJsZTxUaW1lU3Bhbj4ge1xuICBzdGF0aWMgcmVhZG9ubHkgbWlsbGlzZWNvbmRzSW5TZWNvbmQgPSAxMDAwO1xuICBzdGF0aWMgcmVhZG9ubHkgbWlsbGlzZWNvbmRzSW5NaW51dGUgPSA2MDAwMDtcbiAgc3RhdGljIHJlYWRvbmx5IG1pbGxpc2Vjb25kc0luSG91ciA9IDM2MDAwMDA7XG4gIHN0YXRpYyByZWFkb25seSBtaWxsaXNlY29uZHNJbkRheSA9IDg2NDAwMDAwO1xuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlOiBudW1iZXJcbiAgZ2V0IG1pbGxpc2Vjb25kcygpIHsgcmV0dXJuIHRoaXMudmFsdWUgJSBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZDsgfVxuICBnZXQgc2Vjb25kcygpIHsgcmV0dXJuIE1hdGguZmxvb3IodGhpcy50b3RhbFNlY29uZHMpICUgNjA7IH1cbiAgZ2V0IG1pbnV0ZXMoKSB7IHJldHVybiBNYXRoLmZsb29yKHRoaXMudG90YWxNaW51dGVzKSAlIDYwOyB9XG4gIGdldCBob3VycygpIHsgcmV0dXJuIE1hdGguZmxvb3IodGhpcy50b3RhbEhvdXJzKSAlIDI0OyB9XG4gIGdldCBkYXlzKCkgeyByZXR1cm4gTWF0aC5mbG9vcih0aGlzLnRvdGFsRGF5cyk7IH1cbiAgZ2V0IHRvdGFsTWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gdGhpcy52YWx1ZTsgfVxuICBnZXQgdG90YWxTZWNvbmRzKCkgeyByZXR1cm4gdGhpcy52YWx1ZSAvIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kOyB9XG4gIGdldCB0b3RhbE1pbnV0ZXMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5NaW51dGU7IH1cbiAgZ2V0IHRvdGFsSG91cnMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyOyB9XG4gIGdldCB0b3RhbERheXMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXk7IH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aW1lc3BhbiBmb3IgdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgbWlsbGlzZWNvbmRzLlxuICAgKiBAcGFyYW0gbWlsbGlzZWNvbmRzIEFtb3VudCBvZiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtaWxsaXNlY29uZHM6IG51bWJlcik7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGltZXNwYW4gYnkgcGFyc2luZyBpdHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0gaW5wdXQgU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0aW1lc3Bhbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlucHV0OiBzdHJpbmcpO1xuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogbnVtYmVyfHN0cmluZykge1xuICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHNvdXJjZSkge1xuICAgICAgdGhpcy52YWx1ZSA9IHNvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52YWx1ZSA9IHBhcnNlVGltZVN0YW1wKHNvdXJjZSk7XG4gICAgfVxuICB9XG4gIGFicygpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKE1hdGguYWJzKHRoaXMudmFsdWUpKTtcbiAgfVxuICBhZGRNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKHRoaXMudmFsdWUgKyBtaWxsaXNlY29uZHMpO1xuICB9XG4gIGFkZFNlY29uZHMoc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHNlY29uZHMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZCk7XG4gIH1cbiAgYWRkTWludXRlcyhtaW51dGVzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMobWludXRlcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlKTtcbiAgfVxuICBhZGRIb3Vycyhob3VyczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKGhvdXJzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyKTtcbiAgfVxuICBhZGREYXlzKGRheXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhkYXlzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXkpO1xuICB9XG4gIGFkZCh2YWx1ZTogVGltZVNwYW58bnVtYmVyKSB7XG4gICAgY29uc3QgbWlsbGlzZWNvbmRzID0gdmFsdWUgaW5zdGFuY2VvZiBUaW1lU3BhbiA/IHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzIDogdmFsdWU7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKG1pbGxpc2Vjb25kcyk7XG4gIH1cbiAgbmVnKCkge1xuICAgIHJldHVybiBuZXcgVGltZVNwYW4oLTEgKiB0aGlzLnZhbHVlKTtcbiAgfVxuICBzdWJNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKHRoaXMudmFsdWUgLSBtaWxsaXNlY29uZHMpO1xuICB9XG4gIHN1YlNlY29uZHMoc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKHNlY29uZHMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZCk7XG4gIH1cbiAgc3ViTWludXRlcyhtaW51dGVzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJNaWxsaXNlY29uZHMobWludXRlcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlKTtcbiAgfVxuICBzdWJIb3Vycyhob3VyczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKGhvdXJzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyKTtcbiAgfVxuICBzdWJEYXlzKGRheXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnN1Yk1pbGxpc2Vjb25kcyhkYXlzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXkpO1xuICB9XG4gIHN1Yih2YWx1ZTogVGltZVNwYW58bnVtYmVyKSB7XG4gICAgY29uc3QgbWlsbGlzZWNvbmRzID0gdmFsdWUgaW5zdGFuY2VvZiBUaW1lU3BhbiA/IHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzIDogdmFsdWU7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKG1pbGxpc2Vjb25kcyk7XG4gIH1cblxuICBlcXVhbHNUbyhvdGhlcjogVGltZVNwYW4pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XG4gIH1cblxuICBjb21wYXJlVG8ob3RoZXI6IFRpbWVTcGFuKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWUgPiBvdGhlci52YWx1ZSA/IDEgOiAodGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWUgPyAwIDogLTEpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMudmFsdWUgPCAwKSB7XG4gICAgICByZXR1cm4gYC0ke3RoaXMuYWJzKCl9YDtcbiAgICB9XG4gICAgY29uc3QgZGF5cyA9IHRoaXMuZGF5cztcbiAgICBjb25zdCBob3VycyA9IHRoaXMuaG91cnM7XG4gICAgY29uc3QgbWludXRlcyA9IHRoaXMubWludXRlcztcbiAgICBjb25zdCBzZWNvbmRzID0gdGhpcy5zZWNvbmRzO1xuICAgIGNvbnN0IG1pbGxpc2Vjb25kcyA9IHRoaXMubWlsbGlzZWNvbmRzO1xuICAgIGlmIChkYXlzKSB7XG4gICAgICBpZiAoc2Vjb25kcyB8fCAhbWlsbGlzZWNvbmRzKSB7XG4gICAgICAgIHJldHVybiBgJHtkYXlzfS4ke2hvdXJzfS4ke21pbnV0ZXN9LiR7c2Vjb25kc31gO1xuICAgICAgfVxuICAgICAgaWYgKG1pbGxpc2Vjb25kcykge1xuICAgICAgICByZXR1cm4gYCR7ZGF5c30uJHtob3Vyc30uJHttaW51dGVzfS4ke3NlY29uZHN9LiR7cGFkMyhtaWxsaXNlY29uZHMpfWA7XG4gICAgICB9XG4gICAgICByZXR1cm4gYCR7ZGF5c30uJHtob3Vyc30uJHttaW51dGVzfWA7XG4gICAgfVxuICAgIGlmIChzZWNvbmRzIHx8ICFtaWxsaXNlY29uZHMpIHtcbiAgICAgIHJldHVybiBgJHtob3Vyc30uJHttaW51dGVzfS4ke3NlY29uZHN9YDtcbiAgICB9XG4gICAgaWYgKG1pbGxpc2Vjb25kcykge1xuICAgICAgcmV0dXJuIGAke2hvdXJzfS4ke21pbnV0ZXN9LiR7c2Vjb25kc30uJHtwYWQzKG1pbGxpc2Vjb25kcyl9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAke2hvdXJzfS4ke21pbnV0ZXN9YDtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERhdGVUaW1lSW5pdCB7XG4gIHllYXI/OiBudW1iZXI7XG4gIG1vbnRoPzogbnVtYmVyO1xuICBkYXk/OiBudW1iZXI7XG4gIGhvdXJzPzogbnVtYmVyO1xuICBtaW51dGVzPzogbnVtYmVyO1xuICBzZWNvbmRzPzogbnVtYmVyO1xuICBtaWxsaXNlY29uZHM/OiBudW1iZXI7XG59XG5cbmNvbnN0IHBhdHRlcm5zID0ge1xuICBkOiBTeW1ib2woJ2QnKSxcbiAgZGQ6IFN5bWJvbCgnZGQnKSxcbiAgZGRkOiBTeW1ib2woJ2RkZCcpLFxuICBkZGRkOiBTeW1ib2woJ2RkZGQnKSxcbiAgbTogU3ltYm9sKCdtJyksXG4gIG1tOiBTeW1ib2woJ21tJyksXG4gIG1tbTogU3ltYm9sKCdtbW0nKSxcbiAgbW1tbTogU3ltYm9sKCdtbW1tJyksXG4gIHl5OiBTeW1ib2woJ3l5JyksXG4gIHl5eXk6IFN5bWJvbCgneXl5eScpLFxuICBoOiBTeW1ib2woJ2gnKSxcbiAgaGg6IFN5bWJvbCgnaGgnKSxcbiAgSDogU3ltYm9sKCdIJyksXG4gIEhIOiBTeW1ib2woJ0hIJyksXG4gIE06IFN5bWJvbCgnTScpLFxuICBNTTogU3ltYm9sKCdNTScpLFxuICBzOiBTeW1ib2woJ3MnKSxcbiAgc3M6IFN5bWJvbCgnc3MnKSxcbiAgdHQ6IFN5bWJvbCgndHQnKSxcbiAgVFQ6IFN5bWJvbCgnVFQnKSxcbn07XG5cbmNvbnN0IHBhdHRlcm5LZXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgeDogW3N0cmluZywgU3ltYm9sXVtdID0gW107XG4gIE9iamVjdC5rZXlzKHBhdHRlcm5zKS5mb3JFYWNoKGsgPT4ge1xuICAgIHgucHVzaChbaywgPFN5bWJvbD4oPGFueT5wYXR0ZXJucylba11dKTtcbiAgfSk7XG4gIHguc29ydCgoW2sxLCBfXSwgW2syLCBfX10pID0+IGsxLmxlbmd0aCA9PT0gazIubGVuZ3RoID8gKGsxIDwgazIgPyAtMSA6IChrMSA9PT0gazIgPyAwIDogLTEpKSA6IGsxLmxlbmd0aCA8IGsyLmxlbmd0aCA/IDEgOiAtMSk7XG4gIHJldHVybiB4O1xufSgpKTtcblxudHlwZSBGb3JtYXRUb2tlbiA9IHN0cmluZ3xTeW1ib2w7XG5cbmZ1bmN0aW9uIHBhcnNlRm9ybWF0KHNvdXJjZTogc3RyaW5nLCBpbmRleDogbnVtYmVyLCB0b2tlbnM6IEZvcm1hdFRva2VuW10pOiBGb3JtYXRUb2tlbltdIHtcbiAgaWYgKGluZGV4ID49IHNvdXJjZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG4gIGlmICgnXFwnJyA9PT0gc291cmNlW2luZGV4XSkge1xuICAgIGNvbnN0IGNsb3NpbmcgPSBzb3VyY2UuaW5kZXhPZignXFwnJywgaW5kZXggKyAxKTtcbiAgICBpZiAoLTEgPT09IGNsb3NpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5jbG9zZWQgcXVvdGUnKTtcbiAgICB9XG4gICAgdG9rZW5zLnB1c2goc291cmNlLnN1YnN0cmluZyhpbmRleCArIDEsIGNsb3NpbmcpKTtcbiAgICByZXR1cm4gcGFyc2VGb3JtYXQoc291cmNlLCBjbG9zaW5nICsgMSwgdG9rZW5zKTtcbiAgfVxuICAvLyBjaGVjayBmb3JtYXRzXG4gIGZvciAoY29uc3QgW2ssIHNdIG9mIHBhdHRlcm5LZXlzKSB7XG4gICAgaWYgKGluZGV4ID09PSBzb3VyY2UuaW5kZXhPZihrLCBpbmRleCkpIHtcbiAgICAgIHRva2Vucy5wdXNoKHMpO1xuICAgICAgcmV0dXJuIHBhcnNlRm9ybWF0KHNvdXJjZSwgaW5kZXggKyBrLmxlbmd0aCwgdG9rZW5zKTtcbiAgICB9XG4gIH1cbiAgLy8gcGxhaW4gdGV4dFxuICBjb25zdCBsID0gdG9rZW5zLmxlbmd0aDtcbiAgaWYgKGwgJiYgJ3N0cmluZycgPT09IHR5cGVvZiB0b2tlbnNbbF0pIHtcbiAgICB0b2tlbnNbbF0gKz0gc291cmNlW2luZGV4XTtcbiAgfSBlbHNlIHtcbiAgICB0b2tlbnMucHVzaChzb3VyY2VbaW5kZXhdKTtcbiAgfVxuICByZXR1cm4gcGFyc2VGb3JtYXQoc291cmNlLCBpbmRleCArIDEsIHRva2Vucyk7XG59XG5cbmNvbnN0IGZvcm1hdENhY2hlOiB7IFtmbXQ6IHN0cmluZ106IEZvcm1hdFRva2VuW118dW5kZWZpbmVkIH0gPSB7fTtcblxuY29uc3QgcGFyc2VGb3JtYXRDYWNoZWQgPSAoc291cmNlOiBzdHJpbmcpOiBGb3JtYXRUb2tlbltdID0+IHtcbiAgbGV0IHRva2VucyA9IGZvcm1hdENhY2hlW3NvdXJjZV07XG4gIGlmICh0b2tlbnMpIHtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG4gIHRva2VucyA9IHBhcnNlRm9ybWF0KHNvdXJjZSwgMCwgW10pO1xuICBmb3JtYXRDYWNoZVtzb3VyY2VdID0gdG9rZW5zO1xuICByZXR1cm4gdG9rZW5zO1xufVxuXG5jb25zdCBwYWRaZXJvOiAoc291cmNlOiBzdHJpbmcsIG46IG51bWJlcikgPT4gc3RyaW5nID0gKGZ1bmN0aW9uICgpIHtcbiAgaWYgKCg8YW55PlN0cmluZy5wcm90b3R5cGUpLnBhZFN0YXJ0KSB7XG4gICAgY29uc3QgcGFkOiAobjogbnVtYmVyLCBwYWRTdHJpbmc6IHN0cmluZykgPT4gc3RyaW5nID0gKDxhbnk+U3RyaW5nLnByb3RvdHlwZSkucGFkU3RhcnQ7XG4gICAgcmV0dXJuIChzb3VyY2U6IHN0cmluZywgbjogbnVtYmVyKSA9PiBwYWQuY2FsbChzb3VyY2UsIG4sICcwJyk7XG4gIH1cbiAgcmV0dXJuIChzb3VyY2U6IHN0cmluZywgbjogbnVtYmVyKSA9PiB7XG4gICAgbGV0IHJlc3VsdCA9IHNvdXJjZTtcbiAgICB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IG4pIHtcbiAgICAgIHJlc3VsdCA9ICcwJyArIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn0oKSk7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShzb3VyY2U6IERhdGVUaW1lLCB0b2tlbnM6IEZvcm1hdFRva2VuW10sIGZvcm1hdDogRGF0ZVRpbWVGb3JtYXQpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gdG9rZW47XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5kID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UuZGF5KTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5kYXkpLCAyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkZCA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBmb3JtYXQuc2hvcnREYXlOYW1lc1tzb3VyY2UuZGF5T2ZXZWVrXTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkZGQgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gZm9ybWF0LmRheU5hbWVzW3NvdXJjZS5kYXlPZldlZWtdO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMubSA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLm1vbnRoKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLm1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5tb250aCksIDIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMubW1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IGZvcm1hdC5hYmJyZXZpYXRlZE1vbnRoTmFtZXNbc291cmNlLm1vbnRoIC0gMV07XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5tbW1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IGZvcm1hdC5tb250aE5hbWVzW3NvdXJjZS5tb250aCAtIDFdO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMueXkgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS55ZWFyICUgMTAwKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLnl5eXkgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS55ZWFyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmggPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS5ob3VycyAlIDEyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmhoID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5ob3VycyAlIDEyKSwgMik7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5IID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UuaG91cnMpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuSEggPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLmhvdXJzKSwgMik7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5NID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UubWludXRlcyk7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5NTSA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBwYWRaZXJvKFN0cmluZyhzb3VyY2UubWludXRlcyksIDIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMucyA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLnNlY29uZHMpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuc3MgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLnNlY29uZHMpLCAyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLnR0ID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHNvdXJjZS5ob3VycyA+IDExID8gJ3BtJzogJ2FtJztcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLlRUID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHNvdXJjZS5ob3VycyA+IDExID8gJ1BNJzogJ0FNJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZvdG1hdCB0b2tlbicpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5jb25zdCBmb3JtYXRDdXN0b20gPSAoc291cmNlOiBEYXRlVGltZSwgZm10OiBzdHJpbmcsIGZvcm1hdDogRGF0ZVRpbWVGb3JtYXQpOiBzdHJpbmcgPT4ge1xuICBjb25zdCB0b2tlbnMgPSBwYXJzZUZvcm1hdENhY2hlZChmbXQpO1xuICByZXR1cm4gc3RyaW5naWZ5KHNvdXJjZSwgdG9rZW5zLCBmb3JtYXQpO1xufTtcblxuY29uc3QgZm9ybWF0U3RhbmRhcmQgPSAoc291cmNlOiBEYXRlVGltZSwgZm10OiAnZCd8J0QnfCdmJ3wnRid8J2cnfCdHJywgZm9ybWF0OiBEYXRlVGltZUZvcm1hdCkgPT4ge1xuICBzd2l0Y2goZm10KSB7XG4gICAgY2FzZSAnZCc6XG4gICAgICByZXR1cm4gZm9ybWF0Q3VzdG9tKHNvdXJjZSwgZm9ybWF0LnNob3J0RGF0ZVBhdHRlcm4sIGZvcm1hdCk7XG4gICAgY2FzZSAnRCc6XG4gICAgICByZXR1cm4gZm9ybWF0Q3VzdG9tKHNvdXJjZSwgZm9ybWF0LmxvbmdEYXRlUGF0dGVybiwgZm9ybWF0KTtcbiAgICBjYXNlICdmJzpcbiAgICBjYXNlICdGJzpcbiAgICAgIHJldHVybiBmb3JtYXRDdXN0b20oc291cmNlLCBmb3JtYXQuZnVsbERhdGVUaW1lUGF0dGVybiwgZm9ybWF0KTtcbiAgICBjYXNlICdnJzpcbiAgICAgIHJldHVybiBmb3JtYXRDdXN0b20oc291cmNlLCBmb3JtYXQuc2hvcnREYXRlUGF0dGVybiArICcgJyArIGZvcm1hdC5zaG9ydFRpbWVQYXR0ZXJuLCBmb3JtYXQpO1xuICAgIGNhc2UgJ0cnOlxuICAgICAgcmV0dXJuIGZvcm1hdEN1c3RvbShzb3VyY2UsIGZvcm1hdC5zaG9ydERhdGVQYXR0ZXJuICsgJyAnICsgZm9ybWF0LmxvbmdUaW1lUGF0dGVybiwgZm9ybWF0KTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3Nob3VsZCBuZXZlciBoYXBwZW4nKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBEYXRlVGltZSBpbXBsZW1lbnRzIEVxdWF0YWJsZTxEYXRlVGltZT4sIENvbXBhcmFibGU8RGF0ZVRpbWU+IHtcblxuICBzdGF0aWMgZGVmYXVsdEZvcm1hdFByb3ZpZGVyID0gRm9ybWF0cy5odTtcbiAgc3RhdGljIGRlZmF1bHRGb3JtYXQgPSAnZyc7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW1vdW50IG9mIGRheXMgaW4gdGhlIHNwZWNpZmllZCBtb250aC5cbiAgICogQHBhcmFtIG1vbnRoIE1vbnRoLlxuICAgKiBAcGFyYW0geWVhciBZZWFyLlxuICAgKi9cbiAgc3RhdGljIGdldE1vbnRoTGVuZ3RoKG1vbnRoOiBudW1iZXIsIHllYXI6IG51bWJlcikge1xuICAgIGlmIChtb250aCA8IDEgfHwgbW9udGggPiAxMikge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignbW9udGggb3V0IG9mIHJhbmdlJyk7XG4gICAgfVxuICAgIGlmIChtb250aCAhPT0gMikge1xuICAgICAgICByZXR1cm4gbW9udGhMZW5ndGhzW21vbnRoIC0gMV07XG4gICAgfVxuICAgIHJldHVybiAoMCA9PT0geWVhciAlIDQgJiYgKDAgIT09IHllYXIgJSAxMDAgfHwgMCA9PT0geWVhciAlIDQwMCkpID8gMjkgOiAyODtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZG9ubHkgc291cmNlOiBEYXRlXG4gIGdldCBpc1ZhbGlkKCkgeyByZXR1cm4gIWlzTmFOKHRoaXMuc291cmNlLmdldFRpbWUoKSk7IH1cbiAgZ2V0IHllYXIoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRGdWxsWWVhcigpOyB9XG4gIGdldCBtb250aCgpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldE1vbnRoKCkgKyAxOyB9XG4gIGdldCBkYXkoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXREYXRlKCk7IH1cbiAgZ2V0IGRheU9mV2VlaygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldERheSgpOyB9XG4gIGdldCBob3VycygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldEhvdXJzKCk7IH1cbiAgZ2V0IG1pbnV0ZXMoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRNaW51dGVzKCk7IH1cbiAgZ2V0IHNlY29uZHMoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRTZWNvbmRzKCk7IH1cbiAgZ2V0IG1pbGxpc2Vjb25kcygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldE1pbGxpc2Vjb25kcygpOyB9XG5cbiAgLyoqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIGRhdGV0aW1lIGZvciBhY3R1YWwgZGF0ZSBhbmQgdGltZS4gKi9cbiAgY29uc3RydWN0b3IoKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgZGF0ZXRpbWUgZnJvbSB0aGUgc3BlY2lmaWVkIGRhdGUuXG4gICAqIEBwYXJhbSBzb3VyY2UgRGF0ZSBvYmplY3QgdG8gdXNlLlxuICAgKi9cbiAgY29uc3RydWN0b3Ioc291cmNlOiBEYXRlKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgZGF0ZXRpbWUgZnJvbSB0aGUgc3BlY2lmaWVkIEpTT04gc3RyaW5nIHJlcHJlc2VudGluZyBkYXRlLlxuICAgKiBAcGFyYW0ganNvbiBKU09OIHN0cmluZyByZXByZXNlbnRpbmcgZGF0ZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGpzb246IHN0cmluZyk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIGRhdGV0aW1lIGZyb20gdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgbWlsbGlzZWNvbmRzIGZyb20gMTk3MCBqYW4gMSBVVEMuXG4gICAqIEBwYXJhbSBzb3VyY2UgQW1vdW50IG9mIG1pbGxpc2Vjb25kcyBmcm9tIDE5NzAgamFuIDEgVVRDLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWlsbGlzZWNvbmRzOiBudW1iZXIpO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBkYXRldGltZSBmcm9tIHRoZSBzcGVjaWZpZWQgaW5pdGlhbGl6ZXIuXG4gICAqIEBwYXJhbSBzb3VyY2UgSW5pdGlhbGl6ZXIgb2JqZWN0IHRvIHVzZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGluaXQ6IERhdGVUaW1lSW5pdCk7XG5cbiAgY29uc3RydWN0b3IgKHNvdXJjZT86IERhdGV8c3RyaW5nfG51bWJlcnxEYXRlVGltZUluaXQpIHtcbiAgICBpZiAodW5kZWZpbmVkID09PSBzb3VyY2UgfHwgbnVsbCA9PT0gc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IG5ldyBEYXRlKCk7XG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNvdXJjZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBkYXRlRnJvbUpzb24oc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKCdudW1iZXInID09PSB0eXBlb2Ygc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IGRhdGVGcm9tVGltZShzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGFzc3VtZSBpbml0XG4gICAgICBjb25zdCBpbml0ID0gPERhdGVUaW1lSW5pdD5zb3VyY2U7XG4gICAgICB0aGlzLnNvdXJjZSA9IG5ldyBEYXRlKGluaXQueWVhciB8fCBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCksIGluaXQubW9udGggPyBpbml0Lm1vbnRoIC0gMSA6IDAsIGluaXQuZGF5IHx8IDEsIGluaXQuaG91cnMgfHwgMCwgaW5pdC5taW51dGVzIHx8IDAsIGluaXQuc2Vjb25kcyB8fCAwLCBpbml0Lm1pbGxpc2Vjb25kcyB8fCAwKTtcbiAgICB9XG4gIH1cblxuICBlcXVhbHNUbyhvdGhlcjogRGF0ZVRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UuZ2V0VGltZSgpID09PSBvdGhlci5zb3VyY2UuZ2V0VGltZSgpO1xuICB9XG5cbiAgY29tcGFyZVRvKG90aGVyOiBEYXRlVGltZSkge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZSA8IG90aGVyLnNvdXJjZSA/IC0xIDogKHRoaXMuZXF1YWxzVG8ob3RoZXIpID8gMCA6IDEpO1xuICB9XG5cbiAgYWRkTWlsbGlzZWNvbmRzKG1pbGxpc2Vjb25kczogbnVtYmVyKSB7XG4gICAgY29uc3QgcmVzID0gZGF0ZUZyb21UaW1lKHRoaXMuc291cmNlLmdldFRpbWUoKSArIG1pbGxpc2Vjb25kcyk7XG4gICAgY29uc3Qgb2Zmc2V0RGVsdGEgPSB0aGlzLnNvdXJjZS5nZXRUaW1lem9uZU9mZnNldCgpIC0gcmVzLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgaWYgKG9mZnNldERlbHRhICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IGFkanVzdCA9IG9mZnNldERlbHRhICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5NaW51dGU7XG4gICAgICAgIHJlcy5zZXRUaW1lKHJlcy5nZXRUaW1lKCkgLSBhZGp1c3QpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGVUaW1lKHJlcyk7XG4gIH1cblxuICBhZGRTZWNvbmRzKHNlY29uZHM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhzZWNvbmRzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5TZWNvbmQpO1xuICB9XG5cbiAgYWRkTWludXRlcyhtaW51dGVzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMobWludXRlcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlKTtcbiAgfVxuXG4gIGFkZEhvdXJzKGhvdXJzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMoaG91cnMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkhvdXIpO1xuICB9XG5cbiAgYWRkRGF5cyhkYXlzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMoZGF5cyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luRGF5KTtcbiAgfVxuXG4gIGFkZE1vbnRocyhtb250aHM6IG51bWJlcikge1xuICAgIGlmICgwID09PSBtb250aHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkRGF5cygwKTtcbiAgICB9XG4gICAgaWYgKDAgPCBtb250aHMpIHtcbiAgICAgIGNvbnN0IGZ1bGwgPSBNYXRoLmZsb29yKG1vbnRocykgKyAodGhpcy5tb250aCAtIDEpO1xuICAgICAgY29uc3QgZm0gPSBmdWxsICUgMTI7XG4gICAgICBjb25zdCBmeSA9IE1hdGguZmxvb3IoZnVsbCAvIDEyKTtcbiAgICAgIGxldCByZXMgPSBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICB5ZWFyOiB0aGlzLnllYXIgKyBmeSxcbiAgICAgICAgbW9udGg6IGZtICsgMSxcbiAgICAgICAgZGF5OiBNYXRoLm1pbihEYXRlVGltZS5nZXRNb250aExlbmd0aChmbSArIDEsIHRoaXMueWVhciArIGZ5KSwgdGhpcy5kYXkpLFxuICAgICAgICBob3VyczogdGhpcy5ob3VycyxcbiAgICAgICAgbWludXRlczogdGhpcy5taW51dGVzLFxuICAgICAgICBzZWNvbmRzOiB0aGlzLnNlY29uZHMsXG4gICAgICAgIG1pbGxpc2Vjb25kczogdGhpcy5taWxsaXNlY29uZHNcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcGFydCA9IG1vbnRocyAlIDE7XG4gICAgICBpZiAoMCA9PT0gcGFydCkge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcy5hZGREYXlzKERhdGVUaW1lLmdldE1vbnRoTGVuZ3RoKHJlcy5tb250aCwgcmVzLnllYXIpICogcGFydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFicyA9IE1hdGguYWJzKG1vbnRocyk7XG4gICAgICBsZXQgbSA9ICh0aGlzLm1vbnRoIC0gMSkgLSBNYXRoLmZsb29yKGFicyk7XG4gICAgICBsZXQgeSA9IHRoaXMueWVhcjtcbiAgICAgIHdoaWxlICgwID4gbSkge1xuICAgICAgICB5ID0geSAtIDE7XG4gICAgICAgIG0gPSBtICsgMTI7XG4gICAgICB9XG4gICAgICBjb25zdCBwYXJ0ID0gYWJzICUgMTtcbiAgICAgIGlmICgwID09PSBwYXJ0KSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICAgIHllYXI6IHksXG4gICAgICAgICAgbW9udGg6IG0gKyAxLFxuICAgICAgICAgIGRheTogdGhpcy5kYXksXG4gICAgICAgICAgaG91cnM6IHRoaXMuaG91cnMsXG4gICAgICAgICAgbWludXRlczogdGhpcy5taW51dGVzLFxuICAgICAgICAgIHNlY29uZHM6IHRoaXMuc2Vjb25kcyxcbiAgICAgICAgICBtaWxsaXNlY29uZHM6IHRoaXMubWlsbGlzZWNvbmRzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKDAgPT09IG0pIHtcbiAgICAgICAgICB5ID0geSAtIDE7XG4gICAgICAgICAgbSA9IDExO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtID0gbSAtIDE7XG4gICAgICB9XG4gICAgICBjb25zdCBkYXlzID0gRGF0ZVRpbWUuZ2V0TW9udGhMZW5ndGgobSArIDEsIHkpO1xuICAgICAgY29uc3QgdG9BZGQgPSBkYXlzICogKDEgLSBwYXJ0KTtcbiAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICB5ZWFyOiB5LFxuICAgICAgICBtb250aDogbSxcbiAgICAgICAgZGF5OiB0aGlzLmRheSxcbiAgICAgICAgaG91cnM6IHRoaXMuaG91cnMsXG4gICAgICAgIG1pbnV0ZXM6IHRoaXMubWludXRlcyxcbiAgICAgICAgc2Vjb25kczogdGhpcy5zZWNvbmRzLFxuICAgICAgICBtaWxsaXNlY29uZHM6IHRoaXMubWlsbGlzZWNvbmRzXG4gICAgICB9KS5hZGREYXlzKHRvQWRkKTtcbiAgICB9XG4gIH1cbiAgYWRkKHRpbWVTcGFuOiBUaW1lU3Bhbik6IERhdGVUaW1lO1xuICBhZGQobWlsbGlzZWNvbmRzOiBudW1iZXIpOiBEYXRlVGltZTtcbiAgYWRkKHZhbHVlOiBUaW1lU3BhbnxudW1iZXIpIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lU3Bhbikge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHZhbHVlKTtcbiAgfVxuICBzdWJzdHJhY3Qob3RoZXI6IERhdGVUaW1lKTogVGltZVNwYW47XG4gIHN1YnN0cmFjdCh0aW1lc3BhbjogVGltZVNwYW4pOiBEYXRlVGltZTtcbiAgc3Vic3RyYWN0KG1pbGxpc2Vjb25kczogbnVtYmVyKTogRGF0ZVRpbWU7XG4gIHN1YnN0cmFjdCh2YWx1ZTogRGF0ZVRpbWV8VGltZVNwYW58bnVtYmVyKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZVRpbWUpIHtcbiAgICAgIHJldHVybiBuZXcgVGltZVNwYW4odGhpcy5zb3VyY2UuZ2V0VGltZSgpIC0gdmFsdWUuc291cmNlLmdldFRpbWUoKSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVTcGFuKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGQoLTEgKiB2YWx1ZS50b3RhbE1pbGxpc2Vjb25kcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFkZCgtMSAqIHZhbHVlKTtcbiAgfVxuICB0b0RhdGUoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IERhdGUoKTtcbiAgICByZXN1bHQuc2V0VGltZSh0aGlzLnNvdXJjZS5nZXRUaW1lKCkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcHJpdmF0ZSBmb3JtYXQoZm9ybWF0OiBzdHJpbmcsIHByb3ZpZGVyOiBEYXRlVGltZUZvcm1hdCk6IHN0cmluZyB7XG4gICAgaWYgKCdkJyA9PT0gZm9ybWF0IHx8ICdEJyA9PT0gZm9ybWF0IHx8ICdmJyA9PT0gZm9ybWF0IHx8ICdGJyA9PT0gZm9ybWF0IHx8ICdnJyA9PT0gZm9ybWF0IHx8ICdHJyA9PT0gZm9ybWF0KSB7XG4gICAgICByZXR1cm4gZm9ybWF0U3RhbmRhcmQodGhpcywgZm9ybWF0LCBwcm92aWRlcik7XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXRDdXN0b20odGhpcywgZm9ybWF0LCBwcm92aWRlcik7XG4gIH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXQ6IHN0cmluZyk6IHN0cmluZztcbiAgdG9TdHJpbmcocHJvdmlkZXI6IERhdGVUaW1lRm9ybWF0KTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXQ6IHN0cmluZywgcHJvdmlkZXI6IERhdGVUaW1lRm9ybWF0KTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXRPclByb3ZpZGVyPzogc3RyaW5nfERhdGVUaW1lRm9ybWF0LCBwcm92aWRlcj86IERhdGVUaW1lRm9ybWF0KSB7XG4gICAgaWYgKCFwcm92aWRlcikge1xuICAgICAgaWYgKCFmb3JtYXRPclByb3ZpZGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdChEYXRlVGltZS5kZWZhdWx0Rm9ybWF0LCBEYXRlVGltZS5kZWZhdWx0Rm9ybWF0UHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGZvcm1hdE9yUHJvdmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0KGZvcm1hdE9yUHJvdmlkZXIsIERhdGVUaW1lLmRlZmF1bHRGb3JtYXRQcm92aWRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQoRGF0ZVRpbWUuZGVmYXVsdEZvcm1hdCwgZm9ybWF0T3JQcm92aWRlcik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGZvcm1hdE9yUHJvdmlkZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmb3JtYXQgYXJndW1lbnQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0KGZvcm1hdE9yUHJvdmlkZXIsIHByb3ZpZGVyKTtcbiAgfVxufSJdfQ==