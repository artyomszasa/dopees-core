export interface LogMessageData {
    message: any;
    severity: 'log' | 'warn' | 'error';
}
export declare function pushMsg(msg: any, severity?: 'log' | 'warn' | 'error'): void;
export declare function pushErr(msg: any): void;
export declare function offMessage(callback: (message: LogMessageData) => void): void;
export declare function onMessage(callback: (message: LogMessageData) => void): {
    remove: () => void;
};
