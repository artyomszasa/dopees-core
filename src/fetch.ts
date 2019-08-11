import { Uri } from './uri';

export interface AnyProp {
  [key: string]: any;
}

export interface FetchDecorator {
  readonly name: string;
  decorate?: (uri: string, init: RequestInit&AnyProp) => RequestInit&AnyProp;
  handle?: (response: Response, init?: RequestInit&AnyProp) => Promise<Response|void>;
}

export interface DecoratedFetch {
  (uri: string, init: RequestInit&AnyProp): Promise<Response>;
  readonly decorators: FetchDecorator[];
  native(uri: string, init: RequestInit): Promise<Response>;
  include(...decorators: Array<string|FetchDecorator>): (uri: string, init: RequestInit&AnyProp) => Promise<Response>;
  exclude(...decorators: Array<string|FetchDecorator>): (uri: string, init: RequestInit&AnyProp) => Promise<Response>;
}

const decorators: FetchDecorator[] = [];

// tslint:disable-next-line:no-shadowed-variable
const doFetch = async (decorators: FetchDecorator[], uri: string, init?: RequestInit&AnyProp) => {
  let opts = init || {};
  for (const decorator of decorators) {
    if (decorator.decorate) {
      const newOpts = decorator.decorate(uri, opts);
      if (newOpts) {
        opts = newOpts;
      }
    }
  }
  let response = await window.fetch(uri, opts);
  for (const decorator of decorators) {
    if (decorator.handle) {
      const resp = await decorator.handle(response, init);
      if (resp) {
        response = resp;
      }
    }
  }
  return response;
};

interface Initial {
  (uri: string, init: RequestInit&AnyProp): Promise<Response>;
  readonly decorators: FetchDecorator[];
}

const getFetch = () => {
  try {
    return window.fetch.bind(window);
  } catch (exn) {
    // seems to be test ENV
    return <any> (() => {
      throw new Error('window.fetch used in node environment...');
    });
  }
};

export const decoratedFetch: DecoratedFetch = Object.assign(
  // tslint:disable-next-line:max-line-length
  <Initial> Object.defineProperty((uri: string, init?: RequestInit&AnyProp) => doFetch(decorators, uri, init), 'decorators', {
    get() { return decorators; }
  }), {
    native: getFetch(),
    include: (...input: Array<string|FetchDecorator>) => {
      const ds: FetchDecorator[] = [];
      for (const key of input) {
        if ('string' === typeof key) {
          const d = decorators.find((x) => x.name === key);
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
    exclude: (...input: Array<string|FetchDecorator>) => {
      const ds: FetchDecorator[] = decorators.slice(0);
      for (const key of input) {
        if ('string' === typeof key) {
          const index = ds.findIndex((x) => x.name === key);
          if (-1 !== index) {
            ds.splice(index, 1);
          }
        } else {
          const index = ds.findIndex((x) => x === key);
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
};

const getUri = (source: { url?: string; uri?: Uri }): string => {
  if (source.url) {
    return source.url;
  }
  if (source.uri) {
    return source.uri.href;
  }
  return '<unknown>';
};

export interface ResponseLike {
  status: number;
  headers: Headers;
  url?: string;
  uri?: Uri;
  type: ResponseType;
}

export class HttpError extends Error {
  response: ResponseLike;
  // tslint:disable-next-line:max-line-length
  constructor(response: ResponseLike, message?: string) {
    super(message
      ? message
      : defaultErrors[response.status] || `Unexpected error while fetching ${getUri(response)}`);
    const that = this; // iOS workaround...
    Object.setPrototypeOf(that, HttpError.prototype);
    if ('function' === typeof (<any> Error).captureStackTrace) {
      (<any> Error).captureStackTrace(that, that.constructor);
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
  return <T> (await response.json());
}
