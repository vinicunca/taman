/**
 * Stack data structure
 */
export class Stack<T> {
  /**
   * Number of items in the stack
   */
  get size() {
    return this.items.length;
  }

  /**
   * Whether duplicate items are removed on push
   */
  private readonly dedup: boolean;
  /**
   * Items in the stack
   */
  private items: Array<T> = [];

  /**
   * Maximum stack capacity
   */
  private readonly maxSize?: number;

  constructor(dedup = true, maxSize?: number) {
    this.maxSize = maxSize;
    this.dedup = dedup;
  }

  /**
   * Clear all items in the stack
   */
  clear() {
    this.items.length = 0;
  }

  /**
   * View the top item without removing it
   * @returns Top item
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Pop the top item
   * @returns Top item
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Push items onto the stack
   * @param items Items to push
   */
  push(...items: Array<T>) {
    items.forEach((item) => {
      // Deduplicate
      if (this.dedup) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
          this.items.splice(index, 1);
        }
      }
      this.items.push(item);
      if (this.maxSize && this.items.length > this.maxSize) {
        this.items.splice(0, this.items.length - this.maxSize);
      }
    });
  }

  /**
   * Remove items from the stack
   * @param itemList Items to remove
   */
  remove(...itemList: Array<T>) {
    this.items = this.items.filter((i) => !itemList.includes(i));
  }

  /**
   * Keep only the specified items in the stack
   * @param itemList Items to retain
   */
  retain(itemList: Array<T>) {
    this.items = this.items.filter((i) => itemList.includes(i));
  }

  /**
   * Convert the stack to an array
   * @returns Array of stack items
   */
  toArray(): Array<T> {
    return [...this.items];
  }
}

/**
 * Create a stack instance
 * @param dedup Whether to deduplicate on push
 * @param maxSize Maximum stack capacity
 * @returns Stack instance
 */
export function createStack<T>(dedup = true, maxSize?: number) {
  return new Stack<T>(dedup, maxSize);
}
