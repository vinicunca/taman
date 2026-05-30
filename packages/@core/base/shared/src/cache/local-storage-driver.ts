import type { IStorageDriver } from './types';

type StorageType = 'localStorage' | 'sessionStorage';

interface LocalStorageDriverOptions {
  /** Use localStorage or sessionStorage */
  storageType?: StorageType;
}

/**
 * LocalStorage / SessionStorage driver
 * Use async to wrap synchronous API, keep the interface consistent
 */
class LocalStorageDriver implements IStorageDriver {
  private storage: Storage;

  constructor({
    storageType = 'localStorage',
  }: LocalStorageDriverOptions = {}) {
    if (typeof window === 'undefined') {
      throw new TypeError(
        'LocalStorageDriver is not available in non-browser environments. Use MemoryStorageDriver instead.',
      );
    }
    this.storage
      = storageType === 'localStorage'
        ? window.localStorage
        : window.sessionStorage;
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getItem<T>(key: string): Promise<null | T> {
    const raw = this.storage.getItem(key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Data is corrupted, clear and return null
      this.storage.removeItem(key);
      return null;
    }
  }

  async keys(): Promise<Array<string>> {
    const result: Array<string> = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key !== null) {
        result.push(key);
      }
    }
    return result;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  async setItem(key: string, value: unknown): Promise<void> {
    this.storage.setItem(key, JSON.stringify(value));
  }
}

export { LocalStorageDriver };
export type { LocalStorageDriverOptions };
