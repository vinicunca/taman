import type { RouteMeta as IRouteMeta } from '@taman-core/typings';

import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {}
}

export interface TamanAdminDevConfigRaw {
  VITE_API_URL: string;
}

export interface ApplicationConfig {
  apiUrl: string;
}

declare global {
  interface Window {
    _TAMAN_ADMIN_DEV_CONFIG_: TamanAdminDevConfigRaw;
  }
}
