export class CancelledError extends Error {
  constructor() { super('operation has been cancelled'); }
}

// const debounce = (callback: () => void) => {
//   let fired = false;
//   return () => {
//     if (!fired) {
//       fired = true;
//       callback();
//     }
//   };
// };

export interface CancellationSubscription {
  remove(): void;
  invoke(): void;
}

export abstract class Cancellation {
  static none: Cancellation = {
    cancelled: false,
    subscribe(callback: () => void) {
      return {
        invoke: callback,
        remove() { return; }
      };
    },
    throwIfCancelled() { return; }
  };
  abstract cancelled: boolean;
  abstract subscribe(callback: () => void): CancellationSubscription;
  throwIfCancelled() {
    if (this.cancelled) {
      throw new CancelledError();
    }
  }
}

export class CancellationSource extends Cancellation {
  static link(cancellation1: Cancellation, cancellation2: Cancellation): Cancellation {
    const cancellation = new CancellationSource();
    let subscription1: CancellationSubscription;
    let subscription2: CancellationSubscription;
    subscription1 = cancellation1.subscribe(() => {
      subscription2.remove();
      cancellation.cancel();
    });
    subscription2 = cancellation1.subscribe(() => {
      subscription1.remove();
      cancellation.cancel();
    });
    return cancellation;
  }
  readonly callbacks = new Array<() => void>();
  cancelled = false;
  get cancellation(): Cancellation { return this; }
  cancel() {
    this.cancelled = true;
    for (const callback of this.callbacks) {
      try {
        callback();
      } catch (e) {
        console.warn(e);
      }
    }
    this.callbacks.splice(0, this.callbacks.length);
  }
  subscribe(callback: () => void) {
    if (this.callbacks.some((x) => x === callback)) {
      throw new Error('callback already registered');
    }
    this.callbacks.push(callback);
    return {
      invoke: callback,
      remove: () => {
        const index = this.callbacks.indexOf(callback);
        if (-1 !== index) {
          this.callbacks.splice(index, 1);
        }
      }
    };
  }
}
