import type { DeepPartial } from '@taman-core/shared/utils';

import type {
  CustomPreferencesField,
  CustomPreferencesRecord,
  InitialOptions,
  Preferences,
  PreferencesExtension,
} from './types';

import { StorageManager } from '@taman-core/shared/cache';
import { defu, isMacOs } from '@taman-core/shared/utils';
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
    // Constructor uses defaults only; cache is loaded asynchronously in initPreferences
    this.state = reactive<Preferences>({ ...defaultPreferences });
    this.debouncedSave = useDebounceFn(() => this.saveToCache(), 150);
  }

  /** Clears all cached preferences. */
  clearCache = async () => {
    await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => this.cache.removeItem(key)),
    );
  };

  /** Returns custom (extension) preferences. */
  getCustomPreferences = <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >() => {
    return readonly(this.customState) as Readonly<TCustomPreferences>;
  };

  /** Returns initial custom preferences snapshot. */
  getInitialCustomPreferences = <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >() => {
    return this.cloneValue(
      this.initialCustomPreferences,
    ) as Readonly<TCustomPreferences>;
  };

  /** Returns initial preferences snapshot. */
  getInitialPreferences = () => {
    return this.initialPreferences;
  };

  /** Returns current preferences (readonly). */
  getPreferences = () => {
    return readonly(this.state);
  };

  /** Returns custom preferences extension schema. */
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
   * Initializes preferences from defaults, overrides, and cache.
   * @param options - Initialization options
   * @param options.namespace - Storage namespace to isolate app instances
   * @param options.overrides - Preference overrides applied at init
   */
  initPreferences = async <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >({
    namespace,
    overrides,
    extension,
  }: InitialOptions<TCustomPreferences>) => {
    // Prevent double initialization
    if (this.isInitialized) {
      return;
    }

    // Namespace-scoped storage
    this.cache = new StorageManager({ prefix: namespace });

    // Merge init: earlier sources win; later sources fill missing fields only
    this.initialPreferences = defu({}, overrides, defaultPreferences);
    this.customPreferencesExtension = extension ?? null;
    this.initialCustomPreferences = this.resolveCustomPreferencesDefaults(
      this.customPreferencesExtension,
    );

    // Load cache; cached values override only unset init fields
    const cachedPreferences = (await this.loadFromCache()) || {};
    const mergedPreference = defu(
      {},
      cachedPreferences, // user cache takes precedence
      this.initialPreferences, // init fills gaps only
    );

    // Apply merged preferences
    this.updatePreferences(mergedPreference);

    const cachedCustom = (await this.loadCustomFromCache()) || {};
    this.replaceCustomPreferences(
      defu(
        {},
        this.sanitizeCustomPreferences(cachedCustom),
        this.initialCustomPreferences,
      ),
    );
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
    this.replaceCustomPreferences(this.initialCustomPreferences);

    await this.saveToCache();

    // Trigger UI updates immediately
    this.handleUpdates(this.state);
  };

  /**
   * Updates custom (extension) preferences.
   * @param updates - Partial custom preference values
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
      defu({}, sanitizedUpdates, markRaw(this.customState)),
    );
    this.debouncedSave();
  };

  /**
   * Updates preferences.
   * @param updates - Partial preference values
   */
  updatePreferences = (updates: DeepPartial<Preferences>) => {
    // Deep-merge updates into reactive state
    const mergedState = defu({}, updates, markRaw(this.state));
    Object.assign(this.state, mergedState);

    this.handleUpdates(updates);

    // Persist to cache (debounced, fire-and-forget)
    this.debouncedSave();
  };

  getFullKey(key: string): string {
    return this.cache.getFullKey(key);
  }

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
   * Applies side effects for preference updates.
   * @param updates - Updated preference fields
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

  /** Sets platform identifier on documentElement. */
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
   * Loads custom preferences from cache.
   * @returns Cached custom preferences, or null if missing
   */
  private async loadCustomFromCache(): Promise<CustomPreferencesRecord | null> {
    return this.cache.getItem<CustomPreferencesRecord>(STORAGE_KEYS.CUSTOM);
  }

  /**
   * Loads preferences from cache.
   * @returns Cached preferences, or null if missing
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

  /** Persists preferences to cache. */
  private async saveToCache() {
    try {
      await this.cache.setItem(STORAGE_KEYS.MAIN, this.state);

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

  /** Watches viewport and system color scheme. */
  private setupWatcher() {
    if (this.isInitialized) {
      return;
    }

    // Sync isMobile from breakpoints
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
  }

  /**
   * Updates grayscale and color-weak modes on the document.
   * @param preference - Current preferences
   */
  private updateColorMode(preference: Preferences) {
    const { colorGrayMode, colorWeakMode } = preference.app;
    const dom = document.documentElement;

    dom.classList.toggle('invert-mode', colorWeakMode);
    dom.classList.toggle('grayscale-mode', colorGrayMode);
  }
}

const preferencesManager = new PreferenceManager();

export { PreferenceManager, preferencesManager };
