/* eslint-disable no-await-in-loop */
import type {
  IStorageDriver,
  StorageItem,
  StorageManagerOptions,
} from './types';

import { LocalStorageDriver } from './local-storage-driver';
import { MemoryStorageDriver } from './memory-storage-driver';

/**
 * Storage manager (strategy pattern).
 * - prefix (namespace isolation) is handled at this layer
 * - TTL (expiration) is handled at this layer
 * - drivers handle pure key-value access only
 */
class StorageManager {
  private driver: IStorageDriver;
  private prefix: string;

  constructor({ driver, prefix = '' }: StorageManagerOptions = {}) {
    this.driver = driver || this.createDefaultDriver();
    this.prefix = prefix;
    if (!this.prefix && this.driver instanceof LocalStorageDriver) {
      console.warn(
        '[StorageManager] empty prefix combined with LocalStorageDriver — clear()/keys() will affect every localStorage entry.',
      );
    }
  }

  /**
   * Clear all stored items with the current prefix.
   */
  async clear(): Promise<void> {
    const allKeys = await this.driver.keys();
    const fullPrefix = this.prefix ? `${this.prefix}-` : '';
    const prefixedKeys = allKeys.filter((key) => key.startsWith(fullPrefix));
    await Promise.all(prefixedKeys.map((key) => this.driver.removeItem(key)));
  }

  /**
   * Clear all expired stored items.
   */
  async clearExpiredItems(): Promise<void> {
    const allKeys = await this.driver.keys();
    const fullPrefix = this.prefix ? `${this.prefix}-` : '';
    const prefixedKeys = allKeys.filter((key) => key.startsWith(fullPrefix));

    for (const fullKey of prefixedKeys) {
      const raw = await this.driver.getItem<StorageItem<unknown>>(fullKey);
      if (raw && raw.expiry && Date.now() > raw.expiry) {
        await this.driver.removeItem(fullKey);
      }
    }
  }

  /**
   * Get a stored item.
   * @param key Key
   * @param defaultValue Default value when the item is missing or expired
   * @returns The value, or the default value if the item has expired
   */
  async getItem<T>(
    key: string,
    defaultValue: null | T = null,
  ): Promise<null | T> {
    const fullKey = this.getFullKey(key);
    const raw = await this.driver.getItem<StorageItem<T>>(fullKey);

    if (!raw) {
      return defaultValue;
    }

    // TTL check
    if (raw.expiry && Date.now() > raw.expiry) {
      await this.driver.removeItem(fullKey);
      return defaultValue;
    }

    return raw.value;
  }

  /**
   * Get all storage keys under the current prefix (prefix stripped).
   */
  async keys(): Promise<Array<string>> {
    const allKeys = await this.driver.keys();
    const fullPrefix = this.prefix ? `${this.prefix}-` : '';
    if (!fullPrefix) {
      return allKeys;
    }
    return allKeys
      .filter((key) => key.startsWith(fullPrefix))
      .map((key) => key.slice(fullPrefix.length));
  }

  /**
   * Remove a stored item.
   * @param key Key
   */
  async removeItem(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.driver.removeItem(fullKey);
  }

  /**
   * Set a stored item.
   * @param key Key
   * @param value Value
   * @param ttl Time to live in milliseconds
   */
  async setItem(key: string, value: unknown, ttl?: number): Promise<void> {
    const fullKey = this.getFullKey(key);
    const expiry = ttl ? Date.now() + ttl : undefined;
    const item: StorageItem<unknown> = { expiry, value };
    await this.driver.setItem(fullKey, item);
  }

  /**
   * Get the full storage key (with prefix).
   * @param key Original key
   * @returns Full key with prefix
   */
  getFullKey(key: string): string {
    return this.prefix ? `${this.prefix}-${key}` : key;
  }

  /**
   * Create the default driver based on the runtime environment:
   * - Browser (window.localStorage available) → LocalStorageDriver
   * - SSR / Node → MemoryStorageDriver
   */
  private createDefaultDriver(): IStorageDriver {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return new LocalStorageDriver();
      }
    } catch (error) {
      // localStorage access denied (e.g. Safari private mode)
      console.warn(
        'localStorage is not accessible, falling back to MemoryStorageDriver:',
        error,
      );
    }
    return new MemoryStorageDriver();
  }
}

export { StorageManager };
