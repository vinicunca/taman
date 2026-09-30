import {
  defineOverridesPreferences,
} from '@vinicunca/taman-core/preferences';

/**
 * @description Project preference overrides.
 * Only override what you need; other values use framework defaults.
 * Clear cache after changes or they may not apply.
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
  },
});
