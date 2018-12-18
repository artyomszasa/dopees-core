// see: https://tools.ietf.org/html/rfc3986
const regexUri = /^(([a-z][a-z0-9+.-]*):)?(\/\/(([!$&\\'()*,;=a-z0-9._~-]|%[0-9a-f][0-9a-f])*)(\:([0-9]+))?)?(([\/!$&\\'()*,;=:@a-z0-9._~-]|%[0-9a-f][0-9a-f])*)(\?([!$&\\'()*,;=:@a-z0-9._~\/?-]|%[0-9a-f][0-9a-f])*)?(\#.*)?$/i;
const parseQuery = (params, raw) => {
    raw
        .split('&')
        .forEach(one => {
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
export class Uri {
    constructor(raw) {
        /** Gets or sets query component of the Uri as object. Allows accessing and
         * manipulating individual arguments within query component. */
        this.queryParams = {};
        parse(this, raw);
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
        const queryParams = this.queryParams || {};
        return Object.keys(queryParams)
            .map(key => {
            const val = queryParams[key];
            return val ? `${encodeURIComponent(key)}=${encodeURIComponent(val)}` : `${encodeURIComponent(key)}=`;
        })
            .join('&');
    }
    set query(query) {
        this.queryParams = {};
        parseQuery(this.queryParams, query);
    }
    toString() {
        return this.href;
    }
}
Uri.defaultPorts = {
    'http': 80,
    'https': 443
};
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3VyaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyQ0FBMkM7QUFDM0MsTUFBTSxRQUFRLEdBQUcsZ05BQWdOLENBQUM7QUFXbE8sTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFpQixFQUFFLEdBQVcsRUFBRSxFQUFFO0lBQ3BELEdBQUc7U0FDRSxLQUFLLENBQUMsR0FBRyxDQUFDO1NBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ1gsSUFBSSxHQUFHLEVBQUU7WUFDTCxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxRTtTQUNKO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUM7QUFDRixNQUFNLEtBQUssR0FBRyxDQUFDLEdBQVEsRUFBRSxHQUFXLEVBQUUsRUFBRTtJQUN0QyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLElBQUksQ0FBQyxFQUFFO1FBQ0gsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsR0FBRyxDQUFDLElBQUksR0FB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