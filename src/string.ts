const toSolidByte = (_: string, num: string) => {
  const n = parseInt(num, 16);
  return String.fromCharCode(n);
}

const regexNum = /%([0-9A-F]{2})/g;

export function toBase64String(input: string) {
  const fixed = encodeURIComponent(input).replace(regexNum, toSolidByte);
  return window.btoa(fixed);
}

export function fromBase64String(encoded: string) {
  const fixed = window.atob(encoded)
    .split('')
    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    .join('');
  return decodeURIComponent(fixed);
}

const r = {
  text: /^[^\u0025]+/,
  percent: /^\u0025{2}/,
  arg: /^\u0025([+0\u0020\u002d]*)([0-9]*)(\.[0-9]+)?(b|d|i|f|s)/
};

interface SegmentFormat {
  sign?: boolean;
  precision?: number;
  fun?: (arg: any) => string;
  width?: number;
  pad?: string;
  left?: boolean;
}

interface FunctionMap {
  [key: string]: ((arg: any) => string)|undefined;
}

const fun: FunctionMap = {
  b(arg: any) {
    return arg ? 'true' : 'false';
  },
  d(arg: any): string {
      const x = parseInt(arg, 10);
      const sign = (x < 0) ? '-' : ((<SegmentFormat>this).sign && !isNaN(x) ? '+' : '');
      return `${sign}${Math.abs(x)}`;
  },
  f (arg: any): string {
      const x = parseFloat(arg);
      const sign = (x < 0) ? '-' : ((<SegmentFormat>this).sign && !isNaN(x) ? '+' : '');
      return ((<SegmentFormat>this).precision) ? `${sign}${Math.abs(x).toFixed((<SegmentFormat>this).precision)}` : `${sign}${Math.abs(x)}`;
  },
  s (arg: any): string { return arg; }
};
// aliases
Object.assign(fun, {
  i: fun.d
});

type Segment = string|SegmentFormat;

interface SegmentMap {
  [key: string]: Segment[]
}

interface Sprintf {
  (format: string, ...args: any[]): string;
  cache: SegmentMap;
  format: (items: Segment[], args: any[]) => string;
  parse: (formatString: string) => Segment[];
}

// cached fun
const sprintf: Sprintf = Object.assign(
  function (format: string, ...args: any[]): string {
    if (undefined === format) {
        throw new Error('[sprintf] format must be specified');
    }
    const cache = sprintf.cache;
    if (!(cache[format] && Object.prototype.hasOwnProperty.call(cache, format))) {
        cache[format] = sprintf.parse(format);
    }
    return sprintf.format(cache[format], args);
  }, {
    cache: Object.create(null),
    format: (items: Segment[], args: any[]): string => {
      return items.map(function (item) {
        var s,
            i,
            pad,
            arg;
        if ('string' === typeof item) {
            s = item;
        } else {
            arg = args.shift();
            s = (item.fun || (() => '')).call(item, arg);
            if (item.width) {
                i = item.width - s.length;
                if (i > 0) {
                    pad = (item.pad || ' ').repeat(i);
                    if (item.left) {
                        s = s + pad;
                    } else {
                        s = pad + s;
                    }
                }
            }
        }
        return s;
      }).join('');
    },
    parse: function (fmt: string) {
      const result: Segment[] = [];
      let rest = fmt;
      while (0 !== rest.length) {
          let m = r.text.exec(rest);
          if (m) {
              result.push(m[0]);
          } else {
              m = r.percent.exec(rest);
              if (m) {
                  result.push('%');
              } else {
                  m = r.arg.exec(rest);
                  if (m) {
                      const o: SegmentFormat = Object.create(null);
                      const flags = m[1];
                      const width = m[2];
                      const prec = m[3];
                      const ty = m[4];
                      const f = fun[ty];
                      if (!f) {
                          throw new Error('[sprintf] invalid type: ' + ty);
                      }
                      o.fun = f;
                      // flags feldolgozása
                      if (flags) {
                          if (-1 !== flags.indexOf('-')) {
                              o.left = true;
                          }
                          if (-1 !== flags.indexOf('+')) {
                              o.sign = true;
                          }
                      }
                      if (width) {
                          o.width = parseInt(width, 10);
                          if (-1 !== flags.indexOf('0')) {
                              o.pad = '0';
                          } else {
                              o.pad = ' ';
                          }
                      }
                      if (prec) {
                          o.precision = parseInt(prec.substr(1), 10);
                      }
                      result.push(o);
                  } else {
                      throw new Error('[sprintf] could not parse: ' + rest);
                  }
              }
          }
          rest = rest.substring(m[0].length);
      } // while
      return result;
    }
  }
);

export { sprintf }