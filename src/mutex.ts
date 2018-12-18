import { Disposable } from "./disposable";

export class Mutex implements Disposable {
  private readonly queue : Array<{ resolve: Function, reject: Function }> = [];
  private active = false;
  dispose () {
    for (let triggers = this.queue.shift(); triggers; triggers = this.queue.shift()) {
      triggers.reject('cancelled');
    }
  }
  lock () {
    return new Promise((resolve, reject) => {
      // this runs syncronously...
      if (this.active || this.queue.length) {
        this.queue.push({ resolve, reject });
      } else {
        this.active = true;
        resolve();
      }
    });
  }
  release () {
    // this runs syncronously...
    const triggers = this.queue.shift();
    if (triggers) {
      setTimeout(() => triggers.resolve(), 0);
    } else {
      this.active = false;
    }
  }
}