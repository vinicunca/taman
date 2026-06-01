import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@taman/types';

import { generateAccessible } from '@taman/access';
import { preferences } from '@taman/preferences';
import { IFrameView, LayoutDefault } from '#/layouts';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    LayoutDefault,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      return [];
    },
    // You can specify that if you do not have permission, you should be redirected to a 403 page.
    forbiddenComponent,
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
