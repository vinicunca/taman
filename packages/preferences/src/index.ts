import type {
  CustomPreferencesRecord,
  Preferences,
  PreferencesExtension,
} from '@taman-core/preferences';
import type { DeepPartial } from '@vinicunca/perkakas';

/**
 * If you want all apps to use the same default preferences, you can define it here
 * instead of modifying the default preferences in @taman-core/preferences
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
