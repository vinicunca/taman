import type { DeepPartial } from '@vinicunca/perkakas';
import type {
  CustomPreferencesField,
  CustomPreferencesRecord,
  InitialOptions,
  Preferences,
  PreferencesExtension,
} from './types';
import { StorageManager } from '@taman-core/shared/cache';
import { isMacOs, merge } from '@taman-core/shared/utils';
import {
  breakpointsTailwind,
  useBreakpoints,
  useDebounceFn,
} from '@vueuse/core';
import { markRaw, reactive, readonly, watch } from 'vue';
import { defaultPreferences } from './config';
import { updateCSSVariables } from './update-css-variables';

const STORAGE_KEYS = {
  CUSTOM: 'preferences-custom',
  MAIN: 'preferences',
  LOCALE: 'preferences-locale',
  THEME: 'preferences-theme',
} as const;

class PreferenceManager {
  private cache: StorageManager;
  private customPreferencesExtension: null | PreferencesExtension<any> = null;
  private customState = reactive<CustomPreferencesRecord>({});
  private debouncedSave: () => void;
  private initialCustomPreferences: CustomPreferencesRecord = {};
  private initialPreferences: Preferences = defaultPreferences;
  private isInitialized = false;
  private state: Preferences;

  constructor() {
    this.cache = new StorageManager();
    // The constructor no longer reads the cache synchronously; it initializes using default values.
    // The actual cache loading is done in initPreferences (which is already async).
    this.state = reactive<Preferences>({ ...defaultPreferences });
    this.debouncedSave = useDebounceFn(() => this.saveToCache(), 150);
  }

  /**
   * Clear all cached preferences
   */
  clearCache = async () => {
    await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => this.cache.removeItem(key)),
    );
  };

  /**
   * Get extended preferences
   */
  getCustomPreferences = <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >() => {
    return readonly(this.customState) as Readonly<TCustomPreferences>;
  };

  /**
   * Get initial extended preferences
   */
  getInitialCustomPreferences = <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >() => {
    return this.cloneValue(
      this.initialCustomPreferences,
    ) as Readonly<TCustomPreferences>;
  };

  /**
   * Get initial preferences
   */
  getInitialPreferences = () => {
    return this.initialPreferences;
  };

  /**
   * Get current preferences (read-only)
   */
  getPreferences = () => {
    return readonly(this.state);
  };

  /**
   * Get extended preferences configuration
   */
  getPreferencesExtension = <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >() => {
    return this.customPreferencesExtension
      ? (this.cloneValue(this.customPreferencesExtension) as Readonly<
          PreferencesExtension<TCustomPreferences>
        >)
      : null;
  };

  /**
   * Initialize preferences
   * @param options - Initialization configuration
   * @param options.namespace - Namespace, used to isolate different application configurations
   * @param options.overrides - Preferences to override
   */
  initPreferences = async <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >({
    namespace,
    overrides,
    extension,
  }: InitialOptions<TCustomPreferences>) => {
    // Prevent duplicate initialization
    if (this.isInitialized) {
      return;
    }

    // Initialize storage manager with namespace
    this.cache = new StorageManager({ prefix: namespace });

    // Merge initial preferences: the first object takes precedence, the second object only fills in missing fields
    this.initialPreferences = merge({}, overrides, defaultPreferences);
    this.customPreferencesExtension = extension ?? null;
    this.initialCustomPreferences = this.resolveCustomPreferencesDefaults(
      this.customPreferencesExtension,
    );

    // Load cached preferences, and only fill in the fields that are not explicitly set in the initialization configuration
    const cachedPreferences = (await this.loadFromCache()) || {};
    const mergedPreference = merge(
      {},
      cachedPreferences, // User cached settings take precedence
      this.initialPreferences, // Initial settings only fill in missing fields
    );

    // Update preferences
    this.updatePreferences(mergedPreference);

    const cachedCustom = (await this.loadCustomFromCache()) || {};
    this.replaceCustomPreferences(
      merge(
        {},
        this.sanitizeCustomPreferences(cachedCustom),
        this.initialCustomPreferences,
      ),
    );
    await this.saveToCache();

    // Set listener
    this.setupWatcher();

    // Initialize platform identifier
    this.initPlatform();

    this.isInitialized = true;
  };

  /**
   * Reset preferences to initial state
   */
  resetPreferences = async () => {
    // Reset state to initial preferences
    Object.assign(this.state, this.initialPreferences);
    this.replaceCustomPreferences(this.initialCustomPreferences);

    // Save preferences to cache
    await this.saveToCache();

    // Trigger UI update
    this.handleUpdates(this.state);
  };

  /**
   * Update extended preferences
   * @param updates - Extended preferences to update
   */
  updateCustomPreferences = (updates: DeepPartial<object>) => {
    if (!this.customPreferencesExtension) {
      return;
    }

    const sanitizedUpdates = this.sanitizeCustomPreferences(
      updates as DeepPartial<CustomPreferencesRecord>,
    );

    if (Object.keys(sanitizedUpdates).length === 0) {
      return;
    }

    this.replaceCustomPreferences(
      merge({}, sanitizedUpdates, markRaw(this.customState)),
    );
    this.debouncedSave();
  };

  /**
   * Update preferences
   * @param updates - Preferences to update
   */
  updatePreferences = (updates: DeepPartial<Preferences>) => {
    // Deep merge update content and current state
    const mergedState = merge({}, updates, markRaw(this.state));
    Object.assign(this.state, mergedState);

    // Execute update based on the updated values
    this.handleUpdates(updates);

    // Save to cache (fire-and-forget, controlled by debounce)
    this.debouncedSave();
  };

  private cloneValue<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map((item) => this.cloneValue(item)) as T;
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(
          ([key, nestedValue]) => [key, this.cloneValue(nestedValue)],
        ),
      ) as T;
    }

    return value;
  }

  /**
   * Handle updates
   * @param updates - Updated preferences
   */
  private handleUpdates(updates: DeepPartial<Preferences>) {
    const { theme, app } = updates;

    if (
      theme
      && (Object.keys(theme).length > 0 || Reflect.has(theme, 'fontSize'))
    ) {
      updateCSSVariables(this.state);
    }

    if (
      app
      && (Reflect.has(app, 'colorGrayMode') || Reflect.has(app, 'colorWeakMode'))
    ) {
      this.updateColorMode(this.state);
    }
  }

  /**
   * Initialize platform identifier
   */
  private initPlatform() {
    document.documentElement.dataset.platform = isMacOs() ? 'macOs' : 'window';
  }

  private isAlmostInteger(value: number, epsilon = Number.EPSILON * 10) {
    return Math.abs(value - Math.round(value)) < epsilon;
  }

  private isValidCustomPreferenceValue(
    field: CustomPreferencesField,
    value: unknown,
  ) {
    switch (field.component) {
      case 'number': {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          return false;
        }

        const max = this.resolveNumericConstraint(field.componentProps?.max);
        const min = this.resolveNumericConstraint(field.componentProps?.min);
        const step = this.resolveNumericConstraint(field.componentProps?.step);

        if (min !== undefined && value < min) {
          return false;
        }

        if (max !== undefined && value > max) {
          return false;
        }

        if (step !== undefined) {
          if (step <= 0) {
            return false;
          }

          const stepBase = min ?? 0;
          const stepCount = (value - stepBase) / step;

          if (!this.isAlmostInteger(stepCount)) {
            return false;
          }
        }

        return true;
      }
      case 'select': {
        return (
          typeof value === 'string'
          && field.options.some((option) => option.value === value)
        );
      }
      case 'switch': {
        return typeof value === 'boolean';
      }
      default: {
        return typeof value === 'string';
      }
    }
  }

  /**
   * Load extended preferences from cache
   * @returns Cached extended preferences, or null if not found
   */
  private async loadCustomFromCache(): Promise<CustomPreferencesRecord | null> {
    return this.cache.getItem<CustomPreferencesRecord>(STORAGE_KEYS.CUSTOM);
  }

  /**
   * Load preferences from cache
   * @returns Cached preferences, or null if not found
   */
  private async loadFromCache(): Promise<null | Preferences> {
    return this.cache.getItem<Preferences>(STORAGE_KEYS.MAIN);
  }

  private replaceCustomPreferences(preferences: CustomPreferencesRecord) {
    Object.keys(this.customState).forEach((key) => {
      Reflect.deleteProperty(this.customState, key);
    });
    Object.assign(this.customState, preferences);
  }

  private resolveCustomPreferencesDefaults(
    extension: null | PreferencesExtension<any>,
  ) {
    if (!extension) {
      return {};
    }

    const result: CustomPreferencesRecord = {};

    for (const field of extension.fields) {
      result[field.key] = field.defaultValue;
    }

    return result;
  }

  private resolveNumericConstraint(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : undefined;
  }

  private sanitizeCustomPreferences(
    updates: DeepPartial<CustomPreferencesRecord>,
  ) {
    if (!this.customPreferencesExtension) {
      return {};
    }

    const result: CustomPreferencesRecord = {};

    for (const field of this.customPreferencesExtension.fields) {
      const value = updates[field.key];

      if (
        value !== undefined
        && this.isValidCustomPreferenceValue(field, value)
      ) {
        result[field.key] = value;
      }
    }

    return result;
  }

  /**
   * Save preferences to cache
   */
  private async saveToCache() {
    try {
      await this.cache.setItem(STORAGE_KEYS.MAIN, this.state);
      await this.cache.setItem(STORAGE_KEYS.LOCALE, this.state.app.locale);
      await this.cache.setItem(STORAGE_KEYS.THEME, this.state.theme.mode);

      if (this.customPreferencesExtension) {
        await this.cache.setItem(STORAGE_KEYS.CUSTOM, {
          ...this.customState,
        });
        return;
      }

      await this.cache.removeItem(STORAGE_KEYS.CUSTOM);
    } catch (error) {
      console.error('Failed to save preferences to cache:', error);
    }
  }

  /**
   * Watch state and system preferences changes
   */
  private setupWatcher() {
    if (this.isInitialized) {
      return;
    }

    // Watch breakpoints, check if mobile
    const breakpoints = useBreakpoints(breakpointsTailwind);
    const isMobile = breakpoints.smaller('md');

    watch(
      () => isMobile.value,
      (val) => {
        this.updatePreferences({
          app: { isMobile: val },
        });
      },
      { immediate: true },
    );

    // Watch system theme preferences changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', ({ matches: isDark }) => {
        // Only follow system theme in automatic mode
        if (this.state.theme.mode === 'auto') {
          // Apply actual theme first
          this.updatePreferences({
            theme: { mode: isDark ? 'dark' : 'light' },
          });
          // Then restore to auto mode, keep following system state
          this.updatePreferences({
            theme: { mode: 'auto' },
          });
        }
      });
  }

  /**
   * Update page color mode (gray, weak)
   * @param preference - Preferences
   */
  private updateColorMode(preference: Preferences) {
    const { colorGrayMode, colorWeakMode } = preference.app;
    const dom = document.documentElement;

    dom.classList.toggle('invert-mode', colorWeakMode);
    dom.classList.toggle('grayscale-mode', colorGrayMode);
  }
}
const preferencesManager = new PreferenceManager();

export { preferencesManager };
