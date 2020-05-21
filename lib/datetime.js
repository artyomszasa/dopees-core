export var Formats;
(function (Formats) {
    Formats.hu = {
        locale: 'hu-HU',
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
            'December'
        ],
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
    Formats.enUS = {
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
            'December'
        ],
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
    Formats.ru = {
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
let TimeSpan = /** @class */ (() => {
    class TimeSpan {
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
    return TimeSpan;
})();
export { TimeSpan };
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
let DateTime = /** @class */ (() => {
    class DateTime {
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
    return DateTime;
})();
export { DateTime };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXRpbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGF0ZXRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBa0JBLE1BQU0sS0FBVyxPQUFPLENBaUh2QjtBQWpIRCxXQUFpQixPQUFPO0lBQ1QsVUFBRSxHQUFtQjtRQUNoQyxNQUFNLEVBQUUsT0FBTztRQUNmLHFCQUFxQixFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDN0csUUFBUSxFQUFFLENBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDO1FBQ3BGLFVBQVUsRUFBRTtZQUNWLFFBQVE7WUFDUixTQUFTO1lBQ1QsU0FBUztZQUNULFNBQVM7WUFDVCxPQUFPO1lBQ1AsUUFBUTtZQUNSLFFBQVE7WUFDUixXQUFXO1lBQ1gsWUFBWTtZQUNaLFNBQVM7WUFDVCxVQUFVO1lBQ1YsVUFBVTtTQUFDO1FBQ2IsWUFBWSxFQUFFLEVBQUU7UUFDaEIsY0FBYyxFQUFFLENBQUM7UUFDakIsbUJBQW1CLEVBQUUseUJBQXlCO1FBQzlDLGVBQWUsRUFBRSxnQkFBZ0I7UUFDakMsZUFBZSxFQUFFLFVBQVU7UUFDM0IsZ0JBQWdCLEVBQUUsYUFBYTtRQUMvQixhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7UUFDckQsZ0JBQWdCLEVBQUUsT0FBTztRQUN6QixhQUFhLEVBQUUsR0FBRztLQUNuQixDQUFDO0lBRVcsWUFBSSxHQUFtQjtRQUNsQyxNQUFNLEVBQUUsT0FBTztRQUNmLHFCQUFxQixFQUFFLENBQUMs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QUssR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNqRDthQUFNLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7WUFDL0IsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM1QzthQUFNLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7WUFDL0IsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM5QzthQUFNLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7WUFDL0IsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM5QzthQUFNLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxLQUFLLEVBQUU7WUFDaEMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUMzQzthQUFNLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxLQUFLLEVBQUU7WUFDaEMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxL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USxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztpQkFDNUU7cUJBQU0sSUFBSSxRQUFRLEtBQUssT0FBTyxnQkFBZ0IsRUFBRTtvQkFDL0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUN0RTtxQkFBTTtvQkFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUM5RDthQUNGO1lBQ0QsSUFBSSxRQUFRLEtBQUssT0FBTyxnQkFBZ0IsRUFBRTtnQkFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELENBQUM7O0lBL05NLDhCQUFxQixHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDbkMsc0JBQWEsR0FBRyxHQUFHLENBQUM7SUErTjdCLGVBQUM7S0FBQTtTQWxPWSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXF1YXRhYmxlLCBDb21wYXJhYmxlIH0gZnJvbSAnLi9jb250cmFjdCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0ZVRpbWVGb3JtYXQge1xuICByZWFkb25seSBsb2NhbGU6IHN0cmluZztcbiAgcmVhZG9ubHkgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBzdHJpbmdbXTtcbiAgcmVhZG9ubHkgZGF5TmFtZXM6IHN0cmluZ1tdO1xuICByZWFkb25seSBtb250aE5hbWVzOiBzdHJpbmdbXTtcbiAgcmVhZG9ubHkgQU1EZXNpZ25hdG9yOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGZpcnN0RGF5T2ZXZWVrOiBudW1iZXI7XG4gIHJlYWRvbmx5IGZ1bGxEYXRlVGltZVBhdHRlcm46IHN0cmluZztcbiAgcmVhZG9ubHkgbG9uZ0RhdGVQYXR0ZXJuOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGxvbmdUaW1lUGF0dGVybjogc3RyaW5nO1xuICByZWFkb25seSBzaG9ydERhdGVQYXR0ZXJuOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHNob3J0RGF5TmFtZXM6IHN0cmluZ1tdO1xuICByZWFkb25seSBzaG9ydFRpbWVQYXR0ZXJuOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHRpbWVTZXBhcmF0b3I6IHN0cmluZztcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBGb3JtYXRzIHtcbiAgZXhwb3J0IGNvbnN0IGh1OiBEYXRlVGltZUZvcm1hdCA9IHtcbiAgICBsb2NhbGU6ICdodS1IVScsXG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ0phbicsICdGZWInLCAnTcOhcicsICfDgXByJywgJ03DoWonLCAnSsO6bicsICdKw7psJywgJ0F1ZycsICdTemVwdCcsICdPa3QnLCAnTm92JywgJ0RlYyddLFxuICAgIGRheU5hbWVzOiBbICdWYXPDoXJuYXAnLCAnSMOpdGbFkScsICdLZWRkJywgJ1N6ZXJkYScsICdDc8O8dMO2cnTDtmsnLCAnUMOpbnRlaycsICdTem9tYmF0J10sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ0phbnXDoXInLFxuICAgICAgJ0ZlYnJ1w6FyJyxcbiAgICAgICdNw6FyY2l1cycsXG4gICAgICAnw4FwcmlsaXMnLFxuICAgICAgJ03DoWp1cycsXG4gICAgICAnSsO6bml1cycsXG4gICAgICAnSsO6bGl1cycsXG4gICAgICAnQXVndXN6dHVzJyxcbiAgICAgICdTemVwdGVtYmVyJyxcbiAgICAgICdPa3TDs2JlcicsXG4gICAgICAnTm92ZW1iZXInLFxuICAgICAgJ0RlY2VtYmVyJ10sXG4gICAgQU1EZXNpZ25hdG9yOiAnJyxcbiAgICBmaXJzdERheU9mV2VlazogMSxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAneXl5eS4gbW1tbSBkZC4gSEg6TU06c3MnLFxuICAgIGxvbmdEYXRlUGF0dGVybjogJ3l5eXkuIG1tbW0gZGQuJyxcbiAgICBsb25nVGltZVBhdHRlcm46ICdISDpNTTpzcycsXG4gICAgc2hvcnREYXRlUGF0dGVybjogJ3l5eXkuIG0uIGQuJyxcbiAgICBzaG9ydERheU5hbWVzOiBbJ1YnLCAnSCcsICdLJywgJ1N6JywgJ0NzJywgJ1AnLCAnU3onXSxcbiAgICBzaG9ydFRpbWVQYXR0ZXJuOiAnSEg6TU0nLFxuICAgIHRpbWVTZXBhcmF0b3I6ICc6J1xuICB9O1xuXG4gIGV4cG9ydCBjb25zdCBlbkdCOiBEYXRlVGltZUZvcm1hdCA9IHtcbiAgICBsb2NhbGU6ICdlbi1HQicsXG4gICAgYWJicmV2aWF0ZWRNb250aE5hbWVzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwdCcsICdPa3QnLCAnTm92JywgJ0RlYyddLFxuICAgIGRheU5hbWVzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J10sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ0phbnVhcnknLFxuICAgICAgJ0ZlYnJ1YXJ5JyxcbiAgICAgICdNYXJjaCcsXG4gICAgICAnQXByaWwnLFxuICAgICAgJ01heScsXG4gICAgICAnSnVuZScsXG4gICAgICAnSnVseScsXG4gICAgICAnQXVndXN0JyxcbiAgICAgICdTZXB0ZW1iZXInLFxuICAgICAgJ09rdG9iZXInLFxuICAgICAgJ05vdmVtYmVyJyxcbiAgICAgICdEZWNlbWJlciddLFxuICAgIEFNRGVzaWduYXRvcjogJ2FtJyxcbiAgICBmaXJzdERheU9mV2VlazogMSxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAnZGQgbW1tbSB5eXl5IEhIOk1NOnNzJyxcbiAgICBsb25nRGF0ZVBhdHRlcm46ICdkZCBtbW1tIHl5eXknLFxuICAgIGxvbmdUaW1lUGF0dGVybjogJ0hIOk1NOnNzJyxcbiAgICBzaG9ydERhdGVQYXR0ZXJuOiAnZGQvbW0veXl5eScsXG4gICAgc2hvcnREYXlOYW1lczogWydTdScsICdNbycsICdUdScsICdXZScsICdUaCcsICdGcicsICdTYSddLFxuICAgIHNob3J0VGltZVBhdHRlcm46ICdISDpNTScsXG4gICAgdGltZVNlcGFyYXRvcjogJzonXG4gIH07XG5cbiAgZXhwb3J0IGNvbnN0IGVuVVM6IERhdGVUaW1lRm9ybWF0ID0ge1xuICAgIGxvY2FsZTogJ2VuLVVTJyxcbiAgICBhYmJyZXZpYXRlZE1vbnRoTmFtZXM6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXB0JywgJ09rdCcsICdOb3YnLCAnRGVjJ10sXG4gICAgZGF5TmFtZXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcbiAgICBtb250aE5hbWVzOiBbXG4gICAgICAnSmFudWFyeScsXG4gICAgICAnRmVicnVhcnknLFxuICAgICAgJ01hcmNoJyxcbiAgICAgICdBcHJpbCcsXG4gICAgICAnTWF5JyxcbiAgICAgICdKdW5lJyxcbiAgICAgICdKdWx5JyxcbiAgICAgICdBdWd1c3QnLFxuICAgICAgJ1NlcHRlbWJlcicsXG4gICAgICAnT2t0b2JlcicsXG4gICAgICAnTm92ZW1iZXInLFxuICAgICAgJ0RlY2VtYmVyJ10sXG4gICAgQU1EZXNpZ25hdG9yOiAnQU0nLFxuICAgIGZpcnN0RGF5T2ZXZWVrOiAwLFxuICAgIGZ1bGxEYXRlVGltZVBhdHRlcm46ICdkZGRkLCBtbW1tIGQsIHl5eXkgaDpNTTpzcyBUVCcsXG4gICAgbG9uZ0RhdGVQYXR0ZXJuOiAnZGRkZCwgbW1tbSBkLCB5eXl5JyxcbiAgICBsb25nVGltZVBhdHRlcm46ICdoOk1NOnNzIHR0JyxcbiAgICBzaG9ydERhdGVQYXR0ZXJuOiAnbS9kL3l5eXknLFxuICAgIHNob3J0RGF5TmFtZXM6IFsnU3UnLCAnTW8nLCAnVHUnLCAnV2UnLCAnVGgnLCAnRnInLCAnU2EnXSxcbiAgICBzaG9ydFRpbWVQYXR0ZXJuOiAnaDpNTSB0dCcsXG4gICAgdGltZVNlcGFyYXRvcjogJzonXG4gIH07XG5cbiAgZXhwb3J0IGNvbnN0IHJ1OiBEYXRlVGltZUZvcm1hdCA9IHtcbiAgICBsb2NhbGU6ICdydS1SVScsXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgIGFiYnJldmlhdGVkTW9udGhOYW1lczogWyfRj9C90LIuJywgJ9GE0LXQstGALicsICfQvNCw0YDRgicsICfQsNC/0YAuJywgJ9C80LDQuScsICfQuNGO0L3RjCcsICfQuNGO0LvRjCcsICfQsNCy0LMuJywgJ9GB0LXQvdGCLicsICfQvtC60YIuJywgJ9C90L7Rj9CxLicsICfQtNC10LouJ10sXG4gICAgZGF5TmFtZXM6IFsn0JLQvtGB0LrQv9C10YHQtdC90YzQtScsICfQn9C+0L3QtdC00LXQu9GM0L3QuNC6JywgJ9CS0YLQvtGA0L3QuNC6JywgJ9Ch0YDQtdC00LAnLCAn0KfQtdGC0LLQtdGA0LMnLCAn0J/Rj9GC0L3QuNGG0LAnLCAn0KHRg9Cx0L7RgtCwJ10sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ9GP0L3QstCw0YDRjCcsXG4gICAgICAn0YTQtdCy0YDQsNC70YwnLFxuICAgICAgJ9C80LDRgNGCJyxcbiAgICAgICfQsNC/0YDQtdC70YwnLFxuICAgICAgJ9C80LDQuScsXG4gICAgICAn0LjRjtC90YwnLFxuICAgICAgJ9C40Y7Qu9GMJyxcbiAgICAgICfQsNCy0LPRg9GB0YInLFxuICAgICAgJ9Ch0LXQvdGC0Y/QsdGA0YwnLFxuICAgICAgJ9C+0LrRgtGP0LHRgNGMJyxcbiAgICAgICfQvdC+0Y/QsdGA0YwnLFxuICAgICAgJ9C00LXQutCw0LHRgNGMJ10sXG4gICAgQU1EZXNpZ25hdG9yOiAnJyxcbiAgICBmaXJzdERheU9mV2VlazogMCxcbiAgICBmdWxsRGF0ZVRpbWVQYXR0ZXJuOiAnZCBtbW1tIHl5eXkgXFwn0LMuXFwnIEg6bW06c3MnLFxuICAgIGxvbmdEYXRlUGF0dGVybjogJ2QgbW1tbSB5eXl5IFxcJ9CzLlxcJycsXG4gICAgbG9uZ1RpbWVQYXR0ZXJuOiAnSDpNTTpzcycsXG4gICAgc2hvcnREYXRlUGF0dGVybjogJ2RkLm1tLnl5eXknLFxuICAgIHNob3J0RGF5TmFtZXM6IFsn0JInLCAn0J8nLCAn0JInLCAn0KEnLCAn0KcnLCAn0J8nLCAn0KEnXSxcbiAgICBzaG9ydFRpbWVQYXR0ZXJuOiAnSDpNTScsXG4gICAgdGltZVNlcGFyYXRvcjogJzonXG4gIH07XG59XG5cbmNvbnN0IHJlZ2V4SnNvbk1pbGxpc2Vjb25kcyA9IC9cXC5bMC05XSsoWnxcXCtbMC05XXsxLDJ9KDpbMC05XXsxLDJ9KT8pJC9pO1xuXG5jb25zdCBkYXRlRnJvbUpzb24gPSAoanNvbjogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGZpeGVkID0ganNvbi5yZXBsYWNlKHJlZ2V4SnNvbk1pbGxpc2Vjb25kcywgJyQxJyk7XG4gIHJldHVybiBuZXcgRGF0ZShmaXhlZCk7XG59O1xuXG5jb25zdCBkYXRlRnJvbVRpbWUgPSAobWlsbGlzZWNvbmRzOiBudW1iZXIpID0+IHtcbiAgY29uc3QgcmVzdWx0ID0gbmV3IERhdGUoKTtcbiAgcmVzdWx0LnNldFRpbWUobWlsbGlzZWNvbmRzKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IHJlZ2V4VGltZVNwYW4gPSAvXigtKT8oKFswLTldKylcXC4pPyhbMC05XXsxLDJ9KTooWzAtOV17MSwyfSkoOihbMC05XXsxLDJ9KShcXC4oWzAtOV17MSwzfSkpPyk/JC87XG5cbmNvbnN0IG1vbnRoTGVuZ3RocyA9IFtcbiAgMzEsIC8vIGphblxuICBOYU4sIC8vIGZlYlxuICAzMSwgIC8vIG1hclxuICAzMCwgIC8vIGFwclxuICAzMSwgIC8vIG1heVxuICAzMCwgIC8vIGp1blxuICAzMSwgIC8vIGp1bFxuICAzMSwgIC8vIGF1Z1xuICAzMCwgIC8vIHNlcFxuICAzMSwgIC8vIG9rdFxuICAzMCwgIC8vIG5vdlxuICAzMSAgLy8gZGVjXG5dO1xuXG5jb25zdCBwb3cxMCA9IChuOiBudW1iZXIpID0+IHtcbiAgc3dpdGNoIChuKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIDEwO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiAxMDA7XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIDEwMDA7XG4gICAgZGVmYXVsdDpcbiAgICAgIGxldCByZXMgPSAxO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgcmVzICo9IDEwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgfVxufTtcblxuY29uc3QgcGFkMyA9IChuOiBudW1iZXIpID0+IHtcbiAgaWYgKG4gPCAxMCkge1xuICAgIHJldHVybiBgMDAke259YDtcbiAgfVxuICBpZiAobiA8IDEwMCkge1xuICAgIHJldHVybiBgMCR7bn1gO1xuICB9XG4gIHJldHVybiBTdHJpbmcobik7XG59O1xuXG5jb25zdCBwYXJzZVRpbWVTdGFtcCA9IChpbnB1dDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IG0gPSByZWdleFRpbWVTcGFuLmV4ZWMoaW5wdXQpO1xuICBpZiAoIW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgdGltZXN0YW1wIHZhbHVlOiBcIiR7aW5wdXR9XCJgKTtcbiAgfVxuICBsZXQgbWlsbGlzZWNvbmRzID0gbVs5XSA/IHBhcnNlSW50KG1bOV0sIDEwKSAqIHBvdzEwKDMgLSBtWzldLmxlbmd0aCkgOiAwO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bN10sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bNV0sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlO1xuICBtaWxsaXNlY29uZHMgKz0gKHBhcnNlSW50KG1bNF0sIDEwKSB8fCAwKSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luSG91cjtcbiAgbWlsbGlzZWNvbmRzICs9IChwYXJzZUludChtWzNdLCAxMCkgfHwgMCkgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkRheTtcbiAgaWYgKCctJyA9PT0gbVsxXSkge1xuICAgIG1pbGxpc2Vjb25kcyA9IC1taWxsaXNlY29uZHM7XG4gIH1cbiAgcmV0dXJuIG1pbGxpc2Vjb25kcztcbn07XG5cbmV4cG9ydCBjbGFzcyBUaW1lU3BhbiBpbXBsZW1lbnRzIEVxdWF0YWJsZTxUaW1lU3Bhbj4sIENvbXBhcmFibGU8VGltZVNwYW4+IHtcbiAgc3RhdGljIHJlYWRvbmx5IG1pbGxpc2Vjb25kc0luU2Vjb25kID0gMTAwMDtcbiAgc3RhdGljIHJlYWRvbmx5IG1pbGxpc2Vjb25kc0luTWludXRlID0gNjAwMDA7XG4gIHN0YXRpYyByZWFkb25seSBtaWxsaXNlY29uZHNJbkhvdXIgPSAzNjAwMDAwO1xuICBzdGF0aWMgcmVhZG9ubHkgbWlsbGlzZWNvbmRzSW5EYXkgPSA4NjQwMDAwMDtcbiAgcHJpdmF0ZSByZWFkb25seSB2YWx1ZTogbnVtYmVyO1xuICBnZXQgbWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gdGhpcy52YWx1ZSAlIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kOyB9XG4gIGdldCBzZWNvbmRzKCkgeyByZXR1cm4gTWF0aC5mbG9vcih0aGlzLnRvdGFsU2Vjb25kcykgJSA2MDsgfVxuICBnZXQgbWludXRlcygpIHsgcmV0dXJuIE1hdGguZmxvb3IodGhpcy50b3RhbE1pbnV0ZXMpICUgNjA7IH1cbiAgZ2V0IGhvdXJzKCkgeyByZXR1cm4gTWF0aC5mbG9vcih0aGlzLnRvdGFsSG91cnMpICUgMjQ7IH1cbiAgZ2V0IGRheXMoKSB7IHJldHVybiBNYXRoLmZsb29yKHRoaXMudG90YWxEYXlzKTsgfVxuICBnZXQgdG90YWxNaWxsaXNlY29uZHMoKSB7IHJldHVybiB0aGlzLnZhbHVlOyB9XG4gIGdldCB0b3RhbFNlY29uZHMoKSB7IHJldHVybiB0aGlzLnZhbHVlIC8gVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5TZWNvbmQ7IH1cbiAgZ2V0IHRvdGFsTWludXRlcygpIHsgcmV0dXJuIHRoaXMudmFsdWUgLyBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbk1pbnV0ZTsgfVxuICBnZXQgdG90YWxIb3VycygpIHsgcmV0dXJuIHRoaXMudmFsdWUgLyBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkhvdXI7IH1cbiAgZ2V0IHRvdGFsRGF5cygpIHsgcmV0dXJuIHRoaXMudmFsdWUgLyBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkRheTsgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRpbWVzcGFuIGZvciB0aGUgc3BlY2lmaWVkIGFtb3VudCBvZiBtaWxsaXNlY29uZHMuXG4gICAqIEBwYXJhbSBtaWxsaXNlY29uZHMgQW1vdW50IG9mIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG1pbGxpc2Vjb25kczogbnVtYmVyKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyB0aW1lc3BhbiBieSBwYXJzaW5nIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSBpbnB1dCBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRpbWVzcGFuLlxuICAgKi9cbiAgY29uc3RydWN0b3IoaW5wdXQ6IHN0cmluZyk7XG5cbiAgY29uc3RydWN0b3Ioc291cmNlOiBudW1iZXJ8c3RyaW5nKSB7XG4gICAgaWYgKCdudW1iZXInID09PSB0eXBlb2Ygc291cmNlKSB7XG4gICAgICB0aGlzLnZhbHVlID0gc291cmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZhbHVlID0gcGFyc2VUaW1lU3RhbXAoc291cmNlKTtcbiAgICB9XG4gIH1cbiAgYWJzKCkge1xuICAgIHJldHVybiBuZXcgVGltZVNwYW4oTWF0aC5hYnModGhpcy52YWx1ZSkpO1xuICB9XG4gIGFkZE1pbGxpc2Vjb25kcyhtaWxsaXNlY29uZHM6IG51bWJlcikge1xuICAgIHJldHVybiBuZXcgVGltZVNwYW4odGhpcy52YWx1ZSArIG1pbGxpc2Vjb25kcyk7XG4gIH1cbiAgYWRkU2Vjb25kcyhzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMoc2Vjb25kcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kKTtcbiAgfVxuICBhZGRNaW51dGVzKG1pbnV0ZXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmFkZE1pbGxpc2Vjb25kcyhtaW51dGVzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5NaW51dGUpO1xuICB9XG4gIGFkZEhvdXJzKGhvdXJzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMoaG91cnMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkhvdXIpO1xuICB9XG4gIGFkZERheXMoZGF5czogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKGRheXMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkRheSk7XG4gIH1cbiAgYWRkKHZhbHVlOiBUaW1lU3BhbnxudW1iZXIpIHtcbiAgICBjb25zdCBtaWxsaXNlY29uZHMgPSB2YWx1ZSBpbnN0YW5jZW9mIFRpbWVTcGFuID8gdmFsdWUudG90YWxNaWxsaXNlY29uZHMgOiB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzKTtcbiAgfVxuICBuZWcoKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lU3BhbigtMSAqIHRoaXMudmFsdWUpO1xuICB9XG4gIHN1Yk1pbGxpc2Vjb25kcyhtaWxsaXNlY29uZHM6IG51bWJlcikge1xuICAgIHJldHVybiBuZXcgVGltZVNwYW4odGhpcy52YWx1ZSAtIG1pbGxpc2Vjb25kcyk7XG4gIH1cbiAgc3ViU2Vjb25kcyhzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJNaWxsaXNlY29uZHMoc2Vjb25kcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kKTtcbiAgfVxuICBzdWJNaW51dGVzKG1pbnV0ZXM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnN1Yk1pbGxpc2Vjb25kcyhtaW51dGVzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5NaW51dGUpO1xuICB9XG4gIHN1YkhvdXJzKGhvdXJzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJNaWxsaXNlY29uZHMoaG91cnMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkhvdXIpO1xuICB9XG4gIHN1YkRheXMoZGF5czogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTWlsbGlzZWNvbmRzKGRheXMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkRheSk7XG4gIH1cbiAgc3ViKHZhbHVlOiBUaW1lU3BhbnxudW1iZXIpIHtcbiAgICBjb25zdCBtaWxsaXNlY29uZHMgPSB2YWx1ZSBpbnN0YW5jZW9mIFRpbWVTcGFuID8gdmFsdWUudG90YWxNaWxsaXNlY29uZHMgOiB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcy5zdWJNaWxsaXNlY29uZHMobWlsbGlzZWNvbmRzKTtcbiAgfVxuXG4gIGVxdWFsc1RvKG90aGVyOiBUaW1lU3Bhbikge1xuICAgIHJldHVybiB0aGlzLnZhbHVlID09PSBvdGhlci52YWx1ZTtcbiAgfVxuXG4gIGNvbXBhcmVUbyhvdGhlcjogVGltZVNwYW4pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA+IG90aGVyLnZhbHVlID8gMSA6ICh0aGlzLnZhbHVlID09PSBvdGhlci52YWx1ZSA/IDAgOiAtMSk7XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICBpZiAodGhpcy52YWx1ZSA8IDApIHtcbiAgICAgIHJldHVybiBgLSR7dGhpcy5hYnMoKX1gO1xuICAgIH1cbiAgICBjb25zdCBkYXlzID0gdGhpcy5kYXlzO1xuICAgIGNvbnN0IGhvdXJzID0gdGhpcy5ob3VycztcbiAgICBjb25zdCBtaW51dGVzID0gdGhpcy5taW51dGVzO1xuICAgIGNvbnN0IHNlY29uZHMgPSB0aGlzLnNlY29uZHM7XG4gICAgY29uc3QgbWlsbGlzZWNvbmRzID0gdGhpcy5taWxsaXNlY29uZHM7XG4gICAgaWYgKGRheXMpIHtcbiAgICAgIGlmIChzZWNvbmRzIHx8ICFtaWxsaXNlY29uZHMpIHtcbiAgICAgICAgcmV0dXJuIGAke2RheXN9LiR7aG91cnN9LiR7bWludXRlc30uJHtzZWNvbmRzfWA7XG4gICAgICB9XG4gICAgICBpZiAobWlsbGlzZWNvbmRzKSB7XG4gICAgICAgIHJldHVybiBgJHtkYXlzfS4ke2hvdXJzfS4ke21pbnV0ZXN9LiR7c2Vjb25kc30uJHtwYWQzKG1pbGxpc2Vjb25kcyl9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgJHtkYXlzfS4ke2hvdXJzfS4ke21pbnV0ZXN9YDtcbiAgICB9XG4gICAgaWYgKHNlY29uZHMgfHwgIW1pbGxpc2Vjb25kcykge1xuICAgICAgcmV0dXJuIGAke2hvdXJzfS4ke21pbnV0ZXN9LiR7c2Vjb25kc31gO1xuICAgIH1cbiAgICBpZiAobWlsbGlzZWNvbmRzKSB7XG4gICAgICByZXR1cm4gYCR7aG91cnN9LiR7bWludXRlc30uJHtzZWNvbmRzfS4ke3BhZDMobWlsbGlzZWNvbmRzKX1gO1xuICAgIH1cbiAgICByZXR1cm4gYCR7aG91cnN9LiR7bWludXRlc31gO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0ZVRpbWVJbml0IHtcbiAgeWVhcj86IG51bWJlcjtcbiAgbW9udGg/OiBudW1iZXI7XG4gIGRheT86IG51bWJlcjtcbiAgaG91cnM/OiBudW1iZXI7XG4gIG1pbnV0ZXM/OiBudW1iZXI7XG4gIHNlY29uZHM/OiBudW1iZXI7XG4gIG1pbGxpc2Vjb25kcz86IG51bWJlcjtcbn1cblxuY29uc3QgcGF0dGVybnMgPSB7XG4gIGQ6IFN5bWJvbCgnZCcpLFxuICBkZDogU3ltYm9sKCdkZCcpLFxuICBkZGQ6IFN5bWJvbCgnZGRkJyksXG4gIGRkZGQ6IFN5bWJvbCgnZGRkZCcpLFxuICBtOiBTeW1ib2woJ20nKSxcbiAgbW06IFN5bWJvbCgnbW0nKSxcbiAgbW1tOiBTeW1ib2woJ21tbScpLFxuICBtbW1tOiBTeW1ib2woJ21tbW0nKSxcbiAgeXk6IFN5bWJvbCgneXknKSxcbiAgeXl5eTogU3ltYm9sKCd5eXl5JyksXG4gIGg6IFN5bWJvbCgnaCcpLFxuICBoaDogU3ltYm9sKCdoaCcpLFxuICBIOiBTeW1ib2woJ0gnKSxcbiAgSEg6IFN5bWJvbCgnSEgnKSxcbiAgTTogU3ltYm9sKCdNJyksXG4gIE1NOiBTeW1ib2woJ01NJyksXG4gIHM6IFN5bWJvbCgncycpLFxuICBzczogU3ltYm9sKCdzcycpLFxuICB0dDogU3ltYm9sKCd0dCcpLFxuICBUVDogU3ltYm9sKCdUVCcpLFxufTtcblxuY29uc3QgcGF0dGVybktleXMgPSAoZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHg6IEFycmF5PFtzdHJpbmcsIFN5bWJvbF0+ID0gW107XG4gIE9iamVjdC5rZXlzKHBhdHRlcm5zKS5mb3JFYWNoKChrKSA9PiB7XG4gICAgeC5wdXNoKFtrLCA8U3ltYm9sPiAoPGFueT4gcGF0dGVybnMpW2tdXSk7XG4gIH0pO1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIHguc29ydCgoW2sxLCBfXSwgW2syLCBfX10pID0+IGsxLmxlbmd0aCA9PT0gazIubGVuZ3RoID8gKGsxIDwgazIgPyAtMSA6IChrMSA9PT0gazIgPyAwIDogLTEpKSA6IGsxLmxlbmd0aCA8IGsyLmxlbmd0aCA/IDEgOiAtMSk7XG4gIHJldHVybiB4O1xufSgpKTtcblxudHlwZSBGb3JtYXRUb2tlbiA9IHN0cmluZ3xTeW1ib2w7XG5cbmZ1bmN0aW9uIHBhcnNlRm9ybWF0KHNvdXJjZTogc3RyaW5nLCBpbmRleDogbnVtYmVyLCB0b2tlbnM6IEZvcm1hdFRva2VuW10pOiBGb3JtYXRUb2tlbltdIHtcbiAgaWYgKGluZGV4ID49IHNvdXJjZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG4gIGlmICgnXFwnJyA9PT0gc291cmNlW2luZGV4XSkge1xuICAgIGNvbnN0IGNsb3NpbmcgPSBzb3VyY2UuaW5kZXhPZignXFwnJywgaW5kZXggKyAxKTtcbiAgICBpZiAoLTEgPT09IGNsb3NpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5jbG9zZWQgcXVvdGUnKTtcbiAgICB9XG4gICAgdG9rZW5zLnB1c2goc291cmNlLnN1YnN0cmluZyhpbmRleCArIDEsIGNsb3NpbmcpKTtcbiAgICByZXR1cm4gcGFyc2VGb3JtYXQoc291cmNlLCBjbG9zaW5nICsgMSwgdG9rZW5zKTtcbiAgfVxuICAvLyBjaGVjayBmb3JtYXRzXG4gIGZvciAoY29uc3QgW2ssIHNdIG9mIHBhdHRlcm5LZXlzKSB7XG4gICAgaWYgKGluZGV4ID09PSBzb3VyY2UuaW5kZXhPZihrLCBpbmRleCkpIHtcbiAgICAgIHRva2Vucy5wdXNoKHMpO1xuICAgICAgcmV0dXJuIHBhcnNlRm9ybWF0KHNvdXJjZSwgaW5kZXggKyBrLmxlbmd0aCwgdG9rZW5zKTtcbiAgICB9XG4gIH1cbiAgLy8gcGxhaW4gdGV4dFxuICBjb25zdCBsID0gdG9rZW5zLmxlbmd0aDtcbiAgaWYgKGwgJiYgJ3N0cmluZycgPT09IHR5cGVvZiB0b2tlbnNbbF0pIHtcbiAgICB0b2tlbnNbbF0gKz0gc291cmNlW2luZGV4XTtcbiAgfSBlbHNlIHtcbiAgICB0b2tlbnMucHVzaChzb3VyY2VbaW5kZXhdKTtcbiAgfVxuICByZXR1cm4gcGFyc2VGb3JtYXQoc291cmNlLCBpbmRleCArIDEsIHRva2Vucyk7XG59XG5cbmNvbnN0IGZvcm1hdENhY2hlOiB7IFtmbXQ6IHN0cmluZ106IEZvcm1hdFRva2VuW118dW5kZWZpbmVkIH0gPSB7fTtcblxuY29uc3QgcGFyc2VGb3JtYXRDYWNoZWQgPSAoc291cmNlOiBzdHJpbmcpOiBGb3JtYXRUb2tlbltdID0+IHtcbiAgbGV0IHRva2VucyA9IGZvcm1hdENhY2hlW3NvdXJjZV07XG4gIGlmICh0b2tlbnMpIHtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG4gIHRva2VucyA9IHBhcnNlRm9ybWF0KHNvdXJjZSwgMCwgW10pO1xuICBmb3JtYXRDYWNoZVtzb3VyY2VdID0gdG9rZW5zO1xuICByZXR1cm4gdG9rZW5zO1xufTtcblxuY29uc3QgcGFkWmVybzogKHNvdXJjZTogc3RyaW5nLCBuOiBudW1iZXIpID0+IHN0cmluZyA9IChmdW5jdGlvbigpIHtcbiAgaWYgKCg8YW55PiBTdHJpbmcucHJvdG90eXBlKS5wYWRTdGFydCkge1xuICAgIGNvbnN0IHBhZDogKG46IG51bWJlciwgcGFkU3RyaW5nOiBzdHJpbmcpID0+IHN0cmluZyA9ICg8YW55PiBTdHJpbmcucHJvdG90eXBlKS5wYWRTdGFydDtcbiAgICByZXR1cm4gKHNvdXJjZTogc3RyaW5nLCBuOiBudW1iZXIpID0+IHBhZC5jYWxsKHNvdXJjZSwgbiwgJzAnKTtcbiAgfVxuICByZXR1cm4gKHNvdXJjZTogc3RyaW5nLCBuOiBudW1iZXIpID0+IHtcbiAgICBsZXQgcmVzdWx0ID0gc291cmNlO1xuICAgIHdoaWxlIChyZXN1bHQubGVuZ3RoIDwgbikge1xuICAgICAgcmVzdWx0ID0gJzAnICsgcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufSgpKTtcblxuZnVuY3Rpb24gc3RyaW5naWZ5KHNvdXJjZTogRGF0ZVRpbWUsIHRva2VuczogRm9ybWF0VG9rZW5bXSwgZm9ybWF0OiBEYXRlVGltZUZvcm1hdCkge1xuICBsZXQgcmVzdWx0ID0gJyc7XG4gIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSB0b2tlbjtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLmQgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS5kYXkpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuZGQgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLmRheSksIDIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuZGRkID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IGZvcm1hdC5zaG9ydERheU5hbWVzW3NvdXJjZS5kYXlPZldlZWtdO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuZGRkZCA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBmb3JtYXQuZGF5TmFtZXNbc291cmNlLmRheU9mV2Vla107XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5tID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2UubW9udGgpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMubW0gPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLm1vbnRoKSwgMik7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5tbW0gPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gZm9ybWF0LmFiYnJldmlhdGVkTW9udGhOYW1lc1tzb3VyY2UubW9udGggLSAxXTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLm1tbW0gPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gZm9ybWF0Lm1vbnRoTmFtZXNbc291cmNlLm1vbnRoIC0gMV07XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy55eSA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLnllYXIgJSAxMDApO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMueXl5eSA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLnllYXIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuaCA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBTdHJpbmcoc291cmNlLmhvdXJzICUgMTIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMuaGggPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gcGFkWmVybyhTdHJpbmcoc291cmNlLmhvdXJzICUgMTIpLCAyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLkggPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS5ob3Vycyk7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5ISCA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBwYWRaZXJvKFN0cmluZyhzb3VyY2UuaG91cnMpLCAyKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLk0gPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gU3RyaW5nKHNvdXJjZS5taW51dGVzKTtcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLk1NID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHBhZFplcm8oU3RyaW5nKHNvdXJjZS5taW51dGVzKSwgMik7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5zID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IFN0cmluZyhzb3VyY2Uuc2Vjb25kcyk7XG4gICAgfSBlbHNlIGlmIChwYXR0ZXJucy5zcyA9PT0gdG9rZW4pIHtcbiAgICAgIHJlc3VsdCArPSBwYWRaZXJvKFN0cmluZyhzb3VyY2Uuc2Vjb25kcyksIDIpO1xuICAgIH0gZWxzZSBpZiAocGF0dGVybnMudHQgPT09IHRva2VuKSB7XG4gICAgICByZXN1bHQgKz0gc291cmNlLmhvdXJzID4gMTEgPyAncG0nIDogJ2FtJztcbiAgICB9IGVsc2UgaWYgKHBhdHRlcm5zLlRUID09PSB0b2tlbikge1xuICAgICAgcmVzdWx0ICs9IHNvdXJjZS5ob3VycyA+IDExID8gJ1BNJyA6ICdBTSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmb3RtYXQgdG9rZW4nKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY29uc3QgZm9ybWF0Q3VzdG9tID0gKHNvdXJjZTogRGF0ZVRpbWUsIGZtdDogc3RyaW5nLCBmb3JtYXQ6IERhdGVUaW1lRm9ybWF0KTogc3RyaW5nID0+IHtcbiAgY29uc3QgdG9rZW5zID0gcGFyc2VGb3JtYXRDYWNoZWQoZm10KTtcbiAgcmV0dXJuIHN0cmluZ2lmeShzb3VyY2UsIHRva2VucywgZm9ybWF0KTtcbn07XG5cbmNvbnN0IGZvcm1hdFN0YW5kYXJkID0gKHNvdXJjZTogRGF0ZVRpbWUsIGZtdDogJ2QnfCdEJ3wnZid8J0YnfCdnJ3wnRycsIGZvcm1hdDogRGF0ZVRpbWVGb3JtYXQpID0+IHtcbiAgc3dpdGNoIChmbXQpIHtcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBmb3JtYXRDdXN0b20oc291cmNlLCBmb3JtYXQuc2hvcnREYXRlUGF0dGVybiwgZm9ybWF0KTtcbiAgICBjYXNlICdEJzpcbiAgICAgIHJldHVybiBmb3JtYXRDdXN0b20oc291cmNlLCBmb3JtYXQubG9uZ0RhdGVQYXR0ZXJuLCBmb3JtYXQpO1xuICAgIGNhc2UgJ2YnOlxuICAgIGNhc2UgJ0YnOlxuICAgICAgcmV0dXJuIGZvcm1hdEN1c3RvbShzb3VyY2UsIGZvcm1hdC5mdWxsRGF0ZVRpbWVQYXR0ZXJuLCBmb3JtYXQpO1xuICAgIGNhc2UgJ2cnOlxuICAgICAgcmV0dXJuIGZvcm1hdEN1c3RvbShzb3VyY2UsIGZvcm1hdC5zaG9ydERhdGVQYXR0ZXJuICsgJyAnICsgZm9ybWF0LnNob3J0VGltZVBhdHRlcm4sIGZvcm1hdCk7XG4gICAgY2FzZSAnRyc6XG4gICAgICByZXR1cm4gZm9ybWF0Q3VzdG9tKHNvdXJjZSwgZm9ybWF0LnNob3J0RGF0ZVBhdHRlcm4gKyAnICcgKyBmb3JtYXQubG9uZ1RpbWVQYXR0ZXJuLCBmb3JtYXQpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignc2hvdWxkIG5ldmVyIGhhcHBlbicpO1xufTtcblxuZXhwb3J0IGNsYXNzIERhdGVUaW1lIGltcGxlbWVudHMgRXF1YXRhYmxlPERhdGVUaW1lPiwgQ29tcGFyYWJsZTxEYXRlVGltZT4ge1xuXG4gIHN0YXRpYyBkZWZhdWx0Rm9ybWF0UHJvdmlkZXIgPSBGb3JtYXRzLmh1O1xuICBzdGF0aWMgZGVmYXVsdEZvcm1hdCA9ICdnJztcblxuICAvKipcbiAgICogUmV0dXJucyBhbW91bnQgb2YgZGF5cyBpbiB0aGUgc3BlY2lmaWVkIG1vbnRoLlxuICAgKiBAcGFyYW0gbW9udGggTW9udGguXG4gICAqIEBwYXJhbSB5ZWFyIFllYXIuXG4gICAqL1xuICBzdGF0aWMgZ2V0TW9udGhMZW5ndGgobW9udGg6IG51bWJlciwgeWVhcjogbnVtYmVyKSB7XG4gICAgaWYgKG1vbnRoIDwgMSB8fCBtb250aCA+IDEyKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdtb250aCBvdXQgb2YgcmFuZ2UnKTtcbiAgICB9XG4gICAgaWYgKG1vbnRoICE9PSAyKSB7XG4gICAgICAgIHJldHVybiBtb250aExlbmd0aHNbbW9udGggLSAxXTtcbiAgICB9XG4gICAgcmV0dXJuICgwID09PSB5ZWFyICUgNCAmJiAoMCAhPT0geWVhciAlIDEwMCB8fCAwID09PSB5ZWFyICUgNDAwKSkgPyAyOSA6IDI4O1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSBzb3VyY2U6IERhdGU7XG4gIGdldCBpc1ZhbGlkKCkgeyByZXR1cm4gIWlzTmFOKHRoaXMuc291cmNlLmdldFRpbWUoKSk7IH1cbiAgZ2V0IHllYXIoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRGdWxsWWVhcigpOyB9XG4gIGdldCBtb250aCgpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldE1vbnRoKCkgKyAxOyB9XG4gIGdldCBkYXkoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXREYXRlKCk7IH1cbiAgZ2V0IGRheU9mV2VlaygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldERheSgpOyB9XG4gIGdldCBob3VycygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldEhvdXJzKCk7IH1cbiAgZ2V0IG1pbnV0ZXMoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRNaW51dGVzKCk7IH1cbiAgZ2V0IHNlY29uZHMoKSB7IHJldHVybiB0aGlzLnNvdXJjZS5nZXRTZWNvbmRzKCk7IH1cbiAgZ2V0IG1pbGxpc2Vjb25kcygpIHsgcmV0dXJuIHRoaXMuc291cmNlLmdldE1pbGxpc2Vjb25kcygpOyB9XG5cbiAgLyoqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIGRhdGV0aW1lIGZvciBhY3R1YWwgZGF0ZSBhbmQgdGltZS4gKi9cbiAgY29uc3RydWN0b3IoKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgZGF0ZXRpbWUgZnJvbSB0aGUgc3BlY2lmaWVkIGRhdGUuXG4gICAqIEBwYXJhbSBzb3VyY2UgRGF0ZSBvYmplY3QgdG8gdXNlLlxuICAgKi9cbiAgY29uc3RydWN0b3Ioc291cmNlOiBEYXRlKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgZGF0ZXRpbWUgZnJvbSB0aGUgc3BlY2lmaWVkIEpTT04gc3RyaW5nIHJlcHJlc2VudGluZyBkYXRlLlxuICAgKiBAcGFyYW0ganNvbiBKU09OIHN0cmluZyByZXByZXNlbnRpbmcgZGF0ZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGpzb246IHN0cmluZyk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIGRhdGV0aW1lIGZyb20gdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgbWlsbGlzZWNvbmRzIGZyb20gMTk3MCBqYW4gMSBVVEMuXG4gICAqIEBwYXJhbSBzb3VyY2UgQW1vdW50IG9mIG1pbGxpc2Vjb25kcyBmcm9tIDE5NzAgamFuIDEgVVRDLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWlsbGlzZWNvbmRzOiBudW1iZXIpO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBkYXRldGltZSBmcm9tIHRoZSBzcGVjaWZpZWQgaW5pdGlhbGl6ZXIuXG4gICAqIEBwYXJhbSBzb3VyY2UgSW5pdGlhbGl6ZXIgb2JqZWN0IHRvIHVzZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGluaXQ6IERhdGVUaW1lSW5pdCk7XG5cbiAgY29uc3RydWN0b3Ioc291cmNlPzogRGF0ZXxzdHJpbmd8bnVtYmVyfERhdGVUaW1lSW5pdCkge1xuICAgIGlmICh1bmRlZmluZWQgPT09IHNvdXJjZSB8fCBudWxsID09PSBzb3VyY2UpIHtcbiAgICAgIHRoaXMuc291cmNlID0gbmV3IERhdGUoKTtcbiAgICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Ygc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IGRhdGVGcm9tSnNvbihzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBzb3VyY2UpIHtcbiAgICAgIHRoaXMuc291cmNlID0gZGF0ZUZyb21UaW1lKHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXNzdW1lIGluaXRcbiAgICAgIGNvbnN0IGluaXQgPSA8RGF0ZVRpbWVJbml0PiBzb3VyY2U7XG4gICAgICB0aGlzLnNvdXJjZSA9IG5ldyBEYXRlKFxuICAgICAgICBpbml0LnllYXIgfHwgbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpLFxuICAgICAgICBpbml0Lm1vbnRoID8gaW5pdC5tb250aCAtIDEgOiAwLFxuICAgICAgICBpbml0LmRheSB8fCAxLFxuICAgICAgICBpbml0LmhvdXJzIHx8IDAsXG4gICAgICAgIGluaXQubWludXRlcyB8fCAwLFxuICAgICAgICBpbml0LnNlY29uZHMgfHwgMCxcbiAgICAgICAgaW5pdC5taWxsaXNlY29uZHMgfHwgMCk7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzVG8ob3RoZXI6IERhdGVUaW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLmdldFRpbWUoKSA9PT0gb3RoZXIuc291cmNlLmdldFRpbWUoKTtcbiAgfVxuXG4gIGNvbXBhcmVUbyhvdGhlcjogRGF0ZVRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UgPCBvdGhlci5zb3VyY2UgPyAtMSA6ICh0aGlzLmVxdWFsc1RvKG90aGVyKSA/IDAgOiAxKTtcbiAgfVxuXG4gIGFkZE1pbGxpc2Vjb25kcyhtaWxsaXNlY29uZHM6IG51bWJlcikge1xuICAgIGNvbnN0IHJlcyA9IGRhdGVGcm9tVGltZSh0aGlzLnNvdXJjZS5nZXRUaW1lKCkgKyBtaWxsaXNlY29uZHMpO1xuICAgIGNvbnN0IG9mZnNldERlbHRhID0gdGhpcy5zb3VyY2UuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHJlcy5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgIGlmIChvZmZzZXREZWx0YSAhPT0gMCkge1xuICAgICAgICBjb25zdCBhZGp1c3QgPSBvZmZzZXREZWx0YSAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luTWludXRlO1xuICAgICAgICByZXMuc2V0VGltZShyZXMuZ2V0VGltZSgpIC0gYWRqdXN0KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEYXRlVGltZShyZXMpO1xuICB9XG5cbiAgYWRkU2Vjb25kcyhzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRNaWxsaXNlY29uZHMoc2Vjb25kcyAqIFRpbWVTcGFuLm1pbGxpc2Vjb25kc0luU2Vjb25kKTtcbiAgfVxuXG4gIGFkZE1pbnV0ZXMobWludXRlczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKG1pbnV0ZXMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbk1pbnV0ZSk7XG4gIH1cblxuICBhZGRIb3Vycyhob3VyczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKGhvdXJzICogVGltZVNwYW4ubWlsbGlzZWNvbmRzSW5Ib3VyKTtcbiAgfVxuXG4gIGFkZERheXMoZGF5czogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKGRheXMgKiBUaW1lU3Bhbi5taWxsaXNlY29uZHNJbkRheSk7XG4gIH1cblxuICBhZGRNb250aHMobW9udGhzOiBudW1iZXIpIHtcbiAgICBpZiAoMCA9PT0gbW9udGhzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZERheXMoMCk7XG4gICAgfVxuICAgIGlmICgwIDwgbW9udGhzKSB7XG4gICAgICBjb25zdCBmdWxsID0gTWF0aC5mbG9vcihtb250aHMpICsgKHRoaXMubW9udGggLSAxKTtcbiAgICAgIGNvbnN0IGZtID0gZnVsbCAlIDEyO1xuICAgICAgY29uc3QgZnkgPSBNYXRoLmZsb29yKGZ1bGwgLyAxMik7XG4gICAgICBjb25zdCByZXMgPSBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICB5ZWFyOiB0aGlzLnllYXIgKyBmeSxcbiAgICAgICAgbW9udGg6IGZtICsgMSxcbiAgICAgICAgZGF5OiBNYXRoLm1pbihEYXRlVGltZS5nZXRNb250aExlbmd0aChmbSArIDEsIHRoaXMueWVhciArIGZ5KSwgdGhpcy5kYXkpLFxuICAgICAgICBob3VyczogdGhpcy5ob3VycyxcbiAgICAgICAgbWludXRlczogdGhpcy5taW51dGVzLFxuICAgICAgICBzZWNvbmRzOiB0aGlzLnNlY29uZHMsXG4gICAgICAgIG1pbGxpc2Vjb25kczogdGhpcy5taWxsaXNlY29uZHNcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcGFydCA9IG1vbnRocyAlIDE7XG4gICAgICBpZiAoMCA9PT0gcGFydCkge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcy5hZGREYXlzKERhdGVUaW1lLmdldE1vbnRoTGVuZ3RoKHJlcy5tb250aCwgcmVzLnllYXIpICogcGFydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFicyA9IE1hdGguYWJzKG1vbnRocyk7XG4gICAgICBsZXQgbSA9ICh0aGlzLm1vbnRoIC0gMSkgLSBNYXRoLmZsb29yKGFicyk7XG4gICAgICBsZXQgeSA9IHRoaXMueWVhcjtcbiAgICAgIHdoaWxlICgwID4gbSkge1xuICAgICAgICB5ID0geSAtIDE7XG4gICAgICAgIG0gPSBtICsgMTI7XG4gICAgICB9XG4gICAgICBjb25zdCBwYXJ0ID0gYWJzICUgMTtcbiAgICAgIGlmICgwID09PSBwYXJ0KSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICAgIHllYXI6IHksXG4gICAgICAgICAgbW9udGg6IG0gKyAxLFxuICAgICAgICAgIGRheTogdGhpcy5kYXksXG4gICAgICAgICAgaG91cnM6IHRoaXMuaG91cnMsXG4gICAgICAgICAgbWludXRlczogdGhpcy5taW51dGVzLFxuICAgICAgICAgIHNlY29uZHM6IHRoaXMuc2Vjb25kcyxcbiAgICAgICAgICBtaWxsaXNlY29uZHM6IHRoaXMubWlsbGlzZWNvbmRzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKDAgPT09IG0pIHtcbiAgICAgICAgICB5ID0geSAtIDE7XG4gICAgICAgICAgbSA9IDExO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtID0gbSAtIDE7XG4gICAgICB9XG4gICAgICBjb25zdCBkYXlzID0gRGF0ZVRpbWUuZ2V0TW9udGhMZW5ndGgobSArIDEsIHkpO1xuICAgICAgY29uc3QgdG9BZGQgPSBkYXlzICogKDEgLSBwYXJ0KTtcbiAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoe1xuICAgICAgICB5ZWFyOiB5LFxuICAgICAgICBtb250aDogbSxcbiAgICAgICAgZGF5OiB0aGlzLmRheSxcbiAgICAgICAgaG91cnM6IHRoaXMuaG91cnMsXG4gICAgICAgIG1pbnV0ZXM6IHRoaXMubWludXRlcyxcbiAgICAgICAgc2Vjb25kczogdGhpcy5zZWNvbmRzLFxuICAgICAgICBtaWxsaXNlY29uZHM6IHRoaXMubWlsbGlzZWNvbmRzXG4gICAgICB9KS5hZGREYXlzKHRvQWRkKTtcbiAgICB9XG4gIH1cbiAgYWRkKHRpbWVTcGFuOiBUaW1lU3Bhbik6IERhdGVUaW1lO1xuICBhZGQobWlsbGlzZWNvbmRzOiBudW1iZXIpOiBEYXRlVGltZTtcbiAgYWRkKHZhbHVlOiBUaW1lU3BhbnxudW1iZXIpIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lU3Bhbikge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHZhbHVlLnRvdGFsTWlsbGlzZWNvbmRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRkTWlsbGlzZWNvbmRzKHZhbHVlKTtcbiAgfVxuICBzdWJzdHJhY3Qob3RoZXI6IERhdGVUaW1lKTogVGltZVNwYW47XG4gIHN1YnN0cmFjdCh0aW1lc3BhbjogVGltZVNwYW4pOiBEYXRlVGltZTtcbiAgc3Vic3RyYWN0KG1pbGxpc2Vjb25kczogbnVtYmVyKTogRGF0ZVRpbWU7XG4gIHN1YnN0cmFjdCh2YWx1ZTogRGF0ZVRpbWV8VGltZVNwYW58bnVtYmVyKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZVRpbWUpIHtcbiAgICAgIHJldHVybiBuZXcgVGltZVNwYW4odGhpcy5zb3VyY2UuZ2V0VGltZSgpIC0gdmFsdWUuc291cmNlLmdldFRpbWUoKSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVTcGFuKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGQoLTEgKiB2YWx1ZS50b3RhbE1pbGxpc2Vjb25kcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFkZCgtMSAqIHZhbHVlKTtcbiAgfVxuICB0b0RhdGUoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IERhdGUoKTtcbiAgICByZXN1bHQuc2V0VGltZSh0aGlzLnNvdXJjZS5nZXRUaW1lKCkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcHJpdmF0ZSBmb3JtYXQoZm9ybWF0OiBzdHJpbmcsIHByb3ZpZGVyOiBEYXRlVGltZUZvcm1hdCk6IHN0cmluZyB7XG4gICAgaWYgKCdkJyA9PT0gZm9ybWF0IHx8ICdEJyA9PT0gZm9ybWF0IHx8ICdmJyA9PT0gZm9ybWF0IHx8ICdGJyA9PT0gZm9ybWF0IHx8ICdnJyA9PT0gZm9ybWF0IHx8ICdHJyA9PT0gZm9ybWF0KSB7XG4gICAgICByZXR1cm4gZm9ybWF0U3RhbmRhcmQodGhpcywgZm9ybWF0LCBwcm92aWRlcik7XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXRDdXN0b20odGhpcywgZm9ybWF0LCBwcm92aWRlcik7XG4gIH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXQ6IHN0cmluZyk6IHN0cmluZztcbiAgdG9TdHJpbmcocHJvdmlkZXI6IERhdGVUaW1lRm9ybWF0KTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXQ6IHN0cmluZywgcHJvdmlkZXI6IERhdGVUaW1lRm9ybWF0KTogc3RyaW5nO1xuICB0b1N0cmluZyhmb3JtYXRPclByb3ZpZGVyPzogc3RyaW5nfERhdGVUaW1lRm9ybWF0LCBwcm92aWRlcj86IERhdGVUaW1lRm9ybWF0KSB7XG4gICAgaWYgKCFwcm92aWRlcikge1xuICAgICAgaWYgKCFmb3JtYXRPclByb3ZpZGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdChEYXRlVGltZS5kZWZhdWx0Rm9ybWF0LCBEYXRlVGltZS5kZWZhdWx0Rm9ybWF0UHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGZvcm1hdE9yUHJvdmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0KGZvcm1hdE9yUHJvdmlkZXIsIERhdGVUaW1lLmRlZmF1bHRGb3JtYXRQcm92aWRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQoRGF0ZVRpbWUuZGVmYXVsdEZvcm1hdCwgZm9ybWF0T3JQcm92aWRlcik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGZvcm1hdE9yUHJvdmlkZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmb3JtYXQgYXJndW1lbnQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0KGZvcm1hdE9yUHJvdmlkZXIsIHByb3ZpZGVyKTtcbiAgfVxufVxuIl19