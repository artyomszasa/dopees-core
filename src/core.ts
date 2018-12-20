
const logEvent = 'dope-log';

export interface LogMessageData {
  message: any,
  severity: 'log'|'warn'|'error'
}

export function pushMsg(msg: any, severity: 'log'|'warn'|'error') {
  const ev = document.createEvent('CustomEvent');
  ev.initCustomEvent(logEvent, false, false, {
      message: msg,
      severity: severity || 'log'
  });
  window.dispatchEvent(ev);
}

export function pushErr(msg: any) { pushMsg(msg, 'error'); }

const callbacks: Map<Function, Function> = new Map();

export function offMessage(callback: (message: LogMessageData) => void) {
  const cb = callbacks.get(callback);
  if (cb) {
    callbacks.delete(callback);
    window.removeEventListener(logEvent, <any>cb, false);
  }
}

export function onMessage(callback: (message: LogMessageData) => void) {
  const cb = (e: CustomEvent<LogMessageData>) => callback(e.detail);
  callbacks.set(callback, cb);
  window.addEventListener(logEvent, <any>cb, false);
  return {
    remove: () => offMessage(callback)
  };
}


onMessage(data => {
  if (window.console) {
    const severity = data.severity;
    const log = window.console[severity] || window.console.log || (() => {});
    log.call(window.console, data.message);
  }
})