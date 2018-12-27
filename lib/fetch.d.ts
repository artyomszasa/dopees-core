export interface FetchDecorator {
    readonly name: string;
    decorate<T extends RequestInit>(uri: string, init: T): T | void;
}
export interface AnyProp {
    [key: string]: any;
}
export interface DecoratedFetch {
    (uri: string, init: RequestInit & AnyProp): Promise<Response>;
    readonly decorators: FetchDecorator[];
    native(uri: string, init: RequestInit): Promise<Response>;
    include(decorators: (string | FetchDecorator)[]): (uri: string, init: RequestInit & AnyProp) => Promise<Response>;
    exclude(decorators: (string | FetchDecorator)[]): (uri: string, init: RequestInit & AnyProp) => Promise<Response>;
}
export declare const decoratedFetch: DecoratedFetch;
export declare class HttpError extends Error {
    response: Response;
    constructor(response: Response, message?: string);
}
export declare function httpGet(uri: string): Promise<Response>;
export declare function httpGetJson<T>(uri: string): Promise<T>;