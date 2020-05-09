import { AnyProp, decoratedFetch, HttpError } from './fetch';
import { Cancellation } from './cancellation';
import { Uri } from './uri';

const blobToReadableStream = (blob: Blob): ReadableStream<Uint8Array> => {
  if ((<any> blob).stream) {
    return (<any> blob).stream();
  }
  return <ReadableStream<Uint8Array>> new Response(blob).body;
};

export const supportsAbortController = (function() {
  try {
    if ((window as any).AbortController) {
      return true;
    }
    return false;
  } catch (exn) {
    // seems to be test ENV
    return true;
  }
}());

export interface Abortion {
  signal: AbortSignal|undefined;
  subscription: { remove(): void };
}

export function linkAbortion(cancellation?: Cancellation): Abortion {
  let signal: AbortSignal|undefined;
  let subscription: { remove(): void };
  if (undefined !== cancellation && supportsAbortController) {
    const abortController = new AbortController();
    signal = abortController.signal;
    subscription = cancellation.subscribe(() => abortController.abort());
  } else {
    signal = undefined;
    subscription = { remove() { return; } };
  }
  return { signal, subscription };
}

export const addHeader = (headers: HeadersInit|null|undefined, name: string, value: string) => {
  if (!headers) {
    return new Headers([[name, value]]);
  }
  if (headers instanceof Headers) {
    headers.append(name, value);
  } else if (Array.isArray(headers)) {
    headers.push([name, value]);
  } else {
    headers[name] = value;
  }
  return headers;
};

// *********************************************************************************************************************
// MESSAGE CONTENT *****************************************************************************************************
// *********************************************************************************************************************

export abstract class MessageContent {
  abstract get mediaType(): string;

  abstract createReadableStream(): ReadableStream<Uint8Array>;

  blob(): Promise<Blob> {
    const chunks: BlobPart[] = [];
    const readChunk = async (reader: ReadableStreamReader<Uint8Array>): Promise<Blob> => {
      const res = await reader.read();
      if (!res || res.done) {
        return new Blob(chunks, { type: this.mediaType });
      }
      chunks.push(res.value);
      return readChunk(reader);
    };
    return readChunk(this.createReadableStream().getReader());
  }

  async text(): Promise<string> {
    const blob = await this.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(<string> reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob); // FIXME: encoding
    });
  }

  async json<T>(): Promise<T> {
    const text = await this.text();
    return <T> JSON.parse(text);
  }
}

type HTMLElementWithValue = HTMLInputElement|HTMLOutputElement|HTMLSelectElement|HTMLTextAreaElement;

/**
 * Checks whether the specified element posesses value that should be submitted as form field.
 *
 * @param element element to check.
 */
const isInputWithValue = (element: Element): element is HTMLElementWithValue => {
  return element instanceof HTMLInputElement
    || element instanceof HTMLOutputElement
    || element instanceof HTMLSelectElement
    || element instanceof HTMLTemplateElement;
};

const isIterable = <T>(obj: any): obj is Iterable<T> => {
  return obj && 'function' === typeof obj[Symbol.iterator];
};

function* iterateRecord<K extends keyof any, V>(source: Record<K, V>) {
  // tslint:disable-next-line:forin
  for (const key in source) {
    yield <readonly [K, V]> [key, source[key]];
  }
}

function iterateHTMLFormElement(source: HTMLFormElement): () => Generator<readonly [string, FormDataEntryValue]>;
// tslint:disable-next-line:max-line-length
function iterateHTMLFormElement(source: HTMLFormElement, throwOnFile: true): () => Generator<readonly [string, string]>;

function iterateHTMLFormElement(source: HTMLFormElement, throwOnFile?: true) {
  if (throwOnFile) {
    return function*() {
      for (const input of Array.from(source.elements)) {
        const name = input.getAttribute('name');
        if (name && isInputWithValue(input)) {
          if (input instanceof HTMLInputElement && 'file' === input.type) {
            throw new Error('files not supposed to be sent using url encoded form, use MultipartFormContent instead!');
          }
          yield <readonly [string, string]> [name, input.value];
        }
      }
    };
  }
  return function*() {
    for (const input of Array.from(source.elements)) {
      const name = input.getAttribute('name');
      if (name && isInputWithValue(input)) {
        if (input instanceof HTMLInputElement && 'file' === input.type) {
          if (input.files) {
            for (const file of Array.from(input.files)) {
              yield <readonly [string, FormDataEntryValue]> [name, file];
            }
          }
        }
        yield <readonly [string, FormDataEntryValue]> [name, input.value];
      }
    }
  };
}

function iterateFormData(formData: FormData): () => IterableIterator<readonly [string, FormDataEntryValue]>;
function iterateFormData(formData: FormData, throwOnFile: true): () => IterableIterator<readonly [string, string]>;

function iterateFormData(formData: FormData, throwOnFile?: true) {
  if (throwOnFile) {
    return function*() {
      for (const [k, v] of formData.entries()) {
        if (v instanceof File) {
          throw new Error('files not supposed to be sent using url encoded form, use MultipartFormContent instead!');
        }
        yield <readonly [string, string]> [k, v];
      }
    };
  }
  return () => <IterableIterator<readonly [string, FormDataEntryValue]>> formData.entries();
}

export class FormUrlEncodedContent extends MessageContent implements Map<string, string> {
  private readonly data: Map<string, string>;

  get mediaType() { return 'application/x-www-form-urlencoded'; }

  get size() { return this.data.size; }

  constructor(source: HTMLFormElement|FormData|Iterable<readonly [string, string]>|Record<string, string>) {
    super();
    let iterable: Iterable<readonly [string, string]>;
    if (!source) {
      throw new TypeError('source must be non-falsy value!');
    }
    if (source instanceof HTMLFormElement) {
      iterable = iterateHTMLFormElement(source, true)();
    } else if (source instanceof FormData) {
      iterable = iterateFormData(source, true)();
    } else if (isIterable<readonly [string, string]>(source)) {
      iterable = source;
    } else {
      iterable = iterateRecord(source);
    }
    this.data = new Map(iterable);
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.data[Symbol.iterator]();
  }

  get [Symbol.toStringTag]() {
    return 'FormUrlEncodedContent';
  }

  clear() {
    this.data.clear();
  }

  delete(key: string) {
    return this.data.delete(key);
  }

  entries() {
    return this.data.entries();
  }

  forEach(callbackfn: (value: string, key: string, map: Map<string, string>) => void, thisArg?: any) {
    this.data.forEach(callbackfn, thisArg);
  }

  get(key: string) {
    return this.data.get(key);
  }

  has(key: string) {
    return this.data.has(key);
  }

  keys() {
    return this.data.keys();
  }

  set(key: string, value: string): this {
    this.data.set(key, value);
    return this;
  }

  createReadableStream() {
    let contents = '';
    for (const [key, value] of this.data) {
      if (contents) {
        contents += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      } else {
        contents = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
    }
    const blob = new Blob([ contents ], { type: 'application/x-www-form-urlencoded' });
    return blobToReadableStream(blob);
  }

  values() {
    return this.data.values();
  }
}

export class MultipartFormContent extends MessageContent implements Map<string, FormDataEntryValue> {
  private readonly data: Map<string, FormDataEntryValue>;
  private readonly boundary: string;

  get mediaType() { return `multipart/form-data; boundary=${this.boundary}`; }

  get size() { return this.data.size; }

  // tslint:disable-next-line:max-line-length
  constructor(source: HTMLFormElement|FormData|Iterable<readonly [string, FormDataEntryValue]>|Record<string, FormDataEntryValue>) {
    super();
    if (!source) {
      throw new TypeError('source must be non-falsy value!');
    }
    let iterable: Iterable<readonly [string, FormDataEntryValue]>;
    if (source instanceof FormData) {
      iterable = iterateFormData(source)();
    } else if (source instanceof HTMLFormElement) {
      iterable = iterateHTMLFormElement(source)();
    } else if (isIterable<readonly [string, FormDataEntryValue]>(source)) {
      iterable = source;
    } else {
      iterable = iterateRecord(source);
    }
    this.data = new Map<string, FormDataEntryValue>(iterable);
    this.boundary = `-----boundary-${Date.now()}-${Math.round(Math.random() * 100000)}`;
  }

  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]> {
    return this.data[Symbol.iterator]();
  }

  get [Symbol.toStringTag]() {
    return 'MultipartFormContent';
  }

  clear() {
    this.data.clear();
  }

  delete(key: string) {
    return this.data.delete(key);
  }

  entries() {
    return this.data.entries();
  }

  // tslint:disable-next-line:max-line-length
  forEach(callbackfn: (value: FormDataEntryValue, key: string, map: Map<string, FormDataEntryValue>) => void, thisArg?: any) {
    this.data.forEach(callbackfn, thisArg);
  }

  get(key: string) {
    return this.data.get(key);
  }

  has(key: string) {
    return this.data.has(key);
  }

  keys() {
    return this.data.keys();
  }

  set(key: string, value: string): this {
    this.data.set(key, value);
    return this;
  }

  values() {
    return this.data.values();
  }

  createReadableStream() {
    const boundary = this.boundary;
    const entries = this.data.entries();
    return new ReadableStream({
      async pull(controller) {
        const entry = entries.next();
        if (entry && !entry.done) {
          const [name, data] = entry.value;
          if ('string' === typeof data) {
            controller.enqueue([
              `${boundary}`,
              `Content-Disposition: form-data; name=${encodeURIComponent(name)}`,
              'Content-Type: text/plain; charset=utf-8',
              '',
              data,
              ''
            ].join('\r\n'));
          } else {
            // tslint:disable-next-line:max-line-length
            const stream: ReadableStream<Uint8Array> = ((<any> data).stream && (<any> data).stream()) || new Response(data).body;
            const passChunk = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
              const res = await reader.read();
              if (res.done) {
                return;
              }
              const base64 = btoa(Array.prototype.map.call(res, (n: number) => String.fromCharCode(n)).join(''));
              controller.enqueue(base64);
              await passChunk(reader);
            };
            controller.enqueue([
              `${boundary}`,
              `Content-Disposition: form-data; name=${encodeURIComponent(name)}; filename=${data.name}`,
              `Content-Type: ${data.type || 'application/octet-stream'}`,
              `Content-Transfer-Encoding: base64`,
              '',
            ].join('\r\n'));
            await passChunk(stream.getReader());
            controller.enqueue('\r\n');
          }
        } else {
          controller.enqueue(`${boundary}--\r\n`);
          controller.close();
        }
      }
    });
  }
}

export class TextContent extends MessageContent {
  private readonly __mediaType: string;
  protected __textContent: string;

  get mediaType() { return this.__mediaType; }

  get textContent() { return this.__textContent; }

  constructor(text: string, mediaType?: string) {
    super();
    this.__textContent = text;
    this.__mediaType = mediaType || 'text/plain';
  }

  get [Symbol.toStringTag]() {
    return 'TextContent';
  }

  createReadableStream() {
    return blobToReadableStream(new Blob([this.textContent], { type: this.mediaType }));
  }

  blob() {
    return Promise.resolve(new Blob([this.textContent], { type: this.mediaType }));
  }

  text() {
    return Promise.resolve(this.textContent);
  }
}

export class JsonContent extends TextContent {

  protected __object: any;

  get object() {
    return this.__object;
  }

  get textContent() {
    if (!this.__textContent) {
      this.__textContent = JSON.stringify(this.object);
    }
    return this.__textContent;
  }

  constructor(obj: any, mediaType?: string) {
    super(<any> null, mediaType || 'application/json');
    this.__object = obj;
  }

  get [Symbol.toStringTag]() {
    return 'JsonContent';
  }

  json() {
    return Promise.resolve(this.object);
  }
}

class GenericContent extends MessageContent {
  private readonly __stream: ReadableStream<Uint8Array>;
  private readonly __mediaType: string;

  get mediaType() { return this.__mediaType; }

  constructor(stream: ReadableStream<Uint8Array>, mediaType: string) {
    super();
    this.__stream = stream;
    this.__mediaType = mediaType;
  }

  createReadableStream() {
    return this.__stream;
  }
}

class None { }

const none = new None();

class ResponseJsonContent extends JsonContent {

  get object() {
    if (this.__object instanceof None) {
      this.__object = JSON.parse(this.__textContent);
    }
    return this.__object;
  }

  constructor(text: string, mediaType: string) {
    super(none, mediaType);
    this.__textContent = text;
  }
}

// *********************************************************************************************************************
// MESSAGE INTERFACES **************************************************************************************************
// *********************************************************************************************************************

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

// *********************************************************************************************************************
// HANDLER ABSTRACTION *************************************************************************************************
// *********************************************************************************************************************

export abstract class MessageHandler {
  abstract send(message: RequestMessage, cancellation?: Cancellation): Promise<ResponseMessage>;
}

type SendDelegate = (message: RequestMessage, cancellation?: Cancellation) => Promise<ResponseMessage>;

export class DelegatingHandler extends MessageHandler {
  // tslint:disable-next-line:max-line-length
  static derive(override: (send: SendDelegate, message: RequestMessage, cancellation?: Cancellation) => Promise<ResponseMessage>) {
    return <typeof DelegatingHandler> class DerivedHandler extends DelegatingHandler {
      constructor(innerHandler: MessageHandler) {
        super(innerHandler);
      }

      send(message: RequestMessage, cancellation?: Cancellation) {
        return override(
          (msg, cancel) => super.send(msg, cancel),
          message,
          cancellation
        );
      }
    };
  }

  // tslint:disable-next-line:max-line-length
  static create(innerHandler: MessageHandler, override: (send: SendDelegate, message: RequestMessage, cancellation?: Cancellation) => Promise<ResponseMessage>) {
    const handlerType = this.derive(override);
    return new handlerType(innerHandler);
  }

  private readonly innerHandler: MessageHandler;

  constructor(innerHandler: MessageHandler) {
    super();
    this.innerHandler = innerHandler;
  }

  send(message: RequestMessage, cancellation?: Cancellation) {
    return this.innerHandler.send(message, cancellation);
  }
}

export class HttpClientHandler extends MessageHandler {
  get fetch(): (uri: string, init: RequestInit&AnyProp) => Promise<Response> {
    return decoratedFetch;
  }

  async preprocessRequestMessage(message: RequestMessage): Promise<RequestMessage> {
    return message;
  }

  async readResponseMessage(response: Response): Promise<ResponseMessage> {
    let content: MessageContent|null = null;
    let contentType: string|null = null;
    if (response.headers) {
      contentType = response.headers.get('Content-Type');
      if (contentType) {
        if (contentType.startsWith('text/plain')) {
          content = new TextContent(await response.text(), contentType);
        } else if (contentType.startsWith('text/json') || contentType.startsWith('application/json')) {
          content = new ResponseJsonContent(await response.text(), contentType);
        }
      }
    }
    if (null === content) {
      content = response.body
        ? new GenericContent(response.body, contentType || 'application/octet-stream')
        : null;
    }
    return {
      uri: new Uri(response.url),
      headers: response.headers,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      type: response.type,
      content: content || undefined
    };
  }

  async send(message: RequestMessage, cancellation?: Cancellation) {
    const abortion = linkAbortion(cancellation);
    try {
      const { uri, content, ...init } = await this.preprocessRequestMessage(message);
      if (content && content.mediaType) {
        init.headers = addHeader(init.headers, 'Content-Type', content.mediaType);
      }
      // sending readable stream not yet supported hance using blob instead....
      // const body = content ? content.createReadableStream() : undefined;
      const body = content ? await content.blob() : undefined;
      const response = await this.fetch(message.uri.href, {
        ...init,
        body,
        signal: abortion.signal
      });
      return this.readResponseMessage(response);
    } finally {
      abortion.subscription.remove();
    }
  }
}

export const defaultHttpClientHandler = new HttpClientHandler();

export class HttpClientConfiguration {
  private readonly handlers: Map<string, MessageHandler> = new Map();
  private default: MessageHandler = defaultHttpClientHandler;

  getHandler(configuration?: string|null): MessageHandler {
    if (!configuration) {
      return this.default;
    }
    return this.handlers.get(configuration) || this.default;
  }

  setHandler(configuration: string|null, handler: MessageHandler) {
    if (!configuration) {
      this.default = handler;
    } else {
      this.handlers.set(configuration, handler);
    }
  }
}

export const httpClientConfiguration = new HttpClientConfiguration();

export class HttpClient {
  private handler: MessageHandler;

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

  constructor(handlerOrConfiguration?: MessageHandler|string) {
    if (!handlerOrConfiguration) {
      this.handler = httpClientConfiguration.getHandler();
    } else if (handlerOrConfiguration instanceof MessageHandler) {
      this.handler = handlerOrConfiguration;
    } else if ('string' === typeof handlerOrConfiguration) {
      this.handler = httpClientConfiguration.getHandler(handlerOrConfiguration);
    } else {
      throw new TypeError(`invalid argument: ${handlerOrConfiguration}`);
    }
  }

  send(request: RequestMessage, cancellation?: Cancellation) {
    return this.handler.send(request, cancellation);
  }

  delete(uri: string|Uri, cancellation?: Cancellation) {
    return this.send({
      uri: Uri.from(uri),
      method: 'DELETE'
    }, cancellation);
  }

  get(uri: string|Uri, cancellation?: Cancellation) {
    return this.send({
      uri: Uri.from(uri),
      method: 'GET'
    }, cancellation);
  }

  async getBlob(uri: string|Uri, cancellation?: Cancellation): Promise<Blob> {
    const response = await this.get(uri, cancellation);
    if (response.ok) {
      if (response.content) {
        return response.content.blob();
      }
      throw new Error('response has no content');
    }
    throw new HttpError(response);
  }

  async getJson(uri: string|Uri, cancellation?: Cancellation): Promise<any> {
    const response = await this.send({
      uri: Uri.from(uri),
      method: 'GET',
      headers: { Accept: 'application/json' }
    }, cancellation);
    if (response.ok) {
      if (response.content) {
        return response.content.json();
      }
      throw new Error('response has no content');
    }
    throw new HttpError(response);
  }

  async getText(uri: string|Uri, cancellation?: Cancellation): Promise<string> {
    const response = await this.get(uri, cancellation);
    if (response.ok) {
      if (response.content) {
        return response.content.text();
      }
      throw new Error('response has no content');
    }
    throw new HttpError(response);
  }

  // tslint:disable-next-line:max-line-length
  post(uri: string|Uri, content: MessageContent|FormData|HTMLFormElement|string|object|null, cancellation?: Cancellation) {
    return this.send({
      uri: Uri.from(uri),
      content: (content instanceof MessageContent || null === content)
        ? (content || undefined)
        : (content instanceof FormData
            ? new MultipartFormContent(content)
            : (content instanceof HTMLFormElement
                ? new MultipartFormContent(content)
                : ('string' === typeof content
                    ? new TextContent(content)
                    : new JsonContent(content)
                  )
              )
          ),
      method: 'POST'
    }, cancellation);
  }

  // tslint:disable-next-line:max-line-length
  put(uri: string|Uri, content: MessageContent|FormData|HTMLFormElement|string|object|null, cancellation?: Cancellation) {
    return this.send({
      uri: Uri.from(uri),
      content: (content instanceof MessageContent || null === content)
        ? (content || undefined)
        : (content instanceof FormData
            ? new MultipartFormContent(content)
            : (content instanceof HTMLFormElement
                ? new MultipartFormContent(content)
                : ('string' === typeof content
                    ? new TextContent(content)
                    : new JsonContent(content)
                  )
              )
          ),
      method: 'PUT'
    }, cancellation);
  }
}
