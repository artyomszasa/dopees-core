export declare class CancelledError extends Error {
    constructor();
}
export interface CancellationSubscription {
    remove(): void;
    invoke(): void;
}
export declare abstract class Cancellation {
    static none: Cancellation;
    abstract cancelled: boolean;
    abstract subscribe(callback: () => void): CancellationSubscription;
    throwIfCancelled(): void;
}
export declare class CancellationSource extends Cancellation {
    static link(cancellation1: Cancellation, cancellation2: Cancellation): Cancellation;
    readonly callbacks: (() => void)[];
    cancelled: boolean;
    get cancellation(): Cancellation;
    cancel(): void;
    subscribe(callback: () => void): {
        invoke: () => void;
        remove: () => void;
    };
}
