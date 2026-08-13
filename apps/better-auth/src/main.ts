import { initPreferences } from '@taman/preferences';
import { unmountGlobalLoading } from '@taman/utils';

import { overridesPreferences, preferencesExtension } from './preferences';

/**
 * Render the page only after application initialization completes.
 */
async function initApplication() {
  // Namespace isolates preferences, storage keys, and other per-project data
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;

  // App preferences
  await initPreferences({
    extension: preferencesExtension,
    namespace,
    overrides: overridesPreferences,
  });

  // Bootstrap and mount the Vue app
  const { bootstrap } = await import('./bootstrap');
  await bootstrap(namespace);

  // Remove global loading overlay
  unmountGlobalLoading();
}

void initApplication();
