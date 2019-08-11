import { Disposable } from './disposable';
export declare class Mutex implements Disposable {
    private readonly queue;
    private active;
    dispose(): void;
    lock(): Promise<{}>;
    release(): void;
}
