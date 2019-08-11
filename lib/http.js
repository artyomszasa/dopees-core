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
    get mediaType() { return 'application/x-www-form-urlencoded'; }
    get size() { return this.data.size; }
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
    get mediaType() { return `multipart/form-data; boundary=${this.boundary}`; }
    get size() { return this.data.size; }
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
    get mediaType() { return this.__mediaType; }
    get textContent() { return this.__textContent; }
    constructor(text, mediaType) {
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
    text() {
        return Promise.resolve(this.textContent);
    }
}
export class JsonContent extends TextContent {
    get object() {
        return this.__object;
    }
    get textContent() {
        if (!this.__textContent) {
            this.__textContent = JSON.stringify(this.object);
        }
        return this.__textContent;
    }
    constructor(obj, mediaType) {
        super(null, mediaType || 'application/json');
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
    get mediaType() { return this.__mediaType; }
    constructor(stream, mediaType) {
        super();
        this.__stream = stream;
        this.__mediaType = mediaType;
    }
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
    constructor(innerHandler) {
        super();
        this.innerHandler = innerHandler;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9odHRwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVyxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRTdELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFNUIsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLElBQVUsRUFBOEIsRUFBRTtJQUN0RSxJQUFXLElBQUssQ0FBQyxNQUFNLEVBQUU7UUFDdkIsT0FBYyxJQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDOUI7SUFDRCxPQUFvQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDOUQsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQztJQUN0QyxJQUFJO1FBQ0YsSUFBSyxNQUFjLENBQUMsZUFBZSxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEtBQUssQ0FBQztLQUNkO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWix1QkFBdUI7UUFDdkIsT0FBTyxJQUFJLENBQUM7S0FDYjtBQUNILENBQUMsRUFBRSxDQUFDLENBQUM7QUFPTCxNQUFNLFVBQVUsWUFBWSxDQUFDLFlBQTJCO0lBQ3RELElBQUksTUFBNkIsQ0FBQztJQUNsQyxJQUFJLFlBQWdDLENBQUM7SUFDckMsSUFBSSxTQUFTLEtBQUssWUFBWSxJQUFJLHVCQUF1QixFQUFFO1FBQ3pELE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDOUMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7UUFDaEMsWUFBWSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDdEU7U0FBTTtRQUNMLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFD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LE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztZQUNmLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNsQixPQUFPLEVBQUUsQ0FBQyxPQUFPLFlBQVksY0FBYyxJQUFJLElBQUksS0FBSyxPQUFPLENBQUM7Z0JBQzlELENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDLE9BQU8sWUFBWSxRQUFRO29CQUMxQixDQUFDLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLENBQUM7b0JBQ25DLENBQUMsQ0FBQyxDQUFDLE9BQU8sWUFBWSxlQUFlO3dCQUNqQyxDQUFDLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLENBQUM7d0JBQ25DLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxPQUFPLE9BQU87NEJBQzFCLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUM7NEJBQzFCLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FDM0IsQ0FDSixDQUNKO1lBQ0wsTUFBTSxFQUFFLEtBQUs7U0FDZCxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ25CLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFueVByb3AsIGRlY29yYXRlZEZldGNoLCBIdHRwRXJyb3IgfSBmcm9tICcuL2ZldGNoJztcbmltcG9ydCB7IENhbmNlbGxhdGlvbiB9IGZyb20gJy4vY2FuY2VsbGF0aW9uJztcbmltcG9ydCB7IFVyaSB9IGZyb20gJy4vdXJpJztcblxuY29uc3QgYmxvYlRvUmVhZGFibGVTdHJlYW0gPSAoYmxvYjogQmxvYik6IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+ID0+IHtcbiAgaWYgKCg8YW55PiBibG9iKS5zdHJlYW0pIHtcbiAgICByZXR1cm4gKDxhbnk+IGJsb2IpLnN0cmVhbSgpO1xuICB9XG4gIHJldHVybiA8UmVhZGFibGVTdHJlYW08VWludDhBcnJheT4+IG5ldyBSZXNwb25zZShibG9iKS5ib2R5O1xufTtcblxuZXhwb3J0IGNvbnN0IHN1cHBvcnRzQWJvcnRDb250cm9sbGVyID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIGlmICgod2luZG93IGFzIGFueSkuQWJvcnRDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGNhdGNoIChleG4pIHtcbiAgICAvLyBzZWVtcyB0byBiZSB0ZXN0IEVOVlxuICAgIHJldHVybiB0cnVlO1xuICB9XG59KCkpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFib3J0aW9uIHtcbiAgc2lnbmFsOiBBYm9ydFNpZ25hbHx1bmRlZmluZWQ7XG4gIHN1YnNjcmlwdGlvbjogeyByZW1vdmUoKTogdm9pZCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlua0Fib3J0aW9uKGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbik6IEFib3J0aW9uIHtcbiAgbGV0IHNpZ25hbDogQWJvcnRTaWduYWx8dW5kZWZpbmVkO1xuICBsZXQgc3Vic2NyaXB0aW9uOiB7IHJlbW92ZSgpOiB2b2lkIH07XG4gIGlmICh1bmRlZmluZWQgIT09IGNhbmNlbGxhdGlvbiAmJiBzdXBwb3J0c0Fib3J0Q29udHJvbGxlcikge1xuICAgIGNvbnN0IGFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBzaWduYWwgPSBhYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICAgIHN1YnNjcmlwdGlvbiA9IGNhbmNlbGxhdGlvbi5zdWJzY3JpYmUoKCkgPT4gYWJvcnRDb250cm9sbGVyLmFib3J0KCkpO1xuICB9IGVsc2Uge1xuICAgIHNpZ25hbCA9IHVuZGVmaW5lZDtcbiAgICBzdWJzY3JpcHRpb24gPSB7IHJlbW92ZSgpIHsgcmV0dXJuOyB9IH07XG4gIH1cbiAgcmV0dXJuIHsgc2lnbmFsLCBzdWJzY3JpcHRpb24gfTtcbn1cblxuZXhwb3J0IGNvbnN0IGFkZEhlYWRlciA9IChoZWFkZXJzOiBIZWFkZXJzSW5pdHxudWxsfHVuZGVmaW5lZCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSA9PiB7XG4gIGlmICghaGVhZGVycykge1xuICAgIHJldHVybiBuZXcgSGVhZGVycyhbW25hbWUsIHZhbHVlXV0pO1xuICB9XG4gIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgaGVhZGVycy5wdXNoKFtuYW1lLCB2YWx1ZV0pO1xuICB9IGVsc2Uge1xuICAgIGhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gaGVhZGVycztcbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gTUVTU0FHRSBDT05URU5UICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1lc3NhZ2VDb250ZW50IHtcbiAgYWJzdHJhY3QgZ2V0IG1lZGlhVHlwZSgpOiBzdHJpbmc7XG5cbiAgYWJzdHJhY3QgY3JlYXRlUmVhZGFibGVTdHJlYW0oKTogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT47XG5cbiAgYmxvYigpOiBQcm9taXNlPEJsb2I+IHtcbiAgICBjb25zdCBjaHVua3M6IEJsb2JQYXJ0W10gPSBbXTtcbiAgICBjb25zdCByZWFkQ2h1bmsgPSBhc3luYyAocmVhZGVyOiBSZWFkYWJsZVN0cmVhbVJlYWRlcjxVaW50OEFycmF5Pik6IFByb21pc2U8QmxvYj4gPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgIGlmICghcmVzIHx8IHJlcy5kb25lKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmxvYihjaHVua3MsIHsgdHlwZTogdGhpcy5tZWRpYVR5cGUgfSk7XG4gICAgICB9XG4gICAgICBjaHVua3MucHVzaChyZXMudmFsdWUpO1xuICAgICAgcmV0dXJuIHJlYWRDaHVuayhyZWFkZXIpO1xuICAgIH07XG4gICAgcmV0dXJuIHJlYWRDaHVuayh0aGlzLmNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkuZ2V0UmVhZGVyKCkpO1xuICB9XG5cbiAgYXN5bmMgdGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB0aGlzLmJsb2IoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiByZXNvbHZlKDxzdHJpbmc+IHJlYWRlci5yZXN1bHQpO1xuICAgICAgcmVhZGVyLm9uZXJyb3IgPSAoKSA9PiByZWplY3QocmVhZGVyLmVycm9yKTtcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpOyAvLyBGSVhNRTogZW5jb2RpbmdcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGpzb248VD4oKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHRoaXMudGV4dCgpO1xuICAgIHJldHVybiA8VD4gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgfVxufVxuXG50eXBlIEhUTUxFbGVtZW50V2l0aFZhbHVlID0gSFRNTElucHV0RWxlbWVudHxIVE1MT3V0cHV0RWxlbWVudHxIVE1MU2VsZWN0RWxlbWVudHxIVE1MVGV4dEFyZWFFbGVtZW50O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBwb3Nlc3NlcyB2YWx1ZSB0aGF0IHNob3VsZCBiZSBzdWJtaXR0ZWQgYXMgZm9ybSBmaWVsZC5cbiAqXG4gKiBAcGFyYW0gZWxlbWVudCBlbGVtZW50IHRvIGNoZWNrLlxuICovXG5jb25zdCBpc0lucHV0V2l0aFZhbHVlID0gKGVsZW1lbnQ6IEVsZW1lbnQpOiBlbGVtZW50IGlzIEhUTUxFbGVtZW50V2l0aFZhbHVlID0+IHtcbiAgcmV0dXJuIGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50XG4gICAgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxPdXRwdXRFbGVtZW50XG4gICAgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxTZWxlY3RFbGVtZW50XG4gICAgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG59O1xuXG5jb25zdCBpc0l0ZXJhYmxlID0gPFQ+KG9iajogYW55KTogb2JqIGlzIEl0ZXJhYmxlPFQ+ID0+IHtcbiAgcmV0dXJuIG9iaiAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2Ygb2JqW1N5bWJvbC5pdGVyYXRvcl07XG59O1xuXG5mdW5jdGlvbiogaXRlcmF0ZVJlY29yZDxLIGV4dGVuZHMga2V5b2YgYW55LCBWPihzb3VyY2U6IFJlY29yZDxLLCBWPikge1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Zm9yaW5cbiAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgeWllbGQgPHJlYWRvbmx5IFtLLCBWXT4gW2tleSwgc291cmNlW2tleV1dO1xuICB9XG59XG5cbmZ1bmN0aW9uIGl0ZXJhdGVIVE1MRm9ybUVsZW1lbnQoc291cmNlOiBIVE1MRm9ybUVsZW1lbnQpOiAoKSA9PiBJdGVyYWJsZUl0ZXJhdG9yPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+O1xuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuZnVuY3Rpb24gaXRlcmF0ZUhUTUxGb3JtRWxlbWVudChzb3VyY2U6IEhUTUxGb3JtRWxlbWVudCwgdGhyb3dPbkZpbGU6IHRydWUpOiAoKSA9PiBJdGVyYWJsZUl0ZXJhdG9yPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+O1xuXG5mdW5jdGlvbiBpdGVyYXRlSFRNTEZvcm1FbGVtZW50KHNvdXJjZTogSFRNTEZvcm1FbGVtZW50LCB0aHJvd09uRmlsZT86IHRydWUpIHtcbiAgaWYgKHRocm93T25GaWxlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKigpIHtcbiAgICAgIGZvciAoY29uc3QgaW5wdXQgb2YgQXJyYXkuZnJvbShzb3VyY2UuZWxlbWVudHMpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgICAgaWYgKG5hbWUgJiYgaXNJbnB1dFdpdGhWYWx1ZShpbnB1dCkpIHtcbiAgICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmICdmaWxlJyA9PT0gaW5wdXQudHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmaWxlcyBub3Qgc3VwcG9zZWQgdG8gYmUgc2VudCB1c2luZyB1cmwgZW5jb2RlZCBmb3JtLCB1c2UgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQgaW5zdGVhZCEnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgeWllbGQgPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+IFtuYW1lLCBpbnB1dC52YWx1ZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiooKSB7XG4gICAgZm9yIChjb25zdCBpbnB1dCBvZiBBcnJheS5mcm9tKHNvdXJjZS5lbGVtZW50cykpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgIGlmIChuYW1lICYmIGlzSW5wdXRXaXRoVmFsdWUoaW5wdXQpKSB7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiYgJ2ZpbGUnID09PSBpbnB1dC50eXBlKSB7XG4gICAgICAgICAgaWYgKGlucHV0LmZpbGVzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgQXJyYXkuZnJvbShpbnB1dC5maWxlcykpIHtcbiAgICAgICAgICAgICAgeWllbGQgPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+IFtuYW1lLCBmaWxlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQgPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+IFtuYW1lLCBpbnB1dC52YWx1ZV07XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBpdGVyYXRlRm9ybURhdGEoZm9ybURhdGE6IEZvcm1EYXRhKTogKCkgPT4gSXRlcmFibGVJdGVyYXRvcjxyZWFkb25seSBbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPjtcbmZ1bmN0aW9uIGl0ZXJhdGVGb3JtRGF0YShmb3JtRGF0YTogRm9ybURhdGEsIHRocm93T25GaWxlOiB0cnVlKTogKCkgPT4gSXRlcmFibGVJdGVyYXRvcjxyZWFkb25seSBbc3RyaW5nLCBzdHJpbmddPjtcblxuZnVuY3Rpb24gaXRlcmF0ZUZvcm1EYXRhKGZvcm1EYXRhOiBGb3JtRGF0YSwgdGhyb3dPbkZpbGU/OiB0cnVlKSB7XG4gIGlmICh0aHJvd09uRmlsZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiooKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBmb3JtRGF0YS5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKHYgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmaWxlcyBub3Qgc3VwcG9zZWQgdG8gYmUgc2VudCB1c2luZyB1cmwgZW5jb2RlZCBmb3JtLCB1c2UgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQgaW5zdGVhZCEnKTtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCA8cmVhZG9ubHkgW3N0cmluZywgc3RyaW5nXT4gW2ssIHZdO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuICgpID0+IDxJdGVyYWJsZUl0ZXJhdG9yPHJlYWRvbmx5IFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+PiBmb3JtRGF0YS5lbnRyaWVzKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBGb3JtVXJsRW5jb2RlZENvbnRlbnQgZXh0ZW5kcyBNZXNzYWdlQ29udGVudCBpbXBsZW1lbnRzIE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGRhdGE6IE1hcDxzdHJpbmcsIHN0cmluZz47XG5cbiAgZ2V0IG1lZGlhVHlwZSgpIHsgcmV0dXJuICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOyB9XG5cbiAgZ2V0IHNpemUoKSB7IHJldHVybiB0aGlzLmRhdGEuc2l6ZTsgfVxuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogSFRNTEZvcm1FbGVtZW50fEZvcm1EYXRhfEl0ZXJhYmxlPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+fFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcbiAgICBzdXBlcigpO1xuICAgIGxldCBpdGVyYWJsZTogSXRlcmFibGU8cmVhZG9ubHkgW3N0cmluZywgc3RyaW5nXT47XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NvdXJjZSBtdXN0IGJlIG5vbi1mYWxzeSB2YWx1ZSEnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudCkge1xuICAgICAgaXRlcmFibGUgPSBpdGVyYXRlSFRNTEZvcm1FbGVtZW50KHNvdXJjZSwgdHJ1ZSkoKTtcbiAgICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICBpdGVyYWJsZSA9IGl0ZXJhdGVGb3JtRGF0YShzb3VyY2UsIHRydWUpKCk7XG4gICAgfSBlbHNlIGlmIChpc0l0ZXJhYmxlPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+KHNvdXJjZSkpIHtcbiAgICAgIGl0ZXJhYmxlID0gc291cmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYWJsZSA9IGl0ZXJhdGVSZWNvcmQoc291cmNlKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gbmV3IE1hcChpdGVyYWJsZSk7XG4gIH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtzdHJpbmcsIHN0cmluZ10+IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfVxuXG4gIGdldCBbU3ltYm9sLnRvU3RyaW5nVGFnXSgpIHtcbiAgICByZXR1cm4gJ0Zvcm1VcmxFbmNvZGVkQ29udGVudCc7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmRhdGEuY2xlYXIoKTtcbiAgfVxuXG4gIGRlbGV0ZShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZGVsZXRlKGtleSk7XG4gIH1cblxuICBlbnRyaWVzKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZW50cmllcygpO1xuICB9XG5cbiAgZm9yRWFjaChjYWxsYmFja2ZuOiAodmFsdWU6IHN0cmluZywga2V5OiBzdHJpbmcsIG1hcDogTWFwPHN0cmluZywgc3RyaW5nPikgPT4gdm9pZCwgdGhpc0FyZz86IGFueSkge1xuICAgIHRoaXMuZGF0YS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcpO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXQoa2V5KTtcbiAgfVxuXG4gIGhhcyhrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEuaGFzKGtleSk7XG4gIH1cblxuICBrZXlzKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEua2V5cygpO1xuICB9XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdGhpcyB7XG4gICAgdGhpcy5kYXRhLnNldChrZXksIHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkge1xuICAgIGxldCBjb250ZW50cyA9ICcnO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHRoaXMuZGF0YSkge1xuICAgICAgaWYgKGNvbnRlbnRzKSB7XG4gICAgICAgIGNvbnRlbnRzICs9IGAmJHtlbmNvZGVVUklDb21wb25lbnQoa2V5KX09JHtlbmNvZGVVUklDb21wb25lbnQodmFsdWUpfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50cyA9IGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9YDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFsgY29udGVudHMgXSwgeyB0eXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyB9KTtcbiAgICByZXR1cm4gYmxvYlRvUmVhZGFibGVTdHJlYW0oYmxvYik7XG4gIH1cblxuICB2YWx1ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS52YWx1ZXMoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQgZXh0ZW5kcyBNZXNzYWdlQ29udGVudCBpbXBsZW1lbnRzIE1hcDxzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZT4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGRhdGE6IE1hcDxzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZT47XG4gIHByaXZhdGUgcmVhZG9ubHkgYm91bmRhcnk6IHN0cmluZztcblxuICBnZXQgbWVkaWFUeXBlKCkgeyByZXR1cm4gYG11bHRpcGFydC9mb3JtLWRhdGE7IGJvdW5kYXJ5PSR7dGhpcy5ib3VuZGFyeX1gOyB9XG5cbiAgZ2V0IHNpemUoKSB7IHJldHVybiB0aGlzLmRhdGEuc2l6ZTsgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgY29uc3RydWN0b3Ioc291cmNlOiBIVE1MRm9ybUVsZW1lbnR8Rm9ybURhdGF8SXRlcmFibGU8cmVhZG9ubHkgW3N0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlXT58UmVjb3JkPHN0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlPikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NvdXJjZSBtdXN0IGJlIG5vbi1mYWxzeSB2YWx1ZSEnKTtcbiAgICB9XG4gICAgbGV0IGl0ZXJhYmxlOiBJdGVyYWJsZTxyZWFkb25seSBbc3RyaW5nLCBGb3JtRGF0YUVudHJ5VmFsdWVdPjtcbiAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgRm9ybURhdGEpIHtcbiAgICAgIGl0ZXJhYmxlID0gaXRlcmF0ZUZvcm1EYXRhKHNvdXJjZSkoKTtcbiAgICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudCkge1xuICAgICAgaXRlcmFibGUgPSBpdGVyYXRlSFRNTEZvcm1FbGVtZW50KHNvdXJjZSkoKTtcbiAgICB9IGVsc2UgaWYgKGlzSXRlcmFibGU8cmVhZG9ubHkgW3N0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlXT4oc291cmNlKSkge1xuICAgICAgaXRlcmFibGUgPSBzb3VyY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhYmxlID0gaXRlcmF0ZVJlY29yZChzb3VyY2UpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBuZXcgTWFwPHN0cmluZywgRm9ybURhdGFFbnRyeVZhbHVlPihpdGVyYWJsZSk7XG4gICAgdGhpcy5ib3VuZGFyeSA9IGAtLS0tLWJvdW5kYXJ5LSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwMDApfWA7XG4gIH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZV0+IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfVxuXG4gIGdldCBbU3ltYm9sLnRvU3RyaW5nVGFnXSgpIHtcbiAgICByZXR1cm4gJ011bHRpcGFydEZvcm1Db250ZW50JztcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuZGF0YS5jbGVhcigpO1xuICB9XG5cbiAgZGVsZXRlKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5kZWxldGUoa2V5KTtcbiAgfVxuXG4gIGVudHJpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5lbnRyaWVzKCk7XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIGZvckVhY2goY2FsbGJhY2tmbjogKHZhbHVlOiBGb3JtRGF0YUVudHJ5VmFsdWUsIGtleTogc3RyaW5nLCBtYXA6IE1hcDxzdHJpbmcsIEZvcm1EYXRhRW50cnlWYWx1ZT4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpIHtcbiAgICB0aGlzLmRhdGEuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnKTtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0KGtleSk7XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmhhcyhrZXkpO1xuICB9XG5cbiAga2V5cygpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmtleXMoKTtcbiAgfVxuXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHRoaXMge1xuICAgIHRoaXMuZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YWx1ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS52YWx1ZXMoKTtcbiAgfVxuXG4gIGNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkge1xuICAgIGNvbnN0IGJvdW5kYXJ5ID0gdGhpcy5ib3VuZGFyeTtcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5kYXRhLmVudHJpZXMoKTtcbiAgICByZXR1cm4gbmV3IFJlYWRhYmxlU3RyZWFtKHtcbiAgICAgIGFzeW5jIHB1bGwoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBlbnRyeSA9IGVudHJpZXMubmV4dCgpO1xuICAgICAgICBpZiAoZW50cnkgJiYgIWVudHJ5LmRvbmUpIHtcbiAgICAgICAgICBjb25zdCBbbmFtZSwgZGF0YV0gPSBlbnRyeS52YWx1ZTtcbiAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBkYXRhKSB7XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoW1xuICAgICAgICAgICAgICBgJHtib3VuZGFyeX1gLFxuICAgICAgICAgICAgICBgQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfWAsXG4gICAgICAgICAgICAgICdDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLTgnLFxuICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgIF0uam9pbignXFxyXFxuJykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAgICAgICBjb25zdCBzdHJlYW06IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+ID0gKCg8YW55PiBkYXRhKS5zdHJlYW0gJiYgKDxhbnk+IGRhdGEpLnN0cmVhbSgpKSB8fCBuZXcgUmVzcG9uc2UoZGF0YSkuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHBhc3NDaHVuayA9IGFzeW5jIChyZWFkZXI6IFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcjxVaW50OEFycmF5PikgPT4ge1xuICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICAgICAgICBpZiAocmVzLmRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gYnRvYShBcnJheS5wcm90b3R5cGUubWFwLmNhbGwocmVzLCAobjogbnVtYmVyKSA9PiBTdHJpbmcuZnJvbUNoYXJDb2RlKG4pKS5qb2luKCcnKSk7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShiYXNlNjQpO1xuICAgICAgICAgICAgICBhd2FpdCBwYXNzQ2h1bmsocmVhZGVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoW1xuICAgICAgICAgICAgICBgJHtib3VuZGFyeX1gLFxuICAgICAgICAgICAgICBgQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfTsgZmlsZW5hbWU9JHtkYXRhLm5hbWV9YCxcbiAgICAgICAgICAgICAgYENvbnRlbnQtVHlwZTogJHtkYXRhLnR5cGUgfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSd9YCxcbiAgICAgICAgICAgICAgYENvbnRlbnQtVHJhbnNmZXItRW5jb2Rpbmc6IGJhc2U2NGAsXG4gICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgXS5qb2luKCdcXHJcXG4nKSk7XG4gICAgICAgICAgICBhd2FpdCBwYXNzQ2h1bmsoc3RyZWFtLmdldFJlYWRlcigpKTtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZSgnXFxyXFxuJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShgJHtib3VuZGFyeX0tLVxcclxcbmApO1xuICAgICAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZXh0Q29udGVudCBleHRlbmRzIE1lc3NhZ2VDb250ZW50IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfX21lZGlhVHlwZTogc3RyaW5nO1xuICBwcm90ZWN0ZWQgX190ZXh0Q29udGVudDogc3RyaW5nO1xuXG4gIGdldCBtZWRpYVR5cGUoKSB7IHJldHVybiB0aGlzLl9fbWVkaWFUeXBlOyB9XG5cbiAgZ2V0IHRleHRDb250ZW50KCkgeyByZXR1cm4gdGhpcy5fX3RleHRDb250ZW50OyB9XG5cbiAgY29uc3RydWN0b3IodGV4dDogc3RyaW5nLCBtZWRpYVR5cGU/OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX190ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgdGhpcy5fX21lZGlhVHlwZSA9IG1lZGlhVHlwZSB8fCAndGV4dC9wbGFpbic7XG4gIH1cblxuICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgcmV0dXJuICdUZXh0Q29udGVudCc7XG4gIH1cblxuICBjcmVhdGVSZWFkYWJsZVN0cmVhbSgpIHtcbiAgICByZXR1cm4gYmxvYlRvUmVhZGFibGVTdHJlYW0obmV3IEJsb2IoW3RoaXMudGV4dENvbnRlbnRdLCB7IHR5cGU6IHRoaXMubWVkaWFUeXBlIH0pKTtcbiAgfVxuXG4gIHRleHQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnRleHRDb250ZW50KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSnNvbkNvbnRlbnQgZXh0ZW5kcyBUZXh0Q29udGVudCB7XG5cbiAgcHJvdGVjdGVkIF9fb2JqZWN0OiBhbnk7XG5cbiAgZ2V0IG9iamVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX29iamVjdDtcbiAgfVxuXG4gIGdldCB0ZXh0Q29udGVudCgpIHtcbiAgICBpZiAoIXRoaXMuX190ZXh0Q29udGVudCkge1xuICAgICAgdGhpcy5fX3RleHRDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkodGhpcy5vYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fX3RleHRDb250ZW50O1xuICB9XG5cbiAgY29uc3RydWN0b3Iob2JqOiBhbnksIG1lZGlhVHlwZT86IHN0cmluZykge1xuICAgIHN1cGVyKDxhbnk+IG51bGwsIG1lZGlhVHlwZSB8fCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIHRoaXMuX19vYmplY3QgPSBvYmo7XG4gIH1cblxuICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgcmV0dXJuICdKc29uQ29udGVudCc7XG4gIH1cblxuICBqc29uKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5vYmplY3QpO1xuICB9XG59XG5cbmNsYXNzIEdlbmVyaWNDb250ZW50IGV4dGVuZHMgTWVzc2FnZUNvbnRlbnQge1xuICBwcml2YXRlIHJlYWRvbmx5IF9fc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PjtcbiAgcHJpdmF0ZSByZWFkb25seSBfX21lZGlhVHlwZTogc3RyaW5nO1xuXG4gIGdldCBtZWRpYVR5cGUoKSB7IHJldHVybiB0aGlzLl9fbWVkaWFUeXBlOyB9XG5cbiAgY29uc3RydWN0b3Ioc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PiwgbWVkaWFUeXBlOiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19zdHJlYW0gPSBzdHJlYW07XG4gICAgdGhpcy5fX21lZGlhVHlwZSA9IG1lZGlhVHlwZTtcbiAgfVxuXG4gIGNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkge1xuICAgIHJldHVybiB0aGlzLl9fc3RyZWFtO1xuICB9XG59XG5cbmNsYXNzIE5vbmUgeyB9XG5cbmNvbnN0IG5vbmUgPSBuZXcgTm9uZSgpO1xuXG5jbGFzcyBSZXNwb25zZUpzb25Db250ZW50IGV4dGVuZHMgSnNvbkNvbnRlbnQge1xuXG4gIGdldCBvYmplY3QoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3QgaW5zdGFuY2VvZiBOb25lKSB7XG4gICAgICB0aGlzLl9fb2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLl9fdGV4dENvbnRlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fX29iamVjdDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgbWVkaWFUeXBlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihub25lLCBtZWRpYVR5cGUpO1xuICAgIHRoaXMuX190ZXh0Q29udGVudCA9IHRleHQ7XG4gIH1cbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyBNRVNTQUdFIElOVEVSRkFDRVMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RNZXNzYWdlIHtcbiAgdXJpOiBVcmk7XG4gIGNvbnRlbnQ/OiBNZXNzYWdlQ29udGVudDtcbiAgY2FjaGU/OiBSZXF1ZXN0Q2FjaGU7XG4gIGNyZWRlbnRpYWxzPzogUmVxdWVzdENyZWRlbnRpYWxzO1xuICBoZWFkZXJzPzogSGVhZGVyc0luaXQ7XG4gIGludGVncml0eT86IHN0cmluZztcbiAga2VlcGFsaXZlPzogYm9vbGVhbjtcbiAgbWV0aG9kPzogc3RyaW5nO1xuICBtb2RlPzogUmVxdWVzdE1vZGU7XG4gIHJlZGlyZWN0PzogUmVxdWVzdFJlZGlyZWN0O1xuICByZWZlcnJlcj86IHN0cmluZztcbiAgcmVmZXJyZXJQb2xpY3k/OiBSZWZlcnJlclBvbGljeTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXNwb25zZU1lc3NhZ2Uge1xuICB1cmk6IFVyaTtcbiAgaGVhZGVyczogSGVhZGVycztcbiAgb2s6IGJvb2xlYW47XG4gIHN0YXR1czogbnVtYmVyO1xuICBzdGF0dXNUZXh0OiBzdHJpbmc7XG4gIHR5cGU6IFJlc3BvbnNlVHlwZTtcbiAgY29udGVudD86IE1lc3NhZ2VDb250ZW50O1xufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIEhBTkRMRVIgQUJTVFJBQ1RJT04gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXNzYWdlSGFuZGxlciB7XG4gIGFic3RyYWN0IHNlbmQobWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbik6IFByb21pc2U8UmVzcG9uc2VNZXNzYWdlPjtcbn1cblxudHlwZSBTZW5kRGVsZWdhdGUgPSAobWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikgPT4gUHJvbWlzZTxSZXNwb25zZU1lc3NhZ2U+O1xuXG5leHBvcnQgY2xhc3MgRGVsZWdhdGluZ0hhbmRsZXIgZXh0ZW5kcyBNZXNzYWdlSGFuZGxlciB7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgc3RhdGljIGRlcml2ZShvdmVycmlkZTogKHNlbmQ6IFNlbmREZWxlZ2F0ZSwgbWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikgPT4gUHJvbWlzZTxSZXNwb25zZU1lc3NhZ2U+KSB7XG4gICAgcmV0dXJuIDx0eXBlb2YgRGVsZWdhdGluZ0hhbmRsZXI+IGNsYXNzIERlcml2ZWRIYW5kbGVyIGV4dGVuZHMgRGVsZWdhdGluZ0hhbmRsZXIge1xuICAgICAgY29uc3RydWN0b3IoaW5uZXJIYW5kbGVyOiBNZXNzYWdlSGFuZGxlcikge1xuICAgICAgICBzdXBlcihpbm5lckhhbmRsZXIpO1xuICAgICAgfVxuXG4gICAgICBzZW5kKG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG92ZXJyaWRlKFxuICAgICAgICAgIChtc2csIGNhbmNlbCkgPT4gc3VwZXIuc2VuZChtc2csIGNhbmNlbCksXG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICBjYW5jZWxsYXRpb25cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICBzdGF0aWMgY3JlYXRlKGlubmVySGFuZGxlcjogTWVzc2FnZUhhbmRsZXIsIG92ZXJyaWRlOiAoc2VuZDogU2VuZERlbGVnYXRlLCBtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSA9PiBQcm9taXNlPFJlc3BvbnNlTWVzc2FnZT4pIHtcbiAgICBjb25zdCBoYW5kbGVyVHlwZSA9IHRoaXMuZGVyaXZlKG92ZXJyaWRlKTtcbiAgICByZXR1cm4gbmV3IGhhbmRsZXJUeXBlKGlubmVySGFuZGxlcik7XG4gIH1cblxuICBwcml2YXRlIHJlYWRvbmx5IGlubmVySGFuZGxlcjogTWVzc2FnZUhhbmRsZXI7XG5cbiAgY29uc3RydWN0b3IoaW5uZXJIYW5kbGVyOiBNZXNzYWdlSGFuZGxlcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5pbm5lckhhbmRsZXIgPSBpbm5lckhhbmRsZXI7XG4gIH1cblxuICBzZW5kKG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lckhhbmRsZXIuc2VuZChtZXNzYWdlLCBjYW5jZWxsYXRpb24pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50SGFuZGxlciBleHRlbmRzIE1lc3NhZ2VIYW5kbGVyIHtcbiAgZ2V0IGZldGNoKCk6ICh1cmk6IHN0cmluZywgaW5pdDogUmVxdWVzdEluaXQmQW55UHJvcCkgPT4gUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiBkZWNvcmF0ZWRGZXRjaDtcbiAgfVxuXG4gIGFzeW5jIHByZXByb2Nlc3NSZXF1ZXN0TWVzc2FnZShtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSk6IFByb21pc2U8UmVxdWVzdE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gbWVzc2FnZTtcbiAgfVxuXG4gIGFzeW5jIHJlYWRSZXNwb25zZU1lc3NhZ2UocmVzcG9uc2U6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZU1lc3NhZ2U+IHtcbiAgICBsZXQgY29udGVudDogTWVzc2FnZUNvbnRlbnR8bnVsbCA9IG51bGw7XG4gICAgbGV0IGNvbnRlbnRUeXBlOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMpIHtcbiAgICAgIGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpO1xuICAgICAgaWYgKGNvbnRlbnRUeXBlKSB7XG4gICAgICAgIGlmIChjb250ZW50VHlwZS5zdGFydHNXaXRoKCd0ZXh0L3BsYWluJykpIHtcbiAgICAgICAgICBjb250ZW50ID0gbmV3IFRleHRDb250ZW50KGF3YWl0IHJlc3BvbnNlLnRleHQoKSwgY29udGVudFR5cGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ3RleHQvanNvbicpIHx8IGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgICAgIGNvbnRlbnQgPSBuZXcgUmVzcG9uc2VKc29uQ29udGVudChhd2FpdCByZXNwb25zZS50ZXh0KCksIGNvbnRlbnRUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobnVsbCA9PT0gY29udGVudCkge1xuICAgICAgY29udGVudCA9IHJlc3BvbnNlLmJvZHlcbiAgICAgICAgPyBuZXcgR2VuZXJpY0NvbnRlbnQocmVzcG9uc2UuYm9keSwgY29udGVudFR5cGUgfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScpXG4gICAgICAgIDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHVyaTogbmV3IFVyaShyZXNwb25zZS51cmwpLFxuICAgICAgaGVhZGVyczogcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIG9rOiByZXNwb25zZS5vayxcbiAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgIHR5cGU6IHJlc3BvbnNlLnR5cGUsXG4gICAgICBjb250ZW50OiBjb250ZW50IHx8IHVuZGVmaW5lZFxuICAgIH07XG4gIH1cblxuICBhc3luYyBzZW5kKG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlLCBjYW5jZWxsYXRpb24/OiBDYW5jZWxsYXRpb24pIHtcbiAgICBjb25zdCBhYm9ydGlvbiA9IGxpbmtBYm9ydGlvbihjYW5jZWxsYXRpb24pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHVyaSwgY29udGVudCwgLi4uaW5pdCB9ID0gYXdhaXQgdGhpcy5wcmVwcm9jZXNzUmVxdWVzdE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICBpZiAoY29udGVudCAmJiBjb250ZW50Lm1lZGlhVHlwZSkge1xuICAgICAgICBpbml0LmhlYWRlcnMgPSBhZGRIZWFkZXIoaW5pdC5oZWFkZXJzLCAnQ29udGVudC1UeXBlJywgY29udGVudC5tZWRpYVR5cGUpO1xuICAgICAgfVxuICAgICAgLy8gc2VuZGluZyByZWFkYWJsZSBzdHJlYW0gbm90IHlldCBzdXBwb3J0ZWQgaGFuY2UgdXNpbmcgYmxvYiBpbnN0ZWFkLi4uLlxuICAgICAgLy8gY29uc3QgYm9keSA9IGNvbnRlbnQgPyBjb250ZW50LmNyZWF0ZVJlYWRhYmxlU3RyZWFtKCkgOiB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBib2R5ID0gY29udGVudCA/IGF3YWl0IGNvbnRlbnQuYmxvYigpIDogdW5kZWZpbmVkO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKG1lc3NhZ2UudXJpLmhyZWYsIHtcbiAgICAgICAgLi4uaW5pdCxcbiAgICAgICAgYm9keSxcbiAgICAgICAgc2lnbmFsOiBhYm9ydGlvbi5zaWduYWxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFJlc3BvbnNlTWVzc2FnZShyZXNwb25zZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGFib3J0aW9uLnN1YnNjcmlwdGlvbi5yZW1vdmUoKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRIdHRwQ2xpZW50SGFuZGxlciA9IG5ldyBIdHRwQ2xpZW50SGFuZGxlcigpO1xuXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudENvbmZpZ3VyYXRpb24ge1xuICBwcml2YXRlIHJlYWRvbmx5IGhhbmRsZXJzOiBNYXA8c3RyaW5nLCBNZXNzYWdlSGFuZGxlcj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgZGVmYXVsdDogTWVzc2FnZUhhbmRsZXIgPSBkZWZhdWx0SHR0cENsaWVudEhhbmRsZXI7XG5cbiAgZ2V0SGFuZGxlcihjb25maWd1cmF0aW9uPzogc3RyaW5nfG51bGwpOiBNZXNzYWdlSGFuZGxlciB7XG4gICAgaWYgKCFjb25maWd1cmF0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5oYW5kbGVycy5nZXQoY29uZmlndXJhdGlvbikgfHwgdGhpcy5kZWZhdWx0O1xuICB9XG5cbiAgc2V0SGFuZGxlcihjb25maWd1cmF0aW9uOiBzdHJpbmd8bnVsbCwgaGFuZGxlcjogTWVzc2FnZUhhbmRsZXIpIHtcbiAgICBpZiAoIWNvbmZpZ3VyYXRpb24pIHtcbiAgICAgIHRoaXMuZGVmYXVsdCA9IGhhbmRsZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFuZGxlcnMuc2V0KGNvbmZpZ3VyYXRpb24sIGhhbmRsZXIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgaHR0cENsaWVudENvbmZpZ3VyYXRpb24gPSBuZXcgSHR0cENsaWVudENvbmZpZ3VyYXRpb24oKTtcblxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnQge1xuICBwcml2YXRlIGhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBuZXcgaW5zdGFuY2Ugb2YgaHR0cCBjbGllbnQgd2l0aCBkZWZhdWx0IG1lc3NhZ2UgaGFuZGxlciBjb25maWd1cmVkIHRocm91Z2ggX2h0dHBDbGllbnRDb25maWd1cmF0aW9uXy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCk7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBuZXcgaW5zdGFuY2Ugb2YgaHR0cCBjbGllbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGhhbmRsZXIuXG4gICAqIEBwYXJhbSBoYW5kbGVyIE1lc3NhZ2UgaGFuZGxlciB0byB1c2UuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoYW5kbGVyOiBNZXNzYWdlSGFuZGxlcik7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBuZXcgaW5zdGFuY2Ugb2YgaHR0cCBjbGllbnQgd2l0aCBtZXNzYWdlIGhhbmRsZXIgY29uZmlndXJlZCB0aHJvdWdoIF9odHRwQ2xpZW50Q29uZmlndXJhdGlvbl8uXG4gICAqXG4gICAqIEBwYXJhbSBjb25maWd1cmF0aW9uIE1lc3NhZ2UgaGFuZGxlciBjb25maWd1cmF0aW9uIG5hbWUuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25maWd1cmF0aW9uOiBzdHJpbmcpO1xuXG4gIGNvbnN0cnVjdG9yKGhhbmRsZXJPckNvbmZpZ3VyYXRpb24/OiBNZXNzYWdlSGFuZGxlcnxzdHJpbmcpIHtcbiAgICBpZiAoIWhhbmRsZXJPckNvbmZpZ3VyYXRpb24pIHtcbiAgICAgIHRoaXMuaGFuZGxlciA9IGh0dHBDbGllbnRDb25maWd1cmF0aW9uLmdldEhhbmRsZXIoKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXJPckNvbmZpZ3VyYXRpb24gaW5zdGFuY2VvZiBNZXNzYWdlSGFuZGxlcikge1xuICAgICAgdGhpcy5oYW5kbGVyID0gaGFuZGxlck9yQ29uZmlndXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgaGFuZGxlck9yQ29uZmlndXJhdGlvbikge1xuICAgICAgdGhpcy5oYW5kbGVyID0gaHR0cENsaWVudENvbmZpZ3VyYXRpb24uZ2V0SGFuZGxlcihoYW5kbGVyT3JDb25maWd1cmF0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBhcmd1bWVudDogJHtoYW5kbGVyT3JDb25maWd1cmF0aW9ufWApO1xuICAgIH1cbiAgfVxuXG4gIHNlbmQocmVxdWVzdDogUmVxdWVzdE1lc3NhZ2UsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgIHJldHVybiB0aGlzLmhhbmRsZXIuc2VuZChyZXF1ZXN0LCBjYW5jZWxsYXRpb24pO1xuICB9XG5cbiAgZGVsZXRlKHVyaTogc3RyaW5nfFVyaSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZCh7XG4gICAgICB1cmk6IFVyaS5mcm9tKHVyaSksXG4gICAgICBtZXRob2Q6ICdERUxFVEUnXG4gICAgfSwgY2FuY2VsbGF0aW9uKTtcbiAgfVxuXG4gIGdldCh1cmk6IHN0cmluZ3xVcmksIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgIHJldHVybiB0aGlzLnNlbmQoe1xuICAgICAgdXJpOiBVcmkuZnJvbSh1cmkpLFxuICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgIH0sIGNhbmNlbGxhdGlvbik7XG4gIH1cblxuICBhc3luYyBnZXRCbG9iKHVyaTogc3RyaW5nfFVyaSwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKTogUHJvbWlzZTxCbG9iPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmdldCh1cmksIGNhbmNlbGxhdGlvbik7XG4gICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICBpZiAocmVzcG9uc2UuY29udGVudCkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuY29udGVudC5ibG9iKCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc3BvbnNlIGhhcyBubyBjb250ZW50Jyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuICB9XG5cbiAgYXN5bmMgZ2V0SnNvbih1cmk6IHN0cmluZ3xVcmksIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnNlbmQoe1xuICAgICAgdXJpOiBVcmkuZnJvbSh1cmkpLFxuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGhlYWRlcnM6IHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfVxuICAgIH0sIGNhbmNlbGxhdGlvbik7XG4gICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICBpZiAocmVzcG9uc2UuY29udGVudCkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuY29udGVudC5qc29uKCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc3BvbnNlIGhhcyBubyBjb250ZW50Jyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuICB9XG5cbiAgYXN5bmMgZ2V0VGV4dCh1cmk6IHN0cmluZ3xVcmksIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmdldCh1cmksIGNhbmNlbGxhdGlvbik7XG4gICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICBpZiAocmVzcG9uc2UuY29udGVudCkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuY29udGVudC50ZXh0KCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc3BvbnNlIGhhcyBubyBjb250ZW50Jyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICBwb3N0KHVyaTogc3RyaW5nfFVyaSwgY29udGVudDogTWVzc2FnZUNvbnRlbnR8Rm9ybURhdGF8SFRNTEZvcm1FbGVtZW50fHN0cmluZ3xvYmplY3R8bnVsbCwgY2FuY2VsbGF0aW9uPzogQ2FuY2VsbGF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZCh7XG4gICAgICB1cmk6IFVyaS5mcm9tKHVyaSksXG4gICAgICBjb250ZW50OiAoY29udGVudCBpbnN0YW5jZW9mIE1lc3NhZ2VDb250ZW50IHx8IG51bGwgPT09IGNvbnRlbnQpXG4gICAgICAgID8gKGNvbnRlbnQgfHwgdW5kZWZpbmVkKVxuICAgICAgICA6IChjb250ZW50IGluc3RhbmNlb2YgRm9ybURhdGFcbiAgICAgICAgICAgID8gbmV3IE11bHRpcGFydEZvcm1Db250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICA6IChjb250ZW50IGluc3RhbmNlb2YgSFRNTEZvcm1FbGVtZW50XG4gICAgICAgICAgICAgICAgPyBuZXcgTXVsdGlwYXJ0Rm9ybUNvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICA6ICgnc3RyaW5nJyA9PT0gdHlwZW9mIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgPyBuZXcgVGV4dENvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgOiBuZXcgSnNvbkNvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICksXG4gICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgIH0sIGNhbmNlbGxhdGlvbik7XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIHB1dCh1cmk6IHN0cmluZ3xVcmksIGNvbnRlbnQ6IE1lc3NhZ2VDb250ZW50fEZvcm1EYXRhfEhUTUxGb3JtRWxlbWVudHxzdHJpbmd8b2JqZWN0fG51bGwsIGNhbmNlbGxhdGlvbj86IENhbmNlbGxhdGlvbikge1xuICAgIHJldHVybiB0aGlzLnNlbmQoe1xuICAgICAgdXJpOiBVcmkuZnJvbSh1cmkpLFxuICAgICAgY29udGVudDogKGNvbnRlbnQgaW5zdGFuY2VvZiBNZXNzYWdlQ29udGVudCB8fCBudWxsID09PSBjb250ZW50KVxuICAgICAgICA/IChjb250ZW50IHx8IHVuZGVmaW5lZClcbiAgICAgICAgOiAoY29udGVudCBpbnN0YW5jZW9mIEZvcm1EYXRhXG4gICAgICAgICAgICA/IG5ldyBNdWx0aXBhcnRGb3JtQ29udGVudChjb250ZW50KVxuICAgICAgICAgICAgOiAoY29udGVudCBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudFxuICAgICAgICAgICAgICAgID8gbmV3IE11bHRpcGFydEZvcm1Db250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgOiAoJ3N0cmluZycgPT09IHR5cGVvZiBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgID8gbmV3IFRleHRDb250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIDogbmV3IEpzb25Db250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICApLFxuICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgIH0sIGNhbmNlbGxhdGlvbik7XG4gIH1cbn1cbiJdfQ==