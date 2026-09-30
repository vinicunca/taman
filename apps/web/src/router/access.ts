import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@taman/types';

import { CoreLayout, IFrameView } from '#/layouts';
import { preferences } from '@vinicunca/taman-core/preferences';

import { generateAccessible } from '@taman/access';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    CoreLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    // TODO: Implement fetching menu from backend

    // Redirect to 403 when access is denied
    forbiddenComponent,
    // When route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
