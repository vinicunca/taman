/**
 * Storage driver interface (core abstraction for the strategy pattern).
 * All storage implementations (localStorage, IndexedDB, Memory, etc.) must implement this interface.
 * The driver layer handles pure key-value access only and is unaware of TTL and prefixes.
 */
interface IStorageDriver {
  /** Clear all stored items */
  clear(): Promise<void>;

  /** Get a stored item */
  getItem<T>(key: string): Promise<null | T>;

  /** Get all keys */
  keys(): Promise<string[]>;

  /** Remove a stored item */
  removeItem(key: string): Promise<void>;

  /** Set a stored item */
  setItem(key: string, value: unknown): Promise<void>;
}

/**
 * Storage item wrapper with optional TTL.
 * TTL logic is managed by StorageManager; the driver layer is unaware of it.
 */
interface StorageItem<T> {
  expiry?: number;
  value: T;
}

interface StorageManagerOptions {
  /** Storage driver instance */
  driver?: IStorageDriver;
  /** Key prefix for namespace isolation */
  prefix?: string;
}

export type { IStorageDriver, StorageItem, StorageManagerOptions };
