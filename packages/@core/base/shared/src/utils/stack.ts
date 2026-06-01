/**
 * Stack data structure
 */
export class Stack<T> {
  /**
   * The number of elements in the stack
   */
  get size() {
    return this.items.length;
  }

  /**
   * Whether to deduplicate
   */
  private readonly dedup: boolean;
  /**
   * The elements in the stack
   */
  private items: Array<T> = [];

  /**
   * The maximum capacity of the stack
   */
  private readonly maxSize?: number;

  constructor(dedup = true, maxSize?: number) {
    this.maxSize = maxSize;
    this.dedup = dedup;
  }

  /**
   * Clear the elements in the stack
   */
  clear() {
    this.items.length = 0;
  }

  /**
   * View the top element of the stack
   * @returns The top element of the stack
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Pop the top element of the stack
   * @returns The top element of the stack
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Push elements into the stack
   * @param items The elements to push into the stack
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
   * Remove elements from the stack
   * @param itemList The elements to remove from the stack
   */
  remove(...itemList: Array<T>) {
    this.items = this.items.filter((i) => !itemList.includes(i));
  }

  /**
   * Keep the elements in the stack
   * @param itemList The elements to keep in the stack
   */
  retain(itemList: Array<T>) {
    this.items = this.items.filter((i) => itemList.includes(i));
  }

  /**
   * Convert the stack to an array
   * @returns The elements in the stack
   */
  toArray(): Array<T> {
    return [...this.items];
  }
}

/**
 * Create a stack instance
 * @param dedup Whether to deduplicate
 * @param maxSize The maximum capacity of the stack
 * @returns The stack instance
 */
export function createStack<T>(dedup = true, maxSize?: number) {
  return new Stack<T>(dedup, maxSize);
}
