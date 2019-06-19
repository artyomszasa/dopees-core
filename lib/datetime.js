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
        dayNames: ['Sunday', 'Monday', 'Thuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
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
        dayNames: ['Sunday', 'Monday', 'Thuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXRpbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGF0ZXRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJBLE1BQU0sS0FBVyxPQUFPLENBNEd2QjtBQTVHRCxXQUFpQixPQUFPO0lBQ1QsVUFBRSxHQUFtQjtRQUNoQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQzdHLFFBQVEsRUFBRSxDQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQztRQUNwRixVQUFVLEVBQUU7WUFDVixRQUFRO1lBQ1IsU0FBUztZQUNULFNBQVM7WUFDVCxTQUFTO1lBQ1QsT0FBTztZQUNQLFFBQVE7WUFDUixRQUFRO1lBQ1IsV0FBVztZQUNYLFlBQVk7WUFDWixTQUFTO1lBQ1QsVUFBVTtZQUNWLFVBQVU7U0FBQztRQUNiLFlBQVksRUFBRSxFQUFFO1FBQ2hCLGNBQWMsRUFBRSxDQUFDO1FBQ2pCLG1CQUFtQixFQUFFLHlCQUF5QjtRQUM5QyxlQUFlLEVBQUUsZ0JBQWdCO1FBQ2pDLGVBQWUsRUFBRSxVQUFVO1FBQzNCLGdCQUFnQixFQUFFLGFBQWE7UUFDL0IsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO1FBQ3JELGdCQUFnQixFQUFFLE9BQU87UUFDekIsYUFBYSxFQUFFLEdBQUc7S0FDbkIsQ0FBQztJQUVXLFlBQUksR0FBbUI7UUFDbEMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUs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RTtZQUNiLE9BQU8sWUFBWSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDOUUsQ0FBQztJQUdELElBQUksT0FBTyxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RCxJQUFJLElBQUksS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hELElBQUksS0FBSyxLQUFLLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xELElBQUksR0FBRyxLQUFLLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0MsSUFBSSxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoRCxJQUFJLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlDLElBQUksT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEQsSUFBSSxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNsRCxJQUFJLFlBQVksS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBNkM1RCxRQUFRLENBQUMsS0FBZTtRQUN0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMxRCxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWU7UUFDdkIsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELGVBQWUsQ0FBQyxZQUFvQjtRQUNsQyxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUMvRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDOUUsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO1lBQ25CLE1BQU0sTUFBTSxHQUFHLFdBQVcsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUM7WUFDM0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7U0FDdkM7UUFDRCxPQUFPLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBYTtRQUNwQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBWTtRQUNsQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxTQUFTLENBQUMsTUFBYztRQUN0QixJQUFJLENBQUMsS0FBSyxNQUFNLEVBQUU7WUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUI7UUFDRCxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUU7WUFDZCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLElBQUksR0FBRyxHQUFHLElBQUksUUFBUSxDQUFDO2dCQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO2dCQUNwQixLQUFLLEVBQUUsRUFBRSxHQUFHLENBQUM7Z0JBQ2IsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDeEUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO2FBQ2hDLENBQUMsQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNkLE9BQU8sR0FBRyxDQUFDO2FBQ1o7WUFDRCxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUN6RTthQUFNO1lBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDWixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDVixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNaO1lBQ0QsTUFBTSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2QsT0FBTyxJQUFJLFFBQVEsQ0FBQztvQkFDbEIsSUFBSSxFQUFFLENBQUM7b0JBQ1AsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO29CQUNaLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztvQkFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztvQkFDckIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNyQixZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7aUJBQ2hDLENBQUMsQ0FBQzthQUNKO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNULENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNWLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDVjtpQkFBTTtnQkFDSCxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNiO1lBQ0QsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUNoQyxPQUFPLElBQUksUUFBUSxDQUFDO2dCQUNsQixJQUFJLEVBQUUsQ0FBQztnQkFDUCxLQUFLLEVBQUUsQ0FBQztnQkFDUixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO2FBQ2hDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbkI7SUFDSCxDQUFDO0lBR0QsR0FBRyxDQUFDLEtBQXNCO1FBQ3hCLElBQUksS0FBSyxZQUFZLFFBQVEsRUFBRTtZQUM3QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDdEQ7UUFDRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUlELFNBQVMsQ0FBQyxLQUErQjtRQUN2QyxJQUFJLEtBQUssWUFBWSxRQUFRLEVBQUU7WUFDN0IsT0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUNyRTtRQUNELElBQUksS0FBSyxZQUFZLFFBQVEsRUFBRTtZQUM3QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDL0M7UUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNELE1BQU07UUFDSixNQUFNLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFDTyxNQUFNLENBQUMsTUFBYyxFQUFFLFFBQXdCO1FBQ3JELElBQUksR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssTUFBTSxJQUFJLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssTUFBTSxJQUFJLEdBQUcsS0FBSyxNQUFNLEVBQUU7WUFDNUcsT0FBTyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMvQztRQUNELE9BQU8sWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUtELFFBQVEsQ0FBQyxnQkFBd0MsRUFBRSxRQUF5QjtRQUMxRSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUNyQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUM1RTtpQkFBTSxJQUFJLFFBQVEsS0FBSyxPQUFPLGdCQUFnQixFQUFFO2dCQUMvQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDdEU7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzthQUM5RDtTQUNGO1FBQ0QsSUFBSSxRQUFRLEtBQUssT0FBTyxnQkFBZ0IsRUFBRTtZQUN4QyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7U0FDNUM7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakQsQ0FBQzs7QUF4Tk0sOEJBQXFCLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUNuQyxzQkFBYSxHQUFHLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVxdWF0YWJsZSwgQ29tcGFyYWJsZSB9IGZyb20gXCIuL2NvbnRyYWN0XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0ZVRpbWVGb3JtYXQge1xuICBhYmJyZXZpYXRlZE1vbnRoTmFtZXM6IHN0cmluZ1tdO1xuICBkYXlOYW1lczogc3RyaW5nW107XG4gIG1vbnRoTmFtZXM6IHN0cmluZ1tdO1xuICBBTURlc2lnbmF0b3I6IHN0cmluZztcbiAgZmlyc3REYXlPZldlZWs6IG51bWJlcjtcbiAgZnVsbERhdGVUaW1lUGF0dGVybjogc3RyaW5nO1xuICBsb25nRGF0ZVBhdHRlcm46IHN0cmluZztcbiAgbG9uZ1RpbWVQYXR0ZXJuOiBzdHJpbmc7XG4gIHNob3J0RGF0ZVBhdHRlcm46IHN0cmluZztcbiAgc2hvcnREYXlOYW1lczogc3RyaW5nW107XG4gIHNob3J0VGltZVBhdHRlcm46IHN0cmluZztcbiAgdGltZVNlcGFyYXRvcjogc3RyaW5nXG59XG5cbmV4cG9ydCBuYW1lc3BhY2UgRm9ybWF0cyB7XG4gIGV4cG9ydCBjb25zdCBodSA9IDxEYXRlVGltZUZvcm1hdD57XG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ0phbicsICdGZWInLCAnTcOhcicsICfDgXByJywgJ03DoWonLCAnSsO6bicsICdKw7psJywgJ0F1ZycsICdTemVwdCcsICdPa3QnLCAnTm92JywgJ0RlYyddLFxuICAgIGRheU5hbWVzOiBbICdWYXPDoXJuYXAnLCAnSMOpdGbFkScsICdLZWRkJywgJ1N6ZXJkYScsICdDc8O8dMO2cnTDtmsnLCAnUMOpbnRlaycsICdTem9tYmF0J10sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ0phbnXDoXInLFxuICAgICAgJ0ZlYnJ1w6FyJyxcbiAgICAgICdNw6FyY2l1cycsXG4gICAgICAnw4FwcmlsaXMnLFxuICAgICAgJ03DoWp1cycsXG4gICAgICAnSsO6bml1cycsXG4gICAgICAnSsO6bGl1cycsXG4gICAgICAnQXVndXN6dHVzJyxcbiAgICAgICdTemVwdGVtYmVyJyxcbiAgICAgICdPa3TDs2JlcicsXG4gICAgICAnTm92ZW1iZXInLFxuICAgICAgJ0RlY2VtYmVyJ10sXG4gICAgQU1EZXNpZ25hdG9yOiAnJyxcbiAgICBmaXJzdERheU9mV2VlazogMSxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAneXl5eS4gbW1tbSBkZC4gSEg6TU06c3MnLFxuICAgIGxvbmdEYXRlUGF0dGVybjogJ3l5eXkuIG1tbW0gZGQuJyxcbiAgICBsb25nVGltZVBhdHRlcm46ICdISDpNTTpzcycsXG4gICAgc2hvcnREYXRlUGF0dGVybjogJ3l5eXkuIG0uIGQuJyxcbiAgICBzaG9ydERheU5hbWVzOiBbJ1YnLCAnSCcsICdLJywgJ1N6JywgJ0NzJywgJ1AnLCAnU3onXSxcbiAgICBzaG9ydFRpbWVQYXR0ZXJuOiAnSEg6TU0nLFxuICAgIHRpbWVTZXBhcmF0b3I6ICc6J1xuICB9O1xuXG4gIGV4cG9ydCBjb25zdCBlbkdCID0gPERhdGVUaW1lRm9ybWF0PntcbiAgICBhYmJyZXZpYXRlZE1vbnRoTmFtZXM6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXB0JywgJ09rdCcsICdOb3YnLCAnRGVjJ10sXG4gICAgZGF5TmFtZXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUaHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J10sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ0phbnVhcnknLFxuICAgICAgJ0ZlYnJ1YXJ5JyxcbiAgICAgICdNYXJjaCcsXG4gICAgICAnQXByaWwnLFxuICAgICAgJ01heScsXG4gICAgICAnSnVuZScsXG4gICAgICAnSnVseScsXG4gICAgICAnQXVndXN0JyxcbiAgICAgICdTZXB0ZW1iZXInLFxuICAgICAgJ09rdG9iZXInLFxuICAgICAgJ05vdmVtYmVyJyxcbiAgICAgICdEZWNlbWJlciddLFxuICAgIEFNRGVzaWduYXRvcjogJ2FtJyxcbiAgICBmaXJzdERheU9mV2VlazogMSxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAnZGQgbW1tbSB5eXl5IEhIOk1NOnNzJyxcbiAgICBsb25nRGF0ZVBhdHRlcm46ICdkZCBtbW1tIHl5eXknLFxuICAgIGxvbmdUaW1lUGF0dGVybjogJ0hIOk1NOnNzJyxcbiAgICBzaG9ydERhdGVQYXR0ZXJuOiAnZGQvbW0veXl5eScsXG4gICAgc2hvcnREYXlOYW1lczogWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10sXG4gICAgc2hvcnRUaW1lUGF0dGVybjogJ0hIOk1NJyxcbiAgICB0aW1lU2VwYXJhdG9yOiAnOidcbiAgfTtcblxuICBleHBvcnQgY29uc3QgZW5VUyA9IDxEYXRlVGltZUZvcm1hdD57XG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwdCcsICdPa3QnLCAnTm92JywgJ0RlYyddLFxuICAgIGRheU5hbWVzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVGh1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAgIG1vbnRoTmFtZXM6IFtcbiAgICAgICdKYW51YXJ5JyxcbiAgICAgICdGZWJydWFyeScsXG4gICAgICAnTWFyY2gnLFxuICAgICAgJ0FwcmlsJyxcbiAgICAgICdNYXknLFxuICAgICAgJ0p1bmUnLFxuICAgICAgJ0p1bHknLFxuICAgICAgJ0F1Z3VzdCcsXG4gICAgICAnU2VwdGVtYmVyJyxcbiAgICAgICdPa3RvYmVyJyxcbiAgICAgICdOb3ZlbWJlcicsXG4gICAgICAnRGVjZW1iZXInXSxcbiAgICBBTURlc2lnbmF0b3I6ICdBTScsXG4gICAgZmlyc3REYXlPZldlZWs6IDAsXG4gICAgZnVsbERhdGVUaW1lUGF0dGVybjogJ2RkZGQsIG1tbW0gZCwgeXl5eSBoOk1NOnNzIFRUJyxcbiAgICBsb25nRGF0ZVBhdHRlcm46ICdkZGRkLCBtbW1tIGQsIHl5eXknLFxuICAgIGxvbmdUaW1lUGF0dGVybjogJ2g6TU06c3MgdHQnLFxuICAgIHNob3J0RGF0ZVBhdHRlcm46ICdtL2QveXl5eScsXG4gICAgc2hvcnREYXlOYW1lczogWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10sXG4gICAgc2hvcnRUaW1lUGF0dGVybjogJ2g6TU0gdHQnLFxuICAgIHRpbWVTZXBhcmF0b3I6ICc6J1xuICB9O1xuXG4gIGV4cG9ydCBjb25zdCBydSA9IDxEYXRlVGltZUZvcm1hdD57XG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ9GP0L3Qsi4nLCAn0YTQtdCy0YAuJywgJ9C80LDRgNGCJywgJ9Cw0L/RgC4nLCAn0LzQsNC5JywgJ9C40Y7QvdGMJywgJ9C40Y7Qu9GMJywgJ9Cw0LLQsy4nLCAn0YHQtdC90YIuJywgJ9C+0LrRgi4nLCAn0L3QvtGP0LEuJywgJ9C00LXQui4nXSxcbiAgICBkYXlOYW1lczogWyfQktC+0YHQutC/0LXRgdC10L3RjNC1JywgJ9Cf0L7QvdC10LTQtdC70YzQvdC40LonLCAn0JLRgtC+0YDQvdC40LonLCAn0KHRgNC10LTQsCcsICfQp9C10YLQstC10YDQsycsICfQn9GP0YLQvdC40YbQsCcsICfQodGD0LHQvtGC0LAnXSxcbiAgICBtb250aE5hbWVzOiBbXG4gICAgICAn0Y/QvdCy0LDRgNGMJyxcbiAgICAgICfRhNC10LLRgNCw0LvRjCcsXG4gICAgICAn0LzQsNGA0YInLFxuICAgICAgJ9Cw0L/RgNC10LvRjCcsXG4gICAgICAn0LzQsNC5JyxcbiAgICAgICfQuNGO0L3RjCcsXG4gICAgICAn0LjRjtC70YwnLFxuICAgICAgJ9Cw0LLQs9GD0YHRgicsXG4gICAgICAn0KHQtdC90YLRj9Cx0YDRjCcsXG4gICAgICAn0L7QutGC0Y/QsdGA0YwnLFxuICAgICAgJ9C90L7Rj9Cx0YDRjCcsXG4gICAgICAn0LTQtdC60LDQsdGA0YwnXSxcbiAgICBBTURlc2lnbmF0b3I6ICcnLFxuICAgIGZpcnN0RGF5T2ZXZWVrOiAwLFxuICAgIGZ1bGxEYXRlVGltZVBhdHRlcm46ICdkIG1tbW0geXl5eSBcXCfQsy5cXCcgSDptbTpzcycsXG4gICAgbG9uZ0RhdGVQYXR0ZXJuOiAnZCBtbW1tIHl5eXkgXFwn0LMuXFwnJyxcbiAgICBsb25nVGltZVBhdHRlcm46ICdIOk1NOnNzJyxcbiAgICBzaG9ydERhdGVQYXR0ZXJuOiAnZGQubW0ueXl5eScsXG4gICAgc2hvcnREYXlOYW1lczogWyfQkicsICfQnycsICfQkicsICfQoScsICfQpycsICfQnycsICfQoSddLFxuICAgIHNob3J0VGltZVBhdHRlcm46ICdIOk1NJyxcbiAgICB0aW1lU2VwYXJhdG9yOiAnOidcbiAgfTtcbn1cblxuY29uc3QgcmVnZXhKc29uTWlsbGlzZWNvbmRzID0gL1xcLlswLTldKyhafFxcK1swLTldezEsMn0oOlswLTldezEsMn0pPykkL2k7XG5cbmNvbnN0IGRhdGVGcm9tSnNvbiA9IChqc29uOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgZml4ZWQgPSBqc29uLnJlcGxhY2UocmVnZXhKc29uTWlsbGlzZWNvbmRzLCAnJDEnKTtcbiAgcmV0dXJuIG5ldyBEYXRlKGZpeGVkKTtcbn1cblxuY29uc3QgZGF0ZUZyb21UaW1lID0gKG1pbGxpc2Vjb25kczogbnVtYmVyKSA9PiB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBEYXRlKCk7XG4gIHJlc3VsdC5zZXRUaW1lKG1pbGxpc2Vjb25kcyk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmNvbnN0IHJlZ2V4VGltZVNwYW4gPSAvXigtKT8oKFswLTldKylcXC4pPyhbMC05XXsxLDJ9KTooWzAtOV17MSwyfSkoOihbMC05XXsxLDJ9KShcXC4oWzAtOV17MSwzfSkpPyk/JC87XG5cbmNvbnN0IG1vbnRoTGVuZ3RocyA9IFtcbiAgMzEsIC8vIGphblxuICBOYU4sIC8vIGZlYlxuICAzMSwgIC8vIG1hclxuICAzMCwgIC8vIGFwclxuICAzMSwgIC8vIG1heVxuICAzMCwgIC8vIGp1blxuICAzMSwgIC8vIGp1bFxuICAzMSwgIC8vIGF1Z1xuICAzMCwgIC8vIHNlcFxuICAzMSwgIC8vIG9rdFxuICAzMCwgIC8vIG5vdlxuICAzMSAgLy8gZGVjXG5dO1xuXG5jb25zdCBwb3cxMCA9IChuOiBudW1iZXIpID0+IHtcbiAgc3dpdGNoKG4pIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gMTA7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIDEwMDtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gMTAwMDtcbiAgICBkZWZhdWx0OlxuICAgICAgbGV0IHJlcyA9IDE7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICByZXMgKj0gMTA7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICB9XG59XG5cbmNvbnN0IHBhZDMgPSAobjogbnVtYmVyKSA9PiB7XG4gIGlmIChuIDwgMTApIHtcbiAgICByZXR1cm4gYDAwJHtufWA7XG4gIH1cbiAgaWYgKG4gPCAxMDApIHtcbiAgICByZXR1cm4gYDAke259YDtcbiAgfVxuICByZXR1cm4gU3RyaW5nKG4pO1xufVxuXG5jb25zdCBwYXJzZVRpbWVTdGFtcCA9IChpbnB1dDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IG0gPSByZWdleFRpbWVTcGFuLmV4ZWMoaW5wdXQpO1xuICBpZiAoIW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgdGltZXN0YW1wIHZhbHVlOiBcIiR7aW5wdXR9XCJgKTtcbiAgfVxuICBsZXQgbWlsbGlzZWNvbmRzID0gbVs5XSA/IHBhcnNlSW50KG1bOV0sIDEwKSAqIHBvdzEwKDMgLSBtWzldLmxlbmd0aCkgOiAwO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bN10sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bNV0sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bNF0sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luSG91cjtcbiAgbWlsbGlzZWNvbmRzICs9IChwYXJzZUludChtWzNdLCAxMCkgfHwgMCkgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkRheTtcbiAgaWYgKCctJyA9PT0gbVsxXSkge1xuICAgIG1pbGxpc2Vjb25kcyA9IC1taWxsaXNlY29uZHM7XG4gIH1cbiAgcmV0dXJuIG1pbGxpc2Vjb25kcztcbn1cblxuZXhwb3J0IGNsYXNzIFRpbWVTcGFuIGltcGxlbWVudHMgRXF1YXRhYmxlPFRpbWVTcGFuPiwgQ29tcGFyYWJsZTxUaW1lU3Bhbj4ge1xuICBzdGF0aWMgcmVhZG9ubHkgbWlsbGlzZWNvbmRzSW5TZWNvbmQgPSAxMDAwO1xuICBzdGF0aWMgcmVhZG9ubHkgbWlsbGlzZWNvbmRzSW5NaW51dGUgPSA2MDAwMDtcbiAgc3RhdGljIHJlYWRvbmx5IG1pbGxpc2Vjb25kc0luSG91ciA9IDM2MDAwMDA7XG4gIHN0YXRpYyByZWFkb25seSBtaWxsaXNlY29uZHNJbkRheSA9IDg2NDAwMDAwO1xuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlOiBudW1iZXJcbiAgZ2V0IG1pbGxpc2Vjb25kcygpIHsgcmV0dXJuIHRoaXMudmFsdWUgJSBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZDsgfVxuICBnZXQgc2Vjb25kcygpIHsgcmV0dXJuIE1hdGguZmxvb3IodGhpcy50b3RhbFNlY29uZHMpICUgNjA7IH1cbiAgZ2V0IG1pbnV0ZXMoKSB7IHJldHVybiBNYXRoLmZsb29yKHRoaXMudG90YWxNaW51dGVzKSAlIDYwOyB9XG4gIGdldCBob3VycygpIHsgcmV0dXJuIE1hdGguZmxvb3IodGhpcy50b3RhbEhvdXJzKSAlIDI0OyB9XG4gIGdldCBkYXlzKCkgeyByZXR1cm4gTWF0aC5mbG9vcih0aGlzLnRvdGFsRGF5cyk7IH1cbiAgZ2V0IHRvdGFsTWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gdGhpcy52YWx1ZTsgfVxuICBnZXQgdG90YWxTZWNvbmRzKCkgeyByZXR1cm4gdGhpcy52YWx1ZSAvIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kOyB9XG4gIGdldCB0b3RhbE1pbnV0ZXMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5NaW51dGU7IH1cbiAgZ2V0IHRvdGFsSG91cnMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyOyB9XG4gIGdldCB0b3RhbERheXMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXk7IH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aW1lc3BhbiBmb3IgdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgbWlsbGlzZWNvbmRzLlxuICAgKiBAcGFyYW0gbWlsbGlzZWNvbmRzIEFtb3VudCBvZiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtaWxsaXNlY29uZHM6IG51bWJlcik7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGltZXNwYW4gYnkgcGFyc2luZyBpdHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0gaW5wdXQgU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0aW1lc3Bhbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlucHV0OiBzdHJpbmcpO1xuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogbnVtYmVyfHN0cmluZykge1xuICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHNvdXJjZSkge1xuICAgICAgdGhpcy52YWx1ZSA9IHNvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52YWx1ZSA9IHBhcnNlVGltZVN0YW1wKHNvdXJjZSk7XG4gICAgfVxuICB9XG4gIGFicygpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKE1hdGguYWJzKHRoaXMudmFsdWUpKTtcbiAgfVxuICBhZGRNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKHRoaXMudmFsdWUgKyBtaWxsaXNlY29uZHMpO1xuICB9XG4gIGFkZFNlY29uZHMoc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHNlY29uZHMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZCk7XG4gIH1cbiAgYWRkTWludXRlcyhtaW51dGVzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMobWludXRlcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlKTtcbiAgfVxuICBhZGRIb3Vycyhob3VyczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKGhvdXJzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyKTtcbiAgfVxuICBhZGREYXlzKGRheXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhkYXlzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXkpO1xuICB9XG4gIGFkZCh2YWx1ZTogVGltZVNwYW58bnVtYmVyKSB7XG4gICAgY29uc3QgbWlsbGlzZWNvbmRzID0gdmFsdWUgaW5zdGFuY2VvZiBUaW1lU3BhbiA/IHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzIDogdmFsdWU7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKG1pbGxpc2Vjb25kcyk7XG4gIH1cbiAgbmVnKCkge1xuICAgIHJldHVybiBuZXcgVGltZVNwYW4oLTEgKiB0aGlzLnZhbHVlKTtcbiAgfVxuICBzdWJNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVTcGFuKHRoaXMudmFsdWUgLSBtaWxsaXNlY29uZHMpO1xuICB9XG4gIHN1YlNlY29uZHMoc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKHNlY29uZHMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJblNlY29uZCk7XG4gIH1cbiAgc3ViTWludXRlcyhtaW51dGVzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJNaWxsaXNlY29uZHMobWludXRlcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlKTtcbiAgfVxuICBzdWJIb3Vycyhob3VyczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKGhvdXJzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyKTtcbiAgfVxuICBzdWJEYXlzKGRheXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnN1Yk1pbGxpc2Vjb25kcyhkYXlzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5EYXkpO1xuICB9XG4gIHN1Yih2YWx1ZTogVGltZVNwYW58bnVtYmVyKSB7XG4gICAgY29uc3QgbWlsbGlzZWNvbmRzID0gdmFsdWUgaW5zdGFuY2VvZiBUaW1lU3BhbiA/IHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzIDogdmFsdWU7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKG1pbGxpc2Vjb25kcyk7XG4gIH1cblxuICBlcXVhbHNUbyhvdGhlcjogVGltZVNwYW4pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XG4gIH1cblxuICBjb21wYXJlVG8ob3RoZXI6IFRpbWVTcGFuKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWUgPiBvdGhlci52YWx1ZSA/IDEgOiAodGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWUgPyAwIDogLTEpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMudmFsdWUgPCAwKSB7XG4gICAgICByZXR1cm4gYC0ke3RoaXMuYWJzKCl9YDtcbiAgICB9XG4gICAgY29uc3QgZGF5cyA9IHRoaXMuZGF5cztcbiAgICBjb25zdCBob3VycyA9IHRoaXMuaG91cnM7XG4gICAgY29uc3QgbWludXRlcyA9IHRoaXMubWludXRlcztcbiAgICBjb25zdCBzZWNvbmRzID0gdGhpcy5zZWNvbmRzO1xuICAgIGNvbnN0IG1pbGxpc2Vjb25kcyA9IHRoaXMubWlsbGlzZWNvbmRzO1xuICAgIGlmIChkYXlzKSB7XG4gICAgICBpZiAoc2Vjb25kcyB8fCAhbWlsbGlzZWNvbmRzKSB7XG4gICAgICAgIHJldHVybiBgJHtkYXlzfS4ke2hvdXJzfS4ke21pbnV0ZXN9LiR7c2Vjb25kc31gO1xuICAgICAgfVxuICAgICAgaWYgKG1pbGxpc2Vjb25kcykge1xuICAgICAgICByZXR1cm4gYCR7ZGF5c30uJHtob3Vyc30uJHttaW51dGVzfS4ke3NlY29uZHN9LiR7cGFkMyhtaWxsaXNlY29uZHMpfWA7XG4gICAgICB9XG4gICAgICByZXR1cm4gYCR7ZGF5c30uJHtob3Vyc30uJHttaW51dGVzfWA7XG4gICAgfVxuICAgIGlmIChzZWNvbmRzIHx8ICFtaWxsaXNlY29uZHMpIHtcbiAgICAgIHJldHVybiBgJHtob3Vyc30uJHttaW51dGVzfS4ke3NlY29uZHN9YDtcbiAgICB9XG4gICAgaWYgKG1pbGxpc2Vjb25kcykge1xuICAgICAgcmV0dXJuIGAke2hvdXJzfS4ke21pbnV0ZXN9LiR7c2Vjb25kc30uJHtwYWQzKG1pbGxpc2Vjb25kcyl9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAke2hvdXJzfS4ke21pbnV0ZXN9YDtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERhdGVUaW1lSW5pdCB7XG4gIHllYXI/OiBudW1iZXI7XG4gIG1vbnRoPzogbnVtYmVyO1xuICBkYXk/OiBudW1iZXI7XG4gIGhvdXJzPzogbnVtYmVyO1xuICBtaW51dGVzPzogbnVtYmVyO1xuICBzZWNvbmRzPzogbnVtYmVyO1xuICBtaWxsaXNlY29uZHM/OiBudW1iZXI7XG59XG5cbmNvbnN0IHBhdHRlcm5zID0ge1xuICBkOiBTeW1ib2woJ2QnKSxcbiAgZGQ6IFN5bWJvbCgnZGQnKSxcbiAgZGRkOiBTeW1ib2woJ2RkZCcpLFxuICBkZGRkOiBTeW1ib2woJ2RkZGQnKSxcbiAgbTogU3ltYm9sKCdtJyksXG4gIG1tOiBTeW1ib2woJ21tJyksXG4gIG1tbTogU3ltYm9sKCdtbW0nKSxcbiAgbW1tbTogU3ltYm9sKCdtbW1tJyksXG4gIHl5OiBTeW1ib2woJ3l5JyksXG4gIHl5eXk6IFN5bWJvbCgneXl5eScpLFxuICBoOiBTeW1ib2woJ2gnKSxcbiAgaGg6IFN5bWJvbCgnaGgnKSxcbiAgSDogU3ltYm9sKCdIJyksXG4gIEhIOiBTeW1ib2woJ0hIJyksXG4gIE06IFN5bWJvbCgnTScpLFxuICBNTTogU3ltYm9sKCdNTScpLFxuICBzOiBTeW1ib2woJ3MnKSxcbiAgc3M6IFN5bWJvbCgnc3MnKSxcbiAgdHQ6IFN5bWJvbCgndHQnKSxcbiAgVFQ6IFN5bWJvbCgnVFQnKSxcbn07XG5cbmNvbnN0IHBhdHRlcm5LZXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgeDogW3N0cmluZywgU3ltYm9sXVtdID0gW107XG4gIE9iamVjdC5rZXlzKHBhdHRlcm5zKS5mb3JFYWNoKGsgPT4ge1xuICAgIHgucHVzaChbaywgPFN5bWJvbD4oPGFueT5wYXR0ZXJucylba11dKTtcbiAgfSk7XG4gIHguc29ydCgoW2sxLCBfXSwgW2syLCBfX10pID0+IGsxLmxlbmd0aCA9PT0gazIubGVuZ3RoID8gKGsxIDwgazIgPyAtMSA6IChrMSA9PT0gazIgPyAwIDogLTEpKSA6IGsxLmxlbmd0aCA8IGsyLmxlbmd0aCA/IDEgOiAtMSk7XG4gIHJldHVybiB4O1xufSgpKTtcblxudHlwZSBGb3JtYXRUb2tlbiA9IHN0cmluZ3xTeW1ib2w7XG5cbmZ1bmN0aW9uIHBhcnNlRm9ybWF0KHNvdXJjZTogc3RyaW5nLCBpbmRleDogbnVtYmVyLCB0b2tlbnM6IEZvcm1hdFRva2VuW10pOiBGb3JtYXRUb2tlbltdIHtcbiAgaWYgKGluZGV4ID49IHNvdXJjZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG4gIGlmICgnXFwnJyA9PT0gc291cmNlW2luZGV4XSkge1xuICAgIGNvbnN0IGNsb3NpbmcgPSBzb3VyY2UuaW5kZXhPZignXFwnJywgaW5kZXggKyAxKTtcbiAgICBpZiAoLTEgPT09IGNsb3NpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5jbG9zZWQgcXVvdGUnKTtcbiAgICB9XG4gICAgdG9rZW5zLnB1c2goc291cmNlLnN1YnN0cmluZyhpbmRleCArIDEsIGNsb3NpbmcpKTtcbiAgICByZXR1cm4gcGFyc2VGb3JtYXQoc291cmNlLCBjbG9zaW5nICsgMSwgdG9rZW5zKTtcbiAgfVxuICAvLyBjaGVjayBmb3JtYXRzXG4gIGZvciAoY29uc3QgW2ssIHNdIG9mIHBhdHRlcm5LZXlzKSB7XG4gICAgaWYgKGluZGV4ID09PSBzb3VyY2UuaW5kZXhPZihrLCBpbmRleCkpIHtcbiAgICAgIHRva2Vucy5wdXNoKHMpO1xuICAgICAgcmV0dXJuIHBhcnNlRm9ybWF0KHNvdXJjZSwgaW5kZXggKyBrLmxlbmd0aCwgdG9rZW5zKTtcbiAgICB9XG4gIH1cbiAgLy8gcGxhaW4gdGV4dFxuICBjb25zdCBsID0gdG9rZW5zLmxlbmd0aDtcbiAgaWYgKGwgJiYgJ3N0cmluZycgPT09IHR5cGVvZiB0b2tlbnNbbF0pIHtcbiAgICB0b2tlbnNbbF0gKz0gc291cmNlW2luZGV4XTtcbiAgfSBlbHNlIHtcbiAgICB0b2tlbnMucHVzaChzb3VyY2VbaW5kZXhdKTtcbiAgfVxuICByZXR1cm4gcGFyc2VGb3JtYXQoc291cmNlLCBpbmRleCArIDEsIHRva2Vucyk7XG59XG5cbmNvbnN0IGZvcm1hdENhY2hlOiB7IFtmbXQ6IHN0cmluZ106IEZvcm1hdFRva2VuW118dW5kZWZpbmVkIH0gPSB7fTtcblxuY29uc3QgcGFyc2VGb3JtYXRDYWNoZWQgPSAoc291cmNlOiBzdHJpbmcpOiBGb3JtYXRUb2tlbltdID0+IHtcbiAgbGV0IHRva2VucyA9IGZvcm1hdENhY2hlW3NvdXJjZV07XG4gIGlmICh0b2tlbnMpIHtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG4gIHRva2VucyA9IHBhcnNlRm9ybWF0KHNvdXJjZSwgMCwgW10pO1xuICBmb3JtYXRDYWNoZVtzb3VyY2VdID0gdG9rZW5zO1xuICByZXR1cm4gdG9rZW5zO1xufVxuXG5jb25zdCBwYWRaZXJvOiAoc291cmNlOiBzdHJpbmcsIG46IG51bWJlcikgPT4gc3RyaW5nID0gKGZ1bmN0aW9uICgpIHtcbiAgaWYgKCg8YW55PlN0cmluZy5wcm90b3R5cGUpLnBhZFN0YXJ0KSB7XG4gICAgY29uc3QgcGFkOiAobjogbnVtYmVyLCBwYWRTdHJpbmc6IHN0cmluZykgPT4gc3RyaW5nID0gKDxhbnk+U3RyaW5nLnByb3RvdHlwZSkucGFkU3RhcnQ7XG4gICAgcmV0dXJuIChzb3VyY2U6IHN0cmluZywgbjogbnVtYmVyKSA9PiBwYWQuY2FsbChzb3VyY2UsIG4sICcwJyk7XG4gIH1cbiAgcmV0dXJuIChzb3VyY2U6IHN0cmluZywgbjogbnVtYmVyKSA9PiB7XG4gICAgbGV0IHJlc3VsdCA9IHNvdXJjZTtcbiAgICB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IG4pIHtcbiAgICAgIHJlc3VsdCA9ICcwJyArIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn0oKSk7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShzb3VyY2U6IERhdGVUaW1lLCB0b2tlbnM6IEZvcm1hdFRva2VuW10sIGZvcm1hdDogRGF0ZVRpbWVGb3JtYXQpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gdG9rZW47XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5kID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UuZGF5KTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5kYXkpLCAyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkZCA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBmb3JtYXQuc2hvcnREYXlOYW1lc1tzb3VyY2UuZGF5T2ZXZWVrXTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmRkZGQgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gZm9ybWF0LmRheU5hbWVzW3NvdXJjZS5kYXlPZldlZWtdO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMubSA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLm1vbnRoKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLm1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5tb250aCksIDIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMubW1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IGZvcm1hdC5hYmJyZXZpYXRlZE1vbnRoTmFtZXNbc291cmNlLm1vbnRoIC0gMV07XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5tbW1tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IGZvcm1hdC5tb250aE5hbWVzW3NvdXJjZS5tb250aCAtIDFdO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMueXkgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS55ZWFyICUgMTAwKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLnl5eXkgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS55ZWFyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmggPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS5ob3VycyAlIDEyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmhoID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5ob3VycyAlIDEyKSwgMik7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5IID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UuaG91cnMpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuSEggPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLmhvdXJzKSwgMik7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5NID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UubWludXRlcyk7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5NTSA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBwYWRaZXJvKFN0cmluZyhzb3VyY2UubWludXRlcyksIDIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMucyA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLnNlY29uZHMpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuc3MgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLnNlY29uZHMpLCAyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLnR0ID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHNvdXJjZS5ob3VycyA+IDExID8gJ3BtJzogJ2FtJztcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLlRUID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHNvdXJjZS5ob3VycyA+IDExID8gJ1BNJzogJ0FNJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZvdG1hdCB0b2tlbicpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5jb25zdCBmb3JtYXRDdXN0b20gPSAoc291cmNlOiBEYXRlVGltZSwgZm10OiBzdHJpbmcsIGZvcm1hdDogRGF0ZVRpbWVGb3JtYXQpOiBzdHJpbmcgPT4ge1xuICBjb25zdCB0b2tlbnMgPSBwYXJzZUZvcm1hdENhY2hlZChmbXQpO1xuICByZXR1cm4gc3RyaW5naWZ5KHNvdXJjZSwgdG9rZW5zLCBmb3JtYXQpO1xufTtcblxuY29uc3QgZm9ybWF0U3RhbmRhcmQgPSAoc291cmNlOiBEYXRlVGltZSwgZm10OiAnZCd8J0QnfCdmJ3wnRid8J2cnfCdHJywgZm9ybWF0OiBEYXRlVGltZUZvcm1hdCkgPT4ge1xuICBzd2l0Y2goZm10KSB7XG4gICAgY2FzZSAnZCc6XG4gICAgICByZXR1cm4gZm9ybWF0Q3VzdG9tKHNvdXJjZSwgZm9ybWF0LnNob3J0RGF0ZVBhdHRlcm4sIGZvcm1hdCk7XG4gICAgY2FzZSAnRCc6XG4gICAgICByZXR1cm4gZm9ybWF0Q3VzdG9tKHNvdXJjZSwgZm9ybWF0LmxvbmdEYXRlUGF0dGVybiwgZm9ybWF0KTtcbiAgICBjYXNlICdmJzpcbiAgICBjYXNlICdGJzpcbiAgICAgIHJldHVybiBmb3JtYXRDdXN0b20oc291cmNlLCBmb3JtYXQuZnVsbERhdGVUaW1lUGF0dGVybiwgZm9ybWF0KTtcbiAgICBjYXNlICdnJzpcbiAgICAgIHJldHVybiBmb3JtYXRDdXN0b20oc291cmNlLCBmb3JtYXQuc2hvcnREYXRlUGF0dGVybiArICcgJyArIGZvcm1hdC5zaG9ydFRpbWVQYXR0ZXJuLCBmb3JtYXQpO1xuICAgIGNhc2UgJ0cnOlxuICAgICAgcmV0dXJuIGZvcm1hdEN1c3RvbShzb3VyY2UsIGZvcm1hdC5zaG9ydERhdGVQYXR0ZXJuICsgJyAnICsgZm9ybWF0LmxvbmdUaW1lUGF0dGVybiwgZm9ybWF0KTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3Nob3VsZCBuZXZlciBoYXBwZW4nKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBEYXRlVGltZSBpbXBsZW1lbnRzIEVxdWF0YWJsZTxEYXRlVGltZT4sIENvbXBhcmFibGU8RGF0ZVRpbWU+IHtcblxuICBzdGF0aWMgZGVmYXVsdEZvcm1hdFByb3ZpZGVyID0gRm9ybWF0cy5odTtcbiAgc3RhdGljIGRlZmF1bHRGb3JtYXQgPSAnZyc7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW1vdW50IG9mIGRheXMgaW4gdGhlIHNwZWNpZmllZCBtb250aC5cbiAgICogQHBhcmFtIG1vbnRoIE1vbnRoLlxuICAgKiBAcGFyYW0geWVhciBZZWFyLlxuICAgKi9cbiAgc3RhdGljIGdldE1vbnRoTGVuZ3RoKG1vbnRoOiBudW1iZXIsIHllYXI6IG51bWJlcikge1xuICAgIGlmIChtb250aCA8IDEgfHwgbW9udGggPiAxMikge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignbW9udGggb3V0IG9mIHJhbmdlJyk7XG4gICAgfVxuICAgIGlmIChtb250aCAhPT0gMikge1xuICAgICAgICByZXR1cm4gbW9udGhMZW5ndGhzW21vbnRoIC0gMV07XG4gICAgfVxuICAgIHJldHVybiAoMCA9PT0geWVhciAlIDQgJiYgKDAgIT09IHllYXIgJSAxMDAgfHwgMCA9PT0geWVhciAlIDQwMCkpID8gMjkgOiAyODtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZG9ubHkgc291cmNlOiBEYXRlXG4gIGdldCBpc1ZhbGlkKCkgeyByZXR1cm4gIWlzTmFOKHRoaXMuc291cmNlLmdldFRpbWUoKSk7IH1cbiAgZ2V0IHllYXIoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRGdWxsWWVhcigpOyB9XG4gIGdldCBtb250aCgpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldE1vbnRoKCkgKyAxOyB9XG4gIGdldCBkYXkoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXREYXRlKCk7IH1cbiAgZ2V0IGRheU9mV2VlaygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldERheSgpOyB9XG4gIGdldCBob3VycygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldEhvdXJzKCk7IH1cbiAgZ2V0IG1pbnV0ZXMoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRNaW51dGVzKCk7IH1cbiAgZ2V0IHNlY29uZHMoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRTZWNvbmRzKCk7IH1cbiAgZ2V0IG1pbGxpc2Vjb25kcygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldE1pbGxpc2Vjb25kcygpOyB9XG5cbiAgLyoqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIGRhdGV0aW1lIGZvciBhY3R1YWwgZGF0ZSBhbmQgdGltZS4gKi9cbiAgY29uc3RydWN0b3IoKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgZGF0ZXRpbWUgZnJvbSB0aGUgc3BlY2lmaWVkIGRhdGUuXG4gICAqIEBwYXJhbSBzb3VyY2UgRGF0ZSBvYmplY3QgdG8gdXNlLlxuICAgKi9cbiAgY29uc3RydWN0b3Ioc291cmNlOiBEYXRlKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgZGF0ZXRpbWUgZnJvbSB0aGUgc3BlY2lmaWVkIEpTT04gc3RyaW5nIHJlcHJlc2VudGluZyBkYXRlLlxuICAgKiBAcGFyYW0ganNvbiBKU09OIHN0cmluZyByZXByZXNlbnRpbmcgZGF0ZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGpzb246IHN0cmluZyk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIGRhdGV0aW1lIGZyb20gdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgbWlsbGlzZWNvbmRzIGZyb20gMTk3MCBqYW4gMSBVVEMuXG4gICAqIEBwYXJhbSBzb3VyY2UgQW1vdW50IG9mIG1pbGxpc2Vjb25kcyBmcm9tIDE5NzAgamFuIDEgVVRDLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWlsbGlzZWNvbmRzOiBudW1iZXIpO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBkYXRldGltZSBmcm9tIHRoZSBzcGVjaWZpZWQgaW5pdGlhbGl6ZXIuXG4gICAqIEBwYXJhbSBzb3VyY2UgSW5pdGlhbGl6ZXIgb2JqZWN0IHRvIHVzZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGluaXQ6IERhdGVUaW1lSW5pdCk7XG5cbiAgY29uc3RydWN0b3IgKHNvdXJjZT86IERhdGV8c3RyaW5nfG51bWJlcnxEYXRlVGltZUluaXQpIHtcbiAgICBpZiAodW5kZWZpbmVkID09PSBzb3VyY2UgfHwgbnVsbCA9PT0gc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IG5ldyBEYXRlKCk7XG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNvdXJjZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBkYXRlRnJvbUpzb24oc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKCdudW1iZXInID09PSB0eXBlb2Ygc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IGRhdGVGcm9tVGltZShzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGFzc3VtZSBpbml0XG4gICAgICBjb25zdCBpbml0ID0gPERhdGVUaW1lSW5pdD5zb3VyY2U7XG4gICAgICB0aGlzLnNvdXJjZSA9IG5ldyBEYXRlKGluaXQueWVhciB8fCBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCksIGluaXQubW9udGggPyBpbml0Lm1vbnRoIC0gMSA6IDAsIGluaXQuZGF5IHx8IDEsIGluaXQuaG91cnMgfHwgMCwgaW5pdC5taW51dGVzIHx8IDAsIGluaXQuc2Vjb25kcyB8fCAwLCBpbml0Lm1pbGxpc2Vjb25kcyB8fCAwKTtcbiAgICB9XG4gIH1cblxuICBlcXVhbHNUbyhvdGhlcjogRGF0ZVRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UuZ2V0VGltZSgpID09PSBvdGhlci5zb3VyY2UuZ2V0VGltZSgpO1xuICB9XG5cbiAgY29tcGFyZVRvKG90aGVyOiBEYXRlVGltZSkge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZSA8IG90aGVyLnNvdXJjZSA/IC0xIDogKHRoaXMuZXF1YWxzVG8ob3RoZXIpID8gMCA6IDEpO1xuICB9XG5cbiAgYWRkTWlsbGlzZWNvbmRzKG1pbGxpc2Vjb25kczogbnVtYmVyKSB7XG4gICAgY29uc3QgcmVzID0gZGF0ZUZyb21UaW1lKHRoaXMuc291cmNlLmdldFRpbWUoKSArIG1pbGxpc2Vjb25kcyk7XG4gICAgY29uc3Qgb2Zmc2V0RGVsdGEgPSB0aGlzLnNvdXJjZS5nZXRUaW1lem9uZU9mZnNldCgpIC0gcmVzLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgaWYgKG9mZnNldERlbHRhICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IGFkanVzdCA9IG9mZnNldERlbHRhICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5NaW51dGU7XG4gICAgICAgIHJlcy5zZXRUaW1lKHJlcy5nZXRUaW1lKCkgLSBhZGp1c3QpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGVUaW1lKHJlcyk7XG4gIH1cblxuICBhZGRTZWNvbmRzKHNlY29uZHM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhzZWNvbmRzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5TZWNvbmQpO1xuICB9XG5cbiAgYWRkTWludXRlcyhtaW51dGVzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMobWludXRlcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlKTtcbiAgfVxuXG4gIGFkZEhvdXJzKGhvdXJzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMoaG91cnMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkhvdXIpO1xuICB9XG5cbiAgYWRkRGF5cyhkYXlzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMoZGF5cyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luRGF5KTtcbiAgfVxuXG4gIGFkZE1vbnRocyhtb250aHM6IG51bWJlcikge1xuICAgIGlmICgwID09PSBtb250aHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkRGF5cygwKTtcbiAgICB9XG4gICAgaWYgKDAgPCBtb250aHMpIHtcbiAgICAgIGNvbnN0IGZ1bGwgPSBNYXRoLmZsb29yKG1vbnRocykgKyAodGhpcy5tb250aCAtIDEpO1xuICAgICAgY29uc3QgZm0gPSBmdWxsICUgMTI7XG4gICAgICBjb25zdCBmeSA9IE1hdGguZmxvb3IoZnVsbCAvIDEyKTtcbiAgICAgIGxldCByZXMgPSBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICB5ZWFyOiB0aGlzLnllYXIgKyBmeSxcbiAgICAgICAgbW9udGg6IGZtICsgMSxcbiAgICAgICAgZGF5OiBNYXRoLm1pbihEYXRlVGltZS5nZXRNb250aExlbmd0aChmbSArIDEsIHRoaXMueWVhciArIGZ5KSwgdGhpcy5kYXkpLFxuICAgICAgICBob3VyczogdGhpcy5ob3VycyxcbiAgICAgICAgbWludXRlczogdGhpcy5taW51dGVzLFxuICAgICAgICBzZWNvbmRzOiB0aGlzLnNlY29uZHMsXG4gICAgICAgIG1pbGxpc2Vjb25kczogdGhpcy5taWxsaXNlY29uZHNcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcGFydCA9IG1vbnRocyAlIDE7XG4gICAgICBpZiAoMCA9PT0gcGFydCkge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcy5hZGREYXlzKERhdGVUaW1lLmdldE1vbnRoTGVuZ3RoKHJlcy5tb250aCwgcmVzLnllYXIpICogcGFydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFicyA9IE1hdGguYWJzKG1vbnRocyk7XG4gICAgICBsZXQgbSA9ICh0aGlzLm1vbnRoIC0gMSkgLSBNYXRoLmZsb29yKGFicyk7XG4gICAgICBsZXQgeSA9IHRoaXMueWVhcjtcbiAgICAgIHdoaWxlICgwID4gbSkge1xuICAgICAgICB5ID0geSAtIDE7XG4gICAgICAgIG0gPSBtICsgMTI7XG4gICAgICB9XG4gICAgICBjb25zdCBwYXJ0ID0gYWJzICUgMTtcbiAgICAgIGlmICgwID09PSBwYXJ0KSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICAgIHllYXI6IHksXG4gICAgICAgICAgbW9udGg6IG0gKyAxLFxuICAgICAgICAgIGRheTogdGhpcy5kYXksXG4gICAgICAgICAgaG91cnM6IHRoaXMuaG91cnMsXG4gICAgICAgICAgbWludXRlczogdGhpcy5taW51dGVzLFxuICAgICAgICAgIHNlY29uZHM6IHRoaXMuc2Vjb25kcyxcbiAgICAgICAgICBtaWxsaXNlY29uZHM6IHRoaXMubWlsbGlzZWNvbmRzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKDAgPT09IG0pIHtcbiAgICAgICAgICB5ID0geSAtIDE7XG4gICAgICAgICAgbSA9IDExO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtID0gbSAtIDE7XG4gICAgICB9XG4gICAgICBjb25zdCBkYXlzID0gRGF0ZVRpbWUuZ2V0TW9udGhMZW5ndGgobSArIDEsIHkpO1xuICAgICAgY29uc3QgdG9BZGQgPSBkYXlzICogKDEgLSBwYXJ0KTtcbiAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICB5ZWFyOiB5LFxuICAgICAgICBtb250aDogbSxcbiAgICAgICAgZGF5OiB0aGlzLmRheSxcbiAgICAgICAgaG91cnM6IHRoaXMuaG91cnMsXG4gICAgICAgIG1pbnV0ZXM6IHRoaXMubWludXRlcyxcbiAgICAgICAgc2Vjb25kczogdGhpcy5zZWNvbmRzLFxuICAgICAgICBtaWxsaXNlY29uZHM6IHRoaXMubWlsbGlzZWNvbmRzXG4gICAgICB9KS5hZGREYXlzKHRvQWRkKTtcbiAgICB9XG4gIH1cbiAgYWRkKHRpbWVTcGFuOiBUaW1lU3Bhbik6IERhdGVUaW1lO1xuICBhZGQobWlsbGlzZWNvbmRzOiBudW1iZXIpOiBEYXRlVGltZTtcbiAgYWRkKHZhbHVlOiBUaW1lU3BhbnxudW1iZXIpIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lU3Bhbikge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHZhbHVlKTtcbiAgfVxuICBzdWJzdHJhY3Qob3RoZXI6IERhdGVUaW1lKTogVGltZVNwYW47XG4gIHN1YnN0cmFjdCh0aW1lc3BhbjogVGltZVNwYW4pOiBEYXRlVGltZTtcbiAgc3Vic3RyYWN0KG1pbGxpc2Vjb25kczogbnVtYmVyKTogRGF0ZVRpbWU7XG4gIHN1YnN0cmFjdCh2YWx1ZTogRGF0ZVRpbWV8VGltZVNwYW58bnVtYmVyKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZVRpbWUpIHtcbiAgICAgIHJldHVybiBuZXcgVGltZVNwYW4odGhpcy5zb3VyY2UuZ2V0VGltZSgpIC0gdmFsdWUuc291cmNlLmdldFRpbWUoKSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVTcGFuKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGQoLTEgKiB2YWx1ZS50b3RhbE1pbGxpc2Vjb25kcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFkZCgtMSAqIHZhbHVlKTtcbiAgfVxuICB0b0RhdGUoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IERhdGUoKTtcbiAgICByZXN1bHQuc2V0VGltZSh0aGlzLnNvdXJjZS5nZXRUaW1lKCkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcHJpdmF0ZSBmb3JtYXQoZm9ybWF0OiBzdHJpbmcsIHByb3ZpZGVyOiBEYXRlVGltZUZvcm1hdCk6IHN0cmluZyB7XG4gICAgaWYgKCdkJyA9PT0gZm9ybWF0IHx8ICdEJyA9PT0gZm9ybWF0IHx8ICdmJyA9PT0gZm9ybWF0IHx8ICdGJyA9PT0gZm9ybWF0IHx8ICdnJyA9PT0gZm9ybWF0IHx8ICdHJyA9PT0gZm9ybWF0KSB7XG4gICAgICByZXR1cm4gZm9ybWF0U3RhbmRhcmQodGhpcywgZm9ybWF0LCBwcm92aWRlcik7XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXRDdXN0b20odGhpcywgZm9ybWF0LCBwcm92aWRlcik7XG4gIH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXQ6IHN0cmluZyk6IHN0cmluZztcbiAgdG9TdHJpbmcocHJvdmlkZXI6IERhdGVUaW1lRm9ybWF0KTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXQ6IHN0cmluZywgcHJvdmlkZXI6IERhdGVUaW1lRm9ybWF0KTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXRPclByb3ZpZGVyPzogc3RyaW5nfERhdGVUaW1lRm9ybWF0LCBwcm92aWRlcj86IERhdGVUaW1lRm9ybWF0KSB7XG4gICAgaWYgKCFwcm92aWRlcikge1xuICAgICAgaWYgKCFmb3JtYXRPclByb3ZpZGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdChEYXRlVGltZS5kZWZhdWx0Rm9ybWF0LCBEYXRlVGltZS5kZWZhdWx0Rm9ybWF0UHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGZvcm1hdE9yUHJvdmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0KGZvcm1hdE9yUHJvdmlkZXIsIERhdGVUaW1lLmRlZmF1bHRGb3JtYXRQcm92aWRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQoRGF0ZVRpbWUuZGVmYXVsdEZvcm1hdCwgZm9ybWF0T3JQcm92aWRlcik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGZvcm1hdE9yUHJvdmlkZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmb3JtYXQgYXJndW1lbnQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0KGZvcm1hdE9yUHJvdmlkZXIsIHByb3ZpZGVyKTtcbiAgfVxufSJdfQ==