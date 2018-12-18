
const logEvent = 'dope-log';

interface LogMessageData {
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

window.addEventListener(logEvent, e => {
  const evt = <CustomEvent<LogMessageData>>e;
  if (window.console) {
      const data = evt.detail;
      const severity = data.severity;
      const log = window.console[severity] || window.console.log || (() => {});
      log.call(window.console, data.message);
  }
}, false);