import { initPreferences } from '@taman/preferences';
import { unmountGlobalLoading } from '@taman/utils';

import { overridesPreferences, preferencesExtension } from './preferences';

/**
 * After the application is initialized, the page is loaded and rendered
 */
async function initApplication() {
  // The name is used to specify the unique identifier of the project
  // It is used to distinguish the preferences and storage data of different projects, as well as other data that needs to be isolated
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;

  // Initialize the app preferences
  await initPreferences({
    extension: preferencesExtension,
    namespace,
    overrides: overridesPreferences,
  });

  // Start the application and mount
  // The main logic and view of the vue application
  const { bootstrap } = await import('./bootstrap');
  await bootstrap(namespace);

  // Remove and destroy the loading
  unmountGlobalLoading();
}

void initApplication();
