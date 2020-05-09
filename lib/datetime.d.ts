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
export declare namespace Formats {
    const hu: DateTimeFormat;
    const enGB: DateTimeFormat;
    const enUS: DateTimeFormat;
    const ru: DateTimeFormat;
}
export declare class TimeSpan implements Equatable<TimeSpan>, Comparable<TimeSpan> {
    static readonly millisecondsInSecond = 1000;
    static readonly millisecondsInMinute = 60000;
    static readonly millisecondsInHour = 3600000;
    static readonly millisecondsInDay = 86400000;
    private readonly value;
    get milliseconds(): number;
    get seconds(): number;
    get minutes(): number;
    get hours(): number;
    get days(): number;
    get totalMilliseconds(): number;
    get totalSeconds(): number;
    get totalMinutes(): number;
    get totalHours(): number;
    get totalDays(): number;
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
    abs(): TimeSpan;
    addMilliseconds(milliseconds: number): TimeSpan;
    addSeconds(seconds: number): TimeSpan;
    addMinutes(minutes: number): TimeSpan;
    addHours(hours: number): TimeSpan;
    addDays(days: number): TimeSpan;
    add(value: TimeSpan | number): TimeSpan;
    neg(): TimeSpan;
    subMilliseconds(milliseconds: number): TimeSpan;
    subSeconds(seconds: number): TimeSpan;
    subMinutes(minutes: number): TimeSpan;
    subHours(hours: number): TimeSpan;
    subDays(days: number): TimeSpan;
    sub(value: TimeSpan | number): TimeSpan;
    equalsTo(other: TimeSpan): boolean;
    compareTo(other: TimeSpan): 1 | 0 | -1;
    toString(): string;
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
export declare class DateTime implements Equatable<DateTime>, Comparable<DateTime> {
    static defaultFormatProvider: DateTimeFormat;
    static defaultFormat: string;
    /**
     * Returns amount of days in the specified month.
     * @param month Month.
     * @param year Year.
     */
    static getMonthLength(month: number, year: number): number;
    private readonly source;
    get isValid(): boolean;
    get year(): number;
    get month(): number;
    get day(): number;
    get dayOfWeek(): number;
    get hours(): number;
    get minutes(): number;
    get seconds(): number;
    get milliseconds(): number;
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
    equalsTo(other: DateTime): boolean;
    compareTo(other: DateTime): 1 | 0 | -1;
    addMilliseconds(milliseconds: number): DateTime;
    addSeconds(seconds: number): DateTime;
    addMinutes(minutes: number): DateTime;
    addHours(hours: number): DateTime;
    addDays(days: number): DateTime;
    addMonths(months: number): DateTime;
    add(timeSpan: TimeSpan): DateTime;
    add(milliseconds: number): DateTime;
    substract(other: DateTime): TimeSpan;
    substract(timespan: TimeSpan): DateTime;
    substract(milliseconds: number): DateTime;
    toDate(): Date;
    private format;
    toString(): string;
    toString(format: string): string;
    toString(provider: DateTimeFormat): string;
    toString(format: string, provider: DateTimeFormat): string;
}
