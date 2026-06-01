import type { RouteMeta as IRouteMeta } from '@taman-core/typings';

import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {}
}

export interface TamanAdminProdAppConfigRaw {
  VITE_GLOB_API_URL: string;
}

export interface ApplicationConfig {
  apiURL: string;
}

declare global {
  interface Window {
    _TAMAN_ADMIN_PROD_APP_CONF_: TamanAdminProdAppConfigRaw;
  }
}
