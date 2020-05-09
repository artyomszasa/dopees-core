import { decoratedFetch, HttpError } from './fetch';
import { Uri } from './uri';
const blobToReadableStream = (blob) => {
    if (blob.stream) {
        return blob.stream();
    }
    return new Response(blob).body;
};
export const supportsAbortController = (function () {
    try {
        if (window.AbortController) {
            return true;
        }
        return false;
    }
    catch (exn) {
        // seems to be test ENV
        return true;
    }
}());
export function linkAbortion(cancellation) {
    let signal;
    let subscription;
    if (undefined !== cancellation && supportsAbortController) {
        const abortController = new AbortController();
        signal = abortController.signal;
        subscription = cancellation.subscribe(() => abortController.abort());
    }
    else {
        signal = undefined;
        subscription = { remove() { return; } };
    }
    return { signal, subscription };
}
export const addHeader = (headers, name, value) => {
    if (!headers) {
        return new Headers([[name, value]]);
    }
    if (headers instanceof Headers) {
        headers.append(name, value);
    }
    else if (Array.isArray(headers)) {
        headers.push([name, value]);
    }
    else {
        headers[name] = value;
    }
    return headers;
};
// *********************************************************************************************************************
// MESSAGE CONTENT *****************************************************************************************************
// *********************************************************************************************************************
export class MessageContent {
    blob() {
        const chunks = [];
        const readChunk = async (reader) => {
            const res = await reader.read();
            if (!res || res.done) {
                return new Blob(chunks, { type: this.mediaType });
            }
            chunks.push(res.value);
            return readChunk(reader);
        };
        return readChunk(this.createReadableStream().getReader());
    }
    async text() {
        const blob = await this.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(blob); // FIXME: encoding
        });
    }
    async json() {
        const text = await this.text();
        return JSON.parse(text);
    }
}
/**
 * Checks whether the specified element posesses value that should be submitted as form field.
 *
 * @param element element to check.
 */
const isInputWithValue = (element) => {
    return element instanceof HTMLInputElement
        || element instanceof HTMLOutputElement
        || element instanceof HTMLSelectElement
        || element instanceof HTMLTemplateElement;
};
const isIterable = (obj) => {
    return obj && 'function' === typeof obj[Symbol.iterator];
};
function* iterateRecord(source) {
    // tslint:disable-next-line:forin
    for (const key in source) {
        yield [key, source[key]];
    }
}
function iterateHTMLFormElement(source, throwOnFile) {
    if (throwOnFile) {
        return function* () {
            for (const input of Array.from(source.elements)) {
                const name = input.getAttribute('name');
                if (name && isInputWithValue(input)) {
                    if (input instanceof HTMLInputElement && 'file' === input.type) {
                        throw new Error('files not supposed to be sent using url encoded form, use MultipartFormContent instead!');
                    }
                    yield [name, input.value];
                }
            }
        };
    }
    return function* () {
        for (const input of Array.from(source.elements)) {
            const name = input.getAttribute('name');
            if (name && isInputWithValue(input)) {
                if (input instanceof HTMLInputElement && 'file' === input.type) {
                    if (input.files) {
                        for (const file of Array.from(input.files)) {
                            yield [name, file];
                        }
                    }
                }
                yield [name, input.value];
            }
        }
    };
}
function iterateFormData(formData, throwOnFile) {
    if (throwOnFile) {
        return function* () {
            for (const [k, v] of formData.entries()) {
                if (v instanceof File) {
                    throw new Error('files not supposed to be sent using url encoded form, use MultipartFormContent instead!');
                }
                yield [k, v];
            }
        };
    }
    return () => formData.entries();
}
export class FormUrlEncodedContent extends MessageContent {
    constructor(source) {
        super();
        let iterable;
        if (!source) {
            throw new TypeError('source must be non-falsy value!');
        }
        if (source instanceof HTMLFormElement) {
            iterable = iterateHTMLFormElement(source, true)();
        }
        else if (source instanceof FormData) {
            iterable = iterateFormData(source, true)();
        }
        else if (isIterable(source)) {
            iterable = source;
        }
        else {
            iterable = iterateRecord(source);
        }
        this.data = new Map(iterable);
    }
    get mediaType() { return 'application/x-www-form-urlencoded'; }
    get size() { return this.data.size; }
    [Symbol.iterator]() {
        return this.data[Symbol.iterator]();
    }
    get [Symbol.toStringTag]() {
        return 'FormUrlEncodedContent';
    }
    clear() {
        this.data.clear();
    }
    delete(key) {
        return this.data.delete(key);
    }
    entries() {
        return this.data.entries();
    }
    forEach(callbackfn, thisArg) {
        this.data.forEach(callbackfn, thisArg);
    }
    get(key) {
        return this.data.get(key);
    }
    has(key) {
        return this.data.has(key);
    }
    keys() {
        return this.data.keys();
    }
    set(key, value) {
        this.data.set(key, value);
        return this;
    }
    createReadableStream() {
        let contents = '';
        for (const [key, value] of this.data) {
            if (contents) {
                contents += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }
            else {
                contents = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }
        }
        const blob = new Blob([contents], { type: 'application/x-www-form-urlencoded' });
        return blobToReadableStream(blob);
    }
    values() {
        return this.data.values();
    }
}
export class MultipartFormContent extends MessageContent {
    // tslint:disable-next-line:max-line-length
    constructor(source) {
        super();
        if (!source) {
            throw new TypeError('source must be non-falsy value!');
        }
        let iterable;
        if (source instanceof FormData) {
            iterable = iterateFormData(source)();
        }
        else if (source instanceof HTMLFormElement) {
            iterable = iterateHTMLFormElement(source)();
        }
        else if (isIterable(source)) {
            iterable = source;
        }
        else {
            iterable = iterateRecord(source);
        }
        this.data = new Map(iterable);
        this.boundary = `-----boundary-${Date.now()}-${Math.round(Math.random() * 100000)}`;
    }
    get mediaType() { return `multipart/form-data; boundary=${this.boundary}`; }
    get size() { return this.data.size; }
    [Symbol.iterator]() {
        return this.data[Symbol.iterator]();
    }
    get [Symbol.toStringTag]() {
        return 'MultipartFormContent';
    }
    clear() {
        this.data.clear();
    }
    delete(key) {
        return this.data.delete(key);
    }
    entries() {
        return this.data.entries();
    }
    // tslint:disable-next-line:max-line-length
    forEach(callbackfn, thisArg) {
        this.data.forEach(callbackfn, thisArg);
    }
    get(key) {
        return this.data.get(key);
    }
    has(key) {
        return this.data.has(key);
    }
    keys() {
        return this.data.keys();
    }
    set(key, value) {
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
                    }
                    else {
                        // tslint:disable-next-line:max-line-length
                        const stream = (data.stream && data.stream()) || new Response(data).body;
                        const passChunk = async (reader) => {
                            const res = await reader.read();
                            if (res.done) {
                                return;
                            }
                            const base64 = btoa(Array.prototype.map.call(res, (n) => String.fromCharCode(n)).join(''));
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
                }
                else {
                    controller.enqueue(`${boundary}--\r\n`);
                    controller.close();
                }
            }
        });
    }
}
export class TextContent extends MessageContent {
    constructor(text, mediaType) {
        super();
        this.__textContent = text;
        this.__mediaType = mediaType || 'text/plain';
    }
    get mediaType() { return this.__mediaType; }
    get textContent() { return this.__textContent; }
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
    constructor(obj, mediaType) {
        super(null, mediaType || 'application/json');
        this.__object = obj;
    }
    get object() {
        return this.__object;
    }
    get textContent() {
        if (!this.__textContent) {
            this.__textContent = JSON.stringify(this.object);
        }
        return this.__textContent;
    }
    get [Symbol.toStringTag]() {
        return 'JsonContent';
    }
    json() {
        return Promise.resolve(this.object);
    }
}
class GenericContent extends MessageContent {
    constructor(stream, mediaType) {
        super();
        this.__stream = stream;
        this.__mediaType = mediaType;
    }
    get mediaType() { return this.__mediaType; }
    createReadableStream() {
        return this.__stream;
    }
}
class None {
}
const none = new None();
class ResponseJsonContent extends JsonContent {
    get object() {
        if (this.__object instanceof None) {
            this.__object = JSON.parse(this.__textContent);
        }
        return this.__object;
    }
    constructor(text, mediaType) {
        super(none, mediaType);
        this.__textContent = text;
    }
}
// *********************************************************************************************************************
// HANDLER ABSTRACTION *************************************************************************************************
// *********************************************************************************************************************
export class MessageHandler {
}
export class DelegatingHandler extends MessageHandler {
    constructor(innerHandler) {
        super();
        this.innerHandler = innerHandler;
    }
    // tslint:disable-next-line:max-line-length
    static derive(override) {
        return class DerivedHandler extends DelegatingHandler {
            constructor(innerHandler) {
                super(innerHandler);
            }
            send(message, cancellation) {
                return override((msg, cancel) => super.send(msg, cancel), message, cancellation);
            }
        };
    }
    // tslint:disable-next-line:max-line-length
    static create(innerHandler, override) {
        const handlerType = this.derive(override);
        return new handlerType(innerHandler);
    }
    send(message, cancellation) {
        return this.innerHandler.send(message, cancellation);
    }
}
export class HttpClientHandler extends MessageHandler {
    get fetch() {
        return decoratedFetch;
    }
    async preprocessRequestMessage(message) {
        return message;
    }
    async readResponseMessage(response) {
        let content = null;
        let contentType = null;
        if (response.headers) {
            contentType = response.headers.get('Content-Type');
            if (contentType) {
                if (contentType.startsWith('text/plain')) {
                    content = new TextContent(await response.text(), contentType);
                }
                else if (contentType.startsWith('text/json') || contentType.startsWith('application/json')) {
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
    async send(message, cancellation) {
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
        }
        finally {
            abortion.subscription.remove();
        }
    }
}
export const defaultHttpClientHandler = new HttpClientHandler();
export class HttpClientConfiguration {
    constructor() {
        this.handlers = new Map();
        this.default = defaultHttpClientHandler;
    }
    getHandler(configuration) {
        if (!configuration) {
            return this.default;
        }
        return this.handlers.get(configuration) || this.default;
    }
    setHandler(configuration, handler) {
        if (!configuration) {
            this.default = handler;
        }
        else {
            this.handlers.set(configuration, handler);
        }
    }
}
export const httpClientConfiguration = new HttpClientConfiguration();
export class HttpClient {
    constructor(handlerOrConfiguration) {
        if (!handlerOrConfiguration) {
            this.handler = httpClientConfiguration.getHandler();
        }
        else if (handlerOrConfiguration instanceof MessageHandler) {
            this.handler = handlerOrConfiguration;
        }
        else if ('string' === typeof handlerOrConfiguration) {
            this.handler = httpClientConfiguration.getHandler(handlerOrConfiguration);
        }
        else {
            throw new TypeError(`invalid argument: ${handlerOrConfiguration}`);
        }
    }
    send(request, cancellation) {
        return this.handler.send(request, cancellation);
    }
    delete(uri, cancellation) {
        return this.send({
            uri: Uri.from(uri),
            method: 'DELETE'
        }, cancellation);
    }
    get(uri, cancellation) {
        return this.send({
            uri: Uri.from(uri),
            method: 'GET'
        }, cancellation);
    }
    async getBlob(uri, cancellation) {
        const response = await this.get(uri, cancellation);
        if (response.ok) {
            if (response.content) {
                return response.content.blob();
            }
            throw new Error('response has no content');
        }
        throw new HttpError(response);
    }
    async getJson(uri, cancellation) {
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
    async getText(uri, cancellation) {
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
    post(uri, content, cancellation) {
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
                            : new JsonContent(content)))),
            method: 'POST'
        }, cancellation);
    }
    // tslint:disable-next-line:max-line-length
    put(uri, content, cancellation) {
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
                            : new JsonContent(content)))),
            method: 'PUT'
        }, cancellation);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9odHRwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVyxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRTdELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFNUIsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLElBQVUsRUFBOEIsRUFBRTtJQUN0RSxJQUFXLElBQUssQ0FBQyxNQUFNLEVBQUU7UUFDdkIsT0FBYyxJQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDOUI7SUFDRCxPQUFvQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDOUQsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQztJQUN0QyxJQUFJO1FBQ0YsSUFBSyxNQUFjLENBQUMsZUFBZSxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEtBQUssQ0FBQztLQUNkO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWix1QkFBdUI7UUFDdkIsT0FBTyxJQUFJLENBQUM7S0FDYjtBQUNILENBQUMsRUFBRSxDQUFDLENBQUM7QUFPTCxNQUFNLFVBQVUsWUFBWSxDQUFDLFlBQTJCO0lBQ3RELElBQUksTUFBNkIsQ0FBQztJQUNsQyxJQUFJLFlBQWdDLENBQUM7SUFDckMsSUFBSSxTQUFTLEtBQUssWUFBWSxJQUFJLHVCQUF1QixFQUFFO1FBQ3pELE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDOUMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7UUFDaEMsWUFBWSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDdEU7U0FBTTtRQUNMLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFD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V0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUMzQixDQUNKLENBQ0o7WUFDTCxNQUFNLEVBQUUsTUFBTTtTQUNmLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVELDJDQUEyQztJQUMzQyxHQUFHLENBQUMsR0FBZSxFQUFFLE9BQW1FLEVBQUUsWUFBMkI7UUFDbkgsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2YsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ2xCLE9BQU8sRUFBRSxDQUFDLE9BQU8sWUFBWSxjQUFjLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQztnQkFDOUQsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLENBQUMsT0FBTyxZQUFZLFFBQVE7b0JBQzFCLENBQUMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQztvQkFDbkMsQ0FBQyxDQUFDLENBQUMsT0FBTyxZQUFZLGVBQWU7d0JBQ2pDLENBQUMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQzt3QkFDbkMsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLE9BQU8sT0FBTzs0QkFDMUIsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQzs0QkFDMUIsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUMzQixDQUNKLENBQ0o7WUFDTCxNQUFNLEVBQUUsS0FBSztTQUNkLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbkIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW55UHJvcCwgZGVjb3JhdGVkRmV0Y2gsIEh0dHBFcnJvciB9IGZyb20gJy4vZmV0Y2gnO1xuaW1wb3J0IHsgQ2FuY2VsbGF0aW9uIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24nO1xuaW1wb3J0IHsgVXJpIH0gZnJvbSAnLi91cmknO1xuXG5jb25zdCBibG9iVG9SZWFkYWJsZVN0cmVhbSA9IChibG9iOiBCbG9iKTogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT4gPT4ge1xuICBpZiAoKDxhbnk+IGJsb2IpLnN0cmVhbSkge1xuICAgIHJldHVybiAoPGFueT4gYmxvYikuc3RyZWFtKCk7XG4gIH1cbiAgcmV0dXJuIDxSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5Pj4gbmV3IFJlc3BvbnNlKGJsb2IpLmJvZHk7XG59O1xuXG5leHBvcnQgY29uc3Qgc3VwcG9ydHNBYm9ydENvbnRyb2xsZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5BYm9ydENvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gY2F0Y2ggKGV4bikge1xuICAgIC8vIHNlZW1zIHRvIGJlIHRlc3QgRU5WXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn0oKSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWJvcnRpb24ge1xuICBzaWduYWw6IEFib3J0U2lnbmFsfHVuZGVmaW5lZDtcbiAgc3Vic2NyaXB0aW9uOiB7IHJlbW92ZSgpOiB2b2lkIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW5rQWJvcnRpb24oY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKTogQWJvcnRpb24ge1xuICBsZXQgc2lnbmFsOiBBYm9ydFNpZ25hbHx1bmRlZmluZWQ7XG4gIGxldCBzdWJzY3JpcHRpb246IHsgcmVtb3ZlKCk6IHZvaWQgfTtcbiAgaWYgKHVuZGVmaW5lZCAhPT0gY2FuY2VsbGF0aW9uICYmIHN1cHBvcnRzQWJvcnRDb250cm9sbGVyKSB7XG4gICAgY29uc3QgYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHNpZ25hbCA9IGFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gICAgc3Vic2NyaXB0aW9uID0gY2FuY2VsbGF0aW9uLnN1YnNjcmliZSgoKSA9PiBhYm9ydENvbnRyb2xsZXIuYWJvcnQoKSk7XG4gIH0gZWxzZSB7XG4gICAgc2lnbmFsID0gdW5kZWZpbmVkO1xuICAgIHN1YnNjcmlwdGlvbiA9IHsgcmVtb3ZlKCkgeyByZXR1cm47IH0gfTtcbiAgfVxuICByZXR1cm4geyBzaWduYWwsIHN1YnNjcmlwdGlvbiB9O1xufVxuXG5leHBvcnQgY29uc3QgYWRkSGVhZGVyID0gKGhlYWRlcnM6IEhlYWRlcnNJbml0fG51bGx8dW5kZWZpbmVkLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgaWYgKCFoZWFkZXJzKSB7XG4gICAgcmV0dXJuIG5ldyBIZWFkZXJzKFtbbmFtZSwgdmFsdWVdXSk7XG4gIH1cbiAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaGVhZGVycykpIHtcbiAgICBoZWFkZXJzLnB1c2goW25hbWUsIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgaGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiBoZWFkZXJzO1xufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyBNRVNTQUdFIENPTlRFTlQgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWVzc2FnZUNvbnRlbnQge1xuICBhYnN0cmFjdCBnZXQgbWVkaWFUeXBlKCk6IHN0cmluZztcblxuICBhYnN0cmFjdCBjcmVhdGVSZWFkYWJsZVN0cmVhbSgpOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PjtcblxuICBibG9iKCk6IFByb21pc2U8QmxvYj4ge1xuICAgIGNvbnN0IGNodW5rczogQmxvYlBhcnRbXSA9IFtdO1xuICAgIGNvbnN0IHJlYWRDaHVuayA9IGFzeW5jIChyZWFkZXI6IFJlYWRhYmxlU3RyZWFtUmVhZGVyPFVpbnQ4QXJyYXk+KTogUHJvbWlzZTxCbG9iPiA9PiB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgaWYgKCFyZXMgfHwgcmVzLmRvbmUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKGNodW5rcywgeyB0eXBlOiB0aGlzLm1lZGlhVHlwZSB9KTtcbiAgICAgIH1cbiAgICAgIGNodW5rcy5wdXNoKHJlcy52YWx1ZSk7XG4gICAgICByZXR1cm4gcmVhZENodW5rKHJlYWRlcik7XG4gICAgfTtcbiAgICByZXR1cm4gcmVhZENodW5rKHRoaXMuY3JlYXRlUmVhZGFibGVTdHJlYW0oKS5nZXRSZWFkZXIoKSk7XG4gIH1cblxuICBhc3luYyB0ZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYmxvYiA9IGF3YWl0IHRoaXMuYmxvYigpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9ICgpID0+IHJlc29sdmUoPHN0cmluZz4gcmVhZGVyLnJlc3VsdCk7XG4gICAgICByZWFkZXIub25lcnJvciA9ICgpID0+IHJlamVjdChyZWFkZXIuZXJyb3IpO1xuICAgICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYik7IC8vIEZJWE1FOiBlbmNvZGluZ1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMganNvbjxUPigpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgdGhpcy50ZXh0KCk7XG4gICAgcmV0dXJuIDxUPiBKU09OLnBhcnNlKHRleHQpO1xuICB9XG59XG5cbnR5cGUgSFRNTEVsZW1lbnRXaXRoVmFsdWUgPSBIVE1MSW5wdXRFbGVtZW50fEhUTUxPdXRwdXRFbGVtZW50fEhUTUxTZWxlY3RFbGVtZW50fEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBlbGVtZW50IHBvc2Vzc2VzIHZhbHVlIHRoYXQgc2hvdWxkIGJlIHN1Ym1pdHRlZCBhcyBmb3JtIGZpZWxkLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IGVsZW1lbnQgdG8gY2hlY2suXG4gKi9cbmNvbnN0IGlzSW5wdXRXaXRoVmFsdWUgPSAoZWxlbWVudDogRWxlbWVudCk6IGVsZW1lbnQgaXMgSFRNTEVsZW1lbnRXaXRoVmFsdWUgPT4ge1xuICByZXR1cm4gZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnRcbiAgICB8fCBlbGVtZW50IGluc3RhbmNlb2YgSFRNTE91dHB1dEVsZW1lbnRcbiAgICB8fCBlbGVtZW50IGluc3RhbmNlb2YgSFRNTFNlbGVjdEVsZW1lbnRcbiAgICB8fCBlbGVtZW50IGluc3RhbmNlb2YgSFRNTFRlbXBsYXRlRWxlbWVudDtcbn07XG5cbmNvbnN0IGlzSXRlcmFibGUgPSA8VD4ob2JqOiBhbnkpOiBvYmogaXMgSXRlcmFibGU8VD4gPT4ge1xuICByZXR1cm4gb2JqICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiBvYmpbU3ltYm9sLml0ZXJhdG9yXTtcbn07XG5cbmZ1bmN0aW9uKiBpdGVyYXRlUmVjb3JkPEsgZXh0ZW5kcyBrZXlvZiBhbnksIFY+KHNvdXJjZTogUmVjb3JkPEssIFY+KSB7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpmb3JpblxuICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcbiAgICB5aWVsZCA8cmVhZG9ubHkgW0ssIFZdPiBba2V5LCBzb3VyY2Vba2V5XV07XG4gIH1cbn1cblxuZnVuY3Rpb24gaXRlcmF0ZUhUTUxGb3JtRWxlbWVudChzb3VyY2U6IEhUTUxGb3JtRWxlbWVudCk6ICgpID0+IEdlbmVyYXRvcjxyZWFkb25seSBbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPjtcbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbmZ1bmN0aW9uIGl0ZXJhdGVIVE1MRm9ybUVsZW1lbnQoc291cmNlOiBIVE1MRm9ybUVsZW1lbnQsIHRocm93T25GaWxlOiB0cnVlKTogKCkgPT4gR2VuZXJhdG9yPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+O1xuXG5mdW5jdGlvbiBpdGVyYXRlSFRNTEZvcm1FbGVtZW50KHNvdXJjZTogSFRNTEZvcm1FbGVtZW50LCB0aHJvd09uRmlsZT86IHRydWUpIHtcbiAgaWYgKHRocm93T25GaWxlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKigpIHtcbiAgICAgIGZvciAoY29uc3QgaW5wdXQgb2YgQXJyYXkuZnJvbShzb3VyY2UuZWxlbWVudHMpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgICAgaWYgKG5hbWUgJiYgaXNJbnB1dFdpdGhWYWx1ZShpbnB1dCkpIHtcbiAgICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmICdmaWxlJyA9PT0gaW5wdXQudHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmaWxlcyBub3Qgc3VwcG9zZWQgdG8gYmUgc2VudCB1c2luZyB1cmwgZW5jb2RlZCBmb3JtLCB1c2UgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQgaW5zdGVhZCEnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgeWllbGQgPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+IFtuYW1lLCBpbnB1dC52YWx1ZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiooKSB7XG4gICAgZm9yIChjb25zdCBpbnB1dCBvZiBBcnJheS5mcm9tKHNvdXJjZS5lbGVtZW50cykpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgIGlmIChuYW1lICYmIGlzSW5wdXRXaXRoVmFsdWUoaW5wdXQpKSB7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiYgJ2ZpbGUnID09PSBpbnB1dC50eXBlKSB7XG4gICAgICAgICAgaWYgKGlucHV0LmZpbGVzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgQXJyYXkuZnJvbShpbnB1dC5maWxlcykpIHtcbiAgICAgICAgICAgICAgeWllbGQgPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+IFtuYW1lLCBmaWxlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQgPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+IFtuYW1lLCBpbnB1dC52YWx1ZV07XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBpdGVyYXRlRm9ybURhdGEoZm9ybURhdGE6IEZvcm1EYXRhKTogKCkgPT4gSXRlcmFibGVJdGVyYXRvcjxyZWFkb25seSBbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPjtcbmZ1bmN0aW9uIGl0ZXJhdGVGb3JtRGF0YShmb3JtRGF0YTogRm9ybURhdGEsIHRocm93T25GaWxlOiB0cnVlKTogKCkgPT4gSXRlcmFibGVJdGVyYXRvcjxyZWFkb25seSBbc3RyaW5nLCBzdHJpbmddPjtcblxuZnVuY3Rpb24gaXRlcmF0ZUZvcm1EYXRhKGZvcm1EYXRhOiBGb3JtRGF0YSwgdGhyb3dPbkZpbGU/OiB0cnVlKSB7XG4gIGlmICh0aHJvd09uRmlsZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiooKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBmb3JtRGF0YS5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKHYgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmaWxlcyBub3Qgc3VwcG9zZWQgdG8gYmUgc2VudCB1c2luZyB1cmwgZW5jb2RlZCBmb3JtLCB1c2UgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQgaW5zdGVhZCEnKTtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCA8cmVhZG9ubHkgW3N0cmluZywgc3RyaW5nXT4gW2ssIHZdO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuICgpID0+IDxJdGVyYWJsZUl0ZXJhdG9yPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+PiBmb3JtRGF0YS5lbnRyaWVzKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBGb3JtVXJsRW5jb2RlZENvbnRlbnQgZXh0ZW5kcyBNZXNzYWdlQ29udGVudCBpbXBsZW1lbnRzIE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGRhdGE6IE1hcDxzdHJpbmcsIHN0cmluZz47XG5cbiAgZ2V0IG1lZGlhVHlwZSgpIHsgcmV0dXJuICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOyB9XG5cbiAgZ2V0IHNpemUoKSB7IHJldHVybiB0aGlzLmRhdGEuc2l6ZTsgfVxuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogSFRNTEZvcm1FbGVtZW50fEZvcm1EYXRhfEl0ZXJhYmxlPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+fFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcbiAgICBzdXBlcigpO1xuICAgIGxldCBpdGVyYWJsZTogSXRlcmFibGU8cmVhZG9ubHkgW3N0cmluZywgc3RyaW5nXT47XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NvdXJjZSBtdXN0IGJlIG5vbi1mYWxzeSB2YWx1ZSEnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudCkge1xuICAgICAgaXRlcmFibGUgPSBpdGVyYXRlSFRNTEZvcm1FbGVtZW50KHNvdXJjZSwgdHJ1ZSkoKTtcbiAgICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICBpdGVyYWJsZSA9IGl0ZXJhdGVGb3JtRGF0YShzb3VyY2UsIHRydWUpKCk7XG4gICAgfSBlbHNlIGlmIChpc0l0ZXJhYmxlPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+KHNvdXJjZSkpIHtcbiAgICAgIGl0ZXJhYmxlID0gc291cmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYWJsZSA9IGl0ZXJhdGVSZWNvcmQoc291cmNlKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gbmV3IE1hcChpdGVyYWJsZSk7XG4gIH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtzdHJpbmcsIHN0cmluZ10+IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfVxuXG4gIGdldCBbU3ltYm9sLnRvU3RyaW5nVGFnXSgpIHtcbiAgICByZXR1cm4gJ0Zvcm1VcmxFbmNvZGVkQ29udGVudCc7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmRhdGEuY2xlYXIoKTtcbiAgfVxuXG4gIGRlbGV0ZShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZGVsZXRlKGtleSk7XG4gIH1cblxuICBlbnRyaWVzKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZW50cmllcygpO1xuICB9XG5cbiAgZm9yRWFjaChjYWxsYmFja2ZuOiAodmFsdWU6IHN0cmluZywga2V5OiBzdHJpbmcsIG1hcDogTWFwPHN0cmluZywgc3RyaW5nPikgPT4gdm9pZCwgdGhpc0FyZz86IGFueSkge1xuICAgIHRoaXMuZGF0YS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcpO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXQoa2V5KTtcbiAgfVxuXG4gIGhhcyhrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEuaGFzKGtleSk7XG4gIH1cblxuICBrZXlzKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEua2V5cygpO1xuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdGhpcyB7XG4gICAgdGhpcy5kYXRhLnNldChrZXksIHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkge1xuICAgIGxldCBjb250ZW50cyA9ICcnO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHRoaXMuZGF0YSkge1xuICAgICAgaWYgKGNvbnRlbnRzKSB7XG4gICAgICAgIGNvbnRlbnRzICs9IGAmJHtlbmNvZGVVUklDb21wb25lbnQoa2V5KX09JHtlbmNvZGVVUklDb21wb25lbnQodmFsdWUpfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50cyA9IGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9YDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFsgY29udGVudHMgXSwgeyB0eXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyB9KTtcbiAgICByZXR1cm4gYmxvYlRvUmVhZGFibGVTdHJlYW0oYmxvYik7XG4gIH1cblxuICB2YWx1ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS52YWx1ZXMoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQgZXh0ZW5kcyBNZXNzYWdlQ29udGVudCBpbXBsZW1lbnRzIE1hcDxzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZT4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGRhdGE6IE1hcDxzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZT47XG4gIHByaXZhdGUgcmVhZG9ubHkgYm91bmRhcnk6IHN0cmluZztcblxuICBnZXQgbWVkaWFUeXBlKCkgeyByZXR1cm4gYG11bHRpcGFydC9mb3JtLWRhdGE7IGJvdW5kYXJ5PSR7dGhpcy5ib3VuZGFyeX1gOyB9XG5cbiAgZ2V0IHNpemUoKSB7IHJldHVybiB0aGlzLmRhdGEuc2l6ZTsgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgY29uc3RydWN0b3Ioc291cmNlOiBIVE1MRm9ybUVsZW1lbnR8Rm9ybURhdGF8SXRlcmFibGU8cmVhZG9ubHkgW3N0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlXT58UmVjb3JkPHN0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlPikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NvdXJjZSBtdXN0IGJlIG5vbi1mYWxzeSB2YWx1ZSEnKTtcbiAgICB9XG4gICAgbGV0IGl0ZXJhYmxlOiBJdGVyYWJsZTxyZWFkb25seSBbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPjtcbiAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgRm9ybURhdGEpIHtcbiAgICAgIGl0ZXJhYmxlID0gaXRlcmF0ZUZvcm1EYXRhKHNvdXJjZSkoKTtcbiAgICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudCkge1xuICAgICAgaXRlcmFibGUgPSBpdGVyYXRlSFRNTEZvcm1FbGVtZW50KHNvdXJjZSkoKTtcbiAgICB9IGVsc2UgaWYgKGlzSXRlcmFibGU8cmVhZG9ubHkgW3N0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlXT4oc291cmNlKSkge1xuICAgICAgaXRlcmFibGUgPSBzb3VyY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhYmxlID0gaXRlcmF0ZVJlY29yZChzb3VyY2UpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBuZXcgTWFwPHN0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlPihpdGVyYWJsZSk7XG4gICAgdGhpcy5ib3VuZGFyeSA9IGAtLS0tLWJvdW5kYXJ5LSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwMDApfWA7XG4gIH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfVxuXG4gIGdldCBbU3ltYm9sLnRvU3RyaW5nVGFnXSgpIHtcbiAgICByZXR1cm4gJ011bHRpcGFydEZvcm1Db250ZW50JztcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuZGF0YS5jbGVhcigpO1xuICB9XG5cbiAgZGVsZXRlKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5kZWxldGUoa2V5KTtcbiAgfVxuXG4gIGVudHJpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5lbnRyaWVzKCk7XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIGZvckVhY2goY2FsbGJhY2tmbjogKHZhbHVlOiBGb3JtRGF0YUVudHJ5VmFsdWUsIGtleTogc3RyaW5nLCBtYXA6IE1hcDxzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZT4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpIHtcbiAgICB0aGlzLmRhdGEuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnKTtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0KGtleSk7XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmhhcyhrZXkpO1xuICB9XG5cbiAga2V5cygpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmtleXMoKTtcbiAgfVxuXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHRoaXMge1xuICAgIHRoaXMuZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YWx1ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS52YWx1ZXMoKTtcbiAgfVxuXG4gIGNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkge1xuICAgIGNvbnN0IGJvdW5kYXJ5ID0gdGhpcy5ib3VuZGFyeTtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5kYXRhLmVudHJpZXMoKTtcbiAgICByZXR1cm4gbmV3IFJlYWRhYmxlU3RyZWFtKHtcbiAgICAgIGFzeW5jIHB1bGwoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBlbnRyeSA9IGVudHJpZXMubmV4dCgpO1xuICAgICAgICBpZiAoZW50cnkgJiYgIWVudHJ5LmRvbmUpIHtcbiAgICAgICAgICBjb25zdCBbbmFtZSwgZGF0YV0gPSBlbnRyeS52YWx1ZTtcbiAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBkYXRhKSB7XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoW1xuICAgICAgICAgICAgICBgJHtib3VuZGFyeX1gLFxuICAgICAgICAgICAgICBgQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfWAsXG4gICAgICAgICAgICAgICdDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLTgnLFxuICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgIF0uam9pbignXFxyXFxuJykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAgICAgICBjb25zdCBzdHJlYW06IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+ID0gKCg8YW55PiBkYXRhKS5zdHJlYW0gJiYgKDxhbnk+IGRhdGEpLnN0cmVhbSgpKSB8fCBuZXcgUmVzcG9uc2UoZGF0YSkuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHBhc3NDaHVuayA9IGFzeW5jIChyZWFkZXI6IFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcjxVaW50OEFycmF5PikgPT4ge1xuICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICAgICAgICBpZiAocmVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gYnRvYShBcnJheS5wcm90b3R5cGUubWFwLmNhbGwocmVzLCAobjogbnVtYmVyKSA9PiBTdHJpbmcuZnJvbUNoYXJDb2RlKG4pKS5qb2luKCcnKSk7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShiYXNlNjQpO1xuICAgICAgICAgICAgICBhd2FpdCBwYXNzQ2h1bmsocmVhZGVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoW1xuICAgICAgICAgICAgICBgJHtib3VuZGFyeX1gLFxuICAgICAgICAgICAgICBgQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfTsgZmlsZW5hbWU9JHtkYXRhLm5hbWV9YCxcbiAgICAgICAgICAgICAgYENvbnRlbnQtVHlwZTogJHtkYXRhLnR5cGUgfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSd9YCxcbiAgICAgICAgICAgICAgYENvbnRlbnQtVHJhbnNmZXItRW5jb2Rpbmc6IGJhc2U2NGAsXG4gICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgXS5qb2luKCdcXHJcXG4nKSk7XG4gICAgICAgICAgICBhd2FpdCBwYXNzQ2h1bmsoc3RyZWFtLmdldFJlYWRlcigpKTtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZSgnXFxyXFxuJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShgJHtib3VuZGFyeX0tLVxcclxcbmApO1xuICAgICAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZXh0Q29udGVudCBleHRlbmRzIE1lc3NhZ2VDb250ZW50IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfX21lZGlhVHlwZTogc3RyaW5nO1xuICBwcm90ZWN0ZWQgX190ZXh0Q29udGVudDogc3RyaW5nO1xuXG4gIGdldCBtZWRpYVR5cGUoKSB7IHJldHVybiB0aGlzLl9fbWVkaWFUeXBlOyB9XG5cbiAgZ2V0IHRleHRDb250ZW50KCkgeyByZXR1cm4gdGhpcy5fX3RleHRDb250ZW50OyB9XG5cbiAgY29uc3RydWN0b3IodGV4dDogc3RyaW5nLCBtZWRpYVR5cGU/OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX190ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgdGhpcy5fX21lZGlhVHlwZSA9IG1lZGlhVHlwZSB8fCAndGV4dC9wbGFpbic7XG4gIH1cblxuICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgcmV0dXJuICdUZXh0Q29udGVudCc7XG4gIH1cblxuICBjcmVhdGVSZWFkYWJsZVN0cmVhbSgpIHtcbiAgICByZXR1cm4gYmxvYlRvUmVhZGFibGVTdHJlYW0obmV3IEJsb2IoW3RoaXMudGV4dENvbnRlbnRdLCB7IHR5cGU6IHRoaXMubWVkaWFUeXBlIH0pKTtcbiAgfVxuXG4gIGJsb2IoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy50ZXh0Q29udGVudF0sIHsgdHlwZTogdGhpcy5tZWRpYVR5cGUgfSkpO1xuICB9XG5cbiAgdGV4dCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMudGV4dENvbnRlbnQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBKc29uQ29udGVudCBleHRlbmRzIFRleHRDb250ZW50IHtcblxuICBwcm90ZWN0ZWQgX19vYmplY3Q6IGFueTtcblxuICBnZXQgb2JqZWN0KCkge1xuICAgIHJldHVybiB0aGlzLl9fb2JqZWN0O1xuICB9XG5cbiAgZ2V0IHRleHRDb250ZW50KCkge1xuICAgIGlmICghdGhpcy5fX3RleHRDb250ZW50KSB7XG4gICAgICB0aGlzLl9fdGV4dENvbnRlbnQgPSBKU09OLnN0cmluZ2lmeSh0aGlzLm9iamVjdCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9fdGV4dENvbnRlbnQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihvYmo6IGFueSwgbWVkaWFUeXBlPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoPGFueT4gbnVsbCwgbWVkaWFUeXBlIHx8ICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgdGhpcy5fX29iamVjdCA9IG9iajtcbiAgfVxuXG4gIGdldCBbU3ltYm9sLnRvU3RyaW5nVGFnXSgpIHtcbiAgICByZXR1cm4gJ0pzb25Db250ZW50JztcbiAgfVxuXG4gIGpzb24oKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLm9iamVjdCk7XG4gIH1cbn1cblxuY2xhc3MgR2VuZXJpY0NvbnRlbnQgZXh0ZW5kcyBNZXNzYWdlQ29udGVudCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX19zdHJlYW06IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+O1xuICBwcml2YXRlIHJlYWRvbmx5IF9fbWVkaWFUeXBlOiBzdHJpbmc7XG5cbiAgZ2V0IG1lZGlhVHlwZSgpIHsgcmV0dXJuIHRoaXMuX19tZWRpYVR5cGU7IH1cblxuICBjb25zdHJ1Y3RvcihzdHJlYW06IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+LCBtZWRpYVR5cGU6IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX3N0cmVhbSA9IHN0cmVhbTtcbiAgICB0aGlzLl9fbWVkaWFUeXBlID0gbWVkaWFUeXBlO1xuICB9XG5cbiAgY3JlYXRlUmVhZGFibGVTdHJlYW0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zdHJlYW07XG4gIH1cbn1cblxuY2xhc3MgTm9uZSB7IH1cblxuY29uc3Qgbm9uZSA9IG5ldyBOb25lKCk7XG5cbmNsYXNzIFJlc3BvbnNlSnNvbkNvbnRlbnQgZXh0ZW5kcyBKc29uQ29udGVudCB7XG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICBpZiAodGhpcy5fX29iamVjdCBpbnN0YW5jZW9mIE5vbmUpIHtcbiAgICAgIHRoaXMuX19vYmplY3QgPSBKU09OLnBhcnNlKHRoaXMuX190ZXh0Q29udGVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9fb2JqZWN0O1xuICB9XG5cbiAgY29uc3RydWN0b3IodGV4dDogc3RyaW5nLCBtZWRpYVR5cGU6IHN0cmluZykge1xuICAgIHN1cGVyKG5vbmUsIG1lZGlhVHlwZSk7XG4gICAgdGhpcy5fX3RleHRDb250ZW50ID0gdGV4dDtcbiAgfVxufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIE1FU1NBR0UgSU5URVJGQUNFUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdE1lc3NhZ2Uge1xuICB1cmk6IFVyaTtcbiAgY29udGVudD86IE1lc3NhZ2VDb250ZW50O1xuICBjYWNoZT86IFJlcXVlc3RDYWNoZTtcbiAgY3JlZGVudGlhbHM/OiBSZXF1ZXN0Q3JlZGVudGlhbHM7XG4gIGhlYWRlcnM/OiBIZWFkZXJzSW5pdDtcbiAgaW50ZWdyaXR5Pzogc3RyaW5nO1xuICBrZWVwYWxpdmU/OiBib29sZWFuO1xuICBtZXRob2Q/OiBzdHJpbmc7XG4gIG1vZGU/OiBSZXF1ZXN0TW9kZTtcbiAgcmVkaXJlY3Q/OiBSZXF1ZXN0UmVkaXJlY3Q7XG4gIHJlZmVycmVyPzogc3RyaW5nO1xuICByZWZlcnJlclBvbGljeT86IFJlZmVycmVyUG9saWN5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3BvbnNlTWVzc2FnZSB7XG4gIHVyaTogVXJpO1xuICBoZWFkZXJzOiBIZWFkZXJzO1xuICBvazogYm9vbGVhbjtcbiAgc3RhdHVzOiBudW1iZXI7XG4gIHN0YXR1c1RleHQ6IHN0cmluZztcbiAgdHlwZTogUmVzcG9uc2VUeXBlO1xuICBjb250ZW50PzogTWVzc2FnZUNvbnRlbnQ7XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gSEFORExFUiBBQlNUUkFDVElPTiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1lc3NhZ2VIYW5kbGVyIHtcbiAgYWJzdHJhY3Qgc2VuZChtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKTogUHJvbWlzZTxSZXNwb25zZU1lc3NhZ2U+O1xufVxuXG50eXBlIFNlbmREZWxlZ2F0ZSA9IChtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSA9PiBQcm9taXNlPFJlc3BvbnNlTWVzc2FnZT47XG5cbmV4cG9ydCBjbGFzcyBEZWxlZ2F0aW5nSGFuZGxlciBleHRlbmRzIE1lc3NhZ2VIYW5kbGVyIHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICBzdGF0aWMgZGVyaXZlKG92ZXJyaWRlOiAoc2VuZDogU2VuZERlbGVnYXRlLCBtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSA9PiBQcm9taXNlPFJlc3BvbnNlTWVzc2FnZT4pIHtcbiAgICByZXR1cm4gPHR5cGVvZiBEZWxlZ2F0aW5nSGFuZGxlcj4gY2xhc3MgRGVyaXZlZEhhbmRsZXIgZXh0ZW5kcyBEZWxlZ2F0aW5nSGFuZGxlciB7XG4gICAgICBjb25zdHJ1Y3Rvcihpbm5lckhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKSB7XG4gICAgICAgIHN1cGVyKGlubmVySGFuZGxlcik7XG4gICAgICB9XG5cbiAgICAgIHNlbmQobWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgICAgICByZXR1cm4gb3ZlcnJpZGUoXG4gICAgICAgICAgKG1zZywgY2FuY2VsKSA9PiBzdXBlci5zZW5kKG1zZywgY2FuY2VsKSxcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgIGNhbmNlbGxhdGlvblxuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIHN0YXRpYyBjcmVhdGUoaW5uZXJIYW5kbGVyOiBNZXNzYWdlSGFuZGxlciwgb3ZlcnJpZGU6IChzZW5kOiBTZW5kRGVsZWdhdGUsIG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pID0+IFByb21pc2U8UmVzcG9uc2VNZXNzYWdlPikge1xuICAgIGNvbnN0IGhhbmRsZXJUeXBlID0gdGhpcy5kZXJpdmUob3ZlcnJpZGUpO1xuICAgIHJldHVybiBuZXcgaGFuZGxlclR5cGUoaW5uZXJIYW5kbGVyKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZG9ubHkgaW5uZXJIYW5kbGVyOiBNZXNzYWdlSGFuZGxlcjtcblxuICBjb25zdHJ1Y3Rvcihpbm5lckhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmlubmVySGFuZGxlciA9IGlubmVySGFuZGxlcjtcbiAgfVxuXG4gIHNlbmQobWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgIHJldHVybiB0aGlzLmlubmVySGFuZGxlci5zZW5kKG1lc3NhZ2UsIGNhbmNlbGxhdGlvbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRIYW5kbGVyIGV4dGVuZHMgTWVzc2FnZUhhbmRsZXIge1xuICBnZXQgZmV0Y2goKTogKHVyaTogc3RyaW5nLCBpbml0OiBSZXF1ZXN0SW5pdCZBbnlQcm9wKSA9PiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGRlY29yYXRlZEZldGNoO1xuICB9XG5cbiAgYXN5bmMgcHJlcHJvY2Vzc1JlcXVlc3RNZXNzYWdlKG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlKTogUHJvbWlzZTxSZXF1ZXN0TWVzc2FnZT4ge1xuICAgIHJldHVybiBtZXNzYWdlO1xuICB9XG5cbiAgYXN5bmMgcmVhZFJlc3BvbnNlTWVzc2FnZShyZXNwb25zZTogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlTWVzc2FnZT4ge1xuICAgIGxldCBjb250ZW50OiBNZXNzYWdlQ29udGVudHxudWxsID0gbnVsbDtcbiAgICBsZXQgY29udGVudFR5cGU6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBpZiAocmVzcG9uc2UuaGVhZGVycykge1xuICAgICAgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJyk7XG4gICAgICBpZiAoY29udGVudFR5cGUpIHtcbiAgICAgICAgaWYgKGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ3RleHQvcGxhaW4nKSkge1xuICAgICAgICAgIGNvbnRlbnQgPSBuZXcgVGV4dENvbnRlbnQoYXdhaXQgcmVzcG9uc2UudGV4dCgpLCBjb250ZW50VHlwZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGVudFR5cGUuc3RhcnRzV2l0aCgndGV4dC9qc29uJykgfHwgY29udGVudFR5cGUuc3RhcnRzV2l0aCgnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAgICAgY29udGVudCA9IG5ldyBSZXNwb25zZUpzb25Db250ZW50KGF3YWl0IHJlc3BvbnNlLnRleHQoKSwgY29udGVudFR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChudWxsID09PSBjb250ZW50KSB7XG4gICAgICBjb250ZW50ID0gcmVzcG9uc2UuYm9keVxuICAgICAgICA/IG5ldyBHZW5lcmljQ29udGVudChyZXNwb25zZS5ib2R5LCBjb250ZW50VHlwZSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJylcbiAgICAgICAgOiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdXJpOiBuZXcgVXJpKHJlc3BvbnNlLnVybCksXG4gICAgICBoZWFkZXJzOiByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgb2s6IHJlc3BvbnNlLm9rLFxuICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgdHlwZTogcmVzcG9uc2UudHlwZSxcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQgfHwgdW5kZWZpbmVkXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHNlbmQobWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgIGNvbnN0IGFib3J0aW9uID0gbGlua0Fib3J0aW9uKGNhbmNlbGxhdGlvbik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgdXJpLCBjb250ZW50LCAuLi5pbml0IH0gPSBhd2FpdCB0aGlzLnByZXByb2Nlc3NSZXF1ZXN0TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgIGlmIChjb250ZW50ICYmIGNvbnRlbnQubWVkaWFUeXBlKSB7XG4gICAgICAgIGluaXQuaGVhZGVycyA9IGFkZEhlYWRlcihpbml0LmhlYWRlcnMsICdDb250ZW50LVR5cGUnLCBjb250ZW50Lm1lZGlhVHlwZSk7XG4gICAgICB9XG4gICAgICAvLyBzZW5kaW5nIHJlYWRhYmxlIHN0cmVhbSBub3QgeWV0IHN1cHBvcnRlZCBoYW5jZSB1c2luZyBibG9iIGluc3RlYWQuLi4uXG4gICAgICAvLyBjb25zdCBib2R5ID0gY29udGVudCA/IGNvbnRlbnQuY3JlYXRlUmVhZGFibGVTdHJlYW0oKSA6IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IGJvZHkgPSBjb250ZW50ID8gYXdhaXQgY29udGVudC5ibG9iKCkgOiB1bmRlZmluZWQ7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZmV0Y2gobWVzc2FnZS51cmkuaHJlZiwge1xuICAgICAgICAuLi5pbml0LFxuICAgICAgICBib2R5LFxuICAgICAgICBzaWduYWw6IGFib3J0aW9uLnNpZ25hbFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZWFkUmVzcG9uc2VNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYWJvcnRpb24uc3Vic2NyaXB0aW9uLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdEh0dHBDbGllbnRIYW5kbGVyID0gbmV3IEh0dHBDbGllbnRIYW5kbGVyKCk7XG5cbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50Q29uZmlndXJhdGlvbiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgaGFuZGxlcnM6IE1hcDxzdHJpbmcsIE1lc3NhZ2VIYW5kbGVyPiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBkZWZhdWx0OiBNZXNzYWdlSGFuZGxlciA9IGRlZmF1bHRIdHRwQ2xpZW50SGFuZGxlcjtcblxuICBnZXRIYW5kbGVyKGNvbmZpZ3VyYXRpb24/OiBzdHJpbmd8bnVsbCk6IE1lc3NhZ2VIYW5kbGVyIHtcbiAgICBpZiAoIWNvbmZpZ3VyYXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhhbmRsZXJzLmdldChjb25maWd1cmF0aW9uKSB8fCB0aGlzLmRlZmF1bHQ7XG4gIH1cblxuICBzZXRIYW5kbGVyKGNvbmZpZ3VyYXRpb246IHN0cmluZ3xudWxsLCBoYW5kbGVyOiBNZXNzYWdlSGFuZGxlcikge1xuICAgIGlmICghY29uZmlndXJhdGlvbikge1xuICAgICAgdGhpcy5kZWZhdWx0ID0gaGFuZGxlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oYW5kbGVycy5zZXQoY29uZmlndXJhdGlvbiwgaGFuZGxlcik7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBodHRwQ2xpZW50Q29uZmlndXJhdGlvbiA9IG5ldyBIdHRwQ2xpZW50Q29uZmlndXJhdGlvbigpO1xuXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudCB7XG4gIHByaXZhdGUgaGFuZGxlcjogTWVzc2FnZUhhbmRsZXI7XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIG5ldyBpbnN0YW5jZSBvZiBodHRwIGNsaWVudCB3aXRoIGRlZmF1bHQgbWVzc2FnZSBoYW5kbGVyIGNvbmZpZ3VyZWQgdGhyb3VnaCBfaHR0cENsaWVudENvbmZpZ3VyYXRpb25fLlxuICAgKi9cbiAgY29uc3RydWN0b3IoKTtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIG5ldyBpbnN0YW5jZSBvZiBodHRwIGNsaWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgaGFuZGxlci5cbiAgICogQHBhcmFtIGhhbmRsZXIgTWVzc2FnZSBoYW5kbGVyIHRvIHVzZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKTtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIG5ldyBpbnN0YW5jZSBvZiBodHRwIGNsaWVudCB3aXRoIG1lc3NhZ2UgaGFuZGxlciBjb25maWd1cmVkIHRocm91Z2ggX2h0dHBDbGllbnRDb25maWd1cmF0aW9uXy5cbiAgICpcbiAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb24gTWVzc2FnZSBoYW5kbGVyIGNvbmZpZ3VyYXRpb24gbmFtZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbmZpZ3VyYXRpb246IHN0cmluZyk7XG5cbiAgY29uc3RydWN0b3IoaGFuZGxlck9yQ29uZmlndXJhdGlvbj86IE1lc3NhZ2VIYW5kbGVyfHN0cmluZykge1xuICAgIGlmICghaGFuZGxlck9yQ29uZmlndXJhdGlvbikge1xuICAgICAgdGhpcy5oYW5kbGVyID0gaHR0cENsaWVudENvbmZpZ3VyYXRpb24uZ2V0SGFuZGxlcigpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlck9yQ29uZmlndXJhdGlvbiBpbnN0YW5jZW9mIE1lc3NhZ2VIYW5kbGVyKSB7XG4gICAgICB0aGlzLmhhbmRsZXIgPSBoYW5kbGVyT3JDb25maWd1cmF0aW9uO1xuICAgIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBoYW5kbGVyT3JDb25maWd1cmF0aW9uKSB7XG4gICAgICB0aGlzLmhhbmRsZXIgPSBodHRwQ2xpZW50Q29uZmlndXJhdGlvbi5nZXRIYW5kbGVyKGhhbmRsZXJPckNvbmZpZ3VyYXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGFyZ3VtZW50OiAke2hhbmRsZXJPckNvbmZpZ3VyYXRpb259YCk7XG4gICAgfVxuICB9XG5cbiAgc2VuZChyZXF1ZXN0OiBSZXF1ZXN0TWVzc2FnZSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5zZW5kKHJlcXVlc3QsIGNhbmNlbGxhdGlvbik7XG4gIH1cblxuICBkZWxldGUodXJpOiBzdHJpbmd8VXJpLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5zZW5kKHtcbiAgICAgIHVyaTogVXJpLmZyb20odXJpKSxcbiAgICAgIG1ldGhvZDogJ0RFTEVURSdcbiAgICB9LCBjYW5jZWxsYXRpb24pO1xuICB9XG5cbiAgZ2V0KHVyaTogc3RyaW5nfFVyaSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZCh7XG4gICAgICB1cmk6IFVyaS5mcm9tKHVyaSksXG4gICAgICBtZXRob2Q6ICdHRVQnXG4gICAgfSwgY2FuY2VsbGF0aW9uKTtcbiAgfVxuXG4gIGFzeW5jIGdldEJsb2IodXJpOiBzdHJpbmd8VXJpLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pOiBQcm9taXNlPEJsb2I+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2V0KHVyaSwgY2FuY2VsbGF0aW9uKTtcbiAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgIGlmIChyZXNwb25zZS5jb250ZW50KSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5jb250ZW50LmJsb2IoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVzcG9uc2UgaGFzIG5vIGNvbnRlbnQnKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEh0dHBFcnJvcihyZXNwb25zZSk7XG4gIH1cblxuICBhc3luYyBnZXRKc29uKHVyaTogc3RyaW5nfFVyaSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuc2VuZCh7XG4gICAgICB1cmk6IFVyaS5mcm9tKHVyaSksXG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgaGVhZGVyczogeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9XG4gICAgfSwgY2FuY2VsbGF0aW9uKTtcbiAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgIGlmIChyZXNwb25zZS5jb250ZW50KSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5jb250ZW50Lmpzb24oKTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVzcG9uc2UgaGFzIG5vIGNvbnRlbnQnKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEh0dHBFcnJvcihyZXNwb25zZSk7XG4gIH1cblxuICBhc3luYyBnZXRUZXh0KHVyaTogc3RyaW5nfFVyaSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2V0KHVyaSwgY2FuY2VsbGF0aW9uKTtcbiAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgIGlmIChyZXNwb25zZS5jb250ZW50KSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5jb250ZW50LnRleHQoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVzcG9uc2UgaGFzIG5vIGNvbnRlbnQnKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEh0dHBFcnJvcihyZXNwb25zZSk7XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIHBvc3QodXJpOiBzdHJpbmd8VXJpLCBjb250ZW50OiBNZXNzYWdlQ29udGVudHxGb3JtRGF0YXxIVE1MRm9ybUVsZW1lbnR8c3RyaW5nfG9iamVjdHxudWxsLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5zZW5kKHtcbiAgICAgIHVyaTogVXJpLmZyb20odXJpKSxcbiAgICAgIGNvbnRlbnQ6IChjb250ZW50IGluc3RhbmNlb2YgTWVzc2FnZUNvbnRlbnQgfHwgbnVsbCA9PT0gY29udGVudClcbiAgICAgICAgPyAoY29udGVudCB8fCB1bmRlZmluZWQpXG4gICAgICAgIDogKGNvbnRlbnQgaW5zdGFuY2VvZiBGb3JtRGF0YVxuICAgICAgICAgICAgPyBuZXcgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgIDogKGNvbnRlbnQgaW5zdGFuY2VvZiBIVE1MRm9ybUVsZW1lbnRcbiAgICAgICAgICAgICAgICA/IG5ldyBNdWx0aXBhcnRGb3JtQ29udGVudChjb250ZW50KVxuICAgICAgICAgICAgICAgIDogKCdzdHJpbmcnID09PSB0eXBlb2YgY29udGVudFxuICAgICAgICAgICAgICAgICAgICA/IG5ldyBUZXh0Q29udGVudChjb250ZW50KVxuICAgICAgICAgICAgICAgICAgICA6IG5ldyBKc29uQ29udGVudChjb250ZW50KVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgKSxcbiAgICAgIG1ldGhvZDogJ1BPU1QnXG4gICAgfSwgY2FuY2VsbGF0aW9uKTtcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgcHV0KHVyaTogc3RyaW5nfFVyaSwgY29udGVudDogTWVzc2FnZUNvbnRlbnR8Rm9ybURhdGF8SFRNTEZvcm1FbGVtZW50fHN0cmluZ3xvYmplY3R8bnVsbCwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZCh7XG4gICAgICB1cmk6IFVyaS5mcm9tKHVyaSksXG4gICAgICBjb250ZW50OiAoY29udGVudCBpbnN0YW5jZW9mIE1lc3NhZ2VDb250ZW50IHx8IG51bGwgPT09IGNvbnRlbnQpXG4gICAgICAgID8gKGNvbnRlbnQgfHwgdW5kZWZpbmVkKVxuICAgICAgICA6IChjb250ZW50IGluc3RhbmNlb2YgRm9ybURhdGFcbiAgICAgICAgICAgID8gbmV3IE11bHRpcGFydEZvcm1Db250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICA6IChjb250ZW50IGluc3RhbmNlb2YgSFRNTEZvcm1FbGVtZW50XG4gICAgICAgICAgICAgICAgPyBuZXcgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICA6ICgnc3RyaW5nJyA9PT0gdHlwZW9mIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgPyBuZXcgVGV4dENvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgOiBuZXcgSnNvbkNvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICksXG4gICAgICBtZXRob2Q6ICdQVVQnXG4gICAgfSwgY2FuY2VsbGF0aW9uKTtcbiAgfVxufVxuIl19