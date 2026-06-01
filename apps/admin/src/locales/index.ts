import type { LocaleSetupOptions, SupportedLanguagesType } from '@taman/locales';
import type { App } from 'vue';
import {
  $t,
  setupI18n as coreSetup,
  loadLocalesMapFromDir,
} from '@taman/locales';
import { preferences } from '@taman/preferences';

const modules = import.meta.glob('./langs/**/*.json');

const localesMap = loadLocalesMapFromDir(
  /\.\/langs\/([^/]+)\/(.*)\.json$/,
  modules,
);

/**
 * load application specific language pack
 * it can also be改造 to get translation data from the server
 * @param lang
 */
async function loadMessages(lang: SupportedLanguagesType) {
  const [appLocaleMessages] = await Promise.all([
    localesMap[lang]?.(),
  ]);
  return appLocaleMessages?.default;
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  await coreSetup(app, {
    defaultLocale: preferences.app.locale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  });
}

export { $t, setupI18n };
