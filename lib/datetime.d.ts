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
    constructor(source: number | string);
    abs(): TimeSpan;
    addMilliseconds(milliseconds: number): TimeSpan;
    addSeconds(seconds: number): TimeSpan;
    addMinutes(minutes: number): TimeSpan;
    addHours(hours: number): TimeSpan;
    addDays(days: number): TimeSpan;
    add(value: TimeSpan | number): TimeSpan;
    subMilliseconds(milliseconds: number): TimeSpan;
    subSeconds(seconds: number): TimeSpan;
    subMinutes(minutes: number): TimeSpan;
    subHours(hours: number): TimeSpan;
    subDays(days: number): TimeSpan;
    sub(value: TimeSpan | number): TimeSpan;
    toString(): string;
}
export declare class DateTime {
    private readonly source;
    readonly isValid: boolean;
    readonly year: number;
    readonly month: number;
    readonly date: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
    readonly milliseconds: number;
    constructor(source?: Date | string | number);
}
