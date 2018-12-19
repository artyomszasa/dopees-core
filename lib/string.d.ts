export declare function toBase64String(input: string): string;
export declare function fromBase64String(encoded: string): string;
interface SegmentFormat {
    sign?: boolean;
    precision?: number;
    fun?: (arg: any) => string;
    width?: number;
    pad?: string;
    left?: boolean;
}
declare type Segment = string | SegmentFormat;
interface SegmentMap {
    [key: string]: Segment[];
}
interface Sprintf {
    (format: string, ...args: any[]): string;
    cache: SegmentMap;
    format: (items: Segment[], args: any[]) => string;
    parse: (formatString: string) => Segment[];
}
declare const sprintf: Sprintf;
export { sprintf };
