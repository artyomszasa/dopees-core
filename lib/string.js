const toSolidByte = (_, num) => {
    const n = parseInt(num, 16);
    return String.fromCharCode(n);
};
const regexNum = /%([0-9A-F]{2})/g;
export function toBase64String(input) {
    const fixed = encodeURIComponent(input).replace(regexNum, toSolidByte);
    return window.btoa(fixed);
}
export function fromBase64String(encoded) {
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
const fun = {
    b(arg) {
        return arg ? 'true' : 'false';
    },
    d(arg) {
        const x = parseInt(arg, 10);
        const sign = (x < 0) ? '-' : (this.sign && !isNaN(x) ? '+' : '');
        return `${sign}${Math.abs(x)}`;
    },
    f(arg) {
        const x = parseFloat(arg);
        const sign = (x < 0) ? '-' : (this.sign && !isNaN(x) ? '+' : '');
        return (this.precision) ? `${sign}${Math.abs(x).toFixed(this.precision)}` : `${sign}${Math.abs(x)}`;
    },
    s(arg) { return arg; }
};
// aliases
Object.assign(fun, {
    i: fun.d
});
// cached fun
const sprintf = Object.assign(function (format, ...args) {
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
    format: (items, args) => {
        return items.map(function (item) {
            var s, i, pad, arg;
            if ('string' === typeof item) {
                s = item;
            }
            else {
                arg = args.shift();
                s = (item.fun || (() => '')).call(item, arg);
                if (item.width) {
                    i = item.width - s.length;
                    if (i > 0) {
                        pad = (item.pad || ' ').repeat(i);
                        if (item.left) {
                            s = s + pad;
                        }
                        else {
                            s = pad + s;
                        }
                    }
                }
            }
            return s;
        }).join('');
    },
    parse: function (fmt) {
        const result = [];
        let rest = fmt;
        while (0 !== rest.length) {
            let m = r.text.exec(rest);
            if (m) {
                result.push(m[0]);
            }
            else {
                m = r.percent.exec(rest);
                if (m) {
                    result.push('%');
                }
                else {
                    m = r.arg.exec(rest);
                    if (m) {
                        const o = Object.create(null);
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
                            }
                            else {
                                o.pad = ' ';
                            }
                        }
                        if (prec) {
                            o.precision = parseInt(prec.substr(1), 10);
                        }
                        result.push(o);
                    }
                    else {
                        throw new Error('[sprintf] could not parse: ' + rest);
                    }
                }
            }
            rest = rest.substring(m[0].length);
        } // while
        return result;
    }
});
export { sprintf };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQVMsRUFBRSxHQUFXLEVBQUUsRUFBRTtJQUM3QyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUE7QUFFRCxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQztBQUVuQyxNQUFNLFVBQVUsY0FBYyxDQUFDLEtBQWE7SUFDMUMsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2RSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxPQUFlO0lBQzlDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQy9CLEtBQUssQ0FBQyxFQUFFLENBQUM7U0FDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDWixPQUFPLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFFRCxNQUFNLENBQUMsR0FBRztJQUNSLElBQUksRUFBRSxhQUFhO0lBQ25CLE9BQU8sRUFBRSxZQUFZO0lBQ3JCLEdBQUcsRUFBRSwwREFBMEQ7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