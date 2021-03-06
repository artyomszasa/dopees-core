export class CancelledError extends Error {
    constructor() { super('operation has been cancelled'); }
}
let Cancellation = /** @class */ (() => {
    class Cancellation {
        throwIfCancelled() {
            if (this.cancelled) {
                throw new CancelledError();
            }
        }
    }
    Cancellation.none = {
        cancelled: false,
        subscribe(callback) {
            return {
                invoke: callback,
                remove() { return; }
            };
        },
        throwIfCancelled() { return; }
    };
    return Cancellation;
})();
export { Cancellation };
export class CancellationSource extends Cancellation {
    constructor() {
        super(...arguments);
        this.callbacks = new Array();
        this.cancelled = false;
    }
    static link(cancellation1, cancellation2) {
        const cancellation = new CancellationSource();
        let subscription1;
        let subscription2;
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
    get cancellation() { return this; }
    cancel() {
        this.cancelled = true;
        for (const callback of this.callbacks) {
            try {
                callback();
            }
            catch (e) {
                console.warn(e);
            }
        }
        this.callbacks.splice(0, this.callbacks.length);
    }
    subscribe(callback) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuY2VsbGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NhbmNlbGxhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sY0FBZSxTQUFRLEtBQUs7SUFDdkMsZ0JBQWdCLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6RDtBQWlCRDtJQUFBLE1BQXNCLFlBQVk7UUFhaEMsZ0JBQWdCO1lBQ2QsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixNQUFNLElBQUksY0FBYyxFQUFFLENBQUM7YUFDNUI7UUFDSCxDQUFDOztJQWhCTSxpQkFBSSxHQUFpQjtRQUMxQixTQUFTLEVBQUUsS0FBSztRQUNoQixTQUFTLENBQUMsUUFBb0I7WUFDNUIsT0FBTztnQkFDTCxNQUFNLEVBQUUsUUFBUTtnQkFDaEIsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDO2FBQ3JCLENBQUM7UUFDSixDQUFDO1FBQ0QsZ0JBQWdCLEtBQUssT0FBTyxDQUFDLENBQUM7S0FDL0IsQ0FBQztJQVFKLG1CQUFDO0tBQUE7U0FsQnFCLFlBQVk7QUFvQmxDLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxZQUFZO0lBQXBEOztRQWVXLGNBQVMsR0FBRyxJQUFJLEtBQUssRUFBYyxDQUFDO1FBQzdDLGNBQVMsR0FBRyxLQUFLLENBQUM7SUE0QnBCLENBQUM7SUEzQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUEyQixFQUFFLGFBQTJCO1FBQ2xFLE1BQU0sWUFBWSxHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztRQUM5QyxJQUFJLGFBQXVDLENBQUM7UUFDNUMsSUFBSSxhQUF1QyxDQUFDO1FBQzVDLGFBQWEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUMzQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQzNDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2QixZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBR0QsSUFBSSxZQUFZLEtBQW1CLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRCxNQUFNO1FBQ0osSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ3JDLElBQUk7Z0JBQ0YsUUFBUSxFQUFFLENBQUM7YUFDWjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakI7U0FDRjtRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFDRCxTQUFTLENBQUMsUUFBb0I7UUFDNUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxFQUFFO1lBQzlDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztTQUNoRDtRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLE9BQU87WUFDTCxNQUFNLEVBQUUsUUFBUTtZQUNoQixNQUFNLEVBQUUsR0FBRyxFQUFFO2dCQUNYLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRTtvQkFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNqQztZQUNILENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIENhbmNlbGxlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoJ29wZXJhdGlvbiBoYXMgYmVlbiBjYW5jZWxsZWQnKTsgfVxufVxuXG4vLyBjb25zdCBkZWJvdW5jZSA9IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4ge1xuLy8gICBsZXQgZmlyZWQgPSBmYWxzZTtcbi8vICAgcmV0dXJuICgpID0+IHtcbi8vICAgICBpZiAoIWZpcmVkKSB7XG4vLyAgICAgICBmaXJlZCA9IHRydWU7XG4vLyAgICAgICBjYWxsYmFjaygpO1xuLy8gICAgIH1cbi8vICAgfTtcbi8vIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGF0aW9uU3Vic2NyaXB0aW9uIHtcbiAgcmVtb3ZlKCk6IHZvaWQ7XG4gIGludm9rZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FuY2VsbGF0aW9uIHtcbiAgc3RhdGljIG5vbmU6IENhbmNlbGxhdGlvbiA9IHtcbiAgICBjYW5jZWxsZWQ6IGZhbHNlLFxuICAgIHN1YnNjcmliZShjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaW52b2tlOiBjYWxsYmFjayxcbiAgICAgICAgcmVtb3ZlKCkgeyByZXR1cm47IH1cbiAgICAgIH07XG4gICAgfSxcbiAgICB0aHJvd0lmQ2FuY2VsbGVkKCkgeyByZXR1cm47IH1cbiAgfTtcbiAgYWJzdHJhY3QgY2FuY2VsbGVkOiBib29sZWFuO1xuICBhYnN0cmFjdCBzdWJzY3JpYmUoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBDYW5jZWxsYXRpb25TdWJzY3JpcHRpb247XG4gIHRocm93SWZDYW5jZWxsZWQoKSB7XG4gICAgaWYgKHRoaXMuY2FuY2VsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgQ2FuY2VsbGVkRXJyb3IoKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENhbmNlbGxhdGlvblNvdXJjZSBleHRlbmRzIENhbmNlbGxhdGlvbiB7XG4gIHN0YXRpYyBsaW5rKGNhbmNlbGxhdGlvbjE6IENhbmNlbGxhdGlvbiwgY2FuY2VsbGF0aW9uMjogQ2FuY2VsbGF0aW9uKTogQ2FuY2VsbGF0aW9uIHtcbiAgICBjb25zdCBjYW5jZWxsYXRpb24gPSBuZXcgQ2FuY2VsbGF0aW9uU291cmNlKCk7XG4gICAgbGV0IHN1YnNjcmlwdGlvbjE6IENhbmNlbGxhdGlvblN1YnNjcmlwdGlvbjtcbiAgICBsZXQgc3Vic2NyaXB0aW9uMjogQ2FuY2VsbGF0aW9uU3Vic2NyaXB0aW9uO1xuICAgIHN1YnNjcmlwdGlvbjEgPSBjYW5jZWxsYXRpb24xLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBzdWJzY3JpcHRpb24yLnJlbW92ZSgpO1xuICAgICAgY2FuY2VsbGF0aW9uLmNhbmNlbCgpO1xuICAgIH0pO1xuICAgIHN1YnNjcmlwdGlvbjIgPSBjYW5jZWxsYXRpb24xLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBzdWJzY3JpcHRpb24xLnJlbW92ZSgpO1xuICAgICAgY2FuY2VsbGF0aW9uLmNhbmNlbCgpO1xuICAgIH0pO1xuICAgIHJldHVybiBjYW5jZWxsYXRpb247XG4gIH1cbiAgcmVhZG9ubHkgY2FsbGJhY2tzID0gbmV3IEFycmF5PCgpID0+IHZvaWQ+KCk7XG4gIGNhbmNlbGxlZCA9IGZhbHNlO1xuICBnZXQgY2FuY2VsbGF0aW9uKCk6IENhbmNlbGxhdGlvbiB7IHJldHVybiB0aGlzOyB9XG4gIGNhbmNlbCgpIHtcbiAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiB0aGlzLmNhbGxiYWNrcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGUpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoMCwgdGhpcy5jYWxsYmFja3MubGVuZ3RoKTtcbiAgfVxuICBzdWJzY3JpYmUoY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICBpZiAodGhpcy5jYWxsYmFja3Muc29tZSgoeCkgPT4geCA9PT0gY2FsbGJhY2spKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxiYWNrIGFscmVhZHkgcmVnaXN0ZXJlZCcpO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4ge1xuICAgICAgaW52b2tlOiBjYWxsYmFjayxcbiAgICAgIHJlbW92ZTogKCkgPT4ge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICBpZiAoLTEgIT09IGluZGV4KSB7XG4gICAgICAgICAgdGhpcy5jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cbiJdfQ==