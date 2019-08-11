interface StringMap {
    [key: string]: string | null | undefined;
}
interface DefaultPorts {
    [key: string]: number | undefined;
}
/**
 * Simple and straightforward Uri wrapper.
 *
 * @class dope.Uri
 * @param {String} raw - string representation of the Uri.
 */
export declare class Uri {
    static defaultPorts: DefaultPorts;
    private _queryParams;
    /** Gets or sets scheme of the Uri. */
    scheme?: string;
    /** Gets or sets hostname of the Uri. */
    host?: string;
    /** Gets or sets path component of the Uri. */
    path: string;
    /** Gets or sets port of the Uri. */
    port?: number;
    /** Gets or sets fragment of the Uri. */
    fragment?: string;
    /**
     * Gets or sets query component of the Uri as object. Allows accessing and
     * manipulating individual arguments within query component.
     */
    queryParams: StringMap;
    /**
     * Creates {@link Uri} form an argument.
     *
     * @param {string|Uri} uri - Source uri.
     */
    static from(uri: string | Uri): Uri;
    constructor(raw: string);
    /**
     * Is _true_ if the wrapper Uri is relative.
     *
     * @type {Boolean}
     * @readonly
     */
    readonly isRelative: boolean;
    /**
     * Is _true_ if the wrapper Uri is absolute.
     *
     * @type {Boolean}
     * @readonly
     */
    readonly isAbsolute: boolean;
    /**
     * Gets or sets authority of the Uri (i.e. hostname and port if non standard).
     *
     * @type {String}
     */
    authority: string;
    /**
     * Gets or sets the wrapped Uri.
     *
     * @type {String}
     */
    href: string;
    /**
     * Gets or sets query component of the Uri. To access or manipulate individual query arguments use
     * {@link dope.Uri#queryParams}.
     *
     * @type {String}
     */
    query: string;
    toString(): string;
}
export {};
