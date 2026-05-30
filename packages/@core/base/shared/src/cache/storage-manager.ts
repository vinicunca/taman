/* eslint-disable no-await-in-loop */
import type {
  IStorageDriver,
  StorageItem,
  StorageManagerOptions,
} from './types';

import { LocalStorageDriver } from './local-storage-driver';
import { MemoryStorageDriver } from './memory-storage-driver';

/**
 * Storage manager (strategy pattern)
 * - prefix (namespace isolation) is handled at this layer
 * - TTL (expiration mechanism) is handled at this layer
 * - Driver only handles pure KV access
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
   * Clear all storage items with prefix
   */
  async clear(): Promise<void> {
    const allKeys = await this.driver.keys();
    const fullPrefix = this.prefix ? `${this.prefix}-` : '';
    const prefixedKeys = allKeys.filter((key) => key.startsWith(fullPrefix));
    await Promise.all(prefixedKeys.map((key) => this.driver.removeItem(key)));
  }

  /**
   * Clear all expired storage items
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
   * Get storage item
   * @param key The key
   * @param defaultValue The default value to return if the item does not exist or is expired
   * @returns The value, if the item is expired, return the default value
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
   * Get all storage keys with prefix (without prefix part)
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
   * Remove storage item
   * @param key The key
   */
  async removeItem(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.driver.removeItem(fullKey);
  }

  /**
   * Set storage item
   * @param key The key
   * @param value The value
   * @param ttl The TTL (milliseconds)
   */
  async setItem(key: string, value: unknown, ttl?: number): Promise<void> {
    const fullKey = this.getFullKey(key);
    const expiry = ttl ? Date.now() + ttl : undefined;
    const item: StorageItem<unknown> = { expiry, value };
    await this.driver.setItem(fullKey, item);
  }

  /**
   * Create default driver based on the runtime environment:
   * - Browser environment (window.localStorage available) → LocalStorageDriver
   * - SSR / Node environment → MemoryStorageDriver
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

  /**
   * Get the full storage key (with prefix)
   * @param key The original key
   * @returns The full key with prefix
   */
  private getFullKey(key: string): string {
    return this.prefix ? `${this.prefix}-${key}` : key;
  }
}

export { StorageManager };
