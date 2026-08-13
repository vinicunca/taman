// @unocss-include

import type { PThemeDashboardResizeHandle } from 'pohon-ui';

export const dashboardResizeHandle = {
  base: 'hidden lg:block touch-none select-none cursor-ew-resize relative before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5 before:z-1',
} satisfies PThemeDashboardResizeHandle;
