// see: https://tools.ietf.org/html/rfc3986
const regexUri = /^(([a-z][a-z0-9+.-]*):)?(\/\/(([!$&\\'()*,;=a-z0-9._~-]|%[0-9a-f][0-9a-f])*)(\:([0-9]+))?)?(([\/!$&\\'()*,;=:@a-z0-9._~-]|%[0-9a-f][0-9a-f])*)(\?([!$&\\'()*,;=:@a-z0-9._~\/?-]|%[0-9a-f][0-9a-f])*)?(\#.*)?$/i;

interface StringMap {
  [key: string]: string|null|undefined;
}

interface DefaultPorts {
  [key: string]: number|undefined;
}


const parseQuery = (params: StringMap, raw: string) => {
  raw
      .split('&')
      .forEach(one => {
          if (one) {
              const i = one.indexOf('=');
              if (-1 === i) {
                  params[one] = null;
              } else {
                  params[one.substring(0, i)] = decodeURIComponent(one.substring(i + 1));
              }
          }
      });
};
const parse = (uri: Uri, raw: string) => {
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
  static defaultPorts: DefaultPorts = {
    'http': 80,
    'https': 443
  };
  private _queryParams: StringMap = {};
  /** Gets or sets scheme of the Uri. */
  scheme?: string;
  /** Gets or sets hostname of the Uri. */
  host?: string;
  /** Gets or sets path component of the Uri. */
  path!: string;
  /** Gets or sets port of the Uri. */
  port?: number;
  /** Gets or sets fragment of the Uri. */
  fragment?: string;
  /** Gets or sets query component of the Uri as object. Allows accessing and
   * manipulating individual arguments within query component. */
  get queryParams() {
     return this._queryParams;
  }
  set queryParams(value: StringMap) {
    this._queryParams = value || {};
  }
  /**
   * Creates {@link Uri} form an argument.
   *
   * @param {string|Uri} uri - Source uri.
   */
  static from(uri: string|Uri) {
    if (uri instanceof Uri) {
      return uri;
    }
    return new Uri(uri);
  }
  constructor(raw: string) {
      parse(this, raw);
  }
  /**
   * Is _true_ if the wrapper Uri is relative.
   *
   * @type {Boolean}
   * @readonly
   */
  get isRelative () {
      return !this.scheme;
  }
  /**
   * Is _true_ if the wrapper Uri is absolute.
   *
   * @type {Boolean}
   * @readonly
   */
  get isAbsolute () {
      return !!this.scheme;
  }
  /**
   * Gets or sets authority of the Uri (i.e. hostname and port if non standard).
   *
   * @type {String}
   */
  get authority () {
      if (this.port && this.scheme && this.port !== Uri.defaultPorts[this.scheme]) {
          return `${this.host}:${this.port}`;
      }
      return this.host || '';
  }
  set authority(authority: string) {
      const i = authority.indexOf(':');
      if (-1 === i) {
          this.host = authority;
          this.port = 0;
      } else {
          this.host = authority.substr(0, i);
          this.port = parseInt(authority.substr(i + 1), 10) || 0;
      }
  }
  /**
   * Gets or sets the wrapped Uri.
   *
   * @type {String}
   */
  get href () {
      const query = this.query;
      const queryString = query ? `?${query}` : '';
      const fragment = this.fragment ? `#${this.fragment}` : '';
      const authority = this.authority ? `//${this.authority}` : '';
      const scheme = this.scheme ? `${this.scheme}:` : '';
      return `${scheme}${authority}${this.path}${queryString}${fragment}`;
  }
  set href (href) {
      parse(this, href);
  }
  /**
   * Gets or sets query component of the Uri. To access or manipulate individual query arguments use
   * {@link dope.Uri#queryParams}.
   *
   * @type {String}
   */
  get query () {
      const queryParams = this._queryParams || {};
      return Object.keys(queryParams)
          .map(key => {
            const val = queryParams[key];
            return val ? `${encodeURIComponent(key)}=${encodeURIComponent(val)}` : `${encodeURIComponent(key)}=`;
          })
          .join('&');
  }
  set query (query) {
      this._queryParams = {};
      parseQuery(this._queryParams, query);
  }
  toString () {
      return this.href;
  }
};