import type { RouteMeta as IRouteMeta } from './src/vue-router';

import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {}
}
