/* eslint-disable ts/method-signature-style */
/**
 * Storage driver interface (core abstract strategy pattern)
 * All storage implementations (localStorage, IndexedDB, Memory, etc.) need to implement this interface
 * The driver layer only handles pure KV access, without knowing TTL and prefix
 */
interface IStorageDriver {
  /** Clear all storage items */
  clear(): Promise<void>;

  /** Get storage item */
  getItem<T>(key: string): Promise<null | T>;

  /** Get all keys */
  keys(): Promise<Array<string>>;

  /** Remove storage item */
  removeItem(key: string): Promise<void>;

  /** Set storage item */
  setItem(key: string, value: unknown): Promise<void>;
}

/**
 * Storage item wrapper structure with TTL
 * TTL logic is managed by StorageManager, the driver layer does not know
 */
interface StorageItem<T> {
  expiry?: number;
  value: T;
}

interface StorageManagerOptions {
  /** Storage driver instance */
  driver?: IStorageDriver;
  /** Key prefix, used for namespace isolation */
  prefix?: string;
}

export type { IStorageDriver, StorageItem, StorageManagerOptions };
