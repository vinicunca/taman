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
    // Land on the reference feature; the published default `/dashboard` has no page here.
    defaultHomePath: '/todos/manage',
    name: import.meta.env.VITE_APP_TITLE,
  },
});
