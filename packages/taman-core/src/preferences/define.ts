import type { DeepPartial } from '@vinicunca/perkakas';
import type { CustomPreferencesRecord, Preferences, PreferencesExtension } from './types';

/**
 * Typed helper for an app's preference overrides; only the values an app
 * sets differ from the defaults.
 * @param preferences Partial preferences merged over the defaults.
 */
function defineOverridesPreferences(preferences: DeepPartial<Preferences>): DeepPartial<Preferences> {
  return preferences;
}

/**
 * Typed helper for an app's custom preferences tab.
 * @param extension The extension definition.
 */
function definePreferencesExtension<
  TCustomPreferences extends object = CustomPreferencesRecord,
>(extension: PreferencesExtension<TCustomPreferences>): PreferencesExtension<TCustomPreferences> {
  return extension;
}

export { defineOverridesPreferences, definePreferencesExtension };
