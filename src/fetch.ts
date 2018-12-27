
export interface AnyProp {
  [key: string]: any
}

export interface FetchDecorator {
  readonly name: string;
  decorate(uri: string, init: RequestInit&AnyProp): RequestInit&AnyProp;
}


export interface DecoratedFetch {
  (uri: string, init: RequestInit&AnyProp): Promise<Response>;
  readonly decorators: FetchDecorator[];
  native(uri: string, init: RequestInit): Promise<Response>;
  include(...decorators: (string|FetchDecorator)[]): (uri: string, init: RequestInit&AnyProp) => Promise<Response>;
  exclude(...decorators: (string|FetchDecorator)[]): (uri: string, init: RequestInit&AnyProp) => Promise<Response>;
}

const decorators: FetchDecorator[] = [];

const doFetch = (decorators: FetchDecorator[], uri: string, init?: RequestInit&AnyProp) => {
  let opts = init || {};
  for (const decorator of decorators) {
    const newOpts = decorator.decorate(uri, opts);
    if (newOpts) {
      opts = newOpts;
    }
  }
  return window.fetch(uri, opts);
};

interface Initial {
  (uri: string, init: RequestInit&AnyProp): Promise<Response>;
  readonly decorators: FetchDecorator[]
}

export const decoratedFetch: DecoratedFetch = Object.assign(
  <Initial>Object.defineProperty((uri: string, init?: RequestInit&AnyProp) => doFetch(decorators, uri, init), 'decorators', {
    get() { return decorators }
  }), {
    native: window.fetch.bind(window),
    include: (...input: (string|FetchDecorator)[]) => {
      const ds: FetchDecorator[] = [];
      for (const key of input) {
        if ('string' === typeof key) {
          const d = decorators.find(x => x.name === key);
          if (!d) {
            throw new Error('invalid or missing decorator: ' + key);
          }
          ds.push(d);
        } else {
          ds.push(key);
        }
      }
      return (uri: string, init?: RequestInit&AnyProp) => doFetch(ds, uri, init);
    },
    exclude: (...input: (string|FetchDecorator)[]) => {
      const ds: FetchDecorator[] = decorators.slice(0);
      for (const key of input) {
        if ('string' === typeof key) {
          const index = ds.findIndex(x => x.name === key);
          if (-1 !== index) {
            ds.splice(index, 1);
          }
        } else {
          const index = ds.findIndex(x => x === key);
          if (-1 !== index) {
            ds.splice(index, 1);
          }
        }
      }
      return (uri: string, init?: RequestInit&AnyProp) => doFetch(ds, uri, init);
    }
  }
);

const defaultErrors: { [key: number]: string|undefined } = {
  400: 'Bad request',
  500: 'Server error'
}

export class HttpError extends Error {
  response: Response;
  constructor(response: Response, message?: string) {
    super(message ? message : defaultErrors[response.status] || `Unexpected error while fetching ${response.url}`);
    const that = this; // iOS workaround...
    Object.setPrototypeOf(that, HttpError.prototype);
    if ('function' === typeof (<any>Error).captureStackTrace) {
      (<any>Error).captureStackTrace(that, that.constructor);
    }
    this.response = response;
  }
}

export async function httpGet(uri: string) {
  const response = await decoratedFetch(uri, { method: 'GET' });
  if (response.ok) {
    return response;
  }
  const message = response.headers.get('X-Message');
  if (message) {
    throw new HttpError(response, message);
  }
  throw new HttpError(response);
}

export async function httpGetJson<T>(uri: string) {
  const response = await httpGet(uri);
  return <T>(await response.json());
}