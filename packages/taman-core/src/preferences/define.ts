import type { DeepPartial } from '@vinicunca/perkakas';
import type { Preferences } from './types';

/**
 * Typed helper for an app's preference overrides; only the values an app
 * sets differ from the defaults.
 * @param preferences Partial preferences merged over the defaults.
 */
function defineOverridesPreferences(preferences: DeepPartial<Preferences>): DeepPartial<Preferences> {
  return preferences;
}

export { defineOverridesPreferences };
