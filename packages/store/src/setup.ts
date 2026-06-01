/* eslint-disable ts/method-signature-style */
import type { Pinia } from 'pinia';
import type { App } from 'vue';

import { createPinia } from 'pinia';
import SecureLS from 'secure-ls';

// eslint-disable-next-line ts/consistent-type-definitions
type SecureLSStorage = {
  get(key: string): any;
  set(key: string, value: unknown): void;
};

type SecureLSCtor = new (config?: {
  encodingType?: string;
  encryptionSecret?: string;
  isCompression?: boolean;
  metaKey?: string;
}) => SecureLSStorage;

const secureLSModule = SecureLS as unknown as {
  default?: SecureLSCtor;
  SecureLS?: SecureLSCtor;
};

const SecureLSConstructor
  = secureLSModule.default
    ?? secureLSModule.SecureLS
    ?? (SecureLS as unknown as SecureLSCtor);

export interface InitStoreOptions {
  /**
   * @en_US The application name, since @taman/stores is public, there may be multiple apps in the future, to prevent cache conflicts between multiple apps, the application name can be configured here, and the application name will be used as the prefix for persistence
   */
  namespace: string;
}

let pinia: Pinia;

async function initStores(app: App, options: InitStoreOptions) {
  const { createPersistedState } = await import('pinia-plugin-persistedstate');
  pinia = createPinia();
  const { namespace } = options;
  const ls = new SecureLSConstructor({
    encodingType: 'aes',
    encryptionSecret: import.meta.env.VITE_APP_STORE_SECURE_KEY,
    isCompression: true,
    metaKey: `${namespace}-secure-meta`,
  });
  pinia.use(
    createPersistedState({
      // key $appName-$store.id
      key: (storeKey) => `${namespace}-${storeKey}`,
      storage: import.meta.env.DEV
        ? localStorage
        : {
            getItem(key) {
              return ls.get(key);
            },
            setItem(key, value) {
              ls.set(key, value);
            },
          },
    }),
  );
  app.use(pinia);
  return pinia;
}

function resetAllStores() {
  if (!pinia) {
    console.error('Pinia is not installed');
    return;
  }
  const allStores = (pinia as any)._s;
  for (const [_key, store] of allStores) {
    store.$reset();
  }
}

export { initStores, resetAllStores };
