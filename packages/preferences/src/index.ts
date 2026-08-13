import type {
  CustomPreferencesRecord,
  Preferences,
  PreferencesExtension,
} from '@taman-core/preferences';
import type { DeepPartial } from '@taman-core/shared/utils';

/**
 * Define shared default preferences for all apps here
 * instead of editing defaults in @taman-core/preferences
 * @param preferences
 * @returns
 */

function defineOverridesPreferences(preferences: DeepPartial<Preferences>) {
  return preferences;
}

function definePreferencesExtension<
  TCustomPreferences extends object = CustomPreferencesRecord,
>(extension: PreferencesExtension<TCustomPreferences>) {
  return extension;
}

export { defineOverridesPreferences, definePreferencesExtension };

export * from '@taman-core/preferences';
