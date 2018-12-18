export interface Disposable {
    dispose(): void;
}
export declare function using<T extends Disposable, R>(disposable: T, action: (arg: T) => R): R;
export declare function asyncUsing<T extends Disposable, R>(disposable: T, action: (arg: T) => Promise<R>): Promise<R>;
