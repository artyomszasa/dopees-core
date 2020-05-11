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
export const addHeader = (headers, name, value, override) => {
    if (!headers) {
        return new Headers([[name, value]]);
    }
    if (headers instanceof Headers) {
        if (override) {
            headers.set(name, value);
        }
        else {
            headers.append(name, value);
        }
    }
    else if (Array.isArray(headers)) {
        const index = override ? headers.findIndex((kv) => kv[0] === name) : -1;
        if (-1 !== index) {
            headers[index] = [name, value];
        }
        else {
            headers.push([name, value]);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9odHRwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVyxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRTdELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFNUIsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLElBQVUsRUFBOEIsRUFBRTtJQUN0RSxJQUFXLElBQUssQ0FBQyxNQUFNLEVBQUU7UUFDdkIsT0FBYyxJQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDOUI7SUFDRCxPQUFvQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDOUQsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQztJQUN0QyxJQUFJO1FBQ0YsSUFBSyxNQUFjLENBQUMsZUFBZSxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEtBQUssQ0FBQztLQUNkO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWix1QkFBdUI7UUFDdkIsT0FBTyxJQUFJLENBQUM7S0FDYjtBQUNILENBQUMsRUFBRSxDQUFDLENBQUM7QUFPTCxNQUFNLFVBQVUsWUFBWSxDQUFDLFlBQTJCO0lBQ3RELElBQUksTUFBNkIsQ0FBQztJQUNsQyxJQUFJLFlBQWdDLENBQUM7SUFDckMsSUFBSSxTQUFTLEtBQUssWUFBWSxJQUFJLHVCQUF1QixFQUFFO1FBQ3pELE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDOUMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7UUFDaEMsWUFBWSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDdEU7U0FBTTtRQUNMLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFD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QyxDQUFDLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQzs0QkFDMUIsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUMzQixDQUNKLENBQ0o7WUFDTCxNQUFNLEVBQUUsS0FBSztTQUNkLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbkIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW55UHJvcCwgZGVjb3JhdGVkRmV0Y2gsIEh0dHBFcnJvciB9IGZyb20gJy4vZmV0Y2gnO1xuaW1wb3J0IHsgQ2FuY2VsbGF0aW9uIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24nO1xuaW1wb3J0IHsgVXJpIH0gZnJvbSAnLi91cmknO1xuXG5jb25zdCBibG9iVG9SZWFkYWJsZVN0cmVhbSA9IChibG9iOiBCbG9iKTogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT4gPT4ge1xuICBpZiAoKDxhbnk+IGJsb2IpLnN0cmVhbSkge1xuICAgIHJldHVybiAoPGFueT4gYmxvYikuc3RyZWFtKCk7XG4gIH1cbiAgcmV0dXJuIDxSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5Pj4gbmV3IFJlc3BvbnNlKGJsb2IpLmJvZHk7XG59O1xuXG5leHBvcnQgY29uc3Qgc3VwcG9ydHNBYm9ydENvbnRyb2xsZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5BYm9ydENvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gY2F0Y2ggKGV4bikge1xuICAgIC8vIHNlZW1zIHRvIGJlIHRlc3QgRU5WXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn0oKSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWJvcnRpb24ge1xuICBzaWduYWw6IEFib3J0U2lnbmFsfHVuZGVmaW5lZDtcbiAgc3Vic2NyaXB0aW9uOiB7IHJlbW92ZSgpOiB2b2lkIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW5rQWJvcnRpb24oY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKTogQWJvcnRpb24ge1xuICBsZXQgc2lnbmFsOiBBYm9ydFNpZ25hbHx1bmRlZmluZWQ7XG4gIGxldCBzdWJzY3JpcHRpb246IHsgcmVtb3ZlKCk6IHZvaWQgfTtcbiAgaWYgKHVuZGVmaW5lZCAhPT0gY2FuY2VsbGF0aW9uICYmIHN1cHBvcnRzQWJvcnRDb250cm9sbGVyKSB7XG4gICAgY29uc3QgYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHNpZ25hbCA9IGFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gICAgc3Vic2NyaXB0aW9uID0gY2FuY2VsbGF0aW9uLnN1YnNjcmliZSgoKSA9PiBhYm9ydENvbnRyb2xsZXIuYWJvcnQoKSk7XG4gIH0gZWxzZSB7XG4gICAgc2lnbmFsID0gdW5kZWZpbmVkO1xuICAgIHN1YnNjcmlwdGlvbiA9IHsgcmVtb3ZlKCkgeyByZXR1cm47IH0gfTtcbiAgfVxuICByZXR1cm4geyBzaWduYWwsIHN1YnNjcmlwdGlvbiB9O1xufVxuXG5leHBvcnQgY29uc3QgYWRkSGVhZGVyID0gKGhlYWRlcnM6IEhlYWRlcnNJbml0fG51bGx8dW5kZWZpbmVkLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG92ZXJyaWRlPzogYm9vbGVhbikgPT4ge1xuICBpZiAoIWhlYWRlcnMpIHtcbiAgICByZXR1cm4gbmV3IEhlYWRlcnMoW1tuYW1lLCB2YWx1ZV1dKTtcbiAgfVxuICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICBpZiAob3ZlcnJpZGUpIHtcbiAgICAgIGhlYWRlcnMuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgY29uc3QgaW5kZXggPSBvdmVycmlkZSA/IGhlYWRlcnMuZmluZEluZGV4KChrdikgPT4ga3ZbMF0gPT09IG5hbWUpIDogLTE7XG4gICAgaWYgKC0xICE9PSBpbmRleCkge1xuICAgICAgaGVhZGVyc1tpbmRleF0gPSBbbmFtZSwgdmFsdWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBoZWFkZXJzLnB1c2goW25hbWUsIHZhbHVlXSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gaGVhZGVycztcbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gTUVTU0FHRSBDT05URU5UICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1lc3NhZ2VDb250ZW50IHtcbiAgYWJzdHJhY3QgZ2V0IG1lZGlhVHlwZSgpOiBzdHJpbmc7XG5cbiAgYWJzdHJhY3QgY3JlYXRlUmVhZGFibGVTdHJlYW0oKTogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT47XG5cbiAgYmxvYigpOiBQcm9taXNlPEJsb2I+IHtcbiAgICBjb25zdCBjaHVua3M6IEJsb2JQYXJ0W10gPSBbXTtcbiAgICBjb25zdCByZWFkQ2h1bmsgPSBhc3luYyAocmVhZGVyOiBSZWFkYWJsZVN0cmVhbVJlYWRlcjxVaW50OEFycmF5Pik6IFByb21pc2U8QmxvYj4gPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgIGlmICghcmVzIHx8IHJlcy5kb25lKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmxvYihjaHVua3MsIHsgdHlwZTogdGhpcy5tZWRpYVR5cGUgfSk7XG4gICAgICB9XG4gICAgICBjaHVua3MucHVzaChyZXMudmFsdWUpO1xuICAgICAgcmV0dXJuIHJlYWRDaHVuayhyZWFkZXIpO1xuICAgIH07XG4gICAgcmV0dXJuIHJlYWRDaHVuayh0aGlzLmNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkuZ2V0UmVhZGVyKCkpO1xuICB9XG5cbiAgYXN5bmMgdGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB0aGlzLmJsb2IoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiByZXNvbHZlKDxzdHJpbmc+IHJlYWRlci5yZXN1bHQpO1xuICAgICAgcmVhZGVyLm9uZXJyb3IgPSAoKSA9PiByZWplY3QocmVhZGVyLmVycm9yKTtcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpOyAvLyBGSVhNRTogZW5jb2RpbmdcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGpzb248VD4oKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHRoaXMudGV4dCgpO1xuICAgIHJldHVybiA8VD4gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgfVxufVxuXG50eXBlIEhUTUxFbGVtZW50V2l0aFZhbHVlID0gSFRNTElucHV0RWxlbWVudHxIVE1MT3V0cHV0RWxlbWVudHxIVE1MU2VsZWN0RWxlbWVudHxIVE1MVGV4dEFyZWFFbGVtZW50O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBwb3Nlc3NlcyB2YWx1ZSB0aGF0IHNob3VsZCBiZSBzdWJtaXR0ZWQgYXMgZm9ybSBmaWVsZC5cbiAqXG4gKiBAcGFyYW0gZWxlbWVudCBlbGVtZW50IHRvIGNoZWNrLlxuICovXG5jb25zdCBpc0lucHV0V2l0aFZhbHVlID0gKGVsZW1lbnQ6IEVsZW1lbnQpOiBlbGVtZW50IGlzIEhUTUxFbGVtZW50V2l0aFZhbHVlID0+IHtcbiAgcmV0dXJuIGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50XG4gICAgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxPdXRwdXRFbGVtZW50XG4gICAgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxTZWxlY3RFbGVtZW50XG4gICAgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG59O1xuXG5jb25zdCBpc0l0ZXJhYmxlID0gPFQ+KG9iajogYW55KTogb2JqIGlzIEl0ZXJhYmxlPFQ+ID0+IHtcbiAgcmV0dXJuIG9iaiAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2Ygb2JqW1N5bWJvbC5pdGVyYXRvcl07XG59O1xuXG5mdW5jdGlvbiogaXRlcmF0ZVJlY29yZDxLIGV4dGVuZHMga2V5b2YgYW55LCBWPihzb3VyY2U6IFJlY29yZDxLLCBWPikge1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Zm9yaW5cbiAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgeWllbGQgPHJlYWRvbmx5IFtLLCBWXT4gW2tleSwgc291cmNlW2tleV1dO1xuICB9XG59XG5cbmZ1bmN0aW9uIGl0ZXJhdGVIVE1MRm9ybUVsZW1lbnQoc291cmNlOiBIVE1MRm9ybUVsZW1lbnQpOiAoKSA9PiBHZW5lcmF0b3I8cmVhZG9ubHkgW3N0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlXT47XG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG5mdW5jdGlvbiBpdGVyYXRlSFRNTEZvcm1FbGVtZW50KHNvdXJjZTogSFRNTEZvcm1FbGVtZW50LCB0aHJvd09uRmlsZTogdHJ1ZSk6ICgpID0+IEdlbmVyYXRvcjxyZWFkb25seSBbc3RyaW5nLCBzdHJpbmddPjtcblxuZnVuY3Rpb24gaXRlcmF0ZUhUTUxGb3JtRWxlbWVudChzb3VyY2U6IEhUTUxGb3JtRWxlbWVudCwgdGhyb3dPbkZpbGU/OiB0cnVlKSB7XG4gIGlmICh0aHJvd09uRmlsZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiooKSB7XG4gICAgICBmb3IgKGNvbnN0IGlucHV0IG9mIEFycmF5LmZyb20oc291cmNlLmVsZW1lbnRzKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gaW5wdXQuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgIGlmIChuYW1lICYmIGlzSW5wdXRXaXRoVmFsdWUoaW5wdXQpKSB7XG4gICAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiAnZmlsZScgPT09IGlucHV0LnR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZmlsZXMgbm90IHN1cHBvc2VkIHRvIGJlIHNlbnQgdXNpbmcgdXJsIGVuY29kZWQgZm9ybSwgdXNlIE11bHRpcGFydEZvcm1Db250ZW50IGluc3RlYWQhJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHlpZWxkIDxyZWFkb25seSBbc3RyaW5nLCBzdHJpbmddPiBbbmFtZSwgaW5wdXQudmFsdWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24qKCkge1xuICAgIGZvciAoY29uc3QgaW5wdXQgb2YgQXJyYXkuZnJvbShzb3VyY2UuZWxlbWVudHMpKSB7XG4gICAgICBjb25zdCBuYW1lID0gaW5wdXQuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICBpZiAobmFtZSAmJiBpc0lucHV0V2l0aFZhbHVlKGlucHV0KSkge1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmICdmaWxlJyA9PT0gaW5wdXQudHlwZSkge1xuICAgICAgICAgIGlmIChpbnB1dC5maWxlcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIEFycmF5LmZyb20oaW5wdXQuZmlsZXMpKSB7XG4gICAgICAgICAgICAgIHlpZWxkIDxyZWFkb25seSBbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPiBbbmFtZSwgZmlsZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkIDxyZWFkb25seSBbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPiBbbmFtZSwgaW5wdXQudmFsdWVdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZUZvcm1EYXRhKGZvcm1EYXRhOiBGb3JtRGF0YSk6ICgpID0+IEl0ZXJhYmxlSXRlcmF0b3I8cmVhZG9ubHkgW3N0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlXT47XG5mdW5jdGlvbiBpdGVyYXRlRm9ybURhdGEoZm9ybURhdGE6IEZvcm1EYXRhLCB0aHJvd09uRmlsZTogdHJ1ZSk6ICgpID0+IEl0ZXJhYmxlSXRlcmF0b3I8cmVhZG9ubHkgW3N0cmluZywgc3RyaW5nXT47XG5cbmZ1bmN0aW9uIGl0ZXJhdGVGb3JtRGF0YShmb3JtRGF0YTogRm9ybURhdGEsIHRocm93T25GaWxlPzogdHJ1ZSkge1xuICBpZiAodGhyb3dPbkZpbGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24qKCkge1xuICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgZm9ybURhdGEuZW50cmllcygpKSB7XG4gICAgICAgIGlmICh2IGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZmlsZXMgbm90IHN1cHBvc2VkIHRvIGJlIHNlbnQgdXNpbmcgdXJsIGVuY29kZWQgZm9ybSwgdXNlIE11bHRpcGFydEZvcm1Db250ZW50IGluc3RlYWQhJyk7XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQgPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+IFtrLCB2XTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiAoKSA9PiA8SXRlcmFibGVJdGVyYXRvcjxyZWFkb25seSBbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPj4gZm9ybURhdGEuZW50cmllcygpO1xufVxuXG5leHBvcnQgY2xhc3MgRm9ybVVybEVuY29kZWRDb250ZW50IGV4dGVuZHMgTWVzc2FnZUNvbnRlbnQgaW1wbGVtZW50cyBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBkYXRhOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xuXG4gIGdldCBtZWRpYVR5cGUoKSB7IHJldHVybiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzsgfVxuXG4gIGdldCBzaXplKCkgeyByZXR1cm4gdGhpcy5kYXRhLnNpemU7IH1cblxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IEhUTUxGb3JtRWxlbWVudHxGb3JtRGF0YXxJdGVyYWJsZTxyZWFkb25seSBbc3RyaW5nLCBzdHJpbmddPnxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG4gICAgc3VwZXIoKTtcbiAgICBsZXQgaXRlcmFibGU6IEl0ZXJhYmxlPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+O1xuICAgIGlmICghc291cmNlKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2UgbXVzdCBiZSBub24tZmFsc3kgdmFsdWUhJyk7XG4gICAgfVxuICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBIVE1MRm9ybUVsZW1lbnQpIHtcbiAgICAgIGl0ZXJhYmxlID0gaXRlcmF0ZUhUTUxGb3JtRWxlbWVudChzb3VyY2UsIHRydWUpKCk7XG4gICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuICAgICAgaXRlcmFibGUgPSBpdGVyYXRlRm9ybURhdGEoc291cmNlLCB0cnVlKSgpO1xuICAgIH0gZWxzZSBpZiAoaXNJdGVyYWJsZTxyZWFkb25seSBbc3RyaW5nLCBzdHJpbmddPihzb3VyY2UpKSB7XG4gICAgICBpdGVyYWJsZSA9IHNvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmFibGUgPSBpdGVyYXRlUmVjb3JkKHNvdXJjZSk7XG4gICAgfVxuICAgIHRoaXMuZGF0YSA9IG5ldyBNYXAoaXRlcmFibGUpO1xuICB9XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmFibGVJdGVyYXRvcjxbc3RyaW5nLCBzdHJpbmddPiB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIH1cblxuICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgcmV0dXJuICdGb3JtVXJsRW5jb2RlZENvbnRlbnQnO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5kYXRhLmNsZWFyKCk7XG4gIH1cblxuICBkZWxldGUoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmRlbGV0ZShrZXkpO1xuICB9XG5cbiAgZW50cmllcygpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmVudHJpZXMoKTtcbiAgfVxuXG4gIGZvckVhY2goY2FsbGJhY2tmbjogKHZhbHVlOiBzdHJpbmcsIGtleTogc3RyaW5nLCBtYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpIHtcbiAgICB0aGlzLmRhdGEuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnKTtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0KGtleSk7XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmhhcyhrZXkpO1xuICB9XG5cbiAga2V5cygpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmtleXMoKTtcbiAgfVxuXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHRoaXMge1xuICAgIHRoaXMuZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjcmVhdGVSZWFkYWJsZVN0cmVhbSgpIHtcbiAgICBsZXQgY29udGVudHMgPSAnJztcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmRhdGEpIHtcbiAgICAgIGlmIChjb250ZW50cykge1xuICAgICAgICBjb250ZW50cyArPSBgJiR7ZW5jb2RlVVJJQ29tcG9uZW50KGtleSl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKX1gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGVudHMgPSBgJHtlbmNvZGVVUklDb21wb25lbnQoa2V5KX09JHtlbmNvZGVVUklDb21wb25lbnQodmFsdWUpfWA7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbIGNvbnRlbnRzIF0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgfSk7XG4gICAgcmV0dXJuIGJsb2JUb1JlYWRhYmxlU3RyZWFtKGJsb2IpO1xuICB9XG5cbiAgdmFsdWVzKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEudmFsdWVzKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE11bHRpcGFydEZvcm1Db250ZW50IGV4dGVuZHMgTWVzc2FnZUNvbnRlbnQgaW1wbGVtZW50cyBNYXA8c3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWU+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBkYXRhOiBNYXA8c3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWU+O1xuICBwcml2YXRlIHJlYWRvbmx5IGJvdW5kYXJ5OiBzdHJpbmc7XG5cbiAgZ2V0IG1lZGlhVHlwZSgpIHsgcmV0dXJuIGBtdWx0aXBhcnQvZm9ybS1kYXRhOyBib3VuZGFyeT0ke3RoaXMuYm91bmRhcnl9YDsgfVxuXG4gIGdldCBzaXplKCkgeyByZXR1cm4gdGhpcy5kYXRhLnNpemU7IH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogSFRNTEZvcm1FbGVtZW50fEZvcm1EYXRhfEl0ZXJhYmxlPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+fFJlY29yZDxzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZT4pIHtcbiAgICBzdXBlcigpO1xuICAgIGlmICghc291cmNlKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2UgbXVzdCBiZSBub24tZmFsc3kgdmFsdWUhJyk7XG4gICAgfVxuICAgIGxldCBpdGVyYWJsZTogSXRlcmFibGU8cmVhZG9ubHkgW3N0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlXT47XG4gICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICBpdGVyYWJsZSA9IGl0ZXJhdGVGb3JtRGF0YShzb3VyY2UpKCk7XG4gICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBIVE1MRm9ybUVsZW1lbnQpIHtcbiAgICAgIGl0ZXJhYmxlID0gaXRlcmF0ZUhUTUxGb3JtRWxlbWVudChzb3VyY2UpKCk7XG4gICAgfSBlbHNlIGlmIChpc0l0ZXJhYmxlPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+KHNvdXJjZSkpIHtcbiAgICAgIGl0ZXJhYmxlID0gc291cmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYWJsZSA9IGl0ZXJhdGVSZWNvcmQoc291cmNlKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gbmV3IE1hcDxzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZT4oaXRlcmFibGUpO1xuICAgIHRoaXMuYm91bmRhcnkgPSBgLS0tLS1ib3VuZGFyeS0ke0RhdGUubm93KCl9LSR7TWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMDAwKX1gO1xuICB9XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmFibGVJdGVyYXRvcjxbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPiB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIH1cblxuICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgcmV0dXJuICdNdWx0aXBhcnRGb3JtQ29udGVudCc7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmRhdGEuY2xlYXIoKTtcbiAgfVxuXG4gIGRlbGV0ZShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZGVsZXRlKGtleSk7XG4gIH1cblxuICBlbnRyaWVzKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZW50cmllcygpO1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICBmb3JFYWNoKGNhbGxiYWNrZm46ICh2YWx1ZTogRm9ybURhdGFFbnRyeVZhbHVlLCBrZXk6IHN0cmluZywgbWFwOiBNYXA8c3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWU+KSA9PiB2b2lkLCB0aGlzQXJnPzogYW55KSB7XG4gICAgdGhpcy5kYXRhLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyk7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldChrZXkpO1xuICB9XG5cbiAgaGFzKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5oYXMoa2V5KTtcbiAgfVxuXG4gIGtleXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5rZXlzKCk7XG4gIH1cblxuICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB0aGlzIHtcbiAgICB0aGlzLmRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFsdWVzKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEudmFsdWVzKCk7XG4gIH1cblxuICBjcmVhdGVSZWFkYWJsZVN0cmVhbSgpIHtcbiAgICBjb25zdCBib3VuZGFyeSA9IHRoaXMuYm91bmRhcnk7XG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMuZGF0YS5lbnRyaWVzKCk7XG4gICAgcmV0dXJuIG5ldyBSZWFkYWJsZVN0cmVhbSh7XG4gICAgICBhc3luYyBwdWxsKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgY29uc3QgZW50cnkgPSBlbnRyaWVzLm5leHQoKTtcbiAgICAgICAgaWYgKGVudHJ5ICYmICFlbnRyeS5kb25lKSB7XG4gICAgICAgICAgY29uc3QgW25hbWUsIGRhdGFdID0gZW50cnkudmFsdWU7XG4gICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgZGF0YSkge1xuICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKFtcbiAgICAgICAgICAgICAgYCR7Ym91bmRhcnl9YCxcbiAgICAgICAgICAgICAgYENvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1gLFxuICAgICAgICAgICAgICAnQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04JyxcbiAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgICcnXG4gICAgICAgICAgICBdLmpvaW4oJ1xcclxcbicpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgICAgICAgY29uc3Qgc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PiA9ICgoPGFueT4gZGF0YSkuc3RyZWFtICYmICg8YW55PiBkYXRhKS5zdHJlYW0oKSkgfHwgbmV3IFJlc3BvbnNlKGRhdGEpLmJvZHk7XG4gICAgICAgICAgICBjb25zdCBwYXNzQ2h1bmsgPSBhc3luYyAocmVhZGVyOiBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXI8VWludDhBcnJheT4pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICAgICAgaWYgKHJlcy5kb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGJ0b2EoQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHJlcywgKG46IG51bWJlcikgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShuKSkuam9pbignJykpO1xuICAgICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoYmFzZTY0KTtcbiAgICAgICAgICAgICAgYXdhaXQgcGFzc0NodW5rKHJlYWRlcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKFtcbiAgICAgICAgICAgICAgYCR7Ym91bmRhcnl9YCxcbiAgICAgICAgICAgICAgYENvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX07IGZpbGVuYW1lPSR7ZGF0YS5uYW1lfWAsXG4gICAgICAgICAgICAgIGBDb250ZW50LVR5cGU6ICR7ZGF0YS50eXBlIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nfWAsXG4gICAgICAgICAgICAgIGBDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiBiYXNlNjRgLFxuICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgIF0uam9pbignXFxyXFxuJykpO1xuICAgICAgICAgICAgYXdhaXQgcGFzc0NodW5rKHN0cmVhbS5nZXRSZWFkZXIoKSk7XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoJ1xcclxcbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoYCR7Ym91bmRhcnl9LS1cXHJcXG5gKTtcbiAgICAgICAgICBjb250cm9sbGVyLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGV4dENvbnRlbnQgZXh0ZW5kcyBNZXNzYWdlQ29udGVudCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX19tZWRpYVR5cGU6IHN0cmluZztcbiAgcHJvdGVjdGVkIF9fdGV4dENvbnRlbnQ6IHN0cmluZztcblxuICBnZXQgbWVkaWFUeXBlKCkgeyByZXR1cm4gdGhpcy5fX21lZGlhVHlwZTsgfVxuXG4gIGdldCB0ZXh0Q29udGVudCgpIHsgcmV0dXJuIHRoaXMuX190ZXh0Q29udGVudDsgfVxuXG4gIGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgbWVkaWFUeXBlPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fdGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgIHRoaXMuX19tZWRpYVR5cGUgPSBtZWRpYVR5cGUgfHwgJ3RleHQvcGxhaW4nO1xuICB9XG5cbiAgZ2V0IFtTeW1ib2wudG9TdHJpbmdUYWddKCkge1xuICAgIHJldHVybiAnVGV4dENvbnRlbnQnO1xuICB9XG5cbiAgY3JlYXRlUmVhZGFibGVTdHJlYW0oKSB7XG4gICAgcmV0dXJuIGJsb2JUb1JlYWRhYmxlU3RyZWFtKG5ldyBCbG9iKFt0aGlzLnRleHRDb250ZW50XSwgeyB0eXBlOiB0aGlzLm1lZGlhVHlwZSB9KSk7XG4gIH1cblxuICBibG9iKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMudGV4dENvbnRlbnRdLCB7IHR5cGU6IHRoaXMubWVkaWFUeXBlIH0pKTtcbiAgfVxuXG4gIHRleHQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnRleHRDb250ZW50KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSnNvbkNvbnRlbnQgZXh0ZW5kcyBUZXh0Q29udGVudCB7XG5cbiAgcHJvdGVjdGVkIF9fb2JqZWN0OiBhbnk7XG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX29iamVjdDtcbiAgfVxuXG4gIGdldCB0ZXh0Q29udGVudCgpIHtcbiAgICBpZiAoIXRoaXMuX190ZXh0Q29udGVudCkge1xuICAgICAgdGhpcy5fX3RleHRDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkodGhpcy5vYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fX3RleHRDb250ZW50O1xuICB9XG5cbiAgY29uc3RydWN0b3Iob2JqOiBhbnksIG1lZGlhVHlwZT86IHN0cmluZykge1xuICAgIHN1cGVyKDxhbnk+IG51bGwsIG1lZGlhVHlwZSB8fCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIHRoaXMuX19vYmplY3QgPSBvYmo7XG4gIH1cblxuICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgcmV0dXJuICdKc29uQ29udGVudCc7XG4gIH1cblxuICBqc29uKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5vYmplY3QpO1xuICB9XG59XG5cbmNsYXNzIEdlbmVyaWNDb250ZW50IGV4dGVuZHMgTWVzc2FnZUNvbnRlbnQge1xuICBwcml2YXRlIHJlYWRvbmx5IF9fc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PjtcbiAgcHJpdmF0ZSByZWFkb25seSBfX21lZGlhVHlwZTogc3RyaW5nO1xuXG4gIGdldCBtZWRpYVR5cGUoKSB7IHJldHVybiB0aGlzLl9fbWVkaWFUeXBlOyB9XG5cbiAgY29uc3RydWN0b3Ioc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PiwgbWVkaWFUeXBlOiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19zdHJlYW0gPSBzdHJlYW07XG4gICAgdGhpcy5fX21lZGlhVHlwZSA9IG1lZGlhVHlwZTtcbiAgfVxuXG4gIGNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkge1xuICAgIHJldHVybiB0aGlzLl9fc3RyZWFtO1xuICB9XG59XG5cbmNsYXNzIE5vbmUgeyB9XG5cbmNvbnN0IG5vbmUgPSBuZXcgTm9uZSgpO1xuXG5jbGFzcyBSZXNwb25zZUpzb25Db250ZW50IGV4dGVuZHMgSnNvbkNvbnRlbnQge1xuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3QgaW5zdGFuY2VvZiBOb25lKSB7XG4gICAgICB0aGlzLl9fb2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLl9fdGV4dENvbnRlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fX29iamVjdDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgbWVkaWFUeXBlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihub25lLCBtZWRpYVR5cGUpO1xuICAgIHRoaXMuX190ZXh0Q29udGVudCA9IHRleHQ7XG4gIH1cbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyBNRVNTQUdFIElOVEVSRkFDRVMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RNZXNzYWdlIHtcbiAgdXJpOiBVcmk7XG4gIGNvbnRlbnQ/OiBNZXNzYWdlQ29udGVudDtcbiAgY2FjaGU/OiBSZXF1ZXN0Q2FjaGU7XG4gIGNyZWRlbnRpYWxzPzogUmVxdWVzdENyZWRlbnRpYWxzO1xuICBoZWFkZXJzPzogSGVhZGVyc0luaXQ7XG4gIGludGVncml0eT86IHN0cmluZztcbiAga2VlcGFsaXZlPzogYm9vbGVhbjtcbiAgbWV0aG9kPzogc3RyaW5nO1xuICBtb2RlPzogUmVxdWVzdE1vZGU7XG4gIHJlZGlyZWN0PzogUmVxdWVzdFJlZGlyZWN0O1xuICByZWZlcnJlcj86IHN0cmluZztcbiAgcmVmZXJyZXJQb2xpY3k/OiBSZWZlcnJlclBvbGljeTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXNwb25zZU1lc3NhZ2Uge1xuICB1cmk6IFVyaTtcbiAgaGVhZGVyczogSGVhZGVycztcbiAgb2s6IGJvb2xlYW47XG4gIHN0YXR1czogbnVtYmVyO1xuICBzdGF0dXNUZXh0OiBzdHJpbmc7XG4gIHR5cGU6IFJlc3BvbnNlVHlwZTtcbiAgY29udGVudD86IE1lc3NhZ2VDb250ZW50O1xufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIEhBTkRMRVIgQUJTVFJBQ1RJT04gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXNzYWdlSGFuZGxlciB7XG4gIGFic3RyYWN0IHNlbmQobWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbik6IFByb21pc2U8UmVzcG9uc2VNZXNzYWdlPjtcbn1cblxudHlwZSBTZW5kRGVsZWdhdGUgPSAobWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikgPT4gUHJvbWlzZTxSZXNwb25zZU1lc3NhZ2U+O1xuXG5leHBvcnQgY2xhc3MgRGVsZWdhdGluZ0hhbmRsZXIgZXh0ZW5kcyBNZXNzYWdlSGFuZGxlciB7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgc3RhdGljIGRlcml2ZShvdmVycmlkZTogKHNlbmQ6IFNlbmREZWxlZ2F0ZSwgbWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikgPT4gUHJvbWlzZTxSZXNwb25zZU1lc3NhZ2U+KSB7XG4gICAgcmV0dXJuIDx0eXBlb2YgRGVsZWdhdGluZ0hhbmRsZXI+IGNsYXNzIERlcml2ZWRIYW5kbGVyIGV4dGVuZHMgRGVsZWdhdGluZ0hhbmRsZXIge1xuICAgICAgY29uc3RydWN0b3IoaW5uZXJIYW5kbGVyOiBNZXNzYWdlSGFuZGxlcikge1xuICAgICAgICBzdXBlcihpbm5lckhhbmRsZXIpO1xuICAgICAgfVxuXG4gICAgICBzZW5kKG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG92ZXJyaWRlKFxuICAgICAgICAgIChtc2csIGNhbmNlbCkgPT4gc3VwZXIuc2VuZChtc2csIGNhbmNlbCksXG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICBjYW5jZWxsYXRpb25cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICBzdGF0aWMgY3JlYXRlKGlubmVySGFuZGxlcjogTWVzc2FnZUhhbmRsZXIsIG92ZXJyaWRlOiAoc2VuZDogU2VuZERlbGVnYXRlLCBtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSA9PiBQcm9taXNlPFJlc3BvbnNlTWVzc2FnZT4pIHtcbiAgICBjb25zdCBoYW5kbGVyVHlwZSA9IHRoaXMuZGVyaXZlKG92ZXJyaWRlKTtcbiAgICByZXR1cm4gbmV3IGhhbmRsZXJUeXBlKGlubmVySGFuZGxlcik7XG4gIH1cblxuICBwcml2YXRlIHJlYWRvbmx5IGlubmVySGFuZGxlcjogTWVzc2FnZUhhbmRsZXI7XG5cbiAgY29uc3RydWN0b3IoaW5uZXJIYW5kbGVyOiBNZXNzYWdlSGFuZGxlcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5pbm5lckhhbmRsZXIgPSBpbm5lckhhbmRsZXI7XG4gIH1cblxuICBzZW5kKG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lckhhbmRsZXIuc2VuZChtZXNzYWdlLCBjYW5jZWxsYXRpb24pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50SGFuZGxlciBleHRlbmRzIE1lc3NhZ2VIYW5kbGVyIHtcbiAgZ2V0IGZldGNoKCk6ICh1cmk6IHN0cmluZywgaW5pdDogUmVxdWVzdEluaXQmQW55UHJvcCkgPT4gUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiBkZWNvcmF0ZWRGZXRjaDtcbiAgfVxuXG4gIGFzeW5jIHByZXByb2Nlc3NSZXF1ZXN0TWVzc2FnZShtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSk6IFByb21pc2U8UmVxdWVzdE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gbWVzc2FnZTtcbiAgfVxuXG4gIGFzeW5jIHJlYWRSZXNwb25zZU1lc3NhZ2UocmVzcG9uc2U6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZU1lc3NhZ2U+IHtcbiAgICBsZXQgY29udGVudDogTWVzc2FnZUNvbnRlbnR8bnVsbCA9IG51bGw7XG4gICAgbGV0IGNvbnRlbnRUeXBlOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMpIHtcbiAgICAgIGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpO1xuICAgICAgaWYgKGNvbnRlbnRUeXBlKSB7XG4gICAgICAgIGlmIChjb250ZW50VHlwZS5zdGFydHNXaXRoKCd0ZXh0L3BsYWluJykpIHtcbiAgICAgICAgICBjb250ZW50ID0gbmV3IFRleHRDb250ZW50KGF3YWl0IHJlc3BvbnNlLnRleHQoKSwgY29udGVudFR5cGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ3RleHQvanNvbicpIHx8IGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgICAgIGNvbnRlbnQgPSBuZXcgUmVzcG9uc2VKc29uQ29udGVudChhd2FpdCByZXNwb25zZS50ZXh0KCksIGNvbnRlbnRUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobnVsbCA9PT0gY29udGVudCkge1xuICAgICAgY29udGVudCA9IHJlc3BvbnNlLmJvZHlcbiAgICAgICAgPyBuZXcgR2VuZXJpY0NvbnRlbnQocmVzcG9uc2UuYm9keSwgY29udGVudFR5cGUgfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScpXG4gICAgICAgIDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHVyaTogbmV3IFVyaShyZXNwb25zZS51cmwpLFxuICAgICAgaGVhZGVyczogcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIG9rOiByZXNwb25zZS5vayxcbiAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgIHR5cGU6IHJlc3BvbnNlLnR5cGUsXG4gICAgICBjb250ZW50OiBjb250ZW50IHx8IHVuZGVmaW5lZFxuICAgIH07XG4gIH1cblxuICBhc3luYyBzZW5kKG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pIHtcbiAgICBjb25zdCBhYm9ydGlvbiA9IGxpbmtBYm9ydGlvbihjYW5jZWxsYXRpb24pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHVyaSwgY29udGVudCwgLi4uaW5pdCB9ID0gYXdhaXQgdGhpcy5wcmVwcm9jZXNzUmVxdWVzdE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICBpZiAoY29udGVudCAmJiBjb250ZW50Lm1lZGlhVHlwZSkge1xuICAgICAgICBpbml0LmhlYWRlcnMgPSBhZGRIZWFkZXIoaW5pdC5oZWFkZXJzLCAnQ29udGVudC1UeXBlJywgY29udGVudC5tZWRpYVR5cGUpO1xuICAgICAgfVxuICAgICAgLy8gc2VuZGluZyByZWFkYWJsZSBzdHJlYW0gbm90IHlldCBzdXBwb3J0ZWQgaGFuY2UgdXNpbmcgYmxvYiBpbnN0ZWFkLi4uLlxuICAgICAgLy8gY29uc3QgYm9keSA9IGNvbnRlbnQgPyBjb250ZW50LmNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkgOiB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBib2R5ID0gY29udGVudCA/IGF3YWl0IGNvbnRlbnQuYmxvYigpIDogdW5kZWZpbmVkO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKG1lc3NhZ2UudXJpLmhyZWYsIHtcbiAgICAgICAgLi4uaW5pdCxcbiAgICAgICAgYm9keSxcbiAgICAgICAgc2lnbmFsOiBhYm9ydGlvbi5zaWduYWxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFJlc3BvbnNlTWVzc2FnZShyZXNwb25zZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGFib3J0aW9uLnN1YnNjcmlwdGlvbi5yZW1vdmUoKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRIdHRwQ2xpZW50SGFuZGxlciA9IG5ldyBIdHRwQ2xpZW50SGFuZGxlcigpO1xuXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudENvbmZpZ3VyYXRpb24ge1xuICBwcml2YXRlIHJlYWRvbmx5IGhhbmRsZXJzOiBNYXA8c3RyaW5nLCBNZXNzYWdlSGFuZGxlcj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgZGVmYXVsdDogTWVzc2FnZUhhbmRsZXIgPSBkZWZhdWx0SHR0cENsaWVudEhhbmRsZXI7XG5cbiAgZ2V0SGFuZGxlcihjb25maWd1cmF0aW9uPzogc3RyaW5nfG51bGwpOiBNZXNzYWdlSGFuZGxlciB7XG4gICAgaWYgKCFjb25maWd1cmF0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5oYW5kbGVycy5nZXQoY29uZmlndXJhdGlvbikgfHwgdGhpcy5kZWZhdWx0O1xuICB9XG5cbiAgc2V0SGFuZGxlcihjb25maWd1cmF0aW9uOiBzdHJpbmd8bnVsbCwgaGFuZGxlcjogTWVzc2FnZUhhbmRsZXIpIHtcbiAgICBpZiAoIWNvbmZpZ3VyYXRpb24pIHtcbiAgICAgIHRoaXMuZGVmYXVsdCA9IGhhbmRsZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFuZGxlcnMuc2V0KGNvbmZpZ3VyYXRpb24sIGhhbmRsZXIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgaHR0cENsaWVudENvbmZpZ3VyYXRpb24gPSBuZXcgSHR0cENsaWVudENvbmZpZ3VyYXRpb24oKTtcblxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnQge1xuICBwcml2YXRlIGhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBuZXcgaW5zdGFuY2Ugb2YgaHR0cCBjbGllbnQgd2l0aCBkZWZhdWx0IG1lc3NhZ2UgaGFuZGxlciBjb25maWd1cmVkIHRocm91Z2ggX2h0dHBDbGllbnRDb25maWd1cmF0aW9uXy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCk7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBuZXcgaW5zdGFuY2Ugb2YgaHR0cCBjbGllbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGhhbmRsZXIuXG4gICAqIEBwYXJhbSBoYW5kbGVyIE1lc3NhZ2UgaGFuZGxlciB0byB1c2UuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoYW5kbGVyOiBNZXNzYWdlSGFuZGxlcik7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBuZXcgaW5zdGFuY2Ugb2YgaHR0cCBjbGllbnQgd2l0aCBtZXNzYWdlIGhhbmRsZXIgY29uZmlndXJlZCB0aHJvdWdoIF9odHRwQ2xpZW50Q29uZmlndXJhdGlvbl8uXG4gICAqXG4gICAqIEBwYXJhbSBjb25maWd1cmF0aW9uIE1lc3NhZ2UgaGFuZGxlciBjb25maWd1cmF0aW9uIG5hbWUuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25maWd1cmF0aW9uOiBzdHJpbmcpO1xuXG4gIGNvbnN0cnVjdG9yKGhhbmRsZXJPckNvbmZpZ3VyYXRpb24/OiBNZXNzYWdlSGFuZGxlcnxzdHJpbmcpIHtcbiAgICBpZiAoIWhhbmRsZXJPckNvbmZpZ3VyYXRpb24pIHtcbiAgICAgIHRoaXMuaGFuZGxlciA9IGh0dHBDbGllbnRDb25maWd1cmF0aW9uLmdldEhhbmRsZXIoKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXJPckNvbmZpZ3VyYXRpb24gaW5zdGFuY2VvZiBNZXNzYWdlSGFuZGxlcikge1xuICAgICAgdGhpcy5oYW5kbGVyID0gaGFuZGxlck9yQ29uZmlndXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgaGFuZGxlck9yQ29uZmlndXJhdGlvbikge1xuICAgICAgdGhpcy5oYW5kbGVyID0gaHR0cENsaWVudENvbmZpZ3VyYXRpb24uZ2V0SGFuZGxlcihoYW5kbGVyT3JDb25maWd1cmF0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBhcmd1bWVudDogJHtoYW5kbGVyT3JDb25maWd1cmF0aW9ufWApO1xuICAgIH1cbiAgfVxuXG4gIHNlbmQocmVxdWVzdDogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgIHJldHVybiB0aGlzLmhhbmRsZXIuc2VuZChyZXF1ZXN0LCBjYW5jZWxsYXRpb24pO1xuICB9XG5cbiAgZGVsZXRlKHVyaTogc3RyaW5nfFVyaSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZCh7XG4gICAgICB1cmk6IFVyaS5mcm9tKHVyaSksXG4gICAgICBtZXRob2Q6ICdERUxFVEUnXG4gICAgfSwgY2FuY2VsbGF0aW9uKTtcbiAgfVxuXG4gIGdldCh1cmk6IHN0cmluZ3xVcmksIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgIHJldHVybiB0aGlzLnNlbmQoe1xuICAgICAgdXJpOiBVcmkuZnJvbSh1cmkpLFxuICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgIH0sIGNhbmNlbGxhdGlvbik7XG4gIH1cblxuICBhc3luYyBnZXRCbG9iKHVyaTogc3RyaW5nfFVyaSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKTogUHJvbWlzZTxCbG9iPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmdldCh1cmksIGNhbmNlbGxhdGlvbik7XG4gICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICBpZiAocmVzcG9uc2UuY29udGVudCkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuY29udGVudC5ibG9iKCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc3BvbnNlIGhhcyBubyBjb250ZW50Jyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuICB9XG5cbiAgYXN5bmMgZ2V0SnNvbih1cmk6IHN0cmluZ3xVcmksIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnNlbmQoe1xuICAgICAgdXJpOiBVcmkuZnJvbSh1cmkpLFxuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGhlYWRlcnM6IHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfVxuICAgIH0sIGNhbmNlbGxhdGlvbik7XG4gICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICBpZiAocmVzcG9uc2UuY29udGVudCkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuY29udGVudC5qc29uKCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc3BvbnNlIGhhcyBubyBjb250ZW50Jyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuICB9XG5cbiAgYXN5bmMgZ2V0VGV4dCh1cmk6IHN0cmluZ3xVcmksIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmdldCh1cmksIGNhbmNlbGxhdGlvbik7XG4gICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICBpZiAocmVzcG9uc2UuY29udGVudCkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuY29udGVudC50ZXh0KCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc3BvbnNlIGhhcyBubyBjb250ZW50Jyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICBwb3N0KHVyaTogc3RyaW5nfFVyaSwgY29udGVudDogTWVzc2FnZUNvbnRlbnR8Rm9ybURhdGF8SFRNTEZvcm1FbGVtZW50fHN0cmluZ3xvYmplY3R8bnVsbCwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZCh7XG4gICAgICB1cmk6IFVyaS5mcm9tKHVyaSksXG4gICAgICBjb250ZW50OiAoY29udGVudCBpbnN0YW5jZW9mIE1lc3NhZ2VDb250ZW50IHx8IG51bGwgPT09IGNvbnRlbnQpXG4gICAgICAgID8gKGNvbnRlbnQgfHwgdW5kZWZpbmVkKVxuICAgICAgICA6IChjb250ZW50IGluc3RhbmNlb2YgRm9ybURhdGFcbiAgICAgICAgICAgID8gbmV3IE11bHRpcGFydEZvcm1Db250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICA6IChjb250ZW50IGluc3RhbmNlb2YgSFRNTEZvcm1FbGVtZW50XG4gICAgICAgICAgICAgICAgPyBuZXcgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICA6ICgnc3RyaW5nJyA9PT0gdHlwZW9mIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgPyBuZXcgVGV4dENvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgOiBuZXcgSnNvbkNvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICksXG4gICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgIH0sIGNhbmNlbGxhdGlvbik7XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIHB1dCh1cmk6IHN0cmluZ3xVcmksIGNvbnRlbnQ6IE1lc3NhZ2VDb250ZW50fEZvcm1EYXRhfEhUTUxGb3JtRWxlbWVudHxzdHJpbmd8b2JqZWN0fG51bGwsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgIHJldHVybiB0aGlzLnNlbmQoe1xuICAgICAgdXJpOiBVcmkuZnJvbSh1cmkpLFxuICAgICAgY29udGVudDogKGNvbnRlbnQgaW5zdGFuY2VvZiBNZXNzYWdlQ29udGVudCB8fCBudWxsID09PSBjb250ZW50KVxuICAgICAgICA/IChjb250ZW50IHx8IHVuZGVmaW5lZClcbiAgICAgICAgOiAoY29udGVudCBpbnN0YW5jZW9mIEZvcm1EYXRhXG4gICAgICAgICAgICA/IG5ldyBNdWx0aXBhcnRGb3JtQ29udGVudChjb250ZW50KVxuICAgICAgICAgICAgOiAoY29udGVudCBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudFxuICAgICAgICAgICAgICAgID8gbmV3IE11bHRpcGFydEZvcm1Db250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgOiAoJ3N0cmluZycgPT09IHR5cGVvZiBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgID8gbmV3IFRleHRDb250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIDogbmV3IEpzb25Db250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICApLFxuICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgIH0sIGNhbmNlbGxhdGlvbik7XG4gIH1cbn1cbiJdfQ==