import { Equatable, Comparable } from "./contract";
export declare class TimeSpan {
    static readonly millisecondsInSecond = 1000;
    static readonly millisecondsInMinute = 60000;
    static readonly millisecondsInHour = 3600000;
    static readonly millisecondsInDay = 86400000;
    private readonly value;
    readonly milliseconds: number;
    readonly seconds: number;
    readonly minutes: number;
    readonly hours: number;
    readonly days: number;
    readonly totalMilliseconds: number;
    readonly totalSeconds: number;
    readonly totalMinutes: number;
    readonly totalHours: number;
    readonly totalDays: number;
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
    /**
     * Returns amount of days in the specified month.
     * @param month Month.
     * @param year Year.
     */
    static getMonthLength(month: number, year: number): number;
    private readonly source;
    readonly isValid: boolean;
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly dayOfWeek: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
    readonly milliseconds: number;
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
    compareTo(other: DateTime): 1 | -1 | 0;
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
}
