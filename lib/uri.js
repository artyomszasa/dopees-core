// see: https://tools.ietf.org/html/rfc3986
// tslint:disable-next-line:max-line-length
const regexUri = /^(([a-z][a-z0-9+.-]*):)?(\/\/(([!$&\\'()*,;=a-z0-9._~-]|%[0-9a-f][0-9a-f])*)(\:([0-9]+))?)?(([\/!$&\\'()*,;=:@a-z0-9._~-]|%[0-9a-f][0-9a-f])*)(\?([!$&\\'()*,;=:@a-z0-9._~\/?-]|%[0-9a-f][0-9a-f])*)?(\#.*)?$/i;
const parseQuery = (params, raw) => {
    raw
        .split('&')
        .forEach((one) => {
        if (one) {
            const i = one.indexOf('=');
            if (-1 === i) {
                params[one] = null;
            }
            else {
                params[one.substring(0, i)] = decodeURIComponent(one.substring(i + 1));
            }
        }
    });
};
const parse = (uri, raw) => {
    const m = regexUri.exec(raw);
    if (m) {
        uri.scheme = m[2];
        uri.host = m[4];
        uri.path = m[8];
        uri.port = parseInt(m[7], 10) || Uri.defaultPorts[uri.scheme] || 0;
        uri.query = (m[10] && m[10].substr(1) || '');
        uri.fragment = (m[12] && m[12].substr(1) || '');
    }
};
/**
 * Simple and straightforward Uri wrapper.
 *
 * @class dope.Uri
 * @param {String} raw - string representation of the Uri.
 */
let Uri = /** @class */ (() => {
    class Uri {
        constructor(raw) {
            this._queryParams = {};
            parse(this, raw);
        }
        /**
         * Gets or sets query component of the Uri as object. Allows accessing and
         * manipulating individual arguments within query component.
         */
        get queryParams() {
            return this._queryParams;
        }
        set queryParams(value) {
            this._queryParams = value || {};
        }
        /**
         * Creates {@link Uri} form an argument.
         *
         * @param {string|Uri} uri - Source uri.
         */
        static from(uri) {
            if (uri instanceof Uri) {
                return uri;
            }
            return new Uri(uri);
        }
        /**
         * Is _true_ if the wrapper Uri is relative.
         *
         * @type {Boolean}
         * @readonly
         */
        get isRelative() {
            return !this.scheme;
        }
        /**
         * Is _true_ if the wrapper Uri is absolute.
         *
         * @type {Boolean}
         * @readonly
         */
        get isAbsolute() {
            return !!this.scheme;
        }
        /**
         * Gets or sets authority of the Uri (i.e. hostname and port if non standard).
         *
         * @type {String}
         */
        get authority() {
            if (this.port && this.scheme && this.port !== Uri.defaultPorts[this.scheme]) {
                return `${this.host}:${this.port}`;
            }
            return this.host || '';
        }
        set authority(authority) {
            const i = authority.indexOf(':');
            if (-1 === i) {
                this.host = authority;
                this.port = 0;
            }
            else {
                this.host = authority.substr(0, i);
                this.port = parseInt(authority.substr(i + 1), 10) || 0;
            }
        }
        /**
         * Gets or sets the wrapped Uri.
         *
         * @type {String}
         */
        get href() {
            const query = this.query;
            const queryString = query ? `?${query}` : '';
            const fragment = this.fragment ? `#${this.fragment}` : '';
            const authority = this.authority ? `//${this.authority}` : '';
            const scheme = this.scheme ? `${this.scheme}:` : '';
            return `${scheme}${authority}${this.path}${queryString}${fragment}`;
        }
        set href(href) {
            parse(this, href);
        }
        /**
         * Gets or sets query component of the Uri. To access or manipulate individual query arguments use
         * {@link dope.Uri#queryParams}.
         *
         * @type {String}
         */
        get query() {
            const queryParams = this._queryParams || {};
            return Object.keys(queryParams)
                .map((key) => {
                const val = queryParams[key];
                return val ? `${encodeURIComponent(key)}=${encodeURIComponent(val)}` : `${encodeURIComponent(key)}=`;
            })
                .join('&');
        }
        set query(query) {
            this._queryParams = {};
            parseQuery(this._queryParams, query);
        }
        toString() {
            return this.href;
        }
    }
    Uri.defaultPorts = {
        http: 80,
        https: 443
    };
    return Uri;
})();
export { Uri };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3VyaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDLE1BQU0sUUFBUSxHQUFHLGdOQUFnTixDQUFDO0FBVWxPLE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBaUIsRUFBRSxHQUFXLEVBQUUsRUFBRTtJQUNwRCxHQUFHO1NBQ0UsS0FBSyxDQUFDLEdBQUcsQ0FBQztTQUNWLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ2IsSUFBSSxHQUFHLEVBQUU7WUFDTCxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxRTtTQUNKO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUM7QUFDRixNQUFNLEtBQUssR0FBRyxDQUFDLEdBQVEsRUFBRSxHQUFXLEVBQUUsRUFBRTtJQUN0QyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLElBQUksQ0FBQyxFQUFFO1FBQ0gsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIs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QUFZLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxRQUFRO1lBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ25CLENBQUM7O0lBbkhNLGdCQUFZLEdBQWlCO1FBQ2xDLElBQUksRUFBRSxFQUFFO1FBQ1IsS0FBSyxFQUFFLEdBQUc7S0FDWCxDQUFDO0lBaUhKLFVBQUM7S0FBQTtTQXJIWSxHQUFHIiwic291cmNlc0NvbnRlbnQiOlsiLy8gc2VlOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuY29uc3QgcmVnZXhVcmkgPSAvXigoW2Etel1bYS16MC05Ky4tXSopOik/KFxcL1xcLygoWyEkJlxcXFwnKCkqLDs9YS16MC05Ll9+LV18JVswLTlhLWZdWzAtOWEtZl0pKikoXFw6KFswLTldKykpPyk/KChbXFwvISQmXFxcXCcoKSosOz06QGEtejAtOS5ffi1dfCVbMC05YS1mXVswLTlhLWZdKSopKFxcPyhbISQmXFxcXCcoKSosOz06QGEtejAtOS5fflxcLz8tXXwlWzAtOWEtZl1bMC05YS1mXSkqKT8oXFwjLiopPyQvaTtcblxuaW50ZXJmYWNlIFN0cmluZ01hcCB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZ3xudWxsfHVuZGVmaW5lZDtcbn1cblxuaW50ZXJmYWNlIERlZmF1bHRQb3J0cyB7XG4gIFtrZXk6IHN0cmluZ106IG51bWJlcnx1bmRlZmluZWQ7XG59XG5cbmNvbnN0IHBhcnNlUXVlcnkgPSAocGFyYW1zOiBTdHJpbmdNYXAsIHJhdzogc3RyaW5nKSA9PiB7XG4gIHJhd1xuICAgICAgLnNwbGl0KCcmJylcbiAgICAgIC5mb3JFYWNoKChvbmUpID0+IHtcbiAgICAgICAgICBpZiAob25lKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGkgPSBvbmUuaW5kZXhPZignPScpO1xuICAgICAgICAgICAgICBpZiAoLTEgPT09IGkpIHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtc1tvbmVdID0gbnVsbDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtc1tvbmUuc3Vic3RyaW5nKDAsIGkpXSA9IGRlY29kZVVSSUNvbXBvbmVudChvbmUuc3Vic3RyaW5nKGkgKyAxKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9KTtcbn07XG5jb25zdCBwYXJzZSA9ICh1cmk6IFVyaSwgcmF3OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgbSA9IHJlZ2V4VXJpLmV4ZWMocmF3KTtcbiAgaWYgKG0pIHtcbiAgICAgIHVyaS5zY2hlbWUgPSBtWzJdO1xuICAgICAgdXJpLmhvc3QgPSBtWzRdO1xuICAgICAgdXJpLnBhdGggPSBtWzhdO1xuICAgICAgdXJpLnBvcnQgPSBwYXJzZUludChtWzddLCAxMCkgfHwgVXJpLmRlZmF1bHRQb3J0c1t1cmkuc2NoZW1lXSB8fCAwO1xuICAgICAgdXJpLnF1ZXJ5ID0gKG1bMTBdICYmIG1bMTBdLnN1YnN0cigxKSB8fCAnJyk7XG4gICAgICB1cmkuZnJhZ21lbnQgPSAobVsxMl0gJiYgbVsxMl0uc3Vic3RyKDEpIHx8ICcnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTaW1wbGUgYW5kIHN0cmFpZ2h0Zm9yd2FyZCBVcmkgd3JhcHBlci5cbiAqXG4gKiBAY2xhc3MgZG9wZS5VcmlcbiAqIEBwYXJhbSB7U3RyaW5nfSByYXcgLSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIFVyaS5cbiAqL1xuZXhwb3J0IGNsYXNzIFVyaSB7XG4gIHN0YXRpYyBkZWZhdWx0UG9ydHM6IERlZmF1bHRQb3J0cyA9IHtcbiAgICBodHRwOiA4MCxcbiAgICBodHRwczogNDQzXG4gIH07XG4gIHByaXZhdGUgX3F1ZXJ5UGFyYW1zOiBTdHJpbmdNYXAgPSB7fTtcbiAgLyoqIEdldHMgb3Igc2V0cyBzY2hlbWUgb2YgdGhlIFVyaS4gKi9cbiAgc2NoZW1lPzogc3RyaW5nO1xuICAvKiogR2V0cyBvciBzZXRzIGhvc3RuYW1lIG9mIHRoZSBVcmkuICovXG4gIGhvc3Q/OiBzdHJpbmc7XG4gIC8qKiBHZXRzIG9yIHNldHMgcGF0aCBjb21wb25lbnQgb2YgdGhlIFVyaS4gKi9cbiAgcGF0aCE6IHN0cmluZztcbiAgLyoqIEdldHMgb3Igc2V0cyBwb3J0IG9mIHRoZSBVcmkuICovXG4gIHBvcnQ/OiBudW1iZXI7XG4gIC8qKiBHZXRzIG9yIHNldHMgZnJhZ21lbnQgb2YgdGhlIFVyaS4gKi9cbiAgZnJhZ21lbnQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBHZXRzIG9yIHNldHMgcXVlcnkgY29tcG9uZW50IG9mIHRoZSBVcmkgYXMgb2JqZWN0LiBBbGxvd3MgYWNjZXNzaW5nIGFuZFxuICAgKiBtYW5pcHVsYXRpbmcgaW5kaXZpZHVhbCBhcmd1bWVudHMgd2l0aGluIHF1ZXJ5IGNvbXBvbmVudC5cbiAgICovXG4gIGdldCBxdWVyeVBhcmFtcygpIHtcbiAgICAgcmV0dXJuIHRoaXMuX3F1ZXJ5UGFyYW1zO1xuICB9XG4gIHNldCBxdWVyeVBhcmFtcyh2YWx1ZTogU3RyaW5nTWFwKSB7XG4gICAgdGhpcy5fcXVlcnlQYXJhbXMgPSB2YWx1ZSB8fCB7fTtcbiAgfVxuICAvKipcbiAgICogQ3JlYXRlcyB7QGxpbmsgVXJpfSBmb3JtIGFuIGFyZ3VtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xVcml9IHVyaSAtIFNvdXJjZSB1cmkuXG4gICAqL1xuICBzdGF0aWMgZnJvbSh1cmk6IHN0cmluZ3xVcmkpIHtcbiAgICBpZiAodXJpIGluc3RhbmNlb2YgVXJpKSB7XG4gICAgICByZXR1cm4gdXJpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFVyaSh1cmkpO1xuICB9XG4gIGNvbnN0cnVjdG9yKHJhdzogc3RyaW5nKSB7XG4gICAgICBwYXJzZSh0aGlzLCByYXcpO1xuICB9XG4gIC8qKlxuICAgKiBJcyBfdHJ1ZV8gaWYgdGhlIHdyYXBwZXIgVXJpIGlzIHJlbGF0aXZlLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgaXNSZWxhdGl2ZSgpIHtcbiAgICAgIHJldHVybiAhdGhpcy5zY2hlbWU7XG4gIH1cbiAgLyoqXG4gICAqIElzIF90cnVlXyBpZiB0aGUgd3JhcHBlciBVcmkgaXMgYWJzb2x1dGUuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBpc0Fic29sdXRlKCkge1xuICAgICAgcmV0dXJuICEhdGhpcy5zY2hlbWU7XG4gIH1cbiAgLyoqXG4gICAqIEdldHMgb3Igc2V0cyBhdXRob3JpdHkgb2YgdGhlIFVyaSAoaS5lLiBob3N0bmFtZSBhbmQgcG9ydCBpZiBub24gc3RhbmRhcmQpLlxuICAgKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgZ2V0IGF1dGhvcml0eSgpIHtcbiAgICBpZiAodGhpcy5wb3J0ICYmIHRoaXMuc2NoZW1lICYmIHRoaXMucG9ydCAhPT0gVXJpLmRlZmF1bHRQb3J0c1t0aGlzLnNjaGVtZV0pIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmhvc3R9OiR7dGhpcy5wb3J0fWA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhvc3QgfHwgJyc7XG4gIH1cbiAgc2V0IGF1dGhvcml0eShhdXRob3JpdHk6IHN0cmluZykge1xuICAgIGNvbnN0IGkgPSBhdXRob3JpdHkuaW5kZXhPZignOicpO1xuICAgIGlmICgtMSA9PT0gaSkge1xuICAgICAgdGhpcy5ob3N0ID0gYXV0aG9yaXR5O1xuICAgICAgdGhpcy5wb3J0ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ob3N0ID0gYXV0aG9yaXR5LnN1YnN0cigwLCBpKTtcbiAgICAgIHRoaXMucG9ydCA9IHBhcnNlSW50KGF1dGhvcml0eS5zdWJzdHIoaSArIDEpLCAxMCkgfHwgMDtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEdldHMgb3Igc2V0cyB0aGUgd3JhcHBlZCBVcmkuXG4gICAqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgaHJlZigpIHtcbiAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcnk7XG4gICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeSA/IGA/JHtxdWVyeX1gIDogJyc7XG4gICAgY29uc3QgZnJhZ21lbnQgPSB0aGlzLmZyYWdtZW50ID8gYCMke3RoaXMuZnJhZ21lbnR9YCA6ICcnO1xuICAgIGNvbnN0IGF1dGhvcml0eSA9IHRoaXMuYXV0aG9yaXR5ID8gYC8vJHt0aGlzLmF1dGhvcml0eX1gIDogJyc7XG4gICAgY29uc3Qgc2NoZW1lID0gdGhpcy5zY2hlbWUgPyBgJHt0aGlzLnNjaGVtZX06YCA6ICcnO1xuICAgIHJldHVybiBgJHtzY2hlbWV9JHthdXRob3JpdHl9JHt0aGlzLnBhdGh9JHtxdWVyeVN0cmluZ30ke2ZyYWdtZW50fWA7XG4gIH1cbiAgc2V0IGhyZWYoaHJlZikge1xuICAgIHBhcnNlKHRoaXMsIGhyZWYpO1xuICB9XG4gIC8qKlxuICAgKiBHZXRzIG9yIHNldHMgcXVlcnkgY29tcG9uZW50IG9mIHRoZSBVcmkuIFRvIGFjY2VzcyBvciBtYW5pcHVsYXRlIGluZGl2aWR1YWwgcXVlcnkgYXJndW1lbnRzIHVzZVxuICAgKiB7QGxpbmsgZG9wZS5VcmkjcXVlcnlQYXJhbXN9LlxuICAgKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgZ2V0IHF1ZXJ5KCkge1xuICAgICAgY29uc3QgcXVlcnlQYXJhbXMgPSB0aGlzLl9xdWVyeVBhcmFtcyB8fCB7fTtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhxdWVyeVBhcmFtcylcbiAgICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgY29uc3QgdmFsID0gcXVlcnlQYXJhbXNba2V5XTtcbiAgICAgICAgICByZXR1cm4gdmFsID8gYCR7ZW5jb2RlVVJJQ29tcG9uZW50KGtleSl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHZhbCl9YCA6IGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT1gO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignJicpO1xuICB9XG4gIHNldCBxdWVyeShxdWVyeSkge1xuICAgIHRoaXMuX3F1ZXJ5UGFyYW1zID0ge307XG4gICAgcGFyc2VRdWVyeSh0aGlzLl9xdWVyeVBhcmFtcywgcXVlcnkpO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLmhyZWY7XG4gIH1cbn1cbiJdfQ==