export var Formats;
(function (Formats) {
    Formats.hu = {
        abbreviatedMonthNames: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szept', 'Okt', 'Nov', 'Dec'],
        dayNames: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
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
    Object.keys(patterns).forEach((k) => {
        x.push([k, patterns[k]]);
    });
    // tslint:disable-next-line:max-line-length
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXRpbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGF0ZXRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJBLE1BQU0sS0FBVyxPQUFPLENBNkd2QjtBQTdHRCxXQUFpQixPQUFPO0lBQ1QsVUFBRSxHQUFvQjtRQUNqQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQzdHLFFBQVEsRUFBRSxDQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQztRQUNwRixVQUFVLEVBQUU7WUFDVixRQUFRO1lBQ1IsU0FBUztZQUNULFNBQVM7WUFDVCxTQUFTO1lBQ1QsT0FBTztZQUNQLFFBQVE7WUFDUixRQUFRO1lBQ1IsV0FBVztZQUNYLFlBQVk7WUFDWixTQUFTO1lBQ1QsVUFBVTtZQUNWLFVBQVU7U0FBQztRQUNiLFlBQVksRUFBRSxFQUFFO1FBQ2hCLGNBQWMsRUFBRSxDQUFDO1FBQ2pCLG1CQUFtQixFQUFFLHlCQUF5QjtRQUM5QyxlQUFlLEVBQUUsZ0JBQWdCO1FBQ2pDLGVBQWUsRUFBRSxVQUFVO1FBQzNCLGdCQUFnQixFQUFFLGFBQWE7UUFDL0IsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO1FBQ3JELGdCQUFnQixFQUFFLE9BQU87UUFDekIsYUFBYSxFQUFFLEdBQUc7S0FDbkIsQ0FBQztJQUVXLFlBQUksR0FBb0I7UUFDbkMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUM1RyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUM7UUFDeEYsVUFBVSxFQUFFO1lBQ1YsU0FBUztZQUNULFVBQVU7WUFDVixPQUFPO1lBQ1AsT0FBTztZQUNQLEtBQUs7WUFDTCxNQUFNO1lBQ04sTUFBTTtZQUNOLFFBQVE7WUFDUixXQUFXO1lBQ1gsU0FBUztZQUNULFVBQVU7WUFDVixVQUFVO1NBQUM7UUFDYixZQUFZLEVBQUUsSUFBSTtRQUNsQixjQUFjLEVBQUUsQ0FBQztRQUNqQixtQkFBbUIsRUFBRSx1QkFBdUI7UUFDNUMsZUFBZSxFQUFFLGNBQWM7UUFDL0IsZUFBZSxFQUFFLFVBQVU7UUFDM0IsZ0JBQWdCLEVBQUUsWUFBWTtRQUM5QixhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7UUFDbEQsZ0JBQWdCLEVBQUUsT0FBTztRQUN6QixhQUFhLEVBQUUsR0FBRztLQUNuQixDQUFDO0lBRVcsWUFBSSxHQUFvQjtRQUNuQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQzVHLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQztRQUN4RixVQUFVLEVBQUU7WUFDVixTQUFTO1lBQ1QsVUFBVTtZQUNWLE9BQU87WUFDUCxPQUFPO1lBQ1AsS0FBSztZQUNMLE1BQU07WUFDTixNQUFNO1lBQ04sUUFBUTtZQUNSLFdBQVc7WUFDWCxTQUFTO1lBQ1QsVUFBVTtZQUNWLFVBQVU7U0FBQztRQUNiLFlBQVksRUFBRSxJQUFJO1FBQ2xCLGNBQWMsRUFBRSxDQUFDO1FBQ2pCLG1CQUFtQixFQUFFLCtCQUErQjtRQUNwRCxlQUFlLEVBQUUsb0JBQW9CO1FBQ3JDLGVBQWUsRUFBRSxZQUFZO1FBQzdCLGdCQUFnQixFQUFFLFVBQVU7UUFDNUIsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQ2xELGdCQUFnQixFQUFFLFNBQVM7UUFDM0IsYUFBYSxFQUFFLEdBQUc7S0FDbkIsQ0FBQztJQUVXLFVBQUUsR0FBb0I7UUFDakMsMkNBQTJDO1FBQzNDLHFCQUFxQixFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUM7UUFDekgsUUFBUSxFQUFFLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQzVGLFVBQVUsRUFBRTtZQUNWLFFBQVE7WUFDUixTQUFTO1lBQ1QsTUFBTTtZQUNOLFFBQVE7WUFDUixLQUFLO1lBQ0wsTUFBTTtZQUNOLE1BQU07WUFDTixRQUFRO1lBQ1IsVUFBVTtZQUNWLFNBQVM7WUFDVCxRQUFRO1lBQ1IsU0FBUztTQUFDO1FBQ1osWUFBWSxFQUFFLEVBQUU7UUFDaEIsY0FBYyxFQUFFLENBQUM7UUFDakIsbUJBQW1CLEVBQUUsNEJBQTRCO1FBQ2pELGVBQWUsRUFBRSxvQkFBb0I7UUFDckMsZUFBZSxFQUFFLFNBQVM7UUFDMUIsZ0JBQWdCLEVBQUUsWUFBWTtRQUM5QixhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7UUFDbEQsZ0JBQWdCLEVBQUUsTUFBTTtRQUN4QixhQUFhLEVBQUUsR0FBRztLQUNuQixDQUFDO0FBQ0osQ0FBQyxFQTdHZ0IsT0FBTyxLQUFQLE9BQU8sUUE2R3ZCO0FBRUQsTUFBTSxxQkFBcUIsR0FBRywwQ0FBMEMsQ0FBQztBQUV6RSxNQUFNLFlBQVksR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFO0lBQ3BDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEQsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUM7QUFFRixNQUFNLFlBQVksR0FBRyxDQUFDLFlBQW9CLEVBQUUsRUFBRTtJQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0IsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxhQUFhLEdBQUcsK0VBQStFLENBQUM7QUFFdEcsTUFBTSxZQUFZLEdBQUc7SUFDbkIsRUFBRTtJQUNGLEdBQUc7SUFDSCxFQUFFO0lBQ0YsRUFBRTtJQUNGLEVBQUU7SUFDRixFQUFFO0lBQ0YsRUFBRTtJQUNGLEVBQUU7SUFDRixFQUFFO0lBQ0YsRUFBRTtJQUNGLEVBQUU7SUFDRixFQUFFLENBQUUsTUFBTTtDQUNYLENBQUM7QUFFRixNQUFNLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO0lBQzFCLFFBQVEsQ0FBQyxFQUFFO1FBQ1QsS0FBSyxDQUFDO1lBQ0osT0FBTyxDQUFDLENBQUM7UUFDWCxLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQztRQUNaLEtBQUssQ0FBQztZQUNKLE9BQU8sR0FBRyxDQUFDO1FBQ2IsS0FBSyxDQUFDO1lBQ0osT0FBTyxJQUFJLENBQUM7UUFDZDtZQUNFLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQzFCLEdBQUcsSUFBSSxFQUFFLENBQUM7YUFDWDtZQUNELE9BQU8sR0FBRyxDQUFDO0tBQ2Q7QUFDSCxDQUFDLENBQUM7QUFFRixNQUFNLElBQUksR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO0lBQ3pCLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNWLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztLQUNqQjtJQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRTtRQUNYLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztLQUNoQjtJQUNELE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLENBQUMsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDdkMsTUFBTSxDQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUN4RDtJQUNELElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFFLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDO0lBQzFFLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDO0lBQzFFLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDO0lBQ3hFLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDO0lBQ3ZFLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNoQixZQUFZLEdBQUcsQ0FBQyxZQUFZLENBQUM7S0FDOUI7SUFDRCxPQUFPLFlBQVksQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFRixNQUFNLE9BQU8sUUFBUTtJQTZCbkIsWUFBWSxNQUFxQjtRQUMvQixJQUFJLFFBQVEsS0FBSyxPQUFPLE1BQU0sRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztTQUNyQjthQUFNO1lBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckM7SUFDSCxDQUFDO0lBN0JELElBQUksWUFBWSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLElBQUksT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1RCxJQUFJLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUQsSUFBSSxLQUFLLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hELElBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELElBQUksaUJBQWlCLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM5QyxJQUFJLFlBQVksS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztJQUN6RSxJQUFJLFlBQVksS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztJQUN6RSxJQUFJLFVBQVUsS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztJQUNyRSxJQUFJLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztJQXFCbkUsR0FBRztRQUNELE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsZUFBZSxDQUFDLFlBQW9CO1FBQ2xDLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBQ0QsVUFBVSxDQUFDLE9BQWU7UUFDeEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ0QsVUFBVSxDQUFDLE9BQWU7UUFDeEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ0QsUUFBUSxDQUFDLEtBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsT0FBTyxDQUFDLElBQVk7UUFDbEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQ0QsR0FBRyxDQUFDLEtBQXNCO1FBQ3hCLE1BQU0sWUFBWSxHQUFHLEtBQUssWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2pGLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsR0FBRztRQUNELE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxlQUFlLENBQUMsWUFBb0I7UUFDbEMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFDRCxVQUFVLENBQUMsT0FBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDRCxVQUFVLENBQUMsT0FBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDRCxRQUFRLENBQUMsS0FBYTtRQUNwQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFDRCxPQUFPLENBQUMsSUFBWTtRQUNsQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFDRCxHQUFHLENBQUMsS0FBc0I7UUFDeEIsTUFBTSxZQUFZLEdBQUcsS0FBSyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDakYsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBZTtRQUN0QixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQztJQUNwQyxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWU7UUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDbEIsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO1NBQ3pCO1FBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDN0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM3QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ3ZDLElBQUksSUFBSSxFQUFFO1lBQ1IsSUFBSSxPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQzVCLE9BQU8sR0FBRyxJQUFJLElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxPQUFPLEVBQUUsQ0FBQzthQUNqRDtZQUNELElBQUksWUFBWSxFQUFFO2dCQUNoQixPQUFPLEdBQUcsSUFBSSxJQUFJLEtBQUssSUFBSSxPQUFPLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO2FBQ3ZFO1lBQ0QsT0FBTyxHQUFHLElBQUksSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFLENBQUM7U0FDdEM7UUFDRCxJQUFJLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRTtZQUM1QixPQUFPLEdBQUcsS0FBSyxJQUFJLE9BQU8sSUFBSSxPQUFPLEVBQUUsQ0FBQztTQUN6QztRQUNELElBQUksWUFBWSxFQUFFO1lBQ2hCLE9BQU8sR0FBRyxLQUFLLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztTQUMvRDtRQUNELE9BQU8sR0FBRyxLQUFLLElBQUksT0FBTyxFQUFFLENBQUM7SUFDL0IsQ0FBQzs7QUFqSGUsNkJBQW9CLEdBQUcsSUFBSSxDQUFDO0FBQzVCLDZCQUFvQixHQUFHLEtBQUssQ0FBQztBQUM3QiwyQkFBa0IsR0FBRyxPQUFPLENBQUM7QUFDN0IsMEJBQWlCLEdBQUcsUUFBUSxDQUFDO0FBMkgvQyxNQUFNLFFBQVEsR0FBRztJQUNmLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2QsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDbEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDcEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZCxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNsQixJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNwQixFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNwQixDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNkLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2QsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZCxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNkLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDO0NBQ2pCLENBQUM7QUFFRixNQUFNLFdBQVcsR0FBRyxDQUFDO0lBQ25CLE1BQU0sQ0FBQyxHQUE0QixFQUFFLENBQUM7SUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNsQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFrQixRQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsMkNBQTJDO0lBQzNDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoSSxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUMsRUFBRSxDQUFDLENBQUM7QUFJTCxTQUFTLFdBQVcsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLE1BQXFCO0lBQ3ZFLElBQUksS0FBSyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDMUIsT0FBTyxNQUFNLENBQUM7S0FDZjtJQUNELElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxQixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNsRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNqRDtJQUNELGdCQUFnQjtJQUNoQixLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksV0FBVyxFQUFFO1FBQ2hDLElBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdEQ7S0FDRjtJQUNELGFBQWE7SUFDYixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksQ0FBQyxJQUFJLFFBQVEsS0FBSyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzVCO1NBQU07UUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzVCO0lBQ0QsT0FBTyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUVELE1BQU0sV0FBVyxHQUErQyxFQUFFLENBQUM7QUFFbkUsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE1BQWMsRUFBaUIsRUFBRTtJQUMxRCxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsSUFBSSxNQUFNLEVBQUU7UUFDVixPQUFPLE1BQU0sQ0FBQztLQUNmO0lBQ0QsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDN0IsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBQTBDLENBQUM7SUFDdEQsSUFBVyxNQUFNLENBQUMsU0FBVSxDQUFDLFFBQVEsRUFBRTtRQUNyQyxNQUFNLEdBQUcsR0FBb0QsTUFBTSxDQUFDLFNBQVUsQ0FBQyxRQUFRLENBQUM7UUFDeEYsT0FBTyxDQUFDLE1BQWMsRUFBRSxDQUFTLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNoRTtJQUNELE9BQU8sQ0FBQyxNQUFjLEVBQUUsQ0FBUyxFQUFFLEVBQUU7UUFDbkMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3BCLE9BQU8sTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDeEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7U0FDdkI7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDLENBQUM7QUFDSixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRUwsU0FBUyxTQUFTLENBQUMsTUFBZ0IsRUFBRSxNQUFxQixFQUFFLE1BQXNCO0lBQ2hGLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtRQUMxQixJQUFJLFFBQVEsS0FBSyxPQUFPLEtBQUssRUFBRTtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDO1NBQ2pCO2FBQU0sSUFBSSxRQUFRLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRTtZQUMvQixNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM5QjthQUFNLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxLQUFLLEVBQUU7WUFDaEMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzFDO2FBQU0sSUFBSSxRQUFRLENBQUMsR0FBRyxLQUFLLEtBQUssRUFBRTtZQUNqQyxNQUFNLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbEQ7YUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM3QzthQUFNLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7WUFDL0IsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM1QzthQUFNLElBQUksUUFBUSxDQUFDLEdBQUcsS0FBSyxLQUFLLEVBQUU7WUFDakMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzFEO2FBQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtZQUNsQyxNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQy9DO2FBQU0sSUFBSSxRQUFRLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRTtZQUNoQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDckM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQy9CO2FBQU0sSUFBSSxRQUFRLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRTtZQUMvQixNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDckM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDakQ7YUFBTSxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO2FBQU0sSUFBSSxRQUFRLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRTtZQUNoQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDNUM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xDO2FBQU0sSUFBSSxRQUFRLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRTtZQUNoQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDOUM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xDO2FBQU0sSUFBSSxRQUFRLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRTtZQUNoQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDOUM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDM0M7YUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDM0M7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6QztL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aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzthQUM5RDtTQUNGO1FBQ0QsSUFBSSxRQUFRLEtBQUssT0FBTyxnQkFBZ0IsRUFBRTtZQUN4QyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7U0FDNUM7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakQsQ0FBQzs7QUEvTk0sOEJBQXFCLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUNuQyxzQkFBYSxHQUFHLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVxdWF0YWJsZSwgQ29tcGFyYWJsZSB9IGZyb20gJy4vY29udHJhY3QnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERhdGVUaW1lRm9ybWF0IHtcbiAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBzdHJpbmdbXTtcbiAgZGF5TmFtZXM6IHN0cmluZ1tdO1xuICBtb250aE5hbWVzOiBzdHJpbmdbXTtcbiAgQU1EZXNpZ25hdG9yOiBzdHJpbmc7XG4gIGZpcnN0RGF5T2ZXZWVrOiBudW1iZXI7XG4gIGZ1bGxEYXRlVGltZVBhdHRlcm46IHN0cmluZztcbiAgbG9uZ0RhdGVQYXR0ZXJuOiBzdHJpbmc7XG4gIGxvbmdUaW1lUGF0dGVybjogc3RyaW5nO1xuICBzaG9ydERhdGVQYXR0ZXJuOiBzdHJpbmc7XG4gIHNob3J0RGF5TmFtZXM6IHN0cmluZ1tdO1xuICBzaG9ydFRpbWVQYXR0ZXJuOiBzdHJpbmc7XG4gIHRpbWVTZXBhcmF0b3I6IHN0cmluZztcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBGb3JtYXRzIHtcbiAgZXhwb3J0IGNvbnN0IGh1ID0gPERhdGVUaW1lRm9ybWF0PiB7XG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ0phbicsICdGZWInLCAnTcOhcicsICfDgXByJywgJ03DoWonLCAnSsO6bicsICdKw7psJywgJ0F1ZycsICdTemVwdCcsICdPa3QnLCAnTm92JywgJ0RlYyddLFxuICAgIGRheU5hbWVzOiBbICdWYXPDoXJuYXAnLCAnSMOpdGbFkScsICdLZWRkJywgJ1N6ZXJkYScsICdDc8O8dMO2cnTDtmsnLCAnUMOpbnRlaycsICdTem9tYmF0J10sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ0phbnXDoXInLFxuICAgICAgJ0ZlYnJ1w6FyJyxcbiAgICAgICdNw6FyY2l1cycsXG4gICAgICAnw4FwcmlsaXMnLFxuICAgICAgJ03DoWp1cycsXG4gICAgICAnSsO6bml1cycsXG4gICAgICAnSsO6bGl1cycsXG4gICAgICAnQXVndXN6dHVzJyxcbiAgICAgICdTemVwdGVtYmVyJyxcbiAgICAgICdPa3TDs2JlcicsXG4gICAgICAnTm92ZW1iZXInLFxuICAgICAgJ0RlY2VtYmVyJ10sXG4gICAgQU1EZXNpZ25hdG9yOiAnJyxcbiAgICBmaXJzdERheU9mV2VlazogMSxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAneXl5eS4gbW1tbSBkZC4gSEg6TU06c3MnLFxuICAgIGxvbmdEYXRlUGF0dGVybjogJ3l5eXkuIG1tbW0gZGQuJyxcbiAgICBsb25nVGltZVBhdHRlcm46ICdISDpNTTpzcycsXG4gICAgc2hvcnREYXRlUGF0dGVybjogJ3l5eXkuIG0uIGQuJyxcbiAgICBzaG9ydERheU5hbWVzOiBbJ1YnLCAnSCcsICdLJywgJ1N6JywgJ0NzJywgJ1AnLCAnU3onXSxcbiAgICBzaG9ydFRpbWVQYXR0ZXJuOiAnSEg6TU0nLFxuICAgIHRpbWVTZXBhcmF0b3I6ICc6J1xuICB9O1xuXG4gIGV4cG9ydCBjb25zdCBlbkdCID0gPERhdGVUaW1lRm9ybWF0PiB7XG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwdCcsICdPa3QnLCAnTm92JywgJ0RlYyddLFxuICAgIGRheU5hbWVzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J10sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ0phbnVhcnknLFxuICAgICAgJ0ZlYnJ1YXJ5JyxcbiAgICAgICdNYXJjaCcsXG4gICAgICAnQXByaWwnLFxuICAgICAgJ01heScsXG4gICAgICAnSnVuZScsXG4gICAgICAnSnVseScsXG4gICAgICAnQXVndXN0JyxcbiAgICAgICdTZXB0ZW1iZXInLFxuICAgICAgJ09rdG9iZXInLFxuICAgICAgJ05vdmVtYmVyJyxcbiAgICAgICdEZWNlbWJlciddLFxuICAgIEFNRGVzaWduYXRvcjogJ2FtJyxcbiAgICBmaXJzdERheU9mV2VlazogMSxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAnZGQgbW1tbSB5eXl5IEhIOk1NOnNzJyxcbiAgICBsb25nRGF0ZVBhdHRlcm46ICdkZCBtbW1tIHl5eXknLFxuICAgIGxvbmdUaW1lUGF0dGVybjogJ0hIOk1NOnNzJyxcbiAgICBzaG9ydERhdGVQYXR0ZXJuOiAnZGQvbW0veXl5eScsXG4gICAgc2hvcnREYXlOYW1lczogWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10sXG4gICAgc2hvcnRUaW1lUGF0dGVybjogJ0hIOk1NJyxcbiAgICB0aW1lU2VwYXJhdG9yOiAnOidcbiAgfTtcblxuICBleHBvcnQgY29uc3QgZW5VUyA9IDxEYXRlVGltZUZvcm1hdD4ge1xuICAgIGFiYnJldmlhdGVkTW9udGhOYW1lczogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcHQnLCAnT2t0JywgJ05vdicsICdEZWMnXSxcbiAgICBkYXlOYW1lczogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAgIG1vbnRoTmFtZXM6IFtcbiAgICAgICdKYW51YXJ5JyxcbiAgICAgICdGZWJydWFyeScsXG4gICAgICAnTWFyY2gnLFxuICAgICAgJ0FwcmlsJyxcbiAgICAgICdNYXknLFxuICAgICAgJ0p1bmUnLFxuICAgICAgJ0p1bHknLFxuICAgICAgJ0F1Z3VzdCcsXG4gICAgICAnU2VwdGVtYmVyJyxcbiAgICAgICdPa3RvYmVyJyxcbiAgICAgICdOb3ZlbWJlcicsXG4gICAgICAnRGVjZW1iZXInXSxcbiAgICBBTURlc2lnbmF0b3I6ICdBTScsXG4gICAgZmlyc3REYXlPZldlZWs6IDAsXG4gICAgZnVsbERhdGVUaW1lUGF0dGVybjogJ2RkZGQsIG1tbW0gZCwgeXl5eSBoOk1NOnNzIFRUJyxcbiAgICBsb25nRGF0ZVBhdHRlcm46ICdkZGRkLCBtbW1tIGQsIHl5eXknLFxuICAgIGxvbmdUaW1lUGF0dGVybjogJ2g6TU06c3MgdHQnLFxuICAgIHNob3J0RGF0ZVBhdHRlcm46ICdtL2QveXl5eScsXG4gICAgc2hvcnREYXlOYW1lczogWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10sXG4gICAgc2hvcnRUaW1lUGF0dGVybjogJ2g6TU0gdHQnLFxuICAgIHRpbWVTZXBhcmF0b3I6ICc6J1xuICB9O1xuXG4gIGV4cG9ydCBjb25zdCBydSA9IDxEYXRlVGltZUZvcm1hdD4ge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICBhYmJyZXZpYXRlZE1vbnRoTmFtZXM6IFsn0Y/QvdCyLicsICfRhNC10LLRgC4nLCAn0LzQsNGA0YInLCAn0LDQv9GALicsICfQvNCw0LknLCAn0LjRjtC90YwnLCAn0LjRjtC70YwnLCAn0LDQstCzLicsICfRgdC10L3Rgi4nLCAn0L7QutGCLicsICfQvdC+0Y/QsS4nLCAn0LTQtdC6LiddLFxuICAgIGRheU5hbWVzOiBbJ9CS0L7RgdC60L/QtdGB0LXQvdGM0LUnLCAn0J/QvtC90LXQtNC10LvRjNC90LjQuicsICfQktGC0L7RgNC90LjQuicsICfQodGA0LXQtNCwJywgJ9Cn0LXRgtCy0LXRgNCzJywgJ9Cf0Y/RgtC90LjRhtCwJywgJ9Ch0YPQsdC+0YLQsCddLFxuICAgIG1vbnRoTmFtZXM6IFtcbiAgICAgICfRj9C90LLQsNGA0YwnLFxuICAgICAgJ9GE0LXQstGA0LDQu9GMJyxcbiAgICAgICfQvNCw0YDRgicsXG4gICAgICAn0LDQv9GA0LXQu9GMJyxcbiAgICAgICfQvNCw0LknLFxuICAgICAgJ9C40Y7QvdGMJyxcbiAgICAgICfQuNGO0LvRjCcsXG4gICAgICAn0LDQstCz0YPRgdGCJyxcbiAgICAgICfQodC10L3RgtGP0LHRgNGMJyxcbiAgICAgICfQvtC60YLRj9Cx0YDRjCcsXG4gICAgICAn0L3QvtGP0LHRgNGMJyxcbiAgICAgICfQtNC10LrQsNCx0YDRjCddLFxuICAgIEFNRGVzaWduYXRvcjogJycsXG4gICAgZmlyc3REYXlPZldlZWs6IDAsXG4gICAgZnVsbERhdGVUaW1lUGF0dGVybjogJ2QgbW1tbSB5eXl5IFxcJ9CzLlxcJyBIOm1tOnNzJyxcbiAgICBsb25nRGF0ZVBhdHRlcm46ICdkIG1tbW0geXl5eSBcXCfQsy5cXCcnLFxuICAgIGxvbmdUaW1lUGF0dGVybjogJ0g6TU06c3MnLFxuICAgIHNob3J0RGF0ZVBhdHRlcm46ICdkZC5tbS55eXl5JyxcbiAgICBzaG9ydERheU5hbWVzOiBbJ9CSJywgJ9CfJywgJ9CSJywgJ9ChJywgJ9CnJywgJ9CfJywgJ9ChJ10sXG4gICAgc2hvcnRUaW1lUGF0dGVybjogJ0g6TU0nLFxuICAgIHRpbWVTZXBhcmF0b3I6ICc6J1xuICB9O1xufVxuXG5jb25zdCByZWdleEpzb25NaWxsaXNlY29uZHMgPSAvXFwuWzAtOV0rKFp8XFwrWzAtOV17MSwyfSg6WzAtOV17MSwyfSk/KSQvaTtcblxuY29uc3QgZGF0ZUZyb21Kc29uID0gKGpzb246IHN0cmluZykgPT4ge1xuICBjb25zdCBmaXhlZCA9IGpzb24ucmVwbGFjZShyZWdleEpzb25NaWxsaXNlY29uZHMsICckMScpO1xuICByZXR1cm4gbmV3IERhdGUoZml4ZWQpO1xufTtcblxuY29uc3QgZGF0ZUZyb21UaW1lID0gKG1pbGxpc2Vjb25kczogbnVtYmVyKSA9PiB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBEYXRlKCk7XG4gIHJlc3VsdC5zZXRUaW1lKG1pbGxpc2Vjb25kcyk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCByZWdleFRpbWVTcGFuID0gL14oLSk/KChbMC05XSspXFwuKT8oWzAtOV17MSwyfSk6KFswLTldezEsMn0pKDooWzAtOV17MSwyfSkoXFwuKFswLTldezEsM30pKT8pPyQvO1xuXG5jb25zdCBtb250aExlbmd0aHMgPSBbXG4gIDMxLCAvLyBqYW5cbiAgTmFOLCAvLyBmZWJcbiAgMzEsICAvLyBtYXJcbiAgMzAsICAvLyBhcHJcbiAgMzEsICAvLyBtYXlcbiAgMzAsICAvLyBqdW5cbiAgMzEsICAvLyBqdWxcbiAgMzEsICAvLyBhdWdcbiAgMzAsICAvLyBzZXBcbiAgMzEsICAvLyBva3RcbiAgMzAsICAvLyBub3ZcbiAgMzEgIC8vIGRlY1xuXTtcblxuY29uc3QgcG93MTAgPSAobjogbnVtYmVyKSA9PiB7XG4gIHN3aXRjaCAobikge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiAxMDtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gMTAwO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiAxMDAwO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsZXQgcmVzID0gMTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIHJlcyAqPSAxMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gIH1cbn07XG5cbmNvbnN0IHBhZDMgPSAobjogbnVtYmVyKSA9PiB7XG4gIGlmIChuIDwgMTApIHtcbiAgICByZXR1cm4gYDAwJHtufWA7XG4gIH1cbiAgaWYgKG4gPCAxMDApIHtcbiAgICByZXR1cm4gYDAke259YDtcbiAgfVxuICByZXR1cm4gU3RyaW5nKG4pO1xufTtcblxuY29uc3QgcGFyc2VUaW1lU3RhbXAgPSAoaW5wdXQ6IHN0cmluZykgPT4ge1xuICBjb25zdCBtID0gcmVnZXhUaW1lU3Bhbi5leGVjKGlucHV0KTtcbiAgaWYgKCFtKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHRpbWVzdGFtcCB2YWx1ZTogXCIke2lucHV0fVwiYCk7XG4gIH1cbiAgbGV0IG1pbGxpc2Vjb25kcyA9IG1bOV0gPyBwYXJzZUludChtWzldLCAxMCkgKiBwb3cxMCgzIC0gbVs5XS5sZW5ndGgpIDogMDtcbiAgbWlsbGlzZWNvbmRzICs9IChwYXJzZUludChtWzddLCAxMCkgfHwgMCkgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZDtcbiAgbWlsbGlzZWNvbmRzICs9IChwYXJzZUludChtWzVdLCAxMCkgfHwgMCkgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbk1pbnV0ZTtcbiAgbWlsbGlzZWNvbmRzICs9IChwYXJzZUludChtWzRdLCAxMCkgfHwgMCkgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkhvdXI7XG4gIG1pbGxpc2Vjb25kcyArPSAocGFyc2VJbnQobVszXSwgMTApIHx8IDApICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXk7XG4gIGlmICgnLScgPT09IG1bMV0pIHtcbiAgICBtaWxsaXNlY29uZHMgPSAtbWlsbGlzZWNvbmRzO1xuICB9XG4gIHJldHVybiBtaWxsaXNlY29uZHM7XG59O1xuXG5leHBvcnQgY2xhc3MgVGltZVNwYW4gaW1wbGVtZW50cyBFcXVhdGFibGU8VGltZVNwYW4+LCBDb21wYXJhYmxlPFRpbWVTcGFuPiB7XG4gIHN0YXRpYyByZWFkb25seSBtaWxsaXNlY29uZHNJblNlY29uZCA9IDEwMDA7XG4gIHN0YXRpYyByZWFkb25seSBtaWxsaXNlY29uZHNJbk1pbnV0ZSA9IDYwMDAwO1xuICBzdGF0aWMgcmVhZG9ubHkgbWlsbGlzZWNvbmRzSW5Ib3VyID0gMzYwMDAwMDtcbiAgc3RhdGljIHJlYWRvbmx5IG1pbGxpc2Vjb25kc0luRGF5ID0gODY0MDAwMDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgdmFsdWU6IG51bWJlcjtcbiAgZ2V0IG1pbGxpc2Vjb25kcygpIHsgcmV0dXJuIHRoaXMudmFsdWUgJSBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZDsgfVxuICBnZXQgc2Vjb25kcygpIHsgcmV0dXJuIE1hdGguZmxvb3IodGhpcy50b3RhbFNlY29uZHMpICUgNjA7IH1cbiAgZ2V0IG1pbnV0ZXMoKSB7IHJldHVybiBNYXRoLmZsb29yKHRoaXMudG90YWxNaW51dGVzKSAlIDYwOyB9XG4gIGdldCBob3VycygpIHsgcmV0dXJuIE1hdGguZmxvb3IodGhpcy50b3RhbEhvdXJzKSAlIDI0OyB9XG4gIGdldCBkYXlzKCkgeyByZXR1cm4gTWF0aC5mbG9vcih0aGlzLnRvdGFsRGF5cyk7IH1cbiAgZ2V0IHRvdGFsTWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gdGhpcy52YWx1ZTsgfVxuICBnZXQgdG90YWxTZWNvbmRzKCkgeyByZXR1cm4gdGhpcy52YWx1ZSAvIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kOyB9XG4gIGdldCB0b3RhbE1pbnV0ZXMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5NaW51dGU7IH1cbiAgZ2V0IHRvdGFsSG91cnMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyOyB9XG4gIGdldCB0b3RhbERheXMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXk7IH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aW1lc3BhbiBmb3IgdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgbWlsbGlzZWNvbmRzLlxuICAgKiBAcGFyYW0gbWlsbGlzZWNvbmRzIEFtb3VudCBvZiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtaWxsaXNlY29uZHM6IG51bWJlcik7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGltZXNwYW4gYnkgcGFyc2luZyBpdHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0gaW5wdXQgU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0aW1lc3Bhbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlucHV0OiBzdHJpbmcpO1xuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogbnVtYmVyfHN0cmluZykge1xuICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHNvdXJjZSkge1xuICAgICAgdGhpcy52YWx1ZSA9IHNvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52YWx1ZSA9IHBhcnNlVGltZVN0YW1wKHNvdXJjZSk7XG4gICAgfVxuICB9XG4gIGFicygpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKE1hdGguYWJzKHRoaXMudmFsdWUpKTtcbiAgfVxuICBhZGRNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKHRoaXMudmFsdWUgKyBtaWxsaXNlY29uZHMpO1xuICB9XG4gIGFkZFNlY29uZHMoc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHNlY29uZHMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZCk7XG4gIH1cbiAgYWRkTWludXRlcyhtaW51dGVzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMobWludXRlcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlKTtcbiAgfVxuICBhZGRIb3Vycyhob3VyczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKGhvdXJzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyKTtcbiAgfVxuICBhZGREYXlzKGRheXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhkYXlzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXkpO1xuICB9XG4gIGFkZCh2YWx1ZTogVGltZVNwYW58bnVtYmVyKSB7XG4gICAgY29uc3QgbWlsbGlzZWNvbmRzID0gdmFsdWUgaW5zdGFuY2VvZiBUaW1lU3BhbiA/IHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzIDogdmFsdWU7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKG1pbGxpc2Vjb25kcyk7XG4gIH1cbiAgbmVnKCkge1xuICAgIHJldHVybiBuZXcgVGltZVNwYW4oLTEgKiB0aGlzLnZhbHVlKTtcbiAgfVxuICBzdWJNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKHRoaXMudmFsdWUgLSBtaWxsaXNlY29uZHMpO1xuICB9XG4gIHN1YlNlY29uZHMoc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKHNlY29uZHMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZCk7XG4gIH1cbiAgc3ViTWludXRlcyhtaW51dGVzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJNaWxsaXNlY29uZHMobWludXRlcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlKTtcbiAgfVxuICBzdWJIb3Vycyhob3VyczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKGhvdXJzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyKTtcbiAgfVxuICBzdWJEYXlzKGRheXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnN1Yk1pbGxpc2Vjb25kcyhkYXlzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXkpO1xuICB9XG4gIHN1Yih2YWx1ZTogVGltZVNwYW58bnVtYmVyKSB7XG4gICAgY29uc3QgbWlsbGlzZWNvbmRzID0gdmFsdWUgaW5zdGFuY2VvZiBUaW1lU3BhbiA/IHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzIDogdmFsdWU7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKG1pbGxpc2Vjb25kcyk7XG4gIH1cblxuICBlcXVhbHNUbyhvdGhlcjogVGltZVNwYW4pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XG4gIH1cblxuICBjb21wYXJlVG8ob3RoZXI6IFRpbWVTcGFuKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWUgPiBvdGhlci52YWx1ZSA/IDEgOiAodGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWUgPyAwIDogLTEpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMudmFsdWUgPCAwKSB7XG4gICAgICByZXR1cm4gYC0ke3RoaXMuYWJzKCl9YDtcbiAgICB9XG4gICAgY29uc3QgZGF5cyA9IHRoaXMuZGF5cztcbiAgICBjb25zdCBob3VycyA9IHRoaXMuaG91cnM7XG4gICAgY29uc3QgbWludXRlcyA9IHRoaXMubWludXRlcztcbiAgICBjb25zdCBzZWNvbmRzID0gdGhpcy5zZWNvbmRzO1xuICAgIGNvbnN0IG1pbGxpc2Vjb25kcyA9IHRoaXMubWlsbGlzZWNvbmRzO1xuICAgIGlmIChkYXlzKSB7XG4gICAgICBpZiAoc2Vjb25kcyB8fCAhbWlsbGlzZWNvbmRzKSB7XG4gICAgICAgIHJldHVybiBgJHtkYXlzfS4ke2hvdXJzfS4ke21pbnV0ZXN9LiR7c2Vjb25kc31gO1xuICAgICAgfVxuICAgICAgaWYgKG1pbGxpc2Vjb25kcykge1xuICAgICAgICByZXR1cm4gYCR7ZGF5c30uJHtob3Vyc30uJHttaW51dGVzfS4ke3NlY29uZHN9LiR7cGFkMyhtaWxsaXNlY29uZHMpfWA7XG4gICAgICB9XG4gICAgICByZXR1cm4gYCR7ZGF5c30uJHtob3Vyc30uJHttaW51dGVzfWA7XG4gICAgfVxuICAgIGlmIChzZWNvbmRzIHx8ICFtaWxsaXNlY29uZHMpIHtcbiAgICAgIHJldHVybiBgJHtob3Vyc30uJHttaW51dGVzfS4ke3NlY29uZHN9YDtcbiAgICB9XG4gICAgaWYgKG1pbGxpc2Vjb25kcykge1xuICAgICAgcmV0dXJuIGAke2hvdXJzfS4ke21pbnV0ZXN9LiR7c2Vjb25kc30uJHtwYWQzKG1pbGxpc2Vjb25kcyl9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAke2hvdXJzfS4ke21pbnV0ZXN9YDtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERhdGVUaW1lSW5pdCB7XG4gIHllYXI/OiBudW1iZXI7XG4gIG1vbnRoPzogbnVtYmVyO1xuICBkYXk/OiBudW1iZXI7XG4gIGhvdXJzPzogbnVtYmVyO1xuICBtaW51dGVzPzogbnVtYmVyO1xuICBzZWNvbmRzPzogbnVtYmVyO1xuICBtaWxsaXNlY29uZHM/OiBudW1iZXI7XG59XG5cbmNvbnN0IHBhdHRlcm5zID0ge1xuICBkOiBTeW1ib2woJ2QnKSxcbiAgZGQ6IFN5bWJvbCgnZGQnKSxcbiAgZGRkOiBTeW1ib2woJ2RkZCcpLFxuICBkZGRkOiBTeW1ib2woJ2RkZGQnKSxcbiAgbTogU3ltYm9sKCdtJyksXG4gIG1tOiBTeW1ib2woJ21tJyksXG4gIG1tbTogU3ltYm9sKCdtbW0nKSxcbiAgbW1tbTogU3ltYm9sKCdtbW1tJyksXG4gIHl5OiBTeW1ib2woJ3l5JyksXG4gIHl5eXk6IFN5bWJvbCgneXl5eScpLFxuICBoOiBTeW1ib2woJ2gnKSxcbiAgaGg6IFN5bWJvbCgnaGgnKSxcbiAgSDogU3ltYm9sKCdIJyksXG4gIEhIOiBTeW1ib2woJ0hIJyksXG4gIE06IFN5bWJvbCgnTScpLFxuICBNTTogU3ltYm9sKCdNTScpLFxuICBzOiBTeW1ib2woJ3MnKSxcbiAgc3M6IFN5bWJvbCgnc3MnKSxcbiAgdHQ6IFN5bWJvbCgndHQnKSxcbiAgVFQ6IFN5bWJvbCgnVFQnKSxcbn07XG5cbmNvbnN0IHBhdHRlcm5LZXlzID0gKGZ1bmN0aW9uKCkge1xuICBjb25zdCB4OiBBcnJheTxbc3RyaW5nLCBTeW1ib2xdPiA9IFtdO1xuICBPYmplY3Qua2V5cyhwYXR0ZXJucykuZm9yRWFjaCgoaykgPT4ge1xuICAgIHgucHVzaChbaywgPFN5bWJvbD4gKDxhbnk+IHBhdHRlcm5zKVtrXV0pO1xuICB9KTtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICB4LnNvcnQoKFtrMSwgX10sIFtrMiwgX19dKSA9PiBrMS5sZW5ndGggPT09IGsyLmxlbmd0aCA/IChrMSA8IGsyID8gLTEgOiAoazEgPT09IGsyID8gMCA6IC0xKSkgOiBrMS5sZW5ndGggPCBrMi5sZW5ndGggPyAxIDogLTEpO1xuICByZXR1cm4geDtcbn0oKSk7XG5cbnR5cGUgRm9ybWF0VG9rZW4gPSBzdHJpbmd8U3ltYm9sO1xuXG5mdW5jdGlvbiBwYXJzZUZvcm1hdChzb3VyY2U6IHN0cmluZywgaW5kZXg6IG51bWJlciwgdG9rZW5zOiBGb3JtYXRUb2tlbltdKTogRm9ybWF0VG9rZW5bXSB7XG4gIGlmIChpbmRleCA+PSBzb3VyY2UubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuICBpZiAoJ1xcJycgPT09IHNvdXJjZVtpbmRleF0pIHtcbiAgICBjb25zdCBjbG9zaW5nID0gc291cmNlLmluZGV4T2YoJ1xcJycsIGluZGV4ICsgMSk7XG4gICAgaWYgKC0xID09PSBjbG9zaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuY2xvc2VkIHF1b3RlJyk7XG4gICAgfVxuICAgIHRva2Vucy5wdXNoKHNvdXJjZS5zdWJzdHJpbmcoaW5kZXggKyAxLCBjbG9zaW5nKSk7XG4gICAgcmV0dXJuIHBhcnNlRm9ybWF0KHNvdXJjZSwgY2xvc2luZyArIDEsIHRva2Vucyk7XG4gIH1cbiAgLy8gY2hlY2sgZm9ybWF0c1xuICBmb3IgKGNvbnN0IFtrLCBzXSBvZiBwYXR0ZXJuS2V5cykge1xuICAgIGlmIChpbmRleCA9PT0gc291cmNlLmluZGV4T2YoaywgaW5kZXgpKSB7XG4gICAgICB0b2tlbnMucHVzaChzKTtcbiAgICAgIHJldHVybiBwYXJzZUZvcm1hdChzb3VyY2UsIGluZGV4ICsgay5sZW5ndGgsIHRva2Vucyk7XG4gICAgfVxuICB9XG4gIC8vIHBsYWluIHRleHRcbiAgY29uc3QgbCA9IHRva2Vucy5sZW5ndGg7XG4gIGlmIChsICYmICdzdHJpbmcnID09PSB0eXBlb2YgdG9rZW5zW2xdKSB7XG4gICAgdG9rZW5zW2xdICs9IHNvdXJjZVtpbmRleF07XG4gIH0gZWxzZSB7XG4gICAgdG9rZW5zLnB1c2goc291cmNlW2luZGV4XSk7XG4gIH1cbiAgcmV0dXJuIHBhcnNlRm9ybWF0KHNvdXJjZSwgaW5kZXggKyAxLCB0b2tlbnMpO1xufVxuXG5jb25zdCBmb3JtYXRDYWNoZTogeyBbZm10OiBzdHJpbmddOiBGb3JtYXRUb2tlbltdfHVuZGVmaW5lZCB9ID0ge307XG5cbmNvbnN0IHBhcnNlRm9ybWF0Q2FjaGVkID0gKHNvdXJjZTogc3RyaW5nKTogRm9ybWF0VG9rZW5bXSA9PiB7XG4gIGxldCB0b2tlbnMgPSBmb3JtYXRDYWNoZVtzb3VyY2VdO1xuICBpZiAodG9rZW5zKSB7XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuICB0b2tlbnMgPSBwYXJzZUZvcm1hdChzb3VyY2UsIDAsIFtdKTtcbiAgZm9ybWF0Q2FjaGVbc291cmNlXSA9IHRva2VucztcbiAgcmV0dXJuIHRva2Vucztcbn07XG5cbmNvbnN0IHBhZFplcm86IChzb3VyY2U6IHN0cmluZywgbjogbnVtYmVyKSA9PiBzdHJpbmcgPSAoZnVuY3Rpb24oKSB7XG4gIGlmICgoPGFueT4gU3RyaW5nLnByb3RvdHlwZSkucGFkU3RhcnQpIHtcbiAgICBjb25zdCBwYWQ6IChuOiBudW1iZXIsIHBhZFN0cmluZzogc3RyaW5nKSA9PiBzdHJpbmcgPSAoPGFueT4gU3RyaW5nLnByb3RvdHlwZSkucGFkU3RhcnQ7XG4gICAgcmV0dXJuIChzb3VyY2U6IHN0cmluZywgbjogbnVtYmVyKSA9PiBwYWQuY2FsbChzb3VyY2UsIG4sICcwJyk7XG4gIH1cbiAgcmV0dXJuIChzb3VyY2U6IHN0cmluZywgbjogbnVtYmVyKSA9PiB7XG4gICAgbGV0IHJlc3VsdCA9IHNvdXJjZTtcbiAgICB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IG4pIHtcbiAgICAgIHJlc3VsdCA9ICcwJyArIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn0oKSk7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShzb3VyY2U6IERhdGVUaW1lLCB0b2tlbnM6IEZvcm1hdFRva2VuW10sIGZvcm1hdDogRGF0ZVRpbWVGb3JtYXQpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gdG9rZW47XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5kID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UuZGF5KTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5kYXkpLCAyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkZCA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBmb3JtYXQuc2hvcnREYXlOYW1lc1tzb3VyY2UuZGF5T2ZXZWVrXTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkZGQgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gZm9ybWF0LmRheU5hbWVzW3NvdXJjZS5kYXlPZldlZWtdO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMubSA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLm1vbnRoKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLm1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5tb250aCksIDIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMubW1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IGZvcm1hdC5hYmJyZXZpYXRlZE1vbnRoTmFtZXNbc291cmNlLm1vbnRoIC0gMV07XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5tbW1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IGZvcm1hdC5tb250aE5hbWVzW3NvdXJjZS5tb250aCAtIDFdO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMueXkgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS55ZWFyICUgMTAwKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLnl5eXkgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS55ZWFyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmggPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS5ob3VycyAlIDEyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmhoID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5ob3VycyAlIDEyKSwgMik7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5IID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UuaG91cnMpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuSEggPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLmhvdXJzKSwgMik7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5NID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UubWludXRlcyk7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5NTSA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBwYWRaZXJvKFN0cmluZyhzb3VyY2UubWludXRlcyksIDIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMucyA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLnNlY29uZHMpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuc3MgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLnNlY29uZHMpLCAyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLnR0ID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHNvdXJjZS5ob3VycyA+IDExID8gJ3BtJyA6ICdhbSc7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5UVCA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBzb3VyY2UuaG91cnMgPiAxMSA/ICdQTScgOiAnQU0nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZm90bWF0IHRva2VuJyk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmNvbnN0IGZvcm1hdEN1c3RvbSA9IChzb3VyY2U6IERhdGVUaW1lLCBmbXQ6IHN0cmluZywgZm9ybWF0OiBEYXRlVGltZUZvcm1hdCk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHRva2VucyA9IHBhcnNlRm9ybWF0Q2FjaGVkKGZtdCk7XG4gIHJldHVybiBzdHJpbmdpZnkoc291cmNlLCB0b2tlbnMsIGZvcm1hdCk7XG59O1xuXG5jb25zdCBmb3JtYXRTdGFuZGFyZCA9IChzb3VyY2U6IERhdGVUaW1lLCBmbXQ6ICdkJ3wnRCd8J2YnfCdGJ3wnZyd8J0cnLCBmb3JtYXQ6IERhdGVUaW1lRm9ybWF0KSA9PiB7XG4gIHN3aXRjaCAoZm10KSB7XG4gICAgY2FzZSAnZCc6XG4gICAgICByZXR1cm4gZm9ybWF0Q3VzdG9tKHNvdXJjZSwgZm9ybWF0LnNob3J0RGF0ZVBhdHRlcm4sIGZvcm1hdCk7XG4gICAgY2FzZSAnRCc6XG4gICAgICByZXR1cm4gZm9ybWF0Q3VzdG9tKHNvdXJjZSwgZm9ybWF0LmxvbmdEYXRlUGF0dGVybiwgZm9ybWF0KTtcbiAgICBjYXNlICdmJzpcbiAgICBjYXNlICdGJzpcbiAgICAgIHJldHVybiBmb3JtYXRDdXN0b20oc291cmNlLCBmb3JtYXQuZnVsbERhdGVUaW1lUGF0dGVybiwgZm9ybWF0KTtcbiAgICBjYXNlICdnJzpcbiAgICAgIHJldHVybiBmb3JtYXRDdXN0b20oc291cmNlLCBmb3JtYXQuc2hvcnREYXRlUGF0dGVybiArICcgJyArIGZvcm1hdC5zaG9ydFRpbWVQYXR0ZXJuLCBmb3JtYXQpO1xuICAgIGNhc2UgJ0cnOlxuICAgICAgcmV0dXJuIGZvcm1hdEN1c3RvbShzb3VyY2UsIGZvcm1hdC5zaG9ydERhdGVQYXR0ZXJuICsgJyAnICsgZm9ybWF0LmxvbmdUaW1lUGF0dGVybiwgZm9ybWF0KTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3Nob3VsZCBuZXZlciBoYXBwZW4nKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBEYXRlVGltZSBpbXBsZW1lbnRzIEVxdWF0YWJsZTxEYXRlVGltZT4sIENvbXBhcmFibGU8RGF0ZVRpbWU+IHtcblxuICBzdGF0aWMgZGVmYXVsdEZvcm1hdFByb3ZpZGVyID0gRm9ybWF0cy5odTtcbiAgc3RhdGljIGRlZmF1bHRGb3JtYXQgPSAnZyc7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW1vdW50IG9mIGRheXMgaW4gdGhlIHNwZWNpZmllZCBtb250aC5cbiAgICogQHBhcmFtIG1vbnRoIE1vbnRoLlxuICAgKiBAcGFyYW0geWVhciBZZWFyLlxuICAgKi9cbiAgc3RhdGljIGdldE1vbnRoTGVuZ3RoKG1vbnRoOiBudW1iZXIsIHllYXI6IG51bWJlcikge1xuICAgIGlmIChtb250aCA8IDEgfHwgbW9udGggPiAxMikge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignbW9udGggb3V0IG9mIHJhbmdlJyk7XG4gICAgfVxuICAgIGlmIChtb250aCAhPT0gMikge1xuICAgICAgICByZXR1cm4gbW9udGhMZW5ndGhzW21vbnRoIC0gMV07XG4gICAgfVxuICAgIHJldHVybiAoMCA9PT0geWVhciAlIDQgJiYgKDAgIT09IHllYXIgJSAxMDAgfHwgMCA9PT0geWVhciAlIDQwMCkpID8gMjkgOiAyODtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZG9ubHkgc291cmNlOiBEYXRlO1xuICBnZXQgaXNWYWxpZCgpIHsgcmV0dXJuICFpc05hTih0aGlzLnNvdXJjZS5nZXRUaW1lKCkpOyB9XG4gIGdldCB5ZWFyKCkgeyByZXR1cm4gdGhpcy5zb3VyY2UuZ2V0RnVsbFllYXIoKTsgfVxuICBnZXQgbW9udGgoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRNb250aCgpICsgMTsgfVxuICBnZXQgZGF5KCkgeyByZXR1cm4gdGhpcy5zb3VyY2UuZ2V0RGF0ZSgpOyB9XG4gIGdldCBkYXlPZldlZWsoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXREYXkoKTsgfVxuICBnZXQgaG91cnMoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRIb3VycygpOyB9XG4gIGdldCBtaW51dGVzKCkgeyByZXR1cm4gdGhpcy5zb3VyY2UuZ2V0TWludXRlcygpOyB9XG4gIGdldCBzZWNvbmRzKCkgeyByZXR1cm4gdGhpcy5zb3VyY2UuZ2V0U2Vjb25kcygpOyB9XG4gIGdldCBtaWxsaXNlY29uZHMoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRNaWxsaXNlY29uZHMoKTsgfVxuXG4gIC8qKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBkYXRldGltZSBmb3IgYWN0dWFsIGRhdGUgYW5kIHRpbWUuICovXG4gIGNvbnN0cnVjdG9yKCk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIGRhdGV0aW1lIGZyb20gdGhlIHNwZWNpZmllZCBkYXRlLlxuICAgKiBAcGFyYW0gc291cmNlIERhdGUgb2JqZWN0IHRvIHVzZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogRGF0ZSk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIGRhdGV0aW1lIGZyb20gdGhlIHNwZWNpZmllZCBKU09OIHN0cmluZyByZXByZXNlbnRpbmcgZGF0ZS5cbiAgICogQHBhcmFtIGpzb24gSlNPTiBzdHJpbmcgcmVwcmVzZW50aW5nIGRhdGUuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihqc29uOiBzdHJpbmcpO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBkYXRldGltZSBmcm9tIHRoZSBzcGVjaWZpZWQgYW1vdW50IG9mIG1pbGxpc2Vjb25kcyBmcm9tIDE5NzAgamFuIDEgVVRDLlxuICAgKiBAcGFyYW0gc291cmNlIEFtb3VudCBvZiBtaWxsaXNlY29uZHMgZnJvbSAxOTcwIGphbiAxIFVUQy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG1pbGxpc2Vjb25kczogbnVtYmVyKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgZGF0ZXRpbWUgZnJvbSB0aGUgc3BlY2lmaWVkIGluaXRpYWxpemVyLlxuICAgKiBAcGFyYW0gc291cmNlIEluaXRpYWxpemVyIG9iamVjdCB0byB1c2UuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihpbml0OiBEYXRlVGltZUluaXQpO1xuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZT86IERhdGV8c3RyaW5nfG51bWJlcnxEYXRlVGltZUluaXQpIHtcbiAgICBpZiAodW5kZWZpbmVkID09PSBzb3VyY2UgfHwgbnVsbCA9PT0gc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IG5ldyBEYXRlKCk7XG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNvdXJjZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBkYXRlRnJvbUpzb24oc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKCdudW1iZXInID09PSB0eXBlb2Ygc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IGRhdGVGcm9tVGltZShzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGFzc3VtZSBpbml0XG4gICAgICBjb25zdCBpbml0ID0gPERhdGVUaW1lSW5pdD4gc291cmNlO1xuICAgICAgdGhpcy5zb3VyY2UgPSBuZXcgRGF0ZShcbiAgICAgICAgaW5pdC55ZWFyIHx8IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgaW5pdC5tb250aCA/IGluaXQubW9udGggLSAxIDogMCxcbiAgICAgICAgaW5pdC5kYXkgfHwgMSxcbiAgICAgICAgaW5pdC5ob3VycyB8fCAwLFxuICAgICAgICBpbml0Lm1pbnV0ZXMgfHwgMCxcbiAgICAgICAgaW5pdC5zZWNvbmRzIHx8IDAsXG4gICAgICAgIGluaXQubWlsbGlzZWNvbmRzIHx8IDApO1xuICAgIH1cbiAgfVxuXG4gIGVxdWFsc1RvKG90aGVyOiBEYXRlVGltZSkge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZS5nZXRUaW1lKCkgPT09IG90aGVyLnNvdXJjZS5nZXRUaW1lKCk7XG4gIH1cblxuICBjb21wYXJlVG8ob3RoZXI6IERhdGVUaW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlIDwgb3RoZXIuc291cmNlID8gLTEgOiAodGhpcy5lcXVhbHNUbyhvdGhlcikgPyAwIDogMSk7XG4gIH1cblxuICBhZGRNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIpIHtcbiAgICBjb25zdCByZXMgPSBkYXRlRnJvbVRpbWUodGhpcy5zb3VyY2UuZ2V0VGltZSgpICsgbWlsbGlzZWNvbmRzKTtcbiAgICBjb25zdCBvZmZzZXREZWx0YSA9IHRoaXMuc291cmNlLmdldFRpbWV6b25lT2Zmc2V0KCkgLSByZXMuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICBpZiAob2Zmc2V0RGVsdGEgIT09IDApIHtcbiAgICAgICAgY29uc3QgYWRqdXN0ID0gb2Zmc2V0RGVsdGEgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbk1pbnV0ZTtcbiAgICAgICAgcmVzLnNldFRpbWUocmVzLmdldFRpbWUoKSAtIGFkanVzdCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZVRpbWUocmVzKTtcbiAgfVxuXG4gIGFkZFNlY29uZHMoc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHNlY29uZHMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZCk7XG4gIH1cblxuICBhZGRNaW51dGVzKG1pbnV0ZXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhtaW51dGVzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5NaW51dGUpO1xuICB9XG5cbiAgYWRkSG91cnMoaG91cnM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhob3VycyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luSG91cik7XG4gIH1cblxuICBhZGREYXlzKGRheXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhkYXlzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXkpO1xuICB9XG5cbiAgYWRkTW9udGhzKG1vbnRoczogbnVtYmVyKSB7XG4gICAgaWYgKDAgPT09IG1vbnRocykge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGREYXlzKDApO1xuICAgIH1cbiAgICBpZiAoMCA8IG1vbnRocykge1xuICAgICAgY29uc3QgZnVsbCA9IE1hdGguZmxvb3IobW9udGhzKSArICh0aGlzLm1vbnRoIC0gMSk7XG4gICAgICBjb25zdCBmbSA9IGZ1bGwgJSAxMjtcbiAgICAgIGNvbnN0IGZ5ID0gTWF0aC5mbG9vcihmdWxsIC8gMTIpO1xuICAgICAgY29uc3QgcmVzID0gbmV3IERhdGVUaW1lKHtcbiAgICAgICAgeWVhcjogdGhpcy55ZWFyICsgZnksXG4gICAgICAgIG1vbnRoOiBmbSArIDEsXG4gICAgICAgIGRheTogTWF0aC5taW4oRGF0ZVRpbWUuZ2V0TW9udGhMZW5ndGgoZm0gKyAxLCB0aGlzLnllYXIgKyBmeSksIHRoaXMuZGF5KSxcbiAgICAgICAgaG91cnM6IHRoaXMuaG91cnMsXG4gICAgICAgIG1pbnV0ZXM6IHRoaXMubWludXRlcyxcbiAgICAgICAgc2Vjb25kczogdGhpcy5zZWNvbmRzLFxuICAgICAgICBtaWxsaXNlY29uZHM6IHRoaXMubWlsbGlzZWNvbmRzXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHBhcnQgPSBtb250aHMgJSAxO1xuICAgICAgaWYgKDAgPT09IHBhcnQpIHtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXMuYWRkRGF5cyhEYXRlVGltZS5nZXRNb250aExlbmd0aChyZXMubW9udGgsIHJlcy55ZWFyKSAqIHBhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBhYnMgPSBNYXRoLmFicyhtb250aHMpO1xuICAgICAgbGV0IG0gPSAodGhpcy5tb250aCAtIDEpIC0gTWF0aC5mbG9vcihhYnMpO1xuICAgICAgbGV0IHkgPSB0aGlzLnllYXI7XG4gICAgICB3aGlsZSAoMCA+IG0pIHtcbiAgICAgICAgeSA9IHkgLSAxO1xuICAgICAgICBtID0gbSArIDEyO1xuICAgICAgfVxuICAgICAgY29uc3QgcGFydCA9IGFicyAlIDE7XG4gICAgICBpZiAoMCA9PT0gcGFydCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHtcbiAgICAgICAgICB5ZWFyOiB5LFxuICAgICAgICAgIG1vbnRoOiBtICsgMSxcbiAgICAgICAgICBkYXk6IHRoaXMuZGF5LFxuICAgICAgICAgIGhvdXJzOiB0aGlzLmhvdXJzLFxuICAgICAgICAgIG1pbnV0ZXM6IHRoaXMubWludXRlcyxcbiAgICAgICAgICBzZWNvbmRzOiB0aGlzLnNlY29uZHMsXG4gICAgICAgICAgbWlsbGlzZWNvbmRzOiB0aGlzLm1pbGxpc2Vjb25kc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICgwID09PSBtKSB7XG4gICAgICAgICAgeSA9IHkgLSAxO1xuICAgICAgICAgIG0gPSAxMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbSA9IG0gLSAxO1xuICAgICAgfVxuICAgICAgY29uc3QgZGF5cyA9IERhdGVUaW1lLmdldE1vbnRoTGVuZ3RoKG0gKyAxLCB5KTtcbiAgICAgIGNvbnN0IHRvQWRkID0gZGF5cyAqICgxIC0gcGFydCk7XG4gICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHtcbiAgICAgICAgeWVhcjogeSxcbiAgICAgICAgbW9udGg6IG0sXG4gICAgICAgIGRheTogdGhpcy5kYXksXG4gICAgICAgIGhvdXJzOiB0aGlzLmhvdXJzLFxuICAgICAgICBtaW51dGVzOiB0aGlzLm1pbnV0ZXMsXG4gICAgICAgIHNlY29uZHM6IHRoaXMuc2Vjb25kcyxcbiAgICAgICAgbWlsbGlzZWNvbmRzOiB0aGlzLm1pbGxpc2Vjb25kc1xuICAgICAgfSkuYWRkRGF5cyh0b0FkZCk7XG4gICAgfVxuICB9XG4gIGFkZCh0aW1lU3BhbjogVGltZVNwYW4pOiBEYXRlVGltZTtcbiAgYWRkKG1pbGxpc2Vjb25kczogbnVtYmVyKTogRGF0ZVRpbWU7XG4gIGFkZCh2YWx1ZTogVGltZVNwYW58bnVtYmVyKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGltZVNwYW4pIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyh2YWx1ZS50b3RhbE1pbGxpc2Vjb25kcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyh2YWx1ZSk7XG4gIH1cbiAgc3Vic3RyYWN0KG90aGVyOiBEYXRlVGltZSk6IFRpbWVTcGFuO1xuICBzdWJzdHJhY3QodGltZXNwYW46IFRpbWVTcGFuKTogRGF0ZVRpbWU7XG4gIHN1YnN0cmFjdChtaWxsaXNlY29uZHM6IG51bWJlcik6IERhdGVUaW1lO1xuICBzdWJzdHJhY3QodmFsdWU6IERhdGVUaW1lfFRpbWVTcGFufG51bWJlcikge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGVUaW1lKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWVTcGFuKHRoaXMuc291cmNlLmdldFRpbWUoKSAtIHZhbHVlLnNvdXJjZS5nZXRUaW1lKCkpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lU3Bhbikge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkKC0xICogdmFsdWUudG90YWxNaWxsaXNlY29uZHMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hZGQoLTEgKiB2YWx1ZSk7XG4gIH1cbiAgdG9EYXRlKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBEYXRlKCk7XG4gICAgcmVzdWx0LnNldFRpbWUodGhpcy5zb3VyY2UuZ2V0VGltZSgpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHByaXZhdGUgZm9ybWF0KGZvcm1hdDogc3RyaW5nLCBwcm92aWRlcjogRGF0ZVRpbWVGb3JtYXQpOiBzdHJpbmcge1xuICAgIGlmICgnZCcgPT09IGZvcm1hdCB8fCAnRCcgPT09IGZvcm1hdCB8fCAnZicgPT09IGZvcm1hdCB8fCAnRicgPT09IGZvcm1hdCB8fCAnZycgPT09IGZvcm1hdCB8fCAnRycgPT09IGZvcm1hdCkge1xuICAgICAgcmV0dXJuIGZvcm1hdFN0YW5kYXJkKHRoaXMsIGZvcm1hdCwgcHJvdmlkZXIpO1xuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0Q3VzdG9tKHRoaXMsIGZvcm1hdCwgcHJvdmlkZXIpO1xuICB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZztcbiAgdG9TdHJpbmcoZm9ybWF0OiBzdHJpbmcpOiBzdHJpbmc7XG4gIHRvU3RyaW5nKHByb3ZpZGVyOiBEYXRlVGltZUZvcm1hdCk6IHN0cmluZztcbiAgdG9TdHJpbmcoZm9ybWF0OiBzdHJpbmcsIHByb3ZpZGVyOiBEYXRlVGltZUZvcm1hdCk6IHN0cmluZztcbiAgdG9TdHJpbmcoZm9ybWF0T3JQcm92aWRlcj86IHN0cmluZ3xEYXRlVGltZUZvcm1hdCwgcHJvdmlkZXI/OiBEYXRlVGltZUZvcm1hdCkge1xuICAgIGlmICghcHJvdmlkZXIpIHtcbiAgICAgIGlmICghZm9ybWF0T3JQcm92aWRlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQoRGF0ZVRpbWUuZGVmYXVsdEZvcm1hdCwgRGF0ZVRpbWUuZGVmYXVsdEZvcm1hdFByb3ZpZGVyKTtcbiAgICAgIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBmb3JtYXRPclByb3ZpZGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdChmb3JtYXRPclByb3ZpZGVyLCBEYXRlVGltZS5kZWZhdWx0Rm9ybWF0UHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0KERhdGVUaW1lLmRlZmF1bHRGb3JtYXQsIGZvcm1hdE9yUHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiBmb3JtYXRPclByb3ZpZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZm9ybWF0IGFyZ3VtZW50Jyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZvcm1hdChmb3JtYXRPclByb3ZpZGVyLCBwcm92aWRlcik7XG4gIH1cbn1cbiJdfQ==