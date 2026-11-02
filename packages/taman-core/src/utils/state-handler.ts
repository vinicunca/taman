export class StateHandler {
  private condition: boolean = false;
  private waiters = new Set<{ resolve: () => void; reject: (reason: Error) => void }>();

  isConditionTrue(): boolean {
    return this.condition;
  }

  reset() {
    this.condition = false;
    this.settleWaiters(new Error('Condition was reset'));
  }

  /** Reject when the condition is set to false */
  setConditionFalse() {
    this.condition = false;
    this.settleWaiters(new Error('Condition was set to false'));
  }

  /** Resolve when the condition is set to true */
  setConditionTrue() {
    this.condition = true;
    this.settleWaiters();
  }

  /** Return a Promise that waits until condition becomes true */
  waitForCondition(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.condition) {
        resolve(); // Resolve immediately if condition is already true
      } else {
        this.waiters.add({ resolve, reject });
      }
    });
  }

  private settleWaiters(error?: Error) {
    const waiters = this.waiters;
    this.waiters = new Set();
    for (const waiter of waiters) {
      if (error) {
        waiter.reject(error);
      } else {
        waiter.resolve();
      }
    }
  }
}
