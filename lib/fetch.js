const decorators = [];
// tslint:disable-next-line:no-shadowed-variable
const doFetch = async (decorators, uri, init) => {
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
const getFetch = () => {
    try {
        return window.fetch.bind(window);
    }
    catch (exn) {
        // seems to be test ENV
        return (() => {
            throw new Error('window.fetch used in node environment...');
        });
    }
};
export const decoratedFetch = Object.assign(
// tslint:disable-next-line:max-line-length
Object.defineProperty((uri, init) => doFetch(decorators, uri, init), 'decorators', {
    get() { return decorators; }
}), {
    native: getFetch(),
    include: (...input) => {
        const ds = [];
        for (const key of input) {
            if ('string' === typeof key) {
                const d = decorators.find((x) => x.name === key);
                if (!d) {
                    throw new Error('invalid or missing decorator: ' + key);
                }
                ds.push(d);
            }
            else {
                ds.push(key);
            }
        }
        return (uri, init) => doFetch(ds, uri, init);
    },
    exclude: (...input) => {
        const ds = decorators.slice(0);
        for (const key of input) {
            if ('string' === typeof key) {
                const index = ds.findIndex((x) => x.name === key);
                if (-1 !== index) {
                    ds.splice(index, 1);
                }
            }
            else {
                const index = ds.findIndex((x) => x === key);
                if (-1 !== index) {
                    ds.splice(index, 1);
                }
            }
        }
        return (uri, init) => doFetch(ds, uri, init);
    }
});
const defaultErrors = {
    400: 'Bad request',
    500: 'Server error'
};
const getUri = (source) => {
    if (source.url) {
        return source.url;
    }
    if (source.uri) {
        return source.uri.href;
    }
    return '<unknown>';
};
export class HttpError extends Error {
    // tslint:disable-next-line:max-line-length
    constructor(response, message) {
        super(message
            ? message
            : defaultErrors[response.status] || `Unexpected error while fetching ${getUri(response)}`);
        const that = this; // iOS workaround...
        Object.setPrototypeOf(that, HttpError.prototype);
        if ('function' === typeof Error.captureStackTrace) {
            Error.captureStackTrace(that, that.constructor);
        }
        this.response = response;
    }
}
export async function httpGet(uri) {
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
export async function httpGetJson(uri) {
    const response = await httpGet(uri);
    return (await response.json());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBb0JBLE1BQU0sVUFBVSxHQUFxQixFQUFFLENBQUM7QUFFeEMsZ0RBQWdEO0FBQ2hELE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxVQUE0QixFQUFFLEdBQVcsRUFBRSxJQUEwQixFQUFFLEVBQUU7SUFDOUYsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN0QixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtRQUNsQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUU7WUFDdEIsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUMsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsSUFBSSxHQUFHLE9BQU8sQ0FBQzthQUNoQjtTQUNGO0tBQ0Y7SUFDRCxJQUFJLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdDLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO1FBQ2xDLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNwQixNQUFNLElBQUksR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BELElBQUksSUFBSSxFQUFFO2dCQUNSLFFBQVEsR0FBRyxJQUFJLENBQUM7YUFDakI7U0FDRjtLQUNGO0lBQ0QsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0FBT0YsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFO0lBQ3BCLElBQUk7UUFDRixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2xDO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWix1QkFBdUI7UUFDdkIsT0FB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UyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLFdBQVcsQ0FBSSxHQUFXO0lBQzlDLE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLE9BQVcsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVcmkgfSBmcm9tICcuL3VyaSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW55UHJvcCB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGZXRjaERlY29yYXRvciB7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgZGVjb3JhdGU/OiAodXJpOiBzdHJpbmcsIGluaXQ6IFJlcXVlc3RJbml0JkFueVByb3ApID0+IFJlcXVlc3RJbml0JkFueVByb3A7XG4gIGhhbmRsZT86IChyZXNwb25zZTogUmVzcG9uc2UsIGluaXQ/OiBSZXF1ZXN0SW5pdCZBbnlQcm9wKSA9PiBQcm9taXNlPFJlc3BvbnNlfHZvaWQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlY29yYXRlZEZldGNoIHtcbiAgKHVyaTogc3RyaW5nLCBpbml0OiBSZXF1ZXN0SW5pdCZBbnlQcm9wKTogUHJvbWlzZTxSZXNwb25zZT47XG4gIHJlYWRvbmx5IGRlY29yYXRvcnM6IEZldGNoRGVjb3JhdG9yW107XG4gIG5hdGl2ZSh1cmk6IHN0cmluZywgaW5pdDogUmVxdWVzdEluaXQpOiBQcm9taXNlPFJlc3BvbnNlPjtcbiAgaW5jbHVkZSguLi5kZWNvcmF0b3JzOiBBcnJheTxzdHJpbmd8RmV0Y2hEZWNvcmF0b3I+KTogKHVyaTogc3RyaW5nLCBpbml0OiBSZXF1ZXN0SW5pdCZBbnlQcm9wKSA9PiBQcm9taXNlPFJlc3BvbnNlPjtcbiAgZXhjbHVkZSguLi5kZWNvcmF0b3JzOiBBcnJheTxzdHJpbmd8RmV0Y2hEZWNvcmF0b3I+KTogKHVyaTogc3RyaW5nLCBpbml0OiBSZXF1ZXN0SW5pdCZBbnlQcm9wKSA9PiBQcm9taXNlPFJlc3BvbnNlPjtcbn1cblxuY29uc3QgZGVjb3JhdG9yczogRmV0Y2hEZWNvcmF0b3JbXSA9IFtdO1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tc2hhZG93ZWQtdmFyaWFibGVcbmNvbnN0IGRvRmV0Y2ggPSBhc3luYyAoZGVjb3JhdG9yczogRmV0Y2hEZWNvcmF0b3JbXSwgdXJpOiBzdHJpbmcsIGluaXQ/OiBSZXF1ZXN0SW5pdCZBbnlQcm9wKSA9PiB7XG4gIGxldCBvcHRzID0gaW5pdCB8fCB7fTtcbiAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgZGVjb3JhdG9ycykge1xuICAgIGlmIChkZWNvcmF0b3IuZGVjb3JhdGUpIHtcbiAgICAgIGNvbnN0IG5ld09wdHMgPSBkZWNvcmF0b3IuZGVjb3JhdGUodXJpLCBvcHRzKTtcbiAgICAgIGlmIChuZXdPcHRzKSB7XG4gICAgICAgIG9wdHMgPSBuZXdPcHRzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB3aW5kb3cuZmV0Y2godXJpLCBvcHRzKTtcbiAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgZGVjb3JhdG9ycykge1xuICAgIGlmIChkZWNvcmF0b3IuaGFuZGxlKSB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgZGVjb3JhdG9yLmhhbmRsZShyZXNwb25zZSwgaW5pdCk7XG4gICAgICBpZiAocmVzcCkge1xuICAgICAgICByZXNwb25zZSA9IHJlc3A7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXNwb25zZTtcbn07XG5cbmludGVyZmFjZSBJbml0aWFsIHtcbiAgKHVyaTogc3RyaW5nLCBpbml0OiBSZXF1ZXN0SW5pdCZBbnlQcm9wKTogUHJvbWlzZTxSZXNwb25zZT47XG4gIHJlYWRvbmx5IGRlY29yYXRvcnM6IEZldGNoRGVjb3JhdG9yW107XG59XG5cbmNvbnN0IGdldEZldGNoID0gKCkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cuZmV0Y2guYmluZCh3aW5kb3cpO1xuICB9IGNhdGNoIChleG4pIHtcbiAgICAvLyBzZWVtcyB0byBiZSB0ZXN0IEVOVlxuICAgIHJldHVybiA8YW55PiAoKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd3aW5kb3cuZmV0Y2ggdXNlZCBpbiBub2RlIGVudmlyb25tZW50Li4uJyk7XG4gICAgfSk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBkZWNvcmF0ZWRGZXRjaDogRGVjb3JhdGVkRmV0Y2ggPSBPYmplY3QuYXNzaWduKFxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIDxJbml0aWFsPiBPYmplY3QuZGVmaW5lUHJvcGVydHkoKHVyaTogc3RyaW5nLCBpbml0PzogUmVxdWVzdEluaXQmQW55UHJvcCkgPT4gZG9GZXRjaChkZWNvcmF0b3JzLCB1cmksIGluaXQpLCAnZGVjb3JhdG9ycycsIHtcbiAgICBnZXQoKSB7IHJldHVybiBkZWNvcmF0b3JzOyB9XG4gIH0pLCB7XG4gICAgbmF0aXZlOiBnZXRGZXRjaCgpLFxuICAgIGluY2x1ZGU6ICguLi5pbnB1dDogQXJyYXk8c3RyaW5nfEZldGNoRGVjb3JhdG9yPikgPT4ge1xuICAgICAgY29uc3QgZHM6IEZldGNoRGVjb3JhdG9yW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGlucHV0KSB7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGtleSkge1xuICAgICAgICAgIGNvbnN0IGQgPSBkZWNvcmF0b3JzLmZpbmQoKHgpID0+IHgubmFtZSA9PT0ga2V5KTtcbiAgICAgICAgICBpZiAoIWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBvciBtaXNzaW5nIGRlY29yYXRvcjogJyArIGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRzLnB1c2goZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZHMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gKHVyaTogc3RyaW5nLCBpbml0PzogUmVxdWVzdEluaXQmQW55UHJvcCkgPT4gZG9GZXRjaChkcywgdXJpLCBpbml0KTtcbiAgICB9LFxuICAgIGV4Y2x1ZGU6ICguLi5pbnB1dDogQXJyYXk8c3RyaW5nfEZldGNoRGVjb3JhdG9yPikgPT4ge1xuICAgICAgY29uc3QgZHM6IEZldGNoRGVjb3JhdG9yW10gPSBkZWNvcmF0b3JzLnNsaWNlKDApO1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgaW5wdXQpIHtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Yga2V5KSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSBkcy5maW5kSW5kZXgoKHgpID0+IHgubmFtZSA9PT0ga2V5KTtcbiAgICAgICAgICBpZiAoLTEgIT09IGluZGV4KSB7XG4gICAgICAgICAgICBkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IGRzLmZpbmRJbmRleCgoeCkgPT4geCA9PT0ga2V5KTtcbiAgICAgICAgICBpZiAoLTEgIT09IGluZGV4KSB7XG4gICAgICAgICAgICBkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuICh1cmk6IHN0cmluZywgaW5pdD86IFJlcXVlc3RJbml0JkFueVByb3ApID0+IGRvRmV0Y2goZHMsIHVyaSwgaW5pdCk7XG4gICAgfVxuICB9XG4pO1xuXG5jb25zdCBkZWZhdWx0RXJyb3JzOiB7IFtrZXk6IG51bWJlcl06IHN0cmluZ3x1bmRlZmluZWQgfSA9IHtcbiAgNDAwOiAnQmFkIHJlcXVlc3QnLFxuICA1MDA6ICdTZXJ2ZXIgZXJyb3InXG59O1xuXG5jb25zdCBnZXRVcmkgPSAoc291cmNlOiB7IHVybD86IHN0cmluZzsgdXJpPzogVXJpIH0pOiBzdHJpbmcgPT4ge1xuICBpZiAoc291cmNlLnVybCkge1xuICAgIHJldHVybiBzb3VyY2UudXJsO1xuICB9XG4gIGlmIChzb3VyY2UudXJpKSB7XG4gICAgcmV0dXJuIHNvdXJjZS51cmkuaHJlZjtcbiAgfVxuICByZXR1cm4gJzx1bmtub3duPic7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3BvbnNlTGlrZSB7XG4gIHN0YXR1czogbnVtYmVyO1xuICBoZWFkZXJzOiBIZWFkZXJzO1xuICB1cmw/OiBzdHJpbmc7XG4gIHVyaT86IFVyaTtcbiAgdHlwZTogUmVzcG9uc2VUeXBlO1xufVxuXG5leHBvcnQgY2xhc3MgSHR0cEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICByZXNwb25zZTogUmVzcG9uc2VMaWtlO1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIGNvbnN0cnVjdG9yKHJlc3BvbnNlOiBSZXNwb25zZUxpa2UsIG1lc3NhZ2U/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlXG4gICAgICA/IG1lc3NhZ2VcbiAgICAgIDogZGVmYXVsdEVycm9yc1tyZXNwb25zZS5zdGF0dXNdIHx8IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGZldGNoaW5nICR7Z2V0VXJpKHJlc3BvbnNlKX1gKTtcbiAgICBjb25zdCB0aGF0ID0gdGhpczsgLy8gaU9TIHdvcmthcm91bmQuLi5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhhdCwgSHR0cEVycm9yLnByb3RvdHlwZSk7XG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiAoPGFueT4gRXJyb3IpLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgICAoPGFueT4gRXJyb3IpLmNhcHR1cmVTdGFja1RyYWNlKHRoYXQsIHRoYXQuY29uc3RydWN0b3IpO1xuICAgIH1cbiAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGh0dHBHZXQodXJpOiBzdHJpbmcpIHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBkZWNvcmF0ZWRGZXRjaCh1cmksIHsgbWV0aG9kOiAnR0VUJyB9KTtcbiAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG4gIGNvbnN0IG1lc3NhZ2UgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnWC1NZXNzYWdlJyk7XG4gIGlmIChtZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEh0dHBFcnJvcihyZXNwb25zZSwgbWVzc2FnZSk7XG4gIH1cbiAgdGhyb3cgbmV3IEh0dHBFcnJvcihyZXNwb25zZSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBodHRwR2V0SnNvbjxUPih1cmk6IHN0cmluZykge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGh0dHBHZXQodXJpKTtcbiAgcmV0dXJuIDxUPiAoYXdhaXQgcmVzcG9uc2UuanNvbigpKTtcbn1cbiJdfQ==