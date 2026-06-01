import type { RouteMeta as IRouteMeta } from './dist/index.d.mts';

import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {}
}
