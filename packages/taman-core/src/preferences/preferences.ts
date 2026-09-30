import type { DeepPartial } from '@vinicunca/perkakas';
import type { InitialOptions, Preferences } from './types';

import { useDebounceFn } from '@vueuse/core';
import { markRaw, reactive, readonly, watch } from 'vue';
import { MemoryStorageDriver, StorageManager } from '../cache';
import { useBreakpoints } from '../composables';
import {
  defu,
  isMacOs,
  mergeWithArrayOverride,
  setCurrentTimezone,
} from '../utils';
import { defaultPreferences } from './config';
import { updateCssVariables } from './update-css-variables';

const STORAGE_KEYS = {
  MAIN: 'preferences',
} as const;

class PreferenceManager {
  private cache: StorageManager;
  private debouncedSave: () => void;
  private initialPreferences: Preferences = defaultPreferences;
  private isInitialized = false;
  private state: Preferences;

  constructor() {
    this.cache = new StorageManager({ driver: new MemoryStorageDriver() });
    // The constructor no longer reads the cache synchronously; initialization uses default values.
    // Actual cache loading is performed in initPreferences (which is already async).
    this.state = reactive<Preferences>({ ...defaultPreferences });
    this.debouncedSave = useDebounceFn(() => this.saveToCache(), 150);
  }

  /** Clears all cached preferences. */
  clearCache = async () => {
    await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => this.cache.removeItem(key)),
    );
  };

  /** Returns initial preferences snapshot. */
  getInitialPreferences = () => {
    return this.initialPreferences;
  };

  /** Returns current preferences (readonly). */
  getPreferences = () => {
    return readonly(this.state);
  };

  /**
   * Initializes preferences from defaults, overrides, and cache.
   * @param options - Initialization options
   * @param options.namespace - Storage namespace to isolate app instances
   * @param options.overrides - Preference overrides applied at init
   */
  initPreferences = async ({ namespace, overrides }: InitialOptions) => {
    // Prevent double initialization
    if (this.isInitialized) {
      return;
    }

    // Namespace-scoped storage
    this.cache = new StorageManager({ prefix: namespace });

    // Merge init: earlier sources win; later sources fill missing fields only
    this.initialPreferences = defu({}, overrides, defaultPreferences);

    // Load cached preferences and use the cache only to fill in fields not explicitly set in the initial configuration.
    const cachedPreferences = (await this.loadFromCache()) || {};

    this.sanitizeCachedArray({
      cached: cachedPreferences,
      group: 'widget',
      field: 'order',
    });
    const mergedPreference = mergeWithArrayOverride(
      {},
      cachedPreferences, // user cache takes precedence
      this.initialPreferences, // init fills gaps only
    );

    // Apply merged preferences
    this.updatePreferences(mergedPreference);

    await this.saveToCache();

    // Watch breakpoints and system theme
    this.setupWatcher();

    // Platform dataset on documentElement
    this.initPlatform();

    this.isInitialized = true;
  };

  /** Resets preferences to the initial snapshot. */
  resetPreferences = async () => {
    Object.assign(this.state, this.initialPreferences);

    // Trigger UI updates immediately
    this.handleUpdates(this.state);

    await this.saveToCache();
  };

  /**
   * Updates preferences.
   * @param updates - Partial preference values
   */
  updatePreferences = (updates: DeepPartial<Preferences>) => {
    // Deeply merge the update content with the current state.
    // Note: We must use mergeWithArrayOverride instead of defu.
    // The default merge behavior for arrays is concatenation (appending),
    // which causes array fields like widget.order to be repeatedly appended
    // during each updatePreferences call, leading to exponential growth.
    const mergedState = mergeWithArrayOverride(
      {},
      updates,
      markRaw(this.state),
    );
    Object.assign(this.state, mergedState);

    this.handleUpdates(updates);

    // Persist to cache (debounced, fire-and-forget)
    this.debouncedSave();
  };

  getFullKey(key: string): string {
    return this.cache.getFullKey(key);
  }

  /**
   * Applies side effects for preference updates.
   * @param updates - Updated preference fields
   */
  private handleUpdates(updates: DeepPartial<Preferences>) {
    const { theme, app } = updates;

    if (
      theme
      && (Object.keys(theme).length > 0)
    ) {
      updateCssVariables(this.state);
    }

    if (app && Reflect.has(app, 'timezone')) {
      setCurrentTimezone(app.timezone);
    }
  }

  /** Sets platform identifier on documentElement. */
  private initPlatform() {
    document.documentElement.dataset.platform = isMacOs() ? 'macOs' : 'window';
  }

  /**
   * Loads preferences from cache.
   * @returns Cached preferences, or null if missing
   */
  private async loadFromCache(): Promise<null | Preferences> {
    return this.cache.getItem<Preferences>(STORAGE_KEYS.MAIN);
  }

  /**
   * Clean up bloated array fields in the cache (preserving only the first occurrence of each element)
   * Used to fix "dirty data" caused by `concat` appending during array merging in earlier versions of `defu`
   */
  private sanitizeCachedArray(
    { cached, group, field }: {
      cached: Record<string, any>;
      group: string;
      field: string;
    },
  ) {
    const node = cached?.[group]?.[field];
    if (!Array.isArray(node) || node.length <= 1) {
      return;
    }
    const seen = new Set<unknown>();
    const deduped = node.filter((item) => {
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    });
    if (deduped.length !== node.length) {
      cached[group][field] = deduped;
    }
  }

  /** Persists preferences to cache. */
  private async saveToCache() {
    try {
      await this.cache.setItem(STORAGE_KEYS.MAIN, this.state);
    } catch (error) {
      console.error('Failed to save preferences to cache:', error);
    }
  }

  /** Watches viewport and system color scheme. */
  private setupWatcher() {
    if (this.isInitialized) {
      return;
    }

    const { isMobile } = useBreakpoints();

    watch(
      () => isMobile.value,
      (val) => {
        this.updatePreferences({
          app: { isMobile: val },
        });
      },
      { immediate: true },
    );
  }
}

const preferencesManager = new PreferenceManager();

export { PreferenceManager, preferencesManager };
