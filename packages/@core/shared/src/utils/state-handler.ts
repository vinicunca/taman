export class StateHandler {
  private condition: boolean = false;
  private rejectCondition: ((reason?: Error) => void) | null = null;
  private resolveCondition: (() => void) | null = null;

  isConditionTrue(): boolean {
    return this.condition;
  }

  reset() {
    this.condition = false;
    this.clearPromises();
  }

  // Reject when the condition is set to false
  setConditionFalse() {
    this.condition = false;
    if (this.rejectCondition) {
      this.rejectCondition(new Error('Condition was set to false'));
      this.clearPromises();
    }
  }

  // Resolve when the condition is set to true
  setConditionTrue() {
    this.condition = true;
    if (this.resolveCondition) {
      this.resolveCondition();
      this.clearPromises();
    }
  }

  // Return a Promise that waits until condition becomes true
  waitForCondition(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.condition) {
        resolve(); // Resolve immediately if condition is already true
      } else {
        this.resolveCondition = resolve;
        this.rejectCondition = reject;
      }
    });
  }

  // Clear resolve/reject handlers
  private clearPromises() {
    this.resolveCondition = null;
    this.rejectCondition = null;
  }
}
