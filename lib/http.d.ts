import { AnyProp } from './fetch';
import { Cancellation } from './cancellation';
import { Uri } from './uri';
export declare const supportsAbortController: boolean;
export interface Abortion {
    signal: AbortSignal | undefined;
    subscription: {
        remove(): void;
    };
}
export declare function linkAbortion(cancellation?: Cancellation): Abortion;
export declare const addHeader: (headers: Record<string, string> | Headers | string[][] | null | undefined, name: string, value: string) => HeadersInit;
export declare abstract class MessageContent {
    abstract get mediaType(): string;
    abstract createReadableStream(): ReadableStream<Uint8Array>;
    blob(): Promise<Blob>;
    text(): Promise<string>;
    json<T>(): Promise<T>;
}
export declare class FormUrlEncodedContent extends MessageContent implements Map<string, string> {
    private readonly data;
    get mediaType(): string;
    get size(): number;
    constructor(source: HTMLFormElement | FormData | Iterable<readonly [string, string]> | Record<string, string>);
    [Symbol.iterator](): IterableIterator<[string, string]>;
    get [Symbol.toStringTag](): string;
    clear(): void;
    delete(key: string): boolean;
    entries(): IterableIterator<[string, string]>;
    forEach(callbackfn: (value: string, key: string, map: Map<string, string>) => void, thisArg?: any): void;
    get(key: string): string | undefined;
    has(key: string): boolean;
    keys(): IterableIterator<string>;
    set(key: string, value: string): this;
    createReadableStream(): ReadableStream<Uint8Array>;
    values(): IterableIterator<string>;
}
export declare class MultipartFormContent extends MessageContent implements Map<string, FormDataEntryValue> {
    private readonly data;
    private readonly boundary;
    get mediaType(): string;
    get size(): number;
    constructor(source: HTMLFormElement | FormData | Iterable<readonly [string, FormDataEntryValue]> | Record<string, FormDataEntryValue>);
    [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
    get [Symbol.toStringTag](): string;
    clear(): void;
    delete(key: string): boolean;
    entries(): IterableIterator<[string, FormDataEntryValue]>;
    forEach(callbackfn: (value: FormDataEntryValue, key: string, map: Map<string, FormDataEntryValue>) => void, thisArg?: any): void;
    get(key: string): string | File | undefined;
    has(key: string): boolean;
    keys(): IterableIterator<string>;
    set(key: string, value: string): this;
    values(): IterableIterator<FormDataEntryValue>;
    createReadableStream(): ReadableStream<any>;
}
export declare class TextContent extends MessageContent {
    private readonly __mediaType;
    protected __textContent: string;
    get mediaType(): string;
    get textContent(): string;
    constructor(text: string, mediaType?: string);
    get [Symbol.toStringTag](): string;
    createReadableStream(): ReadableStream<Uint8Array>;
    blob(): Promise<Blob>;
    text(): Promise<string>;
}
export declare class JsonContent extends TextContent {
    protected __object: any;
    get object(): any;
    get textContent(): string;
    constructor(obj: any, mediaType?: string);
    get [Symbol.toStringTag](): string;
    json(): Promise<any>;
}
export interface RequestMessage {
    uri: Uri;
    content?: MessageContent;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    headers?: HeadersInit;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
}
export interface ResponseMessage {
    uri: Uri;
    headers: Headers;
    ok: boolean;
    status: number;
    statusText: string;
    type: ResponseType;
    content?: MessageContent;
}
export declare abstract class MessageHandler {
    abstract send(message: RequestMessage, cancellation?: Cancellation): Promise<ResponseMessage>;
}
declare type SendDelegate = (message: RequestMessage, cancellation?: Cancellation) => Promise<ResponseMessage>;
export declare class DelegatingHandler extends MessageHandler {
    static derive(override: (send: SendDelegate, message: RequestMessage, cancellation?: Cancellation) => Promise<ResponseMessage>): typeof DelegatingHandler;
    static create(innerHandler: MessageHandler, override: (send: SendDelegate, message: RequestMessage, cancellation?: Cancellation) => Promise<ResponseMessage>): DelegatingHandler;
    private readonly innerHandler;
    constructor(innerHandler: MessageHandler);
    send(message: RequestMessage, cancellation?: Cancellation): Promise<ResponseMessage>;
}
export declare class HttpClientHandler extends MessageHandler {
    get fetch(): (uri: string, init: RequestInit & AnyProp) => Promise<Response>;
    preprocessRequestMessage(message: RequestMessage): Promise<RequestMessage>;
    readResponseMessage(response: Response): Promise<ResponseMessage>;
    send(message: RequestMessage, cancellation?: Cancellation): Promise<ResponseMessage>;
}
export declare const defaultHttpClientHandler: HttpClientHandler;
export declare class HttpClientConfiguration {
    private readonly handlers;
    private default;
    getHandler(configuration?: string | null): MessageHandler;
    setHandler(configuration: string | null, handler: MessageHandler): void;
}
export declare const httpClientConfiguration: HttpClientConfiguration;
export declare class HttpClient {
    private handler;
    /**
     * Initializes new instance of http client with default message handler configured through _httpClientConfiguration_.
     */
    constructor();
    /**
     * Initializes new instance of http client with the specified handler.
     * @param handler Message handler to use.
     */
    constructor(handler: MessageHandler);
    /**
     * Initializes new instance of http client with message handler configured through _httpClientConfiguration_.
     *
     * @param configuration Message handler configuration name.
     */
    constructor(configuration: string);
    send(request: RequestMessage, cancellation?: Cancellation): Promise<ResponseMessage>;
    delete(uri: string | Uri, cancellation?: Cancellation): Promise<ResponseMessage>;
    get(uri: string | Uri, cancellation?: Cancellation): Promise<ResponseMessage>;
    getBlob(uri: string | Uri, cancellation?: Cancellation): Promise<Blob>;
    getJson(uri: string | Uri, cancellation?: Cancellation): Promise<any>;
    getText(uri: string | Uri, cancellation?: Cancellation): Promise<string>;
    post(uri: string | Uri, content: MessageContent | FormData | HTMLFormElement | string | object | null, cancellation?: Cancellation): Promise<ResponseMessage>;
    put(uri: string | Uri, content: MessageContent | FormData | HTMLFormElement | string | object | null, cancellation?: Cancellation): Promise<ResponseMessage>;
}
export {};
